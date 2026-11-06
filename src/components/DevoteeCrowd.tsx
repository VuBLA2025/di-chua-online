import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Devotee } from '../types/temple';
import { Person, hash } from './Person';

interface DevoteeCrowdProps {
  devotees: Devotee[];
  recentGiftDonor: string | null;
  recentGiftPrayer?: string | null;
  labelsOnly?: boolean; // 3D layer draws the people; keep only chat bubbles here
}

// Seats in stage % (x = center, y = feet line) for everyone else: a packed, untidy crowd on both sides of a
// narrow walkway down the middle (just room for one person; it widens a little toward the camera). Rows are
// staggered and every spot is nudged a little at random, so nobody lines up and people overlap like a busy
// courtyard. The jitter is seeded, so seats stay put between reloads. The top 6 kneel in front on cushions.
const CROWD_ROWS_Y = [83.5, 85.8, 88.1, 90.4, 92.7, 95, 97.3];
const SEAT_STEP_X = 4.2;
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const SEATS = (() => {
  const rand = seeded(20261101);
  const seats: Array<{ x: number; y: number }> = [];
  CROWD_ROWS_Y.forEach((rowY, r) => {
    const inner = 4 + (rowY - 88) * 0.15; // half the walkway
    for (let x = 50 - inner - (r % 2 ? SEAT_STEP_X / 2 : 0); x >= 3; x -= SEAT_STEP_X) {
      for (const side of [-1, 1]) {
        const y = rowY + (rand() - 0.5) * 1.4;
        // nudge sideways, but never into the walkway
        const offset = Math.max(inner, 50 - x + (rand() - 0.5) * 2.6);
        seats.push({ x: 50 + side * offset, y });
      }
    }
  });
  return seats;
})();
// Farther rows (higher on screen) are smaller
const widthAt = (y: number) => `${6.5 * (0.62 + ((y - 70) / 30) * 0.42)}%`;
const WALK_MS = 3500;

const Viewer: React.FC<{ devotee: Devotee; isVip: boolean; prayerText: string | null; labelsOnly?: boolean }> = ({
  devotee,
  isVip,
  prayerText,
  labelsOnly,
}) => {
  const { x, y } = SEATS[(devotee.seat ?? 0) % SEATS.length];
  const isNew = Date.now() - devotee.joinedAt < WALK_MS;
  const [arrived, setArrived] = useState(!isNew);

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
      style={{ width: widthAt(y), zIndex: arrived ? Math.round(y) : 120 }}
      initial={isNew ? { left: '50%', top: '108%' } : false}
      animate={
        isNew
          ? { left: ['50%', '50%', `${x}%`], top: ['108%', `${y}%`, `${y}%`] }
          : { left: `${x}%`, top: `${y}%` }
      }
      transition={{ duration: WALK_MS / 1000, times: [0, 0.75, 1], ease: 'easeInOut' }}
      onAnimationComplete={() => setArrived(true)}
    >
      {/* Their TikTok name over the head (short, so a packed crowd stays readable), what they say above it */}
      {arrived && (
        <div className="absolute bottom-full mb-0.5 w-max max-w-[44px] truncate px-1 rounded-full bg-[#2a1608]/80 border border-[#d9a55a]/70 text-[5.5px] leading-[9px] font-semibold text-[#fbe7b8] font-temple">
          {devotee.displayName}
        </div>
      )}
      {prayerText && (!labelsOnly || arrived) && (
        <div className="absolute bottom-full mb-6 z-50 w-max max-w-[120px] px-2 py-0.5 rounded-lg bg-[#2a1608]/85 border border-[#b07a3a]/60 text-[#fbe7b8] text-[9px] font-semibold leading-tight text-center shadow-md animate-float-subtle">
          <div className="line-clamp-2">{prayerText}</div>
        </div>
      )}
      <div className={`w-full ${!labelsOnly && (isVip || !arrived) ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]' : ''}`}>
        <Person seed={hash(devotee.username)} mode={arrived ? 'pray' : 'walk'} hidden={labelsOnly} />
      </div>
    </motion.div>
  );
};

export const DevoteeCrowd: React.FC<DevoteeCrowdProps> = ({ devotees, recentGiftDonor, recentGiftPrayer, labelsOnly }) => {
  // One viewer per seat (App keeps seats unique); empty seats keep a background devotee
  const bySeat = new Map<number, Devotee>();
  for (const d of devotees) bySeat.set((d.seat ?? 0) % SEATS.length, d);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {SEATS.map((seat, i) =>
        bySeat.has(i) || labelsOnly ? null : (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${seat.x}%`, top: `${seat.y}%`, width: widthAt(seat.y), zIndex: Math.round(seat.y) }}
          >
            <Person seed={i * 37} mode="pray" />
          </div>
        )
      )}

      {[...bySeat.values()].map((d) => {
        const isVip = Boolean(recentGiftDonor && d.username.toLowerCase() === recentGiftDonor.toLowerCase());
        return (
          <Viewer
            key={d.id}
            devotee={d}
            isVip={isVip}
            prayerText={(isVip && recentGiftPrayer) || d.activeComment || null}
            labelsOnly={labelsOnly}
          />
        );
      })}
    </div>
  );
};
