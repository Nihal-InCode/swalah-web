"use client";

import { useState, useEffect, useRef } from 'react';
import { ADMIN_TAP_COUNT } from '@/lib/constants';

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const tapTimes = useRef<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('isAdmin');
    if (stored === 'true') setIsAdmin(true);
  }, []);

  const handleTitleTap = () => {
    const now = Date.now();
    tapTimes.current = tapTimes.current.filter(t => now - t < 3000);
    tapTimes.current.push(now);

    if (tapTimes.current.length >= ADMIN_TAP_COUNT) {
      tapTimes.current = [];
      if (isAdmin) {
        setIsAdmin(false);
        localStorage.removeItem('isAdmin');
      } else {
        setShowLogin(true);
      }
    }
  };

  const handlePassword = (password: string) => {
    if (password === 'admin123') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setShowLogin(false);
    } else {
      setShowLogin(false);
    }
  };

  return (
    <>
      <span
        onClick={handleTitleTap}
        className="cursor-pointer select-none"
        title="Tap 7 times to toggle admin"
      >
        {children}
      </span>

      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-center">Admin Login</h3>
            <input
              type="password"
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-2 border rounded-lg mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePassword((e.target as HTMLInputElement).value);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogin(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="password"]') as HTMLInputElement;
                  handlePassword(input?.value || '');
                }}
                className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-50">
          <a
            href="/admin"
            className="bg-green-700 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-800 transition text-sm font-medium"
          >
            ⚙️ Admin
          </a>
        </div>
      )}
    </>
  );
}
