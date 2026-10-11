import React from 'react';
import { 
  Store, 
  ShieldCheck, 
  MapPin, 
  TrendingUp, 
  Coins, 
  Calculator, 
  Users, 
  CheckCircle2, 
  ArrowLeft, 
  PhoneCall, 
  Award, 
  Sparkles,
  HelpCircle,
  FileCheck,
  ChevronLeft,
  Building2,
  Receipt
} from 'lucide-react';
import { OperationalCity, SiteThemeSettings } from '../types';
import { useDeposit } from '../context/DepositContext';
import { formatDepositWords, formatDepositToman } from '../utils/deposit';

interface VendorLandingPageProps {
  onOpenVendorRegister: () => void;
  onOpenVendorLogin: () => void;
  operationalCities?: OperationalCity[];
  themeSettings?: SiteThemeSettings;
}

export const VendorLandingPage: React.FC<VendorLandingPageProps> = ({
  onOpenVendorRegister,
  onOpenVendorLogin,
  operationalCities = [],
  themeSettings,
}) => {
  const { deposit } = useDeposit();
  return (
    <div className="space-y-16 py-8 animate-in fade-in duration-300 text-right">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 p-8 sm:p-12 lg:p-16 border border-stone-800 shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>پیوستن به شبکه رسمی همکاران {themeSettings?.siteName || 'دراپینو'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-snug">
            ویترین فروشگاهتان را به خانه مشتریان ببرید،{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              سفارشات قطعی منطقه خود را شکار کنید
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            دیگر نیازی به پرداخت اجاره‌های سنگین مغازه در بازار یا پاساژها و بازاریابی‌های پرهزینه نیست. روزانه ده‌ها مشتری در محله و شهر شما درخواست ویزیت، پرو کالیته ثبت می‌کنند.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenVendorRegister}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black rounded-2xl text-sm transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Store className="w-5 h-5" />
              <span>ثبت‌نام فروشگاه</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenVendorLogin}
              className="w-full sm:w-auto px-6 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-2xl text-sm transition-all border border-stone-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ورود به پنل فروشندگان</span>
            </button>
          </div>

          {/* Key Trust Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-stone-800/80 text-center">
            <div>
              <span className="block text-2xl font-black text-amber-400 font-mono">{formatDepositToman(deposit).replace(' تومان', '')}</span>
              <span className="text-[11px] text-stone-400">تومان بیعانه تضمینی مشتری</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-white font-mono">۱۰۰٪</span>
              <span className="text-[11px] text-stone-400">تحت نظارت اتحادیه صنف پرده</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-amber-400 font-mono">۴۵+</span>
              <span className="text-[11px] text-stone-400">سفارش فعال روزانه در هر منطقه</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-white font-mono">۰ تومان</span>
              <span className="text-[11px] text-stone-400">هزینه اولیه ثبت‌نام و عضویت</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Why Partner With Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
            چرا برترین فروشگاه‌های کشور در دراپینو فعال هستند؟
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            مزایای منحصربه‌فرد برای همکارانی که به کیفیت کار و تعهد به مشتری پایبند هستند
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-300 transition-all shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900">بیعانه نقدی مشتری قبل از اعزام</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              مشتری قبل از ثبت درخواست، مبلغ {formatDepositWords(deposit)} بیعانه واریز می‌کند؛ بنابراین هیچ اعزام فیک یا کنسل‌شده‌ای نخواهید داشت و فقط به خانه مشتریان واقعی و خریدار مراجعه می‌کنید.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-300 transition-all shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900">تابلوی شکار سفارشات در منطقه اختصاصی</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              سفارشات بر اساس شهر، منطقه و حومه‌هایی که خودتان تعیین کرده‌اید فیلتر می‌شوند. سفارشات نزدیک به فروشگاه خود را با یک کلیک قبول کرده و اعزام می‌شوید.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-300 transition-all shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900">صدور فاکتور دیجیتال رسمی</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              در حضور مشتری پس از اندازه‌گیری متراژ، هزینه‌ها و تخفیف‌ها را وارد کنید و فاکتور رسمی با فرمت مصوب اتحادیه برای مشتری ارسال و تایید آنلاین بگیرید.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-300 transition-all shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900">تامین مستقیم از بنکداران</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              فروشگاه‌های عضو سامانه می‌توانند اقلام مورد نیاز را با قیمت دست اول از بنکداران معتبر سامانه استعلام گرفته و نقدی یا اعتباری تامین کنند.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-300 transition-all shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900">حل اختلاف با کمیسیون بازرسی اتحادیه</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              در صورت بروز هرگونه ابهام با مشتری، کمیسیون بازرسی اتحادیه صنف پرده‌فروشان داور رسمی بوده و از حقوق قانونی و دستمزد فروشگاه محافظت می‌کند.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-300 transition-all shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900">نمایش نمونه‌کارها در صفحه اول</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              پرتفولیو و آلبوم نمونه‌کارهای اجرا شده شما در شهرتان برای هزاران بازدیدکننده به نمایش گذاشته شده و سفارشات مستقیم اختصاصی دریافت می‌کنید.
            </p>
          </div>

        </div>
      </section>

      {/* 3. Steps to Join */}
      <section className="bg-stone-100 py-12 rounded-3xl mx-4 sm:mx-6 lg:mx-8 p-6 sm:p-10 border border-stone-200">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-stone-900">مراحل آغاز همکاری و شروع دریافت سفارشات</h2>
            <p className="text-xs sm:text-sm text-stone-600">فرایند ساده و ۴ مرحله‌ای برای تایید پروانه و شروع فعالیت</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center mx-auto">
                ۱
              </div>
              <h4 className="font-bold text-xs text-stone-900">ثبت اطلاعات آنلاین</h4>
              <p className="text-[11px] text-stone-500">تکمیل فرم ثبت‌نام و انتخاب شهر و محله‌های پوشش</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center mx-auto">
                ۲
              </div>
              <h4 className="font-bold text-xs text-stone-900">احراز هویت و پروانه</h4>
              <p className="text-[11px] text-stone-500">بررسی پروانه کسب و صلاحیت فنی توسط بازرسان</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center mx-auto">
                ۳
              </div>
              <h4 className="font-bold text-xs text-stone-900">دسترسی به کارتابل</h4>
              <p className="text-[11px] text-stone-500">فعال‌سازی پنل و دسترسی به تابلوی شکار سفارشات</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center mx-auto">
                ۴
              </div>
              <h4 className="font-bold text-xs text-stone-900">اعزام و تسویه</h4>
              <p className="text-[11px] text-stone-500">پرو در منزل، متراژ لیزری، دوخت، نصب و تسویه کامل</p>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={onOpenVendorRegister}
              className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>همین حالا فروشگاه خود را ثبت کنید</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        <h2 className="text-xl font-black text-stone-900 text-center mb-6">پرسش‌های متداول همکاران فروشگاه</h2>
        
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-xs text-stone-900">آیا ثبت‌نام در سامانه هزینه دارد؟</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              خیر، ثبت‌نام، ایجاد پروفایل و معرفی اولیه فروشگاه کاملاً رایگان است. تنها پس از تایید نهایی سفارش توسط مشتری و صدور فاکتور، کارمزد مصوب پلتفرم کسر می‌گردد.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-xs text-stone-900">اگر مشتری پس از ویزیت خرید نکند تکلیف هزینه چیست؟</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              به علت اینکه مشتری مبلغ {formatDepositWords(deposit)} بیعانه پرداخت نموده، یقیناً قصد خرید دارد؛ اما در صورتی که خرید نکند، این حق طبیعی مشتری است که از خرید خود انصراف دهد.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-xs text-stone-900">اگر مشتری در زمان مراجعه در منزل نبود چه می‌شود؟</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              در صورتی که مشتری در زمان مقرر که از قبل هماهنگ شده در منزل نبود و یا تلفن خود را پاسخگو نبود، طبق روال دراپینو عمل نمایید تا ۵۰ درصد مبلغ بیعانه و همچنین هزینه شکار سفارش به کیف پول شما عودت شود.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-xs text-stone-900">آیا امکان انتخاب شهرهای اقماری و حومه وجود دارد؟</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              بله، در فرم ثبت‌نام می‌توانید علاوه بر شهر اصلی، شهرهای اقماری تحت پوشش (نظیر پردیس، پرند، شهریار، فردیس، طرقبه و ...) را مشخص نمایید تا سفارشات آن مناطق نیز در تابلوی شما نمایش داده شود.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
