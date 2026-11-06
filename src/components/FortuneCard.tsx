import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Fortune } from '../data/fortunes';

export type FortuneDraw = { id: string; name: string; fortune: Fortune };

const SHOW_MS = 9000;

// Shows each drawn quẻ for a few seconds, one at a time, in the order they were drawn
export const FortuneCard: React.FC<{ draws: FortuneDraw[] }> = ({ draws }) => {
  const [current, setCurrent] = useState<FortuneDraw | null>(null);
  const queueRef = useRef<FortuneDraw[]>([]);
  const seenRef = useRef(new Set<string>());

  useEffect(() => {
    for (const d of draws) {
      if (seenRef.current.has(d.id)) continue;
      seenRef.current.add(d.id);
      queueRef.current.push(d);
    }
    queueRef.current = queueRef.current.slice(-8);
    if (!current && queueRef.current.length) setCurrent(queueRef.current.shift()!);
  }, [draws]);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setCurrent(queueRef.current.shift() ?? null), SHOW_MS);
    return () => clearTimeout(t);
  }, [current]);

  return (
    <AnimatePresence mode="wait">
      {current && (
        <motion.div
          key={current.id}
          className="absolute left-1/2 top-[30%] -translate-x-1/2 w-[70%] z-[58] pointer-events-none select-none font-temple"
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="rounded-xl border-2 border-[#f3d08a] bg-linear-to-b from-[#5a3413]/95 to-[#2a1608]/95 shadow-[0_0_22px_rgba(253,224,71,0.5)] px-3 py-2 text-center">
            <div className="text-[10px] text-[#f3d08a] truncate">🎋 Quẻ chung cho cả nhà</div>
            <div className="text-[15px] font-bold text-[#fff3d0] leading-tight">
              Quẻ số {current.fortune.so} · {current.fortune.ten}
            </div>
            <div className="mt-1 text-[10.5px] leading-snug text-[#fbe7b8]">{current.fortune.loi}</div>
            <div className="mt-1 text-[7px] text-[#d9a55a]/80">Quẻ vui · cả nhà thả đủ 99 tim là gieo quẻ mới</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
