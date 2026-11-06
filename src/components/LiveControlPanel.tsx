import React, { useState } from 'react';

import { panelHeaders } from '../services/panelKey';

// Sends commands to the live stage page (the Link source in TikTok LIVE Studio), which plays the sound
export const LiveControlPanel: React.FC = () => {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  const send = async (action: string, body: Record<string, string> = {}) => {
    try {
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...panelHeaders() },
        body: JSON.stringify({ action, ...body }),
      });
      const result = await res.json();
      setStatus(result.success ? 'Đã gửi tới màn hình live ✓' : result.error || 'Gửi lệnh thất bại');
      return result.success as boolean;
    } catch {
      setStatus('Không gửi được lệnh. Kiểm tra cửa sổ đen (server) còn mở không.');
      return false;
    }
  };

  const buttonClass =
    'px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 active:scale-[0.97] transition text-xs font-bold text-amber-200 border border-amber-600/30';

  return (
    <div className="p-4 rounded-xl bg-stone-900/80 border border-amber-500/40 space-y-3">
      <div>
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">🎛 Điều khiển màn hình live</h4>
        <p className="text-[11px] text-stone-400 mt-0.5">
          Lệnh chạy trên màn hình trong TikTok LIVE Studio, nên vẫn có tác dụng khi tab này đã tắt tiếng.
        </p>
      </div>

      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Nhập câu muốn đọc ngay, ví dụ: Cảm ơn cả nhà đã ghé xem live tối nay ạ."
          className="flex-1 rounded-lg bg-stone-950 border border-stone-700 px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={async () => {
            if (await send('speak', { text })) setText('');
          }}
          disabled={!text.trim()}
          className="px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 text-xs font-bold"
        >
          🔊 Đọc ngay
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => send('shareReminder')} className={buttonClass}>
          📣 Nhắc chia sẻ ngay
        </button>
        <button onClick={() => send('bell')} className={buttonClass}>
          🔔 Thỉnh chuông
        </button>
      </div>

      {status && <p className="text-[11px] text-emerald-300">{status}</p>}
    </div>
  );
};
