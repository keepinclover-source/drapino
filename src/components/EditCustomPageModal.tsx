import React, { useState } from 'react';
import { CustomPage } from '../types';
import { X, Save, FileText, Globe, CheckSquare, Square, Eye } from 'lucide-react';

interface EditCustomPageModalProps {
  page?: CustomPage | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pageData: Omit<CustomPage, 'id'>, existingId?: string) => void;
}

export const EditCustomPageModal: React.FC<EditCustomPageModalProps> = ({
  page,
  isOpen,
  onClose,
  onSave,
}) => {
  const isEditing = !!page;

  const [title, setTitle] = useState(page?.title || '');
  const [slug, setSlug] = useState(page?.slug || '');
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription || '');
  const [content, setContent] = useState(page?.content || '');
  const [published, setPublished] = useState(page?.published ?? true);
  const [showInHeaderNav, setShowInHeaderNav] = useState(page?.showInHeaderNav ?? true);
  const [showInFooterNav, setShowInFooterNav] = useState(page?.showInFooterNav ?? true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, '-');

    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');

    onSave(
      {
        title,
        slug: cleanSlug || `page-${Date.now()}`,
        metaDescription,
        content,
        published,
        showInHeaderNav,
        showInFooterNav,
        updatedAt: dateStr,
      },
      page?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in duration-150 text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-800" />
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">
              {isEditing ? `ویرایش برگه «${page.title}»` : 'ایجاد برگه / صفحه جدید در سایت'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">عنوان صفحه:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلا: قوانین ضمانت و بازگشت بیعانه"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">نامک / آدرس انگلیسی (Slug):</label>
              <input
                type="text"
                required
                dir="ltr"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="guarantee-terms"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono text-left"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">توضیحات کوتاه برای سئو و پیش‌نمایش (Meta Description):</label>
            <input
              type="text"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="یک خط توضیح مختصر درباره این صفحه..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">متن و محتوای کامل صفحه:</label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="متن کامل صفحه را اینجا بنویسید یا کپی کنید..."
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 leading-relaxed font-sans"
            />
          </div>

          {/* Visibility & Link Placement */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 text-amber-700 rounded focus:ring-amber-600"
              />
              <span className={published ? 'text-emerald-700' : 'text-stone-400'}>
                {published ? 'انتشار عمومی' : 'پیش‌نویس (مخفی)'}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={showInHeaderNav}
                onChange={(e) => setShowInHeaderNav(e.target.checked)}
                className="w-4 h-4 text-amber-700 rounded focus:ring-amber-600"
              />
              <span className="text-stone-700">نمایش در منوی بالا (هدر)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={showInFooterNav}
                onChange={(e) => setShowInFooterNav(e.target.checked)}
                className="w-4 h-4 text-amber-700 rounded focus:ring-amber-600"
              />
              <span className="text-stone-700">نمایش در پیوندهای فوتر</span>
            </label>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'ذخیره تغییرات صفحه' : 'ایجاد و انتشار صفحه جدید'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
