// Repository実装（入出力の責務をここへ）
// src/infra/firestore/habitLogsRepo.ts
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { type HabitLog } from "../../domain/habitLog";
import { habitLogConverter } from "./converters";

export interface HabitLogsRepo {
  // 一覧（ワンショット）
  list(uid: string): Promise<HabitLog[]>;
  // 購読（リアルタイム）
  subscribe(uid: string, cb: (rows: HabitLog[]) => void): Unsubscribe;
  // 保存（1日1件。DocID=YYYY-MM-DDで完全上書き）
  save(uid: string, log: { date: string; value: number; note?: string }): Promise<void>;
}

export const habitLogsRepo: HabitLogsRepo = {
  async list(uid) {
    const col = collection(db, "habits", uid, "logs").withConverter(habitLogConverter);
    const q = query(col, orderBy("date", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  },

  subscribe(uid, cb) {
    const col = collection(db, "habits", uid, "logs").withConverter(habitLogConverter);
    const q = query(col, orderBy("date", "asc"));
    return onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => d.data());
      cb(rows);
    });
  },

  async save(uid, { date, value, note }) {
    // Converterは使わず、serverTimestamp() をここで付与
    const ref = doc(db, "habits", uid, "logs", date);
    await setDoc(ref, {
      date,
      value: Math.floor(value),
      ...(note?.trim() ? { note: note.trim().slice(0, 500) } : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: false });
  },
};
