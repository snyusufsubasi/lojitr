// Pricing Packages & Vehicle Quota Engine
import type { Vehicle } from '../types';

export interface PlanPackage {
  code: 'baslangic' | 'standart' | 'profesyonel' | 'sinirsiz';
  name: string;
  vehicleLimit: number | null;
  storageGb: number;
  yearlyGross: number;
  monthlyEquivalent: number;
  badge?: string;
}

export const PACKAGES: PlanPackage[] = [
  {
    code: 'baslangic',
    name: 'Başlangıç',
    vehicleLimit: 3,
    storageGb: 3,
    yearlyGross: 4990,
    monthlyEquivalent: 416,
  },
  {
    code: 'standart',
    name: 'Standart',
    vehicleLimit: 10,
    storageGb: 10,
    yearlyGross: 9990,
    monthlyEquivalent: 833,
    badge: 'En Çok Tercih Edilen',
  },
  {
    code: 'profesyonel',
    name: 'Profesyonel',
    vehicleLimit: 25,
    storageGb: 25,
    yearlyGross: 19990,
    monthlyEquivalent: 1666,
  },
  {
    code: 'sinirsiz',
    name: 'Sınırsız',
    vehicleLimit: null,
    storageGb: 50,
    yearlyGross: 39990,
    monthlyEquivalent: 3333,
    badge: 'Kurumsal',
  },
];

export function isBillableVehicle(v: Pick<Vehicle, 'active' | 'type' | 'ownership'>): boolean {
  return Boolean(v.active && v.type !== 'dorse' && v.ownership !== 'dis');
}

export function preselectActiveVehicles(
  vehicles: Vehicle[],
  lastTripDates: Record<string, string>,
  limit: number
): string[] {
  const billable = vehicles.filter(isBillableVehicle);
  billable.sort((a, b) => {
    const da = lastTripDates[a.id] || '2000-01-01';
    const db = lastTripDates[b.id] || '2000-01-01';
    if (da !== db) return db.localeCompare(da);
    return a.plate.localeCompare(b.plate);
  });
  return billable.slice(0, limit).map((v) => v.id);
}
