"use client";

import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    fetch('/api/visitors', { method: 'POST' }).catch(() => {});
  }, []);

  return null;
}
