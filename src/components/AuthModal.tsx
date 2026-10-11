import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Phone, 
  Lock, 
  User, 
  Store, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  CreditCard,
  KeyRound,
  Warehouse,
  Package
} from 'lucide-react';
import { isValidSheba, normalizeSheba } from '../utils/invoiceUtils';
import { UserRole, UserProfile, CurtainVendor, OperationalCity } from '../types';
import { evaluatePassword } from '../utils/passwordStrength';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { MapAddressPicker } from './MapAddressPicker';
import { RecaptchaBox, RECAPTCHA_SITE_KEY, RECAPTCHA_ENABLED } from './RecaptchaBox';
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS, ServiceCategory } from '../utils/serviceCategory';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
  onRegister: (newUser: UserProfile, newVendorData?: Partial<CurtainVendor>) => void;
  registeredUsers: UserProfile[];
  initialRole?: UserRole;
  initialMode?: 'login' | 'register';
  operationalCities?: OperationalCity[];
  onOpenCustomerTerms?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  registeredUsers,
  initialRole = 'customer',
  initialMode = 'login',
  operationalCities = [],
  onOpenCustomerTerms,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Keep mode & role synced with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRegRole(initialRole);
      setLoginError('');
      setRegError('');
    }
  }, [isOpen, initialMode, initialRole]);

  // Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('otp');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regRole, setRegRole] = useState<UserRole>(initialRole);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  
  const defaultCity = operationalCities.find((c) => c.isActive)?.name || 'تهران';
  const [regProvince, setRegProvince] = useState('تهران');
  const [regCity, setRegCity] = useState(defaultCity);
  const [regDistrict, setRegDistrict] = useState('سعادت‌آباد');
  const [regAddress, setRegAddress] = useState('');
  const [regFloorUnit, setRegFloorUnit] = useState('');
  const [regPostalCode, setRegPostalCode] = useState('');
  const [regLocation, setRegLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  // Vendor-Specific Registration
  const [regStoreName, setRegStoreName] = useState('');
  const [regCategories, setRegCategories] = useState<ServiceCategory[]>([]);
  const [regLandline, setRegLandline] = useState('');
  const [regNationalCode, setRegNationalCode] = useState('');
  const [regSheba, setRegSheba] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regCoveredOtherCities, setRegCoveredOtherCities] = useState<string[]>([]);

  // Wholesaler-Specific Registration
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regWarehouseCity, setRegWarehouseCity] = useState(defaultCity);
  const [regWarehouseAddress, setRegWarehouseAddress] = useState('');
  const [regMinimumOrderRolls, setRegMinimumOrderRolls] = useState(1);
  const [regBusinessLicenseNumber, setRegBusinessLicenseNumber] = useState('');

  // Admin Security Code
  const [adminPasscode, setAdminPasscode] = useState('');

  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanPhone = loginPhone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      setLoginError('لطفاً شماره تلفن همراه خود را وارد نمایید.');
      return;
    }

    // Find user by phone
    const foundUser = registeredUsers.find(
      (u) => u.phone.replace(/^0/, '') === cleanPhone.replace(/^0/, '') || u.phone === cleanPhone
    );

    if (!foundUser) {
      setLoginError('کاربری با این شماره تلفن یافت نشد. لطفاً ابتدا ثبت‌نام کنید.');
      return;
    }

    if (loginMethod === 'otp' && otpSent && otpCode.trim() !== '1234' && otpCode.trim() !== '۱۲۳۴') {
      setLoginError('کد یکبار مصرف وارد شده اشتباه است. (کد تستی سامانه: ۱۲۳۴)');
      return;
    }

    onLogin(foundUser);
    onClose();
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    setRegError('');

    if (!regName.trim()) {
      setRegError('لطفاً نام و نام خانوادگی را وارد کنید.');
      return;
    }

    const cleanPhone = regPhone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setRegError('لطفاً شماره تلفن همراه معتبر (مثلاً ۰۹۱۲...) وارد کنید.');
      return;
    }

    const cleanEmail = regEmail.trim();
    if (!cleanEmail) {
      setRegError('وارد کردن ایمیل الزامی است.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setRegError('ایمیل واردشده معتبر نیست. (نمونه: name@example.com)');
      return;
    }

    if (!regPassword) {
      setRegError('لطفاً یک رمز عبور انتخاب کنید.');
      return;
    }
    const pwResult = evaluatePassword(regPassword, cleanPhone);
    if (!pwResult.isAcceptable) {
      setRegError(pwResult.problem || 'رمز عبور به‌اندازه کافی قوی نیست.');
      return;
    }

    // Check if phone already registered
    const existing = registeredUsers.find((u) => u.phone.replace(/^0/, '') === cleanPhone.replace(/^0/, ''));
    if (existing) {
      setRegError('این شماره تلفن قبلاً در سامانه ثبت شده است. لطفاً وارد شوید.');
      return;
    }

    if (regRole !== 'admin') {
      if (!regLocation) {
        setRegError('لطفاً موقعیت دقیق خود را روی نقشه انتخاب کنید.');
        return;
      }
      if (!regAddress.trim()) {
        setRegError('نشانی دقیق پستی خالی است؛ پس از انتخاب روی نقشه، آن را بررسی و تکمیل کنید.');
        return;
      }
    }

    if (regRole === 'vendor') {
      if (!regStoreName.trim()) {
        setRegError('لطفاً نام فروشگاه یا گالری پرده را وارد فرمایید.');
        return;
      }
      if (regCategories.length === 0) {
        setRegError('لطفاً رسته فعالیت فروشگاه را انتخاب کنید (پرده، کاغذ دیواری، کفپوش و پارکت — یک یا چند مورد).');
        return;
      }
      if (!regAddress.trim()) {
        setRegError('لطفاً نشانی فروشگاه جهت مراجعه حضوری را وارد کنید.');
        return;
      }
      if (regSheba.trim() && !isValidSheba(regSheba)) {
        setRegError('شماره شبا نامعتبر است. قالب صحیح: IR و ۲۴ رقم.');
        return;
      }
    }

    if (regRole === 'wholesaler') {
      if (!regCompanyName.trim()) {
        setRegError('لطفاً نام بازرگانی، شرکت یا بنکداری را وارد فرمایید.');
        return;
      }
    }

    if (regRole === 'admin') {
      if (adminPasscode !== '1234' && adminPasscode !== '۱۲۳۴' && adminPasscode !== 'admin') {
        setRegError('کد دسترسی مدیریت نامعتبر است. (کد امنیتی تستی: 1234)');
        return;
      }
    }

    // بررسی reCAPTCHA (توکن در سرور با کلید محرمانه تأیید می‌شود) — فعلاً با RECAPTCHA_ENABLED=false غیرفعال است
    if (RECAPTCHA_ENABLED) {
    if (!RECAPTCHA_SITE_KEY) {
      setRegError('سامانه تأیید امنیتی (reCAPTCHA) هنوز پیکربندی نشده است. با پشتیبانی تماس بگیرید.');
      return;
    }
    if (!captchaToken) {
      setRegError('لطفاً تیک «من ربات نیستم» را بزنید.');
      return;
    }
    setIsVerifying(true);
    try {
      const res = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setRegError(
          res.status === 503
            ? 'تأیید امنیتی روی سرور پیکربندی نشده است. با پشتیبانی تماس بگیرید.'
            : 'تأیید امنیتی ناموفق بود. دوباره تیک «من ربات نیستم» را بزنید.'
        );
        setCaptchaToken(null);
        setCaptchaReset((n) => n + 1);
        return;
      }
    } catch {
      setRegError('ارتباط با سرور برای تأیید امنیتی برقرار نشد. دوباره تلاش کنید.');
      setCaptchaToken(null);
      setCaptchaReset((n) => n + 1);
      return;
    } finally {
      setIsVerifying(false);
    }
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');

    const newUserId = `usr-${Date.now()}`;
    const newVendorId = regRole === 'vendor' ? `vnd-${Date.now()}` : undefined;

    const newUser: UserProfile = {
      id: newUserId,
      name: regName.trim(),
      phone: cleanPhone,
      role: regRole,
      password: regPassword,
      email: cleanEmail,
      province: regProvince,
      city: regCity,
      district: regDistrict,
      address: regAddress.trim() || 'تهران، منطقه انتخابی',
      latitude: regLocation?.lat,
      longitude: regLocation?.lng,
      floorAndUnit: regFloorUnit.trim() || undefined,
      postalCode: regPostalCode.trim() || undefined,
      createdAt: dateStr,
      storeName: regRole === 'vendor' ? regStoreName.trim() : undefined,
      ownerName: regRole === 'vendor' ? regName.trim() : undefined,
      landlinePhone: regRole === 'vendor' ? regLandline.trim() : undefined,
      nationalCode: regRole === 'vendor' ? regNationalCode.trim() : undefined,
      shebaNumber: regRole === 'vendor' && regSheba.trim() ? normalizeSheba(regSheba) : undefined,
      bio: regRole === 'vendor' ? regBio.trim() : undefined,
      vendorId: newVendorId,
      coveredDistricts: regRole === 'vendor' ? [regDistrict, 'مناطق همجوار'] : undefined,
      tier: regRole === 'vendor' ? 'برنز' : undefined,
      isVerified: regRole === 'vendor' ? false : undefined,
      companyName: regRole === 'wholesaler' ? regCompanyName.trim() : undefined,
      warehouseCity: regRole === 'wholesaler' ? (regWarehouseCity.trim() || regCity) : undefined,
      warehouseAddress: regRole === 'wholesaler' ? (regWarehouseAddress.trim() || regAddress) : undefined,
      minimumOrderRolls: regRole === 'wholesaler' ? regMinimumOrderRolls : undefined,
      businessLicenseNumber: regRole === 'wholesaler' ? regBusinessLicenseNumber.trim() : undefined,
    };

    let newVendorData: Partial<CurtainVendor> | undefined = undefined;
    if (regRole === 'vendor') {
      newVendorData = {
        id: newVendorId,
        name: regStoreName.trim(),
        ownerName: regName.trim(),
        phone: cleanPhone,
        city: regCity,
        coveredDistricts: [regDistrict, 'منطقه ۱', 'منطقه ۲', 'منطقه ۳'],
        coveredOtherCities: regCoveredOtherCities,
        categories: regCategories,
        rating: 0,
        ratingCount: 0,
        completedVisits: 0,
        successfulOrders: 0,
        isVerified: false,
        verificationStatus: 'pending_verification',
        tier: 'برنز',
        sampleCatalogs: [],
        availableCatalogIds: [],
        customCatalogs: [],
        nationalCardImageUrl: undefined,
        businessLicenseImageUrl: undefined,
        address: regAddress.trim() || `${regCity}، ${regDistrict}`,
        walletBalance: 0,
        gamification: {
          docsSubmittedAt: undefined,
          walletChargePackage: 'none',
          performancePoints: 0,
        },
        joinedDate: new Date().toISOString(),
      };
    }

    onRegister(newUser, newVendorData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 text-right animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-black text-lg text-white">
                {mode === 'login' ? 'ورود به سامانه دراپینو' : 'عضویت و ثبت‌نام در دراپینو'}
              </h2>
              <p className="text-xs text-amber-200/80">
                {mode === 'login' 
                  ? 'دسترسی سریع به پنل اختصاصی مشتریان، همکاران و مدیریت'
                  : 'انتخاب نقش کاربری و ساخت حساب برای دسترسی به خدمات'}
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

        {/* Tab Switcher: Login vs Register */}
        <div className="flex border-b border-stone-200 bg-stone-50 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError('');
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'border-amber-700 text-amber-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>ورود به حساب</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegError('');
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              mode === 'register'
                ? 'border-amber-700 text-amber-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>عضویت</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* ===================== MODE 1: LOGIN ===================== */}
          {mode === 'login' && (
            <div className="space-y-5">
              
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold animate-in fade-in">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Method selector: OTP vs Password */}
                <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('otp')}
                    className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      loginMethod === 'otp' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    ارسال کد پیامکی (OTP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('password')}
                    className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      loginMethod === 'password' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    رمز عبور
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    شماره تلفن همراه:
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="ltr"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                      className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-700 font-mono"
                    />
                    <Phone className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    شماره همراه ثبت شده در سامانه دراپینو
                  </span>
                </div>

                {loginMethod === 'otp' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700">کد تایید پیامکی:</label>
                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!loginPhone.trim()) {
                              setLoginError('لطفاً ابتدا شماره تلفن را وارد کنید.');
                              return;
                            }
                            setOtpSent(true);
                            setOtpCode('1234');
                            setLoginError('');
                          }}
                          className="text-xs text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
                        >
                          ارسال کد یکبار مصرف
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          کد ۱۲۳۴ برای شبیه‌سازی وارد شد
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        dir="ltr"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="کد ۴ رقمی (تستی: 1234)"
                        className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-700 font-mono tracking-widest text-center"
                      />
                      <KeyRound className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">رمز عبور:</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="رمز عبور حساب کاربری"
                        className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-700"
                      />
                      <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ورود به حساب کاربری</span>
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-stone-500">
                <span>هنوز ثبت‌نام نکرده‌اید؟ </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setLoginError('');
                  }}
                  className="text-amber-800 font-bold hover:underline cursor-pointer"
                >
                  ایجاد حساب جدید با نقش کاربری
                </button>
              </div>

            </div>
          )}

          {/* ===================== MODE 2: REGISTER ===================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold animate-in fade-in">
                  {regError}
                </div>
              )}

              <span className="block text-xs font-bold text-stone-800">
                ۱. نوع عضویت:
              </span>

              {/* Role Header Banner */}
              {regRole === 'customer' && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-700 text-white flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-amber-900 leading-relaxed block">
                        عضویت اختصاصی و کاملا رایگان در سامانه دراپینو به منزله پذیرش{' '}
                        <button
                          type="button"
                          onClick={() => onOpenCustomerTerms?.()}
                          className="font-bold text-amber-800 underline underline-offset-2 hover:text-amber-950 cursor-pointer"
                        >
                          قوانین و مقررات
                        </button>{' '}
                        این سامانه است
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold">
                    مشتری
                  </span>
                </div>
              )}

              {regRole === 'vendor' && (
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-950 block">ثبت‌نام همکاران فروشگاه و کارشناسان پرده</span>
                      <span className="text-[10px] text-blue-900/80 block">شکار سفارشات منطقه، اعزام و صدور فاکتور رسمی</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 font-bold">
                    فروشگاه
                  </span>
                </div>
              )}

              {regRole === 'wholesaler' && (
                <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-purple-950 block">ثبت‌نام بنکدار و تامین‌کننده عمده طاقه</span>
                      <span className="text-[10px] text-purple-900/80 block">عرضه مستقیم طاقه‌های پارچه و ملزومات به فروشگاه‌های سراسر کشور</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 font-bold">
                    بنکدار
                  </span>
                </div>
              )}

              {regRole === 'admin' && (
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">ثبت‌نام ناظر و مدیر ارشد</span>
                      <span className="text-[10px] text-emerald-900/80 block">دسترسی به سامانه جامع نظارت اتحادیه</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                    مدیریت
                  </span>
                </div>
              )}

              {/* Admin passcode prompt if admin role chosen */}
              {regRole === 'admin' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1.5">
                  <label className="font-bold text-amber-900 block">کد امنیتی مدیریت ارشد:</label>
                  <input
                    type="password"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="کد امنیتی (کد تستی دمو: 1234)"
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono text-center"
                  />
                  <span className="text-[10px] text-stone-500 block">
                    جهت دسترسی به پنل مدیریت ارشد سامانه، کد 1234 را وارد نمایید.
                  </span>
                </div>
              )}

              {/* Wholesaler Specific Form */}
              {regRole === 'wholesaler' && (
                <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                    <Building2 className="w-4 h-4 text-purple-700" />
                    <span>مشخصات بنکداری و انبار مرکزی:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        نام بازرگانی / شرکت / بنکداری: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regCompanyName}
                        onChange={(e) => setRegCompanyName(e.target.value)}
                        placeholder="مثلاً: نساجی و منسوجات امین"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        شماره پروانه کسب یا شناسه ملی:
                      </label>
                      <input
                        type="text"
                        value={regBusinessLicenseNumber}
                        onChange={(e) => setRegBusinessLicenseNumber(e.target.value)}
                        placeholder="۱۴۰۳/۸۸۴۹۲"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        شهر انبار مرکزی:
                      </label>
                      <input
                        type="text"
                        value={regWarehouseCity}
                        onChange={(e) => setRegWarehouseCity(e.target.value)}
                        placeholder="تهران، جاده مخصوص..."
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        حداقل سفارش مجاز (تعداد طاقه):
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={regMinimumOrderRolls}
                        onChange={(e) => setRegMinimumOrderRolls(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Vendor Store Name if Vendor chosen */}
              {regRole === 'vendor' && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                    <Store className="w-4 h-4 text-blue-700" />
                    <span>مشخصات فروشگاه یا گالری پرده:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        نام رسمی فروشگاه / گالری: *
                      </label>
                      <input
                        type="text"
                        value={regStoreName}
                        onChange={(e) => setRegStoreName(e.target.value)}
                        placeholder="مثلاً: گالری پرده ابریشم"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 order-last sm:order-none">
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                        رسته فعالیت (یک یا چند مورد): <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" data-testid="vendor-categories">
                        {SERVICE_CATEGORIES.map((cat) => {
                          const checked = regCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              role="checkbox"
                              aria-checked={checked}
                              onClick={() =>
                                setRegCategories(
                                  checked ? regCategories.filter((c) => c !== cat) : [...regCategories, cat]
                                )
                              }
                              data-testid={`vendor-category-${cat}`}
                              className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                checked
                                  ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-100'
                                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                              }`}
                            >
                              <span>{SERVICE_CATEGORY_LABELS[cat]}</span>
                              <span
                                className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                                  checked ? 'bg-amber-700 border-amber-700 text-white' : 'border-stone-300 text-transparent'
                                }`}
                              >
                                ✓
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1.5 leading-relaxed">
                        تابلوی سفارشات شما فقط سفارش‌های رسته‌های انتخابی و شهرهای تحت پوشش شما را نمایش می‌دهد.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        تلفن ثابت فروشگاه:
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={regLandline}
                        onChange={(e) => setRegLandline(e.target.value)}
                        placeholder="۰۲۱-۸۸۸۸۰۰۰۰"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        شماره شبای فروشگاه (در فاکتور مشتری نمایش داده می‌شود):
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={regSheba}
                        onChange={(e) => setRegSheba(e.target.value)}
                        placeholder="IR000000000000000000000000"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        کد ملی مدیر / پروانه کسب:
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={regNationalCode}
                        onChange={(e) => setRegNationalCode(e.target.value)}
                        placeholder="۰۰۱۲۳۴۵۶۷۸"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* General Personal Info */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-stone-800">
                  ۲. اطلاعات هویتی و تماس:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      {regRole === 'vendor' ? 'نام و نام خانوادگی مدیر/مسئول:' : 'نام و نام خانوادگی:'} *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="مثلاً: سارا رضایی"
                        className="w-full pl-3 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                      />
                      <User className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      شماره تلفن همراه: *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        dir="ltr"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                        className="w-full pl-3 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-amber-700"
                      />
                      <Phone className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-2.5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ایمیل: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      رمز عبور: <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="حداقل ۸ کاراکتر، ترکیب حرف و عدد و نماد"
                        className="w-full pl-3 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                      />
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-2.5" />
                    </div>
                    <PasswordStrengthMeter password={regPassword} phone={regPhone} />
                  </div>
                </div>
              </div>

              {/* Address / Location Section */}
              <div className="space-y-3 pt-1 border-t border-stone-100">
                <span className="block text-xs font-bold text-stone-800">
                  ۳. نشانی و منطقه فعالیت/سکونت:
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">شهر:</label>
                    <select
                      value={regCity}
                      onChange={(e) => {
                        const newCity = e.target.value;
                        setRegCity(newCity);
                        const matched = operationalCities.find((c) => c.name === newCity);
                        if (matched) {
                          setRegProvince(matched.province);
                          if (matched.districts && matched.districts.length > 0) {
                            setRegDistrict(matched.districts[0].split(' ')[0]);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700 font-medium"
                    >
                      {operationalCities.length > 0 ? (
                        operationalCities.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name} (استان {c.province}) {c.isActive ? '✓ فعال' : `(فاز ${c.phase})`}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="تهران">تهران (استان تهران)</option>
                          <option value="کرج">کرج (استان البرز)</option>
                          <option value="اصفهان">اصفهان (فاز ۲)</option>
                          <option value="شیراز">شیراز (فاز ۲)</option>
                          <option value="مشهد">مشهد (فاز ۳)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">محله / منطقه:</label>
                    <input
                      type="text"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      placeholder="مثلاً: سعادت‌آباد، نیاوران، ونک"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                    />
                  </div>
                </div>

                {/* If vendor role, show satellite cities coverage for the selected city */}
                {regRole === 'vendor' && (() => {
                  const matchedCity = operationalCities.find((c) => c.name === regCity);
                  const citySatellites = Array.from(
                    new Set([
                      ...(matchedCity?.otherCoveredCities || []),
                      ...(matchedCity?.satelliteCities || []),
                      ...operationalCities.filter((c) => c.parentHubCityName === regCity || (matchedCity?.id && c.parentHubCityId === matchedCity.id)).map((c) => c.name),
                      ...(regCity === 'تهران' ? ['پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'ملارد', 'شهر قدس'] : []),
                      ...(regCity === 'مشهد' ? ['گلبهار', 'چناران', 'نیشابور', 'طرقبه و شاندیز', 'کلات', 'روستای لکلک'] : [])
                    ])
                  );

                  if (citySatellites.length === 0) return null;

                  const toggleSuburb = (suburbName: string) => {
                    if (regCoveredOtherCities.includes(suburbName)) {
                      setRegCoveredOtherCities(regCoveredOtherCities.filter((s) => s !== suburbName));
                    } else {
                      setRegCoveredOtherCities([...regCoveredOtherCities, suburbName]);
                    }
                  };

                  return (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-700" />
                          <span>سایر شهرهای تحت پوشش فروشگاه شما (شهرهای اقماری {regCity}):</span>
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {regCoveredOtherCities.length} شهر
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-600 leading-relaxed">
                        شهرهای اقماری که گالری شما آمادگی اعزام کارشناس و کالیته به منازل آنجا را دارد انتخاب فرمایید:
                      </p>

                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-white rounded-xl border border-stone-200">
                        {citySatellites.map((suburb) => {
                          const isChecked = regCoveredOtherCities.includes(suburb);
                          return (
                            <button
                              key={suburb}
                              type="button"
                              onClick={() => toggleSuburb(suburb)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isChecked
                                  ? 'bg-amber-100 text-amber-950 border border-amber-400 font-bold shadow-2xs'
                                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                readOnly
                                className="accent-amber-700 w-3 h-3 pointer-events-none"
                              />
                              <span>{suburb}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Phasing guidance notice for chosen city */}
                {(() => {
                  const matchedCity = operationalCities.find((c) => c.name === regCity);
                  if (!matchedCity) return null;

                  if (regRole === 'vendor' && !matchedCity.isPartnerRegistrationActive) {
                    return (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                        <strong className="font-bold">وضعیت فازبندی همکاران ({regCity}):</strong>{' '}
                        جذب مستقیم گالری پرده در این شهر در حال حاضر در صف انتظار فاز {matchedCity.phase} است. ثبت‌نام شما به عنوان پیش‌ثبت‌نام همکار ذخیره می‌گردد.
                      </div>
                    );
                  }

                  if (regRole === 'customer' && !matchedCity.isActive) {
                    return (
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
                        <strong className="font-bold">پوشش استانی دراپینو ({regCity}):</strong>{' '}
                        {matchedCity.statusNote || `اعزام کارشناس به این شهر به زودی در فاز ${matchedCity.phase} آغاز می‌شود.`}
                      </div>
                    );
                  }

                  return null;
                })()}

                {regRole !== 'admin' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                      موقعیت دقیق روی نقشه: <span className="text-red-500">*</span>
                    </label>
                    <MapAddressPicker
                      city={regCity}
                      value={regLocation}
                      onPick={(loc) => {
                        setRegLocation({ lat: loc.lat, lng: loc.lng });
                        if (loc.address) setRegAddress(loc.address);
                        if (loc.postalCode && !regPostalCode.trim()) setRegPostalCode(loc.postalCode);
                      }}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    نشانی دقیق پستی (از روی نقشه پر می‌شود، در صورت نیاز تکمیل کنید):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder={regRole === 'vendor' ? 'نشانی دقیق فروشگاه یا کارگاه' : 'خیابان اصلی، کوچه، پلاک، واحد'}
                      className="w-full pl-3 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                    />
                    <MapPin className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                {regRole === 'customer' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">پلاک، طبقه و زنگ:</label>
                      <input
                        type="text"
                        value={regFloorUnit}
                        onChange={(e) => setRegFloorUnit(e.target.value)}
                        placeholder="طبقه ۳، واحد ۷"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">کد پستی (اختیاری):</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={regPostalCode}
                        onChange={(e) => setRegPostalCode(e.target.value)}
                        placeholder="۱۹۹۸۸۲۳۱۱۱"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-amber-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Security check (موقتاً غیرفعال: RECAPTCHA_ENABLED در RecaptchaBox.tsx) */}
              {RECAPTCHA_ENABLED && (
                <div className="space-y-2 pt-1 border-t border-stone-100">
                  <span className="block text-xs font-bold text-stone-800">
                    ۴. تأیید امنیتی:
                  </span>
                  <RecaptchaBox onChange={setCaptchaToken} resetSignal={captchaReset} />
                </div>
              )}

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {regRole === 'customer' && 'تکمیل ثبت‌نام و ورود به پنل مشتری'}
                  {regRole === 'vendor' && 'ثبت‌نام همکار و ورود به پنل فروشگاه'}
                  {regRole === 'admin' && 'ورود به پنل مدیریت سیستم'}
                </span>
              </button>

            </form>
          )}

        </div>

        {/* Modal Footer note */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-[11px] text-stone-500 shrink-0">
          فعالیت در دراپینو تحت نظارت مستقیم اتحادیه تزئینات ساختمانی است.
        </div>

      </div>
    </div>
  );
};
