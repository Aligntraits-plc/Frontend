import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";
import { Copy, Mail, Plus, Star, Trash2, Users, UserCheck, Send } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import {
  ambassadorInvite,
  createEventDraft,
  deleteEventDraft,
  errorMessage,
  getMyAmbassador,
  myEventDrafts,
  type MyAmbassador,
} from "../../services/roles";
import { dayMedium } from "../../components/community/eventUtils";
import ui from "../../components/community/ui.module.css";
import a from "./Ambassador.module.css";

const toIso = (date: string, time: string) => new Date(`${date}T${time}:00+01:00`).toISOString();

/* The ambassador page: your invite link, a few invite emails a day, how many
   students joined through you, and events you suggest to the AlignTraits team. */
export default function Ambassador() {
  const { setPageDesc } = useAuth();
  const [me, setMe] = useState<MyAmbassador | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [drafts, setDrafts] = useState<any[]>([]);
  const [form, setForm] = useState<{ title: string; kind: string; format: string; date: string; start: string; end: string; summary: string; joinUrl: string; venue: string } | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPageDesc({ title: "Ambassador", desc: "Your invite link and the students who joined through you" });
  }, [setPageDesc]);

  useEffect(() => {
    getMyAmbassador()
      .then(setMe)
      .catch((err) => setError(errorMessage(err, "This page is for AlignTraits ambassadors.")));
    myEventDrafts().then(setDrafts).catch(() => undefined);
  }, []);

  const copy = async () => {
    if (!me) return;
    try {
      await navigator.clipboard.writeText(me.link);
      toast.success("Link copied");
    } catch {
      toast.info(me.link);
    }
  };

  const onInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setEmailError("Enter a valid email address.");
    setEmailError("");
    setSending(true);
    try {
      const r = await ambassadorInvite(email.trim());
      toast.success(r.message);
      setEmail("");
      setMe((m) => (m ? { ...m, emailsLeftToday: r.data.emailsLeftToday, stats: { ...m.stats, invitesSent: m.stats.invitesSent + 1 } } : m));
    } catch (err) {
      setEmailError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const onSuggest = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (form.title.trim().length < 3) return setFormError("Give the event a title.");
    if (!form.date || !form.start) return setFormError("Set the date and start time.");
    if (form.end && form.end <= form.start) return setFormError("The end time must be after the start time.");
    if (form.format === "ONLINE" && form.joinUrl && !/^https:\/\//.test(form.joinUrl.trim())) return setFormError("The meeting link must start with https://");
    setFormError("");
    setSaving(true);
    try {
      const r = await createEventDraft({
        title: form.title.trim(),
        kind: form.kind,
        format: form.format,
        startsAt: toIso(form.date, form.start),
        endsAt: form.end ? toIso(form.date, form.end) : null,
        summary: form.summary,
        joinUrl: form.format === "ONLINE" ? form.joinUrl.trim() : "",
        platform: form.format === "ONLINE" ? "Online" : "",
        venue: form.format === "IN_PERSON" ? form.venue : "",
      });
      setDrafts((d) => [r.data, ...d]);
      setForm(null);
      toast.success(r.message);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const removeDraft = async (id: string) => {
    try {
      await deleteEventDraft(id);
      setDrafts((d) => d.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (error) {
    return (
      <div className={a.page}>
        <div className={ui.empty}>
          <span className={ui.emptyIcon}>
            <Star size={24} aria-hidden="true" />
          </span>
          <p className={ui.emptyTitle}>Ambassadors only</p>
          <p className={ui.emptyText}>{error} Want to help other students? Apply at aligntraits.com/community/ambassadors.</p>
        </div>
      </div>
    );
  }
  if (!me) {
    return (
      <div className={ui.loading}>
        <span className={ui.spinner} aria-label="Loading" />
      </div>
    );
  }

  const maxWeek = Math.max(1, ...me.stats.weeks.map((w) => w.joined));

  return (
    <div className={a.page}>
      <section className={a.hero}>
        <span className={a.badge}>
          <Star size={14} aria-hidden="true" /> AlignTraits ambassador
        </span>
        <h1 className={a.title}>Bring your friends to AlignTraits</h1>
        <p className={a.lead}>Share your link. Everyone who signs up through it counts as yours. WhatsApp is the quickest way.</p>
        <div className={a.linkBox}>
          <span>{me.link}</span>
          <button type="button" onClick={copy} aria-label="Copy your link">
            <Copy size={16} aria-hidden="true" />
          </button>
        </div>
        <div className={a.heroActions}>
          <a className={a.wa} href={`https://wa.me/?text=${encodeURIComponent(me.whatsappText)}`} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp size={20} aria-hidden="true" /> Share on WhatsApp
          </a>
          <button type="button" className={a.ghost} onClick={copy}>
            <Copy size={16} aria-hidden="true" /> Copy link
          </button>
        </div>
      </section>

      <section className={a.stats} aria-label="Your growth">
        <div className={a.stat}>
          <Send size={20} aria-hidden="true" />
          <p className={a.statValue}>{me.stats.invitesSent}</p>
          <p className={a.statLabel}>Invite emails sent</p>
        </div>
        <div className={a.stat}>
          <Users size={20} aria-hidden="true" />
          <p className={a.statValue}>{me.stats.joined}</p>
          <p className={a.statLabel}>Joined through you</p>
        </div>
        <div className={a.stat}>
          <UserCheck size={20} aria-hidden="true" />
          <p className={a.statValue}>{me.stats.activeStudents}</p>
          <p className={a.statLabel}>Active (verified and took the survey)</p>
        </div>
      </section>

      <section className={a.card} aria-labelledby="growth-title">
        <h2 id="growth-title" className={a.h2}>
          Joins in the last 8 weeks
        </h2>
        <div className={a.chart} role="img" aria-label={`Joins per week: ${me.stats.weeks.map((w) => w.joined).join(", ")}`}>
          {me.stats.weeks.map((w, i) => (
            <div key={i} className={a.barCol}>
              <span className={a.barValue}>{w.joined || ""}</span>
              <span className={a.bar} style={{ height: `${Math.max(4, (w.joined / maxWeek) * 100)}%` }} />
              <span className={a.barLabel}>{dayMedium(w.weekStart).split(" ").slice(1).join(" ")}</span>
            </div>
          ))}
        </div>
        {me.stats.joined === 0 && <p className={a.note} style={{ fontWeight: 600, color: "var(--at-ink)" }}>No one has joined through your link yet. Share it in your class WhatsApp group to get started.</p>}
        <p className={a.note}>Only students who verify their email and take the survey count as active. You see totals only, never who joined.</p>
      </section>

      <div className={a.two}>
        <section className={a.card} aria-labelledby="invite-title">
          <h2 id="invite-title" className={a.h2}>
            Invite by email
          </h2>
          <p className={a.note}>
            {me.emailsLeftToday} of {me.emailsPerDay} left today. Each address can only be invited once.
          </p>
          <form onSubmit={onInvite} noValidate className={a.inviteForm}>
            <label className={a.field}>
              <span className={ui.srOnly}>Friend's email address</span>
              <Mail size={16} aria-hidden="true" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="friend@gmail.com" />
            </label>
            <button type="submit" className={ui.primary} disabled={sending || me.emailsLeftToday === 0}>
              Send invite
            </button>
          </form>
          {emailError && <p className={a.error}>{emailError}</p>}
        </section>

        <section className={a.card} aria-labelledby="events-title">
          <div className={a.cardHead}>
            <h2 id="events-title" className={a.h2}>
              Suggest an event
            </h2>
            {!form && (
              <button
                type="button"
                className={`${ui.secondary} ${ui.small}`}
                onClick={() => setForm({ title: "", kind: "MEETUP", format: "ONLINE", date: "", start: "16:00", end: "17:00", summary: "", joinUrl: "", venue: "" })}
              >
                <Plus size={16} aria-hidden="true" /> New
              </button>
            )}
          </div>
          <p className={a.note}>A study group or a session for your school. The AlignTraits team checks every suggestion before students see it.</p>
          {form && (
            <form onSubmit={onSuggest} noValidate className={a.eventForm}>
              <label className={a.label}>
                Title
                <input className={a.input} value={form.title} maxLength={140} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="UTME study group: Physics" />
              </label>
              <div className={a.row}>
                <label className={a.label}>
                  Type
                  <select className={a.input} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                    <option value="MEETUP">Meetup or study group</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="LIVE_SESSION">Live session</option>
                  </select>
                </label>
                <label className={a.label}>
                  Where
                  <select className={a.input} value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                    <option value="ONLINE">Online</option>
                    <option value="IN_PERSON">In person</option>
                  </select>
                </label>
              </div>
              <div className={a.row3}>
                <label className={a.label}>
                  Date
                  <input className={a.input} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </label>
                <label className={a.label}>
                  Starts
                  <input className={a.input} type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                </label>
                <label className={a.label}>
                  Ends
                  <input className={a.input} type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
                </label>
              </div>
              {form.format === "ONLINE" ? (
                <label className={a.label}>
                  Meeting link (optional)
                  <input className={a.input} value={form.joinUrl} onChange={(e) => setForm({ ...form, joinUrl: e.target.value })} placeholder="https://meet.google.com/..." />
                </label>
              ) : (
                <label className={a.label}>
                  Venue
                  <input className={a.input} value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="School library" />
                </label>
              )}
              <label className={a.label}>
                What will happen
                <textarea className={a.input} style={{ minHeight: 80, paddingTop: 8 }} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              </label>
              {formError && <p className={a.error}>{formError}</p>}
              <div className={a.formActions}>
                <button type="button" className={ui.secondary} onClick={() => setForm(null)}>
                  Cancel
                </button>
                <button type="submit" className={ui.primary} disabled={saving}>
                  Send for approval
                </button>
              </div>
            </form>
          )}
          {drafts.length > 0 && (
            <ul className={a.drafts}>
              {drafts.map((d) => (
                <li key={d.id} className={a.draft}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className={a.draftTitle}>{d.title}</p>
                    <p className={a.note}>
                      {dayMedium(d.startsAt)} · {d.status === "DRAFT" ? "Waiting for approval" : d.status === "CANCELLED" ? "Cancelled" : "Approved"}
                    </p>
                  </div>
                  {d.status === "DRAFT" && (
                    <button type="button" className={ui.iconBtn} onClick={() => removeDraft(d.id)} aria-label={`Delete ${d.title}`}>
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
