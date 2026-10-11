/**
 * دسترسی امن به localStorage
 * - اگر حافظه مرورگر در دسترس نباشد (حالت خصوصی، محدودیت iframe و ...) یا JSON خراب باشد، برنامه از کار نمی‌افتد.
 * - اگر حجم ذخیره‌سازی پر شود (QuotaExceededError) خطا بلعیده می‌شود و فقط در کنسول هشدار می‌دهد.
 * - مسیر قدیمی تصاویر (/src/assets/images/) به مسیر جدید (/images/) مهاجرت داده می‌شود.
 * - ری‌برند: «اتو پرده» در داده‌های ذخیره‌شده‌ی قبلی به «دراپینو» تبدیل می‌شود.
 */

import { queueServerPush } from './serverSync';

// (به‌صورت الحاقی نوشته شده تا جایگزینی‌های گروهی مسیر، آن را تغییر ندهند)
const LEGACY_IMAGE_PREFIX = '/src/' + 'assets/images/';
const IMAGE_PREFIX = '/images/';

/** ری‌برند: «اتو پرده» در داده‌های ذخیره‌شده‌ی قبلی (دیتابیس یا مرورگر) به «دراپینو» تبدیل می‌شود */
const OLD_BRAND_RE = /اتو[\u200c\u200f ]*پرده/g;
const NEW_BRAND = 'دراپینو';

function migrateRaw(raw: string): string {
  return raw.split(LEGACY_IMAGE_PREFIX).join(IMAGE_PREFIX).replace(OLD_BRAND_RE, NEW_BRAND);
}

export function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(migrateRaw(raw)) as T;
  } catch (err) {
    console.warn(`[storage] خواندن «${key}» ناموفق بود؛ از مقدار پیش‌فرض استفاده شد.`, err);
    return fallback;
  }
}

export function saveStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage] ذخیره «${key}» ناموفق بود (احتمالاً پر شدن حافظه مرورگر).`, err);
  }
  // ذخیره در دیتابیس سرور (در صورت در دسترس بودن)
  queueServerPush(key, value);
}

export function removeStored(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function getStoredString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStoredString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/** تاریخ شمسی (YYYY/MM/DD با ارقام فارسی) برای «امروز + n روز» */
export function jalaliDateAfterDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
