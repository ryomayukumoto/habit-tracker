import type { User } from "firebase/auth";
import { useUserLogs } from "../app/hooks/useUserLogs";
import type React from "react";

export default function StatsSummary ({ user }: { user: User }) {
    const { last14 } = useUserLogs(user.uid);

    // 合計・平均・連続日数（minutes>0を記録とみなす）
    const values = last14.ids.map((id) => last14.map.get(id)?.minutes ?? 0);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = Math.round((total / values.length) * 10) / 10;

    let streak = 0;
    for (let i = values.length - 1; i >= 0; i--) {
        if(values[i] > 0) streak++;
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