import React, { useState } from 'react';
import { CurtainVendor } from '../types';
import { 
  Wallet, 
  X, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface WalletTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: CurtainVendor;
  onTopUp: (amount: number) => void;
  suggestedAmount?: number;
  reasonText?: string;
}

const PRESET_AMOUNTS = [
  { amount: 550000, label: '۵۵۰,۰۰۰ تومان', subtitle: 'معادل شکار ۱ سفارش' },
  { amount: 1100000, label: '۱,۱۰۰,۰۰۰ تومان', subtitle: 'معادل شکار ۲ سفارش' },
  { amount: 2200000, label: '۲,۲۰۰,۰۰۰ تومان', subtitle: 'معادل شکار ۴ سفارش' },
  { amount: 5500000, label: '۵,۵۰۰,۰۰۰ تومان', subtitle: 'بسته ۱۰ سفارشی پرفروش' },
];

export const WalletTopUpModal: React.FC<WalletTopUpModalProps> = ({
  isOpen,
  onClose,
  vendor,
  onTopUp,
  suggestedAmount,
  reasonText,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(suggestedAmount || 550000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<'saman' | 'mellat' | 'zarinpal'>('saman');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const finalAmount = isCustom ? (parseInt(customAmount.replace(/\D/g, ''), 10) || 0) : selectedAmount;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount < 100000) return;

    setIsProcessing(true);
    // Simulate real gateway handshake
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      onTopUp(finalAmount);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 text-right animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                افزایش موجودی کیف پول فروشگاه
              </h3>
              <p className="text-xs text-amber-200/80">
                {vendor.name} (مدیریت: {vendor.ownerName})
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-stone-300">موجودی فعلی کیف پول:</span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {vendor.walletBalance.toLocaleString('fa-IR')} تومان
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {reasonText && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">نیاز به افزایش اعتبار جهت شکار سفارش</p>
                <p className="text-stone-600 mt-0.5">{reasonText}</p>
              </div>
            </div>
          )}

          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-stone-900">
                شارژ کیف پول با موفقیت انجام شد!
              </h4>
              <p className="text-xs text-stone-600 font-mono">
                مبلغ {finalAmount.toLocaleString('fa-IR')} تومان به حساب فروشگاه افزوده شد.
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold">
                اکنون می‌توانید بلافاصله سفارش مورد نظر را شکار نمایید.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-5">
              
              {/* Preset Amounts */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-2">
                  انتخاب مبلغ شارژ:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PRESET_AMOUNTS.map((item) => {
                    const isSelected = !isCustom && selectedAmount === item.amount;
                    return (
                      <button
                        key={item.amount}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(item.amount);
                          setIsCustom(false);
                        }}
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-700 bg-amber-50/80 ring-2 ring-amber-700/20 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                        }`}
                      >
                        <span className={`text-xs font-black ${isSelected ? 'text-amber-950' : 'text-stone-900'}`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-stone-500 mt-1">
                          {item.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amount Button/Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCustom(!isCustom)}
                    className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1"
                  >
                    <span>{isCustom ? 'انتخاب از مبالغ پیشنهادی' : 'یا وارد کردن مبلغ دلخواه'}</span>
                  </button>
                </div>

                {isCustom && (
                  <div className="relative">
                    <input
                      type="number"
                      min={100000}
                      step={50000}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="مثلاً: ۶۰۰۰۰۰"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-hidden"
                    />
                    <span className="absolute left-3 top-3.5 text-xs text-stone-500 font-semibold">
                      تومان
                    </span>
                  </div>
                )}
              </div>

              {/* Gateway Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-2">
                  درگاه پرداخت امن بانکی:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('saman')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                      paymentGateway === 'saman'
                        ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-700'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    سامان کیش (سپ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('mellat')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                      paymentGateway === 'mellat'
                        ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-700'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    به‌پرداخت ملت
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('zarinpal')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                      paymentGateway === 'zarinpal'
                        ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-700'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    زرین‌پال
                  </button>
                </div>
              </div>

              {/* Financial summary note */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
                <div className="flex justify-between items-center text-stone-800 font-bold">
                  <span>مبلغ قابل پرداخت آنلاین:</span>
                  <span className="font-mono text-sm text-emerald-800">
                    {finalAmount.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <p className="text-[10px] text-stone-500">
                  * مبلغ پس از تایید شاپرک آنی به کیف پول فروشگاه اضافه شده و فاکتور رسمی صادر می‌گردد.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || finalAmount < 100000}
                className="w-full py-3.5 px-4 bg-amber-700 hover:bg-amber-800 active:scale-[0.99] text-white rounded-xl text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>در حال اتصال به شاپرک و شارژ حساب...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>پرداخت امن شتاب ({finalAmount.toLocaleString('fa-IR')} تومان)</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>تضمین امنیت پرداخت شاپرک دراپینو</span>
          </div>
          <span className="font-mono">SSL 256-Bit Encrypted</span>
        </div>

      </div>
    </div>
  );
};
