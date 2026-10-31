import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { parseExcelWorkbook, ParsedTripDraft } from '@/domain/import/excelLedger';
import { useRepository } from '@/domain/useRepository';
import { formatMoney } from '@/lib/formatters';

export const ImportHubPage: React.FC = () => {
  const repo = useRepository();

  const [parsing, setParsing] = useState(false);
  const [parsedTrips, setParsedTrips] = useState<ParsedTripDraft[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    try {
      const buffer = await file.arrayBuffer();
      const res = parseExcelWorkbook(buffer);
      setParsedTrips(res.trips);
      setSheetNames(res.sheetNames);
    } catch {
      alert('Excel dosyası ayrıştırılamadı. Lütfen geçerli bir .xlsx veya .xls dosyası yükleyin.');
    } finally {
      setParsing(false);
    }
  };

  const handleCommitImport = async () => {
    if (parsedTrips.length === 0) return;
    setImporting(true);
    try {
      let count = 0;
      for (const t of parsedTrips) {
        await repo.createTrip({
          date: t.date,
          vehicleId: 'veh-1',
          origin: t.origin,
          destination: t.destination,
          cargo: t.cargo,
          freight: t.freight,
          vatIncluded: t.vatIncluded,
          vatRate: t.vatRate,
          vatWithholding: t.vatWithholding as any,
          commission: 0,
          status: 'tamamlandi',
        });
        count++;
      }
      setImportedCount(count);
      setParsedTrips([]);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
          Excel Sefer & Masraf Defteri İçe Aktarma
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Yıllardır tuttuğunuz çok sekmeli (Ocak..Aralık) Excel tablolarını tek tıkla sisteme aktarın
        </p>
      </div>

      {/* Upload Dropzone */}
      <Card className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <FileSpreadsheet className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Excel dosyanızı (.xlsx, .xls) seçin
          </p>
          <p className="text-xs text-slate-400">
            Sefer ve masraf başlıkları, KDV ve 2/10 tevkifat oranları otomatik algılanacaktır.
          </p>
        </div>

        <label className="inline-block cursor-pointer">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-colors">
            <Upload className="w-4 h-4" />
            {parsing ? 'Ayrıştırılıyor...' : 'Dosya Seç & Tara'}
          </span>
        </label>
      </Card>

      {/* Success Notification */}
      {importedCount !== null && (\n        <div className=\"p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200 font-bold\">\n          <Check className=\"w-5 h-5 text-emerald-600\" />\n          <span>{importedCount} adet sefer başarıyla sisteme aktarıldı!</span>\n        </div>\n      )}

      {/* Parsed Preview Table */}
      {parsedTrips.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Algılanan Seferler ({parsedTrips.length} Kayıt)
              </h3>
              <p className="text-[11px] text-slate-400">
                Bulunan Sayfalar: {sheetNames.join(', ')}
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleCommitImport}
              loading={importing}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Sisteme Aktarımı Başlat
            </Button>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {parsedTrips.slice(0, 10).map((t, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {t.origin} → {t.destination} ({t.plate})
                  </span>
                  <span className="text-slate-400">
                    Tarih: {t.date} • Müşteri: {t.customerName}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatMoney(t.freight)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
