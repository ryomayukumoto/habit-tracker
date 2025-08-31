// src/lib/converters.ts
import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import type { HabitLog } from "../types/habit";

export const habitLogConverter: FirestoreDataConverter<HabitLog> = {
  toFirestore(model: HabitLog) {
    // undefined は Firestore NG。必要なものだけ書く
    const { minutes, note, date, createdAt, updatedAt } = model;
    const data: Record<string, unknown> = { minutes, createdAt, updatedAt };
    if (note !== undefined) data.note = note;
    if (date !== undefined) data.date = date;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): HabitLog {
    const data = snapshot.data(options) as {
      minutes: unknown;
      note?: unknown;
      date?: unknown;
      createdAt: unknown;
      updatedAt: unknown;
    };

    return {
      minutes: Number(data.minutes) || 0,
      note: typeof data.note === "string" ? data.note : undefined,
      date: typeof data.date === "string" ? data.date : undefined,
      createdAt: Number(data.createdAt) || 0,
      updatedAt: Number(data.updatedAt) || 0,
    };
  },
};
