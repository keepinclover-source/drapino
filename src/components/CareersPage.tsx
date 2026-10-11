import React, { useState, useRef } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Upload,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Send,
  AlertCircle,
  ShoppingBag,
  Calculator,
  Wrench,
  ClipboardList,
} from 'lucide-react';
import { JobApplication, JobDepartment, SiteThemeSettings } from '../types';

const DEPARTMENTS: JobDepartment[] = ['بازرگانی', 'حسابداری', 'فنی', 'اداری'];

const DEPT_DESC: Record<JobDepartment, string> = {
  بازرگانی: 'فروش، بازاریابی، توسعه شبکه همکاران و روابط تجاری',
  حسابداری: 'امور مالی، حسابرسی، تسویه حساب‌ها و گزارش‌گیری',
  فنی: 'توسعه نرم‌افزار، پشتیبانی فنی و زیرساخت سامانه',
  اداری: 'منابع انسانی، امور اداری و هماهنگی داخلی',
};

const DEPT_ICON: Record<JobDepartment, React.ReactNode> = {
  بازرگانی: <ShoppingBag className="w-4 h-4" />,
  حسابداری: <Calculator className="w-4 h-4" />,
  فنی: <Wrench className="w-4 h-4" />,
  اداری: <ClipboardList className="w-4 h-4" />,
};

interface CareersPageProps {
  onSubmitApplication: (app: Omit<JobApplication, 'id' | 'status' | 'createdAt' | 'createdAtTs' | 'updatedAt'>) => void;
  themeSettings?: SiteThemeSettings;
}

const inputCls =
  'w-full px-3 py-2.5 border border-stone-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-right';
const labelCls = 'block text-xs font-bold text-stone-700 mb-1.5';

export const CareersPage: React.FC<CareersPageProps> = ({ onSubmitApplication, themeSettings }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [department, setDepartment] = useState<JobDepartment | ''>('');
  const [education, setEducation] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeDataUrl, setResumeDataUrl] = useState('');
  const [resumeSize, setResumeSize] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (file.type !== 'application/pdf') {
      setError('فقط فایل PDF برای رزومه پذیرفته می‌شود.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم فایل رزومه نباید بیشتر از ۵ مگابایت باشد.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setResumeDataUrl(String(reader.result || ''));
      setResumeFileName(file.name);
      setResumeSize(`${(file.size / 1024).toFixed(0)} کیلوبایت`);
    };
    reader.onerror = () => {
      setError('خطا در خواندن فایل. لطفاً دوباره تلاش کنید.');
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setCity('');
    setDepartment('');
    setEducation('');
    setExperienceYears('');
    setCoverLetter('');
    setResumeFileName('');
    setResumeDataUrl('');
    setResumeSize('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!fullName.trim() || !phone.trim() || !email.trim() || !city.trim() || !department) {
      setError('لطفاً تمام فیلدهای ضروری را تکمیل کنید.');
      return;
    }
    if (!resumeDataUrl || !resumeFileName) {
      setError('آپلود فایل رزومه (PDF) الزامی است.');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setError('شماره تماس معتبر وارد کنید.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('ایمیل معتبر وارد کنید.');
      return;
    }

    setSubmitting(true);
    try {
      onSubmitApplication({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        department: department as JobDepartment,
        education: education.trim() || undefined,
        experienceYears: experienceYears.trim() || undefined,
        coverLetter: coverLetter.trim() || undefined,
        resumeFileName,
        resumeDataUrl,
        resumeSize,
      });
      setSuccess(true);
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 py-8 animate-in fade-in duration-300 text-right" data-testid="careers-page">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 p-8 sm:p-12 border border-stone-800 shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>استخدام در {themeSettings?.siteName || 'دراپینو'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            به تیم{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              {themeSettings?.siteName || 'دراپینو'}
            </span>{' '}
            بپیوندید
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed">
            اگر به دنبال فرصت شغلی در حوزه دکوراسیون، فناوری و خدمات منزل هستید، فرم زیر را تکمیل و رزومه خود را ارسال کنید.
            درخواست شما مستقیماً در پنل مدیریت بررسی خواهد شد.
          </p>
        </div>
      </section>

      {/* Departments preview */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-600" />
          دپارتمان‌های فعال
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEPARTMENTS.map((d) => (
            <div
              key={d}
              className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                department === d
                  ? 'border-amber-500 bg-amber-50 shadow-sm'
                  : 'border-stone-200 bg-white hover:border-amber-300'
              }`}
              onClick={() => setDepartment(d)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex ${department === d ? 'text-amber-600' : 'text-stone-400'}`}>
                  {DEPT_ICON[d]}
                </span>
                <span className="font-bold text-sm text-stone-900">{d}</span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">{DEPT_DESC[d]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-black text-stone-900 mb-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            فرم درخواست استخدام
          </h2>
          <p className="text-xs text-stone-500 mb-6">فیلدهای ستاره‌دار الزامی هستند. رزومه فقط با فرمت PDF پذیرفته می‌شود.</p>

          {success && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">درخواست شما با موفقیت ثبت شد.</p>
                <p className="text-xs mt-1 text-emerald-700">تیم منابع انسانی در صورت نیاز با شما تماس خواهد گرفت.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="careers-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  <User className="w-3.5 h-3.5 inline ml-1 text-amber-600" />
                  نام و نام خانوادگی *
                </label>
                <input
                  type="text"
                  className={inputCls}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: علی محمدی"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>
                  <Phone className="w-3.5 h-3.5 inline ml-1 text-amber-600" />
                  شماره موبایل *
                </label>
                <input
                  type="tel"
                  className={inputCls}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="۰۹۱۲xxxxxxx"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  <Mail className="w-3.5 h-3.5 inline ml-1 text-amber-600" />
                  ایمیل *
                </label>
                <input
                  type="email"
                  className={inputCls}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>
                  <MapPin className="w-3.5 h-3.5 inline ml-1 text-amber-600" />
                  شهر محل سکونت *
                </label>
                <input
                  type="text"
                  className={inputCls}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: تهران"
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>دپارتمان مورد نظر *</label>
              <select
                className={inputCls}
                value={department}
                onChange={(e) => setDepartment(e.target.value as JobDepartment | '')}
                required
              >
                <option value="">انتخاب دپارتمان...</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  <GraduationCap className="w-3.5 h-3.5 inline ml-1 text-amber-600" />
                  مدرک تحصیلی
                </label>
                <input
                  type="text"
                  className={inputCls}
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="مثال: کارشناسی مدیریت"
                />
              </div>
              <div>
                <label className={labelCls}>سابقه کار (سال)</label>
                <input
                  type="text"
                  className={inputCls}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="مثال: ۳"
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>توضیحات / انگیزه‌نامه</label>
              <textarea
                className={`${inputCls} min-h-[100px] resize-y`}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="چرا می‌خواهید به تیم دراپینو بپیوندید؟"
                rows={4}
              />
            </div>

            {/* Resume upload */}
            <div>
              <label className={labelCls}>
                <Upload className="w-3.5 h-3.5 inline ml-1 text-amber-600" />
                آپلود رزومه (PDF) *
              </label>
              <div
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-colors ${
                  resumeFileName ? 'border-emerald-400 bg-emerald-50' : 'border-stone-300 bg-stone-50 hover:border-amber-400'
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  id="resume-upload"
                  onChange={handleFileChange}
                />
                <label htmlFor="resume-upload" className="cursor-pointer block space-y-2">
                  {resumeFileName ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="text-sm font-bold text-emerald-800">{resumeFileName}</p>
                      {resumeSize && <p className="text-xs text-emerald-600">{resumeSize}</p>}
                      <p className="text-[11px] text-stone-500">برای تغییر فایل کلیک کنید</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                      <p className="text-sm font-bold text-stone-700">انتخاب فایل PDF رزومه</p>
                      <p className="text-xs text-stone-500">حداکثر ۵ مگابایت</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold transition-colors cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'در حال ارسال...' : 'ارسال درخواست استخدام'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
