import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TempleLightingEffects } from './TempleLightingEffects';
import { CompactBangCongDuc } from './CompactBangCongDuc';
import { DevoteeCrowd, SEATS } from './DevoteeCrowd';
import { OfferingArea, TOP_SEATS } from './OfferingArea';
import { Temple3D } from '../three/Temple3D';
import type { ActorSpec } from '../three/templeScene';
import { GiftNotificationBanner } from './GiftNotificationBanner';
import { GoldenLotusBloom } from './GoldenLotusBloom';
import { FlowerRain, FortuneBar, LikeBar } from './LikeRain';
import { CraneFlight } from './CraneFlight';
import { SpotlightCard } from './SpotlightCard';
import { FortuneCard, FortuneDraw } from './FortuneCard';
import { FortuneBox } from './FortuneBox';
import { LIKES_PER_RAIN } from '../services/likeRain';
import {
  Devotee,
  GiftEvent,
  OfferRequest,
  LeaderboardEntry,
  StreamConfig,
} from '../types/temple';

interface ChanhDienStageProps {
  config: StreamConfig;
  devotees: Devotee[];
  currentGift: GiftEvent | null;
  offerers: GiftEvent[];
  offerRequests: OfferRequest[];
  leaderboardDonors: LeaderboardEntry[];
  auraIntensity: number;
  isGiftActive: boolean;
  onRingBell: () => void;
  onPlayGong: () => void;
  onToggleBgm?: () => void;
  isBgmPlaying?: boolean;
  likeProgress?: number; // likes toward the next flower rain
  rainUntil?: number; // flower rain lasts until this time (ms)
  spotlightRequests?: OfferRequest[]; // gift givers the camera follows up close
  onSpotlightStart?: (username: string) => void;
  fortuneDraws?: FortuneDraw[]; // quẻ drawn every 99 hearts from the room, shown one at a time
  fortuneProgress?: number; // hearts toward the next quẻ // read their name and blessing as the close-up begins
}

const MAX_AT_BURNER = 5; // up to five people light incense together (5 spots at the burner), the rest wait in line

export const ChanhDienStage: React.FC<ChanhDienStageProps> = ({
  config,
  devotees,
  currentGift,
  offerers,
  offerRequests,
  leaderboardDonors,
  auraIntensity,
  isGiftActive,
  onRingBell,
  onPlayGong,
  onToggleBgm,
  isBgmPlaying = true,
  likeProgress = 0,
  rainUntil = 0,
  spotlightRequests = [],
  onSpotlightStart,
  fortuneDraws = [],
  fortuneProgress = 0,
}) => {
  // Re-render when a flower rain ends so the like bar switches back to counting
  const [raining, setRaining] = useState(false);
  useEffect(() => {
    const left = rainUntil - Date.now();
    setRaining(left > 0);
    if (left <= 0) return;
    const t = setTimeout(() => setRaining(false), left);
    return () => clearTimeout(t);
  }, [rainUntil]);

  // 3D devotees when public/assets/3d/ has the model, otherwise the 2D sprites
  const [has3D, setHas3D] = useState(false);
  const [incenseLit, setIncenseLit] = useState(false);
  // Top-10 donors who are up at the burner right now (their cushion name plate hides meanwhile)
  const [awayKeys, setAwayKeys] = useState<string[]>([]);
  // Incense offerings (gift or "adidaphat"): up to five at the burner together, the rest wait in line,
  // and each person at most once a minute so spamming doesn't send them up again and again
  const [activeOffers, setActiveOffers] = useState<OfferRequest[]>([]);
  const queueRef = useRef<OfferRequest[]>([]);
  const seenRef = useRef(new Set<string>());
  const lastOfferAtRef = useRef(new Map<string, number>());
  const keyUserRef = useRef(new Map<string, string>()); // actor key -> username, to end the right offering

  const activeRef = useRef<OfferRequest[]>([]);

  const settleOffers = (done?: string) => {
    const active = activeRef.current;
    const next = done ? active.filter((o) => o.username !== done) : [...active];
    while (next.length < MAX_AT_BURNER && queueRef.current.length) {
      const r = queueRef.current.shift()!;
      next.push(r);
      // Safety net: free the slot even if the person never makes it back (e.g. removed from the hall)
      setTimeout(() => settleOffers(r.username), 90000);
    }
    if (next.length === active.length && next.every((o, i) => o === active[i])) return;
    activeRef.current = next;
    setActiveOffers(next);
  };

  useEffect(() => {
    const now = Date.now();
    for (const r of offerRequests) {
      if (seenRef.current.has(r.id)) continue;
      seenRef.current.add(r.id);
      const waiting = activeRef.current.some((a) => a.username === r.username) || queueRef.current.some((q) => q.username === r.username);
      if (waiting || now - (lastOfferAtRef.current.get(r.username) ?? 0) < 60000) continue;
      lastOfferAtRef.current.set(r.username, now);
      queueRef.current.push(r);
    }
    queueRef.current = queueRef.current.slice(-12);
    settleOffers();
  }, [offerRequests]);

  const offerKeyRef = useRef(new Map<string, string>()); // username -> the actor doing their offering right now

  const specs = useMemo(() => {
    const list: ActorSpec[] = [];
    const offering = new Map(activeOffers.map((o) => [o.username, o]));
    const offerKeys = new Map<string, string>();
    offerKeyRef.current = offerKeys;
    const offerFor = (key: string, username: string) => {
      const o = offering.get(username);
      if (!o) return {};
      keyUserRef.current.set(key, username);
      offerKeys.set(username, key);
      offering.delete(username);
      return { offer: o.id, label: { name: o.displayName || o.username, avatar: o.avatarUrl || undefined } };
    };
    // Top 6 kneel on the row of cushions
    const top = leaderboardDonors.slice(0, TOP_SEATS.length);
    top.forEach((d, i) => {
      const key = `top-${d.username}`;
      list.push({ key, at: TOP_SEATS[i], mode: 'pray', enter: 'walk', label: { name: d.displayName || d.username, avatar: d.avatarUrl }, ...offerFor(key, d.username) });
    });
    // Everyone else in the rows at the bottom; an offerer leaves their seat, offers incense and comes back
    const bySeat = new Map(devotees.map((d) => [(d.seat ?? 0) % SEATS.length, d]));
    SEATS.forEach((at, i) => {
      const d = bySeat.get(i);
      if (!d) return list.push({ key: `npc-${i}`, at, mode: 'pray', enter: 'place' });
      const key = `v-${d.id}`;
      list.push({ key, at, mode: 'pray', enter: Date.now() - d.joinedAt < 3500 ? 'walk' : 'place', ...offerFor(key, d.username) });
    });
    // Offerers with no place in the hall walk up from the back, offer incense and leave
    for (const o of offering.values()) {
      const key = `guest-${o.username}`;
      list.push({ key, at: { x: 50, y: 106 }, mode: 'pray', enter: 'walk', leave: true, ...offerFor(key, o.username) });
    }
    return list;
  }, [devotees, leaderboardDonors, activeOffers]);


  // Spotlight: one gift giver at a time is followed up close while they walk up, light incense and bow.
  // They go to the front of the incense line (even if they offered less than a minute ago).
  const bgRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const [spotKey, setSpotKey] = useState<string | null>(null);
  const [spotPerson, setSpotPerson] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const spotQueueRef = useRef<Array<OfferRequest & { at: number }>>([]);
  const spotSeenRef = useRef(new Set<string>());
  const spotBusyRef = useRef(false);
  const spotNextAtRef = useRef(0);
  const onSpotlightStartRef = useRef(onSpotlightStart);
  onSpotlightStartRef.current = onSpotlightStart;

  useEffect(() => {
    for (const r of spotlightRequests) {
      if (spotSeenRef.current.has(r.id)) continue;
      spotSeenRef.current.add(r.id);
      if (spotQueueRef.current.some((q) => q.username === r.username)) continue;
      spotQueueRef.current.push({ ...r, at: Date.now() });
      if (!activeRef.current.some((a) => a.username === r.username)) {
        queueRef.current = [{ ...r, id: `${r.id}-spot` }, ...queueRef.current.filter((q) => q.username !== r.username)];
        lastOfferAtRef.current.set(r.username, Date.now());
        settleOffers();
      }
    }
  }, [spotlightRequests]);

  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      spotQueueRef.current = spotQueueRef.current.filter((q) => now - q.at < 120000);
      if (spotBusyRef.current || now < spotNextAtRef.current) return;
      for (const q of spotQueueRef.current) {
        // Follow the actor carrying this offering (not an older seat of the same person)
        const key = offerKeyRef.current.get(q.username);
        if (!key) continue;
        spotQueueRef.current = spotQueueRef.current.filter((x) => x !== q);
        spotBusyRef.current = true;
        setSpotKey(key);
        onSpotlightStartRef.current?.(q.username);
        setSpotPerson({ id: q.id, name: q.displayName || q.username, avatar: q.avatarUrl || undefined });
        return;
      }
    }, 400);
    return () => clearInterval(t);
  }, []);

  const endSpotlight = () => {
    spotBusyRef.current = false;
    spotNextAtRef.current = Date.now() + 6000; // a short breath before the next one
    setSpotKey(null);
    setSpotPerson(null);
  };

  // Exact background path uploaded by the user
  // The owner's uploaded background, or the built-in hall painting (AI-upscaled from chanh-dien-2.webp)
  const templeBgUrl = config.background || '/assets/bg/chanh-dien-2-hd.webp';
  const closeUpBgUrl = config.background || '/assets/bg/chanh-dien-2-4k.webp';

  return (
    <div
      className={`relative mx-auto bg-[#0a0403] overflow-hidden shadow-2xl flex flex-col justify-between border border-amber-500/40 select-none ${
        config.displayRatio === '9:16'
          ? 'w-full max-w-[430px] aspect-9/16 rounded-2xl'
          : 'w-full h-full rounded-none'
      }`}
    >
      {/* 1. REAL TEMPLE BACKGROUND IMAGE */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <img
          src={templeBgUrl}
          alt="Chánh Điện Kim Phật"
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.8) saturate(0.95)' }}
        />
        {/* 4K copy (the full AI upscale) shown only while the camera is close on a gift giver, so the hall stays sharp */}
        <img
          src={closeUpBgUrl}
          alt=""
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
          style={{ filter: 'brightness(0.8) saturate(0.95)', opacity: spotKey ? 1 : 0 }}
        />
        {/* Slow soft halo behind the Buddha's head */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[20%] w-[38%] aspect-square rounded-full bg-radial from-amber-200/25 via-amber-400/10 to-transparent mix-blend-screen animate-pulse-gold pointer-events-none" />
        {/* Soft subtle gradient at the very top for title legibility */}
        <div className="absolute inset-0 bg-linear-to-b from-black/55 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* 2. DYNAMIC LIGHTING EFFECTS OVER THE BUDDHA (Rotating Halo at Buddha back) */}
      <TempleLightingEffects
        auraIntensity={auraIntensity}
        isGiftActive={isGiftActive}
      />

      {/* 3. TOP THÀNH TÂM (merit board) under the adidaphat hint */}
      <CompactBangCongDuc
        topDonors={leaderboardDonors}
        showBoard={config.showTopBoard !== false}
        keyword={config.keyword || 'adidaphat'}
        title={config.boardTitle || 'TOP THÀNH TÂM'}
      />

      {/* 4. GIFT: golden lotus opens and pink lotus petals fall, bigger and brighter for bigger gifts */}
      <GoldenLotusBloom giftId={currentGift?.id} diamonds={currentGift?.diamonds} />

      {/* Notice scrolling in a thin strip under the like bar (the channel owner's wording) */}
      <div className="absolute top-[23.4%] left-[8%] right-[8%] z-30 overflow-hidden pointer-events-none rounded-full bg-black/35 border border-[#c9973f]/40">
        <div className="w-max whitespace-nowrap py-1 text-[11.5px] text-[#f3d08a] font-temple animate-notice-scroll">
          Xin lưu ý, đây là không gian thư giãn mang tinh thần an nhiên; quà tặng chỉ để nhận lời chúc, không phải tiền cúng dường hay để cầu may.
        </div>
      </div>

      {/* 5. TITLE: lowered so TikTok's top bar doesn't cover it, with the chant under it */}
      <div className="absolute top-[7.5%] inset-x-0 z-30 flex flex-col items-center pointer-events-none">
        <h1
          className="text-2xl sm:text-3xl font-black tracking-widest font-temple uppercase bg-linear-to-b from-[#FFFDF0] via-[#FDE047] to-[#B45309] bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(245,158,11,1)] text-center"
          style={{ letterSpacing: '0.18em' }}
        >
          {config.channelName}
        </h1>
        <div className="mt-0.5 text-[13px] font-semibold text-[#f3d08a] font-temple tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          Nam Mô A Di Đà Phật
        </div>
      </div>

      {/* Likes toward the next flower rain, under the chant */}
      <LikeBar progress={likeProgress} goal={LIKES_PER_RAIN} raining={raining} />
      <FortuneBar progress={fortuneProgress} goal={99} />
      <FlowerRain until={rainUntil} />
      <CraneFlight />

      {/* 7. OFFERING AREA (burner, chủ lễ, 4 mats, top 6) and the side rows of devotees */}
      {/* Floor (carpet, burner, lotus, mats) under the 3D people; names and chat bubbles over them */}
      <div ref={worldRef} className="absolute inset-0 z-20">
        <div className="absolute inset-0 z-[1]">
          <OfferingArea
            offering={currentGift}
            offerers={offerers}
            topDonors={leaderboardDonors}
            layer={has3D ? 'floor' : 'all'}
            burnerLit={has3D ? incenseLit : undefined}
          />
          {!has3D && (
            <DevoteeCrowd devotees={devotees} recentGiftDonor={currentGift?.username || null} recentGiftPrayer={currentGift?.prayerMeaning || null} />
          )}
        </div>
        <div className="absolute inset-0 z-[2]">
          <Temple3D
            specs={specs}
            onReady={setHas3D}
            onIncenseLit={() => {
              setIncenseLit(true);
              setTimeout(() => setIncenseLit(false), 8000);
            }}
            onAway={(key, away) => {
              setAwayKeys((prev) => (away ? [...prev, key] : prev.filter((k) => k !== key)));
              const user = keyUserRef.current.get(key);
              if (!away && user) settleOffers(user);
            }}
            spotlightKey={spotKey}
            zoomTargets={() => [bgRef.current, worldRef.current].filter((el): el is HTMLDivElement => Boolean(el))}
            onSpotlightEnd={endSpotlight}
          />
        </div>
        {has3D && (
          <div className="absolute inset-0 z-[3]">
            <OfferingArea
              offering={currentGift}
              offerers={offerers}
              topDonors={leaderboardDonors}
              layer="labels"
              away={awayKeys.filter((k) => k.startsWith('top-')).map((k) => k.slice(4))}
            />
            <DevoteeCrowd devotees={devotees} recentGiftDonor={currentGift?.username || null} recentGiftPrayer={currentGift?.prayerMeaning || null} labelsOnly />
          </div>
        )}
      </div>

      <SpotlightCard person={spotPerson} />
      <FortuneCard draws={fortuneDraws} />
      <FortuneBox drawId={fortuneDraws[fortuneDraws.length - 1]?.id} />

      {/* 8. GIFT NOTIFICATION BANNER WITH COMBO MULTIPLIER */}
      <GiftNotificationBanner currentGift={currentGift} />

      {/* 9. DISCREET STREAMER SOUND SHORTCUTS (Chuông, Mõ, Nhạc nền) */}
      <div className="absolute bottom-0 inset-x-0 z-150 px-3 pb-3 pt-1 flex items-center justify-between pointer-events-auto">
        {/* Real Buddhist Music status indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-amber-500/40 text-[10px] text-stone-200 backdrop-blur-md">
          <span className={`w-2 h-2 rounded-full ${isBgmPlaying ? 'bg-amber-400 animate-pulse' : 'bg-stone-600'}`} />
          <span className="font-medium truncate max-w-[190px]">
            {isBgmPlaying
              ? config.buddhistMusicTrack === 'chill'
                ? '🍃 Nhạc chill thư giãn'
                : config.buddhistMusicTrack === 'niem_phat'
                ? '📿 Niệm Phật Thích Trí Thoát'
                : config.buddhistMusicTrack === 'khuc_thien_dao'
                ? '🎶 Khúc Thiền Đạo Trầm Bổng'
                : '🎋 Sáo Trúc & Đàn Tranh Dịu Êm'
              : 'Nhạc Phật giáo đang tắt'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleBgm && (
            <button
              onClick={onToggleBgm}
              title={isBgmPlaying ? 'Tắt Nhạc Phật Giáo' : 'Bật Nhạc Niệm Phật Always'}
              className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm shadow-lg hover:scale-110 active:scale-95 transition-all backdrop-blur-md ${
                isBgmPlaying
                  ? 'bg-amber-950/80 border-amber-400/70 text-amber-300'
                  : 'bg-black/70 border-stone-700 text-stone-500'
              }`}
            >
              🎵
            </button>
          )}
          <button
            onClick={onRingBell}
            title="Thỉnh Chuông U Minh"
            className="w-9 h-9 rounded-full bg-black/70 border border-amber-400/50 flex items-center justify-center text-amber-300 text-sm shadow-lg hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
          >
            🔔
          </button>
          <button
            onClick={onPlayGong}
            title="Gõ Mõ Tụng Kinh"
            className="w-9 h-9 rounded-full bg-black/70 border border-amber-600/50 flex items-center justify-center text-amber-300 text-sm shadow-lg hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
          >
            🪵
          </button>
        </div>
      </div>
    </div>
  );
};
