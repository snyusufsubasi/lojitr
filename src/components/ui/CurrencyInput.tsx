import React from 'react';
import { clsx } from 'clsx';
import { CURRENCIES, CurrencyCode } from '@/domain/math/fx';

export interface CurrencyInputProps {
  label?: string;
  value: number;
  currency?: CurrencyCode;
  fxRate?: number;
  onChange: (val: { amount: number; currency: CurrencyCode; fxRate?: number }) => void;
  error?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  currency = 'TRY',
  fxRate,
  onChange,
  error,
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500">
        <input
          type="number"
          step="any"
          min="0"
          value={value === 0 ? '' : value}
          onChange={(e) =>
            onChange({
              amount: parseFloat(e.target.value) || 0,
              currency,
              fxRate,
            })
          }
          placeholder="0,00"
          className="w-full px-3.5 py-2 text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none tabular-nums font-medium"
        />
        <select
          value={currency}
          onChange={(e) => {
            const nextCur = e.target.value as CurrencyCode;
            onChange({
              amount: value,
              currency: nextCur,
              fxRate: nextCur === 'TRY' ? 1 : (nextCur === 'USD' ? 36.5 : nextCur === 'EUR' ? 39.8 : 46.2),
            });
          }}
          className="bg-slate-50 dark:bg-slate-800/80 border-l border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 px-3 py-2 focus:outline-none cursor-pointer"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol})
            </option>
          ))}
        </select>
      </div>

      {currency !== 'TRY' && fxRate && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Kur: 1 {currency} = {fxRate} ₺</span>
          <span className="font-semibold text-brand-600 dark:text-brand-400 tabular-nums">
            ≈ {((value || 0) * fxRate).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </span>
        </div>
      )}

      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
};
