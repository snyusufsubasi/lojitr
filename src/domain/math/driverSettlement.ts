// Driver Settlement & Monthly Pay calculation engine
import type { Driver, Trip, Expense, Payment } from '../types';
import { calculateTripFinancials } from './tripMath';
import { round2 } from './fx';

export interface DriverSettlementResult {
  driver: Driver;
  salaryEarned: number;
  perDiemEarned: number;
  kmPayEarned: number;
  commissionEarned: number;
  outOfPocketExpenses: number;
  receiptsTotal: number;
  totalEarned: number;
  advances: number;
  salaryPaid: number;
  perDiemPaid: number;
  otherPaid: number;
  collectionsHeld: number;
  totalPaid: number;
  netBalance: number;
  payable: number;
  receivable: number;
  tripCount: number;
  tripsKm: number;
  odometerKm?: number;
  effectiveKm: number;
  odometerMissing: boolean;
}

export function calculateProratedSalary(
  baseSalary: number,
  periodStart: string,
  periodEnd: string,
  driverStartDate?: string,
  driverEndDate?: string
): number {
  if (baseSalary <= 0) return 0;
  const pStart = new Date(periodStart).getTime();
  const pEnd = new Date(periodEnd).getTime();
  const totalDays = Math.floor((pEnd - pStart) / 86400000) + 1;
  if (totalDays <= 0) return baseSalary;

  const effStart = driverStartDate ? Math.max(pStart, new Date(driverStartDate).getTime()) : pStart;
  const effEnd = driverEndDate ? Math.min(pEnd, new Date(driverEndDate).getTime()) : pEnd;
  const activeDays = Math.max(0, Math.floor((effEnd - effStart) / 86400000) + 1);

  if (activeDays >= totalDays) return baseSalary;
  return round2((baseSalary * activeDays) / totalDays);
}

export function computeDriverSettlement(
  driver: Driver,
  trips: Trip[],
  expenses: Expense[],
  payments: Payment[],
  periodStart: string,
  periodEnd: string,
  odometerKmVal?: number
): DriverSettlementResult {
  const dTrips = trips.filter(
    (t) => t.driverId === driver.id && t.date >= periodStart && t.date <= periodEnd && t.status !== 'iptal'
  );
  const tripCount = dTrips.length;
  const tripsKm = dTrips.reduce((sum, t) => sum + (t.km || 0), 0);

  let effectiveKm = tripsKm;
  let odometerMissing = false;
  if (driver.kmMode === 'odometer') {
    if (odometerKmVal !== undefined && odometerKmVal > 0) {
      effectiveKm = odometerKmVal;
    } else {
      odometerMissing = true;
    }
  }

  // Earnings
  const salaryEarned = calculateProratedSalary(
    driver.salary || 0,
    periodStart,
    periodEnd,
    driver.startDate,
    driver.endDate
  );
  const perDiemEarned = tripCount * (driver.perDiem || 0);
  const kmPayEarned = round2(effectiveKm * (driver.kmRate || 0));

  let commissionEarned = 0;
  if (driver.tripCommissionPct && driver.tripCommissionPct > 0) {
    const totalFreight = dTrips.reduce(
      (sum, t) => sum + calculateTripFinancials(t).freightNet,
      0
    );
    commissionEarned = round2((totalFreight * driver.tripCommissionPct) / 100);
  }

  // Out of pocket expenses paid by driver
  const dExpenses = expenses.filter(
    (e) => e.driverId === driver.id && e.date >= periodStart && e.date <= periodEnd && e.source === 'sofor'
  );
  const outOfPocketExpenses = dExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Cash turned in to office by driver
  const turnedIn = payments.filter(
    (p) => p.driverId === driver.id && p.kind === 'tahsilat' && !p.contactId && p.date >= periodStart && p.date <= periodEnd
  );
  const receiptsTotal = turnedIn.reduce((sum, p) => sum + p.amount, 0);

  const totalEarned = round2(
    salaryEarned + perDiemEarned + kmPayEarned + commissionEarned + outOfPocketExpenses + receiptsTotal
  );

  // Deductions / Payments made to driver
  const dPayments = payments.filter(
    (p) => p.driverId === driver.id && p.date >= periodStart && p.date <= periodEnd
  );
  const advances = dPayments
    .filter((p) => p.kind === 'avans')
    .reduce((sum, p) => sum + p.amount, 0);
  const salaryPaid = dPayments
    .filter((p) => p.kind === 'maas')
    .reduce((sum, p) => sum + p.amount, 0);
  const perDiemPaid = dPayments
    .filter((p) => p.kind === 'harcirah')
    .reduce((sum, p) => sum + p.amount, 0);
  const otherPaid = dPayments
    .filter((p) => p.kind === 'odeme')
    .reduce((sum, p) => sum + p.amount, 0);

  // Collections held in driver's pocket
  const collectionsHeld = payments
    .filter(
      (p) => p.driverId === driver.id && p.kind === 'tahsilat' && Boolean(p.contactId) && p.date >= periodStart && p.date <= periodEnd
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPaid = round2(advances + salaryPaid + perDiemPaid + otherPaid + collectionsHeld);
  const netBalance = round2(totalEarned - totalPaid);

  return {
    driver,
    salaryEarned: round2(salaryEarned),
    perDiemEarned: round2(perDiemEarned),
    kmPayEarned: round2(kmPayEarned),
    commissionEarned: round2(commissionEarned),
    outOfPocketExpenses: round2(outOfPocketExpenses),
    receiptsTotal: round2(receiptsTotal),
    totalEarned,
    advances: round2(advances),
    salaryPaid: round2(salaryPaid),
    perDiemPaid: round2(perDiemPaid),
    otherPaid: round2(otherPaid),
    collectionsHeld: round2(collectionsHeld),
    totalPaid,
    netBalance,
    payable: netBalance > 0 ? netBalance : 0,
    receivable: netBalance < 0 ? Math.abs(netBalance) : 0,
    tripCount,
    tripsKm,
    odometerKm: odometerKmVal,
    effectiveKm,
    odometerMissing,
  };
}
