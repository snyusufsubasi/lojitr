// Fuel Telemetry Math Engine: 3-way equation solver, consumption physics, anomalies
// LojiTR v3.0

import { round2 } from './fx';

export type FuelInputMode = 'price_and_amount' | 'price_and_litres' | 'amount_and_litres';

export interface FuelSolveParams {
  unitPrice?: number; // ₺/LT (Pompa veya İskontolu)
  amount?: number; // Toplam Tutar (₺)
  litres?: number; // Alınan Litre (LT)
  discountPct?: number; // TTS / İstasyon İskontosu %
  vatRate?: number; // KDV % (Varsayılan 20)
  lastChangedField: 'unitPrice' | 'amount' | 'litres';
}

export interface FuelSolveResult {
  unitPrice: number;
  amount: number;
  litres: number;
  netPriceWithoutVat: number;
  vatAmount: number;
  discountSavedAmount: number;
}

/**
 * 3-Yönlü Çift Taraflı Yakıt Denklem Çözücü
 * Kullanıcı Tutar ve Fiyat girdiğinde Litreyi; Litre ve Fiyat girdiğinde Tutarı; Tutar ve Litre girdiğinde Fiyatı çözer.
 */
export function solveFuelEquation(params: FuelSolveParams): FuelSolveResult {
  let p = params.unitPrice && params.unitPrice > 0 ? params.unitPrice : 0;
  let t = params.amount && params.amount > 0 ? params.amount : 0;
  let l = params.litres && params.litres > 0 ? params.litres : 0;
  const d = params.discountPct && params.discountPct > 0 ? params.discountPct : 0;
  const vatRate = params.vatRate ?? 20;

  // İskonto hesaplaması
  let effectiveUnitPrice = p;
  if (d > 0 && p > 0) {
    effectiveUnitPrice = round2(p * (1 - d / 100));
  }

  if (params.lastChangedField === 'amount') {
    // Tutar değişti: Eğer birim fiyat varsa litre hesaplanır; yoksa ve litre varsa birim fiyat hesaplanır
    if (effectiveUnitPrice > 0) {
      l = round2(t / effectiveUnitPrice);
    } else if (l > 0) {
      effectiveUnitPrice = round2(t / l);
      p = d > 0 ? round2(effectiveUnitPrice / (1 - d / 100)) : effectiveUnitPrice;
    }
  } else if (params.lastChangedField === 'litres') {
    // Litre değişti: Eğer birim fiyat varsa tutar hesaplanır; yoksa ve tutar varsa birim fiyat hesaplanır
    if (effectiveUnitPrice > 0) {
      t = round2(l * effectiveUnitPrice);
    } else if (t > 0) {
      effectiveUnitPrice = round2(t / l);
      p = d > 0 ? round2(effectiveUnitPrice / (1 - d / 100)) : effectiveUnitPrice;
    }
  } else if (params.lastChangedField === 'unitPrice') {
    // Fiyat değişti: Eğer tutar varsa litre güncellenir; yoksa ve litre varsa tutar güncellenir
    if (effectiveUnitPrice > 0) {
      if (t > 0) {
        l = round2(t / effectiveUnitPrice);
      } else if (l > 0) {
        t = round2(l * effectiveUnitPrice);
      }
    }
  }

  // KDV Ayrıştırması (%20 İç KDV)
  const netAmount = round2(t / (1 + vatRate / 100));
  const vatAmount = round2(t - netAmount);
  const netPriceWithoutVat = l > 0 ? round2(netAmount / l) : 0;

  // İskontodan elde edilen tasarruf
  const originalTotal = p > 0 && l > 0 ? round2(p * l) : t;
  const discountSavedAmount = Math.max(0, round2(originalTotal - t));

  return {
    unitPrice: round2(p || effectiveUnitPrice),
    amount: round2(t),
    litres: round2(l),
    netPriceWithoutVat,
    vatAmount,
    discountSavedAmount,
  };
}

export interface FuelConsumptionParams {
  litres: number;
  currentKm: number;
  prevKm: number;
  totalAmount: number;
  tankCapacityLitres?: number;
  targetConsumptionPer100Km?: number;
  cargoWeightTon?: number;
  isFullTank?: boolean;
}

export interface FuelConsumptionResult {
  deltaKm: number;
  consumptionPer100Km: number; // LT / 100 KM
  kmPerLitre: number; // KM / LT
  costPerKm: number; // ₺ / KM
  performanceStatus: 'super' | 'normal' | 'yuksek' | 'asiri_anomali';
  performanceMessage: string;
  anomalies: string[];
}

/**
 * Önceki KM - Güncel KM telemetrisiyle tüketim fiziğini, kilometre başı maliyeti ve anomali uyarılarını hesaplar.
 */
export function calculateFuelConsumption(params: FuelConsumptionParams): FuelConsumptionResult {
  const deltaKm = Math.max(0, params.currentKm - params.prevKm);
  const anomalies: string[] = [];

  // Sayaç Kontrolü
  if (params.currentKm <= params.prevKm && params.prevKm > 0) {
    anomalies.push('Güncel kilometre sayacı önceki kilometreden küçük veya eşit olamaz!');
  }

  // Depo Hacmi Aşımı Kontrolü
  if (params.tankCapacityLitres && params.tankCapacityLitres > 0) {
    if (params.litres > params.tankCapacityLitres) {
      anomalies.push(
        `Alınan yakıt (${params.litres} LT) aracın azami depo hacminden (${params.tankCapacityLitres} LT) büyüktür!`
      );
    }
  }

  if (deltaKm <= 0 || params.litres <= 0) {
    return {
      deltaKm,
      consumptionPer100Km: 0,
      kmPerLitre: 0,
      costPerKm: 0,
      performanceStatus: 'normal',
      performanceMessage: 'Yetersiz kilometre verisi.',
      anomalies,
    };
  }

  // Temel tüketim fiziği
  const consumptionPer100Km = round2((params.litres / deltaKm) * 100);
  const kmPerLitre = round2(deltaKm / params.litres);
  const costPerKm = round2(params.totalAmount / deltaKm);

  // Beklenen Tüketim Hesaplaması (Ağır vasıta fiziği)
  const baseline = params.targetConsumptionPer100Km || 29.5;
  const tonajBonus = params.cargoWeightTon ? params.cargoWeightTon * 0.45 : 0;
  const expectedConsumption = baseline + tonajBonus;

  let performanceStatus: FuelConsumptionResult['performanceStatus'] = 'normal';
  let performanceMessage = 'Yakıt tüketimi filo normlarına uygun.';

  if (consumptionPer100Km < expectedConsumption * 0.85) {
    performanceStatus = 'super';
    performanceMessage = `Mükemmel ekonomi! 100 km'de ${consumptionPer100Km} LT ile normun altında verimli sürüş.`;
  } else if (consumptionPer100Km <= expectedConsumption * 1.15) {
    performanceStatus = 'normal';
    performanceMessage = `Standart tüketim: 100 km'de ${consumptionPer100Km} LT (Beklenen: ~${round2(expectedConsumption)} LT).`;
  } else if (consumptionPer100Km <= expectedConsumption * 1.30) {
    performanceStatus = 'yuksek';
    performanceMessage = `Yüksek tüketim: 100 km'de ${consumptionPer100Km} LT (%${Math.round(
      ((consumptionPer100Km - expectedConsumption) / expectedConsumption) * 100
    )} aşım).`;
  } else {
    performanceStatus = 'asiri_anomali';
    performanceMessage = `AŞIRI YÜKSEK TÜKETİM / ANOMALİ! 100 km'de ${consumptionPer100Km} LT mazot yakımı tespit edildi. Mazot çekme veya sayaç atlama şüphesi!`;
    anomalies.push(`Beklenen tüketim ${round2(expectedConsumption)} LT iken gerçekleşen ${consumptionPer100Km} LT!`);
  }

  return {
    deltaKm,
    consumptionPer100Km,
    kmPerLitre,
    costPerKm,
    performanceStatus,
    performanceMessage,
    anomalies,
  };
}