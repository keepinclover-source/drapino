import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, Banknote, AlertTriangle, Clock } from 'lucide-react';
import { EscrowPayment, EscrowStatus, EscrowWithdrawal } from '../types';
import {
  ESCROW_KIND_LABEL,
  ESCROW_STATUS_LABEL,
  ESCROW_STATUS_HINT,
  WITHDRAWAL_SETTLEMENT_NOTE,
  sumEscrow,
} from '../utils/escrow';
import { formatSheba } from '../utils/invoiceUtils';

const fmt = (n: number) => Math.round(n).toLocaleString('fa-IR');

interface Props {
  payments: EscrowPayment[];
  withdrawals: EscrowWithdrawal[];
  sheba?: string;
  onRequestWithdrawal: (paymentIds: string[]) => void;
}

const STATUS_STYLE: Record<EscrowStatus, string> = {
  held: 'bg-amber-100 text-amber-900 border-amber-300',
  released: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  withdrawing: 'bg-sky-100 text-sky-900 border-sky-300',
  paid_out: 'bg-stone-200 text-stone-800 border-stone-300',
};

export const VendorSecureBox: React.FC<Props> = ({ payments, withdrawals, sheba, onRequestWithdrawal }) => {
  const [filter, setFilter] = useState<'all' | EscrowStatus>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');

  const held = sumEscrow(payments, 'held');
  const released = sumEscrow(payments, 'released');
  const withdrawing = sumEscrow(payments, 'withdrawing');
  const paidOut = sumEscrow(payments, 'paid_out');

  const list = payments.filter((p) => filter === 'all' || p.status === filter);
  const releasedIds = payments.filter((p) => p.status === 'released').map((p) => p.id);
  const selectedTotal = payments.filter((p) => selected.includes(p.id)).reduce((s, p) => s + p.amount, 0);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = () => {
    if (!sheba) {
      setError('ابتدا شماره شبای فروشگاه را در «پروفایل و اطلاعات فروشگاه» ثبت کنید.');
      return;
    }
    if (selected.length === 0) {
      setError('حداقل یک تراکنش در حالت «برداشت آزاد» را انتخاب کنید.');
      return;
    }
    setError('');
    onRequestWithdrawal(selected);
    setSelected([]);
  };

  const card = (label: string, value: number, icon: React.ReactNode, cls: string, id: string, hint: string) => (
    <div data-testid={id} className={`rounded-2xl border p-4 ${cls}`}>
      <div className="flex items-center gap-2 text-xs font-bold">{icon}<span>{label}</span></div>
      <div className="text-xl font-black font-mono tabular-nums mt-2">{fmt(value)} <span className="text-xs font-bold">تومان</span></div>
      <p className="text-[10px] mt-1 opacity-80 leading-relaxed">{hint}</p>
    </div>
  );

  return (
    <div className="mt-6 space-y-6 text-right" data-testid="vendor-secure-box">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-900 to-stone-900 text-white p-6 flex items-start gap-3">
        <ShieldCheck className="w-7 h-7 text-emerald-300 shrink-0" />
        <div>
          <h3 className="font-black text-lg">صندوق پرداخت امن</h3>
          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            پرداخت‌هایی که مشتریان از طریق «پرداخت امن» دراپینو انجام داده‌اند اینجا نمایش داده می‌شود. تا زمانی که مشتری تحویل کار را تایید نکند،
            مبلغ در حالت «ذخیره» می‌ماند؛ پس از تایید، به «برداشت آزاد» تبدیل می‌شود و می‌توانید آن را به شبای خود برداشت کنید.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {card('حالت ذخیره', held, <Lock className="w-4 h-4" />, 'bg-amber-50 border-amber-300 text-amber-900', 'box-held', 'پرداخت شده؛ منتظر تایید تحویل کار توسط مشتری')}
        {card('برداشت آزاد', released, <Unlock className="w-4 h-4" />, 'bg-emerald-50 border-emerald-300 text-emerald-900', 'box-released', 'قابل برداشت به شبای ثبت‌شده')}
        {card('در حال واریز', withdrawing, <Clock className="w-4 h-4" />, 'bg-sky-50 border-sky-300 text-sky-900', 'box-withdrawing', 'درخواست ثبت شده؛ ۲۴ تا ۷۲ ساعت')}
        {card('واریز شده', paidOut, <Banknote className="w-4 h-4" />, 'bg-stone-50 border-stone-300 text-stone-800', 'box-paid', 'مجموع مبالغ واریزشده به حساب شما')}
      </div>

      {/* Withdraw bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs space-y-1">
            <div className="font-bold text-stone-900">برداشت وجه</div>
            <div className="text-stone-600">
              شماره شبا:{' '}
              {sheba ? <span className="font-mono" dir="ltr">{formatSheba(sheba)}</span> : <span className="text-rose-600 font-bold">ثبت نشده</span>}
            </div>
            <div className="text-[11px] text-stone-500">{WITHDRAWAL_SETTLEMENT_NOTE}</div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" data-testid="select-all-released" disabled={releasedIds.length === 0} onClick={() => setSelected(releasedIds)} className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-bold disabled:opacity-40 cursor-pointer">
              انتخاب همه برداشت‌های آزاد
            </button>
            <button type="button" data-testid="request-withdrawal" onClick={submit} className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer">
              درخواست برداشت {selected.length > 0 && `(${fmt(selectedTotal)} ت)`}
            </button>
          </div>
        </div>
        {!sheba && (
          <div className="flex items-center gap-2 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
            <AlertTriangle className="w-4 h-4" /> برای برداشت، شماره شبا باید در اطلاعات فروشگاه ثبت شده باشد.
          </div>
        )}
        {error && <p className="text-xs font-bold text-rose-600" data-testid="withdraw-error">{error}</p>}
      </div>

      {/* Transactions */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-bold text-sm text-stone-900">ریز تراکنش‌های پرداخت امن</h4>
          <div className="flex flex-wrap gap-1 text-[11px]">
            {(['all', 'held', 'released', 'withdrawing', 'paid_out'] as const).map((f) => (
              <button key={f} type="button" data-testid={`box-filter-${f}`} onClick={() => setFilter(f)} className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${filter === f ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>
                {f === 'all' ? 'همه' : ESCROW_STATUS_LABEL[f]}
              </button>
            ))}
          </div>
        </div>
        {list.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">تراکنشی برای نمایش وجود ندارد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-stone-50 text-stone-600">
                <tr>
                  <th className="p-3 w-8"></th>
                  <th className="p-3 text-right">سفارش / مشتری</th>
                  <th className="p-3 text-right">بابت</th>
                  <th className="p-3 text-right">مبلغ (تومان)</th>
                  <th className="p-3 text-right">تاریخ پرداخت</th>
                  <th className="p-3 text-right">کد رهگیری</th>
                  <th className="p-3 text-right">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} data-testid="box-row" className="border-t border-stone-100">
                    <td className="p-3">
                      {p.status === 'released' && (
                        <input type="checkbox" data-testid="box-check" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
                      )}
                    </td>
                    <td className="p-3"><div className="font-mono font-bold">#{p.orderNumber}</div><div className="text-stone-500">{p.customerName}</div></td>
                    <td className="p-3">{ESCROW_KIND_LABEL[p.kind]}</td>
                    <td className="p-3 font-mono tabular-nums font-bold">{fmt(p.amount)}</td>
                    <td className="p-3 text-stone-600">{p.paidAt} {p.paidTime}</td>
                    <td className="p-3 font-mono text-[10px]" dir="ltr">{p.trackingCode}</td>
                    <td className="p-3">
                      <span title={ESCROW_STATUS_HINT[p.status]} className={`inline-block px-2 py-1 rounded-lg border text-[11px] font-bold ${STATUS_STYLE[p.status]}`}>
                        {ESCROW_STATUS_LABEL[p.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal history */}
      {withdrawals.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden" data-testid="withdrawal-history">
          <div className="p-4 border-b border-stone-200 font-bold text-sm">سوابق درخواست‌های برداشت</div>
          <div className="divide-y divide-stone-100 text-xs">
            {withdrawals.map((w) => (
              <div key={w.id} className="p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold font-mono tabular-nums">{fmt(w.amount)} تومان</div>
                  <div className="text-stone-500">ثبت: {w.requestedAt} {w.requestedTime} — به شبای <span dir="ltr" className="font-mono">{formatSheba(w.sheba)}</span></div>
                </div>
                <span className={`px-2 py-1 rounded-lg border text-[11px] font-bold ${w.status === 'paid' ? STATUS_STYLE.paid_out : STATUS_STYLE.withdrawing}`}>
                  {w.status === 'paid' ? `واریز شد${w.bankTrackingCode ? ` (${w.bankTrackingCode})` : ''}` : 'در حال واریز (۲۴ تا ۷۲ ساعت)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
