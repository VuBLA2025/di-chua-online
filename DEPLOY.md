# Đi Chùa Online trên dichua.bla.io.vn

Game live TikTok **Đi Chùa Online**: chánh điện 3D tương tác. Người xem gõ
`adidaphat` (hoặc từ khóa tự đặt) thì nhân vật mang tên + avatar TikTok của họ
đi lên thắp hương, lạy 3 lạy rồi về chỗ. Ai tặng quà thì máy quay áp sát theo
người đó, sen vàng nở, cánh sen rơi, giọng đọc gọi tên cảm ơn kèm lời chúc.

## Nguồn

- Upstream: https://github.com/workaipvlinh-byte/di-chua-online — nhánh `main`,
  commit `0f52515c2737a9a9ca4f1f9517bd0454e30e33ae` (MIT, code; tài nguyên
  `public/assets/` KHÔNG nằm trong giấy phép MIT — xem bảng quyền trong
  README upstream: FBX Mixamo, ảnh nền + ảnh phật tử do chủ dự án cung cấp,
  nhạc nền AI ACE-Step / chưa rõ nguồn, bản niệm Phật của người khác).
- Repo deploy (đã tạo sẵn, trống): `VuBLA2025/di-chua-online`, nhánh `master`
  — code ở đây CHƯA push, chờ parent push rồi tạo Dokploy project/compose.
- Stack: TypeScript + React 19 + Vite 8 + Tailwind 4, Express,
  `tiktok-live-connector` 2.5.0, giọng đọc Edge TTS tiếng Việt
  (vi-VN-NamMinhNeural, nam, trầm −4%), Three.js chánh điện 3D.

## Những chỗ đã sửa so với upstream (để chạy được trên Dokploy)

Theo đúng pattern Lớp Học Chữ (`~/workspace/lop-hoc-chu-deploy/DEPLOY.md`).
Upstream này khác Lớp Học: không có host allowlist, không có mật khẩu panel,
không có `/api/test/emit`, panel và stage là một app duy nhất (stage là
`/?view=stage` hoặc `?obs=true`).

1. **Host allowlist** (`server.ts`): upstream không kiểm tra Host gì cả, chỉ
   bind `127.0.0.1`. Nay thêm `LOCAL_HOSTS` =
   `localhost` / `127.0.0.1` / `lvh.me` / `dichua.bla.io.vn`, Host hoặc Origin
   lạ → 403 (chặn DNS rebinding).
2. **Mật khẩu panel** (`server.ts` + `src/services/panelKey.ts` mới +
   `src/App.tsx` + `src/components/LiveControlPanel.tsx` +
   `src/components/StreamerDeck.tsx`):
   upstream không có mật khẩu — ai mở được site cũng gọi được các endpoint ghi.
   Nay các endpoint `POST /api/control`, `/api/test/emit` (mới, xem 3),
   `/api/tiktok/connect`, `/api/tiktok/disconnect`, `/api/background`,
   `/api/background/reset` yêu cầu đúng `PANEL_KEY` trong env (nhận qua header
   `Authorization: Bearer <key>` hoặc `x-panel-key`), sai/thiếu thì 403
   `{"success":false,"error":"Sai mật khẩu panel"}`. Khi `PANEL_KEY` không đặt
   (chạy local) thì cho qua. Dashboard có thêm ô **Mật khẩu panel** (cạnh ô
   username TikTok, lưu `sessionStorage`, đóng tab là mất) và gửi kèm mỗi lệnh;
   lỗi sai mật khẩu hiện đúng chữ "Sai mật khẩu panel" ở khung kết nối
   (vì `handleConnectTikTok` đã hiện `result.error`). Các endpoint đọc
   (`/api/tiktok/status`, `/api/tiktok/events`, `/api/tts`, `/`, `/assets`,
   `/uploads`) vẫn mở vì trang stage (OBS/LIVE Studio, không có mật khẩu)
   cần gọi.
3. **`/api/test/emit` mới** (`server.ts`): upstream KHÔNG có endpoint giả lập
   này. Thêm theo đúng mẫu Lớp Học Chữ (nhận `chat` / `gift` / `member` /
   `follow` / `share` / `like`, cộng dồn `totalLikes` khi giả lập like),
   đã nằm trong `PANEL_WRITE_PATHS` nên cần đúng `PANEL_KEY`.
4. **Bind `0.0.0.0`** (`server.ts` `startServer()`): upstream chỉ nghe
   `127.0.0.1`, Traefik trên Dokploy gọi tới IP container sẽ bị từ chối.
   Nay nghe `0.0.0.0`; bảo vệ dựa vào host allowlist + gate `PANEL_KEY`,
   không dựa vào bind nữa. Cổng mặc định đổi `3000` → `4191` (cổng đã chốt
   cho game này; compose vẫn đặt `PORT=4191` rõ ràng).
5. **Link stage theo host đang mở** (`StreamerDeck.tsx` `obsStageUrl()`):
   hiển thị `${protocol}//${host}/?view=stage` thay vì
   `http://lvh.me:<port>/?view=stage`, nên trên live hiện đúng
   `https://dichua.bla.io.vn/?view=stage`. Bundle build không còn chuỗi
   `lvh.me` (chỉ còn trong README/CLAUDE.md gốc của upstream, là tài liệu
   Windows, không ảnh hưởng code chạy).
6. **Dữ liệu bền qua redeploy** (`server.ts` + `docker-compose.yml`):
   upstream ghi `settings.json` (tên kênh, từ khóa, tên bảng TOP, ảnh nền)
   và `uploads/` (ảnh nền tải lên) ở thư mục chạy. Nay đọc thư mục dữ liệu
   từ env `DATA_DIR` (mặc định là thư mục chạy, giữ y hành vi upstream khi
   chạy local); compose đặt `DATA_DIR=/app/data` và mount volume
   `di-chua-online-data:/app/data` nên cài đặt + ảnh nền không mất khi
   redeploy. Đã kiểm chứng local: `POST /api/control setName` ghi
   `settings.json` đúng vào `DATA_DIR` đã chỉ.
7. **Dockerfile + docker-compose.yml mới** (root repo): base `node:22-alpine`,
   `npm ci` (đủ cả devDependencies vì `tsx` chạy server và `vite` build đều
   nằm ở devDependencies), `npm run build`, `NODE_ENV=production`, chạy
   `npx tsx server.ts`, `PORT 4191`, `PANEL_KEY=${PANEL_KEY}`,
   `DATA_DIR=/app/data`, volume `di-chua-online-data:/app/data`,
   `restart: unless-stopped`, image `di-chua-online:1.0.0`.
8. **Đã xóa `BAT-LIVE.bat`** (chỉ dùng trên Windows) và thêm `.dockerignore`.
   `vite.config.ts`: thêm `dichua.bla.io.vn` vào `allowedHosts` (chỉ ảnh
   hưởng dev server).
9. **Upstream ĐÃ có `package-lock.json`** (210 packages, npm 10.9.4) nên
   `npm ci` trong Dockerfile chạy được ngay, không cần tạo lockfile như
   Lớp Học Chữ.

## Kết quả test local (2026-11-07, trước khi push)

`npm ci` (210 packages) → `npx tsc --noEmit` sạch → `npm run build` xong
(bundle `dist/assets/index-DISwJ0OV.js` 1.108 kB, chứa ô "Mật khẩu panel",
không còn chuỗi `lvh.me`) → chạy
`NODE_ENV=production PORT=4191 PANEL_KEY=<key-test> DATA_DIR=/tmp/dichua-test-data
npx tsx server.ts`. 15/15 đạt:

- `/` với Host `dichua.bla.io.vn` và `localhost` đều 200
- `/?view=stage` 200 (stage 9:16)
- `/api/tiktok/status` 200 JSON `{success:true, data:{isConnected:false,...}}`
- `POST /api/test/emit` không key 403, sai key 403, đúng key 200 (cả
  `x-panel-key` lẫn `Authorization: Bearer`); loại sự kiện sai → 400
- `POST /api/control` không key 403, sai key 403, đúng key 200; action sai → 400
- `POST /api/tiktok/connect` không key 403; đúng key với username giả →
  400 thân thiện ("Không thể kết nối với @...: Failed to retrieve Room ID...")
- `POST /api/tiktok/disconnect` đúng key 200
- `POST /api/background` không key 403
- `GET /api/tts?text=Xin chào cả nhà` 200 `audio/mpeg`, MP3 hợp lệ 24.768 byte
- Host lạ (`evil.example.com`) → 403
- `/assets/bg/chanh-dien-2.webp` 200, `/assets/audio/chill_relax.mp3` 200
- `POST /api/control setName` ghi `settings.json` đúng vào `DATA_DIR`
- Chạy server thứ hai KHÔNG đặt `PANEL_KEY`: `POST /api/control` → 200
  (cho qua để test local, đúng pattern Lớp Học Chữ)

Dữ liệu test ở `/tmp` đã xóa; server test đã dừng; không mật khẩu/key test
nào còn trong file repo.

## Chạy local (test trước khi push)

Máy này không có docker daemon nên test bằng Node trực tiếp:

```bash
npm ci
npx tsc --noEmit
npm run build
NODE_ENV=production PORT=4191 PANEL_KEY=<mat-khau-test> npx tsx server.ts
```

Kiểm tra:

- `curl -H "Host: dichua.bla.io.vn" http://localhost:4191/` → 200, giao diện Đi Chùa Online
- `curl "http://localhost:4191/?view=stage" -H "Host: dichua.bla.io.vn"` → 200 (stage 9:16)
- `curl http://localhost:4191/api/tiktok/status -H "Host: dichua.bla.io.vn"` → JSON `{success:true,...}`
- `curl -X POST http://localhost:4191/api/test/emit -H 'Content-Type: application/json' -d '{"type":"chat","data":{"nickname":"Test","comment":"adidaphat"}}'` → 403 (không key)
- Cùng lệnh trên kèm `-H "x-panel-key: <mat-khau-test>"` → 200
- `curl "http://localhost:4191/api/tts?text=Xin%20ch%C3%A0o"` → audio/mpeg (hoặc lỗi TTS rõ ràng, không 500 do code)

## Deploy (CHƯA làm — chờ parent)

Push code ở `~/workspace/di-chua-online-deploy/` lên `VuBLA2025/di-chua-online`
nhánh `master` (file text qua GitHub connector + 13 file nhị phân dưới
`public/assets/` tải lên bằng trình duyệt — xem mục dưới), rồi tạo project
`Di Chua Online LIVE` + compose `di-chua-online` trên Dokploy (sourceType
github, owner VuBLA2025, repo di-chua-online, branch master, composePath
`./docker-compose.yml`, domain `dichua.bla.io.vn` port 4191, **nhớ bật
`https: true` ngay khi tạo domain** — bài học từ Lớp Học Chữ, mặc định tạo
qua API là `false`), env `PANEL_KEY` (mật khẩu panel do đệ tạo, parent đưa
cho user trong chat, KHÔNG ghi vào file repo), và deploy bằng
**`compose.deploy`** (KHÔNG dùng `compose.redeploy` — bài học từ DamCuoi:
redeploy rebuild từ composeFile cũ lưu trong Dokploy). Theo dõi deployment
tới `done` rồi kiểm tra live:

- https://dichua.bla.io.vn/ — panel Đi Chùa Online (nhập mật khẩu panel ở ô
  "Mật khẩu panel" rồi mới Kết nối / Đọc ngay / đổi ảnh nền)
- https://dichua.bla.io.vn/?view=stage — stage 9:16 cho TikTok LIVE Studio / OBS

## File nhị phân cần upload riêng (connector chỉ push được file text)

13 file dưới `public/assets/`, tổng ~28 MB — stage dùng lúc chạy nên thiếu
là mất 3D/nhạc/nền:

| File | Dung lượng | Dùng lúc chạy |
|---|---|---|
| `public/assets/3d/di.fbx` | 1,8 MB | Động tác đi |
| `public/assets/3d/khan.fbx` | 2,0 MB | Động tác quỳ |
| `public/assets/3d/nguoi.fbx` | 184 KB | Nhân vật áo tràng xám |
| `public/assets/3d/quy.fbx` | 2,0 MB | Động tác quỳ xuống |
| `public/assets/3d/thaphuong.fbx` | 2,3 MB | Động tác thắp hương |
| `public/assets/audio/buddhist_flute.mp3` | 2,9 MB | Nhạc nền sáo |
| `public/assets/audio/chill_relax.mp3` | 5,5 MB | Nhạc nền mặc định |
| `public/assets/audio/khuc_thien_dao.mp3` | 3,1 MB | Nhạc nền |
| `public/assets/audio/niem_phat_nam_mo_a_di_da_phat.mp3` | 4,6 MB | Bản niệm Phật |
| `public/assets/bg/chanh-dien-2.webp` | 364 KB | Tranh nền chánh điện |
| `public/assets/bg/chanh-dien-2-hd.webp` | 1,1 MB | Nền HD |
| `public/assets/bg/chanh-dien-2-4k.webp` | 2,7 MB | Nền 4K (quay cận người tặng quà) |
| `public/assets/devotees/phattu.png` | 36 KB | Hình người 2D khi máy không chạy được 3D |

Lưu ý quyền: theo README upstream, các file này KHÔNG thuộc giấy phép MIT
của code (FBX Mixamo, ảnh/nhạc do chủ dự án cung cấp hoặc chưa rõ nguồn).
Chỉ dùng lại trong game của user, không phát hành lại file gốc.

## Luật chơi (tóm tắt từ README upstream)

- Gõ `adidaphat` (hoặc từ khóa tự đặt ở panel) hay tặng quà → nhân vật mang
  tên + avatar TikTok đi lên bậc thang, thắp hương, lạy 3 lạy rồi về chỗ.
  Tối đa 5 người cùng lúc, đứng so le hai hàng; người sau xếp hàng, mỗi
  người tối đa 1 lần mỗi phút.
- Tặng quà → máy quay áp sát (3,6 lần) theo người tặng, nền chuyển ảnh 4K,
  sen vàng nở, cánh sen rơi; quà càng lớn sen càng to/chói, cánh sen rơi
  càng nhiều và lâu. Giọng đọc gọi tên cảm ơn kèm một lời chúc.
- Hội trường ~150 người ngồi chen kín hai bên lối đi, mỗi người tự lạy theo
  nhịp riêng. Người mới vào được xếp chỗ sau 10 giây, tên hiện trên đầu;
  hết chỗ thì người im lặng lâu nhất nhường chỗ.
- Thanh tim: đủ 666 tim → mưa hoa sen 60 giây (một người thả bao nhiêu tim
  cũng tính).
- Gieo quẻ: cả phòng thả đủ 99 tim → hộp gieo quẻ lắc, gieo một quẻ chung
  cho cả nhà (36 quẻ, toàn lời khuyên nhẹ nhàng, không quẻ xấu, không phán
  tiền bạc/tương lai). Hiện bảng quẻ giữa màn hình + giọng đọc đọc quẻ.
- TOP THÀNH TÂM: bảng 10 người điểm cao nhất — 1 comment = 1 điểm,
  1 xu quà = 10 điểm. 6 người đầu quỳ trên hàng đệm trước bậc thang, có
  bảng tên. Bật/tắt + đổi tên bảng ở panel.
- Tùy chỉnh ở panel: tên kênh (giọng đọc xưng đúng tên này), từ khóa thay
  cho `adidaphat`, tên bảng xếp hạng, ảnh nền riêng (tải lên, bấm một nút
  là về ảnh mặc định). Mọi tùy chỉnh lưu lại, tắt mở app vẫn giữ.
- Giọng đọc tiếng Việt: chào người mới vào, cảm ơn người tặng quà (đọc
  trước mọi câu khác), chúc theo điều người xem cầu trong comment (thi cử,
  sức khỏe, tình duyên…), tự chúc kèm nhắc chia sẻ khi live im lặng hơn
  90 giây.
- Khác: nhạc nền, chuông, mõ, hạc bay ngang thỉnh thoảng, khói hương, lọc
  từ cấm khỏi tên và comment. Điểm, thanh tim và người trong hội trường chỉ
  lưu trong trang stage; tải lại trang là đếm lại từ đầu.

## Trạng thái deploy 2026-11-06 — ĐÃ LIVE

- Repo: `VuBLA2025/di-chua-online`, nhánh `master`, đủ 59 file (46 text,
  commit `aea929b`, + 13 file nhị phân, HEAD `dfaaba6`).
- Dokploy: project `Di Chua Online LIVE` (`Ok_w889N3B2oHQ7Nf9xqL`,
  environment production `HyxaQTuovojjjS6UO29BV`), compose `di-chua-online`
  (`sJTaptQn4iIsqzLyscYWo`, sourceType github, repo VuBLA2025/di-chua-online
  nhánh master, composePath `./docker-compose.yml`, `PANEL_KEY` đã đặt trong
  env), domain `dichua.bla.io.vn` (`wf3aiEn-snau9_4dMCaPH`, port 4191,
  https:true ngay từ đầu, Let's Encrypt).
- Deploy 1 lỗi ngay sau 62ms (status error, không có errorMessage): nguyên
  nhân là compose mới tạo qua API có `githubId` null nên Dokploy không lấy
  được code từ GitHub. Bài học: sau `compose.create` phải `compose.update`
  đặt `githubId` = `0-f_X4vn1CYb3EnTqIaQo` (id GitHub chung của instance này,
  giống hệt ở compose Lớp Học Chữ và Đám Cưới), rồi mới `compose.deploy`.
- Deploy 2: `DHSmvMx9ow4AtuH-m6KyX` status `done` 2026-11-06 ~17:15 UTC.
  **LIVE: https://dichua.bla.io.vn/ — kiểm chứng cùng ngày:** panel `/` 200
  `<title>Đi Chùa Online - TikTok LIVE Interactive Temple</title>`, stage
  `/?view=stage` 200, `/api/tiktok/status` 200 JSON (`isConnected: false`),
  gate mật khẩu: test/emit không key 403, sai key 403, đúng key 200
  (cả `x-panel-key` lẫn `Authorization: Bearer`), `/api/control` đúng key
  200, `/api/tts` 200 audio/mpeg MP3 hợp lệ 24.768 byte, ảnh nền
  `/assets/bg/chanh-dien-2.webp` 200, nhạc `/assets/audio/chill_relax.mp3`
  200. 7 game còn lại kiểm tra cùng lúc vẫn 200 (Chùa, Sàn Vui, Xuyên Việt,
  Đám Cưới, Lớp Học, Đi Làm, Ông Lão).

## Chưa kiểm chứng

- Kết nối TikTok LIVE thật, MC/giọng đọc/nhạc nền nghe bằng tai, stage nhìn
  bằng mắt trên live thật.
- Quà thật theo tên, mốc 666 tim / 99 tim gieo quẻ trong live thật.
