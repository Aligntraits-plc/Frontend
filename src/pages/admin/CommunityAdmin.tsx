import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import {
  adminCancelEvent,
  adminCreateEvent,
  adminDeleteEvent,
  adminDeleteMessage,
  adminGetChannelMessages,
  adminGetChannels,
  adminGetEvents,
  adminGetInbox,
  adminGetReports,
  adminGetThread,
  adminKeepMessage,
  adminMuteUser,
  adminPinMessage,
  adminPostMessage,
  adminReply,
  adminUpdateChannel,
  adminUpdateEvent,
  errorMessage,
  type AdminChannel,
  type AdminMessage,
  type AdminReportGroup,
  type CommunityEvent,
  type EventFormat,
  type EventKind,
  type InboxThread,
  type TeamMessage,
} from "../../services/community";

/*
  Admin panel > Community: events, the two channels, reports from students and
  the shared AlignTraits team inbox. Every admin sees the same inbox.
*/

const TZ = "Africa/Lagos";
const KIND_LABEL: Record<EventKind, string> = {
  LIVE_SESSION: "Live session",
  WORKSHOP: "Workshop",
  MEETUP: "Meetup",
  DEADLINE: "Deadline",
  EXAM: "Exam (date range)",
};
const KIND_CLASS: Record<EventKind, string> = {
  LIVE_SESSION: "bg-[#E6F2FF] text-[#0071ED]",
  WORKSHOP: "bg-[#FDF4DA] text-[#8A6100]",
  MEETUP: "bg-[#E3F4EA] text-[#1B7F4D]",
  DEADLINE: "bg-[#FBEAEA] text-[#C23B3B]",
  EXAM: "bg-[#E6ECF3] text-[#004085]",
};

const when = (iso: string) =>
  `${new Date(iso).toLocaleDateString("en-GB", { timeZone: TZ, weekday: "short", day: "numeric", month: "short", year: "numeric" })}, ${new Date(iso).toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" })}`;
const lagosDate = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const lagosTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
const toIso = (date: string, time: string) => new Date(`${date}T${time}:00+01:00`).toISOString();

const input = "h-11 w-full rounded-lg border border-[#D0D5DD] px-3 text-[15px] font-normal focus:border-[#004085] focus:outline-none";
const label = "flex flex-col gap-1.5 text-[14px] font-medium text-[#344054]";
const btnPrimary = "h-11 rounded-lg bg-[#004085] px-5 text-[15px] font-semibold text-white hover:bg-[#003366] disabled:opacity-60";
const btnSecondary = "h-10 rounded-lg border border-[#D0D5DD] bg-white px-4 text-[14px] font-semibold text-[#344054] hover:bg-[#F9FAFB] disabled:opacity-60";
const btnDanger = "h-10 rounded-lg border border-[#FDA29B] bg-white px-4 text-[14px] font-semibold text-[#B42318] hover:bg-[#FEF3F2] disabled:opacity-60";

type Tab = "events" | "channels" | "reports" | "inbox";

export default function CommunityAdmin() {
  const [params] = useSearchParams();
  const { admin } = useAuth();
  // Content managers look after exam dates and deadlines only.
  const contentOnly = (admin as any)?.role === "CONTENT_MANAGER";
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "events");
  const [reportCount, setReportCount] = useState(0);
  const [inboxUnread, setInboxUnread] = useState(0);

  useEffect(() => {
    if (contentOnly) return;
    adminGetReports()
      .then((r) => setReportCount(r.length))
      .catch(() => undefined);
    adminGetInbox()
      .then((t) => setInboxUnread(t.reduce((a, b) => a + b.unread, 0)))
      .catch(() => undefined);
  }, [tab]);

  const tabs: { id: Tab; label: string; count?: number }[] = contentOnly
    ? [{ id: "events", label: "Exam dates and deadlines" }]
    : [
        { id: "events", label: "Events" },
        { id: "channels", label: "Channels" },
        { id: "reports", label: "Reports", count: reportCount },
        { id: "inbox", label: "Team inbox", count: inboxUnread },
      ];

  return (
    <div className="flex w-full flex-col gap-5 p-4 sm:p-5 xl:p-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#101828] sm:text-[22px]">{contentOnly ? "Exam dates and deadlines" : "Community"}</h1>
        <p className="mt-1 max-w-[720px] text-[14px] text-[#475467]">
          {contentOnly
            ? "Keep official exam windows and admission deadlines accurate. Students see them in Community, Events. Times are West Africa Time (Lagos)."
            : "Post events, approve events suggested by ambassadors, keep the channels safe and answer students who message the AlignTraits team. Times are West Africa Time (Lagos)."}
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-[14px] font-semibold ${
              tab === t.id ? "bg-white text-[#004085] shadow-sm" : "text-[#475467] hover:text-[#101828]"
            }`}
          >
            {t.label}
            {t.count ? <span className="rounded-full bg-[#F6C648] px-2 text-[12px] font-bold text-[#002650]">{t.count}</span> : null}
          </button>
        ))}
      </div>

      {tab === "events" && <EventsTab contentOnly={contentOnly} showDrafts={params.get("show") === "drafts"} />}
      {tab === "channels" && <ChannelsTab />}
      {tab === "reports" && <ReportsTab onCount={setReportCount} />}
      {tab === "inbox" && <InboxTab onUnread={setInboxUnread} />}
    </div>
  );
}

/* ----------------------------- Events ----------------------------- */

type EventForm = {
  title: string;
  kind: EventKind;
  format: EventFormat;
  date: string;
  endDate: string;
  start: string;
  end: string;
  hostName: string;
  hostRole: string;
  platform: string;
  joinUrl: string;
  venue: string;
  address: string;
  mapUrl: string;
  linkUrl: string;
  linkLabel: string;
  summary: string;
  agenda: string;
  recordingUrl: string;
};

const blankForm = (): EventForm => ({
  title: "",
  kind: "LIVE_SESSION",
  format: "ONLINE",
  date: "",
  endDate: "",
  start: "16:00",
  end: "17:00",
  hostName: "",
  hostRole: "",
  platform: "AlignTraits Live",
  joinUrl: "",
  venue: "",
  address: "",
  mapUrl: "",
  linkUrl: "",
  linkLabel: "",
  summary: "",
  agenda: "",
  recordingUrl: "",
});

const formFrom = (e: CommunityEvent): EventForm => ({
  title: e.title,
  kind: e.kind,
  format: e.format,
  date: lagosDate(e.startsAt),
  endDate: e.endsAt ? lagosDate(e.endsAt) : "",
  start: lagosTime(e.startsAt),
  end: e.endsAt ? lagosTime(e.endsAt) : "",
  hostName: e.hostName || "",
  hostRole: e.hostRole || "",
  platform: e.platform || "",
  joinUrl: e.joinUrl || "",
  venue: e.venue || "",
  address: e.address || "",
  mapUrl: "",
  linkUrl: e.linkUrl || "",
  linkLabel: e.linkLabel || "",
  summary: e.summary || "",
  agenda: e.agenda.join("\n"),
  recordingUrl: e.recordingUrl || "",
});

function EventsTab({ contentOnly, showDrafts }: { contentOnly: boolean; showDrafts: boolean }) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<EventForm | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () =>
    adminGetEvents()
      .then(setEvents)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const now = Date.now();
  const mine = contentOnly ? events.filter((e) => e.kind === "EXAM" || e.kind === "DEADLINE") : events;
  // Ambassadors' suggestions wait here until an admin approves them.
  const drafts = mine.filter((e) => e.status === "DRAFT");
  const live = mine.filter((e) => e.status !== "DRAFT");
  const upcoming = live.filter((e) => new Date(e.endsAt || e.startsAt).getTime() >= now).reverse();
  const past = live.filter((e) => new Date(e.endsAt || e.startsAt).getTime() < now);

  const approve = async (e: CommunityEvent) => {
    try {
      const saved = await adminUpdateEvent(e.id, { status: "SCHEDULED" });
      setEvents((list) => list.map((x) => (x.id === saved.id ? { ...saved, suggestedBy: null } : x)));
      toast.success("Approved. Students can see it now.");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const set = <K extends keyof EventForm>(k: K, v: EventForm[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!form) return;
    if (form.title.trim().length < 3) return setFormError("Give the event a title.");
    if (!form.date || !form.start) return setFormError("Set the date and the time.");
    const deadline = form.kind === "DEADLINE";
    const exam = form.kind === "EXAM";
    if (exam && (!form.endDate || form.endDate < form.date)) return setFormError("Set the last day of the exam, on or after the first day.");
    if (!deadline && !exam && form.end && form.end <= form.start) return setFormError("The end time must be after the start time.");
    setFormError("");
    // Exams are a date range: they start in the morning of the first day and end in the evening of the last day.
    const examStart = editing && events.find((x) => x.id === editing)?.kind === "EXAM" ? form.start : "09:00";
    const body: Record<string, unknown> = {
      title: form.title.trim(),
      kind: form.kind,
      format: exam ? "IN_PERSON" : form.format,
      startsAt: toIso(form.date, exam ? examStart : form.start),
      endsAt: exam ? toIso(form.endDate, "18:00") : !deadline && form.end ? toIso(form.date, form.end) : null,
      hostName: form.hostName,
      hostRole: form.hostRole,
      platform: form.format === "ONLINE" ? form.platform : "",
      joinUrl: form.format === "ONLINE" && !deadline ? form.joinUrl.trim() : "",
      venue: exam || form.format === "IN_PERSON" ? form.venue : "",
      address: !exam && form.format === "IN_PERSON" ? form.address : "",
      mapUrl: !exam && form.format === "IN_PERSON" ? form.mapUrl.trim() : "",
      linkUrl: form.linkUrl.trim(),
      linkLabel: form.linkLabel,
      summary: form.summary,
      agenda: form.agenda,
      recordingUrl: form.recordingUrl.trim(),
    };
    setSaving(true);
    try {
      if (editing) {
        const saved = await adminUpdateEvent(editing, body);
        setEvents((list) => list.map((e) => (e.id === saved.id ? saved : e)));
        toast.success("Event saved");
      } else {
        const created = await adminCreateEvent(body);
        setEvents((list) => [created, ...list].sort((a, b) => b.startsAt.localeCompare(a.startsAt)));
        toast.success("Event created. Students can see it now.");
      }
      setForm(null);
      setEditing(null);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (e: CommunityEvent) => {
    try {
      const saved = await adminCancelEvent(e.id);
      setEvents((list) => list.map((x) => (x.id === saved.id ? saved : x)));
      toast.success(`Cancelled. ${e.reminderCount ? `${e.reminderCount} students with reminders will get an email.` : ""}`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const restore = async (e: CommunityEvent) => {
    try {
      const saved = await adminUpdateEvent(e.id, { status: "SCHEDULED" });
      setEvents((list) => list.map((x) => (x.id === saved.id ? saved : x)));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async (e: CommunityEvent) => {
    try {
      await adminDeleteEvent(e.id);
      setEvents((list) => list.filter((x) => x.id !== e.id));
      toast.success("Event deleted");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const row = (e: CommunityEvent) => (
    <li key={e.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${KIND_CLASS[e.kind]}`}>{KIND_LABEL[e.kind]}</span>
          <span className="rounded-full bg-[#F2F4F7] px-2.5 py-0.5 text-[12px] font-semibold text-[#475467]">
            {e.format === "ONLINE" ? "Online" : "In person"}
          </span>
          {e.status === "CANCELLED" && <span className="rounded-full bg-[#FEE4E2] px-2.5 py-0.5 text-[12px] font-semibold text-[#B42318]">Cancelled</span>}
          {e.status === "DRAFT" && (
            <span className="rounded-full bg-[#FEF6DD] px-2.5 py-0.5 text-[12px] font-semibold text-[#7A5A00]">
              Waiting for approval{e.suggestedBy ? ` · suggested by ${e.suggestedBy}` : ""}
            </span>
          )}
        </div>
        <p className={`mt-1 text-[15px] font-semibold text-[#101828] ${e.status === "CANCELLED" ? "line-through" : ""}`}>{e.title}</p>
        <p className="text-[13px] text-[#667085]">
          {when(e.startsAt)} · {e.reminderCount} {e.reminderCount === 1 ? "reminder" : "reminders"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btnSecondary}
          onClick={() => {
            setEditing(e.id);
            setForm(formFrom(e));
            setFormError("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Edit
        </button>
        {e.status === "DRAFT" ? (
          <button type="button" className={btnPrimary.replace("h-11", "h-10")} onClick={() => approve(e)}>
            Approve
          </button>
        ) : e.status === "SCHEDULED" ? (
          <button type="button" className={btnDanger} onClick={() => cancel(e)}>
            Cancel event
          </button>
        ) : (
          <button type="button" className={btnSecondary} onClick={() => restore(e)}>
            Restore
          </button>
        )}
        {confirmDelete === e.id ? (
          <button type="button" className={btnDanger + " bg-[#FEF3F2]"} onClick={() => remove(e)}>
            Yes, delete for good
          </button>
        ) : (
          <button type="button" className={btnDanger} onClick={() => setConfirmDelete(e.id)} aria-label={`Delete ${e.title}`}>
            Delete
          </button>
        )}
      </div>
    </li>
  );

  const deadline = form?.kind === "DEADLINE";
  const exam = form?.kind === "EXAM";

  return (
    <div className="flex flex-col gap-5">
      {!form ? (
        <div>
          <button
            type="button"
            className={btnPrimary}
            onClick={() => {
              setEditing(null);
              setForm(contentOnly ? { ...blankForm(), kind: "DEADLINE" } : blankForm());
              setFormError("");
            }}
          >
            New event
          </button>
        </div>
      ) : (
        <form onSubmit={save} noValidate className="rounded-2xl border border-[#EAECF0] bg-white p-4 sm:p-5">
          <h2 className="text-[16px] font-semibold text-[#101828]">{editing ? "Edit event" : "New event"}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className={`${label} md:col-span-2`}>
              Title
              <input className={input} value={form.title} maxLength={140} onChange={(e) => set("title", e.target.value)} placeholder="Ask a senior: choosing your course" />
            </label>
            <label className={label}>
              Type
              <select className={input} value={form.kind} onChange={(e) => set("kind", e.target.value as EventKind)}>
                {Object.entries(KIND_LABEL)
                  .filter(([k]) => !contentOnly || k === "EXAM" || k === "DEADLINE")
                  .map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            {exam ? (
              <label className={label}>
                Where students sit it
                <input className={input} value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Your JAMB CBT centre" />
              </label>
            ) : (
            <fieldset className={label}>
              <legend className="mb-1.5">Where</legend>
              <div className="flex gap-2">
                {(["ONLINE", "IN_PERSON"] as EventFormat[]).map((f) => (
                  <label
                    key={f}
                    className={`flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border text-[14px] ${
                      form.format === f ? "border-[#004085] bg-[#E6ECF3] font-semibold text-[#004085]" : "border-[#D0D5DD]"
                    }`}
                  >
                    <input type="radio" className="sr-only" name="format" checked={form.format === f} onChange={() => set("format", f)} />
                    {f === "ONLINE" ? "Online" : "In person"}
                  </label>
                ))}
              </div>
            </fieldset>
            )}
            <label className={label}>
              {exam ? "First day" : "Date"}
              <input type="date" className={input} value={form.date} onChange={(e) => set("date", e.target.value)} />
            </label>
            {exam ? (
              <label className={label}>
                Last day
                <input type="date" className={input} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </label>
            ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className={label}>
                {deadline ? "Closes at" : "Starts"}
                <input type="time" className={input} value={form.start} onChange={(e) => set("start", e.target.value)} />
              </label>
              {!deadline && (
                <label className={label}>
                  Ends
                  <input type="time" className={input} value={form.end} onChange={(e) => set("end", e.target.value)} />
                </label>
              )}
            </div>
            )}

            {form.format === "ONLINE" && !deadline && !exam && (
              <>
                <label className={label}>
                  Platform
                  <input className={input} value={form.platform} onChange={(e) => set("platform", e.target.value)} placeholder="AlignTraits Live, Google Meet..." />
                </label>
                <label className={label}>
                  Meeting link
                  <input className={input} value={form.joinUrl} onChange={(e) => set("joinUrl", e.target.value)} placeholder="https://meet.google.com/..." inputMode="url" />
                </label>
              </>
            )}
            {form.format === "IN_PERSON" && !exam && (
              <>
                <label className={label}>
                  Venue
                  <input className={input} value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Yaba Tech Hub" />
                </label>
                <label className={label}>
                  Address
                  <input className={input} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="12 Herbert Macaulay Way, Yaba, Lagos" />
                </label>
                <label className={`${label} md:col-span-2`}>
                  Map link (optional, made from the address when empty)
                  <input className={input} value={form.mapUrl} onChange={(e) => set("mapUrl", e.target.value)} placeholder="https://maps.google.com/..." inputMode="url" />
                </label>
              </>
            )}
            <label className={label}>
              {deadline || exam ? "Official link" : "More information link (optional)"}
              <input className={input} value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} placeholder="https://www.jamb.gov.ng" inputMode="url" />
            </label>
            <label className={label}>
              Link button text
              <input className={input} value={form.linkLabel} maxLength={60} onChange={(e) => set("linkLabel", e.target.value)} placeholder="Open jamb.gov.ng" />
            </label>
            {!deadline && !exam && (
              <>
                <label className={label}>
                  Host name
                  <input className={input} value={form.hostName} onChange={(e) => set("hostName", e.target.value)} placeholder="Ope Quadri" />
                </label>
                <label className={label}>
                  Host role
                  <input className={input} value={form.hostRole} onChange={(e) => set("hostRole", e.target.value)} placeholder="AlignTraits mentor" />
                </label>
              </>
            )}
            <label className={`${label} md:col-span-2`}>
              About
              <textarea className={`${input} h-auto py-2`} rows={3} value={form.summary} maxLength={3000} onChange={(e) => set("summary", e.target.value)} />
            </label>
            <label className={`${label} md:col-span-2`}>
              {deadline || exam ? "Checklist (one per line)" : "What we'll cover (one per line)"}
              <textarea className={`${input} h-auto py-2`} rows={3} value={form.agenda} onChange={(e) => set("agenda", e.target.value)} />
            </label>
            {form.format === "ONLINE" && !deadline && !exam && (
              <label className={`${label} md:col-span-2`}>
                Recording link (add after the session)
                <input className={input} value={form.recordingUrl} onChange={(e) => set("recordingUrl", e.target.value)} placeholder="https://youtube.com/..." inputMode="url" />
              </label>
            )}
          </div>
          {formError && (
            <p role="alert" className="mt-3 text-[14px] text-[#B42318]">
              {formError}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? <BeatLoader size={8} color="#FFFFFF" /> : editing ? "Save event" : "Create event"}
            </button>
            <button
              type="button"
              className={btnSecondary + " h-11"}
              onClick={() => {
                setForm(null);
                setEditing(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <BeatLoader size={10} color="#004085" />
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-[#EAECF0] bg-white">
            {(drafts.length > 0 || showDrafts) && !contentOnly && (
              <div className="border-b border-[#EAECF0] bg-[#FFFCF2]">
                <h2 className="px-4 pt-3 text-[16px] font-semibold text-[#101828]">Waiting for approval ({drafts.length})</h2>
                <p className="px-4 pb-1 text-[13px] text-[#667085]">Suggested by ambassadors. Edit if needed, then approve. Delete anything that is not right.</p>
                {drafts.length === 0 ? (
                  <p className="px-4 pb-4 text-[14px] text-[#475467]">Nothing waiting.</p>
                ) : (
                  <ul className="divide-y divide-[#EAECF0]">{drafts.map(row)}</ul>
                )}
              </div>
            )}
            <h2 className="border-b border-[#EAECF0] px-4 py-3 text-[16px] font-semibold text-[#101828]">Upcoming ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <p className="px-4 py-6 text-[14px] text-[#475467]">No upcoming events. Add the next live session or an official deadline.</p>
            ) : (
              <ul className="divide-y divide-[#EAECF0]">{upcoming.map(row)}</ul>
            )}
          </section>
          {past.length > 0 && (
            <section className="rounded-2xl border border-[#EAECF0] bg-white">
              <h2 className="border-b border-[#EAECF0] px-4 py-3 text-[16px] font-semibold text-[#101828]">Past ({past.length})</h2>
              <ul className="divide-y divide-[#EAECF0]">{past.map(row)}</ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

/* ----------------------------- Channels ----------------------------- */

function ChannelsTab() {
  const [channels, setChannels] = useState<AdminChannel[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [desc, setDesc] = useState("");
  const [welcome, setWelcome] = useState("");
  const [busy, setBusy] = useState(false);
  const channel = channels.find((c) => c.id === active) || null;

  useEffect(() => {
    adminGetChannels()
      .then((list) => {
        setChannels(list);
        if (list[0]) setActive(list[0].id);
      })
      .catch((err) => toast.error(errorMessage(err)));
  }, []);

  useEffect(() => {
    if (!channel) return;
    setDesc(channel.description);
    setWelcome(channel.welcome);
    adminGetChannelMessages(channel.id)
      .then((r) => setMessages(r.messages))
      .catch((err) => toast.error(errorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const saveChannel = async () => {
    if (!channel) return;
    setBusy(true);
    try {
      await adminUpdateChannel(channel.id, { description: desc, welcome });
      setChannels((list) => list.map((c) => (c.id === channel.id ? { ...c, description: desc, welcome } : c)));
      toast.success("Channel saved");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const post = async (e: FormEvent) => {
    e.preventDefault();
    if (!channel || !draft.trim()) return;
    setBusy(true);
    try {
      const m = await adminPostMessage(channel.id, draft);
      setMessages((list) => [...list, m]);
      setDraft("");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const pin = async (m: AdminMessage) => {
    try {
      await adminPinMessage(m.id, !m.pinned);
      setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, pinned: !m.pinned } : x)));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async (m: AdminMessage) => {
    try {
      await adminDeleteMessage(m.id);
      setMessages((list) => list.filter((x) => x.id !== m.id));
      toast.success("Message deleted");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {channels.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={`rounded-lg border px-4 py-2 text-left text-[14px] ${active === c.id ? "border-[#004085] bg-[#E6ECF3]" : "border-[#D0D5DD] bg-white"}`}
          >
            <span className="block font-semibold text-[#101828]">#{c.name}</span>
            <span className="text-[12px] text-[#667085]">
              {c.memberCount} members · {c.messageCount} messages{c.openReports ? ` · ${c.openReports} reports` : ""}
            </span>
          </button>
        ))}
      </div>

      {channel && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="flex flex-col rounded-2xl border border-[#EAECF0] bg-white">
            <h2 className="border-b border-[#EAECF0] px-4 py-3 text-[16px] font-semibold text-[#101828]">Messages in #{channel.name}</h2>
            <ul className="max-h-[560px] divide-y divide-[#EAECF0] overflow-y-auto">
              {messages.length === 0 && <li className="px-4 py-6 text-[14px] text-[#475467]">No messages yet. Post a welcome to start the channel.</li>}
              {messages.map((m) => (
                <li key={m.id} className={`px-4 py-3 ${m.hidden ? "bg-[#FEF3F2]" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2 text-[13px]">
                    <span className="font-semibold text-[#101828]">{m.author.name}</span>
                    {m.fromStaff && <span className="rounded bg-[#004085] px-1.5 text-[11px] font-bold text-white">AlignTraits</span>}
                    <span className="text-[#667085]">{when(m.createdAt)}</span>
                    {m.pinned && <span className="font-semibold text-[#8A6100]">Pinned</span>}
                    {m.hidden && <span className="font-semibold text-[#B42318]">Hidden after {m.reportCount} reports</span>}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-[14px] text-[#344054]">{m.body}</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" className={btnSecondary + " h-8 px-3 text-[13px]"} onClick={() => pin(m)}>
                      {m.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button type="button" className={btnDanger + " h-8 px-3 text-[13px]"} onClick={() => remove(m)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <form onSubmit={post} className="flex flex-col gap-2 border-t border-[#EAECF0] p-4 sm:flex-row">
              <textarea
                className={`${input} h-auto min-h-[44px] flex-1 py-2`}
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Post in #${channel.name} as AlignTraits`}
                aria-label={`Post in #${channel.name} as AlignTraits`}
              />
              <button type="submit" className={btnPrimary} disabled={busy || !draft.trim()}>
                Post
              </button>
            </form>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-[#EAECF0] bg-white p-4">
            <h2 className="text-[16px] font-semibold text-[#101828]">Channel details</h2>
            <label className={label}>
              Short description
              <input className={input} value={desc} maxLength={160} onChange={(e) => setDesc(e.target.value)} />
            </label>
            <label className={label}>
              Welcome message (top of the channel)
              <textarea className={`${input} h-auto py-2`} rows={5} value={welcome} maxLength={600} onChange={(e) => setWelcome(e.target.value)} />
            </label>
            <button type="button" className={btnPrimary} onClick={saveChannel} disabled={busy}>
              Save details
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Reports ----------------------------- */

function ReportsTab({ onCount }: { onCount: (n: number) => void }) {
  const [groups, setGroups] = useState<AdminReportGroup[] | null>(null);

  const load = () =>
    adminGetReports()
      .then((g) => {
        setGroups(g);
        onCount(g.length);
      })
      .catch((err) => toast.error(errorMessage(err)));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = async (fn: () => Promise<unknown>, done: string) => {
    try {
      await fn();
      toast.success(done);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (!groups)
    return (
      <div className="flex justify-center py-10">
        <BeatLoader size={10} color="#004085" />
      </div>
    );

  if (groups.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-[#D0D5DD] bg-white px-5 py-10 text-center">
        <p className="text-[16px] font-semibold text-[#101828]">No reports to review</p>
        <p className="mt-1 text-[14px] text-[#475467]">When students report a message, it shows here. Messages reported 3 times are hidden until you decide.</p>
      </div>
    );

  return (
    <ul className="flex flex-col gap-3">
      {groups.map((g) => (
        <li key={g.message.id} className="rounded-2xl border border-[#EAECF0] bg-white p-4">
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="font-semibold text-[#101828]">{g.message.author.name}</span>
            <span className="text-[#667085]">{g.message.author.email}</span>
            <span className="text-[#667085]">· #{g.message.channel.name} · {when(g.message.createdAt)}</span>
            {g.message.hidden && <span className="rounded-full bg-[#FEE4E2] px-2 font-semibold text-[#B42318]">Hidden</span>}
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-[#F9FAFB] p-3 text-[14px] text-[#344054]">{g.message.body}</p>
          <p className="mt-2 text-[13px] font-semibold text-[#344054]">
            {g.reports.length} {g.reports.length === 1 ? "report" : "reports"}
          </p>
          <ul className="mt-1 list-disc pl-5 text-[13px] text-[#475467]">
            {g.reports.map((r, i) => (
              <li key={i}>
                {r.reason || "No reason given"} <span className="text-[#98A2B3]">({r.reporter})</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={btnSecondary} onClick={() => act(() => adminKeepMessage(g.message.id), "Kept and shown again")}>
              Keep message
            </button>
            <button type="button" className={btnDanger} onClick={() => act(() => adminDeleteMessage(g.message.id), "Message deleted")}>
              Delete message
            </button>
            <button type="button" className={btnDanger} onClick={() => act(() => adminMuteUser(g.message.author.id, 1), "Muted for 1 day")}>
              Mute 1 day
            </button>
            <button type="button" className={btnDanger} onClick={() => act(() => adminMuteUser(g.message.author.id, 7), "Muted for 7 days")}>
              Mute 7 days
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------- Team inbox ----------------------------- */

function InboxTab({ onUnread }: { onUnread: (n: number) => void }) {
  const [threads, setThreads] = useState<InboxThread[] | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [thread, setThread] = useState<{ id: string; student: InboxThread["student"]; messages: TeamMessage[] } | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const loadThreads = () =>
    adminGetInbox()
      .then((t) => {
        setThreads(t);
        onUnread(t.reduce((a, b) => a + b.unread, 0));
      })
      .catch((err) => toast.error(errorMessage(err)));
  useEffect(() => {
    loadThreads();
    const id = setInterval(loadThreads, 20000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = async (id: string) => {
    setActive(id);
    setThread(null);
    try {
      setThread(await adminGetThread(id));
      setThreads((list) => (list ? list.map((t) => (t.id === id ? { ...t, unread: 0 } : t)) : list));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!active || !reply.trim()) return;
    setSending(true);
    try {
      const m = await adminReply(active, reply);
      setThread((t) => (t ? { ...t, messages: [...t.messages, m] } : t));
      setReply("");
      loadThreads();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const sorted = useMemo(() => threads || [], [threads]);

  if (!threads)
    return (
      <div className="flex justify-center py-10">
        <BeatLoader size={10} color="#004085" />
      </div>
    );

  if (threads.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-[#D0D5DD] bg-white px-5 py-10 text-center">
        <p className="text-[16px] font-semibold text-[#101828]">No messages yet</p>
        <p className="mt-1 text-[14px] text-[#475467]">When a student messages the AlignTraits team from Community, the conversation shows here.</p>
      </div>
    );

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <ul className={`divide-y divide-[#EAECF0] overflow-hidden rounded-2xl border border-[#EAECF0] bg-white ${active ? "hidden lg:block" : ""}`}>
        {sorted.map((t) => (
          <li key={t.id}>
            <button type="button" onClick={() => open(t.id)} className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[#F9FAFB] ${active === t.id ? "bg-[#E6ECF3]" : ""}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F2FF] text-[12px] font-bold text-[#0071ED]">{t.student.initials}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className={`truncate text-[14px] ${t.unread ? "font-bold" : "font-semibold"} text-[#101828]`}>{t.student.name}</span>
                  {t.unread > 0 && <span className="rounded-full bg-[#F6C648] px-2 text-[12px] font-bold text-[#002650]">{t.unread}</span>}
                </span>
                <span className="block truncate text-[13px] text-[#667085]">
                  {t.lastMessage ? `${t.lastMessage.fromStaff ? "You: " : ""}${t.lastMessage.body}` : ""}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <section className="flex min-h-[420px] flex-col rounded-2xl border border-[#EAECF0] bg-white">
          <div className="flex items-center gap-3 border-b border-[#EAECF0] px-4 py-3">
            <button type="button" className={btnSecondary + " lg:hidden"} onClick={() => setActive(null)}>
              Back
            </button>
            {thread && (
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-[#101828]">{thread.student.name}</p>
                <p className="truncate text-[13px] text-[#667085]">
                  {thread.student.email}
                  {thread.student.region ? ` · ${thread.student.region}` : ""}
                </p>
              </div>
            )}
          </div>
          <ul className="flex max-h-[520px] flex-1 flex-col gap-3 overflow-y-auto p-4">
            {!thread ? (
              <li className="flex justify-center py-6">
                <BeatLoader size={8} color="#004085" />
              </li>
            ) : (
              thread.messages.map((m) => (
                <li key={m.id} className={`max-w-[85%] rounded-2xl px-4 py-2 ${m.fromStaff ? "self-end bg-[#004085] text-white" : "self-start bg-[#F2F4F7] text-[#101828]"}`}>
                  <p className={`text-[12px] ${m.fromStaff ? "text-[#CCD9E7]" : "text-[#667085]"}`}>
                    {m.author.name} · {when(m.createdAt)}
                  </p>
                  <p className="whitespace-pre-wrap break-words text-[14px]">{m.body}</p>
                </li>
              ))
            )}
          </ul>
          <form onSubmit={send} className="flex flex-col gap-2 border-t border-[#EAECF0] p-4 sm:flex-row">
            <textarea
              className={`${input} h-auto min-h-[44px] flex-1 py-2`}
              rows={2}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply as the AlignTraits team"
              aria-label="Reply as the AlignTraits team"
            />
            <button type="submit" className={btnPrimary} disabled={sending || !reply.trim()}>
              Send reply
            </button>
          </form>
          <p className="px-4 pb-3 text-[12px] text-[#667085]">The student gets an email if they're not on the page. Every admin can see this conversation.</p>
        </section>
      )}
    </div>
  );
}
