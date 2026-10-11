import React, { useEffect, useState } from 'react';
import { X, Calculator } from 'lucide-react';
import { ServiceCategoryPicker } from './ServiceCategoryPicker';
import { CurtainEstimatorModal } from './CurtainEstimatorModal';
import { WallpaperEstimatorModal } from './WallpaperEstimatorModal';
import { FlooringEstimatorModal } from './FlooringEstimatorModal';
import { QuoteCategory, QuoteProceedPayload } from '../utils/quoteEstimators';

interface SmartQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: (payload: QuoteProceedPayload) => void;
}

/**
 * استعلام قیمت هوشمند:
 * ابتدا می‌پرسد برای چه موردی استعلام می‌خواهید (پرده / کاغذ دیواری / کفپوش و پارکت)
 * و بعد فرم محاسبه‌ی مخصوص همان مورد را باز می‌کند.
 */
export const SmartQuoteModal: React.FC<SmartQuoteModalProps> = ({ isOpen, onClose, onProceedToBooking }) => {
  const [category, setCategory] = useState<QuoteCategory | null>(null);

  // هر بار که باز می‌شود از مرحله انتخاب موضوع شروع کن
  useEffect(() => {
    if (isOpen) setCategory(null);
  }, [isOpen]);

  if (!isOpen) return null;

  if (category === 'curtain') {
    return (
      <CurtainEstimatorModal
        isOpen
        onClose={onClose}
        onBack={() => setCategory(null)}
        onProceedToBooking={(details) => onProceedToBooking({ category: 'curtain', details })}
      />
    );
  }
  if (category === 'wallpaper') {
    return <WallpaperEstimatorModal onClose={onClose} onBack={() => setCategory(null)} onProceedToBooking={onProceedToBooking} />;
  }
  if (category === 'flooring') {
    return <FlooringEstimatorModal onClose={onClose} onBack={() => setCategory(null)} onProceedToBooking={onProceedToBooking} />;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-bold text-base sm:text-lg text-stone-900">استعلام قیمت هوشمند</h3>
              <span className="text-xs text-stone-500">در چه موردی می‌خواهید استعلام بگیرید؟</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ServiceCategoryPicker
          description="یکی از موارد زیر را انتخاب کنید؛ فرم محاسبه‌ی مخصوص همان مورد باز می‌شود و برآورد متراژ و هزینه را همین‌جا می‌بینید."
          onSelect={setCategory}
        />
      </div>
    </div>
  );
};
