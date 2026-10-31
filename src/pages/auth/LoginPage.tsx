import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Sparkles, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/domain/store/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { enterDemo } = useAuthStore();

  const handleDemoLogin = (role: 'owner' | 'driver' = 'owner') => {
    enterDemo(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyanBrand-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-brand-500/25">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Loji<span className="text-brand-500">TR</span>'ye Giriş Yapın
          </h1>
          <p className="text-xs text-slate-500">
            Akıllı Filo, Sefer ve Nakliye Yönetim Sistemi
          </p>
        </div>

        <Card className="p-6 space-y-4 shadow-xl">
          <div className="space-y-3">
            <Input label="E-Posta Adresi" type="email" placeholder="ornek@nakliyat.com" />
            <Input label="Şifre" type="password" placeholder="••••••••" />
          </div>

          <Button
            variant="primary"
            className="w-full bg-brand-600 hover:bg-brand-500"
            onClick={() => handleDemoLogin('owner')}
          >
            Giriş Yap
          </Button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase">
              Veya Demo Olarak İnceleyin
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('owner')}
              className="text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-500" />
              Yönetici Demosu
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('driver')}
              className="text-xs font-bold"
            >
              <User className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              Şoför Demosu
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
