"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  useEffect(() => {
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
