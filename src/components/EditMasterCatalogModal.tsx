import React, { useState } from 'react';
import { MasterFabricCatalog } from '../types';
import type { UnifiedCatalogCategory } from '../utils/catalogCategories';
import { SERVICE_CATEGORY_LABELS } from '../utils/serviceCategory';
import { X, Save, Layers, Image as ImageIcon, DollarSign, Tag, CheckCircle2 } from 'lucide-react';

interface EditMasterCatalogModalProps {
  catalog?: MasterFabricCatalog | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (catalogData: Omit<MasterFabricCatalog, 'id'>, existingId?: string) => void;
  materialCategories?: UnifiedCatalogCategory[];
}

export const EditMasterCatalogModal: React.FC<EditMasterCatalogModalProps> = ({
  catalog,
  isOpen,
  onClose,
  onSave,
  materialCategories = [],
}) => {
  const isEditing = !!catalog;

  const [name, setName] = useState(catalog?.name || '');
  const [code, setCode] = useState(catalog?.code || '');
  const [category, setCategory] = useState<string>(
    catalog?.category || materialCategories[0]?.name || 'مخمل'
  );
  const [description, setDescription] = useState(catalog?.description || '');
  const [suggestedUnitPrice, setSuggestedUnitPrice] = useState(
    catalog?.suggestedUnitPrice || 650000
  );
  const [texture, setTexture] = useState(catalog?.texture || 'مات و متراکم');
  const [origin, setOrigin] = useState(catalog?.origin || 'ترکیه');
  const [colorsCount, setColorsCount] = useState(catalog?.colorsCount || 36);
  const [imageUrl, setImageUrl] = useState(catalog?.imageUrl || '/images/hero_curtain_luxury_living_1790237028961.jpg');
  const [isAvailable, setIsAvailable] = useState(catalog?.isAvailable ?? true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        name,
        code,
        category,
        description,
        suggestedUnitPrice: Number(suggestedUnitPrice),
        texture,
        origin,
        colorsCount: Number(colorsCount),
        imageUrl,
        isAvailable,
      },
      catalog?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in duration-150 text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-800" />
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">
              {isEditing ? `ویرایش کالیته مرجع «${catalog.name}»` : 'تعریف کالیته جدید در سامانه دراپینو'}
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
              <label className="block font-semibold text-stone-700 mb-1">نام رسمی کالیته / پارچه:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلا: مخمل کالیفرنیا ترک شانل"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">کد مرجع کاتالوگ:</label>
              <input
                type="text"
                required
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CAL-900"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">دسته‌بندی اصلی:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              >
                {materialCategories.length === 0 ? (
                  <option value={category}>{category || '— دسته‌ای تعریف نشده —'}</option>
                ) : (
                  materialCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({SERVICE_CATEGORY_LABELS[c.serviceCategory]})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">قیمت پیشنهادی متری (تومان):</label>
              <input
                type="number"
                step="10000"
                required
                value={suggestedUnitPrice}
                onChange={(e) => setSuggestedUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">بافت و جنس پارچه:</label>
              <input
                type="text"
                value={texture}
                onChange={(e) => setTexture(e.target.value)}
                placeholder="مات، براق، شاین"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">کشور سازنده / برند:</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="ترکیه، بلژیک، ایران"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">تنوع رنگ در کالیته:</label>
              <input
                type="number"
                min={1}
                value={colorsCount}
                onChange={(e) => setColorsCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">توضیحات و ویژگی‌های شاخص کالیته:</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلا: بافت سنگین بدون تغییر خواب پارچه، عایق سرما و نور..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">آدرس تصویر نمونه کالیته:</label>
            <div className="flex gap-2">
              <input
                type="text"
                dir="ltr"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/images/... یا لینک تصویر"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono text-left"
              />
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
            <span className="font-semibold text-stone-800">وضعیت دسترسی در سیستم:</span>
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-amber-700 rounded focus:ring-amber-600"
              />
              <span className={isAvailable ? 'text-emerald-700' : 'text-stone-400'}>
                {isAvailable ? 'فعال و قابل انتخاب برای فروشگاه‌ها' : 'غیرفعال / ناموجود'}
              </span>
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
              <span>{isEditing ? 'ذخیره تغییرات کالیته' : 'افزودن کالیته به سامانه'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
