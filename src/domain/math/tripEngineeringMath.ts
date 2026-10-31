// Trip Engineering Math: 4-mode freight pricing, tare fire, live break-even feasibility
// LojiTR v3.0

import { round2 } from './fx';
import type { TripPricingKind } from '../types';

export interface FreightPricingInput {
  pricingKind: TripPricingKind;
  unitPrice?: number; // ₺/Ton veya ₺/KM veya Sabit Tutar
  weightTon?: number; // Yük tonajı
  distanceKm?: number; // Mesafe KM
  pieceCount?: number; // Palet / Adet
  weighbridgeStartTon?: number; // Çıkış kantar tonajı
  weighbridgeEndTon?: number; // Varış kantar tonajı
  lossTolerancePct?: number; // Kabul edilebilir fire toleransı (Örn: %0.5)
}

export interface FreightPricingResult {
  freightNet: number;
  calculatedFreight: number;
  tareLossTon: number;
  tareLossPenalty: number;
  effectiveBillingWeightTon: number;
  calculationBreakdown: string;
}

/**
 * 4 Modlu Navlun Hesaplayıcı ve Kantar Fire Kesinti Motoru
 */
export function calculateDynamicFreight(input: FreightPricingInput): FreightPricingResult {
  const kind = input.pricingKind || 'sabit';
  const unit = input.unitPrice && input.unitPrice > 0 ? input.unitPrice : 0;
  const weight = input.weightTon && input.weightTon > 0 ? input.weightTon : 0;
  const km = input.distanceKm && input.distanceKm > 0 ? input.distanceKm : 0;
  const pieces = input.pieceCount && input.pieceCount > 0 ? input.pieceCount : 0;

  // Kantar Fire Kesinti Analizi
  let tareLossTon = 0;
  let tareLossPenalty = 0;
  let effectiveBillingWeightTon = weight;

  if (input.weighbridgeStartTon && input.weighbridgeEndTon) {
    const rawLoss = Math.max(0, input.weighbridgeStartTon - input.weighbridgeEndTon);
    const tolerancePct = input.lossTolerancePct ?? 0.3; // %0.3 standart fire toleransı
    const allowedLoss = (input.weighbridgeStartTon * tolerancePct) / 100;

    if (rawLoss > allowedLoss) {
      tareLossTon = round2(rawLoss - allowedLoss);
      // Fire kesintisi ton başına navlun birim fiyatı üzerinden düşülür
      tareLossPenalty = round2(tareLossTon * (kind === 'ton' ? unit : 1500));
    }
    effectiveBillingWeightTon = round2(input.weighbridgeEndTon);
  }

  let calculatedFreight = 0;
  let calculationBreakdown = '';

  switch (kind) {
    case 'ton':
      calculatedFreight = round2(effectiveBillingWeightTon * unit);
      calculationBreakdown = `${effectiveBillingWeightTon} Ton × ${unit.toLocaleString('tr-TR')} ₺/Ton = ${calculatedFreight.toLocaleString('tr-TR')} ₺`;
      break;
    case 'km':
      calculatedFreight = round2(km * unit);
      calculationBreakdown = `${km} KM × ${unit.toLocaleString('tr-TR')} ₺/KM = ${calculatedFreight.toLocaleString('tr-TR')} ₺`;
      break;
    case 'palet':
      calculatedFreight = round2(pieces * unit);
      calculationBreakdown = `${pieces} Adet/Palet × ${unit.toLocaleString('tr-TR')} ₺ = ${calculatedFreight.toLocaleString('tr-TR')} ₺`;
      break;
    case 'sabit':
    default:
      calculatedFreight = round2(unit);
      calculationBreakdown = `Sabit Götürü Navlun = ${calculatedFreight.toLocaleString('tr-TR')} ₺`;
      break;
  }

  const freightNet = Math.max(0, round2(calculatedFreight - tareLossPenalty));

  return {
    freightNet,
    calculatedFreight,
    tareLossTon,
    tareLossPenalty,
    effectiveBillingWeightTon,
    calculationBreakdown,
  };
}

export interface BreakEvenSimulationInput {
  distanceKm: number;
  freightNet: number;
  fuelPricePerLitre?: number; // Güncel mazot litre fiyatı (Varsayılan 43 ₺)
  avgFuelPer100Km?: number; // Araç fabrika ortalaması (Varsayılan 30 LT)
  cargoWeightTon?: number; // Yük tonajı
  estimatedTollCost?: number; // Köprü ve HGS gideri
  driverPerDiem?: number; // Sefer harcırahı
  driverKmRate?: number; // Şoför km başı primi
  tireAndWearCostPerKm?: number; // Lastik ve bakım payı (Varsayılan 2.50 ₺/KM)
  commissionAmount?: number; // Komisyoncu payı
  desiredProfitMarginPct?: number; // İstenen net kâr marjı % (Varsayılan %25)
}

export interface BreakEvenSimulationResult {
  estimatedFuelCost: number;
  estimatedAdBlueCost: number;
  estimatedTollCost: number;
  estimatedDriverPay: number;
  estimatedWearCost: number;
  totalDirectCost: number;
  breakEvenFreight: number; // Kafa kafaya başabaş noktası (0 kâr)
  recommendedQuoteFreight: number; // İstenen kâr marjı eklenmiş teklif tutarı
  projectedNetProfit: number;
  projectedProfitMarginPct: number;
  status: 'cok_karli' | 'karli' | 'basabas' | 'zarar';
  adviceMessage: string;
}

/**
 * Canlı Sefer Başabaş (Break-Even) ve Teklif Fizibilite Simülatörü
 */
export function simulateTripBreakEven(input: BreakEvenSimulationInput): BreakEvenSimulationResult {
  const km = Math.max(1, input.distanceKm);
  const fuelPrice = input.fuelPricePerLitre || 43.5;
  const baseConsumption = input.avgFuelPer100Km || 29.5;
  const weightBonus = input.cargoWeightTon ? input.cargoWeightTon * 0.45 : 0;
  const effectiveConsumptionPer100 = baseConsumption + weightBonus;

  // 1. Tahmini Mazot Gideri
  const estimatedFuelLitres = (km / 100) * effectiveConsumptionPer100;
  const estimatedFuelCost = round2(estimatedFuelLitres * fuelPrice);

  // 2. Tahmini AdBlue Gideri (%5 yakıt hacmi, 25 ₺/LT)
  const estimatedAdBlueCost = round2(estimatedFuelLitres * 0.05 * 25);

  // 3. Otoyol & Köprü HGS
  const estimatedTollCost = input.estimatedTollCost || 0;

  // 4. Şoför Hakediş Payı (Harcırah + KM Primi)
  const perDiem = input.driverPerDiem || 1200;
  const kmPay = input.driverKmRate ? round2(km * input.driverKmRate) : 0;
  const estimatedDriverPay = round2(perDiem + kmPay);

  // 5. Lastik & Bakım KM Amortisman Payı
  const wearRate = input.tireAndWearCostPerKm || 2.4;
  const estimatedWearCost = round2(km * wearRate);

  // 6. Komisyon
  const commission = input.commissionAmount || 0;

  // Toplam Direkt Sefer Maliyeti
  const totalDirectCost = round2(
    estimatedFuelCost + estimatedAdBlueCost + estimatedTollCost + estimatedDriverPay + estimatedWearCost + commission
  );

  // Başabaş Navlun Noktası
  const breakEvenFreight = totalDirectCost;

  // Hedef Kâr Marjlı Teklif Fiyatı (%25 hedef marj)
  const margin = (input.desiredProfitMarginPct || 25) / 100;
  const recommendedQuoteFreight = round2(breakEvenFreight / (1 - margin));

  // Mevcut Navlunla Kârlılık Durumu
  const projectedNetProfit = round2(input.freightNet - totalDirectCost);
  const projectedProfitMarginPct = input.freightNet > 0 ? round2((projectedNetProfit / input.freightNet) * 100) : 0;

  let status: BreakEvenSimulationResult['status'] = 'karli';
  let adviceMessage = 'Sefer karlı görünüyor.';

  if (projectedNetProfit < 0) {
    status = 'zarar';
    adviceMessage = `DİKKAT: Bu seferde tahmini ${Math.abs(projectedNetProfit).toLocaleString('tr-TR')} ₺ ZARAR öngörülüyor! Mazot ve otoyol giderini kurtarmıyor.`;
  } else if (projectedProfitMarginPct < 8) {
    status = 'basabas';
    adviceMessage = 'BAŞABAŞ SINIRINDA: Kâr marjı %8 altında. Beklenmedik bir bekleme veya lastik arızasında zarara dönüşebilir.';
  } else if (projectedProfitMarginPct >= 25) {
    status = 'cok_karli';
    adviceMessage = `YÜKSEK KÂRLILIK: %${projectedProfitMarginPct} marj ve ${projectedNetProfit.toLocaleString('tr-TR')} ₺ net kazanç öngörülüyor.`;
  } else {
    status = 'karli';
    adviceMessage = `KÂRLI: %${projectedProfitMarginPct} marj ile ${projectedNetProfit.toLocaleString('tr-TR')} ₺ net kâr bekleniyor.`;
  }

  return {
    estimatedFuelCost,
    estimatedAdBlueCost,
    estimatedTollCost,
    estimatedDriverPay,
    estimatedWearCost,
    totalDirectCost,
    breakEvenFreight,
    recommendedQuoteFreight,
    projectedNetProfit,
    projectedProfitMarginPct,
    status,
    adviceMessage,
  };
}

/**
 * Otomatik KM Üçgeni Çözücü
 * startKm, endKm ve km arasındaki çift yönlü ilişkiyi senkronize eder.
 */
export function solveKmTriangle(
  startKm?: number,
  endKm?: number,
  distanceKm?: number,
  lastChanged: 'startKm' | 'endKm' | 'distanceKm' = 'distanceKm'
): { startKm?: number; endKm?: number; distanceKm?: number } {
  let s = startKm;
  let e = endKm;
  let d = distanceKm;

  if (lastChanged === 'endKm' && s !== undefined && e !== undefined) {
    d = Math.max(0, e - s);
  } else if (lastChanged === 'distanceKm' && s !== undefined && d !== undefined) {
    e = s + d;
  } else if (lastChanged === 'startKm') {
    if (d !== undefined) {
      e = (s || 0) + d;
    } else if (e !== undefined) {
      d = Math.max(0, e - (s || 0));
    }
  }

  return { startKm: s, endKm: e, distanceKm: d };
}