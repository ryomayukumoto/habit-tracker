import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { type User } from "firebase/auth";
import { db } from "../lib/firebase";
import type { HabitLog } from "../types/habit";
import dayjs from 'dayjs';


export default function AddLogForm({ user }: { user: User }) {
    const today = dayjs().format('YYYY-MM-DD') // 日本時間でOK    // "YYYY-MM-DD"
    const [date, setDate] = useState(today);
    const [minutes, setMinutes] = useState<number>(60);
    const [note, setNote] = useState("");

    const save = async() => {
        if(!date) return alert("日付を入力してください");
        if(Number.isNaN(minutes) || minutes < 0) return alert("分は0以上の数値で入力してくください");

        const dataBase = {
           date,
           minutes: Math.floor(minutes),
           createdAt: Date.now(),
           updatedAt: Date.now(),
        } as const;

        const data: HabitLog = note.trim()
            ? { ...dataBase, note: note.trim() }
            : { ...dataBase }; // note を付けない

        // ドキュメントIDに日付を使う: habits/{uid}/logs/{YYYY-MM-DD}
        const ref= doc(db, "habits", user.uid, "logs", date);
        try {
            await setDoc(ref, data, { merge: true }); // 同じ日付を入力
            console.log("[save] uid=", user.uid, "date=", date)
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