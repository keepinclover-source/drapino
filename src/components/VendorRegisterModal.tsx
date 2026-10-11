import React, { useState } from 'react';
import { X, Store, User, CreditCard, FileCheck, MapPin, Phone, Upload, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { CurtainVendor, OperationalCity } from '../types';

interface VendorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  operationalCities: OperationalCity[];
  onSubmitRegistration: (vendorData: Partial<CurtainVendor>) => void;
}

export const VendorRegisterModal: React.FC<VendorRegisterModalProps> = ({
  isOpen,
  onClose,
  operationalCities,
  onSubmitRegistration,
}) => {
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [selectedCity, setSelectedCity] = useState(operationalCities[0]?.name || 'تهران');
  const [coveredSuburbs, setCoveredSuburbs] = useState<string[]>([]);
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [licenseImage, setLicenseImage] = useState<string>('');
  const [nationalCardImage, setNationalCardImage] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentCityObj = operationalCities.find((c) => c.name === selectedCity);
  const isCityOpenForRegistration = currentCityObj ? currentCityObj.isPartnerRegistrationActive : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName || !ownerName || !phone || !nationalCode || !address) {
      alert('لطفاً کلیه فیلدهای الزامی فرم ثبت‌نام را تکمیل نمایید.');
      return;
    }

    if (nationalCode.length !== 10) {
      alert('کد ملی باید دقیقاً ۱۰ رقم باشد.');
      return;
    }

    if (!acceptTerms) {
      alert('لطفاً تعهدنامه رعایت قوانین اتحادیه و سامانه دراپینو را تایید فرمایید.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      const newVendorData: Partial<CurtainVendor> = {
        name: storeName,
        ownerName,
        phone,
        nationalCode,
        city: selectedCity,
        coveredDistricts: district ? [district] : ['مرکز شهر'],
        coveredOtherCities: coveredSuburbs,
        address,
        businessLicenseImageUrl: licenseImage || undefined,
        nationalCardImageUrl: nationalCardImage || undefined,
        verificationStatus: 'pending_verification',
        isVerified: false,
        joinedDate: new Date().toISOString(),
        gamification: { walletChargePackage: 'none', performancePoints: 0 },
        rating: 0,
        ratingCount: 0,
        completedVisits: 0,
        successfulOrders: 0,
        tier: 'برنز',
        walletBalance: 1100000, // هدیه بونوس اولیه ورود به شبکه
        sampleCatalogs: ['کالیته‌های استاندارد همکار'],
      };

      setTimeout(() => {
        onSubmitRegistration(newVendorData);
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 text-right">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black">درخواست عضویت در شبکه فروشگاه‌های دراپینو</h3>
              <p className="text-xs text-stone-300 mt-0.5">
                شکار سفارشات پرو در منزل و اتصال به مشتریان دست‌به‌نقد منطقه شما
              </p>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-stone-900">مدارک صنفی شما با موفقیت دریافت شد!</h4>
            <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
              پرونده شما در صف بررسی کارشناس انسانی و تطابق با پروانه کسب اتحادیه قرار گرفت. 
              پس از تایید مدیر سیستم در پنل بازرسی، پیامک فعال‌سازی تابلوی شکار سفارشات برای شما ارسال خواهد شد.
            </p>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-semibold inline-block">
              وضعیت پرونده: در انتظار بررسی و تایید دستی مدارک (Pending Verification)
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Notice banner */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-950 leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">تاییدیه رسمی مدیر سیستم الزامی است:</span> کلیه فروشگاه‌های همکار موظف به ارائه پروانه کسب معتبر صنفی هستند و پس از بررسی دقیق مدارک توسط ناظر انسانی مجوز دسترسی به سفارشات مشتریان را دریافت خواهند کرد.
              </div>
            </div>

            {/* City Selection with Phase check & Satellite Cities Coverage */}
            <div className="space-y-3 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1">
                  شهر اصلی و پایگاه فروشگاه: <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setSelectedCity(newCity);
                    setCoveredSuburbs([]);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-stone-300 rounded-xl bg-white text-stone-900 focus:outline-amber-600 shadow-2xs"
                >
                  {operationalCities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name} (استان {city.province}) {city.isActive ? '✓ فاز فعال' : `(فاز ${city.phase} - ${city.isPartnerRegistrationActive ? 'ثبت‌نام همکار' : 'به زودی'})`}
                    </option>
                  ))}
                </select>
                {!isCityOpenForRegistration && (
                  <p className="text-[11px] text-amber-700 font-medium mt-1">
                    ⚠️ ثبت‌نام همکار در این شهر در فاز جذب اولیه است؛ پرونده شما در اولویت راه‌اندازی قرار خواهد گرفت.
                  </p>
                )}
              </div>

              {/* Dynamic Satellite Cities / Other Covered Cities for this City */}
              {(() => {
                const citySatellites = Array.from(
                  new Set([
                    ...(currentCityObj?.otherCoveredCities || []),
                    ...(currentCityObj?.satelliteCities || []),
                    ...operationalCities.filter((c) => c.parentHubCityName === selectedCity || (c.parentHubCityId && c.parentHubCityId === currentCityObj?.id)).map((c) => c.name),
                    ...(selectedCity === 'تهران' ? ['پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'شهر قدس', 'ملارد'] : []),
                    ...(selectedCity === 'مشهد' ? ['گلبهار', 'چناران', 'نیشابور', 'طرقبه و شاندیز', 'کلات', 'روستای لکلک'] : [])
                  ])
                );

                if (citySatellites.length === 0) return null;

                const toggleSuburb = (suburbName: string) => {
                  if (coveredSuburbs.includes(suburbName)) {
                    setCoveredSuburbs(coveredSuburbs.filter((s) => s !== suburbName));
                  } else {
                    setCoveredSuburbs([...coveredSuburbs, suburbName]);
                  }
                };

                return (
                  <div className="pt-2.5 border-t border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        <span>سایر شهرهای تحت پوشش (شهرهای اقماری متصل به {selectedCity}):</span>
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {coveredSuburbs.length} شهر انتخاب شده
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      شهرهای اقماری که گالری شما آمادگی اعزام کارشناس و کالیته به منازل آنجا را دارد انتخاب کنید تا سفارشات تابلوی شکار همان محدوده به شما تخصیص یابد:
                    </p>

                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white rounded-xl border border-stone-200">
                      {citySatellites.map((suburb) => {
                        const isChecked = coveredSuburbs.includes(suburb);
                        return (
                          <button
                            key={suburb}
                            type="button"
                            onClick={() => toggleSuburb(suburb)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isChecked
                                ? 'bg-amber-100 text-amber-950 border border-amber-400 font-bold shadow-2xs'
                                : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="accent-amber-700 w-3.5 h-3.5 pointer-events-none"
                            />
                            <span>{suburb}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">نام فروشگاه پرده / گالری:</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="مثال: گالری پرده رویال"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">نام و نام خانوادگی صاحب جواز:</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="مثال: محمدرضا کمالی"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">کد ملی مالک (۱۰ رقم):</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={nationalCode}
                  onChange={(e) => setNationalCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="مثال: ۰۰۱۲۳۴۵۶۷۸"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl text-left font-mono tracking-wider focus:outline-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">شماره همراه تماس:</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: ۰۹۱۲۱۱۱۰۰۹۹"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl text-left font-mono focus:outline-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">منطقه / محله فروشگاه:</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="مثال: سعادت‌آباد، صادقیه، پونک..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">نشانی دقیق فروشگاه:</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="خیابان، پلاک، طبقه و نام مجتمع تجاری"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-amber-600"
                />
              </div>
            </div>

            {/* Document Uploads (Simulated with preview) */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
              <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-amber-700" />
                تصاویر مدارک هویتی و صنفی
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Business license */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-stone-700">
                    تصویر پروانه کسب معتبر:
                  </label>
                  <div className="relative rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-600 overflow-hidden group p-2 bg-white flex flex-col items-center justify-center text-center h-32">
                    {licenseImage ? (
                      <img src={licenseImage} alt="پروانه کسب" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-6 h-6 text-stone-400 mx-auto" />
                        <span className="text-[11px] text-stone-500">انتخاب فایل پروانه کسب</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setLicenseImage('https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80')}
                      className="absolute inset-0 bg-stone-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] font-bold transition-opacity"
                    >
                      تغییر تصویر مدرک
                    </button>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block">✓ فایل نمونه بارگذاری شد</span>
                </div>

                {/* National Card */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-stone-700">
                    تصویر کارت ملی صاحب پروانه:
                  </label>
                  <div className="relative rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-600 overflow-hidden group p-2 bg-white flex flex-col items-center justify-center text-center h-32">
                    {nationalCardImage ? (
                      <img src={nationalCardImage} alt="کارت ملی" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-6 h-6 text-stone-400 mx-auto" />
                        <span className="text-[11px] text-stone-500">انتخاب فایل کارت ملی</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setNationalCardImage('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80')}
                      className="absolute inset-0 bg-stone-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] font-bold transition-opacity"
                    >
                      تغییر تصویر کارت ملی
                    </button>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block">✓ فایل نمونه بارگذاری شد</span>
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded text-amber-700 focus:ring-amber-600"
              />
              <span className="text-[11px] text-stone-700 leading-relaxed font-medium">
                متعهد می‌شوم کالیته‌های اصلی و استاندارد را در منزل مشتری تست نموده و فاکتور رسمی را با کسر تضمینی بیعانه مشتری (مطابق مبلغ بیعانه همان شهر) در سامانه دراپینو ثبت کنم.
              </span>
            </label>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? 'در حال ثبت پرونده...' : 'ارسال درخواست جهت بررسی و تایید مدیر'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
