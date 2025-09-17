// UI用の購読フック（App型だけ返す）
// src/app/hooks/useHabitLogs.ts
import { useEffect, useState } from "react";
import { type HabitLog } from "../../domain/habitLog";
import { habitLogsRepo } from "../../infra/firesrtore/habitLogsRepo";

export function useHabitLogs(uid: string) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  useEffect(() => {
    if (!uid) return;
    const unsub = habitLogsRepo.subscribe(uid, (rows) => setLogs(rows));
    return () => unsub();
  }, [uid]);
  return logs;
}
