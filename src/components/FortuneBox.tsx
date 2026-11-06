import React, { useEffect, useState } from 'react';

// Red hexagonal fortune box with wooden sticks (drawn after the owner's reference picture). It sits on the left of
// the hall, clear of the wall, and shakes with one stick popping up each time the room draws a quẻ.
const STICKS = [-46, -34, -22, -10, 2, 14, 26, 38];

const Stick: React.FC<{ x: number; tilt: number; lift: number; id: string }> = ({ x, tilt, lift, id }) => (
  <g transform={`translate(${100 + x} ${70 - lift}) rotate(${tilt})`}>
    <rect x="-6" y="0" width="12" height="78" rx="2" fill={`url(#${id}-wood)`} stroke="#9a6a35" strokeWidth="0.8" />
    <path d="M-6 0 h12 v20 l-6 4 l-6 -4 Z" fill="#c42a26" stroke="#8f1714" strokeWidth="0.8" />
    <path d="M0 6 c-3 2 -4 5 -2 8 c1 -2 1.5 -3 2 -5 c0.5 2 1 3 2 5 c2 -3 1 -6 -2 -8 Z" fill="#f3d08a" />
  </g>
);

export const FortuneBox: React.FC<{ drawId?: string }> = ({ drawId }) => {
  const [shaking, setShaking] = useState(false);
  useEffect(() => {
    if (!drawId) return;
    setShaking(true);
    const t = setTimeout(() => setShaking(false), 1600);
    return () => clearTimeout(t);
  }, [drawId]);

  const id = 'fbox';
  return (
    <div className="absolute left-[5.5%] top-[47%] w-[11%] z-[25] pointer-events-none select-none" aria-hidden="true">
      <div className={shaking ? 'animate-fortune-shake' : ''} style={{ transformOrigin: '50% 90%' }}>
        <svg viewBox="0 0 200 250" className="w-full h-auto drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]">
          <defs>
            <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#e9c48d" />
              <stop offset="0.5" stopColor="#f6dcae" />
              <stop offset="1" stopColor="#d6a86a" />
            </linearGradient>
            <linearGradient id={`${id}-red`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b3201c" />
              <stop offset="1" stopColor="#7a0f0c" />
            </linearGradient>
            <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8f1714" />
              <stop offset="1" stopColor="#5a0907" />
            </linearGradient>
            <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fbe6a2" />
              <stop offset="0.5" stopColor="#d9a441" />
              <stop offset="1" stopColor="#8a5a14" />
            </linearGradient>
            <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fbe6a2" />
              <stop offset="1" stopColor="#e2b35a" />
            </linearGradient>
          </defs>

          {/* sticks behind the rim; the middle one jumps up while the box shakes */}
          {STICKS.map((x, i) => (
            <Stick key={i} id={id} x={x} tilt={(i - 3.5) * 2.2} lift={shaking && i === 4 ? 38 : (i % 3) * 4} />
          ))}

          {/* box: two side faces and the front face of the hexagon */}
          <path d="M26 104 L52 92 L52 236 L26 226 Z" fill={`url(#${id}-side)`} />
          <path d="M174 104 L148 92 L148 236 L174 226 Z" fill={`url(#${id}-side)`} />
          <rect x="52" y="92" width="96" height="144" fill={`url(#${id}-red)`} />
          {/* gold rims */}
          <path d="M22 100 L52 86 L148 86 L178 100 L178 110 L148 98 L52 98 L22 110 Z" fill={`url(#${id}-gold)`} />
          <path d="M22 222 L52 232 L148 232 L178 222 L178 234 L148 246 L52 246 L22 234 Z" fill={`url(#${id}-gold)`} />
          <path d="M52 98 V232 M148 98 V232" stroke={`url(#${id}-gold)`} strokeWidth="3" />
          {/* plate with the label and a lotus */}
          <rect x="62" y="116" width="76" height="96" rx="12" fill={`url(#${id}-plate)`} stroke="#8a5a14" strokeWidth="2" />
          <text x="100" y="146" textAnchor="middle" fontFamily="Lora, serif" fontWeight="700" fontSize="19" fill="#9b1b15">Gieo</text>
          <text x="100" y="170" textAnchor="middle" fontFamily="Lora, serif" fontWeight="700" fontSize="19" fill="#9b1b15">Quẻ</text>
          <path d="M100 202 c-8 -2 -12 -8 -10 -14 c4 1 7 4 10 9 c3 -5 6 -8 10 -9 c2 6 -2 12 -10 14 Z M100 202 c-3 -6 -3 -12 0 -18 c3 6 3 12 0 18 Z" fill="#b8862c" />
          {/* faint pagodas on the side faces */}
          <path d="M33 160 h12 l-6 -10 Z M35 160 v14 h8 v-14" fill="none" stroke="#d9a441" strokeOpacity="0.55" strokeWidth="1.6" />
          <path d="M155 160 h12 l-6 -10 Z M157 160 v14 h8 v-14" fill="none" stroke="#d9a441" strokeOpacity="0.55" strokeWidth="1.6" />
        </svg>
      </div>
    </div>
  );
};
