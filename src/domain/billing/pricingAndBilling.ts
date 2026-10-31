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

export const PACKAGES: PlanPackage[] = [\n  {\n    code: 'baslangic',\n    name: 'Başlangıç',\n    vehicleLimit: 3,\n    storageGb: 3,\n    yearlyGross: 4990,\n    monthlyEquivalent: 416,\n  },\n  {\n    code: 'standart',\n    name: 'Standart',\n    vehicleLimit: 10,\n    storageGb: 10,\n    yearlyGross: 9990,\n    monthlyEquivalent: 833,\n    badge: 'En Çok Tercih Edilen',\n  },\n  {\n    code: 'profesyonel',\n    name: 'Profesyonel',\n    vehicleLimit: 25,\n    storageGb: 25,\n    yearlyGross: 19990,\n    monthlyEquivalent: 1666,\n  },\n  {\n    code: 'sinirsiz',\n    name: 'Sınırsız',\n    vehicleLimit: null,\n    storageGb: 50,\n    yearlyGross: 39990,\n    monthlyEquivalent: 3333,\n    badge: 'Kurumsal',\n  },\n];

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
