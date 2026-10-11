/**
 * محاسبه‌گرهای استعلام قیمت هوشمند (کاغذ دیواری و کفپوش/پارکت).
 * همه قیمت‌ها «تقریبی» و به تومان هستند؛ برای تغییر نرخ‌ها فقط ثابت‌های بالای هر بخش را ویرایش کنید.
 */

export type QuoteCategory = 'curtain' | 'wallpaper' | 'flooring';

/** داده‌ای که محاسبه‌گر هنگام «ثبت سفارش بازدید» به فرم رزرو می‌دهد */
export type QuoteProceedPayload =
  | { category: 'curtain'; details: { width: number; height: number; style: string; fabricTier: string } }
  | { category: 'wallpaper' | 'flooring'; area: number; styles: string[]; notes: string };

const positive = (n: number, fallback = 0) => (isFinite(n) && n > 0 ? n : fallback);
const round1 = (n: number) => Math.round(n * 10) / 10;
/** گرد کردن مبلغ به نزدیک‌ترین هزار تومان */
const roundK = (n: number) => Math.round(n / 1000) * 1000;

/* ------------------------------------------------------------------ */
/* کاغذ دیواری                                                          */
/* ------------------------------------------------------------------ */

export type WallpaperQuality = 'economy' | 'standard' | 'luxury';
export type WallpaperPatternType = 'plain' | 'small' | 'large';
export type WallpaperRoll = 'standard' | 'wide';

export const WALLPAPER_QUALITY: Record<WallpaperQuality, { label: string; pricePerM2: number; hint: string }> = {
  economy: { label: 'اقتصادی', pricePerM2: 120000, hint: 'متری ۱۲۰,۰۰۰ ت' },
  standard: { label: 'متوسط (پرفروش)', pricePerM2: 230000, hint: 'متری ۲۳۰,۰۰۰ ت' },
  luxury: { label: 'لوکس / سه‌بعدی', pricePerM2: 450000, hint: 'متری ۴۵۰,۰۰۰ ت' },
};

/** درصد پرت بر اساس نوع طرح (طرح درشت نیاز به تطبیق نقش دارد) */
export const WALLPAPER_PATTERN: Record<WallpaperPatternType, { label: string; waste: number }> = {
  plain: { label: 'ساده / تکسچر', waste: 0.1 },
  small: { label: 'طرح ریز', waste: 0.15 },
  large: { label: 'طرح درشت / نقش‌دار', waste: 0.22 },
};

/** پوشش هر رول (متر مربع) */
export const WALLPAPER_ROLL: Record<WallpaperRoll, { label: string; coverage: number }> = {
  standard: { label: 'رول استاندارد (۵۳ سانتی‌متر × ۱۰ متر)', coverage: 5.3 },
  wide: { label: 'رول عریض (۱۰۶ سانتی‌متر × ۱۰ متر)', coverage: 10.6 },
};

const WALLPAPER_INSTALL_PER_M2 = 75000; // اجرت نصب
const WALLPAPER_PRIMER_GLUE_PER_M2 = 20000; // آستر و چسب
const WALLPAPER_PREP_PER_M2 = 60000; // آماده‌سازی و صافی سطح دیوار
const DOOR_AREA = 2.0; // متر مربع
const WINDOW_AREA = 1.5; // متر مربع

export interface WallpaperInput {
  mode: 'room' | 'single';
  roomLength: number;
  roomWidth: number;
  wallHeight: number;
  singleWallWidth: number;
  doors: number;
  windows: number;
  quality: WallpaperQuality;
  pattern: WallpaperPatternType;
  roll: WallpaperRoll;
  needInstallation: boolean;
  needPrep: boolean;
}

export interface WallpaperResult {
  wallArea: number;
  rolls: number;
  materialCost: number;
  installCost: number;
  primerCost: number;
  prepCost: number;
  subtotal: number;
}

export function estimateWallpaper(i: WallpaperInput): WallpaperResult {
  const height = positive(i.wallHeight, 2.7);
  let gross: number;
  if (i.mode === 'single') {
    gross = positive(i.singleWallWidth) * height;
  } else {
    gross = 2 * (positive(i.roomLength) + positive(i.roomWidth)) * height;
  }
  const openings = Math.max(0, i.doors) * DOOR_AREA + Math.max(0, i.windows) * WINDOW_AREA;
  const wallArea = Math.max(0, gross - (i.mode === 'single' ? 0 : openings));

  const coverage = WALLPAPER_ROLL[i.roll].coverage;
  const waste = WALLPAPER_PATTERN[i.pattern].waste;
  const rolls = wallArea > 0 ? Math.ceil((wallArea * (1 + waste)) / coverage) : 0;

  const pricePerRoll = WALLPAPER_QUALITY[i.quality].pricePerM2 * coverage;
  const m = roundK(rolls * pricePerRoll);
  const ins = roundK(i.needInstallation ? wallArea * WALLPAPER_INSTALL_PER_M2 : 0);
  const pr = roundK(i.needInstallation ? wallArea * WALLPAPER_PRIMER_GLUE_PER_M2 : 0);
  const pp = roundK(i.needPrep ? wallArea * WALLPAPER_PREP_PER_M2 : 0);

  return {
    wallArea: round1(wallArea),
    rolls,
    materialCost: m,
    installCost: ins,
    primerCost: pr,
    prepCost: pp,
    subtotal: m + ins + pr + pp,
  };
}

/* ------------------------------------------------------------------ */
/* کفپوش و پارکت                                                        */
/* ------------------------------------------------------------------ */

export type FlooringType = 'laminate' | 'spc' | 'vinyl' | 'engineered' | 'solid';
export type FlooringLayout = 'straight' | 'diagonal' | 'herringbone';
export type FlooringSizing = 'dimensions' | 'area';

export const FLOORING_TYPE: Record<
  FlooringType,
  { label: string; pricePerM2: number; installPerM2: number; bookingStyle: string }
> = {
  vinyl: { label: 'کفپوش PVC / وینیل', pricePerM2: 420000, installPerM2: 150000, bookingStyle: 'کفپوش PVC و وینیل' },
  laminate: { label: 'لمینت', pricePerM2: 780000, installPerM2: 180000, bookingStyle: 'لمینت' },
  spc: { label: 'کفپوش SPC (ضدآب)', pricePerM2: 950000, installPerM2: 190000, bookingStyle: 'کفپوش SPC' },
  engineered: { label: 'پارکت چندلایه (انجینیرد)', pricePerM2: 2200000, installPerM2: 350000, bookingStyle: 'پارکت چوب طبیعی' },
  solid: { label: 'پارکت چوب ماسیف (طبیعی)', pricePerM2: 3200000, installPerM2: 450000, bookingStyle: 'پارکت چوب طبیعی' },
};

export const FLOORING_LAYOUT: Record<FlooringLayout, { label: string; waste: number; installFactor: number }> = {
  straight: { label: 'مستقیم', waste: 0.07, installFactor: 1 },
  diagonal: { label: 'مورب (۴۵ درجه)', waste: 0.12, installFactor: 1.15 },
  herringbone: { label: 'اسپیک / فیشبون', waste: 0.15, installFactor: 1.3 },
};

const FLOORING_UNDERLAY_PER_M2 = 85000; // زیرپارکت
const FLOORING_LEVELING_PER_M2 = 180000; // تسطیح و آماده‌سازی کف
const FLOORING_REMOVAL_PER_M2 = 90000; // جمع‌آوری کفپوش قدیمی
const FLOORING_SKIRTING_PER_M = 140000; // قرنیز (هر متر طول)

export interface FlooringInput {
  sizing: FlooringSizing;
  roomLength: number;
  roomWidth: number;
  areaDirect: number;
  type: FlooringType;
  layout: FlooringLayout;
  needInstallation: boolean;
  needUnderlay: boolean;
  needSkirting: boolean;
  needLeveling: boolean;
  needRemoval: boolean;
}

export interface FlooringResult {
  area: number;
  areaWithWaste: number;
  skirtingMeters: number;
  materialCost: number;
  installCost: number;
  underlayCost: number;
  skirtingCost: number;
  levelingCost: number;
  removalCost: number;
  subtotal: number;
}

export function estimateFlooring(i: FlooringInput): FlooringResult {
  let area: number;
  let perimeter: number;
  if (i.sizing === 'dimensions') {
    area = positive(i.roomLength) * positive(i.roomWidth);
    perimeter = 2 * (positive(i.roomLength) + positive(i.roomWidth));
  } else {
    area = positive(i.areaDirect);
    perimeter = 4 * Math.sqrt(area); // برآورد محیط برای اتاق تقریباً مربعی
  }

  const type = FLOORING_TYPE[i.type];
  const layout = FLOORING_LAYOUT[i.layout];
  const areaWithWaste = area * (1 + layout.waste);
  const skirtingMeters = i.needSkirting ? perimeter * 0.9 : 0; // حدود ۱۰٪ بابت درگاه‌ها

  const m = roundK(areaWithWaste * type.pricePerM2);
  const ins = roundK(i.needInstallation ? area * type.installPerM2 * layout.installFactor : 0);
  const u = roundK(i.needUnderlay ? area * FLOORING_UNDERLAY_PER_M2 : 0);
  const sk = roundK(skirtingMeters * FLOORING_SKIRTING_PER_M);
  const lv = roundK(i.needLeveling ? area * FLOORING_LEVELING_PER_M2 : 0);
  const rm = roundK(i.needRemoval ? area * FLOORING_REMOVAL_PER_M2 : 0);

  return {
    area: round1(area),
    areaWithWaste: round1(areaWithWaste),
    skirtingMeters: round1(skirtingMeters),
    materialCost: m,
    installCost: ins,
    underlayCost: u,
    skirtingCost: sk,
    levelingCost: lv,
    removalCost: rm,
    subtotal: m + ins + u + sk + lv + rm,
  };
}

/* ------------------------------------------------------------------ */
/* گزینه‌های «طرح/مدل» مشترک بین استعلام قیمت و فرم رزرو                  */
/* ------------------------------------------------------------------ */

export const WALLPAPER_STYLE_OPTIONS = [
  'کاغذ دیواری ساده و تکسچر',
  'طرح گل و گیاه',
  'طرح داماسک و کلاسیک',
  'طرح هندسی مدرن',
  'سه‌بعدی و برجسته',
  'اتاق کودک و نوجوان',
  'پوستر دیواری و تصویری',
  'طرح مرمر و بتن',
];

export const FLOORING_STYLE_OPTIONS = [
  'پارکت چوب طبیعی',
  'لمینت',
  'پارکت اسپیک (فیشبون)',
  'کفپوش PVC و وینیل',
  'کفپوش SPC',
  'موکت و فرش ماشینی',
  'کفپوش اپوکسی',
  'پارکت ترموود',
];
