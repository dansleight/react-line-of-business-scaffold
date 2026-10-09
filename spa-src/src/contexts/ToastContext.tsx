import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastAccent, ToastContext, ToastOptions } from "./UseContexts";
import { toastExitMs, toastTimeoutMs } from "@/toastConfig";

export type ToastItem = {
  id: string;
  message: string;
  accent: ToastAccent;
  timeout: boolean;
  durationMs: number;
  exiting: boolean;
};

type ToastState = {
  toasts: ToastItem[];
  dismiss: (id: string) => void;
};

const ToastStateContext = createContext({} as ToastState);

export function useToastState() {
  return useContext(ToastStateContext);
}

function nextToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const exitingIds = useRef(new Set<string>());
  const exitTimers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    if (exitingIds.current.has(id)) return;
    exitingIds.current.add(id);
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, exiting: true } : toast,
      ),
    );
    const handle = window.setTimeout(() => {
      exitTimers.current.delete(id);
      exitingIds.current.delete(id);
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, toastExitMs);
    exitTimers.current.set(id, handle);
  }, []);

  const notify = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = nextToastId();
      const timeout = options?.timeout ?? true;
      const toast: ToastItem = {
        id,
        message,
        accent: options?.accent ?? "primary",
        timeout,
        durationMs: toastTimeoutMs,
        exiting: false,
      };
      setToasts((prev) => [...prev, toast]);
      return id;
    },
    [],
  );

  useEffect(() => {
    const timers = exitTimers.current;
    const exiting = exitingIds.current;
    return () => {
      timers.forEach((handle) => window.clearTimeout(handle));
      timers.clear();
      exiting.clear();
    };
  }, []);

  const api = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);
  const state = useMemo(() => ({ toasts, dismiss }), [toasts, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      <ToastStateContext.Provider value={state}>
        {children}
      </ToastStateContext.Provider>
    </ToastContext.Provider>
  );
}
