import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { isoToday } from '@/lib/formatters';
import type { Contact, MoneyAccount, PaymentKind, PaymentMethod } from '@/domain/types';

export interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  moneyAccounts: MoneyAccount[];
  onSave: (payment: any) => Promise<void>;
  defaultKind?: 'tahsilat' | 'odeme';
}

export const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({
  isOpen,
  onClose,
  contact,
  moneyAccounts,
  onSave,
  defaultKind = 'tahsilat',
}) => {
  const [kind, setKind] = useState<PaymentKind>(defaultKind);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(isoToday());
  const [method, setMethod] = useState<PaymentMethod>('havale');
  const [moneyAccountId, setMoneyAccountId] = useState(moneyAccounts[0]?.id || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Lütfen geçerli bir tutar girin.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        date,
        kind,
        amount,
        method,
        moneyAccountId: moneyAccountId || undefined,
        contactId: contact.id,
        note: note.trim() || `${contact.name} - ${kind === 'tahsilat' ? 'Cari Tahsilat' : 'Tedarikçi Ödemesi'}`,
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
      title={`${contact.name} - ${kind === 'tahsilat' ? 'Hızlı Tahsilat Al' : 'Hızlı Ödeme Yap'}`}
      description="Kasa veya banka hesabına anında tek tıkla cari işlem işleyin"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setKind('tahsilat')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              kind === 'tahsilat' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Tahsilat Al (+)
          </button>
          <button
            type="button"
            onClick={() => setKind('odeme')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              kind === 'odeme' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Ödeme Yap (-)
          </button>
        </div>

        <CurrencyInput
          label="İşlem Tutarı *"
          value={amount}
          currency="TRY"
          onChange={(val) => setAmount(val.amount)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="İşlem Tarihi *"
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
            <option value="havale">Banka Havale / EFT / FAST</option>
            <option value="nakit">Nakit Elden</option>
            <option value="kredi_karti">Kredi Kartı / Mail Order</option>
            <option value="mahsup">Cari Mahsup</option>
          </Select>
        </div>

        <Select
          label="İlgili Kasa / Banka Hesabı *"
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
          label="Açıklama / Dekont No"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Örn: 24.5 Ton sac navlun tahsilatı"
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            İptal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className={kind === 'tahsilat' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}
          >
            {loading ? 'İşleniyor...' : kind === 'tahsilat' ? 'Tahsilatı Onayla' : 'Ödemeyi Onayla'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};