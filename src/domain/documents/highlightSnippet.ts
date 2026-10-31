// Turkish character-insensitive text highlight for Document Archive
const TR_CHAR_MAP: Record<string, string> = {
  İ: 'i', I: 'i', ı: 'i', Ş: 's', ş: 's', Ğ: 'g', ğ: 'g',
  Ü: 'u', ü: 'u', Ö: 'o', ö: 'o', Ç: 'c', ç: 'c',
};

function normChar(ch: string): string {
  return TR_CHAR_MAP[ch] ?? ch.toLowerCase();
}

export function splitHighlightSegments(
  text: string,
  query: string
): Array<{ text: string; hit: boolean }> {
  const terms = query
    .trim()
    .split(/\s+/)
    .map((w) => Array.from(w).map(normChar).join(''))
    .filter((w) => w.length >= 2);

  if (terms.length === 0 || !text) return [{ text, hit: false }];

  const normText = Array.from(text).map(normChar).join('');
  const hitMask = new Array<boolean>(text.length).fill(false);

  for (const term of terms) {
    let idx = 0;
    while (idx <= normText.length - term.length) {
      const found = normText.indexOf(term, idx);
      if (found === -1) break;
      for (let k = found; k < found + term.length; k++) hitMask[k] = true;
      idx = found + term.length;
    }
  }

  const segments: Array<{ text: string; hit: boolean }> = [];
  let start = 0;
  while (start < text.length) {
    const isHit = hitMask[start];
    let end = start + 1;
    while (end < text.length && hitMask[end] === isHit) end++;
    segments.push({ text: text.slice(start, end), hit: isHit });
    start = end;
  }
  return segments;
}
