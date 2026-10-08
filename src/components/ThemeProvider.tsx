"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ReadingMode, READING_MODES, getReadingMode, isDarkMode } from '@/lib/constants';

interface Settings {
  readingMode: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  textAlign: string;
  keepScreenAwake: boolean;
  autoScrollEnabled: boolean;
  autoScrollSpeed: number;
  colorAllah: boolean;
  colorAyahMarkers: boolean;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  currentMode: ReadingMode;
}

const defaultSettings: Settings = {
  readingMode: 'paper',
  fontFamily: 'KFGQPCUthmanicScript',
  fontSize: 28,
  lineHeight: 1.8,
  textAlign: 'center',
  keepScreenAwake: false,
  autoScrollEnabled: false,
  autoScrollSpeed: 3,
  colorAllah: true,
  colorAyahMarkers: true,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  updateSetting: () => {},
  currentMode: READING_MODES[1],
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings({
          readingMode: data.readingMode || 'paper',
          fontFamily: data.fontFamily || 'Amiri',
          fontSize: parseFloat(data.fontSize) || 28,
          lineHeight: parseFloat(data.lineHeight) || 1.8,
          textAlign: data.textAlign || 'center',
          keepScreenAwake: data.keepScreenAwake === 'true',
          autoScrollEnabled: data.autoScrollEnabled === 'true',
          autoScrollSpeed: parseFloat(data.autoScrollSpeed) || 3,
          colorAllah: data.colorAllah !== 'false',
          colorAyahMarkers: data.colorAyahMarkers !== 'false',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Re-sync from the server whenever this document comes back to the
  // foreground: tab switches, PWA re-focus, and back/forward cache restores
  // all resume with a stale React tree that would otherwise need a manual
  // reload to pick up settings changed elsewhere.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadSettings();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) loadSettings();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [loadSettings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: String(value) }),
    });
  };

  const currentMode = getReadingMode(settings.readingMode);

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSetting, currentMode }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
