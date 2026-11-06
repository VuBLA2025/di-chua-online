/**
 * Types for Đi Chùa Online, an interactive relaxation stage for TikTok LIVE
 * Updated to match the "TÂM TỊNH TÂM AN" aesthetic and Vietnamese Buddhist Female Voice.
 */

export type MusicTrack = 'chill' | 'niem_phat' | 'sao_truc' | 'khuc_thien_dao';

export type GiftCategory = 'dang_huong' | 'le_phat' | 'dang_hoa_sen' | 'qua_dao' | 'ban_tim';

export interface Devotee {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  joinedAt: number;
  robeColor: string; // colorful traditional áo lam/áo dài
  activeComment?: string;
  commentTimestamp?: number;
  isVip?: boolean;
  totalDiamonds?: number;
  bowOffset: number;
  seat?: number; // seat index 0..SEAT_COUNT-1 (services/seating.ts), kept while they stay
  lastActive?: number; // last join/comment/gift time; the longest-idle person gives up their seat when the hall is full
}

export interface GiftEvent {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  giftType: GiftCategory;
  giftName: string;
  prayerMeaning: string; // e.g. "Cầu Bình An", "Cầu Sức Khỏe", "Cầu Gia Đình", "Cầu Có Người Yêu"
  comboCount: number;
  diamonds: number;
  timestamp: number;
  readStatus?: boolean;
}

export interface LeaderboardEntry {
  username: string;
  displayName: string;
  avatarUrl?: string;
  diamonds: number;
  score?: number;
  giftType?: string;
  rank: number;
}

export interface StreamConfig {
  channelName: string;
  showTopBoard?: boolean; // TOP THÀNH TÂM board on the stage (dashboard switch, saved on the server)
  keyword?: string; // comment word that sends a viewer up to offer incense (default "adidaphat")
  boardTitle?: string; // title of the top board (default "TOP THÀNH TÂM")
  background?: string; // uploaded background image URL; empty = the built-in hall painting
  liveTitle: string; // "TÂM TỊNH TÂM AN"
  subTitle: string; // 'Gõ "adidaphat" để vào lễ Phật'
  isConnected: boolean;
  autoTts: boolean;
  voiceGender: 'female' | 'male'; // Giọng Nữ Phật Giáo (Default) vs Giọng Nam
  ttsSpeed: number;
  ttsPitch: number;
  bellSoundEnabled: boolean;
  gongSoundEnabled: boolean;
  chantAmbientEnabled: boolean;
  bgmEnabled: boolean;
  bgmVolume: number;
  buddhistMusicTrack: MusicTrack;
  isDharmaLectureActive: boolean;
  activeDharmaId?: string;
  activeDharmaParagraph?: number;
  displayRatio: '9:16' | 'fill';
  viewMode: 'dual' | 'stage_only' | 'control_only';
}

export interface CommentEvent {
  id: string;
  username: string;
  displayName: string;
  comment: string;
  timestamp: number;
  category?: 'peace' | 'wealth' | 'family' | 'health' | 'love' | 'general';
}

export interface AiTrendReport {
  sentimentSummary: string;
  prayerBreakdown: {
    peace: number;
    wealth: number;
    health: number;
    family: number;
    love: number;
  };
  predictedNextGift: string;
  suggestedBlessing: string;
  monkChantSuggestion: string;
  timestamp: number;
}

export interface TikTokLiveStatus {
  isConnected: boolean;
  isConnecting: boolean;
  username: string;
  roomId?: string;
  viewerCount?: number;
  totalLikes?: number;
  error?: string;
}

// Someone who should walk up and offer incense: sent by a gift or an "adidaphat" comment
export interface OfferRequest {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}
