// Monthly VAT (KDV) & Withholding Summary Engine
import type { Trip, Expense, Invoice } from '../types';
import { calculateTripFinancials } from './tripMath';
import { round2 } from './fx';

export const DEFAULT_EXPENSE_VAT_RATES: Record<string, number> = {
  yakit: 20,
  adblue: 20,
  otoyol: 20,
  bakim: 20,
  lastik: 20,
  parca: 20,
  yikama: 20,
  otel: 20,
  park: 20,
  komisyon: 20,
  diger: 20,
  yemek: 10,
  sigorta: 0,
  kasko: 0,
  muayene: 0,
  vergi: 0,
  ceza: 0,
  vize: 0,
  harcirah: 0,
  banka_masrafi: 0,
};

export interface VatReportResult {
  salesNet: number;
  salesVatGross: number;
  salesWithholding: number;
  salesVatPayable: number;
  deductibleNet: number;
  deductibleVat: number;
  netPayableVat: number;
}

export function computeMonthlyVatReport(
  trips: Trip[],
  expenses: Expense[],
  invoices: Invoice[],
  monthIso: string
): VatReportResult {
  let salesNet = 0;
  let salesVatGross = 0;
  let salesWithholding = 0;

  const mTrips = trips.filter((t) => t.date.startsWith(monthIso) && t.status !== 'iptal');
  for (const t of mTrips) {
    const fin = calculateTripFinancials(t);
    salesNet += fin.freightNet;
    salesVatGross += fin.vatAmount;
    salesWithholding += fin.withholdingAmount;
  }

  const mOutInvoices = invoices.filter(
    (inv) => inv.direction === 'giden' && inv.issueDate.startsWith(monthIso) && inv.status === 'kesildi'
  );
  for (const inv of mOutInvoices) {
    salesNet += inv.subtotal;
    salesVatGross += inv.vatTotal;
    salesWithholding += inv.withholdingTotal;
  }

  const salesVatPayable = salesVatGross - salesWithholding;

  let deductibleNet = 0;
  let deductibleVat = 0;

  const mExpenses = expenses.filter(
    (e) => e.date.startsWith(monthIso) && e.approvalStatus !== 'rejected'
  );
  for (const e of mExpenses) {
    const r = e.vatRate !== undefined ? e.vatRate : (DEFAULT_EXPENSE_VAT_RATES[e.category] ?? 20);
    if (r > 0) {
      const net = e.amount / (1 + r / 100);
      const vat = e.amount - net;
      deductibleNet += net;
      deductibleVat += vat;
    } else {
      deductibleNet += e.amount;
    }
  }

  const mInInvoices = invoices.filter(
    (inv) => inv.direction === 'gelen' && inv.issueDate.startsWith(monthIso) && inv.status === 'kesildi'
  );
  for (const inv of mInInvoices) {
    deductibleNet += inv.subtotal;
    deductibleVat += inv.vatTotal;
  }

  const netPayableVat = salesVatPayable - deductibleVat;

  return {
    salesNet: round2(salesNet),
    salesVatGross: round2(salesVatGross),
    salesWithholding: round2(salesWithholding),
    salesVatPayable: round2(salesVatPayable),
    deductibleNet: round2(deductibleNet),
    deductibleVat: round2(deductibleVat),
    netPayableVat: round2(netPayableVat),
  };
}
