import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

// Gift effect that grows with the gift: a golden lotus opens in front of the Buddha and pink lotus petals
// rain over the hall. Tier 1 is a small gift, tier 4 a big one (brightest bloom, petals everywhere).
export const giftTier = (diamonds: number) => (diamonds >= 500 ? 4 : diamonds >= 99 ? 3 : diamonds >= 10 ? 2 : 1);

const LOTUS_WIDTH = [0, 24, 34, 48, 68]; // % of stage width
const GLOW = [0, 10, 18, 30, 46]; // px of golden drop-shadow
const PETALS = [0, 30, 60, 100, 160];
const FALL_S = [0, 6, 7, 8, 9]; // seconds one petal takes to fall
const RAIN_S = [0, 3, 4, 5, 6];
const SHOW_S = [0, 2.6, 3.4, 4.4, 5.6];

// Petal pointing up from its base at (100,150), turned `deg` around the base and scaled
const petal = (deg: number, s: number) => `rotate(${deg} 100 150) translate(100 150) scale(${s}) translate(-100 -150)`;
const PETAL_PATH = 'M100 150 C78 122 80 70 100 34 C120 70 122 122 100 150 Z';

// Layered lotus seen from the front, like the reference: line-art outer petals, solid gold middle, bright heart
const GoldenLotus: React.FC<{ id: string }> = ({ id }) => (
  <svg viewBox="0 0 200 170" className="w-full h-auto" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff6c8" />
        <stop offset="0.45" stopColor="#f6c445" />
        <stop offset="1" stopColor="#b7791f" />
      </linearGradient>
      <radialGradient id={`${id}-c`}>
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.5" stopColor="#fff1a8" />
        <stop offset="1" stopColor="#f6c445" stopOpacity="0" />
      </radialGradient>
    </defs>
    {[-84, -63, -42, -21, 0, 21, 42, 63, 84].map((d) => (
      <path key={`o${d}`} d={PETAL_PATH} transform={petal(d, 1.05)} fill="#fde68a" fillOpacity="0.18" stroke="#fde68a" strokeWidth="1.2" />
    ))}
    {[-72, -48, -24, 0, 24, 48, 72].map((d) => (
      <path key={`m${d}`} d={PETAL_PATH} transform={petal(d, 0.86)} fill={`url(#${id}-g)`} stroke="#fff3c4" strokeWidth="0.8" />
    ))}
    {[-40, -20, 0, 20, 40].map((d) => (
      <path key={`i${d}`} d={PETAL_PATH} transform={petal(d, 0.62)} fill={`url(#${id}-g)`} stroke="#fffbe6" strokeWidth="0.8" />
    ))}
    <ellipse cx="100" cy="112" rx="22" ry="16" fill={`url(#${id}-c)`} />
  </svg>
);

type Burst = { id: string; tier: number; petals: Array<{ left: number; delay: number; size: number; drift: number }> };

export const GoldenLotusBloom: React.FC<{ giftId?: string; diamonds?: number }> = ({ giftId, diamonds = 0 }) => {
  const [bursts, setBursts] = useState<Burst[]>([]);
  useEffect(() => {
    if (!giftId) return;
    const tier = giftTier(diamonds);
    const burst: Burst = {
      id: giftId,
      tier,
      petals: Array.from({ length: PETALS[tier] }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * RAIN_S[tier], // petals keep starting for this long, so it rains rather than drops at once
        size: 10 + Math.random() * (6 + tier * 4),
        drift: Math.random() * 40 - 20,
      })),
    };
    setBursts((prev) => [...prev.slice(-2), burst]); // combos: at most 3 bursts on screen
    const t = setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== burst.id)), (FALL_S[tier] + RAIN_S[tier] + 0.5) * 1000);
    return () => clearTimeout(t);
  }, [giftId]);

  return (
    <>
      {bursts.map((b) => (
        <React.Fragment key={b.id}>
          {/* Big gifts flash the whole hall gold */}
          {b.tier >= 3 && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-[45] bg-radial from-amber-100/70 via-amber-300/25 to-transparent mix-blend-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, b.tier === 4 ? 0.9 : 0.5, 0] }}
              transition={{ duration: SHOW_S[b.tier] * 0.6, times: [0, 0.25, 1] }}
            />
          )}
          <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[46]" style={{ width: `${LOTUS_WIDTH[b.tier]}%` }}>
            <motion.div
              initial={{ scale: 0.15, opacity: 0, rotate: -12 }}
              animate={{ scale: [0.15, 1, 1.06, 1.12], opacity: [0, 1, 1, 0], rotate: [-12, 0, 0, 0] }}
              transition={{ duration: SHOW_S[b.tier], times: [0, 0.3, 0.75, 1], ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 ${GLOW[b.tier]}px rgba(253,224,71,0.95)) brightness(${1 + b.tier * 0.12})` }}
            >
              {/* Light behind the flower, wider for bigger gifts */}
              <div
                className="absolute inset-[-30%]"
                style={{ background: 'radial-gradient(closest-side, rgba(254,249,195,0.8), rgba(252,211,77,0.3) 55%, transparent)' }}
              />
              <GoldenLotus id={`gl-${b.id}`} />
            </motion.div>
          </div>
          {b.petals.map((p, i) => (
            <div
              key={i}
              className="absolute -top-6 pointer-events-none z-40 opacity-0"
              style={{ left: `${p.left}%`, animation: `lotus-petal-fall ${FALL_S[b.tier]}s ease-in forwards`, animationDelay: `${p.delay}s` }}
            >
              <span
                className="block rounded-[50%_50%_50%_50%/70%_70%_30%_30%] bg-linear-to-b from-pink-100 via-pink-300 to-pink-500 shadow-[0_0_8px_rgba(244,114,182,0.75)]"
                style={{ width: `${p.size * 0.45}px`, height: `${p.size * 0.75}px`, transform: `rotate(${p.drift}deg)` }}
              />
            </div>
          ))}
        </React.Fragment>
      ))}
    </>
  );
};
