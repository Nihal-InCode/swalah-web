"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/components/ThemeProvider';
import DhikrSection from '@/components/DhikrSection';
import AutoScroll from '@/components/AutoScroll';
import AdminGate from '@/components/AdminGate';
import AyahAudioBar from '@/components/AyahAudioBar';
import { DhikrData, APP_NAME } from '@/lib/constants';
import { getAudioEngine, getGlobalAyahNumber, extractAyahsFromText } from '@/lib/quran-audio';

export default function ReaderPage() {
  const { settings, loading, updateSetting, currentMode } = useSettings();
  const [dhikrList, setDhikrList] = useState<DhikrData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [playingAyah, setPlayingAyah] = useState(0);
  const [continuous, setContinuous] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const loadDhikr = useCallback(async () => {
    try {
      const res = await fetch('/api/dhikr');
      const data = await res.json();
      setDhikrList(data);
    } catch (error) {
      console.error('Failed to load dhikr:', error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadDhikr();
  }, [loadDhikr]);

  useEffect(() => {
    const savedPos = localStorage.getItem('readingPosition');
    if (savedPos && !loading) {
      setTimeout(() => {
        window.scrollTo({ top: parseFloat(savedPos), behavior: 'smooth' });
      }, 100);
    }
  }, [loading]);

  useEffect(() => {
    const handleScroll = () => {
      localStorage.setItem('readingPosition', String(window.scrollY));
      setShowScrollTop(window.scrollY > 400);
    };

    let timeout: NodeJS.Timeout;
    const throttledScroll = () => {
      if (timeout) return;
      timeout = setTimeout(() => {
        handleScroll();
        timeout = undefined as unknown as NodeJS.Timeout;
      }, 500);
    };

    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  useEffect(() => {
    const engine = getAudioEngine();
    const removeListener = engine.addListener({
      onAyahChange: (globalNum) => {
        setPlayingAyah(globalNum);
      },
    });
    return removeListener;
  }, []);

  // Scroll to playing ayah whenever it changes and continuous is on
  useEffect(() => {
    if (!continuous || playingAyah === 0) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-global-ayah="${playingAyah}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [playingAyah, continuous]);

  const handleContinuousChange = useCallback((next: boolean) => {
    setContinuous(next);
    const engine = getAudioEngine();
    if (!next) {
      engine.trimQueue();
    } else {
      const currentGlobal = engine.getCurrentAyah();
      if (currentGlobal > 0) {
        const remaining: number[] = [];
        let foundCurrent = false;
        for (const dhikr of dhikrList) {
          const ayahs = extractAyahsFromText(dhikr.arabic, dhikr.startAyah);
          for (const a of ayahs) {
            const g = getGlobalAyahNumber(dhikr.surahNumber, a);
            if (g === currentGlobal) { foundCurrent = true; continue; }
            if (foundCurrent) remaining.push(g);
          }
        }
        engine.extendQueue(remaining);
      }
    }
  }, [dhikrList]);

  const handleAyahTap = useCallback((surahNumber: number, localAyah: number) => {
    const engine = getAudioEngine();
    if (!continuous) {
      engine.playAyah(surahNumber, localAyah);
      return;
    }
    const allGlobalAyahs: number[] = [];
    let foundStart = false;
    for (const dhikr of dhikrList) {
      const ayahs = extractAyahsFromText(dhikr.arabic, dhikr.startAyah);
      if (!foundStart) {
        if (dhikr.surahNumber === surahNumber) {
          const from = ayahs.indexOf(localAyah);
          for (let i = from >= 0 ? from : 0; i < ayahs.length; i++) {
            allGlobalAyahs.push(getGlobalAyahNumber(dhikr.surahNumber, ayahs[i]));
          }
          foundStart = true;
        }
      } else {
        for (const a of ayahs) {
          allGlobalAyahs.push(getGlobalAyahNumber(dhikr.surahNumber, a));
        }
      }
    }
    if (allGlobalAyahs.length > 0) {
      engine.playSequence(allGlobalAyahs, 0);
    } else {
      engine.playAyah(surahNumber, localAyah);
    }
  }, [continuous, dhikrList]);

  if (loading || loadingData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentMode.background }}
      >
        <div className="text-2xl" style={{ color: currentMode.titleColor }}>⏳</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: currentMode.background,
        color: currentMode.text,
      }}
    >
      <AyahAudioBar continuous={continuous} onContinuousChange={handleContinuousChange} />

      <header
        className="sticky z-40 backdrop-blur-md border-b border-current/10 py-4 px-6"
        style={{ backgroundColor: `${currentMode.background}E6` }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <AdminGate>
            <h1
              className="text-2xl font-bold"
              style={{ color: currentMode.titleColor }}
            >
              {APP_NAME}
            </h1>
          </AdminGate>
          <a
            href="/settings"
            className="p-2 rounded-full hover:bg-black/10 transition-colors"
            style={{ color: currentMode.titleColor }}
          >
            ⚙️
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pb-24" style={{ paddingTop: '4.5rem' }}>
        {dhikrList.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-6xl mb-4">📖</p>
            <p className="text-xl opacity-70 mb-2">No dhikr entries yet</p>
            <p className="opacity-50">Tap the title 7 times to access the admin panel</p>
          </div>
        ) : (
          dhikrList.map((dhikr) => (
            <DhikrSection
              key={dhikr.id}
              dhikr={dhikr}
              fontFamily={settings.fontFamily}
              fontSize={settings.fontSize}
              lineHeight={settings.lineHeight}
              textAlign={settings.textAlign}
              colorAllah={settings.colorAllah}
              colorAyahMarkers={settings.colorAyahMarkers}
              titleColor={currentMode.titleColor}
              textColor={currentMode.text}
              showAudio={true}
              playingAyah={playingAyah}
              onAyahTap={handleAyahTap}
            />
          ))
        )}
      </main>

      <AutoScroll
        enabled={settings.autoScrollEnabled}
        speed={settings.autoScrollSpeed}
        onSpeedChange={(speed) => updateSetting('autoScrollSpeed', speed)}
      />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-20 right-4 z-[70] w-11 h-11 rounded-full bg-gray-800/90 backdrop-blur border border-white/10 text-white shadow-lg flex items-center justify-center transition-all duration-300 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        ↑
      </button>
    </div>
  );
}
