import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useRepository } from '@/domain/useRepository';
import { calculateTripFinancials } from '@/domain/math/tripMath';
import { formatMoney, formatDateShort } from '@/lib/formatters';
import { trIncludes } from '@/lib/trSearch';
import { DeliveryModal } from '@/components/trips/DeliveryModal';
import type { Trip, Vehicle } from '@/domain/types';

export const TripsListPage: React.FC = () => {
  const repo = useRepository();
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'yolda' | 'tamamlandi' | 'bekliyor'>('all');
  const [loading, setLoading] = useState(true);

  // Delivery Modal state
  const [deliveringTrip, setDeliveringTrip] = useState<Trip | null>(null);

  const loadData = async () => {
    try {
      const [t, v] = await Promise.all([repo.listTrips(), repo.listVehicles()]);
      setTrips(t);\n      setVehicles(v);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getVehiclePlate = (id: string) => {
    return vehicles.find((v) => v.id === id)?.plate || 'Plaka Yok';
  };

  const filteredTrips = trips.filter((t) => {
    const fin = calculateTripFinancials(t);
    const matchesSearch =
      trIncludes(t.origin, search) ||
      trIncludes(t.destination, search) ||
      trIncludes(t.cargo, search) ||
      trIncludes(t.waybillNo, search) ||
      trIncludes(getVehiclePlate(t.vehicleId), search);

    if (!matchesSearch) return false;

    if (statusFilter === 'yolda') return t.status === 'yolda';
    if (statusFilter === 'tamamlandi') return t.status === 'tamamlandi';
    if (statusFilter === 'bekliyor') return fin.collectionStatus !== 'tamam' && t.status !== 'iptal';
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-500" />
            Sefer & Navlun Yönetimi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tüm yurt içi ve uluslararası taşımalar, KDV ve 2/10 tevkifat hesapları
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/seferler/yeni')}
          className="bg-brand-600 hover:bg-brand-500 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yeni Sefer Kaydı
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tüm Seferler' },
            { id: 'yolda', label: 'Yolda Olanlar' },
            { id: 'tamamlandi', label: 'Teslim Edilenler' },
            { id: 'bekliyor', label: 'Tahsilat Bekleyen' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Güzergah, plaka, yük veya irsaliye ara..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-3">
        {filteredTrips.length === 0 ? (
          <Card className="text-center py-12 space-y-3">
            <Truck className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Sefer kaydı bulunamadı
              </p>
              <p className="text-xs text-slate-400">
                Arama filtrenizi temizleyin veya yeni bir sefer oluşturun.
              </p>
            </div>
          </Card>
        ) : (
          filteredTrips.map((t) => {
            const fin = calculateTripFinancials(t);
            const plate = getVehiclePlate(t.vehicleId);

            return (
              <Card
                key={t.id}
                className="hover:border-brand-500/50 hover:shadow-md transition-all p-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Route & Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {plate}
                      </span>
                      <div className="flex items-center gap-1.5 font-black text-sm text-slate-900 dark:text-white">
                        <span>{t.origin}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-brand-500" />
                        <span>{t.destination}</span>
                      </div>
                      <Badge
                        variant={
                          t.status === 'tamamlandi'
                            ? 'success'
                            : t.status === 'yolda'
                            ? 'brand'
                            : 'slate'
                        }
                        size="sm"
                      >
                        {t.status === 'tamamlandi' ? 'Teslim Edildi' : 'Yolda'}
                      </Badge>
                      {t.uetdsReported && (
                        <Badge variant="brand" size="sm">
                          U-ETDS Bildirildi
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span>Tarih: <strong>{formatDateShort(t.date)}</strong></span>
                      {t.cargo && <span>Yük: <strong>{t.cargo}</strong></span>}\n                      {t.km && <span>Mesafe: <strong>{t.km} km</strong></span>}
                      {t.waybillNo && <span>İrsaliye: <strong>{t.waybillNo}</strong></span>}
                    </div>
                  </div>

                  {/* Right Column: Financials & Action Buttons */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left lg:text-right">
                      <div className="text-base font-black text-slate-900 dark:text-white tabular-nums">
                        {formatMoney(fin.netReceivable)}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Kâr: {formatMoney(fin.netProfit)}
                        </span>
                        {fin.remaining > 0.01 && (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            (Kalan: {formatMoney(fin.remaining)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {t.status !== 'tamamlandi' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeliveringTrip(t)}
                          className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                          <FileCheck2 className="w-4 h-4 mr-1" />
                          Teslim Kapat
                        </Button>
                      )}

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/seferler/${t.id}`)}
                      >
                        Detay
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Digital POD Signature Modal */}
      {deliveringTrip && (
        <DeliveryModal
          isOpen={Boolean(deliveringTrip)}
          onClose={() => setDeliveringTrip(null)}
          tripOrigin={deliveringTrip.origin}
          tripDestination={deliveringTrip.destination}
          onConfirm={async (payload) => {
            await repo.markTripDelivered(deliveringTrip.id, payload);
            await loadData();
          }}
        />
      )}
    </div>
  );
};
