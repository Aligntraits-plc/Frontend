import Logo from "../../assets/logo.svg";
import { naira, type MatchOption, type StudentReport } from "../../services/roles";
import s from "./TakeHomeReport.module.css";

type Props = {
  student: { name: string; classLevel?: string | null; region?: string | null };
  school: { name: string } | null;
  report: StudentReport;
  review: { approvedAt: string | null; by: string | null } | null;
  generatedAt?: string;
};

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }) : "";

const TIER_CLASS: Record<MatchOption["tier"], string> = { reach: s.reach, realistic: s.realistic, safety: s.safety };

/* A plain-words report for the student and their family: what they fit, their
   realistic options in three tiers, why, and what year one costs. No invented
   percentages: every option says how the student's score compares with the cut-off. */
export default function TakeHomeReport({ student, school, report, review, generatedAt }: Props) {
  const first = student.name.split(" ")[0];
  return (
    <article className={s.page}>
      <header className={s.head}>
        <img src={Logo} alt="AlignTraits" className={s.logo} />
        <div className={s.headMeta}>
          {school && <div><strong>{school.name}</strong></div>}
          <div>Prepared {fmt(generatedAt || new Date().toISOString())}</div>
        </div>
      </header>

      <h1 className={s.title}>{student.name}'s admission report</h1>
      <p className={s.sub}>
        {[student.classLevel, student.region].filter(Boolean).join(" · ") || "Course and university options in plain words"}
      </p>

      <div className={s.facts}>
        <div className={s.fact}>
          <p className={s.factLabel}>UTME score</p>
          <p className={s.factValue}>{report.utmeScore ?? "Not added yet"}</p>
        </div>
        <div className={s.fact}>
          <p className={s.factLabel}>Results added</p>
          <p className={s.factValue}>{report.exams.length ? report.exams.map((e) => e.type).join(", ") : "None yet"}</p>
        </div>
        <div className={s.fact}>
          <p className={s.factLabel}>Career survey</p>
          <p className={s.factValue}>{report.surveyDone ? "Done" : "Not done yet"}</p>
        </div>
      </div>

      <h2 className={s.h2}>What {first} is drawn to</h2>
      {report.careers.length ? (
        <>
          <ul className={s.careers}>
            {report.careers.map((c) => (
              <li key={c} className={s.career}>
                {c}
              </li>
            ))}
          </ul>
          {report.careerReason && <p className={s.p} style={{ marginTop: 10 }}>{report.careerReason}</p>}
        </>
      ) : (
        <p className={s.empty}>{first} has not taken the career survey yet.</p>
      )}

      <h2 className={s.h2}>Course options in three tiers</h2>
      <p className={s.p}>A balanced list has one of each. Apply to the one that fits best, and keep the others as back-ups.</p>
      {report.options.length ? (
        <div className={s.options}>
          {report.options.map((o) => (
            <section key={o.courseId} className={s.option}>
              <span className={`${s.tier} ${TIER_CLASS[o.tier]}`}>{o.tierLabel}</span>
              <p className={s.course}>{o.course}</p>
              <p className={s.school}>
                {o.school}
                {o.place ? ` · ${o.place}` : ""}
              </p>
              <p className={s.reason}>{o.reason}</p>
              <div className={s.cost}>
                <span>Year one cost</span>
                <strong>{naira(o.yearOneCost, o.currency)}</strong>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className={s.empty}>
          {report.matchesChecked
            ? "None of the courses checked so far fall into the three tiers. Check a few more courses on AlignTraits."
            : `${first} has not checked any courses yet. Once they add their results and check courses on AlignTraits, the options appear here.`}
        </p>
      )}
      <ul className={s.legend}>
        <li><strong>Reach:</strong> the score is a little below last year's cut-off. Possible, but not likely.</li>
        <li><strong>Realistic match:</strong> meets the requirements and is at or just above the cut-off.</li>
        <li><strong>Safety net:</strong> meets the requirements and is well above the cut-off.</li>
      </ul>

      <h2 className={s.h2}>Next steps</h2>
      <ol className={s.next}>
        <li>Talk through the three options together, including the cost of year one.</li>
        <li>Check each school's official website and the JAMB portal for this year's requirements and dates.</li>
        <li>Save one course in each tier on AlignTraits before applying.</li>
      </ol>

      {review?.approvedAt && (
        <div className={s.review}>
          <span className={s.reviewDot} aria-hidden="true" />
          <span>
            Reviewed by {review.by || "the school counsellor"}
            {school ? `, ${school.name}` : ""}, on {fmt(review.approvedAt)}.
          </span>
        </div>
      )}

      <p className={s.notice}>
        This report is guidance to help {first} and their family decide. It is not an offer of admission, and admission is never guaranteed. Cut-off marks are last year's and
        can change. Fees are what schools listed and may change. AlignTraits · aligntraits.com
      </p>
    </article>
  );
}
