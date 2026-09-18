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

  const handlePlay = () => {
    setIsPlaying(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpanded(true);
      });
    });
  };

  const handlePause = () => {
    setIsPlaying(false);
    setExpanded(false);
  };

  if (!enabled) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      style={{ contain: 'layout style' }}
    >
      {/* Collapsed play button */}
      <button
        onClick={handlePlay}
        className="absolute bottom-0 right-0 w-14 h-14 rounded-full bg-emerald-600 text-white text-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 active:scale-95 transition-transform duration-150"
        style={{
          willChange: 'transform, opacity',
          opacity: isPlaying ? 0 : 1,
          transform: isPlaying ? 'scale(0.5)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 1, 1), opacity 0.15s ease-out',
          pointerEvents: isPlaying ? 'none' : 'auto',
        }}
        aria-label="Start auto scroll"
      >
        <span className="ml-0.5">▶</span>
      </button>

      {/* Expanded control bar */}
      <div
        className="absolute bottom-0 right-0 flex items-center gap-3 bg-gray-900/90 backdrop-blur-xl rounded-full px-5 py-3 shadow-2xl border border-white/10"
        style={{
          willChange: 'transform, opacity',
          transformOrigin: 'bottom right',
          transform: expanded
            ? 'scale(1) translateX(0)'
            : 'scale(0.15) translateX(40%)',
          opacity: expanded ? 1 : 0,
          transition: expanded
            ? 'transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.2s ease-out'
            : 'transform 0.2s cubic-bezier(0.4, 0, 1, 1), opacity 0.15s ease-in',
          pointerEvents: expanded ? 'auto' : 'none',
        }}
      >
        <button
          onClick={handlePause}
          className="text-white text-xl w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-90 transition-transform duration-100 shadow-md shrink-0"
          style={{ willChange: 'transform' }}
          aria-label="Pause"
        >
          ⏸
        </button>

        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs select-none">🐢</span>
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
          <span className="text-white/40 text-xs select-none">🐇</span>
        </div>

        <span className="text-white/70 text-xs w-8 text-center font-mono shrink-0">
          {speed.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
