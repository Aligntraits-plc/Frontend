import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Bell, CalendarClock, Check, CheckCircle2, ChevronDown, Clock, Hourglass, Layers, Loader2, UserRound } from "lucide-react";
import { useAuth } from "../../../contexts/useAuth";
import { getWorkshop, setWorkshopNotify, type WorkshopCourse } from "../../../services/workshops";
import { errorMessage } from "../../../services/roles";
import WorkshopCover from "../../../components/workshops/WorkshopCover";
import w from "../../../components/workshops/Workshops.module.css";

/* One workshop course, from the Workshops course design. A preview shows the outline and "Notify me". */
export default function WorkshopCoursePage() {
  const { slug = "" } = useParams();
  const { setPageDesc } = useAuth();
  const [course, setCourse] = useState<WorkshopCourse | null>(null);
  const [missing, setMissing] = useState(false);
  const [open, setOpen] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPageDesc({ title: "Workshop", desc: "" });
    setCourse(null);
    setMissing(false);
    getWorkshop(slug).then(setCourse).catch(() => setMissing(true));
  }, [slug, setPageDesc]);

  const toggleNotify = async () => {
    if (!course) return;
    setBusy(true);
    try {
      const r = await setWorkshopNotify(course.slug, !course.notify);
      setCourse({ ...course, notify: r.data.notify });
      toast.success(r.message);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={w.wrap}>
      <div className={w.page}>
        <Link to="/dashboard/workshop" className={w.back}>
          <ArrowLeft size={16} aria-hidden="true" />
          All workshops
        </Link>

        {missing && (
          <div className={w.empty} role="alert">
            We could not find that course. It may have been renamed.
          </div>
        )}
        {!course && !missing && (
          <div className={w.loading} role="status">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading</span>
          </div>
        )}
        {course && (
          <>
            <div className={w.hero}>
              <div>
                <p className={w.cat} style={{ fontSize: 14 }}>
                  {course.category} {course.preview && <b className={w.previewTag} style={{ marginLeft: 8 }}>Preview</b>}
                </p>
                <h2 className={w.courseTitle}>{course.title}</h2>
                <p className={w.taught}>{course.summary}</p>
                <div className={w.row}>
                  <span>
                    <Clock size={16} aria-hidden="true" />
                    {course.weeks} weeks
                  </span>
                  <span>
                    <Layers size={16} aria-hidden="true" />
                    {course.sessions} live sessions
                  </span>
                  <span>{course.level}</span>
                </div>
                <div className={w.actions}>
                  <button type="button" className={course.notify ? w.ctaOn : w.cta} onClick={toggleNotify} disabled={busy} aria-pressed={course.notify}>
                    {course.notify ? <Check size={18} aria-hidden="true" /> : <Bell size={18} aria-hidden="true" />}
                    {course.notify ? "We will tell you when it opens" : "Notify me when this opens"}
                  </button>
                  <span className={w.soon}>
                    <Hourglass size={16} aria-hidden="true" />
                    Coming soon
                  </span>
                </div>
                <p className={w.small}>{course.notify ? "Tap the button again to stop the notification." : "This course is not open yet. We will email you the start date, and it shows us which course to open first."}</p>
              </div>
              <div className={w.heroCover}>
                <WorkshopCover kind={course.cover} className={w.cover} />
              </div>
            </div>

            <div className={w.cols}>
              <div>
                <h3 className={w.h2}>What you’ll achieve</h3>
                <ul className={w.outcomes}>
                  {course.outcomes.map((o) => (
                    <li key={o}>
                      <CheckCircle2 size={18} aria-hidden="true" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>

                <h3 className={w.h2}>Syllabus</h3>
                <div className={w.syllabus}>
                  {course.syllabus.map((wk) => {
                    const isOpen = open === wk.week;
                    return (
                      <div className={w.week} key={wk.week}>
                        <button type="button" aria-expanded={isOpen} aria-controls={`wk-${wk.week}`} onClick={() => setOpen(isOpen ? 0 : wk.week)}>
                          <span className={w.num} aria-hidden="true">
                            {wk.week}
                          </span>
                          <span className={w.weekText}>
                            <span className={w.weekLabel}>Week {wk.week}</span>
                            <span className={w.weekTitle}>{wk.title}</span>
                          </span>
                          <ChevronDown size={18} className={`${w.chev} ${isOpen ? w.chevOpen : ""}`} aria-hidden="true" />
                        </button>
                        {isOpen && (
                          <div className={w.topics} id={`wk-${wk.week}`}>
                            <ul>
                              {wk.topics.map((t) => (
                                <li key={t}>{t}</li>
                              ))}
                            </ul>
                            <p>{wk.note}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <aside className={w.side}>
                <div className={w.sideCard}>
                  <p className={w.sideTitle}>Instructor</p>
                  <div className={w.who}>
                    <span className={w.whoIcon} aria-hidden="true">
                      <UserRound size={22} />
                    </span>
                    <p className={w.whoName}>To be announced</p>
                  </div>
                  <p className={w.sideText}>We name the lecturer when the course opens, with where they teach.</p>
                </div>
                <div className={w.sideCard}>
                  <p className={w.sideTitle}>Live schedule</p>
                  <div className={w.who}>
                    <span className={w.whoIcon} aria-hidden="true">
                      <CalendarClock size={22} />
                    </span>
                    <p className={w.whoName}>Dates not set yet</p>
                  </div>
                  <p className={w.sideText}>Session dates are set when the course opens. Ask to be notified and we will email them to you.</p>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
