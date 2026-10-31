// Check & Promissory Note Analytics Engine
import type { BankCheck } from '../types';
import { round2 } from './fx';

export interface CheckAnalyticsResult {
  totalIn: number;
  totalOut: number;
  activeIn: number;
  activeOut: number;
  avgDaysIn: number;
  avgDaysOut: number;
  bounceRate: number;
  buckets: {
    gecmis: number;
    yediGun: number;
    otuzGun: number;
    altmisGun: number;
    doksanGun: number;
    doksanUstu: number;
  };
}

export function computeCheckAnalytics(checks: BankCheck[], todayIso: string): CheckAnalyticsResult {
  let totalIn = 0;
  let totalOut = 0;
  let activeIn = 0;
  let activeOut = 0;
  let inDaysWeightedSum = 0;
  let outDaysWeightedSum = 0;
  let bouncedInAmount = 0;
  let resolvedInAmount = 0;

  const buckets = {
    gecmis: 0,
    yediGun: 0,
    otuzGun: 0,
    altmisGun: 0,
    doksanGun: 0,
    doksanUstu: 0,
  };

  const todayTime = new Date(todayIso).getTime();

  for (const c of checks) {
    const amt = c.amount;
    const isReceived = c.direction === 'alinan';
    if (isReceived) totalIn += amt;
    else totalOut += amt;

    const isActive = isReceived
      ? c.status === 'portfoy' || c.status === 'bankada'
      : c.status === 'bekliyor';

    if (c.status === 'karsiliksiz') {
      bouncedInAmount += amt;
    } else if (c.status === 'tahsil' || c.status === 'ciro') {
      resolvedInAmount += amt;
    }

    if (isActive) {
      if (isReceived) activeIn += amt;
      else activeOut += amt;

      const dueTime = new Date(c.dueDate).getTime();
      const diffDays = Math.round((dueTime - todayTime) / 86400000);

      if (isReceived) {
        inDaysWeightedSum += Math.max(0, diffDays) * amt;
      } else {
        outDaysWeightedSum += Math.max(0, diffDays) * amt;
      }

      if (diffDays < 0) buckets.gecmis += amt;\n      else if (diffDays <= 7) buckets.yediGun += amt;\n      else if (diffDays <= 30) buckets.otuzGun += amt;\n      else if (diffDays <= 60) buckets.altmisGun += amt;\n      else if (diffDays <= 90) buckets.doksanGun += amt;\n      else buckets.doksanUstu += amt;\n    }\n  }\n\n  const avgDaysIn = activeIn > 0 ? Math.round(inDaysWeightedSum / activeIn) : 0;\n  const avgDaysOut = activeOut > 0 ? Math.round(outDaysWeightedSum / activeOut) : 0;\n  const inDenominator = bouncedInAmount + resolvedInAmount + activeIn;\n  const bounceRate = inDenominator > 0 ? round2((bouncedInAmount / inDenominator) * 100) : 0;\n\n  return {\n    totalIn: round2(totalIn),\n    totalOut: round2(totalOut),\n    activeIn: round2(activeIn),\n    activeOut: round2(activeOut),\n    avgDaysIn,\n    avgDaysOut,\n    bounceRate,\n    buckets: {\n      gecmis: round2(buckets.gecmis),\n      yediGun: round2(buckets.yediGun),\n      otuzGun: round2(buckets.otuzGun),\n      altmisGun: round2(buckets.altmisGun),\n      doksanGun: round2(buckets.doksanGun),\n      doksanUstu: round2(buckets.doksanUstu),\n    },\n  };\n}\n