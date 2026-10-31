import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  ArrowRight,
  Download,
  CheckCircle,
  Clock,
  Printer,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { printInvoiceA4 } from '@/domain/documents/printableEngine';
import { BatchInvoiceWizardModal } from '@/components/invoices/BatchInvoiceWizardModal';
import { formatMoney, formatDateShort } from '@/lib/formatters';
import type { Invoice, Trip, Contact } from '@/domain/types';

export const InvoicesListPage: React.FC = () => {
  const repo = useRepository();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [invs, trps, cnts] = await Promise.all([
      repo.listInvoices(),
      repo.listTrips(),
      repo.listContacts(),
    ]);
    setInvoices(invs);
    setTrips(trps);
    setContacts(cnts);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompleteBatch = async (payload: {
    contactId: string;
    tripIds: string[];
    invoiceNo: string;
    issueDate: string;
    dueDate?: string;
  }) => {
    await repo.createBatchInvoice(payload);
    setIsBatchOpen(false);
    loadData();
  };

  const getContact = (contactId?: string) => {
    return contacts.find((c) => c.id === contactId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-500" />
            Fatura Yönetimi
          </h1>
          <p className="text-xs text-slate-500">
            Giden ve gelen nakliye faturaları, KDV tevkifatlı e-Fatura / e-Arşiv dökümleri
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsBatchOpen(true)}
          className="bg-brand-600 hover:bg-brand-500"
        >
          <Plus className="w-4 h-4" />
          Seferlerden Fatura Kes
        </Button>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {invoices.length === 0 ? (
          <Card className="text-center py-12 text-slate-400 text-xs">
            Kayıtlı fatura bulunamadı.
          </Card>
        ) : (
          invoices.map((inv) => {
            const contact = getContact(inv.contactId);
            return (
              <Card key={inv.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                        {inv.invoiceNo}
                      </span>
                      <Badge variant={inv.status === 'kesildi' ? 'success' : 'slate'} size="sm">
                        {inv.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        Tarih: {formatDateShort(inv.issueDate)}
                      </span>
                      {contact && (
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          • {contact.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Kalemler: {inv.lines.map((l) => l.description).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums block">
                        {formatMoney(inv.total)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Tevkifat: {formatMoney(inv.withholdingTotal)}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => printInvoiceA4(inv, contact)}
                      className="text-xs flex items-center gap-1.5 hover:border-brand-500/50"
                    >
                      <Printer className="w-3.5 h-3.5 text-brand-500" />
                      Yazdır / PDF
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Batch Invoice Wizard Modal */}
      <BatchInvoiceWizardModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        trips={trips}
        contacts={contacts}
        onComplete={handleCompleteBatch}
      />
    </div>
  );
};
