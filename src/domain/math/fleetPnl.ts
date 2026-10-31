// Fleet Profit & Loss (P&L) Matrix, Cost-per-KM, and Fuel Efficiency Engine
import type { Vehicle, Trip, Expense } from '../types';
import { calculateTripFinancials } from './tripMath';
import { round2 } from './fx';

export interface VehiclePnlRow {
  vehicle: Vehicle;
  tripCount: number;
  tripKm: number;
  odometerKm: number;
  effectiveKm: number;
  emptyKm: number;
  kmSource: 'odometer' | 'trips';
  revenue: number;
  tripExpenses: number;
  vehicleExpenses: number;
  fixedExpenses: number;
  totalExpenses: number;
  fuelAmount: number;
  fuelLitres: number;
  expectedFuelLitres?: number;
  fuelVarianceLitres?: number;
  actualLPer100?: number;
  netProfit: number;
  marginPct: number;
  costPerKm?: number;
  revenuePerKm?: number;
  profitPerKm?: number;
}

export function computeFleetPnlMatrix(
  vehicles: Vehicle[],
  trips: Trip[],
  expenses: Expense[],
  monthlyKmRows: Array<{ vehicleId: string; month: string; startKm: number; endKm: number }>,
  fixedCostRows: Array<{ vehicleId: string; monthlyAmount: number; startDate?: string; endDate?: string }>,
  periodStart?: string,
  periodEnd?: string
): { rows: VehiclePnlRow[]; unassignedExpenses: number; unassignedTripsRevenue: number } {
  const realVehicles = vehicles.filter((v) => v.type !== 'dorse');
  const knownIds = new Set(realVehicles.map((v) => v.id));

  const rows: VehiclePnlRow[] = realVehicles.map((v) => {
    const vTrips = trips.filter((t) => t.vehicleId === v.id && t.status !== 'iptal');
    const tripIds = new Set(vTrips.map((t) => t.id));
    const vExpenses = expenses.filter(
      (e) => e.vehicleId === v.id || (e.tripId && tripIds.has(e.tripId))
    );

    const tripCount = vTrips.length;
    const tripKm = vTrips.reduce((s, t) => s + (t.km ?? 0), 0);

    const odoRows = monthlyKmRows.filter((m) => {
      if (m.vehicleId !== v.id) return false;
      if (periodStart && m.month < periodStart.slice(0, 7)) return false;
      if (periodEnd && m.month > periodEnd.slice(0, 7)) return false;
      return true;
    });
    const odometerKm = odoRows.reduce((s, m) => s + Math.max(0, m.endKm - m.startKm), 0);
    const effectiveKm = odometerKm > 0 ? odometerKm : tripKm;
    const kmSource: 'odometer' | 'trips' = odometerKm > 0 ? 'odometer' : 'trips';
    const emptyKm = odometerKm > 0 ? Math.max(0, odometerKm - tripKm) : 0;

    let revenue = 0;
    let subcontractorCost = 0;
    for (const t of vTrips) {
      const fin = calculateTripFinancials(t);
      revenue += fin.netReceivable;
      subcontractorCost += fin.brokerPayable + fin.carrierPayable;
    }

    let tripExpenses = subcontractorCost;
    let vehicleExpenses = 0;
    let fuelAmount = 0;
    let fuelLitres = 0;

    for (const e of vExpenses) {
      if (e.tripId) tripExpenses += e.amount;
      else vehicleExpenses += e.amount;
      if (e.category === 'yakit') {
        fuelAmount += e.amount;
        fuelLitres += e.litres ?? 0;
      }
    }

    const fixedExpenses = fixedCostRows
      .filter((f) => f.vehicleId === v.id)
      .reduce((s, f) => s + (f.monthlyAmount || 0), 0);

    const totalExpenses = tripExpenses + vehicleExpenses + fixedExpenses;
    const netProfit = revenue - totalExpenses;
    const marginPct = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    const actualLPer100 =
      effectiveKm > 0 && fuelLitres > 0 ? round2((fuelLitres / effectiveKm) * 100) : undefined;
    const expectedFuelLitres =
      effectiveKm > 0 && v.avgFuelPer100Km && v.avgFuelPer100Km > 0
        ? round2((effectiveKm * v.avgFuelPer100Km) / 100)
        : undefined;
    const fuelVarianceLitres =
      expectedFuelLitres !== undefined && fuelLitres > 0
        ? round2(fuelLitres - expectedFuelLitres)
        : undefined;

    return {
      vehicle: v,
      tripCount,
      tripKm,
      odometerKm,
      effectiveKm,
      emptyKm,
      kmSource,
      revenue: round2(revenue),
      tripExpenses: round2(tripExpenses),
      vehicleExpenses: round2(vehicleExpenses),
      fixedExpenses: round2(fixedExpenses),
      totalExpenses: round2(totalExpenses),
      fuelAmount: round2(fuelAmount),
      fuelLitres: round2(fuelLitres),
      expectedFuelLitres,
      fuelVarianceLitres,
      actualLPer100,
      netProfit: round2(netProfit),
      marginPct: round2(marginPct),
      costPerKm: effectiveKm > 0 ? round2(totalExpenses / effectiveKm) : undefined,
      revenuePerKm: effectiveKm > 0 ? round2(revenue / effectiveKm) : undefined,
      profitPerKm: effectiveKm > 0 ? round2(netProfit / effectiveKm) : undefined,
    };
  });

  rows.sort((a, b) => b.netProfit - a.netProfit);

  const allVehicleTripIds = new Set(
    trips.filter((t) => knownIds.has(t.vehicleId)).map((t) => t.id)
  );
  const unassignedExpenses = expenses
    .filter((e) => (!e.vehicleId || !knownIds.has(e.vehicleId)) && (!e.tripId || !allVehicleTripIds.has(e.tripId)))
    .reduce((s, e) => s + e.amount, 0);

  const unassignedTripsRevenue = trips
    .filter((t) => t.status !== 'iptal' && !knownIds.has(t.vehicleId))
    .reduce((s, t) => s + calculateTripFinancials(t).netReceivable, 0);

  return {
    rows,
    unassignedExpenses: round2(unassignedExpenses),
    unassignedTripsRevenue: round2(unassignedTripsRevenue),
  };
}
