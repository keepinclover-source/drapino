import React, { useState } from 'react';
import { 
  BuyBoxSettings, 
  BuyBoxReservation, 
  BuyBoxCityPricing, 
  CurtainVendor 
} from '../types';
import { 
  Sparkles, 
  Crown, 
  Settings, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Save, 
  Percent, 
  DollarSign, 
  Building2, 
  SlidersHorizontal, 
  Search, 
  Filter, 
  TrendingUp, 
  Award, 
  Info, 
  Zap, 
  X, 
  Store, 
  Flame, 
  ArrowLeftRight,
  ChevronDown
} from 'lucide-react';

interface AdminBuyBoxManagementProps {
  settings: BuyBoxSettings;
  reservations: BuyBoxReservation[];
  vendors: CurtainVendor[];
  onUpdateSettings: (newSettings: BuyBoxSettings) => void;
  onCancelReservation?: (reservationId: string, refundAmount?: number) => void;
  className?: string;
}

export const AdminBuyBoxManagement: React.FC<AdminBuyBoxManagementProps> = ({
  settings: initialSettings,
  reservations,
  vendors,
  onUpdateSettings,
  onCancelReservation,
  className = '',
}) => {
  // Local form state for settings
  const [formData, setFormData] = useState<BuyBoxSettings>({ ...initialSettings });
  const [activeTab, setActiveTab] = useState<'settings' | 'reservations' | 'simulation'>('settings');
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // Reservation list filters
  const [reservationSearch, setReservationSearch] = useState('');
  const [reservationStatusFilter, setReservationStatusFilter] = useState<'all' | 'active' | 'reserved' | 'completed' | 'cancelled'>('all');
  const [reservationCityFilter, setReservationCityFilter] = useState<string>('all');

  // Simulation test state
  const [simulatedOrderCity, setSimulatedOrderCity] = useState('تهران');
  const [simulatedDistrict, setSimulatedDistrict] = useState('منطقه ۳');
  const [simulationResult, setSimulationResult] = useState<{
    assignedToBuyBox: boolean;
    reason: string;
    targetVendor?: string;
  } | null>(null);

  const formatNumber = (num: number) => num.toLocaleString('fa-IR');

  const handlePricePreset = (price: number) => {
    setFormData(prev => ({ ...prev, dailyPrice: price }));
  };

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Guard rails validation
    const clampedPercentage = Math.min(Math.max(formData.maxDailyPercentage, 10), 50); // Hard cap 50%
    const validatedSettings: BuyBoxSettings = {
      ...formData,
      maxDailyPercentage: clampedPercentage,
      maxMonthlyDaysPerVendor: Math.max(1, Math.min(formData.maxMonthlyDaysPerVendor, 10)),
      acceptanceTimeoutMinutes: Math.max(5, Math.min(formData.acceptanceTimeoutMinutes, 60)),
    };

    onUpdateSettings(validatedSettings);
    setFormData(validatedSettings);
    setSavedSuccessMessage('تنظیمات و تعرفه‌های بای‌باکس با موفقیت در سامانه ذخیره و اعمال گردید.');
    setTimeout(() => setSavedSuccessMessage(null), 4000);
  };

  const handleResetDefaults = () => {
    const defaults: BuyBoxSettings = {
      isEnabled: true,
      dailyPrice: 1200000,
      weekendPrice: 1500000,
      maxDailyPercentage: 50,
      acceptanceTimeoutMinutes: 15,
      maxMonthlyDaysPerVendor: 4,
      eligibleTiers: ['طلایی', 'نقره‌ای'],
      minRating: 4.5,
      minCompletedOrders: 5,
      autoAssignEnabled: true,
      cityPricings: [
        { cityName: 'تهران', customDailyPrice: 1400000, isActive: true },
        { cityName: 'مشهد', customDailyPrice: 1100000, isActive: true },
        { cityName: 'اصفهان', customDailyPrice: 1000000, isActive: true },
        { cityName: 'شیراز', customDailyPrice: 1000000, isActive: true },
        { cityName: 'کرج', customDailyPrice: 1100000, isActive: true },
        { cityName: 'تبریز', customDailyPrice: 950000, isActive: true },
      ],
      refundPolicyText: 'در صورتی که در روز فعال بودن بای‌باکس حداقل ۲ سفارش واجد شرایط ارجاع نگردد، ۵۰٪ وجه رزرو به صورت اعتبار در کیف پول مسترد خواهد شد. لغو رزرو تا ۲۴ ساعت پیش از شروع روز بدون جریمه امکان‌پذیر است.'
    };
    setFormData(defaults);
    onUpdateSettings(defaults);
    setSavedSuccessMessage('تنظیمات به مقادیر پیش‌فرض مصوب بازنشانی شد.');
    setTimeout(() => setSavedSuccessMessage(null), 3000);
  };

  // City pricing update helper
  const handleCityPriceChange = (cityName: string, newPrice: number) => {
    const currentList = formData.cityPricings || [];
    const exists = currentList.some(c => c.cityName === cityName);
    let updated: BuyBoxCityPricing[];
    if (exists) {
      updated = currentList.map(c => c.cityName === cityName ? { ...c, customDailyPrice: newPrice } : c);
    } else {
      updated = [...currentList, { cityName, customDailyPrice: newPrice, isActive: true }];
    }
    setFormData(prev => ({ ...prev, cityPricings: updated }));
  };

  const handleToggleCityActive = (cityName: string) => {
    const currentList = formData.cityPricings || [];
    const updated = currentList.map(c => c.cityName === cityName ? { ...c, isActive: !c.isActive } : c);
    setFormData(prev => ({ ...prev, cityPricings: updated }));
  };

  // Toggle eligible tier
  const handleToggleTier = (tier: 'طلایی' | 'نقره‌ای' | 'برنز') => {
    const exists = formData.eligibleTiers.includes(tier);
    let updated: ('طلایی' | 'نقره‌ای' | 'برنز')[];
    if (exists) {
      if (formData.eligibleTiers.length === 1) return; // Keep at least one
      updated = formData.eligibleTiers.filter(t => t !== tier);
    } else {
      updated = [...formData.eligibleTiers, tier];
    }
    setFormData(prev => ({ ...prev, eligibleTiers: updated }));
  };

  // Run Order Assignment Simulation
  const handleRunSimulation = () => {
    const todayIso = new Date().toISOString().split('T')[0];
    const activeRes = reservations.find(r => 
      r.status === 'active' && 
      r.vendorCity === simulatedOrderCity &&
      r.coveredDistricts.some(d => d.includes(simulatedDistrict) || simulatedDistrict.includes(d))
    );

    if (!formData.isEnabled) {
      setSimulationResult({
        assignedToBuyBox: false,
        reason: 'سیستم بای‌باکس در پنل مدیریت به صورت سراسری غیرفعال است. سفارش مستقیماً به تابلوی شکار رقابتی ارسال می‌شود.'
      });
      return;
    }

    if (!activeRes) {
      setSimulationResult({
        assignedToBuyBox: false,
        reason: `برای تاریخ امروز در شهر ${simulatedOrderCity} و محله ${simulatedDistrict} هیچ فروشنده‌ای برنده جایگاه بای‌باکس نیست. سفارش برای شکار کلیه فروشندگان منتشر می‌شود.`
      });
      return;
    }

    // 50% max daily rule test
    const ordersReceived = activeRes.ordersReceivedCount;
    // If odd index order or within 50% quota
    const assigned = ordersReceived % 2 === 0; // Alternates 50%
    if (assigned) {
      setSimulationResult({
        assignedToBuyBox: true,
        reason: `سفارش در سهمیه ۵۰٪ بای‌باکس قرار گرفت و به مدت ${formData.acceptanceTimeoutMinutes} دقیقه اختصاصاً به فروشگاه «${activeRes.vendorName}» پیشنهاد می‌گردد. در صورت عدم پذیرش در زمان تعیین شده، به تابلوی شکار برمی‌گردد.`,
        targetVendor: activeRes.vendorName
      });
    } else {
      setSimulationResult({
        assignedToBuyBox: false,
        reason: `جهت رعایت قانون سقف ۵۰٪، این سفارش به تابلوی شکار آزاد رقابتی تخصیص داده شد تا سایر همکاران صنف نیز شانس دریافت سفارش داشته باشند.`
      });
    }
  };

  // Metrics
  const activeTodayCount = reservations.filter(r => r.status === 'active').length;
  const totalRevenue = reservations.filter(r => r.status !== 'cancelled').reduce((acc, r) => acc + (r.pricePaid || 0), 0);
  const totalOrdersAssignedThroughBuyBox = reservations.reduce((acc, r) => acc + (r.ordersAcceptedCount || 0), 0);

  // Filtered reservations
  const filteredReservations = reservations.filter(r => {
    const matchesSearch = 
      r.vendorName.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      r.vendorPhone.includes(reservationSearch) ||
      r.date.includes(reservationSearch);
    const matchesStatus = reservationStatusFilter === 'all' || r.status === reservationStatusFilter;
    const matchesCity = reservationCityFilter === 'all' || r.vendorCity === reservationCityFilter;
    return matchesSearch && matchesStatus && matchesCity;
  });

  const getStatusBadge = (status: BuyBoxReservation['status']) => {
    switch (status) {
      case 'active':
        return { label: 'فعال امروز (اولویت ۵۰٪)', classes: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/30' };
      case 'reserved':
        return { label: 'رزرو قطعی (آینده)', classes: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'completed':
        return { label: 'پایان یافته و تسویه', classes: 'bg-stone-100 text-stone-700 border-stone-300' };
      case 'cancelled':
        return { label: 'لغو شده / مسترد', classes: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { label: status, classes: 'bg-stone-100 text-stone-700' };
    }
  };

  return (
    <div className={`space-y-6 text-right ${className}`} dir="rtl">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & HERO BANNER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>سامانه واگذاری اولویت سفارشات (Buy Box)</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                formData.isEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {formData.isEnabled ? 'سیستم فعال است' : 'سیستم موقتاً غیرفعال است'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              تنظیمات تعرفه‌گذاری، سقف‌های ماهانه و مانیتورینگ بای‌باکس
            </h2>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              فروشگاه‌های ممتاز با پرداخت هزینه روزانه جایگاه بای‌باکس را پیش‌خرید می‌کنند. طبق آیین‌نامه، 
              <strong> حداکثر ۵۰٪ سفارشات روزانه </strong> به برنده اولویت داده شده و در صورت عدم پذیرش ظرف 
              <strong> {formData.acceptanceTimeoutMinutes} دقیقه</strong>، سفارش به تابلوی شکار بازمی‌گردد.
            </p>
          </div>

          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
              <span className="text-[11px] text-amber-200 block font-medium">رزروهای فعال امروز</span>
              <span className="text-xl font-black text-white font-mono">{formatNumber(activeTodayCount)}</span>
            </div>

            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
              <span className="text-[11px] text-amber-200 block font-medium">سقف سهمیه سفارشات</span>
              <span className="text-xl font-black text-amber-400 font-mono">٪{formData.maxDailyPercentage}</span>
            </div>

            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] text-amber-200 block font-medium">کل درآمد بای‌باکس</span>
              <span className="text-sm font-black text-emerald-300 font-mono block truncate">
                {formatNumber(totalRevenue)} ت
              </span>
            </div>
          </div>
        </div>

        {/* Global Master Switch */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.isEnabled} 
                onChange={(e) => setFormData(prev => ({ ...prev, isEnabled: e.target.checked }))}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-stone-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
            <span className="text-xs sm:text-sm font-bold text-stone-200">
              {formData.isEnabled ? 'قابلیت رزرو و اولویت بای‌باکس در پلتفرم فعال و در دسترس همکاران است' : 'قابلیت رزرو موقتاً خاموش است (سفارشات تماماً در تابلوی شکار قرار می‌گیرند)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات</span>
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="بازنشانی به مقادیر مصوب اولیه"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پیش‌فرض</span>
            </button>
          </div>
        </div>

      </div>

      {/* Success Notification Alert */}
      {savedSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedSuccessMessage}</span>
          </div>
          <button onClick={() => setSavedSuccessMessage(null)} className="p-1 hover:bg-emerald-200 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>فرم تنظیمات قیمت‌گذاری و محدودیت‌های انحصار</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer relative ${
            activeTab === 'reservations'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>جدول رزروها و تقویم واگذاری ({reservations.length})</span>
          {activeTodayCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulation')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'simulation'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>شبیه‌ساز تخصیص ۵۰٪ و شکار رقابتی</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SETTINGS FORM (CORE REQUIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Card 1: Pricing Controls */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900">
                  تعرفه پایه رزرو جایگاه بای‌باکس (روزانه)
                </h3>
                <p className="text-xs text-stone-500">
                  مبلغی که فروشنده جهت در اختیار گرفتن اولویت سفارشات برای ۲۴ ساعت پرداخت می‌نماید
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Daily Base Price */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">
                  قیمت روزهای عادی (تومان):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={100000}
                    step={50000}
                    value={formData.dailyPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, dailyPrice: Number(e.target.value) }))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-stone-900 font-mono text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-stone-500 font-medium">تومان</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-stone-500">انتخاب سریع:</span>
                  {[800000, 1000000, 1200000, 1500000, 2000000].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePricePreset(p)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border cursor-pointer transition-colors ${
                        formData.dailyPrice === p 
                          ? 'bg-amber-800 text-white border-amber-900' 
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                      }`}
                    >
                      {formatNumber(p)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekend / Peak Price */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">
                  قیمت روزهای آخر هفته و تعطیلات (پنجشنبه و جمعه):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={100000}
                    step={50000}
                    value={formData.weekendPrice || formData.dailyPrice * 1.25}
                    onChange={(e) => setFormData(prev => ({ ...prev, weekendPrice: Number(e.target.value) }))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-stone-900 font-mono text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-stone-500 font-medium">تومان</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  به علت حجم بالاتر درخواست‌های مشتریان در آخر هفته، نرخ ترجیحی برای این روزها پیشنهاد می‌شود.
                </p>
              </div>

            </div>

            {/* City Pricing Overrides */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  <span>تعرفه‌گذاری تفکیکی برای کلان‌شهرها:</span>
                </div>
                <span className="text-[11px] text-stone-500">
                  در صورت تمایل می‌توانید برای هر شهر نرخ روزانه متفاوتی تعریف فرمایید.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(formData.cityPricings || []).map((cp) => (
                  <div 
                    key={cp.cityName}
                    className={`p-3 rounded-2xl border transition-all ${
                      cp.isActive ? 'bg-stone-50 border-stone-200' : 'bg-stone-100/60 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-stone-900">{cp.cityName}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleCityActive(cp.cityName)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold cursor-pointer ${
                          cp.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {cp.isActive ? 'فعال' : 'نرخ پایه'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step={50000}
                        value={cp.customDailyPrice}
                        disabled={!cp.isActive}
                        onChange={(e) => handleCityPriceChange(cp.cityName, Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-mono text-stone-900 disabled:bg-stone-100"
                      />
                      <span className="absolute left-2 top-1 text-[10px] text-stone-400">تومان</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Card 2: Fair Competition & Anti-Monopoly Limits */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900">
                  قوانین رقابت عادلانه و جلوگیری از انحصار (Anti-Monopoly Rules)
                </h3>
                <p className="text-xs text-stone-500">
                  سیاست‌های الزامی اتحادیه برای جلوگیری از تصاحب مداوم سفارشات توسط یک یا چند فروشگاه
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Max Monthly Days Cap */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800">سقف مجاز روزهای رزرو در هر ماه:</label>
                  <span className="text-sm font-black font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg">
                    {formData.maxMonthlyDaysPerVendor} روز در ماه
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={formData.maxMonthlyDaysPerVendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxMonthlyDaysPerVendor: Number(e.target.value) }))}
                  className="w-full accent-amber-700 cursor-pointer"
                />
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  هیچ فروشگاهی نمی‌تواند بیش از {formData.maxMonthlyDaysPerVendor} روز در ماه جایگاه بای‌باکس را رزرو کند. 
                  این قانون گردش عادلانه سفارشات بین تمام همکاران را تضمین می‌کند.
                </p>
              </div>

              {/* 50% Daily Share Cap */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800">حداکثر سهم روزانه بای‌باکس:</label>
                  <span className="text-sm font-black font-mono text-amber-900 bg-white px-2 py-0.5 rounded-lg border border-amber-300">
                    ٪{formData.maxDailyPercentage} از سفارشات
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={50}
                  step={5}
                  value={formData.maxDailyPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxDailyPercentage: Math.min(50, Number(e.target.value)) }))}
                  className="w-full accent-amber-700 cursor-pointer"
                />
                <p className="text-[11px] text-amber-950 leading-relaxed">
                  حداکثر سقف ممکن طبق قانون ۵۰٪ است. مابقی حداقل ۵۰٪ سفارشات همیشه به تابلوی شکار آزاد اختصاص می‌یابد تا سایر فروشگاه‌ها رقابت کنند.
                </p>
              </div>

              {/* Time Window for Acceptance */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800">مهلت زمانی پذیرش سفارش:</label>
                  <span className="text-sm font-black font-mono text-indigo-950 bg-indigo-100 px-2 py-0.5 rounded-lg">
                    {formData.acceptanceTimeoutMinutes} دقیقه
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={5}
                  value={formData.acceptanceTimeoutMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptanceTimeoutMinutes: Number(e.target.value) }))}
                  className="w-full accent-indigo-700 cursor-pointer"
                />
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  اگر برنده بای‌باکس ظرف {formData.acceptanceTimeoutMinutes} دقیقه سفارش را قبول نکند، قفل سفارش باز شده و فوراً به تابلوی شکار رقابتی برمی‌گردد.
                </p>
              </div>

            </div>

            {/* Vendor Eligibility Requirements */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <span className="text-xs font-bold text-stone-800 block">
                شرایط احراز صلاحیت فروشگاه‌ها جهت امکان رزرو بای‌باکس:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Permitted Tiers */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-stone-600 block">سطوح مجاز فروشنده:</span>
                  <div className="flex items-center gap-2">
                    {(['طلایی', 'نقره‌ای', 'برنز'] as const).map(tier => {
                      const isSelected = formData.eligibleTiers.includes(tier);
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => handleToggleTier(tier)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-800 text-white border-amber-900 shadow-2xs' 
                              : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
                          }`}
                        >
                          {tier}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Min Star Rating */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-stone-600 block">حداقل امتیاز رضایت مشتری:</span>
                  <div className="relative">
                    <input
                      type="number"
                      min={3.5}
                      max={5.0}
                      step={0.1}
                      value={formData.minRating}
                      onChange={(e) => setFormData(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                    />
                    <span className="absolute left-3 top-1.5 text-[11px] text-stone-400">از ۵ ستاره</span>
                  </div>
                </div>

                {/* Min Completed Orders */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-stone-600 block">حداقل سفارشات موفق قبلی:</span>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={formData.minCompletedOrders}
                      onChange={(e) => setFormData(prev => ({ ...prev, minCompletedOrders: Number(e.target.value) }))}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                    />
                    <span className="absolute left-3 top-1.5 text-[11px] text-stone-400">سفارش</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Refund & Guarantee Policy Text */}
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <label className="text-xs font-bold text-stone-800 block">
                متن قوانین استرداد وجه و ضمانت حداقل سفارش (نمایش به فروشنده):
              </label>
              <textarea
                rows={2}
                value={formData.refundPolicyText || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, refundPolicyText: e.target.value }))}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed"
                placeholder="متن توافقنامه و گارانتی برگشت وجه..."
              />
            </div>

          </div>

          {/* Form Actions Bottom Bar */}
          <div className="flex items-center justify-between p-4 bg-stone-100 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-600">
              تمامی تغییرات پس از ذخیره بلافاصله در فرآیند ثبت سفارش و پنل همکاران اعمال می‌شود.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                بازنشانی مقادیر
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره نهایی تنظیمات</span>
              </button>
            </div>
          </div>

        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RESERVATIONS & CALENDAR VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="جستجو در فروشگاه‌ها یا تاریخ..."
                  value={reservationSearch}
                  onChange={(e) => setReservationSearch(e.target.value)}
                  className="bg-stone-50 border border-stone-300 rounded-xl pr-9 pl-3 py-2 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 w-56"
                />
              </div>

              <select
                value={reservationStatusFilter}
                onChange={(e) => setReservationStatusFilter(e.target.value as any)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فعال امروز</option>
                <option value="reserved">رزرو قطعی آینده</option>
                <option value="completed">تکمیل شده</option>
                <option value="cancelled">لغو شده</option>
              </select>

              <select
                value={reservationCityFilter}
                onChange={(e) => setReservationCityFilter(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">همه شهرها</option>
                <option value="تهران">تهران</option>
                <option value="اصفهان">اصفهان</option>
                <option value="مشهد">مشهد</option>
                <option value="شیراز">شیراز</option>
              </select>
            </div>

            <div className="text-stone-500 font-medium">
              تعداد رکوردها: {formatNumber(filteredReservations.length)} رزرو
            </div>
          </div>

          {/* Reservations Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            {filteredReservations.length === 0 ? (
              <div className="p-12 text-center text-stone-500 space-y-2">
                <Calendar className="w-10 h-10 mx-auto text-stone-400" />
                <p className="font-bold text-sm">هیچ رزروی با مشخصات فیلتر شده یافت نشد.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                    <tr>
                      <th className="p-3.5">فروشگاه و رتبه</th>
                      <th className="p-3.5">شهر و مناطق پوشش</th>
                      <th className="p-3.5">تاریخ رزرو</th>
                      <th className="p-3.5">مبلغ واریزی</th>
                      <th className="p-3.5">وضعیت</th>
                      <th className="p-3.5">سفارشات تخصیص‌یافته</th>
                      <th className="p-3.5 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredReservations.map((res) => {
                      const badge = getStatusBadge(res.status);
                      return (
                        <tr key={res.id} className="hover:bg-stone-50/80 transition-colors">
                          
                          {/* Vendor info */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
                                <Store className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="font-extrabold text-stone-900 block">{res.vendorName}</span>
                                <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                                  <span className="bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200 font-bold">
                                    سطح {res.vendorTier}
                                  </span>
                                  <span>★ {res.vendorRating}</span>
                                  <span className="font-mono dir-ltr">{res.vendorPhone}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* City & Covered Districts */}
                          <td className="p-3.5">
                            <span className="font-bold text-stone-800 block">{res.vendorCity}</span>
                            <span className="text-[11px] text-stone-500 truncate max-w-xs block">
                              {res.coveredDistricts.join('، ')}
                            </span>
                          </td>

                          {/* Reservation Date */}
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-stone-900 block">{res.date}</span>
                            <span className="text-[10px] text-stone-400 font-mono">{res.dateIso}</span>
                          </td>

                          {/* Paid Fee */}
                          <td className="p-3.5 font-mono font-bold text-emerald-800">
                            {formatNumber(res.pricePaid)} ت
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${badge.classes}`}>
                              {badge.label}
                            </span>
                          </td>

                          {/* Performance Stats */}
                          <td className="p-3.5">
                            <div className="space-y-0.5 font-mono text-[11px]">
                              <span className="text-stone-800 font-bold block">
                                ارجاع شده: {formatNumber(res.ordersReceivedCount)} سفارش
                              </span>
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="text-emerald-700">پذیرفته: {res.ordersAcceptedCount}</span>
                                <span>·</span>
                                <span className="text-rose-600">منقضی به شکار: {res.ordersExpiredCount}</span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-center">
                            {res.status === 'reserved' && onCancelReservation && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`آیا از لغو رزرو فروشگاه «${res.vendorName}» و استرداد کامل وجه ${formatNumber(res.pricePaid)} تومان به کیف پول ایشان اطمینان دارید؟`)) {
                                    onCancelReservation(res.id, res.pricePaid);
                                  }
                                }}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                لغو و استرداد وجه
                              </button>
                            )}
                            {res.status === 'active' && (
                              <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                                <Zap className="w-3.5 h-3.5" />
                                <span>در حال اجرا</span>
                              </span>
                            )}
                            {res.status === 'completed' && (
                              <span className="text-[11px] text-stone-400">بایگانی شد</span>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SIMULATION & RULES VALIDATION */}
      {/* ========================================================================= */}
      {activeTab === 'simulation' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900">
                شبیه‌ساز و راستی‌آزمایی منطق تخصیص ۵۰٪ و تابلوی شکار
              </h3>
              <p className="text-xs text-stone-500">
                بررسی رفتار الگوریتم در مواجهه با ثبت سفارش جدید مشتری بر اساس قوانین فعلی
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Input Simulation Controls */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
              <h4 className="font-extrabold text-xs text-stone-900">مشخصات سفارش فرضی ورودی:</h4>
              
              <div className="space-y-1.5">
                <label className="text-xs text-stone-700 block font-medium">شهر ثبت سفارش:</label>
                <select
                  value={simulatedOrderCity}
                  onChange={(e) => setSimulatedOrderCity(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="تهران">تهران</option>
                  <option value="اصفهان">اصفهان</option>
                  <option value="مشهد">مشهد</option>
                  <option value="شیراز">شیراز</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-stone-700 block font-medium">منطقه / محله:</label>
                <input
                  type="text"
                  value={simulatedDistrict}
                  onChange={(e) => setSimulatedDistrict(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
                  placeholder="مثلاً: منطقه ۳، ونک یا مرداویج"
                />
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>شبیه‌سازی تخصیص سفارش</span>
              </button>
            </div>

            {/* Simulation Output */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-xs text-stone-900 mb-3">نتیجه تصمیم‌گیری سیستم:</h4>
                
                {simulationResult ? (
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                    simulationResult.assignedToBuyBox 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}>
                    <div className="flex items-center gap-2 font-black text-sm">
                      {simulationResult.assignedToBuyBox ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>تخصیص اختصاصی به برنده بای‌باکس</span>
                        </>
                      ) : (
                        <>
                          <Flame className="w-5 h-5 text-orange-600" />
                          <span>انتشار در تابلوی شکار آزاد رقابتی</span>
                        </>
                      )}
                    </div>
                    {simulationResult.targetVendor && (
                      <p className="font-bold">فروشگاه دریافت‌کننده: {simulationResult.targetVendor}</p>
                    )}
                    <p>{simulationResult.reason}</p>
                  </div>
                ) : (
                  <div className="p-6 text-center text-stone-400 text-xs">
                    برای مشاهده نحوه ارجاع سفارش، روی دکمه شبیه‌سازی کلیک فرمایید.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-200 text-[11px] text-stone-500">
                قانون ۵۰٪ به صورت یک سفارش در میان بین برنده بای‌باکس و تابلوی شکار اعمال می‌گردد.
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
