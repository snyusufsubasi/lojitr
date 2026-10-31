// Turkish Regulatory Validators: VKN, TCKN, TR IBAN, Vehicle Plate
// LojiTR v3.0

/**
 * 10 haneli Vergi Kimlik Numarası (VKN) algoritması doğrulaması
 * GİB (Gelir İdaresi Başkanlığı) resmi modül 10 algoritması.
 */
export function isValidVKN(vkn: string): boolean {
  const clean = vkn.replace(/\s+/g, '');
  if (!/^\d{10}$/.test(clean)) return false;

  const digits = clean.split('').map(Number);
  const lastDigit = digits[9];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    const v1 = (digits[i] + (9 - i)) % 10;
    let v2 = 0;
    if (v1 === 0) {
      v2 = 0;
    } else {
      v2 = (v1 * Math.pow(2, 9 - i)) % 9;
      if (v2 === 0) v2 = 9;
    }
    sum += v2;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === lastDigit;
}

/**
 * 11 haneli T.C. Kimlik Numarası (TCKN) algoritması doğrulaması
 */
export function isValidTCKN(tckn: string): boolean {
  const clean = tckn.replace(/\s+/g, '');
  if (!/^[1-9]\d{10}$/.test(clean)) return false;

  const digits = clean.split('').map(Number);

  // 1, 3, 5, 7, 9 hanelerin toplamının 7 katından 2, 4, 6, 8 hanelerin toplamı çıkarıldığında mod 10 -> 10. hane
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  const digit10 = (oddSum * 7 - evenSum) % 10;
  if (digit10 < 0 ? digit10 + 10 : digit10 !== digits[9]) return false;

  // İlk 10 hanenin toplamının mod 10'u -> 11. hane
  const first10Sum = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
  return first10Sum % 10 === digits[10];
}

/**
 * Türkiye IBAN Doğrulaması (TR + 24 hane = 26 karakter, MOD 97)
 */
export function isValidTurkishIBAN(iban: string): boolean {
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  if (!/^TR\d{24}$/.test(clean)) return false;

  // Re-arrange: move TR and check digits to end: 'TR24' -> numbers -> '292724'
  const rearranged = clean.slice(4) + '2927' + clean.slice(2, 4);

  // MOD 97 calculation on large numeric string
  let remainder = 0;
  for (let i = 0; i < rearranged.length; i += 7) {
    const chunk = remainder.toString() + rearranged.slice(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }

  return remainder === 1;
}

/**
 * IBAN'ı 4'erli bloklar halinde biçimlendirir (TRxx xxxx xxxx ...)
 */
export function formatTurkishIBAN(iban: string): string {
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Türkiye Plaka Formatı Doğrulaması
 * Standart formatlar: 34 ABC 123, 06 A 1234, 35 AB 123, 42 KYA 42
 */
export function isValidTurkishPlate(plate: string): boolean {
  const clean = plate.trim().toUpperCase().replace(/\s+/g, ' ');
  const regex = /^(0[1-9]|[1-7][0-9]|8[01])\s([A-Z]{1,3})\s(\d{2,4})$/;
  return regex.test(clean);
}