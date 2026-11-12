import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";
import { ArrowRight, Bookmark, CalendarPlus, Check, Copy, FileText, Info, MapPin, Plus, School, Send, ShieldCheck, Star, Trash2, X } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import {
  errorMessage,
  getParentLink,
  getStudentHome,
  naira,
  removeApplication,
  removeShortlist,
  saveApplication,
  saveShortlist,
  schoolNoticeSeen,
  type HomeMatch,
  type MatchOption,
  type StudentHome,
} from "../../services/roles";
import { googleCalendarUrl } from "../../components/community/eventUtils";
import type { CommunityEvent } from "../../services/community";
import h from "../../components/home/Home.module.css";

const TZ = "Africa/Lagos";
const greeting = () => {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: TZ }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};
const todayLabel = () => new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(new Date());

const TIER_PILL: Record<MatchOption["tier"], string> = { reach: h.pillReach, realistic: h.pillRealistic, safety: h.pillSafety };
const TIER_FILL: Record<MatchOption["tier"], string> = { reach: h.fillReach, realistic: h.fillRealistic, safety: h.fillSafety };
const TIER_DOT: Record<MatchOption["tier"], string> = { reach: h.dotReach, realistic: h.dotRealistic, safety: h.dotSafety };
const SCHOOL_TYPE: Record<string, string> = { FEDERAL_UNIVERSITY: "Federal university", PRIVATE_UNIVERSITY: "Private university", PUBLIC_UNIVERSITY: "State university" };

/* The next step on the student's path: what it is, why, and where to do it. */
function nextStep(home: StudentHome) {
  const now = home.steps.find((s) => s.current)?.key;
  switch (now) {
    case "survey":
      return { title: "Take the career survey.", text: "14 quick questions about how you learn, decide and work. It takes about 5 minutes and shapes everything else here.", cta: "Start the survey", to: "/career-recommedation", why: "Your answers point to careers that suit you, and those careers point to the courses worth checking." };
    case "careers":
      return { title: "See your career path.", text: "Your survey results are ready. See the careers that fit you and the courses that lead to them.", cta: "See my career path", to: "/dashboard/career-pathway", why: "Knowing the careers that suit you makes it easier to pick courses you will enjoy and finish." };
    case "results":
      return { title: "Add your exam results.", text: "Add your WAEC or NECO grades and your UTME score so we can compare you with each course's requirements.", cta: "Add my results", to: "/dashboard/settings/records", why: "Admission depends on your subjects, grades and UTME score. Without them we can't tell you where you stand." };
    case "matches":
      return home.matchesChecked
        ? { title: "Build a balanced shortlist.", text: `You have options across ${home.top.filter((t) => !("empty" in t)).length} admission tiers. Save one of each before you apply.`, cta: "See my matches", to: "/dashboard/school", why: "A reach, a realistic match and a safety net means one strong option even if the others don't work out. That is how you avoid another year at home." }
        : { title: "Check your eligibility.", text: "Pick courses you like and see how your results compare with each one's requirements and last year's cut-off.", cta: "Check courses", to: "/dashboard/school", why: "Checking before you apply shows which courses are realistic, so you don't spend your one choice on a long shot." };
    case "apply":
      return { title: "Track your applications.", text: "Add the courses you apply to and keep their status up to date, so you and your family always know where things stand.", cta: "Track applications", to: "#applications", why: "Keeping every application in one place means no deadline or admission list slips past you." };
    case "offer":
      return { title: "Waiting for offers.", text: "Keep checking JAMB CAPS and each school's portal. Update your applications when you hear back.", cta: "Update applications", to: "#applications", why: "Offers often come through JAMB CAPS first. Accept on CAPS before the deadline." };
    default:
      return { title: "You have an offer.", text: "Congratulations. Accept it on JAMB CAPS and follow the school's instructions for screening and fees.", cta: "See coming dates", to: "/dashboard/community/events", why: "Acceptance on CAPS and paying the acceptance fee on time keep your place." };
  }
}

export default function Dashboard() {
  const { setPageDesc, user } = useAuth();
  const [home, setHome] = useState<StudentHome | null>(null);
  const [error, setError] = useState("");
  const [showWhy, setShowWhy] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [addCourse, setAddCourse] = useState("");

  useEffect(() => {
    setPageDesc({ title: "Dashboard", desc: "" });
  }, [setPageDesc]);

  const load = () =>
    getStudentHome()
      .then(setHome)
      .catch((err) => setError(errorMessage(err, "We couldn't load your dashboard. Refresh to try again.")));
  useEffect(() => {
    load();
  }, []);

  const step = useMemo(() => (home ? nextStep(home) : null), [home]);
  const first = home?.firstname || user?.firstname || "";

  const toggleSave = async (m: Exclude<HomeMatch, { empty: true }>) => {
    setBusy(m.courseId);
    try {
      const r = m.saved ? await removeShortlist(m.courseId) : await saveShortlist(m.courseId);
      toast.success(r.message);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const setStatus = async (courseId: string, status: string) => {
    try {
      await saveApplication(courseId, status);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const addApplication = async () => {
    if (!addCourse) return;
    setBusy("add");
    try {
      const r = await saveApplication(addCourse, "planning");
      toast.success(r.message);
      setAddCourse("");
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const dropApplication = async (id: string) => {
    try {
      await removeApplication(id);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const dismissNotice = async () => {
    try {
      await schoolNoticeSeen();
    } finally {
      setHome((h0) => (h0 && h0.school ? { ...h0, school: { ...h0.school, needsNotice: false } } : h0));
    }
  };

  if (error) return <div className={h.page}><p className={h.notice}>{error}</p></div>;

  if (!home || !step) {
    return (
      <div className={h.page} aria-busy="true">
        <div className={h.skeleton} style={{ height: 90 }} />
        <div className={h.top}>
          <div className={h.skeleton} style={{ height: 320 }} />
          <div className={h.skeleton} style={{ height: 320 }} />
        </div>
        <div className={h.skeleton} style={{ height: 300 }} />
      </div>
    );
  }

  const savedCount = home.shortlist.filter((s) => s.item).length;
  const candidates = [
    ...home.shortlist.filter((s) => s.item).map((s) => ({ id: s.item!.courseId, label: `${s.item!.course}, ${s.item!.school}` })),
    ...home.top.filter((t): t is Exclude<HomeMatch, { empty: true }> => !("empty" in t)).map((t) => ({ id: t.courseId, label: `${t.course}, ${t.school}` })),
  ].filter((c, i, all) => all.findIndex((x) => x.id === c.id) === i && !home.applications.some((a) => a.courseId === c.id));

  const isAnchor = step.to.startsWith("#");

  return (
    <div className={h.page}>
      {/* Greeting */}
      <section>
        <p className={h.date}>{todayLabel()}</p>
        <h1 className={h.hello}>
          {greeting()}
          {first ? `, ${first}` : ""}.
        </h1>
        <p className={h.lead}>
          {home.matchesChecked
            ? "Your results are in. Let's turn them into a shortlist your family can trust."
            : home.steps[0].done
              ? "You're on your way. Here is what to do next."
              : "Let's find courses and universities you can realistically get into, and afford."}
        </p>
      </section>

      {home.school?.needsNotice && (
        <div className={h.notice} role="status">
          <ShieldCheck size={20} aria-hidden="true" />
          <div className={h.noticeBody}>
            <strong>Your school, {home.school.name}, can see your survey results and recommendations</strong>, so your counsellor can guide you. You can remove your school any time in
            Profile and settings.
          </div>
          <button type="button" className={h.noticeBtn} onClick={dismissNotice}>
            Got it
          </button>
        </div>
      )}

      {/* Next step and path */}
      <div className={h.top}>
        <section className={h.hero} aria-labelledby="next-step">
          <div>
            <p className={h.kicker}>Your next step</p>
            <h2 id="next-step" className={h.heroTitle}>
              {step.title}
            </h2>
            <p className={h.heroText}>{step.text}</p>
            <div className={h.heroActions}>
              {isAnchor ? (
                <a href={step.to} className={h.gold}>
                  {step.cta} <ArrowRight size={18} aria-hidden="true" />
                </a>
              ) : (
                <Link to={step.to} className={h.gold}>
                  {step.cta} <ArrowRight size={18} aria-hidden="true" />
                </Link>
              )}
              <button type="button" className={h.textBtn} onClick={() => setShowWhy((v) => !v)} aria-expanded={showWhy}>
                Why this step?
              </button>
            </div>
            {showWhy && <p className={h.why}>{step.why}</p>}
          </div>

          <div className={h.shortlist}>
            <div className={h.shortHead}>
              Your shortlist <span>{savedCount} of 3 tiers</span>
            </div>
            {home.shortlist.map((s) =>
              s.item ? (
                <div key={s.tier} className={h.tierRow}>
                  <span className={`${h.dot} ${TIER_DOT[s.tier]}`} aria-hidden="true" />
                  <div className={h.tierText}>
                    <p className={h.tierLabel}>{s.label}</p>
                    <p className={h.tierValue}>{s.item.school}</p>
                  </div>
                  <Check size={18} aria-label="Saved" color="var(--at-gold)" />
                </div>
              ) : (
                <a key={s.tier} href="#matches" className={`${h.tierRow} ${h.tierRowEmpty}`}>
                  <span className={`${h.dot} ${TIER_DOT[s.tier]}`} aria-hidden="true" />
                  <div className={h.tierText}>
                    <p className={h.tierLabel}>{s.label}</p>
                    <p className={h.tierValue}>Not saved yet</p>
                  </div>
                  <Plus size={18} aria-label={`Save a ${s.label.toLowerCase()}`} />
                </a>
              )
            )}
          </div>
        </section>

        <section className={h.card} aria-labelledby="path-title">
          <div className={h.pathHead}>
            <div>
              <h2 id="path-title" className={h.cardTitle}>
                Your path
              </h2>
              <p className={h.cardSub}>
                {home.stepsDone} of {home.steps.length} done
              </p>
            </div>
            <span className={h.saved}>
              <ShieldCheck size={15} aria-hidden="true" /> Saved
            </span>
          </div>
          <div className={h.progress} aria-hidden="true">
            <span style={{ width: `${(home.stepsDone / home.steps.length) * 100}%` }} />
          </div>
          <ol className={h.steps}>
            {home.steps.map((s, i) => {
              const inner = (
                <>
                  <span className={`${h.stepIcon} ${s.done ? h.stepDone : s.current ? h.stepNow : ""}`} aria-hidden="true">
                    {s.done ? <Check size={16} /> : i + 1}
                  </span>
                  <span>{s.label}</span>
                  {s.current && <span className={h.nowTag}>Now</span>}
                </>
              );
              return (
                <li key={s.key}>
                  {s.to.startsWith("#") || s.to.startsWith("/dashboard#") ? (
                    <a href={s.to.replace("/dashboard", "")} className={h.step} aria-label={`${s.label}${s.done ? ", done" : s.current ? ", now" : ""}`}>
                      {inner}
                    </a>
                  ) : (
                    <Link to={s.to} className={h.step} aria-label={`${s.label}${s.done ? ", done" : s.current ? ", now" : ""}`}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      {!home.school && (
        <div className={h.soft}>
          <School size={20} aria-hidden="true" color="var(--at-navy)" />
          <p>
            <strong>Add your secondary school</strong> to join your school's channel and chat with classmates. It's optional.
          </p>
          <Link to="/dashboard/settings/school" className={h.link}>
            Add my school <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}

      {home.ambassador && (
        <div className={h.soft}>
          <Star size={20} aria-hidden="true" color="var(--at-blue-600)" />
          <p>
            <strong>You're an AlignTraits ambassador.</strong> Share your invite link and see how many students joined through you.
          </p>
          <Link to="/dashboard/ambassador" className={h.link}>
            My invite link <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Top matches */}
      <section id="matches" aria-labelledby="matches-title">
        <div className={h.sectionHead}>
          <div>
            <h2 id="matches-title" className={h.h2}>
              Your top matches
            </h2>
            <p className={h.sectionSub}>
              {home.utmeScore ? `Based on your UTME score of ${home.utmeScore} and last year's cut-off marks` : "Add your UTME score to see how you compare with each course's cut-off"}
            </p>
          </div>
          <Link to="/dashboard/school" className={h.link}>
            {home.matchCount ? `See all matches (${home.matchCount})` : "Check courses"} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className={h.matches}>
          {home.top.map((m) =>
            "empty" in m ? (
              <div key={m.tier} className={h.emptyMatch}>
                <span className={`${h.pill} ${TIER_PILL[m.tier]}`} style={{ alignSelf: "flex-start" }}>
                  {m.tierLabel}
                </span>
                <p style={{ margin: 0 }}>
                  {home.matchesChecked
                    ? `None of the courses you checked is a ${m.tierLabel.toLowerCase()} yet. Check a few more courses to fill this tier.`
                    : "Check courses to see options in this tier."}
                </p>
                <Link to="/dashboard/school" className={h.link}>
                  Check courses <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <MatchCard key={m.courseId} m={m} busy={busy === m.courseId} onToggle={() => toggleSave(m)} />
            )
          )}
        </div>
      </section>

      {/* Applications and what's coming up */}
      <div className={h.two}>
        <section id="applications" aria-labelledby="apps-title">
          <div className={h.sectionHead}>
            <h2 id="apps-title" className={h.cardTitle} style={{ fontSize: 24 }}>
              Your applications
            </h2>
          </div>
          <div className={h.listCard}>
            {home.applications.length === 0 ? (
              <p className={h.listEmpty}>Add the courses you apply to and keep their status here, so you and your family always know where things stand.</p>
            ) : (
              home.applications.map((a) => (
                <div key={a.id} className={h.item}>
                  <span className={h.tile} aria-hidden="true">
                    {a.school
                      .split(/\s+/)
                      .filter((w) => /^[A-Z]/.test(w))
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("") || "U"}
                  </span>
                  <div className={h.itemMain}>
                    <p className={h.itemTitle}>{a.school}</p>
                    <p className={h.itemMeta}>{a.course}</p>
                  </div>
                  <select
                    aria-label={`Status of ${a.course} at ${a.school}`}
                    className={`${h.statusSelect} ${a.status === "offer" ? h.statusOffer : a.status === "under_review" ? h.statusReview : a.status === "not_offered" ? h.statusNo : ""}`}
                    value={a.status}
                    onChange={(e) => setStatus(a.courseId, e.target.value)}
                  >
                    {home.applicationStatuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button type="button" className={h.iconBtn} onClick={() => dropApplication(a.id)} aria-label={`Remove ${a.course} at ${a.school}`}>
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))
            )}
            {candidates.length > 0 && (
              <div className={h.addRow}>
                <label style={{ flex: 1, minWidth: 0, display: "flex" }}>
                  <span className="sr-only">Course to add</span>
                  <select value={addCourse} onChange={(e) => setAddCourse(e.target.value)}>
                    <option value="">Add a course you're applying to</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" className={h.navyBtn} disabled={!addCourse || busy === "add"} onClick={addApplication}>
                  Add
                </button>
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="coming-title">
          <div className={h.sectionHead}>
            <h2 id="coming-title" className={h.cardTitle} style={{ fontSize: 24 }}>
              Coming up
            </h2>
            <Link to="/dashboard/community/events" className={h.link}>
              See all <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className={h.listCard}>
            {home.events.length === 0 ? (
              <p className={h.listEmpty}>No dates coming up yet. Exam windows, deadlines and live sessions will show here.</p>
            ) : (
              home.events.map((e) => (
                <div key={e.id} className={h.item}>
                  <span className={h.dateTile}>
                    <strong>{new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: TZ }).format(new Date(e.startsAt))}</strong>
                    <span>{new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: TZ }).format(new Date(e.startsAt))}</span>
                  </span>
                  <Link to={`/dashboard/community/events?event=${e.id}`} className={h.itemMain} style={{ textDecoration: "none" }}>
                    <p className={h.itemTitle}>{e.title}</p>
                    <p className={h.itemMeta}>
                      {e.kind === "DEADLINE" ? "Deadline" : e.kind === "EXAM" ? "Exam" : e.kind === "WORKSHOP" ? "Workshop" : e.kind === "MEETUP" ? "Meetup" : "Live session"} ·{" "}
                      {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ }).format(new Date(e.startsAt))} WAT
                    </p>
                  </Link>
                  <a
                    href={googleCalendarUrl(e as unknown as CommunityEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={h.iconBtn}
                    aria-label={`Add ${e.title} to your calendar`}
                  >
                    <CalendarPlus size={18} aria-hidden="true" />
                  </a>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Parent share */}
      <section className={h.parent} aria-labelledby="parent-title">
        <span className={h.parentIcon} aria-hidden="true">
          <FileText size={24} />
        </span>
        <div className={h.parentText}>
          <h2 id="parent-title" className={h.parentTitle}>
            Make the decision together.
          </h2>
          <p className={h.parentSub}>Your parent report explains your fit, options and costs in plain words.</p>
        </div>
        <button type="button" className={h.navyLg} onClick={() => setShareOpen(true)}>
          <Send size={18} aria-hidden="true" /> Share with my parents
        </button>
      </section>

      {shareOpen && <ShareDialog onClose={() => setShareOpen(false)} />}
    </div>
  );
}

function MatchCard({ m, busy, onToggle }: { m: Exclude<HomeMatch, { empty: true }>; busy: boolean; onToggle: () => void }) {
  // How the score compares with the cut-off, drawn on a 120-mark window around it.
  const hasScore = m.cutOff !== null && m.margin !== null;
  const scale = 60;
  const pos = (v: number) => Math.max(2, Math.min(98, 50 + (v / scale) * 50));
  const fill = hasScore ? pos(m.margin!) : m.eligible ? 70 : 30;
  return (
    <article className={h.match}>
      <div className={h.matchTop}>
        <span className={`${h.pill} ${TIER_PILL[m.tier]}`}>{m.tierLabel}</span>
        <button
          type="button"
          className={`${h.bookmark} ${m.saved ? h.bookmarkOn : ""}`}
          onClick={onToggle}
          disabled={busy}
          aria-pressed={m.saved}
          aria-label={m.saved ? `Remove ${m.course} at ${m.school} from your shortlist` : `Save ${m.course} at ${m.school} as your ${m.tierLabel.toLowerCase()}`}
        >
          <Bookmark size={18} fill={m.saved ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      </div>
      <p className={h.course}>{m.course}</p>
      <h3 className={h.uni}>{m.school}</h3>
      <p className={h.place}>
        <MapPin size={15} aria-hidden="true" />
        {[m.schoolType ? SCHOOL_TYPE[m.schoolType] || "University" : null, m.place].filter(Boolean).join(" · ")}
      </p>
      <p className={h.reason}>{m.reason}</p>
      <div className={h.meter}>
        <div className={h.meterHead}>
          <span>Your score vs cut-off</span>
          <strong>{hasScore ? `${m.margin! >= 0 ? "+" : ""}${m.margin}` : m.eligible ? "Eligible" : "Not yet"}</strong>
        </div>
        <div className={h.bar} role="img" aria-label={hasScore ? `${Math.abs(m.margin!)} marks ${m.margin! >= 0 ? "above" : "below"} the cut-off` : m.eligible ? "Meets the requirements" : "Does not meet the requirements yet"}>
          <span className={`${h.barFill} ${TIER_FILL[m.tier]}`} style={{ width: `${fill}%` }} />
          {hasScore && <span className={h.cutMark} style={{ left: "50%" }} title={`Cut-off ${m.cutOff}`} />}
        </div>
      </div>
      <div className={h.cost}>
        <span>Year one cost</span>
        <strong>{naira(m.yearOneCost, m.currency)}</strong>
      </div>
    </article>
  );
}

function ShareDialog({ onClose }: { onClose: () => void }) {
  const [link, setLink] = useState<{ link: string; days: number; whatsappText: string } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getParentLink()
      .then(setLink)
      .catch((err) => setError(errorMessage(err)));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.link);
      toast.success("Link copied");
    } catch {
      toast.info(link.link);
    }
  };
  return (
    <div className={h.modalBack} onClick={onClose}>
      <div className={h.modal} role="dialog" aria-modal="true" aria-labelledby="share-title" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <h2 id="share-title" className={h.modalTitle}>
            Share your report with your parents
          </h2>
          <button type="button" className={h.iconBtn} onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p style={{ margin: 0, color: "var(--at-slate)", fontSize: 15, lineHeight: 1.55 }}>
          They can open it without an account. It shows your three options, why each one fits, and what year one costs.
        </p>
        {error ? (
          <p style={{ color: "var(--at-error)" }}>{error}</p>
        ) : !link ? (
          <p style={{ color: "var(--at-slate)" }}>Making your link...</p>
        ) : (
          <>
            <a className={h.wa} href={`https://wa.me/?text=${encodeURIComponent(link.whatsappText)}`} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp size={20} aria-hidden="true" /> Send on WhatsApp
            </a>
            <div className={h.linkBox}>
              <span>{link.link}</span>
              <button type="button" className={h.iconBtn} onClick={copy} aria-label="Copy link">
                <Copy size={16} aria-hidden="true" />
              </button>
            </div>
            <a className={h.ghost} style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }} href={link.link} target="_blank" rel="noopener noreferrer">
              Preview the report
            </a>
            <p style={{ margin: 0, display: "flex", gap: 8, color: "var(--at-slate)", fontSize: 13 }}>
              <Info size={15} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} /> The link works for {link.days} days. Anyone with it can see the report, so only send it to your family.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
