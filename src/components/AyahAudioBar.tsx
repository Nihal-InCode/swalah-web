"use client";

import { useState, useEffect, useCallback } from 'react';
import { getAudioEngine, SURAH_NAMES_AR } from '@/lib/quran-audio';

interface AyahAudioBarProps {
  continuous: boolean;
  onContinuousChange: (v: boolean) => void;
}

export default function AyahAudioBar({ continuous, onContinuousChange }: AyahAudioBarProps) {
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [currentAyah, setCurrentAyah] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const engine = getAudioEngine();
    const removeListener = engine.addListener({
      onStateChange: (s) => {
        setState(s);
        if (s !== 'idle') setDismissed(false);
      },
      onAyahChange: (globalNum) => setCurrentAyah(globalNum),
    });
    return removeListener;
  }, []);

  const handleClose = useCallback(() => {
    getAudioEngine().stop();
    setDismissed(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    getAudioEngine().togglePlayPause();
  }, []);

  const cycleSpeed = useCallback(() => {
    const s = getAudioEngine().cycleSpeed();
    setSpeed(s);
  }, []);

  const getAyahLabel = (globalNum: number): string => {
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

  const show = state !== 'idle' || (state === 'idle' && currentAyah > 0 && !dismissed);

  return (
    <div
      className="fixed bottom-4 left-0 right-0 z-[80] flex justify-center px-4 transition-all duration-300 ease-out"
      style={{
        opacity: show ? 1 : 0,
        transform: `translateY(${show ? '0' : '20px'})`,
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      <div className="flex items-center gap-2 bg-gray-900/95 backdrop-blur-xl rounded-2xl px-3 py-2.5 shadow-2xl shadow-black/40 border border-white/10 w-full max-w-sm">
        <button
          onClick={togglePlayPause}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-base transition-colors shrink-0 active:scale-95"
        >
          {state === 'playing' ? '⏸' : '▶'}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate max-w-[160px]">
            {currentAyah ? getAyahLabel(currentAyah) : 'Tap an ayah'}
          </p>
          <p className="text-white/50 text-xs">
            {state === 'playing' ? (continuous ? 'Continuous' : 'Reciting...') : state === 'paused' ? 'Paused' : continuous ? 'Continuous' : 'Single'}
          </p>
        </div>

        <button
          onClick={cycleSpeed}
          className={`h-7 min-w-[2.2rem] px-1.5 flex items-center justify-center rounded-full text-xs font-bold transition-colors shrink-0 ${
            speed > 1 ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white/50 hover:bg-white/15'
          }`}
        >
          {speed}x
        </button>

        <button
          onClick={() => onContinuousChange(!continuous)}
          className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors shrink-0 text-xs border ${
            continuous ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-white/20 text-white/40 hover:bg-white/10'
          }`}
          title={continuous ? 'Continuous: ON' : 'Continuous: OFF'}
        >
          🔁
        </button>

        <button
          onClick={handleClose}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0 active:scale-95"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
