import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Plus,
  Search,
  Fuel,
  Wrench,
  Disc,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { VehicleFormModal } from '@/components/vehicles/VehicleFormModal';
import { trIncludes } from '@/lib/trSearch';
import type { Vehicle, Driver } from '@/domain/types';

export const VehiclesListPage: React.FC = () => {
  const repo = useRepository();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [v, d] = await Promise.all([repo.listVehicles(), repo.listDrivers()]);
    setVehicles(v);
    setDrivers(d);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getDriverName = (driverId?: string) => {
    if (!driverId) return 'Şoför Atanmadı';
    return drivers.find((d) => d.id === driverId)?.name || 'Şoför Atanmadı';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-brand-500" />
            Filo & Araç Yönetimi
          </h1>
          <p className="text-xs text-slate-500">
            Özmal, kiralık ve taşeron araçlar, kilometre sayaçları ve görsel lastik şasi haritaları
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500"
        >
          <Plus className="w-4 h-4" />
          Yeni Araç Ekle
        </Button>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <Card key={v.id} className="p-4 space-y-3 hover:border-brand-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-black text-base text-slate-900 dark:text-white block tracking-wider">
                    {v.plate}
                  </span>
                  <span className="text-xs text-slate-500">
                    {v.brand || 'Marka Belirtilmedi'} ({v.year || '-'})
                  </span>
                </div>
                <Badge variant={v.ownership === 'oz' ? 'brand' : 'slate'} size="sm">
                  {v.ownership === 'oz' ? 'ÖZMAL' : v.ownership === 'kiralik' ? 'KİRALIK' : 'DIŞ ARAÇ'}
                </Badge>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Tür:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                    {v.type}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Atanan Şoför:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {getDriverName(v.driverId)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Güncel Sayaç KM:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {v.km ? `${v.km.toLocaleString('tr-TR')} KM` : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Details and Tire Chassis Map buttons */}
            <div className="pt-2 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/araclar/${v.id}`)}
                className="text-xs flex items-center justify-center gap-1 hover:border-brand-500/50"
              >
                <Wrench className="w-3.5 h-3.5 text-slate-500" />
                Detay & Bakım
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/araclar/${v.id}/lastik`)}
                className="text-xs flex items-center justify-center gap-1 hover:border-brand-500/50"
              >
                <Disc className="w-3.5 h-3.5 text-brand-500" />
                Lastik Şasisi
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* New Vehicle Modal */}
      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={loadData}
      />
    </div>
  );
};
