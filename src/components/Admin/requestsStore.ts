import { useEffect, useState } from "react";
import { getRequestsSummary, type RequestsSummary } from "../../services/roles";

/* The admin Requests badge: one shared poll (every 60 seconds while the tab is open). */
let summary: RequestsSummary | null = null;
const listeners = new Set<(s: RequestsSummary | null) => void>();
let timer: ReturnType<typeof setInterval> | null = null;

export async function refreshRequests() {
  try {
    summary = await getRequestsSummary();
  } catch {
    /* not an admin, or offline: keep the last value */
  }
  listeners.forEach((l) => l(summary));
}

export function useRequestsSummary(enabled: boolean) {
  const [value, setValue] = useState<RequestsSummary | null>(summary);
  useEffect(() => {
    if (!enabled) return;
    listeners.add(setValue);
    if (!timer) {
      refreshRequests();
      timer = setInterval(() => {
        if (document.visibilityState === "visible") refreshRequests();
      }, 60_000);
    }
    return () => {
      listeners.delete(setValue);
      if (listeners.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, [enabled]);
  return enabled ? value : null;
}
