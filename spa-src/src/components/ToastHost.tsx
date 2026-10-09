import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { useToastState } from "@/contexts/ToastContext";
import { toastMaxVisible } from "@/toastConfig";

export function ToastHost() {
  const { toasts, dismiss } = useToastState();
  const pausedRef = useRef(false);
  const remainingRef = useRef(new Map<string, number>());
  const barRefs = useRef(new Map<string, HTMLDivElement>());
  const lastTickRef = useRef<number | null>(null);
  const toastsRef = useRef(toasts);

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  useEffect(() => {
    const liveIds = new Set(toasts.map((toast) => toast.id));
    for (const id of [...remainingRef.current.keys()]) {
      if (!liveIds.has(id)) remainingRef.current.delete(id);
    }
    for (const id of [...barRefs.current.keys()]) {
      if (!liveIds.has(id)) barRefs.current.delete(id);
    }
    if (toasts.length === 0) {
      pausedRef.current = false;
      lastTickRef.current = null;
    }
  }, [toasts]);

  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      const last = lastTickRef.current ?? now;
      lastTickRef.current = now;
      const dt = now - last;
      const visible = toastsRef.current.slice(0, toastMaxVisible);

      for (const toast of visible) {
        if (!toast.timeout || toast.exiting) continue;
        if (!remainingRef.current.has(toast.id)) {
          remainingRef.current.set(toast.id, toast.durationMs);
        }
        if (pausedRef.current) continue;
        const remaining = remainingRef.current.get(toast.id)! - dt;
        remainingRef.current.set(toast.id, remaining);
        const bar = barRefs.current.get(toast.id);
        const ratio = Math.max(0, remaining / toast.durationMs);
        if (bar) bar.style.transform = `scaleX(${ratio})`;
        if (remaining <= 0) dismiss(toast.id);
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [dismiss]);

  const visible = toasts.slice(0, toastMaxVisible);

  if (typeof document === "undefined" || visible.length === 0) {
    return null;
  }

  return createPortal(
    <div className="app-toast-host" aria-live="polite" aria-relevant="additions">
      <div
        className="app-toast-stack"
        onMouseEnter={() => {
          pausedRef.current = true;
          lastTickRef.current = null;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
          lastTickRef.current = null;
        }}
      >
        {visible.map((toast) => (
          <div
            key={toast.id}
            className={classNames("app-toast-slot", {
              "is-exiting": toast.exiting,
            })}
          >
            <div
              className={classNames(
                "app-toast",
                `app-toast-${toast.accent}`,
                { "is-exiting": toast.exiting },
              )}
              role={
                toast.accent === "danger" || toast.accent === "warning"
                  ? "alert"
                  : "status"
              }
            >
              <div className="app-toast-body">
                <div className="app-toast-message">{toast.message}</div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(toast.id)}
                />
              </div>
              {toast.timeout && (
                <div className="app-toast-progress" aria-hidden="true">
                  <div
                    className={classNames(
                      "app-toast-progress-bar",
                      `bg-${toast.accent}`,
                    )}
                    ref={(node) => {
                      if (node) barRefs.current.set(toast.id, node);
                      else barRefs.current.delete(toast.id);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
