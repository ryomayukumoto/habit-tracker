// WeeklyChart.tsx をこの形で一旦置き換え（onSnapshot→getDocs。まず取れるか検証）
import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '../lib/firebase'
import dayjs from 'dayjs'
import { Bar } from 'react-chartjs-2'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

type HabitLog = { date?: string; minutes?: number }

export default function WeeklyChart({ user }: { user: User }) {
  const [logs, setLogs] = useState<Array<{ id: string; minutes: number }>>([])

  useEffect(() => {
      
      (async () => {
          const col = collection(db, 'habits', user.uid, 'logs')
          // orderBy('date') を使わず、まずは存在確認を優先（必要なら id 降順に並べ替え）
            // const q = query(col, orderBy('__name__', 'desc'))
            // const snap = await getDocs(q)
          const snap = await getDocs(col)
          const data = snap.docs.map(d => {
              const v = d.data() as HabitLog
              const id = d.id // "YYYY-MM-DD"（保存時のドキュメントID）
        const minutes = typeof v.minutes === 'number' ? v.minutes : Number(v.minutes) || 0
        return { id, minutes }
    })
    data.sort((a, b) => (a.id < b.id ? 1 : -1))
    setLogs(data)
    })()
  }, [user.uid])

  // 直近14日を "YYYY-MM-DD" で作成
  const { labels, values } = useMemo(() => {
    const days: string[] = []
    for (let i = 13; i >= 0; i--) {
      const dt = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
      days.push(dt)
    }
    const map = new Map<string, number>()
    logs.forEach(({ id, minutes }) => {
      // date フィールドがなくても、doc.id を日付として使う
      const norm = id
      map.set(norm, minutes)
    })
    const labels = days.map(d => dayjs(d).format('MM/DD'))
    const values = days.map(d => map.get(d) ?? 0)
    console.log('[chart] days=', days)
    console.log('[chart] map keys=', Array.from(map.keys()))
    console.log('[chart] values=', values)
    return { labels, values }
  }, [logs])

  return (
    <div style={{ maxWidth: 720, height: 320 }}>
      <Bar data={{ labels, datasets: [{ label: '直近2週間の学習時間(分)', data: values }] }} />
    </div>
  )
}
