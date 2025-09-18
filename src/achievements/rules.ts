export type Badge = {
    id: string;
    title: string;
    description: string;
    icon: string;   // 絵文字でOK
};

export type EarnedBadge = Badge & { earnedAt: number };

export const BADGE_DEFS: Badge[] = [
  { id: "first_log",  title: "初ログ！",          description: "最初の記録をつけた", icon: "🍼" },
  { id: "streak_3",   title: "3日連続",           description: "3日連続で記録",      icon: "🔥" },
  { id: "streak_7",   title: "1週間連続",         description: "7日連続で記録",      icon: "⚡" },
  { id: "streak_14",  title: "2週間連続",         description: "14日連続で記録",     icon: "🌟" },
  { id: "minutes_300",title: "300分到達",         description: "累計300分学習",      icon: "🎯" },
  { id: "minutes_1000",title:"1000分到達",        description: "累計1000分学習",     icon: "🏆" },
  { id: "weekly_300", title: "週間300分",         description: "直近7日で300分",     icon: "📈" },
];

export type DayRow = { id: string; value: number };     // id = "YYYY-MM-DD"

// ローカル日付ユーティリティ
function parseLocalISO(iso: string): Date {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y,(m ?? 1) - 1, d ?? 1);
}
function localISO(date = new Date()): string {
    const y =date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// 連続日判定もローカル基準
function isConsecutive(a: string, b: string) {
    const ad = parseLocalISO(a);
    const bd = parseLocalISO(b);
    const x = new Date(ad);
    x.setDate(ad.getDate() + 1);
    return x.getFullYear() === bd.getFullYear() &&
    x.getMonth() === bd.getMonth() &&
    x.getDate() === bd.getDate();
}

export function currentStreak(rows: DayRow[], anchorISO = localISO()): number {
  const positive = new Set(rows.filter(r => r.value > 0).map(r => r.id));
  let d = anchorISO, s = 0;
  while (positive.has(d)) {
    s++;
    const dt = parseLocalISO(d);
    dt.setDate(dt.getDate() - 1);
    d = localISO(dt);
  }
  return s;
}

export function longestStreak(rows: DayRow[]): number {
  const sorted = [...rows].sort((a,b)=>a.id.localeCompare(b.id));
  let best = 0, cur = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].value > 0) {
      if (i > 0 && isConsecutive(sorted[i-1].id, sorted[i].id)) cur++;
      else cur = 1;
      best = Math.max(best, cur);
    } else cur = 0;
  }
  return best;
}

export function sumMinutes(rows: DayRow[]) {
    return rows.reduce((a, r) => a + (r.value || 0), 0);
}

// 直近“7日間”の合計（anchorISO を基準に日付窓を作る）
export function last7Minutes(rows: DayRow[], anchorISO = localISO()): number {
  const map = new Map(rows.map(r => [r.id, Math.max(0, Number(r.value) || 0)]));
  let sum = 0;
  const start = parseLocalISO(anchorISO);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    sum += map.get(localISO(d)) ?? 0;
  }
  return sum;
}

// === バッジ評価 ===
export function evaluateBadges(rows: DayRow[]): EarnedBadge[] {
  const sorted = [...rows].sort((a,b)=>a.id.localeCompare(b.id));
  const earned: EarnedBadge[] = [];
  const now = Date.now();
  const total = sumMinutes(sorted);

  // 連続系：最新の記録日で判定（※今日基準にしたいなら latestISO を todayISO に置き換えてOK）
  const latestISO = sorted.at(-1)?.id;
  const curStreak = currentStreak(sorted, latestISO ?? localISO());

  // 週間系：常に“今日”基準（古い記録の追加で発火しない）
  const todayISO = localISO();
  const w7 = last7Minutes(sorted, todayISO);

  const add = (id: string) => {
    const def = BADGE_DEFS.find(b => b.id === id);
    if (def) earned.push({ ...def, earnedAt: now });
  };

  if (sorted.length > 0) add("first_log");
  if (curStreak >= 3)  add("streak_3");
  if (curStreak >= 7)  add("streak_7");
  if (curStreak >= 14) add("streak_14");

  if (total >= 300)    add("minutes_300");
  if (total >= 1000)   add("minutes_1000");
  if (w7 >= 300)       add("weekly_300");

  return earned;
}

export function calcStreak(dates: string[], todayISO?: string): number {
    const set = new Set(dates);
    let d = todayISO ?? localISO(); // ← ローカル基準に
    let s = 0;
    while (set.has(d)) {
        s++;
        const dt = new Date(d);
        dt.setDate(dt.getDate() - 1);
    d = dt.toISOString().slice(0, 10);
    d = localISO(dt);
    }
    return s;
}