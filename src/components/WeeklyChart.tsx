import { useMemo } from "react";
import type { User } from "firebase/auth";
import { useHabitLogs } from "../app/hooks/useHabitLogs";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function WeeklyChart({ user }: { user: User }) {
  const logs = useHabitLogs(user.uid); // HabitLog[]: { id, date, value, note?, createdAt: Date, ... }

  const { labels, values, barColors } = useMemo(() => {
    // logs → Map("YYYY-MM-DD" -> value)
    const map = new Map<string, number>();
    for (const l of logs) map.set(l.date, l.value);

    const localISO = (date = new Date()) => {
        const tz = date.getTimezoneOffset();
        const dd = new Date(date.getTime() - tz * 60000);
        return dd.toISOString().slice(0, 10);
     };
     const ids: string[] = [];
     const base = new Date();
     for (let i = 13; i >= 0; i--) {
        const d = new Date(base);
        d.setDate(base.getDate() - i);
        ids.push(localISO(d));
     }

    const labels = ids.map((id) => id.slice(5).replace("-", "/")); // MM/DD
    const values = ids.map((id) => map.get(id) ?? 0);
    const todayIndex = values.length - 1;
    const barColors = values.map((_, i) => 
    i === todayIndex ? "lightgreen" : "rgba(205, 230, 199)")

    return { labels, values, barColors};
  }, [logs]);

  return (
    <div style={{ maxWidth: 720, height: 320 }}>
      <Bar
        data={{ labels, 
          datasets: [{ 
            label: "直近2週間の学習時間(分)", 
            data: values,
            backgroundColor: barColors
          }] 
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false, // 親のheightを使う
          scales: { y: { beginAtZero: true } },
        }}
      />
    </div>
  );
}
