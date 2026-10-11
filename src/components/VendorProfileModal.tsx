import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Award, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  ThumbsUp, 
  Filter, 
  MessageSquare,
  Sparkles,
  Tag,
  Building2,
  ChevronLeft
} from 'lucide-react';
import { CurtainVendor, VendorReview } from '../types';

interface VendorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: CurtainVendor | null;
  reviews?: VendorReview[];
  onOpenBookingModal?: () => void;
  onOpenChat?: () => void;
}

type VendorProfileModalPropsInner = Omit<VendorProfileModalProps, 'vendor'> & { vendor: NonNullable<VendorProfileModalProps['vendor']> };

const VendorProfileModalInner: React.FC<VendorProfileModalPropsInner> = ({
  isOpen,
  onClose,
  vendor,
  reviews = [],
  onOpenBookingModal,
  onOpenChat,
}) => {

  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | 'with_reply'>('all');

  // Filter reviews specifically for this vendor
  const vendorReviews = reviews.filter((r) => r.vendorId === vendor.id);

  // Filtered reviews
  const filteredReviews = vendorReviews.filter((r) => {
    if (ratingFilter === '5') return r.rating === 5;
    if (ratingFilter === '4') return r.rating === 4;
    if (ratingFilter === 'with_reply') return Boolean(r.vendorReply);
    return true;
  });

  // Calculate rating stats
  const totalCount = vendorReviews.length;
  const avgRating = totalCount > 0 
    ? (vendorReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
    : vendor.rating.toFixed(1);

  const recommendCount = vendorReviews.filter((r) => r.wouldRecommend).length;
  const recommendPercent = totalCount > 0 ? Math.round((recommendCount / totalCount) * 100) : 98;

  // Criteria averages
  const criteriaAvg = {
    fabricQuality: totalCount > 0 
      ? (vendorReviews.reduce((sum, r) => sum + r.criteria.fabricQuality, 0) / totalCount).toFixed(1)
      : '4.9',
    specialistBehavior: totalCount > 0
      ? (vendorReviews.reduce((sum, r) => sum + r.criteria.specialistBehavior, 0) / totalCount).toFixed(1)
      : '4.8',
    installationPrecision: totalCount > 0
      ? (vendorReviews.reduce((sum, r) => sum + r.criteria.installationPrecision, 0) / totalCount).toFixed(1)
      : '4.8',
    priceFairness: totalCount > 0
      ? (vendorReviews.reduce((sum, r) => sum + r.criteria.priceFairness, 0) / totalCount).toFixed(1)
      : '4.7',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200 text-right animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg border-2 border-amber-400/40 shrink-0">
              <Store className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {vendor.name}
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  نشان {vendor.tier} دراپینو
                </span>
                {vendor.isVerified && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>پروانه کسب تایید شده</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-300 flex items-center gap-1.5 flex-wrap">
                <span>مدیریت: {vendor.ownerName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {vendor.city}، {vendor.address}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/10 text-center">
            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <span className="text-[10px] text-stone-400 block mb-0.5">میانگین رضایت مشتریان</span>
              <div className="flex items-center justify-center gap-1 text-base font-black text-amber-400 font-mono">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{avgRating}</span>
                <span className="text-xs text-stone-400 font-normal">/ ۵</span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <span className="text-[10px] text-stone-400 block mb-0.5">تعداد کل نظرات</span>
              <span className="text-base font-black text-white font-mono">
                {vendor.ratingCount || totalCount} نظر
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <span className="text-[10px] text-stone-400 block mb-0.5">پیشنهاد خریداران</span>
              <div className="flex items-center justify-center gap-1 text-base font-black text-emerald-400 font-mono">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{recommendPercent}٪</span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <span className="text-[10px] text-stone-400 block mb-0.5">ویزیت‌های موفق در منزل</span>
              <span className="text-base font-black text-white font-mono">
                {vendor.completedVisits} سفارش
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-right">
          
          {/* Section: 4 Criteria Breakdown Cards */}
          <div className="space-y-3">
            <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-700" />
              <span>ارزیابی تخصصی کیفیت خدمات بر اساس نظرات خریداران</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">کیفیت پارچه و ظرافت دوخت:</span>
                  <span className="font-mono font-black text-amber-700">{criteriaAvg.fabricQuality} / ۵</span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-600 rounded-full transition-all"
                    style={{ width: `${(parseFloat(criteriaAvg.fabricQuality) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">خوش‌قولی و رفتار کارشناس اعزامی:</span>
                  <span className="font-mono font-black text-amber-700">{criteriaAvg.specialistBehavior} / ۵</span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${(parseFloat(criteriaAvg.specialistBehavior) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">تمیزی و دقت نصب پرده و ریل:</span>
                  <span className="font-mono font-black text-amber-700">{criteriaAvg.installationPrecision} / ۵</span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${(parseFloat(criteriaAvg.installationPrecision) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">تناسب قیمت نهایی با کیفیت کار:</span>
                  <span className="font-mono font-black text-amber-700">{criteriaAvg.priceFairness} / ۵</span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(parseFloat(criteriaAvg.priceFairness) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Covered Districts & Catalogs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-700" />
                مناطق تحت پوشش اعزام فوری:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {vendor.coveredDistricts.map((d, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-stone-200 rounded-lg text-stone-700 text-[11px]">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-700" />
                کالیته‌ها و آلبوم‌های همراه کارشناس:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {vendor.sampleCatalogs.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-amber-200 text-amber-900 font-semibold rounded-lg text-[11px]">
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Customer Reviews List */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-stone-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-700" />
                  <span>دیدگاه‌ها و تجربیات ثبت‌شده خریداران</span>
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 font-bold font-mono">
                  {filteredReviews.length}
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setRatingFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    ratingFilter === 'all'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  همه ({vendorReviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRatingFilter('5')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    ratingFilter === '5'
                      ? 'bg-white text-amber-800 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ۵ ستاره
                </button>
                <button
                  type="button"
                  onClick={() => setRatingFilter('with_reply')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    ratingFilter === 'with_reply'
                      ? 'bg-white text-blue-800 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  دارای پاسخ فروشگاه
                </button>
              </div>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs">
                نظری با فیلتر انتخابی یافت نشد.
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3 text-right"
                  >
                    {/* Review Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs">
                          {rev.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-stone-900">{rev.customerName}</span>
                            <span className="text-[10px] text-stone-400 font-mono">سفارش #{rev.orderNumber}</span>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {rev.date} {rev.time ? `• ${rev.time}` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5 text-amber-400 dir-ltr">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <Star
                              key={st}
                              className={`w-3.5 h-3.5 ${
                                st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-xs text-amber-800 font-mono">
                          {rev.rating} از ۵
                        </span>
                        {rev.wouldRecommend && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-emerald-600" />
                            پیشنهاد می‌کند
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Comment Quote */}
                    <p className="text-xs text-stone-700 leading-relaxed bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                      «{rev.comment}»
                    </p>

                    {/* Tags & Criteria summary */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                      {rev.tags && rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rev.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/70 rounded-md text-[10px] font-semibold"
                            >
                              ✓ {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-[10px] text-stone-500 font-medium">
                        دوخت: {rev.criteria.fabricQuality}/۵ · رفتار: {rev.criteria.specialistBehavior}/۵ · نصب: {rev.criteria.installationPrecision}/۵ · قیمت: {rev.criteria.priceFairness}/۵
                      </div>
                    </div>

                    {/* Vendor Response */}
                    {rev.vendorReply && (
                      <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 text-xs space-y-1 mt-2">
                        <div className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px]">
                          <Store className="w-3.5 h-3.5 text-blue-700" />
                          <span>پاسخ رسمی {vendor.name} ({rev.vendorReply.date}):</span>
                        </div>
                        <p className="text-stone-700 text-xs leading-relaxed pr-5">
                          {rev.vendorReply.text}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-xl cursor-pointer"
          >
            بستن
          </button>

          {onOpenBookingModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBookingModal();
              }}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-200" />
              <span>ثبت درخواست اعزام و تست کالیته در منزل</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export const VendorProfileModal: React.FC<VendorProfileModalProps> = (props) => {
  // بازگشت زودهنگام باید خارج از کامپوننت اصلی باشد تا تعداد hookها بین رندرها ثابت بماند
  if (!props.isOpen || !props.vendor) return null;
  return <VendorProfileModalInner {...props} />;
};
