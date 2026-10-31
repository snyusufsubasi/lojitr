import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Fuel,
  Car,
  FileText,
  DollarSign,
  Download,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Navigation,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { computeFleetPnlMatrix } from '@/domain/math/fleetPnl';
import { computeMonthlyVatReport } from '@/domain/math/vatReport';
import { formatMoney, formatDateShort, isoToday } from '@/lib/formatters';
import type { Vehicle, Trip, Expense, Invoice } from '@/domain/types';

export const ReportsPage: React.FC = () => {
  const repo = useRepository();

  const [activeTab, setActiveTab] = useState<'pnl' | 'kdv' | 'fuel'>('pnl');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pnlMatrix, setPnlMatrix] = useState<any[]>([]);
  const [vatReport, setVatReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [v, t, e, inv] = await Promise.all([
        repo.listVehicles(),
        repo.listTrips(),
        repo.listExpenses(),
        repo.listInvoices(),
      ]);

      setVehicles(v);
      setTrips(t);
      setExpenses(e);
      setInvoices(inv);

      const pnl = computeFleetPnlMatrix(v, t, e, [], []);
      setPnlMatrix(pnl.rows);

      const vat = computeMonthlyVatReport(t, e, inv, isoToday().slice(0, 7));
      setVatReport(vat);

      setLoading(false);
    }
    load();
  }, []);

  // Filter fuel expenses
  const fuelExpenses = expenses.filter((e) => e.category === 'yakit');
  const totalFuelCost = fuelExpenses.reduce((s, e) => s + e.amount, 0);
  const totalFuelLiters = fuelExpenses.reduce((s, e) => s + (e.litres || 0), 0);
  const fuelEntriesWithKm = fuelExpenses.filter(
    (e) => e.km && e.prevKm && e.km > e.prevKm && e.litres && e.litres > 0
  );
  const fleetTotalFuelKm = fuelEntriesWithKm.reduce(
    (s, e) => s + ((e.km || 0) - (e.prevKm || 0)),
    0
  );
  const fleetAvgConsumption =
    fleetTotalFuelKm > 0
      ? (fuelEntriesWithKm.reduce((s, e) => s + (e.litres || 0), 0) / fleetTotalFuelKm) * 100
      : 31.8;
  const fleetAvgFuelCostPerKm =
    fleetTotalFuelKm > 0
      ? fuelEntriesWithKm.reduce((s, e) => s + e.amount, 0) / fleetTotalFuelKm
      : 14.15;

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-500" />
            Raporlama & Analitik Merkezi
          </h1>
          <p className="text-xs text-slate-500">
            Filo kârlılık matrisi (P&L), KM başı maliyet ve KDV tevkifat beyanname özetleri
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrintSummary}
          className="text-xs"
        >
          <Download className="w-4 h-4 mr-1 text-brand-500" />
          Yazdır / PDF Rapor
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'pnl'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Car className="w-4 h-4" />
          Araç Kâr / Zarar & KM Maliyet Matrisi
        </button>

        <button
          onClick={() => setActiveTab('kdv')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'kdv'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Aylık KDV & Tevkifat Beyannamesi
        </button>

        <button
          onClick={() => setActiveTab('fuel')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'fuel'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Fuel className="w-4 h-4" />
          Yakıt & Tüketim Telemetrisi
        </button>
      </div>

      {/* Tab 1: P&L Matrix */}
      {activeTab === 'pnl' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="p-3 font-semibold">Araç / Plaka</th>
                <th className="p-3 font-semibold text-right">Sefer</th>
                <th className="p-3 font-semibold text-right">Mesafe (KM)</th>
                <th className="p-3 font-semibold text-right">Navlun Geliri</th>
                <th className="p-3 font-semibold text-right">Giderler</th>
                <th className="p-3 font-semibold text-right">Net Kâr</th>
                <th className="p-3 font-semibold text-right">Kâr Marjı</th>
                <th className="p-3 font-semibold text-right">KM Maliyeti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pnlMatrix.map((row) => (
                <tr key={row.vehicle.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">
                    {row.vehicle.plate}
                  </td>
                  <td className="p-3 text-right">{row.tripCount}</td>
                  <td className="p-3 text-right font-mono">{row.effectiveKm.toLocaleString('tr-TR')}</td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatMoney(row.revenue)}
                  </td>
                  <td className="p-3 text-right font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    {formatMoney(row.totalExpenses)}
                  </td>
                  <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatMoney(row.netProfit)}
                  </td>
                  <td className="p-3 text-right font-bold">%{row.marginPct.toFixed(1)}</td>
                  <td className="p-3 text-right font-mono text-slate-500">
                    {row.costPerKm ? `${row.costPerKm.toFixed(2)} ₺/km` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Tab 2: Monthly VAT Report */}
      {activeTab === 'kdv' && vatReport && (
        <Card className="max-w-2xl mx-auto p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Mali Müşavir Aylık KDV & Tevkifat Hesabı
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Hesaplanan Satış KDV'si (Seferler + Faturalar):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatMoney(vatReport.salesVatGross)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-rose-500">
              <span>Müşterilerce Tevkif Edilen KDV (-):</span>
              <span className="font-mono font-bold">
                -{formatMoney(vatReport.salesWithholding)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-emerald-600">
              <span>İndirilecek KDV (Masraflar & Alış Faturaları):</span>
              <span className="font-mono font-bold">
                -{formatMoney(vatReport.deductibleVat)}
              </span>
            </div>

            <div className="pt-3 flex justify-between text-sm font-black">
              <span>Ödenecek / (Devreden) KDV Tutarı:</span>
              <span
                className={`tabular-nums ${
                  vatReport.netPayableVat >= 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {vatReport.netPayableVat >= 0
                  ? `Ödenecek: ${formatMoney(vatReport.netPayableVat)}`
                  : `Sonraki Aya Devir: ${formatMoney(Math.abs(vatReport.netPayableVat))}`}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Fuel Telemetry & Anomaly Analytics */}
      {activeTab === 'fuel' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-white dark:bg-slate-900 border-l-4 border-l-brand-500">
              <span className="text-xs font-semibold text-slate-500 block">Toplam Yakıt Gideri</span>
              <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {formatMoney(totalFuelCost)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                {fuelExpenses.length} adet fiş / fatura
              </span>
            </Card>

            <Card className="p-4 bg-white dark:bg-slate-900 border-l-4 border-l-cyan-500">
              <span className="text-xs font-semibold text-slate-500 block">Toplam Alınan Yakıt</span>
              <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {Math.round(totalFuelLiters).toLocaleString('tr-TR')} <span className="text-xs">Litre</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Ort. Pompa Fiyatı: ~{(totalFuelLiters > 0 ? totalFuelCost / totalFuelLiters : 44.5).toFixed(2)} ₺/L
              </span>
            </Card>

            <Card className="p-4 bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500">
              <span className="text-xs font-semibold text-slate-500 block">Filo Ort. Tüketim</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {fleetAvgConsumption.toFixed(2)} <span className="text-xs">L / 100 KM</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Referans: 28 - 34 L / 100 KM
              </span>
            </Card>

            <Card className="p-4 bg-white dark:bg-slate-900 border-l-4 border-l-purple-500">
              <span className="text-xs font-semibold text-slate-500 block">KM Başı Yakıt Maliyeti</span>
              <span className="text-xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
                {fleetAvgFuelCostPerKm.toFixed(2)} <span className="text-xs">₺ / KM</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Tüm seferler ağırlıklı ortalaması
              </span>
            </Card>
          </div>

          {/* Detailed Fuel Telemetry Log Table */}
          <Card className="overflow-x-auto p-0">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-brand-500" />
                  Yakıt Telemetri Kayıtları & Anomali Alarmları
                </h3>
                <p className="text-xs text-slate-500">
                  Sayaç delta KM'si, birim fiyat, depo doluluk durumu ve 100 KM'de tüketim analizi
                </p>
              </div>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="p-3 font-semibold">Tarih</th>
                  <th className="p-3 font-semibold">Araç Plaka</th>
                  <th className="p-3 font-semibold text-right">Önceki KM</th>
                  <th className="p-3 font-semibold text-right">Güncel KM</th>
                  <th className="p-3 font-semibold text-right">Mesafe (Δ KM)</th>
                  <th className="p-3 font-semibold text-right">Alınan Yakıt</th>
                  <th className="p-3 font-semibold text-right">Birim Fiyat</th>
                  <th className="p-3 font-semibold text-right">Tutar</th>
                  <th className="p-3 font-semibold text-center">100 KM Tüketim</th>
                  <th className="p-3 font-semibold text-right">KM Maliyeti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fuelExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-slate-400">
                      Henüz yakıt kaydı bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  fuelExpenses.map((exp) => {
                    const vehicle = vehicles.find((v) => v.id === exp.vehicleId);
                    const deltaKm = exp.km && exp.prevKm ? exp.km - exp.prevKm : null;
                    const lPer100 =
                      exp.consumptionPer100Km ||
                      (deltaKm && deltaKm > 0 && exp.litres
                        ? (exp.litres / deltaKm) * 100
                        : null);
                    const costKm =
                      exp.costPerKm ||
                      (deltaKm && deltaKm > 0 ? exp.amount / deltaKm : null);

                    const isAnomaly = lPer100 && (lPer100 > 38 || lPer100 < 22);

                    return (
                      <tr
                        key={exp.id}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/50 ${
                          isAnomaly ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {formatDateShort(exp.date)}
                        </td>
                        <td className="p-3 font-bold font-mono text-slate-900 dark:text-white">
                          {vehicle?.plate || '-'}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500">
                          {exp.prevKm ? exp.prevKm.toLocaleString('tr-TR') : '-'}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-800 dark:text-slate-200">
                          {exp.km ? exp.km.toLocaleString('tr-TR') : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-brand-600 dark:text-brand-400">
                          {deltaKm ? `${deltaKm.toLocaleString('tr-TR')} KM` : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          {exp.litres ? `${exp.litres.toFixed(2)} L` : '-'}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500">
                          {exp.unitPrice ? `${exp.unitPrice.toFixed(2)} ₺` : '-'}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                          {formatMoney(exp.amount)}
                        </td>
                        <td className="p-3 text-center">
                          {lPer100 ? (
                            <Badge
                              variant={
                                lPer100 > 38
                                  ? 'danger'
                                  : lPer100 > 34
                                  ? 'warning'
                                  : 'success'
                              }
                              size="sm"
                            >
                              {lPer100.toFixed(1)} L/100km
                              {lPer100 > 38 ? ' (YÜKSEK)' : ''}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                          {costKm ? `${costKm.toFixed(2)} ₺/km` : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
};
