import React from 'react';

interface TempleLightingEffectsProps {
  auraIntensity: number; // 0 to 1
  isGiftActive: boolean;
}

export const TempleLightingEffects: React.FC<TempleLightingEffectsProps> = ({
  auraIntensity,
  isGiftActive,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* 1. TOP CEILING DOME GOD RAYS (Tia Sáng Phật Quang Chiếu Từ Mái Vòm) */}
      <div
        className="absolute top-0 inset-x-0 h-[380px] transition-opacity duration-700 ease-out flex justify-center"
        style={{
          opacity: 0.5 + auraIntensity * 0.5,
        }}
      >
        {/* Central Cone of Divine Light */}
        <div
          className="w-[280px] h-full"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 0%, rgba(255,235,150,0) 0deg, rgba(255,235,150,0.45) 20deg, rgba(255,215,80,0.8) 30deg, rgba(255,235,150,0.45) 40deg, rgba(255,235,150,0) 60deg)',
            filter: `blur(8px) drop-shadow(0 0 ${20 + auraIntensity * 30}px rgba(255,215,0,0.8))`,
          }}
        />

        {/* Angled Sunlight Beams */}
        <div
          className="absolute top-0 w-full h-full opacity-60"
          style={{
            backgroundImage: `
              linear-gradient(115deg, transparent 40%, rgba(255,230,120,0.35) 45%, rgba(255,245,180,0.7) 48%, rgba(255,230,120,0.35) 51%, transparent 56%),
              linear-gradient(65deg, transparent 42%, rgba(255,230,120,0.35) 47%, rgba(255,245,180,0.7) 50%, rgba(255,230,120,0.35) 53%, transparent 58%)
            `,
          }}
        />
      </div>

      {/* 2. COMPACT SOFT ROTATING HALO IN TOP-LEFT CORNER (Vòng Sáng Nhỏ Dịu Mắt Ở Góc Trái Trên Cùng) */}
      <div
        className="absolute top-3.5 left-3.5 w-14 h-14 rounded-full transition-all duration-700 ease-out flex items-center justify-center pointer-events-none"
        style={{
          opacity: 0.7 + auraIntensity * 0.3,
          transform: `scale(${1 + auraIntensity * 0.15})`,
        }}
      >
        {/* Soft Radial Ambient Glow */}
        <div
          className="absolute -inset-2 rounded-full bg-radial from-amber-400/40 via-amber-600/15 to-transparent blur-xs pointer-events-none"
        />

        {/* Gentle Rotating Ray Ring */}
        <div
          className="absolute inset-0 rounded-full animate-spin-slow opacity-80"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.6))',
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 46 * Math.cos((i * 15 * Math.PI) / 180)}
                y2={50 + 46 * Math.sin((i * 15 * Math.PI) / 180)}
                stroke="#fef3c7"
                strokeWidth={i % 2 === 0 ? '1.5' : '0.8'}
                strokeOpacity={0.7}
              />
            ))}
          </svg>
        </div>

        {/* Gentle Counter-rotating Inner Ring */}
        <div
          className="absolute inset-1.5 rounded-full animate-spin-reverse-slow opacity-75 border border-dashed border-amber-300/60"
        />

        {/* Soothing Core Lotus / Dharma Disc */}
        <div className="w-6 h-6 rounded-full bg-radial from-amber-100 via-amber-400/80 to-amber-700/60 shadow-xs flex items-center justify-center text-[10px] text-amber-950 font-bold">
          ☸
        </div>
      </div>

      {/* 3. FLICKERING TEMPLE LANTERNS & CANDLES GLOW (Đèn Lồng & Nến Bập Bùng) */}
      {/* Left Column Lantern Glow */}
      <div className="absolute top-[18%] left-[7%] w-14 h-24 rounded-full bg-radial from-amber-300/60 via-amber-500/25 to-transparent blur-md animate-pulse" />
      <div className="absolute top-[38%] left-[5%] w-12 h-20 rounded-full bg-radial from-amber-300/50 via-amber-500/20 to-transparent blur-md animate-pulse" />

      {/* Right Column Lantern Glow */}
      <div className="absolute top-[18%] right-[7%] w-14 h-24 rounded-full bg-radial from-amber-300/60 via-amber-500/25 to-transparent blur-md animate-pulse" />
      <div className="absolute top-[38%] right-[5%] w-12 h-20 rounded-full bg-radial from-amber-300/50 via-amber-500/20 to-transparent blur-md animate-pulse" />

      {/* Altar Candlesticks & Lamps (Chân Đèn Bàn Thờ) */}
      <div className="absolute top-[58%] left-[22%] w-10 h-10 rounded-full bg-radial from-yellow-200/90 via-amber-400/40 to-transparent blur-xs animate-ping" />
      <div className="absolute top-[58%] right-[22%] w-10 h-10 rounded-full bg-radial from-yellow-200/90 via-amber-400/40 to-transparent blur-xs animate-ping" />
      <div className="absolute top-[61%] left-1/2 -translate-x-1/2 w-16 h-8 rounded-full bg-radial from-amber-200/80 via-amber-500/35 to-transparent blur-sm animate-pulse" />

      {/* 4. SHINING FLOOR REFLECTION PULSE (Ánh Sáng Sàn Phản Chiếu Kim Cương) */}
      <div
        className="absolute bottom-[2%] inset-x-0 h-[28%] transition-opacity duration-500 pointer-events-none flex justify-center"
        style={{
          opacity: isGiftActive ? 0.9 : 0.45,
        }}
      >
        <div
          className="w-[320px] h-full rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at 50% 60%, rgba(255,225,80,0.7) 0%, rgba(245,158,11,0.3) 40%, transparent 75%)',
            filter: 'blur(16px)',
          }}
        />
      </div>

      {/* 5. GIFT EXPLOSION FLASH (Chớp Sáng Hào Quang Khi Nhận Quà) */}
      {isGiftActive && (
        <div className="absolute inset-0 bg-radial from-amber-200/35 via-amber-400/15 to-transparent pointer-events-none animate-in fade-in duration-300" />
      )}
    </div>
  );
};
