import { useEffect, useState } from 'react';
import { getAccessToken } from '../api/axios';

// Decodes a JWT payload without verifying it (verification happens server-side).
// Purely so the UI can visualize the token's live lifecycle.
const decodePayload = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SessionLedger = () => {
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    const tick = () => {
      const token = getAccessToken();
      if (!token) return;
      const payload = decodePayload(token);
      if (!payload) return;
      setSecondsLeft(Math.max(0, payload.exp - Math.floor(Date.now() / 1000)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (secondsLeft === null) return null;

  const total = 15 * 60; // matches default JWT_ACCESS_EXPIRES of 15m
  const fraction = Math.min(1, secondsLeft / total);
  const offset = CIRCUMFERENCE * (1 - fraction);
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const low = secondsLeft < 60;

  return (
    <div className="bg-surface border border-line rounded-xl2 p-5 shadow-soft animate-fadeUp">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted mb-4">
        Access token · live
      </p>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#EAE7F3" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={low ? '#FF6B6B' : '#6C5CE7'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-display font-semibold ${low ? 'text-coral' : 'text-ink'}`}>
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          Rotates silently through your refresh token on expiry — you're never logged out mid-session.
        </p>
      </div>
    </div>
  );
};

export default SessionLedger;
