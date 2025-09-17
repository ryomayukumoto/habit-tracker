// App型（Date）と純粋ロジック
export type HabitLog = {
    id: string;     // = date
    date: string;   // "YYYY-MM-DD"
    value: number;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

function localISO(date = new Date()): string {
  const tz = date.getTimezoneOffset();
  const d = new Date(date.getTime() - tz * 60000);
  return d.toISOString().slice(0, 10);
}

export function calcStreak(dates: string[], todayISO?: string): number {
    const set = new Set(dates);
    let d = todayISO ?? localISO();
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