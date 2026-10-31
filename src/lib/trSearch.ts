// Turkish character normalization and insensitive search helpers
const TR_MAP: Record<string, string> = {
  'İ': 'i', 'I': 'i', 'ı': 'i',
  'Ş': 's', 'ş': 's',
  'Ğ': 'g', 'ğ': 'g',
  'Ü': 'u', 'ü': 'u',
  'Ö': 'o', 'ö': 'o',
  'Ç': 'c', 'ç': 'c',
};

export function trNormalize(text: unknown): string {
  if (text === null || text === undefined) return '';
  const str = String(text);
  return Array.from(str)
    .map((char) => TR_MAP[char] ?? char.toLowerCase())
    .join('')
    .trim();
}

export function trIncludes(target: unknown, query: unknown): boolean {
  return trNormalize(target).includes(trNormalize(query));
}

export function formatPlate(raw: string): string {
  if (!raw) return '';
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  // Match standard Turkish plates (e.g. 34ABC123 or 06K1234 or 41KYA308)
  const m = clean.match(/^(\d{2})([A-Z]{1,3})(\d{2,5})$/);
  if (m) {
    return `${m[1]} ${m[2]} ${m[3]}`;
  }
  return clean;
}
