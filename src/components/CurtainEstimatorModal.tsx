import React, { useState } from 'react';
import { X, Calculator, ShieldCheck, ArrowLeft, Info, Check } from 'lucide-react';
import { useDeposit } from '../context/DepositContext';
import { formatDepositWords, formatDepositToman } from '../utils/deposit';

interface CurtainEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: (details: { width: number; height: number; style: string; fabricTier: string }) => void;
  /** بازگشت به مرحله «انتخاب موضوع استعلام» (اختیاری) */
  onBack?: () => void;
}

export const CurtainEstimatorModal: React.FC<CurtainEstimatorModalProps> = ({
  isOpen,
  onClose,
  onProceedToBooking,
  onBack,
}) => {
  const { deposit: cityDeposit } = useDeposit();
  const [width, setWidth] = useState<number>(3.5);
  const [height, setHeight] = useState<number>(2.8);
  const [sewingStyle, setSewingStyle] = useState<'pleated_standard' | 'pleated_hotel' | 'eyelet_pinch' | 'zebra'>('pleated_hotel');
  const [fabricType, setFabricType] = useState<'sheer' | 'velvet' | 'patina' | 'linen' | 'zebra_standard'>('velvet');
  const [trackType, setTrackType] = useState<'standard' | 'grabber' | 'motorized'>('grabber');
  const [needInstallation, setNeedInstallation] = useState<boolean>(true);

  if (!isOpen) return null;

  // Calculation formulas
  let fullnessMultiplier = 2.5;
  if (sewingStyle === 'pleated_hotel') fullnessMultiplier = 3.0;
  if (sewingStyle === 'pleated_standard') fullnessMultiplier = 2.5;
  if (sewingStyle === 'eyelet_pinch') fullnessMultiplier = 2.5;

  let fabricPricePerMeter = 680000;
  let fabricLabel = 'مخمل کالیفرنیا ترک';

  if (fabricType === 'sheer') {
    fabricPricePerMeter = 380000;
    fabricLabel = 'حریر الگانت و شاین';
  } else if (fabricType === 'patina') {
    fabricPricePerMeter = 850000;
    fabricLabel = 'مخمل پتینه کوبیده اسپانیایی';
  } else if (fabricType === 'linen') {
    fabricPricePerMeter = 520000;
    fabricLabel = 'کتان لینن ارگانیک';
  } else if (fabricType === 'zebra_standard') {
    fabricPricePerMeter = 690000; // per sq meter
    fabricLabel = 'زبرا دومکانیزم شب و روز';
  }

  let requiredMeters = 0;
  let fabricCost = 0;
  let tailoringCost = 0;

  if (sewingStyle === 'zebra') {
    // Zebra calculated by square meters
    const sqMeters = Math.max(1.5, width * height);
    requiredMeters = Number(sqMeters.toFixed(1));
    fabricCost = sqMeters * fabricPricePerMeter;
    tailoringCost = 0; // included in zebra
  } else {
    requiredMeters = Number((width * fullnessMultiplier).toFixed(1));
    fabricCost = requiredMeters * fabricPricePerMeter;
    tailoringCost = requiredMeters * 95000; // اجرت دوخت و نوار پرده
  }

  let trackCost = 0;
  if (trackType === 'standard') trackCost = width * 110000;
  if (trackType === 'grabber') trackCost = width * 220000;
  if (trackType === 'motorized') trackCost = 4500000;

  const installCost = needInstallation ? (sewingStyle === 'zebra' ? 250000 : 450000) : 0;
  const subtotal = Math.round(fabricCost + tailoringCost + trackCost + installCost);
  const depositDeduction = cityDeposit;
  const finalPayable = Math.max(0, subtotal - depositDeduction);

  const formatNumber = (num: number) => num.toLocaleString('fa-IR');

  const handleApplyToBooking = () => {
    onProceedToBooking({
      width,
      height,
      style: sewingStyle === 'zebra' ? 'پرده زبرا' : (sewingStyle === 'pleated_hotel' ? 'پلیسه هتلی' : 'پانچ'),
      fabricTier: fabricLabel,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2 text-stone-900">
            <Calculator className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-lg">استعلام قیمت هوشمند پرده</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-right">
          
          {/* Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                عرض ریل / پنجره (متر):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="15"
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg text-left font-mono tabular-nums focus:outline-amber-600"
                />
                <span className="text-xs text-stone-500 whitespace-nowrap">متر</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                ارتفاع سقف تا کف (متر):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.05"
                  min="1"
                  max="6"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 2.5)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg text-left font-mono tabular-nums focus:outline-amber-600"
                />
                <span className="text-xs text-stone-500 whitespace-nowrap">متر</span>
              </div>
            </div>
          </div>

          {/* Sewing Style */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              سبک و مدل دوخت پرده:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSewingStyle('pleated_hotel')}
                className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                  sewingStyle === 'pleated_hotel'
                    ? 'border-amber-700 bg-amber-50/70 text-amber-900 font-bold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                پلیسه هتلی (۳ برابر)
              </button>
              <button
                type="button"
                onClick={() => setSewingStyle('pleated_standard')}
                className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                  sewingStyle === 'pleated_standard'
                    ? 'border-amber-700 bg-amber-50/70 text-amber-900 font-bold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                پلیسه معمولی (۲.۵ برابر)
              </button>
              <button
                type="button"
                onClick={() => setSewingStyle('eyelet_pinch')}
                className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                  sewingStyle === 'eyelet_pinch'
                    ? 'border-amber-700 bg-amber-50/70 text-amber-900 font-bold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                پانچ مدرن مینیمال
              </button>
              <button
                type="button"
                onClick={() => {
                  setSewingStyle('zebra');
                  setFabricType('zebra_standard');
                }}
                className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                  sewingStyle === 'zebra'
                    ? 'border-amber-700 bg-amber-50/70 text-amber-900 font-bold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                زبرا / شید رول
              </button>
            </div>
          </div>

          {/* Fabric Type */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              نوع پارچه مورد نظر (تخمینی):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sewingStyle !== 'zebra' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setFabricType('velvet')}
                    className={`p-2.5 rounded-xl border text-xs text-right transition-all ${
                      fabricType === 'velvet'
                        ? 'border-amber-700 bg-amber-50/70 text-amber-900 font-bold'
                        : 'border-stone-200 text-stone-700'
                    }`}
                  >
                    <div>مخمل کالیفرنیا ترک</div>
                    <div className="text-[10px] text-stone-500 font-normal">متری ۶۸۰,۰۰۰ ت</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFabricType('sheer')}
                    className={`p-2.5 rounded-xl border text-xs text-right transition-all ${
                      fabricType === 'sheer'
                        ? 'border-amber-700 bg-amber-50/70 text-amber-900 font-bold'
                        : 'border-stone-200 text-stone-700'
                    }`}
                  >
                    <div>حریر الگانت و شاین</div>
                    <div className="text-[10px] text-stone-500 font-normal">متری ۳۸۰,۰۰۰ ت</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFabricType('patina')}
                    className={`p-2.5 rounded-xl border text-xs text-right transition-all ${
                      fabricType === 'patina'
                        ? 'border-amber-700 bg-amber-50/70 text-amber-900 font-bold'
                        : 'border-stone-200 text-stone-700'
                    }`}
                  >
                    <div>مخمل پتینه اسپانیایی</div>
                    <div className="text-[10px] text-stone-500 font-normal">متری ۸۵۰,۰۰۰ ت</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFabricType('linen')}
                    className={`p-2.5 rounded-xl border text-xs text-right transition-all ${
                      fabricType === 'linen'
                        ? 'border-amber-700 bg-amber-50/70 text-amber-900 font-bold'
                        : 'border-stone-200 text-stone-700'
                    }`}
                  >
                    <div>کتان لینن ارگانیک</div>
                    <div className="text-[10px] text-stone-500 font-normal">متری ۵۲۰,۰۰۰ ت</div>
                  </button>
                </>
              ) : (
                <div className="col-span-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  قیمت زبرا بر اساس متر مربع محاسبه می‌شود و شامل قاب و مکانیزم کامل است.
                </div>
              )}
            </div>
          </div>

          {/* Track & Install options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                نوع ریل و ملزومات:
              </label>
              <select
                value={trackType}
                onChange={(e) => setTrackType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg text-stone-800 bg-white"
              >
                <option value="grabber">ریل فلزی گریبر روان (پیشنهادی)</option>
                <option value="standard">ریل آلومینیومی معمولی</option>
                <option value="motorized">ریل برقی هوشمند با ریموت</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="installCheckbox"
                checked={needInstallation}
                onChange={(e) => setNeedInstallation(e.target.checked)}
                className="w-4 h-4 text-amber-700 rounded border-stone-300"
              />
              <label htmlFor="installCheckbox" className="text-xs font-medium text-stone-700 cursor-pointer">
                شامل خدمات نصب حرفه‌ای و بخاردهی در محل
              </label>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 bg-stone-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-300 pb-2 border-b border-stone-800">
              <span>متراژ برآورد شده پارچه:</span>
              <span className="font-bold text-white text-sm tabular-nums">
                {formatNumber(requiredMeters)} {sewingStyle === 'zebra' ? 'متر مربع' : 'متر طول'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-300">
              <span>برآورد کل پروژه (پارچه + دوخت + ریل):</span>
              <span className="font-bold text-white tabular-nums">
                {formatNumber(subtotal)} تومان
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-400">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>کسر بیعانه مشاوره دراپینو:</span>
              </span>
              <span className="font-bold tabular-nums">
                - {formatNumber(depositDeduction)} تومان
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-sm font-black text-amber-400">
              <span>مبلغ نهایی تقریبی پس از کسر بیعانه:</span>
              <span className="text-base tabular-nums">
                {formatNumber(finalPayable)} تومان
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 text-xs text-stone-700 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <span>
              این مبلغ تقریبی است. کارشناس پرده پس از اندازه‌گیری لیزری در منزل شما و مشاهده کالیته انتخابی، فاکتور دقیق قطعی را با کسر {formatDepositWords(depositDeduction)} بیعانه صادر خواهد کرد.
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                ← تغییر انتخاب
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              بستن
            </button>
          </div>

          <button
            type="button"
            onClick={handleApplyToBooking}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs"
          >
            <span>ثبت سفارش بازدید خانگی با این ابعاد</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
