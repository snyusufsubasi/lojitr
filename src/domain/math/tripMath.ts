// Trip financial calculations & VAT Withholding engine
import type { Trip, Payment } from '../types';
import { round2 } from './fx';

export const WITHHOLDING_OPTIONS = [
  { code: '2/10', label: '2/10 · Yük Taşımacılığı (%20 Tevkifat)', num: 2, den: 10 },
  { code: '5/10', label: '5/10 · (%50 Tevkifat)', num: 5, den: 10 },
  { code: '7/10', label: '7/10 · (%70 Tevkifat)', num: 7, den: 10 },
  { code: '9/10', label: '9/10 · (%90 Tevkifat)', num: 9, den: 10 },
] as const;

export function parseWithholdingFraction(code?: string): number {
  if (!code) return 0;
  const found = WITHHOLDING_OPTIONS.find((o) => o.code === code);
  if (found) return found.num / found.den;
  const m = /^(\d+)\/(\d+)$/.exec(code);
  if (!m) return 0;
  const d = Number(m[2]);
  return d > 0 ? Number(m[1]) / d : 0;
}

export function calculateTripFinancials(t: Trip) {
  const r = (t.vatRate ?? 20) / 100;
  let freightNet = 0;
  let vatAmount = 0;
  let grossBeforeWithholding = 0;

  if (t.vatIncluded) {
    freightNet = t.freight / (1 + r);
    vatAmount = t.freight - freightNet;
    grossBeforeWithholding = t.freight;
  } else {
    freightNet = t.freight;
    vatAmount = t.freight * r;
    grossBeforeWithholding = t.freight + vatAmount;
  }

  const withholdingRatio = parseWithholdingFraction(t.vatWithholding);
  const withholdingAmount = vatAmount * withholdingRatio;
  const vatPayable = vatAmount - withholdingAmount;
  const grossWithVat = grossBeforeWithholding - withholdingAmount;

  const commission = t.commission || 0;
  const brokerPayable = t.brokerId ? (t.brokerAmount || 0) : 0;
  const carrierPayable = t.carrierId ? (t.carrierAmount || 0) : 0;
  const netReceivable = grossWithVat - commission;
  const expensesTotal = t.expensesTotal || 0;
  const netProfit = netReceivable - expensesTotal - brokerPayable - carrierPayable;

  const hasFx = Boolean(t.currency && t.originalFreight && t.fxRate && t.fxRate > 0);
  const fxScale = hasFx && t.freight > 0 ? netReceivable / t.freight : 1;
  const netReceivableFx = hasFx ? round2((t.originalFreight ?? 0) * fxScale) : undefined;
  const collectedFx = hasFx
    ? round2(t.collectedFx !== undefined ? t.collectedFx : t.collected / (t.fxRate || 1))
    : undefined;
  const remainingFx =
    hasFx && netReceivableFx !== undefined && collectedFx !== undefined
      ? Math.max(0, round2(netReceivableFx - collectedFx))
      : undefined;

  const remaining =
    hasFx && remainingFx !== undefined && t.fxRate
      ? round2(remainingFx * t.fxRate)
      : Math.max(0, round2(netReceivable - t.collected));

  const effectiveCollected = hasFx && collectedFx !== undefined ? collectedFx : t.collected;

  let collectionStatus: 'iptal' | 'tamam' | 'kismi' | 'bekliyor' = 'bekliyor';
  if (t.status === 'iptal') collectionStatus = 'iptal';
  else if (remaining <= 0.01 && netReceivable > 0) collectionStatus = 'tamam';
  else if (effectiveCollected > 0.01) collectionStatus = 'kismi';

  return {
    freightNet: round2(freightNet),
    vatAmount: round2(vatAmount),
    withholdingAmount: round2(withholdingAmount),
    vatPayable: round2(vatPayable),
    grossWithVat: round2(grossWithVat),
    commission: round2(commission),
    brokerPayable: round2(brokerPayable),
    carrierPayable: round2(carrierPayable),
    netReceivable: round2(netReceivable),
    expensesTotal: round2(expensesTotal),
    netProfit: round2(netProfit),
    collected: round2(t.collected),
    remaining: round2(remaining),
    netReceivableFx,
    collectedFx,
    remainingFx,
    collectionStatus,
  };
}
