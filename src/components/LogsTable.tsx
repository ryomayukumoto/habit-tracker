// src/components/LogsTable.tsx
import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '../lib/firebase'
import type { HabitLog } from '../types/habit'

export default function LogsTable({ user }: { user: User }) {
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const col = collection(db, 'habits', user.uid, 'logs')
    // YYYY-MM-DD 文字列なので orderBy("date") で時系列ソート可
    const q = query(col, orderBy('date', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => d.data() as HabitLog)
      setLogs(data)
      setLoading(false)
    });
    return () => unsub()
  }, [user.uid])

  const remove = async (date: string) => {
    if (!confirm(`${date} の記録を削除しますか？`)) return
    await deleteDoc(doc(db, 'habits', user.uid, 'logs', date))
  }

  if (loading) return <p>Loading...</p>
  if (!logs.length) return <p>まだ記録がありません。フォームから保存してみてください。</p>

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: 480 }}>
        <thead>
          <tr>
            <th style={th}>日付</th>
            <th style={th}>学習時間(分)</th>
            <th style={th}>メモ</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.date}>
              <td style={td}>{l.date}</td>
              <td style={td}>{l.minutes}</td>
              <td style={td}>{l.note ?? ''}</td>
              <td style={td}>
                <button onClick={() => remove(l.date)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const th: React.CSSProperties = { borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }
const td: React.CSSProperties = { borderBottom: '1px solid #eee', padding: 8 }
