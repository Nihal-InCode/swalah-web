"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface AutoScrollProps {
  enabled: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export default function AutoScroll({ enabled, speed, onSpeedChange }: AutoScrollProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastScrollRef = useRef(0);

  const scroll = useCallback(() => {
    const now = performance.now();
    const delta = now - lastScrollRef.current;
    lastScrollRef.current = now;

    const pixelsPerMs = speed * 0.5;
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
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="text-white text-xl w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div className="flex items-center gap-2">
        <span className="text-white/70 text-xs">🐢</span>
        <input
          type="range"
          min={1}
          max={10}
          step={0.5}
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-24 accent-white"
        />
        <span className="text-white/70 text-xs">🐇</span>
      </div>

      <span className="text-white text-xs w-8 text-center">{speed.toFixed(1)}</span>
    </div>
  );
}
