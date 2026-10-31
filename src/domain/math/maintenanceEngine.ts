// src/domain/math/maintenanceEngine.ts
// LojiTR v3.0 - Çift Tetikleyicili Kestirimci Koruyucu Bakım ve Evrak Motoru

import { addDaysIso, isoToday } from '@/lib/formatters';

export type MaintenanceCategory =
  | 'motor_yagi_filtre'
  | 'sanziman_diferansiyel'
  | 'hava_kurutucu_kartus'
  | 'fren_balata_disk'
  | 'tuvturk_muayene'
  | 'trafik_sigortasi'
  | 'kasko'
  | 'takograf_kalibrasyon'
  | 'sofor_src_psikoteknik';

export interface MaintenanceItemRule {
  id: string;
  category: MaintenanceCategory;
  title: string;
  intervalKm?: number;
  intervalDays?: number;
  lastDoneKm?: number;
  lastDoneDate?: string;
  warningThresholdKm: number;
  warningThresholdDays: number;
  estimatedCost: number;
}

export interface MaintenancePrediction {
  category: MaintenanceCategory;
  title: string;
  status: 'guncel' | 'yaklasti' | 'gecikti';
  urgencyDays: number;
  triggerCause: 'km' | 'zaman' | 'her_ikisi';
  remainingKm: number | null;
  remainingDays: number | null;
  targetServiceDate: string;
  estimatedCost: number;
  advice: string;
}

export function predictMaintenanceSchedule(
  rules: MaintenanceItemRule[],
  currentVehicleKm: number,
  monthlyAverageKm: number = 10000
): MaintenancePrediction[] {
  const dailyKm = Math.max(10, monthlyAverageKm / 30);
  const today = new Date(isoToday()).getTime();

  return rules.map((rule) => {
    let remainingKm: number | null = null;
    let daysToKmTrigger: number | null = null;
    if (rule.intervalKm && rule.lastDoneKm !== undefined) {
      const nextDueKm = rule.lastDoneKm + rule.intervalKm;
      remainingKm = nextDueKm - currentVehicleKm;
      daysToKmTrigger = Math.round(remainingKm / dailyKm);
    }

    let remainingDays: number | null = null;
    if (rule.intervalDays && rule.lastDoneDate) {
      const lastDateTime = new Date(rule.lastDoneDate).getTime();
      const dueDateTime = lastDateTime + rule.intervalDays * 86400000;
      remainingDays = Math.round((dueDateTime - today) / 86400000);
    }

    let triggerCause: 'km' | 'zaman' | 'her_ikisi' = 'her_ikisi';
    let effectiveDaysLeft = 9999;

    if (daysToKmTrigger !== null && remainingDays !== null) {
      if (Math.abs(daysToKmTrigger - remainingDays) <= 3) {
        triggerCause = 'her_ikisi';
        effectiveDaysLeft = Math.min(daysToKmTrigger, remainingDays);
      } else if (daysToKmTrigger < remainingDays) {
        triggerCause = 'km';
        effectiveDaysLeft = daysToKmTrigger;
      } else {
        triggerCause = 'zaman';
        effectiveDaysLeft = remainingDays;
      }
    } else if (daysToKmTrigger !== null) {
      triggerCause = 'km';
      effectiveDaysLeft = daysToKmTrigger;
    } else if (remainingDays !== null) {
      triggerCause = 'zaman';
      effectiveDaysLeft = remainingDays;
    }

    let status: MaintenancePrediction['status'] = 'guncel';
    const isKmExpired = remainingKm !== null && remainingKm <= 0;
    const isTimeExpired = remainingDays !== null && remainingDays <= 0;
    const isKmNear = remainingKm !== null && remainingKm <= rule.warningThresholdKm;
    const isTimeNear = remainingDays !== null && remainingDays <= rule.warningThresholdDays;

    if (isKmExpired || isTimeExpired) {
      status = 'gecikti';
    } else if (isKmNear || isTimeNear) {
      status = 'yaklasti';
    }

    const targetServiceDate = addDaysIso(isoToday(), effectiveDaysLeft);

    let advice = '';
    if (status === 'gecikti') {
      advice = `Acil Müdahale! ${
        isKmExpired
          ? `KM sınırı ${Math.abs(remainingKm!)} KM aşıldı.`
          : `Süre ${Math.abs(remainingDays!)} gün geçti.`
      } Araç en kısa sürede yetkili servise çekilmelidir.`;
    } else if (status === 'yaklasti') {
      advice = `Servis Randevusu Alın: Yaklaşık ${effectiveDaysLeft} gün sonra (${
        triggerCause === 'km' ? `${remainingKm} KM kaldı` : `${remainingDays} gün kaldı`
      }) bakım zamanı doluyor.`;
    } else {
      advice = `Durum Normal. Bir sonraki planlı bakım: ${targetServiceDate}`;
    }

    return {
      category: rule.category,
      title: rule.title,
      status,
      urgencyDays: effectiveDaysLeft,
      triggerCause,
      remainingKm,
      remainingDays,
      targetServiceDate,
      estimatedCost: rule.estimatedCost,
      advice,
    };
  });
}