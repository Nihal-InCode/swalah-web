"use client";

import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    fetch('/api/visitors', { method: 'POST' }).catch(() => {});

    const interval = setInterval(() => {
      fetch('/api/heartbeat', { method: 'POST' }).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
