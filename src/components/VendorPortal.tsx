import React, { useState } from 'react';
import { 
  VisitRequest, 
  ServiceCategoryId,
  CurtainVendor, 
  CurtainInvoice, 
  InvoiceItem, 
  WalletTransaction, 
  MasterFabricCatalog, 
  VendorCustomCatalogSubmission, 
  VendorReview,
  VendorPortfolioItem,
  BuyBoxSettings,
  BuyBoxReservation,
  OperationalCity
} from '../types';
import { 
  Flame, 
  MapPin, 
  Clock, 
  Calendar, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  FileText, 
  Store, 
  Star, 
  ShieldCheck, 
  ArrowLeft, 
  X, 
  CreditCard, 
  Layers, 
  ChevronRight, 
  MessageSquare, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  Info, 
  HelpCircle, 
  CheckSquare, 
  Square, 
  Search, 
  Check, 
  Save,
  Send,
  Hourglass,
  XCircle,
  FileCheck2,
  Building2,
  ThumbsUp,
  Award,
  Tag,
  CornerDownLeft,
  MessageCircle,
  TrendingUp,
  Image as ImageIcon,
  Upload,
  Crown
} from 'lucide-react';
import { WalletTopUpModal } from './WalletTopUpModal';
import { VendorBuyBoxSection } from './VendorBuyBoxSection';
import { INITIAL_BUY_BOX_SETTINGS, INITIAL_BUY_BOX_RESERVATIONS } from '../data/mockData';
import { VendorRestrictionBanner } from './VendorRestrictionPanel';
import { VendorGamificationPanel, featureLockedMessage } from './VendorGamificationPanel';
import { computeVendorGameProgress, GP } from '../utils/vendorGamification';
import { VendorRestrictionSummary, isDebitTransaction, isPenaltyTransaction } from '../utils/restrictions';
import {
  FABRIC_GRADES,
  FabricGrade,
  PREPAYMENT_MIN_PERCENT,
  PREPAYMENT_MAX_PERCENT,
  prepaymentRange,
  prepaymentPercent,
  toEnDigits,
  formatSheba,
  normalizeSheba,
  isValidSheba,
  isValidJalaliDate,
  normalizeJalaliDate,
  buildSettlementTerms,
} from '../utils/invoiceUtils';
import { formatDepositToman, formatDepositWords } from '../utils/deposit';
import { useDeposit } from '../context/DepositContext';
import { getOrderCategory, getVendorCategories, vendorServesCategory, SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS } from '../utils/serviceCategory';

import { VendorSecureBox } from './VendorSecureBox';
import type { EscrowPayment, EscrowWithdrawal } from '../types';

interface VendorPortalProps {
  currentVendor: CurtainVendor;
  vendorSheba?: string; // شماره شبای ثبت‌شده در اطلاعات فروشگاه (درج در فاکتور)
  restrictionSummary?: VendorRestrictionSummary; // وضعیت محدودیت‌ها و بافر فروشنده
  orders: VisitRequest[];
  masterCatalogs?: MasterFabricCatalog[];
  vendorSubmissions?: VendorCustomCatalogSubmission[];
  reviews?: VendorReview[];
  vendors?: CurtainVendor[];
  onClaimOrder: (orderId: string, vendorId: string, vendorName: string, vendorPhone: string) => boolean | void;
  onIssueInvoice: (orderId: string, invoice: CurtainInvoice) => void;
  onOpenChat?: (order: VisitRequest) => void;
  onTopUpWallet?: (vendorId: string, amount: number) => void;
  onUpdateVendorCatalogs?: (vendorId: string, catalogIds: string[], customCatalogs?: string[]) => void;
  onUpdateVendorCategories?: (vendorId: string, categories: ServiceCategoryId[]) => void;
  onSubmitCustomCatalog?: (submission: {
    title: string;
    category: string;
    description: string;
    texture?: string;
    priceMin?: number;
    priceMax?: number;
    images?: string[];
    primaryImageIndex?: number;
  }) => void;
  onOpenRegisterModal?: () => void;
  onOpenProfileModal?: () => void;
  onReplyToReview?: (reviewId: string, replyText: string) => void;
  onVendorLadder?: (vendorId: string, cityName?: string) => { success: boolean; feePaid?: number; message?: string; feeNeeded?: number } | void;
  onSimulate20Vendors?: (targetCity?: string) => void;
  onUploadPortfolioItem?: (vendorId: string, item: Omit<VendorPortfolioItem, 'id' | 'createdAt' | 'status'>) => void;
  onDeletePortfolioItem?: (vendorId: string, itemId: string) => void;
  escrowPayments?: EscrowPayment[];
  escrowWithdrawals?: EscrowWithdrawal[];
  onRequestEscrowWithdrawal?: (paymentIds: string[], sheba: string) => void;
  buyBoxSettings?: BuyBoxSettings;
  buyBoxReservations?: BuyBoxReservation[];
  onReserveBuyBox?: (dateIso: string, datePersian: string, price: number) => { success: boolean; message: string };
  onAcceptBuyBoxOrder?: (orderId: string) => void;
  onRejectBuyBoxOrderToHunting?: (orderId: string) => void;
  operationalCities?: OperationalCity[];
  onSubmitVendorDocs?: (vendorId: string, payload: { nationalCardImageUrl: string; businessLicenseImageUrl: string }) => void;
  onSetWalletChargePackage?: (vendorId: string, pkg: 'basic' | 'premium') => void;
  onSkipVendorStage?: (vendorId: string, stageKey: 'portfolio' | 'ladder') => void;
  onSaveVendorInstallers?: (vendorId: string, installers: import('../types').VendorInstaller[]) => void;
}

export const VendorPortal: React.FC<VendorPortalProps> = ({
  currentVendor,
  vendorSheba,
  restrictionSummary,
  orders,
  masterCatalogs = [],
  vendorSubmissions = [],
  reviews = [],
  vendors = [],
  operationalCities = [],
  onSubmitVendorDocs,
  onSetWalletChargePackage,
  onSkipVendorStage,
  onSaveVendorInstallers,
  buyBoxSettings = INITIAL_BUY_BOX_SETTINGS,
  buyBoxReservations = INITIAL_BUY_BOX_RESERVATIONS,
  onReserveBuyBox,
  onAcceptBuyBoxOrder,
  onRejectBuyBoxOrderToHunting,
  onClaimOrder,
  onIssueInvoice,
  onOpenChat,
  onTopUpWallet,
  onUpdateVendorCatalogs,
  onUpdateVendorCategories,
  onSubmitCustomCatalog,
  onOpenRegisterModal,
  onOpenProfileModal,
  onReplyToReview,
  onVendorLadder,
  onSimulate20Vendors,
  onUploadPortfolioItem,
  onDeletePortfolioItem,
  escrowPayments = [],
  escrowWithdrawals = [],
  onRequestEscrowWithdrawal,
}) => {
  const [activeTab, setActiveTab] = useState<'bidding_board' | 'my_assignments' | 'secure_box' | 'wallet' | 'reviews' | 'profile' | 'sponsored_ladder' | 'portfolio' | 'buy_box'>('bidding_board');
  type VendorTab = 'bidding_board' | 'my_assignments' | 'secure_box' | 'wallet' | 'reviews' | 'profile' | 'sponsored_ladder' | 'portfolio' | 'buy_box';
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<VisitRequest | null>(null);

  // Review replying state & filter
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [reviewFilter, setReviewFilter] = useState<'all' | '5' | '4' | 'needs_reply'>('all');

  // Wallet Top-up Modal State
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpSuggestedAmount, setTopUpSuggestedAmount] = useState<number>(550000);
  const [topUpReasonText, setTopUpReasonText] = useState<string>('');

  // Claim Confirmation Modal State
  const [orderToConfirmClaim, setOrderToConfirmClaim] = useState<VisitRequest | null>(null);

  // Wallet transactions filter
  const { getDeposit } = useDeposit();
  const [walletFilter, setWalletFilter] = useState<'all' | 'deposits' | 'claims' | 'penalties'>('all');

  // Invoice creation form state
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', title: 'پارچه مخمل کالیفرنیا ترک', fabricCode: 'CAL-900', fabricGrade: '1', meters: 18, unitPrice: 650000, total: 11700000 }
  ]);
  const [tailoringFee, setTailoringFee] = useState<number>(1800000);
  const [hardwareFee, setHardwareFee] = useState<number>(1200000);
  const [installationFee, setInstallationFee] = useState<number>(850000);
  const [invoiceNotes, setInvoiceNotes] = useState<string>('نوار پرده ترک کتان، سرب‌دوزی پایین حریر، تحویل ظرف ۴ روز کاری');
  const [deliveryInstallDate, setDeliveryInstallDate] = useState<string>('');
  const [prepaymentInput, setPrepaymentInput] = useState<string>(''); // خالی = پیش‌فرض ۷۰٪
  const [invoiceSubmitAttempted, setInvoiceSubmitAttempted] = useState(false);

  // Vendor Catalog Selection State
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<string[]>(
    currentVendor.availableCatalogIds || ['cat-1', 'cat-2', 'cat-3', 'cat-4']
  );
  const [customCatalogs, setCustomCatalogs] = useState<string[]>(
    currentVendor.customCatalogs || []
  );
  const [newCustomCatalogName, setNewCustomCatalogName] = useState('');
  const [customCatPriceMin, setCustomCatPriceMin] = useState('');
  const [customCatPriceMax, setCustomCatPriceMax] = useState('');
  const [customCatImages, setCustomCatImages] = useState<string[]>([]);
  const [customCatPrimaryIdx, setCustomCatPrimaryIdx] = useState(0);
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogSavedSuccess, setCatalogSavedSuccess] = useState(false);

  // Portfolio Upload Form State (Max 15 items, JPG only, standard 1200x800)
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioCategory, setPortfolioCategory] = useState('پذیرایی و سالن');
  const [portfolioImageUrl, setPortfolioImageUrl] = useState('');
  const [portfolioFileError, setPortfolioFileError] = useState('');
  const [portfolioDimensionStatus, setPortfolioDimensionStatus] = useState<string | null>(null);
  const [portfolioUploadSuccess, setPortfolioUploadSuccess] = useState(false);

  const handlePortfolioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPortfolioFileError('');
    setPortfolioDimensionStatus(null);
    if (!file) return;

    // Strict validation for JPG / JPEG
    const isJpg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
    if (!isJpg) {
      setPortfolioFileError('فرمت فایل نامعتبر است! طبق استاندارد سامانه، تنها فایل‌های با پسوند JPG (.jpg یا .jpeg) مجاز هستند.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (w === 1200 && h === 800) {
          setPortfolioDimensionStatus('ابعاد دقیقاً استاندارد ۱۲۰۰ در ۸۰۰ پیکسل (تایید شده)');
          setPortfolioImageUrl(dataUrl);
        } else {
          // Standardize to 1200x800 via canvas
          const canvas = document.createElement('canvas');
          canvas.width = 1200;
          canvas.height = 800;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const hRatio = canvas.width / w;
            const vRatio = canvas.height / h;
            const ratio = Math.max(hRatio, vRatio);
            const centerShift_x = (canvas.width - w * ratio) / 2;
            const centerShift_y = (canvas.height - h * ratio) / 2;
            ctx.drawImage(img, 0, 0, w, h, centerShift_x, centerShift_y, w * ratio, h * ratio);
            const standardizedJpg = canvas.toDataURL('image/jpeg', 0.88);
            setPortfolioImageUrl(standardizedJpg);
            setPortfolioDimensionStatus(`ابعاد اصلی تصویر (${w}×${h}) به استاندارد رسمی ۱۲۰۰×۸۰۰ پیکسل تبدیل و بهینه‌سازی شد.`);
          } else {
            setPortfolioImageUrl(dataUrl);
          }
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioTitle.trim() || !portfolioImageUrl) {
      setPortfolioFileError('لطفاً عنوان نمونه‌کار و فایل تصویر استاندارد JPG را وارد نمایید.');
      return;
    }
    const currentPortfolio = currentVendor.portfolio || [];
    if (currentPortfolio.length >= 15) {
      setPortfolioFileError('حداکثر سقف مجاز (۱۵ نمونه‌کار) تکمیل شده است. لطفاً ابتدا یکی از نمونه‌های قبلی را حذف کنید.');
      return;
    }

    if (onUploadPortfolioItem) {
      onUploadPortfolioItem(currentVendor.id, {
        vendorId: currentVendor.id,
        vendorName: currentVendor.name,
        title: portfolioTitle.trim(),
        description: portfolioDescription.trim(),
        category: portfolioCategory,
        imageUrl: portfolioImageUrl,
        aspectRatio: '1200x800',
      });
    }

    setPortfolioTitle('');
    setPortfolioDescription('');
    setPortfolioImageUrl('');
    setPortfolioDimensionStatus(null);
    setPortfolioUploadSuccess(true);
    setTimeout(() => setPortfolioUploadSuccess(false), 4000);
  };

  const formatNumber = (num: number) => num.toLocaleString('fa-IR');

  const todayIso = new Date().toISOString().split('T')[0];

  // Vendor switch override for quick interactive testing across cities (Mashhad, Nishabur, Tehran)
  const activeVendor = currentVendor;
  const gameProgress = computeVendorGameProgress(activeVendor, orders);
  const trySetTab = (tab: VendorTab) => {
    const map: Record<VendorTab, keyof typeof gameProgress.unlocked> = {
      bidding_board: 'bidding',
      my_assignments: 'assignments',
      secure_box: 'secure_box',
      wallet: 'wallet',
      reviews: 'reviews',
      profile: 'catalogs',
      sponsored_ladder: 'ladder',
      portfolio: 'portfolio',
      buy_box: 'buy_box',
    };
    const key = map[tab];
    if (!gameProgress.unlocked[key]) {
      const labels: Record<string, string> = {
        bidding_board: 'تابلوی شکار',
        my_assignments: 'سفارش‌های من',
        secure_box: 'صندوق امن',
        wallet: 'کیف پول',
        reviews: 'نظرات',
        profile: 'کالیته‌ها',
        sponsored_ladder: 'نردبان',
        portfolio: 'نمونه کار',
        buy_box: 'باکس خرید',
      };
      alert(featureLockedMessage(labels[tab] || tab));
      return;
    }
    setActiveTab(tab);
  };

  // Sub-filter for hunting board: all orders, local only, or satellite towns only
  const [huntingBoardFilter, setHuntingBoardFilter] = useState<'all' | 'local_only' | 'satellites_only'>('all');

  // Determine active city & satellite linkages
  const vendorCity = activeVendor.city;
  const currentCityObj = (operationalCities || []).find((c) => c.name === vendorCity);
  
  // Find all satellite cities linked to this vendor's city (e.g. for Mashhad: Golbahar, Chenaran, Kalat, Laklak, Nishabur; for Tehran: Parand, Pardis, Shahriar, Varamin...)
  const linkedSatelliteCityNames: string[] = [
    ...(currentCityObj?.otherCoveredCities || []),
    ...(currentCityObj?.satelliteCities || []),
    ...(operationalCities || [])
      .filter((c) => c.parentHubCityName === vendorCity || (currentCityObj?.id && c.parentHubCityId === currentCityObj.id))
      .map((c) => c.name),
    ...(vendorCity === 'مشهد' ? ['گلبهار', 'چناران', 'کلات', 'روستای لکلک', 'نیشابور', 'طرقبه', 'شاندیز'] : []),
    ...(vendorCity === 'تهران' ? ['پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'دماوند و رودهن', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'ملارد', 'شهر قدس'] : [])
  ].filter((name, idx, arr) => arr.indexOf(name) === idx);

  // Is this vendor in a hub city?
  const isVendorInHubCity = Boolean(currentCityObj?.isHub || vendorCity === 'مشهد' || vendorCity === 'تهران' || linkedSatelliteCityNames.length > 0);

  // Pending Buy Box orders specifically offered to this vendor (15 min timer)
  const pendingBuyBoxOrdersForMe = orders.filter(
    (o) =>
      o.isBuyBoxOrder &&
      o.buyBoxVendorId === activeVendor.id &&
      o.buyBoxStatus === 'pending_vendor_acceptance' &&
      o.status === 'bidding'
  );

  // Available orders on the general hunting board with strict city perimeter:
  // Strictly display orders of the vendor's own city (or cities explicitly covered by this vendor)
  const huntingOrdersForCity = orders.filter((o) => {
    if (o.status !== 'bidding' && o.status !== 're_routed') return false;
    if (o.isBuyBoxOrder && o.buyBoxStatus === 'pending_vendor_acceptance' && o.buyBoxVendorId !== activeVendor.id) {
      return false; // Reserved for Buy Box winner during timeout window
    }

    // رسته: فقط سفارش‌های رسته‌هایی که این فروشگاه در آن‌ها فعالیت می‌کند (پرده / کاغذ دیواری / کفپوش و پارکت)
    if (!vendorServesCategory(activeVendor, getOrderCategory(o))) return false;

    // 1. Direct match: Order in the vendor's exact same city
    if (o.city === vendorCity) return true;

    // 2. Match if this vendor explicitly covers this other/satellite city
    if (activeVendor.coveredOtherCities && activeVendor.coveredOtherCities.includes(o.city)) {
      return true;
    }

    return false;
  });

  const availableOrders = huntingOrdersForCity.filter((o) => {
    const isSatellite = Boolean(o.isSatelliteOrder || o.city !== vendorCity);
    if (huntingBoardFilter === 'local_only') return !isSatellite;
    if (huntingBoardFilter === 'satellites_only') return isSatellite;
    return true;
  });

  const localOrdersCount = huntingOrdersForCity.filter((o) => !o.isSatelliteOrder && o.city === vendorCity).length;
  const satelliteOrdersCount = huntingOrdersForCity.filter((o) => o.isSatelliteOrder || o.city !== vendorCity).length;

  const activeReservationToday = (buyBoxReservations || []).find(
    (r) => r.vendorId === activeVendor.id && (r.dateIso === todayIso || r.status === 'active')
  );
  
  // My claimed orders
  const myOrders = orders.filter((o) => o.assignedVendorId === activeVendor.id);

  // Reviews for this vendor (merged from reviews prop & orders)
  const vendorReviews: VendorReview[] = [
    ...(reviews || []).filter((r) => r.vendorId === activeVendor.id),
    ...orders
      .filter((o) => o.assignedVendorId === activeVendor.id && o.customerReview)
      .map((o) => o.customerReview!)
  ].filter((r, idx, arr) => arr.findIndex((x) => x.id === r.id || (x.orderId && x.orderId === r.orderId)) === idx);

  const totalReviewsCount = vendorReviews.length;
  const avgRating = totalReviewsCount > 0
    ? (vendorReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : activeVendor.rating.toFixed(1);

  const recommendCount = vendorReviews.filter((r) => r.wouldRecommend).length;
  const recommendRate = totalReviewsCount > 0 ? Math.round((recommendCount / totalReviewsCount) * 100) : 98;

  // Criteria averages
  const criteriaAvg = {
    fabricQuality: totalReviewsCount > 0 
      ? (vendorReviews.reduce((sum, r) => sum + r.criteria.fabricQuality, 0) / totalReviewsCount).toFixed(1)
      : '4.9',
    specialistBehavior: totalReviewsCount > 0
      ? (vendorReviews.reduce((sum, r) => sum + r.criteria.specialistBehavior, 0) / totalReviewsCount).toFixed(1)
      : '4.8',
    installationPrecision: totalReviewsCount > 0
      ? (vendorReviews.reduce((sum, r) => sum + r.criteria.installationPrecision, 0) / totalReviewsCount).toFixed(1)
      : '4.8',
    priceFairness: totalReviewsCount > 0
      ? (vendorReviews.reduce((sum, r) => sum + r.criteria.priceFairness, 0) / totalReviewsCount).toFixed(1)
      : '4.7',
  };

  // Filtered reviews
  const displayedReviews = vendorReviews.filter((r) => {
    if (reviewFilter === '5') return r.rating === 5;
    if (reviewFilter === '4') return r.rating === 4;
    if (reviewFilter === 'needs_reply') return !r.vendorReply;
    return true;
  });

  const handleSendVendorReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    if (onReplyToReview) {
      onReplyToReview(reviewId, replyText.trim());
    }
    setReplyingToReviewId(null);
    setReplyText('');
  };

  // Claim logic with wallet deduction check
  const handleInitiateClaim = (order: VisitRequest) => {
    // محدودیت‌ها (محرومیت، سقف سفارش‌های اول، سقف روزانه، بافر) پیش از هر چیز بررسی می‌شود
    if (restrictionSummary && !restrictionSummary.claim.ok) {
      alert(restrictionSummary.claim.reason || 'شکار سفارش برای شما در حال حاضر مجاز نیست.');
      return;
    }
    const claimCost = order.claimCost || 550000;
    if (currentVendor.walletBalance < claimCost) {
      const deficit = claimCost - currentVendor.walletBalance;
      setTopUpSuggestedAmount(deficit < 550000 ? 550000 : deficit);
      setTopUpReasonText(
        `برای شکار سفارش #${order.orderNumber} در منطقه ${order.district} نیاز به حداقل ${formatNumber(claimCost)} تومان اعتبار دارید. موجودی فعلی: ${formatNumber(currentVendor.walletBalance)} تومان (کسری: ${formatNumber(deficit)} تومان).`
      );
      setIsTopUpModalOpen(true);
    } else {
      setOrderToConfirmClaim(order);
    }
  };

  const handleConfirmClaimOrder = () => {
    if (!orderToConfirmClaim) return;
    onClaimOrder(
      orderToConfirmClaim.id,
      currentVendor.id,
      currentVendor.name,
      currentVendor.phone
    );
    setOrderToConfirmClaim(null);
  };

  const addItemRow = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      title: 'حریر شاین الگانت شیری',
      fabricCode: 'SHN-02',
      fabricGrade: '1',
      meters: 15,
      unitPrice: 380000,
      total: 15 * 380000,
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const removeItemRow = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(invoiceItems.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'meters' || field === 'unitPrice') {
          const meters = field === 'meters' ? parseFloat(value) || 0 : item.meters;
          const price = field === 'unitPrice' ? parseFloat(value) || 0 : item.unitPrice;
          updated.total = meters * price;
        }
        return updated;
      }
      return item;
    }));
  };

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0) + tailoringFee + hardwareFee + installationFee;
  const depositDeduction =
    selectedOrderForInvoice?.finalDepositPaid ?? selectedOrderForInvoice?.depositAmount ?? 350000;
  const finalPayable = Math.max(0, subtotal - depositDeduction);

  // پیش‌پرداخت مشتری: مبلغ را فروشنده می‌نویسد و باید بین ۶۰ تا ۸۰ درصد مبلغ قابل پرداخت فاکتور باشد
  const prepayRange = prepaymentRange(finalPayable);
  const defaultPrepayment = Math.round((finalPayable * 70) / 100);
  const prepaymentAmount =
    prepaymentInput.trim() === '' ? defaultPrepayment : Math.round(Number(toEnDigits(prepaymentInput).replace(/[,٬\s]/g, '')) || 0);
  const isPrepaymentValid =
    finalPayable > 0 && prepaymentAmount >= prepayRange.min && prepaymentAmount <= prepayRange.max;
  const isDeliveryDateValid = isValidJalaliDate(deliveryInstallDate);
  const hasVendorSheba = isValidSheba(vendorSheba || '');
  const invoiceHasMissingGrade = invoiceItems.some((i) => !i.fabricGrade);
  const canSubmitInvoice =
    isDeliveryDateValid && isPrepaymentValid && hasVendorSheba && !invoiceHasMissingGrade && finalPayable > 0;

  const handleOpenInvoiceModal = (order: VisitRequest) => {
    setSelectedOrderForInvoice(order);
    setInvoiceSubmitAttempted(false);
    // اگر فاکتور قبلاً صادر شده، مقادیر قبلی برای ویرایش بارگذاری می‌شود
    if (order.invoice) {
      setInvoiceItems(order.invoice.items.map((it) => ({ ...it, fabricGrade: it.fabricGrade || '1' })));
      setTailoringFee(order.invoice.tailoringFee);
      setHardwareFee(order.invoice.hardwareAndTrackFee);
      setInstallationFee(order.invoice.installationFee);
      setInvoiceNotes(order.invoice.notes || '');
      setDeliveryInstallDate(order.invoice.deliveryInstallDate || '');
      setPrepaymentInput(order.invoice.customerPrepayment ? String(order.invoice.customerPrepayment) : '');
      return;
    }
    setDeliveryInstallDate('');
    setPrepaymentInput('');
    // Pre-seed some realistic item based on order styles
    const initialTitle = order.preferredStyles[0] || 'پارچه کالیته منتخب در محل';
    setInvoiceItems([
      {
        id: '1',
        title: initialTitle,
        fabricCode: 'KL-701',
        fabricGrade: '1',
        meters: Number((order.approximateWidthMeters * 2.5).toFixed(1)),
        unitPrice: 620000,
        total: Math.round(order.approximateWidthMeters * 2.5 * 620000),
      }
    ]);
  };

  const handleSubmitInvoice = () => {
    if (!selectedOrderForInvoice) return;
    setInvoiceSubmitAttempted(true);
    if (!canSubmitInvoice) return;

    const newInvoice: CurtainInvoice = {
      invoiceNumber: `INV-${currentVendor.name.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId: currentVendor.id,
      vendorName: currentVendor.name,
      items: invoiceItems,
      tailoringFee,
      hardwareAndTrackFee: hardwareFee,
      installationFee,
      subtotal,
      depositDeduction,
      finalPayable,
      notes: invoiceNotes,
      vendorSheba: normalizeSheba(vendorSheba || ''),
      customerName: selectedOrderForInvoice.customerName,
      deliveryInstallDate: normalizeJalaliDate(deliveryInstallDate),
      customerPrepayment: prepaymentAmount,
      customerPrepaymentPercent: prepaymentPercent(prepaymentAmount, finalPayable),
      issuedAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      status: 'issued',
    };

    onIssueInvoice(selectedOrderForInvoice.id, newInvoice);
    setSelectedOrderForInvoice(null);
  };

  return (
    <div className="py-10 bg-stone-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Vendor Header Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-right">
            <div className="w-14 h-14 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900">
                  {activeVendor.name}
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  شهر: {activeVendor.city} {isVendorInHubCity ? '(قطب استانی)' : ''}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200">
                  نشان {activeVendor.tier}
                </span>
                {activeVendor.isVerified && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>تایید پروانه کسب</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <p className="text-xs text-stone-500">
                  مدیریت: {activeVendor.ownerName} · نشانی: {activeVendor.address.slice(0, 35)}...
                </p>
                {onOpenProfileModal && (
                  <button
                    onClick={onOpenProfileModal}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                  >
                    ویرایش مشخصات
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-r border-stone-200 pt-4 md:pt-0 md:pr-6 text-right">
            <div>
              <span className="text-[11px] text-stone-500 block">امتیاز رضایت:</span>
              <span className="text-base font-bold text-stone-900 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="tabular-nums">{activeVendor.rating}</span>
                <span className="text-xs text-stone-400 font-normal">({activeVendor.ratingCount})</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] text-stone-500 block">بازدیدهای انجام شده:</span>
              <span className="text-base font-bold text-stone-900 font-mono tabular-nums">
                {activeVendor.completedVisits} ویزیت
              </span>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/70 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-500">موجودی کیف پول:</span>
                <button
                  onClick={() => {
                    setTopUpSuggestedAmount(550000);
                    setTopUpReasonText('');
                    setIsTopUpModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100/70 hover:bg-amber-100 px-1.5 py-0.5 rounded transition-colors"
                >
                  + شارژ آنلاین
                </button>
              </div>
              <span
                className={`text-base font-black font-mono tabular-nums mt-0.5 ${
                  activeVendor.walletBalance < 0 ? 'text-rose-700' : 'text-emerald-700'
                }`}
                dir="ltr"
              >
                {formatNumber(activeVendor.walletBalance)} تومان
              </span>
              {activeVendor.walletBalance < 0 && (
                <span className="text-[10px] text-rose-700 font-bold mt-0.5">کیف پول منفی است؛ برای ادامه شارژ کنید.</span>
              )}
            </div>
          </div>
        </div>

        <VendorRestrictionBanner summary={restrictionSummary} />

        <div className="mb-4">
          <VendorGamificationPanel
            vendor={activeVendor}
            orders={orders}
            onSubmitDocs={(payload) => onSubmitVendorDocs?.(activeVendor.id, payload)}
            onNavigateTab={(tab) => trySetTab(tab)}
            onSkipStage={(key) => onSkipVendorStage?.(activeVendor.id, key)}
            onSaveInstallers={(list) => onSaveVendorInstallers?.(activeVendor.id, list)}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 border-b border-stone-200 pb-2">
          <button
            onClick={() => trySetTab('bidding_board')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'bidding_board'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>تابلو شکار سفارشات در منطقه</span>
            {availableOrders.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white tabular-nums font-mono">
                {availableOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => trySetTab('my_assignments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'my_assignments'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>سفارشات اعزامی من</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 tabular-nums font-mono">
              {myOrders.length}
            </span>
          </button>

          <button
            onClick={() => trySetTab('secure_box')}
            data-testid="tab-secure-box"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'secure_box'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>صندوق پرداخت امن</span>
            {escrowPayments.some((p) => p.status === 'released') && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="مبلغ آزاد برای برداشت دارید" />
            )}
          </button>

          <button
            onClick={() => trySetTab('wallet')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'wallet'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>کیف پول و تراکنش‌ها</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
              {formatNumber(currentVendor.walletBalance)} ت
            </span>
          </button>

          <button
            onClick={() => trySetTab('reviews')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'reviews'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>نظرات و امتیازات مشتریان</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-bold">
              {totalReviewsCount} نظر ({avgRating}★)
            </span>
          </button>

          <button
            onClick={() => trySetTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'profile'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>کالیته‌ها و اطلاعات فروشگاه</span>
          </button>

          <button
            onClick={() => trySetTab('sponsored_ladder')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'sponsored_ladder'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>نردبان و آگهی صفحه اول شهر</span>
            {currentVendor.isPromotedAd ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                رتبه #{currentVendor.promotedLadderPosition || 1}
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                ثبت نردبان
              </span>
            )}
          </button>

          <button
            onClick={() => trySetTab('portfolio')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'portfolio'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span>نمونه‌کارهای فروشگاه</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 font-mono font-bold">
              {(currentVendor.portfolio || []).length} / ۱۵
            </span>
          </button>

          <button
            onClick={() => trySetTab('buy_box')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
              activeTab === 'buy_box'
                ? 'bg-amber-700 text-white shadow-md ring-2 ring-amber-400'
                : 'bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>رزرو بای‌باکس (سهمیه ۸ روز)</span>
            {activeReservationToday ? (
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500 text-white rounded-full font-bold animate-pulse">
                فعال امروز ✓
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-bold border border-amber-300">
                تا ۵۰٪ سفارشات
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Live Bidding Board */}
        {activeTab === 'bidding_board' && (
          <div className="mt-6 space-y-4">
            
            {/* Urgent Priority Section: Incoming Buy Box Orders Pending Acceptance */}
            {pendingBuyBoxOrdersForMe.length > 0 && (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-400 rounded-2xl space-y-4 shadow-sm animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                      <Crown className="w-5 h-5 text-white fill-white" />
                    </span>
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-amber-950 flex items-center gap-2">
                        <span>سفارش اختصاصی بای‌باکس با اولویت ویژه (پیشنهاد شده به شما)</span>
                        <span className="text-[10px] px-2 py-0.5 bg-rose-500 text-white font-bold rounded-full animate-pulse">
                          اقدام فوری
                        </span>
                      </h3>
                      <p className="text-xs text-amber-800 mt-0.5">
                        این سفارش بر اساس رزرو بای‌باکس امروز، به مدت ۱۵ دقیقه قبل از سایر فروشگاه‌ها در اختیار شماست.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-900 bg-amber-200/90 px-3 py-1 rounded-xl border border-amber-300 self-start sm:self-center font-mono">
                    {pendingBuyBoxOrdersForMe.length} سفارش در انتظار تایید
                  </span>
                </div>

                <div className="space-y-3">
                  {pendingBuyBoxOrdersForMe.map((order) => {
                    const remainingSeconds = order.buyBoxExpiresAt
                      ? Math.max(0, Math.floor((order.buyBoxExpiresAt - Date.now()) / 1000))
                      : 900;
                    const mins = Math.floor(remainingSeconds / 60);
                    const secs = remainingSeconds % 60;

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl border border-amber-300 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 text-right">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-black text-sm text-stone-900">
                              سفارش #{order.orderNumber}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                              محله: {order.district}
                            </span>
                            <span className="text-xs text-stone-500">
                              مشتری: {order.customerName}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600">
                            سبک درخواستی: {order.preferredStyles.join('، ')} · متراژ تقریبی: {order.approximateWidthMeters} متر ({order.approximateWindows} پنجره)
                          </p>
                          <div className="flex items-center gap-2 text-xs text-rose-700 font-bold">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>مهلت پذیرش باقی‌مانده:</span>
                            <span className="font-mono tabular-nums text-sm bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              {mins}:{secs < 10 ? `0${secs}` : secs}
                            </span>
                            <span className="text-[11px] text-stone-500 font-normal">
                              (در صورت عدم تایید، به تابلوی شکار عمومی سایر همکاران منتقل می‌شود)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => onAcceptBuyBoxOrder?.(order.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>قبول و ثبت اختصاصی سفارش</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRejectBuyBoxOrderToHunting?.(order.id)}
                            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer"
                          >
                            انتقال به شکار عمومی
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Buy Box Reservation Quick Banner */}
            <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-2xl p-4 sm:p-5 text-white border border-amber-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-sm sm:text-base text-amber-200">
                      رزرو اختصاصی جایگاه بای‌باکس (Buy Box)
                    </h3>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                      سقف مجاز: ۸ روز در هر ماه شمسی
                    </span>
                    {activeReservationToday && (
                      <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                        فعال امروز در {activeVendor.city} ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    با رزرو روزهای دلخواه در تقویم، تا سقف ۵۰٪ سفارشات اعزام به منزل منطقه بدون رقابت سرعتی به فروشگاه شما اختصاص می‌یابد.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => trySetTab('buy_box')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-sm transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer self-start md:self-center"
              >
                <Crown className="w-4 h-4" />
                <span>تقویم و رزرو روزهای آینده</span>
              </button>
            </div>

            {/* Hunting Board Header & Filter Chips */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-black text-stone-900 text-sm">
                    تابلوی شکار سفارشات شهر {vendorCity}
                  </span>
                  {activeVendor.coveredOtherCities && activeVendor.coveredOtherCities.length > 0 && (
                    <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                      +{activeVendor.coveredOtherCities.length} شهر اقماری تحت پوشش
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5" data-testid="vendor-board-categories">
                  <span className="text-[11px] text-stone-600">🏷️ رسته‌های فعالیت شما:</span>
                  {SERVICE_CATEGORIES.map((cat) => {
                    const active = getVendorCategories(activeVendor).includes(cat);
                    const editable = Boolean(onUpdateVendorCategories);
                    return (
                      <button
                        key={cat}
                        type="button"
                        disabled={!editable}
                        data-testid={`board-category-${cat}`}
                        aria-pressed={active}
                        onClick={() => {
                          const current = getVendorCategories(activeVendor);
                          const next = active ? current.filter((c) => c !== cat) : [...current, cat];
                          if (next.length === 0) return; // حداقل یک رسته باید فعال بماند
                          onUpdateVendorCategories?.(activeVendor.id, next);
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                          active ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-white text-stone-400 border-stone-200'
                        } ${editable ? 'cursor-pointer hover:border-amber-500' : 'cursor-default'}`}
                      >
                        {SERVICE_CATEGORY_LABELS[cat]}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-stone-400">
                  فقط سفارش‌های همین رسته‌ها در شهرهای تحت پوشش شما نمایش داده می‌شود. با کلیک روی هر رسته می‌توانید آن را فعال یا غیرفعال کنید.
                </p>
                {activeVendor.coveredOtherCities && activeVendor.coveredOtherCities.length > 0 && (
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    🔗 سایر شهرهای تحت پوشش گالری شما: <strong className="text-amber-900 font-bold">{activeVendor.coveredOtherCities.join(' · ')}</strong>
                  </p>
                )}
                <span className="text-[11px] text-stone-400 block">
                  بیعانه {formatDepositToman(getDeposit(vendorCity))}ی توسط مشتری پرداخت و تضمین شده است
                </span>
              </div>

              {/* Sub-Filters */}
              <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-start md:self-center shrink-0 text-xs">
                <button
                  type="button"
                  onClick={() => setHuntingBoardFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    huntingBoardFilter === 'all'
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  همه سفارشات ({huntingOrdersForCity.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHuntingBoardFilter('local_only')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    huntingBoardFilter === 'local_only'
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  درون‌شهری ({localOrdersCount})
                </button>
                {satelliteOrdersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setHuntingBoardFilter('satellites_only')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      huntingBoardFilter === 'satellites_only'
                        ? 'bg-amber-700 text-white shadow-2xs'
                        : 'text-amber-900 hover:text-amber-950'
                    }`}
                  >
                    <span>شهرهای اقماری</span>
                    <span className="px-1.5 py-0.2 bg-amber-500 text-stone-950 rounded-full text-[10px] font-mono">
                      {satelliteOrdersCount}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {availableOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
                <p className="text-stone-500 text-sm">در حال حاضر تمام سفارشات منطقه شکار شده‌اند. به محض ثبت سفارش جدید، هشدار نمایش داده می‌شود.</p>
              </div>
            ) : (
              availableOrders.map((order) => {
                const isReRouted = order.status === 're_routed';
                const isSatellite = Boolean(order.isSatelliteOrder || order.city !== vendorCity);

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl border p-6 shadow-xs transition-all text-right ${
                      isSatellite 
                        ? 'border-amber-300 ring-2 ring-amber-100/60' 
                        : isReRouted 
                        ? 'border-orange-300 ring-2 ring-orange-200/50' 
                        : 'border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    <span className="inline-block mb-2 px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-bold">
                      رسته: {SERVICE_CATEGORY_LABELS[getOrderCategory(order)]}
                    </span>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-stone-900 text-base">
                            سفارش #{order.orderNumber}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
                            شهر: {order.city} · منطقه: {order.district}
                          </span>
                          {isSatellite && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 shadow-2xs">
                              🛰️ شهر اقماری حومه
                            </span>
                          )}
                          {isReRouted ? (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300">
                              ⚡ مشتری خواهان کالیته دوم / مقایسه قیمت (فرصت فروش بالا)
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                              سفارش جدید
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          مشتری: {order.customerName} · زمان ثبت: {order.createdAt}
                        </p>
                      </div>

                      {/* Claim Action Button & Financial Tag */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5">
                        <div className="text-left sm:text-right text-[11px]">
                          <span className="text-stone-500 block">هزینه شکار سفارش:</span>
                          <span className="font-mono font-black text-rose-800 text-xs">
                            {formatNumber(order.claimCost || 550000)} تومان
                          </span>
                        </div>

                        <button
                          onClick={() => handleInitiateClaim(order)}
                          className={`flex items-center justify-center gap-2 px-5 py-3 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-[0.98] whitespace-nowrap cursor-pointer ${
                            activeVendor.walletBalance >= (order.claimCost || 550000)
                              ? 'bg-amber-700 hover:bg-amber-800 text-white ring-2 ring-amber-500/20'
                              : 'bg-rose-700 hover:bg-rose-800 text-white'
                          }`}
                        >
                          {activeVendor.walletBalance >= (order.claimCost || 550000) ? (
                            <>
                              <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
                              <span>شکار سفارش و اعزام (کسر ۵۵۰,۰۰۰ ت)</span>
                            </>
                          ) : (
                            <>
                              <Wallet className="w-4 h-4 text-white" />
                              <span>شارژ کیف پول و شکار سفارش</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Satellite City Linkage Notice Badge */}
                    {isSatellite && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            🛰️
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 font-black text-xs text-amber-950">
                              <span>سفارش شهر اقماری: {order.city} ⟵ متصل به تابلوی قطب {order.hubCity || vendorCity}</span>
                              {order.distanceKmFromHub && (
                                <span className="text-[10px] px-2 py-0.2 bg-amber-200 text-amber-900 rounded-full font-mono font-bold">
                                  فاصله: ~{order.distanceKmFromHub} کیلومتر از {vendorCity}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                              طبق مصوبه اتصال شهرهای اقماری: به دلیل پوشش خدمات حومه و کمبود فروشگاه محلی، این سفارش از <strong>{order.city}</strong> جهت اعزام سریع کارشناس با کالیته در تابلوی شکار فروشندگان <strong>{vendorCity}</strong> قرار گرفته است.
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 bg-amber-600 text-white rounded-lg shrink-0 self-start sm:self-center shadow-2xs">
                          اعزام به شهر حومه
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs text-stone-700">
                      <div>
                        <span className="font-bold text-stone-900 block mb-1">فضای پروژه و متراژ تقریبی:</span>
                        <p>{order.rooms.join('، ')}</p>
                        <p className="text-stone-500 mt-0.5 font-mono tabular-nums">
                          {order.approximateWindows} پنجره (مجموع عرض حدودی: {order.approximateWidthMeters} متر)
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-stone-900 block mb-1">کالیته‌های درخواستی مشتری:</span>
                        <div className="flex flex-wrap gap-1">
                          {order.preferredStyles.map((style, idx) => (
                            <span key={idx} className="bg-stone-100 border border-stone-200 px-2 py-0.5 rounded text-[11px]">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-stone-900 block mb-1">زمان‌بندی مراجعه به منزل:</span>
                        <p className="font-mono text-stone-800 font-semibold">{order.preferredDate}</p>
                        <p className="text-stone-500">{order.timeSlot}</p>
                        <p className="text-emerald-700 font-bold mt-1">
                          بیعانه تضمین شده: {formatDepositToman(order.depositAmount)} (کسر از فاکتور)
                        </p>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-2.5 bg-stone-50 rounded-lg text-xs text-stone-600 border border-stone-100">
                        <strong>یادداشت مشتری:</strong> {order.notes}
                      </div>
                    )}
                    
                    {isReRouted && order.reRouteReason && (
                      <div className="mt-3 p-2.5 bg-orange-50 rounded-lg text-xs text-orange-900 border border-orange-200">
                        <strong>دلیل درخواست فروشگاه دوم:</strong> {order.reRouteReason}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: My Active Assignments */}
        {activeTab === 'my_assignments' && (
          <div className="mt-6 space-y-6 text-right">
            {myOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
                <p className="text-stone-500 text-sm">شما هنوز سفارشی را قبول نکرده‌اید. به تابلوی شکار سفارشات بروید و اولین سفارش را بپذیرید.</p>
              </div>
            ) : (
              myOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-stone-900">
                          سفارش #{order.orderNumber}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                          {order.status === 'assigned' && 'واگذار شده به شما (در نوبت اعزام)'}
                          {order.status === 'visited' && 'فاکتور ارسال شده به مشتری'}
                          {order.status === 'approved' && 'تایید شده توسط مشتری (دوخت)'}
                          {order.status === 'installed' && 'نصب شده'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        زمان مراجعه: {order.preferredDate} ({order.timeSlot})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {onOpenChat && (
                        <button
                          onClick={() => onOpenChat(order)}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
                        >
                          <MessageSquare className="w-4 h-4 text-indigo-600" />
                          <span>گفتگو با مشتری</span>
                        </button>
                      )}

                      <a
                        href={`tel:${order.phone}`}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors border border-stone-300"
                      >
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>تماس با مشتری ({order.phone})</span>
                      </a>

                      <button
                        onClick={() => handleOpenInvoiceModal(order)}
                        className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shadow-xs"
                      >
                        <FileText className="w-4 h-4" />
                        <span>
                          {order.invoice ? 'ویرایش یا مشاهده فاکتور' : 'صدور فاکتور با کسر بیعانه'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="p-4 bg-stone-50 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-stone-900 block mb-1">نام و نشانی دقیق مشتری:</span>
                      <p className="font-semibold text-stone-800">{order.customerName}</p>
                      <p className="text-stone-600">{order.address} {order.floorAndUnit ? `(${order.floorAndUnit})` : ''}</p>
                      <p className="text-stone-500 mt-1">منطقه: {order.district} · شهر: {order.city}</p>
                    </div>

                    <div>
                      <span className="font-bold text-stone-900 block mb-1">کالیته‌ها و تجهیزات همراه کارشناس:</span>
                      <p className="text-stone-600">پنجره‌ها: {order.rooms.join('، ')} ({order.approximateWidthMeters} متر)</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {order.preferredStyles.map((s, idx) => (
                          <span key={idx} className="bg-white border border-stone-200 px-2 py-0.5 rounded text-[11px]">
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="text-stone-500 mt-2">
                        * همراه داشتن متر لیزری، کاتالوگ رنگی و برگه فاکتور الزامی است.
                      </p>
                    </div>
                  </div>

                  {order.invoice && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                      <span>فاکتور صادر شده: مبلغ نهایی {formatNumber(order.invoice.finalPayable)} تومان (بیعانه {formatDepositWords(order.depositAmount)}ی کسر گردید)</span>
                      <span className="font-bold">وضعیت: {order.invoice.status === 'accepted' ? 'تایید مشتری (آماده دوخت)' : 'در انتظار تایید مشتری'}</span>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        )}

        {/* صندوق پرداخت امن */}
        {activeTab === 'secure_box' && (
          <VendorSecureBox
            payments={escrowPayments}
            withdrawals={escrowWithdrawals}
            sheba={vendorSheba}
            onRequestWithdrawal={(ids) => onRequestEscrowWithdrawal?.(ids, vendorSheba || '')}
          />
        )}

        {/* Tab 3: Wallet & Financial Transactions */}
        {activeTab === 'wallet' && (
          <>
            {!gameProgress.unlocked.wallet ? (
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-600 mb-4">
                {featureLockedMessage('کیف پول')}
              </div>
            ) : (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3" data-testid="wallet-charge-packages">
                <p className="text-xs font-black text-amber-950">بسته شارژ برای مسیر رشد (مرحله ۳)</p>
                <p className="text-[11px] text-stone-600">با انتخاب بسته و انجام شارژ، این مرحله تکمیل می‌شود. بسته ۴ شکار امتیاز بیشتری دارد.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSetWalletChargePackage?.(activeVendor.id, 'basic');
                      setTopUpSuggestedAmount(1100000);
                      setTopUpReasonText('شارژ بسته ۲ شکار سفارش');
                      setIsTopUpModalOpen(true);
                    }}
                    className="rounded-xl border border-stone-200 bg-white p-3 text-right hover:border-amber-500 cursor-pointer"
                  >
                    <p className="text-xs font-black text-stone-900">بسته ۲ شکار</p>
                    <p className="text-[10px] text-stone-500 mt-1">امتیاز کمتر · +{GP.WALLET_BASIC}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSetWalletChargePackage?.(activeVendor.id, 'premium');
                      setTopUpSuggestedAmount(2200000);
                      setTopUpReasonText('شارژ بسته ۴ شکار سفارش');
                      setIsTopUpModalOpen(true);
                    }}
                    className="rounded-xl border border-amber-400 bg-amber-100/50 p-3 text-right hover:border-amber-600 cursor-pointer"
                  >
                    <p className="text-xs font-black text-amber-950">بسته ۴ شکار</p>
                    <p className="text-[10px] text-amber-800 mt-1">امتیاز بیشتر · +{GP.WALLET_PREMIUM}</p>
                  </button>
                </div>
                {gameProgress.walletDiscount > 0 && (
                  <p className="text-[11px] font-bold text-emerald-800">تخفیف سطح شما هنگام شارژ: {Math.round(gameProgress.walletDiscount * 100)}٪</p>
                )}
              </div>
            )}
            <div className="mt-6 space-y-6 text-right">
            
            {/* Top Row: VIP Wallet Card & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* VIP Wallet Card */}
              <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 p-6 sm:p-8 text-white shadow-xl border border-amber-900/30">
                <div className="absolute top-0 left-0 -mt-8 -ml-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 right-0 -mb-8 -mr-8 w-40 h-40 bg-amber-700/20 rounded-full blur-2xl" />
                
                <div className="relative z-10 flex flex-col justify-between h-full min-h-[190px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-amber-300 font-bold block">کیف پول اختصاصی فروشگاه</span>
                        <span className="text-sm font-black text-white">{currentVendor.name}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/10 text-stone-300 border border-white/10">
                      پذیرنده #{currentVendor.id.toUpperCase()}
                    </span>
                  </div>

                  <div className="my-6">
                    <span className="text-xs text-stone-400 block mb-1">موجودی در دسترس جهت شکار سفارشات:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums tracking-tight">
                        {formatNumber(currentVendor.walletBalance)}
                      </span>
                      <span className="text-sm text-amber-300 font-bold">تومان</span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">
                      * نرخ استاندارد شکار هر سفارش در تابلوی مزایده: <strong className="text-amber-200">۵۵۰,۰۰۰ تومان</strong> کسر از این حساب
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        setTopUpSuggestedAmount(550000);
                        setTopUpReasonText('');
                        setIsTopUpModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>افزایش موجودی (شارژ شتاب)</span>
                    </button>

                    <button
                      onClick={() => {
                        setTopUpSuggestedAmount(1100000);
                        setTopUpReasonText('شارژ بسته دو سفارشی با درگاه پرداخت');
                        setIsTopUpModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-all cursor-pointer"
                    >
                      + شارژ بسته ۲ تایی (۱,۱۰۰,۰۰۰ ت)
                    </button>
                  </div>
                </div>
              </div>

              {/* Side Info & FAQ Card */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-3 text-amber-800 font-black text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h4>قوانین مالی و شکار سفارشات</h4>
                  </div>
                  <ul className="space-y-2.5 text-xs text-stone-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>تضمین ۱۰۰٪ لید واقعی:</strong> مشتری {formatDepositWords(getDeposit(vendorCity))} بیعانه نقدی پرداخت کرده و منتظر مشاوره در منزل است.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>انحصار نوبت اول:</strong> سفارش تنها به فروشگاهی که آن را شکار کند واگذار شده و اعزام می‌شود.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>کسر ۵۵۰,۰۰۰ تومان فرانشیز:</strong> تنها در لحظه پذیرش و شکار سفارش از کیف پول کسر می‌شود.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-950">
                  <span>میانگین فاکتورهای پرده در دراپینو ۲۵ تا ۵۰ میلیون تومان است. با هر شکار موفق، سود خالص چشمگیری نصیب فروشگاه می‌شود.</span>
                </div>
              </div>

            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    تاریخچه تراکنش‌های مالی کیف پول
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    ریز واریزهای شتاب و کسورات بابت شکار سفارشات در منطقه
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setWalletFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      walletFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    همه ({currentVendor.transactions?.length || 0})
                  </button>
                  <button
                    onClick={() => setWalletFilter('deposits')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      walletFilter === 'deposits' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    شارژها و واریزها
                  </button>
                  <button
                    onClick={() => setWalletFilter('claims')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      walletFilter === 'claims' ? 'bg-white text-rose-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    کسر بابت شکار سفارش
                  </button>
                  <button
                    onClick={() => setWalletFilter('penalties')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      walletFilter === 'penalties' ? 'bg-white text-rose-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    جریمه‌ها
                  </button>
                </div>
              </div>

              {/* Transactions Table/List */}
              {(() => {
                const txList = (currentVendor.transactions || []).filter((tx) => {
                  if (walletFilter === 'deposits') return !isDebitTransaction(tx);
                  if (walletFilter === 'claims') return tx.type === 'order_claim_fee';
                  if (walletFilter === 'penalties') return isPenaltyTransaction(tx);
                  return true;
                });

                if (txList.length === 0) {
                  return (
                    <div className="py-12 text-center text-stone-500 text-xs">
                      هیچ تراکنشی در این دسته‌بندی یافت نشد.
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right">
                      <thead>
                        <tr className="text-stone-400 border-b border-stone-100 font-semibold">
                          <th className="pb-3 pr-2">نوع و شرح تراکنش</th>
                          <th className="pb-3">شماره سفارش / پیگیری</th>
                          <th className="pb-3">تاریخ و زمان</th>
                          <th className="pb-3 text-left pl-4">مبلغ (تومان)</th>
                          <th className="pb-3 text-left pl-2">مانده پس از تراکنش</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {txList.map((tx) => {
                          const isNegative = isDebitTransaction(tx);
                          const isPenalty = isPenaltyTransaction(tx) && tx.type !== 'penalty_refund';
                          return (
                            <tr key={tx.id} className="hover:bg-stone-50/70 transition-colors">
                              <td className="py-3.5 pr-2">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                      isNegative
                                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    }`}
                                  >
                                    {isNegative ? (
                                      <ArrowUpRight className="w-4 h-4" />
                                    ) : (
                                      <ArrowDownLeft className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div>
                                    {isPenalty && (
                                      <span className="inline-block text-[10px] font-black text-white bg-rose-600 rounded px-1.5 py-0.5 mb-1">
                                        جریمه
                                      </span>
                                    )}
                                    <span className="font-bold text-stone-900 block">
                                      {tx.description}
                                    </span>
                                    <span className="text-[10px] text-stone-400 font-mono">
                                      شناسه: {tx.id}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5">
                                {tx.orderNumber ? (
                                  <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    #{tx.orderNumber}
                                  </span>
                                ) : (
                                  <span className="text-stone-400">-</span>
                                )}
                              </td>

                              <td className="py-3.5 text-stone-600 font-mono">
                                <span>{tx.date}</span>
                                <span className="text-stone-400 text-[10px] mr-1.5">{tx.time}</span>
                              </td>

                              <td className="py-3.5 text-left pl-4 font-mono font-black tabular-nums text-sm">
                                <span className={isNegative ? 'text-rose-700' : 'text-emerald-700'}>
                                  {isNegative ? '- ' : '+ '}
                                  {formatNumber(Math.abs(tx.amount))}
                                </span>
                              </td>

                              <td className="py-3.5 text-left pl-2 font-mono text-stone-600 tabular-nums">
                                <span className={tx.balanceAfter < 0 ? 'text-rose-700 font-bold' : ''} dir="ltr">
                                  {formatNumber(tx.balanceAfter)}
                                </span>{' '}
                                تومان
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

          </div>
          </>
        )}

        {/* Tab: Customer Reviews & Ratings */}
        {activeTab === 'reviews' && (
          <div className="mt-6 space-y-6 text-right">
            
            {/* Top Scorecard & Analytics Hero */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-100 pb-6">
                <div>
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
                    <Award className="w-4 h-4" />
                    <span>کارنامه رسمی کیفیت و رضایت مشتریان</span>
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-stone-900">
                    نظرات و امتیازات ثبت‌شده برای «{currentVendor.name}»
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                    این امتیازات پس از اتمام دوخت و نصب نهایی پرده مستقیماً توسط مشتریان ثبت شده و ملاک اولویت‌بندی در تخصیص سفارشات جدید منطقه است.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-700 text-white flex items-center justify-center font-black text-xl font-mono shadow-xs">
                      {avgRating}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-0.5 text-amber-500 dir-ltr">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Star
                            key={st}
                            className={`w-3.5 h-3.5 ${
                              st <= Math.round(parseFloat(avgRating))
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-stone-700 block mt-0.5">
                        میانگین از {totalReviewsCount} نظر ثبت‌شده
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Criteria Progress Bars */}
              <div className="space-y-3">
                <span className="font-black text-xs text-stone-900 block">
                  تفکیک امتیازات کیفی در ۴ شاخص استاندارد اتحادیه:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800">کیفیت پارچه و دوخت:</span>
                      <span className="font-mono font-black text-amber-700">{criteriaAvg.fabricQuality} / ۵</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-600 rounded-full"
                        style={{ width: `${(parseFloat(criteriaAvg.fabricQuality) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 block">بر اساس کالیته و تست در منزل</span>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800">خوش‌قولی و رفتار کارشناس:</span>
                      <span className="font-mono font-black text-emerald-700">{criteriaAvg.specialistBehavior} / ۵</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${(parseFloat(criteriaAvg.specialistBehavior) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 block">حضور سر ساعت با چمدان نمونه</span>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800">تمیزی و دقت در نصب:</span>
                      <span className="font-mono font-black text-blue-700">{criteriaAvg.installationPrecision} / ۵</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${(parseFloat(criteriaAvg.installationPrecision) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 block">نصب تراز و بدون گرد و خاک</span>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800">تناسب قیمت و کسر بیعانه:</span>
                      <span className="font-mono font-black text-amber-700">{criteriaAvg.priceFairness} / ۵</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(parseFloat(criteriaAvg.priceFairness) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 block">کسر کامل بیعانه از فاکتور</span>
                  </div>
                </div>
              </div>

              {/* Tag Highlights & Recommendation Rate */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-stone-900 block">
                      {recommendRate}٪ خریداران همکاری مجدد با این فروشگاه را توصیه کرده‌اند
                    </span>
                    <span className="text-[11px] text-stone-600">
                      ثبت نظرات شفاف به افزایش رتبه اعتماد و سهمیه شکار سفارش در منطقه کمک می‌کند.
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1 sm:pt-0">
                  {['دوخت بسیار تمیز', 'تطابق کامل با کالیته', 'خوش‌قولی کارشناس', 'کسر دقیق بیعانه'].map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-white border border-amber-300 text-amber-950 font-bold rounded-lg text-[10px] shadow-2xs"
                    >
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews Filter and Listing */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-700" />
                  <span className="font-black text-sm text-stone-900">
                    لیست نظرات ثبت‌شده خریداران
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono font-bold">
                    {displayedReviews.length} نظر
                  </span>
                </div>

                {/* Filter buttons */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setReviewFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      reviewFilter === 'all'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    همه ({vendorReviews.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('5')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      reviewFilter === '5'
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    ۵ ستاره ({vendorReviews.filter(r => r.rating === 5).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('4')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      reviewFilter === '4'
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    ۴ ستاره ({vendorReviews.filter(r => r.rating === 4).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('needs_reply')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      reviewFilter === 'needs_reply'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    نیازمند پاسخ ({vendorReviews.filter(r => !r.vendorReply).length})
                  </button>
                </div>
              </div>

              {/* Reviews Cards */}
              {displayedReviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-6 text-stone-500 text-xs">
                  <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p>نظری با فیلتر انتخابی موجود نیست.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4 text-right transition-all hover:border-amber-200"
                    >
                      {/* Top metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900 border border-amber-200 flex items-center justify-center font-bold text-sm">
                            {rev.customerName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-stone-900">{rev.customerName}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
                                سفارش #{rev.orderNumber}
                              </span>
                              {rev.customerPhone && (
                                <span className="text-[10px] text-stone-400 font-mono">
                                  {rev.customerPhone}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 font-mono">
                              ثبت شده در {rev.date} {rev.time ? `• ساعت ${rev.time}` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Stars & Recommendation */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 text-amber-400 dir-ltr">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <Star
                                key={st}
                                className={`w-4 h-4 ${
                                  st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-xs text-amber-900 font-mono">
                            {rev.rating} از ۵
                          </span>
                          {rev.wouldRecommend && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3 text-emerald-600" />
                              پیشنهاد می‌کند
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment quote box */}
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-stone-800 text-xs sm:text-sm leading-relaxed">
                        «{rev.comment}»
                      </div>

                      {/* Criteria breakdown & tags */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        {rev.tags && rev.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {rev.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 bg-amber-50 text-amber-950 border border-amber-200 rounded-lg text-[10px] font-semibold"
                              >
                                ✓ {t}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="text-[10px] text-stone-500 font-medium">
                          دوخت: {rev.criteria.fabricQuality}/۵ · رفتار: {rev.criteria.specialistBehavior}/۵ · نصب: {rev.criteria.installationPrecision}/۵ · قیمت: {rev.criteria.priceFairness}/۵
                        </div>
                      </div>

                      {/* Official Vendor Reply Section */}
                      {rev.vendorReply ? (
                        <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                              <Store className="w-4 h-4 text-blue-700" />
                              <span>پاسخ رسمی فروشگاه شما ({rev.vendorReply.date}):</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToReviewId(rev.id);
                                setReplyText(rev.vendorReply!.text);
                              }}
                              className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                            >
                              ویرایش پاسخ
                            </button>
                          </div>
                          <p className="text-stone-700 text-xs leading-relaxed pr-5">
                            {rev.vendorReply.text}
                          </p>
                        </div>
                      ) : (
                        <div>
                          {replyingToReviewId === rev.id ? (
                            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                                  <CornerDownLeft className="w-3.5 h-3.5 text-amber-700" />
                                  <span>نگارش پاسخ رسمی فروشگاه به این مشتری:</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyingToReviewId(null);
                                    setReplyText('');
                                  }}
                                  className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
                                >
                                  انصراف
                                </button>
                              </div>

                              {/* Quick template suggestions */}
                              <div className="flex flex-wrap gap-1.5 text-[10px]">
                                <span className="text-stone-400 font-medium">قالب‌های سریع:</span>
                                {[
                                  `با سلام و درود خدمت شما. سپاسگزاریم از حسن اعتماد به ${currentVendor.name}. رضایت شما هدف اصلی ماست.`,
                                  `مشتری گرامی، خوشحالیم که از کیفیت پارچه و نحوه نصب رضایت داشتید. پرده‌ها مبارکتان باشد.`,
                                  `با سپاس فراوان از نظر محبت‌آمیزتان. بازخورد شما باعث دلگرمی تیم کارشناسی و نصاب‌های ماست.`
                                ].map((tmpl, tIdx) => (
                                  <button
                                    key={tIdx}
                                    type="button"
                                    onClick={() => setReplyText(tmpl)}
                                    className="px-2 py-0.5 bg-white border border-stone-200 hover:border-amber-400 rounded-md text-stone-600 hover:text-stone-900 cursor-pointer transition-colors"
                                  >
                                    قالب {tIdx + 1}
                                  </button>
                                ))}
                              </div>

                              <textarea
                                rows={3}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="پاسخ مودبانه و حرفه‌ای خود را بنویسید (این پاسخ در کارنامه فروشگاه و پنل مشتری نمایش داده خواهد شد)..."
                                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 text-stone-900"
                              />

                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSendVendorReply(rev.id)}
                                  disabled={!replyText.trim()}
                                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>ثبت و انتشار پاسخ رسمی</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToReviewId(rev.id);
                                setReplyText('');
                              }}
                              className="text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-amber-700" />
                              <span>ارسال پاسخ رسمی به این نظر</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 4: Store Profile & Catalogs */}
        {activeTab === 'profile' && (
          <div className="mt-6 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-8 text-right">
            
            {/* Top Explanation & Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
              <div>
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
                  <Layers className="w-4 h-4" />
                  <span>تجهیز چمدان کالیته‌های کارشناس اعزامی</span>
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-stone-900">
                  انتخاب کالیته‌ها و امکانات فعال فروشگاه «{currentVendor.name}»
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                  کالیته‌هایی را که در فروشگاه موجود دارید و کارشناس هنگام اعزام به منزل مشتری به همراه دارد تیک بزنید. سفارشات تابلوی مزایده بر اساس تطابق این کالیته‌ها اولویت‌بندی می‌شوند.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCatalogIds(masterCatalogs.map((c) => c.id));
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  انتخاب همه کالیته‌ها
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCatalogIds([]);
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  عدم انتخاب همه
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateVendorCatalogs) {
                      onUpdateVendorCatalogs(currentVendor.id, selectedCatalogIds, customCatalogs);
                    }
                    setCatalogSavedSuccess(true);
                    setTimeout(() => setCatalogSavedSuccess(false), 3500);
                  }}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره کالیته‌های فعال</span>
                </button>
              </div>
            </div>

            {/* Success Banner */}
            {catalogSavedSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold">
                    لیست کالیته‌ها و امکانات فروشگاه با موفقیت در سامانه به‌روزرسانی شد. سفارشات جدید با این کاتالوگ‌ها تطبیق داده می‌شوند.
                  </span>
                </div>
                <span className="font-mono text-emerald-600">{selectedCatalogIds.length} کالیته فعال</span>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {['all', 'مخمل', 'حریر و تور', 'زبرا و شید', 'کتان و گونی‌بافت', 'پتینه و ژاکارد', 'ورتیکال و هوشمند'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCatalogCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                      catalogCategoryFilter === cat
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat === 'all' ? 'همه کالیته‌ها' : cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="جستجوی نام یا کد کالیته..."
                  className="w-full pl-3 pr-8 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            {/* Catalogs Selection Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>لیست کالیته‌های رسمی و مورد تایید سامانه دراپینو:</span>
                <span className="font-bold text-amber-800">
                  {selectedCatalogIds.length} از {masterCatalogs.length} کالیته در کیف کارشناس موجود است
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {masterCatalogs
                  .filter((cat) => {
                    const matchesCategory = catalogCategoryFilter === 'all' || cat.category === catalogCategoryFilter;
                    const matchesSearch = 
                      cat.name.includes(catalogSearch) || 
                      cat.code.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                      cat.texture.includes(catalogSearch);
                    return matchesCategory && matchesSearch;
                  })
                  .map((catalog) => {
                    const isChecked = selectedCatalogIds.includes(catalog.id);
                    return (
                      <div
                        key={catalog.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedCatalogIds(selectedCatalogIds.filter((id) => id !== catalog.id));
                          } else {
                            setSelectedCatalogIds([...selectedCatalogIds, catalog.id]);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${
                          isChecked
                            ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-600/20 shadow-xs'
                            : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Fabric Sample Image */}
                          <img
                            src={catalog.imageUrl}
                            alt={catalog.name}
                            className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                                {catalog.code}
                              </span>
                              <span className="text-[10px] text-stone-500">{catalog.category}</span>
                            </div>
                            <h4 className="font-bold text-xs text-stone-900 truncate" title={catalog.name}>
                              {catalog.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                              {catalog.description}
                            </p>
                          </div>
                        </div>

                        {/* Specs & Status */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                          <div className="text-stone-500">
                            <span>{catalog.origin}</span> · <span className="font-mono">{catalog.colorsCount} رنگ</span>
                          </div>

                          <div className="flex items-center gap-1.5 font-bold">
                            {isChecked ? (
                              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg text-[10px]">
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span>موجود در کیف</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-stone-400 bg-stone-100 px-2 py-0.5 rounded-lg text-[10px]">
                                <Square className="w-3.5 h-3.5" />
                                <span>ناموجود</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Custom Catalogs Section - Human Moderation Pipeline */}
            <div className="pt-6 border-t border-stone-100 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 border border-amber-200 p-4 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>پیشنهاد و افزودن کالیته اختصاصی (با نظارت دستی مدیر سیستم):</span>
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    طبق مقررات صنفی و جلوگیری از درج محتوای نامناسب، کلیه کالیته‌ها و امکانات سفارشی پیش از انتشار در سایت و کاتالوگ شما توسط ناظر انسانی بررسی و تایید دستی می‌گردد.
                  </p>
                </div>
              </div>

              {/* Submission Form */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">نام یا کد تجاری کالیته اختصاصی:</label>
                    <input
                      type="text"
                      value={newCustomCatalogName}
                      onChange={(e) => setNewCustomCatalogName(e.target.value)}
                      placeholder="مثلا: کالیته مخمل لوکس طلاکوب دبی کد DX-80"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700 text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">دسته‌بندی اصلی پارچه:</label>
                    <select
                      id="custom-cat-type"
                      defaultValue="مخمل"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700 text-stone-900"
                    >
                      <option value="مخمل">مخمل و پتینه</option>
                      <option value="حریر و تور">حریر و تور</option>
                      <option value="زبرا و شید">زبرا، شید و دو مکانیزم</option>
                      <option value="کتان و گونی‌بافت">کتان، لینن و گونی‌بافت</option>
                      <option value="ورتیکال و هوشمند">سیستم‌های برقی و هوشمند</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">قیمت از (تومان):</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customCatPriceMin}
                      onChange={(e) => setCustomCatPriceMin(e.target.value.replace(/[^\d]/g, ''))}
                      placeholder="مثلاً 850000"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">قیمت تا (تومان):</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customCatPriceMax}
                      onChange={(e) => setCustomCatPriceMax(e.target.value.replace(/[^\d]/g, ''))}
                      placeholder="مثلاً 1500000"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-stone-500 -mt-1">رنج قیمت به مشتری نشان داده می‌شود تا حدود هزینه کالیته مشخص باشد.</p>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">توضیحات و مشخصات کیفی جهت بازرسی مدیر:</label>
                  <input
                    type="text"
                    id="custom-cat-desc"
                    placeholder="مثلا: پارچه ۵۵۰ گرمی ترک با ۱۰ سال ثبات رنگ و شستشوی مستقیم"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700 text-stone-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-stone-700">تصاویر کالیته (حداکثر ۱۰):</label>
                    <span className="text-[10px] text-stone-500 font-mono">{customCatImages.length}/10</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {customCatImages.map((img, idx) => (
                      <div key={idx} className={`relative rounded-xl border-2 overflow-hidden bg-white aspect-square ${customCatPrimaryIdx === idx ? 'border-amber-500 ring-2 ring-amber-200' : 'border-stone-200'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 flex gap-0.5 p-0.5 bg-black/50">
                          <button
                            type="button"
                            onClick={() => setCustomCatPrimaryIdx(idx)}
                            className={`flex-1 text-[9px] font-bold py-1 rounded cursor-pointer ${customCatPrimaryIdx === idx ? 'bg-amber-500 text-white' : 'bg-white/90 text-stone-800'}`}
                          >
                            {customCatPrimaryIdx === idx ? 'اصلی' : 'اصلی کن'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomCatImages((prev) => {
                                const next = prev.filter((_, i) => i !== idx);
                                return next;
                              });
                              setCustomCatPrimaryIdx((prev) => {
                                if (idx === prev) return 0;
                                if (idx < prev) return Math.max(0, prev - 1);
                                return prev;
                              });
                            }}
                            className="px-1.5 text-[9px] font-bold py-1 rounded bg-rose-500 text-white cursor-pointer"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                    {customCatImages.length < 10 && (
                      <label className="rounded-xl border-2 border-dashed border-stone-300 aspect-square flex flex-col items-center justify-center gap-1 cursor-pointer bg-white hover:border-amber-400 text-stone-400">
                        <Upload className="w-5 h-5" />
                        <span className="text-[10px] font-bold">افزودن</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            e.target.value = '';
                            const room = 10 - customCatImages.length;
                            files.slice(0, room).forEach((file) => {
                              if (!file.type.startsWith('image/')) return;
                              if (file.size > 5 * 1024 * 1024) {
                                alert(`حجم «${file.name}» بیش از ۵ مگابایت است.`);
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                setCustomCatImages((prev) => {
                                  if (prev.length >= 10) return prev;
                                  return [...prev, String(reader.result || '')];
                                });
                              };
                              reader.readAsDataURL(file);
                            });
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1.5">روی «اصلی کن» بزنید تا همان تصویر به‌عنوان تصویر اول / اصلی کالیته ثبت شود.</p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const descEl = document.getElementById('custom-cat-desc') as HTMLInputElement;
                      const typeEl = document.getElementById('custom-cat-type') as HTMLSelectElement;
                      if (!newCustomCatalogName.trim()) {
                        alert('لطفاً عنوان کالیته را وارد نمایید.');
                        return;
                      }
                      const pMin = customCatPriceMin ? Number(customCatPriceMin) : undefined;
                      const pMax = customCatPriceMax ? Number(customCatPriceMax) : undefined;
                      if (pMin != null && pMax != null && pMax < pMin) {
                        alert('حد بالای قیمت نمی‌تواند از حد پایین کمتر باشد.');
                        return;
                      }
                      if (customCatImages.length < 1) {
                        alert('حداقل یک تصویر برای کالیته آپلود کنید.');
                        return;
                      }
                      const primary = Math.min(customCatPrimaryIdx, customCatImages.length - 1);
                      if (onSubmitCustomCatalog) {
                        onSubmitCustomCatalog({
                          title: newCustomCatalogName.trim(),
                          category: typeEl?.value || 'مخمل',
                          description: descEl?.value || 'کالیته پارچه سفارشی ثبت شده توسط همکار جهت بررسی صنفی',
                          texture: 'پارچه بافت متراکم استاندارد',
                          priceMin: pMin,
                          priceMax: pMax,
                          images: customCatImages,
                          primaryImageIndex: primary,
                        });
                      } else {
                        setCustomCatalogs([...customCatalogs, newCustomCatalogName.trim()]);
                      }
                      setNewCustomCatalogName('');
                      setCustomCatPriceMin('');
                      setCustomCatPriceMax('');
                      setCustomCatImages([]);
                      setCustomCatPrimaryIdx(0);
                      if (descEl) descEl.value = '';
                      alert('کالیته شما برای بازرسی و تایید دستی مدیر سیستم ارسال شد. پس از تایید توسط ناظر انسانی در سایت فعال خواهد شد.');
                    }}
                    className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ارسال به مدیر سامانه جهت بازبینی و تایید دستی</span>
                  </button>
                </div>
              </div>

              {/* Status of Vendor Submissions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-700 block">
                  وضعیت کالیته‌ها و امکانات ارسالی شما به ناظر سیستم:
                </span>

                {vendorSubmissions.filter(s => s.vendorId === currentVendor.id).length === 0 ? (
                  <div className="text-xs text-stone-400 p-4 text-center bg-stone-50 rounded-xl border border-stone-200">
                    تاکنون کالیته سفارشی اختصاصی ارسال نکرده‌اید.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {vendorSubmissions
                      .filter(s => s.vendorId === currentVendor.id)
                      .map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3.5 bg-white border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex gap-3 min-w-0">
                            {(sub.imageUrl || (sub.images && sub.images[sub.primaryImageIndex || 0])) && (
                              <img
                                src={sub.imageUrl || sub.images![sub.primaryImageIndex || 0]}
                                alt=""
                                className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-stone-900">{sub.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-mono">
                                {sub.category}
                              </span>
                              {(sub.priceMin != null || sub.priceMax != null) && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-mono">
                                  {sub.priceMin != null ? formatNumber(sub.priceMin) : '؟'}
                                  {' — '}
                                  {sub.priceMax != null ? formatNumber(sub.priceMax) : '؟'} تومان
                                </span>
                              )}
                              {sub.images && sub.images.length > 0 && (
                                <span className="text-[10px] text-stone-500">{sub.images.length} تصویر</span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500">{sub.description}</p>
                            {sub.adminFeedback && (
                              <p className="text-[11px] text-stone-700 mt-1 bg-stone-50 p-1.5 rounded-lg border border-stone-100">
                                <strong>یادداشت مدیر:</strong> {sub.adminFeedback}
                              </p>
                            )}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {sub.status === 'pending_approval' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-bold">
                                <Hourglass className="w-3 h-3 animate-spin" />
                                <span>در صف بازرسی دستی مدیر</span>
                              </span>
                            )}
                            {sub.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>تایید شده توسط ناظر (فعال)</span>
                              </span>
                            )}
                            {sub.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>رد شده توسط مدیر</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ratings and Reviews Summary in Vendor Profile */}
            <div className="pt-6 border-t border-stone-100 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <h3 className="font-bold text-sm text-stone-900">
                    کارنامه رضایت و رتبه‌بندی خریداران ({totalReviewsCount} نظر):
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => trySetTab('reviews')}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                >
                  <span>مشاهده همه نظرات و ارسال پاسخ</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-50/70 to-orange-50/40 rounded-2xl border border-amber-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2 bg-white rounded-xl border border-amber-200/60">
                  <span className="text-[10px] text-stone-500 block mb-0.5">میانگین امتیاز کل</span>
                  <div className="flex items-center justify-center gap-1 text-base font-black text-amber-800 font-mono">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>{avgRating}</span>
                    <span className="text-xs text-stone-400 font-normal">/ ۵</span>
                  </div>
                </div>

                <div className="p-2 bg-white rounded-xl border border-amber-200/60">
                  <span className="text-[10px] text-stone-500 block mb-0.5">کیفیت پارچه و دوخت</span>
                  <span className="text-base font-black text-amber-800 font-mono">
                    {criteriaAvg.fabricQuality} / ۵
                  </span>
                </div>

                <div className="p-2 bg-white rounded-xl border border-amber-200/60">
                  <span className="text-[10px] text-stone-500 block mb-0.5">دقت و تمیزی نصب</span>
                  <span className="text-base font-black text-blue-800 font-mono">
                    {criteriaAvg.installationPrecision} / ۵
                  </span>
                </div>

                <div className="p-2 bg-white rounded-xl border border-amber-200/60">
                  <span className="text-[10px] text-stone-500 block mb-0.5">نرخ توصیه به دیگران</span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {recommendRate}٪
                  </span>
                </div>
              </div>

              {/* Latest review preview */}
              {vendorReviews.length > 0 && (
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-800">آخرین نظر مشتری ({vendorReviews[0].customerName}):</span>
                    <span className="text-stone-600 italic">«{vendorReviews[0].comment.slice(0, 75)}...»</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 font-mono shrink-0">
                    {vendorReviews[0].rating} از ۵ ★
                  </span>
                </div>
              )}
            </div>

            {/* Legal and Store Information */}
            <div className="pt-6 border-t border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-stone-900">اطلاعات حقوقی، تماس و نشانی فروشگاه:</h3>
                {onOpenProfileModal && (
                  <button
                    type="button"
                    onClick={onOpenProfileModal}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    ویرایش مشخصات، تلفن و نشانی
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div>
                  <span className="text-stone-400 block mb-0.5">نشانی رسمی نمایشگاه:</span>
                  <span className="font-medium text-stone-800">{currentVendor.address}</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-0.5">وضعیت پروانه کسب اتحادیه پرده و پارچه:</span>
                  <span className="font-medium text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>تایید شده و دارای مجوز رسمی اتحادیه (معتبر تا ۱۴۰۵)</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab: Sponsored City Ads & Ladder */}
        {activeTab === 'sponsored_ladder' && (() => {
          const vendorCity = currentVendor.city || 'تهران';
          const cityVendors = vendors.filter(
            (v) => v.city === vendorCity || v.coveredDistricts?.some((d) => d.includes(vendorCity))
          );
          const promotedCityVendors = cityVendors
            .filter((v) => v.isPromotedAd)
            .sort((a, b) => (b.promotedAt || 0) - (a.promotedAt || 0));

          const promotedCount = promotedCityVendors.length;
          const isSurpassingTen = promotedCount >= 10;
          const excess = Math.max(0, promotedCount - 9);
          const currentLadderPrice = isSurpassingTen
            ? Math.round(200000 * Math.pow(1.20, excess))
            : 200000;

          const vendorRank = promotedCityVendors.findIndex((v) => v.id === currentVendor.id) + 1;
          const isCurrentVendorPromoted = currentVendor.isPromotedAd && vendorRank > 0;
          const canAfford = currentVendor.walletBalance >= currentLadderPrice;
          const oldestPromotedVendor = promotedCityVendors.length > 0
            ? promotedCityVendors[promotedCityVendors.length - 1]
            : null;

          // 20-Vendor Case Study Table Data
          const simulationSteps = Array.from({ length: 20 }, (_, i) => {
            const applicantNum = i + 1;
            const isOver10 = applicantNum > 10;
            const excessSteps = applicantNum - 10;
            const fee = isOver10 ? Math.round(200000 * Math.pow(1.20, excessSteps)) : 200000;
            const displacedStoreNum = isOver10 ? applicantNum - 10 : null;
            const isFinalTop10 = applicantNum >= 11;
            const finalRank = isFinalTop10 ? (20 - applicantNum + 1) : null;

            return {
              applicantNum,
              fee,
              isOver10,
              displacedStoreNum,
              isFinalTop10,
              finalRank,
            };
          });

          return (
            <div className="mt-6 space-y-6">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>ویترین اختصاصی ادز شهر {vendorCity}</span>
                      </span>
                      <span className="text-xs text-amber-200/80">سقف ظرفیت: ۱۰ فروشگاه</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      مدیریت نردبان و تبلیغات در صفحه اول شهر {vendorCity}
                    </h2>

                    <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
                      با نردبان کردن فروشگاه خود، مستقیماً به <strong>رتبه ۱</strong> ویترین صفحه اول مشتریان شهر {vendorCity} صعود کنید. هزینه نردبان از کیف پول کسر شده و بیشترین سهم از اعزام کارشناس و سفارشات خانگی را نصیب فروشگاه شما خواهد کرد.
                    </p>
                  </div>

                  {/* Current Status Box */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-center min-w-[220px] shrink-0 space-y-2">
                    <span className="text-[11px] font-bold text-amber-200 block">وضعیت فعلی فروشگاه شما</span>
                    {isCurrentVendorPromoted ? (
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>رتبه #{vendorRank} در ویترین شهر</span>
                        </div>
                        <span className="text-[10px] text-amber-200 block mt-1">
                          پرداخت قبلی: {formatNumber(currentVendor.promotedFeePaid || 200000)} تومان
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-bold">
                          خارج از ویترین ۱۰تایی شهر
                        </span>
                        <span className="text-[10px] text-amber-300 block mt-1">
                          جهت نمایش در صفحه اصلی ثبت نردبان کنید
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rules & Pricing Overview Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-stone-900">تعرفه پایه (تا ۱۰ فروشگاه)</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    تا زمانی که تعداد درخواست‌های ثبت شده در شهر کمتر از ۱۰ فروشگاه باشد، هزینه نردبان ثابت و معادل <strong>۲۰۰,۰۰۰ تومان</strong> است.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-stone-900">افزایش ۲۰٪ به ازای هر متقاضی مازاد</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    پس از تکمیل سقف ۱۰ فروشگاه، به ازای هر فروشگاه جدید <strong>۲۰ درصد به مبلغ قبلی اضافه می‌شود</strong> (۲۰۰هزار ← ۲۴۰هزار ← ۲۸۸هزار تومان و...).
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-stone-900">قانون نردبان و اخراج قدیمی‌ترین</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    هر فروشگاه جدید با پرداخت مبلغ روز، نردبان شده و در <strong>رتبه ۱</strong> می‌نشیند. قدیمی‌ترین فروشگاه از انتهای لیست ۱۰تایی خارج می‌گردد.
                  </p>
                </div>

              </div>

              {/* Action Box: Pay & Ladder */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-800">محاسبه تعرفه روز نردبان در {vendorCity}:</span>
                    <span className="text-[11px] bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded-md">
                      {promotedCount} فروشگاه فعال در ویترین
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-stone-900 font-mono tabular-nums">
                      {formatNumber(currentLadderPrice)}
                    </span>
                    <span className="text-sm font-bold text-stone-500">تومان</span>
                    {isSurpassingTen && (
                      <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full mr-2">
                        +{excess * 20}٪ نرخ رقابتی مازاد
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500">
                    موجودی فعلی کیف پول فروشگاه: <strong className="text-stone-800 font-mono">{formatNumber(currentVendor.walletBalance)} تومان</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  {canAfford ? (
                    <button
                      type="button"
                      onClick={() => onVendorLadder?.(currentVendor.id, vendorCity)}
                      className="px-6 py-3.5 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Flame className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                      <span>پرداخت {formatNumber(currentLadderPrice)} ت و ثبت نردبان رتبه ۱</span>
                    </button>
                  ) : (
                    <div className="space-y-2 text-center sm:text-right">
                      <div className="text-xs text-rose-700 font-bold">
                        کسری موجودی: {formatNumber(currentLadderPrice - currentVendor.walletBalance)} تومان
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTopUpSuggestedAmount(currentLadderPrice - currentVendor.walletBalance + 50000);
                          setTopUpReasonText(`شارژ جهت ثبت نردبان فروشگاه در ویترین شهر ${vendorCity}`);
                          setIsTopUpModalOpen(true);
                        }}
                        className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Wallet className="w-4 h-4 text-emerald-200" />
                        <span>افزایش موجودی کیف پول و نردبان</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Top 10 Showcase in this city */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-black text-base text-stone-900">
                      ویترین ۱۰ گالری فعال شهر {vendorCity} (ترتیب بر اساس نردبان)
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      نردبان جدید در رتبه ۱ قرار می‌گیرد و قدیمی‌ترین فروشگاه انتهای لیست خارج می‌شود.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    {promotedCityVendors.length} / ۱۰ فروشگاه
                  </span>
                </div>

                {promotedCityVendors.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-500">
                    هنوز فروشگاهی در شهر {vendorCity} نردبان ثبت نکرده است. اولین باشید!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                          <th className="py-2.5 px-3">رتبه</th>
                          <th className="py-2.5 px-3">نام فروشگاه و مدیریت</th>
                          <th className="py-2.5 px-3">نشانی و مناطق</th>
                          <th className="py-2.5 px-3">امتیاز</th>
                          <th className="py-2.5 px-3">هزینه نردبان</th>
                          <th className="py-2.5 px-3">وضعیت نردبان</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {promotedCityVendors.slice(0, 10).map((v, idx) => {
                          const rank = idx + 1;
                          const isCurrent = v.id === currentVendor.id;
                          const isOldest = idx === promotedCityVendors.length - 1 && promotedCityVendors.length >= 10;

                          return (
                            <tr
                              key={v.id}
                              className={`transition-colors ${
                                isCurrent
                                  ? 'bg-amber-50/80 font-bold'
                                  : isOldest
                                  ? 'bg-rose-50/40 text-stone-700'
                                  : 'hover:bg-stone-50/60'
                              }`}
                            >
                              <td className="py-3 px-3">
                                <span
                                  className={`w-6 h-6 rounded-lg font-black text-xs inline-flex items-center justify-center font-mono ${
                                    rank === 1
                                      ? 'bg-amber-500 text-white'
                                      : rank <= 3
                                      ? 'bg-amber-700/80 text-white'
                                      : 'bg-stone-100 text-stone-700'
                                  }`}
                                >
                                  #{rank}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-stone-900">{v.name}</span>
                                  {isCurrent && (
                                    <span className="text-[10px] bg-amber-800 text-white px-2 py-0.2 rounded-full font-bold">
                                      فروشگاه شما
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-stone-500 block">مدیریت: {v.ownerName}</span>
                              </td>
                              <td className="py-3 px-3 max-w-xs truncate text-stone-600">
                                {v.address}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-amber-900">
                                {v.rating}★
                              </td>
                              <td className="py-3 px-3 font-mono text-stone-800">
                                {formatNumber(v.promotedFeePaid || 200000)} ت
                              </td>
                              <td className="py-3 px-3">
                                {isOldest ? (
                                  <span className="text-[10px] text-rose-800 font-bold bg-rose-100 px-2 py-0.5 rounded-md">
                                    قدیمی‌ترین (خروج با نردبان بعدی)
                                  </span>
                                ) : rank === 1 ? (
                                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                                    <Flame className="w-3 h-3 text-emerald-600" />
                                    <span>صدر ویترین</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-stone-500">فعال در ویترین</span>
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

              {/* Interactive 20-Vendor Scenario Simulation Tool */}
              <div className="bg-gradient-to-br from-stone-50 to-amber-50/40 rounded-3xl border border-amber-200/90 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-800 text-white font-bold text-[11px]">
                        شبیه‌ساز سناریوی درخواستی
                      </span>
                      <h3 className="font-black text-stone-900 text-base">
                        تحلیل سناریوی ۲۰ فروشگاه متقاضی نردبان متوالی
                      </h3>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
                      «فرض کنیم ۲۰ فروشگاه درخواست دادند: تا سقف ۱۰ فروشگاه همان مبلغ ۲۰۰ هزار تومان است؛ بعد از آن به ازای هر فروشگاه جدید ۲۰ درصد به این قیمت اضافه شده، فروشگاه جدید نردبان شده و جای قدیمی‌ترین فروشگاه را می‌گیرد.»
                    </p>
                  </div>

                  {onSimulate20Vendors && (
                    <button
                      type="button"
                      onClick={() => onSimulate20Vendors(vendorCity)}
                      className="px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>اجرای این شبیه‌سازی در {vendorCity}</span>
                    </button>
                  )}
                </div>

                {/* Simulation Step-by-Step Table */}
                <div className="max-h-80 overflow-y-auto rounded-2xl border border-stone-200 bg-white">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-stone-100 text-stone-700 font-bold sticky top-0 border-b border-stone-200 z-10">
                      <tr>
                        <th className="py-2.5 px-3">شماره متقاضی</th>
                        <th className="py-2.5 px-3">مبلغ پرداختی از کیف پول</th>
                        <th className="py-2.5 px-3">فرمول افزایش نرخ</th>
                        <th className="py-2.5 px-3">اثر نردبان در لیست ۱۰تایی</th>
                        <th className="py-2.5 px-3">وضعیت نهایی در ویترین</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {simulationSteps.map((step) => (
                        <tr
                          key={step.applicantNum}
                          className={`${
                            step.applicantNum === 20
                              ? 'bg-amber-100/60 font-bold'
                              : step.isFinalTop10
                              ? 'bg-emerald-50/30'
                              : 'bg-stone-50/40 text-stone-500'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold">
                            فروشگاه متقاضی #{step.applicantNum}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-black text-stone-900">
                            {formatNumber(step.fee)} تومان
                          </td>
                          <td className="py-2.5 px-3 text-stone-600">
                            {!step.isOver10 ? (
                              <span className="text-stone-500">تعرفه پایه اولیه</span>
                            ) : (
                              <span className="text-amber-800 font-semibold font-mono">
                                +۲۰٪ نسبت به متقاضی #{step.applicantNum - 1}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {!step.isOver10 ? (
                              <span className="text-emerald-700">ورود به جایگاه #{step.applicantNum}</span>
                            ) : (
                              <span className="text-rose-700 font-bold flex items-center gap-1">
                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>نردبان به رتبه ۱ (فروشگاه #{step.displacedStoreNum} خارج شد)</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {step.isFinalTop10 ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] font-mono">
                                ماندگار در رتبه #{step.finalRank}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-600 text-[10px]">
                                نردبان شد و سپس خارج گردید
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-stone-100/80 rounded-2xl text-[11px] text-stone-600 flex items-center justify-between">
                  <span>
                    💡 نتیجه الگوریتم: در پایان ۲۰ درخواست، دقیقاً ۱۰ فروشگاه متقاضی آخر (متقاضیان ۱۱ تا ۲۰) در ویترین باقی می‌مانند و متقاضی بیستم در رتبه ۱ قرار دارد.
                  </span>
                  <span className="font-bold text-amber-900">
                    تعرفه متقاضی بیستم: ۱,۲۳۸,۳۴۷ تومان
                  </span>
                </div>
              </div>

            </div>
          );
        })()}

        {/* Tab: Vendor Portfolio Management (Max 15 items, JPG only, 1200x800 standard) */}
        {activeTab === 'portfolio' && (() => {
          const portfolioList = currentVendor.portfolio || [];
          const isMaxReached = portfolioList.length >= 15;

          return (
            <div className="mt-6 space-y-6">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300">
                        <ImageIcon className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-bold text-amber-200">
                        آلبوم رسمی نمونه‌کارهای فروشگاه در دراپینو
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      مدیریت و ارسال نمونه‌کارهای اجرایی
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                      تصاویر پروژه‌های دوخته و نصب شده خود را برای جلب اعتماد مشتریان به اشتراک بگذارید. نمونه‌کارها پس از <strong>بررسی و تایید دستی مدیر سایت</strong> در صفحه نخست و پروفایل عمومی شما به نمایش درمی‌آیند.
                    </p>
                  </div>

                  {/* Counter Badge */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[170px] shrink-0 space-y-1">
                    <span className="text-[11px] text-amber-200 block font-bold">ظرفیت آلبوم فروشگاه</span>
                    <span className="text-2xl font-black text-white font-mono">
                      {portfolioList.length} <span className="text-sm font-normal text-stone-300">از ۱۵ نمونه</span>
                    </span>
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${(portfolioList.length / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mandatory Guidelines Box */}
                <div className="pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white font-bold mb-0.5">فرمت الزامی: JPG</strong>
                      <span className="text-stone-300 text-[11px]">صرفاً تصاویر با فرمت .jpg یا .jpeg مورد پذیرش سیستم است.</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-start gap-2">
                    <Tag className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white font-bold mb-0.5">استاندارد ابعاد: ۱۲۰۰×۸۰۰ پیکسل</strong>
                      <span className="text-stone-300 text-[11px]">کادر افقی ۳:۲ جهت یکپارچگی گالری سایت (تبدیل خودکار در سیستم فعال است).</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white font-bold mb-0.5">نیاز به تایید دستی مدیر</strong>
                      <span className="text-stone-300 text-[11px]">نمونه‌کارها پس از بررسی کیفی توسط مدیر، روی سایت فعال می‌گردند.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Form */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-amber-700" />
                    <h3 className="font-black text-base text-stone-900">
                      ارسال نمونه‌کار جدید (حداکثر تا ۱۵ نمونه)
                    </h3>
                  </div>

                  {isMaxReached ? (
                    <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl font-bold">
                      سقف مجاز ۱۵ نمونه تکمیل است
                    </span>
                  ) : (
                    <span className="text-xs text-stone-500 font-mono">
                      {15 - portfolioList.length} جایگاه خالی باقیمانده
                    </span>
                  )}
                </div>

                {portfolioUploadSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      نمونه‌کار با موفقیت ارسال شد و در صف تایید دستی مدیریت قرار گرفت. به محض تایید، در صفحه اصلی و پروفایل منتشر می‌شود.
                    </span>
                  </div>
                )}

                {portfolioFileError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{portfolioFileError}</span>
                  </div>
                )}

                {isMaxReached ? (
                  <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-2">
                    <p className="font-bold text-stone-800">
                      فروشگاه شما به سقف ۱۵ نمونه‌کار رسیده است.
                    </p>
                    <p className="text-stone-500">
                      در صورتی که می‌خواهید پروژه جدیدی بارگذاری نمایید، لطفاً یکی از نمونه‌های قدیمی‌تر زیر را حذف کنید.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitPortfolio} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-800">
                          عنوان نمونه‌کار <span className="text-rose-500">*</span>:
                        </label>
                        <input
                          type="text"
                          required
                          value={portfolioTitle}
                          onChange={(e) => setPortfolioTitle(e.target.value)}
                          placeholder="مثال: پرده مخمل کالیفرنیا و تور شاین پذیرایی"
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-700 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-800">
                          دسته‌بندی پرده:
                        </label>
                        <select
                          value={portfolioCategory}
                          onChange={(e) => setPortfolioCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-700 focus:outline-hidden"
                        >
                          <option value="پذیرایی و سالن">پذیرایی و سالن</option>
                          <option value="اتاق خواب">اتاق خواب</option>
                          <option value="مینیمال و مدرن">مینیمال و مدرن</option>
                          <option value="پانچ و اسپرت">پانچ و اسپرت</option>
                          <option value="زبرا و شید دو مکانیزم">زبرا و شید دو مکانیزم</option>
                          <option value="هتلی و اداری">هتلی و اداری</option>
                          <option value="سایر مدل‌ها">سایر مدل‌ها</option>
                        </select>
                      </div>

                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-800">
                        توضیحات تکمیلی پروژه (پارچه، سبک دوخت، متراژ، منطقه):
                      </label>
                      <textarea
                        rows={2}
                        value={portfolioDescription}
                        onChange={(e) => setPortfolioDescription(e.target.value)}
                        placeholder="توضیحاتی مانند: دوخت پلیسه با آستر ساتن، ریل مخفی، متراژ ۱۶ متر، نصب در منطقه زعفرانیه..."
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-700 focus:outline-hidden resize-none"
                      />
                    </div>

                    {/* Image Selector strictly JPG */}
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-amber-700" />
                          <span>فایل تصویر نمونه‌کار (فرمت الزامی: JPG | ابعاد استاندارد: ۱۲۰۰×۸۰۰ px):</span>
                        </span>
                        {portfolioDimensionStatus && (
                          <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            {portfolioDimensionStatus}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input
                          type="file"
                          accept=".jpg,.jpeg,image/jpeg"
                          onChange={handlePortfolioFileChange}
                          className="block w-full text-xs text-stone-500 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-800 file:text-white hover:file:bg-amber-900 cursor-pointer"
                        />

                        <span className="text-xs text-stone-400 text-center shrink-0">یا لینک تصویر:</span>

                        <input
                          type="url"
                          value={portfolioImageUrl}
                          onChange={(e) => {
                            setPortfolioImageUrl(e.target.value);
                            setPortfolioDimensionStatus('لینک مستقیم تصویر ۱۲۰۰×۸۰۰ JPG');
                          }}
                          placeholder="https://.../photo.jpg"
                          className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 font-mono text-left focus:ring-2 focus:ring-amber-700 focus:outline-hidden"
                        />
                      </div>

                      {portfolioImageUrl && (
                        <div className="pt-2 flex items-center gap-3">
                          <div className="w-32 aspect-[3/2] rounded-xl overflow-hidden border border-stone-300 bg-black shrink-0 relative">
                            <img
                              src={portfolioImageUrl}
                              alt="پیش‌نمایش"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1 rounded font-mono">
                              1200×800
                            </span>
                          </div>
                          <div className="text-xs text-stone-600">
                            <span className="font-bold text-stone-800 block">پیش‌نمایش استاندارد کادر تصویر</span>
                            <span className="text-[11px] text-stone-500">
                              تصویر با نسبت استاندارد ۳:۲ آماده ارسال برای تایید دستی ناظر شد.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={!portfolioTitle.trim() || !portfolioImageUrl}
                        className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-amber-300" />
                        <span>ارسال نمونه‌کار جهت بررسی و تایید مدیر سایت</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* List of Existing Portfolio Items */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-black text-base text-stone-900">
                      نمونه‌کارهای ثبت‌شده برای این فروشگاه ({portfolioList.length} از ۱۵)
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      فقط نمونه‌کارهایی که دارای وضعیت «تایید شده» هستند به مشتریان سایت نمایش داده می‌شوند.
                    </p>
                  </div>
                </div>

                {portfolioList.length === 0 ? (
                  <div className="p-12 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-2">
                    <ImageIcon className="w-10 h-10 text-stone-300 mx-auto" />
                    <p className="text-xs font-bold text-stone-700">
                      هنوز هیچ نمونه‌کاری برای فروشگاه شما ثبت نشده است.
                    </p>
                    <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                      با ثبت تصاویر باکیفیت JPG با ابعاد ۱۲۰۰×۸۰۰ از کارهای انجام شده خود، شانس انتخاب توسط مشتریان را تا ۳ برابر افزایش دهید.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {portfolioList.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-[3/2] bg-stone-100 overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-md font-mono">
                              1200×800 JPG
                            </span>
                            {item.category && (
                              <span className="absolute top-2 right-2 bg-stone-900/80 text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
                                {item.category}
                              </span>
                            )}
                          </div>

                          <div className="p-3.5 space-y-2">
                            <h4 className="font-bold text-sm text-stone-900 line-clamp-1">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {/* Approval Status Badge */}
                            <div className="pt-2">
                              {item.status === 'approved' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>تایید شده و فعال در سایت</span>
                                </span>
                              )}

                              {item.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                                  <span>در انتظار تایید دستی ناظر</span>
                                </span>
                              )}

                              {item.status === 'rejected' && (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                                    <span>رد شده توسط مدیر</span>
                                  </span>
                                  {item.rejectionReason && (
                                    <p className="text-[10px] text-rose-700 font-medium">
                                      دلیل: {item.rejectionReason}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Footer & Delete */}
                        <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                          <span>ثبت: {item.createdAt}</span>

                          {onDeletePortfolioItem && (
                            <button
                              type="button"
                              onClick={() => onDeletePortfolioItem(currentVendor.id, item.id)}
                              className="text-stone-400 hover:text-rose-700 transition-colors p-1 rounded-lg cursor-pointer flex items-center gap-1"
                              title="حذف نمونه‌کار"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })()}

        {/* Tab: Buy Box Reservation & Monitoring */}
        {activeTab === 'buy_box' && (
          <div className="mt-6">
            <VendorBuyBoxSection
              currentVendor={currentVendor}
              eligibility={restrictionSummary?.buyBox}
              buyBoxSettings={buyBoxSettings}
              reservations={buyBoxReservations}
              orders={orders}
              onReserveBuyBox={onReserveBuyBox || ((_iso, _p, _pr) => ({ success: true, message: 'رزرو با موفقیت انجام شد' }))}
              onTopUpWallet={(amount) => {
                setTopUpSuggestedAmount(amount);
                setTopUpReasonText('شارژ کیف پول جهت رزرو جایگاه اختصاصی بای‌باکس');
                setIsTopUpModalOpen(true);
              }}
              onAcceptBuyBoxOrder={onAcceptBuyBoxOrder || ((ordId) => {
                onClaimOrder(ordId, currentVendor.id, currentVendor.name, currentVendor.phone);
              })}
              onRejectBuyBoxOrderToHunting={onRejectBuyBoxOrderToHunting || ((_ordId) => {})}
              onOpenChat={onOpenChat}
            />
          </div>
        )}

      </div>

      {/* Invoice Generator Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="text-right">
                <h3 className="font-bold text-base sm:text-lg text-stone-900">
                  صدور فاکتور دیجیتال رسمی برای سفارش #{selectedOrderForInvoice.orderNumber}
                </h3>
                <span className="text-xs text-stone-500">
                  مشتری: {selectedOrderForInvoice.customerName} ({selectedOrderForInvoice.district})
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6 text-right max-h-[75vh] overflow-y-auto">
              
              {/* Fabric Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-900">
                    اقلام پارچه و کالیته‌های اندازه‌گیری شده:
                  </label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن پارچه یا کالیته دیگر</span>
                  </button>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-2.5">شرح پارچه / کالیته</th>
                        <th className="p-2.5 w-24">کد کالیته</th>
                        <th className="p-2.5 w-24">درجه پارچه</th>
                        <th className="p-2.5 w-20">متراژ</th>
                        <th className="p-2.5 w-28">قیمت متری (تومان)</th>
                        <th className="p-2.5 w-28">جمع کل</th>
                        <th className="p-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {invoiceItems.map((item) => (
                        <tr key={item.id}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                              className="w-full px-2 py-1 border border-stone-200 rounded text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.fabricCode}
                              onChange={(e) => updateItem(item.id, 'fabricCode', e.target.value)}
                              className="w-full px-2 py-1 border border-stone-200 rounded font-mono text-xs text-left"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={item.fabricGrade || ''}
                              onChange={(e) => updateItem(item.id, 'fabricGrade', e.target.value as FabricGrade)}
                              className={`w-full px-1.5 py-1 border rounded text-xs bg-white ${
                                invoiceSubmitAttempted && !item.fabricGrade ? 'border-red-400' : 'border-stone-200'
                              }`}
                            >
                              <option value="" disabled>انتخاب...</option>
                              {FABRIC_GRADES.map((g) => (
                                <option key={g.value} value={g.value}>{g.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.1"
                              value={item.meters}
                              onChange={(e) => updateItem(item.id, 'meters', e.target.value)}
                              className="w-full px-2 py-1 border border-stone-200 rounded font-mono text-xs text-left"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="10000"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                              className="w-full px-2 py-1 border border-stone-200 rounded font-mono text-xs text-left"
                            />
                          </td>
                          <td className="p-2 font-mono font-bold tabular-nums text-stone-800">
                            {formatNumber(item.total)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItemRow(item.id)}
                              className="text-stone-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Service & Hardware Cost Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    اجرت دوخت و نوار پرده (تومان):
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={tailoringFee}
                    onChange={(e) => setTailoringFee(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    هزینه ریل و ملزومات (تومان):
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={hardwareFee}
                    onChange={(e) => setHardwareFee(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    هزینه نصب و تحویل (تومان):
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={installationFee}
                    onChange={(e) => setInstallationFee(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono text-left"
                  />
                </div>
              </div>

              {/* تاریخ تحویل و نصب، پیش‌پرداخت مشتری و شبای فروشنده */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    تاریخ تحویل و نصب (شمسی):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    inputMode="numeric"
                    value={deliveryInstallDate}
                    onChange={(e) => setDeliveryInstallDate(e.target.value)}
                    placeholder="۱۴۰۵/۰۷/۲۰"
                    className={`w-full px-3 py-2 text-xs border rounded-lg font-mono text-left ${
                      invoiceSubmitAttempted && !isDeliveryDateValid ? 'border-red-400' : 'border-stone-300'
                    }`}
                  />
                  {invoiceSubmitAttempted && !isDeliveryDateValid && (
                    <p className="text-[11px] text-red-600 mt-1">تاریخ را به شکل سال/ماه/روز وارد کنید؛ مثلاً ۱۴۰۵/۰۷/۲۰</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    مبلغ پیش‌پرداخت مشتری (تومان):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    inputMode="numeric"
                    value={prepaymentInput === '' ? String(defaultPrepayment) : prepaymentInput}
                    onChange={(e) => setPrepaymentInput(e.target.value)}
                    className={`w-full px-3 py-2 text-xs border rounded-lg font-mono text-left ${
                      !isPrepaymentValid ? 'border-red-400' : 'border-stone-300'
                    }`}
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[60, 70, 80].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setPrepaymentInput(String(Math.round((finalPayable * pct) / 100)))}
                        className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-[11px] font-bold text-stone-700"
                      >
                        {pct.toLocaleString('fa-IR')}٪
                      </button>
                    ))}
                  </div>
                  <p className={`text-[11px] mt-1 ${isPrepaymentValid ? 'text-stone-500' : 'text-red-600 font-semibold'}`}>
                    مجاز: {PREPAYMENT_MIN_PERCENT.toLocaleString('fa-IR')} تا {PREPAYMENT_MAX_PERCENT.toLocaleString('fa-IR')} درصد مبلغ فاکتور، یعنی بین {formatNumber(prepayRange.min)} و {formatNumber(prepayRange.max)} تومان
                    {isPrepaymentValid && ` (مبلغ واردشده: ${prepaymentPercent(prepaymentAmount, finalPayable).toLocaleString('fa-IR')}٪)`}
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-xs ${hasVendorSheba ? 'bg-stone-50 border-stone-200' : 'bg-red-50 border-red-300'}`}>
                <div className="font-bold text-stone-800 mb-1">شماره شبای فروشنده (درج در فاکتور):</div>
                {hasVendorSheba ? (
                  <div className="font-mono text-left" dir="ltr">{formatSheba(vendorSheba)}</div>
                ) : (
                  <div className="text-red-700 leading-relaxed">
                    شماره شبای فروشگاه ثبت نشده یا معتبر نیست (قالب صحیح: IR و ۲۴ رقم). برای صدور فاکتور، آن را در بخش اطلاعات فروشگاه ثبت کنید.
                    {onOpenProfileModal && (
                      <button
                        type="button"
                        onClick={onOpenProfileModal}
                        className="mr-2 underline font-bold text-red-800 hover:text-red-900"
                      >
                        ثبت شماره شبا
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  توضیحات و تعهدات فروشگاه برای مشتری:
                </label>
                <textarea
                  rows={2}
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              {/* Live Totals & Deposit deduction */}
              <div className="p-4 bg-stone-900 text-white rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-300">
                  <span>جمع اقلام، دوخت و تجهیزات:</span>
                  <span className="font-bold text-white font-mono tabular-nums">{formatNumber(subtotal)} تومان</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400">
                  <span>کسر خودکار بیعانه پرداختی مشتری در دراپینو:</span>
                  <span className="font-bold font-mono tabular-nums">- {formatNumber(depositDeduction)} تومان</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-sm font-black text-amber-400">
                  <span>مبلغ قابل پرداخت فاکتور توسط مشتری:</span>
                  <span className="text-base font-mono tabular-nums">{formatNumber(finalPayable)} تومان</span>
                </div>
                <div className="flex items-center justify-between text-stone-300">
                  <span>پیش‌پرداخت مشتری:</span>
                  <span className="font-bold text-white font-mono tabular-nums">{formatNumber(prepaymentAmount)} تومان</span>
                </div>
                <div className="flex items-center justify-between text-stone-300">
                  <span>مانده تسویه (۴۸ الی ۲۴ ساعت قبل از نصب):</span>
                  <span className="font-bold text-white font-mono tabular-nums">{formatNumber(Math.max(0, finalPayable - prepaymentAmount))} تومان</span>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-stone-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                {buildSettlementTerms(normalizeJalaliDate(deliveryInstallDate), selectedOrderForInvoice.customerName)}
              </p>

            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedOrderForInvoice(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleSubmitInvoice}
                className={`px-6 py-2.5 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-md ${
                  canSubmitInvoice ? 'bg-amber-700 hover:bg-amber-800' : 'bg-stone-400 cursor-not-allowed'
                }`}
              >
                ارسال رسمی فاکتور به کارتابل مشتری
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Claim Order Confirmation Modal */}
      {orderToConfirmClaim && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 text-right animate-in fade-in zoom-in duration-150">
            
            <div className="bg-gradient-to-r from-amber-800 to-amber-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    تأیید شکار سفارش #{orderToConfirmClaim.orderNumber}
                  </h3>
                  <p className="text-xs text-amber-200">
                    منطقه: {orderToConfirmClaim.district} ({orderToConfirmClaim.customerName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOrderToConfirmClaim(null)}
                className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-stone-700 space-y-1.5">
                <p className="font-bold text-amber-950">
                  با تایید شکار، سفارش به طور انحصاری به فروشگاه «{currentVendor.name}» تخصیص داده می‌شود.
                </p>
                <p className="text-[11px] text-stone-600">
                  اطلاعات تماس کامل، نشانی دقیق و شماره همراه مشتری در اختیارتان قرار می‌گیرد و اعزام کارشناس جهت تست کالیته در محل الزامی است.
                </p>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between text-stone-600">
                  <span>موجودی فعلی کیف پول فروشگاه:</span>
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    {formatNumber(currentVendor.walletBalance)} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between text-rose-700 font-bold">
                  <span>هزینه شکار سفارش (فرانشیز سامانه):</span>
                  <span className="font-mono tabular-nums">
                    - {formatNumber(orderToConfirmClaim.claimCost || 550000)} تومان
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-emerald-800 font-black text-sm">
                  <span>مانده موجودی پس از شکار:</span>
                  <span className="font-mono tabular-nums">
                    {formatNumber(currentVendor.walletBalance - (orderToConfirmClaim.claimCost || 550000))} تومان
                  </span>
                </div>
              </div>

              <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-600 space-y-1">
                <div className="flex justify-between font-semibold text-stone-800">
                  <span>بیعانه پرداختی مشتری:</span>
                  <span className="font-mono text-emerald-700">{formatDepositToman(depositDeduction)} (تضمین شده)</span>
                </div>
                <p className="text-[10px] text-stone-500">
                  * این مبلغ در فاکتور نهایی دوخت پرده از حساب مشتری کسر خواهد شد.
                </p>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setOrderToConfirmClaim(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleConfirmClaimOrder}
                className="flex-1 py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Flame className="w-4 h-4 text-amber-300" />
                <span>تایید نهایی و کسر ۵۵۰,۰۰۰ تومان</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Wallet Top-up Modal */}
      <WalletTopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        vendor={currentVendor}
        onTopUp={(amount) => {
          if (onTopUpWallet) {
            onTopUpWallet(currentVendor.id, amount);
          }
        }}
        suggestedAmount={topUpSuggestedAmount}
        reasonText={topUpReasonText}
      />

    </div>
  );
};
