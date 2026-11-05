import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BellRing,
  CalendarDays,
  CalendarPlus,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Link2,
  MapPin,
  Navigation,
  PlayCircle,
  Video,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { errorMessage, setReminder, type CommunityEvent } from "../../services/community";
import { KIND, dayLong, downloadIcs, eventPhase, googleCalendarUrl, prettyUrl, timeLabel } from "./eventUtils";
import e from "./Events.module.css";
import ui from "./ui.module.css";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Link copied");
  } catch {
    toast.info(text);
  }
}

function LinkBox({ url, note }: { url: string; note?: string }) {
  return (
    <div className={e.linkBox}>
      <div className={e.linkRow}>
        <Link2 size={18} aria-hidden="true" />
        <a href={url} target="_blank" rel="noopener noreferrer" className={e.linkText}>
          {prettyUrl(url)}
        </a>
        <button type="button" className={e.copy} onClick={() => copy(url)}>
          <Copy size={15} aria-hidden="true" />
          Copy
        </button>
      </div>
      {note && <p className={e.linkNote}>{note}</p>}
    </div>
  );
}

// Side panel on computers, full screen on phones. Buttons change with the kind of event and the time.
export default function EventDetails({
  event,
  missing,
  onClose,
  onChange,
}: {
  event: CommunityEvent | null;
  missing?: boolean;
  onClose: () => void;
  onChange: (ev: CommunityEvent) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      clearInterval(t);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleReminder = async () => {
    if (!event) return;
    setBusy(true);
    try {
      const r = await setReminder(event.id, !event.reminded);
      onChange({ ...event, reminded: r.data.reminded, reminderCount: r.data.reminderCount });
      toast.success(r.message);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const phase = event ? eventPhase(event, now) : "upcoming";
  const kind = event ? KIND[event.kind] : null;
  const deadline = event?.kind === "DEADLINE";
  const exam = event?.kind === "EXAM";
  const online = event?.format === "ONLINE" && !deadline && !exam;
  const inPerson = event?.format === "IN_PERSON" && !exam;

  const statusChip =
    phase === "cancelled" ? (
      <span className={ui.cancelled}>Cancelled</span>
    ) : phase === "ended" ? (
      <span className={ui.neutral}>{deadline ? "Closed" : "Ended"}</span>
    ) : phase === "live" ? (
      <span className={ui.today}>{exam ? "On now" : "Happening now"}</span>
    ) : phase === "today" ? (
      <span className={ui.today}>Today</span>
    ) : null;

  const remindButton = (primary: boolean) =>
    event?.reminded ? (
      <button type="button" className={`${ui.success} ${ui.block}`} onClick={toggleReminder} disabled={busy} aria-pressed="true">
        <Check size={18} aria-hidden="true" />
        Reminder set
      </button>
    ) : (
      <button type="button" className={`${primary ? ui.primary : ui.secondary} ${ui.block}`} onClick={toggleReminder} disabled={busy}>
        <Bell size={18} aria-hidden="true" />
        Remind me
      </button>
    );

  let actions: React.ReactNode = null;
  let footnote = "";
  if (event) {
    if (phase === "cancelled") {
      footnote = "This event was cancelled. Check Events for new dates.";
    } else if (phase === "ended") {
      if (online && event.recordingUrl) {
        actions = (
          <a href={event.recordingUrl} target="_blank" rel="noopener noreferrer" className={`${ui.primary} ${ui.block}`}>
            <PlayCircle size={18} aria-hidden="true" />
            Watch recording
          </a>
        );
        footnote = "You can watch the full session any time.";
      } else {
        footnote = deadline ? "This deadline has passed." : exam ? "This exam window has ended." : "This event has ended.";
      }
    } else if (exam) {
      // Exam windows: remind me before it starts, and the official site for timetables.
      actions = (
        <>
          {phase === "upcoming" && remindButton(!event.linkUrl)}
          {event.linkUrl && (
            <a href={event.linkUrl} target="_blank" rel="noopener noreferrer" className={`${ui.primary} ${ui.block}`}>
              <ExternalLink size={18} aria-hidden="true" />
              {event.linkLabel || "Open the official site"}
            </a>
          )}
        </>
      );
      if (phase === "live" || phase === "today") footnote = "The exam window is open. Check your timetable or exam slip for your papers.";
      else footnote = event.reminded ? "We'll email you the day before it starts." : "Set a reminder and we'll email you the day before it starts.";
    } else if (deadline) {
      actions = (
        <>
          {remindButton(!event.linkUrl)}
          {event.linkUrl && (
            <a href={event.linkUrl} target="_blank" rel="noopener noreferrer" className={`${ui.primary} ${ui.block}`}>
              <ExternalLink size={18} aria-hidden="true" />
              {event.linkLabel || "Open the official site"}
            </a>
          )}
        </>
      );
    } else if (online) {
      const canJoin = (phase === "live" || phase === "today") && !!event.joinUrl;
      actions = canJoin ? (
        <>
          <a href={event.joinUrl!} target="_blank" rel="noopener noreferrer" className={`${ui.primary} ${ui.block}`}>
            <Video size={18} aria-hidden="true" />
            Join session
          </a>
          {phase === "today" && remindButton(false)}
        </>
      ) : (
        remindButton(true)
      );
      if (phase === "live") footnote = "Happening now. Join from your phone or computer.";
      else if (phase === "today") footnote = "Happening today. The room opens 10 minutes before the start time.";
    } else if (inPerson) {
      actions = (
        <>
          {remindButton(true)}
          {event.mapUrl && (
            <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className={`${event.reminded ? ui.primary : ui.secondary} ${ui.block}`}>
              <Navigation size={18} aria-hidden="true" />
              Get directions
            </a>
          )}
        </>
      );
    }
    if (!footnote && phase !== "ended" && phase !== "cancelled") {
      footnote = event.reminded
        ? "We'll email you a day before and an hour before."
        : event.reminderCount > 0
          ? `${event.reminderCount.toLocaleString("en-NG")} ${event.reminderCount === 1 ? "student has" : "students have"} set a reminder.`
          : "Set a reminder and we'll email you a day before and an hour before.";
    }
  }

  return (
    <div className={e.detailsOverlay} onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
      <aside className={e.details} role="dialog" aria-modal="true" aria-labelledby="event-title">
        <div className={e.detailsHead}>
          <span>Event details</span>
          <button ref={closeRef} type="button" className={ui.iconBtn} onClick={onClose} aria-label="Close event details">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {!event ? (
          <div className={e.detailsBody}>
            {missing ? (
              <div className={ui.empty}>
                <span className={ui.emptyIcon}>
                  <CalendarDays size={24} aria-hidden="true" />
                </span>
                <p className={ui.emptyTitle} id="event-title">
                  This event isn't available
                </p>
                <p className={ui.emptyText}>It may have been removed. See the other events instead.</p>
                <div className={ui.emptyActions}>
                  <button type="button" className={ui.primary} onClick={onClose}>
                    See all events
                  </button>
                </div>
              </div>
            ) : (
              <div className={ui.loading}>
                <span className={ui.spinner} aria-label="Loading event" />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={e.detailsBody}>
              <div className={e.chips}>
                {kind && <span className={ui[kind.tone]}>{kind.label}</span>}
                {statusChip}
                {event.reminded && phase !== "ended" && phase !== "cancelled" && (
                  <span className={ui.going}>
                    <BellRing size={12} aria-hidden="true" />
                    Reminder set
                  </span>
                )}
              </div>
              <h2 id="event-title" className={`${e.detailsTitle} ${phase === "cancelled" ? e.struck : ""}`}>
                {event.title}
              </h2>

              <ul className={e.facts}>
                <li>
                  <CalendarDays size={19} aria-hidden="true" />
                  {exam && event.endsAt && dayLong(event.endsAt) !== dayLong(event.startsAt)
                    ? `${dayLong(event.startsAt)} to ${dayLong(event.endsAt)}`
                    : dayLong(event.startsAt)}
                </li>
                <li>
                  <Clock size={19} aria-hidden="true" />
                  {exam ? (
                    <span>Your papers and times are on your timetable or exam slip</span>
                  ) : (
                    <span>
                      {deadline
                        ? `Closes at ${timeLabel(event.startsAt)}`
                        : `${timeLabel(event.startsAt)}${event.endsAt ? ` – ${timeLabel(event.endsAt)}` : ""}`}{" "}
                      <span className={e.tz}>WAT</span>
                    </span>
                  )}
                </li>
                {event.hostName && (
                  <li>
                    <span className={e.hostAvatar} aria-hidden="true">
                      {event.hostName
                        .split(/\s+/)
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <span>
                      {event.hostName}
                      {event.hostRole && <span className={e.hostRole}> · {event.hostRole}</span>}
                    </span>
                  </li>
                )}
              </ul>

              {phase !== "ended" && phase !== "cancelled" && (
                <div className={e.calRow}>
                  <CalendarPlus size={17} aria-hidden="true" />
                  <span>Add to calendar:</span>
                  <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                    Google
                  </a>
                  <button type="button" onClick={() => downloadIcs(event)}>
                    Apple or Outlook
                  </button>
                </div>
              )}

              {/* How to join / where / what to do */}
              {online && (
                <section className={e.block}>
                  <h3>How to join</h3>
                  <div className={e.placeCard}>
                    <div className={e.placeTop}>
                      <span className={e.placeIcon}>
                        <Video size={20} aria-hidden="true" />
                      </span>
                      <span>
                        <strong>Online event</strong>
                        <span className={e.placeSub}>{event.platform || "AlignTraits Live"}</span>
                      </span>
                    </div>
                    {phase === "ended" || phase === "cancelled" ? (
                      <p className={e.linkNote}>{event.recordingUrl && phase === "ended" ? "This session has ended. The recording is below." : "This session is no longer running."}</p>
                    ) : event.joinUrl ? (
                      <LinkBox
                        url={event.joinUrl}
                        note={phase === "upcoming" ? "Same link on the day. The room opens 10 minutes before the start time." : undefined}
                      />
                    ) : (
                      <p className={e.linkNote}>The link will show here before the session starts.</p>
                    )}
                  </div>
                </section>
              )}

              {inPerson && !deadline && (
                <section className={e.block}>
                  <h3>Where</h3>
                  <div className={e.placeCard}>
                    <div className={e.placeTop}>
                      <span className={e.placeIcon}>
                        <MapPin size={20} aria-hidden="true" />
                      </span>
                      <span>
                        <strong>{event.venue || "In person"}</strong>
                        {event.address && <span className={e.placeSub}>{event.address}</span>}
                      </span>
                    </div>
                    {event.mapUrl && (
                      <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className={e.mapLink}>
                        <Navigation size={15} aria-hidden="true" />
                        Open in Maps
                      </a>
                    )}
                  </div>
                </section>
              )}

              {exam && (
                <section className={e.block}>
                  <h3>Where</h3>
                  <div className={e.placeCard}>
                    <div className={e.placeTop}>
                      <span className={e.placeIcon}>
                        <MapPin size={20} aria-hidden="true" />
                      </span>
                      <span>
                        <strong>{event.venue || "Your exam centre"}</strong>
                        <span className={e.placeSub}>Check the official timetable before you travel.</span>
                      </span>
                    </div>
                    {event.linkUrl && <LinkBox url={event.linkUrl} note="Use only the official site. Never pay anyone for exam questions or to change a result." />}
                  </div>
                </section>
              )}

              {deadline && (
                <section className={e.block}>
                  <h3>What to do</h3>
                  <div className={e.placeCard}>
                    <div className={e.placeTop}>
                      <span className={e.placeIcon}>{event.format === "IN_PERSON" ? <MapPin size={20} aria-hidden="true" /> : <ExternalLink size={20} aria-hidden="true" />}</span>
                      <span>
                        <strong>{event.format === "IN_PERSON" ? "In person" : "Online"}</strong>
                        <span className={e.placeSub}>
                          {event.format === "IN_PERSON"
                            ? [event.venue, event.address].filter(Boolean).join(", ") || "At an accredited centre"
                            : "Complete it on the official site"}
                        </span>
                      </span>
                    </div>
                    {event.linkUrl && <LinkBox url={event.linkUrl} note="Use only the official site. Never pay anyone to do it for you." />}
                  </div>
                </section>
              )}

              {event.summary && (
                <section className={e.block}>
                  <h3>About</h3>
                  <p className={e.about}>{event.summary}</p>
                </section>
              )}

              {event.agenda.length > 0 && (
                <section className={e.block}>
                  <h3>{deadline || exam ? "Checklist" : "What we'll cover"}</h3>
                  <ul className={e.agenda}>
                    {event.agenda.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {!deadline && !exam && event.linkUrl && (
                <section className={e.block}>
                  <h3>More information</h3>
                  <a href={event.linkUrl} target="_blank" rel="noopener noreferrer" className={e.moreLink}>
                    <ExternalLink size={16} aria-hidden="true" />
                    {event.linkLabel || prettyUrl(event.linkUrl)}
                  </a>
                </section>
              )}
            </div>

            <div className={e.detailsFoot}>
              {actions && <div className={e.footActions}>{actions}</div>}
              {footnote && <p className={e.footnote}>{footnote}</p>}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
