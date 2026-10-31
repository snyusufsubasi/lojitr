// Recurring Rules engine
import { addDaysIso } from '@/lib/formatters';
import { addMonthsPreserveDay } from './loanMath';

export type RecurringPeriod = 'haftalik' | 'aylik' | 'iki_aylik' | 'uc_aylik' | 'alti_aylik' | 'yillik';

export interface RecurringRule {
  id: string;
  kind: 'masraf' | 'fatura' | 'hatirlatma';
  title: string;
  amount: number;
  period: RecurringPeriod;
  nextDate: string;
  endDate?: string;
  remaining?: number;
  active: boolean;
  category?: string;
  vehicleId?: string;
  contactId?: string;
  moneyAccountId?: string;
}

export function computeNextRecurringDate(currentDate: string, period: RecurringPeriod): string {
  switch (period) {
    case 'haftalik':
      return addDaysIso(currentDate, 7);
    case 'aylik':
      return addMonthsPreserveDay(currentDate, 1);
    case 'iki_aylik':
      return addMonthsPreserveDay(currentDate, 2);
    case 'uc_aylik':
      return addMonthsPreserveDay(currentDate, 3);
    case 'alti_aylik':
      return addMonthsPreserveDay(currentDate, 6);
    case 'yillik':
      return addMonthsPreserveDay(currentDate, 12);
  }
}
