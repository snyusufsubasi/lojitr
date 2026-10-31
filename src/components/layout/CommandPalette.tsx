import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Truck,
  TrendingDown,
  Users,
  Car,
  FileText,
  BarChart3,
  Settings,
  ShieldCheck,
  FolderArchive,
  ArrowRight,
} from 'lucide-react';
import { trIncludes } from '@/lib/trSearch';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const items = [
    { title: 'Genel Bakış (Bugün)', href: '/', icon: BarChart3, category: 'Sayfalar' },
    { title: 'Seferler Listesi', href: '/seferler', icon: Truck, category: 'Sayfalar' },
    { title: 'Yeni Sefer Ekle', href: '/seferler/yeni', icon: Truck, category: 'Hızlı Eylemler' },
    { title: 'Masraflar', href: '/masraflar', icon: TrendingDown, category: 'Sayfalar' },
    { title: 'Yeni Masraf / Fiş Ekle', href: '/masraflar/yeni', icon: TrendingDown, category: 'Hızlı Eylemler' },
    { title: 'Para Hesapları & Kasa', href: '/para', icon: FileText, category: 'Sayfalar' },
    { title: 'Kasa Sayımı & Mutabakat', href: '/para/sayim', icon: FileText, category: 'Hızlı Eylemler' },
    { title: 'Çek / Senet Portföyü', href: '/para/cek-senet', icon: FileText, category: 'Sayfalar' },
    { title: 'Finans Ajandası & Nakit Akışı', href: '/para/ajanda', icon: FileText, category: 'Sayfalar' },
    { title: 'Müşteriler & Cari Kartlar', href: '/musteriler', icon: Users, category: 'Sayfalar' },
    { title: 'Faturalar', href: '/faturalar', icon: FileText, category: 'Sayfalar' },
    { title: 'Araçlar & Filo', href: '/araclar', icon: Car, category: 'Sayfalar' },
    { title: 'Lastik Şasi Haritası', href: '/araclar/veh-1/lastik', icon: Car, category: 'Filo' },
    { title: 'Şoförler & Hakediş', href: '/soforler', icon: Users, category: 'Sayfalar' },
    { title: 'Belge Arşivi & Arama', href: '/belgeler', icon: FolderArchive, category: 'Sayfalar' },
    { title: 'Raporlama Merkezi', href: '/raporlar', icon: BarChart3, category: 'Sayfalar' },
    { title: 'Excel İçe Aktar', href: '/ice-aktar', icon: FileText, category: 'İçe Aktar' },
    { title: 'Lisans & Paketler', href: '/lisans', icon: ShieldCheck, category: 'Sistem' },
    { title: 'Ayarlar', href: '/ayarlar', icon: Settings, category: 'Sistem' },
  ];

  const filtered = query.trim()
    ? items.filter((it) => trIncludes(it.title, query) || trIncludes(it.category, query))
    : items.slice(0, 8);

  const handleSelect = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10">
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nereye gitmek istiyorsunuz? (Örn: Sefer, Masraf, Kasa, Lastik)..."
            className="w-full px-3 py-3.5 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">Sonuç bulunamadı.</p>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-brand-50 group-hover:text-brand-600 dark:group-hover:bg-brand-950/60 dark:group-hover:text-brand-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
