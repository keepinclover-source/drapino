import React from 'react';
import { 
  Sparkles, 
  Ruler, 
  Store, 
  Repeat, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft,
  Calculator,
  Flame
} from 'lucide-react';
import { HERO_IMAGE_PATH, SWATCHES_IMAGE_PATH } from '../data/mockData';
import { SiteThemeSettings } from '../types';
import { useDeposit } from '../context/DepositContext';
import { formatDepositWords, formatDepositToman } from '../utils/deposit';

interface HeroSectionProps {
  onOpenBookingModal: () => void;
  onOpenEstimatorModal: () => void;
  onExploreCatalog: () => void;
  pendingBidsCount: number;
  themeSettings?: SiteThemeSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBookingModal,
  onOpenEstimatorModal,
  onExploreCatalog,
  pendingBidsCount,
  themeSettings,
}) => {
  const { deposit: cityDeposit, withDeposit } = useDeposit();
  const heroTitle = themeSettings?.heroTitle || 'به جای رفتن به بازار پرده، فروشگاه و کالیته‌ها را به خانه شما می‌آوریم';
  const heroSubtitle = themeSettings?.heroSubtitle || 'با دراپینو، دیگر نیازی به تحمل ترافیک و سردرگمی در راسته پرده‌فروشان نیست. درخواست خود را ثبت کنید؛ معتبرترین فروشگاه‌های پرده شهر برای اعزام به منزل شما رقابت می‌کنند.';
  const heroBadge = withDeposit(themeSettings?.heroBadge || 'سامانه نسل جدید خدمات پرده و دکوراسیون در محل');
  const heroImageUrl = themeSettings?.heroImageUrl || HERO_IMAGE_PATH;
  const depositFee = cityDeposit;

  return (
    <section className="relative overflow-hidden bg-stone-50 border-b border-stone-200 pt-8 pb-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column (Persian Right): Value Proposition & Copy */}
          <div className="lg:col-span-7 space-y-6 text-right">
            
            {/* Live activity indicator */}
            <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-900 bg-amber-100/80 border border-amber-300/60 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
              <span>{heroBadge}</span>
              <span className="text-stone-400">·</span>
              <span className="font-bold tabular-nums">{pendingBidsCount} سفارش فعال در منطقه</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.25] text-balance">
              {heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl font-normal">
              {heroSubtitle}
            </p>

            {/* Guarantee Notice Box */}
            <div className="p-4 bg-white rounded-xl border border-stone-200/90 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                <span>فرمول شفاف مالی و ضمانت رضایت {themeSettings?.siteName || 'دراپینو'}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-normal">
                مبلغ {depositFee.toLocaleString('fa-IR')} تومان بیعانه در زمان ثبت پرداخت می‌شود که <strong className="text-stone-900 font-semibold">۱۰۰٪ از فاکتور نهایی پرده کسر می‌گردد</strong>.
                اگر از کالیته یا قیمت فروشگاه اول راضی نبودید، <strong className="text-stone-900 font-semibold">یک فروشگاه دیگر بدون پرداخت مجدد هزینه</strong> جهت مقایسه اعزام خواهد شد.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onOpenBookingModal}
                className="flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                <span>رزرو مشاوره و اعزام فروشگاه به خانه</span>
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onClick={onOpenEstimatorModal}
                className="flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition-colors shadow-xs"
              >
                <Calculator className="w-4 h-4 text-amber-700" />
                <span>استعلام قیمت هوشمند</span>
              </button>
            </div>

            {/* Social Proof & Metrics Adjacency */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center gap-6 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>بیش از ۱,۴۰۰ خانه اندازه‌گیری شده</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>۳۵ فروشگاه و پرده‌سرای دارای جواز کسب</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تضمین سلامت دوخت و نصب استاندارد</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Asset Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200/80 bg-stone-100 aspect-[4/3] lg:aspect-[3/3]">
              <img
                src={heroImageUrl}
                alt="پرو و اندازه‌گیری پرده در منزل مسکونی مدرن"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
              
              {/* Overlaid Card Info */}
              <div className="absolute bottom-4 right-4 left-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-white/60 shadow-lg text-right">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-amber-800">کالیته زنده در محیط خانه</span>
                  <span className="text-[11px] text-stone-500 font-medium tabular-nums">نور طبیعی پنجره</span>
                </div>
                <p className="text-xs text-stone-700 leading-snug">
                  دیدن بافت مخمل، حریر و کتان زیر نور واقعی اتاق نشیمن شما، نه زیر لامپ‌های مهتابی بازار!
                </p>
              </div>
            </div>

            {/* Decorative Swatch Badge */}
            <div className="hidden sm:flex absolute -top-4 -left-4 items-center gap-2 p-3 bg-stone-900 text-white rounded-xl shadow-lg border border-stone-800 text-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center font-bold">
                ۱۰+
              </div>
              <div>
                <p className="font-semibold">آلبوم همراه کارشناس</p>
                <p className="text-[11px] text-stone-400">انواع پارچه‌های ترک و ایرانی</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
