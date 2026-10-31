import React from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Building, Calendar, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatMoney, formatDateShort } from '@/lib/formatters';

export const VerifyDocumentPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Doğrulanmış Resmi Belge
          </h1>
          <p className="text-xs text-slate-500">
            Bu belge LojiTR sistemi tarafından üretilmiş ve dijital parmak izi ile onaylanmıştır.
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs text-slate-500 font-semibold">Doğrulama Durumu:</span>
            <Badge variant="success" size="md">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              GEÇERLİ & DOĞRULANDI
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Düzenleyen Firma:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                Kaya Uluslararası Nakliyat
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Belge Türü:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Cari Hesap Ekstresi & Sefer Mutabakatı
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Doğrulama Jetonu:</span>
              <span className="font-mono text-[11px] text-slate-400">
                {token || 'DEMO-VERIFIED-TOKEN'}
              </span>
            </div>
          </div>
        </Card>

        <p className="text-center text-[11px] text-slate-400">
          © 2026 LojiTR · Güvenli Lojistik Doğrulama Altyapısı
        </p>
      </div>
    </div>
  );
};
