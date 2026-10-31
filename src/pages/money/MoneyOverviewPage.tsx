import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Building2,
  CreditCard,
  Fuel,
  ArrowRightLeft,
  Calculator,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileCheck2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { formatMoney, formatDateShort } from '@/lib/formatters';
import type { MoneyAccount, Payment } from '@/domain/types';

export const MoneyOverviewPage: React.FC = () => {
  const repo = useRepository();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<MoneyAccount[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [accs, pays] = await Promise.all([repo.listMoneyAccounts(), repo.listPayments()]);
      setAccounts(accs);
      setPayments(pays);
      setLoading(false);
    }
    load();
  }, []);

  const totalBalance = accounts
    .filter((a) => a.kind === 'kasa' || a.kind === 'banka')
    .reduce((s, a) => s + (a.openingBalance || 0), 0);

  const getAccountIcon = (kind: MoneyAccount['kind']) => {
    switch (kind) {
      case 'kasa':
        return <Building2 className="w-5 h-5 text-emerald-500" />;
      case 'banka':
        return <CreditCard className="w-5 h-5 text-brand-500" />;
      case 'yakit_karti':
        return <Fuel className="w-5 h-5 text-cyan-500" />;
      default:
        return <Wallet className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand-500" />
            Finans & Kasa / Banka Hesapları
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Nakit kasa, banka mevduat hesapları, şirket kredi kartları ve taşıt tanıma limitleri
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/para/sayim')}
          >
            <Calculator className="w-4 h-4 mr-1 text-emerald-500" />
            Kasa Sayımı
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/para/cek-senet')}
          >
            <FileCheck2 className="w-4 h-4 mr-1 text-brand-500" />
            Çek / Senet
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/para/ajanda')}
            className="bg-brand-600 hover:bg-brand-500"
          >
            Nakit Akışı (12 Hafta)
          </Button>
        </div>
      </div>

      {/* Total Balance Banner */}
      <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white p-6 border-none shadow-xl">
        <span className="text-xs text-brand-300 font-bold uppercase tracking-wider block mb-1">
          Toplam Nakit & Banka Varlığı
        </span>
        <div className="text-3xl font-black tabular-nums">{formatMoney(totalBalance)}</div>
        <p className="text-xs text-slate-400 mt-2">
          Merkez kasa ve aktif banka mevduat bakiyeleri toplamı.
        </p>
      </Card>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((acc) => (\n          <Card key={acc.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  {getAccountIcon(acc.kind)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {acc.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 uppercase">
                    {acc.kind}
                  </span>
                </div>
              </div>
              <Badge variant={acc.openingBalance >= 0 ? 'success' : 'danger'} size="sm">
                Aktif
              </Badge>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">Güncel Bakiye:</span>
              <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                {formatMoney(acc.openingBalance)}
              </span>
            </div>

            {acc.iban && (
              <p className="text-[10px] font-mono text-slate-400 truncate">
                {acc.iban}
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Recent Cash Flow Movements */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Son Kasa & Banka Hareketleri
          </h3>
        </div>

        {payments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Henüz ödeme veya tahsilat hareketi yok.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg ${
                      p.kind === 'tahsilat'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    }`}
                  >
                    {p.kind === 'tahsilat' ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {p.note || `${p.kind.toUpperCase()} İşlemi`}
                    </span>
                    <span className="text-slate-400">
                      Yöntem: {p.method.toUpperCase()} • {formatDateShort(p.date)}
                    </span>
                  </div>
                </div>

                <span
                  className={`font-mono font-bold tabular-nums ${
                    p.kind === 'tahsilat'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {p.kind === 'tahsilat' ? '+' : '-'} {formatMoney(p.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
