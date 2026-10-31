import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Car, Fuel } from 'lucide-react';
import type { Vehicle, VehicleType, VehicleOwnership, AxleConfigCode } from '@/domain/types';

export interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  initialData?: Vehicle;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [plate, setPlate] = useState(initialData?.plate || '');
  const [type, setType] = useState<VehicleType>(initialData?.type || 'tir');
  const [ownership, setOwnership] = useState<VehicleOwnership>(initialData?.ownership || 'oz');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [year, setYear] = useState<number | undefined>(initialData?.year || 2023);
  const [km, setKm] = useState<number | undefined>(initialData?.km || 280000);
  const [avgFuelPer100Km, setAvgFuelPer100Km] = useState<number | undefined>(initialData?.avgFuelPer100Km || 29.5);
  const [tankCapacityLitres, setTankCapacityLitres] = useState<number | undefined>(initialData?.tankCapacityLitres || 600);
  const [axleConfig, setAxleConfig] = useState<AxleConfigCode>(initialData?.axleConfig || '4x2');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim()) {
      alert('Lütfen araç plakasını girin.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        plate: plate.trim().toUpperCase(),
        type,
        ownership,
        brand: brand.trim() || undefined,
        year,
        km,
        avgFuelPer100Km,
        tankCapacityLitres,
        axleConfig,
        hasSpare: true,
        active: true,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Araç Düzenle' : 'Yeni Çekici / Kamyon / Dorse Ekle'}
      description="Filo envanterine plaka, sayaç, depo hacmi ve aks dizilimini tanımlayın"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Araç Plakası *"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="34 KYA 101"
            required
          />
          <Input
            label="Marka & Model"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Mercedes-Benz Actros 1848 LS"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Araç Türü *"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="tir">Çekici (TIR)</option>
            <option value="kamyon">Kamyon</option>
            <option value="kamyonet">Kamyonet</option>
            <option value="dorse">Dorse / Yarı Römork</option>
          </Select>

          <Select
            label="Mülkiyet Durumu *"
            value={ownership}
            onChange={(e) => setOwnership(e.target.value as any)}
          >
            <option value="oz">Özmal Şirket Aracı</option>
            <option value="kiralik">Kiralık Filo</option>
            <option value="dis">Taşeron / Dış Araç</option>
          </Select>

          <Input
            label="Model Yılı"
            type="number"
            value={year || ''}
            onChange={(e) => setYear(parseInt(e.target.value) || undefined)}
            placeholder="2023"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Güncel Sayaç KM *"
            type="number"
            value={km || ''}
            onChange={(e) => setKm(parseInt(e.target.value) || undefined)}
            placeholder="284500"
            required
          />

          <Input
            label="Hedef Tüketim (LT/100km)"
            type="number"
            step="0.1"
            value={avgFuelPer100Km || ''}
            onChange={(e) => setAvgFuelPer100Km(parseFloat(e.target.value) || undefined)}
            placeholder="29.5"
          />

          <Input
            label="Depo Hacmi (Litre)"
            type="number"
            value={tankCapacityLitres || ''}
            onChange={(e) => setTankCapacityLitres(parseInt(e.target.value) || undefined)}
            placeholder="600"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Aracı Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};