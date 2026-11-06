import type { MusicTrack } from '../types/temple';
import { containsBanned } from './bannedWords';

/**
 * Sound Engine: Authentic Buddhist temple bell, resonant woodblock (mõ gia trì),
 * crystalline lotus chime (chuông sen nở), REAL Buddhist Music (Niệm Phật Thích Trí Thoát & Sáo Trúc),
 * Buddhist Dharma Lecture delivery, and gentle Vietnamese Buddhist Female Voice.
 *
 * Rules:
 * 1. "nhạc phật giáo ấy chứ không phải kiểu nhạc thiền nghe đau đầu quá đi":
 *    - Removed all headache-inducing oscillator drones.
 *    - Real authentic Buddhist Music: Niệm Phật 6 chữ Nam Mô A Di Đà Phật (Thầy Thích Trí Thoát)
 *      and Sáo Trúc & Đàn Tranh Thiền Môn.
 * 2. "khi bật thuyết giảng thì tự động tắt đọc dâng quà của phật tử":
 *    - When Dharma lecture is active, all devotee gift/comment TTS is automatically muted!
 * 3. "dù x1 hay x5 chỉ đọc 1 lần thôi":
 *    - Enforced 16s cooldown per combo sequence.
 * 4. "giọng nữ tiếng việt dịu dàng, nghiêm túc, như lúc dâng hoa sen":
 *    - Standardized gentle unhurried cadence with "Dạ, Nam mô A Di Đà Phật..." and "...ạ".
 */

export function formatUsernameForTts(username: string): string {
  if (!username) return 'bạn';

  // Read the name only: fancy letters (𝑵𝒈𝒖𝒚𝒆̂̃𝒏) become plain, emoji and symbols (💥🌑❤) are dropped
  let clean = username
    .normalize('NFKC')
    .replace(/[︀-️‍⃣]/g, '') // emoji variation selectors / joiners count as marks
    .replace(/[^\p{L}\p{M}\p{N}\s._-]/gu, ' ')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
  // Never say a name that carries a banned word; just call them "bạn"
  if (!clean || containsBanned(clean)) return 'bạn';

  // Separate letter-digit and word boundary transitions
  clean = clean.replace(/([a-z])([A-Z])/g, '$1 $2');
  clean = clean.replace(/([a-zA-Z])(\d)/g, '$1 $2');
  clean = clean.replace(/(\d)([a-zA-Z])/g, '$1 $2');
  clean = clean.replace(/[._\-]+/g, ' ');

  const digitWords: Record<string, string> = {
    '0': 'không',
    '1': 'một',
    '2': 'hai',
    '3': 'ba',
    '4': 'bốn',
    '5': 'năm',
    '6': 'sáu',
    '7': 'bảy',
    '8': 'tám',
    '9': 'chín',
  };

  const words = clean.split(/\s+/).filter(Boolean);
  const processed: string[] = [];

  for (const w of words) {
    if (/^\d+$/.test(w)) {
      const spelled = w
        .split('')
        .map((d) => digitWords[d] || d)
        .join(' ');
      processed.push(spelled);
      continue;
    }

    const lower = w.toLowerCase();

    if (lower === 'thanhtam') {
      processed.push('Thanh Tâm');
      continue;
    }
    if (lower === 'minhtue') {
      processed.push('Minh Tuệ');
      continue;
    }
    if (lower === 'tuyetmai') {
      processed.push('Tuyết Mai');
      continue;
    }
    if (lower === 'luukikim') {
      processed.push('Lưu Ki Kim');
      continue;
    }

    const prefixes = [
      'duy', 'thanh', 'minh', 'tuyet', 'ngoc', 'phuc', 'van', 'xuan',
      'kim', 'hong', 'hoang', 'quoc', 'viet', 'hai', 'nam', 'quang',
      'tien', 'trung', 'tuan'
    ];

    let splitDone = false;
    for (const p of prefixes) {
      if (lower.startsWith(p) && lower.length > p.length) {
        processed.push(w.slice(0, p.length), w.slice(p.length));
        splitDone = true;
        break;
      }
    }

    if (!splitDone) {
      processed.push(w);
    }
  }

  return processed.join(' ');
}

// Wishes said after greetings and thanks, picked at random ("{who}" = "bạn" or "quý vị")
const WISHES = [
  'Chúc {who} thân tâm an lạc, bao phiền muộn đều nhẹ đi ạ.',
  'Chúc {who} sức khỏe dồi dào, cha mẹ ở nhà luôn mạnh khỏe ạ.',
  'Chúc {who} làm ăn thuận lợi, tài lộc dồi dào ạ.',
  'Chúc gia đình {who} êm ấm, con cháu hiếu thảo ạ.',
  'Chúc {who} công việc hanh thông, ra đường gặp quý nhân ạ.',
  'Chúc {who} học hành tấn tới, thi cử đỗ đạt ạ.',
  'Chúc {who} sớm gặp được người thương, duyên lành trọn vẹn ạ.',
  'Chúc {who} tai qua nạn khỏi, đi đâu cũng bình yên ạ.',
  'Chúc {who} phước lộc đầy nhà, vạn sự như ý ạ.',
  'Chúc {who} lòng luôn thanh thản, gặp chuyện gì cũng bình tĩnh vượt qua ạ.',
  'Chúc nhà {who} trên thuận dưới hòa, ấm no hạnh phúc ạ.',
  'Chúc {who} mọi điều mong cầu đều sớm thành tựu ạ.',
];


// Blessings (written by the channel owner) said after gift thanks and when the live has been quiet a while
const OFFERING_BLESSINGS = [
  'Nam mô A Di Đà Phật. Kính chúc quý vị một ngày bình an, công việc thuận lợi, mọi điều muộn phiền dần được hóa giải, tâm luôn nhẹ nhàng và an nhiên.',
  'Nguyện cho quý vị đang nỗ lực mỗi ngày sớm nhìn thấy thành quả xứng đáng. Dù đường đời còn nhiều thử thách, mong quý vị luôn vững lòng và không đánh mất niềm tin.',
  'Chúc quý vị sáng thức dậy với một tâm hồn nhẹ nhõm, tối trở về với một trái tim bình yên. Mong mỗi ngày trôi qua đều có những niềm vui nhỏ đáng trân trọng.',
  'Nguyện cho những ai đang áp lực vì công việc, học hành và cuộc sống tìm được chút bình yên trong tâm. Mong quý vị đủ sức khỏe, đủ kiên nhẫn và đủ sáng suốt để bước tiếp.',
  'Chúc quý vị làm việc gặp người thiện lành, học hành ngày càng tiến bộ, những dự định đang ấp ủ từng bước trở thành hiện thực.',
  'Nam mô A Di Đà Phật. Nguyện cho quý vị và gia đình luôn mạnh khỏe, trên dưới thuận hòa, trong nhà đầy ắp tiếng cười, ngoài đời gặp nhiều nhân duyên tốt đẹp.',
  'Mong quý vị không quá buồn vì những điều đã qua, cũng không quá lo về những chuyện chưa tới. Hãy trân trọng hiện tại và dành cho bản thân một chút dịu dàng.',
  'Chúc những người trẻ đang tìm kiếm hướng đi cho mình có đủ bản lĩnh để thử sức, đủ kiên trì để trưởng thành và đủ bình tĩnh để không so sánh cuộc đời mình với người khác.',
  'Nguyện cho quý vị đang mưu sinh xa nhà luôn được bình an trên mỗi chặng đường. Mong công việc ổn định, sức khỏe dồi dào và sớm có những ngày sum họp ấm áp bên gia đình.',
  'Chúc quý vị tài chính ngày càng ổn định, biết vun vén và sử dụng đồng tiền một cách sáng suốt. Mong những nỗ lực chân chính mang lại cuộc sống đủ đầy và an tâm.',
  'Nam mô A Di Đà Phật. Nguyện cho ai đang mang trong lòng nỗi buồn có thêm sức mạnh để vượt qua. Mong những tổn thương dần được xoa dịu và niềm vui lại ghé thăm.',
  'Chúc quý vị đang học tập, thi cử có tâm trí sáng suốt, tinh thần vững vàng, tiếp thu kiến thức tốt và đạt được kết quả tương xứng với công sức đã bỏ ra.',
  'Mong quý vị giữa những bộn bề cuộc sống vẫn dành được thời gian nghỉ ngơi, chăm sóc sức khỏe và quan tâm đến những người thân yêu.',
  'Nguyện cho những ai đang bắt đầu công việc mới, dự án mới hay hành trình mới luôn giữ được sự tự tin, gặp được người đồng hành tốt và từng bước tiến về phía trước.',
  'Chúc quý vị có những mối quan hệ chân thành, biết yêu thương đúng cách, biết buông bỏ điều không phù hợp và trân trọng những người thật lòng bên cạnh mình.',
  'Nam mô A Di Đà Phật. Nguyện cho cha mẹ và những bậc sinh thành luôn được khỏe mạnh, sống vui bên con cháu. Mong mỗi gia đình đều có thêm thời gian yêu thương và sẻ chia.',
  'Chúc quý vị hôm nay dù có bận rộn đến đâu vẫn tìm được một khoảnh khắc bình yên. Một hơi thở sâu, một nụ cười nhẹ, đôi khi cũng đủ làm ngày dài trở nên dễ chịu hơn.',
  'Nguyện cho quý vị đang gặp khó khăn không đánh mất hy vọng. Mong từng vấn đề dần tìm được hướng giải quyết, từng bước nhỏ hôm nay mở ra những cơ hội tốt đẹp ngày mai.',
  'Chúc quý vị luôn giữ được tâm thiện lành, lời nói hòa nhã và cách sống chân thành. Mong những điều tốt đẹp quý vị trao đi sẽ góp phần làm cuộc sống thêm ấm áp.',
  'Nam mô A Di Đà Phật. Kính chúc toàn thể quý vị đang hiện diện tại Tâm Tịnh Tâm An thân tâm an lạc, gia đạo bình an, công việc hanh thông, trí tuệ sáng suốt và mỗi ngày đều có thêm một lý do để mỉm cười.',
];

// The owner's blessings that wish the family well, said after a gift thanks
const FAMILY_BLESSINGS = OFFERING_BLESSINGS.filter((b) => /gia đình|gia đạo|cha mẹ/.test(b));

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private speechQueue: string[] = [];
  private priorityQueue: string[] = []; // "Đọc ngay": read right after the current sentence, even mid-lecture
  private isSpeaking = false;
  private speechRate = 1;

  // Real Buddhist background music tracks
  private bgmAudio: HTMLAudioElement | null = null;
  private currentTrack: MusicTrack = 'chill';
  private bgmUserVolume = 0.18;
  private isBgmPlaying = false;
  private bgmWanted = false; // set by start/stopBuddhistMusic; the first-click unlock only resumes wanted music

  // Dharma lecture active state
  // "khi bật thuyết giảng thì tự động tắt đọc dâng quà của phật tử"
  private isDharmaActive = false;
  private dharmaParagraphs: string[] = []; // the lecture split into sentences
  private dharmaParaOfSentence: number[] = [];
  private currentDharmaIndex = 0;
  private onDharmaParagraphCallback?: (idx: number) => void;
  private onDharmaCompleteCallback?: () => void;
  private dharmaAudio: HTMLAudioElement | null = null;

  // Anti-spam combo cooldown map: "dù x1 hay x5 chỉ đọc 1 lần thôi"
  private lastGiftAckMap: Map<string, number> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.initAudioContext();
        if (this.bgmWanted && !this.isBgmPlaying) {
          this.startBuddhistMusic(this.currentTrack, this.bgmUserVolume);
        }
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('click', unlock);
      window.addEventListener('keydown', unlock);
      window.addEventListener('touchstart', unlock);
    }
  }

  public setSpeechRate(rate: number) {
    this.speechRate = rate;
  }

  public initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // ==========================================
  // REAL BUDDHIST MUSIC (NHẠC PHẬT GIÁO THANH TỊNH)
  // Track 1: Sáo Trúc & Đàn Tranh Thiền Môn (Dịu nhẹ, trong trẻo, năng lượng an lành)
  // Track 2: Niệm Phật 6 chữ Nam Mô A Di Đà Phật - Thầy Thích Trí Thoát
  // Track 3: Khúc Thiền Đạo Trầm Bổng (Guzheng & Tiêu thanh tịnh)
  // ==========================================
  public startBuddhistMusic(
    track: MusicTrack = 'chill',
    volume = 0.35
  ) {
    if (typeof window === 'undefined') return;
    this.bgmWanted = true;
    this.currentTrack = track;
    this.bgmUserVolume = Math.max(0, Math.min(1, volume));

    const trackUrls: Record<MusicTrack, string> = {
      chill: '/assets/audio/chill_relax.mp3',
      sao_truc: '/assets/audio/buddhist_flute.mp3',
      niem_phat: '/assets/audio/niem_phat_nam_mo_a_di_da_phat.mp3',
      khuc_thien_dao: '/assets/audio/khuc_thien_dao.mp3',
    };

    const targetUrl = trackUrls[track];

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio(targetUrl);
      this.bgmAudio.loop = true;
    } else if (this.bgmAudio.src !== window.location.origin + targetUrl) {
      this.bgmAudio.pause();
      this.bgmAudio.src = targetUrl;
    }

    const effectiveVol = (this.isSpeaking || this.isDharmaActive)
      ? this.bgmUserVolume * 0.25
      : this.bgmUserVolume;
    this.bgmAudio.volume = effectiveVol;

    const playPromise = this.bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isBgmPlaying = true;
        })
        .catch(() => {
          // Autoplay policy awaiting user click
          this.isBgmPlaying = false;
        });
    }
  }

  public stopBuddhistMusic() {
    this.bgmWanted = false;
    this.isBgmPlaying = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  public setBgmVolume(volume: number) {
    this.bgmUserVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmAudio) {
      const effectiveVol = (this.isSpeaking || this.isDharmaActive)
        ? this.bgmUserVolume * 0.25
        : this.bgmUserVolume;
      this.bgmAudio.volume = effectiveVol;
    }
  }

  public switchBgmTrack(track: MusicTrack) {
    this.currentTrack = track;
    if (this.isBgmPlaying) {
      this.startBuddhistMusic(track, this.bgmUserVolume);
    }
  }

  public getIsBgmPlaying(): boolean {
    return this.isBgmPlaying;
  }

  public getCurrentTrack(): MusicTrack {
    return this.currentTrack;
  }

  // ==========================================
  // THUYẾT GIẢNG PHẬT PHÁP (DHARMA LECTURES)
  // "khi bật thuyết giảng thì tự động tắt đọc dâng quà của phật tử"
  // ==========================================
  public startDharmaLecture(
    paragraphs: string[],
    onParagraphChange: (idx: number) => void,
    onComplete: () => void
  ) {
    this.stopDharmaLecture();

    this.isDharmaActive = true;
    // Read sentence by sentence so "Đọc ngay" can cut in at the end of the current sentence
    this.dharmaParagraphs = [];
    this.dharmaParaOfSentence = [];
    paragraphs.forEach((para, p) => {
      for (const sentence of para.split(/(?<=[.!?…])\s+/)) {
        if (!sentence.trim()) continue;
        this.dharmaParagraphs.push(sentence.trim());
        this.dharmaParaOfSentence.push(p);
      }
    });
    this.currentDharmaIndex = 0;
    this.onDharmaParagraphCallback = onParagraphChange;
    this.onDharmaCompleteCallback = onComplete;

    // Clear any queued gift speech to prevent disruption
    this.speechQueue = [];
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isSpeaking = false;

    // Duck Buddhist background music for clear sermon audio
    this.setBgmVolume(this.bgmUserVolume);

    this.playNextDharmaParagraph();
  }

  private playNextDharmaParagraph() {
    if (!this.isDharmaActive) return;

    // "Đọc ngay" lines go first, between two sentences
    if (this.priorityQueue.length > 0) {
      this.processQueue();
      return;
    }

    if (this.currentDharmaIndex >= this.dharmaParagraphs.length) {
      this.stopDharmaLecture();
      if (this.onDharmaCompleteCallback) {
        this.onDharmaCompleteCallback();
      }
      return;
    }

    const i = this.currentDharmaIndex;
    const para = this.dharmaParaOfSentence[i];
    if (this.onDharmaParagraphCallback && (i === 0 || para !== this.dharmaParaOfSentence[i - 1])) {
      this.onDharmaParagraphCallback(para);
    }

    // Lectures read a little slower than thank-you lines
    const lectureRate = Math.max(0.6, this.speechRate - 0.1).toFixed(2);
    const urlFor = (k: number) => `/api/tts?rate=${lectureRate}&text=${encodeURIComponent(this.dharmaParagraphs[k])}`;
    const audio = new Audio(urlFor(i));
    audio.volume = 1.0;
    this.dharmaAudio = audio;
    // Warm the server cache for the next sentence so there is no gap
    if (i + 1 < this.dharmaParagraphs.length) fetch(urlFor(i + 1)).catch(() => {});

    const next = () => {
      this.currentDharmaIndex += 1;
      // Short breath between sentences, longer between paragraphs
      const newParagraph = this.dharmaParaOfSentence[i + 1] !== para;
      setTimeout(() => this.playNextDharmaParagraph(), newParagraph ? 700 : 250);
    };
    audio.onended = next;
    audio.onerror = next;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        this.stopDharmaLecture();
      });
    }
  }

  public stopDharmaLecture() {
    this.isDharmaActive = false;
    if (this.dharmaAudio) {
      this.dharmaAudio.pause();
      this.dharmaAudio = null;
    }
    this.dharmaParagraphs = [];
    this.currentDharmaIndex = 0;
    // Restore normal background music volume
    this.setBgmVolume(this.bgmUserVolume);
  }

  public isDharmaLecturePlaying(): boolean {
    return this.isDharmaActive;
  }

  // ==========================================
  // SACRED TEMPLE PERCUSSION (BELL & MÕ)
  // ==========================================

  /**
   * Deep Bronze Temple Bell (Chuông Đại Hồng / Chuông U Minh Ngân Vang 8s)
   */
  public playTempleBell(volume = 1.0) {
    try {
      const ctx = this.initAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(volume * 0.9, now);
      master.connect(ctx.destination);

      const freqs = [146.83, 293.66, 440.0, 734.16, 1174.66, 1760.0];
      const gains = [0.8, 0.5, 0.35, 0.2, 0.12, 0.06];
      const decayTimes = [8.0, 6.2, 4.8, 3.2, 2.0, 1.4];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 6, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(gains[idx], now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decayTimes[idx]);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + decayTimes[idx]);
      });
    } catch {
      // Ignored
    }
  }

  /**
   * Authentic Buddhist Woodblock (Mõ Gia Trì Tụng Kinh "CỐC CỐC")
   */
  public playMuoGong(volume = 1.3) {
    try {
      const ctx = this.initAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(volume * 1.1, now);
      master.connect(ctx.destination);

      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      const clickFilter = ctx.createBiquadFilter();

      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(2400, now);
      clickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.012);

      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(2200, now);
      clickFilter.Q.setValueAtTime(3.0, now);

      clickGain.gain.setValueAtTime(0.8, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      clickOsc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(master);

      clickOsc.start(now);
      clickOsc.stop(now + 0.02);

      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      const bodyFilter = ctx.createBiquadFilter();

      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(460, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(340, now + 0.07);

      bodyFilter.type = 'bandpass';
      bodyFilter.frequency.setValueAtTime(410, now);
      bodyFilter.Q.setValueAtTime(6.5, now);

      bodyGain.gain.setValueAtTime(0, now);
      bodyGain.gain.linearRampToValueAtTime(1.2, now + 0.003);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(master);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.18);

      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(220, now);
      subOsc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      subGain.gain.setValueAtTime(0.9, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      subOsc.connect(subGain);
      subGain.connect(master);

      subOsc.start(now);
      subOsc.stop(now + 0.15);
    } catch {
      // Ignored
    }
  }

  /**
   * Crystalline Lotus Chime (Chuông Sen Nở / Khánh Đồng Báo Hỷ)
   */
  public playLotusBloom(volume = 1.1) {
    try {
      const ctx = this.initAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(volume * 1.0, now);
      master.connect(ctx.destination);

      const chimeFreqs = [1046.5, 1567.98, 2093.0, 2637.02];
      const chimeGains = [0.8, 0.5, 0.35, 0.2];
      const chimeDecays = [2.8, 2.2, 1.8, 1.2];

      chimeFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now + idx * 0.035);

        gain.gain.setValueAtTime(0, now + idx * 0.035);
        gain.gain.linearRampToValueAtTime(chimeGains[idx], now + idx * 0.035 + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.035 + chimeDecays[idx]);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + chimeDecays[idx] + 0.1);
      });
    } catch {
      // Ignored
    }
  }

  // ==========================================
  // GENTLE VIETNAMESE BUDDHIST FEMALE VOICE
  // Default unhurried rate (0.88x) for serene temple elegance
  // ==========================================
  public speakPreferredBuddhistVoice(text: string) {
    if (!text || !text.trim()) return;

    // During a lecture the voice reads only the lecture (and "Đọc ngay"); everything else is dropped
    if (this.isDharmaActive) return;

    this.speechQueue.push(text.trim());
    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  /**
   * "Đọc ngay" from the dashboard: goes ahead of everything, right after the sentence playing now
   */
  public speakNow(text: string) {
    if (!text || !text.trim()) return;
    this.priorityQueue.push(text.trim());
    if (!this.isSpeaking && !this.isDharmaActive) this.processQueue();
  }

  private lastSpokeAt = Date.now();

  // Lines waiting to be read (not counting the one playing)
  public queuedSpeech() {
    return this.speechQueue.length;
  }

  // How long the voice has been quiet (0 while speaking)
  public quietForMs() {
    return this.isSpeaking || this.isDharmaActive ? 0 : Date.now() - this.lastSpokeAt;
  }

  private processQueue() {
    this.lastSpokeAt = Date.now();
    if (this.priorityQueue.length === 0 && this.speechQueue.length === 0) {
      this.isSpeaking = false;
      this.setBgmVolume(this.bgmUserVolume);
      if (this.isDharmaActive) this.playNextDharmaParagraph();
      return;
    }

    this.isSpeaking = true;
    this.setBgmVolume(this.bgmUserVolume);

    const nextText = (this.priorityQueue.shift() ?? this.speechQueue.shift())!;
    const audioUrl = `/api/tts?rate=${this.speechRate}&text=${encodeURIComponent(nextText)}`;
    const audio = new Audio(audioUrl);
    audio.volume = 1.0;
    this.currentAudio = audio;

    const onDone = () => {
      this.currentAudio = null;
      setTimeout(() => {
        this.processQueue();
      }, 300);
    };

    audio.onended = onDone;
    audio.onerror = onDone;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        this.isSpeaking = false;
        this.setBgmVolume(this.bgmUserVolume);
      });
    }
  }

  /**
   * "<channel name> cảm ơn bạn X đã gửi quà tặng." plus a random family blessing, read before anything else waiting.
   * (Gifts are thanked as gifts, never as offerings to the Buddha: the on-screen notice says they are not.)
   * Combos and repeat gifts from the same person are thanked once per 30s (gifts of 99+ coins are always thanked).
   */
  public readGiftAcknowledgment(username: string, _giftName: string, diamonds = 0) {
    const key = `gift_${username.trim().toLowerCase()}`;
    const now = Date.now();
    if (now - (this.lastGiftAckMap.get(key) ?? 0) < 30000) return;
    // Lectures stay uninterrupted; small gifts are skipped only when the gift line is far behind
    if (this.isDharmaActive || (diamonds < 99 && this.priorityQueue.length >= 6)) return;
    this.lastGiftAckMap.set(key, now);

    // Gift givers go first: read right after the sentence playing now, ahead of greetings and other lines
    this.priorityQueue.push(`${this.channelName} cảm ơn bạn ${formatUsernameForTts(username)} đã gửi quà tặng.`);
    this.priorityQueue.push(FAMILY_BLESSINGS[Math.floor(Math.random() * FAMILY_BLESSINGS.length)]);
    if (!this.isSpeaking) this.processQueue();
  }

  private lastWishIndex = -1;

  // Random wish, never the same one twice in a row
  private pickWish(who: 'bạn' | 'quý vị', extra: string[] = []) {
    const pool = [...WISHES, ...extra];
    let i = Math.floor(Math.random() * pool.length);
    if (i === this.lastWishIndex) i = (i + 1) % pool.length;
    this.lastWishIndex = i;
    return pool[i].replace('{who}', who);
  }

  /**
   * Thank a new follower (once per user per session)
   */
  // Gieo quẻ for the whole room: the quẻ's number and name, then its words (normal queue, after gift thanks)
  public readFortune(fortune: { so: number; ten: string; loi: string }) {
    this.speakPreferredBuddhistVoice(`Cả nhà vừa thả đủ 99 tim, gieo được quẻ số ${fortune.so}, quẻ ${fortune.ten}.`);
    this.speakPreferredBuddhistVoice(fortune.loi);
  }

  public readFollowThanks(username: string) {
    const key = `follow_${username.trim().toLowerCase()}`;
    if (this.lastGiftAckMap.has(key)) return;
    this.lastGiftAckMap.set(key, Date.now());

    const spokenName = formatUsernameForTts(username);
    this.speakPreferredBuddhistVoice(
      `Dạ, con cảm ơn bạn ${spokenName} đã theo dõi kênh. A Di Đà Phật. ${this.pickWish('bạn')}`
    );
  }

  /**
   * Stop every sound this engine owns (music, lecture, speech)
   */
  public dispose() {
    this.stopBuddhistMusic();
    this.stopDharmaLecture();
    this.speechQueue = [];
    this.priorityQueue = [];
    this.currentAudio?.pause();
    this.currentAudio = null;
    this.audioCtx?.close().catch(() => {});
  }

  /**
   * Greet viewers who just joined the live by name (never says "adidaphat": the voice misreads it)
   */
  public readWelcomeJoiners(names: string[]) {
    // No greetings during a lecture; they are dropped, not queued for the paragraph break
    if (names.length === 0 || this.isDharmaActive) return;
    const spoken = names.map((n) => `bạn ${formatUsernameForTts(n)}`);
    const list = spoken.length > 1 ? `${spoken.slice(0, -1).join(', ')} và ${spoken[spoken.length - 1]}` : spoken[0];
    this.speakPreferredBuddhistVoice(`A Di Đà Phật, ${this.channelName} xin chào ${list} vừa ghé vào.`);
  }

  private lastBlessingIndex = -1;

  // The name the voice uses for the channel (dashboard "Tên kênh"; default until the owner saves one)
  private channelName = 'Tâm Tịnh Tâm An';
  public setChannelName(name: string) {
    this.channelName = name.trim() || this.channelName;
  }

  // One of the 20 offering blessings, never the same one twice in a row
  private pickBlessing() {
    let i = Math.floor(Math.random() * OFFERING_BLESSINGS.length);
    if (i === this.lastBlessingIndex) i = (i + 1) % OFFERING_BLESSINGS.length;
    this.lastBlessingIndex = i;
    return OFFERING_BLESSINGS[i].replace('Tâm Tịnh Tâm An', this.channelName);
  }


  private shareReminderIndex = 0;

  /**
   * Nothing to say for a while: a gentle blessing for everyone watching, then ask them to share the live
   */
  public readIdleBlessing() {
    this.speakPreferredBuddhistVoice(this.pickBlessing());
    this.speakPreferredBuddhistVoice('Quý vị nhớ bấm chia sẻ live cho bạn bè, người thân cùng nghe nhé.');
  }

  /**
   * Periodic reminder asking viewers to share the live.
   * With recent commenters/gift givers, thank them by name first.
   */
  public readShareReminder(recentNames: string[] = []) {
    if (recentNames.length > 0) {
      const spoken = recentNames.map((n) => `bạn ${formatUsernameForTts(n)}`);
      const list = spoken.length > 1 ? `${spoken.slice(0, -1).join(', ')} và ${spoken[spoken.length - 1]}` : spoken[0];
      this.speakPreferredBuddhistVoice(
        `Dạ, ${this.channelName} cảm ơn ${list} đã ghé chơi. Quý vị nhớ bấm chia sẻ live cho bạn bè, người thân cùng nghe nhé. ${this.pickWish(recentNames.length > 1 ? 'quý vị' : 'bạn')}`
      );
      return;
    }
    const phrases = [
      'Nam mô A Di Đà Phật. Quý phật tử nhớ bấm chia sẻ live cho bạn bè, người thân cùng vào nghe nhé. Chúc cả nhà phước lộc đầy nhà, vạn sự hanh thông ạ.',
      'Dạ, ai nghe thấy lòng nhẹ nhõm thì chia sẻ live này cho người thương cùng nghe với ạ. Chúc quý vị phước lộc đầy nhà, vạn sự hanh thông.',
      'A Di Đà Phật. Thêm một người cùng nghe là thêm một phần an lành. Quý vị bấm chia sẻ giúp kênh nhé, chúc phước lộc đầy nhà, vạn sự hanh thông ạ.',
    ];
    this.speakPreferredBuddhistVoice(phrases[this.shareReminderIndex++ % phrases.length]);
  }
}

export const soundEngine = new SoundEngine();

// When the code reloads while the app is open (dev server), silence the old engine so music doesn't stack
import.meta.hot?.dispose(() => soundEngine.dispose());
