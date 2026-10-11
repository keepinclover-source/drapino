import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare,
  Award,
  Layers,
  Store
} from 'lucide-react';
import { VisitRequest, VendorReview } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: VisitRequest;
  onSubmitReview: (review: Omit<VendorReview, 'id' | 'date'>) => void;
  existingReview?: VendorReview;
}

const ReviewModalInner: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmitReview,
  existingReview,
}) => {

  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Criteria
  const [fabricQuality, setFabricQuality] = useState<number>(existingReview?.criteria.fabricQuality || 5);
  const [specialistBehavior, setSpecialistBehavior] = useState<number>(existingReview?.criteria.specialistBehavior || 5);
  const [installationPrecision, setInstallationPrecision] = useState<number>(existingReview?.criteria.installationPrecision || 5);
  const [priceFairness, setPriceFairness] = useState<number>(existingReview?.criteria.priceFairness || 5);

  const [comment, setComment] = useState<string>(existingReview?.comment || '');
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(
    existingReview !== undefined ? existingReview.wouldRecommend : true
  );

  const availableTags = [
    'دوخت بسیار تمیز و ظریف',
    'تطابق ۱۰۰٪ با کالیته محل',
    'خوش‌قولی و اعزام سر وقت',
    'نصاب مجرب و بدون آسیب به دیوار',
    'مشاوره دقیق رنگ‌بندی با مبلمان',
    'اتوکشی و سرب‌دوزی استاندارد',
    'شفافیت در فاکتور و کسر بیعانه',
  ];

  const [selectedTags, setSelectedTags] = useState<string[]>(existingReview?.tags || [
    'دوخت بسیار تمیز و ظریف',
    'تطابق ۱۰۰٪ با کالیته محل',
  ]);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5: return 'عالی و بی‌نقص (پیشنهاد قطعی)';
      case 4: return 'خیلی خوب و رضایت‌بخش';
      case 3: return 'معمولی و متوسط';
      case 2: return 'نیاز به بهبود';
      case 1: return 'ناراضی و ضعیف';
      default: return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!comment.trim() || comment.trim().length < 8) {
      setErrorMsg('لطفاً نظر خود را در حداقل یک جمله توضیح دهید تا برای دیگر خریداران مفید باشد.');
      return;
    }

    setIsSubmitting(true);

    const reviewData: Omit<VendorReview, 'id' | 'date'> = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      vendorId: order.assignedVendorId || 'vnd-101',
      vendorName: order.assignedVendorName || 'فروشگاه مجری',
      customerId: 'usr-current',
      customerName: order.customerName,
      customerPhone: order.phone ? `${order.phone.slice(0, 4)}***${order.phone.slice(-4)}` : undefined,
      rating,
      criteria: {
        fabricQuality,
        specialistBehavior,
        installationPrecision,
        priceFairness,
      },
      comment: comment.trim(),
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      wouldRecommend,
      tags: selectedTags,
    };

    setTimeout(() => {
      onSubmitReview(reviewData);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const renderCriteriaStars = (value: number, onChange: (val: number) => void) => {
    return (
      <div className="flex items-center gap-1 dir-ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 text-stone-300 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Star
              className={`w-4 h-4 ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 text-right animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-white">
                  ثبت نظر و امتیاز تجربه خرید
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                  سفارش #{order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                فروشگاه مجری: {order.assignedVendorName || 'فروشگاه همکار'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-right">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Overall Star Rating */}
          <div className="p-5 bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-2xl border border-amber-200/70 text-center space-y-2">
            <span className="text-xs font-bold text-stone-800 block">
              امتیاز کلی شما به این سفارش و خدمات فروشگاه:
            </span>

            <div className="flex items-center justify-center gap-2 dir-ltr py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-500 fill-amber-500 drop-shadow-xs'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-xs font-black text-amber-900">
              {getRatingLabel(hoverRating || rating)}
            </div>
          </div>

          {/* Section 2: Detailed 4 Criteria */}
          <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
            <span className="font-bold text-stone-800 block mb-1">
              جزئیات امتیاز به ابعاد مختلف خدمات:
            </span>

            <div className="flex items-center justify-between py-1.5 border-b border-stone-200/70">
              <span className="text-stone-700 font-medium">کیفیت پارچه و ظرافت دوخت:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-800 font-mono">{fabricQuality} / ۵</span>
                {renderCriteriaStars(fabricQuality, setFabricQuality)}
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-stone-200/70">
              <span className="text-stone-700 font-medium">خوش‌قولی و رفتار کارشناس اعزامی:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-800 font-mono">{specialistBehavior} / ۵</span>
                {renderCriteriaStars(specialistBehavior, setSpecialistBehavior)}
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-stone-200/70">
              <span className="text-stone-700 font-medium">تمیزی و دقت نصب ریل و پرده:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-800 font-mono">{installationPrecision} / ۵</span>
                {renderCriteriaStars(installationPrecision, setInstallationPrecision)}
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-stone-700 font-medium">تناسب قیمت نهایی با کیفیت کار:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-800 font-mono">{priceFairness} / ۵</span>
                {renderCriteriaStars(priceFairness, setPriceFairness)}
              </div>
            </div>
          </div>

          {/* Section 3: Positive Highlight Tags */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-800 block">
              ویژگی‌های بارز و نقاط قوت سفارش (انتخاب سریع):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold shadow-2xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Written Review Comment */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              شرح تجربه خرید و متن نظر شما: *
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="لطفاً درباره کیفیت اعزام، رفتار کارشناس در منزل، تنوع کالیته‌ها و نتیجه نصب بنویسید..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 leading-relaxed"
            />
            <span className="text-[10px] text-stone-400 block">
              نظرات پس از ثبت در کارنامه عملکرد فروشگاه و پروفایل عمومی آن نمایش داده می‌شود.
            </span>
          </div>

          {/* Section 5: Recommendation Question */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800">
              آیا این فروشگاه را به دوستان و آشنایان پیشنهاد می‌کنید؟
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWouldRecommend(true)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  wouldRecommend
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>بله، پیشنهاد می‌کنم</span>
              </button>

              <button
                type="button"
                onClick={() => setWouldRecommend(false)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  !wouldRecommend
                    ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>خیر</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-200" />
              <span>{isSubmitting ? 'در حال ثبت...' : 'ثبت قطعی نظر و امتیاز'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export const ReviewModal: React.FC<ReviewModalProps> = (props) => {
  // بازگشت زودهنگام باید خارج از کامپوننت اصلی باشد تا تعداد hookها بین رندرها ثابت بماند
  if (!props.isOpen) return null;
  return <ReviewModalInner {...props} />;
};
