import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { GiftEvent, LeaderboardEntry } from '../types/temple';
import { Person, hash } from './Person';

// Points in stage % on the hall painting (y = feet line). The incense burner is painted in at the top of the
// steps; offerers kneel at the foot of the steps, the top donors one row behind them.
const BURNER = { x: 50, y: 58 };
export const MAIN = { x: 50, y: 74 }; // right at the foot of the steps
// The top 6 of TOP THÀNH TÂM kneel on one row of cushions in front of the crowd, with their name plates.
// (The board still lists 10; ranks 7-10 have no cushion, so the front stays tidy.)
// Spread 13% apart so the name plates don't overlap
export const TOP_SEATS = [
  { x: 11, y: 77.3 },
  { x: 24, y: 77.3 },
  { x: 37, y: 77.3 },
  { x: 63, y: 77.3 },
  { x: 76, y: 77.3 },
  { x: 89, y: 77.3 },
];
const widthAt = (y: number) => `${10 * (0.62 + ((y - 70) / 30) * 0.42)}%`;

const LotusShape: React.FC<{ id: string }> = ({ id }) => (
  <svg viewBox="0 0 100 60" className="w-full h-auto" aria-hidden="true">
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff7d1" />
        <stop offset="0.5" stopColor="#fcd34d" />
        <stop offset="1" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <path d="M50 56 C22 54 6 40 4 26 C22 28 38 38 50 56 Z" fill={`url(#${id})`} />
    <path d="M50 56 C78 54 94 40 96 26 C78 28 62 38 50 56 Z" fill={`url(#${id})`} />
    <path d="M50 56 C30 46 22 28 26 10 C40 20 48 36 50 56 Z" fill={`url(#${id})`} />
    <path d="M50 56 C70 46 78 28 74 10 C60 20 52 36 50 56 Z" fill={`url(#${id})`} />
    <path d="M50 56 C40 40 40 18 50 2 C60 18 60 40 50 56 Z" fill={`url(#${id})`} />
  </svg>
);

// Bronze name plate with the viewer's TikTok avatar (initial when there is none)
const NamePlate: React.FC<{ name: string; avatar?: string; badge?: string; big?: boolean; lift?: boolean; caption?: string }> = ({
  name,
  avatar,
  badge,
  big,
  lift,
  caption,
}) => (
  <div
    className={`absolute bottom-full ${lift ? 'mb-[15px]' : 'mb-0.5'} font-temple flex items-center gap-1 w-max pl-0.5 pr-1.5 rounded-full border border-[#d9a55a] bg-linear-to-b from-[#5a3413] to-[#2a1608] shadow-[0_0_8px_rgba(217,165,90,0.45)] ${
      big ? 'max-w-[120px] text-[9px]' : 'max-w-[58px] text-[6.5px]'
    }`}
  >
    {caption && (
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 w-max px-2 rounded-full border border-[#d9a55a] bg-[#2a1608] text-[7.5px] font-bold text-[#f3d08a]">
        {caption}
      </span>
    )}
    {badge && (
      <span className="shrink-0 w-3 h-3 rounded-full bg-[#f3d08a] text-[#3a1f0b] text-[7px] font-black flex items-center justify-center">{badge}</span>
    )}
    {avatar ? (
      <img src={avatar} alt="" referrerPolicy="no-referrer" className={`shrink-0 rounded-full object-cover ${big ? 'w-4 h-4' : 'w-3 h-3'}`} />
    ) : (
      <span
        className={`shrink-0 rounded-full bg-[#b07a3a] text-[#fff7e0] font-bold flex items-center justify-center ${big ? 'w-4 h-4 text-[8px]' : 'w-3 h-3 text-[6px]'}`}
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
    )}
    <span className="truncate font-semibold text-[#fbe7b8] leading-[14px]">{name}</span>
  </div>
);

// A person kneeling at a named place; slides to the new place when the order changes, walks up the aisle when new
const Occupant: React.FC<{
  id: string;
  name: string;
  avatar?: string;
  x: number;
  y: number;
  badge?: string;
  big?: boolean;
  lift?: boolean;
  caption?: string;
  mode?: 'pray' | 'bow';
  labelsOnly?: boolean;
}> = ({ id, name, avatar, x, y, badge, big, lift, caption, mode = 'pray', labelsOnly }) => {
  const [arrived, setArrived] = useState(false);
  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
      style={{ width: widthAt(y), zIndex: arrived ? Math.round(y) + 1 : 120 }}
      initial={{ left: '50%', top: '108%' }}
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={{ duration: arrived ? 1.2 : 2.6, ease: 'easeInOut' }}
      onAnimationComplete={() => setArrived(true)}
    >
      {(!labelsOnly || arrived) && <NamePlate name={name} avatar={avatar} badge={badge} big={big} lift={lift} caption={caption} />}
      <div className={big && !labelsOnly ? 'w-full drop-shadow-[0_0_10px_rgba(251,191,36,0.85)]' : 'w-full'}>
        <Person seed={hash(id)} mode={arrived ? mode : 'walk'} hidden={labelsOnly} />
      </div>
    </motion.div>
  );
};

// Kneeling cushion like the reference: red velvet top with gold border, corner scrolls and a lotus,
// on a dark wooden base with gold carving and scrolled feet. Seen slightly from above, like the hall.
const Cushion: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <div className="absolute -translate-x-1/2 -translate-y-[62%]" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, zIndex: Math.round(y) - 1 }}>
    <svg viewBox="0 0 200 90" className="w-full h-auto drop-shadow-[0_4px_5px_rgba(0,0,0,0.6)]" aria-hidden="true">
      <defs>
        <linearGradient id="velvet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8202a" />
          <stop offset="0.6" stopColor="#9c0f19" />
          <stop offset="1" stopColor="#6d0911" />
        </linearGradient>
        <linearGradient id="velvetSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f0d16" />
          <stop offset="1" stopColor="#58060c" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe6a2" />
          <stop offset="0.5" stopColor="#d9a441" />
          <stop offset="1" stopColor="#8a5a14" />
        </linearGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b1d10" />
          <stop offset="1" stopColor="#1e0d06" />
        </linearGradient>
      </defs>
      {/* wooden base with gold rim and carving */}
      <path d="M14 62 H186 L184 80 H16 Z" fill="url(#wood)" />
      <rect x="12" y="59" width="176" height="4" rx="1.5" fill="url(#gold)" />
      <path d="M70 72 q8 -7 16 0 q6 -6 14 -2 q8 -4 14 2 q8 -7 16 0" fill="none" stroke="url(#gold)" strokeWidth="1.6" />
      <path d="M100 64 l-5 7 h10 z" fill="url(#gold)" />
      <path d="M16 63 v19 q0 4 6 4 h6 q-4 -6 -2 -12 q-4 -4 -2 -11 z" fill="url(#gold)" />
      <path d="M184 63 v19 q0 4 -6 4 h-6 q4 -6 2 -12 q4 -4 2 -11 z" fill="url(#gold)" />
      {/* velvet cushion: front side, then top */}
      <path d="M10 30 H190 Q194 30 194 36 V54 Q194 60 188 60 H12 Q6 60 6 54 V36 Q6 30 10 30 Z" fill="url(#velvetSide)" />
      <path d="M22 6 H178 Q190 6 192 18 L194 32 Q194 38 186 38 H14 Q6 38 6 32 L8 18 Q10 6 22 6 Z" fill="url(#velvet)" />
      {/* gold border and corner scrolls on the top */}
      <path d="M24 11 H176 Q184 11 185 18 L187 30 Q187 33 183 33 H17 Q13 33 13 30 L15 18 Q16 11 24 11 Z" fill="none" stroke="url(#gold)" strokeWidth="1.3" />
      {[
        'M20 14 q5 -1 6 3 q-3 0 -3 3',
        'M180 14 q-5 -1 -6 3 q3 0 3 3',
        'M17 30 q6 1 7 -3 q-4 0 -3 -3',
        'M183 30 q-6 1 -7 -3 q4 0 3 -3',
      ].map((d) => (
        <path key={d} d={d} fill="none" stroke="url(#gold)" strokeWidth="1.4" strokeLinecap="round" />
      ))}
      {/* lotus in the middle of the top */}
      <g transform="translate(100 22)">
        <path d="M0 6 C-10 5 -18 0 -20 -4 C-12 -4 -5 0 0 6 Z" fill="url(#gold)" />
        <path d="M0 6 C10 5 18 0 20 -4 C12 -4 5 0 0 6 Z" fill="url(#gold)" />
        <path d="M0 6 C-7 2 -10 -5 -9 -10 C-4 -6 -1 0 0 6 Z" fill="url(#gold)" />
        <path d="M0 6 C7 2 10 -5 9 -10 C4 -6 1 0 0 6 Z" fill="url(#gold)" />
        <path d="M0 6 C-4 0 -4 -8 0 -13 C4 -8 4 0 0 6 Z" fill="url(#gold)" />
      </g>
    </svg>
  </div>
);

// Incense smoke rising from the painted burner: always a few thin, drifting wisps; when someone lights
// incense it thickens and the burner glows
const SMOKE = [
  { x: 42, delay: 0, dur: 7 },
  { x: 50, delay: 0.8, dur: 8 },
  { x: 57, delay: 1.6, dur: 7.5 },
  { x: 46, delay: 2.4, dur: 8.5 },
  { x: 54, delay: 3.2, dur: 7 },
  { x: 40, delay: 4, dur: 8 },
  { x: 60, delay: 4.8, dur: 7.5 },
  { x: 48, delay: 5.6, dur: 9 },
  { x: 52, delay: 6.4, dur: 8 },
];
const BurnerGlow: React.FC<{ on: boolean }> = ({ on }) => (
  <div className="absolute -translate-x-1/2 -translate-y-full w-[30%] aspect-[1/2] pointer-events-none" style={{ left: `${BURNER.x}%`, top: `${BURNER.y + 1}%`, zIndex: 60 }}>
    <span className={`absolute left-[22%] right-[22%] bottom-0 h-[24%] rounded-full bg-amber-300/45 blur-xl transition-opacity duration-700 ${on ? 'opacity-100' : 'opacity-0'}`} />
    {/* Standing haze above the burner, always there */}
    <span className="absolute left-[30%] right-[30%] bottom-[6%] h-[70%] rounded-full bg-white/15 blur-2xl" />
    {(on ? [...SMOKE, ...SMOKE.map((w) => ({ ...w, x: w.x + 3, delay: w.delay + 0.4 }))] : SMOKE).map((w, i) => (
      <span
        key={i}
        className="absolute bottom-[6%] w-[18%] h-[30%] rounded-full bg-white/55 blur-[7px] animate-incense-drift"
        style={{ left: `${w.x - 8}%`, animationDelay: `${w.delay}s`, animationDuration: `${w.dur}s` }}
      />
    ))}
  </div>
);

// Each gift sends a golden lotus up from the burner toward the Buddha, with the giver's name and rising light motes
type RisingLotus = { id: string; label: string; motes: number[] };
const OfferingLotuses: React.FC<{ offering: GiftEvent | null }> = ({ offering }) => {
  const [lotuses, setLotuses] = useState<RisingLotus[]>([]);
  useEffect(() => {
    if (!offering) return;
    const lotus: RisingLotus = {
      id: offering.id,
      label: `${offering.displayName || offering.username} dâng ${offering.giftName}`,
      motes: Array.from({ length: 8 }, () => Math.random()),
    };
    setLotuses((prev) => [...prev.slice(-4), lotus]); // at most 5 in the air during combos
    // Not cleared on the next gift: each lotus removes itself once its 4s rise is over
    setTimeout(() => setLotuses((prev) => prev.filter((l) => l.id !== lotus.id)), 4200);
  }, [offering?.id]);

  return (
    <>
      {lotuses.map((l) => (
        <div key={l.id} className="absolute w-[14%] pointer-events-none" style={{ left: `${BURNER.x}%`, top: `${BURNER.y - 8}%`, zIndex: 130 }}>
          <div className="-translate-x-1/2 flex flex-col items-center animate-lotus-rise">
            <div className="w-full drop-shadow-[0_0_10px_rgba(253,224,71,0.95)]">
              <LotusShape id={`rise-${l.id}`} />
            </div>
            <div className="mt-0.5 w-max max-w-[150px] truncate px-1.5 rounded-full bg-black/60 text-[8px] font-semibold text-amber-100">{l.label}</div>
          </div>
          {l.motes.map((m, i) => (
            <span
              key={i}
              className="absolute top-[40%] w-1 h-1 rounded-full bg-amber-200 shadow-[0_0_6px_2px_rgba(253,224,71,0.8)] animate-light-mote"
              style={{ left: `${m * 160 - 80}%`, animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export const OfferingArea: React.FC<{
  offering: GiftEvent | null;
  offerers: GiftEvent[];
  topDonors: LeaderboardEntry[];
  layer?: 'all' | 'floor' | 'labels'; // floor goes under the 3D people, labels over them
  burnerLit?: boolean; // 3D mode: smoke when the offerer actually lights the incense
  away?: string[]; // usernames up at the burner: no plate at their cushion meanwhile
}> = ({ offering, offerers, topDonors, layer = 'all', burnerLit, away = [] }) => {
  const labelsOnly = layer === 'labels';
  return (
    <div className="absolute inset-0 pointer-events-none">
      {layer !== 'labels' && (
        <>
          <BurnerGlow on={burnerLit ?? Boolean(offering)} />
          {TOP_SEATS.map((m, i) => (
            <Cushion key={`top-${i}`} x={m.x} y={m.y} w={8.5} />
          ))}
        </>
      )}

      {layer !== 'floor' && (
        <>
          {/* 2D only: the giver kneels at the chủ lễ mat while the gift shows (in 3D they walk up to the burner) */}
          {offering && !labelsOnly && (
            <Occupant
              key={`offer-${offering.username}`}
              id={offering.username}
              name={offering.displayName || offering.username}
              avatar={offering.avatarUrl}
              x={MAIN.x}
              y={MAIN.y}
              big
              mode="bow"
            />
          )}
          {topDonors.slice(0, TOP_SEATS.length).map((d, i) => away.includes(d.username) ? null : (
            <Occupant
              key={`top-${d.username}`}
              id={d.username}
              name={d.displayName || d.username}
              avatar={d.avatarUrl}
              x={TOP_SEATS[i].x}
              y={TOP_SEATS[i].y}
              badge={String(i + 1)}
              labelsOnly={labelsOnly}
            />
          ))}
          <OfferingLotuses offering={offering} />
        </>
      )}
    </div>
  );
};
