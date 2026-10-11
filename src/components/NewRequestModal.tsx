import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  Info,
  AlertTriangle,
  Crown,
  Store,
  Star,
  Tag,
  Gift,
  Percent
} from 'lucide-react';
import { VisitRequest, OperationalCity, UserProfile, BuyBoxSettings, BuyBoxReservation, CurtainVendor, DiscountCoupon } from '../types';
import { FABRIC_SWATCH_PRESETS } from '../utils/swatchUtils';
import { useDeposit } from '../context/DepositContext';
import { WALLPAPER_STYLE_OPTIONS, FLOORING_STYLE_OPTIONS } from '../utils/quoteEstimators';
import type { CatalogEntry, CatalogGroup } from '../utils/catalogStyles';
import { formatDepositToman } from '../utils/deposit';
import { SECURE_PAYMENT_SLOGAN, SECURE_PAYMENT_ASSURANCE } from '../utils/escrow';
import { ServiceCategoryPicker, ServiceCategory, SERVICE_CATEGORY_LABELS } from './ServiceCategoryPicker';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (request: Partial<VisitRequest>) => void;
  initialDetails?: { width: number; height: number; style: string; fabricTier: string };
  // پیش‌پر شدن فرم از «استعلام قیمت هوشمند» برای کاغذ دیواری / کفپوش
  initialCategory?: 'wallpaper' | 'flooring';
  initialArea?: number;
  initialStyles?: string[];
  initialNotes?: string;
  initialCity?: string;
  operationalCities?: OperationalCity[];
  currentUser?: UserProfile | null;
  buyBoxSettings?: BuyBoxSettings;
  buyBoxReservations?: BuyBoxReservation[];
  vendors?: CurtainVendor[];
  discountCoupons?: DiscountCoupon[];
  onUseDiscountCoupon?: (couponCode: string) => void;
  /** کالیته‌ها و دسته‌های واحد از پنل مدیریت */
  catalogEntries?: CatalogEntry[];
  catalogGroups?: CatalogGroup[];
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitRequest,
  initialDetails,
  initialCategory,
  initialArea,
  initialStyles,
  initialNotes,
  initialCity,
  operationalCities = [],
  currentUser,
  buyBoxSettings,
  buyBoxReservations = [],
  vendors = [],
  discountCoupons = [],
  onUseDiscountCoupon,
  catalogEntries = [],
  catalogGroups = [],
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // نوع خدمت: پرده / کاغذ دیواری / کفپوش و پارکت (null = هنوز انتخاب نشده)
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | null>(null);
  const [approxArea, setApproxArea] = useState<number>(20);

  // هر بار که فرم باز می‌شود، از مرحله انتخاب نوع خدمت شروع می‌شود
  // (اگر از محاسبه‌گر پرده آمده باشد، مستقیم روی «پرده» می‌ماند)
  useEffect(() => {
    if (isOpen) {
      setServiceCategory(initialCategory || (initialDetails ? 'curtain' : null));
      if (initialCategory) {
        if (initialStyles && initialStyles.length) setSelectedStyles(initialStyles);
        if (initialArea && initialArea > 0) setApproxArea(initialArea);
      }
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Form State
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const defaultCity = initialCity || currentUser?.city || operationalCities.find((c) => c.isActive)?.name || 'تهران';
  const [city, setCity] = useState(defaultCity);
  const { getDeposit } = useDeposit();
  const [district, setDistrict] = useState(currentUser?.district || 'سعادت‌آباد');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [floorAndUnit, setFloorAndUnit] = useState(currentUser?.floorAndUnit || '');

  React.useEffect(() => {
    if (isOpen) {
      if (initialCity) {
        setCity(initialCity);
      } else if (currentUser?.city) {
        setCity(currentUser.city);
      }
    }
  }, [isOpen, initialCity, currentUser]);

  // Buy Box Suggestion State
  const [preferredVendorOption, setPreferredVendorOption] = useState<'suggested_buy_box' | 'competitive_hunting'>('suggested_buy_box');

  // Find active/reserved Buy Box winner for this city & district
  const matchedBuyBoxReservation = React.useMemo(() => {
    if (!buyBoxSettings || !buyBoxSettings.isEnabled) return undefined;
    const cleanCity = (city || '').trim();
    const cleanDistrict = (district || '').trim();
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Try city + district match
    let match = buyBoxReservations.find(
      (r) =>
        (r.status === 'active' || r.status === 'reserved') &&
        (r.vendorCity === cleanCity || cleanCity.includes(r.vendorCity) || r.vendorCity.includes(cleanCity)) &&
        r.coveredDistricts?.some((d) => !cleanDistrict || d.includes(cleanDistrict) || cleanDistrict.includes(d))
    );

    // 2. Try city match
    if (!match) {
      match = buyBoxReservations.find(
        (r) =>
          (r.status === 'active' || r.dateIso === todayStr || r.status === 'reserved') &&
          (r.vendorCity === cleanCity || cleanCity.includes(r.vendorCity) || r.vendorCity.includes(cleanCity))
      );
    }

    // 3. Fallback for demo: any active or reserved reservation in the system
    if (!match && buyBoxReservations.length > 0) {
      match = buyBoxReservations.find((r) => r.status === 'active' || r.status === 'reserved');
    }

    return match || undefined;
  }, [buyBoxSettings, buyBoxReservations, city, district]);

  // Check 50% max quota rule (alternate orders: even counts get Buy Box suggestion)
  const isWithinFiftyPercentQuota = React.useMemo(() => {
    if (!matchedBuyBoxReservation) return false;
    // 50% quota rule: up to 50% of orders get the suggestion
    // When count % 2 === 0 (0, 2, 4, 6...), it is prioritized to Buy Box
    return matchedBuyBoxReservation.ordersReceivedCount % 2 === 0;
  }, [matchedBuyBoxReservation]);

  const suggestedVendor = React.useMemo(() => {
    if (!matchedBuyBoxReservation || !isWithinFiftyPercentQuota) return null;
    return vendors.find((v) => v.id === matchedBuyBoxReservation.vendorId) || vendors[0] || null;
  }, [matchedBuyBoxReservation, isWithinFiftyPercentQuota, vendors]);

  // Pre-fill from currentUser when modal opens
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setCustomerName(currentUser.name);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.city) setCity(currentUser.city);
      if (currentUser.district) setDistrict(currentUser.district);
      if (currentUser.address) setAddress(currentUser.address);
      if (currentUser.floorAndUnit) setFloorAndUnit(currentUser.floorAndUnit);
      if (currentUser.notes) setNotes(currentUser.notes);
    }
  }, [currentUser, isOpen]);
  
  const [selectedRooms, setSelectedRooms] = useState<string[]>(['سالن پذیرایی']);
  const [approxWindows, setApproxWindows] = useState<number>(2);
  const [approxWidth, setApproxWidth] = useState<number>(initialDetails?.width || 5.0);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    initialDetails?.fabricTier || 'مخمل کالیفرنیا ترک',
    'حریر شاین و الگانت'
  ]);
  const [preferredDate, setPreferredDate] = useState('۱۴۰۳/۰۷/۱۴');
  const [timeSlot, setTimeSlot] = useState('۱۵:۰۰ الی ۱۸:۰۰');
  const [notes, setNotes] = useState('');

  // خلاصه استعلام قیمت هوشمند در توضیحات سفارش درج می‌شود
  useEffect(() => {
    if (isOpen && initialNotes) setNotes(initialNotes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Payment Simulation State
  const [cardNumber, setCardNumber] = useState('۶۰۳۷-۹۹۷۵-****-۲۸۴۱');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Discount Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMessage, setCouponSuccessMessage] = useState<string | null>(null);

  // Selectable cities & satellite cities grouped by Hub
  const selectableCityOptions = React.useMemo(() => {
    const tehranObj = operationalCities.find((c) => c.name === 'تهران' || c.id === 'city-tehran');
    const mashhadObj = operationalCities.find((c) => c.name === 'مشهد' || c.id === 'city-mashhad');

    // Collect all satellite cities for Tehran (from operationalCities, tehranObj.satelliteCities, and known suburbs)
    const tehranSatellites = Array.from(
      new Set([
        ...(tehranObj?.satelliteCities || []),
        ...operationalCities
          .filter((c) => c.parentHubCityName === 'تهران' || c.parentHubCityId === 'city-tehran' || (c.province === 'تهران' && c.name !== 'تهران'))
          .map((c) => c.name),
        'پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'دماوند و رودهن', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'ملارد', 'شهر قدس'
      ])
    ).filter(Boolean);

    // Collect all satellite cities for Mashhad
    const mashhadSatellites = Array.from(
      new Set([
        ...(mashhadObj?.satelliteCities || []),
        ...operationalCities
          .filter((c) => c.parentHubCityName === 'مشهد' || c.parentHubCityId === 'city-mashhad')
          .map((c) => c.name),
        'گلبهار', 'چناران', 'نیشابور', 'کلات', 'روستای لکلک', 'طرقبه', 'شاندیز'
      ])
    ).filter(Boolean);

    // Other operational cities
    const otherCities = operationalCities.filter(
      (c) =>
        c.name !== 'تهران' &&
        c.name !== 'مشهد' &&
        !tehranSatellites.includes(c.name) &&
        !mashhadSatellites.includes(c.name) &&
        !c.parentHubCityName
    );

    return {
      tehranObj,
      tehranSatellites,
      mashhadObj,
      mashhadSatellites,
      otherCities
    };
  }, [operationalCities]);

  // Dynamic Metadata for currently selected city
  const selectedCityMetadata = React.useMemo(() => {
    const isTehranSatellite = selectableCityOptions.tehranSatellites.includes(city);
    const isMashhadSatellite = selectableCityOptions.mashhadSatellites.includes(city);
    const matchedCityObj = operationalCities.find((c) => c.name === city);

    if (city === 'تهران' || (matchedCityObj?.isHub && matchedCityObj.name === 'تهران')) {
      return {
        isSatellite: false,
        hubName: 'تهران',
        province: 'تهران',
        districts: matchedCityObj?.districts || ['نیاوران', 'سعادت‌آباد', 'ونک', 'تهرانپارس', 'پونک', 'جنت‌آباد', 'دریاچه چیتگر'],
        suburbNote: undefined,
        distanceKm: undefined
      };
    }

    if (city === 'مشهد' || (matchedCityObj?.isHub && matchedCityObj.name === 'مشهد')) {
      return {
        isSatellite: false,
        hubName: 'مشهد',
        province: 'خراسان رضوی',
        districts: matchedCityObj?.districts || ['کوهسنگی', 'احمدآباد', 'سجاد', 'وکیل‌آباد', 'الهیه', 'قاسم‌آباد'],
        suburbNote: undefined,
        distanceKm: undefined
      };
    }

    if (isTehranSatellite || matchedCityObj?.parentHubCityName === 'تهران' || matchedCityObj?.parentHubCityId === 'city-tehran') {
      let defaultDistricts = ['مرکز شهر', 'محله مسکونی'];
      if (city === 'پردیس') defaultDistricts = ['فاز ۱ (مرکزی)', 'فاز ۲ (ویلایی)', 'فاز ۳ (مسکونی)', 'فاز ۴', 'فاز ۸ (دره بهشت)', 'فاز ۱۱ (کوزو)'];
      else if (city === 'پرند') defaultDistricts = ['فاز ۰ و ۱ (شمالی)', 'فاز ۲ (مرکزی)', 'فاز ۳ (پردیسان)', 'فاز ۴ (آفتاب)', 'فاز ۵ و ۶ (کوزو)'];
      else if (city === 'اسلامشهر') defaultDistricts = ['مرکز شهر (خیابان کاشانی)', 'زرافشان', 'باغ فیض', 'شهرک قائمیه', 'شهرک واوان'];
      else if (city === 'شهریار') defaultDistricts = ['مرکز شهر شهریار', 'شهر جدید اندیشه فاز ۱', 'فاز ۳ اندیشه', 'امیریه', 'کهنز'];
      else if (city.includes('دماوند')) defaultDistricts = ['گیلاوند', 'مرکز شهر دماوند', 'رودهن', 'مشاء', 'آبسرد'];
      else if (city === 'ورامین') defaultDistricts = ['مرکز شهر ورامین', 'صادقعلی', 'امرآباد', 'خیرآباد'];
      else if (city === 'پاکدشت') defaultDistricts = ['مرکز شهر', 'فرون‌آباد', 'شریف‌آباد'];
      else if (city === 'قرچک') defaultDistricts = ['باقرآباد', 'زیباشهر', 'مرکز قرچک'];
      else if (city === 'رباط‌کریم') defaultDistricts = ['مرکز شهر', 'نصیرشهر', 'پرندک'];

      return {
        isSatellite: true,
        hubName: 'تهران',
        province: 'تهران',
        districts: matchedCityObj?.districts && matchedCityObj.districts.length > 0 ? matchedCityObj.districts : defaultDistricts,
        suburbNote: matchedCityObj?.suburbDeliveryAllowanceNote || `اعزام مستقیم کارشناس و چمدان کالیته‌های پارچه از تابلوی شکار تهران به نشانی شما در ${city} با هماهنگی کامل بدون هزینه مضاعف.`,
        distanceKm: matchedCityObj?.distanceKmFromHub || (city === 'پرند' ? 35 : city === 'پردیس' ? 25 : city === 'اسلامشهر' ? 20 : city === 'شهریار' ? 30 : city.includes('دماوند') ? 50 : 35)
      };
    }

    if (isMashhadSatellite || matchedCityObj?.parentHubCityName === 'مشهد' || matchedCityObj?.parentHubCityId === 'city-mashhad') {
      let defaultDistricts = ['مرکز شهر'];
      if (city === 'گلبهار') defaultDistricts = ['محله پرند', 'بلوار استقلال', 'محله بهارستان', 'مسکن مهر'];
      else if (city === 'نیشابور') defaultDistricts = ['خیابان خیام', 'فردوسی', 'بلوار جمهوری', 'امیرکبیر'];
      else if (city === 'چناران') defaultDistricts = ['بلوار امام رضا', 'خیابان طالقانی'];
      else if (city === 'کلات') defaultDistricts = ['مرکز شهر کلات', 'دژ رشید'];
      else if (city === 'روستای لکلک') defaultDistricts = ['بافت اصلی روستا'];

      return {
        isSatellite: true,
        hubName: 'مشهد',
        province: 'خراسان رضوی',
        districts: matchedCityObj?.districts && matchedCityObj.districts.length > 0 ? matchedCityObj.districts : defaultDistricts,
        suburbNote: matchedCityObj?.suburbDeliveryAllowanceNote || `اعزام مستقیم کارشناس با کالیته پارچه از تابلوی شکار مشهد به نشانی شما در ${city}.`,
        distanceKm: matchedCityObj?.distanceKmFromHub || (city === 'گلبهار' ? 35 : city === 'نیشابور' ? 120 : city === 'چناران' ? 50 : 40)
      };
    }

    return {
      isSatellite: Boolean(matchedCityObj?.parentHubCityName),
      hubName: matchedCityObj?.parentHubCityName,
      province: matchedCityObj?.province || 'تهران',
      districts: matchedCityObj?.districts || ['مرکز شهر'],
      suburbNote: matchedCityObj?.suburbDeliveryAllowanceNote,
      distanceKm: matchedCityObj?.distanceKmFromHub
    };
  }, [city, operationalCities, selectableCityOptions]);

  // Eligible coupons for current customer (based on phone or user profile)
  const eligibleCouponsForUser = React.useMemo(() => {
    if (!discountCoupons || discountCoupons.length === 0) return [];
    return discountCoupons.filter((c) => {
      if (!c.isActive) return false;
      if (c.usedCount >= c.usageLimit) return false;
      if (c.appliesTo === 'invoice') return false; // This step is deposit payment
      if (c.assignedCustomerPhone) {
        const cleanP = (phone || currentUser?.phone || '').replace(/\D/g, '');
        const cleanAssigned = c.assignedCustomerPhone.replace(/\D/g, '');
        if (cleanP && cleanAssigned && !cleanP.includes(cleanAssigned) && !cleanAssigned.includes(cleanP)) {
          return false;
        }
      }
      return true;
    });
  }, [discountCoupons, phone, currentUser]);

  // Discount Calculation on Deposit (بیعانه پایه = مبلغ تعیین‌شده برای شهر انتخاب‌شده در همین فرم)
  const baseDepositAmount = getDeposit(city);
  const { discountAmount, payableDeposit, isCapped } = React.useMemo(() => {
    if (!appliedCoupon) {
      return { discountAmount: 0, payableDeposit: baseDepositAmount, isCapped: false };
    }

    let calculated = 0;
    let capped = false;

    if (appliedCoupon.discountType === 'percentage') {
      const raw = Math.round((baseDepositAmount * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscountAmount && raw > appliedCoupon.maxDiscountAmount) {
        calculated = appliedCoupon.maxDiscountAmount;
        capped = true;
      } else {
        calculated = raw;
      }
    } else {
      // Fixed amount
      calculated = Math.min(appliedCoupon.discountValue, baseDepositAmount);
      if (appliedCoupon.maxDiscountAmount && calculated > appliedCoupon.maxDiscountAmount) {
        calculated = appliedCoupon.maxDiscountAmount;
        capped = true;
      }
    }

    const payable = Math.max(0, baseDepositAmount - calculated);
    return { discountAmount: calculated, payableDeposit: payable, isCapped: capped };
  }, [appliedCoupon, baseDepositAmount]);

  const handleApplyCoupon = (codeToApply: string) => {
    setCouponError(null);
    setCouponSuccessMessage(null);
    const cleanCode = (codeToApply || '').trim().toUpperCase();

    if (!cleanCode) {
      setCouponError('لطفاً کد تخفیف را وارد کنید.');
      return;
    }

    const found = discountCoupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (!found) {
      setCouponError('کد تخفیف وارد شده معتبر نمی‌باشد.');
      return;
    }

    if (!found.isActive) {
      setCouponError('این کد تخفیف غیرفعال شده است.');
      return;
    }

    if (found.usedCount >= found.usageLimit) {
      setCouponError('سقف مجاز استفاده از این کد تخفیف به پایان رسیده است.');
      return;
    }

    if (found.appliesTo === 'invoice') {
      setCouponError('این کد تخفیف فقط برای تسویه فاکتور نهایی دوخت و پارچه قابل استفاده است.');
      return;
    }

    if (found.assignedCustomerPhone) {
      const cleanPhone = (phone || currentUser?.phone || '').replace(/\D/g, '');
      const assignedPhone = found.assignedCustomerPhone.replace(/\D/g, '');
      if (cleanPhone && assignedPhone && !cleanPhone.includes(assignedPhone) && !assignedPhone.includes(cleanPhone)) {
        setCouponError(`این کد تخفیف اختصاصی است و فقط برای شماره ${found.assignedCustomerPhone} معتبر می‌باشد.`);
        return;
      }
    }

    // Success
    setAppliedCoupon(found);
    if (found.discountType === 'percentage') {
      const ceilingNote = found.maxDiscountAmount ? ` (سقف تخفیف: ${found.maxDiscountAmount.toLocaleString('fa-IR')} تومان)` : '';
      setCouponSuccessMessage(`تخفیف ${found.discountValue}٪ با موفقیت اعمال شد${ceilingNote}.`);
    } else {
      setCouponSuccessMessage(`تخفیف نقدی ${found.discountValue.toLocaleString('fa-IR')} تومان با موفقیت اعمال شد.`);
    }
  };

  if (!isOpen) return null;

  // مرحله صفر: انتخاب نوع خدمت با سه کارت تصویری
  if (!serviceCategory) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-stone-900">رزرو مشاوره و اعزام فروشگاه به خانه</h3>
              <span className="text-xs text-stone-500">ابتدا نوع خدمت مورد نظر خود را انتخاب کنید</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ServiceCategoryPicker
            onSelect={(c) => {
              setServiceCategory(c);
              setStep(1);
              const opts = catalogEntries
                .filter((e) => e.category === c && e.isActive !== false)
                .map((e) => e.title);
              const groupOpts = catalogGroups.filter((g) => g.category === c).map((g) => g.label);
              const pool = opts.length ? opts : groupOpts;
              setSelectedStyles(
                pool.length
                  ? pool.slice(0, Math.min(2, pool.length))
                  : c === 'wallpaper'
                    ? ['کاغذ دیواری ساده و تکسچر']
                    : c === 'flooring'
                      ? ['پارکت چوب طبیعی']
                      : [initialDetails?.fabricTier || 'مخمل کالیفرنیا ترک']
              );
            }}
          />
        </div>
      </div>
    );
  }

  const isCurtain = serviceCategory === 'curtain';
  const categoryLabel = SERVICE_CATEGORY_LABELS[serviceCategory];

  const roomOptions = [
    'سالن پذیرایی',
    'اتاق خواب مستر',
    'اتاق کودک / نوجوان',
    'اتاق مهمان',
    'نشیمن و TV Room',
    'آشپزخانه',
    'دفتر کار / هوم آفیس',
  ];

  // گزینه‌های سبک/کالیته از دسته‌بندی و کالیته‌های واحد پنل مدیریت
  const styleOptions = (() => {
    if (!serviceCategory) return [] as string[];
    const fromEntries = catalogEntries
      .filter((e) => e.category === serviceCategory && e.isActive !== false)
      .map((e) => e.title)
      .filter(Boolean);
    if (fromEntries.length > 0) return Array.from(new Set(fromEntries));
    const fromGroups = catalogGroups
      .filter((g) => g.category === serviceCategory)
      .map((g) => g.label)
      .filter(Boolean);
    if (fromGroups.length > 0) return Array.from(new Set(fromGroups));
    // پشتیبان قدیمی
    if (serviceCategory === 'wallpaper') return WALLPAPER_STYLE_OPTIONS;
    if (serviceCategory === 'flooring') return FLOORING_STYLE_OPTIONS;
    return [
      'مخمل کالیفرنیا ترک',
      'حریر شاین و الگانت',
      'زبرا دومکانیزم شب و روز',
    ];
  })();

  const categoryChipOptions = catalogGroups.filter((g) => g.category === serviceCategory);

  const toggleRoom = (room: string) => {
    if (selectedRooms.includes(room)) {
      if (selectedRooms.length > 1) {
        setSelectedRooms(selectedRooms.filter((r) => r !== room));
      }
    } else {
      setSelectedRooms([...selectedRooms, room]);
    }
  };

  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      if (selectedStyles.length > 1) {
        setSelectedStyles(selectedStyles.filter((s) => s !== style));
      }
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!customerName || !phone || !address)) {
      alert('لطفاً نام، تلفن همراه و نشانی را وارد کنید.');
      return;
    }
    if (step === 2 && (selectedRooms.length === 0 || selectedStyles.length === 0)) {
      alert(isCurtain ? 'لطفاً حداقل یک فضا و یک سبک پارچه را انتخاب کنید.' : 'لطفاً حداقل یک فضا و یک مدل را انتخاب کنید.');
      return;
    }
    setStep((prev) => (prev + 1) as any);
  };

  const handlePayAndSubmit = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsSuccess(true);
      
      const isSatellite = selectedCityMetadata.isSatellite;
      const hubCityName = selectedCityMetadata.hubName;
      const orderProvince = selectedCityMetadata.province;

      const isBuyBoxAcceptedByCustomer = Boolean(suggestedVendor && preferredVendorOption === 'suggested_buy_box');

      const baseNotes = isSatellite 
        ? `[سفارش از شهر اقماری: ${city} (وابسته به کلان‌شهر ${hubCityName})] ${notes}`.trim()
        : notes;
      const fullNotes = isCurtain
        ? baseNotes
        : `[نوع خدمت: ${categoryLabel} | متراژ تقریبی: ${approxArea} متر مربع] ${baseNotes}`.trim();

      const newOrder: Partial<VisitRequest> = {
        customerName,
        phone,
        province: orderProvince,
        city,
        district,
        address,
        floorAndUnit,
        rooms: selectedRooms,
        serviceCategory,
        approximateWindows: approxWindows,
        approximateWidthMeters: approxWidth,
        preferredStyles: selectedStyles,
        preferredDate,
        timeSlot,
        notes: fullNotes,
        depositAmount: payableDeposit,
        discountCouponCode: appliedCoupon?.code,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        finalDepositPaid: payableDeposit,
        depositStatus: 'paid',
        status: 'bidding',
        reRouteCount: 0,
        isSatelliteOrder: isSatellite,
        hubCity: hubCityName,
        satelliteCityName: isSatellite ? city : undefined,
        distanceKmFromHub: selectedCityMetadata.distanceKm || (isSatellite ? 30 : undefined),
        isBuyBoxOrder: isBuyBoxAcceptedByCustomer,
        buyBoxVendorId: isBuyBoxAcceptedByCustomer ? suggestedVendor?.id : undefined,
        buyBoxVendorName: isBuyBoxAcceptedByCustomer ? suggestedVendor?.name : undefined,
        buyBoxAssignedAt: isBuyBoxAcceptedByCustomer ? Date.now() : undefined,
        buyBoxExpiresAt: isBuyBoxAcceptedByCustomer ? Date.now() + (buyBoxSettings?.acceptanceTimeoutMinutes || 15) * 60 * 1000 : undefined,
        buyBoxStatus: isBuyBoxAcceptedByCustomer ? 'pending_vendor_acceptance' : undefined,
        assignedVendorId: isBuyBoxAcceptedByCustomer ? suggestedVendor?.id : undefined,
        assignedVendorName: isBuyBoxAcceptedByCustomer ? suggestedVendor?.name : undefined,
        assignedVendorPhone: isBuyBoxAcceptedByCustomer ? suggestedVendor?.phone : undefined,
        assignedVendorRating: isBuyBoxAcceptedByCustomer ? suggestedVendor?.rating : undefined,
        selectedSwatches: !isCurtain ? undefined : selectedStyles.map((style, idx) => {
          const preset = FABRIC_SWATCH_PRESETS[style] || Object.values(FABRIC_SWATCH_PRESETS)[idx % Object.keys(FABRIC_SWATCH_PRESETS).length];
          return {
            ...preset,
            id: `sw-new-${Date.now()}-${idx}`,
          };
        }),
      };

      if (appliedCoupon && onUseDiscountCoupon) {
        onUseDiscountCoupon(appliedCoupon.code);
      }

      setTimeout(() => {
        onSubmitRequest(newOrder);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-stone-900">
              ثبت درخواست اعزام فروشگاه و کالیته به خانه
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                {categoryLabel}
              </span>
              <button
                type="button"
                onClick={() => { setServiceCategory(null); setStep(1); }}
                className="text-[11px] text-stone-500 hover:text-amber-800 underline underline-offset-2 cursor-pointer"
              >
                تغییر انتخاب
              </button>
            </div>
            <span className="text-xs text-stone-500">
              مرحله {step} از ۴: {step === 1 && 'اطلاعات تماس و آدرس'}
              {step === 2 && (isCurtain ? 'فضای پنجره‌ها و سبک کالیته' : `فضاها و مدل ${categoryLabel}`)}
              {step === 3 && 'زمان‌بندی مراجعه'}
              {step === 4 && 'پرداخت بیعانه و ثبت نهایی'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-stone-200 h-1.5">
          <div 
            className="bg-amber-700 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step 1: Customer Info & Address */}
        {step === 1 && (
          <div className="p-6 space-y-4 text-right">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                نام و نام خانوادگی خریدار:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثلاً: سارا میرزایی"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                شماره موبایل جهت هماهنگی کارشناس:
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثلاً: ۰۹۱۲۱۲۳۴۵۶۷"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg text-left font-mono focus:outline-amber-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  شهر محل سکونت:
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setCity(newCity);
                  }}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-amber-600 font-medium"
                >
                  <optgroup label="👑 کلان‌شهر تهران و شهرهای اقماری حومه">
                    <option value="تهران">تهران (کلان‌شهر اصلی - مناطق ۲۲ گانه)</option>
                    {selectableCityOptions.tehranSatellites.map((sat) => (
                      <option key={sat} value={sat}>
                        🛰️ {sat} (شهر اقماری تهران - سرویس‌دهی فعال)
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="👑 کلان‌شهر مشهد و شهرهای اقماری حومه">
                    <option value="مشهد">مشهد (کلان‌شهر اصلی - مناطق ۱۳ گانه)</option>
                    {selectableCityOptions.mashhadSatellites.map((sat) => (
                      <option key={sat} value={sat}>
                        🛰️ {sat} (شهر اقماری مشهد - سرویس‌دهی فعال)
                      </option>
                    ))}
                  </optgroup>

                  {selectableCityOptions.otherCities.length > 0 && (
                    <optgroup label="سایر کلان‌شهرها و استان‌ها">
                      {selectableCityOptions.otherCities.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} {c.isActive ? '✓ (سرویس‌دهی فعال)' : `(فاز ${c.phase} - به زودی)`}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">منطقه / محله:</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="مثلاً: نیاوران، پونک، فاز ۱..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            {/* Quick district suggestions from chosen city or satellite */}
            {selectedCityMetadata.districts && selectedCityMetadata.districts.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-stone-500 block">انتخاب سریع محله در {city}:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedCityMetadata.districts.slice(0, 7).map((dst, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDistrict(dst)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        district === dst
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {dst.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Satellite city linkage reassurance banner */}
            {selectedCityMetadata.isSatellite && (
              <div className="p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-950 leading-relaxed shadow-2xs animate-in fade-in">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-sm mt-0.5">
                  🛰️
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="font-black text-xs text-blue-900">
                      پوشش اعزام تخصصی به شهر اقماری {city}:
                    </span>
                    <span className="text-[10px] font-bold bg-blue-200/90 text-blue-900 px-2 py-0.5 rounded-full">
                      متصل به شبکه کلان‌شهر {selectedCityMetadata.hubName}
                    </span>
                    {selectedCityMetadata.distanceKm && (
                      <span className="text-[10px] font-mono bg-white/80 border border-blue-200 text-blue-800 px-1.5 py-0.5 rounded-md">
                        فاصله: ~{selectedCityMetadata.distanceKm} کیلومتر
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    {selectedCityMetadata.suburbNote || 
                      `شهر شما تحت پوشش رسمی شبکه اعزام کارشناس کلان‌شهر ${selectedCityMetadata.hubName} است. کارشناسان مجرب همراه با چمدان کامل کالیته‌های پارچه و ابزار اندازه‌گیری مستقیماً به منزل شما در ${city} اعزام خواهند شد.`}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                نشانی دقیق منزل:
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="نام خیابان، کوچه، پلاک..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                طبقه و واحد:
              </label>
              <input
                type="text"
                value={floorAndUnit}
                onChange={(e) => setFloorAndUnit(e.target.value)}
                placeholder="مثلاً: طبقه ۳، واحد ۹"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
              />
            </div>

            {/* Live Buy Box Suggestion Preview in Step 1 */}
            {suggestedVendor && (
              <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Crown className="w-5 h-5 text-amber-200 fill-amber-200" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                        پیشنهاد هوشمند بای‌باکس (سقف ۵۰٪)
                      </span>
                      <span className="text-xs font-black text-stone-900">{suggestedVendor.name}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      فروشگاه برگزیده روز با اولویت اعزام کارشناس و کالیته به محله {district || city} (امتیاز {suggestedVendor.rating}★)
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-white/90 px-2 py-1 rounded-xl border border-amber-200 shrink-0">
                  اولویت اعزام ✓
                </span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Rooms & Fabric preferences */}
        {step === 2 && (
          <div className="p-6 space-y-5 text-right">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                {isCurtain ? 'کدام فضاها نیاز به پرده دارند؟ (چند گزینه):' : `کدام فضاها نیاز به ${categoryLabel} دارند؟ (چند گزینه):`}
              </label>
              <div className="flex flex-wrap gap-2">
                {roomOptions.map((room) => (
                  <button
                    key={room}
                    type="button"
                    onClick={() => toggleRoom(room)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      selectedRooms.includes(room)
                        ? 'bg-amber-700 text-white font-bold border-amber-700'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>

            {isCurtain ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    تعداد تقریبی پنجره‌ها:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={approxWindows}
                    onChange={(e) => setApproxWindows(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    مجموع عرض حدودی پنجره‌ها (متر):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
                    value={approxWidth}
                    onChange={(e) => setApproxWidth(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono text-left"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  متراژ تقریبی (متر مربع):
                </label>
                <input
                  type="number"
                  min="1"
                  max="2000"
                  value={approxArea}
                  onChange={(e) => setApproxArea(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono text-left"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {isCurtain ? 'فروشگاه کدام آلبوم‌های کالیته پارچه را همراه بیاورد؟' : `فروشگاه کدام آلبوم‌های کالیته ${categoryLabel} را همراه بیاورد؟`}
              </label>
              <p className="text-[11px] text-stone-500 mb-2">
                {isCurtain ? 'فروشگاه منتخب بر اساس این کالیته‌ها چمدان نمونه پارچه‌های خود را آماده می‌کند:' : 'فروشگاه منتخب بر اساس این انتخاب‌ها نمونه‌ها و آلبوم‌های خود را آماده می‌کند:'}
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1">
                {styleOptions.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleStyle(st)}
                    className={`p-2 rounded-lg border text-xs text-right transition-colors ${
                      selectedStyles.includes(st)
                        ? 'bg-amber-50 border-amber-700 text-amber-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Date & Time Schedule */}
        {step === 3 && (
          <div className="p-6 space-y-5 text-right">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                روز ترجیحی جهت مراجعه کارشناس و کالیته:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['۱۴۰۳/۰۷/۱۲', '۱۴۰۳/۰۷/۱۳', '۱۴۰۳/۰۷/۱۴', '۱۴۰۳/۰۷/۱۵', '۱۴۰۳/۰۷/۱۶', '۱۴۰۳/۰۷/۱۷'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setPreferredDate(d)}
                    className={`p-2.5 rounded-xl border text-xs text-center transition-colors font-mono ${
                      preferredDate === d
                        ? 'bg-amber-700 text-white font-bold border-amber-700'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                بازه زمانی مناسب برای حضور در منزل:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {['۱۰:۰۰ الی ۱۳:۰۰', '۱۴:۰۰ الی ۱۷:۰۰', '۱۸:۰۰ الی ۲۱:۰۰'].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`p-2.5 rounded-xl border text-xs text-center transition-colors ${
                      timeSlot === slot
                        ? 'bg-amber-700 text-white font-bold border-amber-700'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Buy Box Preferred Vendor Suggestion Card (50% Quota Allocation) */}
            {suggestedVendor && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                      <Crown className="w-4 h-4 text-white fill-white" />
                    </span>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-amber-950 flex items-center gap-1.5">
                        <span>فروشگاه برگزیده و کارشناس ویژه روز (پیشنهاد هوشمند)</span>
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        برنده نشان خدمت‌رسانی ممتاز در شهر {city} با اولویت اعزام به محله {district}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-900 border border-amber-300">
                    تاییدیه اتحادیه صنف ✓
                  </span>
                </div>

                {/* Vendor details snippet */}
                <div className="p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
                      <Store className="w-5 h-5 text-amber-700" />
                    </span>
                    <div>
                      <strong className="text-stone-900 text-sm block font-extrabold">{suggestedVendor.name}</strong>
                      <span className="text-[11px] text-stone-500">مدیریت: {suggestedVendor.ownerName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 text-xs">
                    <span className="flex items-center gap-1 bg-amber-100 text-amber-950 px-2.5 py-1 rounded-lg font-bold font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                      <span>{suggestedVendor.rating}★ ({suggestedVendor.ratingCount} نظر)</span>
                    </span>
                    <span className="bg-stone-100 text-stone-700 px-2 py-1 rounded-lg font-medium text-[11px]">
                      سطح {suggestedVendor.tier}
                    </span>
                  </div>
                </div>

                {/* Option to accept suggestion or send to competitive hunting */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-stone-700 block">
                    نحوه انتخاب و اعزام کارشناس به منزل:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreferredVendorOption('suggested_buy_box')}
                      className={`p-2.5 rounded-xl border text-right transition-all flex items-start gap-2 cursor-pointer ${
                        preferredVendorOption === 'suggested_buy_box'
                          ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                          : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${preferredVendorOption === 'suggested_buy_box' ? 'text-amber-300' : 'text-stone-400'}`} />
                      <div>
                        <span className="font-bold text-xs block">اعزام مستقیم از این فروشگاه برگزیده</span>
                        <span className={`text-[10px] block ${preferredVendorOption === 'suggested_buy_box' ? 'text-amber-100' : 'text-stone-500'}`}>
                          تضمین اولویت حضور با کالیته‌های اصلی
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredVendorOption('competitive_hunting')}
                      className={`p-2.5 rounded-xl border text-right transition-all flex items-start gap-2 cursor-pointer ${
                        preferredVendorOption === 'competitive_hunting'
                          ? 'bg-stone-800 text-white border-stone-900 shadow-xs'
                          : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                        preferredVendorOption === 'competitive_hunting' ? 'border-amber-400' : 'border-stone-300'
                      }`}>
                        {preferredVendorOption === 'competitive_hunting' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                      </div>
                      <div>
                        <span className="font-bold text-xs block">انتشار در تابلوی رقابتی همکاران</span>
                        <span className={`text-[10px] block ${preferredVendorOption === 'competitive_hunting' ? 'text-stone-300' : 'text-stone-500'}`}>
                          انتخاب سریع‌ترین فروشگاه آماده اعزام در منطقه
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                توضیحات تکمیلی برای فروشگاه (اختیاری):
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلاً: پرده‌های قبلی نیاز به باز شدن دارند، یا سقف کاذب است..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-amber-600"
              />
            </div>
          </div>
        )}

        {/* Step 4: Deposit payment & Guarantee */}
        {step === 4 && (
          <div className="p-6 space-y-5 text-right">
            {isSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-stone-900">سفارش با موفقیت ثبت شد!</h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  {suggestedVendor && preferredVendorOption === 'suggested_buy_box'
                    ? `بیعانه ${formatDepositToman(payableDeposit)}ی پرداخت شد و سفارش با نشان اولویت اختصاصی بای‌باکس به فروشگاه «${suggestedVendor.name}» پیشنهاد گردید.`
                    : `بیعانه ${formatDepositToman(payableDeposit)}ی پرداخت شد و سفارش وارد تابلوی رقابتی فروشگاه‌های پرده شد. به زودی سریع‌ترین فروشگاه هماهنگی را با شما انجام می‌دهد.`}
                </p>
              </div>
            ) : (
              <>
                {/* Order Summary & Dispatch Mode */}
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-stone-700">
                    <span>مقصد اعزام کارشناس:</span>
                    <span className="font-bold text-stone-900">{city} - {district}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span>فروشگاه مجری:</span>
                    {suggestedVendor && preferredVendorOption === 'suggested_buy_box' ? (
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        <span>فروشگاه برگزیده روز ({suggestedVendor.name})</span>
                      </span>
                    ) : (
                      <span className="font-medium text-stone-800">
                        انتشار در تابلوی رقابتی شکار همکاران
                      </span>
                    )}
                  </div>
                </div>

                {/* Discount & Loyalty Coupon Section */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-amber-600" />
                      <span>کد تخفیف دارید؟</span>
                    </span>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponSuccessMessage(null);
                          setCouponError(null);
                          setCouponCodeInput('');
                        }}
                        className="text-[11px] text-red-600 hover:text-red-700 font-bold cursor-pointer"
                      >
                        حذف تخفیف ✕
                      </button>
                    )}
                  </div>

                  {/* Personal Loyalty Coupons for this Customer */}
                  {!appliedCoupon && eligibleCouponsForUser.length > 0 && (
                    <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-lg space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>کد تخفیف وفاداری خرید موفق قبلی برای شما:</span>
                      </span>
                      {eligibleCouponsForUser.slice(0, 2).map((cp) => (
                        <div key={cp.id} className="flex items-center justify-between bg-white p-2 rounded-md border border-amber-200 text-xs">
                          <div>
                            <span className="font-mono font-bold text-amber-900 ml-1.5">{cp.code}</span>
                            <span className="text-[11px] text-stone-600">
                              ({cp.discountType === 'percentage' 
                                ? `${cp.discountValue}٪ ${cp.maxDiscountAmount ? `تا سقف ${cp.maxDiscountAmount.toLocaleString('fa-IR')} تومان` : ''}` 
                                : `${cp.discountValue.toLocaleString('fa-IR')} تومان`})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon(cp.code)}
                            className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            اعمال کد
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Coupon Code Input */}
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => {
                          setCouponCodeInput(e.target.value.toUpperCase());
                          setCouponError(null);
                        }}
                        placeholder="کد تخفیف را وارد کنید (مثلاً: WELCOME-150 یا LOYAL-9281)"
                        className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono text-left focus:outline-amber-600 uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon(couponCodeInput)}
                        className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        بررسی و اعمال
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">
                          کد تخفیف <span className="font-mono">{appliedCoupon.code}</span> اعمال گردید!
                        </div>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          {couponSuccessMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{couponError}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300" data-testid="secure-payment-banner">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-sm text-emerald-900">{SECURE_PAYMENT_SLOGAN}</div>
                    <p className="text-[11px] text-emerald-900/80 leading-relaxed mt-0.5">{SECURE_PAYMENT_ASSURANCE}</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-700">
                    <span>مبلغ بیعانه مصوب اتحادیه:</span>
                    <span className="font-mono">{formatDepositToman(baseDepositAmount)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                      <span>تخفیف ({appliedCoupon?.code}){isCapped ? ' (سقف لحاظ شد)' : ''}:</span>
                      <span className="font-mono">-{discountAmount.toLocaleString('fa-IR')} تومان</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-sm font-black text-amber-950">
                    <span>مبلغ نهایی پرداخت بیعانه:</span>
                    <span className="text-base font-mono">{payableDeposit.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-normal">
                    طبق قانون پلتفرم دراپینو، این مبلغ به عنوان جدیت سفارش پرداخت می‌شود و 
                    <strong className="text-stone-900 font-bold"> دقیقا از فاکتور خرید پرده شما کسر خواهد شد</strong>.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold text-stone-700">شبیه‌ساز پرداخت اینترنتی شتاب:</div>
                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-stone-600">
                      <span>درگاه پرداخت امن:</span>
                      <span className="font-semibold text-stone-800">شاپرک / به‌پرداخت</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600">
                      <span>شماره کارت پیش‌فرض:</span>
                      <span className="font-mono tabular-nums">{cardNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600">
                      <span>پذیرنده:</span>
                      <span className="font-bold text-stone-900">سامانه دراپینو (کد ۲۹۸۴)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    ضمانت دراپینو: در صورت عدم توافق با فروشگاه اول، سفارش بدون کسر وجه برای فروشگاه دوم ارسال خواهد شد.
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {!isSuccess && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                <ArrowRight className="w-4 h-4" />
                <span>مرحله قبل</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
              >
                <span>مرحله بعد</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handlePayAndSubmit}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-md disabled:opacity-50 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isProcessingPayment 
                    ? 'در حال اتصال به شاپرک...' 
                    : payableDeposit === 0 
                    ? 'ثبت نهایی سفارش (تخفیف ۱۰۰٪ - رایگان)' 
                    : `پرداخت ${payableDeposit.toLocaleString('fa-IR')} تومان و ثبت`}
                </span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
