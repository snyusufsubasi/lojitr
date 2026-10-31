// Multi-currency and FX rate calculations
export type CurrencyCode = 'TRY' | 'USD' | 'EUR' | 'GBP';

export const CURRENCIES: Array<{ code: CurrencyCode; symbol: string; label: string }> = [
  { code: 'TRY', symbol: '₺', label: 'TL (₺)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
];

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export function normalizeFxPayload(
  input: { currency?: CurrencyCode; originalAmount?: number; fxRate?: number; baseAmount: number },
  baseCurrency: CurrencyCode = 'TRY'
): { amount: number; currency?: CurrencyCode; originalAmount?: number; fxRate?: number } {
  const cur = input.currency || baseCurrency;
  if (cur === baseCurrency) {
    return {
      amount: round2(input.baseAmount),
      currency: undefined,
      originalAmount: undefined,
      fxRate: undefined,
    };
  }
  const orig = round2(input.originalAmount ?? input.baseAmount);
  const rate = input.fxRate && input.fxRate > 0 ? input.fxRate : 1;
  return {
    amount: round2(orig * rate),
    currency: cur,
    originalAmount: orig,
    fxRate: rate,
  };
}

export async function fetchLiveFxRates(): Promise<Record<CurrencyCode, number>> {
  const defaultRates: Record<CurrencyCode, number> = {
    TRY: 1,
    USD: 36.50,
    EUR: 39.80,
    GBP: 46.20,
  };
  return defaultRates;
}
