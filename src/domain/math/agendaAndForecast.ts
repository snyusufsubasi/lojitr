// 60-day financial agenda & 12-week cash flow forecast engine
import type { Trip, BankCheck, LoanInstallment, Reminder, Invoice, MoneyAccount } from '../types';
import { calculateTripFinancials } from './tripMath';
import { round2 } from './fx';

export interface AgendaItem {
  id: string;
  date: string;
  title: string;
  direction: 'in' | 'out';
  amount: number;
  kind: 'sefer_tahsilat' | 'cek_alinan' | 'cek_verilen' | 'kredi_taksit' | 'hatirlatma' | 'fatura_tahsilat' | 'fatura_odeme';
  tag: 'overdue' | 'today' | 'week' | 'month' | 'later';
  referenceId?: string;
}

export function buildFinancialAgenda(
  trips: Trip[],
  checks: BankCheck[],
  installments: LoanInstallment[],
  reminders: Reminder[],
  invoices: Invoice[],
  todayIso: string
): AgendaItem[] {
  const items: AgendaItem[] = [];
  const todayTime = new Date(todayIso).getTime();

  for (const t of trips) {
    if (t.status === 'iptal' || !t.dueDate) continue;
    const fin = calculateTripFinancials(t);
    if (fin.remaining > 0.01) {
      items.push({
        id: `trip-${t.id}`,
        date: t.dueDate,
        title: `${t.origin} → ${t.destination} Navlun Tahsilatı`,
        direction: 'in',
        amount: fin.remaining,
        kind: 'sefer_tahsilat',
        tag: getTag(t.dueDate, todayTime),
        referenceId: t.id,
      });
    }
  }

  for (const c of checks) {
    if (c.direction === 'alinan' && (c.status === 'portfoy' || c.status === 'bankada')) {
      items.push({
        id: `chk-${c.id}`,
        date: c.dueDate,
        title: `${c.bankName || 'Banka'} Çek Tahsili (${c.serialNo || 'Çek'})`,
        direction: 'in',
        amount: c.amount,
        kind: 'cek_alinan',
        tag: getTag(c.dueDate, todayTime),
        referenceId: c.id,
      });
    } else if (c.direction === 'verilen' && c.status === 'bekliyor') {
      items.push({
        id: `chk-${c.id}`,
        date: c.dueDate,
        title: `Verilen Çek Ödemesi (${c.serialNo || 'Çek'})`,
        direction: 'out',
        amount: c.amount,
        kind: 'cek_verilen',
        tag: getTag(c.dueDate, todayTime),
        referenceId: c.id,
      });
    }
  }

  for (const inst of installments) {
    if (!inst.paidOn) {
      items.push({
        id: `inst-${inst.id}`,
        date: inst.dueDate,
        title: `${inst.no}. Kredi Taksit Ödemesi`,
        direction: 'out',
        amount: inst.amount,
        kind: 'kredi_taksit',
        tag: getTag(inst.dueDate, todayTime),
        referenceId: inst.id,
      });
    }
  }

  for (const rem of reminders) {
    if (!rem.doneAt && rem.dueDate && rem.amount && rem.amount > 0) {
      items.push({
        id: `rem-${rem.id}`,
        date: rem.dueDate,
        title: rem.title || `${rem.kind.toUpperCase()} Ödemesi`,
        direction: 'out',
        amount: rem.amount,
        kind: 'hatirlatma',
        tag: getTag(rem.dueDate, todayTime),
        referenceId: rem.id,
      });
    }
  }

  for (const inv of invoices) {
    if (inv.status === 'kesildi' && inv.dueDate) {
      const rem = Math.max(0, inv.total - inv.paid);
      if (rem > 0.01) {
        items.push({
          id: `inv-${inv.id}`,
          date: inv.dueDate,
          title: `Fatura ${inv.invoiceNo} ${inv.direction === 'giden' ? 'Tahsilatı' : 'Ödemesi'}`,
          direction: inv.direction === 'giden' ? 'in' : 'out',
          amount: rem,
          kind: inv.direction === 'giden' ? 'fatura_tahsilat' : 'fatura_odeme',
          tag: getTag(inv.dueDate, todayTime),
          referenceId: inv.id,
        });
      }
    }
  }

  items.sort((a, b) => a.date.localeCompare(b.date));
  return items;
}

function getTag(dateIso: string, todayTime: number): AgendaItem['tag'] {
  const diffDays = Math.round((new Date(dateIso).getTime() - todayTime) / 86400000);
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 7) return 'week';
  if (diffDays <= 30) return 'month';
  return 'later';
}

export interface WeekForecast {
  weekNo: number;
  startDate: string;
  endDate: string;
  inflow: number;
  outflow: number;
  net: number;
  cumulativeBalance: number;
  isNegative: boolean;
}

export function build12WeekCashForecast(
  accounts: MoneyAccount[],
  agenda: AgendaItem[],
  todayIso: string
): {
  startingCash: number;
  weeks: WeekForecast[];
  firstNegativeWeek?: number;
} {
  const startingCash = accounts
    .filter((a) => a.kind === 'kasa' || a.kind === 'banka')
    .reduce((sum, a) => sum + (a.openingBalance || 0), 0);

  let running = startingCash;
  const todayDate = new Date(todayIso);

  for (const item of agenda) {
    if (item.tag === 'overdue') {
      if (item.direction === 'in') running += item.amount;
      else running -= item.amount;
    }
  }

  const weeks: WeekForecast[] = [];
  let firstNegativeWeek: number | undefined;

  for (let w = 0; w < 12; w++) {
    const wStart = new Date(todayDate);
    wStart.setDate(todayDate.getDate() + w * 7);
    const wEnd = new Date(wStart);
    wEnd.setDate(wStart.getDate() + 6);

    const sIso = wStart.toISOString().slice(0, 10);
    const eIso = wEnd.toISOString().slice(0, 10);

    let inflow = 0;
    let outflow = 0;

    for (const item of agenda) {
      if (item.tag !== 'overdue' && item.date >= sIso && item.date <= eIso) {
        if (item.direction === 'in') inflow += item.amount;
        else outflow += item.amount;
      }
    }

    const net = round2(inflow - outflow);
    running = round2(running + net);
    const isNegative = running < 0;

    if (isNegative && firstNegativeWeek === undefined) {
      firstNegativeWeek = w + 1;
    }

    weeks.push({
      weekNo: w + 1,
      startDate: sIso,
      endDate: eIso,
      inflow: round2(inflow),
      outflow: round2(outflow),
      net,
      cumulativeBalance: running,
      isNegative,
    });
  }

  return {
    startingCash: round2(startingCash),
    weeks,
    firstNegativeWeek,
  };
}
