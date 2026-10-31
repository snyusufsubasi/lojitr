import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  ArrowRight,
  TrendingDown,
  FileCheck2,
  Calendar,
  User,
  Car,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { calculateTripFinancials } from '@/domain/math/tripMath';
import { formatMoney, formatDateShort } from '@/lib/formatters';
import type { Trip, Expense, Vehicle, Driver, Contact } from '@/domain/types';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const repo = useRepository();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    async function load() {
      const [allTrips, allVehicles, allDrivers, allContacts, allExpenses] = await Promise.all([
        repo.listTrips(),
        repo.listVehicles(),
        repo.listDrivers(),
        repo.listContacts(),
        repo.listExpenses(),
      ]);

      const found = allTrips.find((t) => t.id === id);
      if (found) {
        setTrip(found);
        setVehicle(allVehicles.find((v) => v.id === found.vehicleId) || null);
        setDriver(allDrivers.find((d) => d.id === found.driverId) || null);
        setContact(allContacts.find((c) => c.id === found.contactId) || null);
        setExpenses(allExpenses.filter((e) => e.tripId === found.id));
      }
    }
    load();
  }, [id]);

  if (!trip) {
    return (
      <div className="text-center py-20 text-slate-400">
        Sefer bulunamadı veya yükleniyor...
      </div>
    );
  }

  const fin = calculateTripFinancials(trip);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/seferler')}
            className="p-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{trip.origin}</span>
                <ArrowRight className="w-4 h-4 text-brand-500" />
                <span>{trip.destination}</span>
              </h1>
              <Badge variant={trip.status === 'tamamlandi' ? 'success' : 'brand'} size="sm">
                {trip.status === 'tamamlandi' ? 'Teslim Edildi' : 'Yolda'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Sefer Tarihi: {formatDateShort(trip.date)} • {trip.cargo || 'Standart Yük'}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/masraflar/yeni')}
        >
          <TrendingDown className="w-4 h-4 mr-1 text-rose-500" />
          Masraf Ekle
        </Button>
      </div>

      {/* 4 Financial KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Müşteriden Net Alacak</span>
          <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
            {formatMoney(fin.netReceivable)}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Sefer Masrafları</span>
          <span className="text-lg font-black text-rose-600 dark:text-rose-400 tabular-nums">
            {formatMoney(fin.expensesTotal)}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Net Sefer Kârı</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatMoney(fin.netProfit)}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Kalan Tahsilat</span>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400 tabular-nums">
            {formatMoney(fin.remaining)}
          </span>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fleet & Personnel info */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Araç & Şoför Bilgileri
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Çekici Plaka:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {vehicle?.plate || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Şoför:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {driver?.name || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Müşteri / Cari:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                {contact?.name || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mesafe:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {trip.km ? `${trip.km} KM` : '-'}
              </span>
            </div>
          </div>
        </Card>

        {/* VAT & Tax breakdown */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            KDV & Tevkifat Dökümü
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Navlun (Net):</span>
              <span className="font-mono font-semibold">{formatMoney(fin.freightNet)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>KDV Tutarı (%{trip.vatRate}):</span>
              <span className="font-mono">+{formatMoney(fin.vatAmount)}</span>
            </div>
            {fin.withholdingAmount > 0 && (
              <div className="flex justify-between text-rose-500 font-semibold">
                <span>Tevkifat ({trip.vatWithholding}):</span>
                <span className="font-mono">-{formatMoney(fin.withholdingAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Ödenecek Navlun:</span>
              <span className="tabular-nums text-brand-600 dark:text-brand-400">
                {formatMoney(fin.grossWithVat)}
              </span>
            </div>
          </div>
        </Card>

        {/* Proof of Delivery (POD) & e-Signature */}
        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
            Teslimat & e-İmza (POD)
          </h3>
          {trip.status === 'tamamlandi' ? (
            <div className="space-y-2 text-xs">
              <p className="text-slate-500">
                Teslim Alan: <strong className="text-slate-800 dark:text-slate-200">{trip.receiverName || 'Yetkili'}</strong>
              </p>
              {trip.deliveryCoord && (
                <p className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-mono text-[11px]">{trip.deliveryCoord}</span>
                </p>
              )}
              {trip.signatureSvg && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-950/60">
                  <img src={trip.signatureSvg} alt="İmza" className="h-16 mx-auto object-contain" />
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              Sefer henüz teslim edilmedi.
            </p>
          )}
        </Card>
      </div>

      {/* Connected Expenses List */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Bu Sefere Bağlı Masraflar</span>
          <span className="text-xs text-rose-500 font-bold tabular-nums">
            Toplam: {formatMoney(fin.expensesTotal)}
          </span>
        </h3>

        {expenses.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Bu sefere henüz bir masraf kaydedilmemiş.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {expenses.map((e) => (
              <div key={e.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {e.category.toUpperCase()} {e.litres ? `(${e.litres} LT)` : ''}
                  </span>
                  <span className="text-slate-400">{e.note || formatDateShort(e.date)}</span>
                </div>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  -{formatMoney(e.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
