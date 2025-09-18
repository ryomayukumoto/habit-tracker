import { createContext } from "react";

export type ToastFn = (text: string) => void;
export const ToastCtx = createContext<ToastFn | null>(null);
