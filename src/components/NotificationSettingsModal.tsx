import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { 
  X, 
  Settings2, 
  Volume2, 
  Bell, 
  Globe, 
  Smartphone, 
  Moon, 
  RotateCcw, 
  Sparkles, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  MessageSquare,
  Check
} from 'lucide-react';
import { playNotificationSound } from '../utils/sound';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    preferences, 
    updatePreferences, 
    requestBrowserPushPermission, 
    browserPermission,
    addNotification 
  } = useNotifications();

  const [savedSuccess, setSavedSuccess] = React.useState(false);

  if (!isOpen) return null;

  const handleToggleCategory = (categoryKey: keyof typeof preferences.categories) => {
    updatePreferences({
      categories: {
        ...preferences.categories,
        [categoryKey]: !preferences.categories[categoryKey],
      },
    });
  };

  const handleTestSound = () => {
    playNotificationSound();
  };

  const handleTestNotification = () => {
    addNotification({
      type: 'special_offer',
      title: 'تست موفق تنظیمات نوتیفیکیشن',
      message: 'تنظیمات شخصی‌سازی نوتیفیکیشن شما با موفقیت فعال و ذخیره شد.',
      targetRole: 'all',
      actionLabel: 'متوجه شدم',
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    updatePreferences({
      enableSound: true,
      enableInAppToast: true,
      enableSmsSimulation: true,
      categories: {
        new_request: true,
        order_assigned: true,
        order_approved: true,
        new_message: true,
        special_offer: true,
      },
      quietHours: {
        enabled: false,
        startTime: '23:00',
        endTime: '08:00',
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-settings-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="notification-settings-title" className="text-base sm:text-lg font-bold text-stone-900">
                شخصی‌سازی اعلان‌ها و نوتیفیکیشن
              </h3>
              <p className="text-xs text-stone-500">
                انتخاب رویدادهای مورد نظر و نحوه دریافت پیام‌ها
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
            aria-label="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Categories to trigger */}
          <div>
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-700" />
              <span>دسته‌بندی اعلان‌های فعال</span>
            </h4>

            <div className="space-y-2.5">
              {/* 1. New request */}
              <label className="flex items-start justify-between p-3 rounded-xl border border-stone-200 hover:border-amber-200 hover:bg-amber-50/30 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800 mt-0.5">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-900 block">
                      ثبت درخواست جدید مشتری
                    </span>
                    <span className="text-xs text-stone-500 block leading-relaxed">
                      اعلان آنی هنگام ثبت سفارش جدید در تابلوی مزایده فروشگاه‌ها
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.categories.new_request}
                  onChange={() => handleToggleCategory('new_request')}
                  className="mt-1 h-5 w-5 rounded border-stone-300 text-amber-700 focus:ring-amber-600 cursor-pointer accent-amber-700"
                />
              </label>

              {/* 2. Order assigned */}
              <label className="flex items-start justify-between p-3 rounded-xl border border-stone-200 hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-800 mt-0.5">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-900 block">
                      ارجاع سفارش به فروشنده و اعزام
                    </span>
                    <span className="text-xs text-stone-500 block leading-relaxed">
                      اطلاع‌رسانی زمان انتخاب سفارش توسط فروشگاه و زمان‌بندی مراجعه کارشناس
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.categories.order_assigned}
                  onChange={() => handleToggleCategory('order_assigned')}
                  className="mt-1 h-5 w-5 rounded border-stone-300 text-amber-700 focus:ring-amber-600 cursor-pointer accent-amber-700"
                />
              </label>

              {/* 3. Order approved */}
              <label className="flex items-start justify-between p-3 rounded-xl border border-stone-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-900 block">
                      تایید نهایی سفارش توسط مشتری
                    </span>
                    <span className="text-xs text-stone-500 block leading-relaxed">
                      اعلان تایید فاکتور رسمی، کسر بیعانه و شروع مرحله برش و دوخت
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.categories.order_approved}
                  onChange={() => handleToggleCategory('order_approved')}
                  className="mt-1 h-5 w-5 rounded border-stone-300 text-amber-700 focus:ring-amber-600 cursor-pointer accent-amber-700"
                />
              </label>

              {/* 4. New message */}
              <label className="flex items-start justify-between p-3 rounded-xl border border-stone-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-900 block">
                      پیام‌های جدید بین مشتری و فروشنده
                    </span>
                    <span className="text-xs text-stone-500 block leading-relaxed">
                      هماهنگی کالیته‌های پارچه، ساعت حضور و سوالات سفارش
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.categories.new_message}
                  onChange={() => handleToggleCategory('new_message')}
                  className="mt-1 h-5 w-5 rounded border-stone-300 text-amber-700 focus:ring-amber-600 cursor-pointer accent-amber-700"
                />
              </label>

              {/* 5. Special offer */}
              <label className="flex items-start justify-between p-3 rounded-xl border border-stone-200 hover:border-rose-200 hover:bg-rose-50/30 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-800 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-900 block">
                      اعلام پیشنهادات ویژه و تخفیف‌ها
                    </span>
                    <span className="text-xs text-stone-500 block leading-relaxed">
                      جشنواره‌های فصلی کالیته، کدهای تخفیف دوخت و هدایای اختصاصی
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.categories.special_offer}
                  onChange={() => handleToggleCategory('special_offer')}
                  className="mt-1 h-5 w-5 rounded border-stone-300 text-amber-700 focus:ring-amber-600 cursor-pointer accent-amber-700"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Channels & Sound */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              کانال‌ها و نحوه نمایش
            </h4>

            <div className="space-y-3">
              {/* Sound */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                    <Volume2 className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-stone-900 block">
                      پخش صدای زنگ اعلان
                    </span>
                    <span className="text-xs text-stone-500 block">
                      صدای زنگ ملایم دراپینو هنگام رویداد جدید
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestSound}
                    type="button"
                    className="text-[11px] font-semibold text-amber-800 bg-white border border-amber-300 hover:bg-amber-50 px-2.5 py-1 rounded-md transition-colors"
                  >
                    تست صدا
                  </button>
                  <input
                    type="checkbox"
                    checked={preferences.enableSound}
                    onChange={() => updatePreferences({ enableSound: !preferences.enableSound })}
                    className="h-5 w-5 rounded border-stone-300 text-amber-700 accent-amber-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* In-app Toast banner */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                    <Bell className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-stone-900 block">
                      بنرهای شناور درون برنامه (In-App Toast)
                    </span>
                    <span className="text-xs text-stone-500 block">
                      نمایش پنجره متحرک با دسترسی سریع در گوشه تصویر
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.enableInAppToast}
                  onChange={() => updatePreferences({ enableInAppToast: !preferences.enableInAppToast })}
                  className="h-5 w-5 rounded border-stone-300 text-amber-700 accent-amber-700 cursor-pointer"
                />
              </div>

              {/* Browser Push Notifications */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-stone-900 block">
                        وب‌پوش و اعلان‌های مرورگر (Web Push)
                      </span>
                      <span className="text-xs text-stone-500 block">
                        دریافت اعلان حتی در صورت مینیمایز بودن تب مرورگر
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.enableBrowserPush}
                    disabled={browserPermission === 'denied'}
                    onChange={() => {
                      if (!preferences.enableBrowserPush && browserPermission !== 'granted') {
                        requestBrowserPushPermission();
                      } else {
                        updatePreferences({ enableBrowserPush: !preferences.enableBrowserPush });
                      }
                    }}
                    className="h-5 w-5 rounded border-stone-300 text-amber-700 accent-amber-700 cursor-pointer disabled:opacity-50"
                  />
                </div>

                {browserPermission !== 'granted' && (
                  <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs">
                    <span className="text-stone-500">
                      {browserPermission === 'denied' 
                        ? 'دسترسی در تنظیمات مرورگر مسدود شده است.' 
                        : 'نیاز به اجازه دسترسی مرورگر دارد:'}
                    </span>
                    {browserPermission !== 'denied' && (
                      <button
                        onClick={requestBrowserPushPermission}
                        className="text-amber-800 font-bold hover:underline"
                      >
                        درخواست مجوز مرورگر
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Simulated SMS Alerts */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-stone-900 block">
                      پیامک اطلاع‌رسانی (شبیه‌ساز SMS)
                    </span>
                    <span className="text-xs text-stone-500 block">
                      ارسال پیامک تایید کد رهگیری به شماره همراه کاربر
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.enableSmsSimulation}
                  onChange={() => updatePreferences({ enableSmsSimulation: !preferences.enableSmsSimulation })}
                  className="h-5 w-5 rounded border-stone-300 text-amber-700 accent-amber-700 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Quiet Hours */}
          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  حالت سکوت و ساعات آرامش (Do Not Disturb)
                </h4>
              </div>
              <input
                type="checkbox"
                checked={preferences.quietHours.enabled}
                onChange={() => updatePreferences({
                  quietHours: {
                    ...preferences.quietHours,
                    enabled: !preferences.quietHours.enabled,
                  }
                })}
                className="h-5 w-5 rounded border-stone-300 text-amber-700 accent-amber-700 cursor-pointer"
              />
            </div>

            {preferences.quietHours.enabled && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-4 text-xs">
                <span className="text-stone-600 font-medium">ساعات سکوت (قطع صدا و بنرها):</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500">از</span>
                    <input
                      type="time"
                      value={preferences.quietHours.startTime}
                      onChange={(e) => updatePreferences({
                        quietHours: { ...preferences.quietHours, startTime: e.target.value }
                      })}
                      className="px-2 py-1 bg-white border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500">تا</span>
                    <input
                      type="time"
                      value={preferences.quietHours.endTime}
                      onChange={(e) => updatePreferences({
                        quietHours: { ...preferences.quietHours, endTime: e.target.value }
                      })}
                      className="px-2 py-1 bg-white border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/70 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازگردانی به پیش‌فرض</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestNotification}
              className="px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 flex items-center gap-1"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تست ارسال شد!</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>تست یک اعلان نمونه</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors shadow-xs"
            >
              تایید و ذخیره تنظیمات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
