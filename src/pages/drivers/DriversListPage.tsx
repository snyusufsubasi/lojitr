import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Plus,
  Phone,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { DriverFormModal } from '@/components/drivers/DriverFormModal';
import { formatMoney, formatDateShort } from '@/lib/formatters';
import type { Driver } from '@/domain/types';

export const DriversListPage: React.FC = () => {
  const repo = useRepository();
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await repo.listDrivers();
    setDrivers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDriver = async (driverData: Omit<Driver, 'id'>) => {
    await repo.createDriver(driverData);
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand-500" />
            Şoförler & Hakediş Yönetimi
          </h1>
          <p className="text-xs text-slate-500">
            Aylık kıstelyevm maaşlar, sefer harcırahları, KM primleri ve avans pusula hesaplamaları
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500"
        >
          <Plus className="w-4 h-4" />
          Yeni Şoför Ekle
        </Button>
      </div>

      {/* Drivers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((drv) => (
          <Card
            key={drv.id}
            onClick={() => navigate(`/soforler/${drv.id}`)}
            className="cursor-pointer hover:border-brand-500/50 hover:shadow-md transition-all p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                  {drv.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  {drv.phone || 'Telefon Belirtilmedi'}
                </span>
              </div>
              <Badge variant="success" size="sm">
                AKTİF
              </Badge>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Sabit Maaş:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatMoney(drv.salary)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Sefer Harcırahı:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                  {formatMoney(drv.perDiem)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>KM Başı Prim:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                  {drv.kmRate ? `${drv.kmRate} ₺/km` : 'Prim Yok'}
                </span>
              </div>
            </div>

            {/* Document Warning Badges */}
            {drv.srcExpiry && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>SRC Bitiş:</span>
                <span className="font-bold text-amber-500">
                  {formatDateShort(drv.srcExpiry)}
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>

      <DriverFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateDriver}
      />
    </div>
  );
};
