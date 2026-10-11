import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Search, CheckCircle2, X, Globe, ShieldAlert, Sparkles, Navigation, ChevronLeft, ArrowRight, Store } from 'lucide-react';
import { OperationalCity } from '../types';

interface CitySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (cityName: string) => void;
  operationalCities: OperationalCity[];
}

export const CitySelectModal: React.FC<CitySelectModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
  operationalCities,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Find parent hub for currently selected city if it's already a satellite
  const initialHubCity = useMemo(() => {
    const tehranObj = operationalCities.find((c) => c.name === 'تهران' || c.id === 'city-tehran');
    const mashhadObj = operationalCities.find((c) => c.name === 'مشهد' || c.id === 'city-mashhad');

    const tehranSats = [
      ...(tehranObj?.otherCoveredCities || tehranObj?.satelliteCities || []),
      'پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'دماوند و رودهن', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'ملارد', 'شهر قدس'
    ];
    const mashhadSats = [
      ...(mashhadObj?.otherCoveredCities || mashhadObj?.satelliteCities || []),
      'گلبهار', 'چناران', 'نیشابور', 'کلات', 'روستای لکلک', 'طرقبه', 'شاندیز'
    ];

    if (tehranSats.includes(selectedCity) || selectedCity === 'تهران') return 'تهران';
    if (mashhadSats.includes(selectedCity) || selectedCity === 'مشهد') return 'مشهد';
    
    // Check if matched operational city has parent
    const match = operationalCities.find((c) => c.name === selectedCity);
    if (match?.parentHubCityName) return match.parentHubCityName;
    if (match?.isHub) return match.name;

    return 'تهران';
  }, [selectedCity, operationalCities]);

  // The currently focused main hub city
  const [focusedMainCity, setFocusedMainCity] = useState<string>(initialHubCity);

  useEffect(() => {
    if (isOpen) {
      setFocusedMainCity(initialHubCity);
      setSearchTerm('');
    }
  }, [isOpen, initialHubCity]);

  // Main operational cities (Hubs / centers)
  const mainCities = useMemo(() => {
    return operationalCities.filter((c) => !c.parentHubCityName && !c.parentHubCityId);
  }, [operationalCities]);

  // Dynamic map of satellite & covered cities for any operational city
  const hubCitySatelliteMap = useMemo(() => {
    const map: Record<string, Array<{ name: string; hubName: string; distance: number; note: string }>> = {};

    const defaultTehranSatellites = [
      { name: 'پرند', distance: 35, note: 'شهر جدید پرند (جنوب‌غربی پایتخت)' },
      { name: 'پردیس', distance: 25, note: 'شهر جدید پردیس و فازهای ۱ تا ۱۱ (شرق پایتخت)' },
      { name: 'اسلامشهر', distance: 20, note: 'اسلامشهر، واوان و چهاردانگه' },
      { name: 'شهریار', distance: 30, note: 'شهریار، اندیشه، امیریه و باغ‌ویلاها' },
      { name: 'ورامین', distance: 40, note: 'ورامین، قرچک و پاکدشت' },
      { name: 'دماوند', distance: 55, note: 'دماوند، رودهن، بومهن، گیلاوند و آبسرد' },
      { name: 'رباط‌کریم', distance: 35, note: 'رباط‌کریم و نصیرشهر' },
      { name: 'پاکدشت', distance: 30, note: 'پاکدشت و شریف‌آباد' },
      { name: 'قرچک', distance: 35, note: 'قرچک، باقرآباد و زیباشهر' },
      { name: 'شهر قدس', distance: 25, note: 'شهر قدس و قلعه‌حسن‌خان' },
      { name: 'ملارد', distance: 35, note: 'ملارد و صفادشت' }
    ];

    const defaultMashhadSatellites = [
      { name: 'گلبهار', distance: 35, note: 'شهر جدید گلبهار و فازهای نوساز' },
      { name: 'چناران', distance: 45, note: 'چناران و بلوار امام رضا' },
      { name: 'نیشابور', distance: 110, note: 'نیشابور، خیابان خیام و مناطق مرکزی' },
      { name: 'طرقبه و شاندیز', distance: 25, note: 'ییلاقات طرقبه و شاندیز' },
      { name: 'کلات', distance: 140, note: 'کلات نادر و دژ رشید' },
      { name: 'روستای لکلک', distance: 50, note: 'روستای لکلک و حومه کلات' }
    ];

    operationalCities.forEach((city) => {
      // Gather satellite cities from otherCoveredCities, satelliteCities, or operational cities with parentHubCityName
      const combinedSats = Array.from(
        new Set([
          ...(city.otherCoveredCities || []),
          ...(city.satelliteCities || []),
          ...operationalCities.filter((c) => c.parentHubCityName === city.name || (c.parentHubCityId && c.parentHubCityId === city.id)).map((c) => c.name),
          ...(city.name === 'تهران' ? defaultTehranSatellites.map((s) => s.name) : []),
          ...(city.name === 'مشهد' ? defaultMashhadSatellites.map((s) => s.name) : [])
        ])
      );

      if (combinedSats.length > 0) {
        map[city.name] = combinedSats.map((satName) => {
          const matchDefault = (city.name === 'تهران' ? defaultTehranSatellites : defaultMashhadSatellites).find((d) => d.name === satName);
          const matchCity = operationalCities.find((c) => c.name === satName);
          return {
            name: satName,
            hubName: city.name,
            distance: matchCity?.distanceKmFromHub || matchDefault?.distance || 30,
            note: matchCity?.statusNote || matchDefault?.note || `شهر اقماری و محدوده تحت پوشش خدمات ${city.name}`
          };
        });
      }
    });

    return map;
  }, [operationalCities]);

  // Search filtering logic
  const searchMatchedSatellites = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];

    const allSats = Object.values(hubCitySatelliteMap).flat();

    return allSats.filter((s) => 
      s.name.toLowerCase().includes(q) || 
      s.hubName.toLowerCase().includes(q) ||
      s.note.toLowerCase().includes(q)
    );
  }, [searchTerm, hubCitySatelliteMap]);

  if (!isOpen) return null;

  // Satellites for the currently focused main hub
  const currentHubSatellites = hubCitySatelliteMap[focusedMainCity] || [];

  const handleChoose = (cityName: string) => {
    onSelectCity(cityName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-right">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Notice Banner */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300">
              <Globe className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-300">
              محدوده دقیق خدمات و پوشش‌دهی دراپینو
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white">
            انتخاب شهر اصلی و شهرهای اقماری تحت پوشش
          </h3>

          <p className="text-xs text-stone-300 mt-1 max-w-xl leading-relaxed">
            شهرهای اقماری بر اساس <strong>شهر اصلی انتخابی</strong> نمایش داده می‌شوند تا مشتریان و فروشگاه‌ها محدوده دقیق خدمات و اعزام کالیته را مشخص نمایند.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="جستجوی نام شهر یا شهر اقماری (مثلا: پرند، شهریار، پردیس، دماوند، نیشابور، گلبهار)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-700 focus:outline-hidden"
              autoFocus
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
          </div>

          {/* If Search is Active */}
          {searchTerm.trim().length > 0 ? (
            <div className="space-y-3">
              <span className="text-xs font-bold text-stone-700 block">
                نتایج جستجو برای «{searchTerm}»:
              </span>

              {searchMatchedSatellites.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-500 text-xs">
                  شهری با این عنوان در شبکه اقماری یافت نشد. می‌توانید از لیست دسته‌بندی زیر استفاده کنید.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {searchMatchedSatellites.map((sat) => {
                    const isSelected = selectedCity === sat.name;
                    return (
                      <button
                        key={sat.name}
                        type="button"
                        onClick={() => handleChoose(sat.name)}
                        className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-200'
                            : 'bg-white hover:bg-amber-50/60 border-stone-200 hover:border-amber-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-stone-900">{sat.name}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.2 rounded-md">
                              اقماری {sat.hubName}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500 block mt-1 line-clamp-1">
                            {sat.note} (فاصله {sat.distance} کیلومتر)
                          </span>
                        </div>
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-800' : 'text-stone-300'}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* STEP 1 & STEP 2: CHOOSE MAIN HUB, THEN CHOOSE SATELLITE TOWNS */
            <div className="space-y-5">
              
              {/* Step 1: Main Metropolitan Hubs Bar */}
              <div>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>مرحله ۱: انتخاب کلان‌شهر یا مرکز استان (شهر اصلی):</span>
                  </span>
                  <span className="text-[11px] text-stone-400">
                    برای مشاهده شهرهای اقماری، روی کلان‌شهر کلیک کنید
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {mainCities.map((city) => {
                    const isFocused = focusedMainCity === city.name;
                    const isSelected = selectedCity === city.name;
                    const satCount = (hubCitySatelliteMap[city.name] || city.otherCoveredCities || city.satelliteCities || []).length;

                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => setFocusedMainCity(city.name)}
                        className={`p-3 rounded-2xl border text-right transition-all cursor-pointer relative flex flex-col justify-between ${
                          isFocused
                            ? 'bg-amber-800 text-white border-amber-900 shadow-md ring-2 ring-amber-300'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-sm">{city.name}</span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            )}
                          </div>
                          <span className={`text-[10px] block mt-0.5 ${isFocused ? 'text-amber-200' : 'text-stone-400'}`}>
                            {city.province}
                          </span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-[10px]">
                          <span className={isFocused ? 'text-amber-100 font-bold' : 'text-stone-500'}>
                            {satCount > 0 ? `${satCount} شهر اقماری` : 'مرکز استان'}
                          </span>
                          <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${isFocused ? 'rotate-90 text-amber-200' : 'text-stone-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Satellite Towns specifically for the Focused Hub City */}
              <div className="p-4 sm:p-5 bg-gradient-to-b from-amber-50/70 via-stone-50 to-white rounded-3xl border border-amber-200/90 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-950">
                        مرحله ۲: شهرهای اقماری و مناطق تحت پوشش «{focusedMainCity}»:
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 font-bold font-mono">
                        {currentHubSatellites.length} محدوده خدماتی
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      فروشگاه‌های همکار در تابلوی شکار {focusedMainCity} این مناطق را پوشش داده و کارشناس اعزام می‌کنند.
                    </p>
                  </div>

                  {/* Button to select the Main Hub itself */}
                  <button
                    type="button"
                    onClick={() => handleChoose(focusedMainCity)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                      selectedCity === focusedMainCity
                        ? 'bg-amber-800 text-white ring-2 ring-amber-300'
                        : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>انتخاب خود {focusedMainCity} (مرکز کلان‌شهر)</span>
                  </button>
                </div>

                {/* Satellite Towns Grid */}
                {currentHubSatellites.length === 0 ? (
                  <div className="p-6 text-center text-stone-500 text-xs">
                    برای این شهر، شهر اقماری مجزایی تعریف نشده است؛ کلیه مناطق شهری به صورت مستقیم پوشش داده می‌شوند.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {currentHubSatellites.map((sat) => {
                      const isSelected = selectedCity === sat.name;
                      return (
                        <button
                          key={sat.name}
                          type="button"
                          onClick={() => handleChoose(sat.name)}
                          className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer group ${
                            isSelected
                              ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-200 shadow-xs'
                              : 'bg-white hover:bg-amber-50/70 border-stone-200 hover:border-amber-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-xs text-stone-900 group-hover:text-amber-900">
                                {sat.name}
                              </span>
                              <span className="text-[10px] bg-stone-100 group-hover:bg-amber-100 text-stone-600 px-1.5 py-0.2 rounded font-mono">
                                {sat.distance} کیلومتر
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-500 block mt-1 line-clamp-1">
                              {sat.note}
                            </span>
                          </div>

                          <div className="shrink-0 mr-2">
                            {isSelected ? (
                              <span className="px-2 py-1 bg-amber-800 text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>انتخاب شد</span>
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-stone-100 group-hover:bg-amber-200 text-stone-700 text-[10px] font-bold rounded-lg">
                                انتخاب
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Footer note */}
          <div className="pt-2 text-center border-t border-stone-100 text-[11px] text-stone-500">
            با انتخاب هر شهر، برترین فروشگاه‌های پروانه‌دار همان محدوده در صفحه اصلی و تابلوی اعزام نمایش داده خواهند شد.
          </div>
        </div>

      </div>
    </div>
  );
};

