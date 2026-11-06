import React from 'react';

const SPRITE = '/assets/devotees/phattu.png';

export const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

// Kneeling devotee seen from behind. `pray` cycles khấn vái nods and a full lạy (desynced by seed),
// `bow` repeats lạy (offering at the incense burner), `walk` steps up the aisle. A soft floor shadow grounds them.
export const Person: React.FC<{ seed: number; mode: 'pray' | 'walk' | 'bow'; hidden?: boolean }> = ({ seed, mode, hidden }) => (
  <div className={`relative w-full ${hidden ? 'invisible' : ''}`}>
    <div className="absolute left-[8%] right-[8%] -bottom-[4%] h-[12%] rounded-[50%] bg-black/45 blur-[3px]" />
    <div
      className={`devotee-3d ${mode === 'walk' ? 'animate-walk-step' : mode === 'bow' ? 'animate-deep-bow' : 'animate-pray-cycle'}`}
      style={{ animationDelay: mode === 'pray' ? `-${(seed % 90) / 10}s` : '0s' }}
    >
      <img src={SPRITE} alt="" className="w-full h-auto" loading="eager" />
    </div>
  </div>
);
