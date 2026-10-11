import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AppNotification, 
  NotificationPreferences, 
  NotificationType, 
  OrderMessage, 
  UserRole 
} from '../types';
import { playNotificationSound } from '../utils/sound';

import { loadStored, saveStored } from '../utils/storage';

const STORAGE_KEY_NOTIFICATIONS = 'auto_pardeh_notifications_v1';
const STORAGE_KEY_PREFS = 'auto_pardeh_notification_prefs_v1';
const STORAGE_KEY_MESSAGES = 'auto_pardeh_order_messages_v1';

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  enableSound: true,
  enableInAppToast: true,
  enableBrowserPush: false,
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
};

const INITIAL_MESSAGES: OrderMessage[] = [
  {
    id: 'msg-1',
    orderId: 'ord-1403-101',
    orderNumber: 'AP-9281',
    senderRole: 'vendor',
    senderName: 'گالری پرده رویال ونک',
    text: 'سلام جناب فراهانی، کارشناس ما به همراه کالیته مخمل شانل و حریر شاین ساعت ۱۵:۰۰ خدمت شما می‌رسد.',
    timestamp: 'دیروز، ۱۰:۴۰',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'msg-2',
    orderId: 'ord-1403-101',
    orderNumber: 'AP-9281',
    senderRole: 'customer',
    senderName: 'دکتر علیرضا فراهانی',
    text: 'سلام و وقت بخیر، ممنون. لطفا کالیته رنگ‌های خنثی (طوسی و فیلی) را هم همراه داشته باشید.',
    timestamp: 'دیروز، ۱۱:۱۵',
    createdAt: Date.now() - 82800000,
  },
  {
    id: 'msg-3',
    orderId: 'ord-1403-101',
    orderNumber: 'AP-9281',
    senderRole: 'vendor',
    senderName: 'گالری پرده رویال ونک',
    text: 'حتما، هر سه آلبوم کالیفرنیا ترک و پتینه طوسی آماده و همراه کارشناس است.',
    timestamp: 'دیروز، ۱۱:۲۰',
    createdAt: Date.now() - 82000000,
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'new_request',
    title: 'ثبت سفارش جدید در تابلوی مزایده',
    message: 'خانم مهندس یزدانی یک درخواست مشاوره در سعادت‌آباد ثبت نمود (کد: AP-9310). هم‌اکنون آماده شکار توسط فروشگاه‌هاست.',
    timestamp: '۱۰ دقیقه پیش',
    createdAt: Date.now() - 600000,
    isRead: false,
    targetRole: 'all',
    orderId: 'ord-1403-102',
    orderNumber: 'AP-9310',
    linkTab: 'vendor-portal',
    actionLabel: 'مشاهده در مزایده',
    metadata: {
      customerName: 'خانم مهندس سمیرا یزدانی',
      amount: 350000,
    },
  },
  {
    id: 'notif-2',
    type: 'order_assigned',
    title: 'ارجاع سفارش و تعیین کارشناس اعزامی',
    message: 'سفارش AP-9281 توسط «گالری پرده رویال ونک» تایید و کارشناس با کالیته‌های درخواستی اعزام گردید.',
    timestamp: '۱ ساعت پیش',
    createdAt: Date.now() - 3600000,
    isRead: false,
    targetRole: 'all',
    orderId: 'ord-1403-101',
    orderNumber: 'AP-9281',
    linkTab: 'customer-portal',
    actionLabel: 'پیگیری اعزام',
    metadata: {
      vendorName: 'گالری پرده رویال ونک',
      customerName: 'دکتر علیرضا فراهانی',
    },
  },
  {
    id: 'notif-3',
    type: 'new_message',
    title: 'پیام جدید در سفارش AP-9281',
    message: 'گالری پرده رویال ونک: «حتما، هر سه آلبوم کالیفرنیا ترک و پتینه طوسی آماده و همراه کارشناس است.»',
    timestamp: '۲ ساعت پیش',
    createdAt: Date.now() - 7200000,
    isRead: false,
    targetRole: 'all',
    orderId: 'ord-1403-101',
    orderNumber: 'AP-9281',
    linkTab: 'customer-portal',
    actionLabel: 'مشاهده گفتگو',
    metadata: {
      vendorName: 'گالری پرده رویال ونک',
      senderRole: 'vendor',
    },
  },
  {
    id: 'notif-4',
    type: 'order_approved',
    title: 'تایید نهایی فاکتور توسط مشتری',
    message: 'خانم دکتر آذر مهرابی فاکتور سفارش AP-9118 را تایید و واریز نهایی را انجام داد. سفارش وارد مرحله برش و دوخت شد.',
    timestamp: 'دیروز',
    createdAt: Date.now() - 86400000,
    isRead: true,
    targetRole: 'all',
    orderId: 'ord-1403-104',
    orderNumber: 'AP-9118',
    linkTab: 'vendor-portal',
    actionLabel: 'جزئیات فاکتور',
    metadata: {
      customerName: 'خانم دکتر آذر مهرابی',
      amount: 32890000,
    },
  },
  {
    id: 'notif-5',
    type: 'special_offer',
    title: 'پیشنهاد ویژه: جشنواره پاییزه کالیته‌های مخمل ترک',
    message: 'با ثبت سفارش پرده در این هفته، علاوه بر کسر بیعانه از هزینه دوخت با ۵۰٪ تخفیف اختصاصی بهره‌مند شوید. کد تخفیف: DRAPINO20',
    timestamp: '۲ روز پیش',
    createdAt: Date.now() - 172800000,
    isRead: true,
    targetRole: 'all',
    linkTab: 'catalog',
    actionLabel: 'مشاهده کاتالوگ',
    metadata: {
      discountPercent: 20,
      offerCode: 'DRAPINO20',
    },
  },
];

interface AddNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  targetRole?: UserRole | 'all';
  orderId?: string;
  orderNumber?: string;
  linkTab?: string;
  actionLabel?: string;
  metadata?: AppNotification['metadata'];
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  activeToast: AppNotification | null;
  dismissToast: () => void;
  addNotification: (params: AddNotificationParams) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updatePreferences: (newPrefs: Partial<NotificationPreferences>) => void;
  requestBrowserPushPermission: () => Promise<boolean>;
  browserPermission: NotificationPermission | 'unsupported';
  // Messages between customer and vendor
  messages: OrderMessage[];
  sendMessage: (orderId: string, text: string, senderRole: 'customer' | 'vendor', senderName: string, orderNumber?: string) => void;
  getOrderMessages: (orderId: string) => OrderMessage[];
  // Trigger presets for test / demonstration
  triggerSpecialOffer: (title?: string, message?: string, offerCode?: string, targetRole?: UserRole | 'all') => void;
  triggerSimulatedVendorMessage: (orderId: string, orderNumber: string, vendorName: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load preferences
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PREFERENCES;
  });

  // Load notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadStored<AppNotification[]>(STORAGE_KEY_NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );

  // Load messages
  const [messages, setMessages] = useState<OrderMessage[]>(() =>
    loadStored<OrderMessage[]>(STORAGE_KEY_MESSAGES, INITIAL_MESSAGES)
  );

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Check initial browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(window.Notification.permission);
    } else {
      setBrowserPermission('unsupported');
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(preferences));
    } catch {
      // ignore
    }
  }, [preferences]);

  useEffect(() => {
    saveStored(STORAGE_KEY_NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    saveStored(STORAGE_KEY_MESSAGES, messages);
  }, [messages]);

  // Toast auto-dismiss timer
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 5500);
    return () => clearTimeout(timer);
  }, [activeToast]);

  const dismissToast = () => setActiveToast(null);

  // Check quiet hours
  const isQuietTime = (): boolean => {
    if (!preferences.quietHours.enabled) return false;
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMin = currentHours * 60 + currentMinutes;

    const [startH, startM] = preferences.quietHours.startTime.split(':').map(Number);
    const [endH, endM] = preferences.quietHours.endTime.split(':').map(Number);
    const startTotalMin = (startH || 0) * 60 + (startM || 0);
    const endTotalMin = (endH || 0) * 60 + (endM || 0);

    if (startTotalMin < endTotalMin) {
      return currentTotalMin >= startTotalMin && currentTotalMin < endTotalMin;
    } else {
      // crosses midnight (e.g. 23:00 to 08:00)
      return currentTotalMin >= startTotalMin || currentTotalMin < endTotalMin;
    }
  };

  // Add Notification
  const addNotification = (params: AddNotificationParams) => {
    // Check if category is enabled
    const isCategoryAllowed = preferences.categories[params.type] ?? true;
    if (!isCategoryAllowed) {
      // Still store for history if desired, or skip toast/sound
      // Let's create it as unread in history so the user doesn't lose critical data,
      // but strictly suppress intrusive alerts (sound/toast/browser)
    }

    const now = new Date();
    const persianTime = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: params.type,
      title: params.title,
      message: params.message,
      timestamp: `هم‌اکنون (${persianTime})`,
      createdAt: Date.now(),
      isRead: false,
      targetRole: params.targetRole || 'all',
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      linkTab: params.linkTab,
      actionLabel: params.actionLabel,
      metadata: params.metadata,
    };

    setNotifications(prev => [newNotif, ...prev]);

    const quiet = isQuietTime();

    // Sound effect
    if (preferences.enableSound && isCategoryAllowed && !quiet) {
      playNotificationSound();
    }

    // In-app toast banner
    if (preferences.enableInAppToast && isCategoryAllowed) {
      setActiveToast(newNotif);
    }

    // Native Browser Notification
    if (preferences.enableBrowserPush && isCategoryAllowed && !quiet && typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'granted') {
        try {
          new window.Notification(`دراپینو: ${newNotif.title}`, {
            body: newNotif.message,
            icon: '/favicon.ico',
          });
        } catch {
          // ignore
        }
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updatePreferences = (newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPrefs,
      categories: {
        ...prev.categories,
        ...(newPrefs.categories || {}),
      },
      quietHours: {
        ...prev.quietHours,
        ...(newPrefs.quietHours || {}),
      },
    }));
  };

  const requestBrowserPushPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserPermission('unsupported');
      return false;
    }
    try {
      const permission = await window.Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === 'granted') {
        updatePreferences({ enableBrowserPush: true });
        return true;
      } else {
        updatePreferences({ enableBrowserPush: false });
        return false;
      }
    } catch {
      return false;
    }
  };

  // Chat message support
  const sendMessage = (
    orderId: string, 
    text: string, 
    senderRole: 'customer' | 'vendor', 
    senderName: string,
    orderNumber?: string
  ) => {
    if (!text.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const newMsg: OrderMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      orderId,
      orderNumber,
      senderRole,
      senderName,
      text: text.trim(),
      timestamp: `امروز، ${timeStr}`,
      createdAt: Date.now(),
    };

    setMessages(prev => [...prev, newMsg]);

    // Trigger notification to the other party
    const recipientTitle = senderRole === 'vendor' 
      ? `پیام جدید از فروشگاه ${senderName}` 
      : `پیام جدید از مشتری (${senderName})`;

    addNotification({
      type: 'new_message',
      title: recipientTitle,
      message: `${senderName}: «${text.trim().substring(0, 75)}${text.length > 75 ? '...' : ''}»`,
      targetRole: senderRole === 'vendor' ? 'customer' : 'vendor',
      orderId,
      orderNumber,
      linkTab: senderRole === 'vendor' ? 'customer-portal' : 'vendor-portal',
      actionLabel: 'پاسخ به پیام',
      metadata: {
        senderRole,
        customerName: senderRole === 'customer' ? senderName : undefined,
        vendorName: senderRole === 'vendor' ? senderName : undefined,
      },
    });
  };

  const getOrderMessages = (orderId: string) => {
    return messages.filter(m => m.orderId === orderId);
  };

  // Demonstration presets
  const triggerSpecialOffer = (
    title = 'جشنواره طلایی پاییزه: ۲۰٪ تخفیف دوخت رایگان پرده',
    message = 'به مناسبت افتتاح شعب جدید فروشگاه‌های کالیته در محل، برای سفارش‌های بالای ۱۰ متر هزینه دوخت و سرب‌دوزی با کد YALDA98 رایگان محاسبه می‌شود.',
    offerCode = 'YALDA98',
    targetRole: UserRole | 'all' = 'all'
  ) => {
    addNotification({
      type: 'special_offer',
      title,
      message,
      targetRole,
      linkTab: 'catalog',
      actionLabel: 'مشاهده پارچه‌های تخفیف‌دار',
      metadata: {
        discountPercent: 20,
        offerCode,
      },
    });
  };

  const triggerSimulatedVendorMessage = (orderId: string, orderNumber: string, vendorName: string) => {
    const sampleResponses = [
      'سلام، کارشناس ما به همراه ۶ کالیته کامل مخمل، حریر و زبرا تا نیم ساعت دیگر به آدرس شما می‌رسد.',
      'کاتالوگ دیجیتال پارچه‌های ترک در پیوست قرار گرفت، جهت هماهنگی تماس حاصل فرمایید.',
      'متراژ پرده با موفقیت محاسبه شد، فاکتور با کسر کامل بیعانه در پنل شما قرار گرفت.',
    ];
    const text = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
    sendMessage(orderId, text, 'vendor', vendorName, orderNumber);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        activeToast,
        dismissToast,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        updatePreferences,
        requestBrowserPushPermission,
        browserPermission,
        messages,
        sendMessage,
        getOrderMessages,
        triggerSpecialOffer,
        triggerSimulatedVendorMessage,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
