import React, { useState } from 'react';
import { Search, Plus, Bell, Mic, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '@/domain/store/authStore';
import { useNavigate } from 'react-router-dom';

export interface TopbarProps {
  onOpenCommandPalette: () => void;
  onOpenQuickTrip: () => void;
  onOpenQuickExpense: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenCommandPalette,
  onOpenQuickTrip,
  onOpenQuickExpense,
}) => {
  const { user, role, theme, setTheme } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Search Bar / Command Palette Trigger */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs transition-all shadow-sm group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
            <span>Sayfa, plaka, cari veya işlem ara...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <a
          href="/tanitim"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/40 transition-all shadow-sm"
          title="Tanıtım Sayfasını Yeni Sekmede Aç"
        >
          <Globe className="w-3.5 h-3.5 text-brand-500" />
          <span>Tanıtım Sitesi</span>
        </a>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenQuickExpense}
          className="hidden sm:flex border-dashed border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <Plus className="w-3.5 h-3.5" />
          Masraf Ekle
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenQuickTrip}
          className="bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          Yeni Sefer
        </Button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-cyanBrand-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {user?.name?.slice(0, 2).toUpperCase() || 'TR'}
          </div>
        </div>
      </div>
    </header>
  );
};