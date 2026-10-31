import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  ArrowLeft,
  Calendar,
  Phone,
  CreditCard,
  Download,
  AlertTriangle,
  CheckCircle,
  Plus,
  Printer,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { computeDriverSettlement } from '@/domain/math/driverSettlement';
import { printDriverSettlementA4 } from '@/domain/documents/printableEngine';
import { DriverAdvanceModal } from '@/components/drivers/DriverAdvanceModal';
import { formatMoney, formatDateShort, isoToday, addDaysIso } from '@/lib/formatters';
import type { Driver, Trip, Expense, Payment, MoneyAccount } from '@/domain/types';

export const DriverDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const repo = useRepository();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [settlement, setSettlement] = useState<any>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [moneyAccounts, setMoneyAccounts] = useState<MoneyAccount[]>([]);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

  const today = isoToday();
  const periodStart = addDaysIso(today, -30);
  const periodEnd = today;

  const loadData = async () => {
    const [allDrivers, allTrips, allExpenses, allPayments, allAccounts] = await Promise.all([
      repo.listDrivers(),
      repo.listTrips(),
      repo.listExpenses(),
      repo.listPayments(),
      repo.listMoneyAccounts(),
    ]);

    setMoneyAccounts(allAccounts);
    const found = allDrivers.find((d) => d.id === id);
    if (found) {
      setDriver(found);
      setTrips(allTrips.filter((t) => t.driverId === found.id));
      setExpenses(allExpenses.filter((e) => e.driverId === found.id));
      setPayments(allPayments.filter((p) => p.driverId === found.id));

      const res = computeDriverSettlement(
        found,
        allTrips,
        allExpenses,
        allPayments,
        periodStart,
        periodEnd
      );
      setSettlement(res);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSaveAdvance = async (paymentData: any) => {
    await repo.createPayment(paymentData);
    setIsAdvanceModalOpen(false);
    loadData();
  };

  if (!driver) {
    return <div className="text-center py-20 text-slate-400">Şoför bulunamadı...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/soforler')}
            className="p-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              {driver.name}
            </h1>
            <p className="text-xs text-slate-500">
              {driver.phone || 'Telefon Yok'} • IBAN: {driver.iban || 'IBAN Belirtilmedi'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvanceModalOpen(true)}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            Avans / Ödeme Ver
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (settlement && driver) {
                printDriverSettlementA4(driver, settlement);
              }
            }}
            className="text-xs bg-brand-600 hover:bg-brand-500"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Hakediş Pusulası (A4 / PDF)
          </Button>
        </div>
      </div>

      {/* Settlement Pusula Card */}
      {settlement && (
        <Card className="space-y-4 p-6 border-2 border-brand-500/20">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Aylık Hakediş & Hesap Pusulası Dökümü
            </h3>
            <span className="text-xs text-slate-500">
              Dönem: {formatDateShort(periodStart)} – {formatDateShort(periodEnd)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Earnings (+) */}
            <div className="space-y-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-2">
                Hak Edilen Alacaklar (+)
              </span>
              <div className="flex justify-between">
                <span>Kıstelyevm Aylık Maaş:</span>
                <span className="font-mono font-bold">{formatMoney(settlement.salaryEarned)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sefer Harcırahı ({settlement.tripCount} Sefer):</span>
                <span className="font-mono font-bold">{formatMoney(settlement.perDiemEarned)}</span>
              </div>
              <div className="flex justify-between">
                <span>KM Primi ({settlement.effectiveKm} KM):</span>
                <span className="font-mono font-bold">{formatMoney(settlement.kmPayEarned)}</span>
              </div>
              <div className="flex justify-between">
                <span>Şoförün Cebinden Yaptığı Masraflar:</span>
                <span className="font-mono font-bold">{formatMoney(settlement.outOfPocketExpenses)}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-2 border-t border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                <span>Toplam Hak Edilen:</span>
                <span>{formatMoney(settlement.totalEarned)}</span>
              </div>
            </div>

            {/* Deductions (-) */}
            <div className="space-y-2 bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-200/50 dark:border-rose-800/40">
              <span className="font-bold text-rose-800 dark:text-rose-300 block mb-2">
                Kesintiler & Ödenen Avanslar (-)
              </span>
              <div className="flex justify-between">
                <span>Verilen Yol / İş Avansları:</span>
                <span className="font-mono font-bold">-{formatMoney(settlement.advances)}</span>
              </div>
              <div className="flex justify-between">
                <span>Maaş Ödemeleri:</span>
                <span className="font-mono font-bold">-{formatMoney(settlement.salaryPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span>Müşteriden Elden Alınan Tahsilatlar:</span>
                <span className="font-mono font-bold">-{formatMoney(settlement.collectionsHeld)}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-2 border-t border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400">
                <span>Toplam Ödenen / Kesilen:</span>
                <span>-{formatMoney(settlement.totalPaid)}</span>
              </div>
            </div>
          </div>

          {/* Net Final Balance */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-xs text-brand-300 font-bold uppercase block">
                Net Ödenecek Şoför Hakedişi
              </span>
              <span className="text-xs text-slate-400">
                Tüm prim, avans ve harcırahlar dahil net tutar
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 tabular-nums">
              {formatMoney(settlement.payable)}
            </div>
          </div>
        </Card>
      )}

      {driver && (
        <DriverAdvanceModal
          isOpen={isAdvanceModalOpen}
          onClose={() => setIsAdvanceModalOpen(false)}
          driver={driver}
          moneyAccounts={moneyAccounts}
          onSave={handleSaveAdvance}
        />
      )}
    </div>
  );
};
