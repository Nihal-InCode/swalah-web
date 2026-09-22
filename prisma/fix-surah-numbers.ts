import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SURAH_MAP: Record<string, number> = {
  'الفاتحة': 1, 'البقرة': 2, 'آل عمران': 3, 'النساء': 4, 'المائدة': 5,
  'الأنعام': 6, 'الأعراف': 7, 'الأنفال': 8, 'التوبة': 9, 'يونس': 10,
  'هود': 11, 'يوسف': 12, 'الرعد': 13, 'إبراهيم': 14, 'الحجر': 15,
  'النحل': 16, 'الإسراء': 17, 'الكهف': 18, 'مريم': 19, 'طه': 20,
  'الأنبياء': 21, 'الحج': 22, 'المؤمنون': 23, 'النور': 24, 'الفرقان': 25,
  'الشعراء': 26, 'النمل': 27, 'القصص': 28, 'العنكبوت': 29, 'الروم': 30,
  'لقمان': 31, 'السجدة': 32, 'الأحزاب': 33, 'سبأ': 34, 'فاطر': 35,
  'يس': 36, 'الصافات': 37, 'ص': 38, 'الزمر': 39, 'غافر': 40,
  'فصلت': 41, 'الشورى': 42, 'الزخرف': 43, 'الدخان': 44, 'الجاثية': 45,
  'الأحقاف': 46, 'محمد': 47, 'الفتح': 48, 'الحجرات': 49, 'ق': 50,
  'الذاريات': 51, 'الطور': 52, 'النجم': 53, 'القمر': 54, 'الرحمن': 55,
  'الواقعة': 56, 'الحديد': 57, 'المجادلة': 58, 'الحشر': 59, 'الممتحنة': 60,
  'الصف': 61, 'الجمعة': 62, 'المنافقون': 63, 'التغابن': 64, 'الطلاق': 65,
  'التحريم': 66, 'الملك': 67, 'القلم': 68, 'الحاقة': 69, 'المعارج': 70,
  'نوح': 71, 'الجن': 72, 'المزمل': 73, 'المدثر': 74, 'القيامة': 75,
  'الإنسان': 76, 'المرسلات': 77, 'النبأ': 78, 'النازعات': 79, 'عبس': 80,
  'التكوير': 81, 'الانفطار': 82, 'المطففين': 83, 'الانشقاق': 84, 'البروج': 85,
  'الطارق': 86, 'الأعلى': 87, 'الغاشية': 88, 'الفجر': 89, 'البلد': 90,
  'الشمس': 91, 'الليل': 92, 'الضحى': 93, 'الشرح': 94, 'التين': 95,
  'العلق': 96, 'القدر': 97, 'البينة': 98, 'الزلزلة': 99, 'العاديات': 100,
  'القارعة': 101, 'التكاثر': 102, 'العصر': 103, 'الهمزة': 104, 'الفيل': 105,
  'قريش': 106, 'الماعون': 107, 'الكوثر': 108, 'الكافرون': 109, 'النصر': 110,
  'المسد': 111, 'الإخلاص': 112, 'الفلق': 113, 'الناس': 114,
};

const ENGLISH_MAP: Record<string, number> = {
  'fatihah': 1, 'al-fatihah': 1, 'al-fatiha': 1, 'the-opening': 1,
  'baqarah': 2, 'al-baqarah': 2, 'the-cow': 2,
  'imran': 3, 'aal-imran': 3, 'aal-imraan': 3, 'family-of-imran': 3,
  'an-nisa': 4, 'nisa': 4, 'the-women': 4,
  'al-maidah': 5, 'maidah': 5, 'al-maaidah': 5, 'the-table': 5, 'the-table-spread': 5,
  'al-anam': 6, 'anam': 6, 'the-cattle': 6,
  'al-araf': 7, 'araf': 7, 'the-elevated-places': 7,
  'al-anfal': 8, 'anfal': 8, 'the-spoils': 8,
  'at-tawbah': 9, 'tawbah': 9, 'the-repentance': 9,
  'yunus': 10, 'jonah': 10,
  'hud': 11,
  'yusuf': 12, 'joseph': 12,
  'ar-rad': 13, 'the-thunder': 13,
  'ibrahim': 14, 'abraham': 14,
  'al-hijr': 15, 'the-rock': 15,
  'an-nahl': 16, 'the-bee': 16,
  'al-isra': 17, 'the-night-journey': 17, 'isra': 17,
  'al-kahf': 18, 'the-cave': 18,
  'maryam': 19, 'mary': 19,
  'taha': 20,
  'al-anbiya': 21, 'the-prophets': 21,
  'al-hajj': 22, 'the-pilgrimage': 22,
  'al-muminun': 23, 'the-believers': 23,
  'an-nur': 24, 'the-light': 24,
  'al-furqan': 25, 'the-criterion': 25,
  'ash-shuara': 26, 'the-poets': 26,
  'an-naml': 27, 'the-ant': 27,
  'al-qasas': 28, 'the-narrative': 28, 'the-story': 28,
  'al-ankabut': 29, 'the-spider': 29,
  'ar-rum': 30, 'the-romans': 30,
  'luqman': 31,
  'as-sajdah': 32, 'the-prostration': 32,
  'al-ahzab': 33, 'the-confederates': 33,
  'saba': 34, 'sheba': 34,
  'fatir': 35, 'originator': 35,
  'ya-sin': 36, 'yaseen': 36, 'ya-seen': 36,
  'as-saffat': 37, 'those-ranged-in-ranks': 37, 'the-ranks': 37,
  'sad': 38,
  'az-zumar': 39, 'the-troops': 39, 'the-groups': 39,
  'ghafir': 40, 'the-forgiver': 40,
  'fussilat': 41, 'explained-in-detail': 41, 'detailed': 41,
  'ash-shura': 42, 'the-counsel': 42,
  'az-zukhruf': 43, 'the-ornaments': 43, 'gold-adornments': 43,
  'ad-dukh': 44, 'ad-dukhan': 44, 'the-smoke': 44,
  'al-jathiyah': 45, 'the-crouching': 45,
  'al-ahqaf': 46, 'the-wind-curved-sandhills': 46,
  'muhammad': 47,
  'al-fath': 48, 'the-victory': 48,
  'al-hujurat': 49, 'the-rooms': 49,
  'qaf': 50,
  'adh-dhariyat': 51, 'the-scattering-winds': 51, 'the-winnowing-winds': 51,
  'at-tur': 52, 'the-mount': 52,
  'an-najm': 53, 'the-star': 53,
  'al-qamar': 54, 'the-moon': 54,
  'ar-rahman': 55, 'the-most-merciful': 55,
  'al-waqiah': 56, 'the-inevitable': 56, 'the-event': 56,
  'al-hadid': 57, 'the-iron': 57,
  'al-mujadilah': 58, 'the-pleading': 58, 'she-that-disputeth': 58,
  'al-hashr': 59, 'the-exile': 59, 'the-gathering': 59,
  'al-mumtahanah': 60, 'she-that-is-to-be-examined': 60,
  'as-saff': 61, 'the-row': 61, 'the-solid-soldiers': 61,
  'al-jumuah': 62, 'friday': 62, 'congregation': 62,
  'al-munafiqun': 63, 'the-hypocrites': 63,
  'at-taghabun': 64, 'mutual-disillusion': 64,
  'at-talaq': 65, 'divorce': 65,
  'at-tahrim': 66, 'the-prohibition': 66,
  'al-mulk': 67, 'the-sovereignty': 67, 'the-kingdom': 67,
  'al-qalam': 68, 'the-pen': 68,
  'al-haqqah': 69, 'the-reality': 69,
  'al-maarij': 70, 'the-ascension': 70, 'the-stairways': 70,
  'nuh': 71, 'noah': 71,
  'al-jinn': 72, 'the-jinn': 72,
  'al-muzzammil': 73, 'the-enshrouded-one': 73, 'the-enwrapped-one': 73,
  'al-muddaththir': 74, 'the-cloaked-one': 74, 'the-man-wearing-a-cloak': 74,
  'al-qiyamah': 75, 'the-resurrection': 75,
  'al-insan': 76, 'the-man': 76,
  'al-mursalat': 77, 'the-emissaries': 77, 'those-sent-forth': 77,
  'an-naba': 78, 'the-tidings': 78,
  'an-naziat': 79, 'those-who-drag-forth': 79, 'the-draggers-forth': 79,
  'abasa': 80, 'he-frowned': 80,
  'at-takwir': 81, 'the-overthrowing': 81,
  'al-infitar': 82, 'the-cleaving': 82,
  'al-mutaffifin': 83, 'the-defrauding': 83,
  'al-inshiqaq': 84, 'the-splitting-open': 84,
  'al-buruj': 85, 'the-great-star': 85, 'the-mansions-of-the-stars': 85,
  'at-tariq': 86, 'the-night-comer': 86,
  'al-ala': 87, 'the-most-high': 87,
  'al-ghashiyah': 88, 'the-overwhelming': 88,
  'al-fajr': 89, 'the-dawn': 89,
  'al-balad': 90, 'the-city': 90,
  'ash-shams': 91, 'the-sun': 91,
  'al-layl': 92, 'the-night': 92,
  'ad-duha': 93, 'the-morning-hours': 93, 'the-bright-morning': 93,
  'ash-sharh': 94, 'the-relief': 94,
  'at-tin': 95, 'the-fig': 95,
  'al-alaq': 96, 'the-clot': 96, 'blood-clot': 96,
  'al-qadr': 97, 'the-power': 97, 'the-decree': 97,
  'al-bayyinah': 98, 'the-clear-proof': 98,
  'az-zalzalah': 99, 'the-earthquake': 99,
  'al-adiyat': 100, 'the-chargers': 100, 'the-coursers': 100,
  'al-qariah': 101, 'the-calamity': 101,
  'at-takathur': 102, 'the-rivalry-in-worldly-increase': 102,
  'al-asr': 103, 'the-daylight': 103, 'the-time': 103,
  'al-humazah': 104, 'the-slanderer': 104,
  'al-fil': 105, 'the-elephant': 105,
  'quraysh': 106,
  'al-maun': 107, 'the-small-kindnesses': 107, 'alms-giving': 107,
  'al-kawthar': 108, 'abundance': 108,
  'al-kafirun': 109, 'the-disbelievers': 109,
  'an-nasr': 110, 'the-divine-support': 110, 'victory': 110,
  'al-masad': 111, 'the-palm-fiber': 111, 'the-abundant-fire': 111,
  'al-ikhlas': 112, 'the-sincerity': 112, 'sincerity': 112, 'pure-faith': 112,
  'al-falaq': 113, 'the-daybreak': 113, 'the-rising-day': 113,
  'an-nas': 114, 'mankind': 114, 'humanity': 114,
};

async function main() {
  const dhikrs = await prisma.dhikr.findMany();
  let updated = 0;

  for (const d of dhikrs) {
    let matched = false;

    // Try Arabic name match: "سورة X (" or "سورة X"
    const arMatch = d.title.match(/سورة\s+(.+?)\s*[\(\d]/);
    if (arMatch) {
      const arName = arMatch[1].trim();
      const num = SURAH_MAP[arName];
      if (num && num !== d.surahNumber) {
        await prisma.dhikr.update({ where: { id: d.id }, data: { surahNumber: num } });
        console.log(`Updated ${d.id} (Arabic): "${d.title}" → surahNumber ${num}`);
        updated++;
        matched = true;
      }
    }

    if (matched) continue;

    // Try English name match: "EnglishName 1-5" or "EnglishName (1-5)"
    const enMatch = d.title.match(/^([A-Za-z\s\-\']+?)\s+[\d]/);
    if (enMatch) {
      const enName = enMatch[1].trim().toLowerCase();
      const num = ENGLISH_MAP[enName];
      if (num && num !== d.surahNumber) {
        await prisma.dhikr.update({ where: { id: d.id }, data: { surahNumber: num } });
        console.log(`Updated ${d.id} (English): "${d.title}" → surahNumber ${num}`);
        updated++;
        matched = true;
      }
    }

    if (matched) continue;

    // Fallback: if surahNumber is 1 but title doesn't mention Al-Fatihah, try harder
    if (d.surahNumber === 1) {
      const titleLower = d.title.toLowerCase();
      const isFatihah = titleLower.includes('fatihah') || titleLower.includes('fatiha') || d.title.includes('الفاتحة');
      if (!isFatihah) {
        // Try to match any English name from the title
        for (const [name, num] of Object.entries(ENGLISH_MAP)) {
          if (titleLower.includes(name) && num !== 1) {
            await prisma.dhikr.update({ where: { id: d.id }, data: { surahNumber: num } });
            console.log(`Updated ${d.id} (Fallback): "${d.title}" matched "${name}" → surahNumber ${num}`);
            updated++;
            break;
          }
        }
      }
    }
  }

  // Verify: show all entries and their surahNumber
  console.log('\n--- All entries ---');
  const all = await prisma.dhikr.findMany({ orderBy: { sortOrder: 'asc' } });
  for (const d of all) {
    console.log(`  [${d.id}] surah=${d.surahNumber} "${d.title}"`);
  }

  console.log(`\nDone. Updated ${updated} entries.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
