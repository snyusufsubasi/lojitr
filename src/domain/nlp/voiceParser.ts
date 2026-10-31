// Turkish Natural Language Voice Parser for Trips & Expenses
import { trNormalize } from '@/lib/trSearch';

export const TURKISH_CITIES = [
  'Adana','Adıyaman','Afyonkarahisar','Ağrı','Aksaray','Amasya','Ankara','Antalya','Ardahan','Artvin',
  'Aydın','Balıkesir','Bartın','Batman','Bayburt','Bilecik','Bingöl','Bitlis','Bolu','Burdur',
  'Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan',
  'Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Iğdır','Isparta','İstanbul',
  'İzmir','Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kırıkkale','Kırklareli','Kırşehir',
  'Kilis','Kocaeli','Konya','Kütahya','Malatya','Manisa','Mardin','Mersin','Muğla','Muş',
  'Nevşehir','Niğde','Ordu','Osmaniye','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas',
  'Şanlıurfa','Şırnak','Tekirdağ','Tokat','Trabzon','Tunceli','Uşak','Van','Yalova','Yozgat','Zonguldak',
  'Gebze','Çorlu','Çerkezköy','İskenderun','İnegöl','Tuzla','Dilovası','Aliağa','Tarsus','Polatlı',
  'Siverek','Bandırma','Lüleburgaz','Kızıltepe','Cizre','Silopi','Doğubayazıt','Reyhanlı','Gemlik','Ereğli',
  'Akhisar','Salihli','Torbalı','Kemalpaşa','Bozüyük','Gölcük','Kartepe','Çayırova','Hadımköy','Esenyurt','Ambarlı'
];

const CITY_MAP = new Map<string, string>([
  ...TURKISH_CITIES.map((c): [string, string] => [trNormalize(c), c]),
  ['afyon', 'Afyonkarahisar'],
  ['maras', 'Kahramanmaraş'],
  ['urfa', 'Şanlıurfa'],
  ['antep', 'Gaziantep'],
  ['izmit', 'Kocaeli'],
  ['adapazari', 'Sakarya'],
  ['icel', 'Mersin'],
]);

function stripLocationSuffix(word: string): string {
  const cleaned = word.replace(/['’`]/g, '');
  for (const suf of ['ndan', 'nden', 'dan', 'den', 'tan', 'ten', 'ya', 'ye', 'na', 'ne', 'a', 'e']) {
    if (cleaned.length - suf.length >= 3 && cleaned.endsWith(suf)) {
      return cleaned.slice(0, -suf.length);
    }
  }
  return cleaned;
}

const NUMBER_WORDS: Record<string, number> = {
  bir: 1, iki: 2, uc: 3, dort: 4, bes: 5, alti: 6, yedi: 7, sekiz: 8, dokuz: 9,
  on: 10, yirmi: 20, otuz: 30, kirk: 40, elli: 50, altmis: 60, yetmis: 70, seksen: 80, doksan: 90,
  yuz: 100, bin: 1000, milyon: 1000000,
};

export function parseSpokenAmount(text: string): number | undefined {
  const norm = trNormalize(text)
    .replace(/(\d)\.(\d{3})\b/g, '$1$2')
    .replace(/(\\d),(\\d{1,2})\\b/g, '$1.$2');

  const kMatch = /(\\d+(?:\\.\\d+)?)\\s*(bin|bın|k)\\b/.exec(norm);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);

  const tokens = norm.split(/[^a-z0-9.]+/).filter(Boolean);
  let total = 0;
  let current = 0;
  let matchedWord = false;

  for (const tok of tokens) {
    if (tok in NUMBER_WORDS) {
      matchedWord = true;
      const val = NUMBER_WORDS[tok];
      if (val === 100) current = (current || 1) * 100;
      else if (val === 1000 || val === 1000000) {
        total += (current || 1) * val;
        current = 0;
      } else current += val;
    } else if (/^\\d+(\\.\\d+)?$/.test(tok)) {
      const n = parseFloat(tok);
      if (n >= 50) return Math.round(n * 100) / 100;
    }
  }
  const wordResult = total + current;
  if (matchedWord && wordResult >= 50) return wordResult;

  const nums = (norm.match(/\\d+(?:\\.\\d+)?/g) || []).map(Number).filter((n) => n >= 10);
  if (nums.length > 0) return Math.max(...nums);
  return undefined;
}

export function parseSpokenTrip(transcript: string): {
  origin?: string;
  destination?: string;
  freight?: number;
  cargo?: string;
} {
  const words = transcript.trim().split(/\\s+/).filter(Boolean);
  const foundCities: string[] = [];

  for (const w of words) {
    const norm = trNormalize(w.replace(/[.,!?;:]/g, ''));
    const direct = CITY_MAP.get(norm);
    const stripped = CITY_MAP.get(stripLocationSuffix(norm));
    const city = direct || stripped;
    if (city && !foundCities.includes(city)) {
      foundCities.push(city);
      if (foundCities.length === 2) break;
    }
  }

  return {
    origin: foundCities[0],
    destination: foundCities[1],
    freight: parseSpokenAmount(transcript),
  };
}
