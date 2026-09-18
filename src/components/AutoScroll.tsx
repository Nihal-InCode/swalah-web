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
  const [animating, setAnimating] = useState(false);
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
    setAnimating(true);
    setIsPlaying(true);
    setTimeout(() => setExpanded(true), 300);
  };

  const handlePause = () => {
    setIsPlaying(false);
    setExpanded(false);
    setTimeout(() => setAnimating(false), 400);
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Collapsed: pulsing circle */}
      {!animating && (
        <button
          onClick={handlePlay}
          className="w-14 h-14 rounded-full bg-emerald-600 text-white text-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 hover:shadow-emerald-500/30 hover:shadow-xl active:scale-95 transition-all duration-300 animate-pulse-ring"
          aria-label="Start auto scroll"
        >
          <span className="ml-0.5 relative z-10">▶</span>
        </button>
      )}

      {/* Expanding circle overlay */}
      {animating && !expanded && (
        <div className="fixed inset-0 flex items-end justify-end p-6 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-emerald-600 animate-circle-expand" />
        </div>
      )}

      {/* Expanded control bar */}
      {expanded && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-auto sm:flex sm:justify-end pointer-events-none">
          <div className="sm:mr-0 pointer-events-auto flex items-center gap-3 bg-gray-900/90 backdrop-blur-xl rounded-full px-5 py-3 shadow-2xl border border-white/10 animate-panel-slide">
            <button
              onClick={handlePause}
              className="text-white text-xl w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 transition-all duration-200 hover:scale-110 active:scale-95 shadow-md shrink-0"
              aria-label="Pause"
            >
              ⏸
            </button>

            <div className="flex items-center gap-2 animate-content-reveal">
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

            <span className="text-white/70 text-xs w-8 text-center font-mono animate-content-reveal shrink-0">
              {speed.toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
