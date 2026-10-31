// Running Balance Bank & Cash Account Statement Engine
import type { MoneyAccount, Payment, Expense, BankCheck } from '../types';
import { round2 } from './fx';

export interface StatementRow {
  id: string;
  date: string;
  kind: string;
  description: string;
  inflow: number;
  outflow: number;
  delta: number;
  runningBalance: number;
}

export function buildAccountStatement(
  account: MoneyAccount,
  payments: Payment[],
  expenses: Expense[],
  checks: BankCheck[],
  fromDate?: string,
  toDate?: string
): {
  periodOpening: number;
  rows: StatementRow[];
  closingBalance: number;
  totalInflow: number;
  totalOutflow: number;
} {
  const accId = account.id;
  const rawRows: Array<Omit<StatementRow, 'runningBalance'>> = [];

  for (const p of payments) {
    if (p.kind === 'tahsilat' && p.moneyAccountId === accId) {
      rawRows.push({
        id: `p-${p.id}`,
        date: p.date,
        kind: 'tahsilat',
        description: p.note || 'Tahsilat Girişi',
        inflow: p.amount,
        outflow: 0,
        delta: p.amount,
      });
    } else if ((p.kind === 'odeme' || p.kind === 'maas' || p.kind === 'harcirah' || p.kind === 'avans') && p.moneyAccountId === accId) {
      rawRows.push({
        id: `p-${p.id}`,
        date: p.date,
        kind: p.kind,
        description: p.note || `${p.kind.toUpperCase()} Çıkışı`,
        inflow: 0,
        outflow: p.amount,
        delta: -p.amount,
      });
    } else if (p.kind === 'aktarim') {
      if (p.moneyAccountId === accId) {
        rawRows.push({
          id: `p-${p.id}`,
          date: p.date,
          kind: 'aktarim_cikis',
          description: p.note || 'Hesaplar Arası Transfer (Çıkış)',
          inflow: 0,
          outflow: p.amount,
          delta: -p.amount,
        });
      } else if (p.toAccountId === accId) {
        rawRows.push({
          id: `p-${p.id}`,
          date: p.date,
          kind: 'aktarim_giris',
          description: p.note || 'Hesaplar Arası Transfer (Giriş)',
          inflow: p.amount,
          outflow: 0,
          delta: p.amount,
        });
      }
    }
  }

  for (const e of expenses) {
    if (e.moneyAccountId === accId && e.source !== 'veresiye' && e.source !== 'sofor') {
      rawRows.push({
        id: `e-${e.id}`,
        date: e.date,
        kind: 'masraf',
        description: e.note || `${e.category.toUpperCase()} Masrafı`,
        inflow: 0,
        outflow: e.amount,
        delta: -e.amount,
      });
    }
  }

  for (const c of checks) {
    if (c.moneyAccountId === accId) {
      if (c.direction === 'alinan' && c.status === 'tahsil') {
        rawRows.push({
          id: `c-${c.id}`,
          date: c.clearedDate || c.dueDate,
          kind: 'cek_tahsil',
          description: `Alınan Çek Tahsili (${c.serialNo || 'Çek'})`,
          inflow: c.amount,
          outflow: 0,
          delta: c.amount,
        });
      } else if (c.direction === 'verilen' && c.status === 'odendi') {
        rawRows.push({
          id: `c-${c.id}`,
          date: c.clearedDate || c.dueDate,
          kind: 'cek_odeme',
          description: `Verilen Çek Ödemesi (${c.serialNo || 'Çek'})`,
          inflow: 0,
          outflow: c.amount,
          delta: -c.amount,
        });
      }
    }
  }

  rawRows.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  let running = account.openingBalance || 0;
  let periodOpening = running;

  const filteredRows: StatementRow[] = [];
  let totalInflow = 0;
  let totalOutflow = 0;

  for (const row of rawRows) {
    if (fromDate && row.date < fromDate) {
      running += row.delta;
      periodOpening = running;
    } else if (toDate && row.date > toDate) {
      // after period
    } else {
      running = round2(running + row.delta);
      totalInflow += row.inflow;
      totalOutflow += row.outflow;
      filteredRows.push({
        ...row,
        runningBalance: running,
      });
    }
  }

  return {
    periodOpening: round2(periodOpening),
    rows: filteredRows,
    closingBalance: round2(running),
    totalInflow: round2(totalInflow),
    totalOutflow: round2(totalOutflow),
  };
}
