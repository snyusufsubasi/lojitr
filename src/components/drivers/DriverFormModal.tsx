import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { isValidTurkishIBAN } from '@/domain/math/trValidators';
import type { Driver } from '@/domain/types';

export interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (driver: Omit<Driver, 'id'>) => Promise<void>;
  initialData?: Driver;
}

export const DriverFormModal: React.FC<DriverFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [iban, setIban] = useState(initialData?.iban || '');
  const [salary, setSalary] = useState<number | undefined>(initialData?.salary || 42000);
  const [perDiem, setPerDiem] = useState<number | undefined>(initialData?.perDiem || 1500);
  const [kmRate, setKmRate] = useState<number | undefined>(initialData?.kmRate || 2.0);
  const [srcExpiry, setSrcExpiry] = useState(initialData?.srcExpiry || '');
  const [licenseExpiry, setLicenseExpiry] = useState(initialData?.licenseExpiry || '');
  const [loading, setLoading] = useState(false);

  const isIbanValid = iban.trim().length >= 26 ? isValidTurkishIBAN(iban) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Lütfen şoför adını girin.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        phone: phone.trim() || undefined,
        iban: iban.trim() || undefined,
        salary,
        perDiem,
        kmRate,
        kmMode: 'trip',
        tripCommissionPct: 0,
        srcExpiry: srcExpiry || undefined,
        licenseExpiry: licenseExpiry || undefined,
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
      title={initialData ? 'Şoför Bilgilerini Düzenle' : 'Yeni Şoför Kartı Aç'}
      description="Sabit maaş, sefer harcırahı, KM primi ve ehliyet/SRC süreleri"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Şoför Adı Soyadı *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn: Ahmet Yılmaz"
            required
          />
          <Input
            label="Telefon Numarası"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+90 532 111 22 33"
          />
        </div>

        <div>
          <Input
            label="Banka IBAN Numarası"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="TR00 0000 0000 0000 0000 0000 00"
          />
          {isIbanValid !== null && (
            <span className={`text-[10px] font-bold ${isIbanValid ? 'text-emerald-600' : 'text-rose-500'}`}>
              {isIbanValid ? '✓ Geçerli TR IBAN Formatı' : '✗ Hatalı IBAN kontrol hanesi'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Aylık Sabit Maaş (₺)"
            type="number"
            value={salary || ''}
            onChange={(e) => setSalary(parseFloat(e.target.value) || undefined)}
            placeholder="42000"
          />
          <Input
            label="Sefer Harcırahı (₺)"
            type="number"
            value={perDiem || ''}
            onChange={(e) => setPerDiem(parseFloat(e.target.value) || undefined)}
            placeholder="1500"
          />
          <Input
            label="KM Başı Prim (₺/km)"
            type="number"
            step="0.1"
            value={kmRate || ''}
            onChange={(e) => setKmRate(parseFloat(e.target.value) || undefined)}
            placeholder="2.0"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="SRC Belgesi Bitiş Tarihi"
            type="date"
            value={srcExpiry}
            onChange={(e) => setSrcExpiry(e.target.value)}
          />
          <Input
            label="Ehliyet / Psikoteknik Bitiş Tarihi"
            type="date"
            value={licenseExpiry}
            onChange={(e) => setLicenseExpiry(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Şoförü Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};