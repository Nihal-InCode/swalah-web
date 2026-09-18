const https = require('https');
const fs = require('fs');

const SURAH_MAP = {
  "Al-Faatiha": 1, "Al-Baqara": 2, "Aal-i-Imraan": 3, "An-Nisaa": 4,
  "Al-An'aam": 6, "Al-A'raaf": 7, "Al-Anfaal": 8, "At-Tawba": 9,
  "Yunus": 10, "Hud": 11, "Ar-Ra'd": 13, "Ibrahim": 14,
  "Al-Hijr": 15, "An-Nahl": 16, "Al-Israa": 17, "Al-Kahf": 18,
  "Maryam": 19, "Taa-Haa": 20, "Al-Anbiyaa": 21, "Al-Hajj": 22,
  "Al-Muminoon": 23, "An-Noor": 24, "Al-Furqaan": 25, "Ash-Shu'araa": 26,
  "An-Naml": 27, "Ar-Room": 30, "Yaseen": 36, "As-Saaffaat": 37,
  "Az-Zumar": 39, "Ghafir": 40, "Fussilat": 41, "Az-Zukhruf": 43,
  "Al-Hadid": 57, "Al-Hashr": 59, "Al-Jinn": 72, "Az-Zalzala": 99,
  "Al-Kaafiroon": 109, "An-Nasr": 110, "Al-Ikhlaas": 112,
  "Al-Falaq": 113, "An-Naas": 114,
};

const SURAH_REQUESTS = [
  { name: "Al-Faatiha", ayahs: "1-7" },
  { name: "Al-Baqara", ayahs: "1-4,102,152-166,255-257,285-286" },
  { name: "Aal-i-Imraan", ayahs: "1-6,15-30,133-136,190-200" },
  { name: "An-Nisaa", ayahs: "72-77,90-91,116-121,171-173" },
  { name: "Al-An'aam", ayahs: "61,112-113,123-130" },
  { name: "Al-A'raaf", ayahs: "11-22,54-56,115-122,196-206" },
  { name: "Al-Anfaal", ayahs: "7-19,48" },
  { name: "At-Tawba", ayahs: "7-16,25-32,40,128-129" },
  { name: "Yunus", ayahs: "57-64,79-82" },
  { name: "Hud", ayahs: "64-101" },
  { name: "Ar-Ra'd", ayahs: "8-13,28-29" },
  { name: "Ibrahim", ayahs: "10-17,42" },
  { name: "Al-Hijr", ayahs: "28-50" },
  { name: "An-Nahl", ayahs: "63-69,96-102" },
  { name: "Al-Israa", ayahs: "26-28,45-46,53,78-82,105" },
  { name: "Al-Kahf", ayahs: "1-14,103" },
  { name: "Maryam", ayahs: "83" },
  { name: "Taa-Haa", ayahs: "60-70,98-114,124" },
  { name: "Al-Anbiyaa", ayahs: "42-43,74-92" },
  { name: "Al-Hajj", ayahs: "19-24,38-41" },
  { name: "Al-Muminoon", ayahs: "97-118" },
  { name: "An-Noor", ayahs: "35-39" },
  { name: "Al-Furqaan", ayahs: "21-33" },
  { name: "Ash-Shu'araa", ayahs: "78-104,221-227" },
  { name: "An-Naml", ayahs: "59-65,76-77" },
  { name: "Ar-Room", ayahs: "20-27" },
  { name: "Yaseen", ayahs: "1-83" },
  { name: "As-Saaffaat", ayahs: "1-10" },
  { name: "Az-Zumar", ayahs: "21-23" },
  { name: "Ghafir", ayahs: "38-52" },
  { name: "Fussilat", ayahs: "31-36" },
  { name: "Az-Zukhruf", ayahs: "36-38" },
  { name: "Al-Hadid", ayahs: "26-33" },
  { name: "Al-Hashr", ayahs: "18-24" },
  { name: "Al-Jinn", ayahs: "1-28" },
  { name: "Az-Zalzala", ayahs: "1-8" },
  { name: "Al-Kaafiroon", ayahs: "1-6" },
  { name: "An-Nasr", ayahs: "1-3" },
  { name: "Al-Ikhlaas", ayahs: "1-4" },
  { name: "Al-Falaq", ayahs: "1-5" },
  { name: "An-Naas", ayahs: "1-6" },
];

const SURAH_NAMES_AR = {
  1: "الفاتحة", 2: "البقرة", 3: "آل عمران", 4: "النساء",
  6: "الأنعام", 7: "الأعراف", 8: "الأنفال", 9: "التوبة",
  10: "يونس", 11: "هود", 13: "الرعد", 14: "إبراهيم",
  15: "الحجر", 16: "النحل", 17: "الإسراء", 18: "الكهف",
  19: "مريم", 20: "طه", 21: "الأنبياء", 22: "الحج",
  23: "المؤمنون", 24: "النور", 25: "الفرقان", 26: "الشعراء",
  27: "النمل", 30: "الروم", 36: "يس", 37: "الصافات",
  39: "الزمر", 40: "غافر", 41: "فصلت", 43: "الزخرف",
  57: "الحديد", 59: "الحشر", 72: "الجن", 99: "الزلزلة",
  109: "الكافرون", 110: "النصر", 112: "الإخلاص", 113: "الفلق", 114: "الناس"
};

function toArabicNumber(n) {
  const digits = ['\u0660','\u0661','\u0662','\u0663','\u0664','\u0665','\u0666','\u0667','\u0668','\u0669'];
  return n.toString().split('').map(d => digits[parseInt(d)]).join('');
}

function parseAyahRanges(rangeStr) {
  const parts = rangeStr.split(',');
  const ayahs = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number);
      for (let i = start; i <= end; i++) ayahs.push(i);
    } else {
      ayahs.push(Number(trimmed));
    }
  }
  return ayahs;
}

function fetchSurah(surahNum) {
  return new Promise((resolve, reject) => {
    const url = `https://api.alquran.cloud/v1/surah/${surahNum}/ar.alafasy`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching Quran data with ayah markers...\n');
  
  const allEntries = [];
  
  for (const req of SURAH_REQUESTS) {
    const surahNum = SURAH_MAP[req.name];
    const surahAr = SURAH_NAMES_AR[surahNum] || req.name;
    const wantedAyahs = parseAyahRanges(req.ayahs);
    
    process.stdout.write(`Fetching Surah ${surahNum} (${req.name})...`);
    
    const response = await fetchSurah(surahNum);
    
    if (response.code !== 200) {
      console.log(` FAILED`);
      continue;
    }
    
    const ayahs = response.data.ayahs;
    const selectedAyahs = ayahs.filter(a => wantedAyahs.includes(a.numberInSurah));
    
    // Build text with ayah markers: "text ۝١ text ۝٢ ..."
    const arabicText = selectedAyahs.map(a => {
      const marker = `  \u06DD${toArabicNumber(a.numberInSurah)}  `;
      return a.text + marker;
    }).join('');
    
    const firstAyah = Math.min(...wantedAyahs);
    
    allEntries.push({
      title: `سورة ${surahAr} (${req.ayahs})`,
      arabic: arabicText.trim(),
      startAyah: firstAyah,
      sortOrder: allEntries.length,
    });
    
    console.log(` OK (${selectedAyahs.length} ayahs)`);
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\nTotal entries: ${allEntries.length}`);
  
  // Save to database via API
  console.log('\nSaving to database...');
  
  const importRes = await fetch('http://localhost:3000/api/dhikr/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dhikrList: allEntries, replace: true }),
  });
  
  if (importRes.ok) {
    console.log('Successfully imported all entries!');
  } else {
    console.error('Import failed:', await importRes.text());
  }
  
  fs.writeFileSync('./quran-data.json', JSON.stringify(allEntries, null, 2));
  console.log('Saved JSON backup to quran-data.json');
}

main().catch(console.error);
