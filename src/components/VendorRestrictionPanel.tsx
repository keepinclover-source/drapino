import React from 'react';
import { CurtainVendor } from '../types';
import {
  VendorRestrictionSummary,
  VendorSuspension,
  formatFaDateTime,
  isDebitTransaction,
  remainingDaysLabel,
} from '../utils/restrictions';

const fa = (n: number) => n.toLocaleString('fa-IR');

/** بنر وضعیت محدودیت‌ها و سهمیه‌ی روزانه در بالای پنل فروشنده */
export const VendorRestrictionBanner: React.FC<{ summary?: VendorRestrictionSummary }> = ({ summary }) => {
  if (!summary) return null;
  const items: { tone: 'red' | 'amber' | 'blue' | 'stone'; title: string; text: string }[] = [];

  if (summary.suspension && summary.suspension.scope === 'hunting') {
    items.push({
      tone: 'red',
      title: 'دسترسی شما به تابلوی شکار سفارشات مسدود است',
      text: `تا ${formatFaDateTime(summary.suspension.endAt)} (${remainingDaysLabel(summary.suspension.endAt)} دیگر). دلیل: ${summary.suspension.reason}`,
    });
  }

  if (summary.isProbation) {
    items.push({
      tone: summary.awaitingReview ? 'amber' : 'blue',
      title: summary.awaitingReview
        ? 'عملکرد اولیه شما در حال بررسی است'
        : 'مسیر رشد فروشگاه را کامل کنید',
      text: summary.awaitingReview
        ? 'پس از بررسی عملکرد توسط مدیر سامانه، ظرفیت شکار سفارش شما افزایش می‌یابد.'
        : 'با تکمیل مراحل مسیر رشد (مدارک، کالیته، نصاب و شارژ کیف‌پول) سریع‌تر به شکار سفارش و درآمد پایدار می‌رسید.',
    });
  }

  if (summary.dailyCap) {
    items.push({
      tone: 'stone',
      title: `سقف سفارش روزانه: ${fa(summary.dailyCap.maxPerDay)} سفارش`,
      text: `تا ${formatFaDateTime(summary.dailyCap.untilAt)} — امروز ${fa(summary.claimedToday)} سفارش شکار کرده‌اید.`,
    });
  }

  const toneCls: Record<string, string> = {
    red: 'bg-rose-50 border-rose-300 text-rose-900',
    amber: 'bg-amber-50 border-amber-300 text-amber-900',
    blue: 'bg-sky-50 border-sky-200 text-sky-900',
    stone: 'bg-stone-50 border-stone-200 text-stone-800',
  };

  return (
    <div className="mt-4 space-y-3 text-right" data-testid="vendor-restriction-banner">
      {items.map((it, i) => (
        <div key={i} className={`rounded-xl border p-3.5 ${toneCls[it.tone]}`}>
          <div className="font-black text-sm">{it.title}</div>
          <div className="text-xs mt-1 leading-relaxed">{it.text}</div>
        </div>
      ))}

      <div className="rounded-xl border border-stone-200 bg-white p-3.5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-stone-500">بافر اعتباری شما:</span>
          <span className="w-24 h-2 bg-stone-200 rounded-full overflow-hidden inline-block">
            <span
              className={`block h-full ${summary.bufferPercent >= 80 ? 'bg-emerald-500' : summary.bufferPercent >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${summary.bufferPercent}%` }}
            />
          </span>
          <span className="font-black font-mono">٪{fa(summary.bufferPercent)}</span>
        </div>
        <div>
          <span className="text-stone-500">سهمیه‌ی امروز: </span>
          <span className="font-black font-mono">
            {fa(summary.claimedToday)} از {fa(summary.allowedToday)} سفارش
          </span>
        </div>
        <div className="text-stone-500">
          سفارش‌ها: {fa(summary.stats.success)} موفق، {fa(summary.stats.failed)} ناموفق
        </div>
      </div>
    </div>
  );
};

/** صفحه‌ی محرومیت کامل از خدمات سامانه (فقط مشاهده‌ی دلیل و ریز تراکنش‌ها) */
export const VendorSuspendedScreen: React.FC<{ vendor: CurtainVendor; suspension: VendorSuspension }> = ({
  vendor,
  suspension,
}) => {
  const txs = vendor.transactions || [];
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-right space-y-6" data-testid="vendor-suspended-screen">
      <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 sm:p-8 space-y-3">
        <h1 className="text-xl sm:text-2xl font-black text-rose-900">دسترسی فروشگاه «{vendor.name}» به خدمات سامانه موقتاً مسدود است</h1>
        <p className="text-sm text-rose-900 leading-relaxed">
          <span className="font-bold">دلیل:</span> {suspension.reason}
        </p>
        <p className="text-sm text-rose-900">
          <span className="font-bold">مدت:</span> از {formatFaDateTime(suspension.startAt)} تا {formatFaDateTime(suspension.endAt)} —{' '}
          <span className="font-black">{remainingDaysLabel(suspension.endAt)}</span> باقی‌مانده
        </p>
        <p className="text-xs text-rose-800">
          پس از پایان این مدت، دسترسی شما به‌صورت خودکار برقرار می‌شود. در صورت اعتراض با پشتیبانی سامانه تماس بگیرید.
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-stone-900">ریز تراکنش‌های کیف پول</h2>
          <span className={`font-mono font-black tabular-nums ${(vendor.walletBalance || 0) < 0 ? 'text-rose-700' : 'text-emerald-700'}`} dir="ltr">
            {fa(vendor.walletBalance || 0)} تومان
          </span>
        </div>
        {txs.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-6">تراکنشی ثبت نشده است.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {txs.map((tx) => {
              const debit = isDebitTransaction(tx);
              return (
                <div key={tx.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-stone-900">{tx.description}</div>
                    <div className="text-stone-400 mt-0.5">
                      {tx.date} {tx.time}
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className={`font-mono font-black tabular-nums ${debit ? 'text-rose-700' : 'text-emerald-700'}`} dir="ltr">
                      {debit ? '- ' : '+ '}
                      {fa(Math.abs(tx.amount))}
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono">مانده: {fa(tx.balanceAfter)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
