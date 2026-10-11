import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  Trash2, 
  Tag, 
  Layers, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight, 
  Sparkles,
  Info,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';
import { OperationalCity } from '../types';
import { DEFAULT_DEPOSIT, formatDepositToman, formatDepositWords } from '../utils/deposit';

interface EditCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  city?: OperationalCity | null;
  onSave: (cityData: OperationalCity) => void;
  onDelete?: (cityId: string) => void;
}

const IRAN_PROVINCES = [
  'تهران',
  'البرز',
  'اصفهان',
  'فارس',
  'خراسان رضوی',
  'آذربایجان شرقی',
  'مازندران',
  'گیلان',
  'خوزستان',
  'قم',
  'قزوین',
  'کرمان',
  'یزد',
  'همدان',
  'کرمانشاه',
  'مرکزی',
  'هرمزگان',
  'بوشهر',
  'سمنان',
  'زنجان',
  'اردبیل',
  'لرستان',
  'کردستان',
  'گلستان'
];

export const EditCityModal: React.FC<EditCityModalProps> = ({
  isOpen,
  onClose,
  city,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(city);

  const [name, setName] = useState('');
  const [province, setProvince] = useState('تهران');
  const [phase, setPhase] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [isPartnerRegistrationActive, setIsPartnerRegistrationActive] = useState(true);
  const [statusNote, setStatusNote] = useState('');
  const [launchDate, setLaunchDate] = useState('');
  const [depositInput, setDepositInput] = useState<string>(String(DEFAULT_DEPOSIT));
  
  // Hub & Satellite state
  const [isHub, setIsHub] = useState<boolean>(false);
  const [satelliteCities, setSatelliteCities] = useState<string[]>([]);
  const [satelliteCityInput, setSatelliteCityInput] = useState('');
  const [parentHubCityName, setParentHubCityName] = useState<string>('');
  const [forwardOrdersToHub, setForwardOrdersToHub] = useState<boolean>(true);
  const [distanceKmFromHub, setDistanceKmFromHub] = useState<number>(35);
  const [suburbDeliveryAllowanceNote, setSuburbDeliveryAllowanceNote] = useState<string>('');

  // District tags
  const [districts, setDistricts] = useState<string[]>([]);
  const [districtInput, setDistrictInput] = useState('');

  // Validation
  const [error, setError] = useState('');

  // فرم چندمرحله‌ای
  const TOTAL_STEPS = 4;
  const STEP_TITLES = ['مشخصات پایه', 'وضعیت و بیعانه', 'مناطق شهر', 'اتصال قطب و اقماری'];
  const [step, setStep] = useState(1);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => {
    if (city) {
      setName(city.name);
      setProvince(city.province || 'تهران');
      setPhase(city.phase || 1);
      setIsActive(city.isActive);
      setIsPartnerRegistrationActive(city.isPartnerRegistrationActive);
      setStatusNote(city.statusNote || '');
      setLaunchDate(city.launchDate || '');
      setDepositInput(String(city.depositAmount && city.depositAmount > 0 ? city.depositAmount : DEFAULT_DEPOSIT));
      setDistricts(city.districts || []);
      setIsHub(city.isHub || false);
      setSatelliteCities(city.otherCoveredCities || city.satelliteCities || []);
      setParentHubCityName(city.parentHubCityName || '');
      setForwardOrdersToHub(city.forwardOrdersToHub !== undefined ? city.forwardOrdersToHub : true);
      setDistanceKmFromHub(city.distanceKmFromHub || 35);
      setSuburbDeliveryAllowanceNote(city.suburbDeliveryAllowanceNote || '');
    } else {
      setName('');
      setProvince('تهران');
      setPhase(1);
      setIsActive(true);
      setIsPartnerRegistrationActive(true);
      setStatusNote('فاز ۱ - سرویس‌دهی فعال در کلیه مناطق');
      setLaunchDate('۱۴۰۳/۰۸/۰۱');
      setDepositInput(String(DEFAULT_DEPOSIT));
      setDistricts(['مرکز شهر', 'منطقه ۱', 'منطقه ۲']);
      setIsHub(false);
      setSatelliteCities([]);
      setParentHubCityName('');
      setForwardOrdersToHub(true);
      setDistanceKmFromHub(35);
      setSuburbDeliveryAllowanceNote('');
    }
    setError('');
    setStep(1);
  }, [city, isOpen]);

  if (!isOpen) return null;

  const handleAddSatelliteCity = () => {
    const trimmed = satelliteCityInput.trim();
    if (!trimmed) return;
    if (!satelliteCities.includes(trimmed)) {
      setSatelliteCities([...satelliteCities, trimmed]);
    }
    setSatelliteCityInput('');
  };

  const handleRemoveSatelliteCity = (indexToRemove: number) => {
    setSatelliteCities(satelliteCities.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDownSatelliteCity = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSatelliteCity();
    }
  };

  const handleAddDistrict = () => {
    const trimmed = districtInput.trim();
    if (!trimmed) return;
    if (!districts.includes(trimmed)) {
      setDistricts([...districts, trimmed]);
    }
    setDistrictInput('');
  };

  const handleRemoveDistrict = (indexToRemove: number) => {
    setDistricts(districts.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDownDistrict = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDistrict();
    }
  };

  const validateBasics = (): boolean => {
    if (!name.trim()) {
      setError('لطفاً نام شهر را وارد نمایید.');
      return false;
    }
    if (!province.trim()) {
      setError('لطفاً استان مربوطه را مشخص کنید.');
      return false;
    }
    return true;
  };

  const parsedDeposit = Number(String(depositInput).replace(/[,٬\s]/g, ''));

  const validateDeposit = (): boolean => {
    if (!isFinite(parsedDeposit) || parsedDeposit <= 0) {
      setError('مبلغ بیعانه این شهر را (به تومان و بیشتر از صفر) وارد کنید.');
      return false;
    }
    return true;
  };

  const goToStep = (target: number) => {
    if (target === step) return;
    // رفتن به مرحله‌های بعد فقط با رعایت اطلاعات الزامی مرحله ۱ و مبلغ بیعانه (مرحله ۲)
    if (target > step && !validateBasics()) {
      setStep(1);
      return;
    }
    if (target > 2 && step <= 2 && !validateDeposit()) {
      setStep(2);
      return;
    }
    setError('');
    setStep(target);
  };

  const handleNext = () => goToStep(Math.min(step + 1, TOTAL_STEPS));
  const handleBack = () => goToStep(Math.max(step - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // در مرحله‌های میانی، Enter فقط به مرحله بعد می‌رود
    if (step < TOTAL_STEPS) {
      handleNext();
      return;
    }

    if (!validateBasics()) {
      setStep(1);
      return;
    }
    if (!validateDeposit()) {
      setStep(2);
      return;
    }

    const cityPayload: OperationalCity = {
      id: city?.id || `city-${Date.now()}-${name.trim().toLowerCase().replace(/\s+/g, '-')}`,
      name: name.trim(),
      province: province.trim(),
      phase: Number(phase),
      isActive,
      isPartnerRegistrationActive,
      depositAmount: Math.round(parsedDeposit),
      statusNote: statusNote.trim() || `فاز ${phase} - وضعیت سرویس‌دهی دراپینو`,
      launchDate: launchDate.trim() || '۱۴۰۳/۰۸/۰۱',
      districts: districts.length > 0 ? districts : ['مرکز شهر'],
      isHub,
      satelliteCities: isHub ? satelliteCities : undefined,
      otherCoveredCities: isHub ? satelliteCities : undefined,
      parentHubCityName: !isHub && parentHubCityName.trim() ? parentHubCityName.trim() : undefined,
      forwardOrdersToHub: !isHub ? forwardOrdersToHub : undefined,
      distanceKmFromHub: !isHub ? Number(distanceKmFromHub) : undefined,
      suburbDeliveryAllowanceNote: suburbDeliveryAllowanceNote.trim() || undefined,
    };

    onSave(cityPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 text-right">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[calc(100vh-2rem)] flex flex-col border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 bg-stone-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-base sm:text-lg">
                {isEditing ? `ویرایش فازبندی شهر: ${city?.name}` : 'افزودن شهر جدید به فازبندی استانی'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                تنظیم دسترسی ثبت سفارش مشتری و فرم جذب همکاران گالری پرده
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {/* Stepper */}
        <div className="px-5 sm:px-6 pt-4 pb-3 border-b border-stone-100 shrink-0" data-testid="city-stepper">
          <div className="flex items-center gap-1.5">
            {STEP_TITLES.map((title, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <React.Fragment key={title}>
                  <button
                    type="button"
                    onClick={() => goToStep(n)}
                    className="flex items-center gap-1.5 min-w-0 cursor-pointer"
                    aria-current={active ? 'step' : undefined}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-colors ${
                        active
                          ? 'bg-blue-600 text-white'
                          : done
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {done ? <Check className="w-3.5 h-3.5" /> : n.toLocaleString('fa-IR')}
                    </span>
                    <span
                      className={`text-[11px] font-bold truncate ${
                        active ? 'text-blue-700' : 'hidden sm:inline text-stone-500'
                      }`}
                    >
                      {title}
                    </span>
                  </button>
                  {n < TOTAL_STEPS && <div className={`flex-1 h-0.5 rounded ${done ? 'bg-emerald-400' : 'bg-stone-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            مرحله {step.toLocaleString('fa-IR')} از {TOTAL_STEPS.toLocaleString('fa-IR')}: {STEP_TITLES[step - 1]}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 text-xs">
          <div ref={bodyRef} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
          <div className="space-y-5">
          {/* Row 1: City Name and Province */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-800 mb-1.5">
                نام شهر: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: شیراز، تبریز، رشت..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1.5">
                استان مربوطه: <span className="text-red-500">*</span>
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                {IRAN_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    استان {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Phase Selection & Launch Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-800 mb-1.5">
                فاز اجرایی و عملیاتی:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPhase(1)}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                    phase === 1
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-2 ring-emerald-100'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  فاز ۱
                  <span className="block text-[10px] font-normal text-stone-500">سرویس فعال</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPhase(2)}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                    phase === 2
                      ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs ring-2 ring-blue-100'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  فاز ۲
                  <span className="block text-[10px] font-normal text-stone-500">جذب همکار</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPhase(3)}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                    phase === 3
                      ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs ring-2 ring-amber-100'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  فاز ۳
                  <span className="block text-[10px] font-normal text-stone-500">توسعه آتی</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1.5">
                تاریخ هدف / افتتاح رسمی:
              </label>
              <input
                type="text"
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                placeholder="مثلاً: ۱۴۰۳/۰۹/۰۱"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-blue-600 font-mono text-left"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                جهت نمایش در اعلان‌های رزرو نوبت به خریداران
              </span>
            </div>
          </div>

          </div>
          )}

          {step === 2 && (
          <div className="space-y-5">
          {/* Customer deposit for this city */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <label className="block font-black text-emerald-950">
              مبلغ بیعانه مشتری در این شهر (تومان): <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1000"
              step="10000"
              inputMode="numeric"
              value={depositInput}
              onChange={(e) => setDepositInput(e.target.value)}
              placeholder="مثلاً: ۳۵۰۰۰۰"
              data-testid="city-deposit-input"
              className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-mono text-left text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              dir="ltr"
            />
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              {parsedDeposit > 0
                ? <>مشتریان این شهر <strong>{formatDepositWords(parsedDeposit)}</strong> ({formatDepositToman(parsedDeposit)}) بیعانه پرداخت می‌کنند و همین مبلغ در تمام صفحات سایت و فاکتورها برای این شهر نمایش داده می‌شود.</>
                : 'مبلغ را به تومان وارد کنید.'}
            </p>
          </div>

          {/* Row 3: Operational Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            {/* Customer order intake toggle */}
            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
              <div>
                <span className="font-bold text-stone-800 block text-xs">دریافت سفارش مشتری:</span>
                <span className="text-[10px] text-stone-500 block">
                  {isActive ? 'فعال (امکان ثبت و پرداخت بیعانه)' : 'غیرفعال (اعلام در انتظار افتتاح فاز)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`p-1 transition-colors cursor-pointer ${
                  isActive ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-400'
                }`}
              >
                {isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>

            {/* Partner registration toggle */}
            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
              <div>
                <span className="font-bold text-stone-800 block text-xs">ثبت‌نام همکار پرده‌فروش:</span>
                <span className="text-[10px] text-stone-500 block">
                  {isPartnerRegistrationActive ? 'فعال (فرم جذب فروشگاه باز است)' : 'توقف جذب همکار'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPartnerRegistrationActive(!isPartnerRegistrationActive)}
                className={`p-1 transition-colors cursor-pointer ${
                  isPartnerRegistrationActive ? 'text-blue-600' : 'text-stone-300 hover:text-stone-400'
                }`}
              >
                {isPartnerRegistrationActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
          </div>

          {/* Row 4: Status Note for Users */}
          <div>
            <label className="block font-bold text-stone-800 mb-1.5">
              پیام وضعیت و توضیحات فاز برای نمایش عمومی:
            </label>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="مثلاً: فاز ۲ - در مرحله جذب و تایید پروانه کسب همکاران (آغاز سفارش‌گیری به زودی)"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          </div>
          )}

          {step === 3 && (
          <div className="space-y-5">
          {/* Row 5: Districts Management */}
          <div>
            <label className="block font-bold text-stone-800 mb-1.5">
              مناطق و محله‌های تحت پوشش این شهر:
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={districtInput}
                onChange={(e) => setDistrictInput(e.target.value)}
                onKeyDown={handleKeyDownDistrict}
                placeholder="نام منطقه را بنویسید و اینتر بزنید (مثلاً: منطقه ۱، معالی‌آباد، عظیمیه...)"
                className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddDistrict}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن</span>
              </button>
            </div>

            {/* District Tags */}
            <div className="flex flex-wrap gap-1.5 p-3 bg-stone-50 rounded-2xl border border-stone-200 min-h-[48px]">
              {districts.length === 0 ? (
                <span className="text-[11px] text-stone-400">هنوز منطقه‌ای ثبت نشده است.</span>
              ) : (
                districts.map((dst, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-200 text-stone-800 rounded-lg text-xs font-medium shadow-2xs group"
                  >
                    <span>{dst}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDistrict(idx)}
                      className="text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          </div>
          )}

          {step === 4 && (
          <div className="space-y-5">
          {/* Row 6: Hub & Satellite Linking Section (اتصال شهرهای اصلی و اقماری) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-amber-950 text-xs block">
                    سیستم اتصال کلان‌شهر قطب و شهرهای اقماری (Hub & Satellite)
                  </span>
                  <span className="text-[10px] text-amber-800 block">
                    انتقال خودکار سفارشات شهرهای کوچک و حومه به تابلوی شکار شهر اصلی
                  </span>
                </div>
              </div>

              {/* Hub Toggle */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                <span className="text-[11px] font-bold text-stone-700">شهر اصلی / قطب:</span>
                <button
                  type="button"
                  onClick={() => setIsHub(!isHub)}
                  className={`p-0.5 transition-colors cursor-pointer ${
                    isHub ? 'text-amber-600' : 'text-stone-300'
                  }`}
                  title={isHub ? 'شهر به عنوان قطب فعال است' : 'تبدیل به شهر قطب'}
                >
                  {isHub ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                </button>
              </div>
            </div>

            {isHub ? (
              /* Case 1: This city is a Main Hub (e.g. Mashhad) */
              <div className="space-y-3 pt-2 border-t border-amber-200/70">
                <div className="flex items-start gap-2 text-[11px] text-amber-900 bg-amber-100/60 p-2.5 rounded-xl">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    این شهر به عنوان <strong>کلان‌شهر قطب (شهر اصلی)</strong> تعریف شده است. سفارشات ثبت‌شده در شهرهای فرعی و روستاهای اقماری زیر، علاوه بر تابلوی محلی، مستقیماً در <strong>تابلوی شکار فروشندگان {name || 'مشهد'}</strong> نیز ظاهر خواهد شد.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1.5 text-xs">
                    سایر شهرهای تحت پوشش (شهرهای اقماری، حومه و روستاهای تابعه متصل به این کلان‌شهر):
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={satelliteCityInput}
                      onChange={(e) => setSatelliteCityInput(e.target.value)}
                      onKeyDown={handleKeyDownSatelliteCity}
                      placeholder="نام شهر یا روستای اقماری را بنویسید (مثلاً: گلبهار، چناران، کلات، روستای لکلک، نیشابور...)"
                      className="flex-1 px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-amber-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddSatelliteCity}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-xl border border-amber-200 min-h-[44px]">
                    {satelliteCities.length === 0 ? (
                      <span className="text-[11px] text-stone-400">
                        هنوز شهر اقماری به این قطب متصل نشده است (مثلاً: گلبهار، چناران، کلات، روستای لکلک، نیشابور).
                      </span>
                    ) : (
                      satelliteCities.map((sat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold shadow-2xs"
                        >
                          <span>🛰️ {sat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSatelliteCity(idx)}
                            className="text-amber-700 hover:text-red-700 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Case 2: This city is a satellite town or normal city */
              <div className="space-y-3 pt-2 border-t border-amber-200/70">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1 text-xs">
                      اتصال به شهر اصلی بالادست (قطب):
                    </label>
                    <input
                      type="text"
                      value={parentHubCityName}
                      onChange={(e) => setParentHubCityName(e.target.value)}
                      placeholder="مثلاً: مشهد"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-amber-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-stone-500 mt-0.5 block">
                      نام کلان‌شهری که این شهر به تابلوی شکار آن لینک می‌شود
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1 text-xs">
                      فاصله تقریبی از مرکز قطب (کیلومتر):
                    </label>
                    <input
                      type="number"
                      value={distanceKmFromHub}
                      onChange={(e) => setDistanceKmFromHub(Number(e.target.value))}
                      placeholder="مثلاً: ۳۵"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 font-mono text-left focus:ring-2 focus:ring-amber-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-stone-500 mt-0.5 block">
                      جهت برآورد زمان رسیدن کارشناس و هزینه ایاب‌وذهاب حومه
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      اشتراک خودکار سفارشات در تابلوی شکار شهر اصلی:
                    </span>
                    <span className="text-[10px] text-stone-500 block">
                      {forwardOrdersToHub
                        ? `سفارشات ${name || 'این شهر'} در تابلوی شکار ${parentHubCityName || 'شهر اصلی'} نمایش داده می‌شوند.`
                        : 'فقط به پرده‌فروشان محلی همین شهر نشان داده شود.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForwardOrdersToHub(!forwardOrdersToHub)}
                    className={`p-0.5 transition-colors cursor-pointer ${
                      forwardOrdersToHub ? 'text-emerald-600' : 'text-stone-300'
                    }`}
                  >
                    {forwardOrdersToHub ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1 text-xs">
                    توضیح شرایط اعزام حومه و ایاب‌وذهاب:
                  </label>
                  <input
                    type="text"
                    value={suburbDeliveryAllowanceNote}
                    onChange={(e) => setSuburbDeliveryAllowanceNote(e.target.value)}
                    placeholder="مثلاً: اعزام کارشناس با کالیته کامل بدون هزینه اضافی ایاب و ذهاب طبق مصوبه"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-amber-600 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          </div>
          )}

          </div>

          {/* Modal Footer Actions */}
          <div className="px-5 sm:px-6 py-4 border-t border-stone-100 bg-white shrink-0 flex items-center justify-between gap-3">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`آیا از حذف شهر «${city?.name}» از لیست فازبندی اطمینان دارید؟`)) {
                    if (city) onDelete(city.id);
                    onClose();
                  }
                }}
                className="px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف شهر</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                انصراف
              </button>

              {step > 1 && (
                <button
                  key="back"
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>مرحله قبل</span>
                </button>
              )}

              {step < TOTAL_STEPS ? (
                <button
                  key="next"
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>مرحله بعد</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  key="submit"
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'ذخیره تغییرات شهر' : 'افزودن و فعال‌سازی شهر'}</span>
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
