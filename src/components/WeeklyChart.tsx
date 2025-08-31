import { useMemo } from "react";
import type { User } from "firebase/auth";
import { useUserLogs } from "../hooks/useUserLogs";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function WeeklyChart({ user }: { user: User }) {
  const { last14 } = useUserLogs(user.uid);

  const { labels, values } = useMemo(() => {
    const labels = last14.ids.map((id) => id.slice(5).replace("-", "/"));
    const values = last14.ids.map((id) => last14.map.get(id)?.minutes ?? 0);
    return { labels, values };
  }, [last14]);

  return (
    <div style={{ maxWidth: 720, height: 320 }}>
      <Bar data={{ labels, datasets: [{ label: "直近2週間の学習時間(分)", data: values }] }} />
    </div>
  );
}
