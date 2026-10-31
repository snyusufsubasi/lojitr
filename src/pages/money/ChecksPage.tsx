import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  ArrowLeft,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Share2,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { computeCheckAnalytics } from '@/domain/math/checkAnalytics';
import { formatMoney, formatDateShort, isoToday } from '@/lib/formatters';
import type { BankCheck } from '@/domain/types';

export const ChecksPage: React.FC = () => {
  const repo = useRepository();
  const navigate = useNavigate();

  const [checks, setChecks] = useState<BankCheck[]>([]);
  const [tab, setTab] = useState<'alinan' | 'verilen'>('alinan');

  const loadData = async () => {
    const data = await repo.listChecks();
    setChecks(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const analytics = computeCheckAnalytics(checks, isoToday());
  const filtered = checks.filter((c) => c.direction === tab);

  const handleAction = async (id: string, nextStatus: BankCheck['status']) => {
    await repo.updateCheckStatus(id, nextStatus);
    await loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/para')}
            className="p-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-brand-500" />
              Çek & Senet Portföyü
            </h1>
            <p className="text-xs text-slate-500">
              Alınan müşteri çekleri, ciro işlemleri, bankaya takasa verme ve verilen çekler
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Portföydeki Alınan Çekler</span>
          <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
            {formatMoney(analytics.activeIn)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Ortalama Vade: {analytics.avgDaysIn} Gün
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Verilen Vadeli Çekler</span>
          <span className="text-lg font-black text-rose-600 dark:text-rose-400 tabular-nums">
            {formatMoney(analytics.activeOut)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Ortalama Vade: {analytics.avgDaysOut} Gün
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Bu Hafta Dolacaklar</span>
          <span className="text-lg font-black text-amber-500 tabular-nums">
            {formatMoney(analytics.buckets.yediGun)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Öncelikli Tahsilat</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Karşılıksız Oranı</span>
          <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
            %{analytics.bounceRate}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Protesto Riski</span>
        </Card>
      </div>

      {/* Direction Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setTab('alinan')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            tab === 'alinan'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 text-emerald-500" />
          Alınan Çek / Senetler
        </button>
        <button
          onClick={() => setTab('verilen')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            tab === 'verilen'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-rose-500" />
          Verilen Çek / Senetler
        </button>
      </div>

      {/* Checks List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="text-center py-12 text-slate-400 text-xs">
            Kayıtlı çek bulunmuyor.
          </Card>
        ) : (
          filtered.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {c.bankName || 'Banka'} · {c.serialNo || 'Çek'}
                    </span>
                    <Badge
                      variant={
                        c.status === 'tahsil' || c.status === 'odendi'
                          ? 'success'
                          : c.status === 'karsiliksiz'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {c.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Keşideci: {c.drawer || 'Firma'} • Düzenleme: {formatDateShort(c.issueDate)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-slate-900 dark:text-white tabular-nums block">
                      {formatMoney(c.amount)}
                    </span>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      Vade: {formatDateShort(c.dueDate)}
                    </span>
                  </div>

                  {/* Actions */}
                  {c.status === 'portfoy' && (\n                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(c.id, 'tahsil')}
                        className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                      >
                        Tahsil Et
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAction(c.id, 'ciro')}
                      >
                        Ciro Et
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
