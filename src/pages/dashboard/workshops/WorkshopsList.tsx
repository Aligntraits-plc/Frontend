import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Info, Layers, Loader2, Search } from "lucide-react";
import { useAuth } from "../../../contexts/useAuth";
import { listWorkshops, type WorkshopCard } from "../../../services/workshops";
import WorkshopCover from "../../../components/workshops/WorkshopCover";
import LiveSessions from "../Workshop";
import w from "../../../components/workshops/Workshops.module.css";

/* Workshops, from the Workshops design. While only previews exist, each card says so. */
export default function WorkshopsList() {
  const { setPageDesc } = useAuth();
  const [courses, setCourses] = useState<WorkshopCard[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");

  const load = () => {
    setFailed(false);
    listWorkshops()
      .then((d) => {
        setCourses(d.courses);
        setCategories(d.categories);
        setPreviewOnly(d.previewOnly);
      })
      .catch(() => setFailed(true));
  };
  useEffect(() => {
    setPageDesc({ title: "Workshop", desc: "" });
    load();
  }, [setPageDesc]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (courses || []).filter((c) => (tab === "All" || c.category === tab) && (!q || `${c.title} ${c.category} ${c.summary}`.toLowerCase().includes(q)));
  }, [courses, tab, query]);

  return (
    <div className={w.wrap}>
      <div className={w.page}>
        <div className={w.top}>
          <div>
            <h2 className={w.title}>Workshops</h2>
            <p className={w.lead}>Short live courses to help you get in: exam prep, choosing a course, study skills and applications. Free for AlignTraits students.</p>
          </div>
          <label className={w.search}>
            <span className="sr-only">Search courses</span>
            <Search size={18} aria-hidden="true" />
            <input type="search" placeholder="Search courses" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>

        {previewOnly && (
          <p className={w.note}>
            <Info size={20} aria-hidden="true" />
            <span>These are previews of our first courses. Open one to see what it will cover, then ask us to tell you when it opens.</span>
          </p>
        )}

        <div className={w.tabs} role="tablist" aria-label="Course categories">
          {["All", ...categories].map((c) => (
            <button key={c} type="button" role="tab" aria-selected={tab === c} className={w.tab} onClick={() => setTab(c)}>
              {c}
            </button>
          ))}
        </div>

        {failed && (
          <div className={w.empty} role="alert">
            We could not load the courses. Check your connection.{" "}
            <button type="button" className={w.back} style={{ border: 0, background: "none", cursor: "pointer" }} onClick={load}>
              Try again
            </button>
          </div>
        )}
        {!courses && !failed && (
          <div className={w.loading} role="status">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading</span>
          </div>
        )}
        {courses && shown.length === 0 && <div className={w.empty}>No course matches that. Try another word or category.</div>}
        {courses && shown.length > 0 && (
          <div className={w.grid}>
            {shown.map((c) => (
              <article key={c.slug} className={w.card}>
                <WorkshopCover kind={c.cover} className={w.cover} />
                <div className={w.cardBody}>
                  <p className={w.cat}>{c.category}</p>
                  <h3 className={w.cardTitle}>{c.title}</h3>
                  <p className={w.lecturer}>Lecturer to be announced</p>
                  <div className={w.metaGrid}>
                    <span>
                      <Clock size={15} aria-hidden="true" />
                      {c.weeks} weeks
                    </span>
                    <span>
                      <Layers size={15} aria-hidden="true" />
                      {c.sessions} live sessions
                    </span>
                    <span>
                      <i className={w.dot} aria-hidden="true" />
                      {c.level}
                    </span>
                    <span>{c.preview && <b className={w.previewTag}>Preview</b>}</span>
                  </div>
                  {c.notify && (
                    <p className={w.asked}>
                      <CheckCircle2 size={15} aria-hidden="true" />
                      We will tell you when it opens
                    </p>
                  )}
                  <Link to={`/dashboard/workshop/${c.slug}`} className={w.cardBtn} aria-label={`View course: ${c.title}`}>
                    View course
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className={w.live}>
          <LiveSessions embedded />
        </div>
      </div>
    </div>
  );
}
