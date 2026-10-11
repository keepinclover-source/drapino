import React from 'react';
import { CustomPage, SiteThemeSettings } from '../types';
import { FileText, ArrowRight, Calendar, Clock, Share2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useDeposit } from '../context/DepositContext';
import { formatDepositWords, formatDepositToman } from '../utils/deposit';

interface CustomPageViewProps {
  page: CustomPage;
  themeSettings: SiteThemeSettings;
  onBackToHome: () => void;
  onOpenBookingModal: () => void;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({
  page,
  themeSettings,
  onBackToHome,
  onOpenBookingModal,
}) => {
  const { deposit } = useDeposit();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-right animate-in fade-in duration-200">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-amber-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به صفحه اصلی</span>
        </button>

        <span className="text-[11px] font-mono text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
          /{page.slug}
        </span>
      </div>

      {/* Main Content Card */}
      <article className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-6 sm:p-10 space-y-8">
        
        {/* Header */}
        <header className="space-y-4 border-b border-stone-100 pb-6">
          <div className="flex items-center gap-2 text-xs text-amber-800 font-bold">
            <FileText className="w-4 h-4" />
            <span>صفحه رسمی سامانه {themeSettings.siteName}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-snug">
            {page.title}
          </h1>

          {page.metaDescription && (
            <p className="text-sm text-stone-500 leading-relaxed">
              {page.metaDescription}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>آخرین به‌روزرسانی: {page.updatedAt}</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مورد تایید مدیریت و اتحادیه</span>
            </span>
          </div>
        </header>

        {/* Article Body */}
        <div className="text-stone-700 text-sm leading-8 whitespace-pre-line space-y-4">
          {page.content}
        </div>

        {/* CTA Box */}
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div>
            <h4 className="text-base font-bold text-stone-900 mb-1">
              هنوز کالیته‌ها را در منزل خود تست نکرده‌اید؟
            </h4>
            <p className="text-xs text-stone-500">
              با پرداخت بیعانه {formatDepositWords(deposit)}ی (قابل کسر از فاکتور)، بازار پرده را به خانه بیاورید.
            </p>
          </div>
          <button
            onClick={onOpenBookingModal}
            className="w-full sm:w-auto px-6 py-3 bg-amber-700 hover:bg-amber-800 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            ثبت درخواست پرو کالیته در منزل
          </button>
        </div>

      </article>

    </div>
  );
};
