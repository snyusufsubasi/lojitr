import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  Upload,
  FileText,
  FileCheck2,
  Calendar,
  Eye,
  Download,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { splitHighlightSegments } from '@/domain/documents/highlightSnippet';
import { trIncludes } from '@/lib/trSearch';

interface MockDocument {
  id: string;
  fileName: string;
  category: string;
  sizeMb: number;
  date: string;
  snippet: string;
}

export const DocumentsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [docs, setDocs] = useState<MockDocument[]>([
    {
      id: 'doc-1',
      fileName: 'irsaliye_34kya101_gebze.pdf',
      category: 'irsaliye',
      sizeMb: 1.4,
      date: '2026-10-25',
      snippet: 'Anadolu Cam Sanayi A.Ş. sevk irsaliyesi. Gebze fabrikasından İskenderun Liman teslimi 24.8 ton endüstriyel cam paleti.',
    },
    {
      id: 'doc-2',
      fileName: 'ruhsat_34kya101.pdf',
      category: 'ruhsat',
      sizeMb: 2.1,
      date: '2026-01-15',
      snippet: 'Araç tescil belgesi. Mercedes-Benz Actros 1848 LS çekici 2023 model.',
    },
    {
      id: 'doc-3',
      fileName: 'ehliyet_ahmet_yilmaz.jpg',
      category: 'ehliyet',
      sizeMb: 0.8,
      date: '2026-03-10',
      snippet: 'Ahmet Yılmaz CE sınıfı ağır vasıta sürücü belgesi ve dijital takograf kartı.',
    },
    {
      id: 'doc-4',
      fileName: 'cmr_uluslararasi_sevkiyat.pdf',
      category: 'cmr',
      sizeMb: 3.2,
      date: '2026-08-14',
      snippet: 'Uluslararası CMR taşıma senedi. İstanbul - Sofya parsiyel teslimat tutanağı.',
    },
  ]);

  const filtered = docs.filter((d) => {
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter;
    const matchQuery =
      trIncludes(d.fileName, query) ||
      trIncludes(d.snippet, query) ||
      trIncludes(d.category, query);
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-brand-500" />
            Dijital Belge Arşivi & Metin Arama
          </h1>
          <p className="text-xs text-slate-500">
            İrsaliyeler, CMR'ler, ruhsatlar, SRC belgeleri ve OCR tam metin araması
          </p>
        </div>

        <label className="cursor-pointer">
          <input type="file" multiple className="hidden" onChange={() => alert('Belge yüklendi.')} />
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-colors">
            <Upload className="w-4 h-4" />
            Belge Yükle
          </span>
        </label>
      </div>

      {/* Search Input with live snippet highlight */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Belge adı veya OCR metni içinde arayın (Örn: 'irsaliye', 'cam paleti', 'ruhsat')..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((d) => {
          const segments = splitHighlightSegments(d.snippet, query);

          return (
            <Card key={d.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-[220px]">
                      {d.fileName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {d.sizeMb} MB • {d.date}
                    </span>
                  </div>
                </div>

                <Badge variant="brand" size="sm">
                  {d.category.toUpperCase()}
                </Badge>
              </div>

              {/* OCR Text Snippet with Turkish Highlights */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {segments.map((seg, idx) => (\n                  <span\n                    key={idx}\n                    className={\n                      seg.hit\n                        ? 'bg-amber-200/80 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-bold px-0.5 rounded'\n                        : ''\n                    }\n                  >\n                    {seg.text}\n                  </span>\n                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert('Belge önizleme açılıyor...')}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Görüntüle
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => alert('Belge indiriliyor...')}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  İndir
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
