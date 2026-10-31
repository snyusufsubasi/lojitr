// Formatters for Currency, Dates, Numbers in Turkish locale

const tryFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number | null | undefined, currency: string = 'TRY'): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '0,00 ₺';
  
  if (currency === 'TRY') {
    return tryFormatter.format(amount).replace('TRY', '₺');
  }
  
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
  return `${numFormatter.format(amount)} ${symbol}`;
}

export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(val)) return '0';
  return numFormatter.format(val);
}

export function formatDateShort(isoDate?: string | null): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length < 3) return isoDate;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

export function formatDateFull(isoDate?: string | null): string {
  if (!isoDate) return '-';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
