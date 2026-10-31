// Client-side WASM Receipt OCR Engine
import { createWorker } from 'tesseract.js';
import { trNormalize } from '@/lib/trSearch';

export interface OcrReceiptResult {
  rawText: string;
  amount?: number;
  litres?: number;
  unitPrice?: number;
  date?: string;
  merchant?: string;
}

export async function preprocessReceiptImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxDim = Math.max(bitmap.width, bitmap.height);
  const scale = maxDim > 2000 ? 2000 / maxDim : maxDim < 1200 ? Math.min(2, 1200 / maxDim) : 1;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const hist = new Uint32Array(256);

  for (let i = 0; i < data.length; i += 4) {
    const gray = ((data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000) | 0;
    data[i] = data[i + 1] = data[i + 2] = gray;
    hist[gray]++;
  }

  const totalPixels = width * height;
  const lowTarget = totalPixels * 0.01;
  const highTarget = totalPixels * 0.99;
  let acc = 0;
  let pLow = 0;
  let pHigh = 255;

  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    if (acc >= lowTarget) {
      pLow = i;
      break;
    }
  }
  acc = 0;
  for (let i = 255; i >= 0; i--) {
    acc += hist[i];
    if (acc >= totalPixels - highTarget) {
      pHigh = i;
      break;
    }
  }

  const range = Math.max(1, pHigh - pLow);
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.max(0, Math.min(255, (((data[i] - pLow) * 255) / range) | 0));
    data[i] = data[i + 1] = data[i + 2] = v;
  }

  ctx.putImageData(imgData, 0, 0);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/png', 0.95);
  });
}

export function parseReceiptText(rawText: string): Omit<OcrReceiptResult, 'rawText'> {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let amount: number | undefined;
  let litres: number | undefined;
  let unitPrice: number | undefined;
  let date: string | undefined;
  let merchant: string | undefined;

  // 1. Merchant Name
  const gasStations = ['PETROL', 'OPET', 'SHELL', 'BP', 'TOTAL', 'AYTEMIZ', 'TP', 'LUKOIL', 'SOCAR', 'GO', 'MOIL', 'KADOIL', 'ALPET', 'SUNPET'];
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const norm = trNormalize(lines[i]).toUpperCase();
    if (gasStations.some((g) => norm.includes(g)) || norm.includes('A.S.') || norm.includes('LTD')) {
      merchant = lines[i];
      break;
    }
  }

  // 2. Date
  const dateMatch = rawText.match(/(\d{2})[./-](\d{2})[./-](\d{4})/);
  if (dateMatch) {
    const [, d, m, y] = dateMatch;
    date = `${y}-${m}-${d}`;
  }

  // 3. Litres & Unit Price
  const ltMatch = rawText.match(/(\d+[.,]\d{1,2})\s*(?:LT|L|LITRE)/i);
  if (ltMatch) {
    litres = parseFloat(ltMatch[1].replace(',', '.'));
  }

  const priceMatch = rawText.match(/(\d+[.,]\d{1,2})\s*(?:TL\/LT|\*)/i);
  if (priceMatch) {
    unitPrice = parseFloat(priceMatch[1].replace(',', '.'));
  }

  // 4. Total Amount
  const totalRegex = /(?:TOPLAM|TOP|TUTAR|ODENECEK|KRED[Iİ]|NAK[Iİ]T)\s*[:*]?\s*\*?(\d+[.,]\d{2})/i;
  for (const line of lines) {
    const tm = line.match(totalRegex);
    if (tm) {
      amount = parseFloat(tm[1].replace(',', '.'));
      break;
    }
  }

  // Fallback: look for lines starting with *
  if (!amount) {
    for (const line of lines) {
      const starMatch = line.match(/\*\s*(\d+[.,]\d{2})/);
      if (starMatch) {
        amount = parseFloat(starMatch[1].replace(',', '.'));
        break;
      }
    }
  }

  // Calculate missing litres if unit price and amount are available
  if (!litres && amount && unitPrice && unitPrice > 10) {
    litres = Math.round((amount / unitPrice) * 100) / 100;
  }

  return { amount, litres, unitPrice, date, merchant };
}

export async function runOcrOnFile(file: File): Promise<OcrReceiptResult> {
  const processedBlob = await preprocessReceiptImage(file);
  const worker = await createWorker('tur+eng');
  const ret = await worker.recognize(processedBlob);
  await worker.terminate();

  const parsed = parseReceiptText(ret.data.text);
  return {
    rawText: ret.data.text,
    ...parsed,
  };
}
