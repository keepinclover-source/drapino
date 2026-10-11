/** ابزارهای مشترک فاکتور رسمی: درجه پارچه، پیش‌پرداخت، شبا، تاریخ تحویل و نصب، متن تعهد تسویه */

export type FabricGrade = '1' | '1.5' | '2' | '3';

export const FABRIC_GRADES: { value: FabricGrade; label: string }[] = [
  { value: '1', label: 'درجه ۱' },
  { value: '1.5', label: 'درجه ۱.۵' },
  { value: '2', label: 'درجه ۲' },
  { value: '3', label: 'درجه ۳' },
];

export const PREPAYMENT_MIN_PERCENT = 60;
export const PREPAYMENT_MAX_PERCENT = 80;

const FA = '۰۱۲۳۴۵۶۷۸۹';
const AR = '٠١٢٣٤٥٦٧٨٩';

export function toEnDigits(input: string | number): string {
  return String(input ?? '')
    .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)));
}

export function toFaDigits(input: string | number): string {
  return String(input ?? '').replace(/[0-9]/g, (d) => FA[Number(d)]);
}

export function fabricGradeLabel(grade?: string): string {
  const found = FABRIC_GRADES.find((g) => g.value === grade);
  return found ? found.label : '—';
}

/** محدوده‌ی مجاز پیش‌پرداخت مشتری (۶۰ تا ۸۰ درصد مبلغ قابل پرداخت فاکتور) */
export function prepaymentRange(payable: number): { min: number; max: number } {
  const base = Math.max(0, payable || 0);
  return {
    min: Math.ceil((base * PREPAYMENT_MIN_PERCENT) / 100),
    max: Math.floor((base * PREPAYMENT_MAX_PERCENT) / 100),
  };
}

export function prepaymentPercent(amount: number, payable: number): number {
  if (!payable) return 0;
  return Math.round((amount / payable) * 1000) / 10;
}

/** حذف فاصله و خط تیره، تبدیل ارقام فارسی و حروف بزرگ */
export function normalizeSheba(value: string): string {
  return toEnDigits(value || '').replace(/[\s\-_]/g, '').toUpperCase();
}

/** قالب شبا: IR + ۲۴ رقم */
export function isValidSheba(value: string): boolean {
  return /^IR\d{24}$/.test(normalizeSheba(value));
}

export function formatSheba(value?: string): string {
  if (!value) return '';
  const n = normalizeSheba(value);
  return n.replace(/(.{4})/g, '$1 ').trim();
}

/** تاریخ شمسی به شکل ۱۴۰۵/۰۷/۲۰ (ارقام فارسی یا انگلیسی) */
export function isValidJalaliDate(value: string): boolean {
  const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(toEnDigits(value || '').trim());
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (y < 1300 || y > 1500 || mo < 1 || mo > 12 || d < 1) return false;
  return d <= (mo <= 6 ? 31 : 30);
}

export function normalizeJalaliDate(value: string): string {
  const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(toEnDigits(value || '').trim());
  if (!m) return value.trim();
  return toFaDigits(`${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')}`);
}

/** متن تعهد تسویه حساب که در پایین فاکتور درج می‌شود */
export function buildSettlementTerms(deliveryInstallDate: string, customerName: string): string {
  return (
    `نصب و تحویل منوط به تسویه حساب کامل ۴۸ الی ۲۴ ساعت قبل از موعد نصب (${deliveryInstallDate || '—'}) ` +
    `توسط مشتری (${customerName || '—'}) است. در صورت عدم پرداخت به‌موقع، فروشنده مشمول جریمه تأخیر تحویل و نصب نخواهد شد.`
  );
}
