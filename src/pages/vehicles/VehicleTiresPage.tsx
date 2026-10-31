import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Disc, AlertTriangle, CheckCircle2, RotateCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface TireItem {
  pos: string;
  label: string;
  brand: string;
  size: string;
  treadMm: number;
  totalKm: number;
}

export const VehicleTiresPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock tire layout for 4x2 truck + spare
  const [tires, setTires] = useState<TireItem[]>([
    { pos: 'on_sol', label: 'Ön Sol', brand: 'Michelin X Multi', size: '315/80 R22.5', treadMm: 7.8, totalKm: 84000 },
    { pos: 'on_sag', label: 'Ön Sağ', brand: 'Michelin X Multi', size: '315/80 R22.5', treadMm: 7.5, totalKm: 84000 },
    { pos: 'ceker_sol_dis', label: 'Çeker Sol Dış', brand: 'Bridgestone Duravis', size: '315/80 R22.5', treadMm: 4.2, totalKm: 142000 },
    { pos: 'ceker_sol_ic', label: 'Çeker Sol İç', brand: 'Bridgestone Duravis', size: '315/80 R22.5', treadMm: 2.8, totalKm: 165000 }, // Critical < 3.0mm
    { pos: 'ceker_sag_ic', label: 'Çeker Sağ İç', brand: 'Bridgestone Duravis', size: '315/80 R22.5', treadMm: 3.8, totalKm: 154000 }, // Warning 3-4.5mm
    { pos: 'ceker_sag_dis', label: 'Çeker Sağ Dış', brand: 'Bridgestone Duravis', size: '315/80 R22.5', treadMm: 4.5, totalKm: 142000 },
    { pos: 'stepne', label: 'Stepne / Yedek', brand: 'Lassa Maxiways', size: '315/80 R22.5', treadMm: 11.0, totalKm: 12000 },
  ]);

  const [selectedTire, setSelectedTire] = useState<TireItem | null>(null);
  const [newMm, setNewMm] = useState<number>(0);

  const getTreadColor = (mm: number) => {
    if (mm <= 3.0) return 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
    if (mm <= 4.5) return 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
    return 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
  };

  const handleUpdateMm = () => {
    if (!selectedTire || newMm <= 0) return;
    setTires((prev) =>
      prev.map((t) => (t.pos === selectedTire.pos ? { ...t, treadMm: newMm } : t))
    );
    setSelectedTire(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/araclar')}
          className="p-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Disc className="w-5 h-5 text-brand-500" />
            Görsel Lastik Şasisi & Diş Derinliği Haritası
          </h1>
          <p className="text-xs text-slate-500">
            Kuşbakışı şasi üzerinde lastik konumları, diş ölçümleri ve rotasyon takibi
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          Diş Derinliği Uyarı Seviyeleri:
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>İyi Durumda (&gt; 4.5 mm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Yakında Değişim (3.0–4.5 mm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span>Kritik Aşınma (≤ 3.0 mm)</span>
          </div>
        </div>
      </div>

      {/* Chassis Top-Down Blueprint */}
      <Card className="p-8 flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800">
        <div className="relative w-80 max-w-full py-8 flex flex-col items-center">
          {/* Truck Front Cabin Indicator */}
          <div className="w-48 h-8 rounded-t-2xl bg-slate-300 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-widest">
            Ön Kısım (Kabin)
          </div>

          {/* Axle 1: Front Axle (Steer) */}
          <div className="w-full flex items-center justify-between mb-16">
            {/* Front Left */}
            {(() => {
              const t = tires.find((x) => x.pos === 'on_sol')!;
              return (
                <button
                  onClick={() => {
                    setSelectedTire(t);
                    setNewMm(t.treadMm);
                  }}
                  className={`w-28 p-2 rounded-xl border-2 text-center transition-all hover:scale-105 shadow-sm ${getTreadColor(
                    t.treadMm
                  )}`}
                >
                  <span className="text-[10px] font-bold block">{t.label}</span>
                  <span className="text-sm font-black tabular-nums">{t.treadMm} mm</span>
                </button>
              );
            })()}

            {/* Steer Axle Bar */}
            <div className="flex-1 h-3 bg-slate-400 dark:bg-slate-700 mx-2 rounded" />

            {/* Front Right */}
            {(() => {
              const t = tires.find((x) => x.pos === 'on_sag')!;
              return (
                <button
                  onClick={() => {
                    setSelectedTire(t);
                    setNewMm(t.treadMm);
                  }}
                  className={`w-28 p-2 rounded-xl border-2 text-center transition-all hover:scale-105 shadow-sm ${getTreadColor(
                    t.treadMm
                  )}`}
                >
                  <span className="text-[10px] font-bold block">{t.label}</span>
                  <span className="text-sm font-black tabular-nums">{t.treadMm} mm</span>
                </button>
              );
            })()}
          </div>

          {/* Axle 2: Drive Axle (Dual Wheels on each side) */}
          <div className="w-full flex items-center justify-between mb-8">
            {/* Left Dual */}
            <div className="flex gap-1.5">
              {['ceker_sol_dis', 'ceker_sol_ic'].map((pos) => {
                const t = tires.find((x) => x.pos === pos)!;
                return (
                  <button
                    key={pos}
                    onClick={() => {
                      setSelectedTire(t);
                      setNewMm(t.treadMm);
                    }}
                    className={`w-16 p-2 rounded-xl border-2 text-center transition-all hover:scale-105 shadow-sm ${getTreadColor(
                      t.treadMm
                    )}`}
                  >
                    <span className="text-[9px] font-bold block truncate">{t.pos.includes('dis') ? 'Dış' : 'İç'}</span>
                    <span className="text-xs font-black tabular-nums">{t.treadMm} mm</span>
                  </button>
                );
              })}
            </div>

            {/* Drive Axle Differential */}
            <div className="flex-1 h-4 bg-slate-400 dark:bg-slate-700 mx-2 rounded flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-slate-600 dark:bg-slate-500" />
            </div>

            {/* Right Dual */}
            <div className="flex gap-1.5">
              {['ceker_sag_ic', 'ceker_sag_dis'].map((pos) => {
                const t = tires.find((x) => x.pos === pos)!;
                return (
                  <button
                    key={pos}
                    onClick={() => {
                      setSelectedTire(t);
                      setNewMm(t.treadMm);
                    }}
                    className={`w-16 p-2 rounded-xl border-2 text-center transition-all hover:scale-105 shadow-sm ${getTreadColor(
                      t.treadMm
                    )}`}
                  >
                    <span className="text-[9px] font-bold block truncate">{t.pos.includes('ic') ? 'İç' : 'Dış'}</span>
                    <span className="text-xs font-black tabular-nums">{t.treadMm} mm</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spare Tire */}
          <div className="mt-6 pt-4 border-t border-slate-300 dark:border-slate-800 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Stepne:</span>
            {(() => {
              const t = tires.find((x) => x.pos === 'stepne')!;
              return (
                <button
                  onClick={() => {
                    setSelectedTire(t);
                    setNewMm(t.treadMm);
                  }}
                  className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold ${getTreadColor(
                    t.treadMm
                  )}`}
                >
                  {t.brand} · {t.treadMm} mm
                </button>
              );
            })()}
          </div>
        </div>
      </Card>

      {/* Edit Tire Measurement Modal */}
      {selectedTire && (
        <Modal
          isOpen={Boolean(selectedTire)}
          onClose={() => setSelectedTire(null)}
          title={`${selectedTire.label} Lastik Detayı`}
          description={`${selectedTire.brand} (${selectedTire.size})`}
          maxWidth="sm"
        >
          <div className="space-y-4 pt-2">
            <div className="space-y-1 text-xs text-slate-500">
              <p>Toplam Yapılan KM: <strong>{selectedTire.totalKm.toLocaleString('tr-TR')} KM</strong></p>
            </div>

            <Input
              label="Güncel Diş Derinliği (mm) *"
              type="number"
              step="0.1"
              value={newMm}
              onChange={(e) => setNewMm(parseFloat(e.target.value) || 0)}
              required
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setSelectedTire(null)}>
                Kapat
              </Button>
              <Button variant="primary" onClick={handleUpdateMm}>
                Ölçümü Kaydet
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
