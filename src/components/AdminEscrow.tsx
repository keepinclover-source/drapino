import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { EscrowPayment, EscrowWithdrawal } from '../types';
import { ESCROW_KIND_LABEL, ESCROW_STATUS_LABEL, sumEscrow } from '../utils/escrow';
import { formatSheba } from '../utils/invoiceUtils';

const fmt = (n: number) => Math.round(n).toLocaleString('fa-IR');

interface Props {
  payments: EscrowPayment[];
  withdrawals: EscrowWithdrawal[];
  onRelease: (paymentId: string) => void;
  onMarkWithdrawalPaid: (withdrawalId: string) => void;
}

export const AdminEscrow: React.FC<Props> = ({ payments, withdrawals, onRelease, onMarkWithdrawalPaid }) => (
  <div className="mt-8 space-y-6 text-right" data-testid="admin-escrow">
    <div>
      <h3 className="font-extrabold text-lg text-stone-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-700" /> صندوق پرداخت امن (امانی)</h3>
      <p className="text-xs text-stone-500 mt-0.5">
        پرداخت‌های امن مشتریان تا تایید تحویل کار نزد سامانه نگه‌داری می‌شود. مدیر می‌تواند در صورت نیاز (مثلاً حل اختلاف) وجه را دستی آزاد کند و واریز درخواست‌های برداشت را ثبت نماید.
      </p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
      {(['held', 'released', 'withdrawing', 'paid_out'] as const).map((s) => (
        <div key={s} className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="text-stone-500">{ESCROW_STATUS_LABEL[s]}</div>
          <div className="font-black font-mono tabular-nums text-lg mt-1">{fmt(sumEscrow(payments, s))}</div>
        </div>
      ))}
    </div>

    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="p-4 border-b font-bold text-sm">همه پرداخت‌های امن</div>
      {payments.length === 0 ? (
        <div className="p-8 text-center text-xs text-stone-500">هنوز پرداخت امنی ثبت نشده است.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-stone-50 text-stone-600">
              <tr><th className="p-3 text-right">سفارش</th><th className="p-3 text-right">فروشگاه</th><th className="p-3 text-right">بابت</th><th className="p-3 text-right">مبلغ</th><th className="p-3 text-right">وضعیت</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} data-testid="admin-escrow-row" className="border-t border-stone-100">
                  <td className="p-3 font-mono">#{p.orderNumber}<div className="text-stone-500 font-sans">{p.customerName}</div></td>
                  <td className="p-3">{p.vendorName}</td>
                  <td className="p-3">{ESCROW_KIND_LABEL[p.kind]}</td>
                  <td className="p-3 font-mono tabular-nums font-bold">{fmt(p.amount)}</td>
                  <td className="p-3">{ESCROW_STATUS_LABEL[p.status]}{p.releasedBy ? ` (${p.releasedBy === 'admin' ? 'آزادسازی توسط مدیر' : 'تایید مشتری'})` : ''}</td>
                  <td className="p-3">
                    {p.status === 'held' && (
                      <button type="button" data-testid="admin-release" onClick={() => { if (window.confirm('وجه به‌صورت دستی آزاد شود؟')) onRelease(p.id); }} className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold cursor-pointer">آزادسازی دستی</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="p-4 border-b font-bold text-sm">درخواست‌های برداشت فروشگاه‌ها</div>
      {withdrawals.length === 0 ? (
        <div className="p-8 text-center text-xs text-stone-500">درخواستی ثبت نشده است.</div>
      ) : (
        <div className="divide-y divide-stone-100 text-xs">
          {withdrawals.map((w) => (
            <div key={w.id} data-testid="admin-withdrawal-row" className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold">{w.vendorName} — <span className="font-mono tabular-nums">{fmt(w.amount)} تومان</span></div>
                <div className="text-stone-500">شبا: <span dir="ltr" className="font-mono">{formatSheba(w.sheba)}</span> — ثبت: {w.requestedAt} {w.requestedTime}</div>
              </div>
              {w.status === 'processing' ? (
                <button type="button" data-testid="admin-mark-paid" onClick={() => onMarkWithdrawalPaid(w.id)} className="px-3 py-2 rounded-lg bg-stone-900 text-white font-bold cursor-pointer">ثبت واریز انجام‌شده</button>
              ) : (
                <span className="px-2 py-1 rounded-lg bg-stone-100 font-bold">واریز شد — {w.bankTrackingCode}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
