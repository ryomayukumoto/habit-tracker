import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { type User } from "firebase/auth";
import { db } from "../lib/firebase";
import type { HabitLog } from "../types/habit";

export default function AddLogForm({ user }: { user: User }) {
    const today = new Date().toISOString().slice(0, 10);    // "YYYY-MM-DD"
    const [date, setDate] = useState(today);
    const [minutes, setMinutes] = useState<number>(60);
    const [note, setNote] = useState("");

    const save = async() => {
        if(!date) return alert("日付を入力してください");
        if(Number.isNaN(minutes) || minutes < 0) return alert("分は0以上の数値で入力してくください");

        const data: HabitLog = {
            date,
            minutes: Math.floor(minutes),
            note: note.trim() || undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }

        // ドキュメントIDに日付を使う: habits/{uid}/logs/{YYYY-MM-DD}
        const ref= doc(db, "habits", user.uid, "logs", date);
        try {
            await setDoc(ref, data, { merge: true }); // 同じ日付を入力
            alert("保存しました");
        }
        catch(e) {
            console.log(e);
            alert("保存に失敗しました...コンソールを確認してください");
        }
    }

    return (
        <div style={{ display: "grid", gap: 8, maxWidth: 380 }}>
            <label>
                日付
                <input type="date" value={date} onChange={ e => setDate(e.target.value) } />
            </label>

            <label>
                学習時間（分）
                <input type="number" min={0} value={minutes} onChange={e => setMinutes(Number(e.target.value))} />
            </label>

            <label>
                メモ
                <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="例：react入門 60分" />
            </label>

            <button onClick={save}>保存</button>
        </div>
    )
}