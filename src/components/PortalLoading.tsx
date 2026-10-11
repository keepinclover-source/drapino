import React from 'react';

/** اسکلتون سبک هنگام lazy-load پنل‌ها — جلوگیری از فلیکر خالی */
export const PortalLoading: React.FC<{ label?: string }> = ({ label = 'در حال بارگذاری پنل…' }) => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-right px-4" data-testid="portal-loading">
    <div className="w-10 h-10 rounded-2xl border-2 border-amber-700 border-t-transparent animate-spin" />
    <p className="text-xs font-bold text-stone-600">{label}</p>
  </div>
);
