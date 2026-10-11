import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, Loader2, MapPin, Search } from 'lucide-react';

export interface PickedLocation {
  lat: number;
  lng: number;
  /** نشانی متنی که از روی نقشه ساخته شده (قابل ویرایش توسط کاربر) */
  address: string;
  postalCode?: string;
}

interface MapAddressPickerProps {
  city?: string;
  value: { lat: number; lng: number } | null;
  onPick: (loc: PickedLocation) => void;
}

const CITY_CENTERS: Record<string, [number, number]> = {
  'تهران': [35.6892, 51.389],
  'مشهد': [36.2605, 59.6168],
  'اصفهان': [32.6546, 51.668],
  'شیراز': [29.5918, 52.5837],
  'تبریز': [38.0962, 46.2738],
  'کرج': [35.8355, 50.9915],
  'قم': [34.6416, 50.8746],
  'اهواز': [31.3183, 48.6706],
  'رشت': [37.2808, 49.5832],
  'کرمان': [30.2839, 57.0834],
  'ارومیه': [37.5527, 45.0761],
  'یزد': [31.8974, 54.3569],
  'ساری': [36.5633, 53.0601],
  'همدان': [34.7989, 48.5150],
  'کرمانشاه': [34.3277, 47.0778],
};
const DEFAULT_CENTER: [number, number] = CITY_CENTERS['تهران'];

const NOMINATIM = 'https://nominatim.openstreetmap.org';

// Leaflet از CDN بارگذاری می‌شود تا نیازی به نصب پکیج نباشد
const LEAFLET_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/';
let leafletPromise: Promise<any> | null = null;

const loadLeaflet = (): Promise<any> => {
  const w = window as any;
  if (w.L?.map) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet-css]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = `${LEAFLET_CDN}leaflet.css`;
      css.setAttribute('data-leaflet-css', '1');
      document.head.appendChild(css);
    }
    const script = document.createElement('script');
    script.src = `${LEAFLET_CDN}leaflet.js`;
    script.async = true;
    script.onload = () => (w.L?.map ? resolve(w.L) : reject(new Error('leaflet-missing')));
    script.onerror = () => {
      leafletPromise = null;
      reject(new Error('leaflet-load-failed'));
    };
    document.head.appendChild(script);
  });
  return leafletPromise;
};

const makePinIcon = (L: any) =>
  L.divIcon({
    className: '',
    html:
      '<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#b45309;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);transform:rotate(-45deg)"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

const buildAddress = (data: any): { address: string; postalCode?: string } => {
  const a = data?.address || {};
  const parts = [
    a.road || a.pedestrian || a.footway,
    a.house_number ? `پلاک ${a.house_number}` : '',
    a.neighbourhood || a.suburb || a.quarter,
    a.city_district,
    a.city || a.town || a.village,
  ].filter(Boolean);
  const address = parts.length ? Array.from(new Set(parts)).join('، ') : String(data?.display_name || '');
  return { address, postalCode: a.postcode };
};

export const MapAddressPicker: React.FC<MapAddressPickerProps> = ({ city, value, onPick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const reqIdRef = useRef(0);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [query, setQuery] = useState('');

  const placeMarker = (lat: number, lng: number) => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;
    if (!markerRef.current) {
      const m = L.marker([lat, lng], { icon: makePinIcon(L), draggable: true }).addTo(map);
      m.on('dragend', () => {
        const p = m.getLatLng();
        void pickAt(p.lat, p.lng, false);
      });
      markerRef.current = m;
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  const pickAt = async (lat: number, lng: number, recenter = true) => {
    const reqId = ++reqIdRef.current;
    placeMarker(lat, lng);
    if (recenter) mapRef.current?.setView([lat, lng], Math.max(mapRef.current.getZoom(), 16));
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(
        `${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=fa&lat=${lat}&lon=${lng}`
      );
      if (!res.ok) throw new Error('reverse-failed');
      const data = await res.json();
      if (reqId !== reqIdRef.current) return;
      const { address, postalCode } = buildAddress(data);
      onPickRef.current({ lat, lng, address, postalCode });
      if (!address) setMsg('نشانی متنی خودکار پیدا نشد؛ لطفاً آن را در کادر زیر تکمیل کنید.');
    } catch {
      if (reqId !== reqIdRef.current) return;
      onPickRef.current({ lat, lng, address: '' });
      setMsg('دریافت نشانی متنی از نقشه ممکن نشد؛ موقعیت ثبت شد، لطفاً نشانی را در کادر زیر بنویسید.');
    } finally {
      if (reqId === reqIdRef.current) setBusy(false);
    }
  };

  // ساخت نقشه (پس از بارگذاری Leaflet)
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        leafletRef.current = L;
        const start: [number, number] = value ? [value.lat, value.lng] : CITY_CENTERS[city || ''] || DEFAULT_CENTER;
        const map = L.map(containerRef.current, { center: start, zoom: value ? 16 : 12, attributionControl: true });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap',
        }).addTo(map);
        map.on('click', (e: any) => {
          void pickAt(e.latlng.lat, e.latlng.lng, false);
        });
        mapRef.current = map;
        if (value) placeMarker(value.lat, value.lng);
        timer = window.setTimeout(() => map.invalidateSize(), 250);
      })
      .catch(() => {
        if (!cancelled) setMsg('بارگذاری نقشه انجام نشد. اتصال اینترنت (یا فیلترشکن) را بررسی کنید و صفحه را دوباره باز کنید.');
      });

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // با تغییر شهر (وقتی هنوز نقطه‌ای انتخاب نشده) نقشه به مرکز شهر می‌رود
  useEffect(() => {
    if (!mapRef.current || value) return;
    const c = CITY_CENTERS[city || ''];
    if (c) mapRef.current.setView(c, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(
        `${NOMINATIM}/search?format=jsonv2&limit=1&countrycodes=ir&accept-language=fa&q=${encodeURIComponent(
          `${q} ${city || ''}`.trim()
        )}`
      );
      const list = await res.json();
      if (!Array.isArray(list) || !list.length) {
        setMsg('مکانی با این نام پیدا نشد. عبارت دیگری را جستجو کنید یا روی نقشه کلیک کنید.');
        setBusy(false);
        return;
      }
      await pickAt(parseFloat(list[0].lat), parseFloat(list[0].lon));
    } catch {
      setMsg('جستجو انجام نشد. اتصال اینترنت را بررسی کنید یا مستقیماً روی نقشه کلیک کنید.');
      setBusy(false);
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setMsg('مرورگر شما از تعیین موقعیت پشتیبانی نمی‌کند.');
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => void pickAt(pos.coords.latitude, pos.coords.longitude),
      () => {
        setBusy(false);
        setMsg('دسترسی به موقعیت مکانی داده نشد. لطفاً موقعیت را روی نقشه انتخاب کنید.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2" data-testid="map-address-picker">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="جستجوی محله یا خیابان (مثلاً: سعادت‌آباد)"
            className="w-full pl-3 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-2.5" />
        </div>
        <button
          type="button"
          onClick={() => void handleSearch()}
          className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          جستجو
        </button>
        <button
          type="button"
          onClick={handleLocate}
          title="موقعیت فعلی من"
          className="px-2.5 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl cursor-pointer"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-stone-300">
        <div ref={containerRef} dir="ltr" className="w-full h-56 sm:h-64 z-0" />
        {busy && (
          <div className="absolute top-2 left-2 z-[500] px-2 py-1 rounded-lg bg-white/90 border border-stone-200 text-[11px] text-stone-700 flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>در حال دریافت نشانی...</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-stone-500 flex items-start gap-1.5 leading-relaxed">
        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-700" />
        <span>
          {value
            ? 'موقعیت ثبت شد. برای اصلاح، پین را بکشید یا جای دیگری از نقشه را انتخاب کنید.'
            : 'روی نقشه کلیک کنید یا از جستجو و دکمه «موقعیت فعلی» استفاده کنید تا نشانی دقیق شما ثبت شود.'}
        </span>
      </p>
      {msg && <p className="text-[11px] text-amber-800 leading-relaxed">{msg}</p>}
    </div>
  );
};
