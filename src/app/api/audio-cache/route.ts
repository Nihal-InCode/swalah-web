import { NextResponse } from 'next/server';
import { SURAH_AYAH_COUNTS, CUMULATIVE_AYAHS } from '@/lib/quran-audio';

// Only include surahs used in the app
const APP_SURAHS = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25, 26, 27, 30, 36, 37, 39, 40, 41, 43,
  57, 59, 72, 99, 109, 110, 112, 113, 114];

export async function GET() {
  const urls: string[] = [];

  for (const surah of APP_SURAHS) {
    for (let ayah = 1; ayah <= SURAH_AYAH_COUNTS[surah]; ayah++) {
      const globalNum = CUMULATIVE_AYAHS[surah - 1] + ayah;
      urls.push(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalNum}.mp3`);
    }
  }

  return NextResponse.json({ urls, count: urls.length });
}
