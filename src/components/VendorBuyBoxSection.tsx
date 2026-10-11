import React, { useState, useMemo } from 'react';
import { 
  CurtainVendor, 
  BuyBoxSettings, 
  BuyBoxReservation, 
  VisitRequest 
} from '../types';
import { 
  Crown, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Flame, 
  Wallet, 
  TrendingUp, 
  Info, 
  ArrowRight, 
  Check, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Store,
  Phone,
  MessageSquare
} from 'lucide-react';
import { BuyBoxEligibility } from '../utils/restrictions';

interface VendorBuyBoxSectionProps {
  eligibility?: BuyBoxEligibility; // شرایط مجاز بودن شرکت در بای‌باکس (۷ روز پس از اولین شکار + آگهی فعال)
  currentVendor: CurtainVendor;
  buyBoxSettings: BuyBoxSettings;
  reservations: BuyBoxReservation[];
  orders: VisitRequest[];
  onReserveBuyBox: (dateIso: string, datePersian: string, price: number) => { success: boolean; message: string };
  onTopUpWallet: (amount: number) => void;
  onAcceptBuyBoxOrder: (orderId: string) => void;
  onRejectBuyBoxOrderToHunting: (orderId: string) => void;
  onOpenChat?: (order: VisitRequest) => void;
}

export const VendorBuyBoxSection: React.FC<VendorBuyBoxSectionProps> = ({
  eligibility,
  currentVendor,
  buyBoxSettings,
  reservations,
  orders,
  onReserveBuyBox,
  onTopUpWallet,
  onAcceptBuyBoxOrder,
  onRejectBuyBoxOrderToHunting,
  onOpenChat,
}) => {
  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);
  const [reservationNotice, setReservationNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isConfirmingModal, setIsConfirmingModal] = useState<boolean>(false);

  const formatNumber = (num: number) => num.toLocaleString('fa-IR');

  // Strict rule: maximum 8 days in a single solar month per vendor
  const MAX_MONTHLY_LIMIT = buyBoxSettings?.maxMonthlyDaysPerVendor || 8;
  const todayIso = new Date().toISOString().split('T')[0];

  // Calculate vendor's existing reservations for current solar month
  const currentMonthPersianPrefix = useMemo(() => {
    const now = new Date();
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit' }).format(now);
  }, []);

  const vendorReservationsThisMonth = useMemo(() => {
    return reservations.filter((r) => {
      if (r.vendorId !== currentVendor.id || r.status === 'cancelled') return false;
      const rPersianMonth = r.date ? r.date.split('/').slice(0, 2).join('/') : '';
      const isSamePersianMonth = rPersianMonth === currentMonthPersianPrefix;
      const isSameIsoMonth = r.dateIso ? r.dateIso.slice(0, 7) === todayIso.slice(0, 7) : false;
      return isSamePersianMonth || isSameIsoMonth;
    });
  }, [reservations, currentVendor.id, currentMonthPersianPrefix, todayIso]);

  const monthlyDaysUsed = vendorReservationsThisMonth.length;
  const remainingMonthlyDays = Math.max(0, MAX_MONTHLY_LIMIT - monthlyDaysUsed);

  // Active Buy Box reservation today for this vendor
  const activeReservationToday = reservations.find(
    (r) => r.vendorId === currentVendor.id && r.dateIso === todayIso && (r.status === 'active' || r.status === 'reserved')
  );

  // Incoming Buy Box orders pending vendor acceptance (within 15-minute time window)
  const pendingBuyBoxOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.isBuyBoxOrder &&
        o.buyBoxVendorId === currentVendor.id &&
        o.buyBoxStatus === 'pending_vendor_acceptance' &&
        o.status === 'bidding'
    );
  }, [orders, currentVendor.id]);

  // Generate the next 21 calendar days with availability
  const upcomingCalendarDays = useMemo(() => {
    const days = [];
    const baseDate = new Date();

    for (let i = 0; i < 21; i++) {
      const d = new Date();
      d.setDate(baseDate.getDate() + i);
      const iso = d.toISOString().split('T')[0];

      // Persian formatted date
      const pFull = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);

      const pDayName = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(d);
      const pDayNumber = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'short' }).format(d);

      const dayOfWeek = d.getDay(); // 4 = Thursday, 5 = Friday
      const isWeekend = dayOfWeek === 4 || dayOfWeek === 5;

      // Price calculation: Check city override first, then weekend, then daily base price
      const cityPricing = (buyBoxSettings.cityPricings || []).find(
        (c) => c.cityName === currentVendor.city && c.isActive
      );
      let calculatedPrice = cityPricing ? cityPricing.customDailyPrice : buyBoxSettings.dailyPrice;
      if (isWeekend && buyBoxSettings.weekendPrice) {
        calculatedPrice = buyBoxSettings.weekendPrice;
      }

      // Check if reserved already in this city
      const existingRes = reservations.find(
        (r) => r.dateIso === iso && r.vendorCity === currentVendor.city && r.status !== 'cancelled'
      );

      const isReservedByMe = existingRes?.vendorId === currentVendor.id;
      const isReservedByOther = existingRes && existingRes.vendorId !== currentVendor.id;
      const isAvailable = !existingRes;

      days.push({
        date: d,
        iso,
        pFull,
        pDayName,
        pDayNumber,
        isWeekend,
        price: calculatedPrice,
        isReservedByMe,
        isReservedByOther,
        reservedByVendorName: existingRes?.vendorName,
        isAvailable,
        isToday: i === 0,
      });
    }
    return days;
  }, [reservations, currentVendor.city, currentVendor.id, buyBoxSettings]);

  const selectedDayInfo = upcomingCalendarDays.find((d) => d.iso === selectedDateIso);

  const handleSelectDay = (day: typeof upcomingCalendarDays[0]) => {
    if (day.isReservedByOther) {
      setReservationNotice({
        type: 'error',
        message: `جایگاه بای‌باکس تاریخ ${day.pFull} در شهر ${currentVendor.city} قبلاً توسط فروشگاه «${day.reservedByVendorName}» رزرو شده است. لطفاً روز دیگری را انتخاب کنید.`,
      });
      return;
    }

    if (day.isReservedByMe) {
      setReservationNotice({
        type: 'success',
        message: `این روز قبلاً با موفقیت توسط شما رزرو شده است و در این تاریخ اولویت ۵۰٪ سفارشات منطقه به شما واگذار خواهد شد.`,
      });
      return;
    }

    if (monthlyDaysUsed >= MAX_MONTHLY_LIMIT) {
      setReservationNotice({
        type: 'error',
        message: `شما به سقف مجاز ${MAX_MONTHLY_LIMIT} روز رزرو در این ماه شمسی رسیده‌اید. برای جلوگیری از انحصار بازار، هر فروشگاه مجاز به حداکثر ۸ روز رزرو در ماه می‌باشد.`,
      });
      return;
    }

    setSelectedDateIso(day.iso);
    setReservationNotice(null);
  };

  const handleConfirmReservation = () => {
    if (!selectedDayInfo) return;

    if (eligibility && !eligibility.eligible) {
      setReservationNotice({ type: 'error', message: eligibility.reasons.join(' ') });
      setIsConfirmingModal(false);
      return;
    }

    if (currentVendor.walletBalance < selectedDayInfo.price) {
      const deficit = selectedDayInfo.price - currentVendor.walletBalance;
      setReservationNotice({
        type: 'error',
        message: `موجودی کیف پول شما کافی نیست. مبلغ مورد نیاز: ${formatNumber(selectedDayInfo.price)} تومان (کسری: ${formatNumber(deficit)} تومان). لطفاً ابتدا کیف پول خود را شارژ فرمایید.`,
      });
      return;
    }

    const res = onReserveBuyBox(selectedDayInfo.iso, selectedDayInfo.pFull, selectedDayInfo.price);
    if (res.success) {
      setReservationNotice({
        type: 'success',
        message: `تبریک! جایگاه اولویت بای‌باکس برای روز ${selectedDayInfo.pDayName} مورخ ${selectedDayInfo.pFull} با موفقیت برای فروشگاه شما ثبت شد. مبلغ ${formatNumber(selectedDayInfo.price)} تومان از کیف پول کسر گردید.`,
      });
      setSelectedDateIso(null);
      setIsConfirmingModal(false);
    } else {
      setReservationNotice({
        type: 'error',
        message: res.message,
      });
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">

      {eligibility && !eligibility.eligible && (
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 space-y-2" data-testid="buybox-ineligible">
          <div className="font-black text-rose-900 text-sm">شرایط شرکت در بای‌باکس برای فروشگاه شما هنوز کامل نیست</div>
          <ul className="list-disc pr-5 space-y-1 text-xs text-rose-900 leading-relaxed">
            {eligibility.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* ========================================================================= */}
      {/* 1. HERO HEADER BANNER & MONTHLY LIMIT PROGRESS */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-amber-500/20">
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>سامانه رزرو جایگاه برگزیده بای‌باکس (Buy Box)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-stone-200 border border-white/20">
                شهر: {currentVendor.city}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              دریافت اختصاصی تا ۵۰٪ سفارشات روز با رزرو زودهنگام بای‌باکس
            </h2>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              با رزرو جایگاه بای‌باکس در روزهای دلخواه، سفارشات مشتریان در مناطق تحت پوشش شما قبل از ورود به تابلوی شکار عمومی، 
              <strong> به صورت اختصاصی با مهلت ۱۵ دقیقه‌ای </strong> به فروشگاه شما پیشنهاد می‌گردد.
            </p>
          </div>

          {/* Monthly Cap Gauge Card */}
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 min-w-[240px] text-center space-y-2.5 shrink-0">
            <div className="flex items-center justify-between text-xs text-amber-200 font-bold">
              <span>سهمیه مجاز ماه جاری:</span>
              <span className="font-mono text-white text-sm">{monthlyDaysUsed} از ۸ روز</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-white/15 h-3 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  monthlyDaysUsed >= 8 
                    ? 'bg-rose-500' 
                    : monthlyDaysUsed >= 5 
                      ? 'bg-amber-400' 
                      : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (monthlyDaysUsed / MAX_MONTHLY_LIMIT) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-300">
              <span>روزهای باقیمانده:</span>
              <span className="font-mono font-bold text-amber-300">{remainingMonthlyDays} روز دیگر</span>
            </div>

            <p className="text-[10px] text-stone-400 pt-1 border-t border-white/10 leading-tight">
              جهت حفظ تعادل بازار، سقف رزرو ماهانه هر فروشگاه حداکثر ۸ روز است.
            </p>
          </div>
        </div>

        {/* Status of Today */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-300">وضعیت امروز فروشگاه:</span>
            {activeReservationToday ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>شما امروز برنده فعال بای‌باکس هستید! (اولویت ۵۰٪ سفارشات)</span>
              </span>
            ) : (
              <span className="bg-stone-800 text-stone-400 px-2.5 py-0.5 rounded-full">
                امروز رزرو نشده است (سفارشات از تابلوی شکار عمومی دریافت می‌شوند)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-stone-300">موجودی کیف پول:</span>
            <span className="text-emerald-400 font-bold">{formatNumber(currentVendor.walletBalance)} تومان</span>
            <button
              onClick={() => onTopUpWallet(1500000)}
              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
            >
              + شارژ آنلاین
            </button>
          </div>
        </div>

      </div>

      {/* Alert / Notice Display */}
      {reservationNotice && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${
          reservationNotice.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-center gap-2">
            {reservationNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{reservationNotice.message}</span>
          </div>
          <button 
            onClick={() => setReservationNotice(null)}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LIVE PENDING BUY BOX ORDERS (Orders waiting for 15-min acceptance) */}
      {/* ========================================================================= */}
      {pendingBuyBoxOrders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-stone-50 rounded-3xl p-6 border-2 border-amber-400 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Crown className="w-4 h-4 fill-white" />
              </span>
              <div>
                <h3 className="font-black text-stone-900 text-sm sm:text-base">
                  سفارش اختصاصی بای‌باکس منتظر تایید شما ({pendingBuyBoxOrders.length} سفارش)
                </h3>
                <p className="text-xs text-stone-600">
                  این سفارش به خاطر امتیاز بای‌باکس ابتدا به شما داده شده است. لطفاً پیش از اتمام مهلت ۱۵ دقیقه‌ای تایید فرمایید.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 animate-pulse">
              مهلت ۱۵ دقیقه فعال
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingBuyBoxOrders.map((ord) => {
              const minutesRemaining = ord.buyBoxExpiresAt 
                ? Math.max(0, Math.ceil((ord.buyBoxExpiresAt - Date.now()) / (60 * 1000)))
                : 15;

              return (
                <div 
                  key={ord.id}
                  className="bg-white rounded-2xl p-4 border border-amber-300 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="font-mono font-bold text-sm text-stone-900">سفارش #{ord.orderNumber}</span>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{minutesRemaining} دقیقه تا انتقال به شکار</span>
                    </span>
                  </div>

                  <div className="text-xs text-stone-700 space-y-1">
                    <p><strong>مشتری:</strong> {ord.customerName}</p>
                    <p><strong>منطقه:</strong> {ord.city}، {ord.district} ({ord.address})</p>
                    <p><strong>ابعاد و فضا:</strong> {ord.rooms.join('، ')} (حدود {ord.approximateWindows} پنجره - {ord.approximateWidthMeters} متر)</p>
                    <p><strong>سبک‌های منتخب:</strong> {ord.preferredStyles.join('، ')}</p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onRejectBuyBoxOrderToHunting(ord.id)}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      انتقال به شکار همکاران
                    </button>

                    <button
                      type="button"
                      onClick={() => onAcceptBuyBoxOrder(ord.id)}
                      className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>تایید و اعزام کارشناس</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CALENDAR RESERVATION GRID (NEXT 21 DAYS) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                تقویم رزرو روزهای بای‌باکس در شهر {currentVendor.city}
              </h3>
              <p className="text-xs text-stone-500">
                روز مورد نظر خود را انتخاب و با پرداخت تعرفه مصوب، سهمیه اولویت سفارشات آن روز را رزرو فرمایید
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>قابل رزرو</span>
            </span>
            <span className="flex items-center gap-1 text-amber-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>رزرو شده توسط شما</span>
            </span>
            <span className="flex items-center gap-1 text-stone-400">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              <span>رزرو همکار دیگر</span>
            </span>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
          {upcomingCalendarDays.map((day) => {
            const isSelected = selectedDateIso === day.iso;

            let cardStyles = 'bg-stone-50 hover:bg-amber-50/80 border-stone-200 hover:border-amber-300 cursor-pointer';
            if (day.isReservedByMe) {
              cardStyles = 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/40 cursor-default';
            } else if (day.isReservedByOther) {
              cardStyles = 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed';
            } else if (isSelected) {
              cardStyles = 'bg-amber-800 text-white border-amber-900 ring-2 ring-amber-500 shadow-md cursor-pointer';
            }

            return (
              <div
                key={day.iso}
                onClick={() => handleSelectDay(day)}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col justify-between h-36 ${cardStyles}`}
              >
                <div>
                  <span className={`text-[11px] font-bold block ${isSelected ? 'text-amber-200' : 'text-stone-500'}`}>
                    {day.pDayName}
                  </span>
                  <span className={`text-base font-black font-mono block mt-0.5 ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                    {day.pDayNumber}
                  </span>
                  {day.isToday && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold inline-block mt-0.5 ${
                      isSelected ? 'bg-amber-700 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      امروز
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-black/5">
                  {day.isReservedByMe ? (
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md block truncate">
                      رزرو شما ✓
                    </span>
                  ) : day.isReservedByOther ? (
                    <span className="text-[10px] text-stone-500 block truncate" title={`رزرو شده توسط ${day.reservedByVendorName}`}>
                      تکمیل (همکار)
                    </span>
                  ) : (
                    <div>
                      <span className={`text-xs font-mono font-bold block ${isSelected ? 'text-amber-200' : 'text-emerald-700'}`}>
                        {formatNumber(day.price)} ت
                      </span>
                      <span className={`text-[9px] block mt-0.5 ${isSelected ? 'text-amber-100' : 'text-stone-400'}`}>
                        {day.isWeekend ? 'پیک آخر هفته' : 'تعرفه روزانه'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Action Bar */}
        {selectedDayInfo && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-700" />
                <h4 className="font-extrabold text-xs sm:text-sm text-amber-950">
                  فاکتور رزرو بای‌باکس برای {selectedDayInfo.pDayName} مورخ {selectedDayInfo.pFull}
                </h4>
              </div>
              <p className="text-xs text-stone-600">
                مبلغ قابل پرداخت از کیف پول: <strong>{formatNumber(selectedDayInfo.price)} تومان</strong> | 
                سهمیه ماهانه باقی‌مانده شما پس از این رزرو: <strong>{remainingMonthlyDays - 1} روز</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDateIso(null)}
                className="px-3 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                انصراف
              </button>

              {currentVendor.walletBalance >= selectedDayInfo.price ? (
                <button
                  type="button"
                  onClick={handleConfirmReservation}
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تایید رزرو و پرداخت {formatNumber(selectedDayInfo.price)} تومان</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onTopUpWallet(selectedDayInfo.price - currentVendor.walletBalance)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Wallet className="w-4 h-4" />
                  <span>شارژ کسری کیف پول ({formatNumber(selectedDayInfo.price - currentVendor.walletBalance)} ت)</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. MY RESERVATIONS HISTORY & PERFORMANCE TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-700" />
            <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
              تاریخچه و عملکرد رزروهای بای‌باکس فروشگاه شما ({vendorReservationsThisMonth.length} رزرو)
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            سقف مجاز: حداکثر ۸ روز در هر ماه شمسی
          </span>
        </div>

        {vendorReservationsThisMonth.length === 0 ? (
          <div className="p-8 text-center text-stone-400 space-y-1">
            <Calendar className="w-8 h-8 mx-auto text-stone-300 mb-1" />
            <p className="text-xs font-bold">هنوز هیچ رزروی برای این ماه ثبت نکرده‌اید.</p>
            <p className="text-[11px]">با انتخاب یک روز از تقویم بالا، اولویت سفارشات آن روز را تصاحب کنید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3">تاریخ رزرو</th>
                  <th className="p-3">مبلغ پرداختی</th>
                  <th className="p-3">وضعیت</th>
                  <th className="p-3">سفارشات دریافتی</th>
                  <th className="p-3">سفارشات قبول‌شده</th>
                  <th className="p-3">ارجاع به شکار (منقضی)</th>
                  <th className="p-3">نرخ موفقیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {vendorReservationsThisMonth.map((res) => {
                  const successRate = res.ordersReceivedCount > 0 
                    ? Math.round((res.ordersAcceptedCount / res.ordersReceivedCount) * 100) 
                    : 100;

                  return (
                    <tr key={res.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3 font-bold text-stone-900 font-sans">{res.date}</td>
                      <td className="p-3 text-emerald-800 font-bold">{formatNumber(res.pricePaid)} ت</td>
                      <td className="p-3 font-sans">
                        {res.status === 'active' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            فعال امروز
                          </span>
                        )}
                        {res.status === 'reserved' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            رزرو قطعی
                          </span>
                        )}
                        {res.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                            پایان یافته
                          </span>
                        )}
                      </td>
                      <td className="p-3">{formatNumber(res.ordersReceivedCount)}</td>
                      <td className="p-3 text-emerald-700 font-bold">{formatNumber(res.ordersAcceptedCount)}</td>
                      <td className="p-3 text-rose-600">{formatNumber(res.ordersExpiredCount)}</td>
                      <td className="p-3 text-amber-900 font-bold">٪{formatNumber(successRate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
