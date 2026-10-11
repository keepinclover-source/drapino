import React, { useRef, useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crown,
  FileCheck2,
  HelpCircle,
  Lock,
  Medal,
  Sparkles,
  Upload,
  AlertCircle,
  ArrowLeft,
  SkipForward,
  UserPlus,
  Trash2,
} from 'lucide-react';
import type { CurtainVendor, VendorInstaller } from '../types';
import {
  computeVendorGameProgress,
  DOCS_UPLOAD_GUIDE,
  type VendorGameProgress,
  type VendorTierKey,
} from '../utils/vendorGamification';

interface Props {
  vendor: CurtainVendor;
  orders?: import('../types').VisitRequest[];
  onSubmitDocs?: (payload: { nationalCardImageUrl: string; businessLicenseImageUrl: string }) => void;
  onNavigateTab?: (tab: 'profile' | 'portfolio' | 'wallet' | 'sponsored_ladder') => void;
  onSkipStage?: (stageKey: 'portfolio' | 'ladder') => void;
  onSaveInstallers?: (installers: VendorInstaller[]) => void;
  compact?: boolean;
}

const TIER_STYLE: Record<VendorTierKey, string> = {
  bronze: 'from-amber-700 to-amber-900 text-amber-50 border-amber-800',
  silver: 'from-slate-400 to-slate-600 text-white border-slate-500',
  gold: 'from-amber-400 to-yellow-600 text-amber-950 border-amber-500',
};

const emptyInstaller = (): VendorInstaller => ({
  id: `inst-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  firstName: '',
  lastName: '',
  phone: '',
  nationalCode: '',
  nationalCardImageUrl: '',
});

export const VendorGamificationPanel: React.FC<Props> = ({
  vendor,
  orders = [],
  onSubmitDocs,
  onNavigateTab,
  onSkipStage,
  onSaveInstallers,
  compact,
}) => {
  const progress: VendorGameProgress = computeVendorGameProgress(vendor, orders);
  const [open, setOpen] = useState(!compact);
  const [showGuide, setShowGuide] = useState(false);
  const [nationalPreview, setNationalPreview] = useState(vendor.nationalCardImageUrl || '');
  const [licensePreview, setLicensePreview] = useState(vendor.businessLicenseImageUrl || '');
  const [installers, setInstallers] = useState<VendorInstaller[]>(
    vendor.installers?.length ? vendor.installers : [emptyInstaller()]
  );
  const nationalRef = useRef<HTMLInputElement>(null);
  const licenseRef = useRef<HTMLInputElement>(null);

  const stage = progress.currentStage;
  const completedCount = progress.stages.filter((s) => s.done || s.skipped).length;

  const readFile = (file: File | undefined, cb: (url: string) => void) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم فایل حداکثر ۵ مگابایت باشد.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => cb(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const submitDocs = () => {
    if (!nationalPreview || !licensePreview) {
      alert('هر دو مدرک (کارت ملی و جواز کسب) الزامی است.');
      return;
    }
    onSubmitDocs?.({ nationalCardImageUrl: nationalPreview, businessLicenseImageUrl: licensePreview });
  };

  const saveInstallers = () => {
    const valid = installers.filter(
      (i) => i.firstName.trim() && i.lastName.trim() && i.phone.trim() && i.nationalCode.trim() && i.nationalCardImageUrl
    );
    if (valid.length < 1) {
      alert('حداقل یک نصاب با تمام فیلدها و تصویر کارت ملی ثبت کنید.');
      return;
    }
    if (valid.some((i) => i.nationalCode.replace(/\D/g, '').length !== 10)) {
      alert('کد ملی نصاب باید ۱۰ رقم باشد.');
      return;
    }
    onSaveInstallers?.(valid.slice(0, 5));
  };

  const pctToNext =
    progress.tier === 'gold'
      ? 100
      : progress.tier === 'silver'
        ? Math.min(100, Math.round((progress.points / 550) * 100))
        : Math.min(100, Math.round((progress.points / 280) * 100));

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden text-right" data-testid="vendor-gamification">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-l from-stone-50 to-amber-50/40 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`px-2.5 py-1 rounded-xl text-[11px] font-black border bg-gradient-to-l ${TIER_STYLE[progress.tier]}`}>
            {progress.tier === 'gold' ? <Crown className="w-3.5 h-3.5 inline ml-1" /> : <Medal className="w-3.5 h-3.5 inline ml-1" />}
            سطح {progress.tierLabel}
          </div>
          <div className="min-w-0 text-right">
            <p className="text-xs font-black text-stone-900 truncate">
              مسیر رشد · {progress.points} امتیاز · مرحله {completedCount + (stage && !stage.done ? 1 : 0)} از {progress.stages.length}
            </p>
            <div className="mt-1 h-1.5 w-40 max-w-full rounded-full bg-stone-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-600 transition-all"
                style={{ width: `${Math.round((completedCount / progress.stages.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
      </button>

      {open && (
        <div className="p-4 space-y-4">
          {progress.walletDiscount > 0 && (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-900">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                تخفیف شارژ کیف‌پول: <strong>{Math.round(progress.walletDiscount * 100)}٪</strong>
              </span>
            </div>
          )}

          {/* فقط مرحله جاری */}
          {!stage || (stage.done && progress.stages.every((s) => s.done || s.skipped)) ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              مسیر اولیه تکمیل شده است. از امکانات پنل استفاده کنید.
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold text-amber-800 mb-0.5">مرحله فعلی (فقط همین را انجام دهید)</p>
                  <h4 className="text-sm font-black text-stone-900">
                    {stage.id}. {stage.title}
                    {stage.optional ? <span className="text-stone-500 font-medium"> — اختیاری</span> : null}
                  </h4>
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">{stage.description}</p>
                </div>
                <div className="text-left shrink-0">
                  <p className="text-[10px] font-bold text-stone-700">{stage.progressLabel}</p>
                  <p className="text-[10px] text-amber-800">
                    +{stage.pointsEarned} / {stage.pointsMax}
                  </p>
                </div>
              </div>

              {/* مدارک */}
              {stage.key === 'docs' && (
                <div className="space-y-2 border-t border-amber-100 pt-3">
                  <button type="button" onClick={() => setShowGuide((v) => !v)} className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 cursor-pointer">
                    <HelpCircle className="w-3.5 h-3.5" />
                    راهنمای استاندارد آپلود مدارک
                  </button>
                  {showGuide && (
                    <ul className="text-[10px] text-stone-600 space-y-1 list-disc pr-4 leading-relaxed">
                      {DOCS_UPLOAD_GUIDE.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                  {progress.docsPendingAdmin ? (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-100/80 px-2.5 py-2 text-[11px] text-amber-950">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      مدارک ارسال شده؛ تا تأیید دستی مدیر این مرحله باز نمی‌ماند.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] font-bold text-stone-700 mb-1">کارت ملی</p>
                        <input ref={nationalRef} type="file" accept="image/*" className="hidden" onChange={(e) => readFile(e.target.files?.[0], setNationalPreview)} />
                        <button type="button" onClick={() => nationalRef.current?.click()} className="w-full min-h-[72px] rounded-xl border border-dashed border-stone-300 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer">
                          {nationalPreview ? <img src={nationalPreview} alt="" className="h-16 object-contain rounded" /> : <><Upload className="w-4 h-4 text-stone-400" /><span className="text-[10px]">آپلود</span></>}
                        </button>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-stone-700 mb-1">جواز کسب</p>
                        <input ref={licenseRef} type="file" accept="image/*" className="hidden" onChange={(e) => readFile(e.target.files?.[0], setLicensePreview)} />
                        <button type="button" onClick={() => licenseRef.current?.click()} className="w-full min-h-[72px] rounded-xl border border-dashed border-stone-300 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer">
                          {licensePreview ? <img src={licensePreview} alt="" className="h-16 object-contain rounded" /> : <><Upload className="w-4 h-4 text-stone-400" /><span className="text-[10px]">آپلود</span></>}
                        </button>
                      </div>
                      <button type="button" onClick={submitDocs} className="sm:col-span-2 min-h-[44px] rounded-xl bg-stone-900 text-amber-400 text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5">
                        <FileCheck2 className="w-4 h-4" />
                        ارسال برای بررسی مدیر
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* کالیته — هدایت به تب */}
              {stage.key === 'catalogs' && (
                <div className="space-y-2 border-t border-amber-100 pt-3">
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    برای تکمیل این مرحله وارد بخش «کالیته‌ها و اطلاعات فروشگاه» شوید و حداقل ۵ کالیته انتخاب یا تعریف کنید.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateTab?.('profile')}
                    className="w-full min-h-[48px] rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    برو به انتخاب / تعریف کالیته
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* نمونه کار — اختیاری */}
              {stage.key === 'portfolio' && (
                <div className="space-y-2 border-t border-amber-100 pt-3">
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    حداقل ۵ نمونه کار در تب «نمونه کار» آپلود کنید تا امتیاز کامل بگیرید. این مرحله اختیاری است.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateTab?.('portfolio')}
                      className="flex-1 min-h-[48px] rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                      برو به آپلود نمونه کار
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSkipStage?.('portfolio')}
                      className="min-h-[48px] px-4 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <SkipForward className="w-4 h-4" />
                      فعلاً رد کن
                    </button>
                  </div>
                </div>
              )}

              {/* نصاب */}
              {stage.key === 'installers' && (
                <div className="space-y-3 border-t border-amber-100 pt-3">
                  <p className="text-[11px] text-stone-600">حداقل ۱ نصاب کافی است (تا ۵ نفر). تعداد بیشتر امتیاز اضافه ندارد.</p>
                  {installers.map((inst, idx) => (
                    <div key={inst.id} className="rounded-xl border border-stone-200 bg-white p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black text-stone-800">نصاب {idx + 1}</p>
                        {installers.length > 1 && (
                          <button
                            type="button"
                            className="text-rose-600 text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                            onClick={() => setInstallers((prev) => prev.filter((x) => x.id !== inst.id))}
                          >
                            <Trash2 className="w-3 h-3" /> حذف
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          className="rounded-lg border border-stone-200 px-2.5 py-2 text-xs"
                          placeholder="نام"
                          value={inst.firstName}
                          onChange={(e) =>
                            setInstallers((prev) => prev.map((x) => (x.id === inst.id ? { ...x, firstName: e.target.value } : x)))
                          }
                        />
                        <input
                          className="rounded-lg border border-stone-200 px-2.5 py-2 text-xs"
                          placeholder="نام خانوادگی"
                          value={inst.lastName}
                          onChange={(e) =>
                            setInstallers((prev) => prev.map((x) => (x.id === inst.id ? { ...x, lastName: e.target.value } : x)))
                          }
                        />
                        <input
                          className="rounded-lg border border-stone-200 px-2.5 py-2 text-xs"
                          placeholder="شماره تلفن"
                          value={inst.phone}
                          onChange={(e) =>
                            setInstallers((prev) => prev.map((x) => (x.id === inst.id ? { ...x, phone: e.target.value } : x)))
                          }
                        />
                        <input
                          className="rounded-lg border border-stone-200 px-2.5 py-2 text-xs"
                          placeholder="کد ملی"
                          value={inst.nationalCode}
                          onChange={(e) =>
                            setInstallers((prev) =>
                              prev.map((x) => (x.id === inst.id ? { ...x, nationalCode: e.target.value.replace(/\D/g, '').slice(0, 10) } : x))
                            )
                          }
                        />
                      </div>
                      <label className="flex flex-col items-center justify-center gap-1 min-h-[64px] rounded-xl border border-dashed border-stone-300 cursor-pointer text-[10px] text-stone-500">
                        {inst.nationalCardImageUrl ? (
                          <img src={inst.nationalCardImageUrl} alt="" className="h-14 object-contain" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4" /> تصویر کارت ملی نصاب
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            readFile(e.target.files?.[0], (url) =>
                              setInstallers((prev) => prev.map((x) => (x.id === inst.id ? { ...x, nationalCardImageUrl: url } : x)))
                            )
                          }
                        />
                      </label>
                    </div>
                  ))}
                  {installers.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setInstallers((prev) => [...prev, emptyInstaller()])}
                      className="w-full min-h-[40px] rounded-xl border border-stone-200 text-xs font-bold text-stone-700 cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" /> افزودن نصاب دیگر
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={saveInstallers}
                    className="w-full min-h-[48px] rounded-xl bg-stone-900 text-amber-400 text-xs font-black cursor-pointer"
                  >
                    ذخیره نصاب‌ها و تکمیل مرحله
                  </button>
                </div>
              )}

              {/* کیف پول */}
              {stage.key === 'wallet' && (
                <div className="space-y-2 border-t border-amber-100 pt-3">
                  <button
                    type="button"
                    onClick={() => onNavigateTab?.('wallet')}
                    className="w-full min-h-[48px] rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    برو به شارژ کیف پول
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* نردبان اختیاری */}
              {stage.key === 'ladder' && (
                <div className="space-y-2 border-t border-amber-100 pt-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateTab?.('sponsored_ladder')}
                      className="flex-1 min-h-[48px] rounded-xl bg-amber-700 text-white text-xs font-black cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                      برو به نردبان و آگهی
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSkipStage?.('ladder')}
                      className="min-h-[48px] px-4 rounded-xl border border-stone-300 bg-white text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <SkipForward className="w-4 h-4" />
                      فعلاً رد کن
                    </button>
                  </div>
                </div>
              )}

              {(stage.key === 'first_orders' || stage.key === 'performance') && (
                <p className="text-[11px] text-stone-600 border-t border-amber-100 pt-3">
                  این مرحله با فعالیت واقعی روی سفارش‌ها در پنل تکمیل می‌شود.
                </p>
              )}
            </div>
          )}

          {/* خلاصه کوچک مراحل انجام‌شده */}
          <div className="flex flex-wrap gap-1.5">
            {progress.stages.map((s) => (
              <span
                key={s.key}
                className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                  s.done
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : s.skipped
                      ? 'bg-stone-50 border-stone-200 text-stone-400'
                      : s.id === stage?.id
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-stone-50 border-stone-100 text-stone-400'
                }`}
              >
                {s.done ? '✓' : s.skipped ? '–' : s.id === stage?.id ? '●' : s.locked ? <Lock className="w-2.5 h-2.5 inline" /> : s.id} {s.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function featureLockedMessage(feature: string) {
  return `برای دسترسی به «${feature}» ابتدا مرحله فعلی مسیر رشد را تکمیل کنید.`;
}
