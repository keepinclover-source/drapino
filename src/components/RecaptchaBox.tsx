import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha?: any;
    __drapinoRecaptchaReady?: () => void;
  }
}

/**
 * کلید روشن/خاموش reCAPTCHA در فرم ثبت‌نام.
 * فعلاً false است تا بتوان ثبت‌نام را بدون تأیید امنیتی آزمایش کرد.
 * برای فعال‌کردن دوباره، فقط مقدار را true کنید (و کلیدهای VITE_RECAPTCHA_SITE_KEY و RECAPTCHA_SECRET_KEY را تنظیم کنید).
 */
export const RECAPTCHA_ENABLED = false;

/** کلید سایت reCAPTCHA v2 (چک‌باکس) — در فایل .env.local با نام VITE_RECAPTCHA_SITE_KEY تنظیم می‌شود. */
export const RECAPTCHA_SITE_KEY: string = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY || '';

let scriptPromise: Promise<void> | null = null;

const loadRecaptchaScript = (): Promise<void> => {
  if (window.grecaptcha?.render) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    window.__drapinoRecaptchaReady = () => resolve();
    const s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?onload=__drapinoRecaptchaReady&render=explicit&hl=fa';
    s.async = true;
    s.defer = true;
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error('recaptcha-load-failed'));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
};

interface RecaptchaBoxProps {
  /** توکن معتبر را برمی‌گرداند؛ در صورت انقضا یا خطا null */
  onChange: (token: string | null) => void;
  /** با تغییر این عدد، ویجت ریست می‌شود (مثلاً بعد از ثبت‌نام ناموفق) */
  resetSignal?: number;
}

export const RecaptchaBox: React.FC<RecaptchaBoxProps> = ({ onChange, resetSignal = 0 }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    let cancelled = false;
    setLoadError(false);

    loadRecaptchaScript()
      .then(() => {
        if (cancelled || !hostRef.current || widgetIdRef.current !== null) return;
        widgetIdRef.current = window.grecaptcha.render(hostRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token: string) => onChangeRef.current(token),
          'expired-callback': () => onChangeRef.current(null),
          'error-callback': () => onChangeRef.current(null),
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      widgetIdRef.current = null;
      // جلوگیری از خطای «قبلاً در این المان رندر شده» هنگام رندر مجدد
      if (hostRef.current) hostRef.current.innerHTML = '';
    };
  }, [attempt]);

  useEffect(() => {
    if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
      } catch {
        /* ignore */
      }
      onChangeRef.current(null);
    }
  }, [resetSignal]);

  if (!RECAPTCHA_SITE_KEY) {
    return (
      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700 leading-relaxed flex gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          کلید reCAPTCHA تنظیم نشده است و ثبت‌نام فعلاً امکان‌پذیر نیست. مدیر سامانه باید مقدار{' '}
          <code dir="ltr" className="font-mono">VITE_RECAPTCHA_SITE_KEY</code> را در فایل <code dir="ltr" className="font-mono">.env.local</code> قرار دهد.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <div ref={hostRef} dir="ltr" className="inline-block" data-testid="recaptcha-host" />
      </div>
      {loadError && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between gap-2">
          <span>بارگذاری reCAPTCHA انجام نشد. اتصال اینترنت (یا فیلترشکن) را بررسی کنید.</span>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="px-2 py-1 bg-white border border-amber-300 rounded-lg font-bold cursor-pointer"
          >
            تلاش دوباره
          </button>
        </div>
      )}
    </div>
  );
};
