import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { NotificationType, AppNotification } from '../types';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  Settings2, 
  Sparkles, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  MessageSquare, 
  ExternalLink,
  ChevronLeft,
  Zap,
  Filter
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onNavigate: (tab: string, orderId?: string) => void;
  onOpenChatForOrder?: (orderId: string) => void;
}

type FilterTab = 'all' | 'unread' | 'orders' | 'messages' | 'offers';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onNavigate,
  onOpenChatForOrder,
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications,
    triggerSpecialOffer,
    addNotification,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'unread') return !notif.isRead;
    if (activeFilter === 'orders') {
      return ['new_request', 'order_assigned', 'order_approved'].includes(notif.type);
    }
    if (activeFilter === 'messages') return notif.type === 'new_message';
    if (activeFilter === 'offers') return notif.type === 'special_offer';
    return true;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'new_request':
        return <ShoppingBag className="w-4 h-4 text-amber-700" />;
      case 'order_assigned':
        return <Truck className="w-4 h-4 text-blue-700" />;
      case 'order_approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-700" />;
      case 'new_message':
        return <MessageSquare className="w-4 h-4 text-indigo-700" />;
      case 'special_offer':
        return <Sparkles className="w-4 h-4 text-rose-700" />;
      default:
        return <Bell className="w-4 h-4 text-amber-700" />;
    }
  };

  const getTag = (type: NotificationType) => {
    switch (type) {
      case 'new_request':
        return { label: 'درخواست جدید', bg: 'bg-amber-100 text-amber-800' };
      case 'order_assigned':
        return { label: 'ارجاع سفارش', bg: 'bg-blue-100 text-blue-800' };
      case 'order_approved':
        return { label: 'تایید سفارش', bg: 'bg-emerald-100 text-emerald-800' };
      case 'new_message':
        return { label: 'پیام چت', bg: 'bg-indigo-100 text-indigo-800' };
      case 'special_offer':
        return { label: 'پیشنهاد ویژه', bg: 'bg-rose-100 text-rose-800' };
      default:
        return { label: 'اعلان', bg: 'bg-stone-100 text-stone-800' };
    }
  };

  const handleNotificationClick = (item: AppNotification) => {
    markAsRead(item.id);
    if (item.type === 'new_message' && item.orderId && onOpenChatForOrder) {
      onOpenChatForOrder(item.orderId);
      onClose();
      return;
    }
    if (item.linkTab) {
      onNavigate(item.linkTab, item.orderId);
      onClose();
    }
  };

  // Quick triggers for testing requested categories
  const handleTriggerTestRequest = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    addNotification({
      type: 'new_request',
      title: 'سفارش جدید آماده شکار در مزایده',
      message: `مشتری جدید در محله یوسف‌آباد درخواست بازدید و مشاوره با ۳ پنجره ثبت کرد (کد AP-${randomCode}).`,
      targetRole: 'vendor',
      orderNumber: `AP-${randomCode}`,
      linkTab: 'vendor-portal',
      actionLabel: 'شکار در مزایده',
    });
  };

  const handleTriggerTestAssignment = () => {
    addNotification({
      type: 'order_assigned',
      title: 'ارجاع سفارش به فروشگاه برنده',
      message: 'فروشگاه «آتلیه پارچه و پرده هورام» سفارش شما را انتخاب کرد و کارشناس تا ساعت ۱۶ مراجعه خواهد کرد.',
      targetRole: 'customer',
      orderNumber: 'AP-9281',
      linkTab: 'customer-portal',
      actionLabel: 'پیگیری سفارش',
    });
  };

  const handleTriggerTestApproval = () => {
    addNotification({
      type: 'order_approved',
      title: 'تایید نهایی فاکتور توسط مشتری',
      message: 'فاکتور ۲۹,۶۰۰,۰۰۰ تومانی با کسر بیعانه تایید شد. مرحله برش و دوخت کارگاهی آغاز شد.',
      targetRole: 'vendor',
      orderNumber: 'AP-9281',
      linkTab: 'vendor-portal',
      actionLabel: 'مشاهده فاکتور نهایی',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-center-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center relative shadow-xs">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 id="notification-center-title" className="text-base font-bold text-stone-900">
                مرکز اعلان‌ها و پیام‌ها
              </h3>
              <p className="text-xs text-stone-500">
                {unreadCount > 0 ? `${unreadCount} اعلان خوانده‌نشده` : 'تمام اعلان‌ها خوانده شده است'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSettings}
              title="تنظیمات و شخصی‌سازی اعلان‌ها"
              className="p-2 text-stone-600 hover:text-amber-800 hover:bg-stone-200/60 rounded-lg transition-colors"
              aria-label="تنظیمات اعلان"
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
              aria-label="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action controls */}
        <div className="px-4 py-2.5 border-b border-stone-200 bg-white flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-stone-600 hover:text-amber-800 font-semibold disabled:opacity-40 flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>خواندن همه</span>
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
              className="text-stone-400 hover:text-rose-600 font-medium disabled:opacity-30 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاکسازی همه</span>
            </button>
          </div>

          <button
            onClick={onOpenSettings}
            className="text-amber-800 hover:underline font-medium text-[11px]"
          >
            شخصی‌سازی فیلترها
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2 border-b border-stone-200 bg-stone-50/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            همه ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'unread'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            خوانده نشده ({unreadCount})
          </button>
          <button
            onClick={() => setActiveFilter('orders')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'orders'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            سفارشات
          </button>
          <button
            onClick={() => setActiveFilter('messages')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'messages'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            چت و پیام‌ها
          </button>
          <button
            onClick={() => setActiveFilter('offers')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'offers'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            پیشنهاد ویژه
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
              <Bell className="w-12 h-12 text-stone-300 mb-3 stroke-1" />
              <p className="text-sm font-bold text-stone-700">اعلان فعالی در این بخش نیست</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                رویدادهای جدید شامل درخواست‌ها، ارجاع، تایید سفارش، پیام‌ها و تخفیف‌ها در اینجا قرار می‌گیرند.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const tag = getTag(item.type);
              return (
                <div
                  key={item.id}
                  className={`group relative p-3.5 rounded-xl border transition-all ${
                    item.isRead
                      ? 'bg-white border-stone-200/80 hover:border-stone-300'
                      : 'bg-amber-50/40 border-amber-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-stone-100 border border-stone-200 shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tag.bg}`}>
                            {tag.label}
                          </span>
                          {item.orderNumber && (
                            <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                              {item.orderNumber}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {item.timestamp}
                        </span>
                      </div>

                      <h4 className={`text-xs sm:text-sm font-bold text-stone-900 leading-snug mb-1 ${!item.isRead ? 'text-amber-950' : ''}`}>
                        {item.title}
                      </h4>

                      <p className="text-xs text-stone-600 leading-relaxed mb-2.5">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                        <button
                          onClick={() => handleNotificationClick(item)}
                          className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 hover:underline"
                        >
                          <span>{item.actionLabel || 'مشاهده جزئیات'}</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-2">
                          {!item.isRead && (
                            <button
                              onClick={() => markAsRead(item.id)}
                              className="text-[11px] text-stone-500 hover:text-stone-800 hover:underline"
                            >
                              علامت به عنوان خوانده شده
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(item.id)}
                            className="text-stone-400 hover:text-rose-600 p-1 rounded hover:bg-stone-100 transition-colors"
                            title="حذف این اعلان"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Test / Trigger Bar */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>تست و شبیه‌سازی نوتیفیکیشن‌های درخواستی:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={handleTriggerTestRequest}
              className="px-2 py-1.5 bg-white hover:bg-amber-50 border border-stone-200 rounded-lg text-stone-700 hover:text-amber-900 text-[11px] font-medium text-right flex items-center gap-1 transition-colors"
            >
              <ShoppingBag className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">۱. ثبت درخواست جدید</span>
            </button>

            <button
              onClick={handleTriggerTestAssignment}
              className="px-2 py-1.5 bg-white hover:bg-blue-50 border border-stone-200 rounded-lg text-stone-700 hover:text-blue-900 text-[11px] font-medium text-right flex items-center gap-1 transition-colors"
            >
              <Truck className="w-3 h-3 text-blue-600 shrink-0" />
              <span className="truncate">۲. ارجاع به فروشگاه</span>
            </button>

            <button
              onClick={handleTriggerTestApproval}
              className="px-2 py-1.5 bg-white hover:bg-emerald-50 border border-stone-200 rounded-lg text-stone-700 hover:text-emerald-900 text-[11px] font-medium text-right flex items-center gap-1 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">۳. تایید نهایی سفارش</span>
            </button>

            <button
              onClick={() => triggerSpecialOffer()}
              className="px-2 py-1.5 bg-white hover:bg-rose-50 border border-stone-200 rounded-lg text-stone-700 hover:text-rose-900 text-[11px] font-medium text-right flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-rose-600 shrink-0" />
              <span className="truncate">۴. پیشنهاد ویژه جدید</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
