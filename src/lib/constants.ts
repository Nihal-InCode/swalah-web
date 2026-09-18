export const APP_NAME = 'اليومي';
export const APP_VERSION = '1.0.0';
export const DEVELOPER_NAME = 'nihalch.exe';
export const ADMIN_TAP_COUNT = 7;

export const MIN_FONT_SIZE = 18;
export const MAX_FONT_SIZE = 60;
export const DEFAULT_FONT_SIZE = 28;

export const MIN_LINE_HEIGHT = 1.0;
export const MAX_LINE_HEIGHT = 3.0;
export const DEFAULT_LINE_HEIGHT = 1.8;

export const MIN_SCROLL_SPEED = 1;
export const MAX_SCROLL_SPEED = 10;
export const DEFAULT_SCROLL_SPEED = 3;

export interface ArabicFont {
  name: string;
  family: string;
  displayName: string;
}

export const AVAILABLE_FONTS: ArabicFont[] = [
  { name: 'KFGQPCUthmanicScript', family: 'KFGQPCUthmanicScript', displayName: 'Uthmanic Script' },
  { name: 'Amiri', family: 'Amiri', displayName: 'Amiri' },
  { name: 'AmiriQuran', family: 'AmiriQuran', displayName: 'Amiri Quran' },
  { name: 'NotoNaskhArabic', family: 'NotoNaskhArabic', displayName: 'Noto Naskh Arabic' },
  { name: 'ScheherazadeNew', family: 'ScheherazadeNew', displayName: 'Scheherazade New' },
  { name: 'Tajawal', family: 'Tajawal', displayName: 'Tajawal' },
  { name: 'ArefRuqaa', family: 'ArefRuqaa', displayName: 'Aref Ruqaa' },
];

export interface ReadingMode {
  id: string;
  name: string;
  icon: string;
  background: string;
  text: string;
  titleColor: string;
}

export const READING_MODES: ReadingMode[] = [
  { id: 'light', name: 'Light', icon: '☀️', background: '#FFFFFF', text: '#212121', titleColor: '#333333' },
  { id: 'paper', name: 'Paper', icon: '📄', background: '#F5F0E1', text: '#3E2723', titleColor: '#4E342E' },
  { id: 'cream', name: 'Cream', icon: '🧈', background: '#FFFBF0', text: '#3E2723', titleColor: '#5D4037' },
  { id: 'sepia', name: 'Sepia', icon: '📜', background: '#EDE0C8', text: '#3E2723', titleColor: '#4E342E' },
  { id: 'emerald', name: 'Emerald', icon: '🌿', background: '#E8F5E9', text: '#1B3A1B', titleColor: '#2E4D2E' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', background: '#E3F2FD', text: '#0D2137', titleColor: '#1A3A5C' },
  { id: 'dark', name: 'Dark', icon: '🌙', background: '#1A1A1A', text: '#E0E0E0', titleColor: '#BDBDBD' },
  { id: 'soft_dark', name: 'Soft Dark', icon: '🌑', background: '#2D2D2D', text: '#D0D0D0', titleColor: '#B0B0B0' },
  { id: 'midnight', name: 'Midnight', icon: '🌃', background: '#0A0A14', text: '#B8C4D0', titleColor: '#8899AA' },
  { id: 'amoled', name: 'AMOLED', icon: '⚫', background: '#000000', text: '#E0E0E0', titleColor: '#BDBDBD' },
];

export function isDarkMode(modeId: string): boolean {
  return ['dark', 'soft_dark', 'midnight', 'amoled'].includes(modeId);
}

export function getReadingMode(modeId: string): ReadingMode {
  return READING_MODES.find(m => m.id === modeId) || READING_MODES[0];
}

export function getFontFamily(fontName: string): string {
  const font = AVAILABLE_FONTS.find(f => f.name === fontName);
  return font?.family || 'Amiri';
}

export interface DhikrData {
  id: number;
  title: string;
  arabic: string;
  sortOrder: number;
  startAyah: number;
  createdAt: string;
  updatedAt: string;
  audio?: {
    id: number;
    driveFileId: string;
    fileName: string;
    duration: number | null;
  } | null;
}
