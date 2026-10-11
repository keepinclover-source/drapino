import React from 'react';
import { X, Calculator, ArrowLeft, ArrowRight, Info } from 'lucide-react';

interface QuoteShellProps {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  proceedLabel: string;
  onProceed: () => void;
  proceedDisabled?: boolean;
  children: React.ReactNode;
}

/** قاب مشترک پنجره‌های استعلام (سربرگ، بدنه اسکرول‌دار، دکمه‌های پایین) */
export const QuoteShell: React.FC<QuoteShellProps> = ({
  title,
  onClose,
  onBack,
  proceedLabel,
  onProceed,
  proceedDisabled,
  children,
}) => (
  <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[calc(100vh-2rem)] flex flex-col border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50 shrink-0">
        <div className="flex items-center gap-2 text-stone-900">
          <Calculator className="w-5 h-5 text-amber-700" />
          <h3 className="font-bold text-base sm:text-lg">{title}</h3>
        </div>
        <button
          onClick={onClose}
          aria-label="بستن"
          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-right">{children}</div>

      <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>تغییر انتخاب</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            بستن
          </button>
        </div>

        <button
          type="button"
          onClick={onProceed}
          disabled={proceedDisabled}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <span>{proceedLabel}</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  testId?: string;
}

export const NumberField: React.FC<NumberFieldProps> = ({ label, value, onChange, unit, step = 0.1, min = 0, max, testId }) => (
  <div>
    <label className="block text-xs font-semibold text-stone-700 mb-1.5">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : 0}
        data-testid={testId}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg text-left font-mono tabular-nums focus:outline-amber-600"
      />
      {unit && <span className="text-xs text-stone-500 whitespace-nowrap">{unit}</span>}
    </div>
  </div>
);

interface ChoiceGroupProps<T extends string> {
  label: string;
  value: T;
  options: { id: T; title: string; hint?: string }[];
  onChange: (v: T) => void;
  columns?: string;
  testIdPrefix?: string;
}

export function ChoiceGroup<T extends string>({ label, value, options, onChange, columns = 'grid-cols-2 sm:grid-cols-3', testIdPrefix }: ChoiceGroupProps<T>) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-700 mb-2">{label}</label>
      <div className={`grid ${columns} gap-2`}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            data-testid={testIdPrefix ? `${testIdPrefix}-${o.id}` : undefined}
            aria-pressed={value === o.id}
            className={`p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
              value === o.id
                ? 'border-amber-700 bg-amber-50/70 text-amber-900 font-bold'
                : 'border-stone-200 hover:border-stone-300 text-stone-700'
            }`}
          >
            <div>{o.title}</div>
            {o.hint && <div className="text-[10px] text-stone-500 font-normal mt-0.5">{o.hint}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

export const CheckRow: React.FC<{ id: string; checked: boolean; onChange: (v: boolean) => void; label: string }> = ({
  id,
  checked,
  onChange,
  label,
}) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 text-amber-700 rounded border-stone-300"
    />
    <label htmlFor={id} className="text-xs font-medium text-stone-700 cursor-pointer">
      {label}
    </label>
  </div>
);

export const ResultLine: React.FC<{ label: string; value: string; muted?: boolean }> = ({ label, value, muted }) => (
  <div className={`flex items-center justify-between text-xs ${muted ? 'text-stone-400' : 'text-stone-300'}`}>
    <span>{label}</span>
    <span className="font-bold text-white tabular-nums">{value}</span>
  </div>
);

export const QuoteDisclaimer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 text-xs text-stone-700 flex items-start gap-2">
    <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);
