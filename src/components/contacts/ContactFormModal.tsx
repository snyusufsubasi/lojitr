import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { isValidVKN, isValidTCKN, isValidTurkishIBAN } from '@/domain/math/trValidators';
import type { Contact, ContactKind } from '@/domain/types';

export interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Omit<Contact, 'id'>) => Promise<void>;
  initialData?: Contact;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [kind, setKind] = useState<ContactKind>(initialData?.kind || 'musteri');
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [taxOffice, setTaxOffice] = useState(initialData?.taxOffice || '');
  const [taxNo, setTaxNo] = useState(initialData?.taxNo || '');
  const [iban, setIban] = useState(initialData?.iban || '');
  const [dueDays, setDueDays] = useState<number | undefined>(initialData?.dueDays || 30);
  const [creditLimit, setCreditLimit] = useState<number | undefined>(initialData?.creditLimit || 250000);
  const [loading, setLoading] = useState(false);

  // Live Validations
  const isTaxValid = taxNo.length === 10 ? isValidVKN(taxNo) : taxNo.length === 11 ? isValidTCKN(taxNo) : null;
  const isIbanValid = iban.trim().length >= 26 ? isValidTurkishIBAN(iban) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Lütfen cari unvanını girin.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        kind,
        contactPerson: contactPerson.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        taxOffice: taxOffice.trim() || undefined,
        taxNo: taxNo.trim() || undefined,
        iban: iban.trim() || undefined,
        dueDays,
        creditLimit,
        taxNumberValidated: isTaxValid === true,
        ibanValidated: isIbanValid === true,
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
      title={initialData ? 'Cari Kartı Düzenle' : 'Yeni Cari Kart Aç'}
      description="Müşteri, tedarikçi veya komisyoncu için vergi no, risk limiti ve vade tanımı"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Ticari Unvan / Firma Adı *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn: Arçelik Dağıtım A.Ş."
            required
          />
          <Select
            label="Cari Türü *"
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
          >
            <option value="musteri">Müşteri (Yük Veren / Alacaklıyız)</option>
            <option value="tedarikci">Tedarikçi (Mazot, Lastik, Servis)</option>
            <option value="komisyoncu">Komisyoncu / Broker</option>
            <option value="taseron">Taşeron Nakliyeci (Dış Araç)</option>
            <option value="diger">Diğer</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="İlgili Kişi"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="Örn: Mehmet Bey (Sevkiyat)"
          />
          <Input
            label="Telefon Numarası"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+90 532 111 22 33"
          />
          <Input
            label="Şehir / İlçe"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Kocaeli / Gebze"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Vergi Dairesi"
            value={taxOffice}
            onChange={(e) => setTaxOffice(e.target.value)}
            placeholder="İlyasbey"
          />
          <div>
            <Input
              label="Vergi No / TCKN"
              value={taxNo}
              onChange={(e) => setTaxNo(e.target.value)}
              placeholder="10 haneli VKN veya 11 haneli TCKN"
            />
            {isTaxValid !== null && (
              <span className={`text-[10px] font-bold ${isTaxValid ? 'text-emerald-600' : 'text-rose-500'}`}>
                {isTaxValid ? '✓ GİB Algoritmasına Göre Geçerli VKN/TCKN' : '✗ Geçersiz Vergi Kimlik Numarası'}
              </span>
            )}
          </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Standart Vade (Gün)"
            type="number"
            value={dueDays || ''}
            onChange={(e) => setDueDays(parseInt(e.target.value) || undefined)}
            placeholder="30"
          />
          <Input
            label="Kredi Risk Limiti (₺)"
            type="number"
            value={creditLimit || ''}
            onChange={(e) => setCreditLimit(parseInt(e.target.value) || undefined)}
            placeholder="250000"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Cari Kartı Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};