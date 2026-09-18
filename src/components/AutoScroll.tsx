"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface AutoScrollProps {
  enabled: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export default function AutoScroll({ enabled, speed, onSpeedChange }: AutoScrollProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastScrollRef = useRef(0);

  const scroll = useCallback(() => {
    const now = performance.now();
    const delta = now - lastScrollRef.current;
    lastScrollRef.current = now;

    const pixelsPerMs = speed * 0.015;
    const scrollAmount = pixelsPerMs * delta;

    window.scrollBy({ top: scrollAmount, behavior: 'auto' });

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(scroll);
    }
  }, [speed, isPlaying]);

  useEffect(() => {
    if (isPlaying && enabled) {
      lastScrollRef.current = performance.now();
      animationRef.current = requestAnimationFrame(scroll);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, enabled, scroll]);

  useEffect(() => {
    if (!enabled) {
      setIsPlaying(false);
      setExpanded(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (isPlaying) {
      setExpanded(true);
    }
  }, [isPlaying]);

  if (!enabled) return null;

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setExpanded(false), 200);
    } else {
      setIsPlaying(true);
    }
  };

  return (
    <>
      {/* Collapsed: small play button in bottom-right */}
      {!expanded && (
        <button
          onClick={() => { setIsPlaying(true); }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-600 text-white text-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50 hover:bg-emerald-500 hover:scale-110 active:scale-95 transition-all duration-300 ease-out animate-bounce-in"
          aria-label="Start auto scroll"
        >
          <span className="ml-0.5">▶</span>
        </button>
      )}

      {/* Expanded: full control bar */}
      {expanded && (
        <div
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 bg-black/80 backdrop-blur-md rounded-full px-5 py-3 shadow-2xl shadow-emerald-900/30 border border-white/10 animate-expand-in origin-bottom"
          style={{ transform: 'translateX(-50%)' }}
        >
          <button
            onClick={handlePlayPause}
            className="text-white text-xl w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div className="flex items-center gap-2 animate-fade-in-right">
            <span className="text-white/50 text-xs select-none">🐢</span>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-24 h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 ${((speed - 1) / 9) * 100}%, #374151 ${((speed - 1) / 9) * 100}%)`,
              }}
            />
            <span className="text-white/50 text-xs select-none">🐇</span>
          </div>

          <span className="text-white/80 text-xs w-8 text-center font-mono animate-fade-in-right">
            {speed.toFixed(1)}
          </span>
        </div>
      )}
    </>
  );
}
