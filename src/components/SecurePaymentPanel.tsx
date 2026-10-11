import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, CreditCard, X } from 'lucide-react';
import { EscrowKind, EscrowPayment, VisitRequest } from '../types';
import {
  ESCROW_KIND_LABEL,
  SECURE_PAYMENT_ASSURANCE,
  SECURE_PAYMENT_SLOGAN,
  SECURE_PAYMENT_WARNING,
  escrowAmountsForOrder,
} from '../utils/escrow';

const fmt = (n: number) => Math.round(n).toLocaleString('fa-IR');

interface Props {
  order: VisitRequest;
  payments: EscrowPayment[];
  onPay: (orderId: string, kind: 'prepayment' | 'final') => void;
  /** نمایش هشدار قرمز (هنگام نمایش فاکتور) */
  showWarning?: boolean;
}

export const SecurePaymentPanel: React.FC<Props> = ({ order, payments, onPay, showWarning = true }) => {
  const [confirmKind, setConfirmKind] = useState<'prepayment' | 'final' | null>(null);
  if (!order.invoice) return null;

  const amounts = escrowAmountsForOrder(order);
  const mine = payments.filter((p) => p.orderId === order.id);
  const find = (k: EscrowKind) => mine.find((p) => p.kind === k);
  const approved = order.status === 'approved' || order.status === 'installed';
  const deposit = find('deposit');
  const prepay = find('prepayment');
  const final = find('final');
  const installDate = order.invoice.deliveryInstallDate;

  const rows: {
    kind: EscrowKind;
    paid?: EscrowPayment;
    amount: number;
    canPay: boolean;
    disabledReason?: string;
  }[] = [
    { kind: 'deposit', paid: deposit, amount: amounts.deposit, canPay: false },
    {
      kind: 'prepayment',
      paid: prepay,
      amount: amounts.prepayment,
      canPay: approved && amounts.prepayment > 0,
      disabledReason: approved ? undefined : 'ابتدا فاکتور را تایید کنید',
    },
    {
      kind: 'final',
      paid: final,
      amount: amounts.final,
      canPay: approved && !!prepay && amounts.final > 0 && order.status !== 'installed',
      disabledReason: !approved ? 'ابتدا فاکتور را تایید کنید' : !prepay ? 'ابتدا پیش‌پرداخت را انجام دهید' : undefined,
    },
  ];

  return (
    <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-4 space-y-3 text-right" data-testid="secure-payment-panel">
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-black text-sm text-emerald-900">{SECURE_PAYMENT_SLOGAN}</div>
          <p className="text-[11px] text-emerald-900/80 leading-relaxed mt-0.5">{SECURE_PAYMENT_ASSURANCE}</p>
        </div>
      </div>

      {showWarning && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900" data-testid="secure-warning">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed font-bold">{SECURE_PAYMENT_WARNING}</p>
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.kind} data-testid={`escrow-row-${r.kind}`} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white border border-stone-200 text-xs">
            <div>
              <div className="font-bold text-stone-900">{ESCROW_KIND_LABEL[r.kind]}</div>
              <div className="font-mono tabular-nums text-stone-600">{fmt(r.amount)} تومان</div>
              {r.kind === 'final' && (
                <div className="text-[10px] text-amber-800 mt-0.5">
                  این مبلغ را ۲۴ تا ۴۸ ساعت قبل از نصب{installDate ? ` (تاریخ نصب: ${installDate})` : ''} از طریق پرداخت امن پرداخت کنید.
                </div>
              )}
              {r.kind === 'deposit' && <div className="text-[10px] text-stone-500 mt-0.5">همان بیعانه‌ای که هنگام ثبت سفارش پرداخت کرده‌اید.</div>}
            </div>
            <div className="text-left">
              {r.paid ? (
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{r.kind === 'deposit' ? 'در صندوق امن' : 'پرداخت شد'}</span>
                  {r.paid.status === 'held' && <span className="text-[10px] font-normal text-stone-500">(امانت نزد دراپینو)</span>}
                  {r.paid.status !== 'held' && <span className="text-[10px] font-normal text-stone-500">(به فروشگاه آزاد شد)</span>}
                </div>
              ) : r.kind === 'deposit' ? (
                <span className="text-[11px] text-stone-500">پس از تایید فاکتور ثبت می‌شود</span>
              ) : r.canPay ? (
                <button
                  type="button"
                  data-testid={`pay-${r.kind}`}
                  onClick={() => setConfirmKind(r.kind as 'prepayment' | 'final')}
                  className="px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>پرداخت امن</span>
                </button>
              ) : (
                <span className="text-[11px] text-stone-400">{r.disabledReason || '—'}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {confirmKind && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 text-right shadow-2xl" data-testid="secure-gateway">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-emerald-900">
                <CreditCard className="w-5 h-5" />
                <span>درگاه پرداخت امن</span>
              </div>
              <button type="button" onClick={() => setConfirmKind(null)} className="p-1 hover:bg-stone-100 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <div className="flex justify-between"><span>سفارش:</span><span className="font-mono">#{order.orderNumber}</span></div>
              <div className="flex justify-between"><span>بابت:</span><span className="font-bold">{ESCROW_KIND_LABEL[confirmKind]}</span></div>
              <div className="flex justify-between"><span>مبلغ قابل پرداخت:</span><span className="font-black font-mono">{fmt(amounts[confirmKind])} تومان</span></div>
            </div>
            <p className="text-[11px] text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl p-3 leading-relaxed">{SECURE_PAYMENT_ASSURANCE}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmKind(null)} className="flex-1 py-2.5 rounded-xl border border-stone-300 text-xs font-bold cursor-pointer">انصراف</button>
              <button
                type="button"
                data-testid="gateway-confirm"
                onClick={() => { onPay(order.id, confirmKind); setConfirmKind(null); }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
              >
                پرداخت و ثبت در صندوق امن
              </button>
            </div>
            <p className="text-[10px] text-stone-400 text-center">نسخه نمایشی: اتصال به درگاه بانکی واقعی در مرحله راه‌اندازی انجام می‌شود.</p>
          </div>
        </div>
      )}
    </div>
  );
};
