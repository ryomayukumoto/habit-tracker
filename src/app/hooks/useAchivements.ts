import { useEffect, useMemo, useRef, useState } from "react";
import { useHabitLogs } from "./useHabitLogs";
import type { User } from "firebase/auth";
import { evaluateBadges, BADGE_DEFS, type EarnedBadge } from "../../achievements/rules";

function storageKey(uid: string) {
    return `habit_badges_seen_${uid}`;
}

export function useAchivements(user: User) {
    const logs = useHabitLogs(user.uid);     // HabitLog[]（id昇順）
    const dayRows = useMemo(
        () => logs.map(l => ({ id: l.id, value: l.value })), // ← value に統一
        [logs]
    );

    const allEarned = useMemo<EarnedBadge[]>(
        () => evaluateBadges(dayRows),
        [dayRows]
    );

    // 既に表示済みのバッジ（ローカル記録）
    const [seen, setSeen] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem(storageKey(user.uid)) || "[]");
        }
        catch {
            return [];
        }
    });

    const seenRef = useRef(seen);
    useEffect(() => { seenRef.current = seen; }, [seen]);

    // 新規作成（未表示）を抽出
    const newly = allEarned.filter(b => !seenRef.current.includes(b.id));

    // 新規作成を「表示済み」にマークする関数
    const markSeen = (ids: string[]) => {
        const next = Array.from(new Set([...seenRef.current, ...ids]));
        setSeen(next);
        localStorage.setItem(storageKey(user.uid), JSON.stringify(next));
    }

    // 全バッジ（ロック状態も含む）をUI用に返す
    const allWithLock = BADGE_DEFS.map(def => ({
        ...def,
        unlocked: allEarned.some(e => e.id === def.id),
    }));

    return { allEarned, newly, markSeen, allWithLock };
}