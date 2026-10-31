import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, ArrowLeft, Mic, Sparkles, Check, Calculator, AlertTriangle, TrendingUp, Compass } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { parseSpokenTrip } from '@/domain/nlp/voiceParser';
import { calculateTripFinancials, WITHHOLDING_OPTIONS } from '@/domain/math/tripMath';
import { calculateDynamicFreight, simulateTripBreakEven, solveKmTriangle } from '@/domain/math/tripEngineeringMath';
import { lookupRouteInfo } from '@/domain/math/turkeyRouteMatrix';
import { isoToday, formatMoney } from '@/lib/formatters';
import type { Vehicle, Driver, Contact, Trip, TripPricingKind } from '@/domain/types';

export const TripFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const repo = useRepository();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  // Voice speech recognition
  const [isListening, setIsListening] = useState(false);

  // Form Fields
  const [date, setDate] = useState(isoToday());
  const [vehicleId, setVehicleId] = useState('');
  const [trailerId, setTrailerId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [contactId, setContactId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargo, setCargo] = useState('');

  // 4-Mode Pricing State
  const [pricingKind, setPricingKind] = useState<TripPricingKind>('sabit');
  const [unitFreightRate, setUnitFreightRate] = useState<number>(0);
  const [weightTon, setWeightTon] = useState<number | undefined>(24.0);
  const [pieceCount, setPieceCount] = useState<number | undefined>();

  // Odometer & Distance Triangle
  const [km, setKm] = useState<number | undefined>(450);
  const [startKm, setStartKm] = useState<number | undefined>();
  const [endKm, setEndKm] = useState<number | undefined>();

  const [waybillNo, setWaybillNo] = useState('');
  const [freight, setFreight] = useState(38000);
  const [currency, setCurrency] = useState<'TRY' | 'USD' | 'EUR' | 'GBP'>('TRY');
  const [fxRate, setFxRate] = useState<number | undefined>();
  const [vatIncluded, setVatIncluded] = useState(false);
  const [vatRate, setVatRate] = useState(20);
  const [vatWithholding, setVatWithholding] = useState<string>('2/10');
  const [commission, setCommission] = useState(0);
  const [status, setStatus] = useState<Trip['status']>('yolda');
  const [uetdsReported, setUetdsReported] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      const [v, d, c] = await Promise.all([
        repo.listVehicles(),
        repo.listDrivers(),
        repo.listContacts(),
      ]);
      setVehicles(v);
      setDrivers(d);
      setContacts(c);

      const firstTruck = v.find((x) => x.type !== 'dorse');
      if (firstTruck && !id) {
        setVehicleId(firstTruck.id);
        if (firstTruck.trailerId) setTrailerId(firstTruck.trailerId);
        if (firstTruck.driverId) setDriverId(firstTruck.driverId);
        if (firstTruck.km) {
          setStartKm(firstTruck.km);
          setEndKm(firstTruck.km + (km || 450));
        }
      }
    }
    loadMeta();
  }, [id]);

  const handleVehicleChange = (vId: string) => {
    setVehicleId(vId);
    const chosen = vehicles.find((v) => v.id === vId);
    if (chosen) {
      if (chosen.trailerId) setTrailerId(chosen.trailerId);
      if (chosen.driverId) setDriverId(chosen.driverId);
      if (chosen.km) {
        setStartKm(chosen.km);
        setEndKm(chosen.km + (km || 450));
      }
    }
  };

  // Route Auto-Fill on origin / destination blur
  const handleRouteBlur = () => {
    if (origin.trim().length >= 3 && destination.trim().length >= 3) {
      const route = lookupRouteInfo(origin, destination);
      if (route.distanceKm > 0) {
        setKm(route.distanceKm);
        if (startKm) {
          setEndKm(startKm + route.distanceKm);
        }
      }
    }
  };

  // Distance KM change handler
  const handleDistanceChange = (newKm: number) => {
    setKm(newKm);
    const tri = solveKmTriangle(startKm, endKm, newKm, 'distanceKm');
    if (tri.endKm) setEndKm(tri.endKm);
  };

  const handleStartKmChange = (newStart: number) => {
    setStartKm(newStart);
    const tri = solveKmTriangle(newStart, endKm, km, 'startKm');
    if (tri.endKm) setEndKm(tri.endKm);
  };

  const handleEndKmChange = (newEnd: number) => {
    setEndKm(newEnd);
    const tri = solveKmTriangle(startKm, newEnd, km, 'endKm');
    if (tri.distanceKm) setKm(tri.distanceKm);
  };

  // 4-Mode Pricing Calculation
  const dynamicFreightResult = calculateDynamicFreight({
    pricingKind,
    unitPrice: unitFreightRate || freight,
    weightTon,
    distanceKm: km,
    pieceCount,
  });

  const effectiveFreight = pricingKind === 'sabit' ? freight : dynamicFreightResult.freightNet;

  // Selected Vehicle specs
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const route = lookupRouteInfo(origin || 'Gebze', destination || 'İzmir');

  // Live Break-Even Simulation
  const breakEven = simulateTripBreakEven({
    distanceKm: km || 450,
    freightNet: effectiveFreight,
    fuelPricePerLitre: 43.5,
    avgFuelPer100Km: selectedVehicle?.avgFuelPer100Km || 29.5,
    cargoWeightTon: weightTon || 24,
    estimatedTollCost: route.estimatedTollCost || 1200,
    driverPerDiem: 1500,
    driverKmRate: 2.0,
    commissionAmount: commission,
  });

  // Voice Recognition
  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tarayıcınız sesle girişi desteklemiyor. Chrome veya Edge kullanabilirsiniz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const parsed = parseSpokenTrip(transcript);
      if (parsed.origin) setOrigin(parsed.origin);
      if (parsed.destination) setDestination(parsed.destination);
      if (parsed.freight) setFreight(parsed.freight);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !origin.trim() || !destination.trim() || effectiveFreight <= 0) {
      alert('Lütfen araç, çıkış, varış ve navlun tutarını girin.');
      return;
    }

    setLoading(true);
    try {
      await repo.createTrip({
        date,
        vehicleId,
        trailerId: trailerId || undefined,
        driverId: driverId || undefined,
        contactId: contactId || undefined,
        origin: origin.trim(),
        destination: destination.trim(),
        cargo: cargo.trim() || undefined,
        weightTon,
        km,
        startKm,
        endKm,
        pricingKind,
        unitPrice: unitFreightRate || undefined,
        breakEvenFreight: breakEven.breakEvenFreight,
        estimatedFuelCost: breakEven.estimatedFuelCost,
        estimatedTollCost: breakEven.estimatedTollCost,
        estimatedDriverPay: breakEven.estimatedDriverPay,
        estimatedTireWearCost: breakEven.estimatedWearCost,
        freight: effectiveFreight,
        currency,
        fxRate,
        vatIncluded,
        vatRate,
        vatWithholding: vatWithholding as any,
        commission,
        status,
        uetdsReported,
      });
      navigate('/seferler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/seferler')}
            className="p-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-500" />
              {id ? 'Sefer Düzenle' : 'Yeni Sefer & Navlun Kaydı'}
            </h1>
            <p className="text-xs text-slate-500">
              4 modlu navlun hesaplama, kantar fire payı ve canlı başabaş analizi
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant={isListening ? 'danger' : 'outline'}
          size="sm"
          onClick={startVoiceInput}
          className="border-dashed"
        >
          <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : 'text-brand-500'}`} />
          {isListening ? 'Dinleniyor...' : 'Sesle Doldur'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Fields (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Güzergah & Yük Kartı */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-500" />
              Güzergah ve Kilometre Üçgeni
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Çıkış Yeri (İl / Fabrika) *"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                onBlur={handleRouteBlur}
                placeholder="Örn: Gebze"
                required
              />
              <Input
                label="Varış Yeri (İl / Liman) *"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onBlur={handleRouteBlur}
                placeholder="Örn: İskenderun Liman"
                required
              />
            </div>

            {/* Otomatik KM Üçgeni */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Çıkış Sayaç KM
                </label>
                <input
                  type="number"
                  value={startKm || ''}
                  onChange={(e) => handleStartKmChange(parseFloat(e.target.value) || 0)}
                  placeholder="284500"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tahmini Mesafe (KM) *
                </label>
                <input
                  type="number"
                  value={km || ''}
                  onChange={(e) => handleDistanceChange(parseFloat(e.target.value) || 0)}
                  placeholder="980"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-mono text-xs font-bold text-brand-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Varış Sayaç KM (Otomatik)
                </label>
                <input
                  type="number"
                  value={endKm || ''}
                  onChange={(e) => handleEndKmChange(parseFloat(e.target.value) || 0)}
                  placeholder="285480"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Input
                label="Yük Cinsi"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Örn: Rulo Sac, Çimento, Cam"
              />
              <Input
                label="Yük Ağırlığı (Ton)"
                type="number"
                step="0.1"
                value={weightTon || ''}
                onChange={(e) => setWeightTon(parseFloat(e.target.value) || undefined)}
                placeholder="Örn: 24.5"
              />
            </div>
          </Card>

          {/* Navlun Fiyatlama Modu Kartı */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand-500" />
              4 Modlu Navlun Fiyatlama
            </h3>

            {/* Mod Seçici */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { id: 'sabit', label: 'Sabit Tutar' },
                { id: 'ton', label: 'Ton Başı (₺/Ton)' },
                { id: 'km', label: 'KM Başı (₺/KM)' },
                { id: 'palet', label: 'Adet / Palet' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPricingKind(m.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    pricingKind === m.id
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {pricingKind !== 'sabit' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <Input
                  label={
                    pricingKind === 'ton'
                      ? 'Ton Başı Birim Fiyat (₺/Ton) *'
                      : pricingKind === 'km'
                      ? 'KM Başı Birim Fiyat (₺/KM) *'
                      : 'Palet Başı Birim Fiyat (₺) *'
                  }
                  type="number"
                  value={unitFreightRate || ''}
                  onChange={(e) => setUnitFreightRate(parseFloat(e.target.value) || 0)}
                  placeholder="Örn: 1850"
                  required
                />
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] text-slate-500 block">Hesaplanan Net Navlun:</span>
                  <span className="text-lg font-black text-brand-600 dark:text-brand-400 tabular-nums">
                    {formatMoney(dynamicFreightResult.freightNet)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {dynamicFreightResult.calculationBreakdown}
                  </span>
                </div>
              </div>
            )}

            {pricingKind === 'sabit' && (
              <CurrencyInput
                label="Götürü Sabit Navlun Tutarı (Net) *"
                value={freight}
                currency="TRY"
                onChange={(val) => setFreight(val.amount)}
              />
            )}

            {/* KDV & Tevkifat Ayarları */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Select
                label="KDV Oranı *"
                value={vatRate}
                onChange={(e) => setVatRate(parseInt(e.target.value))}
              >
                <option value={20}>%20 Standart KDV</option>
                <option value={10}>%10 İndirimli KDV</option>
                <option value={0}>%0 KDV Muaf</option>
              </Select>

              <Select
                label="KDV Tevkifatı *"
                value={vatWithholding}
                onChange={(e) => setVatWithholding(e.target.value)}
              >
                {WITHHOLDING_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </Select>

              <Input
                label="Komisyoncu Payı (₺)"
                type="number"
                value={commission || ''}
                onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                placeholder="0 ₺"
              />
            </div>
          </Card>

          {/* Araç, Şoför, Müşteri Kartı */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-500" />
              Filo ve Cari Tanımları
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Çekici / Kamyon *"
                value={vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                required
              >
                <option value="">Araç Seçin</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate} ({v.type.toUpperCase()})
                  </option>
                ))}
              </Select>

              <Select
                label="Görevli Şoför"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Müşteri / Cari Kart *"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
              >
                <option value="">Müşteri Seçin</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city || 'TR'})
                  </option>
                ))}
              </Select>

              <Input
                label="İrsaliye Numarası"
                value={waybillNo}
                onChange={(e) => setWaybillNo(e.target.value)}
                placeholder="Örn: IRS-2026-0842"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Live Break-Even Simulator & Feasibility Compass (1 Col) */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4 border-2 border-brand-500/20 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-500" />
                Canlı Sefer Pusulası
              </span>
              <Badge
                variant={
                  breakEven.status === 'cok_karli' || breakEven.status === 'karli'
                    ? 'success'
                    : breakEven.status === 'basabas'
                    ? 'warning'
                    : 'danger'
                }
              >
                {breakEven.status === 'cok_karli'
                  ? 'YÜKSEK KÂRLI'
                  : breakEven.status === 'karli'
                  ? 'KÂRLI'
                  : breakEven.status === 'basabas'
                  ? 'BAŞABAŞ'
                  : 'ZARAR RİSKİ'}
              </Badge>
            </div>

            {/* Net Profit Card */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1">
              <span className="text-[11px] text-slate-400 block">Öngörülen Net Sefer Kârı</span>
              <div className="text-2xl font-black text-emerald-400 tabular-nums">
                {formatMoney(breakEven.projectedNetProfit)}
              </div>
              <span className="text-xs text-slate-400">
                Kâr Marjı: <strong>%{breakEven.projectedProfitMarginPct}</strong>
              </span>
            </div>

            {/* Direct Cost Breakdown */}
            <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Öngörülen Direkt Giderler:
              </span>
              <div className="flex justify-between text-slate-500">
                <span>Tahmini Mazot ({breakEven.estimatedFuelCost ? `${Math.round(breakEven.estimatedFuelCost / 43.5)} LT` : ''}):</span>
                <span className="font-mono">{formatMoney(breakEven.estimatedFuelCost)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Köprü & Otoyol HGS:</span>
                <span className="font-mono">{formatMoney(breakEven.estimatedTollCost)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Şoför Harcırah + KM Primi:</span>
                <span className="font-mono">{formatMoney(breakEven.estimatedDriverPay)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Lastik & Bakım Payı (₺2.40/km):</span>
                <span className="font-mono">{formatMoney(breakEven.estimatedWearCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800 pt-1">
                <span>Toplam Direkt Maliyet:</span>
                <span className="font-mono">{formatMoney(breakEven.totalDirectCost)}</span>
              </div>
            </div>

            {/* Minimum Acceptance Quote */}
            <div className="p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/50 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Başabaş Navlun (0 Kâr):</span>
                <span className="font-bold text-slate-900 font-mono">{formatMoney(breakEven.breakEvenFreight)}</span>
              </div>
              <div className="flex justify-between text-brand-700 font-bold">
                <span>%25 Marjlı Teklif:</span>
                <span className="font-mono">{formatMoney(breakEven.recommendedQuoteFreight)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              {breakEven.adviceMessage}
            </p>
          </Card>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 py-3 font-black shadow-lg shadow-brand-500/25"
          >
            {loading ? 'Kaydediliyor...' : 'Seferi Kaydet'}
          </Button>
        </div>
      </form>
    </div>
  );
};
