import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

// Big name card for the gift giver the camera is following: TikTok avatar and name only
export const SpotlightCard: React.FC<{ person: { id: string; name: string; avatar?: string } | null }> = ({ person }) => (
  <AnimatePresence>
    {person && (
      <motion.div
        key={person.id}
        className="absolute left-1/2 top-[27%] -translate-x-1/2 z-[60] pointer-events-none select-none font-temple"
        initial={{ opacity: 0, y: 16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-2 pl-1 pr-4 py-1 rounded-full border-2 border-[#f3d08a] bg-linear-to-b from-[#5a3413]/95 to-[#2a1608]/95 shadow-[0_0_24px_rgba(253,224,71,0.55)]">
          {person.avatar ? (
            <img src={person.avatar} alt="" referrerPolicy="no-referrer" className="w-11 h-11 rounded-full object-cover border-2 border-[#f3d08a]" />
          ) : (
            <span className="w-11 h-11 rounded-full bg-[#b07a3a] border-2 border-[#f3d08a] text-[#fff7e0] text-lg font-bold flex items-center justify-center">
              {person.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="text-[15px] font-bold text-[#fff3d0] max-w-[200px] truncate">{person.name}</div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
