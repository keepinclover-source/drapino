import React from 'react';
import { ArrowLeft } from 'lucide-react';

import { ServiceCategory, SERVICE_CATEGORY_LABELS } from '../utils/serviceCategory';

export type { ServiceCategory };
export { SERVICE_CATEGORY_LABELS };

/**
 * برای استفاده از عکس واقعی، مسیر عکس را در فیلد image بگذارید
 * (مثلاً فایل را در public/images کپی کنید و بنویسید '/images/wallpaper.jpg').
 * اگر image خالی باشد، تصویر گرافیکی پیش‌فرض نمایش داده می‌شود.
 */
const CARDS: {
  id: ServiceCategory;
  title: string;
  subtitle: string;
  image: string | null;
}[] = [
  {
    id: 'curtain',
    title: 'پرده',
    subtitle: 'کالیته پارچه، حریر و مخمل را در منزل ببینید',
    image: '/images/hero_curtain_luxury_living_1790237028961.jpg',
  },
  {
    id: 'wallpaper',
    title: 'کاغذ دیواری',
    subtitle: 'آلبوم طرح‌ها و بافت‌های دیواری را در منزل ببینید',
    image: null,
  },
  {
    id: 'flooring',
    title: 'کفپوش و پارکت',
    subtitle: 'نمونه چوب، لمینت و کفپوش را در منزل ببینید',
    image: null,
  },
];

const WallpaperArt: React.FC = () => (
  <svg viewBox="0 0 400 260" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
    <defs>
      <linearGradient id="wp-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2f4a43" />
        <stop offset="1" stopColor="#1d322d" />
      </linearGradient>
      <pattern id="wp-pat" width="80" height="100" patternUnits="userSpaceOnUse">
        <g fill="none" stroke="#d9b974" strokeWidth="1.4" opacity="0.9">
          <path d="M40 8 C54 28 54 52 40 70 C26 52 26 28 40 8 Z" />
          <path d="M40 70 L40 96" />
          <path d="M40 40 C28 36 18 40 10 50 M40 52 C52 48 62 52 70 62" />
        </g>
        <circle cx="0" cy="0" r="4" fill="#d9b974" opacity="0.7" />
        <circle cx="80" cy="0" r="4" fill="#d9b974" opacity="0.7" />
        <circle cx="0" cy="100" r="4" fill="#d9b974" opacity="0.7" />
        <circle cx="80" cy="100" r="4" fill="#d9b974" opacity="0.7" />
        <g fill="#d9b974" opacity="0.35">
          <path d="M40 4 L44 12 L40 20 L36 12 Z" transform="translate(0 100)" />
        </g>
      </pattern>
      <linearGradient id="wp-shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.45" />
      </linearGradient>
    </defs>
    <rect width="400" height="260" fill="url(#wp-bg)" />
    <rect width="400" height="260" fill="url(#wp-pat)" />
    {/* wainscot */}
    <rect y="190" width="400" height="70" fill="#efe6d4" />
    <rect y="186" width="400" height="6" fill="#c9a45c" />
    <g stroke="#d9cdb4" strokeWidth="2" fill="none">
      <rect x="20" y="202" width="110" height="46" rx="3" />
      <rect x="145" y="202" width="110" height="46" rx="3" />
      <rect x="270" y="202" width="110" height="46" rx="3" />
    </g>
    <rect width="400" height="260" fill="url(#wp-shade)" />
  </svg>
);

const FlooringArt: React.FC = () => {
  const tiles: React.ReactNode[] = [];
  const colors = ['#b07a45', '#a26b38', '#c08a54', '#98622f', '#b98350', '#a9733f'];
  let k = 0;
  // herringbone pattern
  for (let row = -1; row < 9; row++) {
    for (let col = -1; col < 12; col++) {
      const x = col * 44 + (row % 2 === 0 ? 0 : 22);
      const y = row * 30;
      const c1 = colors[(row * 7 + col * 3 + 12) % colors.length];
      const c2 = colors[(row * 5 + col * 11 + 18) % colors.length];
      tiles.push(
        <g key={k++}>
          <rect x={x} y={y} width="40" height="13" rx="1" fill={c1} transform={`rotate(45 ${x + 20} ${y + 6})`} />
          <rect x={x + 6} y={y + 14} width="40" height="13" rx="1" fill={c2} transform={`rotate(-45 ${x + 26} ${y + 20})`} />
        </g>
      );
    }
  }
  return (
    <svg viewBox="0 0 400 260" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="fl-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="#9a642f" />
      <g stroke="#6e4220" strokeWidth="0.8" opacity="0.95">{tiles}</g>
      <rect width="400" height="260" fill="url(#fl-light)" />
      {/* skirting board */}
      <rect y="0" width="400" height="14" fill="#f3ede1" opacity="0.92" />
    </svg>
  );
};

interface ServiceCategoryPickerProps {
  onSelect: (category: ServiceCategory) => void;
  /** متن توضیح بالای کارت‌ها (اختیاری) */
  description?: string;
}

export const ServiceCategoryPicker: React.FC<ServiceCategoryPickerProps> = ({ onSelect, description }) => {
  return (
    <div className="p-5 sm:p-6 text-right space-y-4" data-testid="service-category-picker">
      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
        {description || 'کدام را می‌خواهید؟ پس از انتخاب شما، فروشگاه کالیته (نمونه‌ها و آلبوم‌ها) همان بخش را به منزل شما می‌آورد.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            data-testid={`service-card-${card.id}`}
            className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-900 text-right shadow-sm hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer h-44 sm:h-60"
          >
            <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
              {card.image ? (
                <img src={card.image} alt={card.title} className="w-full h-full object-cover" loading="lazy" />
              ) : card.id === 'wallpaper' ? (
                <WallpaperArt />
              ) : (
                <FlooringArt />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-3.5 space-y-1">
              <h4 className="text-base sm:text-lg font-black text-white">{card.title}</h4>
              <p className="text-[11px] text-stone-200 leading-relaxed hidden sm:block">{card.subtitle}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
                <span>انتخاب</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
