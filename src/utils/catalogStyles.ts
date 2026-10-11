import { CurtainStyleGuide, ServiceCategoryId } from '../types';

/**
 * کالیته‌های «کاغذ دیواری» و «کفپوش و پارکت» برای صفحه کاتالوگ.
 * تصویر هر کالیته یک طرح گرافیکی (SVG) است؛ برای عکس واقعی، مقدار imageUrl همان مورد را با مسیر عکس
 * (مثلاً '/images/wallpaper-floral.jpg' در پوشه public) عوض کنید.
 */
export interface CatalogItem extends CurtainStyleGuide {
  /** گروه فیلتر دوم (زیر تب رسته) */
  filterKey: string;
  /** نام مدل در فرم رزرو (همان گزینه‌های فرم)؛ اگر نبود، عنوان کالیته استفاده می‌شود */
  bookingStyle?: string;
}

export const CATALOG_TABS: { id: ServiceCategoryId; label: string }[] = [
  { id: 'curtain', label: 'پرده' },
  { id: 'wallpaper', label: 'کاغذ دیواری' },
  { id: 'flooring', label: 'کفپوش و پارکت' },
];

export const CATALOG_SUBFILTERS: Record<ServiceCategoryId, { key: string; label: string }[]> = {
  curtain: [
    { key: 'velvet', label: 'مخمل و کلاسیک' },
    { key: 'sheer', label: 'حریر و مینیمال' },
    { key: 'zebra', label: 'زبرا و مدرن' },
  ],
  wallpaper: [
    { key: 'classic', label: 'گل و کلاسیک' },
    { key: 'modern', label: 'مدرن و سه‌بعدی' },
    { key: 'plain', label: 'ساده و تکسچر' },
    { key: 'kids', label: 'کودک و پوستر' },
  ],
  flooring: [
    { key: 'wood', label: 'پارکت چوب' },
    { key: 'laminate', label: 'لمینت' },
    { key: 'pvc', label: 'PVC و SPC' },
    { key: 'special', label: 'موکت و اپوکسی' },
  ],
};

export const CATALOG_COPY: Record<
  ServiceCategoryId,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    priceLabel: string;
    allLabel: string;
    button: string;
    emptyText: string;
  }
> = {
  curtain: {
    eyebrow: 'کالیته‌ها و سبک‌های پرده',
    title: 'مشاهده سبک‌ها و درخواست ارسال آلبوم کالیته به خانه',
    subtitle:
      'سبک مورد علاقه را انتخاب کنید تا نزدیک‌ترین فروشگاه، آلبوم همان خانواده پارچه را برای پرو در نور خانه شما همراه بیاورد.',
    priceLabel: 'حدود قیمت پارچه:',
    allLabel: 'همه سبک‌ها',
    button: 'درخواست پرو این کالیته در منزل',
    emptyText: 'موردی در این دسته پیدا نشد.',
  },
  wallpaper: {
    eyebrow: 'کالیته‌ها و طرح‌های کاغذ دیواری',
    title: 'مشاهده طرح‌های کاغذ دیواری و درخواست ارسال آلبوم به خانه',
    subtitle:
      'طرح مورد علاقه را انتخاب کنید تا نزدیک‌ترین فروشگاه تخصصی، نمونه‌ها و آلبوم را برای مشاهده در نور واقعی خانه شما بیاورد.',
    priceLabel: 'حدود قیمت هر متر مربع:',
    allLabel: 'همه طرح‌ها',
    button: 'درخواست آلبوم این طرح در منزل',
    emptyText: 'موردی در این دسته پیدا نشد.',
  },
  flooring: {
    eyebrow: 'کالیته‌ها و مدل‌های کفپوش و پارکت',
    title: 'مشاهده مدل‌های کفپوش و پارکت و درخواست ارسال نمونه به خانه',
    subtitle:
      'مدل مورد علاقه را انتخاب کنید تا نزدیک‌ترین فروشگاه تخصصی، نمونه و کاتالوگ را برای بررسی در فضای واقعی خانه شما بیاورد.',
    priceLabel: 'حدود قیمت هر متر مربع:',
    allLabel: 'همه مدل‌ها',
    button: 'درخواست نمونه این مدل در منزل',
    emptyText: 'موردی در این دسته پیدا نشد.',
  },
};

/* ---------------------------- تصویرسازی SVG ---------------------------- */

const toUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const frame = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

type WallKind = 'floral' | 'damask' | 'geometric' | 'threeD' | 'kids' | 'marble' | 'plain' | 'mural';

function wallpaperArt(kind: WallKind, bg: string, fg: string, accent = fg): string {
  let body = '';
  switch (kind) {
    case 'floral':
      body = `<pattern id="p" width="100" height="120" patternUnits="userSpaceOnUse">
        <g fill="none" stroke="${fg}" stroke-width="1.6"><path d="M50 10 C68 34 68 62 50 84 C32 62 32 34 50 10Z"/><path d="M50 84V116"/><path d="M50 50C36 44 22 50 12 62M50 64C64 58 78 64 88 76"/></g>
        <circle cx="50" cy="10" r="4" fill="${accent}"/><circle cx="0" cy="0" r="5" fill="${accent}" opacity=".6"/><circle cx="100" cy="120" r="5" fill="${accent}" opacity=".6"/></pattern>
        <rect width="400" height="300" fill="url(#p)"/>`;
      break;
    case 'damask':
      body = `<pattern id="p" width="90" height="110" patternUnits="userSpaceOnUse">
        <g fill="${fg}" opacity=".85"><path d="M45 8C60 24 62 40 45 56C28 40 30 24 45 8Z"/><path d="M45 56C58 70 56 88 45 102C34 88 32 70 45 56Z" opacity=".6"/>
        <circle cx="45" cy="56" r="5" fill="${accent}"/></g>
        <g fill="none" stroke="${fg}" stroke-width="1.4"><path d="M45 56C20 56 12 36 0 30M45 56C70 56 78 36 90 30"/></g></pattern>
        <rect width="400" height="300" fill="url(#p)"/>`;
      break;
    case 'geometric':
      body = `<pattern id="p" width="60" height="52" patternUnits="userSpaceOnUse">
        <path d="M30 2L58 18V50L30 66 2 50V18Z" transform="translate(0 -8)" fill="none" stroke="${fg}" stroke-width="1.8"/>
        <path d="M30 14L46 24V42L30 52 14 42V24Z" fill="${accent}" opacity=".35" transform="translate(0 -8)"/></pattern>
        <rect width="400" height="300" fill="url(#p)"/>`;
      break;
    case 'threeD':
      body = `<defs><radialGradient id="g" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs>
        <pattern id="p" width="70" height="70" patternUnits="userSpaceOnUse">
        <circle cx="35" cy="35" r="31" fill="${fg}"/><circle cx="35" cy="35" r="31" fill="url(#g)"/></pattern>
        <rect width="400" height="300" fill="url(#p)"/>`;
      break;
    case 'kids':
      body = `<pattern id="p" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M20 8l4 10 11 1-8 7 3 11-10-6-10 6 3-11-8-7 11-1z" fill="${fg}"/>
        <circle cx="62" cy="50" r="9" fill="${accent}"/><circle cx="52" cy="58" r="7" fill="${accent}"/><circle cx="72" cy="58" r="7" fill="${accent}"/>
        <circle cx="12" cy="62" r="3" fill="${fg}" opacity=".6"/></pattern>
        <rect width="400" height="300" fill="url(#p)"/>`;
      break;
    case 'marble':
      body = `<g fill="none" stroke="${fg}" stroke-linecap="round">
        <path d="M-10 60C80 20 120 120 210 80S330 30 410 90" stroke-width="2.2" opacity=".7"/>
        <path d="M-10 150C70 110 140 200 230 160S340 120 410 170" stroke-width="1.4" opacity=".55"/>
        <path d="M-10 240C100 200 150 280 250 230S350 210 410 260" stroke-width="2.6" opacity=".6"/>
        <path d="M120 -10C140 60 90 110 130 170S110 260 150 310" stroke-width="1" opacity=".5"/></g>`;
      break;
    case 'plain':
      body = `<pattern id="p" width="8" height="300" patternUnits="userSpaceOnUse"><rect width="4" height="300" fill="${fg}" opacity=".18"/></pattern>
        <rect width="400" height="300" fill="url(#p)"/>`;
      break;
    case 'mural':
      body = `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fg}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs>
        <rect width="400" height="300" fill="url(#s)"/>
        <path d="M0 220L90 130 160 190 250 90 330 170 400 120V300H0Z" fill="${bg}" opacity=".55"/>
        <path d="M0 260L120 190 210 240 300 170 400 230V300H0Z" fill="${bg}" opacity=".8"/><circle cx="310" cy="60" r="26" fill="#fff" opacity=".85"/>`;
      break;
  }
  return toUri(frame(`<rect width="400" height="300" fill="${bg}"/>${body}<rect y="236" width="400" height="64" fill="#f1e9da"/><rect y="232" width="400" height="6" fill="#b89a5a"/>`));
}

type FloorKind = 'plank' | 'herringbone' | 'tile' | 'carpet' | 'epoxy';

function flooringArt(kind: FloorKind, base: string, dark: string, light: string): string {
  let body = '';
  if (kind === 'plank') {
    for (let r = 0; r < 8; r++) {
      const y = r * 40;
      const off = (r % 3) * 70;
      for (let c = -1; c < 4; c++) {
        const x = c * 190 - off;
        const col = [base, dark, light][(r + c + 3) % 3];
        body += `<rect x="${x}" y="${y}" width="188" height="38" fill="${col}"/>`;
        body += `<path d="M${x + 6} ${y + 14}h${120 + ((r * 13) % 40)}M${x + 20} ${y + 26}h${90 + ((c * 11) % 50)}" stroke="#000" stroke-opacity=".08" stroke-width="1.2" fill="none"/>`;
      }
    }
  } else if (kind === 'herringbone') {
    const colors = [base, dark, light];
    let k = 0;
    for (let row = -1; row < 10; row++)
      for (let col = -1; col < 11; col++) {
        const x = col * 44 + (row % 2 ? 22 : 0);
        const y = row * 30;
        body += `<rect x="${x}" y="${y}" width="40" height="13" fill="${colors[(row * 7 + col * 3 + 12) % 3]}" transform="rotate(45 ${x + 20} ${y + 6})" stroke="#000" stroke-opacity=".18" stroke-width=".6"/>`;
        body += `<rect x="${x + 6}" y="${y + 14}" width="40" height="13" fill="${colors[(row * 5 + col * 11 + 18) % 3]}" transform="rotate(-45 ${x + 26} ${y + 20})" stroke="#000" stroke-opacity=".18" stroke-width=".6"/>`;
        k++;
      }
  } else if (kind === 'tile') {
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 7; c++) {
        const col = (r + c) % 2 ? base : light;
        body += `<rect x="${c * 62}" y="${r * 62}" width="60" height="60" rx="2" fill="${col}"/><path d="M${c * 62 + 8} ${r * 62 + 20}l30 -8M${c * 62 + 12} ${r * 62 + 42}l34 6" stroke="${dark}" stroke-opacity=".25" fill="none"/>`;
      }
  } else if (kind === 'carpet') {
    body = `<pattern id="p" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="${dark}" opacity=".45"/><circle cx="4.5" cy="4.5" r="1.1" fill="${light}" opacity=".6"/></pattern><rect width="400" height="300" fill="url(#p)"/>`;
  } else {
    body = `<defs><linearGradient id="e" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset=".5" stop-color="${base}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs><rect width="400" height="300" fill="url(#e)"/><path d="M-20 260C120 180 240 300 420 160V80C260 200 140 100 -20 190Z" fill="#fff" opacity=".18"/>`;
  }
  const shade = `<defs><linearGradient id="sh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs>`;
  return toUri(frame(`<rect width="400" height="300" fill="${base}"/>${body}${shade}<rect width="400" height="300" fill="url(#sh)"/><rect width="400" height="12" fill="#f3ede1" opacity=".92"/>`));
}

/* ------------------------------ داده‌ها ------------------------------ */

export const WALLPAPER_ITEMS: CatalogItem[] = [
  {
    id: 'wp-floral', filterKey: 'classic', bookingStyle: 'طرح گل و گیاه',
    title: 'کاغذ دیواری گل و گیاه', persianCategory: 'گل و کلاسیک',
    description: 'نقش برگ و غنچه با خطوط ظریف طلایی؛ مناسب اتاق خواب و پذیرایی‌های گرم و دنج.',
    features: ['نقش‌های ظریف و ماندگار', 'مقاوم در برابر رطوبت‌های معمولی', 'نصب آسان با آستر'],
    fabricSuggestions: ['رول استاندارد', 'رول عریض'], priceRange: '۲۳۰,۰۰۰ تا ۴۵۰,۰۰۰ تومان',
    imageUrl: wallpaperArt('floral', '#2f4a43', '#d9b974', '#e9d7a4'),
  },
  {
    id: 'wp-damask', filterKey: 'classic', bookingStyle: 'طرح داماسک و کلاسیک',
    title: 'داماسک و کلاسیک', persianCategory: 'گل و کلاسیک',
    description: 'نقش‌های متقارن سلطنتی با جلوه‌ی برجسته؛ انتخابی لوکس برای سالن‌های رسمی.',
    features: ['ظاهر مجلل و رسمی', 'ضدلک و قابل پاک‌کردن', 'هماهنگ با پرده مخمل'],
    fabricSuggestions: ['رول استاندارد'], priceRange: '۲۸۰,۰۰۰ تا ۵۵۰,۰۰۰ تومان',
    imageUrl: wallpaperArt('damask', '#6b1f2a', '#e3c37f', '#f3dca2'),
  },
  {
    id: 'wp-geometric', filterKey: 'modern', bookingStyle: 'طرح هندسی مدرن',
    title: 'هندسی مدرن', persianCategory: 'مدرن و سه‌بعدی',
    description: 'الگوهای شش‌ضلعی و خطوط تکرارشونده برای فضاهای امروزی و دفتر کار.',
    features: ['طرح تکرارشونده کم‌پرت', 'رنگ‌های ثابت و ماندگار', 'مناسب دیوار اصلی'],
    fabricSuggestions: ['رول استاندارد', 'رول عریض'], priceRange: '۲۰۰,۰۰۰ تا ۳۸۰,۰۰۰ تومان',
    imageUrl: wallpaperArt('geometric', '#1f2a37', '#7aa7c7', '#e0b44c'),
  },
  {
    id: 'wp-3d', filterKey: 'modern', bookingStyle: 'سه‌بعدی و برجسته',
    title: 'سه‌بعدی و برجسته', persianCategory: 'مدرن و سه‌بعدی',
    description: 'بافت برجسته با سایه‌روشن طبیعی که به دیوار عمق می‌دهد.',
    features: ['جلوه حجمی با نور', 'پوشش‌دهی عیوب جزئی دیوار', 'ردهٔ لوکس'],
    fabricSuggestions: ['رول عریض'], priceRange: '۳۵۰,۰۰۰ تا ۶۵۰,۰۰۰ تومان',
    imageUrl: wallpaperArt('threeD', '#c9c3b8', '#d8d2c6'),
  },
  {
    id: 'wp-marble', filterKey: 'modern', bookingStyle: 'طرح مرمر و بتن',
    title: 'طرح مرمر و بتن', persianCategory: 'مدرن و سه‌بعدی',
    description: 'رگه‌های سنگ مرمر و بافت بتن صنعتی با اجرای ساده‌تر از سنگ واقعی.',
    features: ['ظاهر سنگ بدون هزینه سنگ', 'سبک و سریع‌نصب', 'مناسب آشپزخانه و راهرو'],
    fabricSuggestions: ['رول عریض'], priceRange: '۲۵۰,۰۰۰ تا ۴۸۰,۰۰۰ تومان',
    imageUrl: wallpaperArt('marble', '#ece8e1', '#6c6a66'),
  },
  {
    id: 'wp-plain', filterKey: 'plain', bookingStyle: 'کاغذ دیواری ساده و تکسچر',
    title: 'ساده و تکسچر', persianCategory: 'ساده و تکسچر',
    description: 'رنگ‌های آرام و بافت ظریف؛ مناسب هر دکوراسیونی و کم‌پرت‌ترین گزینه.',
    features: ['کمترین پرت و اجرت', 'هماهنگ با هر پرده', 'اقتصادی'],
    fabricSuggestions: ['رول استاندارد'], priceRange: '۱۲۰,۰۰۰ تا ۲۴۰,۰۰۰ تومان',
    imageUrl: wallpaperArt('plain', '#d9cdb8', '#8a7a5e'),
  },
  {
    id: 'wp-kids', filterKey: 'kids', bookingStyle: 'اتاق کودک و نوجوان',
    title: 'اتاق کودک و نوجوان', persianCategory: 'کودک و پوستر',
    description: 'طرح‌های شاد با ستاره و ابر، با مواد بی‌بو و قابل شست‌وشو.',
    features: ['مواد بی‌بو و سالم', 'قابل شست‌وشو', 'رنگ‌های شاد و ماندگار'],
    fabricSuggestions: ['رول استاندارد'], priceRange: '۱۸۰,۰۰۰ تا ۳۴۰,۰۰۰ تومان',
    imageUrl: wallpaperArt('kids', '#cfe6f2', '#f4c542', '#f08ca8'),
  },
  {
    id: 'wp-mural', filterKey: 'kids', bookingStyle: 'پوستر دیواری و تصویری',
    title: 'پوستر دیواری و تصویری', persianCategory: 'کودک و پوستر',
    description: 'تصویر یکپارچه منظره یا طرح دلخواه برای یک دیوار اصلی با ابعاد سفارشی.',
    features: ['چاپ با ابعاد دیوار شما', 'کیفیت بالا', 'نقطه ثقل اتاق'],
    fabricSuggestions: ['سفارشی'], priceRange: 'بر اساس ابعاد و طرح',
    imageUrl: wallpaperArt('mural', '#f3e7d3', '#6aa6c9', '#2f6f8f'),
  },
];

export const FLOORING_ITEMS: CatalogItem[] = [
  {
    id: 'fl-wood', filterKey: 'wood', bookingStyle: 'پارکت چوب طبیعی',
    title: 'پارکت چوب طبیعی', persianCategory: 'پارکت چوب',
    description: 'چوب واقعی با رگه‌های طبیعی و عمر طولانی؛ قابل سیخ‌کشی و تعمیر.',
    features: ['اصالت و گرمای چوب واقعی', 'قابل بازسازی', 'ارزش افزوده ملک'],
    fabricSuggestions: ['چندلایه', 'ماسیف'], priceRange: '۲,۲۰۰,۰۰۰ تا ۳,۲۰۰,۰۰۰ تومان',
    imageUrl: flooringArt('plank', '#a8743f', '#8f5f30', '#bf8a52'),
  },
  {
    id: 'fl-herringbone', filterKey: 'wood', bookingStyle: 'پارکت اسپیک (فیشبون)',
    title: 'پارکت اسپیک (فیشبون)', persianCategory: 'پارکت چوب',
    description: 'چیدمان مورب و ماهی‌استخوانی کلاسیک با جلوه‌ی هنری برای سالن‌های بزرگ.',
    features: ['چیدمان خاص و لوکس', 'نیاز به نصاب ماهر', 'پرت حدود ۱۵٪'],
    fabricSuggestions: ['چندلایه', 'ماسیف'], priceRange: '۲,۴۰۰,۰۰۰ تا ۳,۸۰۰,۰۰۰ تومان',
    imageUrl: flooringArt('herringbone', '#9a642f', '#7f4f22', '#b8803f'),
  },
  {
    id: 'fl-thermowood', filterKey: 'wood', bookingStyle: 'پارکت ترموود',
    title: 'پارکت ترموود', persianCategory: 'پارکت چوب',
    description: 'چوب حرارت‌دیده با پایداری بالا در برابر رطوبت و تغییر دما؛ مناسب بالکن و فضای باز.',
    features: ['مقاوم در برابر رطوبت', 'رنگ قهوه‌ای عمیق', 'مناسب فضای باز'],
    fabricSuggestions: ['ترموود'], priceRange: '۱,۸۰۰,۰۰۰ تا ۲,۹۰۰,۰۰۰ تومان',
    imageUrl: flooringArt('plank', '#5e3d23', '#4a2f1b', '#76502f'),
  },
  {
    id: 'fl-laminate', filterKey: 'laminate', bookingStyle: 'لمینت',
    title: 'لمینت', persianCategory: 'لمینت',
    description: 'ظاهر چوب با قیمت اقتصادی، سطح مقاوم در برابر خط‌وخش و نصب شناور سریع.',
    features: ['مقاوم در برابر خراش', 'نصب سریع بدون چسب', 'رنگ‌ها و بافت‌های متنوع'],
    fabricSuggestions: ['AC3', 'AC4', 'AC5'], priceRange: '۷۸۰,۰۰۰ تا ۱,۲۰۰,۰۰۰ تومان',
    imageUrl: flooringArt('plank', '#c8a77c', '#b69265', '#d9bc95'),
  },
  {
    id: 'fl-spc', filterKey: 'pvc', bookingStyle: 'کفپوش SPC',
    title: 'کفپوش SPC (ضدآب)', persianCategory: 'PVC و SPC',
    description: 'هسته سنگی و ضدآب ۱۰۰٪؛ مناسب آشپزخانه، سرویس و فضاهای پررفت‌وآمد.',
    features: ['کاملاً ضدآب', 'پایدار در برابر دما', 'نصب کلیکی'],
    fabricSuggestions: ['۴ تا ۶ میلی‌متر'], priceRange: '۹۵۰,۰۰۰ تا ۱,۵۰۰,۰۰۰ تومان',
    imageUrl: flooringArt('plank', '#8d8a85', '#74716c', '#a7a49e'),
  },
  {
    id: 'fl-vinyl', filterKey: 'pvc', bookingStyle: 'کفپوش PVC و وینیل',
    title: 'کفپوش PVC و وینیل', persianCategory: 'PVC و SPC',
    description: 'سبک و اقتصادی با طرح‌های سنگ و کاشی؛ مناسب مغازه، اداره و آپارتمان‌های اجاره‌ای.',
    features: ['اقتصادی‌ترین گزینه', 'نصب سریع', 'تمیزکاری آسان'],
    fabricSuggestions: ['رولی', 'کاشی‌ای'], priceRange: '۴۲۰,۰۰۰ تا ۸۰۰,۰۰۰ تومان',
    imageUrl: flooringArt('tile', '#b9b3a6', '#8e887a', '#d3cdbf'),
  },
  {
    id: 'fl-carpet', filterKey: 'special', bookingStyle: 'موکت و فرش ماشینی',
    title: 'موکت و فرش ماشینی', persianCategory: 'موکت و اپوکسی',
    description: 'نرم و عایق صدا؛ مناسب اتاق خواب، دفتر کار و سالن‌های اجتماعات.',
    features: ['نرم و گرم', 'عایق صدا', 'نصب فوری'],
    fabricSuggestions: ['موکت', 'فرش ماشینی'], priceRange: '۲۵۰,۰۰۰ تا ۹۰۰,۰۰۰ تومان',
    imageUrl: flooringArt('carpet', '#7d8a97', '#5d6975', '#a1adba'),
  },
  {
    id: 'fl-epoxy', filterKey: 'special', bookingStyle: 'کفپوش اپوکسی',
    title: 'کفپوش اپوکسی', persianCategory: 'موکت و اپوکسی',
    description: 'سطح یکپارچه و براق بدون درز؛ مناسب پارکینگ، کارگاه و دکوراسیون صنعتی.',
    features: ['بدون درز و ضدلکه', 'مقاوم در برابر مواد شیمیایی', 'جلوه آینه‌ای'],
    fabricSuggestions: ['اجرای در محل'], priceRange: '۶۵۰,۰۰۰ تا ۱,۴۰۰,۰۰۰ تومان',
    imageUrl: flooringArt('epoxy', '#5f7f8f', '#2f4f5f', '#a9c5d1'),
  },
];

/* ------------------- کالیته‌های قابل مدیریت از پنل مدیریت ------------------- */

export interface CatalogEntry extends CatalogItem {
  category: ServiceCategoryId;
  /** false = از صفحه کاتالوگ مخفی است */
  isActive?: boolean;
}

export const CATALOG_STORAGE_KEY = 'drapino_catalog_styles';

const curtainFilterKey = (id: string) =>
  id.includes('velvet') ? 'velvet' : id.includes('sheer') ? 'sheer' : id.includes('zebra') ? 'zebra' : '';

/** فهرست پیش‌فرض: کالیته‌های پرده (از mockData) + کاغذ دیواری + کفپوش */
export const buildDefaultCatalog = (curtainStyles: CurtainStyleGuide[]): CatalogEntry[] => [
  ...curtainStyles.map((s) => ({ ...s, category: 'curtain' as const, filterKey: curtainFilterKey(s.id), isActive: true })),
  ...WALLPAPER_ITEMS.map((s) => ({ ...s, category: 'wallpaper' as const, isActive: true })),
  ...FLOORING_ITEMS.map((s) => ({ ...s, category: 'flooring' as const, isActive: true })),
];

/* ------------------- گروه‌های فیلتر دوم (قابل مدیریت از پنل) ------------------- */

export interface CatalogGroup {
  key: string;
  label: string;
  category: ServiceCategoryId;
}

export const CATALOG_GROUPS_STORAGE_KEY = 'drapino_catalog_groups';

export const buildDefaultGroups = (): CatalogGroup[] =>
  (Object.keys(CATALOG_SUBFILTERS) as ServiceCategoryId[]).flatMap((category) =>
    CATALOG_SUBFILTERS[category].map((f) => ({ ...f, category }))
  );
