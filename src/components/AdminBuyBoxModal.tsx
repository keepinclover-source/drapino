import React from 'react';
import { BuyBoxSettings, BuyBoxReservation, CurtainVendor } from '../types';
import { AdminBuyBoxManagement } from './AdminBuyBoxManagement';
import { X, Crown } from 'lucide-react';

interface AdminBuyBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BuyBoxSettings;
  reservations: BuyBoxReservation[];
  vendors: CurtainVendor[];
  onUpdateSettings: (newSettings: BuyBoxSettings) => void;
  onCancelReservation?: (reservationId: string, refundAmount?: number) => void;
}

export const AdminBuyBoxModal: React.FC<AdminBuyBoxModalProps> = ({
  isOpen,
  onClose,
  settings,
  reservations,
  vendors,
  onUpdateSettings,
  onCancelReservation,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-stone-50 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>تنظیمات و مدیریت جایگاه بای‌باکس (Buy Box)</span>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  مدیریت ارشد پلتفرم
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                تعرفه روزانه، سقف ماهانه هر فروشگاه، کنترل حداکثر ۵۰٪ سفارشات و جدول رزروها
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <AdminBuyBoxManagement
            settings={settings}
            reservations={reservations}
            vendors={vendors}
            onUpdateSettings={onUpdateSettings}
            onCancelReservation={onCancelReservation}
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
};
