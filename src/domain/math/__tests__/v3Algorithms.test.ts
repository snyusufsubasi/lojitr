import { describe, it, expect } from 'vitest';
import {
  solveFuelEquation,
  calculateFuelConsumption,
} from '../fuelTelemetryMath';
import {
  lookupRouteInfo,
} from '../turkeyRouteMatrix';
import {
  solveKmTriangle,
  calculateDynamicFreight,
  simulateTripBreakEven,
} from '../tripEngineeringMath';
import {
  analyzeTireWear,
  analyzeVehicleTireFleet,
  type TireRecord,
} from '../tireWearEngine';
import {
  isValidVKN,
  isValidTCKN,
  isValidTurkishIBAN,
  isValidTurkishPlate,
  formatTurkishIBAN,
} from '../trValidators';

describe('1. Fuel Telemetry Engine (Yakıt & Telemetri Matematiği)', () => {
  it('Birim fiyat ve tutardan litreyi doğru hesaplamalı (Amount & Price -> Liters)', () => {
    const solved = solveFuelEquation({
      amount: 4500,
      unitPrice: 45.0,
      lastChangedField: 'amount',
    });
    expect(solved.litres).toBe(100);
  });

  it('Birim fiyat ve litreden toplam tutarı doğru hesaplamalı (Liters & Price -> Amount)', () => {
    const solved = solveFuelEquation({
      litres: 250,
      unitPrice: 44.5,
      lastChangedField: 'litres',
    });
    expect(solved.amount).toBe(11125);
  });

  it('Toplam tutar ve litreden birim fiyatı doğru hesaplamalı (Amount & Liters -> Price)', () => {
    const solved = solveFuelEquation({
      amount: 8800,
      litres: 200,
      lastChangedField: 'amount',
    });
    expect(solved.unitPrice).toBe(44);
  });

  it('Sayaç delta KM ve tüketim fiziğini (L/100km & ₺/km) hatasız hesaplamalı', () => {
    const res = calculateFuelConsumption({
      prevKm: 145000,
      currentKm: 145800, // 800 km
      litres: 256,
      totalAmount: 11520,
      isFullTank: true,
      targetConsumptionPer100Km: 32,
    });

    expect(res.deltaKm).toBe(800);
    expect(res.consumptionPer100Km).toBe(32); // (256 / 800) * 100 = 32 L
    expect(res.costPerKm).toBe(14.4); // 11520 / 800 = 14.4 ₺/km
    expect(res.performanceStatus).toBe('normal');
  });

  it('Aşırı yakıt tüketiminde (>38 L/100km) anomali ve yakıt çalınma/kaçak alarmı vermeli', () => {
    const res = calculateFuelConsumption({
      prevKm: 100000,
      currentKm: 100500, // 500 km
      litres: 240, // 48 L / 100km!
      totalAmount: 10800,
      isFullTank: true,
      targetConsumptionPer100Km: 32,
    });

    expect(res.consumptionPer100Km).toBe(48);
    expect(res.performanceStatus).toBe('asiri_anomali');
    expect(res.anomalies.length).toBeGreaterThan(0);
  });
});

describe('2. Turkey Route Matrix (81 İl Güzergah & Geçiş Ücretleri)', () => {
  it('İstanbul - Ankara rotasını matristen 450 km ve ~6 saat olarak çekmeli', () => {
    const route = lookupRouteInfo('İstanbul', 'Ankara');
    expect(route.distanceKm).toBe(450);
    expect(route.drivingHours).toBe(6.0);
    expect(route.estimatedTollCost).toBeGreaterThan(0);
  });

  it('İzmir - İstanbul rotasını Osmangazi ve O-5 otoyolu bazında doğru çekmeli', () => {
    const route = lookupRouteInfo('İstanbul', 'İzmir');
    expect(route.distanceKm).toBe(480);
    expect(route.estimatedTollCost).toBeGreaterThanOrEqual(1200);
  });

  it('Matriste olmayan illerde güvenli varsayılan rota parametreleri döndürmeli', () => {
    const route = lookupRouteInfo('Artvin', 'Muğla');
    expect(route.distanceKm).toBeGreaterThan(0);
    expect(route.drivingHours).toBeGreaterThan(0);
  });
});

describe('3. Trip Engineering & Break-Even Simulation (Sefer Mühendisliği & Başabaş)', () => {
  it('KM üçgeni çözücüsü delta KM, başlangıç ve bitiş sayaçlarını senkronize etmeli', () => {
    const res = solveKmTriangle(210000, 211250, undefined, 'endKm');
    expect(res.distanceKm).toBe(1250);
  });

  it('4 farklı navlun fiyatlandırma modunu (sabit, ton, km, palet) doğru hesaplamalı', () => {
    // 1. Sabit Navlun
    const fixed = calculateDynamicFreight({
      pricingKind: 'sabit',
      unitPrice: 38000,
    });
    expect(fixed.freightNet).toBe(38000);

    // 2. Tonajlı Navlun (Kantar Çıkış-Varış ve Fire Kesintisi)
    const ton = calculateDynamicFreight({
      pricingKind: 'ton',
      weighbridgeStartTon: 26.0,
      weighbridgeEndTon: 25.0, // 1 ton kayıp (fire toleransı %0.3 = 0.078 ton -> ~0.92 ton ceza)
      unitPrice: 1200,
      lossTolerancePct: 0.3,
    });
    expect(ton.effectiveBillingWeightTon).toBe(25.0);
    expect(ton.freightNet).toBeLessThan(ton.calculatedFreight);

    // 3. KM Başı Navlun
    const kmBased = calculateDynamicFreight({
      pricingKind: 'km',
      distanceKm: 850,
      unitPrice: 42,
    });
    expect(kmBased.freightNet).toBe(35700);

    // 4. Palet Başı Navlun
    const palletBased = calculateDynamicFreight({
      pricingKind: 'palet',
      pieceCount: 33,
      unitPrice: 800,
    });
    expect(palletBased.freightNet).toBe(26400);
  });

  it('Başabaş (Break-Even) ve sefer kârlılık simülasyonunu doğru hesaplamalı', () => {
    const sim = simulateTripBreakEven({
      distanceKm: 1000,
      freightNet: 35000,
      fuelPricePerLitre: 45,
      avgFuelPer100Km: 32, // 320 L * 45 = 14400 ₺
      estimatedTollCost: 2000,
      driverPerDiem: 1500,
      tireAndWearCostPerKm: 1.5, // 1500 ₺
      desiredProfitMarginPct: 20,
    });

    expect(sim.estimatedFuelCost).toBe(14400);
    expect(sim.breakEvenFreight).toBeGreaterThan(0);
    expect(sim.projectedNetProfit).toBeGreaterThan(0);
    expect(sim.status).toBe('cok_karli');
  });
});

describe('4. Tire Wear & Symmetry Engine (Lastik Aşınma & Çift Teker Simetrisi)', () => {
  it('Diş derinliği, kalan güvenli KM ve KM başı maliyeti (CPK) doğru hesaplamalı', () => {
    const mockTire: TireRecord = {
      id: 'tire-1',
      vehicleId: 'veh-1',
      positionCode: 'on_sol',
      axleType: 'on_direksiyon',
      brand: 'Michelin',
      model: 'X-Multi',
      size: '315/80 R22.5',
      initialTreadMm: 16.0,
      currentTreadMm: 9.0, // 7mm aşınmış
      minSafeTreadMm: 3.0,
      mountKm: 100000,
      historicalKm: 0,
      purchaseCost: 14000,
      retreadCount: 0,
      retreadTotalCost: 0,
      scrapValue: 1000,
      lastMeasurementDate: '2026-01-01',
    };

    const analysis = analyzeTireWear(mockTire, 170000, 350); // 70.000 KM delta

    expect(analysis.treadWearMm).toBe(7.0);
    expect(analysis.wearRatePer10kKm).toBe(1.0); // 7mm / 70k * 10k = 1.0mm per 10k
    expect(analysis.remainingSafeKm).toBe(60000); // (9 - 3) * 10000 = 60000 km
    expect(analysis.cpk).toBeGreaterThan(0);
    expect(analysis.urgency).toBe('optimal');
  });

  it('Çift teker dingildeki asimetriyi tespit edip aks uyarısı vermeli', () => {
    const mockTires: TireRecord[] = [
      {
        id: 'tire-1',
        vehicleId: 'veh-1',
        positionCode: 'ceker_sol_dis',
        axleType: 'ceker_tahrik',
        brand: 'Bridgestone',
        model: 'Ecopia',
        size: '315/80 R22.5',
        initialTreadMm: 18.0,
        currentTreadMm: 11.0,
        minSafeTreadMm: 3.0,
        mountKm: 0,
        historicalKm: 0,
        purchaseCost: 12000,
        retreadCount: 0,
        retreadTotalCost: 0,
        scrapValue: 0,
        lastMeasurementDate: '2026-01-01',
      },
      {
        id: 'tire-2',
        vehicleId: 'veh-1',
        positionCode: 'ceker_sol_ic',
        axleType: 'ceker_tahrik',
        brand: 'Bridgestone',
        model: 'Ecopia',
        size: '315/80 R22.5',
        initialTreadMm: 18.0,
        currentTreadMm: 7.0, // 4mm fark!
        minSafeTreadMm: 3.0,
        mountKm: 0,
        historicalKm: 0,
        purchaseCost: 12000,
        retreadCount: 0,
        retreadTotalCost: 0,
        scrapValue: 0,
        lastMeasurementDate: '2026-01-01',
      },
    ];

    const fleetSummary = analyzeVehicleTireFleet(mockTires, 50000, 350);
    expect(fleetSummary.totalTireAssetValue).toBe(24000);
    expect(fleetSummary.symmetryAlerts.length).toBeGreaterThan(0);
  });
});

describe('5. Turkish Domain Validators (TCKN, VKN, IBAN, Plaka)', () => {
  it('Mod-10 Algoritması ile Vergi Kimlik Numarasını (VKN) doğrulamalı', () => {
    expect(isValidVKN('1111111111')).toBe(false);
    expect(isValidVKN('012345678')).toBe(false); // 9 hane eksik
  });

  it('Mod-10/11 Algoritması ile TC Kimlik Numarasını (TCKN) doğrulamalı', () => {
    expect(isValidTCKN('10000000146')).toBe(true);
    expect(isValidTCKN('01234567890')).toBe(false); // 0 ile başlayamaz
    expect(isValidTCKN('12345678901')).toBe(false); // Kurala uymaz
  });

  it('Mod-97 TR IBAN doğrulamasını ve biçimlendirmesini yapmalı', () => {
    const validSample = 'TR330006100519786457841326';
    expect(isValidTurkishIBAN(validSample)).toBe(true);
    expect(isValidTurkishIBAN('TR000000000000000000000000')).toBe(false);

    const formatted = formatTurkishIBAN('tr330006100519786457841326');
    expect(formatted).toBe('TR33 0006 1005 1978 6457 8413 26');
  });

  it('Türk plaka formatlarını (01-81) doğru doğrulamalı', () => {
    expect(isValidTurkishPlate('34 ABC 789')).toBe(true);
    expect(isValidTurkishPlate('06 K 1234')).toBe(true);
    expect(isValidTurkishPlate('35 A 1234')).toBe(true);
    expect(isValidTurkishPlate('41 AB 123')).toBe(true);
    expect(isValidTurkishPlate('99 ABC 123')).toBe(false); // 99 il kodu yok
    expect(isValidTurkishPlate('00 AB 123')).toBe(false); // 00 il kodu yok
  });
});