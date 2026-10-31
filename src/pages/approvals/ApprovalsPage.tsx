import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Truck,
  Fuel,
  Receipt,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRepository } from '@/domain/useRepository';
import { formatMoney, formatDateShort } from '@/lib/formatters';

export const ApprovalsPage: React.FC = () => {
  const repo = useRepository();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApprovals = async () => {
    const list = await repo.listApprovals();
    setApprovals(list);
    setLoading(false);
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    await repo.approveItem(id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    alert('İşlem başarıyla onaylandı ve muhasebeleştirildi.');
  };

  const handleReject = async (id: string) => {
    await repo.rejectItem(id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    alert('İşlem reddedildi.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-brand-500" />
            Şoför & Saha Onay Merkezi
          </h1>
          <p className="text-xs text-slate-500">
            Şoförlerin sahadan girdiği masraf fişleri, yol avansı talepleri ve dijital teslimat onayları
          </p>
        </div>
        <Badge variant="brand" size="md">
          {approvals.length} Bekleyen Talep
        </Badge>
      </div>

      <div className="space-y-3">
        {approvals.length === 0 ? (
          <Card className="text-center py-16 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Bekleyen Onay Talebi Yok
              </h3>
              <p className="text-xs text-slate-400">
                Şoförlerin sahadan ilettiği tüm fiş, avans ve sefer onayları güncel.
              </p>
            </div>
          </Card>
        ) : (
          approvals.map((app) => (
            <Card key={app.id} className="p-4 hover:border-brand-500/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 mt-0.5">
                    {app.kind === 'expense' ? (
                      <Fuel className="w-5 h-5" />
                    ) : app.kind === 'advance' ? (
                      <Receipt className="w-5 h-5" />
                    ) : (
                      <Truck className="w-5 h-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {app.title}
                      </span>
                      <Badge variant="warning" size="sm">
                        ONAY BEKLİYOR
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Talep Eden: <strong>{app.requesterName}</strong> · Araç: <strong>{app.vehiclePlate || '-'}</strong>
                    </p>
                    <p className="text-xs text-slate-500">{app.details}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 gap-3">
                  <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                    {formatMoney(app.amount)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(app.id)}
                      className="text-rose-600 hover:bg-rose-50 border-rose-200"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reddet
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(app.id)}
                      className="bg-emerald-600 hover:bg-emerald-500"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Onayla
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
