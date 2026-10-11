import React from 'react';
import { ArrowRight, ScrollText } from 'lucide-react';
import { SiteThemeSettings } from '../types';

interface CustomerTermsPageProps {
  onBackToHome: () => void;
  themeSettings?: SiteThemeSettings;
}

/**
 * متن قوانین و مقررات مشتریان.
 * هر عنصر آرایه یک پاراگراف است؛ برای افزودن بند جدید فقط یک رشته به آرایه اضافه کنید.
 */
export const CUSTOMER_TERMS_PARAGRAPHS: string[] = [
  // متن قوانین و مقررات مشتریان در اینجا قرار می‌گیرد.
];

export const CustomerTermsPage: React.FC<CustomerTermsPageProps> = ({ onBackToHome, themeSettings }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-right animate-in fade-in duration-200">
      <div className="mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-amber-800 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به صفحه اصلی</span>
        </button>
      </div>

      <article className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 space-y-6">
        <header className="space-y-3 border-b border-stone-100 pb-6">
          <div className="flex items-center gap-2 text-xs text-amber-800 font-bold">
            <ScrollText className="w-4 h-4" />
            <span>صفحه رسمی سامانه {themeSettings?.siteName || 'دراپینو'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-snug">
            قوانین و مقررات مشتریان
          </h1>
        </header>

        <div className="space-y-4 text-sm text-stone-700 leading-8" data-testid="customer-terms-content">
          {CUSTOMER_TERMS_PARAGRAPHS.length > 0 ? (
            CUSTOMER_TERMS_PARAGRAPHS.map((para, i) => <p key={i}>{para}</p>)
          ) : (
            <p className="text-stone-400 text-center py-10">متن قوانین و مقررات به‌زودی در این صفحه قرار می‌گیرد.</p>
          )}
        </div>
      </article>
    </div>
  );
};
