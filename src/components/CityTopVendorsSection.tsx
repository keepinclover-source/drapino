import React, { useMemo, useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Store, 
  Calendar, 
  Image as ImageIcon,
  ChevronDown,
  UserCheck,
  Award,
  Layers
} from 'lucide-react';
import { CurtainVendor, UserProfile, ServiceCategoryId } from '../types';
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  vendorServesCategory,
  getVendorCategories,
} from '../utils/serviceCategory';

type CategoryFilter = 'all' | ServiceCategoryId;

interface CityTopVendorsSectionProps {
  selectedCity: string;
  vendors: CurtainVendor[];
  onOpenBookingModal: (vendorId?: string) => void;
  onOpenVendorProfile: (vendor: CurtainVendor) => void;
  onOpenVendorPortfolio: (vendor: CurtainVendor) => void;
  currentUser?: UserProfile | null;
}

const FILTER_OPTIONS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'همه رسته‌ها' },
  ...SERVICE_CATEGORIES.map((c) => ({ id: c as CategoryFilter, label: SERVICE_CATEGORY_LABELS[c] })),
];

export const CityTopVendorsSection: React.FC<CityTopVendorsSectionProps> = ({
  selectedCity,
  vendors,
  onOpenBookingModal,
  onOpenVendorProfile,
  onOpenVendorPortfolio,
}) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Detect if selectedCity is satellite of Tehran or Mashhad
  const tehranSatellites = ['پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'دماوند و رودهن', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'ملارد', 'شهر قدس'];
  const mashhadSatellites = ['گلبهار', 'چناران', 'نیشابور', 'کلات', 'روستای لکلک', 'طرقبه', 'شاندیز'];
  
  const isTehranSatellite = tehranSatellites.includes(selectedCity);
  const isMashhadSatellite = mashhadSatellites.includes(selectedCity);
  const hubCity = isTehranSatellite ? 'تهران' : isMashhadSatellite ? 'مشهد' : null;

  // Filter vendors for this city or its parent hub
  let cityVendors = vendors.filter(
    (v) => v.city === selectedCity || v.coveredDistricts?.some((d) => d.includes(selectedCity))
  );

  // If no direct vendors in satellite city, show hub vendors with dispatch capability
  const isCoveredByHub = cityVendors.length === 0 && hubCity !== null;
  if (isCoveredByHub) {
    cityVendors = vendors.filter(
      (v) => v.city === hubCity || v.coveredDistricts?.some((d) => d.includes(hubCity))
    );
  }

  // فیلتر رسته: پرده / کاغذ دیواری / کفپوش و پارکت
  const categoryFilteredVendors = useMemo(() => {
    if (categoryFilter === 'all') return cityVendors;
    return cityVendors.filter((v) => vendorServesCategory(v, categoryFilter));
  }, [cityVendors, categoryFilter]);

  // تعداد هر رسته برای نمایش روی دکمه‌ها
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      all: cityVendors.length,
      curtain: 0,
      wallpaper: 0,
      flooring: 0,
    };
    for (const v of cityVendors) {
      const cats = getVendorCategories(v);
      for (const c of cats) {
        counts[c] = (counts[c] || 0) + 1;
      }
    }
    return counts;
  }, [cityVendors]);

  // 1-month ad duration check
  const now = Date.now();
  const promotedCityVendors = categoryFilteredVendors
    .filter((v) => {
      if (!v.isPromotedAd) return false;
      if (v.promotedExpiresAt && v.promotedExpiresAt < now) return false;
      return true;
    })
    .sort((a, b) => (b.promotedAt || 0) - (a.promotedAt || 0));

  const organicCityVendors = categoryFilteredVendors
    .filter((v) => !v.isPromotedAd || (v.promotedExpiresAt && v.promotedExpiresAt < now))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const allCityVendors = [...promotedCityVendors, ...organicCityVendors];
  const displayedVendors = allCityVendors.slice(0, visibleCount);
  const remainingCount = Math.max(0, allCityVendors.length - visibleCount);

  // با تغییر فیلتر، شمارش نمایش را ریست کن
  const handleCategoryChange = (next: CategoryFilter) => {
    setCategoryFilter(next);
    setVisibleCount(10);
  };

  const sectionTitle =
    categoryFilter === 'all'
      ? 'برترین گالری‌های پرده و کالیته در'
      : `برترین گالری‌های ${SERVICE_CATEGORY_LABELS[categoryFilter]} در`;

  return (
    <section className="py-12 bg-gradient-to-b from-stone-50 via-white to-stone-50 border-y border-stone-200 text-right" data-testid="city-top-vendors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>فروشگاه‌های برتر دراپینو</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex flex-wrap items-center gap-2">
            <span>{sectionTitle}</span>
            <span className="text-amber-800 underline decoration-amber-300 underline-offset-8">{selectedCity}</span>
            {isCoveredByHub && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-stone-950 shadow-2xs">
                🛰️ شهر اقماری تحت پوشش مرکز {hubCity}
              </span>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
            {isCoveredByHub 
              ? `ساکنان محترم ${selectedCity} می‌توانند از میان برترین گالری‌های دارای پروانه کلانشهر ${hubCity} انتخاب نمایند؛ کارشناسان بدون هزینه مازاد کالیته‌ها را جهت پرو به منزل شما در ${selectedCity} می‌آورند.`
              : `منتخب‌ترین فروشگاه‌های دارای پروانه کسب رسمی اتحادیه در شهر ${selectedCity}`}
          </p>
        </div>

        {/* فیلتر رسته: پرده / کاغذ دیواری / کفپوش و پارکت */}
        <div className="mb-8" data-testid="vendor-category-filter">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-bold text-stone-700">فیلتر بر اساس نوع خدمات:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((opt) => {
              const active = categoryFilter === opt.id;
              const count = categoryCounts[opt.id] ?? 0;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleCategoryChange(opt.id)}
                  data-testid={`filter-${opt.id}`}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    active
                      ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-amber-400 hover:bg-amber-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`tabular-nums text-[10px] px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count.toLocaleString('fa-IR')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vendors Grid */}
        {displayedVendors.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center space-y-3">
            <Store className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">
              {categoryFilter === 'all'
                ? `هنوز فروشگاهی در شهر ${selectedCity} ثبت نشده است.`
                : `فروشگاهی با رسته «${SERVICE_CATEGORY_LABELS[categoryFilter]}» در شهر ${selectedCity} یافت نشد.`}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              {categoryFilter === 'all'
                ? `به زودی برترین گالری‌های پرده دارای پروانه در شهر ${selectedCity} به سامانه اضافه خواهند شد.`
                : 'رسته دیگری را انتخاب کنید یا کمی بعد دوباره سر بزنید.'}
            </p>
            {categoryFilter !== 'all' && (
              <button
                type="button"
                onClick={() => handleCategoryChange('all')}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer"
              >
                نمایش همه رسته‌ها
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {displayedVendors.map((vendor) => {
                const isPromoted =
                  vendor.isPromotedAd &&
                  (!vendor.promotedExpiresAt || vendor.promotedExpiresAt >= now);
                const vendorCats = getVendorCategories(vendor);

                return (
                  <div
                    key={vendor.id}
                    className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-all text-right flex flex-col ${
                      isPromoted ? 'border-amber-300 ring-1 ring-amber-200' : 'border-stone-200'
                    }`}
                  >
                    {isPromoted && (
                      <div className="bg-gradient-to-l from-amber-600 to-amber-500 text-white text-[10px] font-bold px-3 py-1.5 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>آگهی ویژه در ویترین اول</span>
                      </div>
                    )}

                    <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-black text-stone-900 text-sm sm:text-base truncate">
                            {vendor.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-stone-500">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{vendor.city}</span>
                          </div>
                        </div>
                        {vendor.isVerified && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            تایید
                          </span>
                        )}
                      </div>

                      {/* رسته‌های فعالیت فروشگاه */}
                      <div className="flex flex-wrap gap-1">
                        {vendorCats.map((c) => (
                          <span
                            key={c}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              categoryFilter === c
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-stone-50 text-stone-600 border-stone-200'
                            }`}
                          >
                            {SERVICE_CATEGORY_LABELS[c]}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-stone-600">
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-bold tabular-nums">{(vendor.rating || 0).toFixed(1)}</span>
                          <span className="text-stone-400">({(vendor.ratingCount || 0).toLocaleString('fa-IR')})</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-stone-500">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span className="tabular-nums">{(vendor.completedVisits || 0).toLocaleString('fa-IR')} بازدید</span>
                        </span>
                      </div>

                      {vendor.tier && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 w-fit">
                          سطح {vendor.tier}
                        </span>
                      )}

                      <div className="mt-auto pt-2 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenBookingModal(vendor.id)}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          درخواست پرو و بازدید
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenVendorProfile(vendor)}
                            className="flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold border border-stone-200 cursor-pointer"
                          >
                            <Store className="w-3.5 h-3.5" />
                            پروفایل
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenVendorPortfolio(vendor)}
                            className="flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold border border-stone-200 cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            نمونه‌کار
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {remainingCount > 0 && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + 10)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-stone-300 hover:border-amber-400 hover:bg-amber-50 text-stone-800 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <ChevronDown className="w-4 h-4 text-amber-700" />
                  نمایش {Math.min(10, remainingCount).toLocaleString('fa-IR')} گالری بیشتر
                  <span className="text-stone-400">({remainingCount.toLocaleString('fa-IR')} باقی‌مانده)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
