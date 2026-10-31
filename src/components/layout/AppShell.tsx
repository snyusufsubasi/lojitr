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
      <div className="hidden md:block w-64 shrink-0">
        <Sidebar />
      </div>
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
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
};
