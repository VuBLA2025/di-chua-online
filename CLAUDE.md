# Đi Chùa Online: notes for Claude

The owner streams this on TikTok through TikTok LIVE Studio (Link source `http://lvh.me:3000/?view=stage`, 1080×1920). Reply in Vietnamese, short. Run any user-facing Vietnamese text (captions, pinned comments, voice lines) through the `humanizer` skill.

## Never break the live

- Only `?view=stage` pages make sound. Never open `?view=stage` in your own browser pane while the owner may be live: it doubles the voice. To check visuals, use the dashboard `http://localhost:3000/` (silent), or render a component into it.
- The live server must be the owner's `BAT-LIVE.bat` (sets `LIVE_MODE=1`, Vite HMR off). A server started from a Claude preview pane gets stopped when the pane closes and froze a live once.
- In dev mode (`npm run dev` without `LIVE_MODE`) every saved edit hot-reloads the stage page and resets the hall, points and like bar. Ask before editing while the owner is live.
- Changes to `server.ts` need a server restart; ask first.

## How it works

- `server.ts`: Express + Vite middleware, `tiktok-live-connector` 2.5 (proto v3: chat text is `content`, gifts `gift.name/diamondCount/type`, avatar `user.avatarThumb.urlList[0]`, `enableExtendedGiftInfo: false`), SSE `/api/tiktok/events`, dashboard commands `/api/control` → SSE `control` (only stage pages act, except `setName` which every page applies), Edge TTS `/api/tts`. The channel name is saved to `settings.json` (gitignored) and replayed to every page on connect.
- `src/App.tsx`: event handling, seating (`services/seating.ts`), merit board (1 point per comment, 10 per gift coin), like bar (666 likes = 60 s flower rain, counted from the room's total), greetings (batched every 6 s, 3 names per sentence, none dropped), gift thanks go to the front of the voice queue.
- `src/services/soundEngine.ts`: voice queue (`priorityQueue` for gifts and "Đọc ngay"), `OFFERING_BLESSINGS` = the owner's 20 blessings (keep their wording), `setChannelName` (every spoken self-reference uses the saved channel name, never a hard-coded one).
- `src/components/ChanhDienStage.tsx`: the stage; incense offering queue (5 at once, once a minute per person).
- `src/three/`: 3D devotees. `nguoi.fbx` (own rig) gets Mixamo clips retargeted (`retarget.ts`); bows are procedural; idle kneelers animate every third frame for speed.
- `src/components/DevoteeCrowd.tsx`: seats (`SEATS`, seeded jittered crowd on both sides of a narrow walkway).
- Settings saved by the server in `settings.json` (+ `uploads/` for a custom background), replayed to every page: channel name, TOP board on/off, comment keyword, board title, background (`/api/control` setName/setTopBoard/setKeyword/setBoardTitle, `/api/background`).
- Gieo quẻ: every 99 hearts from the whole room draws one of 36 kind quẻ (`src/data/fortunes.ts`, no bad omens, no money or future claims); `FortuneCard`, `FortuneBox` (shakes). Top 6 kneel on cushions (`OfferingArea` `TOP_SEATS`); offerers stand in two staggered rows.
- `?demo=1` exposes `window.__dco` (gift/comment/like) for testing; `&fill=1` builds a sample scene for screenshots.

## Owner decisions to keep

- Font `Lora` (`font-temple`). Background `public/assets/bg/chanh-dien-2-hd.webp` (Real-ESRGAN x4 upscale of `chanh-dien-2.webp`).
- No voice for "adidaphat" offerers; only gift givers are named ("Tâm Tịnh Tâm An cảm ơn bạn X đã gửi quà tặng." + a family blessing). Never tie gifts to offerings, merit or luck, and never call it "chùa" or "cúng dường": it is a relaxation space for entertainment (legal reasons, owner decision 2026-11-01). 
- Join greeting: "A Di Đà Phật, Tâm Tịnh Tâm An xin chào bạn X vừa ghé vào."
- Removed on purpose (2026-11-01): gift/wish simulator tab, dharma lectures, Gemini "AI dự báo" tab, report tab. Don't bring them back unasked.
