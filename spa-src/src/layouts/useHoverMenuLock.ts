import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hover flyouts stay open while the pointer is over them. After a route
 * change (or an item click), lock the menu closed. Hiding the panel with
 * `display: none` does not fire mouseleave, so unlock as soon as the
 * pointer is no longer over the item.
 */
export function useHoverMenuLock() {
  const { pathname } = useLocation();
  const [locked, setLocked] = useState(false);
  const previousPath = useRef(pathname);
  const rootRef = useRef<HTMLDivElement>(null);

  const unlock = useCallback(() => setLocked(false), []);
  const lock = useCallback(() => setLocked(true), []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    setLocked(true);
  }, [pathname]);

  useEffect(() => {
    if (!locked) return;
    const node = rootRef.current;

    const pointerIsOver = () =>
      Boolean(node?.matches(":hover") || node?.matches(":focus-within"));

    if (!pointerIsOver()) {
      setLocked(false);
      return;
    }

    const onMove = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !node?.contains(target)) {
        setLocked(false);
      }
    };

    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, [locked]);

  return {
    locked,
    lock,
    unlock,
    rootRef,
  };
}
