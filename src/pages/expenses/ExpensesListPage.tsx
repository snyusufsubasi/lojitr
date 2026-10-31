import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingDown,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Fuel,
  Receipt,
  Car,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useRepository } from '@/domain/useRepository';
import { formatMoney, formatDateShort } from '@/lib/formatters';
import { trIncludes } from '@/lib/trSearch';
import type { Expense, Vehicle } from '@/domain/types';

export const ExpensesListPage: React.FC = () => {
  const repo = useRepository();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [e, v] = await Promise.all([repo.listExpenses(), repo.listVehicles()]);
      setExpenses(e);
      setVehicles(v);
      setLoading(false);
    }
    load();
  }, []);

  const getVehiclePlate = (id?: string) => {
    if (!id) return 'Genel Masraf';
    return vehicles.find((v) => v.id === id)?.plate || 'Plaka Yok';
  };

  const categories = [
    { id: 'all', label: 'Tümü' },
    { id: 'yakit', label: 'Yakıt / Mazot' },
    { id: 'otoyol', label: 'HGS / Otoyol' },
    { id: 'bakim', label: 'Bakım / Tamir' },
    { id: 'lastik', label: 'Lastik' },
    { id: 'harcirah', label: 'Harcırah' },
    { id: 'yemek', label: 'Yemek' },
  ];

  const filtered = expenses.filter((e) => {
    const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
    const matchSearch =
      trIncludes(e.note, search) ||
      trIncludes(e.category, search) ||
      trIncludes(getVehiclePlate(e.vehicleId), search);
    return matchCat && matchSearch;
  });

  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            Gider & Masraf Yönetimi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Akaryakıt fişleri (WASM OCR), HGS geçişleri, şoför harcırahları ve araç bakım masrafları
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/masraflar/yeni')}
          className="bg-rose-600 hover:bg-rose-500 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Masraf / Fiş Ekle
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                categoryFilter === c.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Açıklama, plaka veya kategori ara..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Summary Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300">
        <span>Filtrelenen {filtered.length} masraf kaydı listeleniyor.</span>
        <span className="font-extrabold text-sm tabular-nums">
          Toplam: {formatMoney(totalAmount)}
        </span>
      </div>

      {/* Expense Cards */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <Card className="text-center py-12 space-y-3">
            <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Masraf kaydı bulunamadı
            </p>
          </Card>
        ) : (
          filtered.map((e) => (
            <Card key={e.id} className="p-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wide text-slate-900 dark:text-white">
                        {e.category}
                      </span>
                      {e.litres && (
                        <Badge variant="brand" size="sm">
                          {e.litres} LT
                        </Badge>
                      )}
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {getVehiclePlate(e.vehicleId)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {e.note || 'Açıklama belirtilmedi'} • Ödeme: <strong>{e.source.toUpperCase()}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    -{formatMoney(e.amount)}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {formatDateShort(e.date)}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
