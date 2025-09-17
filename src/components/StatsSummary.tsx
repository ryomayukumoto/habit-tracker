import type { User } from "firebase/auth";
import { useHabitLogs } from "../app/hooks/useHabitLogs";
import type React from "react";

export default function StatsSummary ({ user }: { user: User }) {
    const logs = useHabitLogs(user.uid);

    // 直近14日をゼロ埋め（valueを使用）
    const ids = (() => {
        const out: string[] = [];
        const base = new Date();
        for (let i = 13; i >= 0; i--) {
        const d = new Date(base); d.setDate(base.getDate() - i);
        const tz = d.getTimezoneOffset(); const local = new Date(d.getTime() - tz*60000);
        out.push(local.toISOString().slice(0,10)); // YYYY-MM-DD（ローカル基準）
        }
        return out;
    })();
    const map = new Map(logs.map(l => [l.date, l.value]));
    const values = ids.map(id => map.get(id) ?? 0);

    const total = values.reduce((a, b) => a + b, 0);
    const avg = Math.round((total / values.length) * 10) / 10;

    let streak = 0;
    for (let i = values.length - 1; i >= 0; i--) {
        if (values[i] > 0) streak++;
        else break;
    }

    return (
        <div style={card}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <Metric label="合計（分）" value={total} />
                <Metric label="平均（分/日）" value={avg} />
                <Metric label="連続日数" value={streak} />
            </div>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div style={{ minWidth: 140 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
        </div>
    )
}

const card: React.CSSProperties = { padding: 16, border: "1px solid #ddd", borderRadius: 8 };