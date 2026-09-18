"use client";

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('install-prompt-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  if (dismissed || !showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full text-center">
        <div className="text-4xl mb-3">📿</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">تثبيت اليومي</h3>
        <p className="text-sm text-gray-600 mb-4">
          أضف التطبيق إلى شاشة 홈 للوصول السريع
        </p>
        <button
          onClick={handleInstall}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors mb-2"
        >
          تثبيت الآن
        </button>
        <button
          onClick={handleDismiss}
          className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors"
        >
          لا شكراً
        </button>
      </div>
    </div>
  );
}
