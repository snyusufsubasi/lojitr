// Contact Ledger & Aging Buckets Engine
import type { Contact, Trip, Expense, Payment, BankCheck, LedgerAdjustment } from '../types';
import { calculateTripFinancials } from './tripMath';
import { round2 } from './fx';

export interface ContactBalanceSummary {
  contact: Contact;
  receivable: number;
  payable: number;
  net: number;
  aging: {
    vadesiGelmemis: number;
    otuzGun: number;
    altmisGun: number;
    doksanGun: number;
    yuzYirmiGun: number;
    yuzYirmiUstu: number;
  };
}

export function computeContactBalances(
  contacts: Contact[],
  trips: Trip[],
  expenses: Expense[],
  payments: Payment[],
  checks: BankCheck[],
  adjustments: LedgerAdjustment[],
  todayIso: string
): ContactBalanceSummary[] {
  const todayTime = new Date(todayIso).getTime();

  return contacts.map((c) => {
    let recDelta = 0;
    let payDelta = 0;

    const aging = {
      vadesiGelmemis: 0,
      otuzGun: 0,
      altmisGun: 0,
      doksanGun: 0,
      yuzYirmiGun: 0,
      yuzYirmiUstu: 0,
    };

    // 1. Trips
    const cTrips = trips.filter((t) => t.contactId === c.id && t.status !== 'iptal');
    for (const t of cTrips) {
      const fin = calculateTripFinancials(t);
      recDelta += fin.netReceivable;

      if (fin.remaining > 0.01 && t.dueDate) {
        const diffDays = Math.round((todayTime - new Date(t.dueDate).getTime()) / 86400000);
        if (diffDays <= 0) aging.vadesiGelmemis += fin.remaining;
        else if (diffDays <= 30) aging.otuzGun += fin.remaining;
        else if (diffDays <= 60) aging.altmisGun += fin.remaining;
        else if (diffDays <= 90) aging.doksanGun += fin.remaining;
        else if (diffDays <= 120) aging.yuzYirmiGun += fin.remaining;
        else aging.yuzYirmiUstu += fin.remaining;
      }
    }

    // Broker / Subcontractor payables
    const brokerTrips = trips.filter((t) => t.brokerId === c.id && t.status !== 'iptal');
    for (const t of brokerTrips) payDelta += t.brokerAmount || 0;

    const carrierTrips = trips.filter((t) => t.carrierId === c.id && t.status !== 'iptal');
    for (const t of carrierTrips) payDelta += t.carrierAmount || 0;

    // 2. Veresiye Expenses
    const cExpenses = expenses.filter(
      (e) => e.contactId === c.id && e.source === 'veresiye' && e.approvalStatus !== 'rejected'
    );
    for (const e of cExpenses) payDelta += e.amount;

    // 3. Payments
    const cPayments = payments.filter((p) => p.contactId === c.id);
    for (const p of cPayments) {
      if (p.kind === 'tahsilat') recDelta -= p.amount;
      else if (p.kind === 'odeme') payDelta -= p.amount;
    }

    // 4. Checks
    const cChecks = checks.filter((chk) => chk.contactId === c.id);
    for (const chk of cChecks) {
      if (chk.direction === 'alinan' && chk.status !== 'karsiliksiz' && chk.status !== 'iptal') {
        recDelta -= chk.amount;
      } else if (chk.direction === 'verilen' && chk.status !== 'iptal') {
        payDelta -= chk.amount;
      }
    }

    // Endorsed checks to this supplier
    const endorsedChecks = checks.filter(
      (chk) => chk.endorsedToContactId === c.id && chk.status === 'ciro'
    );
    for (const chk of endorsedChecks) payDelta -= chk.amount;

    // 5. Adjustments
    const cAdjustments = adjustments.filter((a) => a.contactId === c.id);
    for (const a of cAdjustments) {
      const sign = a.direction === 'borc' ? 1 : -1;
      if (a.ledger === 'receivable') recDelta += sign * a.amount;
      else payDelta += sign * a.amount;
    }

    const receivable = Math.max(0, round2(recDelta));
    const payable = Math.max(0, round2(payDelta));
    const net = round2(receivable - payable);

    return {
      contact: c,
      receivable,
      payable,
      net,
      aging: {
        vadesiGelmemis: round2(aging.vadesiGelmemis),
        otuzGun: round2(aging.otuzGun),
        altmisGun: round2(aging.altmisGun),
        doksanGun: round2(aging.doksanGun),
        yuzYirmiGun: round2(aging.yuzYirmiGun),
        yuzYirmiUstu: round2(aging.yuzYirmiUstu),
      },
    };
  });
}
