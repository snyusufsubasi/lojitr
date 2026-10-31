// src/domain/math/financialRiskEngine.ts
// LojiTR v3.0 - Çek İskonto (Faktoring), Adat (Valör) ve Müşteri Kredi Risk Skoru Motoru

import { round2 } from './fx';
import type { Contact } from '../types';

export interface FactoringCalculationResult {
  nominalAmount: number;
  daysToMaturity: number;
  annualInterestRatePct: number;
  factoringCommissionPct: number;
  grossInterestAmount: number;
  commissionAmount: number;
  bsmvTaxAmount: number;
  totalDeductions: number;
  netCashProceeds: number;
  effectiveAnnualCostPct: number;
}

export interface WeightedMaturityResult {
  contactId: string;
  totalReceivable: number;
  weightedDaysToMaturity: number;
  averageMaturityDate: string;
  interestOpportunityCost: number;
}

export interface CustomerCreditScoreResult {
  contactId: string;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'RISKLI';
  isShipmentBlocked: boolean;
  creditLimitRemaining: number;
  riskReasons: string[];
}

/**
 * Müşteri çekini faktoringe veya banka iskontosuna verirken ele geçecek net nakit ve maliyeti hesaplar.
 */
export function calculateFactoringDiscount(
  checkAmount: number,
  dueDateIso: string,
  annualInterestRatePct: number = 52.0,
  commissionRatePct: number = 0.75,
  calculationDateIso: string = new Date().toISOString().slice(0, 10)
): FactoringCalculationResult {
  const calcTime = new Date(calculationDateIso).getTime();
  const dueTime = new Date(dueDateIso).getTime();
  const daysToMaturity = Math.max(1, Math.round((dueTime - calcTime) / 86400000));

  // 1. Brüt Faiz
  const grossInterestAmount = round2(
    checkAmount * (annualInterestRatePct / 100) * (daysToMaturity / 360)
  );

  // 2. Faktoring Komisyonu
  const commissionAmount = round2(checkAmount * (commissionRatePct / 100));

  // 3. %5 BSMV
  const bsmvTaxAmount = round2((grossInterestAmount + commissionAmount) * 0.05);

  // 4. Toplam Kesinti ve Net Tutar
  const totalDeductions = round2(grossInterestAmount + commissionAmount + bsmvTaxAmount);
  const netCashProceeds = round2(Math.max(0, checkAmount - totalDeductions));

  // 5. Efektif Yıllık Bileşik Maliyet (APR)
  const effectiveAnnualCostPct =
    netCashProceeds > 0
      ? round2((totalDeductions / netCashProceeds) * (360 / daysToMaturity) * 100)
      : 0;

  return {
    nominalAmount: checkAmount,
    daysToMaturity,
    annualInterestRatePct,
    factoringCommissionPct: commissionRatePct,
    grossInterestAmount,
    commissionAmount,
    bsmvTaxAmount,
    totalDeductions,
    netCashProceeds,
    effectiveAnnualCostPct,
  };
}

/**
 * Bir müşterinin elindeki çoklu çeklerin ve açık hesap faturalarının Ağırlıklı Ortalama Vadesini (Adat) hesaplar.
 */
export function calculateWeightedAverageMaturity(
  contactId: string,
  items: Array<{ amount: number; dueDateIso: string }>,
  baseDateIso: string = new Date().toISOString().slice(0, 10),
  opportunityInterestRatePct: number = 50.0
): WeightedMaturityResult {
  const baseTime = new Date(baseDateIso).getTime();
  let totalAmount = 0;
  let weightedDaysSum = 0;

  for (const item of items) {
    if (item.amount <= 0) continue;
    totalAmount += item.amount;
    const diffDays = Math.max(
      0,
      Math.round((new Date(item.dueDateIso).getTime() - baseTime) / 86400000)
    );
    weightedDaysSum += item.amount * diffDays;
  }

  const weightedDaysToMaturity = totalAmount > 0 ? Math.round(weightedDaysSum / totalAmount) : 0;
  const avgMaturityTime = baseTime + weightedDaysToMaturity * 86400000;
  const averageMaturityDate = new Date(avgMaturityTime).toISOString().slice(0, 10);

  const interestOpportunityCost = round2(
    totalAmount * (opportunityInterestRatePct / 100) * (weightedDaysToMaturity / 360)
  );

  return {
    contactId,
    totalReceivable: round2(totalAmount),
    weightedDaysToMaturity,
    averageMaturityDate,
    interestOpportunityCost,
  };
}

/**
 * Müşterinin cari bakiyesi, geçmiş çek performansı ve kredi limitine göre Otomatik Sevkiyat Bloke Risk Skoru üretir.
 */
export function evaluateCustomerCreditRisk(
  contact: Contact,
  currentReceivable: number,
  overdueReceivable: number,
  bouncedChecksCount: number,
  averageCollectionDays: number
): CustomerCreditScoreResult {
  let score = 100;
  const riskReasons: string[] = [];
  const creditLimit = contact.creditLimit || 250000;
  const creditLimitRemaining = round2(creditLimit - currentReceivable);

  if (bouncedChecksCount > 0) {
    score -= bouncedChecksCount * 35;
    riskReasons.push(`${bouncedChecksCount} adet karşılıksız çek geçmişi mevcut.`);
  }

  if (currentReceivable > 0 && overdueReceivable > 0) {
    const overdueRatio = overdueReceivable / currentReceivable;
    if (overdueRatio > 0.5) {
      score -= 30;
      riskReasons.push(`Açık bakiyenin %${Math.round(overdueRatio * 100)}'lik kısmı vadesini aşmış.`);
    } else if (overdueRatio > 0.2) {
      score -= 15;
      riskReasons.push(
        `Açık bakiyede vadesi geçmiş borçlar bulunuyor (${overdueReceivable.toLocaleString('tr-TR')} TL).`
      );
    }
  }

  if (currentReceivable > creditLimit) {
    score -= 25;
    riskReasons.push(`Tahsis edilen ${creditLimit.toLocaleString('tr-TR')} TL kredi limiti aşıldı.`);
  }

  const agreedTermDays = contact.dueDays || 30;
  if (averageCollectionDays > agreedTermDays + 20) {
    score -= 15;
    riskReasons.push(
      `Müşteri anlaşmalı vadeden ortalama ${averageCollectionDays - agreedTermDays} gün daha geç ödüyor.`
    );
  }

  score = Math.max(0, Math.min(100, score));

  let grade: CustomerCreditScoreResult['grade'] = 'A+';
  if (score >= 90) grade = 'A+';
  else if (score >= 75) grade = 'A';
  else if (score >= 60) grade = 'B';
  else if (score >= 45) grade = 'C';
  else grade = 'RISKLI';

  const isShipmentBlocked = score < 45 || currentReceivable > creditLimit * 1.2 || bouncedChecksCount > 0;

  return {
    contactId: contact.id,
    score,
    grade,
    isShipmentBlocked,
    creditLimitRemaining,
    riskReasons,
  };
}