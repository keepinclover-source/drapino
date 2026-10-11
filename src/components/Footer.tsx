import React, { useRef } from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Heart, Store } from 'lucide-react';
import { APP_VERSION } from '../utils/appInfo';
import { SiteThemeSettings, CustomPage } from '../types';

interface FooterProps {
  onOpenBookingModal: () => void;
  onOpenEstimatorModal: () => void;
  onNavigateTab: (tab: string) => void;
  themeSettings?: SiteThemeSettings;
  customPages?: CustomPage[];
  onSelectCustomPage?: (page: CustomPage) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBookingModal,
  onOpenEstimatorModal,
  onNavigateTab,
  themeSettings,
  customPages = [],
  onSelectCustomPage,
}) => {
  const footerPages = customPages.filter((p) => p.published && p.showInFooterNav);
  const footerRef = useRef<HTMLElement>(null);

  // رفتن به بالای صفحه (هم window و هم کانتینرهای اسکرول‌دار، مثل شبیه‌ساز موبایل)
  const scrollToTop = () => {
    let el: HTMLElement | null = footerRef.current?.parentElement ?? null;
    while (el) {
      if (el.scrollHeight > el.clientHeight) {
        const overflowY = getComputedStyle(el).overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') el.scrollTo({ top: 0 });
      }
      el = el.parentElement;
    }
    window.scrollTo({ top: 0 });
  };

  const navigate = (tab: string) => {
    onNavigateTab(tab);
    scrollToTop();
  };

  return (
    <footer ref={footerRef} className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              {themeSettings?.logoUrl ? (
                <img src={themeSettings.logoUrl} alt={themeSettings?.siteName || 'دراپینو'} data-testid="footer-logo" className="h-9 max-w-[9rem] object-contain" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-base">
                  {(themeSettings?.siteName || 'دراپینو').slice(0, 2)}
                </div>
              )}
              <span className={`text-xl font-black text-white tracking-tight ${themeSettings?.logoUrl && themeSettings?.logoShowName === false ? 'hidden' : ''}`}>
                سامانه {themeSettings?.siteName || 'دراپینو'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              {themeSettings?.footerAboutText || themeSettings?.heroSubtitle || 'به جای اینکه تا بازار شلوغ پرده بروید، ما ویترین فروشگاه، نمونه پارچه‌ها، آلبوم‌های کالیته و کارشناس اندازه‌گیری را به خانه شما می‌آوریم تا با خیال راحت در نور طبیعی منزلتان انتخاب کنید.'}
            </p>
            
            {/* Official Union Inspection Notice in Footer */}
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 text-xs text-amber-300/90 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>نظارت رسمی اتحادیه و کمیسیون بازرسی:</span>
              </div>
              <p className="text-[11px] text-stone-300">
                {themeSettings?.footerUnionNotice || 'فعالیت فروشندگان این سامانه تحت نظارت مستقیم اتحادیه صنف تزئینات ساختمانی در هر استان است.'}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider">دسترسی سریع</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => navigate('home')} className="hover:text-white transition-colors cursor-pointer">
                  صفحه اصلی
                </button>
              </li>
              <li>
                <button onClick={onOpenBookingModal} className="hover:text-white transition-colors cursor-pointer">
                  ثبت درخواست ویزیت در خانه
                </button>
              </li>
              <li>
                <button onClick={onOpenEstimatorModal} className="hover:text-white transition-colors cursor-pointer">
                  استعلام قیمت هوشمند
                </button>
              </li>
              <li>
                <button onClick={() => navigate('catalog')} className="hover:text-white transition-colors cursor-pointer">
                  کالیته‌ها و سبک‌های پرده
                </button>
              </li>
              <li>
                <button onClick={() => navigate('blog')} className="hover:text-white transition-colors cursor-pointer">
                  مجله تخصصی و مقالات
                </button>
              </li>
              <li>
                <button onClick={() => navigate('feedback')} className="hover:text-white transition-colors cursor-pointer">
                  پیشنهاد، گزارش ایراد و فهرست رفع خطاها
                </button>
              </li>
            </ul>
          </div>

          {/* B2B Partners & Wholesalers Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-500" />
              <span>فرصت‌های شغلی و درآمدزایی</span>
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button 
                  onClick={() => navigate('vendor-landing')} 
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1 text-right"
                >
                  <span>ثبت‌نام فروشندگان</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('wholesaler-landing')} 
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1 text-right"
                >
                  <span>ثبت‌نام عمده‌فروشان</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('careers')} 
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1 text-right"
                  data-testid="footer-careers"
                >
                  <span>استخدام در دراپینو</span>
                </button>
              </li>
            </ul>

            {/* اطلاعات و راهنما */}
            <h4 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5 pt-4">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>اطلاعات و راهنما</span>
            </h4>
            <ul className="space-y-2 text-xs text-stone-400" data-testid="footer-info-menu">
              <li>
                <button onClick={() => navigate('privacy')} data-testid="footer-privacy" className="hover:text-white transition-colors cursor-pointer text-right">
                  حریم خصوصی
                </button>
              </li>
              <li>
                <button onClick={() => navigate('customer-terms')} className="hover:text-white transition-colors cursor-pointer text-right">
                  قوانین و مقررات مشتریان
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider">پشتیبانی و ارتباط</h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono tabular-nums">{themeSettings?.footerPhone || themeSettings?.supportPhone || '۰۲۱-۸۸۲۱۴۵۶۷'}</span>
              </div>
              {themeSettings?.footerEmergencyPhone && (
                <div className="flex items-center gap-2 text-amber-400/90 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>خط اضطراری اتحادیه: </span>
                  <span className="font-mono tabular-nums">{themeSettings.footerEmergencyPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono">{themeSettings?.supportEmail || 'support@drapino.ir'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{themeSettings?.footerAddress || 'تهران، میدان ونک، برج نگار، طبقه ۶'}</span>
              </div>
              {themeSettings?.footerWorkingHours && (
                <div className="text-[11px] text-stone-400 pt-1">
                  <span>ساعات پاسخگویی: {themeSettings.footerWorkingHours}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().toLocaleDateString('fa-IR-u-ca-persian', { year: 'numeric' })} {themeSettings?.footerCopyright || `${themeSettings?.siteName || 'سامانه دراپینو'} - کلیه حقوق مادی و معنوی محفوظ است.`}</p>
          <p className="flex items-center gap-1">
            <span>طراحی شده برای آسایش دکوراسیون خانه‌های ایران</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
          <p className="font-mono text-[10px] text-stone-600" data-testid="app-version" dir="ltr">
            v{APP_VERSION}
          </p>
        </div>

      </div>
    </footer>
  );
};
