import { useEffect, useSyncExternalStore } from "react";
import { getSummary, type CommunitySummary } from "../../services/community";

/*
  Shared Community summary (unread counts, events this week, next event) for the
  menu badge and the Community home. Loaded once, refreshed every minute while the
  tab is visible, and right away when a Community screen marks something as read.
*/

let state: CommunitySummary | null = null;
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let users = 0;

const emit = () => listeners.forEach((l) => l());

export function refreshCommunitySummary(): Promise<void> {
  if (inflight) return inflight;
  inflight = getSummary()
    .then((s) => {
      state = s;
      emit();
    })
    .catch(() => {
      /* keep the last known numbers */
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

const onVisible = () => {
  if (document.visibilityState === "visible") refreshCommunitySummary();
};

function start() {
  users += 1;
  if (users > 1) return;
  refreshCommunitySummary();
  timer = setInterval(() => {
    if (document.visibilityState === "visible") refreshCommunitySummary();
  }, 60_000);
  document.addEventListener("visibilitychange", onVisible);
}

function stop() {
  users -= 1;
  if (users > 0) return;
  if (timer) clearInterval(timer);
  timer = null;
  document.removeEventListener("visibilitychange", onVisible);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useCommunitySummary(): CommunitySummary | null {
  useEffect(() => {
    start();
    return stop;
  }, []);
  return useSyncExternalStore(subscribe, () => state, () => state);
}
