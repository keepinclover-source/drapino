import React, { useState } from 'react';
import { 
  X, 
  LifeBuoy, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Store, 
  Calendar, 
  Eye, 
  Trash2, 
  ShieldCheck, 
  Plus, 
  MessageSquare,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { 
  SupportTicket, 
  TicketType, 
  TicketCategory, 
  TicketPriority, 
  TicketStatus, 
  TicketAttachment, 
  CurtainVendor, 
  VisitRequest, 
  UserProfile 
} from '../types';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  tickets: SupportTicket[];
  vendors: CurtainVendor[];
  orders: VisitRequest[];
  onCreateTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'messages'>, initialMessageText: string) => void;
  onReplyTicket: (ticketId: string, message: string, attachments?: TicketAttachment[]) => void;
  initialType?: TicketType;
  initialOrderId?: string;
  initialVendorId?: string;
}

const COMPLAINT_CATEGORIES: { value: TicketCategory; label: string; desc: string }[] = [
  { 
    value: 'fabric_quality_mismatch', 
    label: 'مغایرت کالیته دیده شده با پارچه تحویلی', 
    desc: 'کد رنگ، بافت، تراکم یا برند پارچه با کالیته مشاهده شده در منزل تطابق ندارد.' 
  },
  { 
    value: 'overpricing_discrepancy', 
    label: 'گران‌فروشی و مغایرت قیمت با تعرفه رسمی اتحادیه', 
    desc: 'مبلغ اعلامی در فاکتور با نرخ مصوب اتحادیه یا برآورد سامانه همخوانی ندارد.' 
  },
  { 
    value: 'tailoring_installation_defect', 
    label: 'ایراد در دوخت، چین‌ها یا نقص در نصب ریل و پرده', 
    desc: 'ابعاد نادرست، چین‌خوردگی ناقص، دوخت بی‌کیفیت یا نصب لق و معیوب.' 
  },
  { 
    value: 'delay_unpunctuality', 
    label: 'تاخیر غیرموجه و عدم پایبندی به زمان تحویل', 
    desc: 'خلف وعده در روز یا ساعت اعزام کارشناس کالیته، یا تاخیر در تحویل نهایی.' 
  },
  { 
    value: 'invoice_refusal', 
    label: 'عدم ثبت یا امتناع از صدور فاکتور رسمی در دراپینو', 
    desc: 'فروشنده از ثبت فاکتور سیستمی امتناع کرده یا فاکتور دستی صادر نموده است.' 
  },
  { 
    value: 'unprofessional_behavior', 
    label: 'برخورد نامناسب کارشناس یا نصاب اعزامی', 
    desc: 'هرگونه رفتار غیراخلاقی، درخواست انعام یا هزینه مازاد ایاب و ذهاب در محل.' 
  },
];

const SUPPORT_CATEGORIES: { value: TicketCategory; label: string; desc: string }[] = [
  { 
    value: 'fabric_consultation', 
    label: 'مشاوره انتخاب جنس، رنگ و سبک پرده', 
    desc: 'راهنمایی در مورد نورگیری پنجره، هماهنگی با مبلمان و انواع پارچه‌های مدرن و کلاسیک.' 
  },
  { 
    value: 'deposit_refund_query', 
    label: 'پیگیری بیعانه و امور مالی', 
    desc: 'استعلام کسر بیعانه، پرداخت آنلاین و استرداد وجه.' 
  },
  { 
    value: 'order_tracking', 
    label: 'پیگیری مرحله و وضعیت جاری سفارش', 
    desc: 'اطلاع از زمان مراجعه کارشناس، وضعیت برش و دوخت کارگاه.' 
  },
  { 
    value: 'general_support', 
    label: 'سایر سوالات و راهنمایی سامانه', 
    desc: 'ارتباط مستقیم با کارشناسان پشتیبانی و مرکز تماس مشتریان.' 
  },
];

const CustomerSupportModalInner: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  tickets,
  vendors,
  orders,
  onCreateTicket,
  onReplyTicket,
  initialType = 'complaint',
  initialOrderId,
  initialVendorId,
}) => {

  // Tabs: 'list' | 'create_complaint' | 'create_support' | 'detail'
  const [activeView, setActiveView] = useState<'list' | 'create_complaint' | 'create_support' | 'detail'>(
    initialOrderId || initialVendorId ? 'create_complaint' : 'list'
  );
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<TicketType>(initialType);
  const [category, setCategory] = useState<TicketCategory>(
    initialType === 'complaint' ? 'fabric_quality_mismatch' : 'fabric_consultation'
  );
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('important');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId || '');
  const [selectedVendorId, setSelectedVendorId] = useState<string>(initialVendorId || '');
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [formError, setFormError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Conversation reply state
  const [replyText, setReplyText] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<TicketAttachment[]>([]);

  // Filter user tickets (only those belonging to currentUser if logged in, or all customer tickets)
  const userTickets = currentUser 
    ? tickets.filter((t) => t.customerId === currentUser.id || t.customerPhone === currentUser.phone)
    : tickets;

  const currentSelectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  // Auto-fill vendor if order selected
  const handleOrderChange = (ordId: string) => {
    setSelectedOrderId(ordId);
    const ord = orders.find((o) => o.id === ordId);
    if (ord && ord.assignedVendorId) {
      setSelectedVendorId(ord.assignedVendorId);
    }
  };

  // Simulated file attachment
  const handleSimulateAttachment = (presetName: string, type: 'image' | 'document') => {
    const newAtt: TicketAttachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: presetName,
      size: `${(Math.random() * 1.5 + 0.4).toFixed(1)} مگابایت`,
      url: type === 'image' ? '/images/fabric_swatches_velvet_1790237044606.jpg' : '/images/curtain_specialist_visit_1790237059005.jpg',
      type: type,
    };
    setAttachments((prev) => [...prev, newAtt]);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isReply = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const isImg = file.type.startsWith('image/');
      const newAtt: TicketAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} مگابایت`,
        url: typeof reader.result === 'string' ? reader.result : '/images/fabric_swatches_velvet_1790237044606.jpg',
        type: isImg ? 'image' : 'document',
      };
      if (isReply) {
        setReplyAttachments((prev) => [...prev, newAtt]);
      } else {
        setAttachments((prev) => [...prev, newAtt]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAttachment = (attId: string, isReply = false) => {
    if (isReply) {
      setReplyAttachments((prev) => prev.filter((a) => a.id !== attId));
    } else {
      setAttachments((prev) => prev.filter((a) => a.id !== attId));
    }
  };

  // Submit Ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!subject.trim()) {
      setFormError('لطفاً عنوان یا موضوع را وارد کنید.');
      return;
    }
    if (!description.trim()) {
      setFormError('لطفاً شرح کامل شکایت یا درخواست پشتیبانی را بنویسید.');
      return;
    }

    if (type === 'complaint' && !selectedVendorId && !selectedOrderId) {
      setFormError('جهت ثبت شکایت، انتخاب فروشنده یا شماره سفارش الزامی است.');
      return;
    }

    const matchedVendor = vendors.find((v) => v.id === selectedVendorId);
    const matchedOrder = orders.find((o) => o.id === selectedOrderId);

    const categoriesList = type === 'complaint' ? COMPLAINT_CATEGORIES : SUPPORT_CATEGORIES;
    const catItem = categoriesList.find((c) => c.value === category);

    onCreateTicket(
      {
        type,
        category,
        categoryLabel: catItem ? catItem.label : 'شکایت / پشتیبانی',
        subject: subject.trim(),
        description: description.trim(),
        priority,
        status: 'investigating',
        customerId: currentUser?.id || 'usr-guest-customer',
        customerName: currentUser?.name || 'مشتری سامانه',
        customerPhone: currentUser?.phone || '۰۹۱۲۰۰۰۰۰۰۰',
        targetVendorId: selectedVendorId || matchedOrder?.assignedVendorId,
        targetVendorName: matchedVendor?.name || matchedOrder?.assignedVendorName,
        orderId: selectedOrderId || undefined,
        orderNumber: matchedOrder?.orderNumber,
        attachments: attachments,
      },
      description.trim()
    );

    setSuccessNotice(
      type === 'complaint'
        ? 'شکایت شما با موفقیت ثبت شد و به واحد بازرسی اتحادیه صنف و کارشناسان ناظر ارجاع گردید.'
        : 'درخواست پشتیبانی شما ثبت شد؛ کارشناسان به زودی پاسخ خواهند داد.'
    );

    // Reset Form
    setSubject('');
    setDescription('');
    setAttachments([]);

    setTimeout(() => {
      setSuccessNotice('');
      setActiveView('list');
    }, 1800);
  };

  // Handle Reply to existing ticket
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyText.trim()) return;

    onReplyTicket(selectedTicketId, replyText.trim(), replyAttachments);
    setReplyText('');
    setReplyAttachments([]);
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'در انتظار بررسی', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'investigating':
        return { label: 'در حال رسیدگی کارشناس', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'referred_to_union':
        return { label: 'ارجاع به داوری اتحادیه صنف', color: 'bg-purple-100 text-purple-900 border-purple-300 font-bold' };
      case 'answered':
        return { label: 'پاسخ داده شده', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'resolved':
        return { label: 'حل و فصل شده (مختومه)', color: 'bg-stone-100 text-stone-700 border-stone-300' };
      case 'closed':
        return { label: 'بسته شده', color: 'bg-stone-200 text-stone-600 border-stone-300' };
      default:
        return { label: status, color: 'bg-stone-100 text-stone-800 border-stone-200' };
    }
  };

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case 'urgent':
        return { label: 'فوری (مداخله بازرسی)', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'important':
        return { label: 'مهم', color: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'normal':
        return { label: 'عادی', color: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-stone-200 text-right animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 p-5 text-white flex items-center justify-between shrink-0 border-b border-amber-900/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg text-white">
                  مرکز تیکت پشتیبانی و ثبت شکایت از فروشندگان
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold">
                  تحت نظارت اتحادیه صنف پرده
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                ثبت شکایات همراه با مستندات، پیگیری بیعانه، گزارش مغایرت کالیته و مشاوره تخصصی پارچه
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

        {/* Navigation Tabs Bar */}
        <div className="bg-stone-100 border-b border-stone-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('list')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'list'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
              <span>تیکت‌ها و شکایات من</span>
              <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {userTickets.length}
              </span>
            </button>

            <button
              onClick={() => {
                setType('complaint');
                setCategory('fabric_quality_mismatch');
                setActiveView('create_complaint');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'create_complaint'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-rose-800 hover:bg-rose-50 border border-rose-200/80 bg-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ثبت شکایت از فروشنده (با مدارک)</span>
            </button>

            <button
              onClick={() => {
                setType('support');
                setCategory('fabric_consultation');
                setActiveView('create_support');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'create_support'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>درخواست پشتیبانی عمومی</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-stone-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ضمانت داوری رسمی و پیگیری سریع</span>
          </div>
        </div>

        {/* Notifications */}
        {successNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-stone-50/50">

          {/* VIEW 1: TICKETS LIST */}
          {activeView === 'list' && (
            <div className="space-y-4">
              
              {/* Quick Info Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 block mb-0.5">
                      حقوق قانونی شما در دراپینو محفوظ است
                    </span>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      هرگونه تخلف نظیر مغایرت پارچه با کالیته، عدم کسر بیعانه یا تاخیر، مستقیماً توسط کارشناس ناظر اتحادیه بررسی و رسیدگی خواهد شد.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setType('complaint');
                      setActiveView('create_complaint');
                    }}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ثبت شکایت جدید</span>
                  </button>
                </div>
              </div>

              {/* Tickets Cards */}
              {userTickets.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
                  <LifeBuoy className="w-12 h-12 text-stone-300 mx-auto" />
                  <h3 className="text-sm font-bold text-stone-800">
                    تاکنون هیچ تیکت یا شکایتی ثبت نکرده‌اید.
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    در صورت وجود هرگونه ابهام، نیاز به مشاوره در خرید پارچه یا مغایرت در خدمات فروشندگان، تیکت خود را ثبت فرمایید.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setType('complaint');
                        setActiveView('create_complaint');
                      }}
                      className="px-4 py-2 bg-rose-700 text-white text-xs font-bold rounded-xl hover:bg-rose-800 transition-colors"
                    >
                      ثبت شکایت از فروشنده با مدارک
                    </button>
                    <button
                      onClick={() => {
                        setType('support');
                        setActiveView('create_support');
                      }}
                      className="px-4 py-2 bg-stone-100 text-stone-800 text-xs font-bold rounded-xl hover:bg-stone-200 transition-colors border border-stone-200"
                    >
                      درخواست راهنمایی و پشتیبانی
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTickets.map((t) => {
                    const statusBadge = getStatusBadge(t.status);
                    const prioBadge = getPriorityBadge(t.priority);
                    const isComplaint = t.type === 'complaint';

                    return (
                      <div
                        key={t.id}
                        className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 hover:border-amber-300 transition-all shadow-2xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-black text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                                #{t.ticketNumber}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isComplaint ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                                {isComplaint ? 'شکایت رسمی از فروشنده' : 'تیکت پشتیبانی و راهنمایی'}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge.color}`}>
                                {statusBadge.label}
                              </span>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${prioBadge.color}`}>
                                {prioBadge.label}
                              </span>
                            </div>
                            <h4 className="font-bold text-stone-900 text-sm pt-1">
                              {t.subject}
                            </h4>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedTicketId(t.id);
                              setActiveView('detail');
                            }}
                            className="self-end sm:self-center px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <span>مشاهده پاسخ‌ها و گفتگو ({t.messages.length})</span>
                            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                          </button>
                        </div>

                        {/* Details row */}
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-stone-600">
                          {t.targetVendorName && (
                            <span className="flex items-center gap-1 font-medium text-stone-800">
                              <Store className="w-3.5 h-3.5 text-amber-700" />
                              <span>فروشگاه طرف شکایت: {t.targetVendorName}</span>
                            </span>
                          )}
                          {t.orderNumber && (
                            <span className="flex items-center gap-1 font-mono text-stone-700 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200">
                              سفارش: #{t.orderNumber}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-stone-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>ثبت: {t.createdAt}</span>
                          </span>
                          {t.attachments.length > 0 && (
                            <span className="flex items-center gap-1 text-stone-700 bg-amber-50/60 px-2 py-0.5 rounded-md border border-amber-200/60">
                              <Paperclip className="w-3.5 h-3.5 text-amber-700" />
                              <span>{t.attachments.length} مدرک پیوست شده</span>
                            </span>
                          )}
                          {t.unionCaseNumber && (
                            <span className="flex items-center gap-1 text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 font-bold">
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                              <span>پرونده داوری: {t.unionCaseNumber}</span>
                            </span>
                          )}
                        </div>

                        {/* Snippet */}
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed bg-stone-50/60 p-2.5 rounded-xl border border-stone-100">
                          {t.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2 & 3: CREATE COMPLAINT OR SUPPORT */}
          {(activeView === 'create_complaint' || activeView === 'create_support') && (
            <form onSubmit={handleSubmitTicket} className="space-y-6 max-w-3xl mx-auto bg-white p-6 rounded-3xl border border-stone-200 shadow-sm text-right">
              
              {/* Form Header Info */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${type === 'complaint' ? 'bg-rose-600' : 'bg-amber-600'}`} />
                    <h3 className="text-base font-black text-stone-900">
                      {type === 'complaint' ? 'فرم ثبت شکایت رسمی از فروشنده و کارشناس' : 'فرم ثبت درخواست پشتیبانی و راهنمایی'}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    {type === 'complaint'
                      ? 'مدارک و مستندات شما (عکس کالیته، فاکتور، فیش واریز) جهت بررسی توسط بازرس صنف ضمیمه می‌گردد.'
                      : 'پاسخ کارشناسان دراپینو در کمتر از ۳ ساعت کاری در همین بخش و پیامک برای شما ارسال خواهد شد.'}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setType('complaint');
                      setActiveView('create_complaint');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      type === 'complaint' ? 'bg-rose-700 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    شکایت از فروشنده
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('support');
                      setActiveView('create_support');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      type === 'support' ? 'bg-amber-700 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    پشتیبانی عمومی
                  </button>
                </div>
              </div>

              {formError && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 text-xs font-bold animate-in fade-in flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Vendor & Order Selection (Essential for Complaints) */}
              {type === 'complaint' && (
                <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl space-y-3">
                  <span className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-rose-700" />
                    <span>انتخاب فروشگاه طرف شکایت و سفارش مربوطه: *</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        انتخاب از سفارش‌های شما:
                      </label>
                      <select
                        value={selectedOrderId}
                        onChange={(e) => handleOrderChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">-- انتخاب سفارش (اختیاری) --</option>
                        {orders.map((o) => (
                          <option key={o.id} value={o.id}>
                            سفارش #{o.orderNumber} ({o.assignedVendorName || 'در انتظار واگذاری'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        فروشگاه یا گالری طرف شکایت: *
                      </label>
                      <select
                        value={selectedVendorId}
                        onChange={(e) => setSelectedVendorId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">-- انتخاب فروشگاه طرف قرارداد --</option>
                        {vendors.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.city} - {v.ownerName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-800">
                  موضوع و دسته‌بندی اصلی: *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(type === 'complaint' ? COMPLAINT_CATEGORIES : SUPPORT_CATEGORIES).map((cat) => (
                    <div
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                        category === cat.value
                          ? type === 'complaint' 
                            ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-200' 
                            : 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
                          : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-stone-900">{cat.label}</div>
                      <div className="text-[11px] text-stone-500 mt-1 leading-snug">{cat.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    عنوان خلاصه: *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={type === 'complaint' ? 'مثلا: مغایرت کد کالیته مخمل با فاکتور' : 'مثلا: سوال درباره مقاومت پارچه در آفتاب'}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    اولویت رسیدگی:
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700"
                  >
                    <option value="normal">عادی (پاسخ تا ۲۴ ساعت)</option>
                    <option value="important">مهم (پاسخ تا ۶ ساعت)</option>
                    <option value="urgent">فوری / بحرانی (مداخله بازرسی صنف)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  شرح دقیق موضوع و توضیحات: *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    type === 'complaint'
                      ? 'لطفاً جزئیات تخلف، تاریخ مراجعه کارشناس، تفاوت پارچه یا مغایرت قیمت را به طور دقیق بنویسید...'
                      : 'سؤال یا نیاز خود به پشتیبانی، مشاوره فنی یا پیگیری سفارش را مطرح فرمایید...'
                  }
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700 leading-relaxed"
                />
              </div>

              {/* Evidence & Attachments Section */}
              <div className="bg-stone-50 border border-dashed border-stone-300 p-4 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-amber-700" />
                      <span>پیوست مدارک و مستندات اثبات شکایت (عکس کالیته، فاکتور، واریزی):</span>
                    </span>
                    <span className="text-[11px] text-stone-500">
                      فرمت‌های مجاز: JPG, PNG, PDF (تا حجم ۱۰ مگابایت)
                    </span>
                  </div>

                  <label className="px-3.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-center shadow-2xs">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                    <span>انتخاب فایل از دستگاه</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleCustomFileUpload(e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset sample evidence for convenience */}
                {type === 'complaint' && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-200">
                    <span className="text-[10px] text-stone-400 font-medium">پیوست‌های سریع پیشنهادی:</span>
                    <button
                      type="button"
                      onClick={() => handleSimulateAttachment('عکس_کالیته_مشاهده_شده_در_منزل.jpg', 'image')}
                      className="text-[10px] px-2 py-1 bg-white hover:bg-amber-50 text-stone-700 border border-stone-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-amber-600" />
                      <span>عکس کالیته در منزل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateAttachment('تصویر_فاکتور_دستی_فروشگاه.pdf', 'document')}
                      className="text-[10px] px-2 py-1 bg-white hover:bg-amber-50 text-stone-700 border border-stone-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-amber-600" />
                      <span>عکس فاکتور</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateAttachment('فیش_واریز_بیعانه.jpg', 'image')}
                      className="text-[10px] px-2 py-1 bg-white hover:bg-amber-50 text-stone-700 border border-stone-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-amber-600" />
                      <span>فیش واریز بیعانه</span>
                    </button>
                  </div>
                )}

                {/* Attached Files List */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {att.type === 'image' ? (
                            <img src={att.url} alt={att.name} className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-stone-900 block truncate text-[11px]">{att.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono">{att.size || 'پیوست'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveView('list')}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  انصراف و بازگشت
                </button>

                <button
                  type="submit"
                  className={`px-6 py-2.5 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                    type === 'complaint'
                      ? 'bg-rose-700 hover:bg-rose-800'
                      : 'bg-amber-700 hover:bg-amber-800'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{type === 'complaint' ? 'ثبت نهایی شکایت و ارجاع به بازرسی' : 'ارسال تیکت پشتیبانی'}</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 4: TICKET DETAIL & MESSAGES */}
          {activeView === 'detail' && currentSelectedTicket && (
            <div className="space-y-5 max-w-4xl mx-auto">
              
              {/* Back to list bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveView('list')}
                  className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-stone-200"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>بازگشت به لیست تیکت‌ها</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(currentSelectedTicket.status).color}`}>
                    {getStatusBadge(currentSelectedTicket.status).label}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full border ${getPriorityBadge(currentSelectedTicket.priority).color}`}>
                    اولویت: {getPriorityBadge(currentSelectedTicket.priority).label}
                  </span>
                </div>
              </div>

              {/* Ticket Card Details */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                      #{currentSelectedTicket.ticketNumber}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${currentSelectedTicket.type === 'complaint' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                      {currentSelectedTicket.type === 'complaint' ? 'شکایت رسمی از فروشنده' : 'پشتیبانی عمومی'}
                    </span>
                    <span className="text-xs text-stone-500">
                      دسته: {currentSelectedTicket.categoryLabel}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    {currentSelectedTicket.subject}
                  </h3>
                </div>

                {/* Target info pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px]">فروشگاه طرف شکایت / رسیدگی:</span>
                    <span className="font-bold text-stone-800 mt-0.5 block">
                      {currentSelectedTicket.targetVendorName || 'پشتیبانی کل سامانه'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">شماره سفارش مرتبط:</span>
                    <span className="font-mono font-bold text-stone-800 mt-0.5 block">
                      {currentSelectedTicket.orderNumber ? `#${currentSelectedTicket.orderNumber}` : 'ثبت نشده'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">تاریخ و ساعت ثبت اولیه:</span>
                    <span className="font-medium text-stone-700 mt-0.5 block">
                      {currentSelectedTicket.createdAt}
                    </span>
                  </div>
                </div>

                {/* Union Arbitration Box if active */}
                {currentSelectedTicket.unionCaseNumber && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-4 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-purple-900 font-black text-xs">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <span>پرونده ارجاعی به هیئت داوری اتحادیه صنف پرده (شماره {currentSelectedTicket.unionCaseNumber})</span>
                    </div>
                    <p className="text-xs text-purple-950 leading-relaxed font-medium">
                      {currentSelectedTicket.unionArbitrationNotes || 'پرونده جهت بررسی کارشناسان رسمی و صدور رای داوری در دست اقدام است.'}
                    </p>
                  </div>
                )}

                {/* Initial Description */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-700">شرح اولیه درخواست / شکایت:</span>
                  <p className="text-xs text-stone-800 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200/60 whitespace-pre-wrap">
                    {currentSelectedTicket.description}
                  </p>
                </div>

                {/* Evidence Attachments */}
                {currentSelectedTicket.attachments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-amber-700" />
                      <span>مستندات و فایل‌های پیوست شده:</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentSelectedTicket.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            {att.type === 'image' ? (
                              <img src={att.url} alt={att.name} className="w-10 h-10 rounded-lg object-cover border border-stone-200" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-stone-900 block text-xs truncate max-w-[180px]">{att.name}</span>
                              <span className="text-[10px] text-stone-500 font-mono">{att.size || 'فایل ضمیمه'}</span>
                            </div>
                          </div>

                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-100 rounded-lg transition-colors"
                            title="مشاهده مستند"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Messages / Conversation Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-700" />
                  <span>تاریخچه گفتگو و پاسخ‌های ناظران ({currentSelectedTicket.messages.length})</span>
                </h4>

                <div className="space-y-3">
                  {currentSelectedTicket.messages.map((msg) => {
                    const isCustomer = msg.senderRole === 'customer';
                    const isUnion = msg.senderRole === 'union_inspector';

                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                          isCustomer
                            ? 'bg-amber-50/70 border-amber-200 ml-4 sm:ml-12'
                            : isUnion
                            ? 'bg-purple-50/90 border-purple-300 mr-4 sm:mr-12'
                            : 'bg-white border-stone-200 mr-4 sm:mr-12 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-stone-200/50 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">{msg.senderName}</span>
                            <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                              isCustomer
                                ? 'bg-amber-100 text-amber-900'
                                : isUnion
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}>
                              {isCustomer ? 'مشتری' : isUnion ? 'بازرس ویژه اتحادیه صنف' : 'پشتیبانی دراپینو'}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono">{msg.timestamp}</span>
                        </div>

                        <p className="text-stone-800 whitespace-pre-wrap">{msg.message}</p>

                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {msg.attachments.map((a) => (
                              <span key={a.id} className="inline-flex items-center gap-1 text-[11px] bg-white px-2 py-1 rounded-md border border-stone-200 text-stone-700">
                                <Paperclip className="w-3 h-3 text-amber-700" />
                                <span>{a.name}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3">
                <span className="text-xs font-bold text-stone-800 block">
                  ارسال پاسخ تکمیلی یا ارائه مستندات جدید:
                </span>
                
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="پاسخ یا توضیح تکمیلی خود را در اینجا بنویسید..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700 leading-relaxed"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 border border-stone-200">
                      <Paperclip className="w-3.5 h-3.5 text-stone-500" />
                      <span>پیوست مدرک جدید</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleCustomFileUpload(e, true)}
                        className="hidden"
                      />
                    </label>

                    {replyAttachments.length > 0 && (
                      <span className="text-[11px] text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                        {replyAttachments.length} مدرک انتخاب شد
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-5 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ارسال پاسخ به کارشناس</span>
                  </button>
                </div>
              </form>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = (props) => {
  // بازگشت زودهنگام باید خارج از کامپوننت اصلی باشد تا تعداد hookها بین رندرها ثابت بماند
  if (!props.isOpen) return null;
  return <CustomerSupportModalInner {...props} />;
};
