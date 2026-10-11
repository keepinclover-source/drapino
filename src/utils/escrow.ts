import { EscrowKind, EscrowStatus, EscrowPayment, VisitRequest } from '../types';

export const ESCROW_PAYMENTS_KEY = 'drapino_escrow_payments';
export const ESCROW_WITHDRAWALS_KEY = 'drapino_escrow_withdrawals';

export const ESCROW_KIND_LABEL: Record<EscrowKind, string> = {
  deposit: 'بیعانه مشاوره',
  prepayment: 'پیش‌پرداخت فاکتور',
  final: 'مانده تسویه (قبل از نصب)',
};

export const ESCROW_STATUS_LABEL: Record<EscrowStatus, string> = {
  held: 'ذخیره',
  released: 'برداشت آزاد',
  withdrawing: 'در حال واریز',
  paid_out: 'واریز شده',
};

export const ESCROW_STATUS_HINT: Record<EscrowStatus, string> = {
  held: 'مشتری پرداخت کرده؛ وجه نزد دراپینو امانت است تا مشتری تحویل کار را تایید کند.',
  released: 'تحویل کار تایید شده؛ می‌توانید درخواست برداشت بدهید.',
  withdrawing: 'درخواست برداشت ثبت شده و در حال واریز به شبای شماست (۲۴ تا ۷۲ ساعت).',
  paid_out: 'مبلغ به حساب شبای فروشگاه واریز شده است.',
};

/** پیام‌های ثابت پرداخت امن */
export const SECURE_PAYMENT_SLOGAN = 'پرداخت امن و تضمین خرید آسوده';
export const SECURE_PAYMENT_ASSURANCE =
  'مبلغ پرداختی شما نزد دراپینو امانت می‌ماند و تا زمانی که کار را تحویل نگیرید و تایید نکنید، به حساب فروشگاه واریز نمی‌شود.';
export const SECURE_PAYMENT_WARNING =
  'هشدار: پیش‌پرداخت و مانده فاکتور را فقط از طریق «پرداخت امن» دراپینو انجام دهید. از پرداخت کارت‌به‌کارت یا نقدی مستقیم به فروشنده خودداری کنید؛ در غیر این صورت مبلغ تحت پوشش تضمین دراپینو نخواهد بود.';

export const WITHDRAWAL_SETTLEMENT_NOTE = 'واریز وجه به شبای ثبت‌شده فروشگاه بین ۲۴ تا ۷۲ ساعت پس از ثبت درخواست انجام می‌شود.';

export const makeTrackingCode = (): string =>
  'SP-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100);

export const faNow = () => {
  const now = new Date();
  return {
    date: now.toLocaleDateString('fa-IR'),
    time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
  };
};

/** مبلغ هر مرحله پرداخت امن بر اساس فاکتور سفارش */
export function escrowAmountsForOrder(order: VisitRequest): Record<EscrowKind, number> {
  const inv = order.invoice;
  if (!inv) return { deposit: 0, prepayment: 0, final: 0 };
  const prepayment = Math.max(0, Math.round(inv.customerPrepayment || 0));
  return {
    deposit: Math.max(0, Math.round(inv.depositDeduction || 0)),
    prepayment,
    final: Math.max(0, Math.round((inv.finalPayable || 0) - prepayment)),
  };
}

export const sumEscrow = (list: EscrowPayment[], status: EscrowStatus): number =>
  list.filter((p) => p.status === status).reduce((s, p) => s + p.amount, 0);
