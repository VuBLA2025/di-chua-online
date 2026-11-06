import React from 'react';
import { StreamConfig } from '../types/temple';

interface HeaderNavProps {
  viewMode: StreamConfig['viewMode'];
  onChangeViewMode: (mode: StreamConfig['viewMode']) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  viewMode,
  onChangeViewMode,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-stone-800 bg-[#120806]/95 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Brand Wordmark (Single text element, no badges) */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xl">☸</span>
        <span className="text-lg font-bold tracking-tight text-amber-200 font-temple whitespace-nowrap">
          Đi Chùa Online
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300">
        <button
          onClick={() => onChangeViewMode('dual')}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap ${
            viewMode === 'dual' ? 'text-amber-400 font-bold' : ''
          }`}
        >
          Chế Độ Kép (Dual View)
        </button>
        <button
          onClick={() => onChangeViewMode('stage_only')}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap ${
            viewMode === 'stage_only' ? 'text-amber-400 font-bold' : ''
          }`}
        >
          Màn Hình Sân Khấu (OBS 9:16)
        </button>
        <button
          onClick={() => onChangeViewMode('control_only')}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap ${
            viewMode === 'control_only' ? 'text-amber-400 font-bold' : ''
          }`}
        >
          Bảng Điều Khiển Streamer
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() =>
            onChangeViewMode(viewMode === 'dual' ? 'stage_only' : 'dual')
          }
          className="px-4 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          {viewMode === 'dual' ? 'Bật Toàn Màn Live (9:16)' : 'Mở Bảng Điều Khiển'}
        </button>
      </div>
    </header>
  );
};
