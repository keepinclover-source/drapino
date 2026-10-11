import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useDeposit } from '../context/DepositContext';
import { formatDepositWords, formatNumberFa } from '../utils/deposit';
import {
  estimateWallpaper,
  QuoteProceedPayload,
  WALLPAPER_PATTERN,
  WALLPAPER_QUALITY,
  WALLPAPER_ROLL,
  WALLPAPER_STYLE_OPTIONS,
  WallpaperPatternType,
  WallpaperQuality,
  WallpaperRoll,
} from '../utils/quoteEstimators';
import { ChoiceGroup, CheckRow, NumberField, QuoteDisclaimer, QuoteShell, ResultLine } from './QuoteShared';

interface WallpaperEstimatorModalProps {
  onClose: () => void;
  onBack?: () => void;
  onProceedToBooking: (payload: QuoteProceedPayload) => void;
}

export const WallpaperEstimatorModal: React.FC<WallpaperEstimatorModalProps> = ({ onClose, onBack, onProceedToBooking }) => {
  const { deposit } = useDeposit();
  const [mode, setMode] = useState<'room' | 'single'>('room');
  const [roomLength, setRoomLength] = useState(4);
  const [roomWidth, setRoomWidth] = useState(3.5);
  const [wallHeight, setWallHeight] = useState(2.7);
  const [singleWallWidth, setSingleWallWidth] = useState(3);
  const [doors, setDoors] = useState(1);
  const [windows, setWindows] = useState(1);
  const [quality, setQuality] = useState<WallpaperQuality>('standard');
  const [pattern, setPattern] = useState<WallpaperPatternType>('small');
  const [roll, setRoll] = useState<WallpaperRoll>('standard');
  const [designStyle, setDesignStyle] = useState(WALLPAPER_STYLE_OPTIONS[0]);
  const [needInstallation, setNeedInstallation] = useState(true);
  const [needPrep, setNeedPrep] = useState(false);

  const r = estimateWallpaper({
    mode, roomLength, roomWidth, wallHeight, singleWallWidth, doors, windows, quality, pattern, roll, needInstallation, needPrep,
  });
  const finalPayable = Math.max(0, r.subtotal - deposit);
  const fa = formatNumberFa;

  const handleProceed = () => {
    const notes =
      `[استعلام قیمت هوشمند — کاغذ دیواری] ${mode === 'room' ? 'کل اتاق' : 'یک دیوار'}، ` +
      `مساحت دیوار ≈ ${fa(r.wallArea)} متر مربع، ${fa(r.rolls)} رول ${roll === 'standard' ? 'استاندارد' : 'عریض'}، ` +
      `کیفیت ${WALLPAPER_QUALITY[quality].label}، ${WALLPAPER_PATTERN[pattern].label}. ` +
      `برآورد تقریبی: ${fa(r.subtotal)} تومان.`;
    onProceedToBooking({ category: 'wallpaper', area: Math.max(1, Math.round(r.wallArea)), styles: [designStyle], notes });
    onClose();
  };

  return (
    <QuoteShell
      title="استعلام قیمت هوشمند کاغذ دیواری"
      onClose={onClose}
      onBack={onBack}
      proceedLabel="ثبت سفارش بازدید خانگی با این مشخصات"
      onProceed={handleProceed}
      proceedDisabled={r.wallArea <= 0}
    >
      <ChoiceGroup
        label="کاغذ دیواری برای:"
        value={mode}
        onChange={setMode}
        columns="grid-cols-2"
        testIdPrefix="wp-mode"
        options={[
          { id: 'room', title: 'کل اتاق (چهار دیوار)' },
          { id: 'single', title: 'فقط یک دیوار (دیوار اصلی)' },
        ]}
      />

      {mode === 'room' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumberField label="طول اتاق (متر):" value={roomLength} onChange={setRoomLength} unit="متر" testId="wp-length" />
          <NumberField label="عرض اتاق (متر):" value={roomWidth} onChange={setRoomWidth} unit="متر" testId="wp-width" />
          <NumberField label="ارتفاع دیوار (متر):" value={wallHeight} onChange={setWallHeight} unit="متر" step={0.05} testId="wp-height" />
          <NumberField label="تعداد درها:" value={doors} onChange={(v) => setDoors(Math.max(0, Math.round(v)))} step={1} testId="wp-doors" />
          <NumberField label="تعداد پنجره‌ها:" value={windows} onChange={(v) => setWindows(Math.max(0, Math.round(v)))} step={1} testId="wp-windows" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField label="عرض دیوار (متر):" value={singleWallWidth} onChange={setSingleWallWidth} unit="متر" testId="wp-single-width" />
          <NumberField label="ارتفاع دیوار (متر):" value={wallHeight} onChange={setWallHeight} unit="متر" step={0.05} />
        </div>
      )}

      <ChoiceGroup
        label="کیفیت و رده قیمتی:"
        value={quality}
        onChange={setQuality}
        testIdPrefix="wp-quality"
        options={(Object.keys(WALLPAPER_QUALITY) as WallpaperQuality[]).map((k) => ({
          id: k,
          title: WALLPAPER_QUALITY[k].label,
          hint: WALLPAPER_QUALITY[k].hint,
        }))}
      />

      <ChoiceGroup
        label="نوع نقش (روی میزان پرت و تطبیق طرح اثر دارد):"
        value={pattern}
        onChange={setPattern}
        testIdPrefix="wp-pattern"
        options={(Object.keys(WALLPAPER_PATTERN) as WallpaperPatternType[]).map((k) => ({
          id: k,
          title: WALLPAPER_PATTERN[k].label,
          hint: `پرت حدود ${fa(Math.round(WALLPAPER_PATTERN[k].waste * 100))}٪`,
        }))}
      />

      <ChoiceGroup
        label="ابعاد رول:"
        value={roll}
        onChange={setRoll}
        columns="grid-cols-1 sm:grid-cols-2"
        testIdPrefix="wp-roll"
        options={(Object.keys(WALLPAPER_ROLL) as WallpaperRoll[]).map((k) => ({
          id: k,
          title: WALLPAPER_ROLL[k].label,
          hint: `پوشش هر رول ${fa(WALLPAPER_ROLL[k].coverage)} متر مربع`,
        }))}
      />

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">طرح و سبک مورد نظر:</label>
        <select
          value={designStyle}
          onChange={(e) => setDesignStyle(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg text-stone-800 bg-white"
        >
          {WALLPAPER_STYLE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
        <CheckRow id="wp-install" checked={needInstallation} onChange={setNeedInstallation} label="شامل اجرت نصب، آستر و چسب" />
        <CheckRow id="wp-prep" checked={needPrep} onChange={setNeedPrep} label="نیاز به آماده‌سازی و صاف‌کردن دیوار" />
      </div>

      <div className="p-4 bg-stone-900 text-white rounded-xl space-y-3" data-testid="wp-result">
        <div className="flex items-center justify-between text-xs text-stone-300 pb-2 border-b border-stone-800">
          <span>مساحت دیوار برای نصب:</span>
          <span className="font-bold text-white text-sm tabular-nums" data-testid="wp-area">{fa(r.wallArea)} متر مربع</span>
        </div>
        <div className="flex items-center justify-between text-xs text-stone-300">
          <span>تعداد رول مورد نیاز (با احتساب پرت):</span>
          <span className="font-bold text-white text-sm tabular-nums" data-testid="wp-rolls">{fa(r.rolls)} رول</span>
        </div>
        <ResultLine label="هزینه کاغذ دیواری:" value={`${fa(r.materialCost)} تومان`} />
        {needInstallation && <ResultLine label="اجرت نصب:" value={`${fa(r.installCost)} تومان`} />}
        {needInstallation && <ResultLine label="آستر و چسب:" value={`${fa(r.primerCost)} تومان`} />}
        {needPrep && <ResultLine label="آماده‌سازی دیوار:" value={`${fa(r.prepCost)} تومان`} />}
        <div className="flex items-center justify-between text-xs text-stone-300 pt-2 border-t border-stone-800">
          <span>برآورد کل پروژه:</span>
          <span className="font-bold text-white tabular-nums" data-testid="wp-subtotal">{fa(r.subtotal)} تومان</span>
        </div>
        <div className="flex items-center justify-between text-xs text-emerald-400">
          <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /><span>کسر بیعانه مشاوره دراپینو:</span></span>
          <span className="font-bold tabular-nums">- {fa(deposit)} تومان</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-sm font-black text-amber-400">
          <span>مبلغ نهایی تقریبی پس از کسر بیعانه:</span>
          <span className="text-base tabular-nums">{fa(finalPayable)} تومان</span>
        </div>
      </div>

      <QuoteDisclaimer>
        این مبلغ تقریبی است. کارشناس پس از اندازه‌گیری دقیق دیوارها در منزل شما و دیدن آلبوم نمونه‌ها، فاکتور قطعی را با کسر {formatDepositWords(deposit)} بیعانه صادر خواهد کرد.
      </QuoteDisclaimer>
    </QuoteShell>
  );
};
