import { useMemo } from "react";
import type { User } from "firebase/auth";
import { useHabitLogs } from "../app/hooks/useHabitLogs"; // ← ここを差し替え
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function WeeklyChart({ user }: { user: User }) {
  const logs = useHabitLogs(user.uid); // HabitLog[]: { id, date, value, note?, createdAt: Date, ... }

  const { labels, values } = useMemo(() => {
    // logs → Map("YYYY-MM-DD" -> value)
    const map = new Map<string, number>();
    for (const l of logs) map.set(l.date, l.value);

    // 直近14日を過去→今日の順でゼロ埋め
    const today = new Date();
    const ids: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      ids.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
    }

    const labels = ids.map((id) => id.slice(5).replace("-", "/")); // MM/DD
    const values = ids.map((id) => map.get(id) ?? 0);              // ← minutesではなくvalue

    return { labels, values };
  }, [logs]);

  return (
    <div style={{ maxWidth: 720, height: 320 }}>
      <Bar
        data={{ labels, datasets: [{ label: "直近2週間の学習時間(分)", data: values }] }}
        options={{
          responsive: true,
          maintainAspectRatio: false, // 親のheightを使う
          scales: { y: { beginAtZero: true } },
        }}
      />
    </div>
  );
}
