import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatMoney } from '@/lib/formatters';

const DENOMINATIONS = [
  { value: 200, label: '200 ₺ Banknot' },
  { value: 100, label: '100 ₺ Banknot' },
  { value: 50, label: '50 ₺ Banknot' },
  { value: 20, label: '20 ₺ Banknot' },
  { value: 10, label: '10 ₺ Banknot' },
  { value: 5, label: '5 ₺ Banknot' },
  { value: 1, label: '1 ₺ Madeni Para' },
];

export const CashCountPage: React.FC = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<number, number>>({
    200: 150,
    100: 100,
    50: 80,
    20: 30,
    10: 20,
    5: 20,
    1: 100,
  });

  const systemKasaBalance = 45000;

  const totalCounted = DENOMINATIONS.reduce(
    (sum, d) => sum + d.value * (counts[d.value] || 0),
    0
  );
  const diff = totalCounted - systemKasaBalance;

  const handleCountChange = (val: number, count: number) => {
    setCounts((prev) => ({
      ...prev,
      [val]: Math.max(0, count || 0),
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
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
            <Calculator className="w-5 h-5 text-emerald-500" />
            Fiziki Kasa Sayımı & Mutabakat
          </h1>
          <p className="text-xs text-slate-500">
            Kasadaki banknot ve madeni paraları sayarak sistem bakiyesiyle karşılaştırın
          </p>
        </div>
      </div>

      {/* Difference Indicator Card */}
      <Card className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-500 block">Fiziki Sayılan Tutar:</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {formatMoney(totalCounted)}
          </span>
        </div>

        <div className="text-center sm:text-right">
          <span className="text-xs text-slate-500 block">Sistem Kasa Bakiyesi:</span>
          <span className="text-lg font-bold text-slate-700 dark:text-slate-300 tabular-nums">
            {formatMoney(systemKasaBalance)}
          </span>
        </div>

        <div className="sm:border-l border-slate-200 dark:border-slate-800 sm:pl-4 text-center sm:text-right">
          <span className="text-xs text-slate-500 block">Kasa Farkı:</span>
          <span
            className={`text-xl font-black tabular-nums ${
              Math.abs(diff) < 0.01
                ? 'text-emerald-500'
                : diff > 0
                ? 'text-brand-500'
                : 'text-rose-500'
            }`}
          >
            {diff > 0 ? '+' : ''}
            {formatMoney(diff)}
          </span>
        </div>
      </Card>

      {/* Denominations Input Table */}
      <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
        {DENOMINATIONS.map((d) => (
          <div key={d.value} className="p-3 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-36">
              {d.label}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Adet:</span>
              <input
                type="number"
                min="0"
                value={counts[d.value] || ''}
                onChange={(e) => handleCountChange(d.value, parseInt(e.target.value) || 0)}
                className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-bold text-right focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <span className="w-28 text-right font-mono font-bold text-xs text-slate-900 dark:text-slate-100 tabular-nums">
              {formatMoney(d.value * (counts[d.value] || 0))}
            </span>
          </div>
        ))}
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={() => navigate('/para')}>
          Kapat
        </Button>
        <Button
          variant="success"
          onClick={() => {
            alert('Kasa sayımı mutabakatı kaydedildi.');
            navigate('/para');
          }}
        >
          <Check className="w-4 h-4 mr-1.5" />
          Mutabakatı Onayla
        </Button>
      </div>
    </div>
  );
};
