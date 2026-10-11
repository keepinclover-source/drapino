/**
 * سیستم محدودیت‌ها و جریمه‌ها
 * همه‌ی منطق خالص (بدون وابستگی به React) اینجاست تا هم پنل ادمین، هم پنل فروشنده و هم App.tsx از یک قانون واحد استفاده کنند.
 */

import type { CurtainVendor, VisitRequest } from '../types';

/* ------------------------------------------------------------------ */
/* انواع داده                                                          */
/* ------------------------------------------------------------------ */

/** محرومیت موقت: فقط تابلوی شکار، یا کل خدمات سامانه */
export type SuspensionScope = 'hunting' | 'all';

export interface VendorSuspension {
  id: string;
  vendorId: string;
  vendorName: string;
  scope: SuspensionScope;
  reason: string;
  durationDays: number;
  startAt: number; // timestamp
  endAt: number; // timestamp
  createdBy: string;
  createdAt: string; // نمایش شمسی
  liftedAt?: number;
  liftedReason?: string;
}

/** سقف روزانه‌ای که مدیر پس از بررسی ۳ سفارش اول تعیین می‌کند */
export interface DailyCapPolicy {
  maxPerDay: number;
  months: number;
  startAt: number;
  untilAt: number;
}

export interface VendorRestrictionState {
  vendorId: string;
  /** probation = فروشنده‌ی جدید؛ released = بررسی شده/قدیمی */
  probation: 'probation' | 'released';
  /** تعداد کل سفارش‌های شکارشده (برای سقف ۳ سفارش اول) */
  totalClaims: number;
  /** زمان اولین شکار سفارش (برای قانون ۷ روز بای‌باکس) */
  firstHuntAt?: number;
  /** زمان شکار سفارش‌ها (جهت شمارش سفارش روزانه) */
  claimLog: number[];
  dailyCap?: DailyCapPolicy;
  /** بافر دستی مدیر (۰ تا ۱۰۰)؛ undefined = محاسبه‌ی خودکار */
  bufferOverride?: number;
  bufferNote?: string;
  reviewedAt?: string;
}

export interface DelayPenalty {
  id: string;
  orderId: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  customerName: string;
  daysLate: number;
  perDayAmount: number;
  amount: number;
  reason: string;
  createdAt: string;
  status: 'applied' | 'revoked';
  revokedAt?: string;
}

export type WalletPenaltyKind = 'no_invoice' | 'custom';

export interface WalletPenalty {
  id: string;
  vendorId: string;
  vendorName: string;
  kind: WalletPenaltyKind;
  amount: number;
  description: string;
  orderId?: string;
  orderNumber?: string;
  transactionId: string;
  createdAt: string;
  refundedAt?: string;
  refundTransactionId?: string;
}

export interface RestrictionSettings {
  /** تعداد سفارش اولیه‌ی فروشنده‌ی جدید قبل از بررسی مدیر */
  probationOrderLimit: number;
  /** سهمیه‌ی پایه‌ی سفارش روزانه‌ی هر فروشنده در بافر ۱۰۰٪ */
  dailyBaseQuota: number;
  /** کمترین فاصله از اولین شکار تا فعال‌سازی بای‌باکس (روز) */
  buyBoxMinDaysAfterFirstHunt: number;
  /** نیاز به آگهی فعال در نردبان و ویترین برای بای‌باکس */
  buyBoxRequiresActiveAd: boolean;
  /** مبلغ پیش‌فرض جریمه‌ی تأخیر در تحویل و نصب برای هر روز (تومان) */
  delayPenaltyPerDay: number;
  /** مبلغ پیش‌فرض جریمه‌ی عدم صدور فاکتور (تومان) */
  noInvoiceFineAmount: number;
}

export interface RestrictionsData {
  /** پس از اولین راه‌اندازی، فروشندگان موجود «قدیمی» محسوب می‌شوند */
  initializedAt?: number;
  settings: RestrictionSettings;
  suspensions: VendorSuspension[];
  vendorStates: Record<string, VendorRestrictionState>;
  delayPenalties: DelayPenalty[];
  walletPenalties: WalletPenalty[];
}

export const DEFAULT_RESTRICTION_SETTINGS: RestrictionSettings = {
  probationOrderLimit: 3,
  dailyBaseQuota: 10,
  buyBoxMinDaysAfterFirstHunt: 7,
  buyBoxRequiresActiveAd: true,
  delayPenaltyPerDay: 500000,
  noInvoiceFineAmount: 1000000,
};

export const INITIAL_RESTRICTIONS: RestrictionsData = {
  settings: DEFAULT_RESTRICTION_SETTINGS,
  suspensions: [],
  vendorStates: {},
  delayPenalties: [],
  walletPenalties: [],
};

/** سازگاری با داده‌ی ذخیره‌شده‌ی قدیمی (فیلدهای ناقص) */
export function normalizeRestrictions(raw: Partial<RestrictionsData> | null | undefined): RestrictionsData {
  const r = raw || {};
  return {
    initializedAt: r.initializedAt,
    settings: { ...DEFAULT_RESTRICTION_SETTINGS, ...(r.settings || {}) },
    suspensions: Array.isArray(r.suspensions) ? r.suspensions : [],
    vendorStates: r.vendorStates && typeof r.vendorStates === 'object' ? r.vendorStates : {},
    delayPenalties: Array.isArray(r.delayPenalties) ? r.delayPenalties : [],
    walletPenalties: Array.isArray(r.walletPenalties) ? r.walletPenalties : [],
  };
}

/* ------------------------------------------------------------------ */
/* ابزارهای زمان                                                       */
/* ------------------------------------------------------------------ */

export const DAY_MS = 24 * 60 * 60 * 1000;

export function isSameLocalDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export function formatFaDateTime(ts: number): string {
  const d = new Date(ts);
  return `${d.toLocaleDateString('fa-IR')} - ${d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
}

export function remainingDaysLabel(endAt: number, now = Date.now()): string {
  const diff = endAt - now;
  if (diff <= 0) return 'پایان یافته';
  const days = Math.floor(diff / DAY_MS);
  const hours = Math.floor((diff % DAY_MS) / (60 * 60 * 1000));
  if (days > 0) return `${days.toLocaleString('fa-IR')} روز و ${hours.toLocaleString('fa-IR')} ساعت`;
  return `${hours.toLocaleString('fa-IR')} ساعت`;
}

/* ------------------------------------------------------------------ */
/* محرومیت‌ها                                                          */
/* ------------------------------------------------------------------ */

export function isSuspensionActive(s: VendorSuspension, now = Date.now()): boolean {
  return !s.liftedAt && s.startAt <= now && now < s.endAt;
}

/** محرومیت فعال فروشنده (all بر hunting اولویت دارد) */
export function getActiveSuspension(
  data: RestrictionsData,
  vendorId: string,
  scope: SuspensionScope | 'any' = 'any',
  now = Date.now()
): VendorSuspension | undefined {
  const active = data.suspensions.filter((s) => s.vendorId === vendorId && isSuspensionActive(s, now));
  if (scope === 'any') return active.find((s) => s.scope === 'all') || active[0];
  if (scope === 'all') return active.find((s) => s.scope === 'all');
  // دسترسی به تابلوی شکار با هر دو نوع محرومیت مسدود می‌شود
  return active.find((s) => s.scope === 'all') || active.find((s) => s.scope === 'hunting');
}

/* ------------------------------------------------------------------ */
/* آمار فروشنده و بافر                                                 */
/* ------------------------------------------------------------------ */

export interface VendorOrderStats {
  total: number;
  success: number;
  failed: number;
  inProgress: number;
}

/** موفق = تأیید فاکتور توسط مشتری یا نصب‌شده، ناموفق = لغوشده */
export function computeVendorOrderStats(orders: VisitRequest[], vendorId: string): VendorOrderStats {
  const mine = orders.filter((o) => o.assignedVendorId === vendorId);
  const success = mine.filter((o) => o.status === 'approved' || o.status === 'installed').length;
  const failed = mine.filter((o) => o.status === 'cancelled').length;
  return { total: mine.length, success, failed, inProgress: mine.length - success - failed };
}

/** بافر خودکار: ۱۰۰٪ منهای درصد سفارش‌های ناموفق (مثال: ۱۰ سفارش، ۲ ناموفق ⇒ ۸۰٪) */
export function computeAutoBuffer(stats: VendorOrderStats): number {
  const decided = stats.success + stats.failed;
  if (decided === 0) return 100;
  return Math.max(0, Math.min(100, Math.round((stats.success / decided) * 100)));
}

export function getEffectiveBuffer(
  state: VendorRestrictionState | undefined,
  stats: VendorOrderStats
): { percent: number; isManual: boolean; auto: number } {
  const auto = computeAutoBuffer(stats);
  if (state && typeof state.bufferOverride === 'number') {
    return { percent: Math.max(0, Math.min(100, state.bufferOverride)), isManual: true, auto };
  }
  return { percent: auto, isManual: false, auto };
}

/** تعداد سفارش مجاز روزانه بر اساس بافر (حداقل ۱ اگر بافر بزرگ‌تر از صفر باشد) */
export function allowedDailyOrders(settings: RestrictionSettings, bufferPercent: number): number {
  if (bufferPercent <= 0) return 0;
  return Math.max(1, Math.round((settings.dailyBaseQuota * bufferPercent) / 100));
}

export function claimsToday(state: VendorRestrictionState | undefined, now = Date.now()): number {
  if (!state) return 0;
  return state.claimLog.filter((t) => isSameLocalDay(t, now)).length;
}

export function isDailyCapActive(state: VendorRestrictionState | undefined, now = Date.now()) {
  return !!state?.dailyCap && now < state.dailyCap.untilAt ? state!.dailyCap : undefined;
}

export function createVendorState(vendorId: string, probation: 'probation' | 'released'): VendorRestrictionState {
  return { vendorId, probation, totalClaims: 0, claimLog: [] };
}

/* ------------------------------------------------------------------ */
/* تصمیم‌گیری: آیا فروشنده می‌تواند سفارش شکار کند؟                    */
/* ------------------------------------------------------------------ */

export interface ClaimDecision {
  ok: boolean;
  reason?: string;
  code?: 'suspended' | 'probation_limit' | 'daily_cap' | 'buffer_quota';
}

export function canVendorClaim(
  data: RestrictionsData,
  vendorId: string,
  orders: VisitRequest[],
  now = Date.now()
): ClaimDecision {
  const susp = getActiveSuspension(data, vendorId, 'hunting', now);
  if (susp) {
    return {
      ok: false,
      code: 'suspended',
      reason:
        `دسترسی شما به ${susp.scope === 'all' ? 'خدمات سامانه' : 'تابلوی شکار سفارشات'} تا ${formatFaDateTime(susp.endAt)} ` +
        `(${remainingDaysLabel(susp.endAt, now)} دیگر) مسدود شده است. دلیل: ${susp.reason}`,
    };
  }

  const state = data.vendorStates[vendorId];
  const { settings } = data;

  if (state && state.probation === 'probation' && state.totalClaims >= settings.probationOrderLimit) {
    return {
      ok: false,
      code: 'probation_limit',
      reason:
        `به‌عنوان فروشنده‌ی جدید فقط ${settings.probationOrderLimit.toLocaleString('fa-IR')} سفارش اول برای شما فعال است و این سقف تکمیل شده. ` +
        'پس از انجام این سفارش‌ها و بررسی عملکرد توسط مدیر سامانه، سقف سفارش روزانه‌ی شما تعیین می‌شود.',
    };
  }

  const todayCount = claimsToday(state, now);

  const cap = isDailyCapActive(state, now);
  if (cap && todayCount >= cap.maxPerDay) {
    return {
      ok: false,
      code: 'daily_cap',
      reason: `سقف سفارش روزانه‌ی شما (${cap.maxPerDay.toLocaleString('fa-IR')} سفارش در روز، تا ${formatFaDateTime(cap.untilAt)}) تکمیل شده است. فردا مجدداً تلاش کنید.`,
    };
  }

  const stats = computeVendorOrderStats(orders, vendorId);
  const buffer = getEffectiveBuffer(state, stats);
  const allowed = allowedDailyOrders(settings, buffer.percent);
  if (todayCount >= allowed) {
    return {
      ok: false,
      code: 'buffer_quota',
      reason:
        `بر اساس بافر فعلی شما (${buffer.percent.toLocaleString('fa-IR')}٪) سهمیه‌ی امروز شما ${allowed.toLocaleString('fa-IR')} سفارش است و تکمیل شده. ` +
        'با تکمیل موفق سفارش‌ها بافر شما افزایش می‌یابد.',
    };
  }

  return { ok: true };
}

/** آیا فروشنده می‌تواند در تخصیص خودکار (بای‌باکس) سفارش بگیرد؟ */
export function canVendorReceiveBuyBoxOrder(data: RestrictionsData, vendorId: string, now = Date.now()): boolean {
  return !getActiveSuspension(data, vendorId, 'hunting', now);
}

/* ------------------------------------------------------------------ */
/* بای‌باکس                                                            */
/* ------------------------------------------------------------------ */

export interface BuyBoxEligibility {
  eligible: boolean;
  reasons: string[];
  daysSinceFirstHunt?: number;
  daysRemaining?: number;
  hasActiveAd: boolean;
}

export function hasActiveLadderAd(vendor: CurtainVendor | undefined, now = Date.now()): boolean {
  if (!vendor || !vendor.isPromotedAd) return false;
  return !vendor.promotedExpiresAt || vendor.promotedExpiresAt > now;
}

export function getBuyBoxEligibility(
  data: RestrictionsData,
  vendor: CurtainVendor | undefined,
  now = Date.now()
): BuyBoxEligibility {
  const reasons: string[] = [];
  const { settings } = data;
  const hasActiveAd = hasActiveLadderAd(vendor, now);
  if (!vendor) return { eligible: false, reasons: ['اطلاعات فروشگاه یافت نشد.'], hasActiveAd };

  const susp = getActiveSuspension(data, vendor.id, 'any', now);
  if (susp) {
    reasons.push(
      `فروشگاه شما تا ${formatFaDateTime(susp.endAt)} از ${susp.scope === 'all' ? 'خدمات سامانه' : 'تابلوی شکار و بای‌باکس'} محروم است.`
    );
  }

  const state = data.vendorStates[vendor.id];
  let daysSinceFirstHunt: number | undefined;
  let daysRemaining: number | undefined;
  if (state?.firstHuntAt === undefined) {
    reasons.push('هنوز اولین سفارش را شکار نکرده‌اید؛ پس از اولین شکار باید حداقل ' + settings.buyBoxMinDaysAfterFirstHunt.toLocaleString('fa-IR') + ' روز بگذرد.');
  } else {
    daysSinceFirstHunt = Math.floor((now - state.firstHuntAt) / DAY_MS);
    daysRemaining = Math.max(0, settings.buyBoxMinDaysAfterFirstHunt - daysSinceFirstHunt);
    if (daysRemaining > 0) {
      reasons.push(
        `از تاریخ اولین شکار سفارش باید حداقل ${settings.buyBoxMinDaysAfterFirstHunt.toLocaleString('fa-IR')} روز بگذرد؛ ` +
          `${daysRemaining.toLocaleString('fa-IR')} روز دیگر باقی مانده است.`
      );
    }
  }

  if (settings.buyBoxRequiresActiveAd && !hasActiveAd) {
    reasons.push('برای شرکت در بای‌باکس باید یک آگهی فعال در «نردبان و ویترین فروشگاه‌های شهر» داشته باشید.');
  }

  return { eligible: reasons.length === 0, reasons, daysSinceFirstHunt, daysRemaining, hasActiveAd };
}

/* ------------------------------------------------------------------ */
/* جریمه تأخیر روی فاکتور                                              */
/* ------------------------------------------------------------------ */

export function getAppliedDelayPenalty(data: RestrictionsData, orderId: string): DelayPenalty | undefined {
  return data.delayPenalties.find((p) => p.orderId === orderId && p.status === 'applied');
}

export const WALLET_PENALTY_LABELS: Record<WalletPenaltyKind, string> = {
  no_invoice: 'جریمه عدم صدور فاکتور',
  custom: 'جریمه ریالی',
};

/* ------------------------------------------------------------------ */
/* ثبت شکار سفارش                                                      */
/* ------------------------------------------------------------------ */

/** ثبت یک شکار موفق: افزایش شمارنده‌ی کل، ثبت زمان اولین شکار و لاگ روزانه */
export function recordVendorClaim(data: RestrictionsData, vendorId: string, now = Date.now()): RestrictionsData {
  const prev = data.vendorStates[vendorId] || createVendorState(vendorId, 'probation');
  const next: VendorRestrictionState = {
    ...prev,
    totalClaims: prev.totalClaims + 1,
    // مقدار ۰ = فروشنده‌ی قدیمی (قبل از راه‌اندازی سیستم) که واجد شرایط بای‌باکس است و تغییر نمی‌کند
    firstHuntAt: prev.firstHuntAt === undefined ? now : prev.firstHuntAt,
    claimLog: [...prev.claimLog.filter((t) => now - t < 40 * DAY_MS), now].slice(-300),
  };
  return { ...data, vendorStates: { ...data.vendorStates, [vendorId]: next } };
}

/* ------------------------------------------------------------------ */
/* خلاصه‌ی وضعیت محدودیت‌های یک فروشنده (برای پنل خودش)                */
/* ------------------------------------------------------------------ */

export interface VendorRestrictionSummary {
  suspension?: VendorSuspension; // محرومیت فعال (هر نوع)
  isProbation: boolean;
  probationLimit: number;
  totalClaims: number;
  awaitingReview: boolean; // سقف ۳ سفارش اول تکمیل و منتظر تصمیم مدیر
  dailyCap?: DailyCapPolicy;
  bufferPercent: number;
  bufferIsManual: boolean;
  allowedToday: number;
  claimedToday: number;
  stats: VendorOrderStats;
  buyBox: BuyBoxEligibility;
  claim: ClaimDecision;
}

export function buildVendorRestrictionSummary(
  data: RestrictionsData,
  vendor: CurtainVendor,
  orders: VisitRequest[],
  now = Date.now()
): VendorRestrictionSummary {
  const state = data.vendorStates[vendor.id];
  const stats = computeVendorOrderStats(orders, vendor.id);
  const buffer = getEffectiveBuffer(state, stats);
  const isProbation = state?.probation === 'probation';
  return {
    suspension: getActiveSuspension(data, vendor.id, 'any', now),
    isProbation,
    probationLimit: data.settings.probationOrderLimit,
    totalClaims: state?.totalClaims || 0,
    awaitingReview: isProbation && (state?.totalClaims || 0) >= data.settings.probationOrderLimit,
    dailyCap: isDailyCapActive(state, now),
    bufferPercent: buffer.percent,
    bufferIsManual: buffer.isManual,
    allowedToday: allowedDailyOrders(data.settings, buffer.percent),
    claimedToday: claimsToday(state, now),
    stats,
    buyBox: getBuyBoxEligibility(data, vendor, now),
    claim: canVendorClaim(data, vendor.id, orders, now),
  };
}

/* ------------------------------------------------------------------ */
/* کیف پول                                                             */
/* ------------------------------------------------------------------ */

const DEBIT_TYPES = new Set([
  'order_claim_fee',
  'sponsored_ladder_fee',
  'buy_box_reservation_fee',
  'penalty_no_invoice',
  'penalty_custom',
]);

/** تراکنش بدهکار (کسر از کیف پول)؟ — برخی تراکنش‌های قدیمی مبلغ مثبت دارند ولی از نوع کسر هستند */
export function isDebitTransaction(tx: { type: string; amount: number }): boolean {
  return tx.amount < 0 || DEBIT_TYPES.has(tx.type);
}

export function isPenaltyTransaction(tx: { type: string }): boolean {
  return tx.type === 'penalty_no_invoice' || tx.type === 'penalty_custom' || tx.type === 'penalty_refund';
}
