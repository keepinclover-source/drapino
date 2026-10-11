import { SelectedSwatchItem, VisitRequest } from '../types';
import { 
  HERO_IMAGE_PATH, 
  SWATCHES_IMAGE_PATH, 
  BLOG_IMAGE_PATH, 
  SPECIALIST_IMAGE_PATH 
} from '../data/mockData';

export const FABRIC_SWATCH_PRESETS: Record<string, SelectedSwatchItem> = {
  'مخمل کالیفرنیا ترک': {
    id: 'sw-cal-804',
    title: 'مخمل کالیفرنیا شانل سوپر لوکس',
    fabricCode: 'CAL-804',
    category: 'مخمل',
    colorName: 'طوسی فیلی متالیک',
    colorHex: '#9ca3af',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=800&auto=format&fit=crop&q=80',
    texture: 'مات، فوق متراکم با خواب مخملی ملایم',
    origin: 'ترکیه (بورسا)',
    grammage: '۵۵۰ گرم بر مترمربع',
    lightBlockPercentage: 92,
    suggestedFor: 'سالن پذیرایی و اتاق خواب مستر',
    description: 'یکی از بادوام‌ترین پارچه‌های مخمل با ماندگاری رنگ ۱۰ ساله بدون پرزدهی، مقاوم در برابر چروک و نور مستقیم آفتاب.',
    isConfirmedBySpecialist: true,
  },
  'مخمل کالیفرنیا ترک شانل': {
    id: 'sw-cal-804-b',
    title: 'مخمل کالیفرنیا شانل سوپر لوکس',
    fabricCode: 'CAL-804',
    category: 'مخمل',
    colorName: 'طوسی فیلی متالیک',
    colorHex: '#9ca3af',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=800&auto=format&fit=crop&q=80',
    texture: 'مات، فوق متراکم با خواب مخملی ملایم',
    origin: 'ترکیه (بورسا)',
    grammage: '۵۵۰ گرم بر مترمربع',
    lightBlockPercentage: 92,
    suggestedFor: 'سالن پذیرایی و اتاق خواب مستر',
    description: 'یکی از بادوام‌ترین پارچه‌های مخمل با ماندگاری رنگ ۱۰ ساله بدون پرزدهی، مقاوم در برابر چروک و نور مستقیم آفتاب.',
    isConfirmedBySpecialist: true,
  },
  'مخمل شانل و پتینه لوکس': {
    id: 'sw-chn-720',
    title: 'مخمل شانل پتینه‌کاری طلاکوب',
    fabricCode: 'CHN-720',
    category: 'پتینه و ژاکارد',
    colorName: 'بژ شامپاینی با رگه زرین',
    colorHex: '#d4af37',
    imageUrl: SWATCHES_IMAGE_PATH,
    texture: 'برجسته با رگه‌های زرین و سایه روشن عمیق',
    origin: 'ترکیه',
    grammage: '۵۸۰ گرم بر مترمربع',
    lightBlockPercentage: 88,
    suggestedFor: 'پذیرایی کلاسیک و پرده‌های دوبلکس',
    description: 'بافت ژاکارد پتینه با دوام بالا، ریزش بسیار سنگین و بدون نیاز به اتوکشی مکرر.',
    isConfirmedBySpecialist: true,
  },
  'مخمل پتینه کوبیده': {
    id: 'sw-esp-991',
    title: 'مخمل پتینه اسپانیایی دو رو',
    fabricCode: 'ESP-991',
    category: 'مخمل پتینه',
    colorName: 'مسی و بژ خاکی',
    colorHex: '#b45309',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1200&h=800&auto=format&fit=crop&q=80',
    texture: 'کوبیده ابروبادی نرم با لمس ابریشمی',
    origin: 'اسپانیا',
    grammage: '۵۳۰ گرم بر مترمربع',
    lightBlockPercentage: 85,
    suggestedFor: 'سالن پذیرایی مدرن و نئوکلاسیک',
    description: 'طراحی لوکس اروپایی با ضریب جذب صدا و عایق سرمایش و گرمایش منزل.',
    isConfirmedBySpecialist: true,
  },
  'حریر شاین و الگانت': {
    id: 'sw-shn-01',
    title: 'حریر شاین متراکم ترک الگانت',
    fabricCode: 'SHN-01',
    category: 'حریر و تور',
    colorName: 'شیری صدفی براق',
    colorHex: '#fef3c7',
    imageUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200&h=800&auto=format&fit=crop&q=80',
    texture: 'شاین ریز اکلیلی با ریزش لخت و روان',
    origin: 'ترکیه',
    grammage: '۱۹۰ گرم بر مترمربع',
    lightBlockPercentage: 35,
    suggestedFor: 'پوشش پنجره‌های قدی پذیرایی و اتاق خواب',
    description: 'عبور ملایم نور خورشید همراه با حفظ کامل حریم خصوصی در طول روز، بدون دید از بیرون.',
    isConfirmedBySpecialist: true,
  },
  'حریر شاین متراکم': {
    id: 'sw-shn-01-b',
    title: 'حریر شاین متراکم ترک الگانت',
    fabricCode: 'SHN-01',
    category: 'حریر و تور',
    colorName: 'شیری صدفی براق',
    colorHex: '#fef3c7',
    imageUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200&h=800&auto=format&fit=crop&q=80',
    texture: 'شاین ریز اکلیلی با ریزش لخت و روان',
    origin: 'ترکیه',
    grammage: '۱۹۰ گرم بر مترمربع',
    lightBlockPercentage: 35,
    suggestedFor: 'پوشش پنجره‌های قدی پذیرایی و اتاق خواب',
    description: 'عبور ملایم نور خورشید همراه با حفظ کامل حریم خصوصی در طول روز، بدون دید از بیرون.',
    isConfirmedBySpecialist: true,
  },
  'حریر کرپ شیشه‌ای': {
    id: 'sw-crp-110',
    title: 'حریر کرپ ترک بدون چروک',
    fabricCode: 'TUR-CRP',
    category: 'حریر',
    colorName: 'سفید یخی مات',
    colorHex: '#f8fafc',
    imageUrl: 'https://images.unsplash.com/photo-1528458876885-544332c5637c?w=1200&h=800&auto=format&fit=crop&q=80',
    texture: 'کرپ بافت‌دار، کاملاً مات و ضدچروک',
    origin: 'ترکیه',
    grammage: '۲۱۰ گرم بر مترمربع',
    lightBlockPercentage: 40,
    suggestedFor: 'فضاهای مینیمال، هتلی و اتاق مهمان',
    description: 'سازگاری کامل با شستشوی مداوم بدون نیاز به اتو، مجهز به نوار سربی تعبیه‌شده در لبه پایین.',
    isConfirmedBySpecialist: true,
  },
  'کتان لنین ارگانیک': {
    id: 'sw-lin-302',
    title: 'کتان لینن بوکله بافت نوردیک',
    fabricCode: 'LIN-302',
    category: 'کتان و گونی‌بافت',
    colorName: 'کرم ماسه‌ای نچرال',
    colorHex: '#e7e5e4',
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?w=1200&h=800&auto=format&fit=crop&q=80',
    texture: 'الیاف درشت کتان طبیعی با حس گرما و راحتی',
    origin: 'ایتالیا',
    grammage: '۴۴۰ گرم بر مترمربع',
    lightBlockPercentage: 65,
    suggestedFor: 'سبک‌های بوهو، مدرن و نشیمن‌های گرم',
    description: '۱۰۰٪ الیاف طبیعی گیاهی ضدحساسیت با تنفس‌پذیری بالا، سازگار با مبلمان چوبی و راحتی.',
    isConfirmedBySpecialist: true,
  },
  'زبرا دومکانیزم شب و روز': {
    id: 'sw-zbr-502',
    title: 'زبرا دومکانیزم شب و روز ژاکارد',
    fabricCode: 'ZBR-502',
    category: 'زبرا و شید',
    colorName: 'طوسی فیلی و سفید توری',
    colorHex: '#6b7280',
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=800&auto=format&fit=crop&q=80',
    texture: 'دو لایه مجزا پارچه ضخیم و توری شفاف',
    origin: 'کره جنوبی',
    grammage: '۳۲۰ گرم بر مترمربع',
    lightBlockPercentage: 85,
    suggestedFor: 'آشپزخانه، اتاق کار و خواب',
    description: 'تنظیم دقیق زاویه تابش نور خورشید به صورت دستی یا مجهز به موتور برقی ریموت‌دار.',
    isConfirmedBySpecialist: true,
  },
  'زبرا دومکانیزم مدرن': {
    id: 'sw-zbr-502-b',
    title: 'زبرا دومکانیزم شب و روز ژاکارد',
    fabricCode: 'ZBR-502',
    category: 'زبرا و شید',
    colorName: 'طوسی فیلی و سفید توری',
    colorHex: '#6b7280',
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=800&auto=format&fit=crop&q=80',
    texture: 'دو لایه مجزا پارچه ضخیم و توری شفاف',
    origin: 'کره جنوبی',
    grammage: '۳۲۰ گرم بر مترمربع',
    lightBlockPercentage: 85,
    suggestedFor: 'آشپزخانه، اتاق کار و خواب',
    description: 'تنظیم دقیق زاویه تابش نور خورشید به صورت دستی یا مجهز به موتور برقی ریموت‌دار.',
    isConfirmedBySpecialist: true,
  },
  'پرده ورتیکال (دی‌کی)': {
    id: 'sw-vrt-880',
    title: 'پرده ورتیکال سایه روشن DK (لوور فرانسه)',
    fabricCode: 'VRT-880',
    category: 'ورتیکال و هوشمند',
    colorName: 'دودی طوسی متالیک',
    colorHex: '#475569',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&h=800&auto=format&fit=crop&q=80',
    texture: 'اسلایدهای مجزای بدون زنجیر با گردش ۱۸۰ درجه',
    origin: 'فرانسه',
    grammage: '۴۲۰ گرم بر مترمربع',
    lightBlockPercentage: 75,
    suggestedFor: 'دفاتر کار اداری و پنجره‌های عریض پذیرایی',
    description: 'تلفیقی هوشمندانه از راحتی پرده لوردراپه و زیبایی بی‌انتهای حریر و پارچه.',
    isConfirmedBySpecialist: true,
  },
  'پرده ورتیکال سایه روشن (DK)': {
    id: 'sw-vrt-880-b',
    title: 'پرده ورتیکال سایه روشن DK (لوور فرانسه)',
    fabricCode: 'VRT-880',
    category: 'ورتیکال و هوشمند',
    colorName: 'دودی طوسی متالیک',
    colorHex: '#475569',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&h=800&auto=format&fit=crop&q=80',
    texture: 'اسلایدهای مجزای بدون زنجیر با گردش ۱۸۰ درجه',
    origin: 'فرانسه',
    grammage: '۴۲۰ گرم بر مترمربع',
    lightBlockPercentage: 75,
    suggestedFor: 'دفاتر کار اداری و پنجره‌های عریض پذیرایی',
    description: 'تلفیقی هوشمندانه از راحتی پرده لوردراپه و زیبایی بی‌انتهای حریر و پارچه.',
    isConfirmedBySpecialist: true,
  },
  'شید رول بلک‌اوت': {
    id: 'sw-blk-101',
    title: 'شید رول بلک‌اوت صددرصد عایق نور',
    fabricCode: 'BLK-101',
    category: 'زبرا و شید',
    colorName: 'خاکستری تیره نانو',
    colorHex: '#334155',
    imageUrl: HERO_IMAGE_PATH,
    texture: 'پارچه دولایه آلومینایز عایق حرارت و نور',
    origin: 'آلمان',
    grammage: '۴۸۰ گرم بر مترمربع',
    lightBlockPercentage: 100,
    suggestedFor: 'اتاق خواب، اتاق کودک و سالن ویدئو پروژکتور',
    description: 'تاریکی مطلق ۱۰۰٪ حتی در اوج ظهر تابستان، جلوگیری از هدررفت انرژی تا ۳۰٪.',
    isConfirmedBySpecialist: true,
  },
  'شید رول موتورایز اداری': {
    id: 'sw-blk-101-b',
    title: 'شید رول بلک‌اوت صددرصد عایق نور',
    fabricCode: 'BLK-101',
    category: 'زبرا و شید',
    colorName: 'خاکستری تیره نانو',
    colorHex: '#334155',
    imageUrl: HERO_IMAGE_PATH,
    texture: 'پارچه دولایه آلومینایز عایق حرارت و نور',
    origin: 'آلمان',
    grammage: '۴۸۰ گرم بر مترمربع',
    lightBlockPercentage: 100,
    suggestedFor: 'اتاق خواب، اتاق کودک و سالن ویدئو پروژکتور',
    description: 'تاریکی مطلق ۱۰۰٪ حتی در اوج ظهر تابستان، جلوگیری از هدررفت انرژی تا ۳۰٪.',
    isConfirmedBySpecialist: true,
  },
  'دوخت پانچ مدرن': {
    id: 'sw-pnc-404',
    title: 'حلقه و نوار پانچ استیل مات ضدزنگ',
    fabricCode: 'PNC-404',
    category: 'اکسسوری و دوخت',
    colorName: 'نقره‌ای مات براش',
    colorHex: '#cbd5e1',
    imageUrl: BLOG_IMAGE_PATH,
    texture: 'حلقه‌های فلزی توکار بدون صدا با فاصله استاندارد ۱۸ سانتیمتر',
    origin: 'ترکیه',
    grammage: 'نوار کتان تقویتی ۵ لایه',
    lightBlockPercentage: 50,
    suggestedFor: 'ایستایی منظم و چین‌های مواج پرده',
    description: 'حرکت بسیار روان روی میله‌های فلزی بدون سایش و تولید صدا.',
    isConfirmedBySpecialist: true,
  },
  'دوخت پلیسه هتلی': {
    id: 'sw-pls-505',
    title: 'دوخت پلیسه مینیمال سه‌چین هتلی',
    fabricCode: 'PLS-505',
    category: 'اکسسوری و دوخت',
    colorName: 'نوار پرده کتان نامرئی',
    colorHex: '#e2e8f0',
    imageUrl: SPECIALIST_IMAGE_PATH,
    texture: 'پلیسه‌های اتوکشیده متقارن با سرب‌دوزی شرکتی',
    origin: 'ایران (تحت لیسانس آلمان)',
    grammage: 'نوار بافت فشرده با نخ نایلون مقاوم',
    lightBlockPercentage: 50,
    suggestedFor: 'پنجره‌های سالن و زیر سقف کاذب',
    description: 'ایستایی فوق‌العاده مرتب و دائمی حتی پس از ده‌ها بار شستشو.',
    isConfirmedBySpecialist: true,
  },
  'دوخت پلیسه مینیمال': {
    id: 'sw-pls-505-b',
    title: 'دوخت پلیسه مینیمال سه‌چین هتلی',
    fabricCode: 'PLS-505',
    category: 'اکسسوری و دوخت',
    colorName: 'نوار پرده کتان نامرئی',
    colorHex: '#e2e8f0',
    imageUrl: SPECIALIST_IMAGE_PATH,
    texture: 'پلیسه‌های اتوکشیده متقارن با سرب‌دوزی شرکتی',
    origin: 'ایران (تحت لیسانس آلمان)',
    grammage: 'نوار بافت فشرده با نخ نایلون مقاوم',
    lightBlockPercentage: 50,
    suggestedFor: 'پنجره‌های سالن و زیر سقف کاذب',
    description: 'ایستایی فوق‌العاده مرتب و دائمی حتی پس از ده‌ها بار شستشو.',
    isConfirmedBySpecialist: true,
  },
  'پرده پانچ کتان چاپی': {
    id: 'sw-lin-prt',
    title: 'کتان چاپی طرح مینیمال ژئومتریک',
    fabricCode: 'LIN-GEO',
    category: 'کتان و چاپ',
    colorName: 'کرم خاکی و سبز پاستلی',
    colorHex: '#86efac',
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?w=1200&h=800&auto=format&fit=crop&q=80',
    texture: 'چاپ راکتیو بدون حساسیت و قابل شستشو',
    origin: 'ترکیه',
    grammage: '۳۸۰ گرم بر مترمربع',
    lightBlockPercentage: 70,
    suggestedFor: 'اتاق کودک، نوجوان و آشپزخانه',
    description: 'رنگ‌های گیاهی کاملاً بدون بو و مقاوم در برابر محو شدن در برابر تابش نور خورشید.',
    isConfirmedBySpecialist: true,
  },
};

/**
 * Returns the swatches associated with an order, or auto-generates realistic swatches
 * from preferredStyles and invoice items if none are explicitly assigned.
 */
export function getOrderSwatches(order: VisitRequest): SelectedSwatchItem[] {
  if (order.selectedSwatches && order.selectedSwatches.length > 0) {
    return order.selectedSwatches;
  }

  const generated: SelectedSwatchItem[] = [];

  // Match from invoice items first if present
  if (order.invoice && order.invoice.items.length > 0) {
    order.invoice.items.forEach((item, index) => {
      const isVelvet = item.title.includes('مخمل') || item.fabricCode.startsWith('CAL') || item.fabricCode.startsWith('ESP');
      const isSheer = item.title.includes('حریر') || item.fabricCode.startsWith('SHN') || item.fabricCode.startsWith('TUR');
      
      let preset: SelectedSwatchItem | undefined;
      if (isVelvet) {
        preset = FABRIC_SWATCH_PRESETS['مخمل کالیفرنیا ترک'];
      } else if (isSheer) {
        preset = FABRIC_SWATCH_PRESETS['حریر شاین و الگانت'];
      }

      generated.push({
        id: `sw-inv-${order.id}-${index}`,
        title: item.title,
        fabricCode: item.fabricCode || `TEX-${index + 101}`,
        category: isVelvet ? 'مخمل' : (isSheer ? 'حریر و تور' : 'پارچه و کالیته'),
        colorName: isVelvet ? 'طوسی فیلی (کد ۸۰۴)' : (isSheer ? 'شیری صدفی (کد ۰۱)' : 'رنگ انتخابی مشتری'),
        colorHex: isVelvet ? '#9ca3af' : (isSheer ? '#fef3c7' : '#d1d5db'),
        imageUrl: preset ? preset.imageUrl : SWATCHES_IMAGE_PATH,
        texture: preset ? preset.texture : 'بافت استاندارد تایید شده اتحادیه',
        origin: preset ? preset.origin : 'ترکیه',
        grammage: preset ? preset.grammage : '۴۵۰ گرم در متر',
        lightBlockPercentage: preset ? preset.lightBlockPercentage : (isVelvet ? 90 : 35),
        suggestedFor: order.rooms.join(' و '),
        description: `کالیته انتخاب‌شده در فاکتور رسمی #${order.invoice?.invoiceNumber || ''}. تضمین صددرصدی تطابق پارچه در هنگام نصب.`,
        isConfirmedBySpecialist: true,
      });
    });
  }

  // Match from preferredStyles
  if (order.preferredStyles && order.preferredStyles.length > 0) {
    order.preferredStyles.forEach((style, idx) => {
      // Find preset by exact name or substring
      let preset = FABRIC_SWATCH_PRESETS[style];
      if (!preset) {
        const foundKey = Object.keys(FABRIC_SWATCH_PRESETS).find((k) => style.includes(k) || k.includes(style));
        if (foundKey) preset = FABRIC_SWATCH_PRESETS[foundKey];
      }

      if (preset && !generated.some((g) => g.fabricCode === preset?.fabricCode)) {
        generated.push({
          ...preset,
          id: `sw-style-${order.id}-${idx}`,
        });
      }
    });
  }

  // If still empty or only 1 item, provide comprehensive luxury defaults
  if (generated.length === 0) {
    generated.push(
      {
        ...FABRIC_SWATCH_PRESETS['مخمل کالیفرنیا ترک'],
        id: `sw-def-1-${order.id}`,
      },
      {
        ...FABRIC_SWATCH_PRESETS['حریر شاین و الگانت'],
        id: `sw-def-2-${order.id}`,
      }
    );
  }

  return generated;
}
