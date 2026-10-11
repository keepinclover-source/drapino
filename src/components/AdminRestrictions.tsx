import React, { useMemo, useState } from 'react';
import { CurtainVendor, VisitRequest } from '../types';
import {
  RestrictionsData,
  RestrictionSettings,
  SuspensionScope,
  WalletPenaltyKind,
  WALLET_PENALTY_LABELS,
  allowedDailyOrders,
  buildVendorRestrictionSummary,
  claimsToday,
  computeVendorOrderStats,
  formatFaDateTime,
  getEffectiveBuffer,
  isSuspensionActive,
  remainingDaysLabel,
} from '../utils/restrictions';

type SubTab = 'overview' | 'suspensions' | 'newcomers' | 'buffer' | 'delay' | 'wallet' | 'settings';

interface AdminRestrictionsProps {
  restrictions: RestrictionsData;
  vendors: CurtainVendor[];
  orders: VisitRequest[];
  onUpdateSettings: (partial: Partial<RestrictionSettings>) => void;
  onAddSuspension: (vendorId: string, scope: SuspensionScope, reason: string, durationDays: number) => boolean | void;
  onLiftSuspension: (suspensionId: string, reason: string) => void;
  onReleaseProbation: (vendorId: string, maxPerDay: number, months: number) => void;
  onSetVendorBuffer: (vendorId: string, percent: number | null, note?: string) => void;
  onApplyDelayPenalty: (orderId: string, daysLate: number, perDayAmount: number, amount: number, reason: string) => boolean | void;
  onRevokeDelayPenalty: (penaltyId: string) => void;
  onApplyWalletPenalty: (
    vendorId: string,
    kind: WalletPenaltyKind,
    amount: number,
    description: string,
    orderId?: string
  ) => boolean | void;
  onRefundWalletPenalty: (penaltyId: string) => void;
}

const fa = (n: number) => (Number.isFinite(n) ? n.toLocaleString('fa-IR') : '—');

const inputCls =
  'w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500';
const labelCls = 'block text-xs font-bold text-stone-700 mb-1';
const cardCls = 'bg-white rounded-2xl border border-stone-200 p-5 shadow-xs';
const btnPrimary =
  'px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold transition-colors cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed';
const btnDanger =
  'px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer';
const btnGhost =
  'px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-bold cursor-pointer';

const Chip: React.FC<{ tone: 'red' | 'amber' | 'green' | 'stone' | 'blue'; children?: React.ReactNode }> = ({
  tone,
  children,
}) => {
  const tones: Record<string, string> = {
    red: 'bg-rose-100 text-rose-800 border-rose-300',
    amber: 'bg-amber-100 text-amber-900 border-amber-300',
    green: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    stone: 'bg-stone-100 text-stone-700 border-stone-300',
    blue: 'bg-sky-100 text-sky-800 border-sky-300',
  };
  return (
    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
};

const Notice: React.FC<{ tone?: 'info' | 'warn' | 'ok' | 'err'; children?: React.ReactNode }> = ({ tone = 'info', children }) => {
  const tones = {
    info: 'bg-sky-50 border-sky-200 text-sky-900',
    warn: 'bg-amber-50 border-amber-300 text-amber-900',
    ok: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    err: 'bg-rose-50 border-rose-300 text-rose-900',
  };
  return <div className={`text-xs leading-relaxed rounded-xl border p-3 ${tones[tone]}`}>{children}</div>;
};

export const AdminRestrictions: React.FC<AdminRestrictionsProps> = ({
  restrictions,
  vendors,
  orders,
  onUpdateSettings,
  onAddSuspension,
  onLiftSuspension,
  onReleaseProbation,
  onSetVendorBuffer,
  onApplyDelayPenalty,
  onRevokeDelayPenalty,
  onApplyWalletPenalty,
  onRefundWalletPenalty,
}) => {
  const [tab, setTab] = useState<SubTab>('overview');
  const [search, setSearch] = useState('');
  const [flash, setFlash] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const notify = (tone: 'ok' | 'err', text: string) => {
    setFlash({ tone, text });
    setTimeout(() => setFlash(null), 4000);
  };

  const { settings } = restrictions;
  const now = Date.now();

  /* ---------------- فرم محرومیت ---------------- */
  const [suspVendorId, setSuspVendorId] = useState('');
  const [suspScope, setSuspScope] = useState<SuspensionScope>('hunting');
  const [suspDays, setSuspDays] = useState('7');
  const [suspReason, setSuspReason] = useState('');
  const [liftReasons, setLiftReasons] = useState<Record<string, string>>({});

  /* ---------------- فرم دوره‌ی آزمایشی ---------------- */
  const [capInputs, setCapInputs] = useState<Record<string, { perDay: string; months: string }>>({});

  /* ---------------- فرم بافر ---------------- */
  const [bufferInputs, setBufferInputs] = useState<Record<string, string>>({});

  /* ---------------- فرم جریمه تأخیر ---------------- */
  const [delayOrderId, setDelayOrderId] = useState('');
  const [delayDays, setDelayDays] = useState('1');
  const [delayPerDay, setDelayPerDay] = useState(String(settings.delayPenaltyPerDay));
  const [delayAmountEdited, setDelayAmountEdited] = useState<string | null>(null);
  const [delayReason, setDelayReason] = useState('');

  /* ---------------- فرم جریمه کیف پول ---------------- */
  const [wpVendorId, setWpVendorId] = useState('');
  const [wpKind, setWpKind] = useState<WalletPenaltyKind>('no_invoice');
  const [wpOrderId, setWpOrderId] = useState('');
  const [wpAmount, setWpAmount] = useState(String(settings.noInvoiceFineAmount));
  const [wpDescription, setWpDescription] = useState('');

  const filteredVendors = useMemo(() => {
    const q = search.trim();
    return q ? vendors.filter((v) => v.name.includes(q) || (v.city || '').includes(q)) : vendors;
  }, [vendors, search]);

  const vendorById = (id: string) => vendors.find((v) => v.id === id);

  const eligibleDelayOrders = orders.filter(
    (o) =>
      o.assignedVendorId &&
      (o.status === 'approved' || o.status === 'installed' || o.status === 'visited') &&
      !restrictions.delayPenalties.some((p) => p.orderId === o.id && p.status === 'applied')
  );

  const delayDaysNum = Math.max(0, Math.round(Number(delayDays) || 0));
  const delayPerDayNum = Math.max(0, Math.round(Number(delayPerDay) || 0));
  const delayAutoAmount = delayDaysNum * delayPerDayNum;
  const delayAmountNum = delayAmountEdited !== null ? Math.max(0, Math.round(Number(delayAmountEdited) || 0)) : delayAutoAmount;

  const wpVendor = vendorById(wpVendorId);
  const wpVendorOrders = orders.filter((o) => o.assignedVendorId === wpVendorId);
  const wpAmountNum = Math.max(0, Math.round(Number(wpAmount) || 0));

  const tabs: { id: SubTab; label: string; badge?: string | number | null }[] = [
    { id: 'overview', label: 'نمای کلی فروشندگان' },
    {
      id: 'suspensions',
      label: 'محرومیت‌های موقت',
      badge: restrictions.suspensions.filter((s) => isSuspensionActive(s, now)).length || null,
    },
    {
      id: 'newcomers',
      label: 'فروشندگان جدید',
      badge:
        Object.values(restrictions.vendorStates).filter(
          (st) => st.probation === 'probation' && st.totalClaims >= settings.probationOrderLimit
        ).length || null,
    },
    { id: 'buffer', label: 'بافر فروشندگان' },
    { id: 'delay', label: 'جریمه تأخیر نصب و تحویل' },
    { id: 'wallet', label: 'جریمه از کیف پول' },
    { id: 'settings', label: 'تنظیمات و قوانین' },
  ];

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-200">
      {/* هدر */}
      <div className={`${cardCls} flex flex-col md:flex-row md:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-xl font-black text-stone-900">محدودیت‌ها و جریمه‌ها</h2>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            محرومیت موقت فروشندگان، سقف سفارش فروشندگان جدید، بافر اعتباری، قوانین بای‌باکس و جریمه‌های مالی. همه‌ی موارد در دیتابیس ذخیره می‌شوند.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <Chip tone="red">{fa(restrictions.suspensions.filter((s) => isSuspensionActive(s, now)).length)} محرومیت فعال</Chip>
          <Chip tone="amber">{fa(restrictions.delayPenalties.filter((p) => p.status === 'applied').length)} جریمه تأخیر</Chip>
          <Chip tone="stone">{fa(restrictions.walletPenalties.length)} جریمه کیف پول</Chip>
        </div>
      </div>

      {flash && <Notice tone={flash.tone}>{flash.text}</Notice>}

      {/* زیرتب‌ها */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
              tab === t.id
                ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            {t.label}
            {t.badge ? <span className="mr-2 text-[10px] bg-rose-600 text-white rounded-full px-1.5 py-0.5">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* ============ نمای کلی ============ */}
      {tab === 'overview' && (
        <div className={cardCls}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-black text-stone-900">وضعیت محدودیت‌های هر فروشگاه</h3>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی نام فروشگاه یا شهر..."
              className={`${inputCls} max-w-xs`}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="text-stone-500 border-b border-stone-200">
                  <th className="pb-2 pr-2">فروشگاه</th>
                  <th className="pb-2">وضعیت</th>
                  <th className="pb-2">سفارش‌ها (موفق/ناموفق/کل)</th>
                  <th className="pb-2">بافر</th>
                  <th className="pb-2">سهمیه امروز</th>
                  <th className="pb-2">بای‌باکس</th>
                  <th className="pb-2 pl-2">کیف پول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredVendors.map((v) => {
                  const sum = buildVendorRestrictionSummary(restrictions, v, orders, now);
                  return (
                    <tr key={v.id} className="hover:bg-stone-50">
                      <td className="py-3 pr-2">
                        <div className="font-bold text-stone-900">{v.name}</div>
                        <div className="text-[10px] text-stone-400">{v.city}</div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {sum.suspension && (
                            <Chip tone="red">{sum.suspension.scope === 'all' ? 'محروم از کل خدمات' : 'محروم از شکار'}</Chip>
                          )}
                          {sum.isProbation && (
                            <Chip tone={sum.awaitingReview ? 'amber' : 'blue'}>
                              {sum.awaitingReview ? 'منتظر بررسی مدیر' : `جدید (${fa(sum.totalClaims)}/${fa(sum.probationLimit)})`}
                            </Chip>
                          )}
                          {sum.dailyCap && <Chip tone="amber">سقف {fa(sum.dailyCap.maxPerDay)} در روز</Chip>}
                          {!sum.suspension && !sum.isProbation && !sum.dailyCap && <Chip tone="green">بدون محدودیت</Chip>}
                        </div>
                      </td>
                      <td className="py-3 font-mono tabular-nums">
                        {fa(sum.stats.success)} / {fa(sum.stats.failed)} / {fa(sum.stats.total)}
                      </td>
                      <td className="py-3 font-mono font-bold">
                        ٪{fa(sum.bufferPercent)}
                        {sum.bufferIsManual && <span className="text-[10px] text-amber-700 mr-1">(دستی)</span>}
                      </td>
                      <td className="py-3 font-mono">
                        {fa(sum.claimedToday)} از {fa(sum.allowedToday)}
                      </td>
                      <td className="py-3">
                        {sum.buyBox.eligible ? <Chip tone="green">واجد شرایط</Chip> : <Chip tone="stone">ناواجد</Chip>}
                      </td>
                      <td
                        className={`py-3 pl-2 font-mono tabular-nums font-bold ${
                          (v.walletBalance || 0) < 0 ? 'text-rose-700' : 'text-stone-800'
                        }`}
                        dir="ltr"
                      >
                        {fa(v.walletBalance || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ محرومیت‌ها ============ */}
      {tab === 'suspensions' && (
        <div className="space-y-6">
          <div className={`${cardCls} space-y-4`}>
            <h3 className="font-black text-stone-900">محروم کردن فروشگاه برای مدت مشخص</h3>
            <Notice tone="info">
              «تابلوی شکار» یعنی فروشگاه نمی‌تواند سفارش شکار کند و در بای‌باکس نیز سفارش دریافت نمی‌کند. «کل خدمات سامانه» یعنی پنل فروشگاه
              مسدود می‌شود و فروشگاه در بخش‌های مشتریان نمایش داده نمی‌شود. بعد از پایان مدت، محرومیت خودکار برداشته می‌شود.
            </Notice>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>فروشگاه</label>
                <select value={suspVendorId} onChange={(e) => setSuspVendorId(e.target.value)} className={inputCls}>
                  <option value="">انتخاب فروشگاه...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>نوع محرومیت</label>
                <div className="flex gap-2">
                  {(
                    [
                      ['hunting', 'تابلوی شکار سفارشات'],
                      ['all', 'کل خدمات سامانه'],
                    ] as [SuspensionScope, string][]
                  ).map(([val, lab]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSuspScope(val)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                        suspScope === val ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-stone-700 border-stone-300'
                      }`}
                    >
                      {lab}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>مدت محرومیت (روز)</label>
                <input type="number" min={1} value={suspDays} onChange={(e) => setSuspDays(e.target.value)} className={inputCls} />
                <div className="flex gap-1.5 mt-1.5">
                  {[3, 7, 14, 30, 90].map((d) => (
                    <button key={d} type="button" onClick={() => setSuspDays(String(d))} className={btnGhost}>
                      {fa(d)} روز
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>دلیل محرومیت (برای فروشنده نمایش داده می‌شود)</label>
                <textarea
                  value={suspReason}
                  onChange={(e) => setSuspReason(e.target.value)}
                  rows={3}
                  className={inputCls}
                  placeholder="مثلاً: برخورد نامناسب با مشتری در سفارش ..."
                />
              </div>
            </div>
            <button
              type="button"
              className={btnPrimary}
              disabled={!suspVendorId || !suspReason.trim() || !(Number(suspDays) > 0)}
              onClick={() => {
                const ok = onAddSuspension(suspVendorId, suspScope, suspReason, Math.round(Number(suspDays)));
                if (ok === false) return notify('err', 'ثبت محرومیت انجام نشد.');
                notify('ok', 'محرومیت ثبت شد و به فروشنده اطلاع‌رسانی گردید.');
                setSuspReason('');
              }}
            >
              ثبت محرومیت
            </button>
          </div>

          <div className={cardCls}>
            <h3 className="font-black text-stone-900 mb-3">فهرست محرومیت‌ها</h3>
            {restrictions.suspensions.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">تاکنون محرومیتی ثبت نشده است.</p>
            ) : (
              <div className="space-y-3">
                {restrictions.suspensions.map((s) => {
                  const active = isSuspensionActive(s, now);
                  return (
                    <div key={s.id} className="border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="space-y-1 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-stone-900 text-sm">{s.vendorName}</span>
                          <Chip tone={s.scope === 'all' ? 'red' : 'amber'}>{s.scope === 'all' ? 'کل خدمات' : 'تابلوی شکار'}</Chip>
                          {s.liftedAt ? <Chip tone="stone">لغو شده</Chip> : active ? <Chip tone="red">فعال</Chip> : <Chip tone="green">پایان یافته</Chip>}
                        </div>
                        <div className="text-stone-600">دلیل: {s.reason}</div>
                        <div className="text-stone-500">
                          از {formatFaDateTime(s.startAt)} تا {formatFaDateTime(s.endAt)} ({fa(s.durationDays)} روز) — ثبت‌کننده: {s.createdBy}
                        </div>
                        {active && <div className="text-rose-700 font-bold">باقی‌مانده: {remainingDaysLabel(s.endAt, now)}</div>}
                        {s.liftedAt && <div className="text-stone-500">لغو در {formatFaDateTime(s.liftedAt)}: {s.liftedReason}</div>}
                      </div>
                      {active && (
                        <div className="flex flex-col gap-2 md:w-64 shrink-0">
                          <input
                            value={liftReasons[s.id] || ''}
                            onChange={(e) => setLiftReasons({ ...liftReasons, [s.id]: e.target.value })}
                            placeholder="دلیل لغو (اختیاری)"
                            className={inputCls}
                          />
                          <button type="button" className={btnDanger} onClick={() => onLiftSuspension(s.id, liftReasons[s.id] || '')}>
                            لغو زودهنگام محرومیت
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ فروشندگان جدید ============ */}
      {tab === 'newcomers' && (
        <div className="space-y-6">
          <Notice tone="info">
            هر فروشنده‌ی تازه‌ثبت‌نام‌شده فقط {fa(settings.probationOrderLimit)} سفارش اول را می‌تواند شکار کند. پس از آن شکار سفارش برای او بسته می‌شود تا شما
            عملکردش را بررسی کنید و سقف سفارش روزانه (برای x ماه) تعیین کنید. فروشندگانِ موجود قبل از راه‌اندازی این سیستم «قدیمی» محسوب می‌شوند.
          </Notice>

          <div className={cardCls}>
            <h3 className="font-black text-stone-900 mb-3">فروشندگان در دوره‌ی آزمایشی</h3>
            {Object.values(restrictions.vendorStates).filter((st) => st.probation === 'probation').length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">فعلاً فروشنده‌ی جدیدی در دوره‌ی آزمایشی نیست.</p>
            ) : (
              <div className="space-y-3">
                {Object.values(restrictions.vendorStates)
                  .filter((st) => st.probation === 'probation')
                  .map((st) => {
                    const v = vendorById(st.vendorId);
                    if (!v) return null;
                    const stats = computeVendorOrderStats(orders, v.id);
                    const done = st.totalClaims >= settings.probationOrderLimit;
                    const inp = capInputs[v.id] || { perDay: '3', months: '3' };
                    return (
                      <div key={v.id} className={`border rounded-xl p-4 space-y-3 ${done ? 'border-amber-400 bg-amber-50/50' : 'border-stone-200'}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-stone-900">{v.name}</span>
                          <Chip tone={done ? 'amber' : 'blue'}>
                            {fa(st.totalClaims)} از {fa(settings.probationOrderLimit)} سفارش شکار شده
                          </Chip>
                          {done && <Chip tone="red">شکار بسته است — منتظر تصمیم شما</Chip>}
                        </div>
                        <div className="text-xs text-stone-600">
                          عملکرد تاکنون: {fa(stats.success)} موفق، {fa(stats.failed)} ناموفق، {fa(stats.inProgress)} در جریان
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className={labelCls}>حداکثر سفارش در روز</label>
                            <input
                              type="number"
                              min={0}
                              value={inp.perDay}
                              onChange={(e) => setCapInputs({ ...capInputs, [v.id]: { ...inp, perDay: e.target.value } })}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>به مدت (ماه)</label>
                            <input
                              type="number"
                              min={0}
                              value={inp.months}
                              onChange={(e) => setCapInputs({ ...capInputs, [v.id]: { ...inp, months: e.target.value } })}
                              className={inputCls}
                            />
                          </div>
                          <button
                            type="button"
                            className={btnPrimary}
                            onClick={() => {
                              onReleaseProbation(v.id, Math.round(Number(inp.perDay) || 0), Math.round(Number(inp.months) || 0));
                              notify('ok', `دوره‌ی آزمایشی «${v.name}» پایان یافت و سقف روزانه اعمال شد.`);
                            }}
                          >
                            پایان دوره و اعمال سقف
                          </button>
                          <button
                            type="button"
                            className={btnGhost}
                            onClick={() => {
                              onReleaseProbation(v.id, 0, 0);
                              notify('ok', `«${v.name}» بدون سقف روزانه آزاد شد.`);
                            }}
                          >
                            آزادسازی بدون سقف
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className={cardCls}>
            <h3 className="font-black text-stone-900 mb-3">سقف‌های روزانه‌ی فعال</h3>
            {(() => {
              const withCap = Object.values(restrictions.vendorStates).filter((st) => st.dailyCap && now < st.dailyCap.untilAt);
              if (withCap.length === 0) return <p className="text-xs text-stone-500 py-4 text-center">هیچ فروشگاهی سقف روزانه‌ی فعال ندارد.</p>;
              return (
                <div className="space-y-2">
                  {withCap.map((st) => {
                    const v = vendorById(st.vendorId);
                    return (
                      <div key={st.vendorId} className="flex flex-wrap items-center justify-between gap-2 border border-stone-200 rounded-xl p-3 text-xs">
                        <div>
                          <span className="font-bold text-stone-900">{v?.name || st.vendorId}</span>
                          <span className="text-stone-600 mr-2">
                            حداکثر {fa(st.dailyCap!.maxPerDay)} سفارش در روز تا {formatFaDateTime(st.dailyCap!.untilAt)} (امروز: {fa(claimsToday(st))})
                          </span>
                        </div>
                        <button type="button" className={btnDanger} onClick={() => onReleaseProbation(st.vendorId, 0, 0)}>
                          حذف سقف
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ============ بافر ============ */}
      {tab === 'buffer' && (
        <div className={`${cardCls} space-y-4`}>
          <h3 className="font-black text-stone-900">بافر فروشندگان</h3>
          <Notice tone="info">
            بافر هر فروشنده در ابتدا ۱۰۰٪ است. با هر سفارش ناموفق (لغوشده) درصد آن کم می‌شود؛ مثلاً ۱۰ سفارش با ۸ موفق و ۲ ناموفق یعنی بافر ۸۰٪ و
            فروشنده فقط ۸۰٪ سهمیه‌ی روزانه ({fa(settings.dailyBaseQuota)} سفارش) را می‌تواند بگیرد. می‌توانید بافر هر فروشنده را دستی نیز تنظیم کنید.
          </Notice>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="text-stone-500 border-b border-stone-200">
                  <th className="pb-2 pr-2">فروشگاه</th>
                  <th className="pb-2">موفق / ناموفق</th>
                  <th className="pb-2">بافر خودکار</th>
                  <th className="pb-2">بافر مؤثر</th>
                  <th className="pb-2">سهمیه روزانه</th>
                  <th className="pb-2">تنظیم دستی (٪)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {vendors.map((v) => {
                  const st = restrictions.vendorStates[v.id];
                  const stats = computeVendorOrderStats(orders, v.id);
                  const buf = getEffectiveBuffer(st, stats);
                  const inputVal = bufferInputs[v.id] ?? (buf.isManual ? String(buf.percent) : '');
                  return (
                    <tr key={v.id}>
                      <td className="py-3 pr-2 font-bold text-stone-900">{v.name}</td>
                      <td className="py-3 font-mono">
                        {fa(stats.success)} / {fa(stats.failed)}
                      </td>
                      <td className="py-3 font-mono">٪{fa(buf.auto)}</td>
                      <td className="py-3">
                        <div className="w-28 h-2 bg-stone-200 rounded-full overflow-hidden mb-1">
                          <div
                            className={`h-full ${buf.percent >= 80 ? 'bg-emerald-500' : buf.percent >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${buf.percent}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold">٪{fa(buf.percent)}</span>
                        {buf.isManual && <span className="text-[10px] text-amber-700 mr-1">(دستی)</span>}
                      </td>
                      <td className="py-3 font-mono">{fa(allowedDailyOrders(settings, buf.percent))} سفارش</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={inputVal}
                            onChange={(e) => setBufferInputs({ ...bufferInputs, [v.id]: e.target.value })}
                            placeholder="خودکار"
                            className={`${inputCls} w-24`}
                          />
                          <button
                            type="button"
                            className={btnGhost}
                            disabled={inputVal === ''}
                            onClick={() => {
                              onSetVendorBuffer(v.id, Number(inputVal), 'تنظیم دستی مدیر');
                              notify('ok', `بافر «${v.name}» روی ${fa(Number(inputVal))}٪ تنظیم شد.`);
                            }}
                          >
                            ثبت
                          </button>
                          {buf.isManual && (
                            <button
                              type="button"
                              className={btnDanger}
                              onClick={() => {
                                onSetVendorBuffer(v.id, null);
                                setBufferInputs({ ...bufferInputs, [v.id]: '' });
                              }}
                            >
                              خودکار
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ جریمه تأخیر ============ */}
      {tab === 'delay' && (
        <div className="space-y-6">
          <div className={`${cardCls} space-y-4`}>
            <h3 className="font-black text-stone-900">اعمال جریمه تأخیر در تحویل و نصب</h3>
            <Notice tone="warn">
              جریمه در فاکتور مشتری اعلام می‌شود و از مبلغ قابل پرداخت کسر می‌گردد. طبق متن فاکتور، اگر مشتری تسویه حساب کامل را ۴۸ تا ۲۴ ساعت قبل از
              موعد نصب انجام نداده باشد، فروشنده مشمول جریمه نمی‌شود؛ پیش از ثبت، این موضوع را بررسی کنید.
            </Notice>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelCls}>سفارش</label>
                <select value={delayOrderId} onChange={(e) => setDelayOrderId(e.target.value)} className={inputCls}>
                  <option value="">انتخاب سفارش دارای فاکتور...</option>
                  {eligibleDelayOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.orderNumber} — {o.customerName} — {o.assignedVendorName}
                      {o.invoice?.deliveryInstallDate ? ` — موعد نصب: ${o.invoice.deliveryInstallDate}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>تعداد روز تأخیر</label>
                <input type="number" min={1} value={delayDays} onChange={(e) => { setDelayDays(e.target.value); setDelayAmountEdited(null); }} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>جریمه‌ی هر روز تأخیر (تومان)</label>
                <input type="number" min={0} value={delayPerDay} onChange={(e) => { setDelayPerDay(e.target.value); setDelayAmountEdited(null); }} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>مبلغ نهایی جریمه (تومان) — قابل ویرایش</label>
                <input
                  type="number"
                  min={0}
                  value={delayAmountEdited !== null ? delayAmountEdited : String(delayAutoAmount)}
                  onChange={(e) => setDelayAmountEdited(e.target.value)}
                  className={inputCls}
                />
                <p className="text-[11px] text-stone-500 mt-1">محاسبه‌ی خودکار: {fa(delayDaysNum)} روز × {fa(delayPerDayNum)} = {fa(delayAutoAmount)} تومان</p>
              </div>
              <div>
                <label className={labelCls}>توضیح برای فاکتور</label>
                <input value={delayReason} onChange={(e) => setDelayReason(e.target.value)} className={inputCls} placeholder="مثلاً: تحویل پرده با ۳ روز تأخیر نسبت به موعد مقرر" />
              </div>
            </div>
            <button
              type="button"
              className={btnPrimary}
              disabled={!delayOrderId || delayDaysNum <= 0 || delayAmountNum <= 0}
              onClick={() => {
                const ok = onApplyDelayPenalty(delayOrderId, delayDaysNum, delayPerDayNum, delayAmountNum, delayReason || 'تأخیر در تحویل و نصب');
                if (ok === false) return notify('err', 'ثبت جریمه انجام نشد (برای این سفارش قبلاً جریمه ثبت شده یا اطلاعات ناقص است).');
                notify('ok', 'جریمه‌ی تأخیر ثبت شد و در فاکتور مشتری نمایش داده می‌شود.');
                setDelayOrderId('');
                setDelayReason('');
                setDelayAmountEdited(null);
              }}
            >
              ثبت جریمه و اعلام در فاکتور
            </button>
          </div>

          <div className={cardCls}>
            <h3 className="font-black text-stone-900 mb-3">جریمه‌های تأخیر ثبت‌شده</h3>
            {restrictions.delayPenalties.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">جریمه‌ی تأخیری ثبت نشده است.</p>
            ) : (
              <div className="space-y-3">
                {restrictions.delayPenalties.map((p) => (
                  <div key={p.id} className="border border-stone-200 rounded-xl p-4 flex flex-wrap items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-stone-900 text-sm">سفارش #{p.orderNumber}</span>
                        <Chip tone={p.status === 'applied' ? 'red' : 'stone'}>{p.status === 'applied' ? 'اعمال‌شده' : 'لغو شده'}</Chip>
                      </div>
                      <div className="text-stone-600">
                        فروشگاه {p.vendorName} — مشتری {p.customerName}
                      </div>
                      <div className="text-stone-600">
                        {fa(p.daysLate)} روز تأخیر × {fa(p.perDayAmount)} ={' '}
                        <span className="font-bold text-rose-700">{fa(p.amount)} تومان</span>
                      </div>
                      <div className="text-stone-500">{p.reason} — {p.createdAt}</div>
                    </div>
                    {p.status === 'applied' && (
                      <button type="button" className={btnDanger} onClick={() => onRevokeDelayPenalty(p.id)}>
                        لغو جریمه
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ جریمه کیف پول ============ */}
      {tab === 'wallet' && (
        <div className="space-y-6">
          <div className={`${cardCls} space-y-4`}>
            <h3 className="font-black text-stone-900">کسر جریمه از کیف پول فروشگاه</h3>
            <Notice tone="warn">
              مبلغ مستقیماً از کیف پول فروشگاه کسر می‌شود و ممکن است موجودی منفی شود (تا شارژ مجدد، شکار سفارش و رزرو بای‌باکس برای آن فروشگاه ممکن
              نیست). شرح و مبلغ جریمه در «ریز تراکنش‌های کیف پول» فروشنده درج می‌شود.
            </Notice>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>فروشگاه</label>
                <select
                  value={wpVendorId}
                  onChange={(e) => {
                    setWpVendorId(e.target.value);
                    setWpOrderId('');
                  }}
                  className={inputCls}
                >
                  <option value="">انتخاب فروشگاه...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — موجودی: {fa(v.walletBalance || 0)} تومان
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>نوع جریمه</label>
                <div className="flex gap-2">
                  {(
                    [
                      ['no_invoice', 'عدم صدور فاکتور'],
                      ['custom', 'جریمه ریالی (موارد دیگر)'],
                    ] as [WalletPenaltyKind, string][]
                  ).map(([val, lab]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setWpKind(val);
                        if (val === 'no_invoice') setWpAmount(String(settings.noInvoiceFineAmount));
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                        wpKind === val ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-stone-700 border-stone-300'
                      }`}
                    >
                      {lab}
                    </button>
                  ))}
                </div>
              </div>
              {wpKind === 'no_invoice' && (
                <div>
                  <label className={labelCls}>سفارش مربوطه (در صورت وجود)</label>
                  <select value={wpOrderId} onChange={(e) => setWpOrderId(e.target.value)} className={inputCls} disabled={!wpVendorId}>
                    <option value="">بدون سفارش مشخص</option>
                    {wpVendorOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        #{o.orderNumber} — {o.customerName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className={labelCls}>مبلغ جریمه (تومان)</label>
                <input type="number" min={1} value={wpAmount} onChange={(e) => setWpAmount(e.target.value)} className={inputCls} />
              </div>
              <div className={wpKind === 'no_invoice' ? 'md:col-span-1' : 'md:col-span-2'}>
                <label className={labelCls}>
                  شرح جریمه {wpKind === 'custom' ? '(الزامی — در ریز تراکنش فروشنده نمایش داده می‌شود)' : '(نمایش در ریز تراکنش)'}
                </label>
                <input
                  value={wpDescription}
                  onChange={(e) => setWpDescription(e.target.value)}
                  className={inputCls}
                  placeholder={wpKind === 'no_invoice' ? 'مثلاً: اعتراض مشتری به عدم صدور فاکتور در سامانه' : 'شرح دلیل جریمه...'}
                />
              </div>
            </div>
            {wpVendor && wpAmountNum > 0 && (
              <p className={`text-xs font-bold ${(wpVendor.walletBalance || 0) - wpAmountNum < 0 ? 'text-rose-700' : 'text-stone-600'}`}>
                موجودی پس از کسر: {fa((wpVendor.walletBalance || 0) - wpAmountNum)} تومان
                {(wpVendor.walletBalance || 0) - wpAmountNum < 0 && ' (کیف پول منفی می‌شود)'}
              </p>
            )}
            <button
              type="button"
              className={btnPrimary}
              disabled={!wpVendorId || wpAmountNum <= 0 || !wpDescription.trim()}
              onClick={() => {
                const ok = onApplyWalletPenalty(wpVendorId, wpKind, wpAmountNum, wpDescription, wpOrderId || undefined);
                if (ok === false) return notify('err', 'ثبت جریمه انجام نشد.');
                notify('ok', 'جریمه از کیف پول کسر و در ریز تراکنش‌ها ثبت شد.');
                setWpDescription('');
                setWpOrderId('');
              }}
            >
              کسر جریمه از کیف پول
            </button>
          </div>

          <div className={cardCls}>
            <h3 className="font-black text-stone-900 mb-3">جریمه‌های کیف پول ثبت‌شده</h3>
            {restrictions.walletPenalties.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">جریمه‌ای از کیف پول ثبت نشده است.</p>
            ) : (
              <div className="space-y-3">
                {restrictions.walletPenalties.map((p) => (
                  <div key={p.id} className="border border-stone-200 rounded-xl p-4 flex flex-wrap items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-stone-900 text-sm">{p.vendorName}</span>
                        <Chip tone="red">{WALLET_PENALTY_LABELS[p.kind]}</Chip>
                        {p.refundedAt && <Chip tone="green">بازگردانده شد</Chip>}
                      </div>
                      <div className="text-rose-700 font-bold">{fa(p.amount)} تومان</div>
                      <div className="text-stone-600">
                        {p.description}
                        {p.orderNumber ? ` — سفارش #${p.orderNumber}` : ''}
                      </div>
                      <div className="text-stone-500">
                        {p.createdAt}
                        {p.refundedAt ? ` — بازگشت: ${p.refundedAt}` : ''}
                      </div>
                    </div>
                    {!p.refundedAt && (
                      <button type="button" className={btnGhost} onClick={() => onRefundWalletPenalty(p.id)}>
                        بازگشت مبلغ به کیف پول
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ تنظیمات ============ */}
      {tab === 'settings' && (
        <div className={`${cardCls} space-y-5`}>
          <h3 className="font-black text-stone-900">تنظیمات و قوانین محدودیت‌ها</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>تعداد سفارش اول فروشنده‌ی جدید (قبل از بررسی مدیر)</label>
              <input type="number" min={1} value={settings.probationOrderLimit} onChange={(e) => onUpdateSettings({ probationOrderLimit: Math.max(1, Math.round(Number(e.target.value) || 1)) })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>سهمیه‌ی پایه‌ی سفارش روزانه‌ی هر فروشنده (در بافر ۱۰۰٪)</label>
              <input type="number" min={1} value={settings.dailyBaseQuota} onChange={(e) => onUpdateSettings({ dailyBaseQuota: Math.max(1, Math.round(Number(e.target.value) || 1)) })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>حداقل روز از اولین شکار تا فعال‌سازی بای‌باکس</label>
              <input type="number" min={0} value={settings.buyBoxMinDaysAfterFirstHunt} onChange={(e) => onUpdateSettings({ buyBoxMinDaysAfterFirstHunt: Math.max(0, Math.round(Number(e.target.value) || 0)) })} className={inputCls} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-bold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.buyBoxRequiresActiveAd}
                  onChange={(e) => onUpdateSettings({ buyBoxRequiresActiveAd: e.target.checked })}
                  className="w-4 h-4 accent-amber-700"
                />
                نیاز به آگهی فعال در نردبان و ویترین فروشگاه‌های شهر برای بای‌باکس
              </label>
            </div>
            <div>
              <label className={labelCls}>جریمه‌ی پیش‌فرض هر روز تأخیر در تحویل و نصب (تومان)</label>
              <input type="number" min={0} value={settings.delayPenaltyPerDay} onChange={(e) => { const v = Math.max(0, Math.round(Number(e.target.value) || 0)); onUpdateSettings({ delayPenaltyPerDay: v }); setDelayPerDay(String(v)); }} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>جریمه‌ی پیش‌فرض عدم صدور فاکتور (تومان)</label>
              <input type="number" min={0} value={settings.noInvoiceFineAmount} onChange={(e) => { const v = Math.max(0, Math.round(Number(e.target.value) || 0)); onUpdateSettings({ noInvoiceFineAmount: v }); setWpAmount(String(v)); }} className={inputCls} />
            </div>
          </div>
          <Notice tone="ok">تغییرات بلافاصله ذخیره و اعمال می‌شوند.</Notice>
        </div>
      )}
    </div>
  );
};
