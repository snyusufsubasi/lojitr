// Smart Multi-Sheet Excel Ledger Parser
import * as XLSX from 'xlsx';
import { trNormalize } from '@/lib/trSearch';
import type { ExpenseCategory } from '../types';

export interface ParsedTripDraft {
  date: string;
  plate: string;
  origin: string;
  destination: string;
  customerName: string;
  cargo?: string;
  weightTon?: number;
  freight: number;
  vatRate: number;
  vatIncluded: boolean;
  vatWithholding?: '2/10';
}

export interface ParsedExpenseDraft {
  date: string;
  plate?: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
}

export function classifyExpenseCategory(text: string): ExpenseCategory {
  const norm = trNormalize(text).toLowerCase();
  if (norm.match(/mazot|yakit|motorin|shell|opet|bp|petrol|tp|aytemiz|lukoil|total/)) return 'yakit';
  if (norm.match(/adblue|ad blue|ure/)) return 'adblue';
  if (norm.match(/hgs|ogs|otoyol|kopru|osmangazi|yavuz sultan/)) return 'otoyol';
  if (norm.match(/yemek|lokanta|restoran|iaşe|kumanya/)) return 'yemek';
  if (norm.match(/harcirah|yolluk|sefer parasi|prim/)) return 'harcirah';
  if (norm.match(/bakim|tamir|servis|sanayi|usta|iscilik|yağ|filtre/)) return 'bakim';
  if (norm.match(/lastik|kaplama|balans|rot|michelin|bridgestone|lassa|goodyear/)) return 'lastik';
  if (norm.match(/parca|yedek parca|aku|balata|fren|debriyaj/)) return 'parca';
  if (norm.match(/sigorta|trafik sigortasi/)) return 'sigorta';
  if (norm.match(/kasko/)) return 'kasko';
  if (norm.match(/muayene|tuvturk|egzoz/)) return 'muayene';
  if (norm.match(/mtv|vergi|bandrol|noter|harç/)) return 'vergi';
  if (norm.match(/ceza|trafik cezasi|radar|kantar/)) return 'ceza';
  if (norm.match(/komisyon|komisyoncu/)) return 'komisyon';
  return 'diger';
}

export function parseExcelWorkbook(data: ArrayBuffer): {
  trips: ParsedTripDraft[];
  expenses: ParsedExpenseDraft[];
  sheetNames: string[];
} {
  const wb = XLSX.read(data, { type: 'array' });
  const trips: ParsedTripDraft[] = [];
  const expenses: ParsedExpenseDraft[] = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
    if (!rows || rows.length < 2) continue;

    // Scan rows for trip or expense data
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      // Detect trips: usually has Date, Plate, Origin, Destination, Amount
      const firstCol = String(row[0] || '').trim();
      const dateMatch = firstCol.match(/(\d{4})[./-](\d{2})[./-](\d{2})/) || firstCol.match(/(\d{2})[./-](\\d{2})[./-](\\d{4})/);
      
      if (dateMatch) {
        let date = firstCol;
        if (dateMatch[1].length === 2) {
          date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
        }

        // If row has plate-like string in col 1 or 2
        const col1 = String(row[1] || '').trim().toUpperCase();
        const col2 = String(row[2] || '').trim();
        const col3 = String(row[3] || '').trim();
        const numVal = parseFloat(String(row[row.length - 1] || '0').replace(/[^0-9.-]/g, ''));

        if (numVal > 0 && col2 && col3) {
          trips.push({
            date,
            plate: col1.replace(/\s+/g, ''),
            origin: col2,
            destination: col3,
            customerName: String(row[4] || 'Müşteri').trim(),
            freight: numVal,
            vatRate: 20,
            vatIncluded: false,
            vatWithholding: '2/10',
          });
        }
      }
    }
  }

  return {
    trips,
    expenses,
    sheetNames: wb.SheetNames,
  };
}
