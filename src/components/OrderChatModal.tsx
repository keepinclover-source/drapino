import React, { useState, useEffect, useRef } from 'react';
import { VisitRequest, UserRole } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { 
  X, 
  Send, 
  Store, 
  User, 
  Sparkles, 
  Clock, 
  MessageSquare,
  Zap
} from 'lucide-react';

interface OrderChatModalProps {
  order: VisitRequest;
  currentUserRole: UserRole;
  currentUserName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderChatModal: React.FC<OrderChatModalProps> = ({
  order,
  currentUserRole,
  currentUserName,
  isOpen,
  onClose,
}) => {
  const { getOrderMessages, sendMessage } = useNotifications();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const orderMessages = getOrderMessages(order.id);

  // Role resolution
  const activeSenderRole: 'customer' | 'vendor' = currentUserRole === 'vendor' ? 'vendor' : 'customer';
  const myName = currentUserName || (activeSenderRole === 'customer' ? order.customerName : (order.assignedVendorName || 'فروشگاه مجری'));
  const peerName = activeSenderRole === 'customer' 
    ? (order.assignedVendorName || 'فروشگاه اعزامی دراپینو')
    : order.customerName;

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [orderMessages.length, isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(order.id, inputText, activeSenderRole, myName, order.orderNumber);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick reply options
  const customerQuickReplies = [
    'سلام، لطفا کالیته‌های مخمل و حریر طوسی را حتما همراه بیاورید.',
    'نیم ساعت قبل از رسیدن لطفا تماس بگیرید.',
    'ارتفاع سقف سالن حدود ۳.۲۰ متر است.',
    'فاکتور صادر شده را تایید می‌کنم.',
  ];

  const vendorQuickReplies = [
    'سلام و احترام، کارشناس ما به همراه کالیته‌های درخواستی اعزام شد.',
    'آدرس شما با موفقیت دریافت شد و در زمان مقرر خدمت می‌رسیم.',
    'فاکتور با کسر کامل بیعانه ثبت گردید.',
    'پارچه‌ها در حال برش و سرب‌دوزی است و تا ۲ روز آینده نصب می‌شود.',
  ];

  const currentReplies = activeSenderRole === 'customer' ? customerQuickReplies : vendorQuickReplies;

  // Simulator helper: simulates counter-party replying to test notification reception!
  const handleSimulatePeerReply = () => {
    const counterRole: 'customer' | 'vendor' = activeSenderRole === 'customer' ? 'vendor' : 'customer';
    const counterName = peerName;
    const sampleReplies = counterRole === 'vendor'
      ? [
          'سلام، کارشناس ما هم‌اکنون به همراه کالیته‌های درخواستی در مسیر منزل شماست.',
          'کالیته‌های مخمل کالیفرنیا و پتینه ترک به سفارش شما اضافه شد.',
          'فاکتور را با تخفیف جشنواره دوخت به‌روزرسانی کردیم.',
        ]
      : [
          'سلام، آیا امکان دارد نمونه‌های حریر شاین شیری را هم بیاورید؟',
          'ساعت مراجعه برای فردا ظهر مناسب است، متشکرم.',
          'فاکتور را تایید کردم و بیعانه در سامانه ثبت شده است.',
        ];

    const randomText = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
    sendMessage(order.id, randomText, counterRole, counterName, order.orderNumber);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-modal-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center font-bold shadow-xs">
              {activeSenderRole === 'customer' ? <Store className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="chat-modal-title" className="text-sm font-bold text-stone-900">
                  {peerName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  آنلاین
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                <span>سفارش: {order.orderNumber}</span>
                <span>•</span>
                <span>{order.district}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSimulatePeerReply}
              title="تست دریافت اعلان پاسخ از طرف مقابل"
              className="text-[11px] text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">پاسخ تستی طرف مقابل</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
              aria-label="بستن چت"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-stone-50/40">
          {orderMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <MessageSquare className="w-12 h-12 text-stone-300 mb-2" />
              <p className="text-sm font-bold text-stone-600">هنوز پیامی رد و بدل نشده است</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                از بخش زیر سوالات، هماهنگی زمان بازدید و ارسال تصاویر کالیته را ارسال نمایید.
              </p>
            </div>
          ) : (
            orderMessages.map((msg) => {
              const isMine = msg.senderRole === activeSenderRole;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-stone-400 mb-1 px-1">
                    {msg.senderName} • {msg.timestamp}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isMine
                        ? 'bg-amber-700 text-white rounded-br-xs'
                        : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Chips */}
        <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200 overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar">
          <span className="text-[10px] text-stone-500 font-bold whitespace-nowrap pl-1">
            پیام‌های سریع:
          </span>
          {currentReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(reply)}
              className="text-[11px] bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 hover:border-amber-300 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`پیام خود به عنوان ${activeSenderRole === 'customer' ? 'مشتری' : 'فروشگاه'} را بنویسید...`}
            className="flex-1 bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:bg-white transition-all text-stone-900 placeholder:text-stone-400"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
            aria-label="ارسال پیام"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
