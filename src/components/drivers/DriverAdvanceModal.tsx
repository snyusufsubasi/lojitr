import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { isoToday } from '@/lib/formatters';
import type { Driver, MoneyAccount } from '@/domain/types';

export interface DriverAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver;
  moneyAccounts: MoneyAccount[];
  onSave: (payment: any) => Promise<void>;
}

export const DriverAdvanceModal: React.FC<DriverAdvanceModalProps> = ({
  isOpen,
  onClose,
  driver,
  moneyAccounts,
  onSave,
}) => {
  const [amount, setAmount] = useState(3000);
  const [date, setDate] = useState(isoToday());
  const [method, setMethod] = useState<'nakit' | 'havale'>('nakit');
  const [moneyAccountId, setMoneyAccountId] = useState(moneyAccounts[0]?.id || '');
  const [note, setNote] = useState('Sefer yol avansı (Kumanya ve acil harcama)');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Lütfen geçerli bir avans tutarı girin.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        date,
        kind: 'avans',
        amount,
        method,
        moneyAccountId: moneyAccountId || undefined,
        driverId: driver.id,
        note: note.trim() || `${driver.name} - Yol Avansı`,
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
      title={`${driver.name} - Şoför Avansı Ver`}
      description="Kasadan veya bankadan verilen avans hakediş pusulasından otomatik düşülür"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <CurrencyInput
          label="Avans Tutarı *"
          value={amount}
          currency="TRY"
          onChange={(val) => setAmount(val.amount)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Ödeme Tarihi *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Select
            label="Ödeme Yöntemi *"
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
          >
            <option value="nakit">Nakit Elden Kasa</option>
            <option value="havale">Banka Hesabına Havale / FAST</option>
          </Select>
        </div>

        <Select
          label="Çıkış Yapılacak Hesap *"
          value={moneyAccountId}
          onChange={(e) => setMoneyAccountId(e.target.value)}
          required
        >
          {moneyAccounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.kind.toUpperCase()})
            </option>
          ))}
        </Select>

        <Input
          label="Açıklama"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Örn: Mersin seferi kumanya ve otel avansı"
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="bg-amber-600 hover:bg-amber-500">
            {loading ? 'İşleniyor...' : 'Avansı Öde'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};