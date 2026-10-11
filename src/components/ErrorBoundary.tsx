import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * جلوگیری از «صفحه سفید»: اگر هر بخش از برنامه هنگام رندر خطا بدهد،
 * به‌جای از بین رفتن کل صفحه، پیام و دکمه‌های بازیابی نمایش داده می‌شود.
 */
export class ErrorBoundary extends React.Component<{ children?: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-stone-50 p-6 text-right">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl shadow-lg p-6 space-y-4">
          <h1 className="text-lg font-black text-stone-900">مشکلی در نمایش صفحه پیش آمد</h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            متأسفیم، خطای غیرمنتظره‌ای رخ داد. معمولاً با بارگذاری دوباره‌ی صفحه حل می‌شود.
          </p>
          <pre dir="ltr" className="text-[11px] text-left bg-stone-100 rounded-lg p-2 overflow-x-auto text-stone-500 whitespace-pre-wrap">
            {this.state.message}
          </pre>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-xl cursor-pointer"
            >
              بارگذاری دوباره
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  Object.keys(localStorage)
                    .filter((k) => k.startsWith('autopardeh_'))
                    .forEach((k) => localStorage.removeItem(k));
                } catch {
                  /* ignore */
                }
                window.location.reload();
              }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-semibold rounded-xl border border-stone-200 cursor-pointer"
            >
              بازنشانی داده‌های ذخیره‌شده و شروع مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }
}
