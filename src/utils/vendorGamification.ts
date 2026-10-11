import type { CurtainVendor, VisitRequest, WalletTransaction } from '../types';

export type VendorTierKey = 'bronze' | 'silver' | 'gold';

export const TIER_LABEL: Record<VendorTierKey, string> = {
  bronze: 'برنز',
  silver: 'نقره‌ای',
  gold: 'طلایی',
};

export const TIER_FROM_FA: Record<string, VendorTierKey> = {
  برنز: 'bronze',
  'نقره‌ای': 'silver',
  طلایی: 'gold',
};

export const GP = {
  DOCS_VERIFIED: 120,
  CATALOG_SELECTED: 12,
  CATALOG_CUSTOM: 28,
  CATALOG_STAGE_BONUS: 40,
  PORTFOLIO_ITEM: 15,
  PORTFOLIO_STAGE_BONUS: 50, // حداقل ۵ نمونه
  INSTALLER_STAGE: 60, // فقط یک‌بار برای داشتن حداقل ۱ نصاب
  WALLET_BASIC: 50,
  WALLET_PREMIUM: 110,
  LADDER_OPTIONAL: 35,
  FIRST_ORDER: 40,
  CLAIM_ORDER: 15,
  ONTIME_VISIT: 20,
  DIGITAL_INVOICE: 25,
  SECURE_PREPAY: 30,
  ONTIME_DELIVERY: 35,
  SECURE_REMAINING: 30,
} as const;

export const TIER_THRESHOLDS = {
  silver: 280,
  gold: 550,
} as const;

export const WALLET_DISCOUNT: Record<VendorTierKey, number> = {
  bronze: 0,
  silver: 0.02,
  gold: 0.05,
};

export type VendorFeature =
  | 'profile'
  | 'docs'
  | 'catalogs'
  | 'portfolio'
  | 'installers'
  | 'wallet'
  | 'bidding'
  | 'assignments'
  | 'secure_box'
  | 'ladder'
  | 'buy_box'
  | 'reviews';

export interface VendorStageStatus {
  id: number;
  key: string;
  title: string;
  description: string;
  optional?: boolean;
  done: boolean;
  skipped?: boolean;
  locked: boolean;
  pointsEarned: number;
  pointsMax: number;
  progressLabel: string;
  /** تب پنل برای هدایت کاربر */
  targetTab?: 'profile' | 'portfolio' | 'wallet' | 'sponsored_ladder' | null;
}

export interface VendorGameProgress {
  points: number;
  tier: VendorTierKey;
  tierLabel: string;
  stages: VendorStageStatus[];
  /** فقط مرحله جاری برای نمایش */
  currentStage: VendorStageStatus | null;
  currentStageIndex: number;
  unlocked: Record<VendorFeature, boolean>;
  walletDiscount: number;
  isPastFirstMonth: boolean;
  docsPendingAdmin: boolean;
  catalogsCount: number;
  customCatalogsCount: number;
  selectedCatalogsCount: number;
  portfolioCount: number;
  installerCount: number;
  firstOrdersCount: number;
}

function catalogCounts(v: CurtainVendor) {
  const selected = (v.availableCatalogIds || []).length;
  const custom = (v.customCatalogs || []).length;
  return { selected, custom, total: selected + custom };
}

function firstOrdersCount(v: CurtainVendor, orders: VisitRequest[]) {
  const mine = orders.filter(
    (o) =>
      o.assignedVendorId === v.id &&
      ((o.status as string) === 'completed' || (o.status as string) === 'delivered' || o.status === 'installed' || Boolean(o.invoice))
  );
  return Math.max(mine.length, v.successfulOrders || 0, v.completedVisits || 0);
}

function hasWalletTopUp(v: CurtainVendor) {
  const pkg = v.gamification?.walletChargePackage;
  if (pkg === 'basic' || pkg === 'premium') return true;
  const txs = v.transactions || [];
  return txs.some(
    (t) =>
      t.type === 'deposit' ||
      (t.type as string) === 'topup' ||
      (typeof t.amount === 'number' && t.amount > 0 && String(t.description || '').includes('شارژ'))
  );
}

export function resolveTierFromPoints(points: number, faTier?: string): VendorTierKey {
  if (points >= TIER_THRESHOLDS.gold) return 'gold';
  if (points >= TIER_THRESHOLDS.silver) return 'silver';
  if (faTier && TIER_FROM_FA[faTier]) return TIER_FROM_FA[faTier];
  return 'bronze';
}

export function computeVendorGameProgress(vendor: CurtainVendor, orders: VisitRequest[] = []): VendorGameProgress {
  const g = vendor.gamification || {};
  const { selected, custom, total } = catalogCounts(vendor);

  const docsSubmitted = Boolean(
    vendor.nationalCardImageUrl &&
      vendor.businessLicenseImageUrl &&
      !String(vendor.nationalCardImageUrl).includes('unsplash.com') &&
      !String(vendor.businessLicenseImageUrl).includes('unsplash.com')
  ) || Boolean(g.docsSubmittedAt);

  const stage1Done = vendor.verificationStatus === 'verified' && vendor.isVerified === true;
  const docsPendingAdmin = docsSubmitted && vendor.verificationStatus === 'pending_verification';

  const stage2Done = total >= 5 || Boolean(g.catalogsTaskDone);

  const portfolioCount = (vendor.portfolio || []).length;
  const stagePortfolioDone = portfolioCount >= 5 || Boolean(g.portfolioTaskDone);
  const stagePortfolioSkipped = Boolean(g.portfolioSkipped);

  const installerCount = (vendor.installers || []).length;
  const stageInstallersDone = installerCount >= 1 || Boolean(g.installersTaskDone);

  const stageWalletDone = g.walletChargePackage === 'basic' || g.walletChargePackage === 'premium' || hasWalletTopUp(vendor);
  const stageLadderDone = Boolean(vendor.isPromotedAd) || Boolean(g.ladderDone);
  const stageLadderSkipped = Boolean(g.ladderSkipped);
  const firstOrders = Math.min(3, firstOrdersCount(vendor, orders));
  const stageOrdersDone = firstOrders >= 3 || Boolean(g.firstThreeOrdersDone);

  let points = 0;
  if (stage1Done) points += GP.DOCS_VERIFIED;
  points += selected * GP.CATALOG_SELECTED + custom * GP.CATALOG_CUSTOM;
  if (stage2Done) points += GP.CATALOG_STAGE_BONUS;
  points += Math.min(portfolioCount, 10) * GP.PORTFOLIO_ITEM;
  if (stagePortfolioDone) points += GP.PORTFOLIO_STAGE_BONUS;
  if (stageInstallersDone) points += GP.INSTALLER_STAGE;
  if (g.walletChargePackage === 'premium') points += GP.WALLET_PREMIUM;
  else if (stageWalletDone) points += GP.WALLET_BASIC;
  if (stageLadderDone) points += GP.LADDER_OPTIONAL;
  points += firstOrders * GP.FIRST_ORDER;
  points += g.performancePoints || 0;
  points += Math.round((vendor.rating || 0) * (vendor.ratingCount || 0) * 0.5);

  const joined = vendor.joinedDate ? new Date(vendor.joinedDate).getTime() : Date.now();
  const isPastFirstMonth = Date.now() - joined > 30 * 24 * 60 * 60 * 1000;
  const tier = resolveTierFromPoints(points, vendor.tier);
  const walletDiscount = isPastFirstMonth ? WALLET_DISCOUNT[tier] : 0;

  // قفل آبشاری: هر مرحله بعد از تکمیل قبلی (اختیاری‌ها با skip هم باز می‌کنند مسیر)
  const afterCatalogs = stage2Done;
  const afterPortfolioGate = afterCatalogs; // نمونه کار اختیاری — نصاب بعد از کالیته باز است
  const afterInstallers = afterPortfolioGate && stageInstallersDone;
  const afterWallet = afterInstallers && stageWalletDone;

  const stages: VendorStageStatus[] = [
    {
      id: 1,
      key: 'docs',
      title: 'مدارک هویتی',
      description: 'ارسال کارت ملی و جواز کسب — تأیید فقط توسط مدیر سیستم',
      done: stage1Done,
      locked: false,
      pointsEarned: stage1Done ? GP.DOCS_VERIFIED : 0,
      pointsMax: GP.DOCS_VERIFIED,
      progressLabel: stage1Done ? 'تأیید شد' : docsPendingAdmin ? 'در انتظار تأیید مدیر' : docsSubmitted ? 'ارسال شده' : 'ارسال نشده',
      targetTab: null,
    },
    {
      id: 2,
      key: 'catalogs',
      title: '۵ کالیته',
      description: 'انتخاب از لیست یا تعریف کالیته اختصاصی',
      done: stage2Done,
      locked: !stage1Done,
      pointsEarned: selected * GP.CATALOG_SELECTED + custom * GP.CATALOG_CUSTOM + (stage2Done ? GP.CATALOG_STAGE_BONUS : 0),
      pointsMax: 5 * GP.CATALOG_CUSTOM + GP.CATALOG_STAGE_BONUS,
      progressLabel: `${total} از ۵ کالیته`,
      targetTab: 'profile',
    },
    {
      id: 3,
      key: 'portfolio',
      title: 'نمونه کار',
      description: 'حداقل ۵ نمونه کار آپلود کنید (اختیاری — امتیاز دارد)',
      optional: true,
      done: stagePortfolioDone,
      skipped: stagePortfolioSkipped && !stagePortfolioDone,
      locked: !stage2Done,
      pointsEarned: Math.min(portfolioCount, 10) * GP.PORTFOLIO_ITEM + (stagePortfolioDone ? GP.PORTFOLIO_STAGE_BONUS : 0),
      pointsMax: 5 * GP.PORTFOLIO_ITEM + GP.PORTFOLIO_STAGE_BONUS,
      progressLabel: stagePortfolioSkipped && !stagePortfolioDone ? 'رد شد (اختیاری)' : `${portfolioCount} از ۵ نمونه`,
      targetTab: 'portfolio',
    },
    {
      id: 4,
      key: 'installers',
      title: 'ثبت نصاب',
      description: 'حداقل ۱ نصاب با مشخصات و تصویر کارت ملی (تا ۵ نفر)',
      done: stageInstallersDone,
      locked: !stage2Done,
      pointsEarned: stageInstallersDone ? GP.INSTALLER_STAGE : 0,
      pointsMax: GP.INSTALLER_STAGE,
      progressLabel: `${installerCount} نصاب ثبت‌شده`,
      targetTab: null,
    },
    {
      id: 5,
      key: 'wallet',
      title: 'شارژ کیف پول',
      description: 'بسته ۲ شکار یا ۴ شکار',
      done: stageWalletDone,
      locked: !stageInstallersDone,
      pointsEarned: g.walletChargePackage === 'premium' ? GP.WALLET_PREMIUM : stageWalletDone ? GP.WALLET_BASIC : 0,
      pointsMax: GP.WALLET_PREMIUM,
      progressLabel: stageWalletDone ? (g.walletChargePackage === 'premium' ? 'بسته ۴ شکار' : 'بسته ۲ شکار') : 'شارژ نشده',
      targetTab: 'wallet',
    },
    {
      id: 6,
      key: 'ladder',
      title: 'نردبان و آگهی',
      description: 'اختیاری — دیده شدن در صفحه اول شهر',
      optional: true,
      done: stageLadderDone,
      skipped: stageLadderSkipped && !stageLadderDone,
      locked: !stageWalletDone,
      pointsEarned: stageLadderDone ? GP.LADDER_OPTIONAL : 0,
      pointsMax: GP.LADDER_OPTIONAL,
      progressLabel: stageLadderDone ? 'ثبت شده' : stageLadderSkipped ? 'رد شد' : 'اختیاری',
      targetTab: 'sponsored_ladder',
    },
    {
      id: 7,
      key: 'first_orders',
      title: '۳ سفارش اول',
      description: 'انجام موفق سه سفارش ابتدایی',
      done: stageOrdersDone,
      locked: !stageWalletDone,
      pointsEarned: firstOrders * GP.FIRST_ORDER,
      pointsMax: 3 * GP.FIRST_ORDER,
      progressLabel: `${firstOrders} از ۳ سفارش`,
      targetTab: null,
    },
    {
      id: 8,
      key: 'performance',
      title: 'عملکرد مستمر',
      description: 'شکار، بازدید، فاکتور دیجیتال، پرداخت امن، تحویل به‌موقع',
      done: (g.performancePoints || 0) > 0,
      locked: !stageOrdersDone && !isPastFirstMonth,
      pointsEarned: g.performancePoints || 0,
      pointsMax: 500,
      progressLabel: `${g.performancePoints || 0} امتیاز عملکرد`,
      targetTab: null,
    },
  ];

  // مرحله جاری: اولین مرحله‌ای که انجام نشده، قفل نیست، و (اگر اختیاری است هنوز skip نشده)
  let currentStageIndex = stages.findIndex(
    (s) => !s.locked && !s.done && !(s.optional && s.skipped)
  );
  if (currentStageIndex < 0) {
    currentStageIndex = stages.findIndex((s) => !s.done);
  }
  if (currentStageIndex < 0) currentStageIndex = stages.length - 1;

  const unlocked: Record<VendorFeature, boolean> = {
    profile: true,
    docs: true,
    catalogs: stage1Done,
    portfolio: stage2Done,
    installers: stage2Done,
    wallet: stageInstallersDone,
    bidding: afterWallet,
    assignments: afterWallet,
    secure_box: afterWallet,
    ladder: afterWallet,
    buy_box: afterWallet && stageOrdersDone,
    reviews: stage1Done,
  };

  return {
    points,
    tier,
    tierLabel: TIER_LABEL[tier],
    stages,
    currentStage: stages[currentStageIndex] || null,
    currentStageIndex,
    unlocked,
    walletDiscount,
    isPastFirstMonth,
    docsPendingAdmin,
    catalogsCount: total,
    customCatalogsCount: custom,
    selectedCatalogsCount: selected,
    portfolioCount,
    installerCount,
    firstOrdersCount: firstOrders,
  };
}

export const DOCS_UPLOAD_GUIDE = [
  'تصویر کارت ملی باید رنگی، واضح و بدون برش گوشه‌ها باشد (حداکثر ۵ مگابایت، JPG یا PNG).',
  'هر دو روی کارت ملی در صورت امکان در یک قاب خوانا باشد؛ تاری یا بازتاب نور نداشته باشد.',
  'جواز کسب معتبر و تاریخ‌دار؛ نام فروشگاه با اطلاعات ثبت‌نام هم‌خوان باشد.',
  'ارسال مدارک به‌تنهایی مرحله را پاس نمی‌کند؛ تأیید نهایی فقط توسط مدیر سیستم انجام می‌شود.',
  'پس از ارسال، وضعیت «در انتظار تأیید مدیر» می‌ماند تا بررسی دستی انجام شود.',
];
