"use client";

import { useState } from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const surahs = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatihah" },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah" },
  { number: 3, name: "آل عمران", englishName: "Aal-Imran" },
  { number: 4, name: "النساء", englishName: "An-Nisa" },
  { number: 5, name: "المائدة", englishName: "Al-Maidah" },
  { number: 6, name: "الأنعام", englishName: "Al-Anam" },
  { number: 7, name: "الأعراف", englishName: "Al-Araf" },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal" },
  { number: 9, name: "التوبة", englishName: "At-Tawbah" },
  { number: 10, name: "يونس", englishName: "Yunus" },
  { number: 11, name: "هود", englishName: "Hud" },
  { number: 12, name: "يوسف", englishName: "Yusuf" },
  { number: 13, name: "الرعد", englishName: "Ar-Rad" },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim" },
  { number: 15, name: "الحجر", englishName: "Al-Hijr" },
  { number: 16, name: "النحل", englishName: "An-Nahl" },
  { number: 17, name: "الإسراء", englishName: "Al-Isra" },
  { number: 18, name: "الكهف", englishName: "Al-Kahf" },
  { number: 19, name: "مريم", englishName: "Maryam" },
  { number: 20, name: "طه", englishName: "Taha" },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiya" },
  { number: 22, name: "الحج", englishName: "Al-Hajj" },
  { number: 23, name: "المؤمنون", englishName: "Al-Muminun" },
  { number: 24, name: "النور", englishName: "An-Nur" },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan" },
  { number: 26, name: "الشعراء", englishName: "Ash-Shuara" },
  { number: 27, name: "النمل", englishName: "An-Naml" },
  { number: 28, name: "القصص", englishName: "Al-Qasas" },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankabut" },
  { number: 30, name: "الروم", englishName: "Ar-Rum" },
  { number: 31, name: "لقمان", englishName: "Luqman" },
  { number: 32, name: "السجدة", englishName: "As-Sajdah" },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab" },
  { number: 34, name: "سبأ", englishName: "Saba" },
  { number: 35, name: "فاطر", englishName: "Fatir" },
  { number: 36, name: "يس", englishName: "Ya-Sin" },
  { number: 37, name: "الصافات", englishName: "As-Saffat" },
  { number: 38, name: "ص", englishName: "Sad" },
  { number: 39, name: "الزمر", englishName: "Az-Zumar" },
  { number: 40, name: "غافر", englishName: "Ghafir" },
  { number: 41, name: "فصلت", englishName: "Fussilat" },
  { number: 42, name: "الشورى", englishName: "Ash-Shura" },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf" },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan" },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiyah" },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf" },
  { number: 47, name: "محمد", englishName: "Muhammad" },
  { number: 48, name: "الفتح", englishName: "Al-Fath" },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat" },
  { number: 50, name: "ق", englishName: "Qaf" },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat" },
  { number: 52, name: "الطور", englishName: "At-Tur" },
  { number: 53, name: "النجم", englishName: "An-Najm" },
  { number: 54, name: "القمر", englishName: "Al-Qamar" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman" },
  { number: 56, name: "الواقعة", englishName: "Al-Waqiah" },
  { number: 57, name: "الحديد", englishName: "Al-Hadid" },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadilah" },
  { number: 59, name: "الحشر", englishName: "Al-Hashr" },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah" },
  { number: 61, name: "الصف", englishName: "As-Saff" },
  { number: 62, name: "الجمعة", englishName: "Al-Jumuah" },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun" },
  { number: 64, name: "التغابن", englishName: "At-Taghabun" },
  { number: 65, name: "الطلاق", englishName: "At-Talaq" },
  { number: 66, name: "التحريم", englishName: "At-Tahrim" },
  { number: 67, name: "الملك", englishName: "Al-Mulk" },
  { number: 68, name: "القلم", englishName: "Al-Qalam" },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqah" },
  { number: 70, name: "المعارج", englishName: "Al-Maarij" },
  { number: 71, name: "نوح", englishName: "Nuh" },
  { number: 72, name: "الجن", englishName: "Al-Jinn" },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil" },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir" },
  { number: 75, name: "القيامة", englishName: "Al-Qiyamah" },
  { number: 76, name: "الإنسان", englishName: "Al-Insan" },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat" },
  { number: 78, name: "النبأ", englishName: "An-Naba" },
  { number: 79, name: "النازعات", englishName: "An-Naziat" },
  { number: 80, name: "عبس", englishName: "Abasa" },
  { number: 81, name: "التكوير", englishName: "At-Takwir" },
  { number: 82, name: "الانفطار", englishName: "Al-Infitar" },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin" },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq" },
  { number: 85, name: "البروج", englishName: "Al-Buruj" },
  { number: 86, name: "الطارق", englishName: "At-Tariq" },
  { number: 87, name: "الأعلى", englishName: "Al-Ala" },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah" },
  { number: 89, name: "الفجر", englishName: "Al-Fajr" },
  { number: 90, name: "البلد", englishName: "Al-Balad" },
  { number: 91, name: "الشمس", englishName: "Ash-Shams" },
  { number: 92, name: "الليل", englishName: "Al-Layl" },
  { number: 93, name: "الضحى", englishName: "Ad-Duha" },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh" },
  { number: 95, name: "التين", englishName: "At-Tin" },
  { number: 96, name: "العلق", englishName: "Al-Alaq" },
  { number: 97, name: "القدر", englishName: "Al-Qadr" },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah" },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah" },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat" },
  { number: 101, name: "القارعة", englishName: "Al-Qariah" },
  { number: 102, name: "التكاثر", englishName: "At-Takathur" },
  { number: 103, name: "العصر", englishName: "Al-Asr" },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah" },
  { number: 105, name: "الفيل", englishName: "Al-Fil" },
  { number: 106, name: "قريش", englishName: "Quraysh" },
  { number: 107, name: "الماعون", englishName: "Al-Maun" },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar" },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun" },
  { number: 110, name: "النصر", englishName: "An-Nasr" },
  { number: 111, name: "المسد", englishName: "Al-Masad" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas" },
  { number: 113, name: "الفلق", englishName: "Al-Falaq" },
  { number: 114, name: "الناس", englishName: "An-Nas" },
];

export default function AddQuranPage() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [fromAyah, setFromAyah] = useState<number>(1);
  const [toAyah, setToAyah] = useState<number>(7);
  const [title, setTitle] = useState<string>("");
  const [ayahs, setAyahs] = useState<
    { numberInSurah: number; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedSurahInfo = surahs.find((s) => s.number === selectedSurah);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setAyahs([]);

    try {
      const res = await fetch(
        `/api/quran?surah=${selectedSurah}&from=${fromAyah}&to=${toAyah}`
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch ayahs (${res.status})`);
      }
      const json = await res.json();
      if (!json.data?.ayahs || json.data.ayahs.length === 0) {
        throw new Error("No ayahs found for this range.");
      }
      setAyahs(json.data.ayahs);

      if (!title && selectedSurahInfo) {
        setTitle(
          `${selectedSurahInfo.englishName} ${fromAyah}-${toAyah}`
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (ayahs.length === 0) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const arabic = ayahs.map((a) => a.text).join(" ");
      const res = await fetch("/api/dhikr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || `${selectedSurahInfo?.englishName ?? "Quran"} ${fromAyah}-${toAyah}`,
          arabic,
          startAyah: fromAyah,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to save (${res.status})`);
      }
      setSuccess("Dhikr saved successfully!");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10 max-w-4xl mx-auto">
      <Link
        href="/admin"
        className="text-sm text-blue-400 hover:text-blue-300 mb-6 inline-block"
      >
        &larr; Back to {APP_NAME} Admin
      </Link>

      <h1 className="text-3xl font-bold mb-8">Add from Quran</h1>

      {/* Surah & Ayah Selection */}
      <section className="bg-gray-900 rounded-xl p-6 mb-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Surah
          </label>
          <select
            value={selectedSurah}
            onChange={(e) => {
              const num = Number(e.target.value);
              setSelectedSurah(num);
              setFromAyah(1);
              setToAyah(1);
              setAyahs([]);
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {surahs.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.name} — {s.englishName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              From Ayah
            </label>
            <input
              type="number"
              min={1}
              value={fromAyah}
              onChange={(e) => setFromAyah(Math.max(1, Number(e.target.value)))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              To Ayah
            </label>
            <input
              type="number"
              min={1}
              value={toAyah}
              onChange={(e) => setToAyah(Math.max(1, Number(e.target.value)))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleFetch}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? "Fetching..." : "Fetch Ayahs"}
        </button>
      </section>

      {/* Error / Success Messages */}
      {error && (
        <div className="bg-red-900/40 border border-red-600 text-red-200 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/40 border border-green-600 text-green-200 rounded-lg p-4 mb-6">
          {success}
        </div>
      )}

      {/* Preview */}
      {ayahs.length > 0 && (
        <section className="bg-gray-900 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Preview — {ayahs.length} ayah{ayahs.length !== 1 && "s"}
          </h2>

          <div className="space-y-4 mb-6">
            {ayahs.map((ayah) => (
              <div key={ayah.numberInSurah} className="flex gap-4 items-start">
                <span className="text-xs text-gray-500 mt-1 min-w-[2rem] text-right">
                  {ayah.numberInSurah}
                </span>
                <p
                  dir="rtl"
                  className="text-2xl leading-relaxed text-gray-100"
                  style={{ fontFamily: "Amiri, Scheherazade, serif" }}
                >
                  {ayah.text}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 pt-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Dhikr Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${selectedSurahInfo?.englishName ?? ""} ${fromAyah}-${toAyah}`}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save to Collection"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
