import React, { useState } from 'react';
import { VisitRequest, OrderStatus, UserProfile, VendorReview, SupportTicket, TicketAttachment, CurtainVendor, TicketType } from '../types';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Store, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  Repeat, 
  ShieldCheck, 
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  X,
  CreditCard,
  MessageSquare,
  User,
  UserCheck,
  Edit3,
  Star,
  Award,
  ThumbsUp,
  LifeBuoy,
  AlertTriangle,
  Paperclip,
  Eye,
  Sparkles
} from 'lucide-react';
import type { DelayPenalty } from '../utils/restrictions';
import { fabricGradeLabel, formatSheba, buildSettlementTerms, toFaDigits } from '../utils/invoiceUtils';
import { ReviewModal } from './ReviewModal';
import { SupportTicketSystem } from './SupportTicketSystem';
import { CustomerSupportModal } from './CustomerSupportModal';
import { OrderDetails } from './OrderDetails';
import { formatDepositToman } from '../utils/deposit';
import { SecurePaymentPanel } from './SecurePaymentPanel';
import type { EscrowPayment } from '../types';

interface CustomerPortalProps {
  orders: VisitRequest[];
  onOpenBookingModal: () => void;
  onApproveInvoice: (orderId: string) => void;
  escrowPayments?: EscrowPayment[];
  onSecurePay?: (orderId: string, kind: 'prepayment' | 'final') => void;
  onRequestSecondStore: (orderId: string, reason: string) => void;
  onOpenChat?: (order: VisitRequest) => void;
  currentUser?: UserProfile | null;
  onOpenProfileModal?: () => void;
  onSubmitReview?: (review: Omit<VendorReview, 'id' | 'date'>) => void;
  onMarkOrderInstalled?: (orderId: string) => void;
  onOpenVendorProfile?: (vendorId: string) => void;
  tickets?: SupportTicket[];
  vendors?: CurtainVendor[];
  delayPenalties?: DelayPenalty[]; // جریمه‌های تأخیر اعمال‌شده توسط مدیر (نمایش در فاکتور)
  onCreateTicket?: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'messages'>, initialMessageText: string) => void;
  onReplyTicket?: (ticketId: string, message: string, attachments?: TicketAttachment[]) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  delayPenalties = [],
  orders,
  onOpenBookingModal,
  onApproveInvoice,
  escrowPayments = [],
  onSecurePay,
  onRequestSecondStore,
  onOpenChat,
  currentUser,
  onOpenProfileModal,
  onSubmitReview,
  onMarkOrderInstalled,
  onOpenVendorProfile,
  tickets = [],
  vendors = [],
  onCreateTicket,
  onReplyTicket,
}) => {
  const [activePortalTab, setActivePortalTab] = useState<'orders' | 'tickets'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<VisitRequest | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonReason, setComparisonReason] = useState('تنوع بیشتر در کالیته‌های پارچه و مقایسه قیمت');
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);
  const [orderForReview, setOrderForReview] = useState<VisitRequest | null>(null);
  const [selectedOrderForFullDetails, setSelectedOrderForFullDetails] = useState<VisitRequest | null>(null);

  // Support Modal State
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportModalOrderId, setSupportModalOrderId] = useState<string | undefined>(undefined);
  const [supportModalVendorId, setSupportModalVendorId] = useState<string | undefined>(undefined);
  const [supportModalType, setSupportModalType] = useState<TicketType>('complaint');

  const handleOpenComplaintForOrder = (order: VisitRequest) => {
    setSupportModalOrderId(order.id);
    setSupportModalVendorId(order.assignedVendorId);
    setSupportModalType('complaint');
    setIsSupportModalOpen(true);
  };

  const formatNumber = (num: number) => num.toLocaleString('fa-IR');

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'bidding':
        return {
          label: 'در تابلوی مزایده (انتظار برای قبول فروشگاه)',
          classes: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'assigned':
        return {
          label: 'واگذار شده به فروشگاه (در نوبت اعزام)',
          classes: 'bg-blue-100 text-blue-900 border-blue-300',
        };
      case 'visited':
        return {
          label: 'فاکتور صادر شده (نیاز به تصمیم شما)',
          classes: 'bg-purple-100 text-purple-900 border-purple-300 font-bold',
        };
      case 're_routed':
        return {
          label: 'ارجاع مجدد برای فروشگاه دوم (جهت مقایسه)',
          classes: 'bg-orange-100 text-orange-900 border-orange-300 font-bold',
        };
      case 'approved':
        return {
          label: 'تایید شده (در حال دوخت و آماده‌سازی)',
          classes: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        };
      case 'installed':
        return {
          label: 'تحویل و نصب شده (تکمیل)',
          classes: 'bg-stone-200 text-stone-800 border-stone-300',
        };
      case 'cancelled':
        return {
          label: 'لغو شده',
          classes: 'bg-red-100 text-red-900 border-red-300',
        };
      default:
        return { label: status, classes: 'bg-stone-100 text-stone-800' };
    }
  };

  const openInvoice = (order: VisitRequest) => {
    setSelectedOrder(order);
    setIsInvoiceModalOpen(true);
  };

  const openComparisonDialog = (order: VisitRequest) => {
    setSelectedOrder(order);
    setIsComparisonModalOpen(true);
  };

  const confirmSecondStoreRequest = () => {
    if (selectedOrder) {
      onRequestSecondStore(selectedOrder.id, comparisonReason);
      setIsComparisonModalOpen(false);
      setIsInvoiceModalOpen(false);
    }
  };

  return (
    <div className="py-10 bg-stone-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 mb-1">
              <span>میز کار مشتریان</span>
              <span>·</span>
              <span>پیگیری زنده و مدیریت فاکتورها</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              سفارشات و درخواست‌های مشاوره در خانه
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {onOpenProfileModal && (
              <button
                onClick={onOpenProfileModal}
                className="px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-amber-700" />
                <span>ویرایش اطلاعات و نشانی من</span>
              </button>
            )}

            <button
              onClick={onOpenBookingModal}
              className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              + ثبت درخواست ویزیت جدید
            </button>
          </div>
        </div>

        {/* Customer Profile & Address Summary Card */}
        {currentUser && (
          <div className="mt-6 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-right">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-bold text-lg shrink-0">
                {currentUser.name ? currentUser.name.slice(0, 2) : <User className="w-6 h-6" />}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">{currentUser.name}</span>
                  <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                    {currentUser.phone}
                  </span>
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                    مشتری تایید شده
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>نشانی ثبت‌شده: {currentUser.city}، {currentUser.district} - {currentUser.address}</span>
                  </span>
                  {currentUser.floorAndUnit && (
                    <span className="text-stone-400">({currentUser.floorAndUnit})</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
              <button
                onClick={() => {
                  setSupportModalOrderId(undefined);
                  setSupportModalVendorId(undefined);
                  setSupportModalType('complaint');
                  setIsSupportModalOpen(true);
                }}
                className="shrink-0 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>ثبت شکایت از فروشنده</span>
              </button>

              <button
                onClick={() => setActivePortalTab('tickets')}
                className="shrink-0 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-amber-700" />
                <span>تیکت‌های پشتیبانی من</span>
                <span className="bg-amber-200/80 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {tickets.filter(t => !currentUser || t.customerId === currentUser.id || t.customerPhone === currentUser.phone).length}
                </span>
              </button>

              {onOpenProfileModal && (
                <button
                  onClick={onOpenProfileModal}
                  className="shrink-0 px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                  <span>بروزرسانی نشانی یا تلفن</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Customer Portal Tabs Switcher */}
        <div className="mt-8 flex items-center gap-3 border-b border-stone-200 pb-3">
          <button
            onClick={() => setActivePortalTab('orders')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activePortalTab === 'orders'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>سفارش‌ها و فاکتورها</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activePortalTab === 'orders' ? 'bg-amber-900 text-amber-100' : 'bg-stone-100 text-stone-700'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActivePortalTab('tickets')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activePortalTab === 'tickets'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>تیکت‌های پشتیبانی یا شکایت</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activePortalTab === 'tickets' ? 'bg-amber-900 text-amber-100' : 'bg-stone-100 text-stone-700'
            }`}>
              {tickets.filter(t => !currentUser || t.customerId === currentUser.id || t.customerPhone === currentUser.phone).length}
            </span>
          </button>
        </div>

        {/* Tab 2: Support Tickets & Complaints System */}
        {activePortalTab === 'tickets' && (
          <div className="mt-6">
            <SupportTicketSystem
              currentUser={currentUser || null}
              tickets={tickets}
              vendors={vendors}
              orders={orders}
              onCreateTicket={onCreateTicket || (() => {})}
              onReplyTicket={onReplyTicket || (() => {})}
              onOpenBookingModal={onOpenBookingModal}
            />
          </div>
        )}

        {/* Tab 1: Orders and Invoices View */}
        {activePortalTab === 'orders' && (
          <>

        {/* Notice to Customer about demanding Official Invoice in Drapino */}
        <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-right shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>دستورالعمل نظارت اتحادیه و صیانت از حقوق خریدار</span>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">بسیار مهم</span>
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed max-w-3xl">
                خریدار گرامی، لطفاً پس از اندازه‌گیری پنجره‌ها و انتخاب کالیته در منزل، <strong>حتماً از کارشناس فروشگاه تقاضا کنید فاکتور رسمی را در سامانه دراپینو ثبت نماید.</strong> ثبت فاکتور سیستمی، شرط لازم جهت کسر تضمینی بیعانه، فعال شدن بیمه کیفیت پارچه و امکان داوری کارشناسان رسمی و ارسال مدارک به <strong>اتحادیه صنف پرده‌فروشان</strong> در صورت بروز هرگونه مغایرت خواهد بود.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-900 bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200">
              ضمانت بازرسی و داوری صنفی
            </span>
          </div>
        </div>

        {/* Orders List */}
        <div className="mt-8 space-y-6">
          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
              <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-600 text-sm font-medium">هنوز هیچ درخواستی ثبت نکرده‌اید.</p>
              <button
                onClick={onOpenBookingModal}
                className="mt-4 px-4 py-2 bg-amber-700 text-white text-xs font-bold rounded-lg"
              >
                اولین درخواست را با کالیته رایگان در منزل ثبت کنید
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const badge = getStatusBadge(order.status);
              const isTimelineOpen = expandedTimelineId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-amber-300 transition-all"
                >
                  {/* Card Head */}
                  <div className="p-5 sm:p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 text-right">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm text-stone-900 tabular-nums">
                          سفارش #{order.orderNumber}
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.classes}`}>
                          {badge.label}
                        </span>
                        {order.reRouteCount > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                            درخواست فروشگاه جایگزین (بار {order.reRouteCount})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>ثبت: {order.createdAt}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{order.city}، {order.district}</span>
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Button */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Review & Rating Buttons */}
                      {(order.status === 'installed' || order.status === 'approved' || order.customerReview) && (
                        <>
                          {order.customerReview ? (
                            <button
                              onClick={() => setOrderForReview(order)}
                              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all shadow-2xs cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                              <span>امتیاز شما: {order.customerReview.rating} از ۵ (ویرایش)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setOrderForReview(order)}
                              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 rounded-xl transition-all shadow-xs cursor-pointer animate-pulse"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-200 fill-amber-300" />
                              <span>ثبت نظر و امتیاز به فروشگاه</span>
                            </button>
                          )}
                        </>
                      )}

                      {order.status === 'approved' && onMarkOrderInstalled && (
                        <button
                          onClick={() => onMarkOrderInstalled(order.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer"
                          title="تایید انجام دوخت و نصب کامل پرده‌ها"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تایید تحویل کار و آزادسازی وجه امانی</span>
                        </button>
                      )}

                      {order.status === 'installed' && !order.customerReview && (
                        <button
                          onClick={() => setOrderForReview(order)}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors shadow-2xs cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                          <span>ثبت نظر و امتیاز</span>
                        </button>
                      )}

                      {order.status === 'installed' && order.customerReview && (
                        <button
                          onClick={() => setOrderForReview(order)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>ویرایش نظر ({order.customerReview.rating}★)</span>
                        </button>
                      )}

                      {order.assignedVendorName && onOpenChat && (
                        <button
                          onClick={() => onOpenChat(order)}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 text-indigo-700" />
                          <span>گفتگو با فروشگاه</span>
                        </button>
                      )}


                      {/* Full Order Details Modal Button */}
                      <button
                        onClick={() => setSelectedOrderForFullDetails(order)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors cursor-pointer"
                        title="مشاهده برگه کامل مشخصات و جزئیات سفارش"
                      >
                        <FileText className="w-3.5 h-3.5 text-stone-600" />
                        <span>جزئیات کامل سفارش</span>
                      </button>

                      {order.invoice && (
                        <button
                          onClick={() => openInvoice(order)}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shadow-xs cursor-pointer"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>مشاهده فاکتور (با کسر بیعانه)</span>
                        </button>
                      )}

                      {order.status === 'visited' && (
                        <button
                          onClick={() => openComparisonDialog(order)}
                          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-orange-700 bg-stone-100 hover:bg-orange-50 border border-stone-200 rounded-xl transition-colors cursor-pointer"
                        >
                          <Repeat className="w-3.5 h-3.5" />
                          <span>اعزام فروشگاه دیگر جهت مقایسه</span>
                        </button>
                      )}

                      {/* Complaint & Support Ticket shortcut on each order */}
                      <button
                        onClick={() => handleOpenComplaintForOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
                        title="ثبت شکایت رسمی با ارائه مدارک یا درخواست پشتیبانی برای این سفارش"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>ثبت شکایت / پشتیبانی</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-right text-xs text-stone-700 bg-stone-50/50">
                    
                    {/* Col 1: Space & Style */}
                    <div className="space-y-1.5">
                      <span className="font-bold text-stone-900 block text-xs">فضای پنجره‌ها و سبک‌ها:</span>
                      <p className="text-stone-600">
                        {order.rooms.join('، ')} (حدود {order.approximateWindows} پنجره - {order.approximateWidthMeters} متر)
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {order.preferredStyles.map((s, idx) => (
                          <span key={idx} className="bg-white border border-stone-200 px-2 py-0.5 rounded text-[11px] text-stone-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Col 2: Visiting Store info */}
                    <div className="space-y-1.5">
                      <span className="font-bold text-stone-900 block text-xs">فروشگاه اعزامی:</span>
                      {order.assignedVendorName ? (
                        <div className="space-y-1">
                          <p className="font-bold text-amber-900 text-xs sm:text-sm">{order.assignedVendorName}</p>
                          <p className="text-stone-500 font-mono text-[11px]">{order.assignedVendorPhone}</p>
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <span className="text-stone-700 text-[11px] flex items-center gap-1 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              امتیاز: {order.assignedVendorRating || 4.9} از ۵
                            </span>
                            {onOpenVendorProfile && order.assignedVendorId && (
                              <button
                                type="button"
                                onClick={() => onOpenVendorProfile(order.assignedVendorId!)}
                                className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                              >
                                مشاهده پروفایل و نظرات
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-amber-800 font-medium">
                          در حال حاضر در تابلوی رقابتی فروشگاه‌های منطقه شماست...
                        </p>
                      )}
                    </div>

                    {/* Col 3: Deposit & Financials */}
                    <div className="space-y-1.5">
                      <span className="font-bold text-stone-900 block text-xs">وضعیت بیعانه و فاکتور:</span>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>بیعانه {formatDepositToman(order.depositAmount)}ی پرداخت شده</span>
                      </div>
                      <p className="text-stone-500 text-[11px]">
                        این مبلغ به طور ۱۰۰٪ در فاکتور صادره کسر می‌گردد.
                      </p>
                      {order.invoice && (
                        <p className="text-stone-900 font-bold text-xs pt-1">
                          مبلغ نهایی فاکتور: {formatNumber(order.invoice.finalPayable)} تومان
                        </p>
                      )}
                    </div>

                  </div>


                  {/* Customer Review Showcase Box if reviewed */}
                  {order.customerReview && (
                    <div className="p-4 sm:p-5 bg-amber-50/70 border-t border-amber-200 text-xs space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-xs">
                            نظر و ارزیابی ثبت‌شده شما برای «{order.assignedVendorName}»:
                          </span>
                          <div className="flex items-center gap-0.5 text-amber-500 dir-ltr">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <Star
                                key={st}
                                className={`w-3.5 h-3.5 ${
                                  st <= order.customerReview!.rating ? 'fill-amber-400 text-amber-500' : 'text-stone-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold font-mono text-amber-900 text-[11px]">
                            ({order.customerReview.rating} از ۵)
                          </span>
                          <span className="text-stone-400 text-[10px] font-mono mr-1">
                            ثبت در {order.customerReview.date}
                          </span>
                        </div>

                        <button
                          onClick={() => setOrderForReview(order)}
                          className="text-amber-800 hover:text-amber-950 font-bold text-xs underline cursor-pointer"
                        >
                          ویرایش نظر و امتیاز
                        </button>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200/80 text-stone-800 leading-relaxed italic">
                        «{order.customerReview.comment}»
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {order.customerReview.tags && order.customerReview.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="bg-white border border-amber-200 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold text-amber-900">
                            ✓ {tag}
                          </span>
                        ))}

                        <span className="text-[10px] text-stone-500 mr-auto font-medium">
                          کیفیت دوخت: {order.customerReview.criteria.fabricQuality}/۵ · برخورد کارشناس: {order.customerReview.criteria.specialistBehavior}/۵ · نصب: {order.customerReview.criteria.installationPrecision}/۵
                        </span>
                      </div>

                      {order.customerReview.vendorReply && (
                        <div className="p-3 bg-white/90 rounded-xl border border-stone-200 text-xs space-y-1 mt-2">
                          <div className="flex items-center gap-1.5 font-bold text-stone-900 text-[11px]">
                            <Store className="w-3.5 h-3.5 text-blue-700" />
                            <span>پاسخ رسمی فروشگاه ({order.customerReview.vendorReply.date}):</span>
                          </div>
                          <p className="text-stone-600 text-xs leading-relaxed pr-5">
                            {order.customerReview.vendorReply.text}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* پرداخت امن (پیش‌پرداخت و مانده قبل از نصب) */}
                  {order.invoice && order.status === 'approved' && onSecurePay && (
                    <div className="p-4 border-t border-stone-200">
                      <SecurePaymentPanel order={order} payments={escrowPayments} onPay={onSecurePay} showWarning={false} />
                    </div>
                  )}

                  {/* Encouraging Review Banner if order is installed but not rated yet */}
                  {order.status === 'installed' && !order.customerReview && (
                    <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-100/60 to-orange-100/40 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                          <Star className="w-4 h-4 fill-amber-200 text-amber-200" />
                        </div>
                        <div>
                          <span className="font-bold text-amber-950 block">
                            پرده‌های شما با موفقیت نصب شدند! تجربه خود را با سایر خریداران به اشتراک بگذارید.
                          </span>
                          <span className="text-stone-600 text-[11px]">
                            امتیاز شما در کارنامه رسمی فروشگاه «{order.assignedVendorName}» ثبت می‌شود.
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setOrderForReview(order)}
                        className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
                        <span>ثبت نظر و امتیاز</span>
                      </button>
                    </div>
                  )}

                  {/* Timeline Accordion Bar */}
                  <div className="px-5 py-2.5 bg-stone-100/70 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
                    <button
                      onClick={() => setExpandedTimelineId(isTimelineOpen ? null : order.id)}
                      className="flex items-center gap-1.5 font-medium hover:text-stone-900"
                    >
                      <span>تاریخچه و مراحل انجام سفارش ({order.timeline.length} رویداد)</span>
                      {isTimelineOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <span className="text-[11px] text-stone-500">
                      زمان هماهنگ شده: {order.preferredDate} ({order.timeSlot})
                    </span>
                  </div>

                  {/* Expanded Timeline */}
                  {isTimelineOpen && (
                    <div className="p-5 border-t border-stone-200 bg-white space-y-3">
                      {order.timeline.map((event, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-right">
                          <div className="w-2 h-2 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 text-xs">{event.title}</span>
                              <span className="text-[11px] text-stone-400 font-mono">
                                {event.date} - {event.time}
                              </span>
                              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                                توسط {event.actor}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
        </>
      )}

      </div>

      {/* Invoice Review Modal */}
      {isInvoiceModalOpen && selectedOrder?.invoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="text-right">
                <h3 className="font-bold text-base sm:text-lg text-stone-900">
                  فاکتور رسمی دوخت و پرده
                </h3>
                <span className="text-xs text-stone-500">
                  شماره فاکتور: {selectedOrder.invoice.invoiceNumber} · صادرکننده: {selectedOrder.invoice.vendorName}
                </span>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Body */}
            <div className="p-6 space-y-5 text-right max-h-[70vh] overflow-y-auto">
              
              {/* Items Table */}
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">شرح پارچه / کالیته</th>
                      <th className="p-3">کد کالیته</th>
                      <th className="p-3">درجه پارچه</th>
                      <th className="p-3">متراژ</th>
                      <th className="p-3">قیمت فی (تومان)</th>
                      <th className="p-3">مجموع (تومان)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {selectedOrder.invoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/70">
                        <td className="p-3 font-medium text-stone-900">{item.title}</td>
                        <td className="p-3 font-mono text-stone-600">{item.fabricCode}</td>
                        <td className="p-3 font-bold text-stone-800 whitespace-nowrap">{fabricGradeLabel(item.fabricGrade)}</td>
                        <td className="p-3 font-mono tabular-nums">{item.meters} متر</td>
                        <td className="p-3 font-mono tabular-nums">{formatNumber(item.unitPrice)}</td>
                        <td className="p-3 font-mono font-bold tabular-nums text-stone-900">
                          {formatNumber(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Service & Hardware breakdowns */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>اجرت دوخت استاندارد و نوار پرده:</span>
                  <span className="font-mono tabular-nums">{formatNumber(selectedOrder.invoice.tailoringFee)} تومان</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>ریل، اکسسوری و یراق‌آلات اورجینال:</span>
                  <span className="font-mono tabular-nums">{formatNumber(selectedOrder.invoice.hardwareAndTrackFee)} تومان</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>هزینه ایاب و ذهاب، نصب و بخاردهی:</span>
                  <span className="font-mono tabular-nums">{formatNumber(selectedOrder.invoice.installationFee)} تومان</span>
                </div>
                <div className="flex items-center justify-between text-stone-900 font-bold pt-2 border-t border-stone-200">
                  <span>جمع کل فاکتور:</span>
                  <span className="font-mono tabular-nums">{formatNumber(selectedOrder.invoice.subtotal)} تومان</span>
                </div>
              </div>

              {/* Deposit Deduction Highlight */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-emerald-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-xs sm:text-sm">
                    کسر بیعانه مشاوره اولیه پرداختی شما:
                  </span>
                </div>
                <span className="text-base font-bold font-mono tabular-nums text-emerald-700">
                  - {formatNumber(selectedOrder.invoice.depositDeduction)} تومان
                </span>
              </div>

              {/* Final Payable */}
              <div className="p-4 bg-stone-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-300 block">مبلغ نهایی قابل پرداخت:</span>
                  <span className="text-[11px] text-stone-400">پس از کسر بیعانه {formatNumber(selectedOrder.invoice.depositDeduction)} تومانی</span>
                </div>
                <span className="text-xl font-black text-amber-400 font-mono tabular-nums">
                  {formatNumber(selectedOrder.invoice.finalPayable)} تومان
                </span>
              </div>

              {/* پیش‌پرداخت، تاریخ تحویل و نصب */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="block text-stone-600 mb-1">تاریخ تحویل و نصب:</span>
                  <span className="font-bold text-stone-900 font-mono">
                    {selectedOrder.invoice.deliveryInstallDate || '—'}
                  </span>
                </div>
                {typeof selectedOrder.invoice.customerPrepayment === 'number' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="block text-stone-600 mb-1">
                      پیش‌پرداخت مشتری
                      {selectedOrder.invoice.customerPrepaymentPercent
                        ? ` (${toFaDigits(selectedOrder.invoice.customerPrepaymentPercent)}٪ مبلغ فاکتور)`
                        : ''}
                      :
                    </span>
                    <span className="font-bold text-stone-900 font-mono tabular-nums">
                      {formatNumber(selectedOrder.invoice.customerPrepayment)} تومان
                    </span>
                    <span className="block text-[11px] text-stone-500 mt-1">
                      مانده تسویه: {formatNumber(Math.max(0, selectedOrder.invoice.finalPayable - selectedOrder.invoice.customerPrepayment))} تومان
                    </span>
                  </div>
                )}
              </div>

              {/* شماره شبای فروشنده */}
              {selectedOrder.invoice.vendorSheba && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs">
                  <span className="block text-stone-600 mb-1">شماره شبای فروشنده ({selectedOrder.invoice.vendorName}):</span>
                  <span className="font-bold text-stone-900 font-mono block text-left" dir="ltr">
                    {formatSheba(selectedOrder.invoice.vendorSheba)}
                  </span>
                </div>
              )}

              {/* جریمه تأخیر فروشنده در تحویل و نصب */}
              {(() => {
                const dp = delayPenalties.find((p) => p.orderId === selectedOrder.id && p.status === 'applied');
                if (!dp) return null;
                const payableAfter = Math.max(0, selectedOrder.invoice.finalPayable - dp.amount);
                return (
                  <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs space-y-1.5" data-testid="invoice-delay-penalty">
                    <div className="font-black text-rose-900 text-sm">جریمه تأخیر فروشنده در تحویل و نصب</div>
                    <div className="text-rose-900">
                      به‌دلیل {formatNumber(dp.daysLate)} روز تأخیر در تحویل و نصب نسبت به موعد مقرر، مبلغ{' '}
                      <span className="font-black font-mono">{formatNumber(dp.amount)} تومان</span> جریمه به نفع شما از مبلغ فاکتور کسر می‌شود.
                    </div>
                    {dp.reason && <div className="text-rose-800">توضیح: {dp.reason}</div>}
                    <div className="flex items-center justify-between pt-1.5 border-t border-rose-200 font-bold text-rose-950">
                      <span>مبلغ نهایی قابل پرداخت پس از کسر جریمه:</span>
                      <span className="font-mono tabular-nums">{formatNumber(payableAfter)} تومان</span>
                    </div>
                  </div>
                );
              })()}

              {/* تعهد تسویه حساب */}
              <p className="text-[11px] leading-relaxed text-stone-700 bg-stone-100 border border-stone-200 rounded-lg p-3">
                {buildSettlementTerms(
                  selectedOrder.invoice.deliveryInstallDate || '',
                  selectedOrder.invoice.customerName || selectedOrder.customerName
                )}
              </p>

              {onSecurePay && (
                <SecurePaymentPanel order={selectedOrder} payments={escrowPayments} onPay={onSecurePay} showWarning />
              )}

              {selectedOrder.invoice.notes && (
                <div className="p-3 bg-stone-100 rounded-lg text-xs text-stone-600">
                  <strong>توضیحات کارشناس:</strong> {selectedOrder.invoice.notes}
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsInvoiceModalOpen(false);
                  openComparisonDialog(selectedOrder);
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors text-center"
              >
                کالیته یا قیمت را نپسندیدم (اعزام فروشگاه دوم)
              </button>

              <button
                type="button"
                onClick={() => {
                  onApproveInvoice(selectedOrder.id);
                  setIsInvoiceModalOpen(false);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تایید فاکتور و شروع دوخت</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Second Store Comparison Request Modal */}
      {isComparisonModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 font-bold">
                <Repeat className="w-5 h-5 text-orange-600" />
                <span>درخواست اعزام فروشگاه دیگر جهت مقایسه</span>
              </div>
              <button
                onClick={() => setIsComparisonModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-right">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>گارانتی رضایت مشتری:</strong> با ثبت این درخواست، سفارش شما بدون کسر هیچ‌گونه وجه مجدد به تابلوی رقابتی بازگردانده می‌شود تا یک پرده‌سرای تخصصی دیگر با آلبوم‌های متفاوت به منزل شما مراجعه نماید.
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  دلیل تمایل به مقایسه یا تغییر فروشگاه:
                </label>
                <div className="space-y-2 text-xs">
                  {[
                    'تنوع بیشتر در کالیته‌های پارچه و عدم تطابق رنگ با مبلمان',
                    'پیشنهاد قیمت بالا و تمایل به دریافت استعلام از فروشگاه دیگر',
                    'نیاز به مشاوره در سبک‌های دیگر (مثلاً زبرا به جای مخمل)',
                    'زمان تحویل طولانی فروشگاه فعلی',
                  ].map((reason) => (
                    <label 
                      key={reason}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer text-stone-700"
                    >
                      <input
                        type="radio"
                        name="comparisonReason"
                        checked={comparisonReason === reason}
                        onChange={() => setComparisonReason(reason)}
                        className="text-amber-700 focus:ring-amber-600"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsComparisonModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={confirmSecondStoreRequest}
                className="px-5 py-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm"
              >
                تایید و واگذاری به فروشگاه جایگزین
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Review and Rating Modal */}
      {orderForReview && (
        <ReviewModal
          isOpen={Boolean(orderForReview)}
          onClose={() => setOrderForReview(null)}
          order={orderForReview}
          onSubmitReview={(review) => {
            if (onSubmitReview) {
              onSubmitReview(review);
            }
            setOrderForReview(null);
          }}
          existingReview={orderForReview.customerReview}
        />
      )}

      {/* Customer Support & Complaint Modal */}
      <CustomerSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        currentUser={currentUser || null}
        tickets={tickets}
        vendors={vendors}
        orders={orders}
        onCreateTicket={onCreateTicket || (() => {})}
        onReplyTicket={onReplyTicket || (() => {})}
        initialOrderId={supportModalOrderId}
        initialVendorId={supportModalVendorId}
        initialType={supportModalType}
      />


      {/* Comprehensive Order Details Modal using OrderDetails component */}
      {selectedOrderForFullDetails && (
        <OrderDetails
          order={selectedOrderForFullDetails}
          isModal={true}
          isOpen={true}
          onClose={() => setSelectedOrderForFullDetails(null)}
          onOpenChat={onOpenChat}
          onRequestSecondStore={() => {
            const ord = selectedOrderForFullDetails;
            setSelectedOrderForFullDetails(null);
            openComparisonDialog(ord);
          }}
          onOpenInvoice={(ord) => {
            setSelectedOrderForFullDetails(null);
            openInvoice(ord);
          }}
          onOpenSupport={(ord) => {
            setSelectedOrderForFullDetails(null);
            handleOpenComplaintForOrder(ord);
          }}
        />
      )}

    </div>
  );
};
