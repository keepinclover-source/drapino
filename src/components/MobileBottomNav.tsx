import React from 'react';
import { Home, ClipboardList, Flame, Calculator, User, LogIn, UserCheck, ShieldCheck, Store } from 'lucide-react';
import { UserRole, UserProfile } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingBidsCount: number;
  currentRole: UserRole;
  currentUser: UserProfile | null;
  onOpenProfileModal: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingBidsCount,
  currentRole,
  currentUser,
  onOpenProfileModal,
  onOpenAuthModal,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 py-1.5 px-3 md:hidden shadow-lg">
      <div className="flex items-center justify-around">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-amber-800 font-bold' : 'text-stone-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>خانه</span>
        </button>

        {/* Tab 2: Role-based or Guest-based primary action */}
        {currentUser?.role === 'customer' && (
          <button
            onClick={() => onTabChange('customer-portal')}
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'customer-portal' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>سفارشات من</span>
          </button>
        )}

        {currentUser?.role === 'vendor' && (
          <button
            onClick={() => onTabChange('vendor-portal')}
            className={`relative flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'vendor-portal' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <div className="relative">
              <Flame className="w-5 h-5" />
              {pendingBidsCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-700 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {pendingBidsCount}
                </span>
              )}
            </div>
            <span>شکار سفارش</span>
          </button>
        )}

        {currentUser?.role === 'admin' && (
          <>
            <button
              onClick={() => onTabChange('vendor-portal')}
              className={`relative flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
                activeTab === 'vendor-portal' ? 'text-amber-800 font-bold' : 'text-stone-500'
              }`}
            >
              <Flame className="w-5 h-5" />
              <span>تابلو سفارشات</span>
            </button>

            <button
              onClick={() => onTabChange('admin-portal')}
              className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
                activeTab === 'admin-portal' ? 'text-amber-800 font-bold' : 'text-stone-500'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>مدیریت ارشد</span>
            </button>
          </>
        )}

        {!currentUser && (
          <button
            onClick={() => onTabChange('customer-portal')}
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'customer-portal' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>پیگیری سفارش</span>
          </button>
        )}

        {/* Tab 3: Catalogs */}
        <button
          onClick={() => onTabChange('catalog')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
            activeTab === 'catalog' ? 'text-amber-800 font-bold' : 'text-stone-500'
          }`}
        >
          <Calculator className="w-5 h-5" />
          <span>کالیته‌ها</span>
        </button>

        {/* Tab 4: Profile or Login */}
        {currentUser ? (
          <button
            onClick={onOpenProfileModal}
            className="flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors text-stone-600 hover:text-amber-800 cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center">
              {currentUser.name ? currentUser.name.slice(0, 1) : <User className="w-3.5 h-3.5" />}
            </div>
            <span>پروفایل من</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenAuthModal('login')}
            className="flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors text-amber-800 font-bold cursor-pointer"
          >
            <LogIn className="w-5 h-5 text-amber-700" />
            <span>ورود / عضویت</span>
          </button>
        )}

      </div>
    </div>
  );
};
