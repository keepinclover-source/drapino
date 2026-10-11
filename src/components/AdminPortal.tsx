import React, { useState } from 'react';
import { 
  VisitRequest, 
  CurtainVendor, 
  BlogPost, 
  OrderStatus, 
  MasterFabricCatalog, 
  CustomPage, 
  SiteThemeSettings,
  OperationalCity,
  VendorCustomCatalogSubmission,
  SupportTicket,
  TicketStatus,
  VendorPortfolioItem,
  BuyBoxSettings,
  BuyBoxReservation,
  DiscountCoupon
} from '../types';
import { 
  ShieldCheck, 
  BarChart3, 
  Users, 
  Store, 
  Receipt, 
  Repeat, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Plus, 
  Search, 
  Filter,
  DollarSign,
  TrendingUp,
  Settings,
  Bell,
  Sparkles,
  Send,
  Palette,
  Layers,
  Globe,
  FileEdit,
  Trash2,
  Eye,
  Check,
  Save,
  Image as ImageIcon,
  Type,
  LayoutTemplate,
  PhoneCall,
  CheckSquare,
  Square,
  MapPin,
  Building2,
  ShieldAlert,
  FileCheck,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Navigation,
  PanelBottom,
  SlidersHorizontal,
  XCircle,
  ExternalLink,
  Paperclip,
  Clock,
  Crown,
  X,
  Tag,
  Gift,
  Percent,
  Copy,
  Download,
  Briefcase
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { EditOrderModal } from './EditOrderModal';
import { EditVendorModal } from './EditVendorModal';
import { EditMasterCatalogModal } from './EditMasterCatalogModal';
import { AdminCatalogStyles } from './AdminCatalogStyles';
import { AdminCatalogCategories } from './AdminCatalogCategories';
import { AdminBlogEditor } from './AdminBlogEditor';
import type { BlogCategory } from '../types';
import { DEFAULT_BLOG_CATEGORIES, slugifyFa } from '../utils/blogSeo';
import type { UnifiedCatalogCategory } from '../utils/catalogCategories';
import { AdminEscrow } from './AdminEscrow';
import type { EscrowPayment, EscrowWithdrawal, JobApplication, JobApplicationStatus } from '../types';
import { readImageFile } from '../utils/imageUpload';
import type { CatalogEntry, CatalogGroup } from '../utils/catalogStyles';
import { EditCustomPageModal } from './EditCustomPageModal';
import { EditCityModal } from './EditCityModal';
import { AdminBuyBoxManagement } from './AdminBuyBoxManagement';
import { AdminRestrictions } from './AdminRestrictions';
import { RestrictionsData, RestrictionSettings, SuspensionScope, WalletPenaltyKind, isSuspensionActive } from '../utils/restrictions';
import { formatDepositWords } from '../utils/deposit';
import { AdminUsersManagement } from './AdminUsersManagement';
import { PortalAccordionSidebar, SidebarMenuGroup } from './PortalAccordionSidebar';
import { INITIAL_BUY_BOX_SETTINGS, INITIAL_BUY_BOX_RESERVATIONS } from '../data/mockData';
import { UserProfile } from '../types';

interface AdminPortalProps {
  orders: VisitRequest[];
  vendors: CurtainVendor[];
  blogPosts: BlogPost[];
  blogCategories?: BlogCategory[];
  onSaveBlogCategories?: (next: BlogCategory[]) => void;
  masterCatalogs?: MasterFabricCatalog[];
  customPages?: CustomPage[];
  themeSettings?: SiteThemeSettings;
  operationalCities?: OperationalCity[];
  vendorSubmissions?: VendorCustomCatalogSubmission[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onToggleVendorVerification: (vendorId: string) => void;
  onAddBlogPost: (post: Omit<BlogPost, 'id'> & { id?: string }) => void;
  onDeleteBlogPost?: (postId: string) => void;
  onUpdateOrder?: (updatedOrder: VisitRequest) => void;
  onUpdateVendor?: (updatedVendor: CurtainVendor) => void;
  onSaveMasterCatalog?: (catalogData: Omit<MasterFabricCatalog, 'id'>, existingId?: string) => void;
  onDeleteMasterCatalog?: (catalogId: string) => void;
  catalogEntries?: CatalogEntry[];
  escrowPayments?: EscrowPayment[];
  escrowWithdrawals?: EscrowWithdrawal[];
  onReleaseEscrow?: (paymentId: string) => void;
  onMarkWithdrawalPaid?: (withdrawalId: string) => void;
  onSaveCatalogEntry?: (entry: CatalogEntry) => void;
  onDeleteCatalogEntry?: (id: string) => void;
  onToggleCatalogEntry?: (id: string) => void;
  onResetCatalogEntries?: () => void;
  catalogCategories?: UnifiedCatalogCategory[];
  onCatalogCategoriesChange?: (next: UnifiedCatalogCategory[]) => void;
  catalogGroups?: CatalogGroup[];
  onSaveCatalogGroup?: (group: CatalogGroup, previousKey?: string) => void;
  onDeleteCatalogGroup?: (category: 'curtain' | 'wallpaper' | 'flooring', key: string) => void;
  onSaveCustomPage?: (pageData: Omit<CustomPage, 'id'>, existingId?: string) => void;
  onDeleteCustomPage?: (pageId: string) => void;
  onUpdateThemeSettings?: (updatedSettings: Partial<SiteThemeSettings>) => void;
  onPreviewCustomPage?: (page: CustomPage) => void;
  onUpdateOperationalCities?: (cities: OperationalCity[]) => void;
  onModerateSubmission?: (submissionId: string, status: 'approved' | 'rejected', feedback?: string) => void;
  onModeratePortfolioItem?: (vendorId: string, itemId: string, status: 'approved' | 'rejected', reason?: string) => void;
  onApproveVendor?: (vendorId: string, notes?: string) => void;
  onRejectVendor?: (vendorId: string, reason: string) => void;
  tickets?: SupportTicket[];
  onReplyTicket?: (ticketId: string, message: string) => void;
  onUpdateTicketStatus?: (ticketId: string, status: TicketStatus, unionNotes?: string, unionCaseNumber?: string) => void;
  onRunAutoCloseCheck?: () => number;
  onSimulateFiveDaysPassed?: (ticketId: string) => void;
  buyBoxSettings?: BuyBoxSettings;
  buyBoxReservations?: BuyBoxReservation[];
  onUpdateBuyBoxSettings?: (newSettings: BuyBoxSettings) => void;
  onCancelBuyBoxReservation?: (reservationId: string, refundAmount?: number) => void;
  discountCoupons?: DiscountCoupon[];
  onAddDiscountCoupon?: (coupon: DiscountCoupon) => void;
  onUpdateDiscountCoupon?: (coupon: DiscountCoupon) => void;
  onDeleteDiscountCoupon?: (couponId: string) => void;
  onToggleDiscountCoupon?: (couponId: string) => void;
  onIssueAutomaticDiscountCoupon?: (customerName: string, customerPhone: string, orderId: string, purchaseAmount?: number) => DiscountCoupon;
  users?: UserProfile[];
  onAddUser?: (user: UserProfile) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateUser?: (user: UserProfile) => void;
  onChangeUserPassword?: (userId: string, newPassword: string) => void;
  jobApplications?: JobApplication[];
  onUpdateJobApplication?: (id: string, patch: Partial<Pick<JobApplication, 'status' | 'adminNotes'>>) => void;
  onDeleteJobApplication?: (id: string) => void;
  // محدودیت‌ها و جریمه‌ها
  restrictions?: RestrictionsData;
  onUpdateRestrictionSettings?: (partial: Partial<RestrictionSettings>) => void;
  onAddSuspension?: (vendorId: string, scope: SuspensionScope, reason: string, durationDays: number) => boolean | void;
  onLiftSuspension?: (suspensionId: string, reason: string) => void;
  onReleaseProbation?: (vendorId: string, maxPerDay: number, months: number) => void;
  onSetVendorBuffer?: (vendorId: string, percent: number | null, note?: string) => void;
  onApplyDelayPenalty?: (orderId: string, daysLate: number, perDayAmount: number, amount: number, reason: string) => boolean | void;
  onRevokeDelayPenalty?: (penaltyId: string) => void;
  onApplyWalletPenalty?: (vendorId: string, kind: WalletPenaltyKind, amount: number, description: string, orderId?: string) => boolean | void;
  onRefundWalletPenalty?: (penaltyId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  orders,
  vendors,
  blogPosts,
  blogCategories = DEFAULT_BLOG_CATEGORIES,
  onSaveBlogCategories,
  masterCatalogs = [],
  customPages = [],
  buyBoxSettings = INITIAL_BUY_BOX_SETTINGS,
  buyBoxReservations = INITIAL_BUY_BOX_RESERVATIONS,
  onUpdateBuyBoxSettings,
  onCancelBuyBoxReservation,
  discountCoupons = [],
  onAddDiscountCoupon,
  onUpdateDiscountCoupon,
  onDeleteDiscountCoupon,
  onToggleDiscountCoupon,
  onIssueAutomaticDiscountCoupon,
  users = [],
  onAddUser,
  onDeleteUser,
  onUpdateUser,
  onChangeUserPassword,
  jobApplications = [],
  onUpdateJobApplication,
  onDeleteJobApplication,
  restrictions,
  onUpdateRestrictionSettings,
  onAddSuspension,
  onLiftSuspension,
  onReleaseProbation,
  onSetVendorBuffer,
  onApplyDelayPenalty,
  onRevokeDelayPenalty,
  onApplyWalletPenalty,
  onRefundWalletPenalty,
  themeSettings = {
    siteName: 'دراپینو',
    tagline: 'بازار پرده در خانه شما',
    primaryColor: 'amber',
    fontFamily: 'Vazirmatn',
    borderRadius: 'rounded-2xl',
    heroTitle: 'بازار پرده و کالیته‌های لوکس، این‌بار در آرامش منزل شما',
    heroSubtitle: 'تجهیز خانه با جدیدترین کالیته‌های پارچه، متراژگیری دقیق با لیزر و طراحی سه‌بعدی توسط برترین گالری‌های منطقه',
    heroBadge: 'طرح ملی پرو و انتخاب پرده در منزل با بیعانه {deposit}ی',
    heroImageUrl: '/images/hero_curtain_luxury_living_1790237028961.jpg',
    customerDepositFee: 350000,
    vendorLeadFee: 550000,
    supportPhone: '۰۲۱-۸۸۸۸۹۹۰۰',
    supportEmail: 'info@drapino.ir',
  },
  operationalCities = [],
  vendorSubmissions = [],
  tickets = [],
  onReplyTicket,
  onUpdateTicketStatus,
  onRunAutoCloseCheck,
  onSimulateFiveDaysPassed,
  onUpdateOrderStatus,
  onToggleVendorVerification,
  onAddBlogPost,
  onDeleteBlogPost,
  onUpdateOrder,
  onUpdateVendor,
  onSaveMasterCatalog,
  onDeleteMasterCatalog,
  catalogEntries = [],
  escrowPayments = [],
  escrowWithdrawals = [],
  onReleaseEscrow,
  onMarkWithdrawalPaid,
  onSaveCatalogEntry,
  onDeleteCatalogEntry,
  onToggleCatalogEntry,
  onResetCatalogEntries,
  catalogCategories = [],
  onCatalogCategoriesChange,
  catalogGroups = [],
  onSaveCatalogGroup,
  onDeleteCatalogGroup,
  onSaveCustomPage,
  onDeleteCustomPage,
  onUpdateThemeSettings,
  onPreviewCustomPage,
  onUpdateOperationalCities,
  onModerateSubmission,
  onModeratePortfolioItem,
  onApproveVendor,
  onRejectVendor,
}) => {
  const { addNotification, triggerSpecialOffer } = useNotifications();
  
  const [activeSection, setActiveSection] = useState<
    'overview' | 'restrictions' | 'users' | 'orders' | 'vendors' | 'vendor_verifications' | 'support_tickets' | 'operational_cities' | 'content_moderation' | 'master_catalogs' | 'catalog_categories' | 'catalog_styles' | 'pages' | 'site_customizer' | 'blogs' | 'notifications' | 'buy_box' | 'discount_coupons' | 'escrow' | 'job_applications'
  >('overview');
  
  const [moderationSubTab, setModerationSubTab] = useState<'portfolios' | 'catalogs'>('portfolios');
  const [portfolioStatusFilter, setPortfolioStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [portfolioVendorFilter, setPortfolioVendorFilter] = useState<string>('all');
  const [portfolioPreviewImage, setPortfolioPreviewImage] = useState<string | null>(null);
  const [customizerSubTab, setCustomizerSubTab] = useState<'homepage' | 'header_nav' | 'footer' | 'styles_branding'>('homepage');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Ticket management state
  const [adminSelectedTicketId, setAdminSelectedTicketId] = useState<string | null>(null);
  const [ticketSearchTerm, setTicketSearchTerm] = useState('');
  const [ticketSearchMode, setTicketSearchMode] = useState<'all' | 'ticket_number' | 'subject'>('all');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>('all');
  const [ticketTypeFilter, setTicketTypeFilter] = useState<'all' | 'complaint' | 'support'>('all');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('all');
  const [adminReplyText, setAdminReplyText] = useState('');
  const [unionArbitrationInput, setUnionArbitrationInput] = useState('');
  const [unionCaseNumberInput, setUnionCaseNumberInput] = useState('');

  // City management state
  const [editingCity, setEditingCity] = useState<OperationalCity | null>(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [cityPhaseFilter, setCityPhaseFilter] = useState<'all' | '1' | '2' | '3'>('all');
  const [cityStatusFilter, setCityStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const handleSaveCity = (cityData: OperationalCity) => {
    if (onUpdateOperationalCities) {
      const exists = operationalCities.some((c) => c.id === cityData.id);
      const updated = exists
        ? operationalCities.map((c) => (c.id === cityData.id ? cityData : c))
        : [...operationalCities, cityData];
      onUpdateOperationalCities(updated);
    }
  };

  const handleDeleteCity = (cityId: string) => {
    if (onUpdateOperationalCities) {
      const updated = operationalCities.filter((c) => c.id !== cityId);
      onUpdateOperationalCities(updated);
    }
  };

  const handleToggleCityActive = (cityId: string) => {
    if (onUpdateOperationalCities) {
      const updated = operationalCities.map((c) =>
        c.id === cityId ? { ...c, isActive: !c.isActive } : c
      );
      onUpdateOperationalCities(updated);
    }
  };

  const handleToggleCityPartnerActive = (cityId: string) => {
    if (onUpdateOperationalCities) {
      const updated = operationalCities.map((c) =>
        c.id === cityId ? { ...c, isPartnerRegistrationActive: !c.isPartnerRegistrationActive } : c
      );
      onUpdateOperationalCities(updated);
    }
  };

  const handleQuickChangePhase = (cityId: string, newPhase: number) => {
    if (onUpdateOperationalCities) {
      const updated = operationalCities.map((c) =>
        c.id === cityId ? { ...c, phase: newPhase } : c
      );
      onUpdateOperationalCities(updated);
    }
  };

  const handleActivateAllPhase1 = () => {
    if (onUpdateOperationalCities) {
      const updated = operationalCities.map((c) =>
        c.phase === 1 ? { ...c, isActive: true, isPartnerRegistrationActive: true } : c
      );
      onUpdateOperationalCities(updated);
    }
  };

  // Operational cities filtering and metrics
  const filteredOperationalCities = operationalCities.filter((city) => {
    const matchesSearch =
      city.name.includes(citySearchTerm) ||
      city.province.includes(citySearchTerm) ||
      (city.statusNote && city.statusNote.includes(citySearchTerm)) ||
      city.districts.some((d) => d.includes(citySearchTerm));
    const matchesPhase =
      cityPhaseFilter === 'all' || city.phase === Number(cityPhaseFilter);
    const matchesStatus =
      cityStatusFilter === 'all' ||
      (cityStatusFilter === 'active' && city.isActive) ||
      (cityStatusFilter === 'inactive' && !city.isActive);
    return matchesSearch && matchesPhase && matchesStatus;
  });

  const totalCitiesCount = operationalCities.length;
  const phase1Count = operationalCities.filter((c) => c.phase === 1).length;
  const phase2Count = operationalCities.filter((c) => c.phase === 2).length;
  const phase3Count = operationalCities.filter((c) => c.phase === 3).length;
  const activeOrderCitiesCount = operationalCities.filter((c) => c.isActive).length;
  const activePartnerCitiesCount = operationalCities.filter((c) => c.isPartnerRegistrationActive).length;

  // Vendor verification review modal state
  const [selectedVendorForReview, setSelectedVendorForReview] = useState<CurtainVendor | null>(null);
  const [vendorRejectReason, setVendorRejectReason] = useState('');
  const [vendorAdminNotes, setVendorAdminNotes] = useState('');

  // Moderation feedback state
  const [moderationFeedback, setModerationFeedback] = useState<Record<string, string>>({});

  // Modals state
  const [editingOrder, setEditingOrder] = useState<VisitRequest | null>(null);
  const [editingVendor, setEditingVendor] = useState<CurtainVendor | null>(null);
  const [editingCatalog, setEditingCatalog] = useState<MasterFabricCatalog | null>(null);
  const [isNewCatalogModalOpen, setIsNewCatalogModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);

  // Notification Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('جشنواره پاییزه دوخت رایگان دراپینو');
  const [broadcastMessage, setBroadcastMessage] = useState('به مناسبت توسعه شبکه فروشگاه‌های کالیته در منزل، هزینه دوخت کلیه پارچه‌های مخمل و حریر تا پایان ماه با ۵۰٪ تخفیف محاسبه خواهد شد.');
  const [broadcastCode, setBroadcastCode] = useState('PAEEZ1403');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'customer' | 'vendor'>('all');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Blog creation modal state
  const [isNewBlogModalOpen, setIsNewBlogModalOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [newBlogCategoryName, setNewBlogCategoryName] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('راهنمای خرید و دکوراسیون');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('تحریریه دراپینو');
  const [blogContent, setBlogContent] = useState('');

  // Site Customizer State (Local Draft)
  const [brandingError, setBrandingError] = useState('');
  const handleBrandingFile = async (kind: 'logo' | 'favicon', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = await readImageFile(file, kind === 'logo' ? { maxWidth: 480, maxHeight: 160 } : { maxWidth: 128, maxHeight: 128, square: true });
      setDraftTheme((d) => ({ ...d, ...(kind === 'logo' ? { logoUrl: url } : { faviconUrl: url }) }));
      setBrandingError('');
    } catch (err: any) {
      setBrandingError(err?.message || 'بارگذاری تصویر ناموفق بود.');
    }
  };
  const [draftTheme, setDraftTheme] = useState<SiteThemeSettings>({ ...themeSettings });
  const [themeSaveSuccess, setThemeSaveSuccess] = useState(false);

  // Discount Coupon Management State
  const [couponSearchTerm, setCouponSearchTerm] = useState('');
  const [couponFilter, setCouponFilter] = useState<'all' | 'auto' | 'manual' | 'active' | 'expired'>('all');
  const [isCreateCouponModalOpen, setIsCreateCouponModalOpen] = useState(false);
  const [isQuickIssueModalOpen, setIsQuickIssueModalOpen] = useState(false);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  // New coupon form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponTitle, setNewCouponTitle] = useState('');
  const [newCouponDescription, setNewCouponDescription] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(20);
  const [newCouponMaxAmount, setNewCouponMaxAmount] = useState<number>(500000);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState<number>(300000);
  const [newCouponAppliesTo, setNewCouponAppliesTo] = useState<'deposit' | 'invoice' | 'both'>('both');
  const [newCouponTargetMode, setNewCouponTargetMode] = useState<'public' | 'specific_customer'>('public');
  const [newCouponCustomerName, setNewCouponCustomerName] = useState('');
  const [newCouponCustomerPhone, setNewCouponCustomerPhone] = useState('');
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState<number>(50);
  const [newCouponExpiresAt, setNewCouponExpiresAt] = useState('۱۴۰۳/۱۲/۲۹');

  const handleGenerateRandomCode = () => {
    const prefixes = ['VIP', 'LOYAL', 'FALL', 'PARDEH', 'GOLD', 'SPECIAL'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    setNewCouponCode(`${prefix}-${num}`);
  };

  const handleCopyCouponCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCouponCode(code);
    setTimeout(() => setCopiedCouponCode(null), 2000);
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponTitle.trim()) return;

    const coupon: DiscountCoupon = {
      id: `coup-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      title: newCouponTitle.trim(),
      description: newCouponDescription.trim() || undefined,
      discountType: newCouponType,
      discountValue: Number(newCouponValue),
      maxDiscountAmount: Number(newCouponMaxAmount),
      minOrderAmount: Number(newCouponMinOrder),
      appliesTo: newCouponAppliesTo,
      assignedCustomerName: newCouponTargetMode === 'specific_customer' && newCouponCustomerName.trim() ? newCouponCustomerName.trim() : undefined,
      assignedCustomerPhone: newCouponTargetMode === 'specific_customer' && newCouponCustomerPhone.trim() ? newCouponCustomerPhone.trim() : undefined,
      isAutoGenerated: false,
      usedCount: 0,
      usageLimit: Number(newCouponUsageLimit),
      expiresAt: newCouponExpiresAt,
      isActive: true,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    if (onAddDiscountCoupon) {
      onAddDiscountCoupon(coupon);
    }
    setIsCreateCouponModalOpen(false);
    setNewCouponCode('');
    setNewCouponTitle('');
    setNewCouponDescription('');
    setNewCouponValue(20);
    setNewCouponMaxAmount(500000);
  };

  // Customers with successful purchases eligible for quick automatic loyalty coupon issuance
  const successfulCustomers = orders
    .filter((o) => o.status === 'installed' || o.status === 'approved' || o.status === 'visited')
    .map((o) => ({
      name: o.customerName,
      phone: o.phone,
      orderNumber: o.orderNumber,
      orderId: o.id,
      city: o.city,
      district: o.district,
      amount: o.invoice?.subtotal || o.depositAmount || 350000,
      status: o.status,
    }))
    .filter((cust, idx, arr) => arr.findIndex((x) => x.phone === cust.phone) === idx);

  // Filtered discount coupons
  const filteredDiscountCoupons = discountCoupons.filter((c) => {
    const q = couponSearchTerm.trim().toLowerCase();
    if (q) {
      const matchCode = c.code.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchPhone = c.assignedCustomerPhone?.includes(q);
      const matchName = c.assignedCustomerName?.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchPhone && !matchName) return false;
    }

    if (couponFilter === 'auto') return c.isAutoGenerated;
    if (couponFilter === 'manual') return !c.isAutoGenerated;
    if (couponFilter === 'active') return c.isActive && c.usedCount < c.usageLimit;
    if (couponFilter === 'expired') return !c.isActive || c.usedCount >= c.usageLimit;
    return true;
  });

  const formatNumber = (num: number) => num.toLocaleString('fa-IR');

  // Calculations for financial metrics
  const totalCustomerDeposits = orders.reduce((acc, curr) => acc + (curr.depositAmount || 350000), 0);
  const claimedOrdersCount = orders.filter((o) => o.assignedVendorId).length;
  const totalLeadClaimRevenue = claimedOrdersCount * (draftTheme.vendorLeadFee || 550000);
  const totalPlatformGrossIncome = totalCustomerDeposits + totalLeadClaimRevenue;
  const totalVendorWallets = vendors.reduce((acc, curr) => acc + (curr.walletBalance || 0), 0);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    if (broadcastCode.trim()) {
      triggerSpecialOffer(broadcastTitle, broadcastMessage, broadcastCode.trim(), broadcastTarget);
    } else {
      addNotification({
        title: broadcastTitle,
        message: broadcastMessage,
        type: 'special_offer',
        targetRole: broadcastTarget,
        actionLabel: 'مشاهده جزئیات در پنل',
      });
    }

    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
    }, 4000);
  };

  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogContent.trim()) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');

    onAddBlogPost({
      title: blogTitle,
      slug: blogTitle.trim().toLowerCase().replace(/\s+/g, '-'),
      category: blogCategory,
      summary: blogSummary || blogContent.slice(0, 120) + '...',
      content: [blogContent],
      author: blogAuthor,
      date: dateStr,
      readTime: '۴ دقیقه',
      imageUrl: '/images/hero_curtain_luxury_living_1790237028961.jpg',
    });

    setIsNewBlogModalOpen(false);
    setBlogTitle('');
    setBlogSummary('');
    setBlogContent('');
  };

  const handleSaveThemeSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateThemeSettings) {
      onUpdateThemeSettings(draftTheme);
    }
    setThemeSaveSuccess(true);
    setTimeout(() => setThemeSaveSuccess(false), 3000);
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      order.customerName.includes(searchTerm) ||
      order.phone.includes(searchTerm) ||
      order.orderNumber.includes(searchTerm) ||
      order.district.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Sidebar Accordion Navigation Groups for Admin Panel
  const adminSidebarGroups: SidebarMenuGroup[] = [
    {
      id: 'dashboard_overview',
      title: 'داشبورد و نظارت',
      icon: BarChart3,
      defaultOpen: true,
      items: [
        { id: 'overview', label: 'داشبورد کلان', icon: BarChart3 },
        { id: 'orders', label: 'سفارشات سامانه', icon: Receipt, badge: orders.length },
        { 
          id: 'support_tickets', 
          label: 'تیکت‌ها و شکایات کاربران', 
          icon: ShieldAlert, 
          badge: tickets.filter((t) => t.status === 'pending' || t.status === 'investigating').length || null,
          badgeColor: 'bg-rose-600 text-white'
        },
      ],
    },
    {
      id: 'users_vendors',
      title: 'کاربران و اعتبارسنجی',
      icon: Users,
      defaultOpen: true,
      items: [
        {
          id: 'job_applications',
          label: 'درخواست‌های استخدام',
          icon: Briefcase,
          badge: jobApplications.filter((a) => a.status === 'new').length || null,
          badgeColor: 'bg-amber-600 text-white',
        },
        { id: 'users', label: 'مدیریت کاربران', icon: Users, badge: users.length },
        { 
          id: 'vendor_verifications', 
          label: 'تایید پروانه همکاران', 
          icon: FileCheck, 
          badge: vendors.filter((v) => v.verificationStatus === 'pending_verification').length || null,
          badgeColor: 'bg-red-600 text-white'
        },
        { id: 'vendors', label: 'فهرست فروشگاه‌ها', icon: Store, badge: vendors.length },
        {
          id: 'restrictions',
          label: 'محدودیت‌ها',
          icon: ShieldAlert,
          badge: restrictions ? restrictions.suspensions.filter((x) => isSuspensionActive(x)).length || null : null,
          badgeColor: 'bg-rose-600 text-white',
        },
      ],
    },
    {
      id: 'sales_marketing',
      title: 'فروش، بای‌باکس و تخفیف‌ها',
      icon: Crown,
      defaultOpen: true,
      items: [
        { 
          id: 'buy_box', 
          label: 'مدیریت سقف‌های بای‌باکس', 
          icon: Crown, 
          badge: buyBoxReservations.filter((r) => r.status === 'active').length ? `${buyBoxReservations.filter((r) => r.status === 'active').length} فعال` : null 
        },
        { id: 'escrow', label: 'صندوق پرداخت امن (امانی)', icon: ShieldCheck, badge: escrowWithdrawals.filter((w) => w.status === 'processing').length || null },
        { id: 'discount_coupons', label: 'کدهای تخفیف و بن وفاداری', icon: Tag, badge: discountCoupons.length },
        { id: 'operational_cities', label: 'فازبندی و شهرها', icon: MapPin, badge: operationalCities.length },
      ],
    },
    {
      id: 'content_catalog',
      title: 'کاتالوگ و محتوا',
      icon: Palette,
      defaultOpen: false,
      items: [
        { id: 'catalog_categories', label: 'دسته‌بندی کالیته‌ها', icon: Layers },
        { id: 'catalog_styles', label: 'کالیته‌های صفحه کاتالوگ', icon: Layers, badge: catalogEntries.length },
        { id: 'master_catalogs', label: 'کالیته‌های مرجع', icon: Layers, badge: masterCatalogs.length },
        { 
          id: 'content_moderation', 
          label: 'نظارت بر نمونه‌کارها', 
          icon: ShieldAlert,
          badge: (vendors.flatMap((v) => v.portfolio || []).filter((p) => p.status === 'pending').length + vendorSubmissions.filter((s) => s.status === 'pending_approval').length) || null,
          badgeColor: 'bg-purple-600 text-white'
        },
        { id: 'site_customizer', label: 'ویرایشگر صفحه اصلی و پوسته', icon: Palette },
        { id: 'pages', label: 'مدیریت برگه‌ها', icon: Globe, badge: customPages.length },
        { id: 'blogs', label: 'وبلاگ و مقالات', icon: FileText, badge: blogPosts.length },
        { id: 'notifications', label: 'ارسال اعلان همگانی', icon: Bell },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-right">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>مرکز کنترل و مدیریت ارشد سامانه {themeSettings.siteName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              سامانه جامع نظارت، ویرایشگر سایت (CMS) و مالی
            </h1>
          </div>

          {/* Quick Metrics Badge & Download Project */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 text-right">
              <span className="text-[10px] text-amber-800 font-semibold block">سود ناخالص پلتفرم:</span>
              <span className="text-base font-extrabold text-amber-900 font-mono tabular-nums">
                {formatNumber(totalPlatformGrossIncome)} ت
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Right Collapsible Accordion Sidebar + Left Content Canvas */}
      <div className="flex flex-col lg:flex-row items-start gap-6 mt-6">
        {/* Right Collapsible Accordion Sidebar */}
        <PortalAccordionSidebar
          title="پنل مدیریت ارشد"
          subtitle="اتحادیه و نظارت کل"
          roleBadge={{
            text: 'مدیر کل',
            color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          }}
          groups={adminSidebarGroups}
          activeItemId={activeSection}
          onSelectItemId={(id) => setActiveSection(id as any)}
          storageKey="admin_portal"
        />

        {/* Main Content Workspace */}
        <div className="flex-1 min-w-0 w-full space-y-8">

      {/* ========================================================= */}
      {/* SECTION: USERS MANAGEMENT (مدیریت کاربران، افزودن، حذف، تغییر رمز) */}
      {/* ========================================================= */}

      {activeSection === 'job_applications' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-600" />
                  درخواست‌های استخدام در دراپینو
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  مجموع {jobApplications.length.toLocaleString('fa-IR')} درخواست — {jobApplications.filter((a) => a.status === 'new').length.toLocaleString('fa-IR')} جدید
                </p>
              </div>
            </div>

            {jobApplications.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-bold">هنوز درخواست استخدامی ثبت نشده است.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobApplications.map((app) => {
                  const statusLabel: Record<string, string> = {
                    new: 'جدید',
                    reviewing: 'در حال بررسی',
                    interview: 'مصاحبه',
                    accepted: 'پذیرفته‌شده',
                    rejected: 'رد شده',
                  };
                  const statusCls: Record<string, string> = {
                    new: 'bg-sky-100 text-sky-800 border-sky-300',
                    reviewing: 'bg-amber-100 text-amber-900 border-amber-300',
                    interview: 'bg-violet-100 text-violet-800 border-violet-300',
                    accepted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    rejected: 'bg-rose-100 text-rose-800 border-rose-300',
                  };
                  return (
                    <div key={app.id} className="border border-stone-200 rounded-2xl p-5 hover:border-amber-300 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-stone-900 text-base">{app.fullName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCls[app.status] || statusCls.new}`}>
                              {statusLabel[app.status] || app.status}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                              {app.department}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-stone-600">
                            <span>📞 {app.phone}</span>
                            <span dir="ltr" className="text-right sm:text-left">✉️ {app.email}</span>
                            <span>📍 {app.city}</span>
                            {app.education && <span>🎓 {app.education}</span>}
                            {app.experienceYears && <span>⏱ سابقه: {app.experienceYears} سال</span>}
                            <span className="text-stone-400">ثبت: {app.createdAt}</span>
                          </div>
                          {app.coverLetter && (
                            <p className="text-xs text-stone-500 bg-stone-50 rounded-xl p-3 border border-stone-100 leading-relaxed">
                              {app.coverLetter}
                            </p>
                          )}
                          {app.adminNotes && (
                            <p className="text-xs text-amber-800 bg-amber-50 rounded-xl p-3 border border-amber-100">
                              یادداشت مدیر: {app.adminNotes}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {app.resumeDataUrl && (
                            <a
                              href={app.resumeDataUrl}
                              download={app.resumeFileName || 'resume.pdf'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-amber-400 text-xs font-bold hover:bg-stone-800 transition-colors"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              دانلود رزومه
                              {app.resumeSize ? ` (${app.resumeSize})` : ''}
                            </a>
                          )}
                          <select
                            className="px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                            value={app.status}
                            onChange={(e) => {
                              if (onUpdateJobApplication) {
                                onUpdateJobApplication(app.id, { status: e.target.value as JobApplicationStatus });
                              }
                            }}
                          >
                            <option value="new">جدید</option>
                            <option value="reviewing">در حال بررسی</option>
                            <option value="interview">مصاحبه</option>
                            <option value="accepted">پذیرفته‌شده</option>
                            <option value="rejected">رد شده</option>
                          </select>
                          <button
                            type="button"
                            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-200 cursor-pointer"
                            onClick={() => {
                              const notes = prompt('یادداشت مدیریتی:', app.adminNotes || '');
                              if (notes !== null && onUpdateJobApplication) {
                                onUpdateJobApplication(app.id, { adminNotes: notes });
                              }
                            }}
                          >
                            یادداشت
                          </button>
                          <button
                            type="button"
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 cursor-pointer"
                            onClick={() => {
                              if (confirm(`حذف درخواست «${app.fullName}»؟`) && onDeleteJobApplication) {
                                onDeleteJobApplication(app.id);
                              }
                            }}
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'users' && (
        <div className="mt-8">
          <AdminUsersManagement
            users={users}
            onAddUser={onAddUser || (() => {})}
            onDeleteUser={onDeleteUser || (() => {})}
            onUpdateUser={onUpdateUser || (() => {})}
            onChangeUserPassword={onChangeUserPassword || (() => {})}
            operationalCities={operationalCities}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 1: OVERVIEW METRICS */}
      {/* ========================================================= */}
      {activeSection === 'overview' && (
        <div className="mt-8 space-y-8 text-right">
          
          {/* 4 Financial Key Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-right">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900">سود کل پلتفرم (ناخالص)</span>
                <TrendingUp className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl font-black text-amber-950 font-mono tabular-nums">
                {formatNumber(totalPlatformGrossIncome)} <span className="text-xs font-normal">تومان</span>
              </div>
              <span className="text-[11px] text-amber-800 mt-1 block">
                مجموع بیعانه مشتریان + درآمد شکار لیدها
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-right">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900">درآمد حاصل از شکار سفارشات</span>
                <DollarSign className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-black text-emerald-950 font-mono tabular-nums">
                {formatNumber(totalLeadClaimRevenue)} <span className="text-xs font-normal">تومان</span>
              </div>
              <span className="text-[11px] text-emerald-800 mt-1 block">
                {claimedOrdersCount} سفارش شکار شده × ۵۵۰,۰۰۰ تومان
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-right">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700">بیعانه واریزی مشتریان</span>
                <Receipt className="w-4 h-4 text-stone-500" />
              </div>
              <div className="text-2xl font-black text-stone-900 font-mono tabular-nums">
                {formatNumber(totalCustomerDeposits)} <span className="text-xs font-normal">تومان</span>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">
                {orders.length} سفارش با بیعانه تضمینی
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-right">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-900">موجودی کیف پول همکاران</span>
                <Store className="w-4 h-4 text-purple-700" />
              </div>
              <div className="text-2xl font-black text-purple-950 font-mono tabular-nums">
                {formatNumber(totalVendorWallets)} <span className="text-xs font-normal">تومان</span>
              </div>
              <span className="text-[11px] text-purple-800 mt-1 block">
                اعتبار ذخیره جهت شکار سفارشات در منطقه
              </span>
            </div>

          </div>

          {/* Quick Access to Main CMS Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div 
              onClick={() => setActiveSection('buy_box')}
              className="p-6 bg-gradient-to-br from-amber-500/10 via-amber-100/40 to-stone-50 rounded-3xl border border-amber-300 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <Crown className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-stone-900 text-base">مدیریت بای‌باکس</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  buyBoxSettings.isEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {buyBoxSettings.isEnabled ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                تنظیم تعرفه روزانه، سقف تخصیص ۵۰٪ سفارشات و اعمال محدودیت ماهانه جهت جلوگیری از انحصار.
              </p>
              <div className="mt-4 text-xs font-bold text-amber-900 flex items-center justify-between">
                <span>تعرفه: {formatNumber(buyBoxSettings.dailyPrice)} تومان</span>
                <span>←</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveSection('master_catalogs')}
              className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-black text-stone-900 text-base mb-1">تعریف و مدیریت کالیته‌های مرجع</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                افزودن انواع مخمل، حریر، زبرا و کتان جهت انتخاب در چمدان فروشگاه‌ها و ارائه به مشتریان در منزل.
              </p>
              <div className="mt-4 text-xs font-bold text-amber-800 flex items-center gap-1">
                <span>مدیریت {masterCatalogs.length} کالیته</span>
                <span>←</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveSection('site_customizer')}
              className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="font-black text-stone-900 text-base mb-1">ویرایشگر استایل، رنگ‌ها و عکس‌ها</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                تغییر پالت‌های رنگی، فونت‌ها، شعار هیرو، عکس اصلی، مبلغ بیعانه و شماره تماس بدون نیاز به کدنویسی.
              </p>
              <div className="mt-4 text-xs font-bold text-purple-800 flex items-center gap-1">
                <span>ویرایش تم و ظاهر</span>
                <span>←</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveSection('pages')}
              className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-black text-stone-900 text-base mb-1">مدیریت برگه‌ها و صفحات اختصاصی</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                ایجاد صفحات جدید (درباره ما، قوانین و ضمانت، راهنمای همکاری و...) و لینک‌دهی در هدر و فوتر سایت.
              </p>
              <div className="mt-4 text-xs font-bold text-blue-800 flex items-center gap-1">
                <span>مدیریت {customPages.length} برگه</span>
                <span>←</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: VENDOR VERIFICATION & HUMAN-IN-THE-LOOP MODERATION */}
      {/* ========================================================= */}
      {activeSection === 'vendor_verifications' && (
        <div className="mt-8 space-y-6 text-right">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-amber-700" />
                <span>بررسی و تایید نهایی مدارک صنفی همکاران جدید (توسط مدیر انسانی)</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                بر اساس قوانین پلتفرم، هیچ فروشگاهی بدون تایید فیزیکی پروانه کسب و کارت ملی مجاز به شکار سفارش مشتریان نخواهد بود.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl font-bold">
                {vendors.filter((v) => v.verificationStatus === 'pending_verification').length} پرونده در انتظار بررسی
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {vendors.map((vendor) => {
              const isPending = vendor.verificationStatus === 'pending_verification';
              const isVerified = vendor.verificationStatus === 'verified' || (!vendor.verificationStatus && vendor.isVerified);
              const isRejected = vendor.verificationStatus === 'rejected';

              return (
                <div
                  key={vendor.id}
                  className={`bg-white rounded-3xl border p-6 shadow-xs transition-all ${
                    isPending
                      ? 'border-amber-400 ring-2 ring-amber-100'
                      : isRejected
                      ? 'border-red-200 bg-stone-50/50'
                      : 'border-stone-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Main Details */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-lg font-black text-stone-900">{vendor.name}</span>
                        <span className="text-xs text-stone-500">صاحب جواز: {vendor.ownerName || 'نامشخص'}</span>

                        {isPending && (
                          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            در انتظار بررسی دستی مدارک
                          </span>
                        )}
                        {isVerified && (
                          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            تایید شده و دارای مجوز رسمی
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">
                            رد صلاحیت مدارک
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                        <div>
                          <span className="text-stone-400 block mb-0.5">شهر و استان:</span>
                          <span className="font-bold text-stone-800">{vendor.city || 'تهران'}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block mb-0.5">کد ملی مالک:</span>
                          <span className="font-bold text-stone-800 font-mono">{vendor.nationalCode || '۰۰۱۲۳۴۵۶۷۸'}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block mb-0.5">شماره همراه تماس:</span>
                          <span className="font-bold text-stone-800 font-mono">{vendor.phone}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block mb-0.5">موجودی کیف پول:</span>
                          <span className="font-bold text-amber-900 font-mono">{formatNumber(vendor.walletBalance)} تومان</span>
                        </div>
                      </div>

                      <div className="text-xs text-stone-600 space-y-1">
                        <div>
                          <span className="font-bold text-stone-700">نشانی دقیق فروشگاه: </span>
                          <span>{vendor.address}</span>
                        </div>
                        <div>
                          <span className="font-bold text-stone-700">مناطق تحت پوشش: </span>
                          <span className="text-stone-500">{vendor.coveredDistricts?.join('، ')}</span>
                        </div>
                        {vendor.verificationNotes && (
                          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs border border-amber-200 mt-2">
                            <strong>یادداشت کارشناس ناظر:</strong> {vendor.verificationNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Documents Preview */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-72">
                      <div className="border border-stone-200 rounded-2xl p-2.5 bg-stone-50 text-center">
                        <span className="text-[11px] font-bold text-stone-700 block mb-1.5 flex items-center justify-center gap-1">
                          <FileCheck className="w-3.5 h-3.5 text-amber-700" />
                          تصویر پروانه کسب اتحادیه
                        </span>
                        <div className="h-28 rounded-xl overflow-hidden bg-stone-200 relative group cursor-pointer">
                          <img
                            src={vendor.businessLicenseImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80'}
                            alt="پروانه کسب"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <a
                            href={vendor.businessLicenseImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80'}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                          >
                            مشاهده سایز اصلی
                          </a>
                        </div>
                      </div>

                      <div className="border border-stone-200 rounded-2xl p-2.5 bg-stone-50 text-center">
                        <span className="text-[11px] font-bold text-stone-700 block mb-1.5 flex items-center justify-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-amber-700" />
                          تصویر کارت ملی صاحب پروانه
                        </span>
                        <div className="h-28 rounded-xl overflow-hidden bg-stone-200 relative group cursor-pointer">
                          <img
                            src={vendor.nationalCardImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80'}
                            alt="کارت ملی"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <a
                            href={vendor.nationalCardImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80'}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                          >
                            مشاهده سایز اصلی
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions bar for manager */}
                  <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-stone-500">
                      تاریخ درخواست: <span className="font-mono">{vendor.joinedDate || '۱۴۰۳/۰۷/۰۱'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt('لطفاً دلیل عدم احراز صلاحیت یا نقص مدارک را وارد نمایید:', 'عدم تطابق نام صاحب پروانه با کارت ملی');
                              if (reason && onRejectVendor) {
                                onRejectVendor(vendor.id, reason);
                              }
                            }}
                            className="px-4 py-2 bg-stone-100 hover:bg-red-50 text-red-700 hover:border-red-200 border border-transparent rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            رد پرونده با ذکر دلیل
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onApproveVendor) {
                                onApproveVendor(vendor.id, 'پروانه کسب و کارت ملی توسط مدیر سیستم استعلام و تایید شد.');
                              } else {
                                onToggleVendorVerification(vendor.id);
                              }
                            }}
                            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تایید نهایی پروانه و فعال‌سازی همکار</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onToggleVendorVerification(vendor.id)}
                          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer"
                        >
                          تغییر وضعیت دستی تاییدیه
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: SUPPORT TICKETS & COMPLAINTS MANAGEMENT */}
      {/* ========================================================= */}
      {activeSection === 'support_tickets' && (
        <div className="mt-8 space-y-6 text-right">
          
          {/* Header Banner */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                  داوری و صیانت از حقوق مشتریان
                </span>
                <span className="text-xs text-stone-500">نظارت بر تعهدات گالری‌های پرده و کارشناسان اعزامی</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                رسیدگی به تیکت‌ها و شکایات رسمی خریداران
              </h2>
              <p className="text-xs text-stone-600 mt-1 max-w-3xl leading-relaxed">
                بررسی مستندات بارگذاری شده توسط مشتریان (مغایرت کد کالیته، گران‌فروشی، تاخیر، ایراد در دوخت)، استعلام از فروشنده، ارسال پاسخ رسمی و ارجاع پرونده‌ها به هیئت داوری اتحادیه صنف پرده.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-900">
                <span>شکایات فعال: </span>
                <span className="font-mono text-sm">{tickets.filter((t) => t.type === 'complaint' && t.status !== 'resolved' && t.status !== 'closed').length}</span>
              </div>
              <div className="px-3.5 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs font-bold text-purple-900">
                <span>پرونده‌های اتحادیه: </span>
                <span className="font-mono text-sm">{tickets.filter((t) => t.status === 'referred_to_union').length}</span>
              </div>
            </div>
          </div>

          {/* Header Action Bar with Metrics */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                  داوری و صیانت از حقوق مشتریان
                </span>
                <span className="text-xs text-stone-500">نظارت بر تعهدات گالری‌های پرده و کارشناسان اعزامی</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                رسیدگی به تیکت‌ها و شکایات رسمی خریداران
              </h2>
              <p className="text-xs text-stone-600 mt-1 max-w-3xl leading-relaxed">
                سامانه هوشمند رسیدگی، جستجوی تفکیکی بر اساس شماره تیکت و موضوع، پایش مهلت ۵ روزه پاسخگویی مشتری و بستن خودکار تیکت‌های بلاتکلیف.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onRunAutoCloseCheck) {
                    onRunAutoCloseCheck();
                  }
                }}
                className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="بررسی تیکت‌های پاسخ داده شده و بستن خودکار مواردی که بیش از ۵ روز از پاسخ کارشناس گذشته است"
              >
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>اجرای اتوماسیون بستن ۵ روزه</span>
              </button>

              <div className="px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900">
                <span>در حال رسیدگی: </span>
                <span className="font-mono text-sm">{tickets.filter((t) => t.status === 'investigating').length}</span>
              </div>
              <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-900">
                <span>شکایات فعال: </span>
                <span className="font-mono text-sm">{tickets.filter((t) => t.type === 'complaint' && t.status !== 'resolved' && t.status !== 'closed').length}</span>
              </div>
              <div className="px-3.5 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs font-bold text-purple-900">
                <span>پرونده‌های اتحادیه: </span>
                <span className="font-mono text-sm">{tickets.filter((t) => t.status === 'referred_to_union').length}</span>
              </div>
            </div>
          </div>

          {/* Dedicated Search & Filters Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-4 text-xs">
            {/* Top Search Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search input with mode toggle */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={
                    ticketSearchMode === 'ticket_number'
                      ? 'جستجوی مستقیم شماره تیکت (مثلاً TCK-9021 یا 9021)...'
                      : ticketSearchMode === 'subject'
                      ? 'جستجوی موضوع یا شرح تیکت (مثلاً مغایرت کالیته، تاخیر، مخمل)...'
                      : 'جستجو در شماره تیکت، موضوع، شماره سفارش، نام خریدار یا فروشگاه...'
                  }
                  value={ticketSearchTerm}
                  onChange={(e) => setTicketSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-700 focus:outline-hidden"
                />
                <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                {ticketSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setTicketSearchTerm('')}
                    className="absolute left-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Mode Switcher */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl shrink-0">
                <span className="text-[11px] text-stone-500 font-semibold px-2">جستجو بر اساس:</span>
                <button
                  type="button"
                  onClick={() => setTicketSearchMode('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    ticketSearchMode === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  همه فیلدها
                </button>
                <button
                  type="button"
                  onClick={() => setTicketSearchMode('ticket_number')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    ticketSearchMode === 'ticket_number' ? 'bg-amber-800 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  شماره تیکت
                </button>
                <button
                  type="button"
                  onClick={() => setTicketSearchMode('subject')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    ticketSearchMode === 'subject' ? 'bg-amber-800 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  موضوع تیکت
                </button>
              </div>
            </div>

            {/* Filter Dropdowns and Quick Chips */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
              <div className="flex flex-wrap items-center gap-2">
                {/* Topic / Category Filter */}
                <select
                  value={ticketCategoryFilter}
                  onChange={(e) => setTicketCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:bg-white focus:ring-2 focus:ring-amber-700"
                >
                  <option value="all">فیلتر موضوع: همه دسته‌ها</option>
                  <option value="fabric_quality_mismatch">مغایرت کالیته با پارچه تحویلی</option>
                  <option value="overpricing_discrepancy">گران‌فروشی و عدم رعایت تعرفه اتحادیه</option>
                  <option value="tailoring_installation_defect">ایراد در دوخت یا نقص نصب</option>
                  <option value="delay_unpunctuality">تاخیر و عدم پایبندی به زمان‌بندی</option>
                  <option value="invoice_refusal">عدم صدور فاکتور رسمی سامانه</option>
                  <option value="unprofessional_behavior">رفتار نامناسب کارشناس یا نصاب</option>
                  <option value="fabric_consultation">مشاوره انتخاب پارچه و دکوراسیون</option>
                  <option value="deposit_refund_query">پیگیری بیعانه و امور مالی</option>
                  <option value="order_tracking">پیگیری مراحل سفارش</option>
                  <option value="general_support">سایر امور پشتیبانی</option>
                </select>

                {/* Status Filter */}
                <select
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:bg-white focus:ring-2 focus:ring-amber-700"
                >
                  <option value="all">وضعیت: همه وضعیت‌ها</option>
                  <option value="investigating">در حال رسیدگی کارشناسی</option>
                  <option value="answered">پاسخ داده شده (شمارش ۵ روزه)</option>
                  <option value="auto_closed">بسته شده خودکار (۵ روز عدم پاسخ)</option>
                  <option value="referred_to_union">ارجاع به داوری اتحادیه</option>
                  <option value="resolved">حل و فصل شده</option>
                  <option value="closed">بسته شده / مختومه</option>
                </select>

                {/* Type Filter */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTicketTypeFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                      ticketTypeFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    همه ({tickets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketTypeFilter('complaint')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                      ticketTypeFilter === 'complaint' ? 'bg-rose-700 text-white shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    شکایات ({tickets.filter((t) => t.type === 'complaint').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketTypeFilter('support')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                      ticketTypeFilter === 'support' ? 'bg-amber-700 text-white shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    پشتیبانی ({tickets.filter((t) => t.type === 'support').length})
                  </button>
                </div>
              </div>

              {/* Reset filter button if applied */}
              {(ticketSearchTerm || ticketCategoryFilter !== 'all' || ticketStatusFilter !== 'all' || ticketTypeFilter !== 'all' || ticketSearchMode !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setTicketSearchTerm('');
                    setTicketSearchMode('all');
                    setTicketCategoryFilter('all');
                    setTicketStatusFilter('all');
                    setTicketTypeFilter('all');
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>پاک کردن فیلترها</span>
                </button>
              )}
            </div>
          </div>

          {/* Tickets List */}
          {tickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8 space-y-2">
              <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">هیچ تیکت یا شکایتی ثبت نشده است.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tickets
                .filter((t) => {
                  const q = ticketSearchTerm.trim().toLowerCase();
                  let matchesSearch = true;
                  if (q) {
                    if (ticketSearchMode === 'ticket_number') {
                      matchesSearch = t.ticketNumber.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
                    } else if (ticketSearchMode === 'subject') {
                      matchesSearch = t.subject.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
                    } else {
                      matchesSearch =
                        t.ticketNumber.toLowerCase().includes(q) ||
                        t.subject.toLowerCase().includes(q) ||
                        t.customerName.toLowerCase().includes(q) ||
                        t.customerPhone.toLowerCase().includes(q) ||
                        (t.targetVendorName && t.targetVendorName.toLowerCase().includes(q)) ||
                        (t.orderNumber && t.orderNumber.toLowerCase().includes(q)) ||
                        t.description.toLowerCase().includes(q);
                    }
                  }

                  const matchesCategory = ticketCategoryFilter === 'all' || t.category === ticketCategoryFilter;
                  const matchesType = ticketTypeFilter === 'all' || t.type === ticketTypeFilter;
                  const matchesStatus =
                    ticketStatusFilter === 'all'
                      ? true
                      : ticketStatusFilter === 'auto_closed'
                      ? Boolean(t.autoClosedAt || t.autoClosedReason)
                      : t.status === ticketStatusFilter;

                  return matchesSearch && matchesCategory && matchesType && matchesStatus;
                })
                .map((ticket) => {
                  const isComplaint = ticket.type === 'complaint';
                  const isExpanded = adminSelectedTicketId === ticket.id;

                  return (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs hover:border-amber-300 transition-all space-y-4"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              #{ticket.ticketNumber}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isComplaint ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                              {isComplaint ? 'شکایت رسمی از فروشنده' : 'درخواست پشتیبانی'}
                            </span>
                            <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-medium">
                              دسته: {ticket.categoryLabel}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ticket.autoClosedAt || ticket.autoClosedReason
                                ? 'bg-stone-200 text-stone-800 border border-stone-300'
                                : ticket.status === 'investigating'
                                ? 'bg-blue-100 text-blue-800'
                                : ticket.status === 'referred_to_union'
                                ? 'bg-purple-100 text-purple-900 font-black'
                                : ticket.status === 'answered'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : ticket.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}>
                              {ticket.autoClosedAt || ticket.autoClosedReason
                                ? 'بسته شده خودکار (۵ روز عدم پاسخ)'
                                : ticket.status === 'investigating'
                                ? 'در حال رسیدگی کارشناسی'
                                : ticket.status === 'referred_to_union'
                                ? 'ارجاع به داوری اتحادیه صنف'
                                : ticket.status === 'answered'
                                ? 'پاسخ داده شده (مهلت ۵ روزه)'
                                : ticket.status === 'resolved'
                                ? 'حل و فصل شده (مختومه)'
                                : 'بسته شده'}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              ticket.priority === 'urgent' ? 'bg-red-50 text-red-700 border border-red-200' :
                              ticket.priority === 'important' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                              'bg-stone-50 text-stone-600'
                            }`}>
                              اولویت: {ticket.priority === 'urgent' ? 'فوری' : ticket.priority === 'important' ? 'مهم' : 'عادی'}
                            </span>
                          </div>
                          <h3 className="font-black text-stone-900 text-base pt-1">
                            {ticket.subject}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => setAdminSelectedTicketId(isExpanded ? null : ticket.id)}
                          className="self-end sm:self-center px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-700" />
                          <span>{isExpanded ? 'بستن پنل رسیدگی' : 'مدیریت و ثبت پاسخ کارشناس'}</span>
                        </button>
                      </div>

                      {/* Info Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70 text-xs">
                        <div>
                          <span className="text-stone-400 block text-[11px]">مشتری شاکی / متقاضی:</span>
                          <span className="font-bold text-stone-900 mt-0.5 block">{ticket.customerName}</span>
                          <span className="text-[10px] text-stone-500 font-mono">{ticket.customerPhone}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">فروشگاه طرف شکایت:</span>
                          <span className="font-bold text-stone-900 mt-0.5 block">{ticket.targetVendorName || 'پشتیبانی کل'}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">شماره سفارش مرتبط:</span>
                          <span className="font-mono font-bold text-stone-800 mt-0.5 block">
                            {ticket.orderNumber ? `#${ticket.orderNumber}` : 'ثبت نشده'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">تاریخ ثبت اولیه:</span>
                          <span className="text-stone-700 mt-0.5 block font-medium">{ticket.createdAt}</span>
                        </div>
                      </div>

                      {/* Complaint / Request Description */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-stone-700">شرح موضوع ثبت شده توسط مشتری:</span>
                        <p className="text-xs sm:text-sm text-stone-800 leading-relaxed bg-stone-50/70 p-3.5 rounded-xl border border-stone-100 whitespace-pre-wrap">
                          {ticket.description}
                        </p>
                      </div>

                      {/* Attachments & Evidence */}
                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="space-y-2 pt-1 border-t border-stone-100">
                          <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5 text-rose-600" />
                            <span>مستندات و مدارک الصاقی شاکی ({ticket.attachments.length} مدرک):</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {ticket.attachments.map((att) => (
                              <div
                                key={att.id}
                                className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-2 text-xs"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {att.type === 'image' ? (
                                    <img src={att.url} alt={att.name} className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="truncate">
                                    <span className="font-bold text-stone-900 block truncate text-[11px]">{att.name}</span>
                                    <span className="text-[10px] text-stone-400 font-mono">{att.size || 'پیوست'}</span>
                                  </div>
                                </div>
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>مشاهده</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Union Arbitration Box */}
                      {ticket.unionCaseNumber && (
                        <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-2xl text-xs space-y-1">
                          <div className="flex items-center gap-2 text-purple-900 font-black">
                            <ShieldCheck className="w-4 h-4 text-purple-700" />
                            <span>پرونده هیئت داوری اتحادیه صنف (شماره {ticket.unionCaseNumber})</span>
                          </div>
                          <p className="text-purple-950 leading-relaxed font-medium">
                            {ticket.unionArbitrationNotes || 'در انتظار رای نهایی هیئت کارشناسان صنفی.'}
                          </p>
                        </div>
                      )}

                      {/* Auto-Close 5-Day Alert or Badge */}
                      {ticket.status === 'answered' && (
                        <div className="bg-amber-50/90 border border-amber-300 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-amber-950 font-semibold">
                            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                            <div>
                              <span>پاسخ کارشناس ارسال شده است.</span>
                              <span className="text-amber-800 text-[11px] block">
                                در صورتی که مشتری ظرف ۵ روز کاری پاسخی ندهد، این تیکت به صورت خودکار توسط سیستم مختومه خواهد شد.
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                            {(() => {
                              const lastMsg = ticket.messages[ticket.messages.length - 1];
                              const replyTime = ticket.lastExpertReplyTimestamp || (lastMsg?.senderRole !== 'customer' ? lastMsg.createdAt : Date.now());
                              const elapsedDays = Math.floor((Date.now() - replyTime) / (1000 * 60 * 60 * 24));
                              const remainingDays = Math.max(0, 5 - elapsedDays);
                              return (
                                <span className="bg-amber-200/90 text-amber-950 px-2.5 py-1 rounded-xl font-bold text-[11px] font-mono">
                                  {remainingDays} روز تا بستن خودکار
                                </span>
                              );
                            })()}
                            {onSimulateFiveDaysPassed && (
                              <button
                                type="button"
                                onClick={() => onSimulateFiveDaysPassed(ticket.id)}
                                className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                                title="جهت تست سیستم: شبیه‌سازی گذشت ۵ روز کاری و بستن آنی تیکت"
                              >
                                تست انقضای ۵ روز
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {(ticket.autoClosedAt || ticket.autoClosedReason) && (
                        <div className="bg-stone-100 border border-stone-300 p-3 rounded-2xl text-xs text-stone-800 flex items-center gap-2.5 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-stone-500 shrink-0" />
                          <div>
                            <span className="font-bold text-stone-900 block">بسته شده به صورت خودکار توسط سیستم</span>
                            <span className="text-stone-600 text-[11px]">علت: عدم پاسخ مشتری پس از گذشت ۵ روز کاری از آخرین پاسخ کارشناس (تاریخ: {ticket.autoClosedAt})</span>
                          </div>
                        </div>
                      )}

                      {/* EXPANDED ACTION & REPLY DRAWER */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t-2 border-amber-200/80 space-y-5 bg-amber-50/30 p-4 sm:p-5 rounded-2xl">
                          
                          {/* Messages Timeline */}
                          <div className="space-y-3">
                            <span className="text-xs font-black text-stone-900 block">
                              تاریخچه گفتگو و پاسخ‌ها ({ticket.messages.length} پیام):
                            </span>
                            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                              {ticket.messages.map((m) => (
                                <div
                                  key={m.id}
                                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                                    m.senderRole === 'customer'
                                      ? 'bg-white border-stone-200 mr-2'
                                      : m.senderRole === 'union_inspector'
                                      ? 'bg-purple-50 border-purple-200 ml-2'
                                      : 'bg-emerald-50 border-emerald-200 ml-2'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[11px] border-b border-black/5 pb-1">
                                    <span className="font-bold text-stone-900">
                                      {m.senderName} ({m.senderRole === 'customer' ? 'مشتری' : m.senderRole === 'union_inspector' ? 'بازرس اتحادیه' : 'مدیر سامانه'})
                                    </span>
                                    <span className="text-[10px] text-stone-400 font-mono">{m.timestamp}</span>
                                  </div>
                                  <p className="text-stone-800 leading-relaxed whitespace-pre-wrap">{m.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action 1: Change Status and Union Referral */}
                          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
                            <span className="text-xs font-bold text-stone-900 block">
                              تغییر وضعیت پرونده و ارجاع به اتحادیه صنف:
                            </span>

                            <div className="flex flex-wrap items-center gap-2">
                              {(['investigating', 'referred_to_union', 'answered', 'resolved', 'closed'] as TicketStatus[]).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateTicketStatus) {
                                      onUpdateTicketStatus(ticket.id, st);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    ticket.status === st
                                      ? 'bg-amber-800 text-white shadow-2xs'
                                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                  }`}
                                >
                                  {st === 'investigating' && 'در حال رسیدگی'}
                                  {st === 'referred_to_union' && 'ارجاع به داوری اتحادیه'}
                                  {st === 'answered' && 'پاسخ داده شد'}
                                  {st === 'resolved' && 'حل و فصل شد'}
                                  {st === 'closed' && 'بسته شده'}
                                </button>
                              ))}
                            </div>

                            {/* Union Referral Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                              <div>
                                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                                  شماره پرونده داوری اتحادیه:
                                </label>
                                <input
                                  type="text"
                                  placeholder="مثلاً: UN-1403/9980"
                                  value={unionCaseNumberInput}
                                  onChange={(e) => setUnionCaseNumberInput(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                                  خلاصه رای یا گزارش بازرس اتحادیه:
                                </label>
                                <input
                                  type="text"
                                  placeholder="مثلاً: کسر بیعانه تایید و مبلغ به حساب مشتری عودت شد."
                                  value={unionArbitrationInput}
                                  onChange={(e) => setUnionArbitrationInput(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                                />
                              </div>
                            </div>
                            {(unionCaseNumberInput || unionArbitrationInput) && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateTicketStatus) {
                                    onUpdateTicketStatus(
                                      ticket.id,
                                      'referred_to_union',
                                      unionArbitrationInput || ticket.unionArbitrationNotes,
                                      unionCaseNumberInput || ticket.unionCaseNumber || `UN-${Date.now().toString().slice(-6)}`
                                    );
                                    setUnionCaseNumberInput('');
                                    setUnionArbitrationInput('');
                                  }
                                }}
                                className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                              >
                                ثبت اطلاعات داوری اتحادیه
                              </button>
                            )}
                          </div>

                          {/* Action 2: Send Official Staff Reply */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-stone-900 block">
                              ارسال پاسخ رسمی ناظر به خریدار:
                            </span>
                            <div className="flex gap-2">
                              <textarea
                                rows={2}
                                value={adminReplyText}
                                onChange={(e) => setAdminReplyText(e.target.value)}
                                placeholder="پاسخ ناظر به مشتری، نتیجه بررسی با فروشگاه یا راهنمایی لازم را بنویسید..."
                                className="flex-1 p-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 leading-relaxed"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!adminReplyText.trim()) return;
                                  if (onReplyTicket) {
                                    onReplyTicket(ticket.id, adminReplyText.trim());
                                  }
                                  setAdminReplyText('');
                                }}
                                className="px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>ارسال</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: OPERATIONAL CITIES & PHASE MANAGEMENT */}
      {/* ========================================================= */}
      {activeSection === 'operational_cities' && (
        <div className="mt-8 space-y-6 text-right">
          
          {/* Header Banner */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                  توسعه و پوشش جغرافیایی
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  {operationalCities.length} شهر پیکربندی‌شده
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                <span>مدیریت فازبندی استانی و فعال‌سازی شهرها</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                کنترل متمرکز ثبت سفارش مشتریان و فرم جذب همکاران گالری پرده. شهرهای فاز ۱ فعال هستند و شهرهای فاز ۲ و ۳ در مراحل توسعه و پیش‌ثبت‌نام قرار دارند.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleActivateAllPhase1}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="فعال‌سازی فوری سفارش‌گیری و ثبت‌نام در تمام شهرهای فاز ۱"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>فعال‌سازی همگانی فاز ۱</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCity(null);
                  setIsCityModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن شهر جدید به شبکه</span>
              </button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-right">
              <span className="text-[11px] font-semibold text-stone-500 block">کل شهرها:</span>
              <span className="text-xl font-black text-stone-900 font-mono mt-1 block">
                {totalCitiesCount}
              </span>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs text-right">
              <span className="text-[11px] font-bold text-emerald-800 block">فاز ۱ (فعال):</span>
              <span className="text-xl font-black text-emerald-900 font-mono mt-1 block">
                {phase1Count} <span className="text-xs font-normal">شهر</span>
              </span>
            </div>

            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 shadow-2xs text-right">
              <span className="text-[11px] font-bold text-blue-800 block">فاز ۲ (جذب همکار):</span>
              <span className="text-xl font-black text-blue-900 font-mono mt-1 block">
                {phase2Count} <span className="text-xs font-normal">شهر</span>
              </span>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-2xs text-right">
              <span className="text-[11px] font-bold text-amber-800 block">فاز ۳ (توسعه آتی):</span>
              <span className="text-xl font-black text-amber-900 font-mono mt-1 block">
                {phase3Count} <span className="text-xs font-normal">شهر</span>
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-right">
              <span className="text-[11px] font-semibold text-stone-500 block">سفارش‌گیری باز:</span>
              <span className="text-xl font-black text-emerald-700 font-mono mt-1 block">
                {activeOrderCitiesCount}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-right">
              <span className="text-[11px] font-semibold text-stone-500 block">جذب همکار باز:</span>
              <span className="text-xl font-black text-blue-700 font-mono mt-1 block">
                {activePartnerCitiesCount}
              </span>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={citySearchTerm}
                onChange={(e) => setCitySearchTerm(e.target.value)}
                placeholder="جستجوی نام شهر، استان یا منطقه تحت پوشش..."
                className="w-full pl-3 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-500 font-semibold text-[11px]">فیلتر فاز:</span>
              <div className="inline-flex bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCityPhaseFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    cityPhaseFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  همه
                </button>
                <button
                  type="button"
                  onClick={() => setCityPhaseFilter('1')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    cityPhaseFilter === '1' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  فاز ۱
                </button>
                <button
                  type="button"
                  onClick={() => setCityPhaseFilter('2')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    cityPhaseFilter === '2' ? 'bg-white text-blue-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  فاز ۲
                </button>
                <button
                  type="button"
                  onClick={() => setCityPhaseFilter('3')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    cityPhaseFilter === '3' ? 'bg-white text-amber-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  فاز ۳
                </button>
              </div>

              <span className="text-stone-300">|</span>

              <select
                value={cityStatusFilter}
                onChange={(e) => setCityStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فقط سفارش‌گیری فعال</option>
                <option value="inactive">غیرفعال / در انتظار افتتاح</option>
              </select>
            </div>
          </div>

          {/* Cities Grid */}
          {filteredOperationalCities.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500 text-xs space-y-3">
              <MapPin className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-800 text-sm">هیچ شهری با این مشخصات یافت نشد.</p>
              <p className="text-stone-500">برای افزودن شهر جدید، روی دکمه «افزودن شهر جدید به شبکه» کلیک کنید.</p>
              <button
                type="button"
                onClick={() => {
                  setEditingCity(null);
                  setIsCityModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن شهر جدید</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOperationalCities.map((city) => {
                const isPhase1 = city.phase === 1;
                const isPhase2 = city.phase === 2;
                const isPhase3 = city.phase === 3;

                return (
                  <div
                    key={city.id}
                    className={`bg-white rounded-3xl border p-6 shadow-xs space-y-4 transition-all hover:shadow-md ${
                      city.isActive ? 'border-blue-300 ring-2 ring-blue-50/60' : 'border-stone-200'
                    }`}
                  >
                    {/* Top Row: Name, Province, Phase Badge, Edit/Delete Buttons */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xl font-black text-stone-900">{city.name}</span>
                          <span className="text-xs text-stone-500">استان {city.province}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                              isPhase1
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isPhase2
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            فاز {city.phase}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                              city.depositAmount && city.depositAmount > 0
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-50 text-stone-500 border-stone-200'
                            }`}
                            title="مبلغ بیعانه مشتری در این شهر"
                          >
                            {city.depositAmount && city.depositAmount > 0
                              ? `بیعانه ${formatDepositWords(city.depositAmount)}`
                              : 'بیعانه: پیش‌فرض سراسری'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">{city.statusNote}</p>
                        {city.launchDate && (
                          <span className="text-[11px] text-stone-400 font-mono mt-1 block">
                            تاریخ راه‌اندازی: {city.launchDate}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCity(city);
                            setIsCityModalOpen(true);
                          }}
                          className="p-2 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          title="ویرایش مشخصات و فازبندی شهر"
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`آیا مطمئن هستید که می‌خواهید شهر «${city.name}» را از شبکه حذف کنید؟`)) {
                              handleDeleteCity(city.id);
                            }
                          }}
                          className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="حذف شهر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Phase Changer */}
                    <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-stone-700">تغییر سریع فاز اجرایی:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickChangePhase(city.id, 1)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            city.phase === 1
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                          }`}
                        >
                          فاز ۱
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickChangePhase(city.id, 2)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            city.phase === 2
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                          }`}
                        >
                          فاز ۲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickChangePhase(city.id, 3)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            city.phase === 3
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                          }`}
                        >
                          فاز ۳
                        </button>
                      </div>
                    </div>

                    {/* Operational Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Customer orders toggle */}
                      <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        city.isActive 
                          ? 'bg-emerald-50/50 border-emerald-200' 
                          : 'bg-stone-50 border-stone-200'
                      }`}>
                        <div>
                          <span className="text-xs font-bold text-stone-800 block">دریافت سفارش مشتری:</span>
                          <span className={`text-[10px] block mt-0.5 font-medium ${
                            city.isActive ? 'text-emerald-700' : 'text-stone-500'
                          }`}>
                            {city.isActive ? 'سفارش‌گیری فعال است' : 'غیرفعال (پیام به زودی)'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleCityActive(city.id)}
                          className={`p-1 rounded-xl transition-all cursor-pointer ${
                            city.isActive ? 'text-emerald-600 hover:text-emerald-700' : 'text-stone-400 hover:text-stone-500'
                          }`}
                          title={city.isActive ? 'غیرفعال‌سازی دریافت سفارش' : 'فعال‌سازی دریافت سفارش'}
                        >
                          {city.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                        </button>
                      </div>

                      {/* Partner registration toggle */}
                      <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        city.isPartnerRegistrationActive 
                          ? 'bg-blue-50/50 border-blue-200' 
                          : 'bg-stone-50 border-stone-200'
                      }`}>
                        <div>
                          <span className="text-xs font-bold text-stone-800 block">ثبت‌نام همکار پرده‌فروش:</span>
                          <span className={`text-[10px] block mt-0.5 font-medium ${
                            city.isPartnerRegistrationActive ? 'text-blue-700' : 'text-stone-500'
                          }`}>
                            {city.isPartnerRegistrationActive ? 'فرم جذب همکار باز است' : 'جذب متوقف'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleCityPartnerActive(city.id)}
                          className={`p-1 rounded-xl transition-all cursor-pointer ${
                            city.isPartnerRegistrationActive ? 'text-blue-600 hover:text-blue-700' : 'text-stone-400 hover:text-stone-500'
                          }`}
                          title={city.isPartnerRegistrationActive ? 'توقف جذب همکار' : 'فعال‌سازی جذب همکار'}
                        >
                          {city.isPartnerRegistrationActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                        </button>
                      </div>
                    </div>

                    {/* Covered Districts */}
                    <div className="pt-2 border-t border-stone-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-stone-700">
                          مناطق و محله‌های تحت پوشش ({city.districts ? city.districts.length : 0} منطقه):
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCity(city);
                            setIsCityModalOpen(true);
                          }}
                          className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                        >
                          مدیریت محله‌ها
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {city.districts && city.districts.length > 0 ? (
                          city.districts.map((dst, idx) => (
                            <span key={idx} className="text-[11px] px-2.5 py-1 bg-stone-100 rounded-lg text-stone-700 font-medium">
                              {dst}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-stone-400">تمام مناطق شهر</span>
                        )}
                      </div>
                    </div>

                    {/* Hub & Satellite Linkage Preview */}
                    {city.isHub ? (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-amber-700" />
                            <span>کلان‌شهر قطب (شهر اصلی)</span>
                          </span>
                          <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                            {city.satelliteCities?.length || 0} شهر و روستای اقماری متصل
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          سفارشات شهرهای فرعی زیر به صورت خودکار در تابلوی شکار پرده‌فروشان {city.name} منتشر می‌شوند:
                        </p>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {(city.satelliteCities || []).map((sat, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-white text-amber-950 border border-amber-300 rounded-md font-bold shadow-2xs">
                              🛰️ {sat}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : city.parentHubCityName ? (
                      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-black text-blue-900">
                            <span>🛰️ متصل به قطب: {city.parentHubCityName}</span>
                            {city.distanceKmFromHub && (
                              <span className="text-[10px] text-blue-700 font-mono">
                                ({city.distanceKmFromHub} کیلومتر)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-blue-700 block">
                            سفارشات این شهر در تابلوی شکار فروشندگان {city.parentHubCityName} نیز نمایش داده می‌شود.
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold shrink-0 border border-emerald-300">
                          اشتراک فعال ✓
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: CONTENT MODERATION (PORTFOLIOS & CATALOGS) */}
      {/* ========================================================= */}
      {activeSection === 'content_moderation' && (() => {
        const allPortfolioItems: (VendorPortfolioItem & { vendorCity?: string })[] = vendors.flatMap((v) =>
          (v.portfolio || []).map((p) => ({
            ...p,
            vendorName: p.vendorName || v.name,
            vendorId: p.vendorId || v.id,
            vendorCity: v.city,
          }))
        );

        const pendingPortfolios = allPortfolioItems.filter((p) => p.status === 'pending');
        const approvedPortfolios = allPortfolioItems.filter((p) => p.status === 'approved');
        const rejectedPortfolios = allPortfolioItems.filter((p) => p.status === 'rejected');

        const filteredPortfolios = allPortfolioItems.filter((item) => {
          const matchesStatus = portfolioStatusFilter === 'all' || item.status === portfolioStatusFilter;
          const matchesVendor = portfolioVendorFilter === 'all' || item.vendorId === portfolioVendorFilter;
          return matchesStatus && matchesVendor;
        });

        return (
          <div className="mt-8 space-y-6 text-right">
            {/* Header Banner */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-purple-700" />
                  <span>سامانه نظارت، پایش کیفیت و تایید محتوای ارسالی همکاران</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  بررسی و تایید دستی نمونه‌کارهای اجرایی ارسالی همکاران (فرمت استاندارد ۱۲۰۰×۸۰۰ JPG) و کالیته‌های سفارشی طبق ضوابط رسمی اتحادیه.
                </p>
              </div>

              {/* Sub-tabs switch */}
              <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setModerationSubTab('portfolios')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    moderationSubTab === 'portfolios'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>تایید نمونه‌کارهای همکاران</span>
                  {pendingPortfolios.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono">
                      {pendingPortfolios.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModerationSubTab('catalogs')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    moderationSubTab === 'catalogs'
                      ? 'bg-purple-800 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>کالیته‌ها و امکانات سفارشی</span>
                  {vendorSubmissions.filter((s) => s.status === 'pending_approval').length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-mono">
                      {vendorSubmissions.filter((s) => s.status === 'pending_approval').length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* SUBTAB 1: PORTFOLIO ITEMS MANUAL REVIEW */}
            {moderationSubTab === 'portfolios' && (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-4 text-right">
                    <span className="text-xs text-amber-800 font-bold block mb-1">
                      نیازمند تایید دستی مدیر:
                    </span>
                    <span className="text-2xl font-black text-amber-950 font-mono">
                      {pendingPortfolios.length} <span className="text-xs font-normal text-amber-800">نمونه‌کار</span>
                    </span>
                    <p className="text-[11px] text-amber-700 mt-1">
                      تا قبل از تایید مدیر، بر روی سایت به مشتریان نمایش داده نمی‌شود.
                    </p>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-4 text-right">
                    <span className="text-xs text-emerald-800 font-bold block mb-1">
                      تایید شده و فعال در ویترین:
                    </span>
                    <span className="text-2xl font-black text-emerald-950 font-mono">
                      {approvedPortfolios.length} <span className="text-xs font-normal text-emerald-800">نمونه‌کار</span>
                    </span>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      در آلبوم نمونه‌کار فروشگاه‌ها و صفحه اصلی قابل مشاهده برای مشتریان است.
                    </p>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-3xl p-4 text-right">
                    <span className="text-xs text-stone-600 font-bold block mb-1">
                      رد شده توسط ناظر:
                    </span>
                    <span className="text-2xl font-black text-stone-900 font-mono">
                      {rejectedPortfolios.length} <span className="text-xs font-normal text-stone-500">مورد</span>
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1">
                      عدم انطباق با ابعاد ۱۲۰۰×۸۰۰ یا ضوابط اتحادیه.
                    </p>
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-3xl border border-stone-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-stone-700">فیلتر وضعیت:</span>
                    <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs">
                      {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setPortfolioStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            portfolioStatusFilter === st
                              ? 'bg-white text-stone-900 shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {st === 'all' && `همه (${allPortfolioItems.length})`}
                          {st === 'pending' && `در انتظار تایید (${pendingPortfolios.length})`}
                          {st === 'approved' && `تایید شده (${approvedPortfolios.length})`}
                          {st === 'rejected' && `رد شده (${rejectedPortfolios.length})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-stone-500 font-medium">فروشگاه:</span>
                    <select
                      value={portfolioVendorFilter}
                      onChange={(e) => setPortfolioVendorFilter(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium outline-none focus:border-amber-500"
                    >
                      <option value="all">تمام فروشگاه‌ها</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Portfolio Items Grid */}
                {filteredPortfolios.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center text-stone-500 text-xs space-y-2">
                    <ImageIcon className="w-10 h-10 text-stone-300 mx-auto" />
                    <p className="font-bold text-stone-700">
                      هیچ نمونه‌کاری با فیلتر انتخابی یافت نشد.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredPortfolios.map((item) => {
                      const isPending = item.status === 'pending';
                      const isApproved = item.status === 'approved';
                      const isRejected = item.status === 'rejected';

                      return (
                        <div
                          key={item.id}
                          className={`bg-white rounded-3xl border overflow-hidden shadow-xs flex flex-col justify-between transition-all ${
                            isPending
                              ? 'border-amber-300 ring-2 ring-amber-100'
                              : isApproved
                              ? 'border-emerald-200'
                              : 'border-stone-200 opacity-80'
                          }`}
                        >
                          <div>
                            {/* 1200x800 Aspect Ratio Image Preview */}
                            <div className="relative aspect-[3/2] bg-stone-100 overflow-hidden group">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                onClick={() => setPortfolioPreviewImage(item.imageUrl)}
                              />
                              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                {isPending && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
                                    در انتظار تایید دستی مدیر
                                  </span>
                                )}
                                {isApproved && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>تایید شده و فعال روی سایت</span>
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-sm">
                                    رد شده توسط مدیر
                                  </span>
                                )}
                              </div>

                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs">
                                استاندارد ۱۲۰۰×۸۰۰ JPG
                              </span>
                            </div>

                            {/* Content Details */}
                            <div className="p-4 sm:p-5 space-y-2.5">
                              <div className="flex items-center justify-between text-xs text-stone-500">
                                <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                                  {item.vendorName}
                                </span>
                                {item.vendorCity && (
                                  <span className="text-[11px] text-stone-400">شهر: {item.vendorCity}</span>
                                )}
                              </div>

                              <h3 className="font-black text-stone-900 text-sm leading-snug">
                                {item.title}
                              </h3>

                              {item.description && (
                                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                                  {item.description}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 pt-1">
                                {item.category && (
                                  <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium">
                                    فضای: {item.category}
                                  </span>
                                )}
                                <span>ارسال: <strong className="font-mono">{item.createdAt}</strong></span>
                                {item.approvedAt && (
                                  <span className="text-emerald-700 font-medium">
                                    تایید: <strong className="font-mono">{item.approvedAt}</strong>
                                  </span>
                                )}
                              </div>

                              {item.rejectionReason && (
                                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                                  <strong>علت رد:</strong> {item.rejectionReason}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Approval Actions */}
                          <div className="p-4 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row gap-2">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onModeratePortfolioItem) {
                                      onModeratePortfolioItem(item.vendorId, item.id, 'approved');
                                    }
                                  }}
                                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                  <span>تایید دستی و انتشار روی سایت</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const reason = prompt('علت رد این نمونه‌کار را برای اصلاح توسط همکار بنویسید:', 'عدم وضوح کافی تصویر یا عدم تطابق با موضوع پرده');
                                    if (reason && onModeratePortfolioItem) {
                                      onModeratePortfolioItem(item.vendorId, item.id, 'rejected', reason);
                                    }
                                  }}
                                  className="px-3 py-2.5 bg-white hover:bg-rose-50 text-rose-700 border border-stone-200 hover:border-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>رد نمونه‌کار</span>
                                </button>
                              </>
                            ) : isApproved ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const reason = prompt('علت لغو تایید این نمونه‌کار را وارد کنید:');
                                  if (reason && onModeratePortfolioItem) {
                                    onModeratePortfolioItem(item.vendorId, item.id, 'rejected', reason);
                                  }
                                }}
                                className="w-full py-2 bg-white hover:bg-rose-50 text-rose-700 border border-stone-200 hover:border-rose-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors text-center"
                              >
                                لغو تایید و تعلیق نمایش
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (onModeratePortfolioItem) {
                                    onModeratePortfolioItem(item.vendorId, item.id, 'approved');
                                  }
                                }}
                                className="w-full py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-stone-200 hover:border-emerald-300 rounded-xl text-xs font-bold cursor-pointer transition-colors text-center"
                              >
                                بازبینی مجدد و تایید نمونه‌کار
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Lightbox Preview Dialog */}
                {portfolioPreviewImage && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-3xl w-full p-4 text-right shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <span className="text-xs font-bold text-stone-700">پیش‌نمایش تصویر استاندارد ۱۲۰۰×۸۰۰ پیکسل</span>
                        <button
                          type="button"
                          onClick={() => setPortfolioPreviewImage(null)}
                          className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="aspect-[3/2] rounded-2xl overflow-hidden bg-black">
                        <img src={portfolioPreviewImage} alt="پیش‌نمایش نمونه‌کار" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 2: VENDOR CUSTOM CATALOG CONTENT MODERATION */}
            {moderationSubTab === 'catalogs' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {vendorSubmissions.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500 text-xs">
                      در حال حاضر هیچ کالیته یا امکان ارسالی در صف انتظار قرار ندارد.
                    </div>
                  ) : (
                    vendorSubmissions.map((sub) => {
                      const isPending = sub.status === 'pending_approval';
                      const isApproved = sub.status === 'approved';
                      const isRejected = sub.status === 'rejected';

                      return (
                        <div
                          key={sub.id}
                          className={`bg-white rounded-3xl border p-6 shadow-xs transition-all ${
                            isPending ? 'border-purple-300 ring-2 ring-purple-50' : 'border-stone-200'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black text-base text-stone-900">{sub.catalogName}</span>
                                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700">
                                  دسته‌بندی: {sub.category}
                                </span>
                                <span className="text-xs text-stone-500">
                                  فروشگاه: <strong className="text-stone-800">{sub.vendorName}</strong>
                                </span>

                                {isPending && (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    در انتظار تایید ناظر
                                  </span>
                                )}
                                {isApproved && (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                    تایید شده و منتشر روی سایت
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">
                                    رد شده توسط ناظر
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200 leading-relaxed">
                                <strong>توضیحات ارسالی فروشگاه:</strong> {sub.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                                {sub.texture && <span>بافت: <strong>{sub.texture}</strong></span>}
                                {sub.origin && <span>مبدا: <strong>{sub.origin}</strong></span>}
                                <span>تاریخ ارسال: <strong className="font-mono">{sub.submittedAt}</strong></span>
                              </div>

                              {sub.moderatorFeedback && (
                                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                                  <strong>بازخورد ناظر سیستم:</strong> {sub.moderatorFeedback}
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 justify-center">
                              {isPending ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onModerateSubmission) {
                                        onModerateSubmission(sub.id, 'approved', 'محتوا تایید و به لیست اختصاصی اضافه گردید.');
                                      }
                                    }}
                                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>تایید و انتشار روی سایت</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const feedback = prompt('دلیل رد این کالیته را بنویسید (جهت اصلاح توسط فروشگاه):', 'عدم رعایت نگارش صحیح یا نیاز به توضیحات بیشتر');
                                      if (feedback && onModerateSubmission) {
                                        onModerateSubmission(sub.id, 'rejected', feedback);
                                      }
                                    }}
                                    className="px-4 py-2 bg-stone-100 hover:bg-red-50 text-red-700 border border-transparent hover:border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>رد محتوا با بازخورد</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onModerateSubmission) {
                                      onModerateSubmission(sub.id, isApproved ? 'rejected' : 'approved', 'تغییر وضعیت توسط مدیر');
                                    }
                                  }}
                                  className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer"
                                >
                                  تغییر وضعیت
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}
      {activeSection === 'orders' && (
        <div className="mt-8 space-y-6 text-right">
          
          {/* Controls & Search */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-500 font-bold">فیلتر وضعیت:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-medium"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="bidding">در تابلوی مزایده (bidding)</option>
                <option value="assigned">واگذار شده (assigned)</option>
                <option value="visited">فاکتور صادر شده (visited)</option>
                <option value="re_routed">درخواست فروشگاه دوم (re_routed)</option>
                <option value="approved">تایید و دوخت (approved)</option>
                <option value="installed">نصب نهایی (installed)</option>
              </select>
            </div>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجوی نام مشتری، تلفن، کد سفارش..."
                className="w-full pl-3 pr-9 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>

          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-stone-100/70 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">کد سفارش</th>
                    <th className="p-3.5">نام و مشخصات مشتری</th>
                    <th className="p-3.5">شهر و محله</th>
                    <th className="p-3.5">ابعاد و پنجره‌ها</th>
                    <th className="p-3.5">فروشگاه مجری</th>
                    <th className="p-3.5">بیعانه دریافتی</th>
                    <th className="p-3.5">وضعیت جاری</th>
                    <th className="p-3.5 text-center">عملیات نظارتی و ویرایش</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-stone-900">{order.orderNumber}</td>
                      <td className="p-3.5 font-medium text-stone-800">
                        <div className="font-bold">{order.customerName}</div>
                        <div className="text-[11px] text-stone-400 font-mono mt-0.5">{order.phone}</div>
                      </td>
                      <td className="p-3.5 text-stone-600">
                        <div>{order.city}، {order.district}</div>
                        <div className="text-[10px] text-stone-400 truncate max-w-xs">{order.address}</div>
                      </td>
                      <td className="p-3.5 font-mono tabular-nums">
                        {order.approximateWindows} پنجره ({order.approximateWidthMeters} م)
                      </td>
                      <td className="p-3.5 text-stone-800 font-medium">
                        {order.assignedVendorName ? (
                          <span className="text-stone-900 font-semibold">{order.assignedVendorName}</span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">در انتظار شکار</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-emerald-700 font-bold">
                        {formatNumber(order.depositAmount || 350000)} ت
                      </td>
                      <td className="p-3.5">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200 whitespace-nowrap">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingOrder(order)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="ویرایش مشخصات مشتری یا سفارش"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-amber-700" />
                            <span>ویرایش</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, 'bidding')}
                            title="بازگرداندن به تابلوی مزایده منطقه"
                            className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            مزایده مجدد
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: VENDORS MANAGEMENT & EDITING */}
      {/* ========================================================= */}
      {activeSection === 'vendors' && (
        <div className="mt-8 space-y-6 text-right">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-stone-900">
                شبکه فروشگاه‌های همکار و کارشناسان کالیته در منزل
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                نظارت بر مجوزهای صنفی، تخصیص کالیته‌ها، موجودی کیف پول و ویرایش مشخصات هر فروشگاه
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
              {vendors.length} فروشگاه عضو
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map((vendor) => (
              <div 
                key={vendor.id} 
                className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-stone-900">{vendor.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          {vendor.tier}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">
                        مدیر: {vendor.ownerName} · <span className="font-mono">{vendor.phone}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingVendor(vendor)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-amber-700" />
                      <span>ویرایش اطلاعات</span>
                    </button>
                  </div>

                  <div className="text-xs text-stone-600 mt-3 flex items-center gap-1.5">
                    <span className="text-stone-400">مناطق:</span>
                    <span className="truncate">{vendor.coveredDistricts.join('، ')}</span>
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-4 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                  <div>
                    <span className="text-stone-400 block text-[10px]">امتیاز کیفیت:</span>
                    <span className="font-bold text-stone-800 font-mono tabular-nums">{vendor.rating} ★</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">تعداد ویزیت:</span>
                    <span className="font-bold text-stone-800 font-mono tabular-nums">{vendor.completedVisits}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">سفارشات موفق:</span>
                    <span className="font-bold text-emerald-700 font-mono tabular-nums">{vendor.successfulOrders}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">موجودی کیف:</span>
                    <span className="font-bold text-amber-800 font-mono tabular-nums">{formatNumber(vendor.walletBalance || 0)} ت</span>
                  </div>
                </div>

                {/* Catalogs count & Verification status */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <div className="text-stone-500">
                    <span className="font-bold text-stone-700">{(vendor.availableCatalogIds || []).length} کالیته</span> در کیف کارشناس
                  </div>

                  <button
                    onClick={() => onToggleVendorVerification(vendor.id)}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                      vendor.isVerified
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{vendor.isVerified ? 'پروانه تایید شده' : 'نیازمند بررسی مدارک'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: MASTER FABRIC CATALOGS (CMS) */}
      {/* ========================================================= */}
      {activeSection === 'catalog_categories' && (
        <AdminCatalogCategories
          categories={catalogCategories}
          onChange={(next) => onCatalogCategoriesChange?.(next)}
        />
      )}

      {activeSection === 'catalog_styles' && (
        <AdminCatalogStyles
          entries={catalogEntries}
          onSave={(e) => onSaveCatalogEntry?.(e)}
          onDelete={(id) => onDeleteCatalogEntry?.(id)}
          onToggleActive={(id) => onToggleCatalogEntry?.(id)}
          onReset={() => onResetCatalogEntries?.()}
          groups={catalogGroups}
          onSaveGroup={(g, k) => onSaveCatalogGroup?.(g, k)}
          onDeleteGroup={(c, k) => onDeleteCatalogGroup?.(c, k)}
        />
      )}

      {activeSection === 'master_catalogs' && (
        <div className="mt-8 space-y-6 text-right">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-stone-900">
                کاتالوگ جامع کالیته‌های مرجع سیستم (Master Catalogs)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                تعریف پارچه‌ها و کالیته‌های استاندارد که فروشگاه‌های همکار می‌توانند در کیف کارشناس اعزامی خود انتخاب کنند.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingCatalog(null);
                setIsNewCatalogModalOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>تعریف کالیته جدید</span>
            </button>
          </div>

          {/* Master Catalogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {masterCatalogs.map((catalog) => (
              <div 
                key={catalog.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                    <img 
                      src={catalog.imageUrl} 
                      alt={catalog.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-stone-800 border border-stone-200">
                      {catalog.code}
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-medium">
                      {catalog.category}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-stone-900 leading-snug">
                      {catalog.name}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {catalog.description}
                    </p>

                    <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                      <div>
                        <span className="text-stone-400">بافت: </span>
                        <span>{catalog.texture}</span>
                      </div>
                      <div>
                        <span className="text-stone-400">کشور: </span>
                        <span>{catalog.origin}</span>
                      </div>
                      <div>
                        <span className="text-stone-400">تنوع رنگ: </span>
                        <span className="font-mono">{catalog.colorsCount} رنگ</span>
                      </div>
                      <div>
                        <span className="text-stone-400">قیمت تخمینی: </span>
                        <span className="font-mono font-bold text-amber-800">{formatNumber(catalog.suggestedUnitPrice)} ت</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    catalog.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-400'
                  }`}>
                    {catalog.isAvailable ? 'فعال در سیستم' : 'غیرفعال'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingCatalog(catalog)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-stone-600" />
                      <span>ویرایش</span>
                    </button>

                    {onDeleteMasterCatalog && (
                      <button
                        type="button"
                        onClick={() => onDeleteMasterCatalog(catalog.id)}
                        className="p-1 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف کالیته"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 5: CUSTOM PAGES (CMS) */}
      {/* ========================================================= */}
      {activeSection === 'pages' && (
        <div className="mt-8 space-y-6 text-right">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-stone-900">
                مدیریت برگه‌ها، صفحات و لینک‌های سایت (CMS Pages)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                ایجاد صفحات جدید (درباره ما، قوانین بیعانه، ضمانت تطابق، استخدام) با امکان لینک‌دهی در هدر و فوتر سایت.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingPage(null);
                setIsNewPageModalOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>ایجاد برگه جدید</span>
            </button>
          </div>

          {/* Custom Pages Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-stone-100/70 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">عنوان برگه</th>
                    <th className="p-3.5">آدرس صفحه (Slug)</th>
                    <th className="p-3.5">موقعیت لینک</th>
                    <th className="p-3.5">وضعیت انتشار</th>
                    <th className="p-3.5">آخرین ویرایش</th>
                    <th className="p-3.5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customPages.map((page) => (
                    <tr key={page.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">
                        <div>{page.title}</div>
                        {page.metaDescription && (
                          <div className="text-[11px] text-stone-400 font-normal line-clamp-1">{page.metaDescription}</div>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-stone-500" dir="ltr">
                        /{page.slug}
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {page.showInHeaderNav && (
                            <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium">منوی بالا</span>
                          )}
                          {page.showInFooterNav && (
                            <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">فوتر</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          page.published ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-400'
                        }`}>
                          {page.published ? 'منتشر شده' : 'پیش‌نویس'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-stone-400">
                        {page.updatedAt}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onPreviewCustomPage && (
                            <button
                              type="button"
                              onClick={() => onPreviewCustomPage(page)}
                              className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                              title="مشاهده صفحه"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingPage(page)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-amber-700" />
                            <span>ویرایش</span>
                          </button>
                          {onDeleteCustomPage && (
                            <button
                              type="button"
                              onClick={() => onDeleteCustomPage(page.id)}
                              className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف صفحه"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 6: SITE CUSTOMIZER (THEMES, STYLES, FONTS, COLORS) */}
      {/* ========================================================= */}
      {activeSection === 'site_customizer' && (
        <div className="mt-8 space-y-6 text-right">
          
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <Palette className="w-6 h-6 text-rose-600" />
                <span>ویرایشگر دیداری صفحه اصلی، سربرگ (هدر)، پاورقی (فوتر) و هویت بصری</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                کلیه عناصر ظاهری، شعارها، متون صفحه اصلی، شماره‌های تماس و پیام‌های نظارت اتحادیه را بدون نیاز به کدنویسی تغییر دهید.
              </p>
            </div>

            {/* Sub Tabs for Customizer */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setCustomizerSubTab('homepage')}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  customizerSubTab === 'homepage' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5 inline ml-1 text-amber-700" />
                <span>صفحه اصلی (Home)</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomizerSubTab('header_nav')}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  customizerSubTab === 'header_nav' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Navigation className="w-3.5 h-3.5 inline ml-1 text-blue-700" />
                <span>سربرگ و نوبار (Header)</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomizerSubTab('footer')}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  customizerSubTab === 'footer' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <PanelBottom className="w-3.5 h-3.5 inline ml-1 text-purple-700" />
                <span>پاورقی و اتحادیه (Footer)</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomizerSubTab('styles_branding')}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  customizerSubTab === 'styles_branding' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 inline ml-1 text-emerald-700" />
                <span>رنگ، فونت و تعرفه‌ها</span>
              </button>
            </div>
          </div>

          {themeSaveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>تنظیمات و تغییرات جدید با موفقیت ذخیره شد و در سراسر سایت اعمال گردید.</span>
            </div>
          )}

          <form onSubmit={handleSaveThemeSettings} className="space-y-6">

            {/* SUB-TAB 1: HOMEPAGE CMS */}
            {customizerSubTab === 'homepage' && (
              <div className="space-y-6">
                {/* Hero Section Banner */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <LayoutTemplate className="w-4 h-4 text-amber-700" />
                    <span>بخش بنر هیرو صفحه اصلی (Hero Section):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">تیتر اصلی و بزرگ هیرو (Hero Title):</label>
                      <input
                        type="text"
                        value={draftTheme.heroTitle}
                        onChange={(e) => setDraftTheme({ ...draftTheme, heroTitle: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">متن توضیحی زیر تیتر هیرو (Hero Subtitle):</label>
                      <textarea
                        rows={2}
                        value={draftTheme.heroSubtitle}
                        onChange={(e) => setDraftTheme({ ...draftTheme, heroSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">متن نشان زرین و برچسب ویژه بنر (Hero Badge):</label>
                      <input
                        type="text"
                        value={draftTheme.heroBadge}
                        onChange={(e) => setDraftTheme({ ...draftTheme, heroBadge: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">آدرس تصویر پس‌زمینه هیرو (Hero Image URL):</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftTheme.heroImageUrl}
                        onChange={(e) => setDraftTheme({ ...draftTheme, heroImageUrl: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono text-left"
                      />
                    </div>
                  </div>

                  {/* Preset images */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-stone-600 block mb-2">تصاویر پیش‌فرض باکیفیت:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'پرده سالن لوکس', url: '/images/hero_curtain_luxury_living_1790237028961.jpg' },
                        { label: 'سبک مینیمال مدرن', url: '/images/blog_curtain_styling_1790237071088.jpg' },
                        { label: 'مشاوره پرو در خانه', url: '/images/curtain_specialist_visit_1790237059005.jpg' },
                        { label: 'کالیته پارچه و چمدان', url: '/images/fabric_swatches_velvet_1790237044606.jpg' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDraftTheme({ ...draftTheme, heroImageUrl: preset.url })}
                          className={`relative aspect-[16/10] rounded-xl overflow-hidden border transition-all cursor-pointer ${
                            draftTheme.heroImageUrl === preset.url
                              ? 'ring-2 ring-amber-700 border-amber-700 shadow-sm'
                              : 'border-stone-200 hover:opacity-80'
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] py-1 text-center font-bold">
                            {preset.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Homepage Sections Texts */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <Sliders className="w-4 h-4 text-purple-700" />
                    <span>متون بخش‌های صفحه اصلی و ضمانت اتحادیه:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">تیتر بخش «چگونه کار می‌کند»:</label>
                      <input
                        type="text"
                        value={draftTheme.howItWorksTitle || 'چطور پرده، کاغذ دیواری و کفپوش را بدون دردسر به خانه می‌آوریم؟'}
                        onChange={(e) => setDraftTheme({ ...draftTheme, howItWorksTitle: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">زیرعنوان بخش «چگونه کار می‌کند»:</label>
                      <input
                        type="text"
                        value={draftTheme.howItWorksSubtitle || 'از ثبت درخواست تا نصب نهایی — برای پرده، کاغذ دیواری یا کفپوش و پارکت — با شفافیت مالی و امکان مقایسه فروشگاه‌ها'}
                        onChange={(e) => setDraftTheme({ ...draftTheme, howItWorksSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">تیتر بخش کالیته‌ها و آلبوم‌های همراه:</label>
                      <input
                        type="text"
                        value={draftTheme.catalogSectionTitle || 'کالیته‌ها و پارچه‌های همراه کارشناس'}
                        onChange={(e) => setDraftTheme({ ...draftTheme, catalogSectionTitle: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">زیرعنوان بخش کالیته‌ها:</label>
                      <input
                        type="text"
                        value={draftTheme.catalogSectionSubtitle || 'بیش از ۲۰۰ آلبوم پارچه ترک، ایرانی و وارداتی جهت لمس کیفیت در نور واقعی منزل شما'}
                        onChange={(e) => setDraftTheme({ ...draftTheme, catalogSectionSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">متن بیانیه نظارت اتحادیه در صفحه اصلی:</label>
                      <textarea
                        rows={2}
                        value={draftTheme.unionNoticeBanner || 'کلیه سفارشات ثبت شده در سامانه دراپینو تحت پوشش کامل داوری بازرسان رسمی اتحادیه صنف پرده‌فروشان و پارچه‌فروشان قرار دارد.'}
                        onChange={(e) => setDraftTheme({ ...draftTheme, unionNoticeBanner: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Visibility Switches */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span>مدیریت نمایش یا عدم نمایش بخش‌های صفحه اصلی:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {[
                      { key: 'showHeroSection', label: 'بنر هیرو و فراخوان اولیه', defaultVal: true },
                      { key: 'showHowItWorksSection', label: 'بخش ۴ مرحله کارکرد سیستم', defaultVal: true },
                      { key: 'showCatalogSection', label: 'بخش نمونه کالیته‌های پارچه', defaultVal: true },
                      { key: 'showBlogSection', label: 'بخش مقالات و مجله آموزشی', defaultVal: true },
                      { key: 'showTrustBadges', label: 'بخش نمادهای اعتماد و اتحادیه', defaultVal: true },
                    ].map((item) => {
                      const isVisible = (draftTheme as any)[item.key] !== false;
                      return (
                        <div key={item.key} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-800">{item.label}</span>
                          <button
                            type="button"
                            onClick={() => setDraftTheme({ ...draftTheme, [item.key]: !isVisible })}
                            className={`p-1 rounded-xl cursor-pointer ${isVisible ? 'text-emerald-700' : 'text-stone-400'}`}
                          >
                            {isVisible ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: HEADER & NAV */}
            {customizerSubTab === 'header_nav' && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <Navigation className="w-4 h-4 text-blue-700" />
                  <span>تنظیمات سربرگ و نوار بالایی سایت (Header & Top Notice):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      متن پیام اعلان نوار بالای هدر (Header Top Notice Bar):
                    </label>
                    <input
                      type="text"
                      value={draftTheme.headerTopNotice || 'طرح رسمی پرو و انتخاب کالیته در منزل با نظارت بازرسان اتحادیه | بیعانه ۳۵۰ هزار تومان'}
                      onChange={(e) => setDraftTheme({ ...draftTheme, headerTopNotice: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">نام برند در هدر (Wordmark):</label>
                    <input
                      type="text"
                      value={draftTheme.siteName}
                      onChange={(e) => setDraftTheme({ ...draftTheme, siteName: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">شعار برند در کنار لوگو:</label>
                    <input
                      type="text"
                      value={draftTheme.tagline}
                      onChange={(e) => setDraftTheme({ ...draftTheme, tagline: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">تلفن تماس مستقیم در هدر:</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={draftTheme.headerPhone || draftTheme.supportPhone}
                      onChange={(e) => setDraftTheme({ ...draftTheme, headerPhone: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">متن دکمه ثبت سفارش در هدر:</label>
                    <input
                      type="text"
                      value={draftTheme.headerCtaText || 'درخواست پرو پرده در منزل'}
                      onChange={(e) => setDraftTheme({ ...draftTheme, headerCtaText: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-bold"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">نمایش نوار اعلان بالای هدر:</span>
                    <span className="text-[10px] text-stone-500">نوار تیره یا طلایی بالای صفحه برای اطلاع‌رسانی مهم</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDraftTheme({ ...draftTheme, showHeaderTopNotice: draftTheme.showHeaderTopNotice === false ? true : false })}
                    className={`p-1 rounded-xl cursor-pointer ${draftTheme.showHeaderTopNotice !== false ? 'text-emerald-700' : 'text-stone-400'}`}
                  >
                    {draftTheme.showHeaderTopNotice !== false ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: FOOTER & LEGAL */}
            {customizerSubTab === 'footer' && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <PanelBottom className="w-4 h-4 text-purple-700" />
                  <span>تنظیمات پاورقی، آدرس و بیانیه حقوقی اتحادیه (Footer & Union Notice):</span>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">متن معرفی کوتاه و بیوگرافی فوتر:</label>
                    <textarea
                      rows={3}
                      value={draftTheme.footerAboutText || 'دراپینو اولین پلتفرم تخصصی اعزام چمدان‌های کالیته پارچه و مشاوره دکوراسیون در منزل با تضمین تعرفه رسمی اتحادیه و بازرسی کیفی است.'}
                      onChange={(e) => setDraftTheme({ ...draftTheme, footerAboutText: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">بیانیه رسمی نظارت اتحادیه در فوتر:</label>
                    <textarea
                      rows={2}
                      value={draftTheme.footerUnionNotice || 'پلتفرم دراپینو دارای شناسه صنفی معتبر از اتحادیه صنف پرده‌دوزان و پارچه‌فروشان بوده و کلیه قراردادها و فاکتورها تحت نظارت مستقیم کمیسیون بازرسی قرار دارند.'}
                      onChange={(e) => setDraftTheme({ ...draftTheme, footerUnionNotice: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">نشانی رسمی دفتر مرکزی:</label>
                      <input
                        type="text"
                        value={draftTheme.footerAddress || 'تهران، خیابان ولیعصر، نرسیده به میدان ونک، برج نگار، طبقه ۱۲'}
                        onChange={(e) => setDraftTheme({ ...draftTheme, footerAddress: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">ساعات کاری و پاسخگویی:</label>
                      <input
                        type="text"
                        value={draftTheme.footerWorkingHours || 'شنبه تا پنج‌شنبه: ۹ الی ۲۱ (جمعه‌ها اعزام با هماهنگی قبلی)'}
                        onChange={(e) => setDraftTheme({ ...draftTheme, footerWorkingHours: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">تلفن خط ویژه پشتیبانی فوتر:</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftTheme.footerPhone || draftTheme.supportPhone}
                        onChange={(e) => setDraftTheme({ ...draftTheme, footerPhone: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono text-left"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">تلفن اضطراری بازرسی:</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftTheme.footerEmergencyPhone || '۰۹۱۲۹۹۹۸۸۷۷'}
                        onChange={(e) => setDraftTheme({ ...draftTheme, footerEmergencyPhone: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono text-left"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">متن حق نشر و کپی‌رایت:</label>
                      <input
                        type="text"
                        value={draftTheme.footerCopyright || 'تمامی حقوق مادی و معنوی متعلق به سامانه جامع دراپینو و اتحادیه صنف پرده‌فروشان می‌باشد.'}
                        onChange={(e) => setDraftTheme({ ...draftTheme, footerCopyright: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: STYLES, BRANDING & FINANCIAL FEES */}
            {customizerSubTab === 'styles_branding' && (
              <div className="space-y-6">
                {/* Logo & Favicon */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-5 shadow-xs" data-testid="branding-card">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <ImageIcon className="w-4 h-4 text-amber-700" />
                    <span>لوگو و آیکن سایت (Favicon):</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Logo */}
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold text-stone-700">لوگوی سایت (نمایش در هدر و فوتر)</label>
                      <div className="h-24 rounded-2xl border border-dashed border-stone-300 bg-stone-50 flex items-center justify-center overflow-hidden">
                        {draftTheme.logoUrl ? (
                          <img src={draftTheme.logoUrl} alt="لوگو" data-testid="logo-preview" className="max-h-20 max-w-[85%] object-contain" />
                        ) : (
                          <span className="text-[11px] text-stone-400">لوگویی انتخاب نشده؛ حرف اول نام سایت نمایش داده می‌شود</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-bold cursor-pointer">
                          آپلود لوگو
                          <input type="file" accept="image/*" className="hidden" data-testid="logo-file" onChange={(e) => handleBrandingFile('logo', e)} />
                        </label>
                        {draftTheme.logoUrl && (
                          <button type="button" data-testid="logo-remove" onClick={() => setDraftTheme({ ...draftTheme, logoUrl: '' })} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold cursor-pointer">حذف لوگو</button>
                        )}
                      </div>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftTheme.logoUrl && !draftTheme.logoUrl.startsWith('data:') ? draftTheme.logoUrl : ''}
                        onChange={(e) => setDraftTheme({ ...draftTheme, logoUrl: e.target.value })}
                        placeholder="یا آدرس تصویر: https://… یا /images/logo.png"
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-left"
                      />
                      <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input type="checkbox" checked={draftTheme.logoShowName !== false} onChange={(e) => setDraftTheme({ ...draftTheme, logoShowName: e.target.checked })} />
                        <span>نام سایت کنار لوگو هم نمایش داده شود</span>
                      </label>
                      <p className="text-[10px] text-stone-400">پیشنهاد: PNG شفاف یا SVG با ارتفاع کم؛ حداکثر ۴۸۰×۱۶۰ پیکسل (خودکار کوچک می‌شود).</p>
                    </div>

                    {/* Favicon */}
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold text-stone-700">آیکن تب مرورگر (Favicon)</label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-2xl border border-dashed border-stone-300 bg-stone-50 flex items-center justify-center overflow-hidden">
                          {draftTheme.faviconUrl ? (
                            <img src={draftTheme.faviconUrl} alt="favicon" data-testid="favicon-preview" className="w-16 h-16 object-contain" />
                          ) : (
                            <span className="text-[10px] text-stone-400 text-center px-2">انتخاب نشده</span>
                          )}
                        </div>
                        {draftTheme.faviconUrl && (
                          <div className="flex items-center gap-2 bg-stone-100 rounded-t-lg px-3 py-2 text-[11px] text-stone-700">
                            <img src={draftTheme.faviconUrl} alt="" className="w-4 h-4 object-contain" />
                            <span>{draftTheme.siteName}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-bold cursor-pointer">
                          آپلود فاوآیکن
                          <input type="file" accept="image/*,.ico" className="hidden" data-testid="favicon-file" onChange={(e) => handleBrandingFile('favicon', e)} />
                        </label>
                        {draftTheme.faviconUrl && (
                          <button type="button" data-testid="favicon-remove" onClick={() => setDraftTheme({ ...draftTheme, faviconUrl: '' })} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold cursor-pointer">حذف</button>
                        )}
                      </div>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftTheme.faviconUrl && !draftTheme.faviconUrl.startsWith('data:') ? draftTheme.faviconUrl : ''}
                        onChange={(e) => setDraftTheme({ ...draftTheme, faviconUrl: e.target.value })}
                        placeholder="یا آدرس: https://… یا /favicon.png"
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-left"
                      />
                      <p className="text-[10px] text-stone-400">پیشنهاد: تصویر مربع (PNG یا ICO)؛ خودکار به ۱۲۸×۱۲۸ برش می‌خورد.</p>
                    </div>
                  </div>
                  {brandingError && <p className="text-xs font-bold text-red-600">{brandingError}</p>}
                  <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">برای اعمال تغییرات، دکمه «ذخیره تنظیمات» پایین همین صفحه را بزنید.</p>
                </div>

                {/* Color Palettes */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <Palette className="w-4 h-4 text-amber-700" />
                    <span>انتخاب پالت رنگ اصلی سامانه (Primary Color):</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                    {[
                      { id: 'amber', name: 'کهربایی لوکس', colorClass: 'bg-amber-700', desc: 'طلایی و اصیل' },
                      { id: 'emerald', name: 'سبز زمردی', colorClass: 'bg-emerald-700', desc: 'آرامش‌بخش و مدرن' },
                      { id: 'indigo', name: 'سرمه‌ای نیلی', colorClass: 'bg-indigo-700', desc: 'رسمی و اداری' },
                      { id: 'rose', name: 'زرشکی رز', colorClass: 'bg-rose-700', desc: 'گرم و دکوراتیو' },
                      { id: 'stone', name: 'ذغالی مدرن', colorClass: 'bg-stone-800', desc: 'مینیمال و صنعتی' },
                    ].map((palette) => {
                      const isSelected = draftTheme.primaryColor === palette.id;
                      return (
                        <button
                          key={palette.id}
                          type="button"
                          onClick={() => setDraftTheme({ ...draftTheme, primaryColor: palette.id as any })}
                          className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-stone-50 border-amber-600 ring-2 ring-amber-600/20 shadow-xs'
                              : 'bg-white border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`w-6 h-6 rounded-full ${palette.colorClass} shadow-xs`} />
                            {isSelected && <Check className="w-4 h-4 text-amber-700" />}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-stone-900">{palette.name}</div>
                            <div className="text-[10px] text-stone-400 mt-0.5">{palette.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography & Rounding */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <Type className="w-4 h-4 text-amber-700" />
                    <span>تنظیمات تایپوگرافی، استایل فونت و گوشه‌ها (Border Radius):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">فونت پیش‌فرض پلتفرم:</label>
                      <select
                        value={draftTheme.fontFamily}
                        onChange={(e) => setDraftTheme({ ...draftTheme, fontFamily: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-700"
                      >
                        <option value="Vazirmatn">فونت وزیرمتن (Vazirmatn - مدرن و خوانا)</option>
                        <option value="IranYekan">فونت ایران‌یکان (استاندارد شرکتی)</option>
                        <option value="Shabnam">فونت شبنم (هندسی و لوکس)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">انحنای دکمه‌ها و کادرها (Corner Radius):</label>
                      <select
                        value={draftTheme.borderRadius}
                        onChange={(e) => setDraftTheme({ ...draftTheme, borderRadius: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-700"
                      >
                        <option value="rounded-2xl">گوشه‌های نرم و لوکس (Rounded 2XL - پیشنهادی)</option>
                        <option value="rounded-3xl">گوشه‌های بسیار گرد و مدرن (Rounded 3XL)</option>
                        <option value="rounded-xl">گوشه‌های متوسط و کلاسیک (Rounded XL)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Financial Parameters & Support Info */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>پارامترهای مالی و پشتیبانی سامانه:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">بیعانه پیش‌فرض سراسری (تومان):</label>
                      <input
                        type="number"
                        step="50000"
                        value={draftTheme.customerDepositFee}
                        onChange={(e) => setDraftTheme({ ...draftTheme, customerDepositFee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono font-bold"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">فقط برای شهرهایی که مبلغ بیعانه اختصاصی ندارند. مبلغ هر شهر را از بخش «افزودن/ویرایش شهر» تعیین کنید.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">هزینه شکار سفارش همکار (تومان):</label>
                      <input
                        type="number"
                        step="50000"
                        value={draftTheme.vendorLeadFee}
                        onChange={(e) => setDraftTheme({ ...draftTheme, vendorLeadFee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono font-bold"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">پیش‌فرض: ۵۵۰,۰۰۰ ت</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">شماره تلفن پشتیبانی:</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftTheme.supportPhone}
                        onChange={(e) => setDraftTheme({ ...draftTheme, supportPhone: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono text-left"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">ایمیل رسمی سامانه:</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftTheme.supportEmail}
                        onChange={(e) => setDraftTheme({ ...draftTheme, supportEmail: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono text-left"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره تمامی تنظیمات صفحه اصلی، هدر، فوتر و استایل‌ها</span>
              </button>
            </div>

          </form>

        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 7: BLOG & ARTICLES MANAGER */}
      {/* ========================================================= */}
      {activeSection === 'blogs' && (
        <div className="mt-8 space-y-6 text-right">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
            <h4 className="font-black text-sm text-stone-900">دسته‌بندی مقالات</h4>
            <div className="flex flex-wrap gap-2">
              {blogCategories.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-[11px] font-bold">
                  {c.name}
                  <button
                    type="button"
                    className="text-rose-600 cursor-pointer"
                    onClick={() => onSaveBlogCategories?.(blogCategories.filter((x) => x.id !== c.id))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newBlogCategoryName}
                onChange={(e) => setNewBlogCategoryName(e.target.value)}
                placeholder="نام دسته جدید"
                className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs"
              />
              <button
                type="button"
                className="px-3 py-2 rounded-xl bg-stone-900 text-amber-400 text-xs font-bold cursor-pointer"
                onClick={() => {
                  const name = newBlogCategoryName.trim();
                  if (!name) return;
                  onSaveBlogCategories?.([
                    ...blogCategories,
                    { id: `bc-${Date.now()}`, name, slug: slugifyFa(name), isActive: true },
                  ]);
                  setNewBlogCategoryName('');
                }}
              >
                افزودن دسته
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-stone-900">مدیریت مقالات مجله تخصصی دراپینو:</h3>
              <p className="text-xs text-stone-500">ویرایشگر حرفه‌ای، سئو، لینک داخلی خودکار و باز‌نشر</p>
            </div>

            <button
              onClick={() => { setEditingBlogPost(null); setIsNewBlogModalOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>نگارش مقاله جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="aspect-[16/9] bg-stone-100 overflow-hidden relative">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  {post.seoScore != null && (
                    <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-900/80 text-amber-300">سئو {post.seoScore}٪</span>
                  )}
                </div>
                <div className="p-5 space-y-2">
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    {post.category}
                  </span>
                  <h4 className="font-bold text-sm text-stone-900 leading-snug line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {post.summary}
                  </p>
                  <div className="pt-3 text-[11px] text-stone-400 flex items-center justify-between border-t border-stone-100">
                    <span>نویسنده: {post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </div>

                <button type="button" onClick={() => { setEditingBlogPost(post); setIsNewBlogModalOpen(true); }} className="mx-3 mb-2 py-2 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 cursor-pointer">ویرایش</button>
                {onDeleteBlogPost && (
                  <div className="px-5 pb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onDeleteBlogPost(post.id)}
                      className="text-stone-400 hover:text-red-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف مقاله</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 8: NOTIFICATION & OFFER BROADCAST CENTER */}
      {/* ========================================================= */}
      {activeSection === 'notifications' && (
        <div className="mt-8 space-y-6 text-right">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
              <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-800">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  مرکز ارسال نوتیفیکیشن‌های عمومی و پیشنهادات ویژه
                </h3>
                <p className="text-xs text-stone-500">
                  پیام شما به صورت آنی در گوشه صفحه و لیست اعلان‌های کاربران مقصد نمایش داده خواهد شد.
                </p>
              </div>
            </div>

            {broadcastSuccess && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>اعلان و کد تخفیف با موفقیت به کاربران مقصد ارسال شد.</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="mt-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">مخاطبان دریافت اعلان:</label>
                  <select
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                  >
                    <option value="all">همه کاربران (مشتریان و فروشگاه‌ها)</option>
                    <option value="customer">تنها مشتریان خانگی</option>
                    <option value="vendor">تنها فروشگاه‌های همکار</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">کد تخفیف اختصاصی (اختیاری):</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={broadcastCode}
                    onChange={(e) => setBroadcastCode(e.target.value)}
                    placeholder="AUTOFALL50"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">عنوان اعلان / پیشنهاد ویژه:</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">متن کامل پیام نوتیفیکیشن:</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ارسال همگانی نوتیفیکیشن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          isOpen={true}
          onClose={() => setEditingOrder(null)}
          onSave={(updated) => {
            if (onUpdateOrder) onUpdateOrder(updated);
          }}
        />
      )}

      {/* Edit Vendor Modal */}
      {editingVendor && (
        <EditVendorModal
          vendor={editingVendor}
          masterCatalogs={masterCatalogs}
          isOpen={true}
          onClose={() => setEditingVendor(null)}
          onSave={(updated) => {
            if (onUpdateVendor) onUpdateVendor(updated);
          }}
        />
      )}

      {/* Master Catalog Create/Edit Modal */}
      {(editingCatalog || isNewCatalogModalOpen) && (
        <EditMasterCatalogModal
          materialCategories={catalogCategories.filter((c) => c.isActive)}
          catalog={editingCatalog}
          isOpen={true}
          onClose={() => {
            setEditingCatalog(null);
            setIsNewCatalogModalOpen(false);
          }}
          onSave={(catalogData, existingId) => {
            if (onSaveMasterCatalog) {
              onSaveMasterCatalog(catalogData, existingId);
            }
          }}
        />
      )}

      {/* Custom Page Create/Edit Modal */}
      {(editingPage || isNewPageModalOpen) && (
        <EditCustomPageModal
          page={editingPage}
          isOpen={true}
          onClose={() => {
            setEditingPage(null);
            setIsNewPageModalOpen(false);
          }}
          onSave={(pageData, existingId) => {
            if (onSaveCustomPage) {
              onSaveCustomPage(pageData, existingId);
            }
          }}
        />
      )}

      <AdminBlogEditor
        isOpen={isNewBlogModalOpen}
        onClose={() => { setIsNewBlogModalOpen(false); setEditingBlogPost(null); }}
        initial={editingBlogPost}
        categories={blogCategories}
        allPosts={blogPosts}
        catalogCategories={catalogCategories}
        catalogEntries={catalogEntries}
        onSave={(post) => {
          onAddBlogPost(post as any);
        }}
      />



      {/* ========================================================= */}
      {/* SECTION: BUY BOX MANAGEMENT & SETTINGS */}
      {/* ========================================================= */}
      {activeSection === 'restrictions' && restrictions && (
        <div className="mt-8">
          <AdminRestrictions
            restrictions={restrictions}
            vendors={vendors}
            orders={orders}
            onUpdateSettings={(p) => onUpdateRestrictionSettings?.(p)}
            onAddSuspension={(...a) => onAddSuspension?.(...a)}
            onLiftSuspension={(...a) => onLiftSuspension?.(...a)}
            onReleaseProbation={(...a) => onReleaseProbation?.(...a)}
            onSetVendorBuffer={(...a) => onSetVendorBuffer?.(...a)}
            onApplyDelayPenalty={(...a) => onApplyDelayPenalty?.(...a)}
            onRevokeDelayPenalty={(id) => onRevokeDelayPenalty?.(id)}
            onApplyWalletPenalty={(...a) => onApplyWalletPenalty?.(...a)}
            onRefundWalletPenalty={(id) => onRefundWalletPenalty?.(id)}
          />
        </div>
      )}

      {activeSection === 'buy_box' && (
        <div className="mt-8">
          <AdminBuyBoxManagement
            settings={buyBoxSettings}
            reservations={buyBoxReservations}
            vendors={vendors}
            onUpdateSettings={(newSettings) => {
              if (onUpdateBuyBoxSettings) {
                onUpdateBuyBoxSettings(newSettings);
              }
            }}
            onCancelReservation={onCancelBuyBoxReservation}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: DISCOUNT COUPONS & LOYALTY REWARDS */}
      {/* ========================================================= */}
      {activeSection === 'escrow' && (
        <AdminEscrow
          payments={escrowPayments}
          withdrawals={escrowWithdrawals}
          onRelease={(id) => onReleaseEscrow?.(id)}
          onMarkWithdrawalPaid={(id) => onMarkWithdrawalPaid?.(id)}
        />
      )}

      {activeSection === 'discount_coupons' && (
        <div className="mt-8 space-y-6 text-right animate-in fade-in duration-200">
          
          {/* Header & Quick Action Buttons */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                    <span>مدیریت کدهای تخفیف، سقف‌های ریالی و بن‌های وفاداری</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono">
                      {discountCoupons.length} کد در سامانه
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    صدور دستی کدهای تخفیف با تعیین سقف حداکثر ریالی، و سیستم صدور خودکار بن وفاداری پس از ثبت خریدهای موفق مشتریان
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => setIsQuickIssueModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>صدور خودکار برای خریداران موفق</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleGenerateRandomCode();
                  setIsCreateCouponModalOpen(true);
                }}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ ایجاد کد تخفیف جدید (دستی با سقف)</span>
              </button>
            </div>
          </div>

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] text-stone-500 block font-medium">کل کدهای تخفیف:</span>
              <span className="text-xl font-black text-stone-900 font-mono mt-1 block">
                {discountCoupons.length}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] text-stone-500 block font-medium">کدهای فعال آماده استفاده:</span>
              <span className="text-xl font-black text-emerald-700 font-mono mt-1 block">
                {discountCoupons.filter((c) => c.isActive && c.usedCount < c.usageLimit).length}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] text-stone-500 block font-medium">🤖 صدور خودکار (خرید موفق):</span>
              <span className="text-xl font-black text-blue-700 font-mono mt-1 block">
                {discountCoupons.filter((c) => c.isAutoGenerated).length}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] text-stone-500 block font-medium">👤 تخصیص دستی مدیریت:</span>
              <span className="text-xl font-black text-purple-700 font-mono mt-1 block">
                {discountCoupons.filter((c) => !c.isAutoGenerated).length}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] text-stone-500 block font-medium">دفعات استفاده شده:</span>
              <span className="text-xl font-black text-amber-700 font-mono mt-1 block">
                {discountCoupons.reduce((sum, c) => sum + c.usedCount, 0)}
              </span>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-white rounded-3xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCouponFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  couponFilter === 'all'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                همه ({discountCoupons.length})
              </button>

              <button
                type="button"
                onClick={() => setCouponFilter('auto')}
                className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 ${
                  couponFilter === 'auto'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>🤖 خودکار (خرید موفق)</span>
                <span className="font-mono text-[10px] bg-black/10 px-1 rounded-full">
                  {discountCoupons.filter((c) => c.isAutoGenerated).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCouponFilter('manual')}
                className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 ${
                  couponFilter === 'manual'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>👤 دستی مدیریت</span>
                <span className="font-mono text-[10px] bg-black/10 px-1 rounded-full">
                  {discountCoupons.filter((c) => !c.isAutoGenerated).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCouponFilter('active')}
                className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  couponFilter === 'active'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                فعال ({discountCoupons.filter((c) => c.isActive && c.usedCount < c.usageLimit).length})
              </button>

              <button
                type="button"
                onClick={() => setCouponFilter('expired')}
                className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  couponFilter === 'expired'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                تکمیل ظرفیت / غیرفعال ({discountCoupons.filter((c) => !c.isActive || c.usedCount >= c.usageLimit).length})
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={couponSearchTerm}
                onChange={(e) => setCouponSearchTerm(e.target.value)}
                placeholder="جستجوی کد تخفیف، عنوان، شماره تلفن یا نام..."
                className="w-full pl-3 pr-9 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-700 text-stone-900"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Coupons Card Grid */}
          {filteredDiscountCoupons.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Tag className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-stone-700">هیچ کد تخفیفی با این مشخصات یافت نشد.</p>
              <button
                type="button"
                onClick={() => {
                  setCouponFilter('all');
                  setCouponSearchTerm('');
                }}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                پاک کردن فیلترها
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDiscountCoupons.map((coupon) => {
                const isExhausted = coupon.usedCount >= coupon.usageLimit;
                const isAuto = coupon.isAutoGenerated;

                return (
                  <div
                    key={coupon.id}
                    className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                      !coupon.isActive || isExhausted
                        ? 'border-stone-200 opacity-75 bg-stone-50/50'
                        : isAuto
                        ? 'border-blue-200 hover:border-blue-400 ring-1 ring-blue-50'
                        : 'border-emerald-200 hover:border-emerald-400'
                    }`}
                  >
                    <div className="space-y-3">
                      
                      {/* Code Header & Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-lg text-stone-950 tracking-wider bg-stone-100 px-3 py-1 rounded-xl border border-stone-200">
                              {coupon.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCouponCode(coupon.code)}
                              className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                              title="کپی کد تخفیف"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            {copiedCouponCode === coupon.code && (
                              <span className="text-[10px] text-emerald-600 font-bold animate-in fade-in">کپی شد ✓</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAuto ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-purple-100 text-purple-900 border border-purple-200'
                          }`}>
                            {isAuto ? '🤖 صدور خودکار (خرید موفق)' : '👤 دستی مدیریت'}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            coupon.isActive && !isExhausted
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-stone-200 text-stone-600'
                          }`}>
                            {!coupon.isActive ? 'غیرفعال' : isExhausted ? 'ظرفیت تکمیل' : 'فعال'}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="font-black text-sm text-stone-900 leading-snug">
                          {coupon.title}
                        </h4>
                        {coupon.description && (
                          <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                            {coupon.description}
                          </p>
                        )}
                      </div>

                      {/* Key Value & Max Ceiling Badges */}
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-600 font-medium">مقدار تخفیف:</span>
                          <span className="font-black text-stone-900 font-mono">
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}٪ تخفیف`
                              : `${formatNumber(coupon.discountValue)} تومان`}
                          </span>
                        </div>

                        {/* Ceiling cap highlight (سقف عددی تخفیف) */}
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-200">
                          <span className="text-emerald-800 font-bold flex items-center gap-1">
                            <span>🛡️ سقف حداکثر تخفیف:</span>
                          </span>
                          <span className="font-mono font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md text-xs">
                            تا {formatNumber(coupon.maxDiscountAmount || 500000)} تومان
                          </span>
                        </div>

                        {coupon.minOrderAmount && coupon.minOrderAmount > 0 && (
                          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                            <span>حداقل مبلغ سفارش:</span>
                            <span className="font-mono">{formatNumber(coupon.minOrderAmount)} تومان</span>
                          </div>
                        )}
                      </div>

                      {/* Assigned Customer Info if any */}
                      {(coupon.assignedCustomerName || coupon.assignedCustomerPhone) && (
                        <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between text-blue-950 font-bold text-[11px]">
                            <span>اختصاصی به مشتری وفادار:</span>
                            {coupon.triggerOrderId && (
                              <span className="font-mono font-normal text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-sm">
                                سفارش #{coupon.triggerOrderId}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-blue-900 flex items-center justify-between">
                            <span>{coupon.assignedCustomerName || 'مشتری ثبت‌شده'}</span>
                            <span className="font-mono font-bold text-left" dir="ltr">
                              {coupon.assignedCustomerPhone}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Usage Progress */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-stone-500">
                          <span>دفعات مصرف:</span>
                          <span className="font-mono font-bold text-stone-800">
                            {coupon.usedCount} از {coupon.usageLimit} بار
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isExhausted ? 'bg-stone-400' : 'bg-emerald-600'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>

                    </div>

                    {/* Footer Controls: Toggle Status & Delete */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div className="text-[10px] text-stone-400">
                        {coupon.expiresAt ? `انقضا: ${coupon.expiresAt}` : 'بدون انقضا'}
                      </div>

                      <div className="flex items-center gap-2">
                        {onToggleDiscountCoupon && (
                          <button
                            type="button"
                            onClick={() => onToggleDiscountCoupon(coupon.id)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                              coupon.isActive
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                            }`}
                          >
                            {coupon.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                          </button>
                        )}

                        {onDeleteDiscountCoupon && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`آیا از حذف کد تخفیف ${coupon.code} اطمینان دارید؟`)) {
                                onDeleteDiscountCoupon(coupon.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف کد"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      </div>{/* End flex-1 Main Content Workspace */}
      </div>{/* End flex-col lg:flex-row Main Layout */}

      {/* Operational City Create/Edit Modal */}
      {isCityModalOpen && (
        <EditCityModal
          isOpen={isCityModalOpen}
          city={editingCity}
          onClose={() => {
            setIsCityModalOpen(false);
            setEditingCity(null);
          }}
          onSave={handleSaveCity}
          onDelete={handleDeleteCity}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW DISCOUNT COUPON WITH CEILING CAP */}
      {/* ========================================================= */}
      {isCreateCouponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 text-right">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-stone-100 bg-stone-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-base sm:text-lg">
                    ایجاد کد تخفیف جدید (با تعیین سقف عددی)
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    تعیین درصد تخفیف به همراه سقف ریالی جهت کنترل سود فروشگاه‌ها و پلتفرم
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateCouponModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCouponSubmit} className="p-6 space-y-4 text-xs">
              
              {/* Code & Random button */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  کد تخفیف (حروف انگلیسی یا رندوم): <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="مثلاً: VIP-GOLD یا AUTOFALL20"
                    className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono uppercase text-left focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    تولید کد رندوم ⚡
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  عنوان نمایشی کوپن: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCouponTitle}
                  onChange={(e) => setNewCouponTitle(e.target.value)}
                  placeholder="مثلاً: تخفیف ویژه خرید موفق قبلی، جشنواره افتتاحیه شهرهای اقماری..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">توضیحات تکمیلی:</label>
                <input
                  type="text"
                  value={newCouponDescription}
                  onChange={(e) => setNewCouponDescription(e.target.value)}
                  placeholder="توضیح کوتاه درباره شرایط تخفیف..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Type & Value & MAX CEILING */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">نوع تخفیف:</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-stone-800"
                  >
                    <option value="percentage">درصدی (%)</option>
                    <option value="fixed">مبلغ ثابت (تومان)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-emerald-950 mb-1">
                    {newCouponType === 'percentage' ? 'درصد تخفیف (%):' : 'مبلغ تخفیف (تومان):'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono text-left font-bold"
                  />
                </div>

                {/* Saghf-e Takhfif (Crucial requirement from user) */}
                <div>
                  <label className="block font-black text-emerald-950 mb-1">
                    🛡️ سقف تخفیف (تومان):
                  </label>
                  <input
                    type="number"
                    required
                    step={50000}
                    value={newCouponMaxAmount}
                    onChange={(e) => setNewCouponMaxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-2 border-emerald-500 rounded-xl text-xs font-mono text-left font-black text-emerald-900"
                  />
                  <span className="text-[10px] text-emerald-800 mt-0.5 block font-medium">
                    حداکثر سقف مجاز کسر وجه
                  </span>
                </div>
              </div>

              {/* Min order and Applies to */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">حداقل مبلغ سفارش (تومان):</label>
                  <input
                    type="number"
                    step={100000}
                    value={newCouponMinOrder}
                    onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">محل اعمال تخفیف:</label>
                  <select
                    value={newCouponAppliesTo}
                    onChange={(e) => setNewCouponAppliesTo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  >
                    <option value="both">هر دو (بیعانه اعزام و فاکتور نهایی دوخت)</option>
                    <option value="deposit">تنها بیعانه ویزیت اولیه (طبق مبلغ بیعانه هر شهر)</option>
                    <option value="invoice">تنها فاکتور نهایی پارچه و دوخت</option>
                  </select>
                </div>
              </div>

              {/* Target Mode */}
              <div className="space-y-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <label className="block font-bold text-stone-800">مخاطب کد تخفیف:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="targetMode"
                      checked={newCouponTargetMode === 'public'}
                      onChange={() => setNewCouponTargetMode('public')}
                      className="text-emerald-600"
                    />
                    <span>عمومی (قابل استفاده توسط هر مشتری)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="targetMode"
                      checked={newCouponTargetMode === 'specific_customer'}
                      onChange={() => setNewCouponTargetMode('specific_customer')}
                      className="text-emerald-600"
                    />
                    <span>اختصاصی به مشتری خاص</span>
                  </label>
                </div>

                {newCouponTargetMode === 'specific_customer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">نام مشتری:</label>
                      <input
                        type="text"
                        value={newCouponCustomerName}
                        onChange={(e) => setNewCouponCustomerName(e.target.value)}
                        placeholder="مثلاً: علیرضا فراهانی"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">شماره موبایل مشتری:</label>
                      <input
                        type="tel"
                        value={newCouponCustomerPhone}
                        onChange={(e) => setNewCouponCustomerPhone(e.target.value)}
                        placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-mono text-left"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Usage limit and expiry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">سقف تعداد دفعات استفاده:</label>
                  <input
                    type="number"
                    min={1}
                    value={newCouponUsageLimit}
                    onChange={(e) => setNewCouponUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">تاریخ انقضا (شمسی):</label>
                  <input
                    type="text"
                    value={newCouponExpiresAt}
                    onChange={(e) => setNewCouponExpiresAt(e.target.value)}
                    placeholder="۱۴۰۳/۱۲/۲۹"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-center"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCouponModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ثبت و فعال‌سازی کد تخفیف</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: QUICK AUTOMATIC ISSUE FOR SUCCESSFUL BUYERS */}
      {/* ========================================================= */}
      {isQuickIssueModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 text-right">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-stone-100 bg-stone-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-base sm:text-lg">
                    صدور خودکار کد وفاداری برای مشتریان با خرید موفق
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    تولید خودکار کد تخفیف با سقف ۵۰۰,۰۰۰ تا ۷۵۰,۰۰۰ تومان به پاس اعتماد و خرید موفق قبلی
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickIssueModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-stone-600 leading-relaxed">
                مشتریان زیر در سیستم دارای سفارش موفق (تایید فاکتور، دوخت یا نصب نهایی) هستند. با کلیک بر روی صدور خودکار، سیستم به صورت هوشمند کد تخفیف با سقف مجاز برای آنان صادر و فعال می‌نماید:
              </p>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {successfulCustomers.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
                    هنوز مشتری با سفارش موفق در این لیست ثبت نشده است.
                  </div>
                ) : (
                  successfulCustomers.map((cust) => {
                    const hasActiveCoupon = discountCoupons.some(
                      (c) => c.assignedCustomerPhone === cust.phone && c.isActive && c.usedCount < c.usageLimit
                    );

                    return (
                      <div
                        key={cust.phone}
                        className="p-3.5 bg-stone-50 hover:bg-amber-50/50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <strong className="text-stone-900 font-extrabold text-sm">{cust.name}</strong>
                            <span className="font-mono text-xs text-stone-500 font-bold" dir="ltr">
                              {cust.phone}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.2 rounded-full">
                              خرید موفق ✓
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500">
                            شهر: <strong>{cust.city}</strong> ({cust.district}) · سفارش #{cust.orderNumber}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {hasActiveCoupon ? (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
                              کد فعال صادر شده ✓
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (onIssueAutomaticDiscountCoupon) {
                                  onIssueAutomaticDiscountCoupon(cust.name, cust.phone, cust.orderNumber, cust.amount);
                                }
                              }}
                              className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>صدور خودکار کد (سقف ۵۰۰ هزار ت)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsQuickIssueModalOpen(false)}
                  className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  بستن پنجره
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
