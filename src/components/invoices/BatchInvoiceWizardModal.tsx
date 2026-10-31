import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatMoney, formatDateShort, isoToday, addDaysIso } from '@/lib/formatters';
import type { Trip, Contact } from '@/domain/types';

export interface BatchInvoiceWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
  contacts: Contact[];
  onComplete: (payload: { contactId: string; tripIds: string[]; invoiceNo: string; issueDate: string; dueDate?: string }) => Promise<void>;
}

export const BatchInvoiceWizardModal: React.FC<BatchInvoiceWizardModalProps> = ({
  isOpen,
  onClose,
  trips,
  contacts,
  onComplete,
}) => {
  const [selectedContactId, setSelectedContactId] = useState(contacts[0]?.id || '');
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
  const [invoiceNo, setInvoiceNo] = useState(`FTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState(isoToday());
  const [dueDate, setDueDate] = useState(addDaysIso(isoToday(), 30));
  const [loading, setLoading] = useState(false);

  // Filter uninvoiced trips for the selected contact
  const uninvoicedTrips = trips.filter(
    (t) => t.contactId === selectedContactId && t.invoiceStatus !== 'kesildi' && t.status !== 'iptal'
  );

  const toggleTrip = (id: string) => {
    setSelectedTripIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedTripIds.length === uninvoicedTrips.length) {
      setSelectedTripIds([]);
    } else {
      setSelectedTripIds(uninvoicedTrips.map((t) => t.id));
    }
  };

  const selectedTrips = uninvoicedTrips.filter((t) => selectedTripIds.includes(t.id));
  const subtotal = selectedTrips.reduce((s, t) => s + t.freight, 0);
  const vatTotal = subtotal * 0.20;
  const withholdingTotal = (vatTotal * 2) / 10;
  const grandTotal = subtotal + vatTotal - withholdingTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTripIds.length === 0) {
      alert('Lütfen faturaya dahil edilecek en az bir sefer seçin.');
      return;
    }
    if (!invoiceNo.trim()) {
      alert('Lütfen fatura numarasını girin.');
      return;
    }

    setLoading(true);
    try {
      await onComplete({
        contactId: selectedContactId,
        tripIds: selectedTripIds,
        invoiceNo: invoiceNo.trim(),
        issueDate,
        dueDate,
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
      title="Seferlerden Toplu Fatura Kesme Sihirbazı"
      description="Faturası kesilmemiş seferleri seçip tek tıkla 2/10 tevkifatlı e-Fatura oluşturun"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fatura Kesilecek Müşteri *
            </label>
            <select
              value={selectedContactId}
              onChange={(e) => {
                setSelectedContactId(e.target.value);
                setSelectedTripIds([]);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold"
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Fatura Seri / Sıra No *"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            placeholder="FTR-2026-0042"
            required
          />

          <Input
            label="Fatura Düzenleme Tarihi *"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
        </div>

        {/* Trips Selection List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Faturası Kesilmemiş Seferler ({uninvoicedTrips.length} Sefer):
            </span>
            {uninvoicedTrips.length > 0 && (
              <button
                type="button"
                onClick={selectAll}
                className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
              >
                {selectedTripIds.length === uninvoicedTrips.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </button>
            )}
          </div>

          {uninvoicedTrips.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
              Bu müşteriye ait faturası kesilmemiş açık sefer bulunmuyor.
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50">
              {uninvoicedTrips.map((t) => {
                const isSelected = selectedTripIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTrip(t.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-brand-600"
                      />
                      <div>
                        <span className="font-bold text-xs block">
                          {t.origin} → {t.destination} ({t.cargo || 'Yük'})
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateShort(t.date)} · İrsaliye: #{t.waybillNo || '---'}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs tabular-nums">
                      {formatMoney(t.freight)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Calculated Totals Summary */}
        {selectedTrips.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Seçilen {selectedTrips.length} Sefer Ara Toplamı:</span>
              <span className="font-mono">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Hesaplanan KDV (%20):</span>
              <span className="font-mono">+{formatMoney(vatTotal)}</span>
            </div>
            <div className="flex justify-between text-rose-400 font-semibold">
              <span>2/10 Tevkifat Kesintisi (-):</span>
              <span className="font-mono">-{formatMoney(withholdingTotal)}</span>
            </div>
            <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-800 text-brand-300">
              <span>ÖDENECEK FATURA TOPLAMI:</span>
              <span className="tabular-nums text-base">{formatMoney(grandTotal)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            İptal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || selectedTripIds.length === 0}
            className="bg-brand-600 hover:bg-brand-500"
          >
            {loading ? 'Fatura Kesiliyor...' : 'Toplu Faturayı Kes & Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};