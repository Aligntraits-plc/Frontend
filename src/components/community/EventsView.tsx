import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Check, ChevronLeft, ChevronRight, GitCommitVertical, X } from "lucide-react";
import { getEvent, getEvents, type CommunityEvent } from "../../services/community";
import EventDetails from "./EventDetails";
import {
  KIND,
  dayKey,
  dayLong,
  dayNumber,
  eventPhase,
  isPast,
  monthKey,
  placeLabel,
  relativeWhen,
  timeLabel,
  timeRange,
  weekdayShort,
} from "./eventUtils";
import e from "./Events.module.css";
import ui from "./ui.module.css";

type View = "calendar" | "progress";
const VIEW_KEY = "at.community.eventsView";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const readView = (): View => {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === "calendar" || v === "progress") return v;
  } catch {
    /* storage may be blocked */
  }
  return typeof window !== "undefined" && window.innerWidth < 1024 ? "progress" : "calendar";
};

/** Calendar cells (Monday first) for a Lagos month. */
function monthCells(year: number, month: number) {
  const first = Date.UTC(year, month - 1, 1);
  const offset = (new Date(first).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const rows = Math.ceil((offset + daysInMonth) / 7);
  return Array.from({ length: rows * 7 }, (_, i) => {
    const d = new Date(first + (i - offset) * 86400000);
    return { key: d.toISOString().slice(0, 10), day: d.getUTCDate(), inMonth: d.getUTCMonth() === month - 1 };
  });
}

export default function EventsView() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("event");
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [view, setView] = useState<View>(readView);
  const todayKey = dayKey(new Date());
  const [cursor, setCursor] = useState(() => ({ y: Number(todayKey.slice(0, 4)), m: Number(todayKey.slice(5, 7)) }));
  const [extra, setExtra] = useState<CommunityEvent | null>(null);
  const [missing, setMissing] = useState(false);

  const load = () => {
    setStatus("loading");
    getEvents()
      .then((r) => {
        setEvents(r.events);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };
  useEffect(load, []);

  const switchView = (v: View) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* fine without it */
    }
  };

  // The selected event: from the list, or fetched when the link points outside it.
  const selected = useMemo(
    () => (selectedId ? events.find((x) => x.id === selectedId) || (extra?.id === selectedId ? extra : null) : null),
    [selectedId, events, extra]
  );
  useEffect(() => {
    setMissing(false);
    if (!selectedId || status !== "ready" || events.some((x) => x.id === selectedId)) return;
    getEvent(selectedId)
      .then(setExtra)
      .catch(() => setMissing(true));
  }, [selectedId, status, events]);

  const open = (id: string) => setParams({ event: id });
  const close = () => setParams({});
  const update = (ev: CommunityEvent) => {
    setEvents((list) => list.map((x) => (x.id === ev.id ? ev : x)));
    if (extra?.id === ev.id) setExtra(ev);
  };

  return (
    <div className={e.screen}>
      <header className={e.head}>
        <Link to="/dashboard/community" className={e.back} aria-label="Back to Community">
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        <div className={e.headTitles}>
          <h2 className={e.title}>
            <CalendarDays size={22} aria-hidden="true" />
            Events
          </h2>
          <p className={e.subtitle}>Live sessions, workshops, meetups and deadlines</p>
        </div>
        <div className={e.toggle} role="tablist" aria-label="Events view">
          <button type="button" role="tab" aria-selected={view === "calendar"} className={view === "calendar" ? e.toggleOn : ""} onClick={() => switchView("calendar")}>
            <CalendarDays size={17} aria-hidden="true" />
            Calendar
          </button>
          <button type="button" role="tab" aria-selected={view === "progress"} className={view === "progress" ? e.toggleOn : ""} onClick={() => switchView("progress")}>
            <GitCommitVertical size={17} aria-hidden="true" />
            Progress line
          </button>
        </div>
      </header>

      <div className={e.body}>
        {status === "loading" ? (
          <div className={ui.loading}>
            <span className={ui.spinner} aria-label="Loading events" />
          </div>
        ) : status === "error" ? (
          <div className={ui.empty}>
            <p className={ui.emptyTitle}>Events didn't load</p>
            <p className={ui.emptyText}>Check your connection and try again.</p>
            <div className={ui.emptyActions}>
              <button type="button" className={ui.primary} onClick={load}>
                Try again
              </button>
            </div>
          </div>
        ) : view === "calendar" ? (
          <CalendarView events={events} cursor={cursor} setCursor={setCursor} onOpen={open} onProgress={() => switchView("progress")} />
        ) : (
          <ProgressView events={events} onOpen={open} />
        )}
      </div>

      {selectedId && <EventDetails event={selected} missing={missing} onClose={close} onChange={update} />}
    </div>
  );
}

/* ----------------------------- Calendar ----------------------------- */

function CalendarView({
  events,
  cursor,
  setCursor,
  onOpen,
  onProgress,
}: {
  events: CommunityEvent[];
  cursor: { y: number; m: number };
  setCursor: (c: { y: number; m: number }) => void;
  onOpen: (id: string) => void;
  onProgress: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const todayKey = dayKey(new Date());
  const thisMonth = `${cursor.y}-${String(cursor.m).padStart(2, "0")}`;
  const cells = useMemo(() => monthCells(cursor.y, cursor.m), [cursor]);
  const byDay = useMemo(() => {
    const map: Record<string, CommunityEvent[]> = {};
    for (const ev of events) (map[dayKey(ev.startsAt)] ||= []).push(ev);
    return map;
  }, [events]);
  const inMonth = events.filter((ev) => monthKey(ev.startsAt) === thisMonth);
  const [picked, setPicked] = useState<string | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => setCompact(el.clientWidth < 720);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // On phones, pick today (or the first day with events) when the month changes.
  useEffect(() => {
    const firstWithEvents = inMonth[0] ? dayKey(inMonth[0].startsAt) : null;
    setPicked(todayKey.startsWith(thisMonth) ? todayKey : firstWithEvents || `${thisMonth}-01`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thisMonth]);

  const move = (delta: number) => {
    const d = new Date(Date.UTC(cursor.y, cursor.m - 1 + delta, 1));
    setCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 });
  };
  const goToday = () => setCursor({ y: Number(todayKey.slice(0, 4)), m: Number(todayKey.slice(5, 7)) });
  const pickedEvents = picked ? byDay[picked] || [] : [];

  return (
    <div ref={wrap} className={e.calendar}>
      <div className={e.calBar}>
        <h3 className={e.month}>
          {MONTHS[cursor.m - 1]} {cursor.y}
        </h3>
        <div className={e.calNav}>
          <button type="button" onClick={() => move(-1)} aria-label="Previous month">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Next month">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
        <button type="button" className={`${ui.secondary} ${ui.small}`} onClick={goToday}>
          Today
        </button>
        <span className={e.count}>
          {inMonth.length} {inMonth.length === 1 ? "event" : "events"}
        </span>
      </div>
      <ul className={e.legend} aria-label="Event types">
        {Object.values(KIND).map((k) => (
          <li key={k.tone}>
            <span className={`${e.dot} ${e[`dot_${k.tone}`]}`} aria-hidden="true" />
            {k.label}
          </li>
        ))}
      </ul>

      {compact ? (
        <>
          <div className={e.miniGrid} role="grid" aria-label={`${MONTHS[cursor.m - 1]} ${cursor.y}`}>
            {WEEKDAYS.map((w) => (
              <span key={w} className={e.miniHead} role="columnheader">
                {w.slice(0, 1)}
                <span className={ui.srOnly}>{w.slice(1)}</span>
              </span>
            ))}
            {cells.map((cell) => {
              const list = byDay[cell.key] || [];
              return (
                <button
                  key={cell.key}
                  type="button"
                  role="gridcell"
                  className={`${e.miniDay} ${cell.inMonth ? "" : e.outside} ${cell.key === todayKey ? e.isToday : ""} ${picked === cell.key ? e.picked : ""}`}
                  onClick={() => setPicked(cell.key)}
                  aria-label={`${cell.day} ${list.length ? `, ${list.length} ${list.length === 1 ? "event" : "events"}` : ""}`}
                  aria-pressed={picked === cell.key}
                >
                  <span className={e.miniNum}>{cell.day}</span>
                  <span className={e.dots} aria-hidden="true">
                    {list.slice(0, 3).map((ev) => (
                      <span key={ev.id} className={`${e.dot} ${e[`dot_${KIND[ev.kind].tone}`]} ${ev.status === "CANCELLED" ? e.dotOff : ""}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <div className={e.dayList}>
            <h4 className={e.dayListTitle}>{picked ? dayLong(`${picked}T12:00:00+01:00`) : ""}</h4>
            {pickedEvents.length === 0 ? (
              <p className={e.noDay}>No events on this day.</p>
            ) : (
              <div className={e.rows}>
                {pickedEvents.map((ev) => (
                  <EventRow key={ev.id} ev={ev} onOpen={onOpen} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={e.grid} role="grid" aria-label={`${MONTHS[cursor.m - 1]} ${cursor.y}`}>
          {WEEKDAYS.map((w) => (
            <div key={w} className={e.gridHead} role="columnheader">
              {w}
            </div>
          ))}
          {cells.map((cell) => {
            const list = byDay[cell.key] || [];
            const past = cell.key < todayKey;
            return (
              <div key={cell.key} role="gridcell" className={`${e.cell} ${cell.inMonth ? "" : e.outside} ${past ? e.pastDay : ""}`}>
                <span className={`${e.cellNum} ${cell.key === todayKey ? e.cellToday : ""}`}>{cell.day}</span>
                {list.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    className={`${e.chip} ${e[`chip_${KIND[ev.kind].tone}`]} ${ev.status === "CANCELLED" ? e.chipOff : ""}`}
                    onClick={() => onOpen(ev.id)}
                  >
                    <span className={e.chipTime}>{ev.kind === "EXAM" ? "Starts" : timeLabel(ev.startsAt)}</span>
                    <span className={e.chipTitle}>{ev.title}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {inMonth.length === 0 && (
        <div className={ui.empty} style={{ marginTop: 16 }}>
          <span className={ui.emptyIcon}>
            <CalendarDays size={24} aria-hidden="true" />
          </span>
          <p className={ui.emptyTitle}>No events in {MONTHS[cursor.m - 1]} yet</p>
          <p className={ui.emptyText}>Live sessions, meetups and deadlines will show here as soon as they're planned.</p>
          <div className={ui.emptyActions}>
            <button type="button" className={ui.secondary} onClick={() => move(1)}>
              Next month
            </button>
            <button type="button" className={ui.primary} onClick={onProgress}>
              See every event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Progress line ----------------------------- */

function ProgressView({ events, onOpen }: { events: CommunityEvent[]; onOpen: (id: string) => void }) {
  const now = new Date();
  const counted = events.filter((ev) => ev.status !== "CANCELLED");
  const done = counted.filter((ev) => isPast(ev, now)).length;
  const next = counted.find((ev) => !isPast(ev, now));
  const pct = counted.length ? Math.round((done / counted.length) * 100) : 0;
  const todayRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    todayRef.current?.scrollIntoView({ block: "nearest" });
  }, []);

  if (events.length === 0) {
    return (
      <div className={ui.empty}>
        <span className={ui.emptyIcon}>
          <GitCommitVertical size={24} aria-hidden="true" />
        </span>
        <p className={ui.emptyTitle}>No events yet</p>
        <p className={ui.emptyText}>
          Live sessions, meetups and deadlines like UTME registration will line up here, so you can see what's behind you and what's next.
        </p>
        <div className={ui.emptyActions}>
          <Link to="/dashboard/community/c/jamb-candidates" className={ui.primary}>
            Ask in #jamb-candidates
          </Link>
        </div>
      </div>
    );
  }

  // Month headings, with a "Today" marker before the first event that isn't over.
  const firstUpcoming = events.findIndex((ev) => !isPast(ev, now) && ev.status !== "CANCELLED");
  const items: Array<{ type: "month"; label: string } | { type: "today" } | { type: "event"; ev: CommunityEvent }> = [];
  let lastMonth = "";
  events.forEach((ev, i) => {
    if (i === firstUpcoming) {
      const label = MONTHS[Number(dayKey(now).slice(5, 7)) - 1] + " " + dayKey(now).slice(0, 4);
      if (monthKey(now) !== lastMonth) {
        items.push({ type: "month", label });
        lastMonth = monthKey(now);
      }
      items.push({ type: "today" });
    }
    const mk = monthKey(ev.startsAt);
    if (mk !== lastMonth) {
      items.push({ type: "month", label: `${MONTHS[Number(mk.slice(5, 7)) - 1]} ${mk.slice(0, 4)}` });
      lastMonth = mk;
    }
    items.push({ type: "event", ev });
  });
  if (firstUpcoming === -1) items.push({ type: "today" });

  return (
    <div className={e.progress}>
      <div className={e.season}>
        <div className={e.seasonTop}>
          <div>
            <p className={e.seasonLabel}>Season progress</p>
            <p className={e.seasonCount}>
              <strong>
                {done} of {counted.length}
              </strong>{" "}
              events behind you
            </p>
          </div>
          {next && (
            <button type="button" className={e.nextUp} onClick={() => onOpen(next.id)}>
              Next up <strong>{next.title}</strong> · {relativeWhen(next, now)}
            </button>
          )}
        </div>
        <div className={e.bar} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Events behind you">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ol className={e.timeline}>
        {items.map((it, i) =>
          it.type === "month" ? (
            <li key={`m${i}`} className={e.tlMonth}>
              {it.label}
            </li>
          ) : it.type === "today" ? (
            <li key={`t${i}`} ref={todayRef} className={e.tlToday}>
              <span className={ui.today}>Today</span>
              <span>{dayLong(now)}</span>
            </li>
          ) : (
            <li key={it.ev.id} className={e.tlItem}>
              <EventRow ev={it.ev} onOpen={onOpen} withMarker />
            </li>
          )
        )}
      </ol>
    </div>
  );
}

function EventRow({ ev, onOpen, withMarker = false }: { ev: CommunityEvent; onOpen: (id: string) => void; withMarker?: boolean }) {
  const phase = eventPhase(ev);
  const kind = KIND[ev.kind];
  return (
    <button type="button" className={`${e.row} ${phase === "ended" ? e.rowPast : ""}`} onClick={() => onOpen(ev.id)}>
      {withMarker && (
        <span className={`${e.marker} ${phase === "ended" ? e.markerDone : phase === "cancelled" ? e.markerOff : e[`marker_${kind.tone}`]}`} aria-hidden="true">
          {phase === "ended" ? <Check size={13} strokeWidth={3} /> : phase === "cancelled" ? <X size={12} strokeWidth={3} /> : null}
        </span>
      )}
      <span className={e.rowDate}>
        <span>{weekdayShort(ev.startsAt)}</span>
        <strong>{dayNumber(ev.startsAt)}</strong>
      </span>
      <span className={e.rowBody}>
        <span className={e.rowChips}>
          <span className={ui[kind.tone]}>{kind.label}</span>
          {phase === "cancelled" && <span className={ui.cancelled}>Cancelled</span>}
          {(phase === "today" || phase === "live") && <span className={ui.today}>{phase === "live" ? "Now" : "Today"}</span>}
          {ev.reminded && phase !== "ended" && phase !== "cancelled" && <span className={ui.going}>Reminder set</span>}
          {phase === "ended" && ev.recordingUrl && <span className={ui.neutral}>Recording</span>}
        </span>
        <span className={`${e.rowTitle} ${phase === "cancelled" ? e.struck : ""}`}>{ev.title}</span>
        <span className={e.rowMeta}>
          {timeRange(ev)} · {placeLabel(ev)}
        </span>
      </span>
      <ChevronRight size={18} aria-hidden="true" className={e.rowChevron} />
    </button>
  );
}
