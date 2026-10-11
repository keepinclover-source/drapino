import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X, Save, Image as ImageIcon, Bold, Italic, Heading2, List, Link2, Link as LinkIcon, Sparkles, Calendar, RefreshCw, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import type { BlogPost, BlogCategory } from '../types';
import { analyzeBlogSeo, applyInternalLinks, buildInternalLinkIndex, slugifyFa } from '../utils/blogSeo';
import type { UnifiedCatalogCategory } from '../utils/catalogCategories';
import type { CatalogEntry } from '../utils/catalogStyles';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initial?: BlogPost | null;
  categories: BlogCategory[];
  allPosts: BlogPost[];
  catalogCategories?: UnifiedCatalogCategory[];
  catalogEntries?: CatalogEntry[];
  /** متن نظرات برای اولویت پایین لینک */
  commentTexts?: { id: string; text: string; href?: string }[];
  onSave: (post: Omit<BlogPost, 'id'> & { id?: string }, opts?: { isRepublish?: boolean }) => void;
}

export const AdminBlogEditor: React.FC<Props> = ({
  isOpen, onClose, initial, categories, allPosts, catalogCategories = [], catalogEntries = [], commentTexts = [], onSave,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [author, setAuthor] = useState('تحریریه دراپینو');
  const [imageUrl, setImageUrl] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [republishAt, setRepublishAt] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('published');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initial?.title || '');
    setSlug(initial?.slug || '');
    setSlugManual(Boolean(initial?.slug));
    setCategory(initial?.category || categories[0]?.name || '');
    setSummary(initial?.summary || '');
    setAuthor(initial?.author || 'تحریریه دراپینو');
    setImageUrl(initial?.imageUrl || '');
    setFocusKeyword(initial?.focusKeyword || '');
    setSecondaryKeywords((initial?.secondaryKeywords || []).join('، '));
    setMetaTitle(initial?.metaTitle || '');
    setMetaDescription(initial?.metaDescription || '');
    setRepublishAt(initial?.republishAt ? initial.republishAt.slice(0, 16) : '');
    setStatus(initial?.status || 'published');
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML =
          initial?.contentHtml ||
          (initial?.content || []).map((p) => `<p>${p}</p>`).join('') ||
          '';
      }
    }, 0);
  }, [isOpen, initial, categories]);

  useEffect(() => {
    if (!slugManual && title) setSlug(slugifyFa(title));
  }, [title, slugManual]);

  const html = () => editorRef.current?.innerHTML || '';

  const seo = useMemo(() => {
    if (!isOpen) return { score: 0, issues: [] };
    return analyzeBlogSeo({
      title,
      slug,
      summary,
      contentHtml: typeof document !== 'undefined' ? html() : initial?.contentHtml,
      focusKeyword,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || summary,
      imageUrl,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, title, slug, summary, focusKeyword, metaTitle, metaDescription, imageUrl, initial]);

  const focusEditor = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
        return;
      }
    }
    savedRangeRef.current = null;
  };

  const restoreSelection = () => {
    const el = editorRef.current;
    if (!el) return false;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return false;
    if (savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
      return true;
    }
    // اگر انتخابی نبود، کرسر را ته محتوا بگذار
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    return true;
  };

  const runCmd = (cmd: string, value?: string) => {
    focusEditor();
    restoreSelection();
    try {
      // eslint-disable-next-line deprecation/deprecation
      document.execCommand(cmd, false, value);
    } catch {
      /* ignore */
    }
    saveSelection();
  };

  /** دکمه‌های تولبار نباید فوکوس را از ادیتور بگیرند */
  const toolMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    saveSelection();
  };

  const applyHeading = () => {
    focusEditor();
    restoreSelection();
    const sel = window.getSelection();
    const selected = sel?.toString() || '';
    // eslint-disable-next-line deprecation/deprecation
    const ok =
      document.execCommand('formatBlock', false, 'h2') ||
      document.execCommand('formatBlock', false, '<h2>');
    if (!ok) {
      if (selected) {
        // eslint-disable-next-line deprecation/deprecation
        document.execCommand('insertHTML', false, `<h2>${selected}</h2>`);
      } else {
        // eslint-disable-next-line deprecation/deprecation
        document.execCommand('insertHTML', false, '<h2>تیتر بخش</h2>');
      }
    }
    saveSelection();
  };

  const applyBullet = () => {
    focusEditor();
    restoreSelection();
    // eslint-disable-next-line deprecation/deprecation
    let ok = document.execCommand('insertUnorderedList', false);
    if (!ok) {
      const sel = window.getSelection();
      const text = sel?.toString() || 'مورد فهرست';
      // eslint-disable-next-line deprecation/deprecation
      document.execCommand('insertHTML', false, `<ul><li>${text}</li></ul>`);
    }
    saveSelection();
  };

  const openExternalLinkDialog = () => {
    saveSelection();
    const sel = window.getSelection();
    setLinkText(sel?.toString() || '');
    setLinkUrl('https://');
    setLinkNewTab(true);
    setShowLinkDialog(true);
  };

  const insertExternalLink = () => {
    let url = linkUrl.trim();
    if (!url || url === 'https://') {
      alert('آدرس لینک را وارد کنید.');
      return;
    }
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      url = 'https://' + url;
    }
    focusEditor();
    restoreSelection();
    const sel = window.getSelection();
    const selected = (sel?.toString() || linkText || url).trim();
    const target = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const htmlLink = `<a href="${url.replace(/"/g, '&quot;')}"${target} data-external-link="1" class="text-amber-800 underline">${selected.replace(/</g, '&lt;')}</a>`;
    // eslint-disable-next-line deprecation/deprecation
    document.execCommand('insertHTML', false, htmlLink);
    setShowLinkDialog(false);
    saveSelection();
  };

  const insertImage = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 6 * 1024 * 1024) {
      alert('حداکثر حجم تصویر ۶ مگابایت');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || '');
      focusEditor();
      restoreSelection();
      // eslint-disable-next-line deprecation/deprecation
      document.execCommand(
        'insertHTML',
        false,
        `<p><img src="${src}" alt="${(focusKeyword || title || 'تصویر مقاله').replace(/"/g, '')}" style="max-width:100%;border-radius:12px;margin:12px 0"/></p>`
      );
      saveSelection();
    };
    reader.readAsDataURL(file);
  };

  const insertCover = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const linkExtra = {
    blogCategories: categories,
    catalogCategories,
    catalogEntries,
    comments: commentTexts,
  };

  const applyAutoLinks = () => {
    if (!editorRef.current) return;
    const before = editorRef.current.innerHTML;
    const index = buildInternalLinkIndex({
      blogPosts: allPosts,
      currentPostId: initial?.id,
      ...linkExtra,
    });
    const next = applyInternalLinks(before, index);
    editorRef.current.innerHTML = next;
    if (next === before) {
      alert(
        index.length === 0
          ? 'فهرست مقاصد لینک خالی است (دسته، کالیته یا مقاله تعریف کنید).'
          : 'هیچ‌کدام از عبارات فهرست (مثل نام دسته‌ها: حریر، مخمل، …) در متن مقاله پیدا نشد. همان واژه‌ها را در متن بنویسید تا لینک شوند.'
      );
    } else {
      const n = (next.match(/data-internal-link/g) || []).length - (before.match(/data-internal-link/g) || []).length;
      alert(`لینک داخلی اعمال شد${n > 0 ? ` (${n} مورد جدید)` : ''}. اولویت: دسته‌بندی > کالیته > مقاله > نظر`);
    }
    saveSelection();
  };

  const buildPost = (isRepublish = false): Omit<BlogPost, 'id'> & { id?: string } => {
    let contentHtml = html();
    contentHtml = applyInternalLinks(contentHtml, allPosts, initial?.id, linkExtra);
    const plain = contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const report = analyzeBlogSeo({
      title, slug, summary, contentHtml, focusKeyword,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || summary,
      imageUrl,
    });

    const prevSlugs = [...(initial?.previousSlugs || [])];
    if (isRepublish && initial?.slug && initial.slug !== slug && !prevSlugs.includes(initial.slug)) {
      prevSlugs.push(initial.slug);
    } else if (initial?.slug && initial.slug !== slug && !prevSlugs.includes(initial.slug)) {
      prevSlugs.push(initial.slug);
    }

    const words = Math.max(1, Math.round(plain.length / 5));
    const readMin = Math.max(1, Math.round(words / 180));

    return {
      id: initial?.id,
      title: title.trim(),
      slug: slug.trim() || slugifyFa(title),
      summary: summary.trim() || plain.slice(0, 140),
      content: plain ? [plain] : [''],
      contentHtml,
      category,
      readTime: `${readMin} دقیقه مطالعه`,
      date: isRepublish
        ? new Date().toLocaleDateString('fa-IR')
        : initial?.date || new Date().toLocaleDateString('fa-IR'),
      author: author.trim() || 'تحریریه دراپینو',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=80',
      featured: initial?.featured,
      focusKeyword: focusKeyword.trim() || undefined,
      secondaryKeywords: secondaryKeywords
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean),
      metaTitle: (metaTitle || title).trim(),
      metaDescription: (metaDescription || summary).trim(),
      seoScore: report.score,
      status,
      publishedAt: initial?.publishedAt || new Date().toISOString(),
      republishAt: republishAt ? new Date(republishAt).toISOString() : undefined,
      lastRepublishedAt: isRepublish ? new Date().toISOString() : initial?.lastRepublishedAt,
      previousSlugs: prevSlugs,
      canonicalSlug: slug.trim() || slugifyFa(title),
    };
  };

  if (!isOpen) return null;

  const liveSeo = analyzeBlogSeo({
    title, slug, summary, contentHtml: html(), focusKeyword,
    metaTitle: metaTitle || title, metaDescription: metaDescription || summary, imageUrl,
  });

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-2 sm:p-4" data-testid="admin-blog-editor">
      <div className="bg-white w-full max-w-5xl max-h-[96vh] overflow-y-auto rounded-2xl shadow-2xl text-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 border-b border-stone-200 bg-white">
          <h3 className="font-black text-stone-900 text-sm sm:text-base">{initial ? 'ویرایش مقاله' : 'نگارش مقاله جدید'}</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان مقاله"
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-bold"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-500">اسلاگ (URL)</label>
                <input
                  value={slug}
                  onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                />
                {initial?.slug && initial.slug !== slug && (
                  <p className="text-[10px] text-amber-800 mt-1">با تغییر اسلاگ، ریدایرکت ۳۰۱ از «{initial.slug}» به اسلاگ جدید ثبت می‌شود.</p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500">دسته‌بندی</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 text-xs">
                  {categories.filter((c) => c.isActive !== false).map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="چکیده کوتاه"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
            />

            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-1.5 bg-stone-100 rounded-xl">
              <button type="button" title="پررنگ" className="px-2 py-1.5 rounded-lg bg-white border text-xs cursor-pointer" onMouseDown={toolMouseDown} onClick={() => runCmd('bold')}><Bold className="w-3.5 h-3.5" /></button>
              <button type="button" title="ایتالیک" className="px-2 py-1.5 rounded-lg bg-white border text-xs cursor-pointer" onMouseDown={toolMouseDown} onClick={() => runCmd('italic')}><Italic className="w-3.5 h-3.5" /></button>
              <button type="button" title="تیتر H2" className="px-2 py-1.5 rounded-lg bg-white border text-xs cursor-pointer font-black" onMouseDown={toolMouseDown} onClick={applyHeading}><Heading2 className="w-3.5 h-3.5" /></button>
              <button type="button" title="فهرست نقطه‌ای" className="px-2 py-1.5 rounded-lg bg-white border text-xs cursor-pointer" onMouseDown={toolMouseDown} onClick={applyBullet}><List className="w-3.5 h-3.5" /></button>
              <label className="px-2 py-1.5 rounded-lg bg-white border text-xs cursor-pointer inline-flex items-center gap-1" onMouseDown={toolMouseDown}>
                <ImageIcon className="w-3.5 h-3.5" /> تصویر در متن
                <input type="file" accept="image/*" className="hidden" onChange={(e) => insertImage(e.target.files?.[0])} />
              </label>
              <button type="button" title="لینک خارجی" className="px-2 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-bold cursor-pointer inline-flex items-center gap-1" onMouseDown={toolMouseDown} onClick={openExternalLinkDialog}>
                <LinkIcon className="w-3.5 h-3.5" /> لینک خارجی
              </button>
              <button type="button" title="لینک داخلی خودکار" className="px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1" onMouseDown={toolMouseDown} onClick={applyAutoLinks}>
                <Link2 className="w-3.5 h-3.5" /> لینک داخلی خودکار
              </button>
            </div>
            <p className="text-[10px] text-stone-500 leading-relaxed">
              لینک داخلی: واژه‌های متن (مثلاً «حریر») را در دسته‌ها، کالیته‌ها، مقالات و نظرات جستجو می‌کند. اولویت با <strong>دسته‌بندی</strong> است، بعد کالیته، مقاله و در آخر نظر.
            </p>

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              onBlur={saveSelection}
              className="min-h-[220px] px-3 py-3 rounded-xl border border-stone-200 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-600 prose prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-black [&_h2]:my-3 [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:my-2 [&_a]:text-amber-800 [&_a]:underline"
              data-placeholder="متن مقاله را اینجا بنویسید..."
            />

            {showLinkDialog && (
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-2">
                <p className="text-xs font-black text-stone-800">درج لینک خارجی</p>
                <input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="متن لینک (اگر خالی باشد همان آدرس)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-mono text-left"
                />
                <label className="flex items-center gap-2 text-[11px] text-stone-700 cursor-pointer">
                  <input type="checkbox" checked={linkNewTab} onChange={(e) => setLinkNewTab(e.target.checked)} />
                  باز شدن در تب جدید
                </label>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowLinkDialog(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-stone-600 cursor-pointer">انصراف</button>
                  <button type="button" onClick={insertExternalLink} className="px-3 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-bold cursor-pointer">درج لینک</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-500">نویسنده</label>
                <input value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl border text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500">تصویر شاخص</label>
                <label className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed text-xs cursor-pointer">
                  <ImageIcon className="w-4 h-4" />
                  {imageUrl ? 'تغییر تصویر' : 'آپلود تصویر شاخص'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => insertCover(e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </div>

          {/* SEO panel */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-stone-200 p-3 space-y-2 bg-stone-50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-stone-900 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-700" /> سئو</p>
                <span className={`text-sm font-black tabular-nums ${liveSeo.score >= 70 ? 'text-emerald-700' : liveSeo.score >= 40 ? 'text-amber-700' : 'text-rose-700'}`}>
                  {liveSeo.score}٪
                </span>
              </div>
              <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
                <div className={`h-full ${liveSeo.score >= 70 ? 'bg-emerald-500' : liveSeo.score >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${liveSeo.score}%` }} />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {liveSeo.issues.map((iss, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[10px]">
                    {iss.level === 'ok' ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className={`w-3 h-3 shrink-0 mt-0.5 ${iss.level === 'error' ? 'text-rose-600' : 'text-amber-600'}`} />}
                    <span className="text-stone-700 leading-relaxed">{iss.message}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 p-3 space-y-2">
              <label className="text-[10px] font-bold text-stone-500">کلمه کلیدی کانونی</label>
              <input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-xs" placeholder="مثلاً پرده مخمل" />
              <label className="text-[10px] font-bold text-stone-500">کلمات کلیدی فرعی (با ویرگول)</label>
              <input value={secondaryKeywords} onChange={(e) => setSecondaryKeywords(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-xs" />
              <label className="text-[10px] font-bold text-stone-500">متا عنوان</label>
              <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-xs" placeholder="پیش‌فرض = عنوان" />
              <label className="text-[10px] font-bold text-stone-500">متا توضیحات</label>
              <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border text-xs" placeholder="۱۲۰ تا ۱۶۵ کاراکتر" />
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3 space-y-2">
              <p className="text-xs font-black text-amber-950 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> باز‌نشر</p>
              <p className="text-[10px] text-stone-600 leading-relaxed">تاریخ باز‌نشر آینده را تنظیم کنید یا همین حالا باز‌نشر کنید. با تغییر اسلاگ، ریدایرکت ۳۰۱ از آدرس قبلی نگه داشته می‌شود.</p>
              <input type="datetime-local" value={republishAt} onChange={(e) => setRepublishAt(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-xs bg-white" />
              {initial && (
                <button
                  type="button"
                  onClick={() => {
                    if (!title.trim()) return alert('عنوان الزامی است');
                    onSave(buildPost(true), { isRepublish: true });
                    onClose();
                  }}
                  className="w-full min-h-[40px] rounded-xl bg-stone-900 text-amber-400 text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> باز‌نشر همین حالا
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 px-4 py-3 border-t border-stone-200 bg-white">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer">انصراف</button>
          <button
            type="button"
            onClick={() => {
              if (!title.trim()) return alert('عنوان الزامی است');
              onSave(buildPost(false));
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> ذخیره / انتشار
          </button>
        </div>
      </div>
    </div>
  );
};
