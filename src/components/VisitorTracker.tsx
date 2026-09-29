"use client";

import { useEffect, useRef } from 'react';

const VISITOR_ID_KEY = 'yawmi-visitor-id';
const STORAGE_KEY = 'yawmi-usage';
const HEARTBEAT_INTERVAL = 15000;

function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return 'anon_' + Date.now();
  }
}

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
    const visitorId = getOrCreateVisitorId();
    const usage = usageRef.current;
    const today = todayStr();
    if (usage.today !== today) {
      usage.today = today;
      usage.todaySeconds = 0;
      usage.unsyncedSeconds = 0;
      saveUsage(usage);
    }

    // Register visit on page load
    fetch('/api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, usageSeconds: 0 }),
    }).catch(() => {});

    const tick = () => {
      const now = Date.now();
      const elapsed = Math.max(0, Math.floor((now - lastBeatRef.current) / 1000));
      lastBeatRef.current = now;

      if (document.visibilityState === 'hidden') return;

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

      const secondsToSend = u.unsyncedSeconds;
      fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, usageSeconds: secondsToSend }),
      }).then(() => {
        usageRef.current.unsyncedSeconds = Math.max(0, usageRef.current.unsyncedSeconds - secondsToSend);
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
