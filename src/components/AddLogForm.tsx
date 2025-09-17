// いまの AddLogForm を置き換え or 修正
import { useCallback, useMemo, useState } from "react";
import { type User } from "firebase/auth";
import dayjs from "dayjs";
import { habitLogsRepo } from "../infra/firesrtore/habitLogsRepo";

export default function AddLogForm({ user }: { user: User }) {
  const today = useMemo(() => dayjs().format("YYYY-MM-DD"), []);
  const [date, setDate] = useState(today);
  const [minutes, setMinutes] = useState<number>(60);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const save = useCallback(async () => {
    if (loading) return;
    if (!date) return alert("日付を入力してください");
    const n = Number(minutes);
    if (!Number.isFinite(n) || n < 0) return alert("分は0以上の数値で入力してください");

    try {
      setLoading(true);
      await habitLogsRepo.save(user.uid, { date, value: Math.floor(n), note });
      alert("保存しました");
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました...コンソールを確認してください");
    } finally {
      setLoading(false);
    }
  }, [loading, date, minutes, note, user.uid]);

  return (
    <div style={{ display: "grid", gap: 8, maxWidth: 380 }}>
      <label>
        日付
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label>
        学習時間（分）
        <input type="number" min={0} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
      </label>
      <label>
        メモ
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="例：React入門 60分" />
      </label>
      <button onClick={save} disabled={loading}>{loading ? "保存中..." : "保存"}</button>
    </div>
  );
}
