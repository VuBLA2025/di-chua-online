import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

// Red-crowned crane seen from the side, flying right; the wings flap with the crane-flap animation (index.css)
const Crane: React.FC = () => (
  <svg viewBox="0 0 160 80" className="w-full h-auto drop-shadow-[0_0_6px_rgba(255,236,200,0.55)]" aria-hidden="true">
    {/* legs trailing behind */}
    <path d="M60 44 L18 50 M60 46 L20 53" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" />
    {/* black tail feathers */}
    <path d="M58 40 C46 38 38 42 32 46 C42 46 50 46 58 45 Z" fill="#1f1f1f" />
    {/* far wing (darker, behind the body) */}
    <g className="crane-wing" style={{ animationDelay: '-0.08s' }}>
      <path d="M86 38 C76 14 60 4 40 2 C54 16 68 28 82 40 Z" fill="#d9d4cc" />
    </g>
    {/* body */}
    <ellipse cx="82" cy="42" rx="26" ry="8.5" fill="#fbfaf6" />
    {/* neck: white, with the black throat near the head */}
    <path d="M104 40 C118 38 128 36 140 35" stroke="#fbfaf6" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M124 37 C130 36 134 35.5 139 35" stroke="#1f1f1f" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="142" cy="35" r="4.2" fill="#fbfaf6" />
    <circle cx="142.5" cy="31.8" r="2.3" fill="#d4202a" />
    <path d="M146 35.5 L158 37.5" stroke="#c9a227" strokeWidth="2.2" strokeLinecap="round" />
    {/* near wing: white with black tips */}
    <g className="crane-wing">
      <path d="M84 40 C72 12 54 0 30 0 C46 16 62 30 80 42 Z" fill="#ffffff" />
      <path d="M30 0 C40 8 46 13 52 18 C46 10 40 4 34 1 Z" fill="#1f1f1f" />
      <path d="M38 2 C46 9 52 14 58 20 C54 12 48 6 42 3 Z" fill="#2b2b2b" />
    </g>
  </svg>
);

type Flight = { id: number; leftToRight: boolean; top: number; birds: Array<{ dx: number; dy: number; size: number }> };

// Now and then one crane, or a small flock, glides across the upper hall
export const CraneFlight: React.FC = () => {
  const [flight, setFlight] = useState<Flight | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (wait: number) => {
      timer = setTimeout(() => {
        const count = Math.random() < 0.5 ? 1 : Math.random() < 0.6 ? 2 : 3;
        setFlight({
          id: Date.now(),
          leftToRight: Math.random() < 0.5,
          top: 20 + Math.random() * 16,
          birds: Array.from({ length: count }, (_, i) => ({ dx: i * -9, dy: i * 3.5 * (i % 2 ? 1 : -1), size: 15 - i * 2 })),
        });
        timer = setTimeout(() => {
          setFlight(null);
          schedule(40000 + Math.random() * 40000);
        }, FLIGHT_MS + 500);
      }, wait);
    };
    schedule(12000);
    return () => clearTimeout(timer);
  }, []);

  if (!flight) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-[35] overflow-hidden" aria-hidden="true">
      {flight.birds.map((b, i) => (
        <motion.div
          key={`${flight.id}-${i}`}
          className="absolute animate-crane-bob"
          style={{ top: `${flight.top + b.dy}%`, width: `${b.size}%`, animationDelay: `${-i * 0.7}s` }}
          initial={{ left: flight.leftToRight ? `${-20 + b.dx}%` : `${120 - b.dx}%` }}
          animate={{ left: flight.leftToRight ? `${120 + b.dx}%` : `${-20 - b.dx}%` }}
          transition={{ duration: FLIGHT_MS / 1000, ease: 'linear' }}
        >
          <div style={{ transform: flight.leftToRight ? undefined : 'scaleX(-1)' }}>
            <Crane />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const FLIGHT_MS = 16000;
