import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  TrendingDown,
  Wallet,
  Users,
  FileText,
  Car,
  UserCheck,
  FileCheck2,
  FolderArchive,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  ChevronDown,
  User,
  LogOut,
  Moon,
  Sun,
  Crown,
} from 'lucide-react';
import { useAuthStore } from '@/domain/store/authStore';
import { clsx } from 'clsx';
import { Badge } from '../ui/Badge';

export const Sidebar: React.FC = () => {
  const { accountName, role, setDemoRole, theme, setTheme, billing, mode } = useAuthStore();

  const navigation = [
    { name: 'Genel Bakış', href: '/', icon: LayoutDashboard },
    { name: 'Seferler', href: '/seferler', icon: Truck },
    { name: 'Masraflar', href: '/masraflar', icon: TrendingDown },
    { name: 'Para & Kasa & Banka', href: '/para', icon: Wallet },
    { name: 'Müşteriler & Cari', href: '/musteriler', icon: Users },
    { name: 'Faturalar', href: '/faturalar', icon: FileText },
    { name: 'Araçlar & Filo', href: '/araclar', icon: Car },
    { name: 'Şoförler & Hakediş', href: '/soforler', icon: UserCheck },
    { name: 'Belge Arşivi', href: '/belgeler', icon: FolderArchive },
    { name: 'Onaylar', href: '/onaylar', icon: FileCheck2 },
    { name: 'Raporlar & Analitik', href: '/raporlar', icon: BarChart3 },
    { name: 'Excel İçe Aktar', href: '/ice-aktar', icon: FileSpreadsheet },
    { name: 'Lisans & Paketler', href: '/lisans', icon: ShieldCheck },
    { name: 'Ayarlar', href: '/ayarlar', icon: Settings },
  ];

  // If role is driver, filter down navigation items
  const activeNav =
    role === 'driver'
      ? navigation.filter((n) =>
          ['Genel Bakış', 'Seferler', 'Masraflar', 'Araçlar & Filo', 'Belge Arşivi'].includes(n.name)
        )
      : navigation;

  return (
    <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="LojiTR" className="w-9 h-9" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Loji<span className="text-brand-500">TR</span>
              </span>
              <Badge variant="brand" size="sm">v2.0</Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[130px]">
              {accountName || 'Filom'}
            </p>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Tema Değiştir"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Switcher in Demo Mode */}
      <div className="px-3 pt-3">
        <div className="bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => setDemoRole('owner')}
            className={clsx(
              'flex-1 py-1 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1',
              role === 'owner' || role === 'manager'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            <Crown className="w-3.5 h-3.5" />
            Yönetici
          </button>
          <button
            onClick={() => setDemoRole('driver')}
            className={clsx(
              'flex-1 py-1 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1',
              role === 'driver'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            <User className="w-3.5 h-3.5" />
            Şoför
          </button>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {activeNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-150',
                  isActive
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Storage & User Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
        {billing && (
          <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-[11px] mb-1 text-slate-500">
              <span className="font-semibold">Depolama</span>
              <span className="tabular-nums font-bold text-slate-700 dark:text-slate-300">
                {billing.storage?.package_gb || 10} GB Kota
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all"
                style={{ width: `${billing.storage?.percent || 15}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
