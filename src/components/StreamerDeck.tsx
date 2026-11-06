import React, { useEffect, useState } from 'react';
import {
  StreamConfig,
  GiftCategory,
  LeaderboardEntry,
  Devotee,
  CommentEvent,
} from '../types/temple';
import { soundEngine } from '../services/soundEngine';
import { getPanelKey, setPanelKey, panelHeaders } from '../services/panelKey';
import { LiveControlPanel } from './LiveControlPanel';
import { StageSettingsPanel } from './StageSettingsPanel';

// Link cho nguồn "Link" trong TikTok LIVE Studio / OBS: lấy theo host đang mở
// (trên live là https://dichua.bla.io.vn/?view=stage), không hardcode lvh.me nữa.
const obsStageUrl = () =>
  `${window.location.protocol}//${window.location.host}/?view=stage`;

interface StreamerDeckProps {
  config: StreamConfig;
  onUpdateConfig: (newConfig: Partial<StreamConfig>) => void;
  tikTokStatus?: import('../types/temple').TikTokLiveStatus;
  onConnectTikTok?: (username: string) => void;
  onDisconnectTikTok?: () => void;
  onSaveChannelName?: (name: string) => void;
  onToggleTopBoard?: (show: boolean) => void;
  onSaveSetting?: (action: 'setKeyword' | 'setBoardTitle', value: string) => void;
  onUploadBackground?: (file: File) => Promise<void>;
  onResetBackground?: () => void;
}

export const StreamerDeck: React.FC<StreamerDeckProps> = ({
  config,
  onUpdateConfig,
  tikTokStatus,
  onConnectTikTok,
  onDisconnectTikTok,
  onSaveChannelName,
  onToggleTopBoard,
  onSaveSetting,
  onUploadBackground,
  onResetBackground,
}) => {
  const [activeTab, setActiveTab] = useState<'tiktok_obs' | 'audio'>('tiktok_obs');
  const [tiktokUsernameInput, setTiktokUsernameInput] = useState(tikTokStatus?.username || '');
  const [copiedUrl, setCopiedUrl] = useState(false);
  // Mật khẩu panel (Dokploy PANEL_KEY): lưu sessionStorage, đóng tab là mất;
  // gửi kèm mọi lệnh ghi (kết nối TikTok, đọc ngay, đổi tốc độ giọng, ảnh nền).
  const [panelKey, setPanelKeyState] = useState(() => getPanelKey());
  // Channel name read by the voice and shown as the title; saved on the server so the live page and restarts keep it
  const [nameDraft, setNameDraft] = useState(config.channelName);
  const [nameSaved, setNameSaved] = useState(false);
  useEffect(() => setNameDraft(config.channelName), [config.channelName]);
  const saveName = () => {
    const name = nameDraft.trim();
    if (!name) return;
    onSaveChannelName?.(name);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#120806] border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
      {/* DECK HEADER / CONNECTION SETTINGS */}
      <div className="p-3.5 border-b border-stone-800 bg-stone-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
            ⚙
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Bảng Điều Khiển Live: {config.channelName}
            </h3>
            <span className="text-[11px] text-stone-400">
              Giọng đọc · Nhạc nền · Kết nối TikTok LIVE
            </span>
          </div>
        </div>

        {/* Channel name (title + what the voice says) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1">
            <span className="text-xs text-amber-400 font-bold mr-1.5">Tên kênh:</span>
            <input
              type="text"
              value={nameDraft}
              maxLength={40}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              placeholder="Tâm Tịnh Tâm An"
              className="bg-transparent text-xs text-white focus:outline-none w-36 font-medium"
            />
          </div>
          <button
            onClick={saveName}
            disabled={!nameDraft.trim() || nameDraft.trim() === config.channelName}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:bg-stone-800 disabled:text-stone-400 transition-colors"
          >
            {nameSaved ? 'Đã lưu' : 'Lưu'}
          </button>
          {/* Show or hide the TOP THÀNH TÂM board on the live stage */}
          <button
            role="switch"
            aria-checked={config.showTopBoard !== false}
            onClick={() => onToggleTopBoard?.(config.showTopBoard === false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              config.showTopBoard !== false ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${config.showTopBoard !== false ? 'bg-white' : 'bg-stone-500'}`} />
            Bảng TOP: {config.showTopBoard !== false ? 'Bật' : 'Tắt'}
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-stone-800 bg-stone-950/40 px-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tiktok_obs')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tiktok_obs'
              ? 'border-amber-400 text-amber-300 bg-amber-950/30'
              : 'border-transparent text-stone-300 hover:text-white'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {tikTokStatus?.isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-500"></span>
            )}
          </span>
          <span>📡</span> TikTok LIVE & OBS (Trực Tiếp)
        </button>


        <button
          onClick={() => setActiveTab('audio')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audio'
              ? 'border-amber-400 text-amber-300 bg-amber-950/20'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <span>🎙</span> Nhạc Phật Giáo & Giọng Đọc
        </button>



      </div>

      {/* TAB CONTENT PANELS */}
      <div className="p-4 flex-1 overflow-y-auto">
        {/* TAB 0: TIKTOK LIVE & OBS INTEGRATION */}
        {activeTab === 'tiktok_obs' && (
          <div className="space-y-4">
            <LiveControlPanel />

            <StageSettingsPanel config={config} onSaveSetting={onSaveSetting} onUploadBackground={onUploadBackground} onResetBackground={onResetBackground} />

            {/* 1. REAL TIKTOK LIVE CONNECTOR BOX */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-stone-900/90 to-stone-950 border border-amber-500/30 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔴</span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                      Kết Nối Phòng Live TikTok Thật (Webcast Real-time)
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Bắt comment, quà tặng và người xem trực tiếp từ TikTok
                    </p>
                  </div>
                </div>

                {/* Connection Status Badge */}
                <div className="flex items-center gap-2">
                  {tikTokStatus?.isConnected ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Đang Live: @{tikTokStatus.username}
                    </span>
                  ) : tikTokStatus?.isConnecting ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin" />
                      Đang kết nối...
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-800 text-stone-400 border border-stone-700">
                      ⚪ Chưa kết nối
                    </span>
                  )}
                </div>
              </div>

              {/* Mật khẩu panel + Input Username & Action */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <div className="flex items-center bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 focus-within:border-amber-400 transition-colors sm:max-w-[220px]">
                  <span className="text-sm mr-1.5">🔑</span>
                  <input
                    type="password"
                    value={panelKey}
                    onChange={(e) => {
                      setPanelKeyState(e.target.value);
                      setPanelKey(e.target.value);
                    }}
                    placeholder="Mật khẩu panel"
                    autoComplete="off"
                    className="bg-transparent text-xs text-white placeholder-stone-500 focus:outline-none w-full font-medium"
                  />
                </div>
                <div className="flex-1 flex items-center bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 focus-within:border-amber-400 transition-colors">
                  <span className="text-sm font-bold text-amber-400 mr-1.5">@</span>
                  <input
                    type="text"
                    value={tiktokUsernameInput}
                    onChange={(e) => setTiktokUsernameInput(e.target.value.replace(/^@/, ''))}
                    placeholder="Nhập username TikTok của bạn (không cần @)"
                    className="bg-transparent text-xs text-white placeholder-stone-500 focus:outline-none w-full font-medium"
                  />
                </div>

                {tikTokStatus?.isConnected ? (
                  <button
                    onClick={() => onDisconnectTikTok?.()}
                    className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>⏹</span> Ngắt Kết Nối
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (tiktokUsernameInput.trim() && onConnectTikTok) {
                        onConnectTikTok(tiktokUsernameInput.trim());
                      }
                    }}
                    disabled={tikTokStatus?.isConnecting || !tiktokUsernameInput.trim()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-stone-950 rounded-lg text-xs font-black transition-all whitespace-nowrap shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>🔴</span> Bắt Đầu Kết Nối Live Thật
                  </button>
                )}
              </div>

              {/* Live Room Stats when connected */}
              {tikTokStatus?.isConnected && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="p-2 rounded-lg bg-stone-950/70 border border-stone-800 text-center">
                    <span className="text-[10px] text-stone-400 block">Người Xem (Viewers)</span>
                    <span className="text-sm font-black text-amber-300">
                      👥 {tikTokStatus.viewerCount ?? 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/70 border border-stone-800 text-center">
                    <span className="text-[10px] text-stone-400 block">Lượt Thích (Likes)</span>
                    <span className="text-sm font-black text-rose-400">
                      ❤️ {tikTokStatus.totalLikes ?? 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/70 border border-stone-800 text-center">
                    <span className="text-[10px] text-stone-400 block">Mã Phòng Live</span>
                    <span className="text-[11px] font-mono font-bold text-stone-300 truncate block">
                      {tikTokStatus.roomId ? `#${tikTokStatus.roomId.slice(-6)}` : 'Đang đồng bộ'}
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message if any */}
              {tikTokStatus?.error && (
                <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-[11px] text-red-200 flex items-start gap-2">
                  <span className="text-base shrink-0">⚠️</span>
                  <div>
                    <strong className="font-bold">Lưu ý kết nối: </strong>
                    {tikTokStatus.error}
                    <div className="mt-1 text-[10px] text-stone-400">
                      💡 Mẹo: Hãy mở app TikTok trên điện thoại hoặc TikTok LIVE Studio trên PC, bấm <strong>Phát trực tiếp (Go LIVE)</strong> trước, sau đó bấm Kết Nối lại tại đây!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. OBS & TIKTOK LIVE STUDIO BROWSER SOURCE URL */}
            <div className="p-4 rounded-xl bg-stone-900/70 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎥</span>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Link Màn Hình OBS Studio & TikTok LIVE Studio (Tỷ Lệ 9:16 Dọc)
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Chuẩn 1080 x 1920
                </span>
              </div>

              {/* URL Display with Copy Button */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-amber-200 select-all overflow-x-auto whitespace-nowrap">
                  {obsStageUrl()}
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(obsStageUrl());
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 3000);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                    copiedUrl
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <span>{copiedUrl ? '✓' : '📋'}</span>
                  <span>{copiedUrl ? 'Đã Sao Chép!' : 'Sao Chép Link OBS'}</span>
                </button>
                <a
                  href="/?view=stage"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded-lg text-xs font-medium transition-all text-center flex items-center justify-center gap-1"
                >
                  <span>👁️</span> Mở Tab Tràn Viền
                </a>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* Method 1: TikTok LIVE Studio */}
                <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <span>📱</span> Cách 1: Dùng TikTok LIVE Studio (Khuyên Dùng)
                  </div>
                  <ol className="text-[11px] text-stone-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Mở phần mềm <strong>TikTok LIVE Studio</strong> trên máy tính.</li>
                    <li>Trong mục Nguồn (Sources), bấm <strong>Thêm Nguồn (Add Source)</strong> &rarr; Chọn <strong>Trình duyệt (Browser)</strong>.</li>
                    <li>Dán link OBS ở trên vào ô <strong>URL</strong>.</li>
                    <li>Đặt kích thước: Rộng <strong>1080</strong>, Cao <strong>1920</strong> (Tỷ lệ 9:16 dọc).</li>
                    <li>Tích chọn <strong>Điều khiển âm thanh</strong> (Control audio via OBS/Studio) để phát tiếng chuông mõ & kinh Niệm Phật qua Live!</li>
                  </ol>
                </div>

                {/* Method 2: OBS Studio */}
                <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <span>🎬</span> Cách 2: Dùng OBS Studio
                  </div>
                  <ol className="text-[11px] text-stone-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Mở <strong>OBS Studio</strong> &rarr; Tại khung <strong>Sources (+)</strong> &rarr; Chọn <strong>Browser</strong>.</li>
                    <li>Dán URL ở trên vào &rarr; Đặt Width: <strong>1080</strong>, Height: <strong>1920</strong>, FPS: <strong>60</strong>.</li>
                    <li>Đánh dấu tích vào ô <strong>Control audio via OBS</strong>.</li>
                    <li>Bấm <strong>Start Virtual Camera (Khởi động Camera ảo)</strong> nếu bạn dùng TikTok trên điện thoại, hoặc nhập <strong>Stream Key</strong> TikTok vào Settings &rarr; Stream!</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* 3. EXPLANATION: CÁCH HOẠT ĐỘNG VỚI USER & QUÀ THẬT */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>💡</span> Cơ Chế Hoạt Động Khi User Thật Vào Tương Tác
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px] text-stone-300">
                <div className="p-2.5 rounded-lg bg-stone-950/60 border border-stone-800 space-y-1">
                  <div className="font-bold text-amber-200 flex items-center gap-1">
                    <span>💬</span> Bình luận thật trên TikTok:
                  </div>
                  <p className="leading-relaxed text-stone-300">
                    Khi người xem gõ <strong className="text-white">"adidaphat"</strong> hoặc <strong className="text-white">"a di đà phật"</strong> trên ứng dụng TikTok, hình ảnh phật tử quỳ lạy sẽ xuất hiện ngay lập tức trên Chánh điện cùng lời cầu nguyện trên đầu! Chuông mõ sẽ ngân vang và giọng nữ Phật giáo chào mừng!
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-950/60 border border-stone-800 space-y-1">
                  <div className="font-bold text-amber-200 flex items-center gap-1">
                    <span>🎁</span> Tặng quà thật trên TikTok:
                  </div>
                  <p className="leading-relaxed text-stone-300">
                    Khán giả tặng Hoa hồng, Hoa sen, Tim, Tiền xu... sân khấu bật hiệu ứng sen vàng và cánh sen rơi, máy quay áp sát người tặng, cộng điểm vào <strong>TOP THÀNH TÂM</strong>, và giọng đọc gọi tên cảm ơn kèm lời chúc (combo chỉ đọc 1 lần).
                  </p>
                </div>
              </div>

              <div className="p-2 rounded bg-amber-900/30 border border-amber-600/30 text-[10px] text-amber-200 flex items-center gap-2">
                <span>🔔</span>
                <span>
                  <strong>Quy tắc tôn kính:</strong> Khi streamer bật tab <strong>"Thuyết Giảng Phật Pháp"</strong>, hệ thống sẽ tự động tắt đọc quà của phật tử để bài pháp thoại không bị phân tâm.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VIETNAMESE BUDDHIST FEMALE VOICE & SOUND MIXER */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-stone-900/70 border border-stone-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                    <span>🎙</span> Giọng Nữ Phật Giáo (Dịu Dàng, Từ Bi)
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Tự động chào người mới vào, cảm ơn người tặng quà và gửi lời chúc
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoTts}
                    onChange={(e) => onUpdateConfig({ autoTts: e.target.checked })}
                    className="rounded border-stone-700 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-xs font-semibold text-white">Tự Động Đọc</span>
                </label>
              </div>

              {/* Voice Gender Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-300 font-medium">Lựa Chọn Giọng:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateConfig({ voiceGender: 'female', ttsPitch: 1.08 })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      config.voiceGender === 'female'
                        ? 'bg-amber-400 text-stone-950 shadow-md'
                        : 'bg-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    👩 Giọng Nữ Phật Giáo (Khuyên dùng)
                  </button>

                  <button
                    onClick={() => onUpdateConfig({ voiceGender: 'male', ttsPitch: 0.88 })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      config.voiceGender === 'male'
                        ? 'bg-amber-400 text-stone-950 shadow-md'
                        : 'bg-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    👨 Giọng Nam Thầy Trầm Ấm
                  </button>
                </div>
              </div>

              {/* Sliders for Speech Rate and Pitch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-400">Tốc Độ Đọc (Rate):</span>
                    <span className="font-bold text-amber-300">{config.ttsSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.15"
                    step="0.05"
                    value={config.ttsSpeed}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value);
                      onUpdateConfig({ ttsSpeed: rate });
                      // Also apply on the live stage page in TikTok LIVE Studio
                      fetch('/api/control', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...panelHeaders() },
                        body: JSON.stringify({ action: 'setRate', text: String(rate) }),
                      }).catch(() => {});
                    }}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-400">Cao Độ Giọng (Pitch):</span>
                    <span className="font-bold text-amber-300">{config.ttsPitch}</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.25"
                    step="0.05"
                    value={config.ttsPitch}
                    onChange={(e) => onUpdateConfig({ ttsPitch: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              {/* Anti-spam notification note */}
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-600/30 text-[11px] text-amber-200 flex items-center gap-2">
                <span className="text-base">🔔</span>
                <span>
                  <strong>Quy chuẩn Live:</strong> Mọi quà đều được cảm ơn kèm câu chúc (combo chỉ đọc 1 lần, mỗi người tối đa 1 lần/30 giây, lúc đông thì bỏ qua quà nhỏ). Ngoài ra đọc khi có người follow, chào khách, chúc mong cầu và nhắc chia sẻ.
                </span>
              </div>

              {/* Sample Voice Test Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() =>
                    soundEngine.readGiftAcknowledgment(
                      'Minh An',
                      'Hoa sen',
                      1
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <span>🪷</span> Thử câu cảm ơn quà
                </button>

                <button
                  onClick={() =>
                    soundEngine.readFollowThanks('Minh An')
                  }
                  className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold border border-amber-600/30"
                >
                  <span>☸</span> Thử Cảm Ơn Follow
                </button>

                <button
                  onClick={() => soundEngine.readShareReminder([])}
                  className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold border border-amber-600/30"
                >
                  <span>📣</span> Thử Nhắc Chia Sẻ
                </button>
              </div>
            </div>

            {/* NHẠC PHẬT GIÁO THẬT PHÁT LIÊN TỤC ALWAYS */}
            <div className="p-3.5 bg-stone-900/70 border border-stone-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                    <span>🎵</span> Nhạc Phật Giáo Chánh Điện (Phát Liên Tục Always)
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Nhạc niệm Phật và sáo trúc thiền môn thanh tịnh (Đã loại bỏ hoàn toàn sóng âm gây đau đầu)
                  </p>
                </div>

                <button
                  onClick={() => onUpdateConfig({ bgmEnabled: !config.bgmEnabled })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    config.bgmEnabled
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${config.bgmEnabled ? 'bg-white animate-pulse' : 'bg-stone-500'}`} />
                  {config.bgmEnabled ? 'Đang Phát Nhạc Phật' : 'Đã Tắt Nhạc'}
                </button>
              </div>

              {/* Real Buddhist Track Selector */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs text-stone-300 font-medium">Lựa Chọn Bài Nhạc Phật Giáo:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onUpdateConfig({ buddhistMusicTrack: 'chill' });
                      soundEngine.switchBgmTrack('chill');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition flex items-center gap-2.5 ${
                      config.buddhistMusicTrack === 'chill'
                        ? 'bg-amber-950/40 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span className="text-lg">🍃</span>
                    <div>
                      <div className="text-xs font-bold">Chill Thư Giãn</div>
                      <div className="text-[10px] text-amber-400/90">Piano, sáo nhẹ, không lời</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateConfig({ buddhistMusicTrack: 'sao_truc' });
                      soundEngine.switchBgmTrack('sao_truc');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition flex items-center gap-2.5 ${
                      config.buddhistMusicTrack === 'sao_truc'
                        ? 'bg-amber-950/40 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span className="text-lg">🎋</span>
                    <div>
                      <div className="text-xs font-bold">Sáo Trúc & Đàn Tranh</div>
                      <div className="text-[10px] text-amber-400/90">Dịu nhẹ, trong trẻo, năng lượng tích cực</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateConfig({ buddhistMusicTrack: 'niem_phat' });
                      soundEngine.switchBgmTrack('niem_phat');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition flex items-center gap-2.5 ${
                      config.buddhistMusicTrack === 'niem_phat'
                        ? 'bg-amber-950/40 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span className="text-lg">🪷</span>
                    <div>
                      <div className="text-xs font-bold">Niệm Phật 6 Chữ</div>
                      <div className="text-[10px] text-stone-400">Bản thu niệm Phật có sẵn</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateConfig({ buddhistMusicTrack: 'khuc_thien_dao' });
                      soundEngine.switchBgmTrack('khuc_thien_dao');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition flex items-center gap-2.5 ${
                      config.buddhistMusicTrack === 'khuc_thien_dao'
                        ? 'bg-amber-950/40 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span className="text-lg">🎶</span>
                    <div>
                      <div className="text-xs font-bold">Khúc Thiền Đạo</div>
                      <div className="text-[10px] text-stone-400">Guzheng & Tiêu thanh tịnh</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-400">Âm Lượng Nhạc Nền:</span>
                  <span className="font-bold text-amber-300">{Math.round(config.bgmVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.bgmVolume}
                  onChange={(e) => onUpdateConfig({ bgmVolume: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Sacred Temple Sounds */}
            <div className="p-3.5 bg-stone-900/70 border border-stone-800 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Âm Thanh Nhạc Cụ Thiền
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => soundEngine.playTempleBell(1.0)}
                  className="p-3 bg-stone-950 rounded-lg border border-stone-800 hover:border-amber-500/50 text-left transition flex items-center gap-2"
                >
                  <span className="text-xl">🔔</span>
                  <div>
                    <div className="text-xs font-bold text-white">Chuông U Minh (8 Giây)</div>
                    <div className="text-[10px] text-stone-400">Ngân sâu trầm ấm</div>
                  </div>
                </button>

                <button
                  onClick={() => soundEngine.playMuoGong(1.4)}
                  className="p-3 bg-stone-950 rounded-lg border border-stone-800 hover:border-amber-500/50 text-left transition flex items-center gap-2"
                >
                  <span className="text-xl">🪵</span>
                  <div>
                    <div className="text-xs font-bold text-amber-300">Mõ Gia Trì (Cốc Cốc)</div>
                    <div className="text-[10px] text-stone-400">Âm vang thùng gỗ rỗng</div>
                  </div>
                </button>

                <button
                  onClick={() => soundEngine.playLotusBloom(1.2)}
                  className="p-3 bg-stone-950 rounded-lg border border-stone-800 hover:border-amber-500/50 text-left transition flex items-center gap-2"
                >
                  <span className="text-xl">🪷</span>
                  <div>
                    <div className="text-xs font-bold text-amber-300">Chuông Sen Nở (Khánh Đồng)</div>
                    <div className="text-[10px] text-stone-400">Thanh thoát, ngân vang</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
