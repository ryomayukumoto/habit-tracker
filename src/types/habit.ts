export type HabitLog = {
    date?: string;       // "YYYY-MM-DD"
    minutes: number;    // 学習分
    note?: string;      // 任意メモ
    createdAt: number;  // Date.now()
    updatedAt: number;  // Date.now()
}