# Đi Chùa Online

Sân khấu 3D tương tác để live TikTok, chạy cùng TikTok LIVE Studio trên máy tính Windows. Bối cảnh là một chánh điện. Người xem gõ `adidaphat` thì có nhân vật mang tên và avatar TikTok của họ đi lên thắp hương. Ai tặng quà thì máy quay áp sát theo người đó, sen vàng nở, cánh sen rơi, giọng đọc gọi tên cảm ơn kèm một lời chúc.

Đây là không gian thư giãn mang tính giải trí. Nó không phải chùa và không đại diện cho tổ chức tôn giáo nào. Quà tặng chỉ để nhận lời chúc, không phải tiền cúng dường hay để cầu may. Dòng lưu ý này chạy liên tục trên màn hình live.

## Tính năng

- **Thắp hương 3D.** Gõ `adidaphat` (hoặc từ khóa bạn tự đặt) hay tặng quà là nhân vật đi lên bậc thang, thắp hương, lạy 3 lạy rồi về chỗ. Tối đa 5 người cùng lúc, đứng so le hai hàng cho tên khỏi đè nhau; người sau xếp hàng, mỗi người tối đa 1 lần mỗi phút.
- **Quay cận người tặng quà.** Máy quay áp sát (3,6 lần) theo người tặng từ lúc đi lên đến khi lạy xong, nền chuyển sang ảnh 4K cho nét, kèm bảng tên có avatar. Mỗi lần một người.
- **Hội trường.** Gần 150 người ngồi chen kín hai bên lối đi, không theo hàng lối, mỗi người tự lạy theo nhịp riêng. Người xem mới vào được xếp chỗ sau 10 giây, tên hiện trên đầu. Hết chỗ thì người im lặng lâu nhất nhường chỗ.
- **Hiệu ứng quà.** Quà càng lớn thì sen vàng càng to và chói, cánh sen hồng rơi càng nhiều và lâu.
- **Thanh tim.** Đủ 666 tim thì mưa hoa sen 60 giây; một người thả bao nhiêu tim cũng được tính.
- **Gieo quẻ.** Cả phòng thả đủ 99 tim là hộp gieo quẻ lắc, gieo một quẻ chung cho cả nhà: hiện bảng quẻ giữa màn hình và giọng đọc đọc quẻ. Có 36 quẻ, toàn lời khuyên nhẹ nhàng, không có quẻ xấu và không phán chuyện tiền bạc, tương lai (quẻ vui, để giải trí).
- **TOP THÀNH TÂM.** Bảng 10 người điểm cao nhất: 1 comment được 1 điểm, 1 xu quà được 10 điểm. 6 người đầu quỳ trên hàng đệm trước bậc thang, có bảng tên. Bật/tắt bảng bằng một nút ở trang điều khiển, đổi được tên bảng.
- **Tùy chỉnh trong trang điều khiển.** Tên kênh (giọng đọc xưng đúng tên này), từ khóa thay cho `adidaphat`, tên bảng xếp hạng, và ảnh nền riêng (tải ảnh lên, bấm một nút là về ảnh mặc định). Mọi tùy chỉnh được lưu lại, tắt mở app vẫn giữ.
- **Giọng đọc tiếng Việt.** Chào người mới vào, cảm ơn người tặng quà (đọc trước mọi câu khác), chúc theo điều người xem cầu trong comment (thi cử, sức khỏe, tình duyên…), và tự chúc kèm nhắc chia sẻ khi live im lặng hơn 90 giây. Giọng đọc xưng bằng **tên kênh** bạn đặt.
- **Khác:** nhạc nền, chuông, mõ, hạc bay ngang thỉnh thoảng, khói hương, lọc từ cấm khỏi tên và comment.

## Cần có

- Máy tính **Windows** có card đồ họa tương đối (để chạy nhân vật 3D). File chạy `BAT-LIVE.bat` chỉ dùng được trên Windows.
- [Node.js](https://nodejs.org) bản LTS.
- TikTok LIVE Studio, đăng nhập tài khoản sẽ live.
- Internet (giọng đọc, font chữ và tên miền `lvh.me` đều cần mạng).

## Cài và chạy

1. Tải về: nút **Code → Download ZIP** rồi giải nén, hoặc `git clone` repo này.
2. Bấm đúp `BAT-LIVE.bat`. Lần đầu nó tự cài thư viện (1–2 phút), sau đó mở trang điều khiển ở `http://localhost:3000`.
3. Ở trang điều khiển, ô **Tên kênh** (góc trên): gõ tên của bạn, ví dụ "Tâm An Nhiên", rồi bấm **Lưu**. Tên này hiện thành tiêu đề trên sân khấu và là tên giọng đọc dùng, ví dụ "A Di Đà Phật, Tâm An Nhiên xin chào bạn…". Tên được lưu vào file `settings.json`, tắt mở lại vẫn giữ. Cũng trong trang điều khiển, khung **Tùy chỉnh sân khấu** cho đổi từ khóa, tên bảng và ảnh nền (ảnh tải lên nằm trong thư mục `uploads`).
4. Trong TikTok LIVE Studio, thêm nguồn **Link**:
   - Link: `http://lvh.me:3000/?view=stage`
   - Kích thước: 1080 × 1920
5. Bắt đầu live, rồi ở trang điều khiển nhập username TikTok của bạn (không cần @) và bấm kết nối.

Giữ cửa sổ `BAT-LIVE.bat` mở suốt buổi live; đóng nó là tắt app.

### Lưu ý khi live

- Chỉ trang trong LIVE Studio (`?view=stage`) phát tiếng. Trang điều khiển im lặng, mở bao nhiêu tab cũng được. Đừng mở thêm link `?view=stage` ở trình duyệt khác trong lúc live, nếu không sẽ nghe hai giọng.
- `BAT-LIVE.bat` chạy ở chế độ live: sửa code không làm trang stage tự tải lại. Muốn nhận bản mới thì bấm làm mới nguồn Link trong LIVE Studio.
- Điểm, thanh tim và người trong hội trường chỉ lưu trong trang stage; tải lại trang là đếm lại từ đầu.
- App chỉ nhận kết nối từ chính máy đang chạy nó (127.0.0.1). `lvh.me` là tên miền công khai trỏ về 127.0.0.1, dùng vì LIVE Studio không nhận `localhost`.

### Cập nhật bản mới

Nếu đã clone bằng git: chạy `git pull` trong thư mục rồi mở lại `BAT-LIVE.bat`. Nếu tải ZIP: tải lại ZIP, rồi chép file `settings.json` và thư mục `uploads` từ thư mục cũ sang thư mục mới để giữ tên kênh, từ khóa, tên bảng và ảnh nền.

## Sửa lỗi thường gặp

- **Không vào được `localhost:3000`.** Xem cửa sổ `BAT-LIVE.bat`: phải có dòng `Chùa Online LIVE server running on http://localhost:3000`. Nếu báo lỗi cài thư viện, xóa thư mục `node_modules` rồi chạy lại BAT để nó cài lại từ đầu. Nếu báo chưa có Node.js, cài Node.js bản LTS.
- **Trình duyệt vào được nhưng thử `localhost` không ra:** mở `http://127.0.0.1:3000` thay thế.
- **LIVE Studio không hiện gì với link `lvh.me`:** một số mạng hoặc phần mềm diệt virus chặn tên miền này. Mở Notepad bằng quyền Administrator, mở file `C:\Windows\System32\drivers\etc\hosts`, thêm dòng `127.0.0.1 lvh.me` ở cuối, lưu lại rồi làm mới nguồn Link.
- **Báo lỗi `EADDRINUSE`:** cổng 3000 đang bị app khác dùng; tắt app đó (hoặc cửa sổ BAT cũ) rồi chạy lại.

## Phụ thuộc bên ngoài cần biết

- **Đọc sự kiện TikTok** dùng thư viện không chính thức [`tiktok-live-connector`](https://github.com/zerodytrash/TikTok-Live-Connector). TikTok có thể thay đổi và làm nó ngừng chạy bất cứ lúc nào.
- **Giọng đọc** dùng dịch vụ đọc của Microsoft Edge qua thư viện `msedge-tts` (giọng `vi-VN-NamMinhNeural`), lỗi thì chuyển sang giọng Google Translate. Cả hai đều không phải API chính thức cho mục đích này và có thể bị giới hạn.
- **Luật của TikTok** về live tự động, live không có người thật và kêu gọi tặng quà có thể thay đổi. Người dùng tự chịu trách nhiệm tuân thủ luật của TikTok và pháp luật nơi mình sống, kể cả nghĩa vụ thuế với thu nhập từ quà tặng.

## Tài nguyên (public/assets)

Giấy phép MIT trong file `LICENSE` **chỉ áp dụng cho code**. Các file dưới đây không nằm trong giấy phép đó. Trước khi dùng lại hoặc phát hành chúng, hãy tự kiểm tra quyền sử dụng.

| File | Là gì | Nguồn và quyền |
|---|---|---|
| `3d/di.fbx`, `3d/khan.fbx`, `3d/quy.fbx`, `3d/thaphuong.fbx` | Động tác đi, quỳ, quỳ xuống, thắp hương | Tải từ [Adobe Mixamo](https://www.mixamo.com). Mixamo cho dùng miễn phí trong dự án của bạn; việc phát tán lại file gốc theo điều khoản của Adobe, chưa được xác nhận. |
| `3d/nguoi.fbx` | Nhân vật mặc áo tràng xám | Do chủ dự án cung cấp; nguồn gốc và quyền phát tán chưa được xác nhận. |
| `bg/chanh-dien-2.webp` | Tranh nền chánh điện (gốc) | Do chủ dự án cung cấp; nguồn gốc chưa được xác nhận. |
| `bg/chanh-dien-2-hd.webp`, `bg/chanh-dien-2-4k.webp` | Bản phóng to của tranh nền | Tạo từ `chanh-dien-2.webp` bằng Real-ESRGAN (x4plus); quyền theo tranh gốc. |
| `audio/chill_relax.mp3` | Nhạc nền mặc định | Tạo bằng mô hình AI ACE-Step. |
| `audio/buddhist_flute.mp3`, `audio/khuc_thien_dao.mp3` | Nhạc nền khác | Có sẵn từ bản dựng ban đầu; nguồn chưa được xác nhận. |
| `audio/niem_phat_nam_mo_a_di_da_phat.mp3` | Bản thu niệm Phật | Bản thu của người khác; nguồn và quyền chưa được xác nhận. Nên thay bằng bản bạn có quyền dùng. |
| `devotees/phattu.png` | Hình người 2D (dùng khi máy không chạy được 3D) | Do chủ dự án cung cấp; nguồn chưa được xác nhận. |

Muốn thay file nào thì giữ nguyên tên file, app sẽ dùng file mới.

## Giấy phép

Code: [MIT](LICENSE). Tài nguyên: xem bảng trên.
