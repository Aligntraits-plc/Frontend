import { useCallback, useEffect, useRef, useState } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

/*
  Saves a form a moment after the student stops changing it. The designs have no
  Save button, so this is what makes "changes update your matches" true.
  `mark()` is called on every change; the latest value is read when the save runs.
*/
export function useAutosave<T>(read: () => T, save: (value: T) => Promise<void>, delay = 900) {
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<number | null>(null);
  const running = useRef(false);
  const again = useRef(false);
  const readRef = useRef(read);
  const saveRef = useRef(save);
  readRef.current = read;
  saveRef.current = save;

  const run = useCallback(async () => {
    if (running.current) {
      again.current = true;
      return;
    }
    running.current = true;
    setState("saving");
    try {
      await saveRef.current(readRef.current());
      setState("saved");
    } catch {
      setState("error");
    } finally {
      running.current = false;
      if (again.current) {
        again.current = false;
        run();
      }
    }
  }, []);

  const mark = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(run, delay);
  }, [delay, run]);

  // Leaving the page with a change still waiting: save it now.
  useEffect(
    () => () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
        run();
      }
    },
    [run],
  );

  return { state, mark };
}
