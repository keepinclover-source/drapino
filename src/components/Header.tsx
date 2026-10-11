import React, { useState, useRef, useEffect } from 'react';
import { UserRole, SiteThemeSettings, CustomPage, UserProfile, CurtainVendor, BlogPost, MasterFabricCatalog } from '../types';
import { 
  Home, 
  Store, 
  ShieldCheck, 
  Calculator, 
  Layers, 
  BookOpen,  
  PlusCircle,
  Menu,
  X,
  Bell,
  Settings2,
  FileText,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  Sparkles,
  LifeBuoy,
  MapPin,
  Building2
} from 'lucide-react';
import { useDeposit } from '../context/DepositContext';
import { HeaderSearch } from './HeaderSearch';
import type { CatalogEntry } from '../utils/catalogStyles';

interface HeaderProps {
  currentRole: UserRole;
  currentUser: UserProfile | null;
  onRoleChange: (role: UserRole) => void;
  onOpenAuthModal: (mode?: 'login' | 'register', role?: UserRole) => void;
  onLogout: () => void;
  onOpenProfileModal: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenBookingModal: () => void;
  onOpenEstimatorModal: () => void;
  pendingBidsCount: number;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenNotificationSettings?: () => void;
  themeSettings?: SiteThemeSettings;
  customPages?: CustomPage[];
  onSelectCustomPage?: (page: CustomPage) => void;
  selectedCity?: string;
  onOpenCityModal?: () => void;
  // جستجوی سراسری
  vendors?: CurtainVendor[];
  catalogEntries?: CatalogEntry[];
  masterCatalogs?: MasterFabricCatalog[];
  blogPosts?: BlogPost[];
  onSelectVendorFromSearch?: (vendor: CurtainVendor) => void;
  onSelectCatalogFromSearch?: (entry: CatalogEntry) => void;
  onSelectBlogFromSearch?: (post: BlogPost) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentUser,
  onRoleChange,
  onOpenAuthModal,
  onLogout,
  onOpenProfileModal,
  activeTab,
  onTabChange,
  onOpenBookingModal,
  onOpenEstimatorModal,
  pendingBidsCount,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenNotificationSettings,
  themeSettings,
  customPages = [],
  onSelectCustomPage,
  selectedCity = 'تهران',
  onOpenCityModal,
  vendors = [],
  catalogEntries = [],
  masterCatalogs = [],
  blogPosts = [],
  onSelectVendorFromSearch,
  onSelectCatalogFromSearch,
  onSelectBlogFromSearch,
}) => {
  const { withDeposit } = useDeposit();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const headerPages = customPages.filter((p) => p.published && p.showInHeaderNav);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'customer':
        return 'مشتری خانگی';
      case 'vendor':
        return 'فروشگاه همکار';
      case 'wholesaler':
        return 'بنکدار و تامین‌کننده';
      case 'admin':
        return 'مدیر سامانه';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* CMS Top Notice Bar */}
      {themeSettings?.showHeaderTopNotice !== false && (
        <div className="bg-stone-900 text-stone-200 text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium border-b border-stone-800 flex items-center justify-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="truncate max-w-xl">
            {withDeposit(themeSettings?.headerTopNotice || 'طرح رسمی پرو و انتخاب کالیته در منزل با نظارت بازرسان اتحادیه | بیعانه {deposit}')}
          </span>
          {themeSettings?.headerPhone && (
            <span className="hidden md:inline font-mono mr-2 text-amber-300 text-[11px]">
              | خط مستقیم: {themeSettings.headerPhone}
            </span>
          )}
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-[96rem] mx-auto px-3 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Zone 1: Brand wordmark & City Selection */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => onTabChange('home')}
            className="group text-right text-stone-900 transition-opacity hover:opacity-90 flex items-center gap-2.5 cursor-pointer"
          >
            {themeSettings?.logoUrl ? (
              <img src={themeSettings.logoUrl} alt={themeSettings?.siteName || 'دراپینو'} data-testid="header-logo" className="h-10 max-w-[10rem] object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {Array.from(themeSettings?.siteName || 'دراپینو')[0]}
              </div>
            )}
            <div className={themeSettings?.logoUrl && themeSettings?.logoShowName === false ? 'hidden' : ''}>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 block leading-tight font-['Vazirmatn']">
                {themeSettings?.siteName || 'دراپینو'}
              </span>
              <span className="hidden sm:block text-[10px] text-amber-800/80 font-medium tracking-wider">
                {themeSettings?.tagline || 'بازار پرده در خانه شما'}
              </span>
            </div>
          </button>

          {/* City Selector Button in Header */}
          {onOpenCityModal && (
            <button
              type="button"
              onClick={onOpenCityModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/90 border border-amber-200/90 text-amber-950 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
              title="انتخاب شهر برای مشاهده برترین فروشگاه‌های منطقه شما"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition-transform" />
              <span>شهر:</span>
              <span className="text-amber-800 underline decoration-amber-300 font-black">{selectedCity}</span>
            </button>
          )}
        </div>

        {/* جستجوی سراسری هدر */}
        <div className="hidden md:block flex-1 max-w-md mx-2 lg:mx-4 min-w-0">
          <HeaderSearch
            vendors={vendors}
            catalogEntries={catalogEntries}
            masterCatalogs={masterCatalogs}
            blogPosts={blogPosts}
            onSelectVendor={onSelectVendorFromSearch}
            onSelectCatalog={onSelectCatalogFromSearch}
            onSelectBlog={onSelectBlogFromSearch}
            onNavigateTab={onTabChange}
          />
        </div>

        {/* Zone 2: Role-Aware Navigation Links */}
        <nav className="hidden 2xl:flex items-center gap-4 2xl:gap-5 text-sm font-medium text-stone-600">
          <button
            onClick={() => onTabChange('home')}
            className={`transition-colors whitespace-nowrap pb-1 cursor-pointer ${
              activeTab === 'home'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-700'
                : 'hover:text-stone-950'
            }`}
          >
            صفحه نخست
          </button>

          {/* Customer Portal Link: Visible if Customer, Admin, or prompt login */}
          {(currentUser?.role === 'customer' || currentUser?.role === 'admin' || !currentUser) && (
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuthModal('login', 'customer');
                } else {
                  onTabChange('customer-portal');
                }
              }}
              className={`transition-colors whitespace-nowrap pb-1 cursor-pointer ${
                activeTab === 'customer-portal'
                  ? 'text-amber-800 font-semibold border-b-2 border-amber-700'
                  : 'hover:text-stone-950'
              }`}
            >
              {currentUser?.role === 'customer' ? 'سفارشات من' : 'پیگیری سفارشات مشتری'}
            </button>
          )}

          {/* Vendor Portal Link: Visible if Vendor, Admin, or prompt vendor landing */}
          {(currentUser?.role === 'vendor' || currentUser?.role === 'admin' || !currentUser) && (
            <button
              onClick={() => {
                if (!currentUser) {
                  onTabChange('vendor-landing');
                } else {
                  onTabChange('vendor-portal');
                }
              }}
              className={`transition-colors whitespace-nowrap pb-1 relative cursor-pointer ${
                activeTab === 'vendor-portal' || activeTab === 'vendor-landing'
                  ? 'text-amber-800 font-semibold border-b-2 border-amber-700'
                  : 'hover:text-stone-950'
              }`}
            >
              <span>{currentUser?.role === 'vendor' ? 'کارتابل همکار (شکار سفارش)' : 'همکاری فروشگاه‌ها'}</span>
              {pendingBidsCount > 0 && currentUser?.role === 'vendor' && (
                <span className="mr-1.5 inline-flex items-center justify-center text-[11px] font-bold text-white bg-amber-700 rounded-full w-4.5 h-4.5 tabular-nums">
                  {pendingBidsCount}
                </span>
              )}
            </button>
          )}

          {/* Wholesaler Portal Link: Visible if Wholesaler, Admin, or prompt wholesaler landing */}
          {(currentUser?.role === 'wholesaler' || currentUser?.role === 'admin' || !currentUser) && (
            <button
              onClick={() => {
                if (!currentUser) {
                  onTabChange('wholesaler-landing');
                } else {
                  onTabChange('wholesaler-portal');
                }
              }}
              className={`transition-colors whitespace-nowrap pb-1 relative cursor-pointer ${
                activeTab === 'wholesaler-portal' || activeTab === 'wholesaler-landing'
                  ? 'text-amber-800 font-semibold border-b-2 border-amber-700'
                  : 'hover:text-stone-950'
              }`}
            >
              <span>{currentUser?.role === 'wholesaler' ? 'کارتابل بنکدار' : 'همکاری بنکداران'}</span>
            </button>
          )}

          {/* Admin Portal Link: Visible only if Admin */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onTabChange('admin-portal')}
              className={`transition-colors whitespace-nowrap pb-1 cursor-pointer ${
                activeTab === 'admin-portal'
                  ? 'text-amber-800 font-semibold border-b-2 border-amber-700'
                  : 'hover:text-stone-950'
              }`}
            >
              پنل مدیریت و ویرایشگر
            </button>
          )}

          <button
            onClick={onOpenEstimatorModal}
            className="hover:text-stone-950 transition-colors whitespace-nowrap flex items-center gap-1.5 text-stone-700 cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-amber-700" />
            <span>استعلام قیمت هوشمند</span>
          </button>

          <button
            onClick={() => onTabChange('catalog')}
            className={`transition-colors whitespace-nowrap pb-1 cursor-pointer ${
              activeTab === 'catalog'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-700'
                : 'hover:text-stone-950'
            }`}
          >
            کالیته و سبک‌ها
          </button>

          <button
            onClick={() => onTabChange('blog')}
            className={`transition-colors whitespace-nowrap pb-1 cursor-pointer ${
              activeTab === 'blog'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-700'
                : 'hover:text-stone-950'
            }`}
          >
            وبلاگ
          </button>

          {/* Dynamic Header Pages */}
          {headerPages.slice(0, 2).map((page) => (
            <button
              key={page.id}
              onClick={() => onSelectCustomPage ? onSelectCustomPage(page) : onTabChange(`page-${page.slug}`)}
              className={`transition-colors whitespace-nowrap pb-1 text-xs px-2 py-0.5 rounded-lg border cursor-pointer ${
                activeTab === `page-${page.slug}`
                  ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                  : 'text-stone-600 hover:text-stone-900 border-stone-200'
              }`}
            >
              {page.title.split(' ')[0]} {page.title.split(' ')[1] || ''}
            </button>
          ))}
        </nav>

        {/* Zone 3: User Auth / Profile Badge & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* USER ACCOUNT BADGE / DROPDOWN */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-1.5 sm:px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200/80 rounded-xl border border-stone-200 transition-colors text-right cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-700 text-white font-bold text-xs flex items-center justify-center">
                  {currentUser.name ? currentUser.name.slice(0, 1) : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden sm:block text-right">
                  <span className="block text-xs font-bold text-stone-900 leading-tight">
                    {currentUser.role === 'vendor' ? (currentUser.storeName || currentUser.name) : currentUser.name}
                  </span>
                  <span className="block text-[10px] text-amber-800 font-medium leading-none">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
                <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-stone-500" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 text-xs text-right animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2.5 border-b border-stone-100 mb-1">
                    <span className="font-bold text-stone-900 block text-sm">
                      {currentUser.name}
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono block">
                      {currentUser.phone}
                    </span>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                      نقش: {getRoleLabel(currentUser.role)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenProfileModal();
                    }}
                    className="w-full text-right px-3 py-2 text-stone-700 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-amber-700" />
                    <span>ویرایش پروفایل و نشانی</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (currentUser.role === 'customer') onTabChange('customer-portal');
                      if (currentUser.role === 'vendor') onTabChange('vendor-portal');
                      if (currentUser.role === 'wholesaler') onTabChange('wholesaler-portal');
                      if (currentUser.role === 'admin') onTabChange('admin-portal');
                    }}
                    className="w-full text-right px-3 py-2 text-stone-700 hover:bg-stone-50 rounded-xl flex items-center gap-2 font-medium cursor-pointer"
                  >
                    {currentUser.role === 'customer' && <Layers className="w-4 h-4 text-amber-700" />}
                    {currentUser.role === 'vendor' && <Store className="w-4 h-4 text-blue-700" />}
                    {currentUser.role === 'wholesaler' && <Building2 className="w-4 h-4 text-purple-700" />}
                    {currentUser.role === 'admin' && <ShieldCheck className="w-4 h-4 text-emerald-700" />}
                    <span>رفتن به داشبورد اختصاصی</span>
                  </button>

                  {currentUser.role === 'customer' && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onTabChange('customer-portal');
                      }}
                      className="w-full text-right px-3 py-2 text-stone-700 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <LifeBuoy className="w-4 h-4 text-amber-700" />
                      <span>پیگیری تیکت‌ها و شکایات</span>
                    </button>
                  )}

                  {/* Fast role switcher for demo convenience */}
                  <div className="pt-2 mt-1 border-t border-stone-100">
                    <span className="text-[10px] text-stone-400 px-3 block mb-1">جابجایی حساب (دمو):</span>
                    <div className="grid grid-cols-4 gap-1 px-1">
                      <button
                        onClick={() => {
                          onRoleChange('customer');
                          setUserDropdownOpen(false);
                        }}
                        className={`py-1 text-[10px] rounded-lg text-center font-bold ${
                          currentUser.role === 'customer' ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        مشتری
                      </button>
                      <button
                        onClick={() => {
                          onRoleChange('vendor');
                          setUserDropdownOpen(false);
                        }}
                        className={`py-1 text-[10px] rounded-lg text-center font-bold ${
                          currentUser.role === 'vendor' ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        فروشگاه
                      </button>
                      <button
                        onClick={() => {
                          onRoleChange('wholesaler');
                          setUserDropdownOpen(false);
                        }}
                        className={`py-1 text-[10px] rounded-lg text-center font-bold ${
                          currentUser.role === 'wholesaler' ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        بنکدار
                      </button>
                      <button
                        onClick={() => {
                          onRoleChange('admin');
                          setUserDropdownOpen(false);
                        }}
                        className={`py-1 text-[10px] rounded-lg text-center font-bold ${
                          currentUser.role === 'admin' ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        مدیر
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-stone-100">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-right px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>خروج از حساب کاربری</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* GUEST MODE: single combined Login / Register button */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shadow-xs cursor-pointer"
                title="ورود یا عضویت در سامانه"
              >
                <LogIn className="w-4 h-4" />
                <span>ورود / عضویت</span>
              </button>
            </div>
          )}

          {/* Notification Bell Button */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              title="اعلان‌ها و پیام‌ها"
              className="relative p-2 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200 flex items-center justify-center cursor-pointer"
              aria-label="مرکز اعلان‌ها"
            >
              <Bell className="w-4 h-4 text-stone-700 hover:text-amber-800" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadNotificationsCount > 9 ? '+۹' : unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Primary Action Button: Book home visit */}
          <button
            onClick={onOpenBookingModal}
            aria-label={themeSettings?.headerCtaText || 'رزرو مشاوره در خانه'}
            className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors shadow-sm whitespace-nowrap active:scale-[0.98] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{themeSettings?.headerCtaText || 'رزرو مشاوره در خانه'}</span>
          </button>

          {/* Hamburger button for mobile navigation */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="2xl:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
            aria-label="منو"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="2xl:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-in fade-in duration-150">
          
          {/* جستجو در منوی موبایل */}
          <div className="mb-1 md:hidden">
            <HeaderSearch
              compact
              vendors={vendors}
              catalogEntries={catalogEntries}
              masterCatalogs={masterCatalogs}
              blogPosts={blogPosts}
              onSelectVendor={(v) => {
                setMobileMenuOpen(false);
                onSelectVendorFromSearch?.(v);
              }}
              onSelectCatalog={(c) => {
                setMobileMenuOpen(false);
                onSelectCatalogFromSearch?.(c);
              }}
              onSelectBlog={(b) => {
                setMobileMenuOpen(false);
                onSelectBlogFromSearch?.(b);
              }}
              onNavigateTab={(tab) => {
                setMobileMenuOpen(false);
                onTabChange(tab);
              }}
            />
          </div>

          {/* User Profile in Mobile Drawer */}
          {currentUser ? (
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-700 text-white font-bold text-xs flex items-center justify-center">
                  {currentUser.name ? currentUser.name.slice(0, 1) : <User className="w-4 h-4" />}
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-900">{currentUser.name}</span>
                  <span className="block text-[10px] text-amber-800 font-semibold">{getRoleLabel(currentUser.role)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfileModal();
                  }}
                  className="px-2.5 py-1 bg-white border border-stone-300 text-stone-700 rounded-lg text-xs font-semibold"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="p-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs"
                  title="خروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl mb-2 space-y-2">
              <span className="text-xs text-amber-950 font-bold block text-right">وارد حساب کاربری نشده‌اید:</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal('login');
                }}
                className="w-full py-2 bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs text-center"
              >
                ورود / عضویت
              </button>
            </div>
          )}

          {/* Mobile City Selector */}
          {onOpenCityModal && (
            <div className="py-2.5 px-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-950">شهر انتخابی شما:</span>
                <span className="text-xs font-black text-amber-900 underline decoration-amber-400">{selectedCity}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCityModal();
                }}
                className="px-2.5 py-1 bg-amber-800 text-white rounded-lg text-[11px] font-bold shadow-2xs"
              >
                تغییر شهر
              </button>
            </div>
          )}

          {/* Role switcher for quick mobile testing */}
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <span className="text-xs text-stone-500 font-medium">نقش نمایشی:</span>
            <div className="grid grid-cols-4 gap-1 text-xs">
              <button
                onClick={() => {
                  onRoleChange('customer');
                  onTabChange('customer-portal');
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-1 rounded text-center ${currentRole === 'customer' ? 'bg-amber-700 text-white font-bold' : 'bg-stone-100'}`}
              >
                مشتری
              </button>
              <button
                onClick={() => {
                  onRoleChange('vendor');
                  onTabChange('vendor-portal');
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-1 rounded text-center ${currentRole === 'vendor' ? 'bg-amber-700 text-white font-bold' : 'bg-stone-100'}`}
              >
                فروشگاه
              </button>
              <button
                onClick={() => {
                  onRoleChange('wholesaler');
                  onTabChange('wholesaler-portal');
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-1 rounded text-center ${currentRole === 'wholesaler' ? 'bg-amber-700 text-white font-bold' : 'bg-stone-100'}`}
              >
                بنکدار
              </button>
              <button
                onClick={() => {
                  onRoleChange('admin');
                  onTabChange('admin-portal');
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-1 rounded text-center ${currentRole === 'admin' ? 'bg-amber-700 text-white font-bold' : 'bg-stone-100'}`}
              >
                مدیریت
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              onTabChange('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right py-2 text-sm font-medium text-stone-700 hover:text-amber-800"
          >
            صفحه نخست
          </button>
          
          {(currentRole === 'customer' || currentRole === 'admin') && (
            <button
              onClick={() => {
                onTabChange('customer-portal');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right py-2 text-sm font-medium text-stone-700 hover:text-amber-800"
            >
              پیگیری سفارشات مشتری
            </button>
          )}

          {(currentRole === 'vendor' || currentRole === 'admin') && (
            <button
              onClick={() => {
                onTabChange('vendor-portal');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right py-2 text-sm font-medium text-stone-700 hover:text-amber-800 flex items-center justify-between"
            >
              <span>شکار سفارشات (فروشگاه‌ها)</span>
              {pendingBidsCount > 0 && (
                <span className="text-xs bg-amber-700 text-white px-2 py-0.5 rounded-full">
                  {pendingBidsCount} جدید
                </span>
              )}
            </button>
          )}

          {currentRole === 'admin' && (
            <button
              onClick={() => {
                onTabChange('admin-portal');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right py-2 text-sm font-medium text-stone-700 hover:text-amber-800"
            >
              پنل مدیریت ارشد
            </button>
          )}

          <button
            onClick={() => {
              onOpenEstimatorModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-right py-2 text-sm font-medium text-stone-700 hover:text-amber-800"
          >
            استعلام قیمت هوشمند
          </button>
          <button
            onClick={() => {
              onTabChange('catalog');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right py-2 text-sm font-medium text-stone-700 hover:text-amber-800"
          >
            کاتالوگ سبک‌ها و کالیته‌ها
          </button>
          <button
            onClick={() => {
              onTabChange('blog');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right py-2 text-sm font-medium text-stone-700 hover:text-amber-800"
          >
            وبلاگ و مقالات تخصصی
          </button>
          <button
            onClick={() => {
              onTabChange('feedback');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right py-2 text-sm font-medium text-stone-700 hover:text-amber-800"
          >
            پیشنهاد و گزارش ایراد
          </button>

          {/* Mobile Notifications Buttons */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
            {onOpenNotifications && (
              <button
                onClick={() => {
                  onOpenNotifications();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 bg-amber-50 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-amber-200"
              >
                <Bell className="w-4 h-4 text-amber-700" />
                <span>اعلان‌ها و پیام‌ها</span>
                {unreadNotificationsCount > 0 && (
                  <span className="bg-amber-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {onOpenNotificationSettings && (
              <button
                onClick={() => {
                  onOpenNotificationSettings();
                  setMobileMenuOpen(false);
                }}
                className="p-2 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                title="شخصی‌سازی اعلان‌ها"
                aria-label="تنظیمات نوتیفیکیشن"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
