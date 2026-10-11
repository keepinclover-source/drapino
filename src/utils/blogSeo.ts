import type { BlogPost, BlogCategory } from '../types';
import type { UnifiedCatalogCategory } from './catalogCategories';
import type { CatalogEntry } from './catalogStyles';

export interface SeoIssue {
  level: 'error' | 'warn' | 'ok';
  message: string;
}

export interface SeoReport {
  score: number;
  issues: SeoIssue[];
}

/** اولویت مقصد لینک داخلی — عدد بالاتر = مهم‌تر */
export const LINK_PRIORITY = {
  category: 100, // دسته‌بندی مقاله / کالیته
  catalog_item: 70, // کالیته یا محصول
  blog_post: 50, // مقاله دیگر
  comment: 10, // نظر / کامنت
} as const;

export interface InternalLinkTarget {
  /** عبارتی که اگر در متن مقاله بود لینک می‌شود */
  keyword: string;
  href: string;
  priority: number;
  source: 'category' | 'catalog_item' | 'blog_post' | 'comment';
  id: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function analyzeBlogSeo(post: {
  title: string;
  slug: string;
  summary: string;
  contentHtml?: string;
  content?: string[];
  focusKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
}): SeoReport {
  const issues: SeoIssue[] = [];
  let score = 0;
  const kw = (post.focusKeyword || '').trim();
  const text = stripHtml(post.contentHtml || (post.content || []).join(' '));
  const title = post.title || '';
  const metaTitle = post.metaTitle || title;
  const metaDesc = post.metaDescription || post.summary || '';
  const slug = post.slug || '';

  if (title.length >= 30 && title.length <= 65) {
    score += 12;
    issues.push({ level: 'ok', message: 'طول عنوان مناسب است (۳۰–۶۵ کاراکتر).' });
  } else {
    issues.push({ level: 'warn', message: `طول عنوان ${title.length} کاراکتر است؛ بهتر است ۳۰ تا ۶۵ باشد.` });
  }

  if (metaDesc.length >= 120 && metaDesc.length <= 165) {
    score += 12;
    issues.push({ level: 'ok', message: 'متا توضیحات در بازه ایده‌آل است.' });
  } else if (metaDesc.length > 0) {
    score += 5;
    issues.push({ level: 'warn', message: `متا توضیحات ${metaDesc.length} کاراکتر است؛ بازه پیشنهادی ۱۲۰–۱۶۵.` });
  } else {
    issues.push({ level: 'error', message: 'متا توضیحات خالی است.' });
  }

  if (!kw) {
    issues.push({ level: 'error', message: 'کلمه کلیدی کانونی تعریف نشده است.' });
  } else {
    score += 8;
    if (title.includes(kw) || title.toLowerCase().includes(kw.toLowerCase())) {
      score += 10;
      issues.push({ level: 'ok', message: 'کلمه کلیدی در عنوان آمده است.' });
    } else {
      issues.push({ level: 'warn', message: 'کلمه کلیدی در عنوان نیست.' });
    }
    if (metaTitle.includes(kw) || metaTitle.toLowerCase().includes(kw.toLowerCase())) {
      score += 6;
    } else {
      issues.push({ level: 'warn', message: 'کلمه کلیدی در متا عنوان نیست.' });
    }
    if (metaDesc.includes(kw) || metaDesc.toLowerCase().includes(kw.toLowerCase())) {
      score += 8;
      issues.push({ level: 'ok', message: 'کلمه کلیدی در متا توضیحات هست.' });
    } else {
      issues.push({ level: 'warn', message: 'کلمه کلیدی در متا توضیحات نیست.' });
    }
    if (slug.includes(kw.replace(/\s+/g, '-')) || slug.includes(kw)) {
      score += 8;
      issues.push({ level: 'ok', message: 'کلمه کلیدی در اسلاگ هست.' });
    } else {
      issues.push({ level: 'warn', message: 'کلمه کلیدی در اسلاگ نیست.' });
    }
    const occ = (text.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
    if (occ >= 2) {
      score += 10;
      issues.push({ level: 'ok', message: `کلمه کلیدی حدود ${occ} بار در متن آمده است.` });
    } else if (occ === 1) {
      score += 5;
      issues.push({ level: 'warn', message: 'کلمه کلیدی فقط یک‌بار در متن است؛ کمی بیشتر طبیعی بنویسید.' });
    } else {
      issues.push({ level: 'error', message: 'کلمه کلیدی در متن مقاله نیست.' });
    }
  }

  if (text.length >= 800) {
    score += 12;
    issues.push({ level: 'ok', message: 'حجم محتوا مناسب است.' });
  } else if (text.length >= 300) {
    score += 6;
    issues.push({ level: 'warn', message: 'محتوا کوتاه است؛ برای سئو حداقل حدود ۸۰۰ کاراکتر پیشنهاد می‌شود.' });
  } else {
    issues.push({ level: 'error', message: 'محتوا خیلی کوتاه است.' });
  }

  if (post.imageUrl) {
    score += 8;
    issues.push({ level: 'ok', message: 'تصویر شاخص دارد.' });
  } else {
    issues.push({ level: 'warn', message: 'تصویر شاخص ندارد.' });
  }

  const anyInternal =
    (post.contentHtml || '').includes('data-internal-link') ||
    /href=["'][^"']*blog[^"']*["']/i.test(post.contentHtml || '');
  if (anyInternal) {
    score += 6;
    issues.push({ level: 'ok', message: 'لینک داخلی در متن وجود دارد.' });
  } else {
    issues.push({ level: 'warn', message: 'لینک داخلی خودکار یا دستی در متن نیست.' });
  }

  score = Math.max(0, Math.min(100, score));
  return { score, issues };
}

export interface LinkIndexInput {
  blogPosts?: BlogPost[];
  blogCategories?: BlogCategory[];
  catalogCategories?: UnifiedCatalogCategory[];
  catalogEntries?: CatalogEntry[];
  /** نظرات مشتریان یا کامنت‌های مرتبط با کلیدواژه */
  comments?: { id: string; text: string; href?: string }[];
  currentPostId?: string;
}

/** ساخت فهرست مقاصد لینک با اولویت */
export function buildInternalLinkIndex(input: LinkIndexInput): InternalLinkTarget[] {
  const targets: InternalLinkTarget[] = [];

  for (const c of input.blogCategories || []) {
    if (!c.name?.trim()) continue;
    targets.push({
      keyword: c.name.trim(),
      href: `/blog?category=${encodeURIComponent(c.slug || c.name)}`,
      priority: LINK_PRIORITY.category,
      source: 'category',
      id: `bcat-${c.id}`,
    });
  }

  for (const c of input.catalogCategories || []) {
    if (!c.isActive && c.isActive !== undefined) continue;
    const name = c.name?.trim();
    if (!name) continue;
    targets.push({
      keyword: name,
      href: `/?catalog=${c.serviceCategory}&filter=${encodeURIComponent(c.key)}`,
      priority: LINK_PRIORITY.category,
      source: 'category',
      id: `ccat-${c.id}`,
    });
    // کلمات کوتاه‌تر داخل نام (مثلاً «حریر» از «حریر و مینیمال»)
    for (const part of name.split(/[\s،,/و]+/).map((s) => s.trim()).filter((s) => s.length >= 3)) {
      if (part === name) continue;
      targets.push({
        keyword: part,
        href: `/?catalog=${c.serviceCategory}&filter=${encodeURIComponent(c.key)}`,
        priority: LINK_PRIORITY.category - 1,
        source: 'category',
        id: `ccat-${c.id}-${part}`,
      });
    }
  }

  for (const e of input.catalogEntries || []) {
    if (e.isActive === false) continue;
    const title = e.title?.trim();
    if (title) {
      targets.push({
        keyword: title,
        href: `/?catalog=${e.category}&item=${encodeURIComponent(e.id)}`,
        priority: LINK_PRIORITY.catalog_item,
        source: 'catalog_item',
        id: `centry-${e.id}`,
      });
    }
    if (e.persianCategory?.trim()) {
      targets.push({
        keyword: e.persianCategory.trim(),
        href: `/?catalog=${e.category}&filter=${encodeURIComponent(e.filterKey || '')}`,
        priority: LINK_PRIORITY.catalog_item - 5,
        source: 'catalog_item',
        id: `centry-cat-${e.id}`,
      });
    }
  }

  for (const p of input.blogPosts || []) {
    if (p.id === input.currentPostId) continue;
    if (p.focusKeyword?.trim()) {
      targets.push({
        keyword: p.focusKeyword.trim(),
        href: `/blog/${p.slug}`,
        priority: LINK_PRIORITY.blog_post + 5,
        source: 'blog_post',
        id: `post-kw-${p.id}`,
      });
    }
    if (p.title?.trim()) {
      targets.push({
        keyword: p.title.trim(),
        href: `/blog/${p.slug}`,
        priority: LINK_PRIORITY.blog_post,
        source: 'blog_post',
        id: `post-title-${p.id}`,
      });
    }
    for (const sk of p.secondaryKeywords || []) {
      if (sk.trim().length < 2) continue;
      targets.push({
        keyword: sk.trim(),
        href: `/blog/${p.slug}`,
        priority: LINK_PRIORITY.blog_post - 5,
        source: 'blog_post',
        id: `post-sk-${p.id}-${sk}`,
      });
    }
  }

  for (const c of input.comments || []) {
    const text = (c.text || '').trim();
    if (text.length < 3) continue;
    // از کامنت فقط عبارات ۲–۴ کلمه‌ای معنادار برنمی‌داریم؛ کل جمله کوتاه را به عنوان کلید ضعیف
    const snippet = text.slice(0, 40).trim();
    if (snippet.length >= 3) {
      targets.push({
        keyword: snippet,
        href: c.href || '#comments',
        priority: LINK_PRIORITY.comment,
        source: 'comment',
        id: `cmt-${c.id}`,
      });
    }
  }

  // برای هر کلیدواژه فقط بالاترین اولویت را نگه دار
  const best = new Map<string, InternalLinkTarget>();
  for (const t of targets) {
    const key = t.keyword.toLowerCase();
    const prev = best.get(key);
    if (!prev || t.priority > prev.priority) best.set(key, t);
  }

  return Array.from(best.values()).sort((a, b) => {
    if (b.keyword.length !== a.keyword.length) return b.keyword.length - a.keyword.length;
    return b.priority - a.priority;
  });
}

/**
 * لینک داخلی هوشمند:
 * هر عبارت موجود در متن که در فهرست مقاصد سایت باشد لینک می‌شود.
 * اولویت: دسته بندی > کالیته > مقاله > کامنت
 * بدون تداخل داخل لینک‌های قبلی؛ هر عبارت فقط یک‌بار.
 */
export function applyInternalLinks(
  html: string,
  postsOrTargets: BlogPost[] | InternalLinkTarget[],
  currentId?: string,
  extra?: Omit<LinkIndexInput, 'blogPosts' | 'currentPostId'>
): string {
  if (!html) return html;

  let targets: InternalLinkTarget[];
  if (Array.isArray(postsOrTargets) && postsOrTargets.length && 'priority' in (postsOrTargets[0] as object)) {
    targets = postsOrTargets as InternalLinkTarget[];
  } else {
    targets = buildInternalLinkIndex({
      blogPosts: postsOrTargets as BlogPost[],
      currentPostId: currentId,
      ...extra,
    });
  }

  if (!targets.length) return html;

  let result = html;
  const usedKeywords = new Set<string>();
  const usedHrefs = new Set<string>();

  for (const item of targets) {
    const kwKey = item.keyword.toLowerCase();
    if (usedKeywords.has(kwKey) || usedHrefs.has(item.href)) continue;

    const escaped = item.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'i');
    // جدا کردن لینک‌های موجود و تگ‌ها تا داخل‌شان لینک نشود
    const parts = result.split(/(<a\b[^>]*>[\s\S]*?<\/a>|<[^>]+>)/gi);
    let changed = false;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part || part.startsWith('<')) continue;
      if (!re.test(part)) continue;
      parts[i] = part.replace(
        re,
        `<a href="${item.href}" data-internal-link="1" data-link-source="${item.source}" data-link-priority="${item.priority}" class="text-amber-800 underline">$&</a>`
      );
      changed = true;
      break;
    }
    if (changed) {
      result = parts.join('');
      usedKeywords.add(kwKey);
      usedHrefs.add(item.href);
    }
  }

  return result;
}

export function slugifyFa(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 80) || `post-${Date.now()}`;
}

export const DEFAULT_BLOG_CATEGORIES = [
  { id: 'bc-1', name: 'راهنمای خرید و دکوراسیون', slug: 'buying-guide' },
  { id: 'bc-2', name: 'نگهداری و شستشو', slug: 'care' },
  { id: 'bc-3', name: 'ترند و سبک‌شناسی', slug: 'trends' },
  { id: 'bc-4', name: 'کاغذ دیواری و کفپوش', slug: 'wallpaper-flooring' },
];
