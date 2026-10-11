import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { 
  X, 
  Sparkles, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  MessageSquare, 
  ExternalLink 
} from 'lucide-react';
import { NotificationType } from '../types';

interface NotificationToastProps {
  onNavigate?: (tab: string, orderId?: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onNavigate }) => {
  const { activeToast, dismissToast, markAsRead } = useNotifications();

  if (!activeToast) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'new_request':
        return <ShoppingBag className="w-5 h-5 text-amber-600" />;
      case 'order_assigned':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'order_approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'special_offer':
        return <Sparkles className="w-5 h-5 text-rose-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-600" />;
    }
  };

  const getBadgeColor = (type: NotificationType) => {
    switch (type) {
      case 'new_request':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'order_assigned':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'order_approved':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'new_message':
        return 'bg-indigo-100 text-indigo-900 border-indigo-200';
      case 'special_offer':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-900 border-stone-200';
    }
  };

  const handleClick = () => {
    markAsRead(activeToast.id);
    if (activeToast.linkTab && onNavigate) {
      onNavigate(activeToast.linkTab, activeToast.orderId);
    }
    dismissToast();
  };

  return (
    <aside
      aria-label="اعلان‌های سیستم"
      className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-50 max-w-sm sm:max-w-md w-full bg-white rounded-2xl shadow-2xl border border-stone-200/90 overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="p-4 flex items-start gap-3">
        <div className="shrink-0 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
          {getIcon(activeToast.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getBadgeColor(activeToast.type)}`}>
              {activeToast.type === 'new_request' && 'درخواست جدید'}
              {activeToast.type === 'order_assigned' && 'ارجاع سفارش'}
              {activeToast.type === 'order_approved' && 'تایید سفارش'}
              {activeToast.type === 'new_message' && 'پیام جدید'}
              {activeToast.type === 'special_offer' && 'پیشنهاد ویژه'}
            </span>
            <span className="text-[10px] text-stone-400 font-medium">
              {activeToast.timestamp}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight mb-1 truncate">
            {activeToast.title}
          </h4>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {activeToast.message}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
            <button
              onClick={handleClick}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 hover:underline transition-all"
            >
              <span>{activeToast.actionLabel || 'مشاهده جزئیات'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={dismissToast}
              className="text-[11px] text-stone-500 hover:text-stone-700 px-2 py-1 rounded hover:bg-stone-100 transition-colors"
            >
              بستن
            </button>
          </div>
        </div>

        <button
          onClick={dismissToast}
          className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors shrink-0"
          aria-label="بستن اعلان"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar timer indicator */}
      <div className="h-1 w-full bg-stone-100">
        <div className="h-full bg-gradient-to-r from-amber-600 to-amber-700 w-full animate-pulse" />
      </div>
    </aside>
  );
};
