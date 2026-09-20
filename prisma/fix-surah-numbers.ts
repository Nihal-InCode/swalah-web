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

async function main() {
  const dhikrs = await prisma.dhikr.findMany();
  let updated = 0;
  for (const d of dhikrs) {
    const match = d.title.match(/سورة\s+(.+?)\s*\(/);
    if (match) {
      const arName = match[1].trim();
      const num = SURAH_MAP[arName];
      if (num && num !== d.surahNumber) {
        await prisma.dhikr.update({ where: { id: d.id }, data: { surahNumber: num } });
        console.log(`Updated ${d.id}: ${arName} → ${num}`);
        updated++;
      }
    }
  }
  console.log(`Done. Updated ${updated} entries.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
