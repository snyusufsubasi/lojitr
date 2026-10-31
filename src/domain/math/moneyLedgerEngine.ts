// src/domain/math/moneyLedgerEngine.ts
// LojiTR v3.0 - Dinamik Kasa, Banka, Kredi Kartı ve TTS Bakiye Hesaplama Motoru

import { round2 } from './fx';
import type { MoneyAccount, Payment, Expense } from '../types';

export interface AccountLedgerMovement {
  id: string;
  date: string;
  type: 'tahsilat' | 'odeme' | 'masraf' | 'virman_cikis' | 'virman_giris';
  amount: number;
  signedDelta: number;
  runningBalance: number;
  description: string;
  referenceDoc?: string;
}

export interface DynamicAccountSummary {
  account: MoneyAccount;
  calculatedBalance: number;
  totalInflow: number;
  totalOutflow: number;
  dailyBurnRate: number;
  daysOfRunway: number;
  creditCardUtilizationPct?: number;
  movements: AccountLedgerMovement[];
}

export function computeDynamicAccountLedger(
  accounts: MoneyAccount[],
  payments: Payment[],
  expenses: Expense[],
  transfers: Array<{
    id: string;
    date: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    fee?: number;
    note?: string;
  }> = []
): DynamicAccountSummary[] {
  return accounts.map((account) => {
    const movements: AccountLedgerMovement[] = [];
    let currentBalance = account.openingBalance || 0;
    let totalInflow = 0;
    let totalOutflow = 0;

    // 1. Ödemeler ve Tahsilatlar
    const accPayments = payments.filter((p) => p.moneyAccountId === account.id);
    for (const p of accPayments) {
      if (p.kind === 'tahsilat') {
        const delta = p.amount;
        totalInflow += delta;
        currentBalance += delta;
        movements.push({
          id: p.id,
          date: p.date,
          type: 'tahsilat',
          amount: p.amount,
          signedDelta: delta,
          runningBalance: round2(currentBalance),
          description: p.note || 'Cari Tahsilat',
        });
      } else {
        const delta = -p.amount;
        totalOutflow += p.amount;
        currentBalance += delta;
        movements.push({
          id: p.id,
          date: p.date,
          type: 'odeme',
          amount: p.amount,
          signedDelta: delta,
          runningBalance: round2(currentBalance),
          description: p.note || 'Tedarikçi Ödemesi',
        });
      }
    }

    // 2. Bu hesaptan ödenen Masraflar
    const accExpenses = expenses.filter(
      (e) => e.moneyAccountId === account.id && e.source !== 'sofor' && e.source !== 'veresiye'
    );
    for (const e of accExpenses) {
      const delta = -e.amount;
      totalOutflow += e.amount;
      currentBalance += delta;
      movements.push({
        id: e.id,
        date: e.date,
        type: 'masraf',
        amount: e.amount,
        signedDelta: delta,
        runningBalance: round2(currentBalance),
        description: `${e.category.toUpperCase()}: ${e.note || 'Gider Ödemesi'}`,
      });
    }

    // 3. Virman / Hesaplar Arası Transferler
    for (const tr of transfers) {
      if (tr.fromAccountId === account.id) {
        const totalDebit = tr.amount + (tr.fee || 0);
        totalOutflow += totalDebit;
        currentBalance -= totalDebit;
        movements.push({
          id: tr.id,
          date: tr.date,
          type: 'virman_cikis',
          amount: totalDebit,
          signedDelta: -totalDebit,
          runningBalance: round2(currentBalance),
          description: `Virman Çıkış: ${tr.note || 'Hesaba Transfer'}`,
        });
      } else if (tr.toAccountId === account.id) {
        totalInflow += tr.amount;
        currentBalance += tr.amount;
        movements.push({
          id: tr.id,
          date: tr.date,
          type: 'virman_giris',
          amount: tr.amount,
          signedDelta: tr.amount,
          runningBalance: round2(currentBalance),
          description: `Virman Giriş: ${tr.note || 'Hesaptan Gelen'}`,
        });
      }
    }

    // Sıralama (tarihe göre azalan)
    movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const dailyBurnRate = round2(totalOutflow / 30);
    const daysOfRunway =
      dailyBurnRate > 0 && currentBalance > 0 ? Math.round(currentBalance / dailyBurnRate) : 999;

    let creditCardUtilizationPct: number | undefined = undefined;
    if (account.kind === 'kredi_karti' || account.kind === 'yakit_karti') {
      const limit = account.creditLimit || 100000;
      const debtAmount = Math.max(0, -currentBalance);
      creditCardUtilizationPct = round2((debtAmount / limit) * 100);
    }

    return {
      account,
      calculatedBalance: round2(currentBalance),
      totalInflow: round2(totalInflow),
      totalOutflow: round2(totalOutflow),
      dailyBurnRate,
      daysOfRunway,
      creditCardUtilizationPct,
      movements,
    };
  });
}