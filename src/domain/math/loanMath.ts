// Loan Amortization Schedule & Annuity Math
import { round2 } from './fx';

export function addMonthsPreserveDay(isoDate: string, monthsToAdd: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const totalMonths = y * 12 + (m - 1) + monthsToAdd;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;
  const maxDayInMonth = new Date(targetYear, targetMonth, 0).getDate();
  const finalDay = Math.min(d, maxDayInMonth);
  return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(finalDay).padStart(2, '0')}`;
}

export interface ScheduleDraftRow {
  no: number;
  dueDate: string;
  principal: number;
  interest: number;
  amount: number;
  remainingBalance: number;
}

export function buildAmortizationSchedule(input: {
  principal: number;
  count: number;
  firstDueDate: string;
  monthlyRate?: number;
  monthlyPayment?: number;
}): ScheduleDraftRow[] {
  const count = Math.max(1, Math.min(240, Math.round(input.count || 1)));
  const P = Math.max(0, input.principal || 0);
  if (P <= 0) return [];

  if (input.monthlyPayment && input.monthlyPayment > 0) {
    const M = round2(input.monthlyPayment);
    const totalPay = round2(M * count);
    const totalInt = Math.max(0, round2(totalPay - P));
    const basePrin = round2(P / count);
    const baseInt = round2(totalInt / count);
    let remP = P;
    let remI = totalInt;
    const rows: ScheduleDraftRow[] = [];

    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const prin = isLast ? round2(remP) : Math.min(remP, basePrin);
      const intr = isLast ? round2(remI) : Math.min(remI, baseInt);
      const amt = round2(prin + intr);
      remP = Math.max(0, round2(remP - prin));
      remI = Math.max(0, round2(remI - intr));
      rows.push({
        no: i + 1,
        dueDate: addMonthsPreserveDay(input.firstDueDate, i),
        principal: prin,
        interest: intr,
        amount: amt,
        remainingBalance: remP,
      });
    }
    return rows;
  }

  const r = Math.max(0, input.monthlyRate ?? 0) / 100;
  let M = 0;
  if (r === 0) {
    M = round2(P / count);
  } else {
    const f = Math.pow(1 + r, count);
    M = round2((P * (r * f)) / (f - 1));
  }

  let remP = P;
  const rows: ScheduleDraftRow[] = [];
  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const intr = round2(remP * r);
    let prin: number;
    let amt: number;
    if (isLast) {
      prin = round2(remP);
      amt = round2(prin + intr);
    } else {
      prin = Math.max(0, round2(M - intr));
      if (prin > remP) prin = round2(remP);
      amt = round2(prin + intr);
    }
    remP = Math.max(0, round2(remP - prin));
    rows.push({
      no: i + 1,
      dueDate: addMonthsPreserveDay(input.firstDueDate, i),
      principal: prin,
      interest: intr,
      amount: amt,
      remainingBalance: remP,
    });
  }
  return rows;
}
