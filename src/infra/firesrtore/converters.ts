// Firestore→App 変換（Converter）
import {
  type FirestoreDataConverter,
  Timestamp,
} from "firebase/firestore";
import { type HabitLog } from "../../domain/habitLog";

// Firestoreに実際に保存されている形（Doc型）
type HabitLogDoc = {
  date: string;            // "YYYY-MM-DD"
  value: number;
  note?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// App型（Date）へ変換するConverter（主に "fromFirestore" を使う）
export const habitLogConverter: FirestoreDataConverter<HabitLog> = {
  toFirestore(model: HabitLog): HabitLogDoc {
    // 基本は書き込みに使わない（Repositoryで serverTimestamp() を使うため）
    return {
      date: model.date,
      value: model.value,
      ...(model.note ? { note: model.note } : {}),
      createdAt: Timestamp.fromDate(model.createdAt),
      updatedAt: Timestamp.fromDate(model.updatedAt),
    };
  },
  fromFirestore(snapshot, options): HabitLog {
    const d = snapshot.data(options) as HabitLogDoc;
    return {
      id: snapshot.id,
      date: d.date,
      value: d.value,
      note: d.note,
      createdAt: d.createdAt.toDate(),
      updatedAt: d.updatedAt.toDate(),
    };
  },
};