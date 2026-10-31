import React from 'react';
import { ShieldCheck, Check, Sparkles, HardDrive, Car } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PACKAGES } from '@/domain/billing/pricingAndBilling';
import { useAuthStore } from '@/domain/store/authStore';
import { formatMoney } from '@/lib/formatters';

export const LicensePage: React.FC = () => {
  const { billing } = useAuthStore();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <Badge variant="brand" size="md">
          Şeffaf Yıllık Lisanslama
        </Badge>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Filonuza Uygun Paketi Seçin
        </h1>
        <p className="text-xs text-slate-500">
          Tüm paketlere sınırsız sefer, sınırsız fatura, mobil şoför uygulaması ve kamera ile OCR fiş okuma dahildir.
        </p>
      </div>

      {/* Package Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PACKAGES.map((pkg) => {
          const isCurrent = pkg.code === 'standart';
          return (
            <Card
              key={pkg.code}
              className={`p-5 flex flex-col justify-between relative transition-all ${
                isCurrent
                  ? 'border-2 border-brand-500 shadow-xl shadow-brand-500/10'
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {pkg.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="brand" size="sm">
                    {pkg.badge}
                  </Badge>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {pkg.vehicleLimit ? `${pkg.vehicleLimit} Özmal Araç` : 'Sınırsız Filo'}
                  </p>
                </div>

                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    {formatMoney(pkg.yearlyGross)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Yıllık KDV Dahil (≈ {pkg.monthlyEquivalent} ₺/ay)
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{pkg.storageGb} GB Belge & Fiş Kotası</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Dorse & Taşeron Araçlar Sınırsız</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>WASM Kamera Fiş OCR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>e-İmza & QR Doğrulama</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  variant={isCurrent ? 'primary' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() => alert(`${pkg.name} paketi seçildi.`)}
                >
                  {isCurrent ? 'Mevcut Paketiniz' : 'Bu Pakete Geç'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
