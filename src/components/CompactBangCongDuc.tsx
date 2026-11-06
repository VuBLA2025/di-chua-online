import React from 'react';
import { LeaderboardEntry } from '../types/temple';

// Entry hint and, right under it, the top-10 merit board (1 point per comment, 10 per gift coin).
// Both sit a little in from the right edge so TikTok's side buttons don't cover them. Positions are % of the 9:16 stage.
export const CompactBangCongDuc: React.FC<{ topDonors: LeaderboardEntry[]; showBoard?: boolean; keyword?: string; title?: string }> = ({
  topDonors,
  showBoard = true,
  keyword = 'adidaphat',
  title = 'TOP THÀNH TÂM',
}) => (
  <>
    <div className="absolute left-[72%] top-[46%] w-[22%] h-[3.6%] z-140 pointer-events-none select-none rounded-md border-2 border-[#c9973f] bg-linear-to-b from-[#24130a] to-[#120904] flex flex-col items-center justify-center text-[7px] leading-tight font-semibold font-temple text-[#f3d08a] text-center">
      <span>
        Gõ <strong className="text-white">"{keyword}"</strong>
      </span>
      <span className="text-[6px]">để vào dâng hương</span>
    </div>
    {showBoard && (
    <div className="absolute left-[72%] top-[50.2%] w-[22%] z-140 pointer-events-none select-none rounded-md border-2 border-[#c9973f] bg-linear-to-b from-[#24130a]/95 to-[#120904]/95 shadow-[0_0_12px_rgba(201,151,63,0.45)] px-1 py-0.5">
      <div className="text-center text-[7px] font-black tracking-wide text-[#f3d08a] font-temple leading-tight border-b border-[#c9973f]/60 pb-0.5">
        ❀ {title}
      </div>
      {topDonors.length === 0 ? (
        <div className="py-1.5 text-center text-[7px] text-[#e8c98e] font-temple">Comment để lên bảng</div>
      ) : (
        <ol className="flex flex-col gap-[1.5px] mt-0.5 font-temple">
          {topDonors.slice(0, 10).map((d, i) => (
            <li key={d.username} className="flex items-center gap-0.5 text-[5.8px] leading-none">
              <span
                className={`shrink-0 w-2 h-2 rounded-full flex items-center justify-center text-[5px] font-black ${
                  i < 3 ? 'bg-[#f3d08a] text-[#3a1f0b]' : 'border border-[#c9973f] text-[#e8c98e]'
                }`}
              >
                {i + 1}
              </span>
              <span className="truncate flex-1 text-[#fbe7b8]">{d.displayName || d.username}</span>
              <span className="shrink-0 tabular-nums font-bold text-[#f3d08a]">{(d.score ?? 0).toLocaleString('vi-VN')}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
    )}
  </>
);
