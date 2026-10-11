import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  Store,
  Layers,
  BookOpen,
  MapPin,
  Tag,
} from 'lucide-react';
import {
  BlogPost,
  CurtainVendor,
  MasterFabricCatalog,
  ServiceCategoryId,
} from '../types';
import type { CatalogEntry } from '../utils/catalogStyles';
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  getVendorCategories,
} from '../utils/serviceCategory';
import { CATALOG_SUBFILTERS } from '../utils/catalogStyles';


/** آیکون حرف D به‌جای ستاره / اسپارکلز */
const DrapinoMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center justify-center w-4 h-4 rounded font-black text-[10px] leading-none bg-amber-700 text-white ${className}`}
    aria-hidden
  >
    D
  </span>
);

export type SearchResultKind = 'vendor' | 'catalog' | 'material' | 'blog' | 'category';

export interface SearchResultItem {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle?: string;
  meta?: string;
  score: number;
  /** دادهٔ مرتبط برای ناوبری */
  vendor?: CurtainVendor;
  catalog?: CatalogEntry;
  blog?: BlogPost;
  category?: ServiceCategoryId;
  materialKey?: string;
}

interface HeaderSearchProps {
  vendors?: CurtainVendor[];
  catalogEntries?: CatalogEntry[];
  masterCatalogs?: MasterFabricCatalog[];
  blogPosts?: BlogPost[];
  onSelectVendor?: (vendor: CurtainVendor) => void;
  onSelectCatalog?: (entry: CatalogEntry) => void;
  onSelectBlog?: (post: BlogPost) => void;
  onNavigateTab?: (tab: string) => void;
  /** کلاس عرض اختیاری */
  className?: string;
  compact?: boolean;
}

/** نرمال‌سازی فارسی برای جستجوی بهتر (ی/ک عربی → فارسی، حذف اعراب و فاصله‌های اضافه) */
function normalizeFa(input: string): string {
  return (input || '')
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreText(haystack: string, query: string): number {
  const h = normalizeFa(haystack);
  const q = normalizeFa(query);
  if (!q || !h) return 0;
  if (h === q) return 100;
  if (h.startsWith(q)) return 80;
  if (h.includes(q)) return 60;
  // تطبیق واژه‌به‌واژه
  const parts = q.split(' ').filter(Boolean);
  let hit = 0;
  for (const p of parts) {
    if (h.includes(p)) hit += 1;
  }
  if (hit === 0) return 0;
  return Math.min(55, 20 + hit * 15);
}

const KIND_LABEL: Record<SearchResultKind, string> = {
  vendor: 'فروشگاه',
  catalog: 'کالیته / متریال',
  material: 'متریال',
  blog: 'مقاله',
  category: 'رسته خدمات',
};

const KIND_ICON: Record<SearchResultKind, React.ReactNode> = {
  vendor: <Store className="w-4 h-4 text-amber-700" />,
  catalog: <Layers className="w-4 h-4 text-sky-700" />,
  material: <Tag className="w-4 h-4 text-violet-700" />,
  blog: <BookOpen className="w-4 h-4 text-emerald-700" />,
  category: <DrapinoMark />,
};

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
  vendors = [],
  catalogEntries = [],
  masterCatalogs = [],
  blogPosts = [],
  onSelectVendor,
  onSelectCatalog,
  onSelectBlog,
  onNavigateTab,
  className = '',
  compact = false,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim();
    if (q.length < 1) return [] as SearchResultItem[];

    const items: SearchResultItem[] = [];

    // رسته‌های اصلی
    for (const cat of SERVICE_CATEGORIES) {
      const label = SERVICE_CATEGORY_LABELS[cat];
      const s = scoreText(label, q) || scoreText(cat, q);
      // کلیدواژه‌های رایج
      const extra =
        scoreText(
          cat === 'curtain'
            ? 'پرده کالیته پارچه دوخت ریل'
            : cat === 'wallpaper'
              ? 'کاغذ دیواری والپیپر پوستر دیوار'
              : 'کفپوش پارکت لمینت pvc spc موکت اپوکسی',
          q
        ) * 0.5;
      const score = Math.max(s, extra);
      if (score > 0) {
        items.push({
          id: `cat-${cat}`,
          kind: 'category',
          title: label,
          subtitle: 'رسته خدمات — مشاهده کالیته‌ها',
          score: score + 5,
          category: cat,
        });
      }
    }

    // زیر‌گروه‌های متریال (حریر، مخمل، زبرا، لمینت، ...)
    for (const cat of SERVICE_CATEGORIES) {
      for (const sub of CATALOG_SUBFILTERS[cat] || []) {
        const s = scoreText(`${sub.label} ${sub.key}`, q);
        if (s > 0) {
          items.push({
            id: `mat-${cat}-${sub.key}`,
            kind: 'material',
            title: sub.label,
            subtitle: `متریال در رسته ${SERVICE_CATEGORY_LABELS[cat]}`,
            score: s + 8,
            category: cat,
            materialKey: sub.key,
          });
        }
      }
    }

    // فروشگاه‌ها
    for (const v of vendors) {
      const cats = getVendorCategories(v)
        .map((c) => SERVICE_CATEGORY_LABELS[c])
        .join(' ');
      const blob = [v.name, v.ownerName, v.city, v.address, ...(v.coveredDistricts || []), cats].join(' ');
      const score = scoreText(blob, q);
      if (score > 0) {
        items.push({
          id: `vendor-${v.id}`,
          kind: 'vendor',
          title: v.name,
          subtitle: `${v.city}${v.isVerified ? ' · تایید‌شده' : ''}`,
          meta: cats || 'پرده',
          score: score + (normalizeFa(v.name).includes(normalizeFa(q)) ? 15 : 0),
          vendor: v,
        });
      }
    }

    // کالیته‌های کاتالوگ
    for (const c of catalogEntries) {
      if (c.isActive === false) continue;
      const blob = [
        c.title,
        c.persianCategory,
        c.description,
        ...(c.features || []),
        ...(c.fabricSuggestions || []),
        c.bookingStyle || '',
        SERVICE_CATEGORY_LABELS[c.category] || '',
      ].join(' ');
      const score = scoreText(blob, q);
      if (score > 0) {
        items.push({
          id: `catalog-${c.id}`,
          kind: 'catalog',
          title: c.title,
          subtitle: c.persianCategory || SERVICE_CATEGORY_LABELS[c.category],
          meta: c.priceRange,
          score,
          catalog: c,
        });
      }
    }

    // کاتالوگ مرجع (متریال‌هایی مثل حریر و تور)
    for (const m of masterCatalogs) {
      if (m.isAvailable === false) continue;
      const blob = [m.name, m.code, m.category, m.description, m.texture, m.origin].join(' ');
      const score = scoreText(blob, q);
      if (score > 0) {
        items.push({
          id: `master-${m.id}`,
          kind: 'material',
          title: m.name,
          subtitle: `${m.category} · ${m.texture || 'کالیته مرجع'}`,
          meta: m.code,
          score: score + 5,
        });
      }
    }

    // مقالات
    for (const b of blogPosts) {
      const contentJoin = Array.isArray(b.content) ? b.content.join(' ') : String(b.content || '');
      const blob = [b.title, b.summary, b.category, b.author, contentJoin].join(' ');
      const score = scoreText(blob, q);
      if (score > 0) {
        items.push({
          id: `blog-${b.id}`,
          kind: 'blog',
          title: b.title,
          subtitle: b.summary?.slice(0, 90) || b.category,
          meta: b.date,
          score,
          blog: b,
        });
      }
    }

    // مرتب‌سازی و حذف تکراری‌های ضعیف
    items.sort((a, b) => b.score - a.score);
    const seen = new Set<string>();
    const unique: SearchResultItem[] = [];
    for (const it of items) {
      const key = `${it.kind}:${normalizeFa(it.title)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(it);
      if (unique.length >= 12) break;
    }
    return unique;
  }, [query, vendors, catalogEntries, masterCatalogs, blogPosts]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // بستن با کلیک بیرون
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const handleSelect = (item: SearchResultItem) => {
    setOpen(false);
    setQuery('');
    if (item.kind === 'vendor' && item.vendor) {
      onSelectVendor?.(item.vendor);
      onNavigateTab?.('home');
      return;
    }
    if (item.kind === 'catalog' && item.catalog) {
      onSelectCatalog?.(item.catalog);
      onNavigateTab?.('catalog');
      return;
    }
    if (item.kind === 'blog' && item.blog) {
      onSelectBlog?.(item.blog);
      onNavigateTab?.('blog');
      return;
    }
    if ((item.kind === 'category' || item.kind === 'material') && item.category) {
      onNavigateTab?.('catalog');
      return;
    }
    // متریال مرجع بدون رسته
    if (item.kind === 'material') {
      onNavigateTab?.('catalog');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) handleSelect(item);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`} data-testid="header-search">
      <div
        className={`flex items-center gap-2 rounded-2xl border bg-stone-50 focus-within:bg-white focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all ${
          compact ? 'px-2.5 py-1.5 border-stone-200' : 'px-3 py-2 border-stone-200 shadow-2xs'
        }`}
      >
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="آنچه می خواهی در دراپینو جستجو کن"
          className={`bg-transparent outline-none text-sm text-stone-900 placeholder:text-stone-400 w-full text-right ${
            compact ? 'min-w-0' : ''
          }`}
          aria-label="جستجوی سایت"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="p-0.5 rounded-md text-stone-400 hover:text-stone-700 cursor-pointer"
            aria-label="پاک کردن"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute top-full mt-2 right-0 left-0 sm:left-auto sm:min-w-[22rem] sm:w-[28rem] z-[80] bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden text-right max-h-[70vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-xs text-stone-500 text-center">
              نتیجه‌ای برای «{query}» پیدا نشد.
              <p className="mt-1 text-stone-400">نام فروشگاه، متریال (مثل حریر)، رسته یا عنوان مقاله را امتحان کنید.</p>
            </div>
          ) : (
            <ul className="py-1" role="listbox">
              {results.map((item, idx) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelect(item)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 text-right transition-colors cursor-pointer ${
                      idx === activeIndex ? 'bg-amber-50' : 'hover:bg-stone-50'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0 w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center">
                      {KIND_ICON[item.kind]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-stone-900 truncate">{item.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                          {KIND_LABEL[item.kind]}
                        </span>
                      </span>
                      {item.subtitle && (
                        <span className="block text-xs text-stone-500 mt-0.5 line-clamp-2">{item.subtitle}</span>
                      )}
                      {item.meta && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-stone-400 mt-1">
                          {item.kind === 'vendor' && <MapPin className="w-3 h-3" />}
                          {item.meta}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
