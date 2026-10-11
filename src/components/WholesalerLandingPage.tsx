import React from 'react';
import { 
  Building2, 
  Package, 
  Truck, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  ArrowLeft, 
  Layers, 
  Sparkles, 
  Coins, 
  Factory,
  Store,
  Scale
} from 'lucide-react';
import { SiteThemeSettings } from '../types';

interface WholesalerLandingPageProps {
  onOpenWholesalerRegister: () => void;
  onOpenWholesalerLogin: () => void;
  themeSettings?: SiteThemeSettings;
}

export const WholesalerLandingPage: React.FC<WholesalerLandingPageProps> = ({
  onOpenWholesalerRegister,
  onOpenWholesalerLogin,
  themeSettings,
}) => {
  return (
    <div className="space-y-16 py-8 animate-in fade-in duration-300 text-right">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 p-8 sm:p-12 lg:p-16 border border-stone-800 shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>شبکه اختصاصی بنکداران و تامین‌کنندگان عمده پارچه {themeSettings?.siteName || 'دراپینو'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-snug">
            طاقه‌های پارچه و ملزومات انبار خود را به{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200">
              صدها پرده‌سرای معتبر سراسر کشور
            </span>{' '}
            عرضه کنید
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            پلتفرم ملی بنکداری «دراپینو»، پلی مستقیم میان واردکنندگان، نساجان و بنکداران بازار بزرگ با شبکه‌ای گسترده از فروشگاه‌های مجری و کارشناسان دکوراسیون در تمام استان‌ها.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenWholesalerRegister}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black rounded-2xl text-sm transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Package className="w-5 h-5" />
              <span>ثبت‌نام بنکدار و تامین‌کننده عمده</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenWholesalerLogin}
              className="w-full sm:w-auto px-6 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-2xl text-sm transition-all border border-stone-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ورود به پنل بنکدار</span>
            </button>
          </div>

          {/* Wholesaler Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-stone-800/80 text-center">
            <div>
              <span className="block text-2xl font-black text-amber-400 font-mono">۵۰۰+</span>
              <span className="text-[11px] text-stone-400">فروشگاه فعال خریدار طاقه</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-white font-mono">۱۰۰٪</span>
              <span className="text-[11px] text-stone-400">تسویه تضمین‌شده و امن</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-amber-400 font-mono">۰٪</span>
              <span className="text-[11px] text-stone-400">ریسک سوخت مطالبات و چک برگشتی</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-white font-mono">۲۴ ساعته</span>
              <span className="text-[11px] text-stone-400">دریافت استعلام سفارشات عمده</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Wholesaler Unique Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
            مزایای عضویت در رسته بنکداران دراپینو
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            طراحی شده با درک دقیق نیازهای بنکداران سرای مولوی، بازار بزرگ، جاده مخصوص و واردکنندگان طاقه
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-300 transition-all shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900">فروش فقط طاقه‌ای و عمده</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              شما خرده‌فروشی نمی‌کنید! در پنل بنکدار، حداقل سفارش بر مبنای طاقه (مثلا حداقل ۱ یا ۲ طاقه ۵۰ یا ۶۰ متری) تعیین می‌شود و صرفاً فروشگاه‌های تاییدشده قادر به ثبت سفارش هستند.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-300 transition-all shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900">حذف چک برگشتی و ریسک وصول</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              پرداخت فروشگاه‌ها از طریق درگاه امن پلتفرم انجام می‌گردد و وجه سفارش قبل از ارسال در حساب تضمینی مسدود می‌شود تا هیچ‌گونه ریسک عدم وصول نداشته باشید.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-300 transition-all shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900">پنل مستقل و اختصاصی بنکدار</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              کارتابل بنکدار کاملاً جداگانه از پنل فروشگاه و مشتری است («همه چیز قاطی نمی‌شود»). ثبت کدهای پارچه، تعیین متراژ طاقه، استعلام قیمت، وضعیت انبار و بارگیری اختصاصی است.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-300 transition-all shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900">شبکه توزیع در تمام شهرها</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              پارچه‌های انبار شما علاوه بر تهران، به فروشگاه‌های فعال در مشهد، کرج، اصفهان، شیراز، تبریز و شهرهای اقماری معرفی شده و حجم فروش شما به شکل چشمگیری افزایش می‌یابد.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-300 transition-all shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900">هماهنگی باربری و بارنامه آسان</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              امکان ثبت شماره بارنامه، بیجک انبار و مشخصات باربری مستقیماً در کارتابل با ارسال پیامک خودکار کد رهگیری برای فروشگاه سفارش‌دهنده فراهم است.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-300 transition-all shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900">نظارت اتحادیه بنکداران و نساجی</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              تمامی معاملات و استعلام‌ها تحت نظارت اتحادیه صنف بوده و ضمانت کیفیت کالیته و اصالت کالا بر مبنای قراردادهای شفاف استاندارد تنظیم می‌گردد.
            </p>
          </div>

        </div>
      </section>

      {/* 3. Steps for Wholesalers */}
      <section className="bg-stone-100 py-12 rounded-3xl mx-4 sm:mx-6 lg:mx-8 p-6 sm:p-10 border border-stone-200">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-stone-900">مراحل راه‌اندازی میز کار بنکداری</h2>
            <p className="text-xs sm:text-sm text-stone-600">در ۳ مرحله ساده طاقه‌های انبار خود را فعال کنید</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-amber-700 text-white font-bold text-sm flex items-center justify-center mx-auto">
                ۱
              </div>
              <h4 className="font-bold text-sm text-stone-900">ثبت‌نام و مشخصات انبار</h4>
              <p className="text-xs text-stone-500">
                درج نام بنکداری، پروانه یا جواز، آدرس انبار مرکزی و دسته‌های پارچه (مخمل، حریر، زبرا، کتان)
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-amber-700 text-white font-bold text-sm flex items-center justify-center mx-auto">
                ۲
              </div>
              <h4 className="font-bold text-sm text-stone-900">تعریف طاقه‌ها و قیمت عمده</h4>
              <p className="text-xs text-stone-500">
                بارگذاری عکس، کد پارچه، متراژ هر طاقه، قیمت هر متر و حداقل طاقه مجاز برای فروشگاه‌ها
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-amber-700 text-white font-bold text-sm flex items-center justify-center mx-auto">
                ۳
              </div>
              <h4 className="font-bold text-sm text-stone-900">دریافت سفارش و بارگیری</h4>
              <p className="text-xs text-stone-500">
                تایید سفارشات همکاران، هماهنگی ارسال از انبار به باربری و تسویه خودکار وجه در حساب شبا
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={onOpenWholesalerRegister}
              className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>ثبت‌نام بنکداری و دریافت پنل اختصاصی</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Supported Wholesale Categories */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <h2 className="text-xl font-black text-stone-900 text-center">دسته‌بندی‌های فعال در بستر بنکداری دراپینو</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 bg-white rounded-2xl border border-stone-200 font-bold text-xs text-stone-800 shadow-2xs">
            طاقه‌های مخمل (کالیفرنیا، شانل، پتینه)
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-200 font-bold text-xs text-stone-800 shadow-2xs">
            طاقه‌های حریر و تور (کرپ، الگانت، شاین)
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-200 font-bold text-xs text-stone-800 shadow-2xs">
            طاقه‌های سیستم زبرا، شید و دو مکانیزم
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-200 font-bold text-xs text-stone-800 shadow-2xs">
            طاقه‌های کتان، لنین و بافت گونی
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-200 font-bold text-xs text-stone-800 shadow-2xs">
            ریل‌های اتوماتیک و برقی هوشمند
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-200 font-bold text-xs text-stone-800 shadow-2xs">
            اکسسوری، نوار پرده، سرب و یراق‌آلات
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-200 font-bold text-xs text-stone-800 shadow-2xs">
            آستری تابیده و بلک‌اوت (ضد نور)
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-200 font-bold text-xs text-stone-800 shadow-2xs">
            پارچه‌های ژاکارد و گل برجسته ترک
          </div>
        </div>
      </section>

    </div>
  );
};
