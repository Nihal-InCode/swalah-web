import { NextResponse } from 'next/server';

const SURAH_COUNTS = [0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 37, 35, 30, 20,
  56, 28, 28, 28, 28, 28, 28, 23, 11, 35, 29, 22, 28, 28, 20, 56, 40, 31,
  50, 40, 46, 18, 28, 15, 21, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28,
  28, 20, 56, 37, 38, 28, 28, 20, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 5, 6, 12, 11, 6, 3, 7, 3, 9, 5, 4, 7, 3, 6,
  3, 5, 4, 5, 6, 3, 5, 4, 5, 4, 8, 18, 5, 4, 3, 6,
  3, 5, 5, 3, 4, 3, 6, 3, 5, 3, 4, 3, 6, 3, 5, 4,
  5, 3, 6, 3, 5, 4, 5, 3, 6, 3, 5, 4, 5, 3, 6, 3,
  5, 4, 5, 3, 6, 3, 5, 4, 5, 3, 6, 3, 5, 4, 5, 6];

// Only include surahs used in the app
const APP_SURAHS = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25, 26, 27, 30, 36, 37, 39, 40, 41, 43,
  57, 59, 72, 99, 109, 110, 112, 113, 114];

const CUMULATIVE = [0];
for (let i = 1; i <= 114; i++) {
  CUMULATIVE.push(CUMULATIVE[i - 1] + SURAH_COUNTS[i]);
}

export async function GET() {
  const urls: string[] = [];

  for (const surah of APP_SURAHS) {
    for (let ayah = 1; ayah <= SURAH_COUNTS[surah]; ayah++) {
      const globalNum = CUMULATIVE[surah - 1] + ayah;
      urls.push(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalNum}.mp3`);
    }
  }

  return NextResponse.json({ urls, count: urls.length });
}
