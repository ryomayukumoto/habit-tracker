import { useState } from "react";
import type { User } from "firebase/auth";
import { doc, updateDoc, deleteDoc, serverTimestamp, deleteField } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useToast } from "../app/hooks/useToast";

import { useHabitLogs } from "../app/hooks/useHabitLogs";
import type { HabitLog } from "../domain/habitLog";

export default function LogsTable({ user }: { user: User }) {
  const logs = useHabitLogs(user.uid);
  const toast = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ value: number; note: string }>({ value: 0, note: "" });

  const startEdit = (row: HabitLog) => {
    setEditingId(row.id);
    setDraft({ value: row.value, note: row.note ?? "" });
  };
  const cancel = () => setEditingId(null);

  const save = async (id: string) => {
    if (!Number.isFinite(draft.value) || draft.value < 0) {
      toast("値は0以上の数値で入力してください");
      return;
    }
    const ref = doc(db, "habits", user.uid, "logs", id);

    // 空なら note フィールドを削除、値があれば更新
    const notePatch =
      draft.note.trim() === "" ? { note: deleteField() } : { note: draft.note.trim().slice(0, 500) };

    await updateDoc(ref, {
      value: Math.floor(draft.value),
      ...notePatch,
      updatedAt: serverTimestamp(), // 端末時刻ではなくサーバ時刻
    });

    setEditingId(null);
  };

  const remove = async (id: string) => {
    if (!confirm(`${id} の記録を削除しますか？`)) return;
    await deleteDoc(doc(db, "habits", user.uid, "logs", id));
  };

  if (!logs.length) return <p>まだ記録がありません。</p>;

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
          {logs.map((row) => {
            const isEdit = editingId === row.id;
            return (
              <tr key={row.id}>
                <td style={td}>{row.id}</td>

                <td style={td}>
                  {isEdit ? (
                    <input
                      type="number"
                      min={0}
                      value={draft.value}
                      onChange={(e) => setDraft((d) => ({ ...d, value: Number(e.target.value) }))}
                      style={{ width: 120 }}
                    />
                  ) : (
                    row.value
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
                    row.note ?? ""
                  )}
                </td>

                <td style={td}>
                  {isEdit ? (
                    <>
                      <button onClick={() => save(row.id)}>保存</button>
                      <button onClick={cancel} style={{ marginLeft: 8 }}>
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(row)}>編集</button>
                      <button onClick={() => remove(row.id)} style={{ marginLeft: 8 }}>
                        削除
                      </button>
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
