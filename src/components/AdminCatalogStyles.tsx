import React, { useRef, useState } from 'react';
import { Plus, Trash2, FileEdit, Eye, X, Save, Upload, RotateCcw } from 'lucide-react';
import { ServiceCategoryId } from '../types';
import { CATALOG_TABS, CatalogEntry, CatalogGroup } from '../utils/catalogStyles';

interface Props {
  entries: CatalogEntry[];
  onSave: (entry: CatalogEntry) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onReset: () => void;
  groups: CatalogGroup[];
  onSaveGroup: (group: CatalogGroup, previousKey?: string) => void;
  onDeleteGroup: (category: ServiceCategoryId, key: string) => void;
}

const emptyDraft = (category: ServiceCategoryId, groups: CatalogGroup[]): CatalogEntry => ({
  id: '',
  category,
  filterKey: groups.find((g) => g.category === category)?.key || '',
  title: '',
  persianCategory: groups.find((g) => g.category === category)?.label || '',
  description: '',
  features: [],
  fabricSuggestions: [],
  priceRange: '',
  imageUrl: '',
  isActive: true,
});

export const AdminCatalogStyles: React.FC<Props> = ({ entries, onSave, onDelete, onToggleActive, onReset, groups, onSaveGroup, onDeleteGroup }) => {
  const groupsOf = (c: ServiceCategoryId) => groups.filter((g) => g.category === c);
  const [newGroupLabel, setNewGroupLabel] = useState('');
  const [groupError, setGroupError] = useState('');
  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);
  const [editingGroupLabel, setEditingGroupLabel] = useState('');
  const [tab, setTab] = useState<ServiceCategoryId>('curtain');
  const [draft, setDraft] = useState<CatalogEntry | null>(null);
  const [featuresText, setFeaturesText] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const list = entries.filter((e) => e.category === tab);
  const countOf = (c: ServiceCategoryId) => entries.filter((e) => e.category === c).length;

  const openNew = () => {
    setDraft(emptyDraft(tab, groups));
    setFeaturesText('');
    setError('');
  };
  const openEdit = (e: CatalogEntry) => {
    setDraft({ ...e });
    setFeaturesText(e.features.join('\n'));
    setError('');
  };

  const changeCategory = (c: ServiceCategoryId) => {
    if (!draft) return;
    const first = groupsOf(c)[0];
    setDraft({ ...draft, category: c, filterKey: first?.key || '', persianCategory: first?.label || '' });
  };
  const changeSub = (key: string) => {
    if (!draft) return;
    const label = groupsOf(draft.category).find((f) => f.key === key)?.label || draft.persianCategory;
    setDraft({ ...draft, filterKey: key, persianCategory: label });
  };

  const handleFile = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file || !draft) return;
    if (!file.type.startsWith('image/')) {
      setError('فقط فایل تصویری (JPG / PNG / WebP) مجاز است.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // تبدیل به ۸۰۰×۶۰۰ (نسبت ۴:۳) برای کم‌حجم ماندن ذخیره‌سازی
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const ratio = Math.max(800 / img.naturalWidth, 600 / img.naturalHeight);
        ctx.drawImage(img, (800 - img.naturalWidth * ratio) / 2, (600 - img.naturalHeight * ratio) / 2, img.naturalWidth * ratio, img.naturalHeight * ratio);
        setDraft((d) => (d ? { ...d, imageUrl: canvas.toDataURL('image/jpeg', 0.82) } : d));
        setError('');
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.title.trim()) return setError('عنوان کالیته را وارد کنید.');
    if (!draft.imageUrl.trim()) return setError('تصویر کالیته را آپلود کنید یا آدرس تصویر را بنویسید.');
    const features = featuresText.split('\n').map((f) => f.trim()).filter(Boolean);
    onSave({
      ...draft,
      id: draft.id || `cs-${draft.category}-${Date.now()}`,
      title: draft.title.trim(),
      description: draft.description.trim(),
      priceRange: draft.priceRange.trim(),
      features,
    });
    setDraft(null);
  };

  const input = 'w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40';

  return (
    <div className="mt-8 space-y-6 text-right" data-testid="admin-catalog-styles">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-lg text-stone-900">کالیته‌های صفحه کاتالوگ (به تفکیک دسته)</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            کالیته‌هایی که مشتری در صفحه «کاتالوگ و کالیته‌ها» می‌بیند را اینجا تعریف کنید؛ هر کالیته به یکی از سه دسته پرده، کاغذ دیواری یا کفپوش و پارکت تعلق دارد.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => { if (window.confirm('همه کالیته‌ها به فهرست پیش‌فرض برگردد؟ تغییرات شما پاک می‌شود.')) onReset(); }}
            className="px-3 py-2.5 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>بازگشت به پیش‌فرض</span>
          </button>
          <button
            type="button"
            data-testid="catalog-add"
            onClick={openNew}
            className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف کالیته جدید</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 p-1.5 bg-stone-200/70 rounded-2xl max-w-xl text-sm">
        {CATALOG_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            data-testid={`admin-catalog-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${tab === t.id ? 'bg-amber-700 text-white shadow' : 'text-stone-700 hover:bg-white'}`}
          >
            {t.label} <span className="text-[10px] opacity-80">({countOf(t.id).toLocaleString('fa-IR')})</span>
          </button>
        ))}
      </div>


      {/* مدیریت گروه‌های فیلتر دوم */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3" data-testid="group-manager">
        <div>
          <h4 className="font-bold text-sm text-stone-900">گروه‌های فیلتر دوم برای «{CATALOG_TABS.find((t) => t.id === tab)?.label}»</h4>
          <p className="text-[11px] text-stone-500">این گروه‌ها به‌صورت دکمه فیلتر در صفحه کاتالوگ مشتری و در فرم تعریف کالیته نمایش داده می‌شوند.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {groupsOf(tab).map((g) => (
            <div key={g.key} data-testid="group-chip" className="flex items-center gap-1 bg-stone-100 rounded-lg px-2 py-1 text-xs">
              {editingGroupKey === g.key ? (
                <>
                  <input data-testid="group-edit-input" value={editingGroupLabel} onChange={(e) => setEditingGroupLabel(e.target.value)} className="px-2 py-0.5 rounded border border-stone-300 text-xs w-32" />
                  <button type="button" data-testid="group-edit-save" onClick={() => { if (editingGroupLabel.trim()) { onSaveGroup({ ...g, label: editingGroupLabel.trim() }, g.key); } setEditingGroupKey(null); }} className="text-emerald-700 font-bold cursor-pointer">ثبت</button>
                </>
              ) : (
                <>
                  <span className="font-medium">{g.label}</span>
                  <span className="text-[10px] text-stone-400">({entries.filter((e) => e.category === tab && e.filterKey === g.key).length.toLocaleString('fa-IR')})</span>
                  <button type="button" title="تغییر نام" onClick={() => { setEditingGroupKey(g.key); setEditingGroupLabel(g.label); }} className="text-stone-500 hover:text-amber-700 cursor-pointer"><FileEdit className="w-3 h-3" /></button>
                  <button type="button" title="حذف گروه" data-testid="group-delete" onClick={() => {
                    const used = entries.filter((e) => e.category === tab && e.filterKey === g.key).length;
                    if (used > 0) { setGroupError(`گروه «${g.label}» ${used.toLocaleString('fa-IR')} کالیته دارد؛ ابتدا آن‌ها را به گروه دیگری ببرید یا حذف کنید.`); return; }
                    setGroupError('');
                    onDeleteGroup(tab, g.key);
                  }} className="text-stone-500 hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
                </>
              )}
            </div>
          ))}
          {groupsOf(tab).length === 0 && <span className="text-xs text-stone-400">هنوز گروهی تعریف نشده است.</span>}
        </div>
        <form
          className="flex gap-2 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            const label = newGroupLabel.trim();
            if (!label) return;
            if (groupsOf(tab).some((g) => g.label === label)) { setGroupError('این گروه قبلاً تعریف شده است.'); return; }
            onSaveGroup({ key: `g-${Date.now().toString(36)}`, label, category: tab });
            setNewGroupLabel('');
            setGroupError('');
          }}
        >
          <input data-testid="group-new-input" value={newGroupLabel} onChange={(e) => setNewGroupLabel(e.target.value)} placeholder="نام گروه جدید، مثلاً «سنگ و سرامیک»" className={input} />
          <button type="submit" data-testid="group-add" className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer">افزودن گروه</button>
        </form>
        {groupError && <p className="text-xs font-bold text-red-600">{groupError}</p>}
      </div>

      {list.length === 0 && (
        <div className="p-10 text-center text-sm text-stone-500 bg-white rounded-2xl border border-dashed border-stone-300">
          هنوز کالیته‌ای در این دسته تعریف نشده است.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((e) => (
          <div key={e.id} data-testid="admin-catalog-card" className={`bg-white rounded-2xl border overflow-hidden flex flex-col ${e.isActive === false ? 'border-stone-200 opacity-60' : 'border-stone-200'}`}>
            <div className="relative aspect-[4/3] bg-stone-100">
              {e.imageUrl && <img src={e.imageUrl} alt={e.title} className="w-full h-full object-cover" loading="lazy" />}
              <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-900/80 text-white">{e.persianCategory}</span>
              {e.isActive === false && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-600 text-white">مخفی</span>}
            </div>
            <div className="p-4 flex-1 space-y-1.5">
              <h4 className="font-bold text-sm text-stone-900">{e.title}</h4>
              <p className="text-[11px] text-stone-600 line-clamp-2">{e.description}</p>
              <p className="text-[11px] font-bold text-amber-900">{e.priceRange}</p>
            </div>
            <div className="p-3 pt-0 flex gap-2">
              <button type="button" onClick={() => openEdit(e)} className="flex-1 py-2 bg-stone-100 hover:bg-amber-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer">
                <FileEdit className="w-3.5 h-3.5" /> ویرایش
              </button>
              <button type="button" title="نمایش / مخفی‌سازی" onClick={() => onToggleActive(e.id)} className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer">
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button type="button" title="حذف" data-testid="catalog-delete" onClick={() => { if (window.confirm(`کالیته «${e.title}» حذف شود؟`)) onDelete(e.id); }} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" dir="rtl">
          <form onSubmit={submit} className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 space-y-4 text-right" data-testid="catalog-form">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-lg">{draft.id ? 'ویرایش کالیته' : 'تعریف کالیته جدید'}</h4>
              <button type="button" onClick={() => setDraft(null)} className="p-1.5 hover:bg-stone-100 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">دسته‌بندی *</label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-xl text-xs">
                {CATALOG_TABS.map((t) => (
                  <button key={t.id} type="button" data-testid={`form-cat-${t.id}`} onClick={() => changeCategory(t.id)}
                    className={`py-2 rounded-lg font-bold cursor-pointer ${draft.category === t.id ? 'bg-amber-700 text-white' : 'text-stone-700 hover:bg-white'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">گروه (فیلتر دوم) *</label>
                <select data-testid="form-sub" value={draft.filterKey} onChange={(e) => changeSub(e.target.value)} className={input}>
                  {groupsOf(draft.category).map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">برچسب روی تصویر</label>
                <input value={draft.persianCategory} onChange={(e) => setDraft({ ...draft, persianCategory: e.target.value })} className={input} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">عنوان کالیته *</label>
              <input data-testid="form-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={input} />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">توضیحات</label>
              <textarea rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={input} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">ویژگی‌های برجسته (هر خط یک مورد)</label>
                <textarea rows={4} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} className={input} />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  {draft.category === 'curtain' ? 'حدود قیمت پارچه' : 'حدود قیمت هر متر مربع'}
                </label>
                <input data-testid="form-price" value={draft.priceRange} onChange={(e) => setDraft({ ...draft, priceRange: e.target.value })} className={input} placeholder="مثلاً ۸۵۰,۰۰۰ تا ۱,۴۰۰,۰۰۰ تومان" />
                {draft.category !== 'curtain' && (
                  <div className="mt-3">
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">نام مدل در فرم رزرو (اختیاری)</label>
                    <input value={draft.bookingStyle || ''} onChange={(e) => setDraft({ ...draft, bookingStyle: e.target.value })} className={input} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">تصویر کالیته *</label>
              <div className="flex gap-3 items-start">
                <div className="w-32 aspect-[4/3] rounded-xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                  {draft.imageUrl && <img src={draft.imageUrl} alt="" className="w-full h-full object-cover" data-testid="form-preview" />}
                </div>
                <div className="flex-1 space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" data-testid="form-file" />
                  <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> آپلود تصویر
                  </button>
                  <input
                    value={draft.imageUrl.startsWith('data:') ? '' : draft.imageUrl}
                    onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                    placeholder="یا آدرس تصویر (https://… یا /images/…)"
                    className={input}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-xs font-bold text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDraft(null)} className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold cursor-pointer">انصراف</button>
              <button type="submit" data-testid="form-save" className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Save className="w-4 h-4" /> ذخیره کالیته
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
