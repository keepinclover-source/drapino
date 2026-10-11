import React, { useMemo, useState } from 'react';
import { Layers, Plus, Save, Trash2, ToggleLeft, ToggleRight, ArrowUp, ArrowDown } from 'lucide-react';
import type { ServiceCategoryId } from '../types';
import { SERVICE_CATEGORY_LABELS } from '../utils/serviceCategory';
import type { UnifiedCatalogCategory } from '../utils/catalogCategories';

interface Props {
  categories: UnifiedCatalogCategory[];
  onChange: (next: UnifiedCatalogCategory[]) => void;
}

const SERVICES: ServiceCategoryId[] = ['curtain', 'wallpaper', 'flooring'];

const emptyDraft = (serviceCategory: ServiceCategoryId): UnifiedCatalogCategory => ({
  id: `cat-${Date.now()}`,
  name: '',
  key: '',
  serviceCategory,
  sortOrder: 999,
  isActive: true,
});

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .slice(0, 40) || `k-${Date.now()}`;
}

export const AdminCatalogCategories: React.FC<Props> = ({ categories, onChange }) => {
  const [filter, setFilter] = useState<ServiceCategoryId | 'all'>('all');
  const [draft, setDraft] = useState<UnifiedCatalogCategory | null>(null);

  const list = useMemo(() => {
    const rows = [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'fa'));
    if (filter === 'all') return rows;
    return rows.filter((c) => c.serviceCategory === filter);
  }, [categories, filter]);

  const saveDraft = () => {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      alert('نام دسته الزامی است.');
      return;
    }
    const key = (draft.key.trim() || slugify(name)).slice(0, 40);
    const row = { ...draft, name, key };
    const exists = categories.some((c) => c.id === row.id);
    if (exists) onChange(categories.map((c) => (c.id === row.id ? row : c)));
    else onChange([...categories, { ...row, sortOrder: categories.length }]);
    setDraft(null);
  };

  const move = (id: string, dir: -1 | 1) => {
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((c) => c.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[j];
    const next = categories.map((c) => {
      if (c.id === a.id) return { ...c, sortOrder: b.sortOrder };
      if (c.id === b.id) return { ...c, sortOrder: a.sortOrder };
      return c;
    });
    onChange(next);
  };

  return (
    <div className="space-y-6 text-right" data-testid="admin-catalog-categories">
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-lg text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-700" />
              دسته‌بندی واحد کالیته‌ها
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed max-w-2xl">
              این فهرست منبع مشترک برای «کالیته‌های مرجع» و «کالیته‌های صفحه کاتالوگ» است. با تعریف دسته در اینجا، هر دو بخش از همین منو تغذیه می‌شوند.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDraft(emptyDraft(filter === 'all' ? 'curtain' : filter))}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            دسته جدید
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${filter === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}
          >
            همه
          </button>
          {SERVICES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${filter === s ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}
            >
              {SERVICE_CATEGORY_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {draft && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-black text-amber-950">{categories.some((c) => c.id === draft.id) ? 'ویرایش دسته' : 'دسته جدید'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-stone-600">نام دسته</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                placeholder="مثلاً مخمل و کلاسیک"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-600">کلید فیلتر (انگلیسی)</label>
              <input
                value={draft.key}
                onChange={(e) => setDraft({ ...draft, key: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-mono"
                placeholder="velvet"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-600">رسته خدمت</label>
              <select
                value={draft.serviceCategory}
                onChange={(e) => setDraft({ ...draft, serviceCategory: e.target.value as ServiceCategoryId })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
              >
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {SERVICE_CATEGORY_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="button" onClick={saveDraft} className="flex-1 min-h-[40px] rounded-xl bg-stone-900 text-amber-400 text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1">
                <Save className="w-3.5 h-3.5" /> ذخیره
              </button>
              <button type="button" onClick={() => setDraft(null)} className="px-3 min-h-[40px] rounded-xl border border-stone-200 text-xs font-bold cursor-pointer">
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full text-xs text-right">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="p-3 font-bold">نام</th>
              <th className="p-3 font-bold">کلید</th>
              <th className="p-3 font-bold">رسته</th>
              <th className="p-3 font-bold">وضعیت</th>
              <th className="p-3 font-bold">ترتیب</th>
              <th className="p-3 font-bold">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-stone-100">
                <td className="p-3 font-bold text-stone-900">{c.name}</td>
                <td className="p-3 font-mono text-stone-600">{c.key}</td>
                <td className="p-3">{SERVICE_CATEGORY_LABELS[c.serviceCategory]}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => onChange(categories.map((x) => (x.id === c.id ? { ...x, isActive: !x.isActive } : x)))}
                    className="inline-flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {c.isActive ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-stone-400" />}
                    {c.isActive ? 'فعال' : 'غیرفعال'}
                  </button>
                </td>
                <td className="p-3">
                  <div className="inline-flex gap-1">
                    <button type="button" onClick={() => move(c.id, -1)} className="p-1 rounded border border-stone-200 cursor-pointer">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => move(c.id, 1)} className="p-1 rounded border border-stone-200 cursor-pointer">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="p-3">
                  <div className="inline-flex gap-2">
                    <button type="button" onClick={() => setDraft(c)} className="text-amber-800 font-bold cursor-pointer">
                      ویرایش
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`حذف دسته «${c.name}»؟`)) onChange(categories.filter((x) => x.id !== c.id));
                      }}
                      className="text-rose-700 font-bold cursor-pointer inline-flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-400">
                  دسته‌ای نیست. یک دسته جدید اضافه کنید.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
