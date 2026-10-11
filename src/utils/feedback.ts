/**
 * پیشنهادها، گزارش ایرادها و فهرست رفع خطاها
 * همه‌ی داده‌ها با کلیدهای autopardeh_feedback و autopardeh_changelog در دیتابیس ذخیره می‌شوند.
 */

export type FeedbackKind = 'suggestion' | 'bug';
export type FeedbackStatus = 'new' | 'reviewing' | 'planned' | 'in_progress' | 'fixed' | 'rejected';
export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ChangelogCategory = 'fix' | 'security' | 'improvement' | 'feature';

export interface FeedbackItem {
  id: string;
  code: string; // کد پیگیری مثل FB-1A2B3C
  kind: FeedbackKind;
  title: string;
  description: string;
  section: string;
  severity?: BugSeverity; // فقط برای گزارش ایراد
  stepsToReproduce?: string; // فقط برای گزارش ایراد
  environment?: string; // مرورگر، اندازه‌ی صفحه، صفحه‌ی فعال (به‌صورت خودکار)
  authorId: string;
  authorName: string;
  authorRole: 'customer' | 'vendor' | 'wholesaler' | 'admin' | 'guest';
  contact?: string; // فقط برای ادمین نمایش داده می‌شود
  createdAt: number;
  createdAtLabel: string;
  updatedAt: number;
  status: FeedbackStatus;
  adminReply?: string;
  adminReplyAt?: string;
  voters: string[]; // شناسه‌ی کاربرانی که این مورد را تأیید کرده‌اند
  changelogId?: string; // اگر در فهرست رفع‌شده‌ها ثبت شده باشد
}

export interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  category: ChangelogCategory;
  date: string; // شمسی
  version?: string;
  relatedFeedbackId?: string;
  isSystem?: boolean; // ردیف‌های پیش‌فرض برنامه
  createdAt: number;
}

export interface ChangelogStore {
  entries: ChangelogEntry[];
  /** ردیف‌های پیش‌فرضی که ادمین حذف کرده است (تا دوباره برنگردند) */
  deletedSeedIds: string[];
}

export const FEEDBACK_KIND_LABELS: Record<FeedbackKind, string> = {
  suggestion: 'پیشنهاد',
  bug: 'گزارش ایراد',
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'جدید',
  reviewing: 'در حال بررسی',
  planned: 'در برنامه',
  in_progress: 'در حال انجام',
  fixed: 'انجام / رفع شد',
  rejected: 'رد شد',
};

export const SEVERITY_LABELS: Record<BugSeverity, string> = {
  low: 'کم',
  medium: 'متوسط',
  high: 'زیاد',
  critical: 'بحرانی (برنامه کار نمی‌کند)',
};

export const CHANGELOG_CATEGORY_LABELS: Record<ChangelogCategory, string> = {
  fix: 'رفع خطا',
  security: 'امنیت و حریم خصوصی',
  improvement: 'بهبود',
  feature: 'قابلیت جدید',
};

export const FEEDBACK_SECTIONS = [
  'صفحه اصلی',
  'ثبت درخواست و رزرو مشاوره',
  'پنل مشتری',
  'پنل فروشگاه',
  'تابلوی شکار سفارشات',
  'بای‌باکس',
  'فاکتور',
  'کیف پول و پرداخت',
  'پنل مدیریت',
  'انتخاب شهر',
  'ظاهر و نمایش در موبایل',
  'سایر',
];

export function makeFeedbackCode(): string {
  return 'FB-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function faDate(ts = Date.now()): string {
  return new Date(ts).toLocaleDateString('fa-IR-u-ca-persian', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function faDateTime(ts = Date.now()): string {
  const d = new Date(ts);
  return `${faDate(ts)} - ${d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
}

export function collectEnvironment(activeTab?: string): string {
  try {
    const w = typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : '';
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    return `صفحه فعال: ${activeTab || '-'} | اندازه‌ی صفحه: ${w} | مرورگر: ${ua}`.slice(0, 400);
  } catch {
    return '';
  }
}

/** افزودن ردیف‌های پیش‌فرض جدید به فهرست ذخیره‌شده (بدون بازگرداندن موارد حذف‌شده) */
export function mergeChangelog(stored: Partial<ChangelogStore> | null | undefined): ChangelogStore {
  const entries = Array.isArray(stored?.entries) ? stored!.entries! : [];
  const deleted = Array.isArray(stored?.deletedSeedIds) ? stored!.deletedSeedIds! : [];
  const have = new Set(entries.map((e) => e.id));
  const missing = SEED_CHANGELOG.filter((s) => !have.has(s.id) && !deleted.includes(s.id));
  return { entries: [...entries, ...missing], deletedSeedIds: deleted };
}

/* ------------------------------------------------------------------ */
/* فهرست اولیه‌ی رفع خطاها و بهبودها (واقعاً انجام‌شده)                */
/* ------------------------------------------------------------------ */

const t = (iso: string) => new Date(iso).getTime();

export const SEED_CHANGELOG: ChangelogEntry[] = [
  {
    id: 'cl-seed-001',
    title: 'رفع سرریز افقی هدر در موبایل، تبلت و لپ‌تاپ',
    description:
      'دکمه‌های هدر از عرض صفحه بیرون می‌زدند و کل صفحه به چپ و راست جابه‌جا می‌شد. اکنون در همه‌ی اندازه‌ها جا می‌شوند؛ منوی افقی فقط در صفحه‌های بزرگ نمایش داده می‌شود و در بقیه، منوی همبرگری است.',
    category: 'fix',
    date: '۱۴۰۵/۰۷/۰۹',
    version: '1.0.1',
    isSystem: true,
    createdAt: t('2026-10-01T10:00:00Z'),
  },
  {
    id: 'cl-seed-002',
    title: 'رفع نمایش‌ندادن تصاویر پس از ساخت نسخه‌ی نهایی',
    description:
      'تصاویر با مسیر داخلی سورس ارجاع داده شده بودند و بعد از build دیده نمی‌شدند. تصاویر به پوشه‌ی عمومی منتقل شد و سه تصویر ناموجود در تنظیمات صفحه‌ی اصلی به تصاویر موجود وصل شد.',
    category: 'fix',
    date: '۱۴۰۵/۰۷/۰۹',
    version: '1.0.1',
    isSystem: true,
    createdAt: t('2026-10-01T10:05:00Z'),
  },
  {
    id: 'cl-seed-003',
    title: 'جلوگیری از صفحه‌ی سفید هنگام خرابی یا پر شدن حافظه‌ی مرورگر',
    description:
      'خواندن و نوشتن داده‌ها بدون محافظت بود و یک مقدار خراب باعث از کار افتادن کل برنامه می‌شد. اکنون خطاها مهار می‌شوند و برنامه با مقدار پیش‌فرض ادامه می‌دهد.',
    category: 'fix',
    date: '۱۴۰۵/۰۷/۰۹',
    version: '1.0.1',
    isSystem: true,
    createdAt: t('2026-10-01T10:10:00Z'),
  },
  {
    id: 'cl-seed-004',
    title: 'بستن دسترسی عمومی به فایل‌های پروژه و حذف رمز عبور از خروجی‌ها',
    description:
      'لینک «دانلود فایل‌ها و سورس پروژه» برای همه‌ی بازدیدکنندگان نمایش داده می‌شد و خروجی آن رمز عبور کاربران را شامل می‌شد. اکنون فقط برای مدیر نمایش داده می‌شود و رمزها در خروجی نیستند.',
    category: 'security',
    date: '۱۴۰۵/۰۷/۰۹',
    version: '1.0.1',
    isSystem: true,
    createdAt: t('2026-10-01T10:15:00Z'),
  },
  {
    id: 'cl-seed-005',
    title: 'اصلاح تاریخ انقضای کدهای تخفیف خودکار',
    description: 'کدهای تخفیف خودکار با تاریخ ثابت سال ۱۴۰۳ ساخته می‌شدند. اکنون تاریخ انقضا ۹۰ روز بعد از ساخت محاسبه می‌شود.',
    category: 'fix',
    date: '۱۴۰۵/۰۷/۰۹',
    version: '1.0.1',
    isSystem: true,
    createdAt: t('2026-10-01T10:20:00Z'),
  },
  {
    id: 'cl-seed-006',
    title: 'رفع خطای نصب بسته‌ها (تداخل نسخه‌ی esbuild)',
    description:
      'دستور npm install به‌دلیل تداخل نسخه‌ی esbuild با Vite خطای ERESOLVE می‌داد. وابستگی‌های بی‌استفاده حذف و تداخل برطرف شد.',
    category: 'fix',
    date: '۱۴۰۵/۰۷/۰۹',
    version: '1.0.2',
    isSystem: true,
    createdAt: t('2026-10-01T20:30:00Z'),
  },
  {
    id: 'cl-seed-007',
    title: 'فاکتور رسمی: درجه پارچه، تاریخ تحویل و نصب، پیش‌پرداخت، شبا و تعهد تسویه',
    description:
      'عبارت «پیش‌فاکتور» در همه‌جا به «فاکتور» تغییر کرد. در فاکتور اکنون درجه کیفی هر ردیف (۱، ۱.۵، ۲، ۳)، تاریخ تحویل و نصب، مبلغ پیش‌پرداخت مشتری (۶۰ تا ۸۰ درصد)، شماره‌ی شبای فروشنده و متن تعهد تسویه‌ی ۴۸ تا ۲۴ ساعت قبل از نصب درج می‌شود.',
    category: 'feature',
    date: '۱۴۰۵/۰۷/۱۰',
    version: '1.1.0',
    isSystem: true,
    createdAt: t('2026-10-02T07:10:00Z'),
  },
  {
    id: 'cl-seed-008',
    title: 'رفع کسر بیعانه‌ی ثابت ۳۵۰ هزار تومانی در فاکتور',
    description: 'مبلغ کسر بیعانه در فرم صدور فاکتور همیشه ۳۵۰٬۰۰۰ تومان بود. اکنون مبلغ واقعی بیعانه‌ی همان سفارش کسر می‌شود. ویرایش فاکتور هم مقادیر قبلی را بارگذاری می‌کند.',
    category: 'fix',
    date: '۱۴۰۵/۰۷/۱۰',
    version: '1.1.0',
    isSystem: true,
    createdAt: t('2026-10-02T07:12:00Z'),
  },
  {
    id: 'cl-seed-009',
    title: 'رفع صفحه‌ی سفید بعد از انتخاب شهر',
    description:
      'مودال انتخاب شهر هنگام بسته شدن باعث خطای React و حذف کل صفحه می‌شد و تا رفرش، چیزی نمایش داده نمی‌شد. همین مشکل در مودال‌های پروفایل کاربر، پروفایل فروشگاه، ثبت نظر، پشتیبانی و گالری نمونه‌پارچه هم برطرف شد.',
    category: 'fix',
    date: '۱۴۰۵/۰۷/۱۰',
    version: '1.1.1',
    isSystem: true,
    createdAt: t('2026-10-02T07:30:00Z'),
  },
  {
    id: 'cl-seed-010',
    title: 'افزودن محافظ خطا برای جلوگیری از صفحه‌ی سفید',
    description:
      'اگر در آینده بخشی از برنامه هنگام نمایش خطا بدهد، به‌جای صفحه‌ی سفید پیام و دکمه‌های «بارگذاری دوباره» و «بازنشانی داده‌ها» نمایش داده می‌شود.',
    category: 'improvement',
    date: '۱۴۰۵/۰۷/۱۰',
    version: '1.1.1',
    isSystem: true,
    createdAt: t('2026-10-02T07:35:00Z'),
  },
  {
    id: 'cl-seed-011',
    title: 'سیستم محدودیت‌ها و جریمه‌ها در پنل مدیریت',
    description:
      'محرومیت موقت فروشگاه از تابلوی شکار یا کل خدمات، جریمه‌ی تأخیر در تحویل و نصب (اعلام در فاکتور)، سقف ۳ سفارش اول فروشنده‌ی جدید، بافر اعتباری فروشنده، شرایط بای‌باکس (۷ روز و آگهی فعال)، و جریمه از کیف پول (عدم صدور فاکتور و جریمه‌ی ریالی) با ثبت در ریز تراکنش‌ها.',
    category: 'feature',
    date: '۱۴۰۵/۰۷/۱۱',
    version: '1.2.0',
    isSystem: true,
    createdAt: t('2026-10-03T05:50:00Z'),
  },
  {
    id: 'cl-seed-012',
    title: 'ذخیره‌ی همه‌ی داده‌های سایت در دیتابیس',
    description:
      'کاربران، سفارش‌ها، فاکتورها، فروشگاه‌ها، کیف پول، محدودیت‌ها، اعلان‌ها و پیام‌ها اکنون روی سرور ذخیره می‌شوند و در مرورگر یا دستگاه دیگر هم در دسترس‌اند. در صورت قطع بودن سرور، برنامه با حافظه‌ی مرورگر ادامه می‌دهد.',
    category: 'feature',
    date: '۱۴۰۵/۰۷/۱۱',
    version: '1.2.0',
    isSystem: true,
    createdAt: t('2026-10-03T05:55:00Z'),
  },
  {
    id: 'cl-seed-013',
    title: 'بهبود سرور: حالت تولید، پورت قابل تنظیم و حجم بالاتر داده',
    description:
      'دستور npm start حالا نسخه‌ی ساخته‌شده (dist) را سرو می‌کند، پورت از PORT خوانده می‌شود، سرور به‌صورت پیش‌فرض فقط روی همین سیستم در دسترس است و محدودیت ۱۰۰ کیلوبایتی حجم درخواست برداشته شد.',
    category: 'improvement',
    date: '۱۴۰۵/۰۷/۱۱',
    version: '1.2.0',
    isSystem: true,
    createdAt: t('2026-10-03T06:00:00Z'),
  },
  {
    id: 'cl-seed-014',
    title: 'صفحه‌ی پیشنهاد، گزارش ایراد و فهرست رفع خطاها',
    description:
      'کاربران می‌توانند پیشنهاد کاربری یا گزارش ایراد ثبت کنند (با کد پیگیری، شدت مشکل و مراحل تکرار)، به پیشنهادها رأی بدهند و وضعیت رسیدگی را ببینند. مدیر وضعیت و پاسخ را مشخص می‌کند و موارد رفع‌شده را در همین فهرست ثبت می‌کند. همه‌ی داده‌ها در دیتابیس ذخیره می‌شوند.',
    category: 'feature',
    date: '۱۴۰۵/۰۷/۱۱',
    version: '1.3.0',
    isSystem: true,
    createdAt: t('2026-10-03T07:00:00Z'),
  },
  {
    id: 'cl-seed-015',
    title: 'ری‌برند: نام سایت به «دراپینو» تغییر کرد',
    description:
      'نام برند در همه‌ی بخش‌ها (هدر، فوتر، صفحه‌ها، پیام‌ها، اعلان‌ها، فاکتور، متن‌های حقوقی، پنل‌ها و فایل‌های خروجی) به «دراپینو» تغییر کرد. داده‌های ذخیره‌شده‌ی قبلی هم به‌صورت خودکار به نام جدید به‌روز می‌شوند.',
    category: 'improvement',
    date: '۱۴۰۵/۰۷/۱۱',
    version: '1.3.1',
    isSystem: true,
    createdAt: t('2026-10-03T11:00:00Z'),
  },
  {
    id: 'cl-seed-016',
    title: 'تکمیل ری‌برند: اصلاح خودکار فایل دیتابیس، نمایش نسخه و سال فوتر',
    description:
      'نام قدیمی برند در داده‌های ذخیره‌شده‌ی سرور هنگام راه‌اندازی هم به «دراپینو» تبدیل و فایل دیتابیس اصلاح می‌شود. شماره‌ی نسخه‌ی برنامه در فوتر نمایش داده می‌شود و سال فوتر (که روی ۱۴۰۳ ثابت بود) هر سال خودکار به‌روز می‌شود.',
    category: 'fix',
    date: '۱۴۰۵/۰۷/۱۱',
    version: '1.3.2',
    isSystem: true,
    createdAt: t('2026-10-03T16:00:00Z'),
  },
  {
    id: 'cl-seed-017',
    title: 'حذف دکمه‌ی شبیه‌ساز اپلیکیشن موبایل از هدر',
    description: 'دکمه‌ی «شبیه‌ساز اپلیکیشن موبایل» از هدر برداشته شد و فضای هدر برای بقیه‌ی گزینه‌ها بازتر شد.',
    category: 'improvement',
    date: '۱۴۰۵/۰۷/۱۱',
    version: '1.3.3',
    isSystem: true,
    createdAt: t('2026-10-03T17:00:00Z'),
  },
  {
    id: 'cl-seed-018',
    title: 'حذف لینک «دانلود فایل‌ها و سورس پروژه» از فوتر',
    description: 'این لینک از فوتر سایت برای همه‌ی کاربران (از جمله مدیر) حذف شد.',
    category: 'improvement',
    date: '۱۴۰۵/۰۷/۱۱',
    version: '1.3.4',
    isSystem: true,
    createdAt: t('2026-10-03T18:00:00Z'),
  },
];

export const INITIAL_CHANGELOG_STORE: ChangelogStore = { entries: SEED_CHANGELOG, deletedSeedIds: [] };
