import React, { useState, useEffect } from 'react';
import { 
  SelectedSwatchItem, 
  VisitRequest 
} from '../types';
import { 
  Sparkles, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sun, 
  Moon, 
  Flame, 
  Columns, 
  CheckCircle2, 
  ShieldCheck, 
  Info, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Layers, 
  Maximize2,
  Copy,
  Check,
  Star,
  Compass,
  SlidersHorizontal
} from 'lucide-react';

interface OrderSwatchGalleryProps {
  /** اگر نباشد، حالت کاتالوگ عمومی (صفحه اصلی) است */
  order?: VisitRequest | null;
  swatches: SelectedSwatchItem[];
  isOpenDirectly?: boolean;
  onCloseDirectly?: () => void;
  onRequestSecondStore?: () => void;
  /** فقط مودال استودیو؛ بدون کارت‌های خلاصه سفارش */
  studioOnly?: boolean;
  /** عنوان مودال در حالت کاتالوگ */
  studioTitle?: string;
  /** ایندکس شروع در مودال */
  initialIndex?: number;
}

export const OrderSwatchGallery: React.FC<OrderSwatchGalleryProps> = ({
  order = null,
  swatches,
  isOpenDirectly = false,
  onCloseDirectly,
  onRequestSecondStore,
  studioOnly = false,
  studioTitle,
  initialIndex = 0,
}) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(isOpenDirectly);
  const [activeSwatchIndex, setActiveSwatchIndex] = useState(initialIndex);

  // Studio Interactive Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [lightingMode, setLightingMode] = useState<'daylight' | 'warm' | 'cool' | 'night'>('daylight');
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [compareSwatchIndex, setCompareSwatchIndex] = useState<number>(1 % (swatches.length || 1));
  const [isFavoritePriority, setIsFavoritePriority] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sync if prop opens it directly
  useEffect(() => {
    if (isOpenDirectly) {
      setActiveSwatchIndex(initialIndex);
      setZoomLevel(1);
      setIsComparisonMode(false);
      setIsModalOpen(true);
    }
  }, [isOpenDirectly, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === 'ArrowLeft') handleNext();
      if (e.key === 'ArrowRight') handlePrev();
      if (e.key === 'Escape') handleCloseModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, swatches?.length]);

  if (!swatches || swatches.length === 0) {
    return null;
  }

  const currentSwatch = swatches[activeSwatchIndex] || swatches[0];
  const compareSwatch = swatches[compareSwatchIndex] || swatches[0];

  const handleOpenModal = (index: number) => {
    setActiveSwatchIndex(index);
    setZoomLevel(1);
    setIsComparisonMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setZoomLevel(1);
    if (onCloseDirectly) onCloseDirectly();
  };

  const handleNext = () => {
    setActiveSwatchIndex((prev) => (prev + 1) % swatches.length);
    setZoomLevel(1);
  };

  const handlePrev = () => {
    setActiveSwatchIndex((prev) => (prev - 1 + swatches.length) % swatches.length);
    setZoomLevel(1);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleFavorite = (id: string) => {
    setIsFavoritePriority((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Lighting Filter Classes
  const getLightingFilterStyle = () => {
    switch (lightingMode) {
      case 'warm':
        return 'brightness-[1.04] sepia-[0.32] contrast-[1.02] hue-rotate-[-10deg]';
      case 'cool':
        return 'brightness-[1.03] hue-rotate-[12deg] saturate-[0.92] contrast-[1.05]';
      case 'night':
        return 'brightness-[0.78] contrast-[1.12] saturate-[0.88]';
      case 'daylight':
      default:
        return 'brightness-100 contrast-100 saturate-100';
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. EMBEDDED SWATCH GALLERY RIBBON (Rendered inside the Order Card) */}
      {/* ========================================================================= */}
      {!studioOnly && (
      <div className="mt-4 pt-4 border-t border-stone-200/90 text-right">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                  کالیته‌ها و پارچه‌های انتخابی این سفارش
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  {swatches.length} کالیته تخصصی
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                پیش‌نمایش تعاملی بافت پارچه، رنگ‌بندی و پرو نور برای کارشناسی در منزل
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenModal(0)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer group"
          >
            <Eye className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition-transform" />
            <span>گالری تعاملی و ذره‌بین بافت</span>
          </button>
        </div>

        {/* Swatch Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {swatches.map((swatch, idx) => {
            const isFav = isFavoritePriority[swatch.id];
            return (
              <div
                key={swatch.id}
                onClick={() => handleOpenModal(idx)}
                className="group relative bg-white rounded-xl border border-stone-200 hover:border-amber-400 p-2.5 transition-all shadow-2xs hover:shadow-md cursor-pointer flex gap-3 overflow-hidden text-right"
              >
                {/* Thumbnail Image with Zoom Lens Icon */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80">
                  <img
                    src={swatch.imageUrl}
                    alt={swatch.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-1.5 bg-white/90 backdrop-blur-xs rounded-full shadow-md text-amber-900">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Swatch Category Badge */}
                  <span className="absolute top-1 right-1 bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {swatch.category}
                  </span>

                  {/* Light Block Badge */}
                  {swatch.lightBlockPercentage && (
                    <span className="absolute bottom-1 right-1 bg-amber-900/85 backdrop-blur-xs text-amber-100 text-[9px] font-mono px-1 py-0.2 rounded dir-ltr">
                      {swatch.lightBlockPercentage}% نور
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                        {swatch.fabricCode}
                      </span>
                      {swatch.origin && (
                        <span className="text-[10px] text-stone-400 font-medium">
                          {swatch.origin}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-amber-900 transition-colors">
                      {swatch.title}
                    </h4>

                    {/* Color chip preview */}
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
                      <span
                        className="w-3 h-3 rounded-full border border-stone-300 shrink-0 shadow-2xs"
                        style={{ backgroundColor: swatch.colorHex || '#d4d4d4' }}
                        title={swatch.colorName}
                      />
                      <span className="truncate">{swatch.colorName}</span>
                    </div>
                  </div>

                  {/* Micro Footer: Texture & Action */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px]">
                    <span className="text-stone-500 truncate max-w-[120px]">
                      {swatch.texture ? swatch.texture.split('،')[0] : 'کیفیت صادراتی'}
                    </span>
                    <span className="text-amber-800 font-bold group-hover:underline flex items-center gap-0.5 shrink-0">
                      <span>پرو و بررسی</span>
                      <ChevronLeft className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Star Priority Indicator */}
                {isFav && (
                  <div className="absolute top-1 left-1 bg-amber-500 text-white rounded-full p-0.5 shadow-xs" title="اولویت اول شما در منزل">
                    <Star className="w-3 h-3 fill-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sub-note Guarantee */}
        <div className="mt-2.5 px-3 py-1.5 bg-stone-100/80 rounded-xl text-[11px] text-stone-600 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>ضمانت اصالت و تطابق دراپینو:</strong> کارشناس موظف است دقیقاً آلبوم و کالیته فیزیکی مربوط به این کدها را همراه خود به منزل بیاورد.
            </span>
          </div>
          {order ? (
            <span className="text-[10px] text-stone-400 font-mono">
              شماره پیگیری سفارش: #{order.orderNumber}
            </span>
          ) : (
            <span className="text-[10px] text-stone-400">پیش‌نمایش کاتالوگ دراپینو</span>
          )}
        </div>
      </div>

      )}

      {/* ========================================================================= */}
      {/* 2. FULLSCREEN INTERACTIVE STUDIO LIGHTBOX & SWATCH INSPECTOR MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-5xl w-full text-white shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-950/70 flex items-center justify-between gap-3 text-right">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-stone-100">
                      {studioTitle
                        || (order
                          ? `استودیو و پیش‌نمایش تعاملی کالیته‌های سفارش #${order.orderNumber}`
                          : 'شبیه‌ساز و مقایسه کالیته در دراپینو')}
                    </h3>
                    <span className="bg-stone-800 text-stone-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      {activeSwatchIndex + 1} از {swatches.length}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    {order
                      ? `مشتری: ${order.customerName} · مقصد کارشناسی: ${order.city} (${order.district})`
                      : 'نور محیط را عوض کنید، زوم کنید و دو طرح را کنار هم مقایسه کنید'}
                  </p>
                </div>
              </div>

              {/* Top Controls & Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsComparisonMode(!isComparisonMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isComparisonMode 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                  title="مقایسه دو کالیته در کنار هم"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">مقایسه دو کالیته</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-right">
              
              {/* Lighting Mode Toolbar */}
              <div className="p-3 bg-stone-950/60 rounded-2xl border border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-stone-300 font-bold">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>شبیه‌ساز نورپردازی خانه شما:</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLightingMode('daylight')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      lightingMode === 'daylight'
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>نور طبیعی روز</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightingMode('warm')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      lightingMode === 'warm'
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>نور زرد و گرم لوستر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightingMode('cool')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      lightingMode === 'cool'
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>نور سفید مهتابی</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightingMode('night')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      lightingMode === 'night'
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>نور ملایم شب</span>
                  </button>
                </div>
              </div>

              {/* Main Display: Single or Comparison View */}
              {!isComparisonMode ? (
                /* SINGLE SWATCH HERO VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Interactive Image Viewer (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col space-y-3">
                    <div className="relative w-full h-[320px] sm:h-[420px] rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 flex items-center justify-center group select-none">
                      
                      {/* Image with zoom and lighting filter */}
                      <img
                        src={currentSwatch.imageUrl}
                        alt={currentSwatch.title}
                        className={`w-full h-full object-cover transition-all duration-300 ${getLightingFilterStyle()}`}
                        style={{
                          transform: `scale(${zoomLevel})`,
                          transformOrigin: 'center center',
                          cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
                        }}
                        onClick={() => setZoomLevel(zoomLevel === 1 ? 2 : (zoomLevel === 2 ? 3 : 1))}
                      />

                      {/* Carousel Arrow Controls */}
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white flex items-center justify-center border border-stone-700/80 backdrop-blur-xs transition-transform active:scale-95 cursor-pointer shadow-lg z-10"
                        title="کالیته قبلی"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white flex items-center justify-center border border-stone-700/80 backdrop-blur-xs transition-transform active:scale-95 cursor-pointer shadow-lg z-10"
                        title="کالیته بعدی"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Zoom Controls Overlay */}
                      <div className="absolute bottom-3 left-3 bg-stone-900/90 backdrop-blur-md border border-stone-700/80 rounded-xl p-1 flex items-center gap-1 z-10">
                        <button
                          type="button"
                          onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                          disabled={zoomLevel <= 1}
                          className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-300 disabled:opacity-30 cursor-pointer"
                          title="کوچک‌نمایی"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono font-bold px-1.5 text-amber-400">
                          {zoomLevel.toFixed(1)}x
                        </span>
                        <button
                          type="button"
                          onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
                          disabled={zoomLevel >= 3}
                          className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-300 disabled:opacity-30 cursor-pointer"
                          title="بزرگ‌نمایی بافت"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        {zoomLevel > 1 && (
                          <button
                            type="button"
                            onClick={() => setZoomLevel(1)}
                            className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-300 cursor-pointer"
                            title="بازنشانی"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Top Badges */}
                      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                        <span className="bg-stone-950/80 backdrop-blur-md text-amber-300 border border-amber-500/40 text-xs font-bold px-2.5 py-1 rounded-xl">
                          {currentSwatch.category}
                        </span>
                        {currentSwatch.origin && (
                          <span className="bg-stone-950/80 backdrop-blur-md text-stone-300 text-xs px-2.5 py-1 rounded-xl border border-stone-800">
                            مبدا: {currentSwatch.origin}
                          </span>
                        )}
                      </div>

                      {/* Favorite Button Overlay */}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(currentSwatch.id)}
                        className={`absolute top-3 left-3 p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer z-10 ${
                          isFavoritePriority[currentSwatch.id]
                            ? 'bg-amber-500 text-stone-950 border-amber-400'
                            : 'bg-stone-950/70 text-stone-300 hover:text-white border-stone-800'
                        }`}
                        title="نشان‌گذاری به عنوان اولویت اول در منزل"
                      >
                        <Star className={`w-4 h-4 ${isFavoritePriority[currentSwatch.id] ? 'fill-stone-950' : ''}`} />
                      </button>
                    </div>

                    {/* Hint */}
                    <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
                      <span>روی تصویر کلیک کنید تا بزرگ‌نمایی بافت فعال شود.</span>
                      <span>کلیدهای چپ و راست کیبورد جهت جابجایی کالیته</span>
                    </div>
                  </div>

                  {/* Right Column: Detailed Specs & Attributes (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-stone-950/40 rounded-2xl border border-stone-800/80 p-5">
                    <div className="space-y-4">
                      
                      {/* Title & Code */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5" />
                            <span>کالیته رسمی مورد تایید اتحادیه</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCopyCode(currentSwatch.fabricCode)}
                            className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 bg-stone-800 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                          >
                            {copiedCode === currentSwatch.fabricCode ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-mono">کپی شد</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="font-mono">{currentSwatch.fabricCode}</span>
                              </>
                            )}
                          </button>
                        </div>

                        <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                          {currentSwatch.title}
                        </h2>
                      </div>

                      {/* Color Palette Chip */}
                      <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-6 h-6 rounded-full border border-stone-600 shadow-md shrink-0"
                            style={{ backgroundColor: currentSwatch.colorHex || '#9ca3af' }}
                          />
                          <div>
                            <span className="text-xs font-bold text-stone-200 block">
                              رنگ و تناژ: {currentSwatch.colorName}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              کد رنگی: {currentSwatch.colorHex || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {currentSwatch.lightBlockPercentage && (
                          <div className="text-left">
                            <span className="text-xs font-mono font-bold text-amber-400 block">
                              %{currentSwatch.lightBlockPercentage}
                            </span>
                            <span className="text-[10px] text-stone-400">مهار نور مستقیم</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {currentSwatch.description && (
                        <p className="text-xs text-stone-300 leading-relaxed bg-stone-900/60 p-3 rounded-xl border border-stone-800/60">
                          {currentSwatch.description}
                        </p>
                      )}

                      {/* Tech Specifications Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-800 space-y-0.5">
                          <span className="text-[10px] text-stone-400 block">نوع بافت و الیاف:</span>
                          <span className="font-bold text-stone-200 text-[11px] truncate block">
                            {currentSwatch.texture || 'بافت درجه یک'}
                          </span>
                        </div>

                        <div className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-800 space-y-0.5">
                          <span className="text-[10px] text-stone-400 block">گرماژ پارچه:</span>
                          <span className="font-mono font-bold text-stone-200 text-[11px] truncate block">
                            {currentSwatch.grammage || 'استاندارد شرکتی'}
                          </span>
                        </div>

                        <div className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-800 space-y-0.5">
                          <span className="text-[10px] text-stone-400 block">پیشنهاد فضا:</span>
                          <span className="font-bold text-stone-200 text-[11px] truncate block">
                            {currentSwatch.suggestedFor || (order?.rooms?.join('، ') || '—')}
                          </span>
                        </div>

                        <div className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-800 space-y-0.5">
                          <span className="text-[10px] text-stone-400 block">ضمانت رسمی اتحادیه:</span>
                          <span className="font-bold text-emerald-400 text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>تطابق ۱۰۰٪ تضمینی</span>
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Customer Actions for Specialist */}
                    <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(currentSwatch.id)}
                        className={`w-full sm:flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          isFavoritePriority[currentSwatch.id]
                            ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isFavoritePriority[currentSwatch.id] ? 'fill-stone-950' : ''}`} />
                        <span>
                          {isFavoritePriority[currentSwatch.id] 
                            ? 'نشان‌گذاری شده به عنوان اولویت اول' 
                            : 'ثبت به عنوان اولویت نمونه در منزل'}
                        </span>
                      </button>

                      {onRequestSecondStore && order && order.status === 'visited' && (
                        <button
                          type="button"
                          onClick={() => {
                            handleCloseModal();
                            onRequestSecondStore();
                          }}
                          className="w-full sm:w-auto px-3 py-2.5 bg-stone-800 hover:bg-orange-900/40 text-orange-300 border border-orange-500/30 rounded-xl text-xs font-semibold transition-colors text-center"
                        >
                          تنوع بیشتری می‌خواهم (اعزام فروشگاه دوم)
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              ) : (
                /* SIDE-BY-SIDE DUAL SWATCH COMPARISON VIEW */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-stone-950/80 rounded-2xl border border-stone-800">
                    <div className="flex items-center gap-2">
                      <Columns className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-stone-200">
                        حالت مقایسه دو کالیته هم‌زمان (تست هارمونی پرده اصلی و آستری/حریر)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-stone-400 text-[11px]">انتخاب کالیته دوم:</span>
                      <select
                        value={compareSwatchIndex}
                        onChange={(e) => setCompareSwatchIndex(Number(e.target.value))}
                        className="bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                      >
                        {swatches.map((s, idx) => (
                          <option key={s.id} value={idx}>
                            {s.title} ({s.fabricCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Swatch 1 */}
                    <div className="bg-stone-950 rounded-2xl border border-stone-800 p-4 space-y-3">
                      <div className="relative h-64 rounded-xl overflow-hidden bg-stone-900">
                        <img
                          src={currentSwatch.imageUrl}
                          alt={currentSwatch.title}
                          className={`w-full h-full object-cover ${getLightingFilterStyle()}`}
                        />
                        <span className="absolute top-2 right-2 bg-stone-950/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          کالیته اول: {currentSwatch.category}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-stone-100">{currentSwatch.title}</h4>
                          <span className="font-mono text-xs text-amber-400 font-bold">{currentSwatch.fabricCode}</span>
                        </div>
                        <p className="text-xs text-stone-400 pt-1">رنگ: {currentSwatch.colorName} · بافت: {currentSwatch.texture}</p>
                      </div>
                    </div>

                    {/* Swatch 2 */}
                    <div className="bg-stone-950 rounded-2xl border border-stone-800 p-4 space-y-3">
                      <div className="relative h-64 rounded-xl overflow-hidden bg-stone-900">
                        <img
                          src={compareSwatch.imageUrl}
                          alt={compareSwatch.title}
                          className={`w-full h-full object-cover ${getLightingFilterStyle()}`}
                        />
                        <span className="absolute top-2 right-2 bg-stone-950/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          کالیته دوم: {compareSwatch.category}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-stone-100">{compareSwatch.title}</h4>
                          <span className="font-mono text-xs text-amber-400 font-bold">{compareSwatch.fabricCode}</span>
                        </div>
                        <p className="text-xs text-stone-400 pt-1">رنگ: {compareSwatch.colorName} · بافت: {compareSwatch.texture}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thumbnails Navigation Ribbon */}
              <div className="pt-2 border-t border-stone-800">
                <span className="text-[11px] text-stone-400 font-medium block mb-2">
                  سایر کالیته‌های موجود در آلبوم همراه کارشناس:
                </span>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {swatches.map((swatch, idx) => {
                    const isActive = idx === activeSwatchIndex;
                    return (
                      <button
                        key={swatch.id}
                        type="button"
                        onClick={() => {
                          setActiveSwatchIndex(idx);
                          setZoomLevel(1);
                        }}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          isActive 
                            ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105' 
                            : 'border-stone-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={swatch.imageUrl}
                          alt={swatch.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-[9px] font-mono text-white text-center py-0.5 truncate px-1">
                          {swatch.fabricCode}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
              <div className="flex items-center gap-2 text-stone-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  کلیه کدهای کالیته فوق در بانک داده مرکزی اتحادیه صنف پرده ثبت شده و دارای گارانتی کیفیت ۱۰ ساله هستند.
                </span>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold transition-colors cursor-pointer"
              >
                بستن پنجره استودیو
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
