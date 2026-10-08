"use client";

import { useEffect, useRef } from 'react';
import { getDeviceName, getDeviceNameSync } from '@/lib/client-device';

const VISITOR_ID_KEY = 'yawmi-visitor-id';
const VISITOR_ID_COOKIE = 'yawmi_vid';
const STORAGE_KEY = 'yawmi-usage';
const HEARTBEAT_INTERVAL = 15000;

function readIdCookie(): string {
  const m = document.cookie.match(new RegExp(`(?:^|; )${VISITOR_ID_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : '';
}

function writeIdCookie(id: string) {
  try {
    document.cookie = `${VISITOR_ID_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=31536000; samesite=lax`;
  } catch {}
}

function newVisitorId(): string {
  return 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

function getOrCreateVisitorId(): string {
  let id = '';
  try {
    id = localStorage.getItem(VISITOR_ID_KEY) || '';
  } catch {}

  if (!id) id = readIdCookie();
  if (!id) id = newVisitorId();

  try {
    localStorage.setItem(VISITOR_ID_KEY, id);
  } catch {}
  writeIdCookie(id);
  return id;
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
  const deviceRef = useRef<string>(getDeviceNameSync());

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

    // Resolve the real device model once, then register the visit with it
    getDeviceName()
      .then((name) => {
        if (name) deviceRef.current = name;
      })
      .catch(() => {})
      .finally(() => {
        fetch('/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId, usageSeconds: 0, device: deviceRef.current }),
        }).catch(() => {});
      });

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
        body: JSON.stringify({ visitorId, usageSeconds: secondsToSend, device: deviceRef.current }),
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
