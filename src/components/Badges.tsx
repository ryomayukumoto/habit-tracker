// Badges.tsx
import { useRef, useEffect } from "react";
import type { User } from "firebase/auth";
import { useAchivements } from "../hooks/useAchivements";

// セッション中に表示したバッジIDを記録（StrictModeの再実行でも二重表示しない）
const sessionShown = new Set<string>();

export default function Badges({ user }: { user: User }) {
  const { allWithLock, newly, markSeen } = useAchivements(user);
  const pendingIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!newly.length) return;

    // 既にこのセッションで表示済みのものは除外
    const toShow = newly.filter(b => !sessionShown.has(b.id));
    if (toShow.length === 0) return;

    // セッション表示済みにマーク（StrictModeの二重実行対策）
    toShow.forEach(b => sessionShown.add(b.id));

    // ここで初めて通知（アラート／トースト）
    alert(`バッジ獲得！\n${toShow.map(n => `${n.icon} ${n.title}`).join("\n")}`);

    // 永続側にも既読反映（ローカルストレージ）
    pendingIdsRef.current = toShow.map(b => b.id);
    markSeen(pendingIdsRef.current);
  }, [newly, markSeen]);

  return (
    <div style={card}>
      <h2>バッジ</h2>
      <div style={grid}>
        {allWithLock.map(b => (
          <div key={b.id} style={{ ...tile, opacity: b.unlocked ? 1 : 0.35 }}>
            <div style={{ fontSize: 28 }}>{b.icon}</div>
            <div style={{ fontWeight: 700 }}>{b.title}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{b.description}</div>
            {!b.unlocked && <div style={lock}>LOCKED</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

const card: React.CSSProperties  = { padding: 16, border: "1px solid #ddd", borderRadius: 8 };
const grid: React.CSSProperties  = { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" };
const tile: React.CSSProperties  = { padding: 12, border: "1px solid #eee", borderRadius: 10, position: "relative", background: "#fff" };
const lock: React.CSSProperties  = { position: "absolute", right: 8, top: 8, fontSize: 10, padding: "2px 6px", border: "1px solid #ccc", borderRadius: 999 };
