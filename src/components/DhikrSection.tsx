"use client";

import { colorizeText, TextSegment } from '@/lib/text-colorizer';
import { DhikrData } from '@/lib/constants';

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
}: DhikrSectionProps) {
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

  return (
    <div className="py-6 px-4 md:px-8 border-b border-current/10">
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
              style={{
                color: segment.color,
                fontWeight: segment.isBold ? 700 : undefined,
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
    </div>
  );
}
