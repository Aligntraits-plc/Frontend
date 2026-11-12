import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Bell, BellOff, CalendarPlus, MapPin, PlayCircle, Video } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { errorMessage, getEvents, setReminder, type CommunityEvent } from "../../services/community";
import { dayMedium, eventPhase, googleCalendarUrl, placeLabel, timeRange } from "../../components/community/eventUtils";
import ui from "../../components/community/ui.module.css";
import w from "./Workshop.module.css";

const KINDS = ["WORKSHOP", "LIVE_SESSION"];

/* Workshop: live sessions and workshops from AlignTraits mentors, with reminders,
   join links and recordings of past sessions. */
export default function Workshop() {
  const { setPageDesc } = useAuth();
  const [events, setEvents] = useState<CommunityEvent[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setPageDesc({ title: "Workshop", desc: "Live sessions and workshops with AlignTraits mentors" });
  }, [setPageDesc]);

  useEffect(() => {
    getEvents({ from: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString() })
      .then((r) => setEvents(r.events.filter((e) => KINDS.includes(e.kind) && e.status !== "CANCELLED")))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const { upcoming, past } = useMemo(() => {
    const list = events || [];
    return {
      upcoming: list.filter((e) => eventPhase(e) !== "ended"),
      past: list.filter((e) => eventPhase(e) === "ended").reverse(),
    };
  }, [events]);

  const remind = async (e: CommunityEvent) => {
    setBusy(e.id);
    try {
      const r = await setReminder(e.id, !e.reminded);
      setEvents((list) => list?.map((x) => (x.id === e.id ? { ...x, reminded: r.data.reminded, reminderCount: r.data.reminderCount } : x)) || null);
      toast.success(r.data.reminded ? "Reminder set. We'll email you a day before and an hour before." : "Reminder removed");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={w.page}>
      <div>
        <h1 className={w.title}>Workshop</h1>
        <p className={w.lead}>Learn how admission really works: choosing courses, reading cut-off marks, post-UTME, funding and more. Join live, or watch the recording later.</p>
      </div>

      {error && <p className={ui.errorBox}>{error}</p>}

      <section aria-labelledby="ws-upcoming">
        <h2 id="ws-upcoming" className={w.h2}>
          Coming up
        </h2>
        {!events ? (
          <div className={ui.loading}>
            <span className={ui.spinner} aria-label="Loading" />
          </div>
        ) : upcoming.length === 0 ? (
          <div className={ui.empty}>
            <span className={ui.emptyIcon}>
              <Video size={24} aria-hidden="true" />
            </span>
            <p className={ui.emptyTitle}>No workshops scheduled yet</p>
            <p className={ui.emptyText}>New sessions are announced in Community. Join a channel so you hear first.</p>
            <div className={ui.emptyActions}>
              <Link to="/dashboard/community" className={ui.primary}>
                Go to Community
              </Link>
            </div>
          </div>
        ) : (
          <div className={w.grid}>
            {upcoming.map((e) => {
              const phase = eventPhase(e);
              return (
                <article key={e.id} className={w.card}>
                  <div className={w.cardTop}>
                    <span className={e.kind === "WORKSHOP" ? ui.workshop : ui.live}>{e.kind === "WORKSHOP" ? "Workshop" : "Live session"}</span>
                    {phase === "live" && <span className={ui.today}>Happening now</span>}
                  </div>
                  <h3 className={w.cardTitle}>{e.title}</h3>
                  <p className={w.meta}>
                    {dayMedium(e.startsAt)} · {timeRange(e)} WAT
                  </p>
                  <p className={w.meta}>
                    {e.format === "ONLINE" ? <Video size={14} aria-hidden="true" /> : <MapPin size={14} aria-hidden="true" />} {placeLabel(e)}
                  </p>
                  {e.hostName && (
                    <p className={w.host}>
                      With <strong>{e.hostName}</strong>
                      {e.hostRole ? `, ${e.hostRole}` : ""}
                    </p>
                  )}
                  {e.summary && <p className={w.summary}>{e.summary}</p>}
                  <div className={w.actions}>
                    {phase === "live" && e.joinUrl ? (
                      <a href={e.joinUrl} target="_blank" rel="noopener noreferrer" className={ui.primary}>
                        Join now
                      </a>
                    ) : (
                      <button type="button" className={e.reminded ? ui.secondary : ui.primary} onClick={() => remind(e)} disabled={busy === e.id}>
                        {e.reminded ? <BellOff size={16} aria-hidden="true" /> : <Bell size={16} aria-hidden="true" />}
                        {e.reminded ? "Remove reminder" : "Remind me"}
                      </button>
                    )}
                    <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className={ui.secondary} aria-label={`Add ${e.title} to your calendar`}>
                      <CalendarPlus size={16} aria-hidden="true" />
                    </a>
                    <Link to={`/dashboard/community/events?event=${e.id}`} className={w.more}>
                      Details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="ws-past">
          <h2 id="ws-past" className={w.h2}>
            Past sessions
          </h2>
          <ul className={w.past}>
            {past.map((e) => (
              <li key={e.id} className={w.pastRow}>
                <div className={w.pastMain}>
                  <p className={w.pastTitle}>{e.title}</p>
                  <p className={w.meta}>{dayMedium(e.startsAt)}</p>
                </div>
                {e.recordingUrl ? (
                  <a href={e.recordingUrl} target="_blank" rel="noopener noreferrer" className={`${ui.secondary} ${ui.small}`}>
                    <PlayCircle size={16} aria-hidden="true" /> Watch
                  </a>
                ) : (
                  <span className={w.meta}>No recording</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
