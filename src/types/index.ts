export type UserRole = 'customer' | 'vendor' | 'wholesaler' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  password?: string;
  email?: string;
  avatarUrl?: string;
  province?: string;
  city: string;
  district: string;
  address: string;
  floorAndUnit?: string;
  postalCode?: string;
  latitude?: number; // موقعیت انتخاب‌شده روی نقشه هنگام ثبت‌نام
  longitude?: number;
  notes?: string;

  // Vendor specific fields
  storeName?: string;
  ownerName?: string;
  landlinePhone?: string;
  nationalCode?: string;
  shebaNumber?: string;
  coveredDistricts?: string[];
  coveredOtherCities?: string[]; // سایر شهرهای تحت پوشش (شهرهای اقماری، شهرک‌ها و حومه)
  bio?: string;
  vendorId?: string; // links to vendor in vendors list
  tier?: 'طلایی' | 'نقره‌ای' | 'برنز';
  isVerified?: boolean;

  // Wholesaler (بنکدار و تامین‌کننده عمده پارچه و ملزومات) specific fields
  companyName?: string;
  warehouseCity?: string;
  warehouseAddress?: string;
  wholesalerCategories?: string[]; // مخمل، حریر، کتان، زبرا، ریل و ملزومات
  minimumOrderRolls?: number;
  businessLicenseNumber?: string;
  wholesaleLicenseImageUrl?: string;

  createdAt: string;
}

export interface WholesaleFabricItem {
  id: string;
  wholesalerId: string;
  wholesalerName: string;
  wholesalerPhone: string;
  title: string;
  fabricCode: string;
  category: 'مخمل' | 'حریر و تور' | 'زبرا و شید' | 'کتان و گونی‌بافت' | 'پتینه و ژاکارد' | 'ملزومات و ریل';
  origin: string; // ترکیه، ایران، چین، اسپانیا، ایتالیا
  pricePerMeter: number; // قیمت عمده هر متر به تومان
  pricePerRoll: number; // قیمت هر طاقه به تومان
  rollMeters: number; // متراژ هر طاقه (مثلا ۵۰ متر)
  availableRolls: number; // موجودی طاقه در انبار
  minOrderRolls: number; // حداقل سفارش (طاقه)
  imageUrl: string;
  description: string;
  isAvailable: boolean;
  city: string;
  createdAt: string;
}

export interface WholesaleOrder {
  id: string;
  orderNumber: string;
  wholesalerId: string;
  wholesalerName: string;
  vendorId: string;
  vendorStoreName: string;
  vendorPhone: string;
  vendorCity: string;
  fabricId: string;
  fabricTitle: string;
  fabricCode: string;
  requestedRolls: number;
  totalMeters: number;
  pricePerMeter: number;
  totalAmount: number;
  status: 'pending' | 'quoted' | 'approved' | 'shipped' | 'cancelled';
  notes?: string;
  quotedPrice?: number;
  trackingCode?: string;
  createdAt: string;
}

export type OrderStatus =
  | 'bidding'          // در انتظار قبول توسط فروشگاه‌ها (مزایده سفارش)
  | 'assigned'         // واگذار شده به فروشگاه (فروشگاه در حال اعزام)
  | 'visited'          // بازدید انجام شد و فاکتور صادر گردید
  | 'approved'         // فاکتور توسط مشتری تایید شد و در حال دوخت است
  | 're_routed'        // مشتری درخواست مقایسه / فروشگاه جایگزین کرده و مجدد مزایده شده
  | 'installed'        // نصب شده و سفارش تکمیل است
  | 'cancelled';       // لغو شده

export interface InvoiceItem {
  id: string;
  title: string;
  fabricCode: string;
  fabricGrade?: '1' | '1.5' | '2' | '3'; // درجه کیفی پارچه: ۱، ۱.۵، ۲ یا ۳
  meters: number;
  unitPrice: number; // قیمت هر متر به تومان
  total: number;
}

export interface CurtainInvoice {
  invoiceNumber: string;
  items: InvoiceItem[];
  tailoringFee: number;       // هزینه دوخت
  hardwareAndTrackFee: number; // هزینه ریل و اکسسوری
  installationFee: number;     // هزینه نصب
  subtotal: number;
  depositDeduction: number;   // کسر بیعانه اولیه مشتری
  discountCouponCode?: string; // کد تخفیف اعمال شده
  discountAmount?: number;     // مبلغ تخفیف کسر شده با رعایت سقف مجاز
  finalPayable: number;
  notes?: string;
  issuedAt: string;
  status: 'issued' | 'accepted' | 'rejected_for_comparison';
  vendorId: string;
  vendorName: string;
  vendorSheba?: string;            // شماره شبای فروشنده (از اطلاعات فروشگاه)
  customerName?: string;           // نام مشتری جهت درج در متن تعهد
  deliveryInstallDate?: string;    // تاریخ تحویل و نصب (شمسی)
  customerPrepayment?: number;     // مبلغ پیش‌پرداخت مشتری (۶۰ تا ۸۰ درصد مبلغ قابل پرداخت)
  customerPrepaymentPercent?: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  actor: string;
  type: 'creation' | 'assignment' | 'visit' | 'invoice' | 'comparison' | 'success' | 'note' | 'assigned' | 'approved' | 'invoice_issued' | 'deposit_paid';
}

export interface VendorReview {
  id: string;
  orderId: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  rating: number; // 1 to 5 stars
  criteria: {
    fabricQuality: number; // 1-5 کیفیت پارچه و دوخت
    specialistBehavior: number; // 1-5 خوش‌قولی و رفتار کارشناس
    installationPrecision: number; // 1-5 دقت و تمیزی نصب
    priceFairness: number; // 1-5 تناسب قیمت با کیفیت
  };
  comment: string;
  date: string;
  time?: string;
  wouldRecommend: boolean;
  tags?: string[];
  vendorReply?: {
    text: string;
    date: string;
  };
}

export interface SelectedSwatchItem {
  id: string;
  title: string;
  fabricCode: string;
  category: string;
  colorName: string;
  colorHex?: string;
  imageUrl: string;
  texture?: string;
  origin?: string;
  grammage?: string;
  lightBlockPercentage?: number;
  suggestedFor?: string;
  description?: string;
  isConfirmedBySpecialist?: boolean;
}

export interface VisitRequest {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  floorAndUnit?: string;
  rooms: string[];
  serviceCategory?: ServiceCategoryId; // نوع خدمت انتخابی مشتری (پیش‌فرض: پرده)
  approximateWindows: number;
  approximateWidthMeters: number;
  preferredStyles: string[];
  preferredDate: string;
  timeSlot: string;
  notes?: string;
  depositAmount: number; // e.g. 350,000 Toman
  depositStatus: 'paid' | 'pending';
  claimCost?: number; // مبلغ کسر از کیف پول فروشگاه جهت شکار سفارش (مثلا ۵۵۰,۰۰۰ تومان)
  status: OrderStatus;
  isBuyBoxOrder?: boolean;
  buyBoxVendorId?: string;
  buyBoxVendorName?: string;
  buyBoxAssignedAt?: number;
  buyBoxExpiresAt?: number;
  buyBoxStatus?: 'pending_vendor_acceptance' | 'accepted' | 'timed_out_to_hunting' | 'fallback_to_hunting' | 'expired_fallback';
  
  // Hub & Satellite linkage
  isSatelliteOrder?: boolean; // سفارش از شهر فرعی/اقماری و حومه
  hubCity?: string; // شهر اصلی بالادست (مثلاً مشهد برای گلبهار، نیشابور، چناران، کلات، روستای لکلک)
  satelliteCityName?: string; // نام شهر یا روستای اقماری
  distanceKmFromHub?: number; // فاصله تقریبی از شهر قطب به کیلومتر

  // Discount & Loyalty Coupon details
  discountCouponCode?: string; // کد تخفیف اعمال شده
  discountAmount?: number; // مبلغ تخفیف کسر شده به تومان
  finalDepositPaid?: number; // مبلغ نهایی بیعانه پرداختی پس از کسر تخفیف
  
  assignedVendorId?: string;
  assignedVendorName?: string;
  assignedVendorPhone?: string;
  assignedVendorRating?: number;
  assignedAt?: string;
  reRouteCount: number; // تعداد دفعات درخواست فروشگاه دوم یا مقایسه
  reRouteReason?: string;
  invoice?: CurtainInvoice;
  customerReview?: VendorReview;
  selectedSwatches?: SelectedSwatchItem[];
  timeline: TimelineEvent[];
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  vendorId: string;
  type:
    | 'deposit'
    | 'order_claim_fee'
    | 'refund'
    | 'sponsored_ladder_fee'
    | 'buy_box_reservation_fee'
    | 'penalty_no_invoice' // جریمه عدم صدور فاکتور
    | 'penalty_custom'     // جریمه ریالی (موارد خاص)
    | 'penalty_refund';   // بازگشت جریمه توسط مدیر
  amount: number;
  description: string;
  date: string;
  time: string;
  orderId?: string;
  orderNumber?: string;
  balanceAfter: number;
}

export interface MasterFabricCatalog {
  id: string;
  name: string;
  code: string;
  /** نام دسته از فهرست واحد دسته‌بندی کالیته‌ها */
  category: string;
  description: string;
  suggestedUnitPrice: number;
  /** رنج قیمت نمایشی برای مشتری (تومان) */
  priceMin?: number;
  priceMax?: number;
  texture: string;
  origin: string;
  colorsCount: number;
  imageUrl: string;
  /** گالری اختیاری */
  images?: string[];
  primaryImageIndex?: number;
  isAvailable: boolean;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  published: boolean;
  showInHeaderNav: boolean;
  showInFooterNav: boolean;
  updatedAt: string;
  createdAt?: string;
}

export type ThemeColorPalette = 'amber' | 'emerald' | 'indigo' | 'rose' | 'slate';

export interface OperationalCity {
  id: string;
  name: string;
  province: string;
  isActive: boolean; // فعال بودن دریافت سفارش برای مشتریان
  isPartnerRegistrationActive: boolean; // فعال بودن ثبت نام همکار
  districts: string[];
  phase: number;
  launchDate?: string;
  statusNote?: string;

  // Hub & Satellite Linking (سیستم اتصال شهرهای اصلی و اقماری)
  isHub?: boolean; // آیا این شهر یک کلان‌شهر قطب (شهر اصلی) است؟ (مانند مشهد، تهران)
  parentHubCityId?: string; // شناسه شهر قطب متصل (مثلاً مشهد برای گلبهار، نیشابور، چناران، کلات، روستای لکلک)
  parentHubCityName?: string; // نام شهر قطب متصل (مثلاً 'مشهد')
  satelliteCities?: string[]; // لیست شهرهای اقماری، فرعی و روستاهای تابعه متصل به این قطب
  otherCoveredCities?: string[]; // سایر شهرهای تحت پوشش (شهرهای اقماری، شهرک‌ها و روستاهای تحت پوشش این مرکز)
  forwardOrdersToHub?: boolean; // آیا سفارشات این شهر فرعی به تابلوی شکار شهر اصلی ارسال شود؟ (پیش‌فرض: true)
  distanceKmFromHub?: number; // فاصله تقریبی از شهر اصلی (کیلومتر)
  suburbDeliveryAllowanceNote?: string; // توضیحات تکمیلی ایاب‌وذهاب یا شرایط اعزام

  // بیعانه مشتری در این شهر (تومان). اگر خالی باشد، مبلغ شهر قطب و در نهایت بیعانه پیش‌فرض سراسری استفاده می‌شود.
  depositAmount?: number;
}

export interface VendorCustomCatalogSubmission {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  catalogName?: string;
  category: string;
  description: string;
  texture?: string;
  origin?: string;
  /** تصویر اصلی (سازگاری با قبل) */
  imageUrl?: string;
  /** گالری تصاویر کالیته (حداکثر ۱۰) */
  images?: string[];
  /** ایندکس تصویر اصلی در آرایه images */
  primaryImageIndex?: number;
  /** رنج قیمت پیشنهادی برای مشتری (تومان) */
  priceMin?: number;
  priceMax?: number;
  submittedAt: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  adminFeedback?: string;
  moderatorFeedback?: string;
  approvedAt?: string;
}

export interface SiteThemeSettings {
  siteName: string;
  /** لوگوی سایت (آدرس یا Data URL)؛ اگر خالی باشد حرف اول نام سایت نمایش داده می‌شود */
  logoUrl?: string;
  /** نمایش نام سایت کنار لوگو */
  logoShowName?: boolean;
  /** آیکن تب مرورگر (favicon) */
  faviconUrl?: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadgeText?: string;
  heroBadge?: string;
  heroImageUrl: string;
  primaryColor: ThemeColorPalette;
  borderRadius: 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-none' | string;
  fontFamily: 'Vazirmatn' | 'Sahel' | 'Shabnam' | string;
  consultationDepositAmount?: number;
  customerDepositFee?: number;
  vendorClaimFee?: number;
  vendorLeadFee?: number;
  supportPhone: string;
  supportEmail: string;

  // Header & Navigation CMS
  headerTopNotice?: string;
  showHeaderTopNotice?: boolean;
  headerButtonText?: string;
  headerCtaText?: string;
  headerPhone?: string;
  headerShowEstimatorButton?: boolean;
  headerShowAuctionBadge?: boolean;

  // Homepage Sections CMS
  howItWorksTitle?: string;
  howItWorksSubtitle?: string;
  catalogSectionTitle?: string;
  catalogSectionSubtitle?: string;
  unionNoticeBanner?: string;

  homepageSections?: {
    showHero: boolean;
    showHowItWorks: boolean;
    showCatalogSection: boolean;
    showBlogSection: boolean;
    showTrustBadges: boolean;
    howItWorksTitle?: string;
    howItWorksSubtitle?: string;
    catalogSectionTitle?: string;
    catalogSectionSubtitle?: string;
    trustSectionText?: string;
    unionGuaranteeText?: string;
  };

  // Footer CMS
  footerAboutText?: string;
  footerAddress?: string;
  footerCopyright?: string;
  footerWorkHours?: string;
  footerWorkingHours?: string;
  footerPhone?: string;
  footerUnionNotice?: string;
  footerEmergencyPhone?: string;
}

// رسته‌های کاری سامانه: پرده / کاغذ دیواری / کفپوش و پارکت
export type ServiceCategoryId = 'curtain' | 'wallpaper' | 'flooring';

export interface CurtainVendor {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  nationalCode?: string;
  businessLicenseImageUrl?: string;
  nationalCardImageUrl?: string;
  verificationStatus: 'verified' | 'pending_verification' | 'rejected';
  verificationDate?: string;
  joinedDate?: string;
  rejectionReason?: string;
  adminVerificationNotes?: string;
  verificationNotes?: string;
  city: string;
  coveredDistricts: string[];
  coveredOtherCities?: string[]; // سایر شهرهای تحت پوشش که این فروشگاه خدمات و اعزام ارائه می‌دهد
  categories?: ServiceCategoryId[]; // رسته‌های فعالیت (یک یا چند مورد)؛ خالی = فقط پرده
  rating: number;
  ratingCount: number;
  completedVisits: number;
  successfulOrders: number;
  isVerified: boolean;
  tier: 'طلایی' | 'نقره‌ای' | 'برنز';
  sampleCatalogs: string[];
  availableCatalogIds?: string[];
  customCatalogs?: string[];
  address: string;
  walletBalance: number;
  transactions?: WalletTransaction[];
  reviews?: VendorReview[];
  isPromotedAd?: boolean;
  promotedAt?: number;
  promotedExpiresAt?: number; // Valid for 1 month (30 days)
  promotedFeePaid?: number;
  promotedLadderPosition?: number;
  portfolio?: VendorPortfolioItem[];
  /** وضعیت گیمیفیکیشن و مراحل پنل فروشنده */
  gamification?: VendorGamificationState;
  /** نصاب‌های فروشگاه (حداکثر ۵ نفر) */
  installers?: VendorInstaller[];
}

/** پیشرفت وظایف و امتیاز فروشنده */
export interface VendorGamificationState {
  docsSubmittedAt?: string;
  catalogsTaskDone?: boolean;
  portfolioTaskDone?: boolean;
  portfolioSkipped?: boolean;
  installersTaskDone?: boolean;
  /** basic = ۲ شکار، premium = ۴ شکار */
  walletChargePackage?: 'none' | 'basic' | 'premium';
  ladderDone?: boolean;
  ladderSkipped?: boolean;
  firstThreeOrdersDone?: boolean;
  performancePoints?: number;
  lastTierEvaluatedAt?: string;
}

export interface VendorInstaller {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  nationalCode: string;
  nationalCardImageUrl: string;
}

export interface VendorPortfolioItem {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  aspectRatio?: string; // Standard 1200x800 px (3:2)
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface CitySponsoredAdRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  city: string;
  promotedAt: number;
  promotedAtPersian: string;
  feePaid: number;
  ladderRank: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  /** پاراگراف‌های ساده (سازگاری با قبل) */
  content: string[];
  /** محتوای HTML ویرایشگر حرفه‌ای */
  contentHtml?: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  imageUrl: string;
  featured?: boolean;
  /** سئو */
  focusKeyword?: string;
  secondaryKeywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  seoScore?: number;
  status?: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  /** تاریخ باز‌نشر برنامه‌ریزی‌شده (ISO) */
  republishAt?: string;
  lastRepublishedAt?: string;
  /** اسلاگ‌های قبلی برای ریدایرکت ۳۰۱ */
  previousSlugs?: string[];
  canonicalSlug?: string;
}

export interface CurtainStyleGuide {
  id: string;
  title: string;
  persianCategory: string;
  description: string;
  features: string[];
  fabricSuggestions: string[];
  priceRange: string;
  imageUrl: string;
}

export type NotificationType = 
  | 'new_request'     // ثبت درخواست جدید مشتری
  | 'order_assigned'  // ارجاع سفارش به فروشنده و اعزام کارشناس
  | 'order_approved'  // تایید نهایی سفارش توسط مشتری و شروع دوخت
  | 'new_message'     // پیام‌های جدید بین مشتری و فروشنده
  | 'special_offer';   // اعلام پیشنهادات ویژه و تخفیف‌ها

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // Persian formatted time/date
  createdAt: number; // Date.now()
  isRead: boolean;
  targetRole?: UserRole | 'all';
  orderId?: string;
  orderNumber?: string;
  linkTab?: string;
  actionLabel?: string;
  metadata?: {
    vendorName?: string;
    customerName?: string;
    amount?: number;
    discountPercent?: number;
    offerCode?: string;
    senderRole?: 'customer' | 'vendor' | 'system';
  };
}

export interface NotificationPreferences {
  enableSound: boolean;
  enableInAppToast: boolean;
  enableBrowserPush: boolean;
  enableSmsSimulation: boolean;
  categories: {
    new_request: boolean;
    order_assigned: boolean;
    order_approved: boolean;
    new_message: boolean;
    special_offer: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // e.g. "23:00"
    endTime: string;   // e.g. "08:00"
  };
}

export interface OrderMessage {
  id: string;
  orderId: string;
  orderNumber?: string;
  senderRole: 'customer' | 'vendor';
  senderName: string;
  text: string;
  timestamp: string;
  createdAt: number;
}

export type TicketType = 'complaint' | 'support';

export type TicketCategory =
  | 'overpricing_discrepancy'       // گران‌فروشی و مغایرت با نرخ مصوب اتحادیه
  | 'fabric_quality_mismatch'       // عدم تطابق کالیته مشاهده شده با پارچه تحویلی
  | 'tailoring_installation_defect' // ایراد در دوخت یا نقص در نصب
  | 'delay_unpunctuality'           // تاخیر و عدم پایبندی به زمان‌بندی
  | 'unprofessional_behavior'       // رفتار نامناسب کارشناس یا نصاب
  | 'invoice_refusal'               // عدم ارائه یا امتناع از صدور فاکتور رسمی سیستمی
  | 'fabric_consultation'           // مشاوره در انتخاب جنس، رنگ و سبک پارچه
  | 'deposit_refund_query'          // پیگیری بیعانه و امور مالی و بازگشت وجه
  | 'order_tracking'                // پیگیری وضعیت پیشرفت سفارش
  | 'general_support';              // سایر امور پشتیبانی و راهنمایی سامانه

export type TicketStatus = 
  | 'pending'           // در انتظار بررسی
  | 'investigating'     // در حال رسیدگی کارشناسی
  | 'referred_to_union' // ارجاع به هیئت بازرسی و داوری اتحادیه
  | 'answered'          // پاسخ داده شده
  | 'resolved'          // حل و فصل شده
  | 'closed';           // مختومه

export type TicketPriority = 'normal' | 'important' | 'urgent';

export interface TicketAttachment {
  id: string;
  name: string;
  size?: string;
  url: string;
  type: 'image' | 'document' | 'audio';
}

export interface TicketMessage {
  id: string;
  senderRole: 'customer' | 'admin' | 'support' | 'union_inspector';
  senderName: string;
  message: string;
  attachments?: TicketAttachment[];
  timestamp: string;
  createdAt: number;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string; // e.g. TCK-9104
  type: TicketType;     // complaint (شکایت از فروشنده) | support (پشتیبانی عمومی)
  category: TicketCategory;
  categoryLabel: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;

  // Customer info
  customerId: string;
  customerName: string;
  customerPhone: string;

  // Targeted vendor & order (for complaints or order-specific tickets)
  targetVendorId?: string;
  targetVendorName?: string;
  orderId?: string;
  orderNumber?: string;

  // Evidence and attachments
  attachments: TicketAttachment[];

  // Conversation history
  messages: TicketMessage[];

  // Union Arbitration
  unionCaseNumber?: string;
  unionArbitrationNotes?: string;

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  autoClosedAt?: string;
  autoClosedReason?: string;
  lastExpertReplyTimestamp?: number;
}

// ==========================================
// BUY BOX SPECIFICATIONS & INTERFACES
// ==========================================

export type BuyBoxReservationStatus = 
  | 'reserved'   // رزرو شده و پرداخت شده برای روز آینده
  | 'active'     // فعال در روز جاری (دریافت تا ۵۰٪ سفارشات)
  | 'completed'  // پایان یافته پس از اتمام روز
  | 'cancelled'; // لغو شده و مسترد شده

export interface BuyBoxReservation {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  vendorCity: string;
  coveredDistricts: string[];
  vendorTier: 'طلایی' | 'نقره‌ای' | 'برنز';
  vendorRating: number;
  date: string; // تاریخ شمسی e.g. "۱۴۰۳/۰۷/۱۵"
  dateIso: string; // تاریخ میلادی برای تطبیق دقیق e.g. "2026-09-30"
  pricePaid: number;
  status: BuyBoxReservationStatus;
  ordersReceivedCount: number;
  ordersAcceptedCount: number;
  ordersExpiredCount: number;
  maxDailyOrdersCap?: number;
  reservedAt: string;
  paymentTransactionId?: string;
  notes?: string;
}

export interface BuyBoxCityPricing {
  cityName: string;
  customDailyPrice: number;
  isActive: boolean;
}

export interface BuyBoxSettings {
  isEnabled: boolean; // فعال/غیرفعال بودن سراسری سیستم بای‌باکس
  dailyPrice: number; // قیمت رزرو یک روز بای‌باکس به تومان (پیش‌فرض: ۱,۲۰۰,۰۰۰ تومان)
  weekendPrice?: number; // قیمت روزهای آخر هفته/پیک (پنجشنبه و جمعه)
  maxDailyPercentage: number; // سقف سهم روزانه بای‌باکس از کل سفارشات (حداکثر ۵۰٪ طبق قانون)
  acceptanceTimeoutMinutes: number; // مهلت زمانی فروشنده جهت قبول سفارش پیش از ارجاع به شکار (پیش‌فرض: ۱۵ دقیقه)
  maxMonthlyDaysPerVendor: number; // سقف مجاز روزهای رزرو در هر ماه برای هر فروشگاه جهت جلوگیری از انحصار (پیش‌فرض: ۴ روز)
  eligibleTiers: ('طلایی' | 'نقره‌ای' | 'برنز')[]; // سطوح مجاز فروشندگان جهت رزرو
  minRating: number; // حداقل امتیاز رضایت مشتریان (مثلاً ۴.۲ از ۵)
  minCompletedOrders: number; // حداقل تعداد سفارشات موفق قبلی
  autoAssignEnabled: boolean; // تخصیص مستقیم ۵۰٪ سفارشات واجد شرایط به برنده بای‌باکس
  cityPricings?: BuyBoxCityPricing[]; // تنظیم نرخ به تفکیک شهرهای تحت پوشش
  refundPolicyText?: string; // متن قوانین لغو و بازگشت وجه
}

export interface DiscountCoupon {
  id: string;
  code: string; // e.g. "LOYALTY-9821", "VIP-TEHRAN", "WELCOME-200"
  title: string; // e.g. "تخفیف وفاداری خرید موفق قبلی"
  description?: string;
  discountType: 'percentage' | 'fixed'; // درصدی یا مبلغ ثابت
  discountValue: number; // مثلاً ۲۰ درصد یا ۱۵۰,۰۰۰ تومان
  maxDiscountAmount: number; // سقف تخفیف (حداکثر تخفیف مجاز به تومان)
  minOrderAmount?: number; // حداقل مبلغ سفارش
  appliesTo: 'deposit' | 'invoice' | 'both'; // قابل اعمال روی بیعانه ویزیت، فاکتور نهایی یا هر دو
  assignedCustomerId?: string; // در صورت اختصاص به مشتری خاص
  assignedCustomerName?: string;
  assignedCustomerPhone?: string;
  isAutoGenerated: boolean; // آیا به صورت خودکار پس از خرید موفق صادر شده؟
  triggerOrderId?: string; // سفارش قبلی که باعث صدور این تخفیف شد
  usedCount: number;
  usageLimit: number; // حداکثر دفعات مجاز استفاده (مثلاً ۱ بار برای کدهای شخصی)
  expiresAt?: string; // تاریخ انقضا به شمسی
  isActive: boolean;
  createdAt: string;
}


/* ---------------------------- پرداخت امن (صندوق امانی) ---------------------------- */

/** نوع پرداخت امن: بیعانه مشاوره، پیش‌پرداخت فاکتور، مانده تسویه (۲۴ تا ۴۸ ساعت قبل از نصب) */
export type EscrowKind = 'deposit' | 'prepayment' | 'final';

/**
 * held        = حالت ذخیره: مشتری پرداخت کرده ولی هنوز تحویل کار را تایید نکرده (وجه نزد دراپینو امانت است)
 * released    = برداشت آزاد: تحویل کار تایید شده و فروشگاه می‌تواند درخواست برداشت بدهد
 * withdrawing = درخواست برداشت ثبت شده و در حال واریز به شبای فروشگاه (۲۴ تا ۷۲ ساعت)
 * paid_out    = به حساب شبای فروشگاه واریز شده
 */
export type EscrowStatus = 'held' | 'released' | 'withdrawing' | 'paid_out';

export interface EscrowPayment {
  id: string;
  orderId: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  customerName: string;
  kind: EscrowKind;
  amount: number;
  paidAt: string;
  paidTime: string;
  trackingCode: string;
  status: EscrowStatus;
  releasedAt?: string;
  releasedBy?: 'customer' | 'admin';
  withdrawalId?: string;
}

export interface EscrowWithdrawal {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  paymentIds: string[];
  sheba: string;
  requestedAt: string;
  requestedTime: string;
  requestedTs: number;
  status: 'processing' | 'paid';
  paidAt?: string;
  bankTrackingCode?: string;
}

// ==========================================
// JOB APPLICATIONS / استخدام در دراپینو
// ==========================================

export type JobDepartment = 'بازرگانی' | 'حسابداری' | 'فنی' | 'اداری';

export type JobApplicationStatus = 'new' | 'reviewing' | 'interview' | 'accepted' | 'rejected';

export interface JobApplication {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  department: JobDepartment;
  education?: string;
  experienceYears?: string;
  coverLetter?: string;
  resumeFileName: string;
  resumeDataUrl: string; // base64 PDF
  resumeSize?: string;
  status: JobApplicationStatus;
  adminNotes?: string;
  createdAt: string;
  createdAtTs: number;
  updatedAt: string;
}
