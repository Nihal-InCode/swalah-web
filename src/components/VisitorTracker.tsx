"use client";

import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'yawmi-usage';
const HEARTBEAT_INTERVAL = 30000;

interface UsageData {
  today: string;
  todaySeconds: number;
  unsyncedSeconds: number;
}

function loadUsage(): UsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const today = new Date().toISOString().split('T')[0];
  return { today, todaySeconds: 0, unsyncedSeconds: 0 };
}

function saveUsage(data: UsageData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function VisitorTracker() {
  const usageRef = useRef<UsageData>(loadUsage());
  const lastBeatRef = useRef(Date.now());

  useEffect(() => {
    const usage = usageRef.current;
    const today = todayStr();
    if (usage.today !== today) {
      usage.today = today;
      usage.todaySeconds = 0;
      usage.unsyncedSeconds = 0;
      saveUsage(usage);
    }

    fetch('/api/visitors', { method: 'POST' }).catch(() => {});

    const tick = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastBeatRef.current) / 1000);
      lastBeatRef.current = now;

      const u = usageRef.current;
      const today2 = todayStr();
      if (u.today !== today2) {
        u.today = today2;
        u.todaySeconds = 0;
        u.unsyncedSeconds = 0;
      }
      u.todaySeconds += elapsed;
      u.unsyncedSeconds += elapsed;
      saveUsage(u);

      fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageSeconds: u.unsyncedSeconds }),
      }).then(() => {
        usageRef.current.unsyncedSeconds = 0;
        saveUsage(usageRef.current);
      }).catch(() => {});
    };

    const interval = setInterval(tick, HEARTBEAT_INTERVAL);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        lastBeatRef.current = Date.now();
      } else {
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onBeforeUnload = () => {
      tick();
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  return null;
}
