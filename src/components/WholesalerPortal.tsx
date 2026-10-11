import React, { useState } from 'react';
import { 
  Building2, 
  Package, 
  Truck, 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  Coins, 
  Layers, 
  Tag, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  AlertCircle,
  FileText,
  Warehouse,
  Send,
  Boxes
} from 'lucide-react';
import { UserProfile, WholesaleFabricItem } from '../types';

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

interface WholesalerPortalProps {
  wholesalerUser: UserProfile;
  fabrics: WholesaleFabricItem[];
  onAddFabric: (item: WholesaleFabricItem) => void;
  onUpdateFabric: (item: WholesaleFabricItem) => void;
  onDeleteFabric: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  orders?: WholesaleOrder[];
  onUpdateOrderStatus?: (orderId: string, status: WholesaleOrder['status'], trackingCode?: string) => void;
  onOpenProfileModal: () => void;
}

export const WholesalerPortal: React.FC<WholesalerPortalProps> = ({
  wholesalerUser,
  fabrics,
  onAddFabric,
  onUpdateFabric,
  onDeleteFabric,
  onToggleAvailability,
  orders = [],
  onUpdateOrderStatus,
  onOpenProfileModal,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'warehouse'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal for adding / editing fabric roll
  const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<WholesaleFabricItem | null>(null);

  // Form states for new fabric roll
  const [title, setTitle] = useState('');
  const [fabricCode, setFabricCode] = useState('');
  const [category, setCategory] = useState<WholesaleFabricItem['category']>('مخمل');
  const [origin, setOrigin] = useState('ترکیه');
  const [pricePerMeter, setPricePerMeter] = useState<number>(250000);
  const [rollMeters, setRollMeters] = useState<number>(50);
  const [availableRolls, setAvailableRolls] = useState<number>(20);
  const [minOrderRolls, setMinOrderRolls] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(wholesalerUser.warehouseCity || wholesalerUser.city || 'تهران');

  // Tracking Code modal for orders
  const [trackingModalOrder, setTrackingModalOrder] = useState<WholesaleOrder | null>(null);
  const [trackingCodeInput, setTrackingCodeInput] = useState('');

  // Format currency
  const formatToman = (amount: number) => {
    return amount.toLocaleString('fa-IR') + ' تومان';
  };

  // Filter fabrics
  const filteredFabrics = fabrics.filter((f) => {
    const matchesSearch = 
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.fabricCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.origin.includes(searchTerm);
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingFabric(null);
    setTitle('');
    setFabricCode(`WH-${Math.floor(100 + Math.random() * 900)}`);
    setCategory('مخمل');
    setOrigin('ترکیه');
    setPricePerMeter(280000);
    setRollMeters(50);
    setAvailableRolls(25);
    setMinOrderRolls(1);
    setImageUrl('https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80');
    setDescription('');
    setCity(wholesalerUser.warehouseCity || 'تهران');
    setIsFabricModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (fabric: WholesaleFabricItem) => {
    setEditingFabric(fabric);
    setTitle(fabric.title);
    setFabricCode(fabric.fabricCode);
    setCategory(fabric.category);
    setOrigin(fabric.origin);
    setPricePerMeter(fabric.pricePerMeter);
    setRollMeters(fabric.rollMeters);
    setAvailableRolls(fabric.availableRolls);
    setMinOrderRolls(fabric.minOrderRolls);
    setImageUrl(fabric.imageUrl);
    setDescription(fabric.description);
    setCity(fabric.city);
    setIsFabricModalOpen(true);
  };

  // Submit add or edit
  const handleSaveFabric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fabricCode.trim()) return;

    const calculatedPricePerRoll = pricePerMeter * rollMeters;

    if (editingFabric) {
      const updated: WholesaleFabricItem = {
        ...editingFabric,
        title,
        fabricCode,
        category,
        origin,
        pricePerMeter: Number(pricePerMeter),
        rollMeters: Number(rollMeters),
        pricePerRoll: calculatedPricePerRoll,
        availableRolls: Number(availableRolls),
        minOrderRolls: Number(minOrderRolls),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
        description,
        city,
      };
      onUpdateFabric(updated);
    } else {
      const newFabric: WholesaleFabricItem = {
        id: `wh-fab-${Date.now()}`,
        wholesalerId: wholesalerUser.id,
        wholesalerName: wholesalerUser.companyName || wholesalerUser.name,
        wholesalerPhone: wholesalerUser.phone,
        title,
        fabricCode,
        category,
        origin,
        pricePerMeter: Number(pricePerMeter),
        rollMeters: Number(rollMeters),
        pricePerRoll: calculatedPricePerRoll,
        availableRolls: Number(availableRolls),
        minOrderRolls: Number(minOrderRolls),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
        description,
        isAvailable: true,
        city,
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };
      onAddFabric(newFabric);
    }

    setIsFabricModalOpen(false);
  };

  // Status badge helper for wholesale order
  const getOrderStatusBadge = (status: WholesaleOrder['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">در انتظار استعلام قیمت</span>;
      case 'quoted':
        return <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">فاکتور ارسال شد</span>;
      case 'approved':
        return <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold">تایید و در حال بارگیری</span>;
      case 'shipped':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">تحویل باربری گردید</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">لغو شده</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right animate-in fade-in duration-200">
      
      {/* 1. Wholesaler Top Identity Bar */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                کارتابل اختصاصی بنکدار و تامین‌کننده عمده
              </span>
              {wholesalerUser.businessLicenseNumber && (
                <span className="text-[11px] text-stone-500 font-mono">
                  پروانه: {wholesalerUser.businessLicenseNumber}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
              {wholesalerUser.companyName || wholesalerUser.name}
            </h1>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Warehouse className="w-3.5 h-3.5 text-stone-400" />
                انبار مرکزی: {wholesalerUser.warehouseCity || wholesalerUser.city || 'تهران'}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                {wholesalerUser.phone}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ثبت طاقه جدید در انبار</span>
          </button>
          <button
            onClick={onOpenProfileModal}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors border border-stone-200 cursor-pointer"
          >
            مشخصات انبار و مجوز
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>طاقه‌های فعال در کاتالوگ</span>
            <Package className="w-4 h-4 text-amber-700" />
          </div>
          <span className="text-2xl font-black text-stone-900 font-mono">
            {fabrics.filter((f) => f.isAvailable).length}
          </span>
          <span className="text-[11px] text-stone-400 block mt-1">طاقه فعال قابل سفارش</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>کل موجودی انبار</span>
            <Boxes className="w-4 h-4 text-blue-700" />
          </div>
          <span className="text-2xl font-black text-stone-900 font-mono">
            {fabrics.reduce((acc, f) => acc + (f.availableRolls || 0), 0)}
          </span>
          <span className="text-[11px] text-stone-400 block mt-1">طاقه پارچه موجود در انبار</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>استعلام‌های عمده فروشگاه‌ها</span>
            <Truck className="w-4 h-4 text-purple-700" />
          </div>
          <span className="text-2xl font-black text-stone-900 font-mono">
            {orders.length}
          </span>
          <span className="text-[11px] text-stone-400 block mt-1">سفارش عمده ثبت شده</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>ارزش موجودی فعال</span>
            <Coins className="w-4 h-4 text-emerald-700" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
            {Math.round(fabrics.reduce((acc, f) => acc + (f.pricePerRoll * (f.availableRolls || 1)), 0) / 1000000).toLocaleString('fa-IR')}
          </span>
          <span className="text-[11px] text-stone-400 block mt-1">میلیون تومان برآورد انبار</span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>طاقه‌ها و کاتالوگ انبار ({fabrics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
            activeTab === 'orders'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>استعلام و سفارشات عمده فروشگاه‌ها</span>
          {orders.filter((o) => o.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] rounded-full font-mono">
              {orders.filter((o) => o.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('warehouse')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'warehouse'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          <span>مشخصات انبار و شرایط حداقل سفارش</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY & FABRICS */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو در نام طاقه، کد، کشور مبدا..."
                className="w-full pl-3 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
              {['all', 'مخمل', 'حریر و تور', 'زبرا و شید', 'کتان و گونی‌بافت', 'ملزومات و ریل'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer font-bold ${
                    selectedCategory === cat
                      ? 'bg-amber-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat === 'all' ? 'همه دسته‌ها' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Fabrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFabrics.map((fabric) => (
              <div 
                key={fabric.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={fabric.imageUrl}
                      alt={fabric.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                        {fabric.category}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-amber-600/90 text-white text-[10px] font-mono">
                        مبدا: {fabric.origin}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <button
                        onClick={() => onToggleAvailability(fabric.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shadow-xs cursor-pointer ${
                          fabric.isAvailable
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-rose-600 text-white hover:bg-rose-700'
                        }`}
                      >
                        {fabric.isAvailable ? 'موجود در انبار' : 'ناموجود (عدم نمایش)'}
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        کد: {fabric.fabricCode}
                      </span>
                      <span className="text-[11px] text-stone-500 font-bold">
                        موجودی: {fabric.availableRolls} طاقه
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-900 text-sm leading-snug">
                      {fabric.title}
                    </h3>

                    {fabric.description && (
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {fabric.description}
                      </p>
                    )}

                    {/* Price & specs */}
                    <div className="p-3 bg-stone-50 rounded-2xl space-y-1.5 text-xs border border-stone-100">
                      <div className="flex items-center justify-between text-stone-600">
                        <span>قیمت عمده هر متر:</span>
                        <span className="font-mono font-bold text-stone-900">{formatToman(fabric.pricePerMeter)}</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-600">
                        <span>متراژ هر طاقه:</span>
                        <span className="font-mono font-bold text-stone-900">{fabric.rollMeters} متر</span>
                      </div>
                      <div className="flex items-center justify-between text-amber-900 font-bold border-t border-stone-200 pt-1">
                        <span>قیمت هر طاقه کامل:</span>
                        <span className="font-mono font-black text-amber-800 text-sm">{formatToman(fabric.pricePerRoll)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span>حداقل سفارش مجاز:</span>
                        <span className="font-bold">{fabric.minOrderRolls} طاقه</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEdit(fabric)}
                    className="flex-1 py-1.5 bg-white hover:bg-stone-100 text-stone-800 rounded-xl text-xs font-bold border border-stone-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>ویرایش</span>
                  </button>

                  <button
                    onClick={() => onDeleteFabric(fabric.id)}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-xl transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                    title="حذف طاقه از کاتالوگ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {filteredFabrics.length === 0 && (
            <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-700">هیچ طاقه‌ای با این مشخصات یافت نشد.</p>
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2 bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                ثبت اولین طاقه پارچه در انبار
              </button>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: STORE BULK ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
            <h2 className="text-base font-black text-stone-900 mb-2">
              سفارشات عمده و استعلام قیمت فروشگاه‌های پرده
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              فروشگاه‌های مجری پس از اخذ سفارش مشتری، طاقه‌های مورد نیاز را از انبار شما استعلام می‌کنند.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-bold bg-stone-50/50">
                    <th className="py-3 px-3">شماره سفارش</th>
                    <th className="py-3 px-3">فروشگاه همکار</th>
                    <th className="py-3 px-3">شهر فروشگاه</th>
                    <th className="py-3 px-3">عنوان پارچه و کد</th>
                    <th className="py-3 px-3">تعداد طاقه</th>
                    <th className="py-3 px-3">مبلغ کل برآورد</th>
                    <th className="py-3 px-3">وضعیت سفارش</th>
                    <th className="py-3 px-3">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-stone-800">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-3 font-bold text-stone-900">
                          <div>{order.vendorStoreName}</div>
                          <div className="text-[10px] text-stone-500 font-mono">{order.vendorPhone}</div>
                        </td>
                        <td className="py-3 px-3 text-stone-600">{order.vendorCity}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-stone-800">{order.fabricTitle}</div>
                          <div className="text-[10px] font-mono text-stone-500">کد: {order.fabricCode}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-stone-900">
                          {order.requestedRolls} طاقه ({order.totalMeters} متر)
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-800">
                          {formatToman(order.totalAmount)}
                        </td>
                        <td className="py-3 px-3">
                          {getOrderStatusBadge(order.status)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {order.status === 'pending' && onUpdateOrderStatus && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'quoted')}
                                className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                تایید و ارسال فاکتور
                              </button>
                            )}
                            {order.status === 'approved' && onUpdateOrderStatus && (
                              <button
                                onClick={() => {
                                  setTrackingModalOrder(order);
                                  setTrackingCodeInput('');
                                }}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1"
                              >
                                <Truck className="w-3 h-3" />
                                <span>ثبت باربری</span>
                              </button>
                            )}
                            {order.trackingCode && (
                              <span className="text-[10px] text-stone-500 font-mono">
                                بارنامه: {order.trackingCode}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-400">
                        تاکنون استعلام سفارش عمده‌ای برای انبار شما ثبت نشده است.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: WAREHOUSE & SETTINGS */}
      {activeTab === 'warehouse' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <Warehouse className="w-6 h-6 text-amber-700" />
            <div>
              <h2 className="text-lg font-black text-stone-900">مشخصات انبار مرکزی و ضوابط بنکداری</h2>
              <p className="text-xs text-stone-500">اطلاعات نمایش داده شده برای فروشگاه‌های همکار در سراسر کشور</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-stone-50 rounded-2xl space-y-1">
              <span className="text-stone-500 block">نام بازرگانی / شرکت:</span>
              <span className="font-bold text-stone-900 text-sm">{wholesalerUser.companyName || wholesalerUser.name}</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl space-y-1">
              <span className="text-stone-500 block">شماره پروانه کسب / ثبت شرکت:</span>
              <span className="font-bold text-stone-900 text-sm font-mono">{wholesalerUser.businessLicenseNumber || '۱۴۰۳/۸۸۴۹۲'}</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl space-y-1">
              <span className="text-stone-500 block">شهر انبار مرکزی:</span>
              <span className="font-bold text-stone-900 text-sm">{wholesalerUser.warehouseCity || wholesalerUser.city || 'تهران'}</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl space-y-1">
              <span className="text-stone-500 block">حداقل تعداد طاقه برای هر خرید:</span>
              <span className="font-bold text-stone-900 text-sm font-mono">{wholesalerUser.minimumOrderRolls || 1} طاقه</span>
            </div>

            <div className="sm:col-span-2 p-4 bg-stone-50 rounded-2xl space-y-1">
              <span className="text-stone-500 block">نشانی دقیق انبار مرکزی جهت بارگیری:</span>
              <span className="font-bold text-stone-900">{wholesalerUser.warehouseAddress || wholesalerUser.address || 'تهران، جاده مخصوص کرج، کیلومتر ۱۲، مجتمع انبارهای نساجی'}</span>
            </div>

            <div className="sm:col-span-2 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>ضمانت اتحادیه و تسویه امن:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                تمام تراکنش‌های عمده در بستر پلتفرم دراپینو انجام شده و پس از اعلام بارنامه و تایید رسید کالا توسط فروشگاه در مقصد، وجه ظرف ۲۴ ساعت به شماره شبای بنکدار تسویه می‌گردد.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenProfileModal}
              className="px-6 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              ویرایش اطلاعات انبار و شماره شبا
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT FABRIC ROLL */}
      {isFabricModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 overflow-y-auto max-h-[90vh] text-right space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-700" />
                <h3 className="font-black text-base text-stone-900">
                  {editingFabric ? 'ویرایش طاقه پارچه عمده' : 'ثبت طاقه پارچه جدید در انبار'}
                </h3>
              </div>
              <button
                onClick={() => setIsFabricModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFabric} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">عنوان کامل پارچه (طاقه‌ای):</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مخمل کالیفرنیا سوپرمات ترک (طاقه ۵۰ متری)"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">کد اختصاصی پارچه:</label>
                  <input
                    type="text"
                    required
                    value={fabricCode}
                    onChange={(e) => setFabricCode(e.target.value)}
                    placeholder="مثال: CAL-99-TURK"
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">دسته‌بندی:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  >
                    <option value="مخمل">مخمل</option>
                    <option value="حریر و تور">حریر و تور</option>
                    <option value="زبرا و شید">زبرا و شید</option>
                    <option value="کتان و گونی‌بافت">کتان و گونی‌بافت</option>
                    <option value="پتینه و ژاکارد">پتینه و ژاکارد</option>
                    <option value="ملزومات و ریل">ملزومات و ریل</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">کشور مبدا:</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="ترکیه، چین، ایران..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">متراژ هر طاقه (متر):</label>
                  <input
                    type="number"
                    value={rollMeters}
                    onChange={(e) => setRollMeters(Number(e.target.value))}
                    min={10}
                    max={200}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">موجودی (تعداد طاقه):</label>
                  <input
                    type="number"
                    value={availableRolls}
                    onChange={(e) => setAvailableRolls(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">قیمت عمده هر متر (تومان):</label>
                  <input
                    type="number"
                    value={pricePerMeter}
                    onChange={(e) => setPricePerMeter(Number(e.target.value))}
                    step={10000}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">حداقل سفارش مجاز (طاقه):</label>
                  <input
                    type="number"
                    value={minOrderRolls}
                    onChange={(e) => setMinOrderRolls(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-center"
                  />
                </div>
              </div>

              {/* Calculated price per roll badge */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">قیمت هر طاقه کامل ({rollMeters} متری):</span>
                <span className="font-mono font-black text-amber-800 text-sm">
                  {formatToman(pricePerMeter * rollMeters)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">آدرس عکس کالیته طاقه:</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono dir-ltr text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">توضیحات بافت و مشخصات فنی:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="عرض پارچه، تراکم بافت، رنگ‌بندی‌های موجود در طاقه..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFabricModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  {editingFabric ? 'ذخیره تغییرات' : 'افزودن طاقه به انبار'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT TRACKING CODE */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-right space-y-4">
            <h3 className="font-black text-base text-stone-900">
              ثبت شماره بارنامه و تحویل به باربری
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              سفارش مربوط به فروشگاه «{trackingModalOrder.vendorStoreName}» ({trackingModalOrder.vendorCity}) آماده ارسال است. لطفاً شماره بیجک یا بارنامه را وارد نمایید.
            </p>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">شماره بارنامه / بیجک انبار:</label>
              <input
                type="text"
                value={trackingCodeInput}
                onChange={(e) => setTrackingCodeInput(e.target.value)}
                placeholder="مثال: باربری پیام - بیجک ۴۹۸۲۱"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  if (onUpdateOrderStatus && trackingModalOrder) {
                    onUpdateOrderStatus(trackingModalOrder.id, 'shipped', trackingCodeInput);
                  }
                  setTrackingModalOrder(null);
                }}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                ثبت و اعلام ارسال به باربری
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
