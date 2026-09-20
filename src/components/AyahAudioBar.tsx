"use client";

import { useState, useEffect, useCallback } from 'react';
import { getAudioEngine, SURAH_NAMES_AR, getGlobalAyahNumber } from '@/lib/quran-audio';

interface AyahAudioBarProps {
  visible: boolean;
  onPlayFromVisible?: () => void;
  continuous: boolean;
  onContinuousChange: (v: boolean) => void;
}

export default function AyahAudioBar({ visible, onPlayFromVisible, continuous, onContinuousChange }: AyahAudioBarProps) {
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [currentAyah, setCurrentAyah] = useState(0);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const engine = getAudioEngine();
    const removeListener = engine.addListener({
      onStateChange: (s) => {
        setState(s);
        setShowBar(s !== "idle");
      },
      onAyahChange: (globalNum) => setCurrentAyah(globalNum),
    });
    return removeListener;
  }, []);

  const handleClose = useCallback(() => {
    getAudioEngine().stop();
    setShowBar(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    getAudioEngine().togglePlayPause();
  }, []);

  // Determine surah name from global ayah number
  const getAyahLabel = (globalNum: number): string => {
    // Find surah from global number
    const CUMULATIVE = [0];
    const COUNTS = [0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
      111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 37, 35, 30, 20,
      56, 28, 28, 28, 28, 28, 28, 23, 11, 35, 29, 22, 28, 28, 20, 56, 40, 31,
      50, 40, 46, 18, 28, 15, 21, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28,
      28, 20, 56, 37, 38, 28, 28, 20, 11, 8, 8, 19, 5, 8, 8, 11,
      11, 8, 5, 6, 12, 11, 6, 3, 7, 3, 9, 5, 4, 7, 3, 6,
      3, 5, 4, 5, 6, 3, 5, 4, 5, 4, 8, 18, 5, 4, 3, 6,
      3, 5, 5, 3, 4, 3, 6, 3, 5, 3, 4, 3, 6, 3, 5, 4,
      5, 3, 6, 3, 5, 4, 5, 3, 6, 3, 5, 4, 5, 3, 6, 3,
      5, 4, 5, 3, 6, 3, 5, 4, 5, 3, 6, 3, 5, 4, 5, 6];
    for (let i = 1; i <= 114; i++) {
      CUMULATIVE.push(CUMULATIVE[i - 1] + COUNTS[i]);
    }
    for (let i = 1; i <= 114; i++) {
      if (globalNum <= CUMULATIVE[i]) {
        const local = globalNum - CUMULATIVE[i - 1];
        const name = SURAH_NAMES_AR[i] || `Surah ${i}`;
        return `${name} - ${local}`;
      }
    }
    return `Ayah ${globalNum}`;
  };

  if (!showBar) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[80] bg-gray-900/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 transition-transform duration-300"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <button
          onClick={togglePlayPause}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-lg transition-colors shrink-0"
        >
          {state === 'playing' ? '⏸' : '▶'}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {currentAyah ? getAyahLabel(currentAyah) : 'Audio'}
          </p>
          <p className="text-white/50 text-xs">
            {state === 'playing' ? 'Reciting...' : state === 'paused' ? 'Paused' : 'Ready'}
          </p>
        </div>

        <button
          onClick={() => onContinuousChange(!continuous)}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors shrink-0 text-sm ${
            continuous ? 'bg-emerald-600 text-white' : 'hover:bg-white/10 text-white/40'
          }`}
          title={continuous ? 'Continuous: ON' : 'Continuous: OFF'}
        >
          🔁
        </button>

        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
