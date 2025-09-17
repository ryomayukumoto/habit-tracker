// App型（Date）と純粋ロジック
export type HabitLog = {
    id: string;     // = date
    date: string;   // "YYYY-MM-DD"
    value: number;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

// 連続日数（今日からさかのぼる）
export function calcStreak(dates: string[], todayISO?: string): number {
    const set = new Set(dates);

    let d = todayISO ?? new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    let s = 0;
    while (set.has(d)) {
        s++;
        const dt = new Date(d);
        dt.setDate(dt.getDate() - 1);
        d = dt.toISOString().slice(0, 10);
    }

    return s;
}