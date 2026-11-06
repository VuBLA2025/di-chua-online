import React from 'react';
import { GiftEvent } from '../types/temple';

interface GiftNotificationBannerProps {
  currentGift: GiftEvent | null;
}

export const GiftNotificationBanner: React.FC<GiftNotificationBannerProps> = ({
  currentGift,
}) => {
  if (!currentGift) return null;

  const isRose = currentGift.giftType === 'dang_huong';
  const isLotus = currentGift.giftType === 'dang_hoa_sen';

  return (
    <div className="absolute left-3 top-[45%] z-150 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300 pointer-events-none">
      {/* Main Glass Gift Pill */}
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-stone-900/90 border border-amber-400/50 shadow-2xl backdrop-blur-md">
        {/* User Avatar with Golden Ring */}
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-600 via-amber-300 to-yellow-100 p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-stone-800 flex items-center justify-center text-sm font-bold text-amber-200 uppercase overflow-hidden">
            {(currentGift.displayName || currentGift.username).slice(0, 2)}
          </div>
        </div>

        {/* Gift Details */}
        <div className="flex flex-col pr-1">
          <span className="text-xs font-bold text-white max-w-[130px] truncate leading-tight">
            {currentGift.displayName || currentGift.username}
          </span>
          <span className="text-[11px] font-medium text-amber-300 flex items-center gap-1 leading-tight mt-0.5">
            <span>đã gửi</span>
            <span className="font-semibold text-white">
              {currentGift.giftName}
            </span>
          </span>
        </div>

        {/* 3D Thematic Gift Icon */}
        <div className="w-10 h-10 flex items-center justify-center text-2xl filter drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
          {isRose ? '🌹' : isLotus ? '🪷' : '✋'}
        </div>
      </div>

      {/* Combo Counter (x1, x2, x4, x10...) with dynamic pulse animation */}
      <div className="flex items-baseline gap-0.5 animate-bounce">
        <span className="text-xl font-black italic text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          x
        </span>
        <span
          key={currentGift.comboCount}
          className="text-4xl font-black italic bg-linear-to-b from-yellow-100 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_3px_8px_rgba(251,191,36,0.9)] transform -skew-x-6 tracking-tighter"
        >
          {currentGift.comboCount}
        </span>
      </div>
    </div>
  );
};
