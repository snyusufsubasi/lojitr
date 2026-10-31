import React, { useState } from 'react';
import { Settings, Building2, Bell, Shield, Save, Sun, Moon, Palette } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/domain/store/authStore';

export const SettingsPage: React.FC = () => {
  const { accountName, accountSettings, theme, setTheme } = useAuthStore();

  const [name, setName] = useState(accountName || 'Kaya Uluslararası Nakliyat');
  const [taxOffice, setTaxOffice] = useState('İlyasbey');
  const [taxNo, setTaxNo] = useState('0680123456');
  const [iban, setIban] = useState('TR120006200045600001234567');
  const [driverSeesFreight, setDriverSeesFreight] = useState(accountSettings.driver_sees_freight);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Ayarlar başarıyla kaydedildi.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-500" />
          Firma & Sistem Ayarları
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fatura unvan bilgileri, şoför yetkileri ve sistem tercihleri
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Company Card */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-500" />
            Firma ve Fatura Bilgileri
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Firma Ticari Unvanı *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Banka IBAN Numarası"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Vergi Dairesi"
              value={taxOffice}
              onChange={(e) => setTaxOffice(e.target.value)}
            />
            <Input
              label="Vergi Kimlik Numarası (VKN)"
              value={taxNo}
              onChange={(e) => setTaxNo(e.target.value)}
            />
          </div>
        </Card>

        {/* Theme / Appearance Card */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-500" />
            Görünüm ve Tema Seçimi
          </h3>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                theme === 'light'
                  ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block">Açık Tema</span>
                <span className="text-[11px] text-slate-400">Varsayılan & Ferah</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                theme === 'dark'
                  ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block">Koyu Tema</span>
                <span className="text-[11px] text-slate-400">Gece sürüş modu</span>
              </div>
            </button>
          </div>
        </Card>

        {/* Permissions Card */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-500" />
            Şoför ve Yetki Tercihleri
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={driverSeesFreight}
                onChange={(e) => setDriverSeesFreight(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Şoförler Navlun ve Fatura Tutarını Görebilsin
                </span>
                <span className="text-slate-400">
                  Kapalı olduğunda şoför rolündeki kullanıcılar navlun tutarlarını ve ciroları göremez.
                </span>
              </div>
            </label>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary">
            <Save className="w-4 h-4 mr-1.5" />
            Değişiklikleri Kaydet
          </Button>
        </div>
      </form>
    </div>
  );
};
