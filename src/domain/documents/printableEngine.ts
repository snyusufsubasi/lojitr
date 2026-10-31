// Printable Official A4 Document Engine: Invoices, Settlement Slips & Balance Letters
// LojiTR v3.0

import { formatMoney, formatDateShort } from '@/lib/formatters';
import type { Invoice, Driver, Contact } from '../types';

/**
 * Sayıyı Türkçe Para Metnine Çevirir
 * Örn: 38400.50 -> "#Yalnız Otuz Sekiz Bin Dört Yüz TL Elli Kuruştur#"
 */
export function numberToTurkishWords(amount: number): string {
  const units = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
  const tens = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];
  const thousands = ['', 'Bin', 'Milyon', 'Milyar', 'Trilyon'];

  function convertGroup(n: number): string {
    let str = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    const t = Math.floor(rem / 10);
    const u = rem % 10;

    if (h > 0) {
      str += (h > 1 ? units[h] + ' ' : '') + 'Yüz ';
    }
    if (t > 0) {
      str += tens[t] + ' ';
    }
    if (u > 0) {
      str += units[u] + ' ';
    }
    return str.trim();
  }

  const rounded = Math.round(amount * 100) / 100;
  const lira = Math.floor(rounded);
  const kurus = Math.round((rounded - lira) * 100);

  if (lira === 0 && kurus === 0) return '#Sıfır TL#';

  let liraStr = '';
  let tempLira = lira;
  let groupIndex = 0;

  while (tempLira > 0) {
    const group = tempLira % 1000;
    if (group > 0) {
      const groupText = convertGroup(group);
      if (groupIndex === 1 && group === 1) {
        liraStr = 'Bin ' + liraStr;
      } else {
        liraStr = (groupText ? groupText + ' ' : '') + thousands[groupIndex] + ' ' + liraStr;
      }
    }
    tempLira = Math.floor(tempLira / 1000);
    groupIndex++;
  }

  let result = '#Yalnız ' + liraStr.trim() + ' TL';
  if (kurus > 0) {
    result += ' ' + convertGroup(kurus) + ' Kuruş';
  }
  result += 'tur#';
  return result;
}

/**
 * Tarayıcıda GİB Uyumlu e-Fatura / e-Arşiv A4 Yazdırma Penceresi Açar
 */
export function printInvoiceA4(invoice: Invoice, contact?: Contact, companyName = 'Kaya Uluslararası Nakliyat Ltd. Şti.') {
  const w = window.open('', '_blank');
  if (!w) return;

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>Fatura ${invoice.invoiceNo}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20mm; color: #1e293b; font-size: 11pt; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
        .title { font-size: 18pt; font-weight: 800; color: #4f46e5; }
        .sub { font-size: 9pt; color: #64748b; margin-top: 4px; }
        .grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 10pt; }
        .card { width: 48%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; }
        .card h4 { margin: 0 0 8px 0; font-size: 10pt; color: #475569; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10pt; }
        th { background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 8px; text-align: left; font-size: 9pt; text-transform: uppercase; }
        td { border-bottom: 1px solid #e2e8f0; padding: 8px; }
        .totals { margin-top: 20px; width: 40%; margin-left: auto; font-size: 10pt; }
        .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
        .grand-total { border-top: 2px solid #0f172a; font-weight: 800; font-size: 12pt; color: #4f46e5; margin-top: 6px; padding-top: 6px; }
        .in-words { margin-top: 25px; padding: 10px; background: #f8fafc; border-left: 4px solid #4f46e5; font-style: italic; font-size: 9pt; }
        .footer { margin-top: 40px; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
        @media print {
          body { padding: 10mm; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">${companyName}</div>
          <div class="sub">Uluslararası Karayolu Yük Taşımacılığı · Vergi No: 0680123456</div>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 14pt;">E-FATURA / E-ARŞİV</h2>
          <div style="font-weight: bold; margin-top: 4px;">Fatura No: ${invoice.invoiceNo}</div>
          <div class="sub">Tarih: ${formatDateShort(invoice.issueDate)}</div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <h4>Alıcı / Müşteri Bilgileri</h4>
          <div style="font-weight: bold; font-size: 11pt;">${contact?.name || 'Müşteri'}</div>
          <div>${contact?.address || 'Türkiye'}</div>
          <div>${contact?.taxOffice || 'Vergi Dairesi'}: ${contact?.taxNo || '0000000000'}</div>
          <div>Tel: ${contact?.phone || '-'}</div>
        </div>
        <div class="card">
          <h4>Ödeme & Vade Koşulları</h4>
          <div>Düzenleme Tarihi: <strong>${formatDateShort(invoice.issueDate)}</strong></div>
          <div>Vade Tarihi: <strong>${invoice.dueDate ? formatDateShort(invoice.dueDate) : 'Peşin'}</strong></div>
          <div>Banka IBAN: <strong>TR12 0006 2000 4560 0001 2345 67</strong></div>
          <div>Tevkifat Kapsamı: <strong>Taşımacılık Hizmetlerinde 2/10</strong></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Açıklama</th>
            <th style="text-align: center;">Miktar</th>
            <th style="text-align: right;">Birim Fiyat</th>
            <th style="text-align: right;">KDV %</th>
            <th style="text-align: right;">Tutar</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.lines
            .map(
              (line, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${line.description}</td>
              <td style="text-align: center;">${line.quantity} ${line.unit}</td>
              <td style="text-align: right;">${formatMoney(line.unitPrice)}</td>
              <td style="text-align: right;">%${line.vatRate}</td>
              <td style="text-align: right;">${formatMoney(line.net)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Mal/Hizmet Ara Toplam:</span>
          <span>${formatMoney(invoice.subtotal)}</span>
        </div>
        <div class="totals-row">
          <span>Hesaplanan KDV (%20):</span>
          <span>+${formatMoney(invoice.vatTotal)}</span>
        </div>
        <div class="totals-row" style="color: #e11d48; font-weight: 600;">
          <span>2/10 KDV Tevkifatı (-):</span>
          <span>-${formatMoney(invoice.withholdingTotal)}</span>
        </div>
        <div class="totals-row grand-total">
          <span>ÖDENECEK TOPLAM:</span>
          <span>${formatMoney(invoice.total)}</span>
        </div>
      </div>

      <div class="in-words">
        ${numberToTurkishWords(invoice.total)}
      </div>

      <div class="footer">
        Bu belge 213 sayılı V.U.K. hükümlerine göre LojiTR Lojistik Bilişim Altyapısı üzerinden elektronik olarak üretilmiştir.
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `;

  w.document.write(html);
  w.document.close();
}

/**
 * Şoför Aylık Hakediş ve İbra Pusulası A4 Yazdırma Penceresi Açar
 */
export function printDriverSettlementA4(driver: Driver, settlement: any) {
  const w = window.open('', '_blank');
  if (!w) return;

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>Hakediş Pusulası - ${driver.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 15mm; font-size: 10pt; color: #1e293b; }
        .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 16pt; font-weight: bold; }
        .grid { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .box { width: 48%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; }
        .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
        .row:last-child { border-bottom: none; }
        .highlight { font-weight: bold; font-size: 12pt; background: #f8fafc; padding: 8px; border-radius: 4px; margin-top: 15px; }
        .sign { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; }
        .sign-box { width: 45%; border-top: 1px solid #000; padding-top: 10px; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">ŞOFÖR AYLIK HAKEDİŞ, HARCIRAH VE HESAP PUSULASI</div>
        <div>Kaya Uluslararası Nakliyat Ltd. Şti.</div>
      </div>

      <div class="grid">
        <div class="box">
          <div>Şoför Adı Soyadı: <strong>${driver.name}</strong></div>
          <div>Telefon: ${driver.phone || '-'}</div>
          <div>IBAN: ${driver.iban || '-'}</div>
        </div>
        <div class="box">
          <div>Dönem: <strong>Son 30 Gün</strong></div>
          <div>Tamamlanan Sefer Sayısı: <strong>${settlement.tripCount || 0} Sefer</strong></div>
          <div>Toplam Yapılan Yol: <strong>${(settlement.effectiveKm || 0).toLocaleString('tr-TR')} KM</strong></div>
        </div>
      </div>

      <div class="grid">
        <div class="box" style="border-left: 4px solid #10b981;">
          <h4 style="margin: 0 0 10px 0; color: #059669;">Hak Edilen Alacaklar (+)</h4>
          <div class="row"><span>Kıstelyevm Aylık Maaş:</span><span>${formatMoney(settlement.salaryEarned || 0)}</span></div>
          <div class="row"><span>Sefer Harcırahları:</span><span>${formatMoney(settlement.perDiemEarned || 0)}</span></div>
          <div class="row"><span>KM Başı Başarı Primi:</span><span>${formatMoney(settlement.kmPayEarned || 0)}</span></div>
          <div class="row"><span>Şoförün Cebinden Yaptığı Giderler:</span><span>${formatMoney(settlement.outOfPocketExpenses || 0)}</span></div>
          <div class="row" style="font-weight: bold; color: #059669; border-top: 2px solid #cbd5e1;">
            <span>TOPLAM HAK EDİŞ:</span><span>${formatMoney(settlement.totalEarned || 0)}</span>
          </div>
        </div>

        <div class="box" style="border-left: 4px solid #ef4444;">
          <h4 style="margin: 0 0 10px 0; color: #dc2626;">Kesintiler & Avanslar (-)</h4>
          <div class="row"><span>Yol / Mazot Avansları:</span><span>-${formatMoney(settlement.advances || 0)}</span></div>
          <div class="row"><span>Banka Maaş Avansları:</span><span>-${formatMoney(settlement.salaryPaid || 0)}</span></div>
          <div class="row"><span>Elden Alınan Tahsilatlar:</span><span>-${formatMoney(settlement.collectionsHeld || 0)}</span></div>
          <div class="row" style="font-weight: bold; color: #dc2626; border-top: 2px solid #cbd5e1;">
            <span>TOPLAM KESİNTİ:</span><span>-${formatMoney(settlement.totalPaid || 0)}</span>
          </div>
        </div>
      </div>

      <div class="highlight" style="display: flex; justify-content: space-between; align-items: center; border: 2px solid #4f46e5;">
        <span>NET ÖDENECEK ŞOFÖR HAKEDİŞİ:</span>
        <span style="font-size: 16pt; color: #4f46e5;">${formatMoney(settlement.payable || 0)}</span>
      </div>

      <div style="font-size: 8.5pt; color: #64748b; margin-top: 25px; line-height: 1.4;">
        <strong>İBRA BEYANI:</strong> Yukarıdaki dökümü yapılan dönem içinde tahakkuk eden tüm sabit maaş, sefer harcırahı, kilometre primi ve şahsi masraf alacaklarımı eksiksiz olarak nakden/banka yoluyla teslim aldım. Şirketten herhangi bir hak ve alacağım kalmadığını gayrikabili rücu ibra ederim.
      </div>

      <div class="sign">
        <div class="sign-box">
          <div><strong>Firma Yetkilisi</strong></div>
          <div style="margin-top: 30px; color: #94a3b8;">Kaşe / İmza</div>
        </div>
        <div class="sign-box">
          <div><strong>Şoför (Teslim Alan)</strong></div>
          <div style="margin-top: 30px; color: #94a3b8;">${driver.name} (İmza)</div>
        </div>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `;

  w.document.write(html);
  w.document.close();
}
