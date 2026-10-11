import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useDeposit } from '../context/DepositContext';
import { formatDepositWords, formatNumberFa } from '../utils/deposit';
import {
  estimateFlooring,
  FLOORING_LAYOUT,
  FLOORING_TYPE,
  FlooringLayout,
  FlooringSizing,
  FlooringType,
  QuoteProceedPayload,
} from '../utils/quoteEstimators';
import { ChoiceGroup, CheckRow, NumberField, QuoteDisclaimer, QuoteShell, ResultLine } from './QuoteShared';

interface FlooringEstimatorModalProps {
  onClose: () => void;
  onBack?: () => void;
  onProceedToBooking: (payload: QuoteProceedPayload) => void;
}

export const FlooringEstimatorModal: React.FC<FlooringEstimatorModalProps> = ({ onClose, onBack, onProceedToBooking }) => {
  const { deposit } = useDeposit();
  const [sizing, setSizing] = useState<FlooringSizing>('dimensions');
  const [roomLength, setRoomLength] = useState(5);
  const [roomWidth, setRoomWidth] = useState(4);
  const [areaDirect, setAreaDirect] = useState(30);
  const [type, setType] = useState<FlooringType>('laminate');
  const [layout, setLayout] = useState<FlooringLayout>('straight');
  const [needInstallation, setNeedInstallation] = useState(true);
  const [needUnderlay, setNeedUnderlay] = useState(true);
  const [needSkirting, setNeedSkirting] = useState(true);
  const [needLeveling, setNeedLeveling] = useState(false);
  const [needRemoval, setNeedRemoval] = useState(false);

  const r = estimateFlooring({
    sizing, roomLength, roomWidth, areaDirect, type, layout, needInstallation, needUnderlay, needSkirting, needLeveling, needRemoval,
  });
  const finalPayable = Math.max(0, r.subtotal - deposit);
  const fa = formatNumberFa;

  const handleProceed = () => {
    const styles = [FLOORING_TYPE[type].bookingStyle];
    if (layout === 'herringbone') styles.push('پارکت اسپیک (فیشبون)');
    const notes =
      `[استعلام قیمت هوشمند — کفپوش و پارکت] متراژ ${fa(r.area)} متر مربع، ${FLOORING_TYPE[type].label}، چیدمان ${FLOORING_LAYOUT[layout].label}` +
      `${needSkirting ? `، قرنیز ≈ ${fa(r.skirtingMeters)} متر` : ''}. برآورد تقریبی: ${fa(r.subtotal)} تومان.`;
    onProceedToBooking({ category: 'flooring', area: Math.max(1, Math.round(r.area)), styles, notes });
    onClose();
  };

  return (
    <QuoteShell
      title="استعلام قیمت هوشمند کفپوش و پارکت"
      onClose={onClose}
      onBack={onBack}
      proceedLabel="ثبت سفارش بازدید خانگی با این مشخصات"
      onProceed={handleProceed}
      proceedDisabled={r.area <= 0}
    >
      <ChoiceGroup
        label="نحوه ورود متراژ:"
        value={sizing}
        onChange={setSizing}
        columns="grid-cols-2"
        testIdPrefix="fl-sizing"
        options={[
          { id: 'dimensions', title: 'طول و عرض اتاق' },
          { id: 'area', title: 'متراژ کل را می‌دانم' },
        ]}
      />

      {sizing === 'dimensions' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField label="طول اتاق (متر):" value={roomLength} onChange={setRoomLength} unit="متر" testId="fl-length" />
          <NumberField label="عرض اتاق (متر):" value={roomWidth} onChange={setRoomWidth} unit="متر" testId="fl-width" />
        </div>
      ) : (
        <NumberField label="متراژ کل (متر مربع):" value={areaDirect} onChange={setAreaDirect} unit="متر مربع" step={1} testId="fl-area-input" />
      )}

      <ChoiceGroup
        label="نوع کفپوش / پارکت:"
        value={type}
        onChange={setType}
        columns="grid-cols-2 sm:grid-cols-3"
        testIdPrefix="fl-type"
        options={(Object.keys(FLOORING_TYPE) as FlooringType[]).map((k) => ({
          id: k,
          title: FLOORING_TYPE[k].label,
          hint: `متری ${fa(FLOORING_TYPE[k].pricePerM2)} ت`,
        }))}
      />

      <ChoiceGroup
        label="نوع چیدمان (روی میزان پرت و اجرت اثر دارد):"
        value={layout}
        onChange={setLayout}
        testIdPrefix="fl-layout"
        options={(Object.keys(FLOORING_LAYOUT) as FlooringLayout[]).map((k) => ({
          id: k,
          title: FLOORING_LAYOUT[k].label,
          hint: `پرت حدود ${fa(Math.round(FLOORING_LAYOUT[k].waste * 100))}٪`,
        }))}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
        <CheckRow id="fl-install" checked={needInstallation} onChange={setNeedInstallation} label="شامل اجرت نصب" />
        <CheckRow id="fl-underlay" checked={needUnderlay} onChange={setNeedUnderlay} label="شامل زیرپارکت (فوم)" />
        <CheckRow id="fl-skirting" checked={needSkirting} onChange={setNeedSkirting} label="شامل قرنیز" />
        <CheckRow id="fl-leveling" checked={needLeveling} onChange={setNeedLeveling} label="نیاز به تسطیح و آماده‌سازی کف" />
        <CheckRow id="fl-removal" checked={needRemoval} onChange={setNeedRemoval} label="جمع‌آوری کفپوش قدیمی" />
      </div>

      <div className="p-4 bg-stone-900 text-white rounded-xl space-y-3" data-testid="fl-result">
        <div className="flex items-center justify-between text-xs text-stone-300 pb-2 border-b border-stone-800">
          <span>متراژ کف:</span>
          <span className="font-bold text-white text-sm tabular-nums" data-testid="fl-area">{fa(r.area)} متر مربع</span>
        </div>
        <div className="flex items-center justify-between text-xs text-stone-300">
          <span>متراژ مورد نیاز با احتساب پرت:</span>
          <span className="font-bold text-white text-sm tabular-nums" data-testid="fl-waste-area">{fa(r.areaWithWaste)} متر مربع</span>
        </div>
        <ResultLine label={`هزینه ${FLOORING_TYPE[type].label}:`} value={`${fa(r.materialCost)} تومان`} />
        {needInstallation && <ResultLine label="اجرت نصب:" value={`${fa(r.installCost)} تومان`} />}
        {needUnderlay && <ResultLine label="زیرپارکت:" value={`${fa(r.underlayCost)} تومان`} />}
        {needSkirting && <ResultLine label={`قرنیز (≈ ${fa(r.skirtingMeters)} متر):`} value={`${fa(r.skirtingCost)} تومان`} />}
        {needLeveling && <ResultLine label="تسطیح و آماده‌سازی کف:" value={`${fa(r.levelingCost)} تومان`} />}
        {needRemoval && <ResultLine label="جمع‌آوری کفپوش قدیمی:" value={`${fa(r.removalCost)} تومان`} />}
        <div className="flex items-center justify-between text-xs text-stone-300 pt-2 border-t border-stone-800">
          <span>برآورد کل پروژه:</span>
          <span className="font-bold text-white tabular-nums" data-testid="fl-subtotal">{fa(r.subtotal)} تومان</span>
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
        این مبلغ تقریبی است. کارشناس پس از اندازه‌گیری دقیق متراژ و بررسی وضعیت کف در منزل شما و دیدن نمونه‌ها، فاکتور قطعی را با کسر {formatDepositWords(deposit)} بیعانه صادر خواهد کرد.
      </QuoteDisclaimer>
    </QuoteShell>
  );
};
