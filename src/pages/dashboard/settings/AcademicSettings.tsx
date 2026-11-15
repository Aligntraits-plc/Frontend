import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, GraduationCap, Info } from "lucide-react";
import { useAuth } from "../../../contexts/useAuth";
import { fieldErrors, getStudentSettings, saveStudentAcademics, type AcademicsInput, type StudentSettings } from "../../../services/settings";
import { Field, Loading, Problem, SaveStatus, Section, Segmented, SettingsPage, Toggle } from "../../../components/profile-settings/parts";
import { useAutosave } from "../../../components/profile-settings/useAutosave";
import s from "../../../components/profile-settings/Settings.module.css";

const ENGLISH = "English";
const MATHS = "Mathematics";
const CREDITS = new Set(["A1", "B2", "B3", "C4", "C5", "C6"]);
const MAX_OLEVEL = 9;
// The subjects most students in each class arm sit, offered as a starting list. Any row can be changed.
const BY_ARM: Record<string, string[]> = {
  Science: ["Physics", "Chemistry", "Biology", "Further Mathematics", "Civic Education", "Economics"],
  Arts: ["Literature in English", "Government", "Christian Religious Studies", "History", "Civic Education", "Economics"],
  Commercial: ["Economics", "Commerce", "Accounting", "Government", "Civic Education", "Marketing"],
  Technical: ["Physics", "Chemistry", "Technical Drawing", "Further Mathematics", "Civic Education", "Economics"],
};

type UtmeRow = { subject: string; score: string };
type GradeRow = { subject: string; grade: string };
type Form = {
  utmeYear: number;
  utme: UtmeRow[];
  status: "OUT" | "AWAITING";
  examBody: string;
  olevelYear: number | null;
  sittings: 1 | 2;
  grades: GradeRow[];
  de: boolean;
  deType: string;
};

const olevelLabel = (subject: string) => (subject === ENGLISH ? "English Language" : subject);

function toForm(d: StudentSettings): Form {
  const a = d.academics;
  const saved = a.utme.subjects;
  const english = saved.find((x) => x.subject === ENGLISH);
  const others = saved.filter((x) => x.subject !== ENGLISH).slice(0, 3);
  const utme: UtmeRow[] = [
    { subject: ENGLISH, score: english?.score != null ? String(english.score) : "" },
    ...others.map((x) => ({ subject: x.subject, score: x.score != null ? String(x.score) : "" })),
  ];
  while (utme.length < 4) utme.push({ subject: "", score: "" });

  const gradeOf = (subject: string) => a.olevel.grades.find((g) => g.subject === subject)?.grade || "";
  const extra = a.olevel.grades.filter((g) => g.subject !== ENGLISH && g.subject !== MATHS).map((g) => g.subject);
  const suggested = (BY_ARM[d.profile.classArm] || BY_ARM.Science).filter((x) => !extra.includes(x));
  const rest = [...extra, ...suggested].slice(0, Math.max(6, extra.length));
  return {
    utmeYear: a.utme.year || new Date().getFullYear(),
    utme,
    status: a.olevel.status,
    examBody: a.olevel.examBody || "WAEC",
    olevelYear: a.olevel.year,
    sittings: a.olevel.sittings,
    grades: [ENGLISH, MATHS, ...rest].map((subject) => ({ subject, grade: gradeOf(subject) })),
    de: a.directEntry.on,
    deType: a.directEntry.type,
  };
}

export default function AcademicSettings() {
  const { setPageDesc } = useAuth();
  const [data, setData] = useState<StudentSettings | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState(false);
  const formRef = useRef<Form | null>(null);
  const savedRef = useRef<StudentSettings | null>(null);
  formRef.current = form;
  savedRef.current = data;

  const load = () => {
    setFailed(false);
    getStudentSettings()
      .then((d) => {
        setData(d);
        setForm(toForm(d));
      })
      .catch(() => setFailed(true));
  };
  useEffect(() => {
    setPageDesc({ title: "Profile and settings", desc: "" });
    load();
  }, [setPageDesc]);

  const utmeFilled = (f: Form) => f.utme.filter((r) => r.subject && r.score !== "").length;
  const utmeTouched = (f: Form) => f.utme.some((r) => r.score !== "" || (r.subject && r.subject !== ENGLISH));

  const { state, mark } = useAutosave(
    () => formRef.current,
    async (f) => {
      if (!f) return;
      // Half-entered UTME scores are not sent: the saved scores stay until all four are in.
      const filled = utmeFilled(f);
      const partial = filled !== 4 && filled !== 0;
      const savedUtme = savedRef.current?.academics.utme.subjects || [];
      const body: AcademicsInput = {
        utme: {
          year: f.utmeYear,
          subjects: partial ? savedUtme.map((x) => ({ subject: x.subject, score: x.score })) : f.utme.filter((r) => r.subject && r.score !== "").map((r) => ({ subject: r.subject, score: Number(r.score) })),
        },
        olevel: { status: f.status, examBody: f.examBody, year: f.olevelYear, sittings: f.sittings, grades: f.status === "AWAITING" ? [] : f.grades.filter((g) => g.subject && g.grade) },
        directEntry: { on: f.de, type: f.deType },
      };
      try {
        const fresh = await saveStudentAcademics(body);
        setErrors({});
        setData(fresh);
      } catch (err) {
        setErrors(fieldErrors(err));
        throw err;
      }
    },
  );

  const change = (patch: Partial<Form>) => {
    setForm((f) => (f ? { ...f, ...patch } : f));
    mark();
  };
  const setUtme = (i: number, patch: Partial<UtmeRow>) => form && change({ utme: form.utme.map((r, k) => (k === i ? { ...r, ...patch } : r)) });
  const setGrade = (i: number, patch: Partial<GradeRow>) => form && change({ grades: form.grades.map((r, k) => (k === i ? { ...r, ...patch } : r)) });

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: now + 1 - 1999 }, (_, i) => now + 1 - i);
  }, []);

  const total = form ? form.utme.reduce((n, r) => n + (r.score !== "" && Number.isFinite(Number(r.score)) ? Number(r.score) : 0), 0) : 0;
  const filled = form ? utmeFilled(form) : 0;
  const credits = form ? form.grades.filter((g) => CREDITS.has(g.grade)) : [];
  const hasEnglish = credits.some((g) => g.subject === ENGLISH);
  const hasMaths = credits.some((g) => g.subject === MATHS);
  const anyGrade = !!form?.grades.some((g) => g.grade);
  const opts = data?.options;

  const scoreInput = (i: number, label: string) => (
    <span className={s.scoreBox}>
      <input
        className={s.score}
        type="number"
        inputMode="numeric"
        min={0}
        max={100}
        step={1}
        aria-label={`${label} score out of 100`}
        value={form!.utme[i].score}
        onChange={(e) => {
          const v = e.target.value.replace(/[^\d]/g, "").slice(0, 3);
          setUtme(i, { score: v === "" ? "" : String(Math.min(100, Number(v))) });
        }}
      />
      <span className={s.outOf}>/ 100</span>
    </span>
  );

  return (
    <SettingsPage icon={<GraduationCap size={28} strokeWidth={2} />} title="Academic records" sub="Your scores decide your chances. Keep them exactly as on your result slips.">
      {failed && <Problem retry={load} />}
      {!form && !failed && <Loading />}
      {form && data && opts && (
        <div className={s.card}>
          <Section
            title={
              <>
                UTME{" "}
                <select className={s.yearSel} aria-label="UTME year" value={form.utmeYear} onChange={(e) => change({ utmeYear: Number(e.target.value) })}>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </>
            }
            desc="Enter each subject score from your JAMB result slip. We add them up for you."
            aside={
              filled > 0 ? (
                <div className={s.total} aria-live="polite">
                  <span className={s.totalNum}>{total}</span>
                  <span className={s.totalOf}>of 400</span>
                </div>
              ) : undefined
            }
          >
            <div className={s.scores}>
              <div className={s.scoreRow}>
                <span className={s.subject}>
                  Use of English <small>· compulsory</small>
                </span>
                {scoreInput(0, "Use of English")}
              </div>
              {[1, 2, 3].map((i) => {
                const taken = form.utme.filter((_, k) => k !== i).map((r) => r.subject);
                return (
                  <div className={s.scoreRow} key={i}>
                    <select
                      className={`${s.subjectSel} ${form.utme[i].subject ? "" : s.subjectSelEmpty}`}
                      aria-label={`UTME subject ${i + 1}`}
                      value={form.utme[i].subject}
                      onChange={(e) => setUtme(i, { subject: e.target.value })}
                    >
                      <option value="">Choose subject</option>
                      {opts.utmeSubjects
                        .filter((x) => !taken.includes(x))
                        .map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                    </select>
                    {scoreInput(i, form.utme[i].subject || `Subject ${i + 1}`)}
                  </div>
                );
              })}
            </div>
            {errors.utme ? (
              <p className={s.error} role="alert">
                {errors.utme}
              </p>
            ) : filled !== 4 && utmeTouched(form) ? (
              <p className={`${s.hint} ${s.hintWarn}`} style={{ maxWidth: "none" }}>
                Enter all four subjects and scores. We save your UTME result once it is complete.
              </p>
            ) : (
              <p className={s.hint} style={{ maxWidth: "none" }}>
                Your subject combination must match what each course asks for. The eligibility check on a course tells you if it does not.
              </p>
            )}
          </Section>

          <Section title="O’Level results" desc="Most courses need five credits, including English Language and Mathematics, in at most two sittings.">
            <Segmented
              label="O'Level result status"
              value={form.status}
              onChange={(v) => change({ status: v })}
              options={[
                { value: "OUT", label: "Result out" },
                { value: "AWAITING", label: "Awaiting result" },
              ]}
            />
            <div className={`${s.grid} ${s.cols3}`}>
              <Field id="ac-body" label="Exam body" error={errors.examBody}>
                <select id="ac-body" className={s.select} value={form.examBody} onChange={(e) => change({ examBody: e.target.value })}>
                  {opts.examBodies.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="ac-year" label="Year" error={errors.olevelYear}>
                <select id="ac-year" className={`${s.select} ${form.olevelYear ? "" : s.selectEmpty}`} value={form.olevelYear ?? ""} onChange={(e) => change({ olevelYear: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">Choose</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="ac-sittings" label="Sittings">
                <select id="ac-sittings" className={s.select} value={form.sittings} onChange={(e) => change({ sittings: Number(e.target.value) === 2 ? 2 : 1 })}>
                  <option value={1}>One sitting</option>
                  <option value={2}>Two sittings</option>
                </select>
              </Field>
            </div>

            {form.status === "AWAITING" ? (
              <div className={`${s.banner} ${s.bannerInfo}`}>
                <Info size={20} aria-hidden="true" />
                <span>We match you on your UTME score for now. Come back and add your grades when your result is out.</span>
              </div>
            ) : (
              <>
                <div className={s.grades}>
                  {form.grades.map((row, i) => {
                    const required = row.subject === ENGLISH || row.subject === MATHS;
                    const taken = form.grades.filter((_, k) => k !== i).map((r) => r.subject);
                    return (
                      <div className={s.gradeRow} key={i}>
                        {required ? (
                          <span className={s.subject}>
                            {olevelLabel(row.subject)} <small>· required</small>
                          </span>
                        ) : (
                          <select className={`${s.subjectSel} ${row.subject ? "" : s.subjectSelEmpty}`} aria-label={`O'Level subject ${i + 1}`} value={row.subject} onChange={(e) => setGrade(i, { subject: e.target.value, grade: e.target.value ? row.grade : "" })}>
                            <option value="">Choose subject</option>
                            {opts.olevelSubjects
                              .filter((x) => x !== ENGLISH && x !== MATHS && !taken.includes(x))
                              .map((x) => (
                                <option key={x} value={x}>
                                  {x}
                                </option>
                              ))}
                          </select>
                        )}
                        <select
                          className={`${s.gradeSel} ${row.grade ? "" : s.gradeSelEmpty}`}
                          aria-label={`${row.subject ? olevelLabel(row.subject) : `Subject ${i + 1}`} grade`}
                          value={row.grade}
                          disabled={!row.subject}
                          onChange={(e) => setGrade(i, { grade: e.target.value })}
                        >
                          <option value="">Add</option>
                          {opts.grades.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
                {form.grades.length < MAX_OLEVEL && (
                  <button type="button" className={s.addMore} onClick={() => setForm((f) => (f ? { ...f, grades: [...f.grades, { subject: "", grade: "" }] } : f))}>
                    Add another subject
                  </button>
                )}
                {errors.olevel && (
                  <p className={s.error} role="alert">
                    {errors.olevel}
                  </p>
                )}
                {anyGrade &&
                  (credits.length >= 5 && hasEnglish && hasMaths ? (
                    <div className={`${s.banner} ${s.bannerOk}`} role="status">
                      <CheckCircle2 size={20} aria-hidden="true" />
                      <span>{credits.length} credits including English and Maths. That meets the usual five credit requirement.</span>
                    </div>
                  ) : (
                    <div className={`${s.banner} ${s.bannerWarn}`} role="status">
                      <AlertTriangle size={20} aria-hidden="true" />
                      <span>
                        {credits.length} {credits.length === 1 ? "credit" : "credits"} so far{!hasEnglish || !hasMaths ? `, without a credit in ${[!hasEnglish && "English Language", !hasMaths && "Mathematics"].filter(Boolean).join(" or ")}` : ""}. Most courses need five, including English Language and Mathematics.
                      </span>
                    </div>
                  ))}
              </>
            )}
          </Section>

          <Section title="Direct entry" desc="Skip UTME and start at 200 level with an A-Level, IJMB, JUPEB or ND.">
            <div className={s.plainRow}>
              <span>I have, or am taking, a direct entry qualification</span>
              <Toggle checked={form.de} onChange={(v) => change({ de: v })} label="I have, or am taking, a direct entry qualification" />
            </div>
            {form.de && (
              <>
                <div className={`${s.grid} ${s.cols3}`}>
                  <Field id="ac-de" label="Qualification" error={errors.directEntry}>
                    <select id="ac-de" className={`${s.select} ${form.deType ? "" : s.selectEmpty}`} value={form.deType} onChange={(e) => change({ deType: e.target.value })}>
                      <option value="">Choose</option>
                      {opts.directEntryTypes.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className={`${s.banner} ${s.bannerInfo}`}>
                  <Info size={20} aria-hidden="true" />
                  <span>Saved. Your matches still use your UTME score today. Direct entry matches come later, and we will tell you when they are ready.</span>
                </div>
              </>
            )}
          </Section>
        </div>
      )}
      <SaveStatus state={state} />
    </SettingsPage>
  );
}
