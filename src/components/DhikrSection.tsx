"use client";

import { useState, useRef, useCallback } from 'react';
import { colorizeText, TextSegment } from '@/lib/text-colorizer';
import { DhikrData } from '@/lib/constants';
import { getAudioEngine, getGlobalAyahNumber } from '@/lib/quran-audio';

interface DhikrSectionProps {
  dhikr: DhikrData;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  textAlign: string;
  colorAllah: boolean;
  colorAyahMarkers: boolean;
  titleColor: string;
  textColor: string;
  showAudio?: boolean;
  playingAyah?: number;
  onAyahTap?: (surahNumber: number, localAyah: number) => void;
}

export default function DhikrSection({
  dhikr,
  fontFamily,
  fontSize,
  lineHeight,
  textAlign,
  colorAllah,
  colorAyahMarkers,
  titleColor,
  textColor,
  showAudio = false,
  playingAyah,
  onAyahTap,
}: DhikrSectionProps) {
  const [tapMenu, setTapMenu] = useState<{ ayahIndex: number; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const extractBismillah = (title: string): string | null => {
    const match = title.match(/(بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ)/);
    return match ? match[1] : null;
  };

  const cleanTitle = dhikr.title.replace(/\(.*\)/g, '').replace(/بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ/, '').trim();
  const bismillah = extractBismillah(dhikr.title);

  const segments = colorizeText(
    dhikr.arabic,
    colorAllah,
    colorAyahMarkers,
    textColor,
    dhikr.startAyah
  );

  const getAudioUrl = (): string | null => {
    if (!dhikr.audio?.driveFileId) return null;
    return `https://drive.google.com/uc?export=download&id=${dhikr.audio.driveFileId}`;
  };

  const handleTextClick = useCallback((e: React.MouseEvent, ayahIndex: number) => {
    if (!onAyahTap || !ayahIndex) return;
    setTapMenu({
      ayahIndex,
      x: e.clientX,
      y: e.clientY - 12,
    });
  }, [onAyahTap]);

  const handlePlayAyah = useCallback((ayahIndex: number) => {
    setTapMenu(null);
    console.log(`[DhikrSection] tap: surah=${dhikr.surahNumber} localAyah=${ayahIndex} dhikr="${dhikr.title}"`);
    onAyahTap?.(dhikr.surahNumber, ayahIndex);
  }, [dhikr.surahNumber, dhikr.title, onAyahTap]);

  return (
    <div ref={containerRef} className="py-6 px-4 md:px-8 border-b border-current/10">
      {dhikr.title && (
        <div className="mb-4">
          {bismillah && (
            <p
              className="text-center mb-2 opacity-70"
              style={{
                fontFamily: `var(--font-${fontFamily})`,
                fontSize: `${fontSize * 0.75}px`,
                lineHeight: lineHeight,
                color: titleColor,
              }}
            >
              {bismillah}
            </p>
          )}
          {cleanTitle && (
            <h2
              className="text-center font-bold"
              style={{
                fontFamily: `var(--font-${fontFamily})`,
                fontSize: `${fontSize * 0.9}px`,
                lineHeight: lineHeight,
                color: titleColor,
                textAlign: textAlign as React.CSSProperties['textAlign'],
              }}
            >
              {cleanTitle}
            </h2>
          )}
        </div>
      )}

      <div
        className="arabic-text"
        style={{
          fontFamily: `var(--font-${fontFamily})`,
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          textAlign: textAlign as React.CSSProperties['textAlign'],
        }}
      >
        {segments.map((segment: TextSegment, index: number) => (
          segment.isAyahMarker ? (
            <span
              key={index}
              className="ayah-marker"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${fontSize * 1.2}px`,
                height: `${fontSize * 1.2}px`,
                borderRadius: '50%',
                border: `2px solid ${segment.color}`,
                fontSize: `${fontSize * 0.6}px`,
                color: segment.color,
                margin: `0 ${fontSize * 0.15}px`,
                verticalAlign: 'middle',
                fontWeight: 'bold',
              }}
            >
              {segment.ayahNumber}
            </span>
          ) : (
            <span
              key={index}
              onClick={segment.ayahIndex ? (e) => handleTextClick(e, segment.ayahIndex!) : undefined}
              className={onAyahTap && segment.ayahIndex ? 'cursor-pointer' : ''}
              data-ayah={segment.ayahIndex || undefined}
              data-global-ayah={segment.ayahIndex ? getGlobalAyahNumber(dhikr.surahNumber, segment.ayahIndex) : undefined}
              style={{
                color: segment.color,
                fontWeight: segment.isBold ? 700 : undefined,
                backgroundColor: playingAyah && segment.ayahIndex && playingAyah === getGlobalAyahNumber(dhikr.surahNumber, segment.ayahIndex)
                  ? 'rgba(16, 185, 129, 0.15)'
                  : undefined,
                borderRadius: '4px',
                transition: 'background-color 0.3s ease',
                padding: '1px 2px',
              }}
            >
              {segment.text}
            </span>
          )
        ))}
      </div>

      {showAudio && getAudioUrl() && (
        <div className="mt-4 flex justify-center">
          <audio controls preload="none" className="max-w-full">
            <source src={getAudioUrl()!} type="audio/mpeg" />
          </audio>
        </div>
      )}

      {/* Tap-to-play popup */}
      {tapMenu && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setTapMenu(null)}
          />
          <div
            className="fixed z-[70] flex items-center gap-1 bg-gray-900/95 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-xl border border-white/10"
            style={{
              left: `${tapMenu.x}px`,
              top: `${tapMenu.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <button
              onClick={() => handlePlayAyah(tapMenu.ayahIndex)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white text-sm rounded-full hover:bg-emerald-600 transition-colors"
            >
              <span className="text-base">▶</span>
              <span>Play</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
