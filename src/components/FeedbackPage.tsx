import React, { useMemo, useState } from 'react';
import { UserProfile } from '../types';
import { APP_VERSION } from '../utils/appInfo';
import {
  BugSeverity,
  ChangelogCategory,
  ChangelogEntry,
  ChangelogStore,
  FeedbackItem,
  FeedbackKind,
  FeedbackStatus,
  CHANGELOG_CATEGORY_LABELS,
  FEEDBACK_KIND_LABELS,
  FEEDBACK_SECTIONS,
  FEEDBACK_STATUS_LABELS,
  SEVERITY_LABELS,
  faDate,
} from '../utils/feedback';

type PageTab = 'submit' | 'board' | 'changelog';

export interface FeedbackSubmitInput {
  kind: FeedbackKind;
  title: string;
  description: string;
  section: string;
  severity?: BugSeverity;
  stepsToReproduce?: string;
  contact?: string;
  guestName?: string;
}

interface FeedbackPageProps {
  currentUser: UserProfile | null;
  feedback: FeedbackItem[];
  changelog: ChangelogStore;
  onSubmitFeedback: (input: FeedbackSubmitInput) => FeedbackItem | null;
  onToggleVote: (feedbackId: string) => void;
  // مخصوص مدیر
  onUpdateFeedback?: (id: string, patch: Partial<Pick<FeedbackItem, 'status' | 'adminReply'>>) => void;
  onDeleteFeedback?: (id: string) => void;
  onAddChangelog?: (entry: Omit<ChangelogEntry, 'id' | 'createdAt' | 'isSystem'>) => void;
  onUpdateChangelog?: (id: string, patch: Partial<ChangelogEntry>) => void;
  onDeleteChangelog?: (id: string) => void;
  onPublishFixedToChangelog?: (feedbackId: string) => void;
}

const fa = (n: number) => n.toLocaleString('fa-IR');
const inputCls =
  'w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500';
const labelCls = 'block text-xs font-bold text-stone-700 mb-1';
const cardCls = 'bg-white rounded-2xl border border-stone-200 p-5 shadow-xs';
const btnPrimary =
  'px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold transition-colors cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed';
const btnGhost =
  'px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-bold cursor-pointer';
const btnDanger =
  'px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer';

const STATUS_TONE: Record<FeedbackStatus, string> = {
  new: 'bg-sky-100 text-sky-800 border-sky-300',
  reviewing: 'bg-amber-100 text-amber-900 border-amber-300',
  planned: 'bg-violet-100 text-violet-800 border-violet-300',
  in_progress: 'bg-orange-100 text-orange-900 border-orange-300',
  fixed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-stone-200 text-stone-700 border-stone-300',
};

const CATEGORY_TONE: Record<ChangelogCategory, string> = {
  fix: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  security: 'bg-rose-100 text-rose-800 border-rose-300',
  improvement: 'bg-sky-100 text-sky-800 border-sky-300',
  feature: 'bg-violet-100 text-violet-800 border-violet-300',
};

const SEVERITY_TONE: Record<BugSeverity, string> = {
  low: 'bg-stone-100 text-stone-700 border-stone-300',
  medium: 'bg-amber-100 text-amber-900 border-amber-300',
  high: 'bg-orange-100 text-orange-900 border-orange-300',
  critical: 'bg-rose-100 text-rose-800 border-rose-300',
};

const Pill: React.FC<{ cls: string; children?: React.ReactNode }> = ({ cls, children }) => (
  <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${cls}`}>{children}</span>
);

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  currentUser,
  feedback,
  changelog,
  onSubmitFeedback,
  onToggleVote,
  onUpdateFeedback,
  onDeleteFeedback,
  onAddChangelog,
  onUpdateChangelog,
  onDeleteChangelog,
  onPublishFixedToChangelog,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [tab, setTab] = useState<PageTab>('submit');

  /* ---------- فرم ثبت ---------- */
  const [kind, setKind] = useState<FeedbackKind>('suggestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [section, setSection] = useState(FEEDBACK_SECTIONS[0]);
  const [severity, setSeverity] = useState<BugSeverity>('medium');
  const [steps, setSteps] = useState('');
  const [contact, setContact] = useState(currentUser?.phone || '');
  const [guestName, setGuestName] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState<FeedbackItem | null>(null);

  /* ---------- فهرست ---------- */
  const [kindFilter, setKindFilter] = useState<'all' | FeedbackKind>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | FeedbackStatus>('all');
  const [mineOnly, setMineOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  /* ---------- فهرست رفع‌شده‌ها ---------- */
  const [catFilter, setCatFilter] = useState<'all' | ChangelogCategory>('all');
  const [clSearch, setClSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const emptyCl = { title: '', description: '', category: 'fix' as ChangelogCategory, date: faDate(), version: '' };
  const [clForm, setClForm] = useState(emptyCl);

  const myId = currentUser?.id || '';

  const stats = useMemo(
    () => ({
      suggestions: feedback.filter((f) => f.kind === 'suggestion').length,
      bugs: feedback.filter((f) => f.kind === 'bug').length,
      open: feedback.filter((f) => f.status !== 'fixed' && f.status !== 'rejected').length,
      fixed: changelog.entries.length,
    }),
    [feedback, changelog]
  );

  const visibleFeedback = useMemo(() => {
    const q = query.trim();
    return feedback
      .filter((f) => (kindFilter === 'all' ? true : f.kind === kindFilter))
      .filter((f) => (statusFilter === 'all' ? true : f.status === statusFilter))
      .filter((f) => (mineOnly ? f.authorId === myId && !!myId : true))
      .filter((f) => (q ? f.title.includes(q) || f.description.includes(q) || f.code.includes(q.toUpperCase()) : true))
      .sort((a, b) => b.voters.length - a.voters.length || b.createdAt - a.createdAt);
  }, [feedback, kindFilter, statusFilter, mineOnly, query, myId]);

  const visibleChangelog = useMemo(() => {
    const q = clSearch.trim();
    return [...changelog.entries]
      .filter((e) => (catFilter === 'all' ? true : e.category === catFilter))
      .filter((e) => (q ? e.title.includes(q) || e.description.includes(q) : true))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [changelog, catFilter, clSearch]);

  const groupedChangelog = useMemo(() => {
    const groups: { date: string; items: ChangelogEntry[] }[] = [];
    for (const e of visibleChangelog) {
      const g = groups.find((x) => x.date === e.date);
      if (g) g.items.push(e);
      else groups.push({ date: e.date, items: [e] });
    }
    return groups;
  }, [visibleChangelog]);

  const handleSubmit = () => {
    setFormError('');
    if (title.trim().length < 5) return setFormError('عنوان باید حداقل ۵ نویسه باشد.');
    if (description.trim().length < 10) return setFormError('توضیحات باید حداقل ۱۰ نویسه باشد.');
    if (!currentUser && !guestName.trim()) return setFormError('لطفاً نام خود را وارد کنید.');
    const created = onSubmitFeedback({
      kind,
      title: title.trim(),
      description: description.trim(),
      section,
      severity: kind === 'bug' ? severity : undefined,
      stepsToReproduce: kind === 'bug' ? steps.trim() || undefined : undefined,
      contact: contact.trim() || undefined,
      guestName: guestName.trim() || undefined,
    });
    if (!created) return setFormError('ثبت انجام نشد. لطفاً دوباره تلاش کنید.');
    setSubmitted(created);
    setTitle('');
    setDescription('');
    setSteps('');
  };

  const startEditCl = (e: ChangelogEntry) => {
    setEditingId(e.id);
    setClForm({ title: e.title, description: e.description, category: e.category, date: e.date, version: e.version || '' });
    setTab('changelog');
  };

  const saveCl = () => {
    if (!clForm.title.trim() || !clForm.description.trim()) return;
    if (editingId) {
      onUpdateChangelog?.(editingId, { ...clForm, version: clForm.version.trim() || undefined });
    } else {
      onAddChangelog?.({ ...clForm, version: clForm.version.trim() || undefined });
    }
    setEditingId(null);
    setClForm({ ...emptyCl, date: faDate() });
  };

  const tabs: { id: PageTab; label: string }[] = [
    { id: 'submit', label: 'ثبت پیشنهاد یا گزارش ایراد' },
    { id: 'board', label: `پیشنهادها و گزارش‌ها (${fa(feedback.length)})` },
    { id: 'changelog', label: `فهرست رفع خطاها و بهبودها (${fa(stats.fixed)})` },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-right space-y-6" data-testid="feedback-page">
      {/* سربرگ */}
      <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black">پیشنهاد، گزارش ایراد و فهرست رفع خطاها</h1>
        <p className="text-[11px] text-stone-400 font-mono" dir="ltr">
          Drapino v{APP_VERSION}
        </p>
        <p className="text-sm text-stone-300 leading-relaxed max-w-2xl">
          نظر شما مسیر بهبود دراپینو را مشخص می‌کند. پیشنهاد کاربری بدهید یا ایرادی را که دیده‌اید گزارش کنید؛ وضعیت رسیدگی را پیگیری کنید و فهرست
          خطاهایی را که تاکنون رفع شده ببینید.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            ['پیشنهادها', stats.suggestions],
            ['گزارش ایراد', stats.bugs],
            ['در انتظار رسیدگی', stats.open],
            ['مورد رفع/بهبود شده', stats.fixed],
          ].map(([lab, val]) => (
            <div key={lab as string} className="bg-white/10 rounded-2xl p-3">
              <div className="text-xl font-black font-mono">{fa(val as number)}</div>
              <div className="text-[11px] text-stone-300 mt-0.5">{lab}</div>
            </div>
          ))}
        </div>
      </div>

      {/* تب‌ها */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
              tab === t.id ? 'bg-amber-700 text-white border-amber-700 shadow-sm' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ================= ثبت ================= */}
      {tab === 'submit' && (
        <div className={`${cardCls} space-y-5`}>
          {submitted ? (
            <div className="text-center py-8 space-y-3" data-testid="feedback-success">
              <div className="text-4xl">✅</div>
              <h2 className="text-lg font-black text-stone-900">ثبت شد؛ سپاس از شما</h2>
              <p className="text-sm text-stone-600">
                کد پیگیری شما: <span className="font-mono font-black text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">{submitted.code}</span>
              </p>
              <p className="text-xs text-stone-500">وضعیت رسیدگی را در بخش «پیشنهادها و گزارش‌ها» می‌توانید ببینید.</p>
              <div className="flex justify-center gap-2 pt-2">
                <button type="button" className={btnPrimary} onClick={() => { setSubmitted(null); setTab('board'); setMineOnly(true); }}>
                  مشاهده‌ی موارد من
                </button>
                <button type="button" className={btnGhost} onClick={() => setSubmitted(null)}>
                  ثبت مورد جدید
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className={labelCls}>نوع</label>
                <div className="grid grid-cols-2 gap-2 max-w-md">
                  {(['suggestion', 'bug'] as FeedbackKind[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKind(k)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-bold border cursor-pointer ${
                        kind === k ? (k === 'bug' ? 'bg-rose-600 text-white border-rose-600' : 'bg-amber-700 text-white border-amber-700') : 'bg-white text-stone-700 border-stone-300'
                      }`}
                    >
                      {k === 'bug' ? '🐞 ' : '💡 '}
                      {FEEDBACK_KIND_LABELS[k]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>بخش مربوطه</label>
                  <select value={section} onChange={(e) => setSection(e.target.value)} className={inputCls}>
                    {FEEDBACK_SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {kind === 'bug' && (
                  <div>
                    <label className={labelCls}>شدت مشکل</label>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value as BugSeverity)} className={inputCls}>
                      {(Object.keys(SEVERITY_LABELS) as BugSeverity[]).map((s) => (
                        <option key={s} value={s}>
                          {SEVERITY_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className={labelCls}>عنوان</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                    className={inputCls}
                    placeholder={kind === 'bug' ? 'مثلاً: بعد از انتخاب شهر صفحه سفید می‌شود' : 'مثلاً: امکان جستجو در کاتالوگ بر اساس رنگ'}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>{kind === 'bug' ? 'شرح مشکل (چه اتفاقی افتاد؟)' : 'شرح پیشنهاد (چه چیزی بهتر می‌شود و چرا؟)'}</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={3000} className={inputCls} />
                </div>
                {kind === 'bug' && (
                  <div className="md:col-span-2">
                    <label className={labelCls}>مراحل تکرار مشکل (اختیاری، اما بسیار کمک‌کننده)</label>
                    <textarea
                      value={steps}
                      onChange={(e) => setSteps(e.target.value)}
                      rows={3}
                      maxLength={2000}
                      className={inputCls}
                      placeholder={'۱) وارد پنل فروشگاه شدم\n۲) روی ... کلیک کردم\n۳) ...'}
                    />
                  </div>
                )}
                {!currentUser && (
                  <div>
                    <label className={labelCls}>نام شما</label>
                    <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputCls} />
                  </div>
                )}
                <div>
                  <label className={labelCls}>راه تماس (اختیاری؛ فقط برای مدیر نمایش داده می‌شود)</label>
                  <input value={contact} onChange={(e) => setContact(e.target.value)} className={inputCls} dir="ltr" placeholder="09..." />
                </div>
              </div>

              {kind === 'bug' && (
                <p className="text-[11px] text-stone-500">
                  برای کمک به رفع سریع‌تر، نوع مرورگر، اندازه‌ی صفحه و صفحه‌ی فعال به‌صورت خودکار همراه گزارش ثبت می‌شود (اطلاعات شخصی نیست).
                </p>
              )}
              {formError && <div className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">{formError}</div>}
              <button type="button" className={btnPrimary} onClick={handleSubmit}>
                ثبت {FEEDBACK_KIND_LABELS[kind]}
              </button>
            </>
          )}
        </div>
      )}

      {/* ================= فهرست ================= */}
      {tab === 'board' && (
        <div className="space-y-4">
          <div className={`${cardCls} flex flex-wrap items-end gap-3`}>
            <div className="flex-1 min-w-[180px]">
              <label className={labelCls}>جستجو (عنوان، متن یا کد پیگیری)</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>نوع</label>
              <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value as 'all' | FeedbackKind)} className={inputCls}>
                <option value="all">همه</option>
                <option value="suggestion">پیشنهادها</option>
                <option value="bug">گزارش ایرادها</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>وضعیت</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | FeedbackStatus)} className={inputCls}>
                <option value="all">همه</option>
                {(Object.keys(FEEDBACK_STATUS_LABELS) as FeedbackStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {FEEDBACK_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer pb-2">
              <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} className="w-4 h-4 accent-amber-700" />
              فقط موارد من
            </label>
          </div>

          {visibleFeedback.length === 0 ? (
            <div className={`${cardCls} text-center py-12 text-sm text-stone-500`}>
              موردی یافت نشد.{' '}
              <button type="button" className="text-amber-800 font-bold underline cursor-pointer" onClick={() => setTab('submit')}>
                اولین مورد را ثبت کنید
              </button>
            </div>
          ) : (
            visibleFeedback.map((f) => {
              const voted = !!myId && f.voters.includes(myId);
              const draft = replyDrafts[f.id] ?? f.adminReply ?? '';
              return (
                <div key={f.id} className={`${cardCls} space-y-3`} data-testid="feedback-item">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      title={currentUser ? 'من هم موافقم' : 'برای رأی دادن وارد شوید'}
                      disabled={!currentUser}
                      onClick={() => onToggleVote(f.id)}
                      className={`shrink-0 w-14 py-2 rounded-xl border text-center cursor-pointer disabled:cursor-not-allowed ${
                        voted ? 'bg-amber-700 text-white border-amber-700' : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div className="text-sm leading-none">▲</div>
                      <div className="font-black font-mono text-sm mt-1">{fa(f.voters.length)}</div>
                    </button>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill cls={f.kind === 'bug' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300'}>
                          {FEEDBACK_KIND_LABELS[f.kind]}
                        </Pill>
                        <Pill cls={STATUS_TONE[f.status]}>{FEEDBACK_STATUS_LABELS[f.status]}</Pill>
                        {f.severity && <Pill cls={SEVERITY_TONE[f.severity]}>شدت: {SEVERITY_LABELS[f.severity].split(' ')[0]}</Pill>}
                        <span className="text-[11px] text-stone-400 font-mono">{f.code}</span>
                      </div>
                      <h3 className="font-black text-stone-900">{f.title}</h3>
                      <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{f.description}</p>
                      {f.stepsToReproduce && (
                        <p className="text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded-lg p-2.5 whitespace-pre-line">
                          <span className="font-bold">مراحل تکرار: </span>
                          {f.stepsToReproduce}
                        </p>
                      )}
                      <div className="text-[11px] text-stone-500">
                        {f.section} — {f.authorName} — {f.createdAtLabel}
                      </div>
                    </div>
                  </div>

                  {f.adminReply && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 leading-relaxed">
                      <span className="font-black">پاسخ تیم دراپینو{f.adminReplyAt ? ` (${f.adminReplyAt})` : ''}: </span>
                      {f.adminReply}
                    </div>
                  )}

                  {f.changelogId && (
                    <button type="button" className="text-[11px] font-bold text-emerald-800 underline cursor-pointer" onClick={() => setTab('changelog')}>
                      این مورد در «فهرست رفع خطاها» ثبت شده است ←
                    </button>
                  )}

                  {isAdmin && (
                    <div className="border-t border-dashed border-stone-300 pt-3 space-y-2" data-testid="feedback-admin-controls">
                      <div className="text-[11px] font-bold text-stone-500">
                        ابزار مدیر {f.contact ? `— تماس: ${f.contact}` : ''} {f.environment ? `— ${f.environment}` : ''}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                        <select value={f.status} onChange={(e) => onUpdateFeedback?.(f.id, { status: e.target.value as FeedbackStatus })} className={inputCls}>
                          {(Object.keys(FEEDBACK_STATUS_LABELS) as FeedbackStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {FEEDBACK_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={draft}
                          onChange={(e) => setReplyDrafts({ ...replyDrafts, [f.id]: e.target.value })}
                          rows={2}
                          placeholder="پاسخ برای کاربر..."
                          className={`${inputCls} md:col-span-2`}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className={btnGhost} onClick={() => onUpdateFeedback?.(f.id, { adminReply: draft.trim() })}>
                          ذخیره‌ی پاسخ
                        </button>
                        {f.status === 'fixed' && !f.changelogId && (
                          <button type="button" className={btnPrimary} onClick={() => onPublishFixedToChangelog?.(f.id)}>
                            ثبت در فهرست رفع‌شده‌ها
                          </button>
                        )}
                        <button
                          type="button"
                          className={btnDanger}
                          onClick={() => {
                            if (window.confirm('این مورد برای همیشه حذف شود؟')) onDeleteFeedback?.(f.id);
                          }}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= فهرست رفع‌شده‌ها ================= */}
      {tab === 'changelog' && (
        <div className="space-y-4">
          {isAdmin && (
            <div className={`${cardCls} space-y-3`} data-testid="changelog-form">
              <h3 className="font-black text-stone-900">{editingId ? 'ویرایش مورد' : 'ثبت مورد جدید در فهرست رفع خطاها و بهبودها'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-4">
                  <label className={labelCls}>عنوان</label>
                  <input value={clForm.title} onChange={(e) => setClForm({ ...clForm, title: e.target.value })} className={inputCls} />
                </div>
                <div className="md:col-span-4">
                  <label className={labelCls}>شرح</label>
                  <textarea value={clForm.description} onChange={(e) => setClForm({ ...clForm, description: e.target.value })} rows={3} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>دسته</label>
                  <select value={clForm.category} onChange={(e) => setClForm({ ...clForm, category: e.target.value as ChangelogCategory })} className={inputCls}>
                    {(Object.keys(CHANGELOG_CATEGORY_LABELS) as ChangelogCategory[]).map((c) => (
                      <option key={c} value={c}>
                        {CHANGELOG_CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>تاریخ (شمسی)</label>
                  <input value={clForm.date} onChange={(e) => setClForm({ ...clForm, date: e.target.value })} className={inputCls} dir="ltr" />
                </div>
                <div>
                  <label className={labelCls}>نسخه (اختیاری)</label>
                  <input value={clForm.version} onChange={(e) => setClForm({ ...clForm, version: e.target.value })} className={inputCls} dir="ltr" placeholder="1.2.1" />
                </div>
                <div className="flex items-end gap-2">
                  <button type="button" className={btnPrimary} disabled={!clForm.title.trim() || !clForm.description.trim()} onClick={saveCl}>
                    {editingId ? 'ذخیره‌ی تغییرات' : 'ثبت در فهرست'}
                  </button>
                  {editingId && (
                    <button type="button" className={btnGhost} onClick={() => { setEditingId(null); setClForm({ ...emptyCl, date: faDate() }); }}>
                      انصراف
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className={`${cardCls} flex flex-wrap items-end gap-3`}>
            <div className="flex-1 min-w-[180px]">
              <label className={labelCls}>جستجو</label>
              <input value={clSearch} onChange={(e) => setClSearch(e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setCatFilter('all')} className={`${btnGhost} ${catFilter === 'all' ? '!bg-stone-800 !text-white' : ''}`}>
                همه
              </button>
              {(Object.keys(CHANGELOG_CATEGORY_LABELS) as ChangelogCategory[]).map((c) => (
                <button key={c} type="button" onClick={() => setCatFilter(c)} className={`${btnGhost} ${catFilter === c ? '!bg-stone-800 !text-white' : ''}`}>
                  {CHANGELOG_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          {groupedChangelog.length === 0 ? (
            <div className={`${cardCls} text-center py-10 text-sm text-stone-500`}>موردی یافت نشد.</div>
          ) : (
            groupedChangelog.map((g) => (
              <div key={g.date} className="space-y-3">
                <h3 className="text-sm font-black text-stone-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                  {g.date}
                </h3>
                {g.items.map((e) => (
                  <div key={e.id} className={`${cardCls} space-y-2 mr-4`} data-testid="changelog-item">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill cls={CATEGORY_TONE[e.category]}>{CHANGELOG_CATEGORY_LABELS[e.category]}</Pill>
                      {e.version && <span className="text-[11px] font-mono text-stone-500 bg-stone-100 rounded px-1.5 py-0.5">v{e.version}</span>}
                    </div>
                    <h4 className="font-black text-stone-900">{e.title}</h4>
                    <p className="text-sm text-stone-700 leading-relaxed">{e.description}</p>
                    {isAdmin && (
                      <div className="flex gap-2 pt-1">
                        <button type="button" className={btnGhost} onClick={() => startEditCl(e)}>
                          ویرایش
                        </button>
                        <button
                          type="button"
                          className={btnDanger}
                          onClick={() => {
                            if (window.confirm('این مورد از فهرست حذف شود؟')) onDeleteChangelog?.(e.id);
                          }}
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
