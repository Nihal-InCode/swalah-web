import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SURAH_MAP: Record<string, number> = {
  'الفاتحة': 1, 'البقرة': 2, 'آل عمران': 3, 'النساء': 4,
  'الأنعام': 6, 'الأعراف': 7, 'الأنفال': 8, 'التوبة': 9,
  'يونس': 10, 'هود': 11, 'الرعد': 13, 'إبراهيم': 14,
  'الحجر': 15, 'النحل': 16, 'الإسراء': 17, 'الكهف': 18,
  'مريم': 19, 'طه': 20, 'الأنبياء': 21, 'الحج': 22,
  'المؤمنون': 23, 'النور': 24, 'الفرقان': 25, 'الشعراء': 26,
  'النمل': 27, 'الروم': 30, 'يس': 36, 'الصافات': 37,
  'الزمر': 39, 'غافر': 40, 'فصلت': 41, 'الزخرف': 43,
  'الحديد': 57, 'الحشر': 59, 'الجن': 72, 'الزلزلة': 99,
  'الكافرون': 109, 'النصر': 110, 'الإخلاص': 112, 'الفلق': 113, 'الناس': 114,
};

const ENGLISH_MAP: Record<string, number> = {
  'fatihah': 1, 'al-fatihah': 1, 'baqarah': 2, 'al-baqarah': 2,
  'imran': 3, 'aal-imran': 3, 'an-nisa': 4, 'nisa': 4,
  'al-maidah': 5, 'maidah': 5, 'al-anam': 6, 'anam': 6,
  'al-araf': 7, 'araf': 7, 'al-anfal': 8, 'anfal': 8,
  'at-tawbah': 9, 'tawbah': 9, 'yunus': 10, 'hud': 11,
  'yusuf': 12, 'ar-rad': 13, 'ibrahim': 14, 'al-hijr': 15,
  'an-nahl': 16, 'al-isra': 17, 'al-kahf': 18, 'maryam': 19,
  'taha': 20, 'al-anbiya': 21, 'al-hajj': 22, 'al-muminun': 23,
  'an-nur': 24, 'al-furqan': 25, 'ash-shuara': 26, 'an-naml': 27,
  'al-qasas': 28, 'al-ankabut': 29, 'ar-rum': 30, 'luqman': 31,
  'as-sajdah': 32, 'al-ahzab': 33, 'saba': 34, 'fatir': 35,
  'ya-sin': 36, 'yaseen': 36, 'as-saffat': 37, 'sad': 38,
  'az-zumar': 39, 'ghafir': 40, 'fussilat': 41, 'ash-shura': 42,
  'az-zukhruf': 43, 'ad-dukh': 44, 'al-jathiyah': 45, 'al-ahqaf': 46,
  'muhammad': 47, 'al-fath': 48, 'al-hujurat': 49, 'qaf': 50,
  'adh-dhariyat': 51, 'at-tur': 52, 'an-najm': 53, 'al-qamar': 54,
  'ar-rahman': 55, 'al-waqiah': 56, 'al-hadid': 57, 'al-mujadilah': 58,
  'al-hashr': 59, 'al-mumtahanah': 60, 'as-saff': 61, 'al-jumuah': 62,
  'al-munafiqun': 63, 'at-taghabun': 64, 'at-talaq': 65, 'at-tahrim': 66,
  'al-mulk': 67, 'al-qalam': 68, 'al-haqqah': 69, 'al-maarij': 70,
  'nuh': 71, 'al-jinn': 72, 'al-muzzammil': 73, 'al-muddaththir': 74,
  'al-qiyamah': 75, 'al-insan': 76, 'al-mursalat': 77, 'an-naba': 78,
  'an-naziat': 79, 'abasa': 80, 'at-takwir': 81, 'al-infitar': 82,
  'al-mutaffifin': 83, 'al-inshiqaq': 84, 'al-buruj': 85, 'at-tariq': 86,
  'al-ala': 87, 'al-ghashiyah': 88, 'al-fajr': 89, 'al-balad': 90,
  'ash-shams': 91, 'al-layl': 92, 'ad-duha': 93, 'ash-sharh': 94,
  'at-tin': 95, 'al-alaq': 96, 'al-qadr': 97, 'al-bayyinah': 98,
  'az-zalzalah': 99, 'al-adiyat': 100, 'al-qariah': 101, 'at-takathur': 102,
  'al-asr': 103, 'al-humazah': 104, 'al-fil': 105, 'quraysh': 106,
  'al-maun': 107, 'al-kawthar': 108, 'al-kafirun': 109, 'an-nasr': 110,
  'al-masad': 111, 'al-ikhlas': 112, 'al-falaq': 113, 'an-nas': 114,
};

async function main() {
  const dhikrs = await prisma.dhikr.findMany();
  let updated = 0;
  for (const d of dhikrs) {
    // Try Arabic name match: "سورة X ("
    const arMatch = d.title.match(/سورة\s+(.+?)\s*\(/);
    if (arMatch) {
      const arName = arMatch[1].trim();
      const num = SURAH_MAP[arName];
      if (num && num !== d.surahNumber) {
        await prisma.dhikr.update({ where: { id: d.id }, data: { surahNumber: num } });
        console.log(`Updated ${d.id} (Arabic): ${arName} → ${num}`);
        updated++;
        continue;
      }
    }

    // Try English name match: "EnglishName 1-5" or "EnglishName (1-5)"
    const enMatch = d.title.match(/^([A-Za-z\s\-]+?)\s+[\d]+/);
    if (enMatch) {
      const enName = enMatch[1].trim().toLowerCase();
      const num = ENGLISH_MAP[enName];
      if (num && num !== d.surahNumber) {
        await prisma.dhikr.update({ where: { id: d.id }, data: { surahNumber: num } });
        console.log(`Updated ${d.id} (English): ${enMatch[1].trim()} → ${num}`);
        updated++;
        continue;
      }
    }
  }
  console.log(`Done. Updated ${updated} entries.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
