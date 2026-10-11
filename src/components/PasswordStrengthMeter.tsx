import React from 'react';
import { Check, X } from 'lucide-react';
import { evaluatePassword } from '../utils/passwordStrength';

interface PasswordStrengthMeterProps {
  password: string;
  phone?: string;
}

const BAR_COLORS = ['bg-stone-200', 'bg-rose-500', 'bg-orange-500', 'bg-lime-500', 'bg-emerald-600'];
const TEXT_COLORS = ['text-stone-400', 'text-rose-600', 'text-orange-600', 'text-lime-700', 'text-emerald-700'];

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password, phone }) => {
  if (!password) return null;
  const r = evaluatePassword(password, phone);

  return (
    <div className="mt-1.5 space-y-1.5" data-testid="password-strength">
      <div className="flex items-center gap-2">
        <div className="flex-1 grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-colors ${r.score >= i ? BAR_COLORS[r.score] : 'bg-stone-200'}`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-bold shrink-0 ${TEXT_COLORS[r.score]}`}>{r.label}</span>
      </div>
      <ul className="space-y-0.5">
        {r.checks.map((c) => (
          <li key={c.id} className={`flex items-center gap-1 text-[10px] ${c.ok ? 'text-emerald-700' : 'text-stone-500'}`}>
            {c.ok ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0 text-stone-400" />}
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
