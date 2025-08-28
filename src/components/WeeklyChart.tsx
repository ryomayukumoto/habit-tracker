import { useEffect, useMemo, useState } from "react"
import { collection,  onSnapshot, type DocumentData } from "firebase/firestore"
import type { User } from "firebase/auth"
import { db } from "../lib/firebase"
import { Bar } from "react-chartjs-2"
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js"
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

type Row = { id: string; minutes: number }

// ローカルタイムの YYYY-MM-DD を作るヘルパー（UTCズレ防止）
function ymdLocal(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function WeeklyChart({ user }: { user: User }) {
  const [logs, setLogs] = useState<Row[]>([])

  useEffect(() => {
    const col = collection(db, "habits", user.uid, "logs")

    // リアルタイム購読（サーバーソートなし）
    const unsub = onSnapshot(col, (snap) => {
      const data: Row[] = snap.docs.map((d) => {
        const v: DocumentData = d.data()
        // minutesを確実に数値化。日付キーはdoc.idを使用（"YYYY-MM-DD"）
        const minutes = typeof v.minutes === "number" ? v.minutes : Number(v.minutes) || 0
        return { id: d.id, minutes }
      })
      // クライアント側で昇順ソート（idは YYYY-MM-DD なので文字列比較でOK）
      data.sort((a, b) => a.id.localeCompare(b.id))
      setLogs(data)
    })

    return () => unsub()
  }, [user.uid])

  // 直近14日分にマッピング
  const { labels, values } = useMemo(() => {
    const days: string[] = []
    const today = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      days.push(ymdLocal(d)) // ローカル日付でキー作成
    }

    const map = new Map(logs.map((r) => [r.id, r.minutes]))
    const labels = days.map((d) => d.slice(5).replace("-", "/"))
    const values = days.map((d) => map.get(d) ?? 0)

    // デバッグしたいときは下のコメントを外す
    // console.log("[chart] days=", days)
    // console.log("[chart] keys=", Array.from(map.keys()))
    // console.log("[chart] values=", values)

    return { labels, values }
  }, [logs])

  return (
    <div style={{ maxWidth: 720, height: 320 }}>
      <Bar data={{ labels, datasets: [{ label: "直近2週間の学習時間(分)", data: values }] }} />
    </div>
  )
}
