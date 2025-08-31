import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { habitLogConverter } from "../lib/converters";
import type { HabitLog } from "../types/habit";

export type Row = { id: string; data: HabitLog };

export function useUserLogs(uid: string) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const col = collection(db, "habits", uid, "logs").withConverter(habitLogConverter);
    const unsub = onSnapshot(col, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
      // YYYY-MM-DD の文字列で昇順
      list.sort((a, b) => a.id.localeCompare(b.id));
      setRows(list);
    });
    return () => unsub();
  }, [uid]);

  // 直近14日ぶんを抽出（表示・集計用）
  const last14 = useMemo(() => {
    const today = new Date();
    const ids = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - i));
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    });
    const map = new Map(rows.map((r) => [r.id, r.data]));
    return { ids, map };
  }, [rows]);

  return { rows, last14 };
}
