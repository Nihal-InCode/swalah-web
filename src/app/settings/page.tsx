"use client";

import { useState, useEffect } from 'react';
import { useSettings } from '@/components/ThemeProvider';
import { READING_MODES, AVAILABLE_FONTS, APP_NAME } from '@/lib/constants';
import Link from 'next/link';

export default function SettingsPage() {
  const { settings, updateSetting, currentMode } = useSettings();
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExportJson = async () => {
    const res = await fetch('/api/dhikr');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${APP_NAME}_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      await fetch('/api/dhikr/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dhikrList: data, replace: true }),
      });
      window.location.reload();
    };
    input.click();
  };

  const handleExportPdf = async () => {
    const res = await fetch('/api/dhikr');
    const data = await res.json();
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    doc.setFont('helvetica');
    doc.setFontSize(24);
    doc.text(APP_NAME, 105, 20, { align: 'center' });

    let y = 40;
    const pageHeight = 297;

    for (const dhikr of data) {
      if (dhikr.title) {
        doc.setFontSize(14);
        const titleLines = doc.splitTextToSize(dhikr.title, 170);
        doc.text(titleLines, 105, y, { align: 'center' });
        y += titleLines.length * 6 + 4;
      }

      doc.setFontSize(16);
      const arabicLines = doc.splitTextToSize(dhikr.arabic, 170);
      for (const line of arabicLines) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 105, y, { align: 'center' });
        y += 8;
      }

      y += 8;
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }
    }

    doc.save(`${APP_NAME}_export.pdf`);
  };

  const handleDownloadAudio = async () => {
    if (!navigator.serviceWorker?.controller) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const res = await fetch('/api/audio-cache');
      const { urls } = await res.json();
      const total = urls.length;
      let done = 0;

      // Send in batches of 20
      for (let i = 0; i < urls.length; i += 20) {
        const batch = urls.slice(i, i + 20);
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_AUDIO',
          urls: batch,
        });
        done += batch.length;
        setDownloadProgress(Math.round((done / total) * 100));
      }

      // Wait for cache to complete
      const handler = (event: MessageEvent) => {
        if (event.data?.type === 'AUDIO_CACHED') {
          setIsDownloading(false);
          setDownloadProgress(null);
          navigator.serviceWorker.removeEventListener('message', handler);
        }
      };
      navigator.serviceWorker.addEventListener('message', handler);
    } catch (err) {
      console.error('Download failed:', err);
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  const handleClearAudioCache = async () => {
    if (!navigator.serviceWorker?.controller) return;
    setIsClearing(true);

    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_AUDIO_CACHE' });

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'AUDIO_CACHE_CLEARED') {
        setIsClearing(false);
        navigator.serviceWorker.removeEventListener('message', handler);
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: currentMode.background, color: currentMode.text }}
    >
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b border-current/10 py-4 px-6"
        style={{ backgroundColor: `${currentMode.background}E6` }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-full hover:bg-black/10 transition-colors"
            style={{ color: currentMode.titleColor }}
          >
            ←
          </Link>
          <h1
            className="text-xl font-bold"
            style={{ color: currentMode.titleColor }}
          >
            Settings
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Reading Mode */}
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: currentMode.titleColor }}>
            Reading Mode
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {READING_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => updateSetting('readingMode', mode.id)}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                  settings.readingMode === mode.id
                    ? 'border-green-600 scale-105'
                    : 'border-transparent'
                }`}
                style={{
                  backgroundColor: mode.background,
                  color: mode.text,
                }}
              >
                <span className="text-xl">{mode.icon}</span>
                <span className="text-xs font-medium">{mode.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Font Family */}
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: currentMode.titleColor }}>
            Font
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_FONTS.map((font) => (
              <button
                key={font.name}
                onClick={() => updateSetting('fontFamily', font.name)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.fontFamily === font.name
                    ? 'border-green-600 bg-green-600/10'
                    : 'border-current/20'
                }`}
                style={{ color: currentMode.text }}
              >
                <span style={{ fontFamily: font.family }}>{font.displayName}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Font Size */}
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: currentMode.titleColor }}>
            Font Size: {settings.fontSize}px
          </h2>
          <input
            type="range"
            min={18}
            max={60}
            value={settings.fontSize}
            onChange={(e) => updateSetting('fontSize', parseFloat(e.target.value))}
            className="w-full accent-green-700"
            style={{ accentColor: currentMode.titleColor }}
          />
          <div className="flex justify-between text-xs opacity-50">
            <span>18px</span>
            <span>60px</span>
          </div>
        </section>

        {/* Line Height */}
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: currentMode.titleColor }}>
            Line Height: {settings.lineHeight.toFixed(1)}
          </h2>
          <input
            type="range"
            min={1.0}
            max={3.0}
            step={0.1}
            value={settings.lineHeight}
            onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
            className="w-full accent-green-700"
            style={{ accentColor: currentMode.titleColor }}
          />
          <div className="flex justify-between text-xs opacity-50">
            <span>1.0</span>
            <span>3.0</span>
          </div>
        </section>

        {/* Text Alignment */}
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: currentMode.titleColor }}>
            Text Alignment
          </h2>
          <div className="flex gap-2">
            {[
              { value: 'center', label: 'Center', icon: '☰' },
              { value: 'right', label: 'Right', icon: '☰' },
              { value: 'justify', label: 'Justify', icon: '☰' },
            ].map((align) => (
              <button
                key={align.value}
                onClick={() => updateSetting('textAlign', align.value)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  settings.textAlign === align.value
                    ? 'border-green-600 bg-green-600/10'
                    : 'border-current/20'
                }`}
                style={{ color: currentMode.text }}
              >
                {align.label}
              </button>
            ))}
          </div>
        </section>

        {/* Color Toggles */}
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: currentMode.titleColor }}>
            Text Coloring
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-black/5">
              <span>Color "الله" in red</span>
              <input
                type="checkbox"
                checked={settings.colorAllah}
                onChange={(e) => updateSetting('colorAllah', e.target.checked)}
                className="w-5 h-5 accent-green-700"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg bg-black/5">
              <span>Color ayah markers in green</span>
              <input
                type="checkbox"
                checked={settings.colorAyahMarkers}
                onChange={(e) => updateSetting('colorAyahMarkers', e.target.checked)}
                className="w-5 h-5 accent-green-700"
              />
            </label>
          </div>
        </section>

        {/* Auto Scroll */}
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: currentMode.titleColor }}>
            Auto Scroll
          </h2>
          <label className="flex items-center justify-between p-3 rounded-lg bg-black/5">
            <span>Enable auto scroll</span>
            <input
              type="checkbox"
              checked={settings.autoScrollEnabled}
              onChange={(e) => updateSetting('autoScrollEnabled', e.target.checked)}
              className="w-5 h-5 accent-green-700"
            />
          </label>
          {settings.autoScrollEnabled && (
            <div className="mt-3">
              <p className="text-sm opacity-70 mb-2">Speed: {settings.autoScrollSpeed.toFixed(1)}</p>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={settings.autoScrollSpeed}
                onChange={(e) => updateSetting('autoScrollSpeed', parseFloat(e.target.value))}
                className="w-full accent-green-700"
                style={{ accentColor: currentMode.titleColor }}
              />
            </div>
          )}
        </section>

        {/* Data Management */}
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: currentMode.titleColor }}>
            Data Management
          </h2>
          <div className="space-y-2">
            <button
              onClick={handleExportJson}
              className="w-full p-3 rounded-lg border border-current/20 hover:bg-black/5 transition"
            >
              📤 Export as JSON
            </button>
            <button
              onClick={handleImportJson}
              className="w-full p-3 rounded-lg border border-current/20 hover:bg-black/5 transition"
            >
              📥 Import from JSON
            </button>
            <button
              onClick={handleExportPdf}
              className="w-full p-3 rounded-lg border border-current/20 hover:bg-black/5 transition"
            >
              📄 Export as PDF
            </button>
          </div>
        </section>

        {/* Audio Cache */}
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: currentMode.titleColor }}>
            Audio Cache
          </h2>
          <p className="text-sm opacity-70 mb-3">
            Download ayah audio to your device for offline listening
          </p>
          <div className="space-y-2">
            <button
              onClick={handleDownloadAudio}
              disabled={isDownloading}
              className="w-full p-3 rounded-lg border border-current/20 hover:bg-black/5 transition disabled:opacity-50"
            >
              {isDownloading ? `⏳ Downloading... ${downloadProgress}%` : '⬇️ Download All Ayahs'}
            </button>
            {isDownloading && (
              <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all duration-300"
                  style={{ width: `${downloadProgress ?? 0}%` }}
                />
              </div>
            )}
            <button
              onClick={handleClearAudioCache}
              disabled={isClearing}
              className="w-full p-3 rounded-lg border border-current/20 hover:bg-black/5 transition text-red-500 disabled:opacity-50"
            >
              {isClearing ? '⏳ Clearing...' : '🗑️ Clear Audio Cache'}
            </button>
          </div>
        </section>

        {/* About */}
        <section className="text-center py-8 opacity-50">
          <p className="text-sm">{APP_NAME} v1.0.0</p>
          <p className="text-xs mt-1">by nihalch.exe</p>
        </section>
      </main>
    </div>
  );
}
