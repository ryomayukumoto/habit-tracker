import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { getApp } from "firebase/app";
import { db } from "../lib/firebase";
import {
  collection, doc, setDoc, getDoc, getDocs, query, orderBy
} from "firebase/firestore";

export default function DebugPanel({ user }: { user: User }) {
  const [list, setList] = useState<string[]>([]);
  const projectId = getApp().options.projectId as string;
  const basePath = `habits/${user.uid}/logs`;

  // ① その場で1件テスト保存（今日ではなく固定キー）
  const writeTest = async () => {
    const ref = doc(db, "habits", user.uid, "logs", "2000-01-01");
    await setDoc(ref, {
      date: "2000-01-01", minutes: 60, note: "debug", createdAt: Date.now(), updatedAt: Date.now()
    }, { merge: true });
    alert("writeTest: 2000-01-01 を保存しました");
  };

  // ② ピンポイントでそのドキュメントが存在するか
  const readOne = async () => {
    const ref = doc(db, "habits", user.uid, "logs", "2025-08-27");
    const snap = await getDoc(ref);
    console.log("[readOne] exists =", snap.exists(), "data =", snap.data());
    alert(`readOne: exists=${snap.exists()}`);
  };

  // ③ コレクション全件を取得（onSnapshotに依存しない）
  const readAll = async () => {
    const col = collection(db, "habits", user.uid, "logs");
    const q = query(col, orderBy("date", "desc"));
    const snaps = await getDocs(q);
    const ids = snaps.docs.map(d => d.id);
    console.log("[readOne] uid=", user.uid, "date=2000-01-01")
    setList(ids);
  };

//   const writeToday = async () => {
//   const today = new Date();
//   const y = today.getFullYear();
//   const m = String(today.getMonth()+1).padStart(2,'0');
//   const d = String(today.getDate()).padStart(2,'0');
//   const id = `${y}-${m}-${d}`;
//   const ref = doc(db, "habits", user.uid, "logs", id);
//   await setDoc(ref, {
//     date: id, minutes: 60, note: "today-debug",
//     createdAt: Date.now(), updatedAt: Date.now()
//   }, { merge: true });
//   alert(`writeToday: ${id} を保存しました`);
// };

// DebugPanel.tsx 内に関数を追加
const writeToday = async () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const id = `${y}-${m}-${d}`;

  const ref = doc(db, "habits", user.uid, "logs", id);
  await setDoc(ref, {
    date: id,
    minutes: 60,
    note: "today-debug",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }, { merge: true });

  alert(`writeToday: ${id} を保存しました`);
};

  useEffect(() => {
    console.log("[debug] projectId =", projectId);
    console.log("[debug] uid       =", user.uid);
    console.log("[debug] basePath  =", basePath);
  }, [projectId, user.uid]);

  return (
    <div style={{marginTop:12, padding:12, border:"1px dashed #ccc", borderRadius:8}}>
      <strong>Debug Panel</strong>
      <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:8}}>
        <button onClick={writeTest}>① writeTest(2000-01-01)</button>
        <button onClick={readOne}>② readOne(2025-08-27)</button>
        <button onClick={readAll}>③ readAll(list)</button>
        <button onClick={writeToday}>①-2 writeToday(今日60分)</button>
      </div>
      <div style={{marginTop:8, fontSize:12, opacity:.8}}>
        <div>projectId: {projectId}</div>
        <div>uid: {user.uid}</div>
        <div>path: {basePath}</div>
      </div>
      <ul style={{marginTop:8}}>
        {list.map(id => <li key={id}>{id}</li>)}
      </ul>
    </div>
  );
}
