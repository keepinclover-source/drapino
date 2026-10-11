import React, { useState } from 'react';
import { CURTAIN_STYLES } from '../data/mockData';
import { Layers, Check, ArrowLeft, Columns, Eye } from 'lucide-react';
import { ServiceCategoryId, SelectedSwatchItem } from '../types';
import {
  CATALOG_TABS,
  CATALOG_COPY,
  buildDefaultCatalog,
  buildDefaultGroups,
  CatalogEntry,
  CatalogGroup,
} from '../utils/catalogStyles';
import { SERVICE_CATEGORY_LABELS } from '../utils/serviceCategory';
import { OrderSwatchGallery } from './OrderSwatchGallery';
import { RoomVirtualTryOn } from './RoomVirtualTryOn';

interface FabricCatalogSectionProps {
  onSelectStyleForHomeVisit: (styleName: string, category: ServiceCategoryId) => void;
  themeSettings?: import('../types').SiteThemeSettings;
  initialCategory?: ServiceCategoryId;
  /** فهرست کالیته‌ها (از پنل مدیریت)؛ اگر نبود، فهرست پیش‌فرض */
  items?: CatalogEntry[];
  /** گروه‌های فیلتر دوم (از پنل مدیریت) */
  groups?: CatalogGroup[];
}

/** تبدیل کالیته کاتالوگ به آیتم قابل نمایش در استودیوی شبیه‌ساز */
function catalogToSwatch(entry: CatalogEntry, index: number): SelectedSwatchItem {
  return {
    id: entry.id || `cat-${index}`,
    title: entry.title,
    fabricCode: entry.id?.toUpperCase().slice(0, 12) || `DRP-${index + 1}`,
    category: entry.persianCategory || SERVICE_CATEGORY_LABELS[entry.category] || entry.category,
    colorName: entry.persianCategory || entry.title,
    imageUrl: entry.imageUrl,
    texture: (entry.features && entry.features[0]) || undefined,
    description: entry.description,
    suggestedFor: entry.features?.slice(0, 2).join(' · '),
    origin: SERVICE_CATEGORY_LABELS[entry.category] || undefined,
  };
}

export const FabricCatalogSection: React.FC<FabricCatalogSectionProps> = ({
  onSelectStyleForHomeVisit,
  themeSettings,
  initialCategory = 'curtain',
  items,
  groups,
}) => {
  const [category, setCategory] = useState<ServiceCategoryId>(initialCategory);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioStartIndex, setStudioStartIndex] = useState(0);
  const [studioSwatches, setStudioSwatches] = useState<SelectedSwatchItem[]>([]);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [tryOnPatternId, setTryOnPatternId] = useState<string | undefined>(undefined);

  const copy = CATALOG_COPY[category];
  const subFilters = (groups ?? buildDefaultGroups()).filter((g) => g.category === category);

  const allItems: CatalogEntry[] = (items ?? buildDefaultCatalog(CURTAIN_STYLES)).filter(
    (s) => s.category === category && s.isActive !== false
  );

  const filteredStyles = selectedFilter === 'all'
    ? allItems
    : allItems.filter((s) =>
        (s.filterKey ?? (s.id.includes(selectedFilter) ? selectedFilter : '')) === selectedFilter
      );

  const changeCategory = (c: ServiceCategoryId) => {
    setCategory(c);
    setSelectedFilter('all');
  };

  const openTryOn = (patternId?: string) => {
    setTryOnPatternId(patternId);
    setTryOnOpen(true);
  };

  const openStudio = (startId?: string) => {
    const swatches = filteredStyles.map(catalogToSwatch);
    if (swatches.length === 0) return;
    let idx = 0;
    if (startId) {
      const found = swatches.findIndex((s) => s.id === startId);
      if (found >= 0) idx = found;
    }
    setStudioSwatches(swatches);
    setStudioStartIndex(idx);
    setStudioOpen(true);
  };

  const sectionTitle =
    (category === 'curtain' && themeSettings?.catalogSectionTitle) || copy.title;
  const sectionSubtitle =
    (category === 'curtain' && themeSettings?.catalogSectionSubtitle) || copy.subtitle;

  const segBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${active ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'}`;

  const studioTitleByCat: Record<ServiceCategoryId, string> = {
    curtain: 'شبیه‌ساز و مقایسه کالیته پرده',
    wallpaper: 'شبیه‌ساز و مقایسه طرح کاغذ دیواری',
    flooring: 'شبیه‌ساز و مقایسه مدل کفپوش و پارکت',
  };

  return (
    <section className="py-16 bg-stone-50 border-b border-stone-200" data-testid="fabric-catalog-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Category tabs */}
        <div className="flex justify-center mb-10">
          <div className="grid grid-cols-3 gap-1 p-1.5 bg-stone-200/70 rounded-2xl w-full max-w-xl text-sm" role="tablist">
            {CATALOG_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={category === t.id}
                data-testid={`catalog-tab-${t.id}`}
                onClick={() => changeCategory(t.id)}
                className={`py-2.5 rounded-xl font-bold transition-all ${
                  category === t.id ? 'bg-amber-700 text-white shadow' : 'text-stone-700 hover:bg-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Header — ستونی و منظم برای هر سه رسته */}
        <div className="mb-8 text-right space-y-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 mb-2">
              <Layers className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="leading-snug">{copy.eyebrow} در {themeSettings?.siteName || 'دراپینو'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug break-words">
              {sectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2.5 leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>

          {/* فیلترها در ردیف جدا — اسکرول افقی در موبایل */}
          <div className="w-full overflow-x-auto pb-1 -mx-1 px-1">
            <div className="inline-flex min-w-min items-center gap-1 p-1 bg-stone-200/70 rounded-xl text-xs font-medium">
              <button type="button" onClick={() => setSelectedFilter('all')} className={segBtn(selectedFilter === 'all')}>
                {copy.allLabel}
              </button>
              {subFilters.map((sf) => (
                <button
                  key={`${sf.category}-${sf.key}`}
                  type="button"
                  onClick={() => setSelectedFilter(sf.key)}
                  className={`${segBtn(selectedFilter === sf.key)} whitespace-nowrap`}
                >
                  {sf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* نوار شبیه‌ساز عمومی برای رسته فعال */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200 shadow-xs text-right">
          <div className="space-y-1">
            <p className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-700" />
              شبیه‌ساز نور، زوم و مقایسه طرح‌ها
            </p>
            <p className="text-xs text-stone-500 leading-relaxed">
              قبل از درخواست آلبوم: طرح‌ها را در نورهای مختلف ببینید و مقایسه کنید، یا عکس خانه را آپلود کنید و طرح را روی دیوار / پنجره / کف به‌صورت مجازی امتحان کنید (بدون هوش مصنوعی).
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openStudio()}
              disabled={filteredStyles.length === 0}
              data-testid="open-catalog-studio"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              <Columns className="w-4 h-4" />
              شبیه‌ساز و مقایسه
            </button>
            <button
              type="button"
              onClick={() => openTryOn()}
              disabled={filteredStyles.length === 0}
              data-testid="open-room-tryon"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              شبیه‌ساز روی عکس خانه
            </button>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-right">
          {filteredStyles.length === 0 && (
            <p className="col-span-full text-center text-sm text-stone-500 py-10">{copy.emptyText}</p>
          )}
          {filteredStyles.map((style) => (
            <div
              key={style.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <img
                    src={style.imageUrl}
                    alt={style.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-900/80 text-white backdrop-blur-xs">
                      {style.persianCategory}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base text-stone-900 leading-snug">
                    {style.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {style.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
                    <span className="font-bold text-stone-800 text-[11px] block">ویژگی‌های برجسته:</span>
                    {style.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-stone-600 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs">
                    <span className="text-stone-500 text-[10px] block">{copy.priceLabel}</span>
                    <span className="font-bold text-amber-900 text-[11px] tabular-nums">
                      {style.priceRange}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions: درخواست آلبوم + شبیه‌ساز */}
              <div className="p-4 pt-0 space-y-2">
                <button
                  type="button"
                  onClick={() => onSelectStyleForHomeVisit(style.bookingStyle || style.title, category)}
                  className="w-full py-2.5 px-3 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{copy.button}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openStudio(style.id)}
                  className="w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  data-testid={`studio-${style.id}`}
                >
                  <Columns className="w-3.5 h-3.5 text-amber-700" />
                  <span>شبیه‌ساز و مقایسه</span>
                </button>
                <button
                  type="button"
                  onClick={() => openTryOn(style.id)}
                  className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  data-testid={`tryon-${style.id}`}
                >
                  <span>شبیه‌ساز روی عکس خانه</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* استودیوی شبیه‌ساز روی صفحه اصلی */}
      {studioOpen && studioSwatches.length > 0 && (
        <OrderSwatchGallery
          swatches={studioSwatches}
          isOpenDirectly
          studioOnly
          studioTitle={studioTitleByCat[category]}
          initialIndex={studioStartIndex}
          onCloseDirectly={() => setStudioOpen(false)}
        />
      )}

      <RoomVirtualTryOn
        isOpen={tryOnOpen}
        onClose={() => setTryOnOpen(false)}
        category={category}
        catalogItems={filteredStyles}
        initialPatternId={tryOnPatternId}
      />
    </section>
  );
};
