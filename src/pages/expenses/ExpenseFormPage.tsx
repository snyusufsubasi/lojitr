import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingDown,
  ArrowLeft,
  Camera,
  Fuel,
  CreditCard,
  Building2,
  User,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  HelpCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { runOcrOnFile } from '@/domain/ocr/receiptOcr';
import { solveFuelEquation, calculateFuelConsumption } from '@/domain/math/fuelTelemetryMath';
import { isoToday } from '@/lib/formatters';
import type { Vehicle, Driver, Contact, MoneyAccount, ExpenseCategory, ExpenseSource } from '@/domain/types';

export const ExpenseFormPage: React.FC = () => {
  const navigate = useNavigate();
  const repo = useRepository();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [moneyAccounts, setMoneyAccounts] = useState<MoneyAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);

  // Form State
  const [date, setDate] = useState(isoToday());
  const [category, setCategory] = useState<ExpenseCategory>('yakit');
  const [amount, setAmount] = useState(0);
  const [unitPrice, setUnitPrice] = useState<number | undefined>(43.5);
  const [litres, setLitres] = useState<number | undefined>();
  const [discountPct, setDiscountPct] = useState<number>(0);
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [contactId, setContactId] = useState('');
  const [source, setSource] = useState<ExpenseSource>('kasa');
  const [moneyAccountId, setMoneyAccountId] = useState('');
  const [note, setNote] = useState('');

  // Odometer Telemetry State
  const [prevKm, setPrevKm] = useState<number>(0);
  const [currentKm, setCurrentKm] = useState<number>(0);
  const [isFullTank, setIsFullTank] = useState(true);

  // Last edited tracker to avoid circular state updates
  const [lastChanged, setLastChanged] = useState<'amount' | 'litres' | 'unitPrice'>('amount');

  useEffect(() => {
    async function loadMeta() {
      const [v, d, c, a, exp] = await Promise.all([
        repo.listVehicles(),
        repo.listDrivers(),
        repo.listContacts(),
        repo.listMoneyAccounts(),
        repo.listExpenses(),
      ]);
      setVehicles(v);
      setDrivers(d);
      setContacts(c);
      setMoneyAccounts(a);

      if (v.length > 0) {
        setVehicleId(v[0].id);
        if (v[0].km) {
          setPrevKm(v[0].km);
          setCurrentKm(v[0].km + 850);
        }
        if (v[0].driverId) setDriverId(v[0].driverId);
      }
      if (a.length > 0) setMoneyAccountId(a[0].id);
    }
    loadMeta();
  }, []);

  // When vehicle changes, auto-populate previous km and assigned driver
  const handleVehicleChange = (vId: string) => {
    setVehicleId(vId);
    const chosen = vehicles.find((v) => v.id === vId);
    if (chosen) {
      if (chosen.km) {
        setPrevKm(chosen.km);
        setCurrentKm(chosen.km + 500);
      }
      if (chosen.driverId) setDriverId(chosen.driverId);
    }
  };

  // 3-Way Fuel Equation Solver
  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    setLastChanged('amount');
    if (unitPrice && unitPrice > 0) {
      const solved = solveFuelEquation({
        unitPrice,
        amount: newAmount,
        discountPct,
        lastChangedField: 'amount',
      });
      setLitres(solved.litres);
    }
  };

  const handleLitresChange = (newLitres: number) => {
    setLitres(newLitres);
    setLastChanged('litres');
    if (unitPrice && unitPrice > 0) {
      const solved = solveFuelEquation({
        unitPrice,
        litres: newLitres,
        discountPct,
        lastChangedField: 'litres',
      });
      setAmount(solved.amount);
    }
  };

  const handleUnitPriceChange = (newPrice: number) => {
    setUnitPrice(newPrice);
    setLastChanged('unitPrice');
    if (amount > 0) {
      const solved = solveFuelEquation({
        unitPrice: newPrice,
        amount,
        discountPct,
        lastChangedField: 'unitPrice',
      });
      setLitres(solved.litres);
    }
  };

  // Live Consumption Calculation
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const consumption = calculateFuelConsumption({
    litres: litres || 0,
    currentKm,
    prevKm,
    totalAmount: amount,
    tankCapacityLitres: selectedVehicle?.tankCapacityLitres || 600,
    targetConsumptionPer100Km: selectedVehicle?.avgFuelPer100Km || 29.5,
  });

  // Trigger OCR scan on selected image
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrScanning(true);
    try {
      const ocr = await runOcrOnFile(file);
      if (ocr.amount) handleAmountChange(ocr.amount);
      if (ocr.litres) {
        handleLitresChange(ocr.litres);
        setCategory('yakit');
      }
      if (ocr.date) setDate(ocr.date);
      if (ocr.merchant) setNote(ocr.merchant);
    } catch {
      alert('Fiş taranırken bir hata oluştu veya metin okunamadı.');
    } finally {
      setOcrScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Lütfen geçerli bir tutar girin.');
      return;
    }

    setLoading(true);
    try {
      await repo.createExpense({
        date,
        category,
        amount,
        unitPrice,
        litres,
        km: currentKm > 0 ? currentKm : undefined,
        prevKm: prevKm > 0 ? prevKm : undefined,
        isFullTank,
        consumptionPer100Km: consumption.consumptionPer100Km > 0 ? consumption.consumptionPer100Km : undefined,
        costPerKm: consumption.costPerKm > 0 ? consumption.costPerKm : undefined,
        fuelDiscountPct: discountPct > 0 ? discountPct : undefined,
        anomalyFlags: consumption.anomalies,
        vehicleId: vehicleId || undefined,
        driverId: driverId || undefined,
        contactId: contactId || undefined,
        source,
        moneyAccountId: moneyAccountId || undefined,
        note: note.trim() || undefined,
      });
      navigate('/masraflar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/masraflar')}
            className="p-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-500" />
              Yeni Masraf & Yakıt Fişi Girişi
            </h1>
            <p className="text-xs text-slate-500">
              3-Yönlü dinamik yakıt çözücü, sayaç telemetrisi ve kamera OCR desteği
            </p>
          </div>
        </div>

        {/* OCR File Input Trigger */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 transition-colors shadow-xs">
            <Camera className="w-4 h-4 text-brand-500" />
            {ocrScanning ? 'Fiş Taranıyor...' : 'Kamerayla Fiş Tara (WASM OCR)'}
          </span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Masraf Tarihi *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Select
              label="Masraf Kategorisi *"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              required
            >
              <option value="yakit">⛽ Yakıt / Mazot</option>
              <option value="adblue">💧 AdBlue</option>
              <option value="otoyol">🛣️ HGS / OGS / Otoyol / Köprü</option>
              <option value="bakim">🔧 Bakım / Periyodik Servis / Yağ</option>
              <option value="lastik">🛞 Lastik / Rot / Balans / Kaplama</option>
              <option value="yemek">🍲 Yemek / Kumanya</option>
              <option value="harcirah">💵 Şoför Sefer Harcırahı</option>
              <option value="sigorta">🛡️ Trafik Sigortası</option>
              <option value="kasko">📑 Kasko Poliçesi</option>
              <option value="muayene">🔍 TÜVTÜRK Muayene</option>
              <option value="vergi">🏛️ MTV / Bandrol / Noter</option>
              <option value="ceza">🚨 Trafik Cezası</option>
              <option value="diger">📦 Diğer Genel Giderler</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="İlgili Araç"
              value={vehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
            >
              <option value="">Araç Belirtilmedi</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} ({v.type.toUpperCase()})
                </option>
              ))}
            </Select>

            <Select
              label="İlgili Şoför"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
            >
              <option value="">Şoför Seçin</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Akıllı Yakıt & Telemetri Bölümü (Kategori Yakıt veya AdBlue ise Açılır) */}
          {(category === 'yakit' || category === 'adblue') && (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-amber-600" />
                  3-Yönlü Dinamik Yakıt Telemetrisi
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400">
                  Herhangi ikisini yazın, üçüncüsü otomatik hesaplanır!
                </span>
              </div>

              {/* 3'lü Dinamik Çözücü Alanları */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Litre Birim Fiyatı (₺/LT) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitPrice || ''}
                    onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                    placeholder="43.50 ₺"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alınan Litre (LT) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={litres || ''}
                    onChange={(e) => handleLitresChange(parseFloat(e.target.value) || 0)}
                    placeholder="Örn: 380 LT"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Toplam Fiş Tutarı (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount || ''}
                    onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                    placeholder="16.500 ₺"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-sm font-black text-brand-600 dark:text-brand-400"
                  />
                </div>
              </div>

              {/* Sayaç Telemetrisi: Önceki KM & Güncel Sayaç KM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/50 dark:border-amber-800/30">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Önceki Sayaç KM (Otomatik Çekildi)
                  </label>
                  <input
                    type="number"
                    value={prevKm || ''}
                    onChange={(e) => setPrevKm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-mono text-xs text-slate-600 dark:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fişteki Güncel Sayaç KM *
                  </label>
                  <input
                    type="number"
                    value={currentKm || ''}
                    onChange={(e) => setCurrentKm(parseFloat(e.target.value) || 0)}
                    placeholder="Örn: 284500"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-mono text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Anlık Hesaplanan Tüketim Performans Rozet Kartı */}
              {consumption.deltaKm > 0 && consumption.consumptionPer100Km > 0 && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Kat Edilen Mesafe (ΔKM):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {consumption.deltaKm.toLocaleString('tr-TR')} KM
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">100 KM Ortalama Yakıt Tüketimi:</span>
                    <span
                      className={`font-black text-sm tabular-nums ${
                        consumption.performanceStatus === 'super'
                          ? 'text-emerald-600'
                          : consumption.performanceStatus === 'normal'
                          ? 'text-brand-600'
                          : consumption.performanceStatus === 'yuksek'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {consumption.consumptionPer100Km} LT / 100 KM
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span className="text-slate-500">KM Başına Yakıt Maliyeti:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {consumption.costPerKm} ₺ / KM
                    </span>
                  </div>

                  {consumption.anomalies.length > 0 && (
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{consumption.anomalies[0]}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Diğer Masraflar İçin Standart Tutar Alanı */}
          {category !== 'yakit' && category !== 'adblue' && (
            <CurrencyInput
              label="Toplam Tutar *"
              value={amount}
              currency="TRY"
              onChange={(val) => setAmount(val.amount)}
            />
          )}

          {/* Payment Source Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ödeme Kaynağı *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
              {[
                { id: 'kasa', label: 'Nakit Kasa', icon: Building2 },
                { id: 'banka', label: 'Banka', icon: CreditCard },
                { id: 'yakit_karti', label: 'Taşıt Tanıma', icon: Fuel },
                { id: 'sofor', label: 'Şoför Cebinden', icon: User },
                { id: 'veresiye', label: 'Veresiye Cari', icon: Building2 },
              ].map((src) => {
                const Icon = src.icon;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setSource(src.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      source === src.id
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{src.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Açıklama / İstasyon / Not"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Örn: Opet Pozantı İstasyonu · Fiş No: 0042"
          />
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/masraflar')}
          >
            İptal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-500 px-6 font-bold"
          >
            {loading ? 'Kaydediliyor...' : 'Masrafı Kaydet'}
          </Button>
        </div>
      </form>
    </div>
  );
};
