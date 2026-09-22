// Surah ayah counts (standard Quran data)
const SURAH_AYAH_COUNTS: number[] = [
  0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 37, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52,
  52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22,
  17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11,
  8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6, 3, 5, 4,
  5, 4, 8, 18, 5, 4, 3, 6, 3, 5, 5, 3, 4, 3, 6, 3,
  5, 3, 4, 3, 6, 3, 5, 4, 5, 3, 6, 3, 5, 4, 5, 3,
  6, 3, 5, 4, 5, 3, 6, 3, 5, 4, 5, 3, 6, 3, 5, 4,
  5, 6,
];

// Cumulative ayah counts before each surah
const CUMULATIVE_AYAHS: number[] = [0];
for (let i = 1; i <= 114; i++) {
  CUMULATIVE_AYAHS.push(CUMULATIVE_AYAHS[i - 1] + SURAH_AYAH_COUNTS[i]);
}

export function getGlobalAyahNumber(surahNumber: number, localAyah: number): number {
  return CUMULATIVE_AYAHS[surahNumber - 1] + localAyah;
}

export function getAyahAudioUrl(globalNumber: number): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalNumber}.mp3`;
}

export function getSurahAyahCount(surahNumber: number): number {
  return SURAH_AYAH_COUNTS[surahNumber] || 0;
}

function arabicToNumber(arabic: string): number {
  const map: Record<string, string> = {
    '\u0660': '0', '\u0661': '1', '\u0662': '2', '\u0663': '3', '\u0664': '4',
    '\u0665': '5', '\u0666': '6', '\u0667': '7', '\u0668': '8', '\u0669': '9',
  };
  return parseInt(arabic.split('').map(d => map[d] || d).join(''), 10);
}

export function extractAyahsFromText(text: string, startAyah: number): number[] {
  const markerPattern = /\u06DD([\u0660-\u0669]+)/g;
  const ayahs: number[] = [];
  let match;
  while ((match = markerPattern.exec(text)) !== null) {
    ayahs.push(arabicToNumber(match[1]));
  }
  if (ayahs.length === 0 && startAyah) {
    ayahs.push(startAyah);
  }
  return ayahs;
}

// Surah names in Arabic for display
export const SURAH_NAMES_AR: Record<number, string> = {
  1: "الفاتحة", 2: "البقرة", 3: "آل عمران", 4: "النساء", 5: "المائدة",
  6: "الأنعام", 7: "الأعراف", 8: "الأنفال", 9: "التوبة", 10: "يونس",
  11: "هود", 12: "يوسف", 13: "الرعد", 14: "إبراهيم", 15: "الحجر",
  16: "النحل", 17: "الإسراء", 18: "الكهف", 19: "مريم", 20: "طه",
  21: "الأنبياء", 22: "الحج", 23: "المؤمنون", 24: "النور", 25: "الفرقان",
  26: "الشعراء", 27: "النمل", 28: "القصص", 29: "العنكبوت", 30: "الروم",
  31: "لقمان", 32: "السجدة", 33: "الأحزاب", 34: "سبأ", 35: "فاطر",
  36: "يس", 37: "الصافات", 38: "ص", 39: "الزمر", 40: "غافر",
  41: "فصلت", 42: "الشورى", 43: "الزخرف", 44: "الدخان", 45: "الجاثية",
  46: "الأحقاف", 47: "محمد", 48: "الفتح", 49: "الحجرات", 50: "ق",
  51: "الذاريات", 52: "الطور", 53: "النجم", 54: "القمر", 55: "الرحمن",
  56: "الواقعة", 57: "الحديد", 58: "المجادلة", 59: "الحشر", 60: "الممتحنة",
  61: "الصف", 62: "الجمعة", 63: "المنافقون", 64: "التغابن", 65: "الطلاق",
  66: "التحريم", 67: "الملك", 68: "القلم", 69: "الحاقة", 70: "المعارج",
  71: "نوح", 72: "الجن", 73: "المزمل", 74: "المدثر", 75: "القيامة",
  76: "الإنسان", 77: "المرسلات", 78: "النبأ", 79: "النازعات", 80: "عبس",
  81: "التكوير", 82: "الانفطار", 83: "المطففين", 84: "الانشقاق", 85: "البروج",
  86: "الطارق", 87: "الأعلى", 88: "الغاشية", 89: "الفجر", 90: "البلد",
  91: "الشمس", 92: "الليل", 93: "الضحى", 94: "الشرح", 95: "التين",
  96: "العلق", 97: "القدر", 98: "البينة", 99: "الزلزلة", 100: "العاديات",
  101: "القارعة", 102: "التكاثر", 103: "العصر", 104: "الهمزة", 105: "الفيل",
  106: "قريش", 107: "الماعون", 108: "الكوثر", 109: "الكافرون", 110: "النصر",
  111: "المسد", 112: "الإخلاص", 113: "الفلق", 114: "الناس",
};

// Audio engine singleton
type PlaybackState = "idle" | "playing" | "paused";

export interface AyahAudioCallbacks {
  onAyahChange?: (globalNumber: number) => void;
  onStateChange?: (state: PlaybackState) => void;
  onPlaybackEnd?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

class AyahAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private queue: number[] = [];
  private queueIndex = -1;
  private state: PlaybackState = "idle";
  private lastAyah = 0;
  private lastSurah = 0;
  private lastLocal = 0;
  private playbackRate = 1;
  private listeners: Set<AyahAudioCallbacks> = new Set();

  private ensureAudio() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = "auto";
      this.audio.addEventListener("ended", () => this.handleEnded());
      this.audio.addEventListener("timeupdate", () => {
        if (this.audio) {
          const t = this.audio.currentTime;
          const d = this.audio.duration || 0;
          this.listeners.forEach(cb => cb.onTimeUpdate?.(t, d));
        }
      });
    }
    return this.audio;
  }

  addListener(cb: AyahAudioCallbacks): () => void {
    this.listeners.add(cb);
    return () => { this.listeners.delete(cb); };
  }

  // Keep setCallbacks for backward compat but it now adds a listener
  setCallbacks(cb: AyahAudioCallbacks) {
    this.listeners.add(cb);
  }

  playAyah(surahNumber: number, localAyah: number) {
    const globalNum = getGlobalAyahNumber(surahNumber, localAyah);
    this.lastSurah = surahNumber;
    this.lastLocal = localAyah;
    this.queue = [globalNum];
    this.queueIndex = 0;
    this.playCurrent();
  }

  playSequence(globalAyahNumbers: number[], startIndex = 0) {
    this.queue = globalAyahNumbers;
    this.queueIndex = startIndex;
    this.playCurrent();
  }

  private playCurrent() {
    if (this.queueIndex < 0 || this.queueIndex >= this.queue.length) {
      this.stop();
      return;
    }

    const globalNum = this.queue[this.queueIndex];
    this.lastAyah = globalNum;
    const audio = this.ensureAudio();
    audio.src = getAyahAudioUrl(globalNum);
    audio.load();
    audio.playbackRate = this.playbackRate;

    this.setState("playing");
    this.listeners.forEach(cb => cb.onAyahChange?.(globalNum));

    audio.play().then(() => {
      audio.playbackRate = this.playbackRate;
    }).catch(() => {
      this.setState("paused");
    });
  }

  private handleEnded() {
    if (this.queueIndex < this.queue.length - 1) {
      this.queueIndex++;
      this.playCurrent();
    } else {
      this.setState("idle");
      this.listeners.forEach(cb => cb.onPlaybackEnd?.());
    }
  }

  private setState(state: PlaybackState) {
    this.state = state;
    this.listeners.forEach(cb => cb.onStateChange?.(state));
  }

  pause() {
    this.audio?.pause();
    this.setState("paused");
  }

  resume() {
    this.audio?.play().catch(() => {});
    this.setState("playing");
  }

  togglePlayPause() {
    if (this.state === "playing") {
      this.pause();
    } else if (this.state === "paused") {
      this.resume();
    } else if (this.state === "idle" && this.lastSurah > 0) {
      this.playAyah(this.lastSurah, this.lastLocal);
    }
  }

  trimQueue() {
    if (this.queueIndex >= 0 && this.queueIndex < this.queue.length) {
      this.queue = [this.queue[this.queueIndex]];
      this.queueIndex = 0;
    }
  }

  extendQueue(additionalAyahs: number[]) {
    if (this.queueIndex >= 0 && this.queueIndex < this.queue.length) {
      this.queue = [...this.queue.slice(0, this.queueIndex + 1), ...additionalAyahs];
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = "";
    }
    this.queue = [];
    this.queueIndex = -1;
    this.setState("idle");
  }

  getState(): PlaybackState {
    return this.state;
  }

  getCurrentAyah(): number {
    if (this.queueIndex >= 0 && this.queueIndex < this.queue.length) {
      return this.queue[this.queueIndex];
    }
    return 0;
  }

  getQueue(): number[] {
    return [...this.queue];
  }

  getQueueIndex(): number {
    return this.queueIndex;
  }

  isPlaying(): boolean {
    return this.state === "playing";
  }

  cycleSpeed(): number {
    const speeds = [1, 1.5, 2];
    const idx = speeds.indexOf(this.playbackRate);
    this.playbackRate = speeds[(idx + 1) % speeds.length];
    if (this.audio) this.audio.playbackRate = this.playbackRate;
    return this.playbackRate;
  }

  getPlaybackRate(): number {
    return this.playbackRate;
  }
}

// Singleton
let engineInstance: AyahAudioEngine | null = null;

export function getAudioEngine(): AyahAudioEngine {
  if (!engineInstance) {
    engineInstance = new AyahAudioEngine();
  }
  return engineInstance;
}

// All ayah numbers that need caching (for the app's specific entries)
// This is the complete list derived from the seed script's SURAH_REQUESTS
export const APP_AYAH_GLOBAL_NUMBERS: number[] = (() => {
  const ranges: [number, number[]][] = [
    [1, [1,2,3,4,5,6,7]],
    [2, [1,2,3,4,102,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,255,256,257,285,286]],
    [3, [1,2,3,4,5,6,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,133,134,135,136,190,191,192,193,194,195,196,197,198,199,200]],
    [4, [72,73,74,75,76,77,90,91,116,117,118,119,120,121,171,172,173]],
    [6, [61,112,113,123,124,125,126,127,128,129,130]],
    [7, [11,12,13,14,15,16,17,18,19,20,21,22,54,55,56,115,116,117,118,119,120,121,122,196,197,198,199,200,201,202,203,204,205,206]],
    [8, [7,8,9,10,11,12,13,14,15,16,17,18,19,48]],
    [9, [7,8,9,10,11,12,13,14,15,16,25,26,27,28,29,30,31,32,40,128,129]],
    [10, [57,58,59,60,61,62,63,64,79,80,81,82]],
    [11, [64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101]],
    [13, [8,9,10,11,12,13,28,29]],
    [14, [10,11,12,13,14,15,16,17,42]],
    [15, [28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50]],
    [16, [63,64,65,66,67,68,69,96,97,98,99,100,101,102]],
    [17, [26,27,28,45,46,53,78,79,80,81,82,105]],
    [18, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,103]],
    [19, [83]],
    [20, [60,61,62,63,64,65,66,67,68,69,70,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,124]],
    [21, [42,43,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92]],
    [22, [19,20,21,22,23,24,38,39,40,41]],
    [23, [97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118]],
    [24, [35,36,37,38,39]],
    [25, [21,22,23,24,25,26,27,28,29,30,31,32,33]],
    [26, [78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,221,222,223,224,225,226,227]],
    [27, [59,60,61,62,63,64,65,76,77]],
    [30, [20,21,22,23,24,25,26,27]],
    [36, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83]],
    [37, [1,2,3,4,5,6,7,8,9,10]],
    [39, [21,22,23]],
    [40, [38,39,40,41,42,43,44,45,46,47,48,49,50,51,52]],
    [41, [31,32,33,34,35,36]],
    [43, [36,37,38]],
    [50, [26,27,28,29,30,31,32,33]],
    [59, [18,19,20,21,22,23,24]],
    [72, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28]],
    [99, [1,2,3,4,5,6,7,8]],
    [109, [1,2,3,4,5,6]],
    [110, [1,2,3]],
    [112, [1,2,3,4]],
    [113, [1,2,3,4,5]],
    [114, [1,2,3,4,5,6]],
  ];

  const all: number[] = [];
  for (const [surah, ayahs] of ranges) {
    for (const a of ayahs) {
      all.push(getGlobalAyahNumber(surah, a));
    }
  }
  return all.sort((a, b) => a - b);
})();
