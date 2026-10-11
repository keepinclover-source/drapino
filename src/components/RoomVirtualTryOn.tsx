import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Upload,
  X,
  MousePointer2,
  Layers,
  Download,
  RotateCcw,
  Check,
  Image as ImageIcon,
  Square,
  Move,
} from 'lucide-react';
import { ServiceCategoryId } from '../types';
import type { CatalogEntry } from '../utils/catalogStyles';
import { SERVICE_CATEGORY_LABELS } from '../utils/serviceCategory';

interface RoomVirtualTryOnProps {
  isOpen: boolean;
  onClose: () => void;
  category: ServiceCategoryId;
  catalogItems: CatalogEntry[];
  initialPatternId?: string;
}

type Pt = { x: number; y: number };
/** TL, TR, BR, BL */
type Quad = [Pt, Pt, Pt, Pt];

const AREA_HINT: Record<ServiceCategoryId, string> = {
  curtain: 'چهار گوشه محل پرده/پنجره را مشخص کنید',
  wallpaper: 'چهار گوشه دیوار را بچینید تا طرح با زاویه دیوار منطبق شود',
  flooring: 'چهار گوشه ناحیه کف را مشخص کنید',
};

const AREA_LABEL: Record<ServiceCategoryId, string> = {
  curtain: 'ناحیه پرده / پنجره',
  wallpaper: 'ناحیه دیوار (کاغذ دیواری)',
  flooring: 'ناحیه کف (کفپوش و پارکت)',
};

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function bilinarQuad(q: Quad, u: number, v: number): Pt {
  return lerp(lerp(q[0], q[1], u), lerp(q[3], q[2], u), v);
}

/** نگاشت مثلث با بافت — ماتریس آفین + همپوشانی لبه برای حذف خط سفید */
function drawTexturedTriangle(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  d0: Pt,
  d1: Pt,
  d2: Pt,
  s0: Pt,
  s1: Pt,
  s2: Pt
) {
  // کمی بزرگ‌تر کردن مثلث به سمت بیرون تا شکاف زیرپیکسلی دیده نشود
  const cx = (d0.x + d1.x + d2.x) / 3;
  const cy = (d0.y + d1.y + d2.y) / 3;
  const grow = (p: Pt): Pt => ({
    x: p.x + (p.x - cx) * 0.02 + (p.x >= cx ? 0.4 : -0.4),
    y: p.y + (p.y - cy) * 0.02 + (p.y >= cy ? 0.4 : -0.4),
  });
  const e0 = grow(d0);
  const e1 = grow(d1);
  const e2 = grow(d2);

  const x0 = e0.x,
    y0 = e0.y,
    x1 = e1.x,
    y1 = e1.y,
    x2 = e2.x,
    y2 = e2.y;
  const u0 = s0.x,
    v0 = s0.y,
    u1 = s1.x,
    v1 = s1.y,
    u2 = s2.x,
    v2 = s2.y;

  const delta = u0 * (v1 - v2) + u1 * (v2 - v0) + u2 * (v0 - v1);
  if (Math.abs(delta) < 1e-4) return;

  const m11 = (x0 * (v1 - v2) + x1 * (v2 - v0) + x2 * (v0 - v1)) / delta;
  const m12 = (y0 * (v1 - v2) + y1 * (v2 - v0) + y2 * (v0 - v1)) / delta;
  const m21 = (x0 * (u2 - u1) + x1 * (u0 - u2) + x2 * (u1 - u0)) / delta;
  const m22 = (y0 * (u2 - u1) + y1 * (u0 - u2) + y2 * (u1 - u0)) / delta;
  const dx = (x0 * (u1 * v2 - u2 * v1) + x1 * (u2 * v0 - u0 * v2) + x2 * (u0 * v1 - u1 * v0)) / delta;
  const dy = (y0 * (u1 * v2 - u2 * v1) + y1 * (u2 * v0 - u0 * v2) + y2 * (u0 * v1 - u1 * v0)) / delta;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.transform(m11, m12, m21, m22, dx, dy);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
}

/** برگه تایل بدون درز — تکرار با overlap یک‌پیکسلی */
function buildTileSheet(img: HTMLImageElement, tileScale: number): HTMLCanvasElement {
  const tiles = Math.max(2, Math.min(8, Math.round(5 / Math.max(0.4, tileScale))));
  const c = document.createElement('canvas');
  const tw = Math.max(1, img.naturalWidth || img.width);
  const th = Math.max(1, img.naturalHeight || img.height);
  c.width = tw * tiles;
  c.height = th * tiles;
  const cctx = c.getContext('2d')!;
  cctx.imageSmoothingEnabled = true;
  for (let y = 0; y < tiles; y++) {
    for (let x = 0; x < tiles; x++) {
      // کمی overlap برای حذف خط بین تایل‌ها
      cctx.drawImage(img, x * tw - (x > 0 ? 1 : 0), y * th - (y > 0 ? 1 : 0), tw + 1, th + 1);
    }
  }
  return c;
}

/**
 * پر کردن یکپارچه چهارگوش — سلول‌ها همپوشانی دارند تا خط سفید نماند
 */
function fillQuadWithPattern(
  ctx: CanvasRenderingContext2D,
  tileSheet: HTMLCanvasElement,
  quad: Quad,
  opacity: number,
  subdiv: number
) {
  const sw = tileSheet.width;
  const sh = tileSheet.height;
  ctx.save();
  ctx.globalAlpha = Math.max(0.05, Math.min(1, opacity));
  ctx.imageSmoothingEnabled = true;

  // کلیپ به کل چهارگوش تا بیرون نزند
  ctx.beginPath();
  ctx.moveTo(quad[0].x, quad[0].y);
  ctx.lineTo(quad[1].x, quad[1].y);
  ctx.lineTo(quad[2].x, quad[2].y);
  ctx.lineTo(quad[3].x, quad[3].y);
  ctx.closePath();
  ctx.clip();

  const overlap = 0.6 / subdiv; // همپوشانی UV
  for (let j = 0; j < subdiv; j++) {
    for (let i = 0; i < subdiv; i++) {
      const u0 = Math.max(0, i / subdiv - (i > 0 ? overlap : 0));
      const u1 = Math.min(1, (i + 1) / subdiv + (i < subdiv - 1 ? overlap : 0));
      const v0 = Math.max(0, j / subdiv - (j > 0 ? overlap : 0));
      const v1 = Math.min(1, (j + 1) / subdiv + (j < subdiv - 1 ? overlap : 0));

      const p00 = bilinarQuad(quad, u0, v0);
      const p10 = bilinarQuad(quad, u1, v0);
      const p11 = bilinarQuad(quad, u1, v1);
      const p01 = bilinarQuad(quad, u0, v1);

      const s00 = { x: u0 * sw, y: v0 * sh };
      const s10 = { x: u1 * sw, y: v0 * sh };
      const s11 = { x: u1 * sw, y: v1 * sh };
      const s01 = { x: u0 * sw, y: v1 * sh };

      drawTexturedTriangle(ctx, tileSheet, p00, p10, p11, s00, s10, s11);
      drawTexturedTriangle(ctx, tileSheet, p00, p11, p01, s00, s11, s01);
    }
  }
  ctx.restore();
}

function drawHandles(ctx: CanvasRenderingContext2D, quad: Quad, dragCorner: number | null, complete: boolean) {
  ctx.save();
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.95)';
  ctx.lineWidth = Math.max(2, ctx.canvas.width / 500);
  ctx.setLineDash(complete ? [8, 5] : [4, 4]);
  ctx.beginPath();
  ctx.moveTo(quad[0].x, quad[0].y);
  ctx.lineTo(quad[1].x, quad[1].y);
  ctx.lineTo(quad[2].x, quad[2].y);
  ctx.lineTo(quad[3].x, quad[3].y);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  const r = Math.max(7, ctx.canvas.width / 100);
  for (let i = 0; i < 4; i++) {
    const c = quad[i];
    ctx.fillStyle = i === dragCorner ? '#f59e0b' : '#fff';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#78350f';
    ctx.font = `bold ${Math.max(12, ctx.canvas.width / 70)}px sans-serif`;
    ctx.fillText(String(i + 1), c.x + r + 3, c.y - 3);
  }
  ctx.restore();
}


/** انیمیشن خرگوش دونده هنگام بارگذاری عکس */
const RunningRabbitLoader: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="flex flex-col items-center justify-center gap-4 p-8 w-full max-w-md mx-auto select-none" data-testid="rabbit-loader">
    <div className="relative w-full h-28 overflow-hidden">
      {/* مسیر */}
      <div className="absolute bottom-6 left-0 right-0 h-1.5 rounded-full bg-amber-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-l from-amber-500 to-amber-700 transition-[width] duration-150 ease-out"
          style={{ width: `${Math.min(100, Math.max(4, progress))}%` }}
        />
      </div>
      {/* خرگوش */}
      <div
        className="absolute bottom-8 transition-[left] duration-150 ease-out"
        style={{ left: `calc(${Math.min(92, Math.max(2, progress))}% - 28px)` }}
      >
        <div className="rabbit-run">
          <svg width="56" height="48" viewBox="0 0 56 48" fill="none" aria-hidden>
            <ellipse cx="30" cy="32" rx="16" ry="11" fill="#f5e6d3" stroke="#b45309" strokeWidth="1.5" />
            <ellipse cx="38" cy="28" rx="9" ry="8" fill="#faf0e6" stroke="#b45309" strokeWidth="1.2" />
            {/* گوش‌ها */}
            <g className="rabbit-ear">
              <ellipse cx="34" cy="12" rx="4" ry="11" fill="#f5e6d3" stroke="#b45309" strokeWidth="1.2" transform="rotate(-15 34 12)" />
              <ellipse cx="34" cy="12" rx="2" ry="7" fill="#f9a8d4" transform="rotate(-15 34 12)" />
            </g>
            <g className="rabbit-ear rabbit-ear-2">
              <ellipse cx="42" cy="13" rx="3.5" ry="10" fill="#f5e6d3" stroke="#b45309" strokeWidth="1.2" transform="rotate(12 42 13)" />
              <ellipse cx="42" cy="13" rx="1.8" ry="6" fill="#f9a8d4" transform="rotate(12 42 13)" />
            </g>
            <circle cx="41" cy="27" r="1.4" fill="#1c1917" />
            <ellipse cx="46" cy="30" rx="2" ry="1.2" fill="#f9a8d4" />
            {/* پاهای دونده */}
            <g className="rabbit-leg">
              <ellipse cx="22" cy="40" rx="5" ry="2.5" fill="#e7d3b8" stroke="#b45309" strokeWidth="1" />
            </g>
            <g className="rabbit-leg rabbit-leg-2">
              <ellipse cx="30" cy="41" rx="5" ry="2.5" fill="#e7d3b8" stroke="#b45309" strokeWidth="1" />
            </g>
            {/* دم */}
            <circle cx="14" cy="30" r="4" fill="#fff7ed" stroke="#b45309" strokeWidth="1" />
          </svg>
        </div>
      </div>
      {/* علف نقطه‌ای */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-between px-2 opacity-40">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="w-0.5 h-2 bg-emerald-600 rounded-full" />
        ))}
      </div>
    </div>
    <div className="text-center space-y-1">
      <p className="text-sm font-black text-stone-800">خرگوشه داره عکستون رو می‌آره…</p>
      <p className="text-xs text-stone-500 tabular-nums">{Math.round(progress)}٪ · لطفاً چند لحظه صبر کنید</p>
    </div>
    <style>{`
      .rabbit-run { animation: rabbit-bob 0.35s ease-in-out infinite alternate; }
      .rabbit-ear { transform-origin: 34px 20px; animation: ear-wiggle 0.4s ease-in-out infinite alternate; }
      .rabbit-ear-2 { transform-origin: 42px 20px; animation: ear-wiggle 0.45s ease-in-out infinite alternate-reverse; }
      .rabbit-leg { animation: leg-kick 0.28s ease-in-out infinite alternate; }
      .rabbit-leg-2 { animation: leg-kick 0.28s ease-in-out infinite alternate-reverse; }
      @keyframes rabbit-bob {
        from { transform: translateY(0); }
        to { transform: translateY(-5px); }
      }
      @keyframes ear-wiggle {
        from { transform: rotate(-6deg); }
        to { transform: rotate(8deg); }
      }
      @keyframes leg-kick {
        from { transform: translateX(-2px); }
        to { transform: translateX(3px); }
      }
    `}</style>
  </div>
);


export const RoomVirtualTryOn: React.FC<RoomVirtualTryOnProps> = ({
  isOpen,
  onClose,
  category,
  catalogItems,
  initialPatternId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);
  const tileSheetRef = useRef<HTMLCanvasElement | null>(null);
  const tileKeyRef = useRef('');
  const roomImgRef = useRef<HTMLImageElement | null>(null);
  const patternImgRef = useRef<HTMLImageElement | null>(null);
  const quadRef = useRef<Quad | null>(null);
  const dragCornerRef = useRef<number | null>(null);
  const drawingRef = useRef<{ x0: number; y0: number } | null>(null);
  const opacityRef = useRef(0.9);
  const scaleRef = useRef(1);

  const [roomImg, setRoomImg] = useState<HTMLImageElement | null>(null);
  const [patternImg, setPatternImg] = useState<HTMLImageElement | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [quad, setQuad] = useState<Quad | null>(null);
  const [hasRegion, setHasRegion] = useState(false);
  const [dragCorner, setDragCorner] = useState<number | null>(null);
  const [opacity, setOpacity] = useState(0.9);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hint, setHint] = useState('عکس را آپلود کنید، بعد روی تصویر بکشید تا ناحیه مشخص شود');

  const activeItems = catalogItems.filter((c) => c.isActive !== false);

  useEffect(() => {
    opacityRef.current = opacity;
  }, [opacity]);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    roomImgRef.current = roomImg;
  }, [roomImg]);
  useEffect(() => {
    patternImgRef.current = patternImg;
  }, [patternImg]);
  useEffect(() => {
    quadRef.current = quad;
  }, [quad]);

  useEffect(() => {
    if (!isOpen) return;
    const prefer =
      (initialPatternId && activeItems.find((i) => i.id === initialPatternId)) || activeItems[0];
    if (prefer) setSelectedId(prefer.id);
  }, [isOpen, initialPatternId, category]); // eslint-disable-line

  useEffect(() => {
    const item = activeItems.find((i) => i.id === selectedId);
    if (!item?.imageUrl) {
      setPatternImg(null);
      patternImgRef.current = null;
      tileSheetRef.current = null;
      return;
    }
    const img = new Image();
    if (/^https?:\/\//i.test(item.imageUrl) && !item.imageUrl.startsWith(window.location.origin)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      patternImgRef.current = img;
      setPatternImg(img);
      tileSheetRef.current = null;
      requestAnimationFrame(() => paintNow());
    };
    img.onerror = () => {
      const img2 = new Image();
      img2.onload = () => {
        patternImgRef.current = img2;
        setPatternImg(img2);
        tileSheetRef.current = null;
        requestAnimationFrame(() => paintNow());
      };
      img2.onerror = () => {
        patternImgRef.current = null;
        setPatternImg(null);
      };
      img2.src = item.imageUrl;
    };
    img.src = item.imageUrl;
  }, [selectedId]); // eslint-disable-line

  const ensureTileSheet = (img: HTMLImageElement, tileScale: number) => {
    const key = `${img.src}|${tileScale.toFixed(1)}`;
    if (tileSheetRef.current && tileKeyRef.current === key) return tileSheetRef.current;
    const sheet = buildTileSheet(img, tileScale);
    tileSheetRef.current = sheet;
    tileKeyRef.current = key;
    return sheet;
  };

  const layoutCanvas = (img: HTMLImageElement): boolean => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return false;
    const maxEdge = 1600;
    let iw = img.naturalWidth || img.width;
    let ih = img.naturalHeight || img.height;
    if (!iw || !ih) return false;
    if (Math.max(iw, ih) > maxEdge) {
      const r = maxEdge / Math.max(iw, ih);
      iw = Math.round(iw * r);
      ih = Math.round(ih * r);
    }
    canvas.width = iw;
    canvas.height = ih;
    // موبایل: کل عرض کانتینر + ارتفاع واقعی wrap
    const availW = Math.max(280, wrap.clientWidth - 4);
    const wrapH = wrap.clientHeight;
    const isMobile = window.innerWidth < 1024;
    const availH = Math.max(
      isMobile ? 220 : 360,
      wrapH > 40 ? wrapH - 4 : Math.min(window.innerHeight * (isMobile ? 0.42 : 0.75), isMobile ? 480 : 920)
    );
    const fit = Math.min(availW / iw, availH / ih);
    canvas.style.width = `${Math.max(1, Math.round(iw * fit))}px`;
    canvas.style.height = `${Math.max(1, Math.round(ih * fit))}px`;
    return true;
  };

  /** رندر مستقیم از refها — همیشه آخرین وضعیت */
  const paintNow = () => {
    const canvas = canvasRef.current;
    const room = roomImgRef.current;
    if (!canvas || !room) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(room, 0, 0, canvas.width, canvas.height);

    const q = quadRef.current;
    const pattern = patternImgRef.current;
    const op = opacityRef.current;
    const sc = scaleRef.current;

    // نقاط در حال ثبت (قبل از تکمیل)
    const pts = pointsRef.current;
    if (pts.length > 0 && pts.length < 4) {
      ctx.save();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = Math.max(3, canvas.width / 350);
      ctx.setLineDash([8, 5]);
      if (pts.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      const r = Math.max(16, canvas.width / 55);
      pts.forEach((c, i) => {
        ctx.beginPath();
        ctx.arc(c.x + 1, c.y + 2, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#b45309';
        ctx.stroke();
        ctx.fillStyle = '#78350f';
        ctx.font = `bold ${Math.max(16, canvas.width / 50)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), c.x, c.y + 1);
      });
      ctx.restore();
    }

    if (q && pts.length >= 4) {
      // قاب ناحیه
      ctx.save();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = Math.max(3, canvas.width / 350);
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(q[0].x, q[0].y);
      ctx.lineTo(q[1].x, q[1].y);
      ctx.lineTo(q[2].x, q[2].y);
      ctx.lineTo(q[3].x, q[3].y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // طرح یکپارچه
      if (pattern) {
        const sheet = ensureTileSheet(pattern, sc);
        const subdiv = dragCornerRef.current !== null ? 7 : 12;
        fillQuadWithPattern(ctx, sheet, q, op, subdiv);
      }

      // نقاط بزرگ
      const r = Math.max(16, canvas.width / 55);
      q.forEach((c, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(c.x + 1, c.y + 2, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fillStyle = dragCornerRef.current === i ? '#f59e0b' : '#ffffff';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#b45309';
        ctx.stroke();
        ctx.fillStyle = '#78350f';
        ctx.font = `bold ${Math.max(16, canvas.width / 50)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), c.x, c.y + 1);
        ctx.restore();
      });
    }
  };

  const schedulePaint = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      paintNow();
    });
  };

  useEffect(() => {
    schedulePaint();
  }, [roomImg, patternImg, quad, opacity, scale, dragCorner, hasRegion]);

  useEffect(() => {
    if (!roomImg) return;
    const ok = layoutCanvas(roomImg);
    if (ok) paintNow();
    else {
      requestAnimationFrame(() => {
        layoutCanvas(roomImg);
        paintNow();
      });
    }
  }, [roomImg, isOpen]);

  useEffect(() => {
    const onResize = () => {
      if (roomImgRef.current) {
        layoutCanvas(roomImgRef.current);
        paintNow();
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  // نقاط لمسی (موبایل): هر تاچ = یک گوشه
  const pointsRef = useRef<Pt[]>([]);
  const [pointCount, setPointCount] = useState(0);

  const hitCorner = (pt: Pt, q: Quad): number | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const sc = canvas.width / Math.max(1, canvas.getBoundingClientRect().width);
    const thr = Math.max(36, 32 * sc); // هدف لمسی بزرگ
    let best: number | null = null;
    let bestD = thr * thr;
    for (let i = 0; i < 4; i++) {
      const dx = q[i].x - pt.x;
      const dy = q[i].y - pt.y;
      const d = dx * dx + dy * dy;
      if (d <= bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!roomImgRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* */
    }
    const pt = getCanvasPoint(e);

    // اگر ۴ نقطه کامل است و روی یک گوشه زد → شروع کشیدن
    if (pointsRef.current.length >= 4 && quadRef.current) {
      const hit = hitCorner(pt, quadRef.current);
      if (hit !== null) {
        dragCornerRef.current = hit;
        setDragCorner(hit);
        setHint(`جابه‌جایی نقطه ${hit + 1}`);
        return;
      }
      // تاچ جای دیگر = شروع از نو
      pointsRef.current = [pt];
      setPointCount(1);
      quadRef.current = null;
      setQuad(null);
      setHasRegion(false);
      setHint('نقطه ۱ ثبت شد — نقطه ۲ را لمس کنید');
      paintNow();
      return;
    }

    // ثبت نقطه بعدی (تاچ)
    if (pointsRef.current.length < 4) {
      const next = [...pointsRef.current, pt];
      pointsRef.current = next;
      setPointCount(next.length);

      if (next.length < 4) {
        setHint(`نقطه ${next.length} ثبت شد — نقطه ${next.length + 1} را لمس کنید`);
        // برای نمایش خطوط موقت
        paintNow();
      } else {
        // نقطه چهارم → مستطیل/چهارگوش کامل + رندر طرح
        const q = next as Quad;
        quadRef.current = q;
        setQuad(q);
        setHasRegion(true);
        setHint('ناحیه آماده است — برای تنظیم، هر نقطه را بکشید');
        requestAnimationFrame(() => {
          paintNow();
          requestAnimationFrame(() => paintNow());
        });
      }
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragCornerRef.current === null || !quadRef.current) return;
    const pt = getCanvasPoint(e);
    const next = [...quadRef.current] as Quad;
    next[dragCornerRef.current] = pt;
    quadRef.current = next;
    pointsRef.current = [...next];
    setQuad(next);
    schedulePaint();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* */
    }
    if (dragCornerRef.current !== null) {
      dragCornerRef.current = null;
      setDragCorner(null);
      setHint('ناحیه تنظیم شد');
      requestAnimationFrame(() => paintNow());
    }
  };

  const placeDefaultQuad = () => {
    const canvas = canvasRef.current;
    if (!canvas || !roomImgRef.current) return;
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) return;
    const q: Quad = [
      { x: w * 0.2, y: h * 0.18 },
      { x: w * 0.8, y: h * 0.18 },
      { x: w * 0.8, y: h * 0.82 },
      { x: w * 0.2, y: h * 0.82 },
    ];
    pointsRef.current = [...q];
    setPointCount(4);
    quadRef.current = q;
    setQuad(q);
    setHasRegion(true);
    setHint('ناحیه پیش‌فرض — نقاط را بکشید');
    paintNow();
  };

  const resetCorners = () => {
    pointsRef.current = [];
    setPointCount(0);
    quadRef.current = null;
    setQuad(null);
    setHasRegion(false);
    setHint('نقطه ۱ را روی عکس لمس کنید');
    paintNow();
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('فقط فایل تصویری مجاز است.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError('حداکثر ۱۲ مگابایت.');
      return;
    }

    setIsImageLoading(true);
    setLoadProgress(8);
    setRoomImg(null);
    roomImgRef.current = null;
    setQuad(null);
    quadRef.current = null;
    setHasRegion(false);
    pointsRef.current = [];
    setPointCount(0);

    const url = URL.createObjectURL(file);
    let progressTimer: ReturnType<typeof setInterval> | null = setInterval(() => {
      setLoadProgress((p) => (p >= 88 ? p : p + 6 + Math.random() * 8));
    }, 120);

    const finishOk = (img: HTMLImageElement) => {
      if (progressTimer) clearInterval(progressTimer);
      setLoadProgress(100);
      window.setTimeout(() => {
        roomImgRef.current = img;
        setRoomImg(img);
        setIsImageLoading(false);
        setLoadProgress(0);
        setHint('نقطه ۱ را روی عکس لمس کنید');
        requestAnimationFrame(() => {
          layoutCanvas(img);
          paintNow();
          requestAnimationFrame(() => {
            layoutCanvas(img);
            paintNow();
          });
        });
        URL.revokeObjectURL(url);
      }, 250);
    };

    const finishErr = (msg: string) => {
      if (progressTimer) clearInterval(progressTimer);
      setIsImageLoading(false);
      setLoadProgress(0);
      setError(msg);
      URL.revokeObjectURL(url);
    };

    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (typeof img.decode === 'function') {
        img.decode().then(() => finishOk(img)).catch(() => finishOk(img));
      } else {
        finishOk(img);
      }
    };
    img.onerror = () => finishErr('خواندن تصویر ناموفق بود.');
    img.src = url;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const room = roomImgRef.current;
    if (!canvas || !room) return;
    const out = document.createElement('canvas');
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext('2d')!;
    ctx.drawImage(room, 0, 0, out.width, out.height);
    if (quadRef.current && patternImgRef.current) {
      const sheet = ensureTileSheet(patternImgRef.current, scaleRef.current);
      fillQuadWithPattern(ctx, sheet, quadRef.current, opacityRef.current, 12);
    }
    const a = document.createElement('a');
    a.download = `drapino-tryon-${category}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
  };

  const resetAll = () => {
    setRoomImg(null);
    roomImgRef.current = null;
    setQuad(null);
    quadRef.current = null;
    setHasRegion(false);
    setError('');
    setIsImageLoading(false);
    setLoadProgress(0);
    tileSheetRef.current = null;
    if (fileRef.current) fileRef.current.value = '';
    setHint('عکس را آپلود کنید، بعد روی تصویر بکشید تا ناحیه مشخص شود');
  };

  if (!isOpen) return null;

  const selectedItem = activeItems.find((i) => i.id === selectedId);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/85 flex items-stretch sm:items-center justify-center sm:p-3"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      data-testid="room-virtual-tryon"
    >
      <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[min(96dvh,920px)] sm:max-w-6xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border-0 sm:border border-stone-200 text-right">
        {/* Header */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-stone-200 flex items-center justify-between gap-2 bg-stone-50 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-stone-900 text-xs sm:text-base truncate">
                شبیه‌ساز روی عکس — {SERVICE_CATEGORY_LABELS[category]}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 truncate">
                چهار لمس → ناحیه بسته می‌شود → طرح می‌نشیند
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-stone-200 text-stone-500 cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: موبایل ستونی (بوم بالا + کنترل پایین) / دسکتاپ دو ستونه */}
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 lg:gap-4 lg:p-5 overflow-hidden">
          {/* بوم — اولویت اول در موبایل */}
          <div className="lg:col-span-9 flex flex-col min-h-0 order-1 lg:order-2 flex-[1.2] lg:flex-none px-2 pt-2 lg:p-0">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] sm:text-[11px] text-stone-600 font-medium px-0.5">
              <MousePointer2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="truncate">
                {roomImg
                  ? `${selectedItem?.title || 'طرح'} · ${
                      hasRegion
                        ? 'ناحیه کامل — نقاط را بکشید'
                        : pointCount === 0
                          ? 'نقطه ۱ را لمس کنید'
                          : `نقطه ${pointCount} از ۴ ثبت شد`
                    }`
                  : 'ابتدا عکس را آپلود کنید'}
              </span>
            </div>
            <div
              ref={wrapRef}
              className="relative flex-1 min-h-[38dvh] sm:min-h-[42dvh] lg:min-h-[60vh] rounded-xl sm:rounded-2xl border border-stone-200 bg-stone-100 overflow-hidden flex items-center justify-center"
            >
              {isImageLoading ? (
                <RunningRabbitLoader progress={loadProgress} />
              ) : !roomImg ? (
                <div className="text-center p-6 sm:p-10 text-stone-400">
                  <ImageIcon className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-bold">عکسی بارگذاری نشده</p>
                  <p className="text-xs mt-1">از بخش زیر یک عکس انتخاب کنید</p>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="cursor-crosshair touch-none shadow-sm rounded-lg bg-stone-200 max-w-full max-h-full"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                />
              )}
            </div>
            <p className="mt-1 mb-1 text-[9px] sm:text-[10px] text-stone-400 leading-relaxed px-0.5 line-clamp-2">
              هر نقطه را لمس کنید (۱ تا ۴). بعد از نقطه چهارم طرح می‌نشیند؛ برای تنظیم، نقاط را بکشید.
            </p>
          </div>

          {/* کنترل‌ها — در موبایل اسکرول افقی/عمودی پایین */}
          <div className="lg:col-span-3 order-2 lg:order-1 flex-shrink-0 max-h-[46dvh] lg:max-h-none overflow-y-auto overscroll-contain border-t lg:border-t-0 border-stone-200 bg-white px-3 py-3 sm:p-0 space-y-2.5 lg:space-y-3">
            <div className="rounded-2xl border border-stone-200 p-3 space-y-2 bg-stone-50">
              <p className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-amber-700" />
                ۱. آپلود عکس خانه
              </p>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" id="room-photo-upload" onChange={(e) => handleFile(e.target.files?.[0])} />
              <label
                htmlFor="room-photo-upload"
                className="flex flex-col items-center justify-center gap-1 py-3 sm:py-4 border-2 border-dashed border-stone-300 rounded-2xl bg-white hover:border-amber-400 cursor-pointer text-center min-h-[52px]"
              >
                <Upload className="w-5 h-5 text-stone-400" />
                <span className="text-xs font-bold text-stone-700">انتخاب یا گرفتن عکس</span>
              </label>
              {error && <p className="text-xs text-rose-600">{error}</p>}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 space-y-2">
              <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Square className="w-3.5 h-3.5 text-amber-700" />
                ۲. ناحیه ({AREA_LABEL[category]})
              </p>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                چهار بار لمس: ۱ بالا‌چپ ← ۲ بالا‌راست ← ۳ پایین‌راست ← ۴ پایین‌چپ
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={placeDefaultQuad} disabled={!roomImg} className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-amber-600 text-white text-[11px] font-bold disabled:opacity-40 cursor-pointer">
                  ناحیه وسط
                </button>
                <button type="button" onClick={resetCorners} disabled={!roomImg} className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-[11px] font-bold disabled:opacity-40 cursor-pointer">
                  شروع دوباره
                </button>
              </div>
              <p className="text-[11px] text-amber-900 font-bold">{hint}</p>
            </div>

            <div className="rounded-2xl border border-stone-200 p-3 space-y-2">
              <p className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-700" />
                ۳. انتخاب طرح
              </p>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-40 pb-1 -mx-0.5 px-0.5 snap-x">
                {activeItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`snap-start shrink-0 lg:w-full flex items-center gap-2 p-2 rounded-xl border text-right cursor-pointer min-h-[48px] ${
                      selectedId === item.id ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-white'
                    }`}
                  >
                    <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0" />
                    <span className="min-w-0 flex-1 max-w-[120px] lg:max-w-none">
                      <span className="block text-[11px] font-bold text-stone-900 truncate">{item.title}</span>
                      <span className="block text-[10px] text-stone-500 truncate">{item.persianCategory}</span>
                    </span>
                    {selectedId === item.id && <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 p-3 space-y-2">
              <p className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-amber-700" />
                ۴. شفافیت و مقیاس
              </p>
              <label className="block text-[11px] text-stone-600">
                شفافیت: {Math.round(opacity * 100)}٪
                <input type="range" min={0.25} max={1} step={0.05} value={opacity} onChange={(e) => { const v = Number(e.target.value); opacityRef.current = v; setOpacity(v); paintNow(); }} className="w-full mt-1 accent-amber-700 h-8" />
              </label>
              <label className="block text-[11px] text-stone-600">
                مقیاس طرح: {scale.toFixed(1)}×
                <input type="range" min={0.4} max={2.5} step={0.1} value={scale} onChange={(e) => { const v = Number(e.target.value); scaleRef.current = v; tileSheetRef.current = null; setScale(v); paintNow(); }} className="w-full mt-1 accent-amber-700 h-8" />
              </label>
            </div>

            <div className="flex gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={handleDownload} disabled={!roomImg} className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-900 text-amber-400 text-xs font-bold disabled:opacity-40 cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                دانلود
              </button>
              <button type="button" onClick={resetAll} className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold cursor-pointer">
                <RotateCcw className="w-3.5 h-3.5" />
                ریست
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
