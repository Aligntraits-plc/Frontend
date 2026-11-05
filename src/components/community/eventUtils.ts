import type { CommunityEvent, EventKind } from "../../services/community";

/* Dates, labels and actions for Community events. Times are always shown in Lagos time (WAT). */

export const TZ = "Africa/Lagos";

const fmt = (opts: Intl.DateTimeFormatOptions, locale = "en-GB") => new Intl.DateTimeFormat(locale, { timeZone: TZ, ...opts });
const timeF = fmt({ hour: "numeric", minute: "2-digit", hour12: true }, "en-US");
const dayLongF = fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" });
const dayMedF = fmt({ weekday: "short", day: "numeric", month: "short" });
const weekdayF = fmt({ weekday: "short" });
const dayNumF = fmt({ day: "numeric" });
const monthF = fmt({ month: "long", year: "numeric" });
const keyF = fmt({ year: "numeric", month: "2-digit", day: "2-digit" }, "en-CA");

export const timeLabel = (d: Date | string) => timeF.format(new Date(d));
export const dayLong = (d: Date | string) => dayLongF.format(new Date(d));
export const dayMedium = (d: Date | string) => dayMedF.format(new Date(d));
export const weekdayShort = (d: Date | string) => weekdayF.format(new Date(d));
export const dayNumber = (d: Date | string) => dayNumF.format(new Date(d));
export const monthLabel = (d: Date | string) => monthF.format(new Date(d));
/** Lagos calendar day as YYYY-MM-DD. */
export const dayKey = (d: Date | string) => keyF.format(new Date(d));

/** Month key YYYY-MM in Lagos. */
export const monthKey = (d: Date | string) => dayKey(d).slice(0, 7);

export const KIND: Record<EventKind, { label: string; tone: "live" | "workshop" | "meetup" | "deadline" | "exam" }> = {
  LIVE_SESSION: { label: "Live session", tone: "live" },
  WORKSHOP: { label: "Workshop", tone: "workshop" },
  MEETUP: { label: "Meetup", tone: "meetup" },
  DEADLINE: { label: "Deadline", tone: "deadline" },
  EXAM: { label: "Exam", tone: "exam" },
};

const dayMonthF = fmt({ day: "numeric", month: "long" });
/** "15 to 25 March", or "1 April to 14 May" for an exam window. */
export const examRange = (e: CommunityEvent) => {
  if (!e.endsAt || dayKey(e.endsAt) === dayKey(e.startsAt)) return dayMonthF.format(new Date(e.startsAt));
  const a = dayMonthF.format(new Date(e.startsAt));
  const b = dayMonthF.format(new Date(e.endsAt));
  const sameMonth = monthKey(e.startsAt) === monthKey(e.endsAt);
  return sameMonth ? `${a.split(" ")[0]} to ${b}` : `${a} to ${b}`;
};

const HOUR = 3600 * 1000;
export const eventEnd = (e: CommunityEvent) =>
  new Date(e.endsAt || (e.kind === "DEADLINE" ? e.startsAt : new Date(new Date(e.startsAt).getTime() + HOUR)));

export const timeRange = (e: CommunityEvent) => {
  if (e.kind === "EXAM") return examRange(e);
  if (e.kind === "DEADLINE") return `Closes ${timeLabel(e.startsAt)}`;
  return e.endsAt ? `${timeLabel(e.startsAt)} – ${timeLabel(e.endsAt)}` : timeLabel(e.startsAt);
};

export const placeLabel = (e: CommunityEvent) => {
  if (e.kind === "EXAM") return e.venue || "Exam window";
  if (e.kind === "DEADLINE") {
    if (e.format === "IN_PERSON" && (e.venue || e.address)) return e.venue || e.address || "In person";
    return e.linkUrl ? "Online" : "Deadline";
  }
  if (e.format === "ONLINE") return `Live on ${e.platform || "AlignTraits Live"}`;
  return e.venue || e.address || "In person";
};

export type EventPhase = "cancelled" | "upcoming" | "today" | "live" | "ended";

/** Where an event is in time, for its label and its buttons. */
export function eventPhase(e: CommunityEvent, now = new Date()): EventPhase {
  if (e.status === "CANCELLED") return "cancelled";
  const start = new Date(e.startsAt).getTime();
  const end = eventEnd(e).getTime();
  const t = now.getTime();
  if (e.kind === "DEADLINE") {
    if (t > start) return "ended";
    return dayKey(now) === dayKey(e.startsAt) ? "today" : "upcoming";
  }
  if (t > end) return "ended";
  if (t >= start - 10 * 60 * 1000) return "live";
  return dayKey(now) === dayKey(e.startsAt) ? "today" : "upcoming";
}

export const isPast = (e: CommunityEvent, now = new Date()) => eventPhase(e, now) === "ended";

/** "in 3 days", "tomorrow", "today", "now" */
export function relativeWhen(e: CommunityEvent, now = new Date()) {
  const phase = eventPhase(e, now);
  if (phase === "live") return "happening now";
  if (phase === "today") return "today";
  const days = Math.round(
    (Date.parse(`${dayKey(e.startsAt)}T00:00:00Z`) - Date.parse(`${dayKey(now)}T00:00:00Z`)) / (24 * HOUR)
  );
  if (days === 1) return "tomorrow";
  if (days > 1 && days < 7) return `in ${days} days`;
  return dayMedium(e.startsAt);
}

/* ----------------------------- Add to calendar ----------------------------- */

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

const locationOf = (e: CommunityEvent) =>
  e.format === "IN_PERSON" ? [e.venue, e.address].filter(Boolean).join(", ") : e.joinUrl || e.linkUrl || "Online";

const detailsOf = (e: CommunityEvent, pageUrl: string) =>
  [e.summary, e.joinUrl ? `Join: ${e.joinUrl}` : "", e.linkUrl ? `${e.linkLabel || "More info"}: ${e.linkUrl}` : "", `Details: ${pageUrl}`]
    .filter(Boolean)
    .join("\n\n");

export const eventPageUrl = (e: CommunityEvent) =>
  `${window.location.origin}/dashboard/community/events?event=${encodeURIComponent(e.id)}`;

/* Exam windows go in calendars as all-day events: first day to the day after the last day. */
const allDay = (e: CommunityEvent) => {
  const first = dayKey(e.startsAt).replace(/-/g, "");
  const last = new Date(`${dayKey(e.endsAt || e.startsAt)}T00:00:00Z`);
  last.setUTCDate(last.getUTCDate() + 1);
  return { first, after: last.toISOString().slice(0, 10).replace(/-/g, "") };
};

export function googleCalendarUrl(e: CommunityEvent) {
  const start = new Date(e.startsAt);
  const end = e.kind === "DEADLINE" ? new Date(start.getTime() + 30 * 60 * 1000) : eventEnd(e);
  const days = e.kind === "EXAM" ? allDay(e) : null;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: days ? `${days.first}/${days.after}` : `${icsDate(start)}/${icsDate(end)}`,
    details: detailsOf(e, eventPageUrl(e)),
    location: locationOf(e),
    ctz: TZ,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcs(e: CommunityEvent) {
  const start = new Date(e.startsAt);
  const end = e.kind === "DEADLINE" ? new Date(start.getTime() + 30 * 60 * 1000) : eventEnd(e);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AlignTraits//Community//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}@aligntraits.com`,
    `DTSTAMP:${icsDate(new Date())}`,
    ...(e.kind === "EXAM"
      ? [`DTSTART;VALUE=DATE:${allDay(e).first}`, `DTEND;VALUE=DATE:${allDay(e).after}`]
      : [`DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`]),
    `SUMMARY:${icsText(e.title)}`,
    `DESCRIPTION:${icsText(detailsOf(e, eventPageUrl(e)))}`,
    `LOCATION:${icsText(locationOf(e))}`,
    `URL:${eventPageUrl(e)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsText(e.title)}`,
    e.kind === "EXAM" ? "TRIGGER:-PT15H" : "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** The visible label of a link: its host and path, without https:// */
export const prettyUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
