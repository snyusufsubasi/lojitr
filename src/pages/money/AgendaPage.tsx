import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ArrowLeft,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { buildFinancialAgenda, build12WeekCashForecast } from '@/domain/math/agendaAndForecast';
import { formatMoney, formatDateShort, isoToday } from '@/lib/formatters';
import type { Trip, BankCheck, LoanInstallment, Reminder, Invoice, MoneyAccount } from '@/domain/types';

export const AgendaPage: React.FC = () => {
  const repo = useRepository();
  const navigate = useNavigate();

  const [agenda, setAgenda] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [trips, checks, installments, reminders, invoices, accounts] = await Promise.all([
        repo.listTrips(),
        repo.listChecks(),
        repo.listInstallments(),
        repo.listReminders(),
        repo.listInvoices(),
        repo.listMoneyAccounts(),
      ]);

      const today = isoToday();
      const ag = buildFinancialAgenda(trips, checks, installments, reminders, invoices, today);
      const fc = build12WeekCashForecast(accounts, ag, today);

      setAgenda(ag);
      setForecast(fc);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
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
            <Calendar className="w-5 h-5 text-brand-500" />
            Finans Ajandası & 12 Haftalık Nakit Akışı
          </h1>
          <p className="text-xs text-slate-500">
            Önümüzdeki 60 günün tüm tahsilat, çek, kredi ve ödeme projeksiyonu
          </p>
        </div>
      </div>

      {/* 12-Week Forecast Table */}
      {forecast && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              12 Haftalık Kümülatif Kasa / Banka Projeksiyonu
            </h3>
            <span className="text-xs text-slate-500">
              Başlangıç Kasası: <strong>{formatMoney(forecast.startingCash)}</strong>
            </span>
          </div>

          {forecast.firstNegativeWeek && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                Dikkat: {forecast.firstNegativeWeek}. haftada kasanız eksi bakiyeye düşmektedir!
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {forecast.weeks.slice(0, 6).map((w: any) => (
              <div
                key={w.weekNo}
                className={`p-3 rounded-xl border text-center space-y-1 ${
                  w.isNegative
                    ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {w.weekNo}. Hafta
                </span>
                <span className="text-xs font-black tabular-nums block">
                  {formatMoney(w.cumulativeBalance)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Net: {w.net >= 0 ? '+' : ''}{formatMoney(w.net)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 60-Day Agenda Timeline */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          60 Günlük Vade Zaman Çizelgesi
        </h3>

        {agenda.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Ajandada bekleyen kayıt bulunamadı.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {agenda.map((item: any) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      item.direction === 'in'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50'
                    }`}
                  >
                    {item.direction === 'in' ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Vade Tarihi: {formatDateShort(item.date)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-black tabular-nums block ${
                      item.direction === 'in'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {item.direction === 'in' ? '+' : '-'} {formatMoney(item.amount)}
                  </span>
                  <Badge variant={item.tag === 'overdue' ? 'danger' : 'slate'} size="sm">
                    {item.tag === 'overdue' ? 'Gecikmiş' : 'Vadesi Var'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
