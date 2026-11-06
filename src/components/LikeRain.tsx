import React, { useEffect, useMemo, useState } from 'react';

// Bar under the chant that fills with likes; every `goal` likes the hall rains flowers for a minute.
export const LikeBar: React.FC<{ progress: number; goal: number; raining: boolean }> = ({ progress, goal, raining }) => (
  <div className="absolute top-[16.8%] left-1/2 -translate-x-1/2 w-[72%] z-30 pointer-events-none select-none font-temple">
    <div className="relative h-3 rounded-full border border-[#c9973f]/70 bg-black/45 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-pink-400 via-pink-300 to-amber-200 transition-[width] duration-200"
        style={{ width: `${raining ? 100 : Math.min(100, (progress / goal) * 100)}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-[7.5px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
        {raining ? '🌸 Mưa hoa ban phước lành 🌸' : `❤️ ${progress}/${goal} tim – Mưa hoa sen, gửi ngàn lời chúc bình an!`}
      </div>
    </div>
  </div>
);

// Second, thinner bar under it: every `goal` hearts from the room draws one quẻ (for fun) for everyone
export const FortuneBar: React.FC<{ progress: number; goal: number }> = ({ progress, goal }) => (
  <div className="absolute top-[19.8%] left-1/2 -translate-x-1/2 w-[60%] z-30 pointer-events-none select-none font-temple">
    <div className="relative h-2.5 rounded-full border border-[#c9973f]/70 bg-black/45 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-amber-500 via-amber-300 to-yellow-100 transition-[width] duration-200"
        style={{ width: `${Math.min(100, (progress / goal) * 100)}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-[6.5px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
        🎋 {progress}/{goal} tim · Đủ tim gieo quẻ cho cả nhà
      </div>
    </div>
  </div>
);

// Pink lotus petals falling over the whole hall until `until` (ms timestamp)
export const FlowerRain: React.FC<{ until: number }> = ({ until }) => {
  const [on, setOn] = useState(until > Date.now());
  useEffect(() => {
    const left = until - Date.now();
    setOn(left > 0);
    if (left <= 0) return;
    const t = setTimeout(() => setOn(false), left);
    return () => clearTimeout(t);
  }, [until]);
  const petals = useMemo(
    () =>
      Array.from({ length: 60 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 7,
        dur: 6 + Math.random() * 3,
        size: 12 + Math.random() * 12,
        tilt: Math.random() * 40 - 20,
      })),
    []
  );
  if (!on) return null;
  return (
    <>
      {petals.map((p, i) => (
        <div
          key={i}
          className="absolute -top-6 pointer-events-none z-40 opacity-0"
          style={{ left: `${p.left}%`, animation: `lotus-petal-fall ${p.dur}s ease-in ${p.delay}s infinite` }}
        >
          <span
            className="block rounded-[50%_50%_50%_50%/70%_70%_30%_30%] bg-linear-to-b from-pink-100 via-pink-300 to-pink-500 shadow-[0_0_8px_rgba(244,114,182,0.75)]"
            style={{ width: `${p.size * 0.45}px`, height: `${p.size * 0.75}px`, transform: `rotate(${p.tilt}deg)` }}
          />
        </div>
      ))}
    </>
  );
};
