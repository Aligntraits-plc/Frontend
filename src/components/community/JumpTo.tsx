import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Hash, Search } from "lucide-react";
import { getEvents, type CommunityEvent } from "../../services/community";
import { useCommunity } from "./CommunityContext";
import { dayMedium, isPast } from "./eventUtils";
import s from "./JumpTo.module.css";

// "Jump to..." search across channels and upcoming events.
export default function JumpTo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { channels } = useCommunity();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [events, setEvents] = useState<CommunityEvent[] | null>(null);
  const loading = useRef(false);

  const loadEvents = () => {
    if (events || loading.current) return;
    loading.current = true;
    getEvents()
      .then((r) => setEvents(r.events.filter((e) => e.status === "SCHEDULED" && !isPast(e))))
      .catch(() => setEvents([]))
      .finally(() => {
        loading.current = false;
      });
  };

  useEffect(() => {
    if (q) loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const term = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!term) return [];
    const ch = channels
      .filter((c) => c.name.includes(term.replace(/^#/, "")) || c.description.toLowerCase().includes(term))
      .map((c) => ({ key: `c-${c.slug}`, kind: "channel" as const, label: c.name, meta: c.description, to: `/dashboard/community/c/${c.slug}` }));
    const ev = (events || [])
      .filter((e) => e.title.toLowerCase().includes(term))
      .slice(0, 6)
      .map((e) => ({
        key: `e-${e.id}`,
        kind: "event" as const,
        label: e.title,
        meta: dayMedium(e.startsAt),
        to: `/dashboard/community/events?event=${e.id}`,
      }));
    return [...ch, ...ev];
  }, [term, channels, events]);

  const go = (to: string) => {
    setQ("");
    navigate(to);
  };

  return (
    <div className={`${s.wrap} ${tone === "light" ? s.light : s.dark}`}>
      <label className={s.field}>
        <Search size={17} aria-hidden="true" />
        <span className={s.srOnly}>Jump to a channel or event</span>
        <input
          type="search"
          value={q}
          placeholder="Jump to..."
          onChange={(e) => setQ(e.target.value)}
          onFocus={loadEvents}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) go(results[0].to);
            if (e.key === "Escape") setQ("");
          }}
          aria-controls="jump-results"
        />
      </label>
      {term && (
        <div id="jump-results" className={s.results} role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <p className={s.none}>
              Nothing matches “{q.trim()}”. Try a channel name or an event title.
            </p>
          ) : (
            results.map((r) => (
              <button key={r.key} type="button" role="option" aria-selected="false" className={s.result} onClick={() => go(r.to)}>
                {r.kind === "channel" ? <Hash size={16} aria-hidden="true" /> : <CalendarDays size={16} aria-hidden="true" />}
                <span className={s.resultText}>
                  <span className={s.resultLabel}>{r.label}</span>
                  <span className={s.resultMeta}>{r.meta}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
