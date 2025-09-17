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

function isConsecutive(a: string, b: string) {
   const ad = new Date(a); const bd = new Date(b);
   const x = new Date(ad); x.setDate(ad.getDate() + 1);
   return x.getFullYear() === bd.getFullYear() && x.getMonth() === bd.getMonth() && x.getDate() === bd.getDate();
 }

// 現在の連続日数（末尾からさかのぼる）
export function currentStreak(rows: DayRow[]): number {
    let s = 0;
    for(let i = rows.length - 1; i >= 0; i--) {
        if (rows[i].value > 0) s++;
        else break;
    }
    return s;
}

// 最長連続日数（全体）
export function longestStreak(rows: DayRow[]): number {
    let best = 0, cur = 0;
    for(let i = 0; i < rows.length; i++) {

    if (rows[i].value > 0) {
        if(i > 0 && isConsecutive(rows[i-1].id, rows[i].id)) cur++;
        else cur = 1;
        best = Math.max(best, cur);
        } else {
        cur = 0;
        }
    }
    return best;
}

export function sumMinutes(rows: DayRow[]) {
    return rows.reduce((a, r) => a + (r.value || 0), 0);
}

export function last7Minutes(rows: DayRow[]): number {
    const last7 = rows.slice(-7);
    return sumMinutes(last7);
}

// rows は id昇順（"YYYY-MM-DD"）前提
export function evaluateBadges(rows: DayRow[]): EarnedBadge[] {
    const earned: EarnedBadge[] = [];
    const now = Date.now();
    const total = sumMinutes(rows);
    const curStreak = currentStreak(rows);
    const maxStreak = longestStreak(rows);
    const w7 = last7Minutes(rows);

    const add = (id: string) => {
        const def = BADGE_DEFS.find(b => b.id === id);
        if(def) earned.push({ ...def, earnedAt: now });
    };

    if(rows.length > 0) add("first_log");
    if(curStreak >= 3 || maxStreak >= 3) add("streak_3");
    if(curStreak >= 7 || maxStreak >= 7) add("streak_7");
    if(curStreak >= 14 || maxStreak >= 14) add("streak_14");
    if(total >= 300) add("minutes_300");
    if(total >= 1000) add("minutes_1000");
    if(w7 >= 300) add("weekly_300");

    return earned;
}

// ローカルの YYYY-MM-DD を生成（UTCズレ防止）
function localISO(date = new Date()): string {
    const tz = date.getTimezoneOffset();
    const d = new Date(date.getTime() - tz * 60000);
    return d.toISOString().slice(0, 10);
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