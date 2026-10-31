import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  TrendingUp,
  Fuel,
  Wallet,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileText,
  Users,
  Car,
  Disc,
  QrCode,
  Sparkles,
  Zap,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { solveFuelEquation, calculateFuelConsumption } from '@/domain/math/fuelTelemetryMath';
import { simulateTripBreakEven } from '@/domain/math/tripEngineeringMath';
import { formatMoney } from '@/lib/formatters';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Tab State for Interactive Calculators
  const [calcTab, setCalcTab] = useState<'fuel' | 'breakeven' | 'roi'>('fuel');

  // Calculator 1: Live Fuel Telemetry
  const [fuelPrice, setFuelPrice] = useState(43.5);
  const [fuelAmount, setFuelAmount] = useState(16500);
  const [prevKm, setPrevKm] = useState(283500);
  const [currentKm, setCurrentKm] = useState(284620);

  // Calculator 2: Live Trip Break-Even & 2/10 Withholding
  const [tripKm, setTripKm] = useState(980);
  const [tripWeight, setTripWeight] = useState(24.5);
  const [tripFreight, setTripFreight] = useState(58000);

  // Calculator 3: Fleet ROI Slider
  const [fleetSize, setFleetSize] = useState(12);
  const [monthlyKm, setMonthlyKm] = useState(11500);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Fuel Solver Execution
  const fuelSolved = solveFuelEquation({
    unitPrice: fuelPrice,
    amount: fuelAmount,
    lastChangedField: 'amount',
  });
  const consumptionResult = calculateFuelConsumption({
    litres: fuelSolved.litres,
    currentKm,
    prevKm,
    totalAmount: fuelAmount,
    tankCapacityLitres: 600,
    targetConsumptionPer100Km: 29.5,
    cargoWeightTon: 24,
  });

  // Break-Even Simulation Execution
  const breakEvenResult = simulateTripBreakEven({
    distanceKm: tripKm,
    freightNet: tripFreight,
    fuelPricePerLitre: 43.5,
    avgFuelPer100Km: 29.5,
    cargoWeightTon: tripWeight,
    estimatedTollCost: 2850,
    driverPerDiem: 1500,
    driverKmRate: 2.0,
    tireAndWearCostPerKm: 2.4,
  });

  // ROI Savings Calculation:
  // Fuel theft & overconsumption reduction: ~3.5% fuel savings.
  // Administrative time saved: ~40 hrs/mo.
  const annualTotalFuelCost = fleetSize * (monthlyKm / 100) * 31 * 43.5 * 12;
  const annualFuelSavings = Math.round(annualTotalFuelCost * 0.045);
  const annualAdminSavings = fleetSize * 18000;
  const totalAnnualSavings = annualFuelSavings + annualAdminSavings;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* 1. Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-slate-900">
                Loji<span className="text-brand-600">TR</span>
              </span>
              <span className="ml-1.5 text-[10px] uppercase font-bold text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded-full">
                v3.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#ozellikler" className="hover:text-brand-600 transition-colors">Özellikler</a>
            <a href="#hesaplayici" className="hover:text-brand-600 transition-colors">Canlı Hesaplayıcı</a>
            <a href="#karsilastirma" className="hover:text-brand-600 transition-colors">Neden LojiTR?</a>
            <a href="#fiyatlar" className="hover:text-brand-600 transition-colors">Fiyatlandırma</a>
            <a href="#sss" className="hover:text-brand-600 transition-colors">Sıkça Sorulanlar</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/giris')}
              className="text-xs font-bold"
            >
              Giriş Yap
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/')}
              className="bg-brand-600 hover:bg-brand-500 text-xs font-bold shadow-md shadow-brand-500/20"
            >
              Paneli Aç (Canlı Demo)
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Türkiye'nin İlk Akıllı Matematiksel Filo & Navlun Platformu</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Kamyonunuzun Yaktığı <span className="text-brand-600">Her Damla Mazotu</span>, Aldığı Her Kilometreyi ve <span className="text-emerald-600">Net Kârınızı</span> Hesaplayın.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Excel tablolarıyla, el hesap makineleriyle ve kaybolan mazot fişleriyle vakit kaybetmeyin.
            LojiTR; çift yönlü telemetri motoru, 2/10 KDV tevkifatı, kantar fire kesintileri ve anlık başabaş analiziyle nakliyenizi tek ekrandan yönetir.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-500/25 px-8 py-3 text-sm font-black"
            >
              Hemen Ücretsiz Deneyin
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <a
              href="#hesaplayici"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all shadow-xs"
            >
              <Calculator className="w-4 h-4 mr-2 text-brand-600" />
              Canlı Hesaplayıcıyı Test Et
            </a>
          </div>

          {/* Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Kredi Kartı Gerekmez</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> GİB 2/10 Tevkifat Uyumlu</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Kamera ile Fiş OCR</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 81 İl Otomatik Mesafe</span>
          </div>
        </div>
      </section>

      {/* 3. Interactive Live Algorithm Lab Section */}
      <section id="hesaplayici" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="brand" size="sm">Canlı Algoritma Laboratuvarı</Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sistemi Kayıt Olmadan Hemen Burada Test Edin
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              LojiTR'nin matematiksel çözücülerini gerçek verilerinizle anında çalıştırın.
            </p>
          </div>

          {/* Calculator Tabs */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold gap-1">
              <button
                onClick={() => setCalcTab('fuel')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  calcTab === 'fuel' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Fuel className="w-4 h-4 text-amber-500" />
                1. Çift Yönlü Yakıt & KM Telemetrisi
              </button>
              <button
                onClick={() => setCalcTab('breakeven')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  calcTab === 'breakeven' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator className="w-4 h-4 text-brand-500" />
                2. Sefer Başabaş & 2/10 Tevkifat
              </button>
              <button
                onClick={() => setCalcTab('roi')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  calcTab === 'roi' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                3. Yıllık Filo Tasarruf Simülatörü
              </button>
            </div>
          </div>

          {/* TAB 1: Fuel Telemetry Solver */}
          {calcTab === 'fuel' && (
            <Card className="p-6 sm:p-8 bg-slate-50/50 border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-amber-500" />
                    Mazot Fişi & Sayaç Parametreleri
                  </h3>
                  <p className="text-xs text-slate-500">
                    Litre fiyatını ve tutarı girin; sistem alınan litreyi, kat edilen mesafeyi ve 100 km'deki net tüketimi canlı hesaplasın.
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Birim Fiyat (₺/LT)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={fuelPrice}
                        onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Toplam Fiş Tutarı (₺)</label>
                      <input
                        type="number"
                        value={fuelAmount}
                        onChange={(e) => setFuelAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-brand-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Önceki Sayaç KM</label>
                      <input
                        type="number"
                        value={prevKm}
                        onChange={(e) => setPrevKm(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Güncel Sayaç KM</label>
                      <input
                        type="number"
                        value={currentKm}
                        onChange={(e) => setCurrentKm(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Results Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Canlı Telemetri Çıktısı
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Hesaplanan Litre</span>
                      <span className="text-xl font-black text-slate-900 tabular-nums">
                        {fuelSolved.litres.toLocaleString('tr-TR')} LT
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Kat Edilen Yol (ΔKM)</span>
                      <span className="text-xl font-black text-slate-900 tabular-nums font-mono">
                        {consumptionResult.deltaKm.toLocaleString('tr-TR')} KM
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-brand-800 block">100 KM Ortalama Tüketim</span>
                      <span className="text-[11px] text-brand-600">Ağır vasıta filo standardı</span>
                    </div>
                    <div className="text-2xl font-black text-brand-700 tabular-nums">
                      {consumptionResult.consumptionPer100Km} <span className="text-sm font-semibold">LT/100km</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
                    <span>Kilometre Başına Yakıt Maliyeti:</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      {consumptionResult.costPerKm} ₺ / KM
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    * Çift yönlü motor: Fiyat veya litre değiştiğinde tutar otomatik güncellenir.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 2: Break-Even & Withholding Simulator */}
          {calcTab === 'breakeven' && (
            <Card className="p-6 sm:p-8 bg-slate-50/50 border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-brand-500" />
                    Sefer & Navlun Parametreleri
                  </h3>
                  <p className="text-xs text-slate-500">
                    Örn: Gebze - İskenderun hattı (980 KM). Mazot, HGS, şoför harcırahı ve lastik aşınma payı düşülerek başabaş noktası simüle edilir.
                  </p>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Mesafe (KM)</label>
                      <input
                        type="number"
                        value={tripKm}
                        onChange={(e) => setTripKm(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Yük (Ton)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={tripWeight}
                        onChange={(e) => setTripWeight(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Navlun (₺ + KDV)</label>
                      <input
                        type="number"
                        value={tripFreight}
                        onChange={(e) => setTripFreight(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-brand-600"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-800 block">Varsayılan Maliyet Unsurları:</span>
                    <div className="flex justify-between text-slate-500">
                      <span>Tahmini Mazot Gideri:</span>
                      <span className="font-mono">{formatMoney(breakEvenResult.estimatedFuelCost)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Köprü & Otoyol HGS:</span>
                      <span className="font-mono">{formatMoney(breakEvenResult.estimatedTollCost)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Şoför Harcırah + KM Primi:</span>
                      <span className="font-mono">{formatMoney(breakEvenResult.estimatedDriverPay)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Lastik & Bakım Payı:</span>
                      <span className="font-mono">{formatMoney(breakEvenResult.estimatedWearCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Feasibility Output */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Fizibilite Analizi
                    </span>
                    <Badge variant={breakEvenResult.status === 'cok_karli' || breakEvenResult.status === 'karli' ? 'success' : 'danger'}>
                      {breakEvenResult.status === 'cok_karli' ? 'YÜKSEK KÂRLI' : breakEvenResult.status === 'karli' ? 'KÂRLI SEFER' : 'ZARAR RİSKİ'}
                    </Badge>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 block">Öngörülen Net Kâr</span>
                      <span className="text-[11px] text-emerald-600">Tüm direkt giderler düşüldükten sonra</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-700 tabular-nums">
                      {formatMoney(breakEvenResult.projectedNetProfit)}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Minimum Başabaş Navlunu (0 Kâr Noktası):</span>
                      <span className="font-mono font-bold text-slate-900">{formatMoney(breakEvenResult.breakEvenFreight)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>%25 Marjlı Önerilen Müşteri Teklifi:</span>
                      <span className="font-mono font-bold text-brand-600">{formatMoney(breakEvenResult.recommendedQuoteFreight)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Müşteriden 2/10 Tevkifat Sonrası Alınacak:</span>
                      <span className="font-mono font-bold text-slate-800">{formatMoney(tripFreight * 1.16)}</span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-600">
                    💡 {breakEvenResult.adviceMessage}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: Fleet ROI Slider */}
          {calcTab === 'roi' && (
            <Card className="p-6 sm:p-8 bg-slate-50/50 border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Filo Büyüklüğü ve Aylık Kilometre
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Aktif Çekici / Kamyon Sayısı:</span>
                      <span className="text-brand-600 text-sm">{fleetSize} Araç</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={fleetSize}
                      onChange={(e) => setFleetSize(parseInt(e.target.value))}
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Araç Başına Ortalama Aylık KM:</span>
                      <span className="text-brand-600 text-sm">{monthlyKm.toLocaleString('tr-TR')} KM</span>
                    </div>
                    <input
                      type="range"
                      min="3000"
                      max="20000"
                      step="500"
                      value={monthlyKm}
                      onChange={(e) => setMonthlyKm(parseInt(e.target.value))}
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Tahmini Yıllık Finansal Kazanç
                  </span>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md">
                    <span className="text-xs font-semibold block text-emerald-100">Toplam Yıllık Filo Tasarrufu</span>
                    <div className="text-3xl font-black tabular-nums mt-1">
                      {formatMoney(totalAnnualSavings)}
                    </div>
                    <span className="text-[11px] text-emerald-100 mt-1 block">
                      Yakıt kayıplarının önlenmesi + fatura mutabakat hızlanması
                    </span>
                  </div>

                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Yakıt Kaçağı & Tüketim İyileştirmesi (%4.5):</span>
                      <span className="font-mono font-bold text-emerald-600">+{formatMoney(annualFuelSavings)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Ön Muhasebe & Mutabakat Süre Tasarrufu:</span>
                      <span className="font-mono font-bold text-emerald-600">+{formatMoney(annualAdminSavings)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* 4. 12 Core Modules Bento Grid */}
      <section id="ozellikler" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="brand" size="sm">Eksiksiz Özellik Seti</Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Nakliyenin Tüm Süreçleri İçin Tek Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Şoförün cebindeki fişten mali müşavirin beyannamesine kadar uçtan uca dijitalleştirildi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-5 space-y-2.5 hover:border-brand-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">4 Modlu Sefer & Navlun</h3>
              <p className="text-xs text-slate-500">
                Sabit, ton başı, km başı ve palet bazlı navlun hesaplama; 2/10 KDV tevkifatı ve kantar fire kesintileri.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5 hover:border-brand-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Fuel className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">WASM Kamera ile Fiş OCR</h3>
              <p className="text-xs text-slate-500">
                Şoför fişin fotoğrafını çeker, yapay zeka tutarı, litre ve istasyon adını saniyeler içinde okur.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5 hover:border-brand-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Disc className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Görsel Lastik Şasisi & CPK</h3>
              <p className="text-xs text-slate-500">
                Kuşbakışı şasi üzerinde milimetrik diş takibi, ikiz tekerlek aşınma simetrisi ve rotasyon önerileri.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5 hover:border-brand-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Şoför Hakediş Pusulası</h3>
              <p className="text-xs text-slate-500">
                Kıstelyevm aylık maaş, sefer harcırahları, KM primleri ve düşülen yol avansları ile resmi A4 ibra pusulası.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5 hover:border-brand-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Çek / Senet & Faktoring</h3>
              <p className="text-xs text-slate-500">
                Müşteri çeklerinin vadesi, karşılıksız riski ve kırdırma durumunda net nakit ile efektif bileşik maliyet hesabı.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5 hover:border-brand-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Dijital Teslimat (e-İmza & GPS)</h3>
              <p className="text-xs text-slate-500">
                Yük tesliminde alıcının ekrana attığı dijital imza, GPS konumu ve anında doğrulanabilir karekodlu POD belgesi.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section id="fiyatlar" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="brand" size="sm">Şeffaf Fiyatlandırma</Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Filo Büyüklüğünüze Göre Ölçeklenen Planlar
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Sürpriz ek ücret yok. 14 gün koşulsuz ücretsiz deneme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <Card className="p-6 space-y-5 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Küçük Filolar İçin</span>
                <h3 className="text-xl font-black text-slate-900">Başlangıç</h3>
                <div className="text-3xl font-black text-slate-900">
                  ₺950 <span className="text-xs font-normal text-slate-400">/ ay</span>
                </div>
                <p className="text-xs text-slate-500">1 – 3 Çekici veya Kamyon çalıştıran bağımsız nakliyeciler.</p>
                <div className="space-y-2 text-xs pt-2">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 3 Araç Limiti</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sınırsız Sefer ve Masraf</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Fiş OCR & QR Doğrulama</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> WhatsApp Ekstre Paylaşımı</div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6" onClick={() => navigate('/')}>
                14 Gün Ücretsiz Başla
              </Button>
            </Card>

            {/* Pro - Featured */}
            <Card className="p-6 space-y-5 border-2 border-brand-500 relative flex flex-col justify-between shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-sm">
                En Popüler Seçim
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Orta Ölçekli Filolar</span>
                <h3 className="text-xl font-black text-slate-900">Profesyonel Filo</h3>
                <div className="text-3xl font-black text-slate-900">
                  ₺2.450 <span className="text-xs font-normal text-slate-400">/ ay</span>
                </div>
                <p className="text-xs text-slate-500">4 – 15 Çekici ve Dorse işleten nakliye şirketleri.</p>
                <div className="space-y-2 text-xs pt-2">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 15 Araç + Dorse Takibi</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Görsel Lastik Şasisi & CPK</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Çek/Senet & Faktoring İskonto</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 12 Haftalık Nakit Akışı</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> GİB 2/10 e-Fatura A4 Çıktısı</div>
                </div>
              </div>
              <Button variant="primary" className="w-full mt-6 bg-brand-600 hover:bg-brand-500" onClick={() => navigate('/')}>
                Hemen Başlayın
              </Button>
            </Card>

            {/* Enterprise */}
            <Card className="p-6 space-y-5 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Büyük Filolar</span>
                <h3 className="text-xl font-black text-slate-900">Kurumsal</h3>
                <div className="text-3xl font-black text-slate-900">
                  ₺4.900 <span className="text-xs font-normal text-slate-400">/ ay</span>
                </div>
                <p className="text-xs text-slate-500">15+ Çekici ve birden fazla şubesi olan lojistik devleri.</p>
                <div className="space-y-2 text-xs pt-2">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sınırsız Araç ve Kullanıcı</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Çoklu Şube & Garaj Yönetimi</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Özel Muhasebe ERP Entegrasyonu</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 7/24 Öncelikli Mimar Desteği</div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6" onClick={() => navigate('/')}>
                Bize Ulaşın
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="sss" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Sıkça Sorulan Sorular</h2>
            <p className="text-xs text-slate-500">Aklınıza takılan tüm soruların net yanıtları.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Fiş okuma (OCR) için özel bir cihaza ihtiyacım var mı?',
                a: 'Hayır. Şoför veya muhasebeci akıllı telefonunun kamerasıyla fişin fotoğrafını çeker çekmez tarayıcı içi WASM yapay zeka motoru tutar, litre ve tarihi anında form alanlarına doldurur.',
              },
              {
                q: '2/10 KDV tevkifatı hesaplaması GİB mevzuatına uygun mu?',
                a: 'Tamamen uyumludur. Navlun bedeli üzerinden %20 KDV hesaplanır, 2/10 tevkifat tutarı faturadan düşülür ve kalan 8/10 müşteri alacağı olarak carisine kaydedilir.',
              },
              {
                q: 'İnternetim kesilirse veri kaybeder miyim?',
                a: 'Hayır. LojiTR offline-first yerel veritabanı altyapısıyla çalışır. İnternet bağlantınız kopsa bile sefer ve masraflarınızı girmeye devam edebilirsiniz.',
              },
              {
                q: 'Mevcut Excel verilerimi aktarabilir miyim?',
                a: 'Evet. LojiTR içinde yerleşik Excel İçe Aktarma Sihirbazı bulunur. Araçlarınızı, şoförlerinizi ve müşteri cari kartlarınızı tek tıkla sisteme aktarabilirsiniz.',
              },
            ].map((faq, idx) => (
              <Card
                key={idx}
                className="p-4 cursor-pointer hover:border-brand-500/30 transition-all"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{faq.q}</h4>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-brand-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                {openFaq === idx && (
                  <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-black">
              TR
            </div>
            <div>
              <span className="font-bold text-white text-sm">LojiTR Platformu</span>
              <p className="text-[11px] text-slate-500">Akıllı Nakliye, Filo ve Sefer Yönetim Sistemi</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#ozellikler" className="hover:text-white transition-colors">Özellikler</a>
            <a href="#fiyatlar" className="hover:text-white transition-colors">Fiyatlandırma</a>
            <span className="cursor-pointer hover:text-white" onClick={() => navigate('/')}>Canlı Panel</span>
            <span className="cursor-pointer hover:text-white" onClick={() => navigate('/giris')}>Giriş</span>
          </div>

          <div>
            © 2026 LojiTR Bilişim Teknolojileri A.Ş. · Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
};
