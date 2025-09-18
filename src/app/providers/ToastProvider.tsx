import { useState, useCallback, type ReactNode } from "react";
import { ToastCtx, type ToastFn } from "../contexts/toast-context";

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<{ id: number; text: string }[]>([]);

  const push = useCallback<ToastFn>((text) => {
    const id = (Math.random() * 1e9) | 0;
    setList((l) => [...l, { id, text }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 2500);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: "fixed", right: 16, bottom: 16, display: "grid", gap: 8, zIndex: 9999 }}>
        {list.map((t) => (
          <div key={t.id} style={{ background: "#222", color: "#fff", padding: "10px 12px", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,.25)" }}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
