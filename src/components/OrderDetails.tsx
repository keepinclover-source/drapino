import React, { useState, useRef, useEffect } from 'react';
import { VisitRequest, SelectedSwatchItem, CurtainInvoice, OrderStatus } from '../types';
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Flame, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Receipt, 
  Store, 
  Phone, 
  Star, 
  MessageSquare, 
  AlertTriangle, 
  X, 
  Play, 
  Pause, 
  SlidersHorizontal,
  Info,
  Calendar,
  MapPin,
  Clock,
  Columns
} from 'lucide-react';
import { getOrderSwatches } from '../utils/swatchUtils';
import { formatDepositToman } from '../utils/deposit';

export interface OrderDetailsProps {
  order?: VisitRequest;
  /**
   * تصاویر کالیته‌های انتخابی (می‌تواند به صورت آرایه‌ای از آدرس تصاویر مستقیم یا اشیاء کالیته باشد)
   */
  swatchImages?: string[];
  selectedSwatches?: SelectedSwatchItem[];
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChat?: (order: VisitRequest) => void;
  onRequestSecondStore?: (orderId: string, reason: string) => void;
  onOpenInvoice?: (order: VisitRequest) => void;
  onOpenSupport?: (order: VisitRequest) => void;
  className?: string;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  swatchImages,
  selectedSwatches: propSwatches,
  isModal = false,
  isOpen = true,
  onClose,
  onOpenChat,
  onRequestSecondStore,
  onOpenInvoice,
  onOpenSupport,
  className = '',
}) => {
  // Compute normalized swatches list
  const swatches: SelectedSwatchItem[] = React.useMemo(() => {
    if (propSwatches && propSwatches.length > 0) {
      return propSwatches;
    }
    if (order) {
      const derived = getOrderSwatches(order);
      if (derived && derived.length > 0) return derived;
    }
    if (swatchImages && swatchImages.length > 0) {
      return swatchImages.map((imgUrl, index) => ({
        id: `swatch-img-${index + 1}`,
        title: `کالیته انتخابی شماره ${index + 1}`,
        fabricCode: `SW-${100 + index}`,
        category: 'کالیته انتخابی سفارش',
        colorName: 'رنگ سفارشی',
        colorHex: '#d97706',
        imageUrl: imgUrl,
        texture: 'بافت استاندارد با تراکم درجه یک اتحادیه',
        origin: 'ایران / وارداتی',
        grammage: '۵۰۰ گرم بر مترمربع',
        lightBlockPercentage: 85,
        description: 'تصویر پارچه انتخابی برای کارشناسی و اندازه‌گیری حضوری.',
        isConfirmedBySpecialist: true,
      }));
    }
    return [];
  }, [propSwatches, order, swatchImages]);

  // Active slider index
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isLensActive, setIsLensActive] = useState<boolean>(true);
  const [lensPos, setLensPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isHoveringImage, setIsHoveringImage] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Lighting simulation mode
  const [lightingMode, setLightingMode] = useState<'daylight' | 'warm' | 'cool' | 'night'>('daylight');

  // Autoplay state
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);

  // Fullscreen lightbox state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Dual compare mode in slider
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareIndex, setCompareIndex] = useState<number>(1 % (swatches.length || 1));

  // Refs
  const mainImageRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);

  // Reset zoom on slide change
  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [currentSlideIndex]);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoPlay || swatches.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % swatches.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlay, swatches.length]);

  // Keyboard navigation for slider
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToNextSlide();
      } else if (e.key === 'ArrowRight') {
        goToPrevSlide();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (onClose) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, swatches.length]);

  if (!isOpen) return null;

  const currentSwatch = swatches[currentSlideIndex] || swatches[0];
  const secondarySwatch = swatches[compareIndex] || swatches[0];

  const goToNextSlide = () => {
    if (swatches.length === 0) return;
    setCurrentSlideIndex((prev) => (prev + 1) % swatches.length);
  };

  const goToPrevSlide = () => {
    if (swatches.length === 0) return;
    setCurrentSlideIndex((prev) => (prev - 1 + swatches.length) % swatches.length);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse move handler for Magnifying Lens / Pan
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLensPos({ x, y });

    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Double click toggles zoom 1x <-> 2x
  const handleDoubleClick = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2.2);
    } else {
      handleResetZoom();
    }
  };

  // Lighting Filter Styles
  const getLightingFilterClass = () => {
    switch (lightingMode) {
      case 'warm':
        return 'brightness-[1.04] sepia-[0.35] contrast-[1.02] hue-rotate-[-10deg]';
      case 'cool':
        return 'brightness-[1.02] hue-rotate-[14deg] saturate-[0.92] contrast-[1.05]';
      case 'night':
        return 'brightness-[0.78] contrast-[1.12] saturate-[0.85]';
      case 'daylight':
      default:
        return 'brightness-100 contrast-100 saturate-100';
    }
  };

  const formatNumber = (num: number) => num.toLocaleString('fa-IR');

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'bidding':
        return { label: 'در تابلوی مزایده (انتظار برای قبول فروشگاه)', classes: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'assigned':
        return { label: 'واگذار شده به فروشگاه (در نوبت اعزام)', classes: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'visited':
        return { label: 'فاکتور صادر شده (نیاز به تصمیم شما)', classes: 'bg-purple-100 text-purple-900 border-purple-300 font-bold' };
      case 're_routed':
        return { label: 'ارجاع مجدد برای فروشگاه دوم (جهت مقایسه)', classes: 'bg-orange-100 text-orange-900 border-orange-300 font-bold' };
      case 'approved':
        return { label: 'تایید شده (در حال دوخت و آماده‌سازی)', classes: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'installed':
        return { label: 'تحویل و نصب شده (تکمیل)', classes: 'bg-stone-200 text-stone-800 border-stone-300' };
      case 'cancelled':
        return { label: 'لغو شده', classes: 'bg-red-100 text-red-900 border-red-300' };
      default:
        return { label: status, classes: 'bg-stone-100 text-stone-800' };
    }
  };

  // Content of OrderDetails
  const content = (
    <div className={`space-y-6 text-right ${className}`}>
      
      {/* ========================================================================= */}
      {/* 1. ORDER SUMMARY BAR (Measurements, Store, Financials) */}
      {/* ========================================================================= */}
      {order && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-1">
            <span className="text-xs text-stone-500 block font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>فضای نصب و ابعاد پنجره‌ها:</span>
            </span>
            <p className="font-bold text-stone-900 text-sm">{order.rooms.join('، ')}</p>
            <p className="text-xs text-stone-600 font-mono">
              حدود {order.approximateWindows} پنجره ({order.approximateWidthMeters} متر عرض تقریبی)
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-1">
            <span className="text-xs text-stone-500 block font-medium flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-700" />
              <span>فروشگاه مجری کارشناسی و اعزام:</span>
            </span>
            <p className="font-bold text-amber-900 text-sm">
              {order.assignedVendorName || 'در انتظار واگذاری به فروشگاه معتبر'}
            </p>
            {order.assignedVendorPhone ? (
              <p className="text-xs text-stone-600 font-mono dir-ltr text-right">{order.assignedVendorPhone}</p>
            ) : (
              <p className="text-[11px] text-amber-700">در تابلوی رقابتی منطقه</p>
            )}
          </div>

          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1">
            <span className="text-xs text-emerald-800 block font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>وضعیت مالی و بیعانه:</span>
            </span>
            <p className="font-bold text-emerald-950 text-sm">
              بیعانه {formatDepositToman(order.depositAmount)} کسر گردید
            </p>
            {order.invoice && (
              <p className="text-xs text-stone-700 font-bold font-mono">
                مبلغ نهایی فاکتور: {formatNumber(order.invoice.finalPayable)} تومان
              </p>
            )}
          </div>
        </div>
      )}

      {/* Special Customer Notes if provided */}
      {order?.notes && (
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>توضیحات اختصاصی مشتری برای کارشناس:</strong> {order.notes}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. THE CORE NEW SECTION: INTERACTIVE SWATCH SLIDER GALLERY WITH ZOOM */}
      {/* ========================================================================= */}
      <section 
        className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-6 space-y-4"
        aria-label="گالری اسلایدر تعاملی کالیته‌های انتخابی"
      >
        {/* Section Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-stone-900 text-sm sm:text-base">
                  گالری اسلایدر تعاملی کالیته‌های انتخابی
                </h3>
                {swatches.length > 0 && (
                  <span className="bg-amber-100 text-amber-900 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                    {currentSlideIndex + 1} از {swatches.length} کالیته
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                بررسی بافت و تاروپود پارچه با قابلیت ذره‌بین زنده، پرو نورپردازی و اسلایدر لمسی
              </p>
            </div>
          </div>

          {/* Quick Toolbar: Zoom & View Options */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Auto Play Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                isAutoPlay 
                  ? 'bg-amber-100 text-amber-900 border-amber-300' 
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title="ورق زدن خودکار اسلایدها"
            >
              {isAutoPlay ? <Pause className="w-3.5 h-3.5 text-amber-700" /> : <Play className="w-3.5 h-3.5 text-stone-600" />}
              <span>{isAutoPlay ? 'توقف اسلاید' : 'پخش خودکار'}</span>
            </button>

            {/* Lens Loupe Toggle */}
            <button
              type="button"
              onClick={() => setIsLensActive(!isLensActive)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                isLensActive 
                  ? 'bg-amber-600 text-white border-amber-700 shadow-2xs' 
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title="فعال‌سازی ذره‌بین شناور روی بافت پارچه"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isLensActive ? 'ذره‌بین فعال' : 'فعال‌سازی ذره‌بین'}</span>
            </button>

            {/* Side-by-Side Dual Compare Mode */}
            {swatches.length > 1 && (
              <button
                type="button"
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  isCompareMode 
                    ? 'bg-indigo-600 text-white border-indigo-700' 
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
                title="مقایسه دو کالیته در کنار هم"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{isCompareMode ? 'حالت تکی' : 'مقایسه دو کالیته'}</span>
              </button>
            )}

            {/* Fullscreen Lightbox Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors cursor-pointer"
              title="نمایش تمام‌صفحه استودیو کالیته"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lighting Simulation Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
          <div className="flex items-center gap-1.5 text-stone-700 font-bold">
            <Sun className="w-4 h-4 text-amber-600" />
            <span>شبیه‌ساز نور محیط منزل:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLightingMode('daylight')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                lightingMode === 'daylight'
                  ? 'bg-amber-500 text-white shadow-2xs font-bold'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>نور طبیعی روز</span>
            </button>

            <button
              type="button"
              onClick={() => setLightingMode('warm')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                lightingMode === 'warm'
                  ? 'bg-amber-600 text-white shadow-2xs font-bold'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>لوستر آفتابی (گرم)</span>
            </button>

            <button
              type="button"
              onClick={() => setLightingMode('cool')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                lightingMode === 'cool'
                  ? 'bg-sky-600 text-white shadow-2xs font-bold'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>مهتابی و سفید</span>
            </button>

            <button
              type="button"
              onClick={() => setLightingMode('night')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                lightingMode === 'night'
                  ? 'bg-stone-800 text-white shadow-2xs font-bold'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>نور ملایم شب</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SLIDER MAIN DISPLAY AREA */}
        {/* ========================================================================= */}
        {swatches.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-500">
            <Layers className="w-8 h-8 mx-auto text-stone-400 mb-2" />
            <p>هیچ کالیته‌ای برای این سفارش ثبت نشده است.</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Main Stage Grid (Dual Compare or Single Slide) */}
            <div className={`grid gap-4 ${isCompareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              
              {/* Primary Slide Display */}
              <div className="relative flex flex-col bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-md">
                
                {/* Floating Zoom Controls Bar (Top Left) */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-stone-900/80 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-md">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3.5}
                    className="p-1.5 text-white hover:text-amber-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                    title="بزرگ‌نمایی (+)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono text-stone-200 px-1 font-bold">
                    {zoomLevel.toFixed(1)}x
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="p-1.5 text-white hover:text-amber-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                    title="کوچک‌نمایی (-)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  {zoomLevel > 1 && (
                    <button
                      type="button"
                      onClick={handleResetZoom}
                      className="p-1.5 text-amber-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="بازنشانی اندازه (1x)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Floating Swatch Tags (Top Right) */}
                <div className="absolute top-3 right-3 z-20 flex flex-wrap items-center gap-1.5">
                  <span className="bg-stone-900/85 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/20 shadow-xs">
                    {currentSwatch.category}
                  </span>
                  <span className="bg-amber-600/90 backdrop-blur-md text-white font-mono text-xs font-bold px-2 py-1 rounded-lg shadow-xs">
                    {currentSwatch.fabricCode}
                  </span>
                  {currentSwatch.lightBlockPercentage && (
                    <span className="bg-black/70 backdrop-blur-md text-amber-300 text-[11px] font-mono px-2 py-1 rounded-lg border border-amber-400/30">
                      {currentSwatch.lightBlockPercentage}% مسدودسازی نور
                    </span>
                  )}
                </div>

                {/* Slider Navigation Arrows */}
                <button
                  type="button"
                  onClick={goToPrevSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg hover:scale-105 border border-white/20 cursor-pointer"
                  title="کالیته قبلی (کلید چپ کیبورد)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={goToNextSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg hover:scale-105 border border-white/20 cursor-pointer"
                  title="کالیته بعدی (کلید راست کیبورد)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Main Interactive Zoomable Canvas */}
                <div
                  ref={mainImageRef}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsHoveringImage(true)}
                  onMouseLeave={() => {
                    setIsHoveringImage(false);
                    setIsDragging(false);
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onDoubleClick={handleDoubleClick}
                  className={`relative w-full h-[360px] sm:h-[440px] bg-stone-950 flex items-center justify-center overflow-hidden select-none cursor-${
                    zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : (isLensActive ? 'crosshair' : 'zoom-in')
                  }`}
                >
                  <img
                    src={currentSwatch.imageUrl}
                    alt={currentSwatch.title}
                    style={{
                      transform: zoomLevel > 1 
                        ? `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)` 
                        : 'scale(1)',
                      transition: isDragging ? 'none' : 'transform 0.25s ease-out',
                    }}
                    className={`max-w-full max-h-full w-full h-full object-cover transition-[filter] duration-300 ${getLightingFilterClass()}`}
                    draggable={false}
                  />

                  {/* REAL-TIME LOUPE / MAGNIFYING LENS (Hover Lens Zoom) */}
                  {isLensActive && isHoveringImage && zoomLevel === 1 && (
                    <div
                      className="absolute pointer-events-none rounded-full border-2 border-amber-400 shadow-2xl overflow-hidden z-30 ring-4 ring-black/40"
                      style={{
                        width: '160px',
                        height: '160px',
                        left: `${lensPos.x}%`,
                        top: `${lensPos.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className={`w-full h-full bg-no-repeat ${getLightingFilterClass()}`}
                        style={{
                          backgroundImage: `url(${currentSwatch.imageUrl})`,
                          backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
                          backgroundSize: '350%',
                        }}
                      />
                      <div className="absolute inset-0 border border-white/40 rounded-full" />
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-stone-900/85 text-amber-300 text-[9px] font-mono px-1.5 py-0.2 rounded-full">
                        بزرگ‌نمایی ۳.۵x
                      </div>
                    </div>
                  )}

                  {/* Micro Hint when zoom active */}
                  {zoomLevel > 1 && (
                    <div className="absolute bottom-16 right-4 z-20 bg-stone-900/80 backdrop-blur-xs text-stone-200 text-[11px] px-2.5 py-1 rounded-lg border border-white/10 pointer-events-none">
                      برای حرکت روی بافت، ماوس را بکشید (درگ) | دوبار کلیک: خروج
                    </div>
                  )}
                </div>

                {/* Primary Slide Bottom Caption Bar */}
                <div className="bg-stone-900/95 backdrop-blur-md p-4 text-white border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-white/40 shadow-xs shrink-0"
                        style={{ backgroundColor: currentSwatch.colorHex || '#f59e0b' }}
                      />
                      <h4 className="font-extrabold text-sm sm:text-base text-white">
                        {currentSwatch.title}
                      </h4>
                      <span className="text-xs text-amber-300 font-medium">
                        ({currentSwatch.colorName})
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 line-clamp-1">
                      {currentSwatch.texture || currentSwatch.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    {currentSwatch.grammage && (
                      <span className="text-stone-300 font-mono bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
                        {currentSwatch.grammage}
                      </span>
                    )}
                    {currentSwatch.origin && (
                      <span className="text-stone-400 bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
                        مبدا: {currentSwatch.origin}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Secondary Slide Display (When Dual Compare is Active) */}
              {isCompareMode && swatches.length > 1 && (
                <div className="relative flex flex-col bg-stone-900 rounded-2xl overflow-hidden border border-indigo-900/60 shadow-md">
                  
                  {/* Select Swatch to Compare */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-stone-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-indigo-400/30">
                    <span className="text-indigo-300 text-xs font-bold">مقایسه با:</span>
                    <select
                      value={compareIndex}
                      onChange={(e) => setCompareIndex(Number(e.target.value))}
                      className="bg-stone-800 text-white text-xs rounded-lg px-2 py-1 border border-stone-700 focus:outline-hidden cursor-pointer"
                    >
                      {swatches.map((sw, idx) => (
                        <option key={sw.id} value={idx} disabled={idx === currentSlideIndex}>
                          {sw.fabricCode} - {sw.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Secondary Image */}
                  <div className="relative w-full h-[360px] sm:h-[440px] bg-stone-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={secondarySwatch.imageUrl}
                      alt={secondarySwatch.title}
                      className={`max-w-full max-h-full w-full h-full object-cover ${getLightingFilterClass()}`}
                      draggable={false}
                    />
                  </div>

                  {/* Secondary Caption */}
                  <div className="bg-stone-900/95 backdrop-blur-md p-4 text-white border-t border-stone-800 flex flex-col justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-white/40 shadow-xs shrink-0"
                        style={{ backgroundColor: secondarySwatch.colorHex || '#f59e0b' }}
                      />
                      <h4 className="font-extrabold text-sm text-white">
                        {secondarySwatch.title} ({secondarySwatch.fabricCode})
                      </h4>
                    </div>
                    <p className="text-xs text-stone-300">
                      {secondarySwatch.colorName} - {secondarySwatch.texture}
                    </p>
                  </div>

                </div>
              )}

            </div>

            {/* ========================================================================= */}
            {/* THUMBNAILS SLIDER STRIP */}
            {/* ========================================================================= */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2 text-xs text-stone-600">
                <span className="font-bold flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
                  <span>انتخاب سریع از میان کالیته‌های سفارش ({swatches.length} کالیته):</span>
                </span>
                <span className="text-stone-400 font-mono">
                  تصویر فعال: {currentSlideIndex + 1}
                </span>
              </div>

              <div 
                ref={thumbnailsContainerRef}
                className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-300"
              >
                {swatches.map((swatch, idx) => {
                  const isActive = idx === currentSlideIndex;
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`group relative flex-shrink-0 w-24 sm:w-28 rounded-xl overflow-hidden border-2 transition-all p-1 text-right bg-white cursor-pointer ${
                        isActive 
                          ? 'border-amber-600 shadow-md scale-102 ring-2 ring-amber-400/40' 
                          : 'border-stone-200 hover:border-amber-300 hover:shadow-xs opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="relative w-full h-16 sm:h-20 rounded-lg overflow-hidden bg-stone-100">
                        <img
                          src={swatch.imageUrl}
                          alt={swatch.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <span className="absolute bottom-1 right-1 bg-stone-900/80 text-white text-[9px] font-mono px-1 py-0.2 rounded font-bold">
                          {swatch.fabricCode}
                        </span>
                      </div>
                      <div className="pt-1.5 px-0.5">
                        <p className={`text-[11px] font-bold truncate ${isActive ? 'text-amber-900' : 'text-stone-700'}`}>
                          {swatch.title}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-stone-500">
                          <span
                            className="w-2 h-2 rounded-full border border-stone-300 shrink-0"
                            style={{ backgroundColor: swatch.colorHex || '#d4d4d4' }}
                          />
                          <span className="truncate">{swatch.colorName}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Swatch Detailed Information Accordion / Spec Card */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-stone-500 font-bold block">مشخصات بافت و الیاف:</span>
                <p className="text-stone-800 leading-relaxed">
                  {currentSwatch.texture || 'بافت نرم متراکم، دارای لایه ضد پرز و مقاومت در برابر سایش'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-stone-500 font-bold block">پیشنهاد کاربرد در منزل:</span>
                <p className="text-stone-800 leading-relaxed">
                  {currentSwatch.suggestedFor || 'مناسب پرده‌های پذیرایی قدی، اتاق خواب و هماهنگ با مبلمان مدرن و کلاسیک'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-stone-500 font-bold block">اصالت و تاییدیه کارشناس:</span>
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>تایید شده توسط کارشناس رسمی اتحادیه صنف</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  این کالیته دارای کد رهگیری اختصاصی اتحادیه و تضمین رنگ ثابت است.
                </p>
              </div>
            </div>

          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* 3. OFFICIAL INVOICE QUICK DETAILS (If Available) */}
      {/* ========================================================================= */}
      {order?.invoice && (
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-700" />
              <span>فاکتور رسمی صادر شده ({order.invoice.invoiceNumber})</span>
            </h4>
            {onOpenInvoice && (
              <button
                type="button"
                onClick={() => onOpenInvoice(order)}
                className="text-xs text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
              >
                مشاهده برگه کامل و ریز اقلام فاکتور
              </button>
            )}
          </div>

          <div className="text-xs text-stone-600 flex flex-wrap items-center justify-between gap-3 pt-1 font-mono">
            <span>جمع کل اقلام و دوخت: {formatNumber(order.invoice.subtotal)} تومان</span>
            <span className="text-emerald-700 font-bold">
              - {formatNumber(order.invoice.depositDeduction)} تومان کسر بیعانه پرداخت‌شده
            </span>
            <span className="text-amber-900 font-black font-sans text-sm">
              مبلغ نهایی قابل پرداخت: {formatNumber(order.invoice.finalPayable)} تومان
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. OFFICIAL UNION WARRANTY BANNER */}
      {/* ========================================================================= */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-stone-700">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-950 block">ضمانت رسمی اتحادیه صنف پرده‌دوزان و پرده‌فروشان:</span>
          <p className="leading-relaxed">
            تمامی کالیته‌های به نمایش درآمده دارای کد رهگیری اصالت پارچه می‌باشند. در صورتی که پارچه تحویل داده شده هنگام نصب کمترین مغایرتی با کالیته انتخابی شما داشته باشد، اتحادیه خسارت کامل شما را بازخواهد گرداند.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FULLSCREEN LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {isFullscreen && currentSwatch && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base">{currentSwatch.title}</span>
              <span className="bg-amber-600 text-white font-mono text-xs px-2 py-0.5 rounded">
                {currentSwatch.fabricCode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                title="بزرگ‌نمایی"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                title="کوچک‌نمایی"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                title="بستن تمام‌صفحه"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fullscreen Body */}
          <div className="flex-1 flex items-center justify-center overflow-hidden my-4 relative">
            <img
              src={currentSwatch.imageUrl}
              alt={currentSwatch.title}
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              }}
              className={`max-w-full max-h-full object-contain ${getLightingFilterClass()}`}
              draggable={false}
            />

            {/* Left & Right Nav */}
            <button
              type="button"
              onClick={goToPrevSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={goToNextSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>

          {/* Fullscreen Footer */}
          <div className="text-center text-stone-400 text-xs border-t border-white/10 pt-3">
            {currentSwatch.category} | {currentSwatch.colorName} | {currentSwatch.texture}
          </div>
        </div>
      )}

    </div>
  );

  // If rendered as a standalone modal
  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
          
          {/* Modal Header */}
          <div className="p-4 sm:p-5 bg-stone-100 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <span>جزئیات کامل سفارش</span>
                  {order?.orderNumber && (
                    <span className="font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-xs">
                      #{order.orderNumber}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-stone-500">
                  مشخصات پنجره‌ها، فروشگاه کارشناس و گالری اسلایدر کالیته‌ها با قابلیت بزرگ‌نمایی
                </p>
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                title="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {content}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {order?.assignedVendorName && onOpenChat && (
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    onOpenChat(order);
                  }}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-700" />
                  <span>گفتگو با فروشگاه</span>
                </button>
              )}

              {order && onOpenSupport && (
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    onOpenSupport(order);
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>ثبت تیکت / شکایت</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {order?.status === 'visited' && onRequestSecondStore && (
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    onRequestSecondStore(order.id, 'درخواست بررسی و مقایسه کالیته‌های بیشتر');
                  }}
                  className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  اعزام فروشگاه دوم جهت مقایسه کالیته
                </button>
              )}

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  بستن
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Regular inline render
  return content;
};
