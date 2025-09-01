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

export type DayRow = { id: string; minutes: number };  // id = "YYYY-MM-DD"

function isConsecutive(prev: string, cur: string) {
    const p = new Date(prev);
    const c = new Date(cur);
    const ONE = 24*60* 60*1000;
    return (c.getTime() - p.getTime()) === ONE;
}

// 現在の連続日数（末尾からさかのぼる）
export function currentStreak(rows: DayRow[]): number {
    if(!rows.length) return 0;
    let streak = 0;
    for(let i = rows.length - 1; i >= 0; i--) {
        if(rows[i].minutes > 0) {
            // 直前要素と日付が連続しているか（末尾はOK）
            if(i === rows.length - 1) { streak++; continue; }
            const prev = rows[i].id;
            const next = rows[i+1].id;
            
            if(isConsecutive(prev, next)) streak++; else break;
        }else break;
    }
    return streak;
}

// 最長連続日数（全体）
export function longestStreak(rows: DayRow[]): number {
    let best = 0;
    let cur = 0;
    
    for(let i = 0; i < rows.length; i++) {
        if(rows[i].minutes > 0) {
            if(i > 0 && isConsecutive(rows[i-1].id, rows[i].id)) cur++;
            else cur = 1;
            best = Math.max(best, cur);
        }
        else {
            cur = 0;
        }
    }

    return best;
}

export function sumMinutes(rows: DayRow[]) {
    return rows.reduce((a, r) => a + (r.minutes || 0), 0);
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
