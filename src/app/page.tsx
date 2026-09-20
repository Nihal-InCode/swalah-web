"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '@/components/ThemeProvider';
import DhikrSection from '@/components/DhikrSection';
import AutoScroll from '@/components/AutoScroll';
import AdminGate from '@/components/AdminGate';
import AyahAudioBar from '@/components/AyahAudioBar';
import { DhikrData, APP_NAME } from '@/lib/constants';
import { getAudioEngine } from '@/lib/quran-audio';

export default function ReaderPage() {
  const { settings, loading, updateSetting, currentMode } = useSettings();
  const [dhikrList, setDhikrList] = useState<DhikrData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [playingAyah, setPlayingAyah] = useState(0);
  const [audioBarVisible, setAudioBarVisible] = useState(true);
  const [firstVisibleAyah, setFirstVisibleAyah] = useState<{ surah: number; local: number } | null>(null);
  const sectionRefs = useRef<Map<number, HTMLDivElement>>(new Map());

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

  // IntersectionObserver to detect first visible ayah
  useEffect(() => {
    if (dhikrList.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const dhikrId = parseInt(entry.target.getAttribute('data-dhikr-id') || '0');
            const dhikr = dhikrList.find(d => d.id === dhikrId);
            if (dhikr) {
              setFirstVisibleAyah({ surah: dhikr.surahNumber, local: dhikr.startAyah });
            }
            break;
          }
        }
      },
      { threshold: 0.3 }
    );

    // Observe all section elements
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-dhikr-id]').forEach(el => {
        observer.observe(el);
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [dhikrList]);

  // Wire up audio engine callbacks
  useEffect(() => {
    const engine = getAudioEngine();
    const removeListener = engine.addListener({
      onAyahChange: (globalNum) => setPlayingAyah(globalNum),
      onStateChange: (state) => setAudioBarVisible(state !== 'idle'),
    });
    return removeListener;
  }, []);

  const handleAyahTap = useCallback((surahNumber: number, localAyah: number) => {
    const engine = getAudioEngine();
    engine.playAyah(surahNumber, localAyah);
  }, []);

  const handlePlayFromVisible = useCallback(() => {
    if (firstVisibleAyah) {
      handleAyahTap(firstVisibleAyah.surah, firstVisibleAyah.local);
    }
  }, [firstVisibleAyah, handleAyahTap]);

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
      <AyahAudioBar visible={audioBarVisible} onPlayFromVisible={handlePlayFromVisible} />

      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b border-current/10 py-4 px-6"
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
          <div className="flex items-center gap-2">
            {!audioBarVisible && (
              <button
                onClick={handlePlayFromVisible}
                className="p-2 rounded-full hover:bg-black/10 transition-colors text-lg"
                style={{ color: currentMode.titleColor }}
                title="Play from visible ayah"
              >
                ▶
              </button>
            )}
            <a
              href="/settings"
              className="p-2 rounded-full hover:bg-black/10 transition-colors"
              style={{ color: currentMode.titleColor }}
            >
              ⚙️
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pb-24">
        {dhikrList.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-6xl mb-4">📖</p>
            <p className="text-xl opacity-70 mb-2">No dhikr entries yet</p>
            <p className="opacity-50">Tap the title 7 times to access the admin panel</p>
          </div>
        ) : (
          dhikrList.map((dhikr) => (
            <div
              key={dhikr.id}
              ref={(el) => {
                if (el) sectionRefs.current.set(dhikr.id, el);
              }}
              data-dhikr-id={dhikr.id}
            >
              <DhikrSection
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
            </div>
          ))
        )}
      </main>

      <AutoScroll
        enabled={settings.autoScrollEnabled}
        speed={settings.autoScrollSpeed}
        onSpeedChange={(speed) => updateSetting('autoScrollSpeed', speed)}
      />
    </div>
  );
}
