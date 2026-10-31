import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Truck,
  TrendingDown,
  Wallet,
  Clock,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
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

  let totalRevenue = 0;
  for (const t of trips) {
    const fin = calculateTripFinancials(t);
    totalRevenue += fin.netReceivable;
  }

  const generalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - generalExpenses;
  const marginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const agendaItems = buildFinancialAgenda(trips, checks, [], reminders, [], isoToday()).slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 border border-brand-800/40 rounded-3xl p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
              Operasyonel Gösterge Paneli
            </span>
            <Badge variant="brand" size="sm">Canlı</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Hoş Geldiniz, {user?.name || 'Mustafa Bey'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Filo performansınız ve 60 günlük nakit akışı göstergeleriniz güncellendi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/seferler/yeni')}
            className="bg-brand-500 hover:bg-brand-400 text-white"
          >
            <Truck className="w-4 h-4" />
            Hızlı Sefer Gir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/masraflar/yeni')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <TrendingDown className="w-4 h-4" />
            Fiş Tara
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Kasa / Banka Varlığı</span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {formatMoney(330000)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span>Merkez Kasa + Banka Mevduat</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
