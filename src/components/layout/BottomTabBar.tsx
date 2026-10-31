import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, TrendingDown, Plus, Wallet, Car } from 'lucide-react';
import { clsx } from 'clsx';

export interface BottomTabBarProps {
  onOpenQuickAction: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ onOpenQuickAction }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 flex items-center justify-around px-2">
      <NavLink
        to="/"
        className={({ isActive }) =>
          clsx(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            isActive ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500'
          )
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Bugün</span>
      </NavLink>

      <NavLink
        to="/seferler"
        className={({ isActive }) =>
          clsx(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            isActive ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500'
          )
        }
      >
        <Truck className="w-5 h-5" />
        <span>Seferler</span>
      </NavLink>

      {/* Floating Center Plus Action */}
      <button
        onClick={onOpenQuickAction}
        className="relative -top-3 w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-cyanBrand-500 text-white shadow-lg shadow-brand-500/30 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      <NavLink
        to="/masraflar"
        className={({ isActive }) =>
          clsx(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            isActive ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500'
          )
        }
      >
        <TrendingDown className="w-5 h-5" />
        <span>Masraflar</span>
      </NavLink>

      <NavLink
        to="/araclar"
        className={({ isActive }) =>
          clsx(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            isActive ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500'
          )
        }
      >
        <Car className="w-5 h-5" />
        <span>Araçlar</span>
      </NavLink>
    </nav>
  );
};
