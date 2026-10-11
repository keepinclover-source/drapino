import { OperationalCity } from '../types';

/** بیعانه پیش‌فرض سراسری (تومان) — وقتی برای شهر مبلغ اختصاصی تعریف نشده باشد */
export const DEFAULT_DEPOSIT = 350000;

const toPersianDigits = (s: string) => s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

/** عدد با جداکننده هزارگان و ارقام فارسی، مثلاً ۳۵۰,۰۰۰ */
export const formatNumberFa = (n: number): string => toPersianDigits(Math.round(n).toLocaleString('en-US'));

/** «۳۵۰,۰۰۰ تومان» */
export const formatDepositToman = (n: number): string => `${formatNumberFa(n)} تومان`;

/** «۳۵۰ هزار تومان» (اگر مبلغ گرد هزار نبود یا بالای یک میلیون بود، عدد کامل) */
export const formatDepositWords = (n: number): string =>
  n > 0 && n < 1_000_000 && n % 1000 === 0 ? `${formatNumberFa(n / 1000)} هزار تومان` : formatDepositToman(n);

/**
 * مبلغ بیعانه یک شهر:
 * ۱) مبلغ اختصاصی خود شهر  ۲) مبلغ شهر قطبِ متصل (برای شهرهای اقماری)  ۳) پیش‌فرض سراسری
 */
export function resolveCityDeposit(
  cityName: string | undefined,
  cities: OperationalCity[],
  globalDefault: number = DEFAULT_DEPOSIT
): number {
  const valid = (v: unknown): v is number => typeof v === 'number' && isFinite(v) && v > 0;
  const fallback = valid(globalDefault) ? globalDefault : DEFAULT_DEPOSIT;
  if (!cityName) return fallback;
  const city = cities.find((c) => c.name === cityName);
  if (city && valid(city.depositAmount)) return city.depositAmount;
  if (city?.parentHubCityName) {
    const hub = cities.find((c) => c.name === city.parentHubCityName);
    if (hub && valid(hub.depositAmount)) return hub.depositAmount;
  }
  return fallback;
}

/**
 * متن‌های قابل‌ویرایش در پنل ادمین (مثل نوار بالای سایت) ممکن است عدد بیعانه را داخل خود داشته باشند.
 * این تابع هم نشانگر {deposit} و هم قالب‌های قدیمیِ «۳۵۰ هزار تومان / ۳۵۰,۰۰۰ تومان» را با مبلغ شهر جایگزین می‌کند.
 */
export function applyDepositToText(text: string, deposit: number): string {
  if (!text) return text;
  return text
    .replace(/\{deposit\}/gi, formatDepositWords(deposit))
    .replace(/۳۵۰\s*هزار\s*تومان(ی)?/g, (_m, y) => `${formatDepositWords(deposit)}${y || ''}`)
    .replace(/۳۵۰[,٬]۰۰۰\s*تومان(ی)?/g, (_m, y) => `${formatDepositToman(deposit)}${y || ''}`);
}
