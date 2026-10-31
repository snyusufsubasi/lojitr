import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Car,
  ArrowLeft,
  Truck,
  TrendingDown,
  Disc,
  Wrench,
  Fuel,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { predictMaintenanceSchedule } from '@/domain/math/maintenanceEngine';
import { formatMoney, formatDateShort } from '@/lib/formatters';
import type { Vehicle, Trip, Expense, Driver } from '@/domain/types';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const repo = useRepository();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [allVehicles, allDrivers, allTrips, allExpenses] = await Promise.all([
        repo.listVehicles(),
        repo.listDrivers(),
        repo.listTrips(),
        repo.listExpenses(),
      ]);

      const found = allVehicles.find((v) => v.id === id);
      if (found) {
        setVehicle(found);
        setDriver(allDrivers.find((d) => d.id === found.driverId) || null);
        setTrips(allTrips.filter((t) => t.vehicleId === found.id));
        setExpenses(allExpenses.filter((e) => e.vehicleId === found.id));
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (!vehicle) {
    return <div className="text-center py-20 text-slate-400">Araç bulunamadı...</div>;
  }

  // Predictive Maintenance
  const maintenanceRules = [
    {
      id: 'm-1',
      category: 'motor_yagi_filtre' as const,
      title: 'Motor Yağı ve Yağ Filtresi Değişimi',
      intervalKm: 40000,
      intervalDays: 365,
      lastDoneKm: (vehicle.km || 280000) - 27500,
      lastDoneDate: '2026-06-15',
      warningThresholdKm: 4000,
      warningThresholdDays: 30,
      estimatedCost: 12500,
    },
    {
      id: 'm-2',
      category: 'tuvturk_muayene' as const,
      title: 'TÜVTÜRK Periyodik Araç Muayenesi',
      intervalDays: 365,
      lastDoneDate: '2025-11-20',
      warningThresholdKm: 0,
      warningThresholdDays: 25,
      estimatedCost: 3800,
    },
    {
      id: 'm-3',
      category: 'hava_kurutucu_kartus' as const,
      title: 'Hava Kurutucu Filtre Kartuşu (APU)',
      intervalKm: 60000,
      intervalDays: 730,
      lastDoneKm: (vehicle.km || 280000) - 48000,
      lastDoneDate: '2026-01-10',
      warningThresholdKm: 5000,
      warningThresholdDays: 45,
      estimatedCost: 4500,
    },
  ];

  const maintenanceSchedule = predictMaintenanceSchedule(maintenanceRules, vehicle.km || 280000);

  const totalRevenue = trips.reduce((s, t) => s + t.freight, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netVehicleProfit = totalRevenue - totalExpenses;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/araclar')}
            className="p-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-wider">
                {vehicle.plate}
              </h1>
              <Badge variant={vehicle.ownership === 'oz' ? 'brand' : 'slate'} size="sm">
                {vehicle.ownership === 'oz' ? 'ÖZMAL' : 'KİRALIK'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {vehicle.brand || 'Çekici'} · Sayaç: <strong>{(vehicle.km || 0).toLocaleString('tr-TR')} KM</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/araclar/${vehicle.id}/lastik`)}
          >
            <Disc className="w-4 h-4 mr-1.5 text-brand-500" />
            Lastik Şasisi
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/masraflar/yeni')}
            className="bg-brand-600 hover:bg-brand-500"
          >
            <Fuel className="w-4 h-4 mr-1.5" />
            Mazot / Masraf Gir
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Toplam Navlun Geliri</span>
          <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
            {formatMoney(totalRevenue)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">{trips.length} Sefer tamamlandı</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Toplam Masraflar</span>
          <span className="text-lg font-black text-rose-600 dark:text-rose-400 tabular-nums">
            {formatMoney(totalExpenses)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">{expenses.length} Gider kaydı</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Net Araç Kârı</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatMoney(netVehicleProfit)}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
            Marj: %{totalRevenue > 0 ? ((netVehicleProfit / totalRevenue) * 100).toFixed(1) : 0}
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Hedef Tüketim</span>
          <span className="text-lg font-black text-brand-600 dark:text-brand-400 tabular-nums">
            {vehicle.avgFuelPer100Km || 29.5} LT
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Depo: {vehicle.tankCapacityLitres || 600} LT</span>
        </Card>
      </div>

      {/* Predictive Maintenance & Upcoming Services */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-brand-500" />
          Kestirimci Bakım & Muayene Takvimi (Çift Tetikleyici)
        </h3>

        <div className="space-y-3">
          {maintenanceSchedule.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                  <Badge variant={item.status === 'gecikti' ? 'danger' : item.status === 'yaklasti' ? 'warning' : 'success'}>
                    {item.status === 'gecikti' ? 'GECİKTİ' : item.status === 'yaklasti' ? 'YAKLAŞTI' : 'GÜNCEL'}
                  </Badge>
                </div>
                <p className="text-slate-500">{item.advice}</p>
              </div>

              <div className="text-right sm:text-right">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Tahmini Randevu: {formatDateShort(item.targetServiceDate)}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Tahmini Maliyet: {formatMoney(item.estimatedCost)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
