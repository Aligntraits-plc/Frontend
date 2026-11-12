import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft, FiCheck, FiChevronRight, FiPrinter, FiSearch, FiUserPlus } from "react-icons/fi";
import {
  CLASS_LEVELS,
  errorMessage,
  naira,
  portalCoverStudent,
  portalRemoveStudent,
  portalReview,
  portalSetClass,
  portalStudent,
  portalStudents,
  shortDate,
  SOURCE_LABELS,
  type MatchOption,
  type PortalStudent,
  type PortalStudentDetail,
} from "../../services/roles";
import { Btn, Empty, inputClass, Loading, Pill } from "../../components/Admin/kit";
import { usePortal } from "./PortalContext";

type Filter = "all" | "survey" | "uncovered" | "review";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "survey", label: "Survey not done" },
  { value: "review", label: "To review" },
  { value: "uncovered", label: "Not covered" },
];

const TIER_STYLE: Record<MatchOption["tier"], string> = {
  reach: "bg-[#F6C648] text-[#002650]",
  realistic: "bg-[#007AFF] text-white",
  safety: "bg-[#004085] text-white",
};

/* Students: the list on the left, the selected student in the middle and the
   counsellor review on the right (on phones, the list and the student are separate screens). */
export default function Students() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { overview } = usePortal();
  const [list, setList] = useState<PortalStudent[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState("");

  const load = () =>
    portalStudents()
      .then(setList)
      .catch((err) => setError(errorMessage(err)));
  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (list || []).filter(
      (s) =>
        (!q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) &&
        (filter === "all" ||
          (filter === "survey" && !s.surveyDone) ||
          (filter === "uncovered" && !s.covered) ||
          (filter === "review" && s.matchesChecked && !s.reportApproved))
    );
  }, [list, query, filter]);

  // On wide screens, open the first student when none is chosen.
  useEffect(() => {
    if (!id && list && list.length && window.matchMedia("(min-width: 1024px)").matches) {
      navigate(`/school-portal/students/${list[0].id}`, { replace: true });
    }
  }, [id, list, navigate]);

  if (error) return <p className="rounded-xl bg-[#FEF3F2] p-4 text-[14px] text-[#B42318]">{error}</p>;
  if (!list) return <Loading />;

  if (list.length === 0) {
    return (
      <div className="mx-auto max-w-[640px] rounded-2xl border border-[#E4E9F0] bg-white p-6 text-center sm:p-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF4FF] text-[#004085]">
          <FiUserPlus className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-[22px] font-bold text-[#002650]" style={{ fontFamily: "'AT Fira Sans', 'Fira Sans', sans-serif" }}>
          No students yet
        </h1>
        <p className="mt-2 text-[15px] leading-[24px] text-[#475467]">
          Students appear here when they pick {overview?.school.name || "your school"} on AlignTraits, use your school code, or accept your invitation. You can also run the survey with a
          student on this device.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to="/school-portal/invite" className="inline-flex h-11 items-center justify-center rounded-lg bg-[#004085] px-5 text-[14px] font-semibold text-white">
            Invite students
          </Link>
          <Link to="/school-portal/survey" className="inline-flex h-11 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white px-5 text-[14px] font-semibold text-[#344054]">
            Run the survey here
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* List */}
      <aside className={`${id ? "hidden lg:flex" : "flex"} flex-col gap-3 lg:sticky lg:top-[132px] lg:max-h-[calc(100vh-150px)]`}>
        <div className="flex items-center justify-between lg:hidden">
          <h1 className="text-[20px] font-bold text-[#002650]">Students ({list.length})</h1>
        </div>
        <label className="relative">
          <span className="sr-only">Search students</span>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" aria-hidden="true" />
          <input className={`${inputClass} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students..." />
        </label>
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                filter === f.value ? "bg-[#004085] text-white" : "border border-[#E4E9F0] bg-white text-[#475467]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <ul className="flex flex-col overflow-y-auto rounded-2xl border border-[#E4E9F0] bg-white">
          {shown.length === 0 && <li className="p-4 text-[14px] text-[#667085]">No students match.</li>}
          {shown.map((s) => (
            <li key={s.id}>
              <Link
                to={`/school-portal/students/${s.id}`}
                className={`flex items-center gap-3 border-b border-[#F2F4F7] px-3 py-3 last:border-b-0 ${s.id === id ? "bg-[#EEF4FF]" : "hover:bg-[#F9FAFB]"}`}
                aria-current={s.id === id ? "page" : undefined}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#004085] text-[13px] font-bold text-white">{s.initials}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-[#101828]">{s.name}</span>
                  <span className="block truncate text-[12px] text-[#667085]">
                    {[s.classLevel, s.surveyDone ? "Survey done" : "No survey yet"].filter(Boolean).join(" · ")}
                  </span>
                </span>
                {s.reportApproved ? <FiCheck className="text-[#12B76A]" aria-label="Report approved" /> : <FiChevronRight className="text-[#98A2B3]" aria-hidden="true" />}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Selected student */}
      {id ? (
        <StudentPanel key={id} id={id} onChanged={load} onRemoved={() => {
          load();
          navigate("/school-portal", { replace: true });
        }} />
      ) : (
        <div className="hidden lg:block">
          <Empty title="Pick a student">Choose a student on the left to see their results and options.</Empty>
        </div>
      )}
    </div>
  );
}

function StudentPanel({ id, onChanged, onRemoved }: { id: string; onChanged: () => void; onRemoved: () => void }) {
  const [s, setS] = useState<PortalStudentDetail | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [checks, setChecks] = useState([false, false]);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    portalStudent(id)
      .then((d) => {
        setS(d);
        setChecks([d.review.approved, d.review.approved]);
      })
      .catch((err) => setError(errorMessage(err, "We could not open this student.")));
  }, [id]);

  if (error)
    return (
      <div>
        <Link to="/school-portal" className="mb-3 inline-flex items-center gap-1 text-[14px] font-semibold text-[#004085] lg:hidden">
          <FiArrowLeft aria-hidden="true" /> All students
        </Link>
        <p className="rounded-xl bg-[#FEF3F2] p-4 text-[14px] text-[#B42318]">{error}</p>
      </div>
    );
  if (!s) return <Loading />;
  const r = s.report;

  const approve = async (approved: boolean) => {
    setBusy(true);
    try {
      const res = await portalReview(s.id, approved);
      setS(await portalStudent(s.id));
      if (!approved) setChecks([false, false]);
      toast.success(res.message);
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const changeClass = async (classLevel: string) => {
    try {
      await portalSetClass(s.id, classLevel);
      setS({ ...s, classLevel });
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const cover = async () => {
    setBusy(true);
    try {
      const res = await portalCoverStudent(s.id);
      toast.success(res.message);
      setS(await portalStudent(s.id));
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      const res = await portalRemoveStudent(s.id);
      toast.success(res.message);
      onRemoved();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const canApprove = r.options.length > 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-5">
        <Link to="/school-portal" className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#004085] lg:hidden">
          <FiArrowLeft aria-hidden="true" /> All students
        </Link>

        {/* Profile */}
        <section className="rounded-2xl border border-[#E4E9F0] bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#004085] text-[20px] font-bold text-white sm:h-20 sm:w-20 sm:text-[24px]">{s.initials}</span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[22px] font-bold text-[#002650] sm:text-[26px]" style={{ fontFamily: "'AT Fira Sans', 'Fira Sans', sans-serif" }}>
                {s.name}
              </h1>
              <p className="text-[14px] text-[#475467]">
                {[s.classLevel, r.exams.map((e) => e.type).join(", "), s.region].filter(Boolean).join(" · ") || s.email}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill tone={s.covered ? "green" : "amber"}>{s.covered ? `Covered${s.until ? ` until ${shortDate(s.until)}` : ""}` : "Not covered yet"}</Pill>
                <Pill tone="grey">{SOURCE_LABELS[s.source] || "In your school"}</Pill>
                {!s.hasPassword && <Pill tone="blue">Account not set up yet</Pill>}
              </div>
              {!s.covered && (
                <div className="mt-3">
                  <Btn small tone="secondary" busy={busy} onClick={cover}>
                    Cover with a seat
                  </Btn>
                </div>
              )}
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[#F2F4F7] pt-4 sm:grid-cols-4">
            <div>
              <dt className="text-[12px] text-[#667085]">UTME score</dt>
              <dd className="text-[20px] font-bold text-[#101828]">{r.utmeScore ?? "Not added"}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-[#667085]">Results</dt>
              <dd className="text-[15px] font-semibold text-[#101828]">{r.exams.length ? r.exams.map((e) => e.type).join(", ") : "Not added"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[12px] text-[#667085]">Interests</dt>
              <dd className="text-[15px] font-semibold text-[#101828]">{r.careers.length ? r.careers.slice(0, 3).join(", ") : "Survey not done"}</dd>
            </div>
          </dl>
        </section>

        {/* Options */}
        <section className="rounded-2xl border border-[#E4E9F0] bg-white p-5">
          <h2 className="text-[20px] font-bold text-[#002650]" style={{ fontFamily: "'AT Fira Sans', 'Fira Sans', sans-serif" }}>
            Recommended options
          </h2>
          <p className="mt-1 text-[14px] text-[#475467]">One course in each admission tier, from the courses {s.name.split(" ")[0]} checked.</p>
          {r.options.length === 0 ? (
            <div className="mt-4">
              <Empty title={r.matchesChecked ? "No options in the three tiers yet" : "No courses checked yet"}>
                {!r.surveyDone
                  ? "Start with the career survey: open Run the survey and hand the device to the student."
                  : !r.resultsAdded
                    ? "The student needs to add their WAEC or NECO and JAMB results on AlignTraits."
                    : "The student needs to check courses on AlignTraits, then their options appear here."}
              </Empty>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {r.options.map((o) => (
                <article key={o.courseId} className="flex flex-col gap-2 rounded-xl border border-[#E4E9F0] p-4">
                  <span className={`self-start rounded-full px-3 py-1 text-[12px] font-bold ${TIER_STYLE[o.tier]}`}>{o.tierLabel}</span>
                  <h3 className="text-[17px] font-bold leading-snug text-[#101828]">{o.course}</h3>
                  <p className="text-[13px] text-[#667085]">{o.school}</p>
                  <div className="mt-auto border-t border-[#F2F4F7] pt-3">
                    <p className="text-[12px] text-[#667085]">Year one fee</p>
                    <p className="text-[20px] font-bold text-[#101828]">{naira(o.yearOneCost, o.currency)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(open === o.courseId ? null : o.courseId)}
                    aria-expanded={open === o.courseId}
                    className="inline-flex items-center gap-1 self-start text-[14px] font-semibold text-[#004085]"
                  >
                    See why <FiChevronRight className={`transition-transform ${open === o.courseId ? "rotate-90" : ""}`} aria-hidden="true" />
                  </button>
                  {open === o.courseId && (
                    <div className="rounded-lg bg-[#F5F8FF] p-3 text-[13px] leading-[20px] text-[#344054]">
                      <p>{o.reason}</p>
                      {o.details && <p className="mt-1 text-[#667085]">{o.details}</p>}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Manage */}
        <section className="flex flex-col gap-3 rounded-2xl border border-[#E4E9F0] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-[14px] font-medium text-[#344054]">
            Class
            <select className={`${inputClass} !h-10 !w-auto`} value={s.classLevel || ""} onChange={(e) => changeClass(e.target.value)}>
              <option value="" disabled>
                Choose
              </option>
              {CLASS_LEVELS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            {confirmRemove ? (
              <>
                <span className="self-center text-[13px] text-[#B42318]">Remove from your school?</span>
                <Btn small tone="danger" onClick={remove}>
                  Yes, remove
                </Btn>
                <Btn small tone="secondary" onClick={() => setConfirmRemove(false)}>
                  Keep
                </Btn>
              </>
            ) : (
              <Btn small tone="ghost" onClick={() => setConfirmRemove(true)}>
                Not our student? Remove
              </Btn>
            )}
          </div>
        </section>
      </div>

      {/* Counsellor review */}
      <aside className="flex flex-col gap-4 xl:sticky xl:top-[132px] xl:self-start">
        <section className="rounded-2xl border border-[#E4E9F0] bg-white p-5">
          <h2 className="text-[20px] font-bold text-[#002650]" style={{ fontFamily: "'AT Fira Sans', 'Fira Sans', sans-serif" }}>
            Counsellor review
          </h2>
          {s.review.approved ? (
            <>
              <p className="mt-2 flex items-center gap-2 text-[14px] text-[#067647]">
                <FiCheck aria-hidden="true" /> Approved for the parent report{s.review.approvedAt ? ` on ${shortDate(s.review.approvedAt)}` : ""}.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to={`/school-portal/students/${s.id}/report`}
                  target="_blank"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#004085] px-4 text-[14px] font-semibold text-white"
                >
                  <FiPrinter aria-hidden="true" /> Print take-home report
                </Link>
                <Btn tone="ghost" busy={busy} onClick={() => approve(false)}>
                  Undo approval
                </Btn>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-[14px] text-[#475467]">Confirm this recommendation is ready for the parent report.</p>
              <div className="mt-4 flex flex-col gap-3">
                {["Options align with the student's profile and goals", "Fees and entry requirements are accurate"].map((label, i) => (
                  <label key={label} className="flex cursor-pointer items-start gap-3 text-[14px] text-[#344054]">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[#004085]"
                      checked={checks[i]}
                      disabled={!canApprove}
                      onChange={(e) => setChecks((c) => c.map((x, j) => (j === i ? e.target.checked : x)))}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <Btn busy={busy} disabled={!canApprove || !checks.every(Boolean)} onClick={() => approve(true)}>
                  Approve for parent report
                </Btn>
                <Link
                  to={`/school-portal/students/${s.id}/report`}
                  target="_blank"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-4 text-[14px] font-semibold text-[#344054]"
                >
                  <FiPrinter aria-hidden="true" /> Preview report
                </Link>
              </div>
              {!canApprove && <p className="mt-3 text-[13px] text-[#667085]">You can approve once the student has options in the three tiers.</p>}
            </>
          )}
        </section>
        {r.careerReason && (
          <section className="rounded-2xl border border-[#E4E9F0] bg-white p-5">
            <h3 className="text-[15px] font-semibold text-[#101828]">From the career survey</h3>
            <p className="mt-2 text-[14px] leading-[22px] text-[#475467]">{r.careerReason}</p>
          </section>
        )}
      </aside>
    </div>
  );
}
