// src/domain/math/tireWearEngine.ts
// LojiTR v3.0 - Milimetrik Lastik Aşınma, CPK ve Aks Rotasyon Öneri Motoru

import { round2 } from './fx';
import { addDaysIso, isoToday } from '@/lib/formatters';

export type TireAxleType = 'on_direksiyon' | 'ceker_tahrik' | 'dorse_serbest' | 'stepne';

export interface TireRecord {
  id: string;
  vehicleId: string;
  positionCode: string; // 'on_sol', 'on_sag', 'ceker_sol_dis', 'ceker_sol_ic', 'ceker_sag_ic', 'ceker_sag_dis', 'stepne'
  axleType: TireAxleType;
  brand: string;
  model: string;
  size: string;
  serialNo?: string;
  dotCode?: string;
  initialTreadMm: number;
  currentTreadMm: number;
  minSafeTreadMm: number;
  mountKm: number;
  historicalKm: number;
  purchaseCost: number;
  retreadCount: number;
  retreadTotalCost: number;
  scrapValue: number;
  lastMeasurementDate: string;
}

export interface TireAnalysisResult {
  tireId: string;
  positionCode: string;
  currentKmTotal: number;
  treadWearMm: number;
  wearRatePer10kKm: number;
  kmPerMm: number;
  remainingSafeKm: number;
  estimatedReplacementDate: string | null;
  healthScore: number; // 0 - 100
  urgency: 'optimal' | 'dikkat' | 'kritik' | 'degisim_zamani';
  cpk: number; // ₺ / KM
  warnings: string[];
}

export interface AxleSymmetryAlert {
  axleName: string;
  leftTreadMm: number;
  rightTreadMm: number;
  differenceMm: number;
  issueType: 'rot_ayari_bozuk' | 'hava_basinci_farki' | 'dingil_egriligi';
  recommendation: string;
}

export interface FleetTireSummary {
  vehicleId: string;
  totalTireAssetValue: number;
  vehicleCombinedCpk: number;
  criticalTiresCount: number;
  averageTreadMm: number;
  nextReplacementInKm: number;
  rotationRecommendations: string[];
  symmetryAlerts: AxleSymmetryAlert[];
}

/**
 * Tekil lastiğin aşınma fiziğini, kalan güvenli ömrünü ve CPK'sını hesaplar.
 */
export function analyzeTireWear(
  tire: TireRecord,
  vehicleCurrentOdometerKm: number,
  dailyAverageKm: number = 350
): TireAnalysisResult {
  const mountDeltaKm = Math.max(0, vehicleCurrentOdometerKm - tire.mountKm);
  const totalKm = tire.historicalKm + mountDeltaKm;
  const initialMm = Math.max(tire.initialTreadMm, tire.currentTreadMm);
  const treadWearMm = round2(Math.max(0, initialMm - tire.currentTreadMm));
  const minSafe = tire.minSafeTreadMm || 3.0;

  let kmPerMm = 0;
  let wearRatePer10kKm = 0;
  if (treadWearMm > 0.05 && totalKm > 100) {
    kmPerMm = round2(totalKm / treadWearMm);
    wearRatePer10kKm = round2((treadWearMm / totalKm) * 10000);
  } else {
    const defaultNorms: Record<TireAxleType, number> = {
      on_direksiyon: 0.65,
      ceker_tahrik: 1.05,
      dorse_serbest: 0.8,
      stepne: 0.0,
    };
    wearRatePer10kKm = defaultNorms[tire.axleType] || 0.85;
    kmPerMm = wearRatePer10kKm > 0 ? round2(10000 / wearRatePer10kKm) : 12000;
  }

  const usableTreadRemaining = Math.max(0, tire.currentTreadMm - minSafe);
  const remainingSafeKm = Math.round(usableTreadRemaining * kmPerMm);

  let estimatedReplacementDate: string | null = null;
  if (remainingSafeKm > 0 && dailyAverageKm > 10) {
    const daysRemaining = Math.round(remainingSafeKm / dailyAverageKm);
    estimatedReplacementDate = addDaysIso(isoToday(), daysRemaining);
  } else if (usableTreadRemaining <= 0) {
    estimatedReplacementDate = isoToday();
  }

  const totalUsableInitial = Math.max(0.1, initialMm - minSafe);
  const currentUsable = Math.max(0, tire.currentTreadMm - minSafe);
  const healthScore = Math.min(100, Math.max(0, Math.round((currentUsable / totalUsableInitial) * 100)));

  let urgency: TireAnalysisResult['urgency'] = 'optimal';
  const warnings: string[] = [];

  if (tire.currentTreadMm <= minSafe) {
    urgency = 'degisim_zamani';
    warnings.push(
      `Kritik Aşınma! Diş derinliği yasal sınır olan ${minSafe} mm seviyesine indi. Acil değişim/kaplama gerekli.`
    );
  } else if (tire.currentTreadMm <= minSafe + 1.5) {
    urgency = 'kritik';
    warnings.push(
      `Yaklaşan Değişim: Diş derinliği ${tire.currentTreadMm} mm. Yaklaşık ${remainingSafeKm.toLocaleString(
        'tr-TR'
      )} KM sonra güvenli sınır aşılacak.`
    );
  } else if (tire.currentTreadMm <= minSafe + 3.0) {
    urgency = 'dikkat';
  }

  if (wearRatePer10kKm > 1.6 && tire.axleType !== 'stepne') {
    warnings.push(
      `Aşırı Hızlı Aşınma! Bu lastik 10.000 KM'de ${wearRatePer10kKm} mm eriyor (Norm: 0.8-1.1 mm). Basınç veya mekanik arıza kontrolü önerilir.`
    );
  }

  const netInvestedCost = Math.max(0, tire.purchaseCost + tire.retreadTotalCost - tire.scrapValue);
  const totalLifecycleExpectedKm = Math.max(1, totalKm + remainingSafeKm);
  const cpk = round2(netInvestedCost / totalLifecycleExpectedKm);

  return {
    tireId: tire.id,
    positionCode: tire.positionCode,
    currentKmTotal: totalKm,
    treadWearMm,
    wearRatePer10kKm,
    kmPerMm,
    remainingSafeKm,
    estimatedReplacementDate,
    healthScore,
    urgency,
    cpk,
    warnings,
  };
}

/**
 * Araç üzerindeki tüm lastikleri analiz eder; ikiz lastik ve aks simetri dengesizliklerini tespit eder.
 */
export function analyzeVehicleTireFleet(
  tires: TireRecord[],
  vehicleCurrentOdometerKm: number,
  dailyAverageKm: number = 350
): FleetTireSummary {
  const vehicleId = tires[0]?.vehicleId || '';
  const analyses = tires.map((t) => analyzeTireWear(t, vehicleCurrentOdometerKm, dailyAverageKm));

  const totalTireAssetValue = round2(
    tires.reduce((sum, t) => sum + t.purchaseCost + t.retreadTotalCost, 0)
  );
  const vehicleCombinedCpk = round2(analyses.reduce((sum, a) => sum + a.cpk, 0));
  const criticalTiresCount = analyses.filter(
    (a) => a.urgency === 'kritik' || a.urgency === 'degisim_zamani'
  ).length;
  const averageTreadMm = round2(
    tires.reduce((sum, t) => sum + t.currentTreadMm, 0) / Math.max(1, tires.length)
  );
  const safeDistances = analyses
    .filter((a) => a.positionCode !== 'stepne')
    .map((a) => a.remainingSafeKm);
  const nextReplacementInKm = safeDistances.length > 0 ? Math.min(...safeDistances) : 0;

  const symmetryAlerts: AxleSymmetryAlert[] = [];
  const rotationRecommendations: string[] = [];

  // Ön Aks Dümen Simetrisi
  const onSol = tires.find((t) => t.positionCode === 'on_sol');
  const onSag = tires.find((t) => t.positionCode === 'on_sag');
  if (onSol && onSag) {
    const diff = round2(Math.abs(onSol.currentTreadMm - onSag.currentTreadMm));
    if (diff >= 1.2) {
      symmetryAlerts.push({
        axleName: 'Ön Dümen Aksı',
        leftTreadMm: onSol.currentTreadMm,
        rightTreadMm: onSag.currentTreadMm,
        differenceMm: diff,
        issueType: 'rot_ayari_bozuk',
        recommendation: `Ön lastikler arasında ${diff} mm aşınma farkı var. Rot-balans ve ön düzen geometrisi kontrol edilmeli, lastikler çapraz rotasyona alınmalıdır.`,
      });
      rotationRecommendations.push(
        'Ön Sol ile Ön Sağ lastiklerinin jant üzerinde yön değiştirilerek çapraz rotasyonu önerilir.'
      );
    }
  }

  // Çeker Aks İkiz Teker Dengesizliği
  const cekerSolDis = tires.find((t) => t.positionCode === 'ceker_sol_dis');
  const cekerSolIc = tires.find((t) => t.positionCode === 'ceker_sol_ic');
  if (cekerSolDis && cekerSolIc) {
    const diff = round2(Math.abs(cekerSolDis.currentTreadMm - cekerSolIc.currentTreadMm));
    if (diff >= 1.5) {
      symmetryAlerts.push({
        axleName: 'Çeker Sol İkiz Aksı',
        leftTreadMm: cekerSolDis.currentTreadMm,
        rightTreadMm: cekerSolIc.currentTreadMm,
        differenceMm: diff,
        issueType:
          cekerSolDis.currentTreadMm < cekerSolIc.currentTreadMm
            ? 'hava_basinci_farki'
            : 'dingil_egriligi',
        recommendation: `Sol çeker ikiz tekerler arasında ${diff} mm fark var. ${
          cekerSolDis.currentTreadMm < cekerSolIc.currentTreadMm
            ? 'Dış teker fazla aşınmış: Hava basıncı düşüklüğü kontrol edilmeli.'
            : 'İç teker fazla aşınmış: Aşırı hava basıncı veya dingil kasıntı kontrolü yapılmalı.'
        }`,
      });
    }
  }

  // Çeker Sağ İkiz Aksı
  const cekerSagDis = tires.find((t) => t.positionCode === 'ceker_sag_dis');
  const cekerSagIc = tires.find((t) => t.positionCode === 'ceker_sag_ic');
  if (cekerSagDis && cekerSagIc) {
    const diff = round2(Math.abs(cekerSagDis.currentTreadMm - cekerSagIc.currentTreadMm));
    if (diff >= 1.5) {
      symmetryAlerts.push({
        axleName: 'Çeker Sağ İkiz Aksı',
        leftTreadMm: cekerSagIc.currentTreadMm,
        rightTreadMm: cekerSagDis.currentTreadMm,
        differenceMm: diff,
        issueType:
          cekerSagDis.currentTreadMm < cekerSagIc.currentTreadMm
            ? 'hava_basinci_farki'
            : 'dingil_egriligi',
        recommendation: `Sağ çeker ikiz tekerler arasında ${diff} mm fark var.`,
      });
    }
  }

  if (onSol && onSol.currentTreadMm <= 5.5 && onSol.currentTreadMm > 3.5) {
    rotationRecommendations.push(
      'Ön dümen lastiklerinin diş derinliği 5.5 mm altına indi. Sürüş güvenliği için yeni ön lastik takılıp, mevcut ön lastiklerin dorse aksına veya çeker iç aksına kaydırılması tavsiye edilir.'
    );
  }

  return {
    vehicleId,
    totalTireAssetValue,
    vehicleCombinedCpk,
    criticalTiresCount,
    averageTreadMm,
    nextReplacementInKm,
    rotationRecommendations,
    symmetryAlerts,
  };
}