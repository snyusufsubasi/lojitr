import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Truck,
  TrendingDown,
  Wallet,
  Clock,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatMoney, formatDateShort, isoToday } from '@/lib/formatters';
import { useRepository } from '@/domain/useRepository';
import { useAuthStore } from '@/domain/store/authStore';
import { calculateTripFinancials } from '@/domain/math/tripMath';
import { buildFinancialAgenda } from '@/domain/math/agendaAndForecast';
import { useNavigate } from 'react-router-dom';
import type { Trip, Expense, BankCheck, Reminder } from '@/domain/types';

export const DashboardPage: React.FC = () => {
  const repo = useRepository();
  const { role, user } = useAuthStore();
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [checks, setChecks] = useState<BankCheck[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [t, e, c, r] = await Promise.all([
          repo.listTrips(),
          repo.listExpenses(),
          repo.listChecks(),
          repo.listReminders(),
        ]);
        setTrips(t);
        setExpenses(e);
        setChecks(c);
        setReminders(r);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute metrics
  let totalRevenue = 0;
  let totalTripExpenses = 0;
  let totalPendingReceivable = 0;

  for (const t of trips) {
    const fin = calculateTripFinancials(t);
    totalRevenue += fin.netReceivable;
    totalTripExpenses += fin.expensesTotal + fin.brokerPayable + fin.carrierPayable;
    totalPendingReceivable += fin.remaining;
  }

  const generalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - generalExpenses;
  const marginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const agendaItems = buildFinancialAgenda(trips, checks, [], reminders, [], isoToday()).slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 text-slate-900 dark:text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200/50 dark:border-brand-800/50">
              Operasyonel Gösterge Paneli
            </span>
            <Badge variant="brand" size="sm">Canlı</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Hoş Geldiniz, {user?.name || 'Mustafa Bey'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Filo performansınız ve 60 günlük nakit akışı göstergeleriniz güncellendi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/seferler/yeni')}
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20"
          >
            <Truck className="w-4 h-4" />
            Hızlı Sefer Gir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/masraflar/yeni')}
            className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <TrendingDown className="w-4 h-4" />
            Fiş Tara
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Profit */}
        <Card className="hover:border-brand-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Net Operasyonel Kâr</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {formatMoney(netProfit)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Kâr Marjı: %{marginPct.toFixed(1)}</span>
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="hover:border-brand-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Navlun Cirosu</span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {formatMoney(totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span>{trips.length} Sefer tamamlandı</span>
          </div>
        </Card>

        {/* Pending Collections */}
        <Card className="hover:border-brand-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Bekleyen Tahsilat</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {formatMoney(totalPendingReceivable)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 font-semibold">
            <span>Açık müşteri bakiyeleri</span>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="hover:border-brand-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Toplam Masraflar</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {formatMoney(generalExpenses)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span>Yakıt, otoyol, bakım masrafları</span>
          </div>
        </Card>
      </div>

      {/* Grid: Active Trips & Upcoming Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active & Recent Trips (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-500" />
              Son Sefer Hareketleri
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/seferler')}
              className="text-xs text-brand-600 dark:text-brand-400"
            >
              Tümünü Gör
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {trips.slice(0, 4).map((t) => {
              const fin = calculateTripFinancials(t);
              return (
                <Card
                  key={t.id}
                  onClick={() => navigate(`/seferler/${t.id}`)}
                  className="cursor-pointer hover:border-brand-500/50 hover:shadow-md transition-all p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {t.origin} → {t.destination}
                        </span>
                        <Badge
                          variant={
                            t.status === 'tamamlandi'
                              ? 'success'
                              : t.status === 'yolda'
                              ? 'brand'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {t.status === 'tamamlandi'
                            ? 'Teslim Edildi'
                            : t.status === 'yolda'
                            ? 'Yolda'
                            : 'Yükleniyor'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        {t.cargo} · {formatDateShort(t.pickupDate)} · İrsaliye: #{t.waybillNo || '---'}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <span className="text-base font-black text-slate-900 dark:text-white tabular-nums">
                        {formatMoney(fin.netReceivable)}
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          fin.collectionStatus === 'tamam'
                            ? 'text-emerald-500'
                            : fin.collectionStatus === 'kismi'
                            ? 'text-amber-500'
                            : 'text-rose-500'
                        }`}
                      >
                        {fin.collectionStatus === 'tamam'
                          ? 'Tahsil Edildi'
                          : fin.collectionStatus === 'kismi'
                          ? `Kısmi: ${formatMoney(fin.paid)}`
                          : `Kalan: ${formatMoney(fin.remaining)}`}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Financial Agenda (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-500" />
              Finansal Ajanda
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/para/ajanda')}
              className="text-xs text-brand-600 dark:text-brand-400"
            >
              Ajandayı Aç
            </Button>
          </div>

          <Card className="p-4 space-y-3">
            {agendaItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Yaklaşan ödeme veya tahsilat yok.</p>
            ) : (
              agendaItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[170px]">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Vade: {formatDateShort(item.date)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-black tabular-nums block ${
                        item.type === 'tahsilat' ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {item.type === 'tahsilat' ? '+' : '-'} {formatMoney(item.amount)}
                    </span>
                    <Badge
                      variant={item.type === 'tahsilat' ? 'success' : 'danger'}
                      size="sm"
                    >
                      {item.type === 'tahsilat' ? 'Tahsilat' : 'Ödeme'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};