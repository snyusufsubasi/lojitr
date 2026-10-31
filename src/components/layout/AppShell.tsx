import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomTabBar } from './BottomTabBar';
import { CommandPalette } from './CommandPalette';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Truck, TrendingDown, Receipt } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <Topbar
          onOpenCommandPalette={() => setCmdOpen(true)}
          onOpenQuickTrip={() => navigate('/seferler/yeni')}
          onOpenQuickExpense={() => navigate('/masraflar/yeni')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <BottomTabBar onOpenQuickAction={() => setQuickActionModal(true)} />
      </div>

      {/* Command Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Quick Mobile Action Modal */}
      <Modal
        isOpen={quickActionModal}
        onClose={() => setQuickActionModal(false)}
        title="Hızlı İşlem Ekle"
        description="Ne yapmak istiyorsunuz?"
        maxWidth="sm"
      >
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              setQuickActionModal(false);
              navigate('/seferler/yeni');
            }}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 flex flex-col items-center justify-center gap-2 hover:bg-brand-100/50 transition-colors"
          >
            <Truck className="w-6 h-6" />
            <span className="text-xs font-bold">Yeni Sefer</span>
          </button>

          <button
            onClick={() => {
              setQuickActionModal(false);
              navigate('/masraflar/yeni');
            }}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center gap-2 hover:bg-rose-100/50 transition-colors"
          >
            <Receipt className="w-6 h-6" />
            <span className="text-xs font-bold">Fiş / Masraf</span>
          </button>
        </div>
      </Modal>
    </div>
  );
};
