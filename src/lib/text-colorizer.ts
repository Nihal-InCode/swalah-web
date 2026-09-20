export const ALLAH_COLOR = '#C62828';
export const AYAH_MARKER_COLOR = '#1B5E20';

const ALLAH_PATTERN = /[ٱا]لل[َّ]*ه[َُِّمَّ]*/g;
const AYAH_MARKER_PATTERN = /[۞۝][\u0660-\u0669\u06F0-\u06F9]+/g;

function toArabicNumber(n: number): string {
  const digits = ['\u0660', '\u0661', '\u0662', '\u0663', '\u0664', '\u0665', '\u0666', '\u0667', '\u0668', '\u0669'];
  return n.toString().split('').map(d => digits[parseInt(d)]).join('');
}

function arabicToNumber(arabic: string): number {
  const map: Record<string, string> = {
    '\u0660': '0', '\u0661': '1', '\u0662': '2', '\u0663': '3', '\u0664': '4',
    '\u0665': '5', '\u0666': '6', '\u0667': '7', '\u0668': '8', '\u0669': '9',
  };
  return parseInt(arabic.split('').map(d => map[d] || d).join(''), 10);
}

function convertDotsToMarkers(text: string, startAyah: number): string {
  if (text.includes('\u06DD') || !text.includes('.')) return text;

  if (/^\d+:/.test(text.split('.')[0])) {
    return text.split('.').map(part => {
      const colonIdx = part.indexOf(':');
      if (colonIdx === -1) return part;
      const num = parseInt(part.substring(0, colonIdx));
      const txt = part.substring(colonIdx + 1);
      if (isNaN(num)) return part;
      return `${txt} \u06DD${toArabicNumber(num)}`;
    }).join(' ');
  }

  let counter = startAyah;
  return text.replace(/\./g, () => {
    const marker = `\u06DD${toArabicNumber(counter)}`;
    counter++;
    return ` ${marker} `;
  });
}

export interface TextSegment {
  text: string;
  color: string;
  isBold: boolean;
  isAyahMarker?: boolean;
  ayahNumber?: string;
  ayahIndex?: number;
}

export function colorizeText(
  text: string,
  colorAllah: boolean,
  colorAyahMarkers: boolean,
  defaultColor: string,
  startAyah: number
): TextSegment[] {
  const normalizedText = convertDotsToMarkers(text, startAyah);

  const allMatches: { start: number; end: number; group: string; type: 'allah' | 'ayah' }[] = [];

  if (colorAllah) {
    const pattern = /[ٱا]لل[َّ]*ه[َُِّمَّ]*/g;
    let match;
    while ((match = pattern.exec(normalizedText)) !== null) {
      allMatches.push({ start: match.index, end: match.index + match[0].length, group: match[0], type: 'allah' });
    }
  }

  // Always split by ayah markers (needed for ayahIndex assignment)
  {
    const pattern = / ۝([٠-٩]+) /g;
    let match;
    while ((match = pattern.exec(normalizedText)) !== null) {
      allMatches.push({ start: match.index, end: match.index + match[0].length, group: match[0], type: 'ayah' });
    }
  }

  allMatches.sort((a, b) => a.start - b.start);

  const mergedMatches: typeof allMatches = [];
  for (const match of allMatches) {
    if (mergedMatches.length > 0 && match.start < mergedMatches[mergedMatches.length - 1].end) {
      continue;
    }
    mergedMatches.push(match);
  }

  if (mergedMatches.length === 0) {
    return [{ text: normalizedText, color: defaultColor, isBold: false }];
  }

  const segments: TextSegment[] = [];
  let lastEnd = 0;

  for (const match of mergedMatches) {
    if (match.start > lastEnd) {
      segments.push({ text: normalizedText.substring(lastEnd, match.start), color: defaultColor, isBold: false });
    }

    const matchColor = match.type === 'allah' ? ALLAH_COLOR : AYAH_MARKER_COLOR;
    const isBold = match.type === 'allah';
    const isAyahMarker = match.type === 'ayah';

    if (isAyahMarker) {
      const numMatch = match.group.match(/([٠-٩]+)/);
      const markerColor = colorAyahMarkers ? matchColor : defaultColor;
      segments.push({ text: match.group, color: markerColor, isBold: false, isAyahMarker: true, ayahNumber: numMatch?.[1] || '' });
    } else {
      segments.push({ text: match.group, color: matchColor, isBold });
    }
    lastEnd = match.end;
  }

  if (lastEnd < normalizedText.length) {
    segments.push({ text: normalizedText.substring(lastEnd), color: defaultColor, isBold: false });
  }

  // Post-pass: assign ayahIndex to each segment
  let currentAyahIndex = startAyah;
  for (const seg of segments) {
    if (seg.isAyahMarker && seg.ayahNumber) {
      currentAyahIndex = arabicToNumber(seg.ayahNumber);
      seg.ayahIndex = currentAyahIndex;
    } else {
      seg.ayahIndex = currentAyahIndex;
    }
  }

  return segments;
}
