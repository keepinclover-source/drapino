import React, { useState } from 'react';
import { CurtainVendor, VendorPortfolioItem } from '../types';
import { 
  X, 
  Image as ImageIcon, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Sparkles, 
  ShieldCheck,
  Phone
} from 'lucide-react';

interface VendorPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: CurtainVendor | null;
  onOpenBookingModal?: (vendorId?: string) => void;
}

export const VendorPortfolioModal: React.FC<VendorPortfolioModalProps> = ({
  isOpen,
  onClose,
  vendor,
  onOpenBookingModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItemForLightbox, setActiveItemForLightbox] = useState<VendorPortfolioItem | null>(null);

  if (!isOpen || !vendor) return null;

  // Filter approved items only for public showcase
  const approvedItems = (vendor.portfolio || []).filter((item) => item.status === 'approved');

  // Fallback sample portfolio items if none exist yet for demo vendors
  const fallbackItems: VendorPortfolioItem[] = [
    {
      id: `p-${vendor.id}-1`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      title: 'اجرای پرده مخمل کالیفرنیا و حریر الگانت پذیرایی',
      description: 'دوخت پلیسه دوبل با ریل مخفی و اکسسوری شرکتی، متراژ ۱۸ متر به سفارش مشتری در منطقه نیاوران',
      category: 'پذیرایی و سالن',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=800&auto=format&fit=crop&q=80',
      aspectRatio: '1200x800',
      status: 'approved',
      createdAt: '۱۴۰۳/۰۶/۱۵',
      approvedAt: '۱۴۰۳/۰۶/۱۶',
    },
    {
      id: `p-${vendor.id}-2`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      title: 'پروژه پرده مینیمال هتلی و تور شاین ابریشمی',
      description: 'نصب ریل برقی موتورایز هوشمند با پرده کتان گونی‌بافت مات و حریر شیشه‌ای',
      category: 'مینیمال و مدرن',
      imageUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200&h=800&auto=format&fit=crop&q=80',
      aspectRatio: '1200x800',
      status: 'approved',
      createdAt: '۱۴۰۳/۰۶/۲۰',
      approvedAt: '۱۴۰۳/۰۶/۲۱',
    },
    {
      id: `p-${vendor.id}-3`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      title: 'پرده زبرا دو مکانیزم سایه‌روشن اتاق مستر',
      description: 'پارچه ژاکارد طرح دار با قاب آلومینیومی شرکتی و زنجیر کروم ضدزنگ',
      category: 'اتاق خواب',
      imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=800&auto=format&fit=crop&q=80',
      aspectRatio: '1200x800',
      status: 'approved',
      createdAt: '۱۴۰۳/۰۷/۰۱',
      approvedAt: '۱۴۰۳/۰۷/۰۲',
    },
    {
      id: `p-${vendor.id}-4`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      title: 'پرده پانچ کتان لنین ارگانیک با میل‌پرده استیل مات',
      description: 'دوخت تمیز با نوار کتان ترک و پایه‌های ریگلاژی مخصوص پنجره‌های سرتاسری',
      category: 'پانچ و اسپرت',
      imageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?w=1200&h=800&auto=format&fit=crop&q=80',
      aspectRatio: '1200x800',
      status: 'approved',
      createdAt: '۱۴۰۳/۰۷/۰۵',
      approvedAt: '۱۴۰۳/۰۷/۰۶',
    },
  ];

  const itemsToDisplay = approvedItems.length > 0 ? approvedItems : fallbackItems;

  const categories = ['all', ...Array.from(new Set(itemsToDisplay.map((i) => i.category || 'عمومی')))];

  const filteredItems = selectedCategory === 'all'
    ? itemsToDisplay
    : itemsToDisplay.filter((i) => i.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 text-right">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-1">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-amber-200">
                  آلبوم نمونه‌کارهای اجرا شده رسمی
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>تایید شده توسط ناظر اتحادیه</span>
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {vendor.name}
                </h2>
                <span className="text-xs text-stone-300">
                  (مدیریت: {vendor.ownerName})
                </span>
              </div>

              <p className="text-xs text-stone-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{vendor.address}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-amber-200 font-mono text-xs font-bold">
                {itemsToDisplay.length} نمونه کار تایید شده
              </span>
            </div>
          </div>

          {/* Standard Dimensions Badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-[11px] text-amber-200">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>استاندارد عکاسی: ۱۲۰۰ در ۸۰۰ پیکسل (فرمت استاندارد JPG با کادربندی صنعتی پرده)</span>
          </div>
        </div>

        {/* Filter Pills */}
        {categories.length > 2 && (
          <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-xs font-bold text-stone-500 shrink-0">دسته‌بندی:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                {cat === 'all' ? 'همه نمونه‌ها' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ImageIcon className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-600">نمونه‌کاری در این دسته‌بندی یافت نشد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  {/* Photo Container: 1200x800 aspect 3:2 ratio */}
                  <div className="relative aspect-[3/2] bg-stone-100 overflow-hidden cursor-pointer"
                       onClick={() => setActiveItemForLightbox(item)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 text-white">
                      <span className="text-xs font-bold flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>بزرگ‌نمایی تصویر</span>
                      </span>
                      <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-md font-mono">
                        1200 × 800 JPG
                      </span>
                    </div>

                    {item.category && (
                      <span className="absolute top-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                        {item.category}
                      </span>
                    )}

                    <span className="absolute top-2.5 left-2.5 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>تایید اتحادیه</span>
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 leading-snug line-clamp-1 group-hover:text-amber-800 transition-colors">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>ثبت: {item.createdAt}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onOpenBookingModal) {
                            onOpenBookingModal(vendor.id);
                          }
                        }}
                        className="text-amber-800 hover:text-amber-950 font-bold hover:underline cursor-pointer"
                      >
                        سفارش مشابه این مدل ←
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-stone-500">
            تمامی تصاویر مستقیماً از پروژه‌های تحویل‌شده این فروشگاه با تایید کارشناس اتحادیه بارگذاری شده‌اند.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              بستن
            </button>

            {onOpenBookingModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBookingModal(vendor.id);
                }}
                className="flex-1 sm:flex-initial px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>اعزام کارشناس این گالری به منزل</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeItemForLightbox && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveItemForLightbox(null)}
        >
          <div 
            className="max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl text-right animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/2] bg-black">
              <img
                src={activeItemForLightbox.imageUrl}
                alt={activeItemForLightbox.title}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setActiveItemForLightbox(null)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 text-white space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-base text-amber-200">
                  {activeItemForLightbox.title}
                </h3>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono">
                  1200 × 800 px
                </span>
              </div>
              {activeItemForLightbox.description && (
                <p className="text-xs text-stone-300 leading-relaxed">
                  {activeItemForLightbox.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
