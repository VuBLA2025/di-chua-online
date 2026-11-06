import React, { useEffect, useRef, useState } from 'react';
import { StreamConfig } from '../types/temple';

// Dashboard card: the comment keyword, the top board's title and the background image. All saved on the
// server (settings.json / uploads/) and applied to the live stage straight away.
export const StageSettingsPanel: React.FC<{
  config: StreamConfig;
  onSaveSetting?: (action: 'setKeyword' | 'setBoardTitle', value: string) => void;
  onUploadBackground?: (file: File) => Promise<void>;
  onResetBackground?: () => void;
}> = ({ config, onSaveSetting, onUploadBackground, onResetBackground }) => {
  const keyword = config.keyword || 'adidaphat';
  const title = config.boardTitle || 'TOP THÀNH TÂM';
  const [keywordDraft, setKeywordDraft] = useState(keyword);
  const [titleDraft, setTitleDraft] = useState(title);
  const [status, setStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => setKeywordDraft(keyword), [keyword]);
  useEffect(() => setTitleDraft(title), [title]);

  const flash = (text: string) => {
    setStatus(text);
    setTimeout(() => setStatus(''), 2500);
  };
  const save = (action: 'setKeyword' | 'setBoardTitle', value: string) => {
    if (!value.trim()) return;
    onSaveSetting?.(action, value.trim());
    flash('Đã lưu');
  };
  const upload = async (file?: File) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) return flash('Ảnh quá 15 MB');
    try {
      flash('Đang tải ảnh…');
      await onUploadBackground?.(file);
      flash('Đã đổi ảnh nền');
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Không tải được ảnh');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const input = 'flex-1 min-w-0 bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500';
  const button = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:bg-stone-800 disabled:text-stone-500 transition-colors';

  return (
    <div className="p-3.5 bg-stone-900/70 border border-stone-800 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">🎨 Tùy chỉnh sân khấu</h4>
        {status && <span className="text-[11px] text-emerald-400">{status}</span>}
      </div>

      <label className="block space-y-1">
        <span className="text-[11px] text-stone-400">Từ khóa người xem gõ để lên thắp hương (không phân biệt dấu, hoa thường)</span>
        <div className="flex gap-2">
          <input
            className={input}
            value={keywordDraft}
            maxLength={30}
            onChange={(e) => setKeywordDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save('setKeyword', keywordDraft)}
            placeholder="adidaphat"
          />
          <button className={button} disabled={!keywordDraft.trim() || keywordDraft.trim() === keyword} onClick={() => save('setKeyword', keywordDraft)}>
            Lưu
          </button>
        </div>
      </label>

      <label className="block space-y-1">
        <span className="text-[11px] text-stone-400">Tên bảng xếp hạng</span>
        <div className="flex gap-2">
          <input
            className={input}
            value={titleDraft}
            maxLength={24}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save('setBoardTitle', titleDraft)}
            placeholder="TOP THÀNH TÂM"
          />
          <button className={button} disabled={!titleDraft.trim() || titleDraft.trim() === title} onClick={() => save('setBoardTitle', titleDraft)}>
            Lưu
          </button>
        </div>
      </label>

      <div className="space-y-1">
        <span className="text-[11px] text-stone-400">Ảnh nền (JPG, PNG, WebP, tối đa 15 MB, nên dùng ảnh dọc 9:16)</span>
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          <button className={button} onClick={() => fileRef.current?.click()}>
            Chọn ảnh nền…
          </button>
          <button
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 disabled:text-stone-500"
            disabled={!config.background}
            onClick={() => {
              onResetBackground?.();
              flash('Đã về ảnh mặc định');
            }}
          >
            Dùng ảnh mặc định
          </button>
          <span className="text-[11px] text-stone-500">{config.background ? 'Đang dùng ảnh của bạn' : 'Đang dùng ảnh mặc định'}</span>
        </div>
      </div>
    </div>
  );
};
