import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Building,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { computeContactBalances } from '@/domain/math/contactLedger';
import { formatMoney, isoToday } from '@/lib/formatters';
import { trIncludes } from '@/lib/trSearch';
import { ContactFormModal } from '@/components/contacts/ContactFormModal';
import { QuickPaymentModal } from '@/components/contacts/QuickPaymentModal';
import type { Contact, MoneyAccount } from '@/domain/types';

export const ContactsListPage: React.FC = () => {
  const repo = useRepository();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [moneyAccounts, setMoneyAccounts] = useState<MoneyAccount[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'alacak' | 'borc'>('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentContact, setPaymentContact] = useState<Contact | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [c, t, e, p, ch, accs] = await Promise.all([
      repo.listContacts(),
      repo.listTrips(),
      repo.listExpenses(),
      repo.listPayments(),
      repo.listChecks(),
      repo.listMoneyAccounts(),
    ]);
    setContacts(c);
    setMoneyAccounts(accs);

    const computed = computeContactBalances(c, t, e, p, ch, [], isoToday());
    setBalances(computed);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateContact = async (contactData: Omit<Contact, 'id'>) => {
    await repo.createContact(contactData);
    setIsCreateOpen(false);
    loadData();
  };

  const handleSavePayment = async (paymentData: any) => {
    await repo.createPayment(paymentData);
    setPaymentContact(null);
    loadData();
  };

  const filtered = balances.filter((b) => {
    const matchSearch =
      trIncludes(b.contact.name, search) ||
      trIncludes(b.contact.contactPerson, search) ||
      trIncludes(b.contact.city, search);

    if (!matchSearch) return false;
    if (tab === 'alacak') return b.receivable > 0.01;
    if (tab === 'borc') return b.payable > 0.01;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" />
            Cari Hesaplar & Müşteri Yönetimi
          </h1>
          <p className="text-xs text-slate-500">
            Müşteri, tedarikçi, komisyoncu ve taşeron bakiyeleri ile çift defterli cari ekstreler
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          className="bg-brand-600 hover:bg-brand-500"
        >
          <Plus className="w-4 h-4" />
          Yeni Cari Kart
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'Tüm Cariler' },
            { id: 'alacak', label: 'Alacaklı Olduğumuz (Müşteriler)' },
            { id: 'borc', label: 'Borçlu Olduğumuz (Tedarikçiler)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                tab === t.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari adı, şehir veya yetkili ara..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((b) => (
          <Card
            key={b.contact.id}
            onClick={() => navigate(`/musteriler/${b.contact.id}`)}
            className="cursor-pointer hover:border-brand-500/50 hover:shadow-md transition-all p-4 space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                    {b.contact.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {b.contact.contactPerson || 'Yetkili Belirtilmedi'} • {b.contact.city || 'Şehir Yok'}
                  </span>
                </div>
                <Badge variant={b.contact.kind === 'musteri' ? 'brand' : 'slate'} size="sm">
                  {b.contact.kind.toUpperCase()}
                </Badge>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Alacak Bakiyesi:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatMoney(b.receivable)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Verecek Bakiyesi:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    {formatMoney(b.payable)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setPaymentContact(b.contact);
                }}
                className="text-xs w-full flex items-center justify-center gap-1.5 hover:border-brand-500/50"
              >
                <CreditCard className="w-3.5 h-3.5 text-brand-500" />
                Hızlı Tahsilat / Ödeme
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* New Contact Modal */}
      <ContactFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateContact}
      />

      {/* Quick Payment Modal */}
      {paymentContact && (
        <QuickPaymentModal
          isOpen={true}
          onClose={() => setPaymentContact(null)}
          contact={paymentContact}
          moneyAccounts={moneyAccounts}
          onSave={handleSavePayment}
          defaultKind={paymentContact.kind === 'musteri' ? 'tahsilat' : 'odeme'}
        />
      )}
    </div>
  );
};
