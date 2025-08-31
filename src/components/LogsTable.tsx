import { useState } from "react";
import type { User } from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUserLogs } from "../hooks/useUserLogs";
import type { HabitLog } from "../types/habit";

export default function LogsTable({ user }: { user: User }) {
  const { rows } = useUserLogs(user.uid);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ minutes: number; note: string }>({ minutes: 0, note: "" });

  const startEdit = (id: string, data: HabitLog) => {
    setEditingId(id);
    setDraft({ minutes: data.minutes, note: data.note ?? "" });
  };
  const cancel = () => setEditingId(null);

  const save = async (id: string) => {
    if (!Number.isFinite(draft.minutes) || draft.minutes < 0) {
      alert("分は0以上の数値で入力してください");
      return;
    }
    const ref = doc(db, "habits", user.uid, "logs", id);
    const payload: Partial<HabitLog> = {
      minutes: Math.floor(draft.minutes),
      updatedAt: Date.now(),
    };
    if (draft.note.trim()) payload.note = draft.note.trim();
    else payload.note = null as unknown as string; // ← noteを空にしたい場合は null を入れて上書き

    await updateDoc(ref, payload as HabitLog);
    setEditingId(null);
  };

  const remove = async (id: string) => {
    if (!confirm(`${id} の記録を削除しますか？`)) return;
    await deleteDoc(doc(db, "habits", user.uid, "logs", id));
  };

  if (!rows.length) return <p>まだ記録がありません。</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", minWidth: 560 }}>
        <thead>
          <tr>
            <th style={th}>日付</th>
            <th style={th}>学習時間(分)</th>
            <th style={th}>メモ</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ id, data }) => {
            const isEdit = editingId === id;
            return (
              <tr key={id}>
                <td style={td}>{id}</td>

                <td style={td}>
                  {isEdit ? (
                    <input
                      type="number"
                      min={0}
                      value={draft.minutes}
                      onChange={(e) => setDraft((d) => ({ ...d, minutes: Number(e.target.value) }))}
                      style={{ width: 120 }}
                    />
                  ) : (
                    data.minutes
                  )}
                </td>

                <td style={td}>
                  {isEdit ? (
                    <input
                      value={draft.note}
                      onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                      style={{ width: 260 }}
                      placeholder="任意"
                    />
                  ) : (
                    data.note ?? ""
                  )}
                </td>

                <td style={td}>
                  {isEdit ? (
                    <>
                      <button onClick={() => save(id)}>保存</button>
                      <button onClick={cancel} style={{ marginLeft: 8 }}>キャンセル</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(id, data)}>編集</button>
                      <button onClick={() => remove(id)} style={{ marginLeft: 8 }}>削除</button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = { borderBottom: "1px solid #ddd", textAlign: "left", padding: 8 };
const td: React.CSSProperties = { borderBottom: "1px solid #eee", padding: 8 };
