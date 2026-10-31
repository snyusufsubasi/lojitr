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

export function computeFreightFromUnit(
  kind: 'sabit' | 'ton' | 'km' | undefined,
  unitPrice?: number,
  weightTon?: number,
  km?: number
): number | null {
  if (!kind || kind === 'sabit') return null;
  const price = unitPrice ?? 0;
  if (price <= 0) return 0;
  if (kind === 'ton') return Math.round((weightTon ?? 0) * price * 100) / 100;
  if (kind === 'km') return Math.round((km ?? 0) * price * 100) / 100;
  return null;
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

export function allocateGeneralPaymentsToTrips(trips: Trip[], payments: Payment[]): Trip[] {
  const poolByContactCurrency = new Map<string, number>();

  for (const p of payments) {
    if (p.kind !== 'tahsilat' || !p.contactId || p.tripId) continue;
    const cur = p.currency ?? 'TRY';
    const key = `${p.contactId}|${cur}`;
    const amt = cur === 'TRY' ? p.amount : (p.originalAmount ?? p.amount);
    if (amt > 0) {
      poolByContactCurrency.set(key, (poolByContactCurrency.get(key) ?? 0) + amt);
    }
  }

  if (poolByContactCurrency.size === 0) return trips;

  const sortedIndices = trips
    .map((t, idx) => ({ t, idx }))
    .filter(({ t }) => t.contactId && t.status !== 'iptal')
    .sort((a, b) => a.t.date.localeCompare(b.t.date));

  const allocatedTry = new Map<number, number>();
  const allocatedFx = new Map<number, number>();

  for (const { t, idx } of sortedIndices) {
    const cur = t.currency ?? 'TRY';
    const key = `${t.contactId}|${cur}`;
    const available = poolByContactCurrency.get(key) ?? 0;
    if (available <= 0.009) continue;

    const fin = calculateTripFinancials(t);
    if (cur === 'TRY') {
      if (fin.remaining <= 0.009) continue;
      const take = Math.min(available, fin.remaining);
      allocatedTry.set(idx, take);
      poolByContactCurrency.set(key, available - take);
    } else {
      const remFx = fin.remainingFx ?? 0;
      if (remFx <= 0.009) continue;
      const takeFx = Math.min(available, remFx);
      allocatedFx.set(idx, takeFx);
      allocatedTry.set(idx, round2(takeFx * (t.fxRate || 1)));
      poolByContactCurrency.set(key, available - takeFx);
    }
  }

  if (allocatedTry.size === 0) return trips;

  return trips.map((t, idx) => {
    const addTry = allocatedTry.get(idx);
    if (!addTry) return t;
    const addFx = allocatedFx.get(idx);
    return {
      ...t,
      collected: round2(t.collected + addTry),
      collectedFx: addFx !== undefined ? round2((t.collectedFx ?? 0) + addFx) : t.collectedFx,
    };
  });
}
