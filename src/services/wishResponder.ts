/**
 * Spots a prayer/wish in a viewer comment ("con mong tuần sau thi được 10 điểm")
 * and picks a blessing written for that topic. The comment itself is never read aloud,
 * so trolls can't make the voice say what they typed.
 */

export type WishTopic = 'exam' | 'health' | 'wealth' | 'love' | 'family' | 'work' | 'peace';

// Lowercase, no Vietnamese accents, single spaces: "Cầu Bình An" -> "cau binh an"
export const plain = (text: string) =>
  ` ${text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;

// Words that show the comment is asking for something
const WISH_WORDS = [' mong ', ' cau ', ' xin ', ' nguyen ', ' phu ho ', ' uoc ', ' muon ', ' gia ho ', ' phu ho do '];

// Checked in order; first topic with a match wins
const TOPICS: Array<[WishTopic, string[]]> = [
  ['exam', [' thi ', ' diem ', ' dau dai hoc ', ' do dai hoc ', ' tot nghiep ', ' kiem tra ', ' hoc gioi ', ' hoc tot ', ' ielts ', ' bang lai ']],
  ['health', [' suc khoe ', ' khoe ', ' khoe manh ', ' khoi benh ', ' benh ', ' om ', ' phau thuat ', ' mo ', ' nam vien ', ' het dau ', ' binh phuc ']],
  ['love', [' nguoi yeu ', ' tinh duyen ', ' ny ', ' crush ', ' lay chong ', ' lay vo ', ' cuoi ', ' quay lai ', ' nguoi thuong ', ' duyen ']],
  ['family', [' gia dinh ', ' gia dao ', ' con cai ', ' bo me ', ' cha me ', ' em be ', ' sinh con ', ' mang thai ', ' co con ', ' vo chong ']],
  ['work', [' viec ', ' phong van ', ' thang chuc ', ' tang luong ', ' di lam ']],
  ['wealth', [' tien ', ' tai loc ', ' lam an ', ' buon ban ', ' kinh doanh ', ' giau ', ' tra no ', ' het no ', ' trung so ', ' tai chinh ', ' ban hang ', ' don hang ']],
  ['peace', [' binh an ', ' an lanh ', ' tai qua ', ' qua nan ', ' het xui ', ' giai han ', ' thuan loi ', ' may man ']],
];

export function detectWish(comment: string): WishTopic | null {
  const t = plain(comment);
  if (!WISH_WORDS.some((w) => t.includes(w))) return null;
  for (const [topic, words] of TOPICS) {
    if (words.some((w) => t.includes(w))) return topic;
  }
  return null;
}

// "{name}" is filled with the spoken name, "{channel}" with the channel name
const BLESSINGS: Record<WishTopic, string[]> = {
  exam: [
    'Dạ, {channel} nghe bạn {name} nhắc chuyện thi cử. Chúc bạn ôn bài suôn sẻ, vào phòng thi thật bình tĩnh, đạt điểm cao như mong muốn ạ.',
    'A Di Đà Phật, chúc bạn {name} học đâu nhớ đó, thi cử đỗ đạt, kết quả làm cả nhà vui lòng ạ.',
  ],
  health: [
    'Dạ, chúc bạn {name} và người thân sớm khỏe mạnh, ăn ngon ngủ yên ạ.',
    'A Di Đà Phật, chúc nhà bạn {name} ai cũng mạnh khỏe, người đang mệt sớm bình phục ạ.',
  ],
  love: [
    'Dạ, chúc bạn {name} sớm gặp được người thương hết lòng, duyên lành bền lâu ạ.',
    'A Di Đà Phật, chúc bạn {name} chuyện tình cảm êm đẹp, thương ai thì người ấy cũng thương mình ạ.',
  ],
  family: [
    'Dạ, chúc gia đình bạn {name} trên thuận dưới hòa, cha mẹ khỏe mạnh, con cháu ngoan hiền ạ.',
    'A Di Đà Phật, chúc nhà bạn {name} luôn êm ấm, mọi người thương yêu nhau ạ.',
  ],
  work: [
    'Dạ, chúc bạn {name} công việc hanh thông, gặp sếp tốt đồng nghiệp hiền, sớm được như ý ạ.',
    'A Di Đà Phật, chúc bạn {name} tìm được việc ưng ý, làm đâu thuận đó ạ.',
  ],
  wealth: [
    'Dạ, chúc bạn {name} làm ăn phát đạt, buôn may bán đắt, tiền vào đều tay ạ.',
    'A Di Đà Phật, chúc bạn {name} tài lộc dồi dào, nợ nần sớm xong, của cải đủ đầy ạ.',
  ],
  peace: [
    'Dạ, chúc bạn {name} mọi việc bình an, thuận lợi ạ.',
    'A Di Đà Phật, chúc bạn {name} gặp nhiều may mắn, đi đâu cũng được che chở bình an ạ.',
  ],
};

export function blessingFor(topic: WishTopic, spokenName: string, channelName = 'Tâm Tịnh Tâm An'): string {
  const options = BLESSINGS[topic];
  return options[Math.floor(Math.random() * options.length)].replace('{name}', spokenName).replace('{channel}', channelName);
}

// One answered wish per person every 10 minutes, and at most one every 20 seconds overall
const PER_USER_MS = 10 * 60 * 1000;
const GLOBAL_MS = 20 * 1000;
const lastByUser = new Map<string, number>();
let lastAny = 0;

export function shouldAnswer(username: string, now = Date.now()): boolean {
  const key = username.toLowerCase();
  if (now - lastAny < GLOBAL_MS) return false;
  if (now - (lastByUser.get(key) ?? 0) < PER_USER_MS) return false;
  lastAny = now;
  lastByUser.set(key, now);
  return true;
}
