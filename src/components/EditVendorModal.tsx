import React, { useState } from 'react';
import { CurtainVendor, MasterFabricCatalog } from '../types';
import { X, Save, Store, User, Phone, MapPin, Award, Wallet, ShieldCheck, CheckSquare, Square } from 'lucide-react';

interface EditVendorModalProps {
  vendor: CurtainVendor;
  masterCatalogs: MasterFabricCatalog[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedVendor: CurtainVendor) => void;
}

export const EditVendorModal: React.FC<EditVendorModalProps> = ({
  vendor,
  masterCatalogs,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(vendor.name);
  const [ownerName, setOwnerName] = useState(vendor.ownerName);
  const [phone, setPhone] = useState(vendor.phone);
  const [city, setCity] = useState(vendor.city);
  const [address, setAddress] = useState(vendor.address);
  const [districtsText, setDistrictsText] = useState(vendor.coveredDistricts.join('، '));
  const [coveredOtherCitiesText, setCoveredOtherCitiesText] = useState((vendor.coveredOtherCities || []).join('، '));
  const [tier, setTier] = useState<'طلایی' | 'نقره‌ای' | 'برنز'>(vendor.tier);
  const [rating, setRating] = useState(vendor.rating);
  const [isVerified, setIsVerified] = useState(vendor.isVerified);
  const [walletBalance, setWalletBalance] = useState(vendor.walletBalance);
  const [availableCatalogIds, setAvailableCatalogIds] = useState<string[]>(
    vendor.availableCatalogIds || []
  );

  if (!isOpen) return null;

  const toggleCatalog = (catalogId: string) => {
    if (availableCatalogIds.includes(catalogId)) {
      setAvailableCatalogIds(availableCatalogIds.filter((id) => id !== catalogId));
    } else {
      setAvailableCatalogIds([...availableCatalogIds, catalogId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const coveredDistricts = districtsText
      .split(/[,،]+/)
      .map((d) => d.trim())
      .filter(Boolean);

    const coveredOtherCities = coveredOtherCitiesText
      .split(/[,،]+/)
      .map((c) => c.trim())
      .filter(Boolean);

    // Compute sampleCatalogs titles from catalog IDs
    const matchedNames = masterCatalogs
      .filter((c) => availableCatalogIds.includes(c.id))
      .map((c) => c.name);

    onSave({
      ...vendor,
      name,
      ownerName,
      phone,
      city,
      address,
      coveredDistricts,
      coveredOtherCities,
      tier,
      rating: Number(rating),
      isVerified,
      walletBalance: Number(walletBalance),
      availableCatalogIds,
      sampleCatalogs: matchedNames.length > 0 ? matchedNames : vendor.sampleCatalogs,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in duration-150 text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-800" />
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">
              ویرایش اطلاعات فروشگاه همکار «{vendor.name}»
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">نام فروشگاه / گالری پرده:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">نام مدیر مسئول / کارشناس ارشد:</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">شماره تماس همراه:</label>
              <input
                type="text"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono text-left"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">شهر:</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">نشانی فروشگاه یا کارگاه دوخت:</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">مناطق تحت پوشش اعزام (با ویرگول جدا کنید):</label>
            <input
              type="text"
              value={districtsText}
              onChange={(e) => setDistrictsText(e.target.value)}
              placeholder="منطقه ۱، منطقه ۲، سعادت‌آباد، ونک"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">سایر شهرهای تحت پوشش فروشگاه (شهرهای اقماری با ویرگول جدا کنید):</label>
            <input
              type="text"
              value={coveredOtherCitiesText}
              onChange={(e) => setCoveredOtherCitiesText(e.target.value)}
              placeholder="پرند، پردیس، اسلامشهر، شهریار"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">سطح عضویت (Tier):</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              >
                <option value="طلایی">طلایی (VIP)</option>
                <option value="نقره‌ای">نقره‌ای</option>
                <option value="برنز">برنز</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">امتیاز کیفیت (از ۵):</label>
              <input
                type="number"
                step="0.05"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">موجودی کیف پول (تومان):</label>
              <input
                type="number"
                step="50000"
                value={walletBalance}
                onChange={(e) => setWalletBalance(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <span className="font-semibold text-stone-800">وضعیت پروانه کسب و احراز هویت صنفی:</span>
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 text-amber-700 rounded focus:ring-amber-600"
              />
              <span className={isVerified ? 'text-emerald-700' : 'text-red-700'}>
                {isVerified ? 'تایید شده و دارای پروانه معتبر' : 'در انتظار بررسی مدارک'}
              </span>
            </label>
          </div>

          {/* Master Catalogs Selection */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-800">
                کالیته‌های در دسترس فروشگاه از کاتالوگ جامع سامانه:
              </label>
              <span className="text-[11px] text-stone-500 font-medium">
                {availableCatalogIds.length} کالیته فعال
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
              {masterCatalogs.map((catalog) => {
                const isSelected = availableCatalogIds.includes(catalog.id);
                return (
                  <button
                    key={catalog.id}
                    type="button"
                    onClick={() => toggleCatalog(catalog.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-right border transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-amber-700 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-300 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="text-[11px] truncate">{catalog.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{catalog.code} · {catalog.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات فروشگاه</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
