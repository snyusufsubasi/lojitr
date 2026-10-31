import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building,
  Share2,
  FileSpreadsheet,
  ArrowRightLeft,
  Download,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { computeContactBalances } from '@/domain/math/contactLedger';
import { formatMoney, formatDateShort, isoToday } from '@/lib/formatters';
import type { Contact, Trip, Payment, Expense, BankCheck } from '@/domain/types';

export const ContactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const repo = useRepository();

  const [contact, setContact] = useState<Contact | null>(null);
  const [balanceSummary, setBalanceSummary] = useState<any>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    async function load() {
      const [allContacts, allTrips, allExpenses, allPayments, allChecks] = await Promise.all([
        repo.listContacts(),
        repo.listTrips(),
        repo.listExpenses(),
        repo.listPayments(),
        repo.listChecks(),
      ]);

      const found = allContacts.find((c) => c.id === id);
      if (found) {
        setContact(found);
        const balances = computeContactBalances(
          [found],
          allTrips,
          allExpenses,
          allPayments,
          allChecks,
          [],
          isoToday()
        );
        setBalanceSummary(balances[0]);
        setTrips(allTrips.filter((t) => t.contactId === found.id));
        setPayments(allPayments.filter((p) => p.contactId === found.id));
      }
    }
    load();
  }, [id]);

  if (!contact) {
    return <div className="text-center py-20 text-slate-400">Cari kart bulunamadı...</div>;
  }

  const shareViaWhatsApp = () => {
    const text = `Sayın ${contact.name},\nLojiTR güncel cari hesap bakiyeniz: ${formatMoney(
      balanceSummary?.receivable || 0
    )} Alacak olarak görünmektedir. Mutabakat ve ekstre detayları için iletişime geçebilirsiniz.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/musteriler')}
            className="p-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                {contact.name}
              </h1>
              <Badge variant="brand" size="sm">
                {contact.kind.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {contact.contactPerson || 'Yetkili'} • {contact.city || 'Şehir Yok'} • Vergi No: {contact.taxNo || '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={shareViaWhatsApp}
            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
          >
            <Share2 className="w-4 h-4 mr-1 text-emerald-500" />
            WhatsApp ile Ekstre Gönder
          </Button>
        </div>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Müşteriden Alacağımız</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatMoney(balanceSummary?.receivable)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Açık Sefer Bakiyeleri</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Tedarikçiye Vereceğimiz</span>
          <span className="text-xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
            {formatMoney(balanceSummary?.payable)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Veresiye ve Komisyon Borcu</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 block mb-1">Net Cari Bakiye</span>
          <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
            {formatMoney(balanceSummary?.net)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Mahsup Edilmiş Durum</span>
        </Card>
      </div>

      {/* Aging Buckets Card */}
      {balanceSummary?.aging && (
        <Card className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Alacak Yaşlandırma Analizi (Vade Kovaları)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Vadesi Gelmemiş</span>
              <span className="font-bold text-emerald-600 tabular-nums">
                {formatMoney(balanceSummary.aging.vadesiGelmemis)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">1–30 Gün</span>
              <span className="font-bold tabular-nums">
                {formatMoney(balanceSummary.aging.otuzGun)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">31–60 Gün</span>
              <span className="font-bold text-amber-500 tabular-nums">
                {formatMoney(balanceSummary.aging.altmisGun)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">61–90 Gün</span>
              <span className="font-bold text-amber-600 tabular-nums">
                {formatMoney(balanceSummary.aging.doksanGun)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">91–120 Gün</span>
              <span className="font-bold text-rose-500 tabular-nums">
                {formatMoney(balanceSummary.aging.yuzYirmiGun)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">120+ Gün</span>
              <span className="font-bold text-rose-700 tabular-nums">
                {formatMoney(balanceSummary.aging.yuzYirmiUstu)}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Trips for this contact */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Bu Müşteriye Yapılan Seferler ({trips.length})
        </h3>
        {trips.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">Kayıtlı sefer yok.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {trips.map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {t.origin} → {t.destination} ({t.cargo || 'Yük'})
                  </span>
                  <span className="text-slate-400">
                    {formatDateShort(t.date)} • Durum: <strong>{t.status.toUpperCase()}</strong>
                  </span>
                </div>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400 tabular-nums">
                  {formatMoney(t.freight)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
