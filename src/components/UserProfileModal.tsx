import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Store, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';
import { isValidSheba, normalizeSheba } from '../utils/invoiceUtils';
import { UserProfile, UserRole, SupportTicket, TicketAttachment, CurtainVendor, VisitRequest } from '../types';
import { LifeBuoy, AlertTriangle, MessageSquare } from 'lucide-react';
import { SupportTicketSystem } from './SupportTicketSystem';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  tickets?: SupportTicket[];
  vendors?: CurtainVendor[];
  orders?: VisitRequest[];
  onCreateTicket?: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'messages'>, initialMessageText: string) => void;
  onReplyTicket?: (ticketId: string, message: string, attachments?: TicketAttachment[]) => void;
  initialTab?: 'profile' | 'tickets';
}

type UserProfileModalPropsInner = Omit<UserProfileModalProps, 'currentUser'> & { currentUser: NonNullable<UserProfileModalProps['currentUser']> };

const UserProfileModalInner: React.FC<UserProfileModalPropsInner> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  tickets = [],
  vendors = [],
  orders = [],
  onCreateTicket,
  onReplyTicket,
  initialTab = 'profile',
}) => {

  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'tickets'>(initialTab);

  // Form State initialized from currentUser
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [province, setProvince] = useState(currentUser.province || 'تهران');
  const [city, setCity] = useState(currentUser.city || 'تهران');
  const [district, setDistrict] = useState(currentUser.district || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [floorAndUnit, setFloorAndUnit] = useState(currentUser.floorAndUnit || '');
  const [postalCode, setPostalCode] = useState(currentUser.postalCode || '');
  const [notes, setNotes] = useState(currentUser.notes || '');

  // Vendor specific
  const [storeName, setStoreName] = useState(currentUser.storeName || '');
  const [ownerName, setOwnerName] = useState(currentUser.ownerName || currentUser.name || '');
  const [landlinePhone, setLandlinePhone] = useState(currentUser.landlinePhone || '');
  const [nationalCode, setNationalCode] = useState(currentUser.nationalCode || '');
  const [shebaNumber, setShebaNumber] = useState(currentUser.shebaNumber || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [coveredDistricts, setCoveredDistricts] = useState<string[]>(
    currentUser.coveredDistricts && currentUser.coveredDistricts.length > 0 
      ? currentUser.coveredDistricts 
      : ['منطقه ۱', 'منطقه ۲', 'منطقه ۳']
  );
  const [newDistrictInput, setNewDistrictInput] = useState('');

  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Re-sync if user changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setProvince(currentUser.province || 'تهران');
      setCity(currentUser.city || 'تهران');
      setDistrict(currentUser.district || '');
      setAddress(currentUser.address || '');
      setFloorAndUnit(currentUser.floorAndUnit || '');
      setPostalCode(currentUser.postalCode || '');
      setNotes(currentUser.notes || '');
      setStoreName(currentUser.storeName || '');
      setOwnerName(currentUser.ownerName || currentUser.name || '');
      setLandlinePhone(currentUser.landlinePhone || '');
      setNationalCode(currentUser.nationalCode || '');
      setShebaNumber(currentUser.shebaNumber || '');
      setBio(currentUser.bio || '');
      setCoveredDistricts(currentUser.coveredDistricts || ['منطقه ۱', 'منطقه ۲', 'منطقه ۳']);
      setIsSavedSuccess(false);
      setErrorMessage('');
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      setActiveModalTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleAddDistrict = () => {
    if (!newDistrictInput.trim()) return;
    if (!coveredDistricts.includes(newDistrictInput.trim())) {
      setCoveredDistricts([...coveredDistricts, newDistrictInput.trim()]);
    }
    setNewDistrictInput('');
  };

  const handleRemoveDistrict = (item: string) => {
    setCoveredDistricts(coveredDistricts.filter((d) => d !== item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('نام و نام خانوادگی نمی‌تواند خالی باشد.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('شماره تلفن همراه الزامی است.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('نشانی پستی الزامی است.');
      return;
    }

    if (currentUser.role === 'vendor' && !storeName.trim()) {
      setErrorMessage('نام فروشگاه نمی‌تواند خالی باشد.');
      return;
    }
    if (currentUser.role === 'vendor' && shebaNumber.trim() && !isValidSheba(shebaNumber)) {
      setErrorMessage('شماره شبا نامعتبر است. قالب صحیح: IR و ۲۴ رقم (مثلاً IR123456789012345678901234).');
      return;
    }

    const updated: UserProfile = {
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      province: province.trim(),
      city: city.trim(),
      district: district.trim(),
      address: address.trim(),
      floorAndUnit: floorAndUnit.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      notes: notes.trim() || undefined,
      storeName: currentUser.role === 'vendor' ? storeName.trim() : currentUser.storeName,
      ownerName: currentUser.role === 'vendor' ? ownerName.trim() : currentUser.ownerName,
      landlinePhone: currentUser.role === 'vendor' ? landlinePhone.trim() : currentUser.landlinePhone,
      nationalCode: currentUser.role === 'vendor' ? nationalCode.trim() : currentUser.nationalCode,
      shebaNumber: currentUser.role === 'vendor' ? normalizeSheba(shebaNumber) : currentUser.shebaNumber,
      bio: currentUser.role === 'vendor' ? bio.trim() : currentUser.bio,
      coveredDistricts: currentUser.role === 'vendor' ? coveredDistricts : currentUser.coveredDistricts,
    };

    onSaveProfile(updated);
    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'customer':
        return {
          title: 'مشتری خانگی دراپینو',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: User,
        };
      case 'vendor':
        return {
          title: 'فروشگاه و کارشناس همکار',
          color: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: Store,
        };
      case 'wholesaler':
        return {
          title: 'بنکدار و تامین‌کننده عمده',
          color: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: Building2,
        };
      case 'admin':
        return {
          title: 'مدیر ارشد سامانه',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: ShieldCheck,
        };
      default:
        return {
          title: 'کاربر دراپینو',
          color: 'bg-stone-100 text-stone-900 border-stone-300',
          icon: User,
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);
  const RoleIcon = roleInfo.icon;

  const userTicketsCount = tickets.filter(
    (t) => t.customerId === currentUser.id || t.customerPhone === currentUser.phone
  ).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className={`bg-white rounded-3xl w-full overflow-hidden shadow-2xl border border-stone-200 text-right animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] transition-all ${
        activeModalTab === 'tickets' ? 'max-w-4xl' : 'max-w-xl'
      }`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-amber-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold text-lg">
              {currentUser.name ? currentUser.name.slice(0, 2) : <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg text-white">
                  پروفایل کاربری {currentUser.name}
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${roleInfo.color} flex items-center gap-1`}>
                  <RoleIcon className="w-3 h-3" />
                  <span>{roleInfo.title}</span>
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                مدیریت نشانی، مشخصات هویتی و ثبت تیکت‌های پشتیبانی یا شکایت از فروشندگان
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="bg-stone-100 border-b border-stone-200 px-5 py-2 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveModalTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeModalTab === 'profile'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <User className="w-4 h-4 text-amber-700" />
            <span>مشخصات و نشانی من</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeModalTab === 'tickets'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-stone-700 hover:bg-stone-200/60'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>تیکت پشتیبانی یا شکایت</span>
            {userTicketsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeModalTab === 'tickets' ? 'bg-white text-amber-900' : 'bg-amber-100 text-amber-900'
              }`}>
                {userTicketsCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 2: Tickets System */}
        {activeModalTab === 'tickets' && (
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-right bg-stone-50/50">
            <SupportTicketSystem
              currentUser={currentUser}
              tickets={tickets}
              vendors={vendors}
              orders={orders}
              onCreateTicket={onCreateTicket || (() => {})}
              onReplyTicket={onReplyTicket || (() => {})}
            />
          </div>
        )}

        {/* Tab 1: Profile Form */}
        {activeModalTab === 'profile' && (
          <>
            {/* Success / Error Message */}
            {isSavedSuccess && (
              <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 shrink-0 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>اطلاعات پروفایل شما با موفقیت ذخیره و در سامانه بروزرسانی شد.</span>
              </div>
            )}

            {errorMessage && (
              <div className="bg-rose-50 border-b border-rose-200 p-3 text-rose-800 text-xs font-semibold shrink-0 animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-right">
          
          {/* Section 1: Contact Information */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-stone-800 font-black text-xs border-b border-stone-200 pb-2">
              <Phone className="w-4 h-4 text-amber-700" />
              <span>۱. اطلاعات هویتی و تماس</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  نام و نام خانوادگی: *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                  />
                  <User className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  شماره تلفن همراه: *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-amber-700"
                  />
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  آدرس ایمیل:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full pl-3 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                  />
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
                </div>
              </div>

              {currentUser.role === 'vendor' && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    شماره تلفن ثابت فروشگاه:
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={landlinePhone}
                    onChange={(e) => setLandlinePhone(e.target.value)}
                    placeholder="۰۲۱-۸۸۸۸۰۰۰۰"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Store Specific Details (For Vendors) */}
          {currentUser.role === 'vendor' && (
            <div className="space-y-3.5 bg-blue-50/50 p-4 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-2 text-blue-950 font-black text-xs border-b border-blue-200 pb-2">
                <Store className="w-4 h-4 text-blue-700" />
                <span>۲. مشخصات صنفی، فروشگاه و شبا بانکی</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    نام رسمی گالری / فروشگاه: *
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    کد ملی مدیر / پروانه کسب:
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={nationalCode}
                    onChange={(e) => setNationalCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  شماره شبای بانکی فروشگاه (در فاکتور مشتری نمایش داده می‌شود):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    dir="ltr"
                    value={shebaNumber}
                    onChange={(e) => setShebaNumber(e.target.value)}
                    placeholder="IR000000000000000000000000"
                    className="w-full pl-3 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-700"
                  />
                  <CreditCard className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
                </div>
              </div>

              {/* Covered Districts Manager */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                  مناطق تحت پوشش جهت اعزام کارشناس و کالیته:
                </label>
                
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newDistrictInput}
                    onChange={(e) => setNewDistrictInput(e.target.value)}
                    placeholder="نام منطقه یا محله جدید (مثلاً: سعادت‌آباد)"
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDistrict();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddDistrict}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {coveredDistricts.map((dist) => (
                    <span
                      key={dist}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200 text-blue-950 rounded-lg text-[11px] font-semibold"
                    >
                      <span>{dist}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDistrict(dist)}
                        className="text-stone-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  معرفی و سوابق گالری (قابل مشاهده در فاکتور مشتری):
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="سوابق، برندهای اختصاصی کالیته و خدمات ویژه..."
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
                />
              </div>

            </div>
          )}

          {/* Section 3: Location and Addresses */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-stone-800 font-black text-xs border-b border-stone-200 pb-2">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>{currentUser.role === 'vendor' ? '۳. نشانی رسمی فروشگاه / کارگاه' : '۲. آدرس و اطلاعات محل نصب پرده'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">شهر:</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700 font-medium"
                >
                  <option value="تهران">تهران</option>
                  <option value="کرج">کرج</option>
                  <option value="اصفهان">اصفهان</option>
                  <option value="مشهد">مشهد</option>
                  <option value="شیراز">شیراز</option>
                  <option value="تبریز">تبریز</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">محله / منطقه:</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="مثلاً: نیاوران"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                نشانی کامل پستی: *
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="خیابان اصلی، کوچه، پلاک، واحد..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">طبقه و زنگ / واحد:</label>
                <input
                  type="text"
                  value={floorAndUnit}
                  onChange={(e) => setFloorAndUnit(e.target.value)}
                  placeholder="طبقه ۴، واحد ۴۰۲"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">کد پستی ۱۰ رقمی:</label>
                <input
                  type="text"
                  dir="ltr"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="۱۹۳۶۵۱۱۴۵۲"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-amber-700"
                />
              </div>
            </div>

            {currentUser.role === 'customer' && (
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  یادداشت پیش‌فرض برای اعزام کارشناس و کالیته:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثلاً: پنجره‌ها قدی هستند، همراه داشتن کالیته‌های طوسی و کتان الزامی است..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
            >
              انصراف
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات پروفایل</span>
            </button>
          </div>

        </form>
          </>
        )}

      </div>
    </div>
  );
};

export const UserProfileModal: React.FC<UserProfileModalProps> = (props) => {
  // بازگشت زودهنگام باید خارج از کامپوننت اصلی باشد تا تعداد hookها بین رندرها ثابت بماند
  if (!props.isOpen || !props.currentUser) return null;
  return <UserProfileModalInner {...props} />;
};
