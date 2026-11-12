import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import api from "../../api/axios";
import { questions } from "../../data/questions";
import { CLASS_LEVELS, errorCode, errorMessage, portalAssisted } from "../../services/roles";
import { Btn, Card, CardTitle, ErrorNote, Field, inputClass } from "../../components/Admin/kit";

type Student = { id: string; firstname: string; lastname: string; email: string };

/* Run the career survey with a student on the school's computer or the counsellor's
   phone. The answers are saved to the student's own account, linked to your school. */
export default function Survey() {
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", classLevel: "SS3" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const start = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.firstname.trim() || !form.lastname.trim()) return setError("Enter the student's first name and last name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError("Enter the student's email address, or a parent's if the student has none.");
    setError("");
    setBusy(true);
    try {
      setStudent(await portalAssisted({ ...form, email: form.email.trim() }));
      setStep(0);
      setAnswers({});
      setDone(false);
    } catch (err) {
      setError(errorCode(err) === "EXISTING_ACCOUNT" ? `${errorMessage(err)} Use the Invite tab.` : errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!student) return;
    setSending(true);
    setError("");
    try {
      await api.post("/career/answers/server", {
        answers: questions.filter((q) => answers[q.id]).map((q) => ({ question: q.question, answer: answers[q.id] })),
        firstName: student.firstname,
        lastName: student.lastname,
        email: student.email,
      });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err, "We could not save the answers. Check the connection and press Finish again."));
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setStudent(null);
    setForm({ firstname: "", lastname: "", email: "", classLevel: form.classLevel });
    setDone(false);
  };

  if (student && done) {
    return (
      <div className="mx-auto max-w-[560px] rounded-2xl border border-[#E4E9F0] bg-white p-6 text-center sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF3] text-[#067647]">
          <FiCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-[22px] font-bold text-[#002650]">All done, {student.firstname}!</h1>
        <p className="mt-2 text-[15px] leading-[24px] text-[#475467]">
          Your answers are saved. We have emailed {student.email} a link to set up your account and see your results. Please hand the device back to your counsellor.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to={`/school-portal/students/${student.id}`} className="inline-flex h-11 items-center justify-center rounded-lg bg-[#004085] px-5 text-[14px] font-semibold text-white">
            See {student.firstname}'s results
          </Link>
          <Btn tone="secondary" onClick={reset}>
            Next student
          </Btn>
        </div>
      </div>
    );
  }

  if (student) {
    const q = questions[step];
    const last = step === questions.length - 1;
    return (
      <div className="mx-auto max-w-[720px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button type="button" onClick={() => (step === 0 ? setStudent(null) : setStep(step - 1))} className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#004085]">
            <FiArrowLeft aria-hidden="true" /> {step === 0 ? "Change student" : "Back"}
          </button>
          <span className="text-[14px] text-[#475467]">
            {student.firstname} · question {step + 1} of {questions.length}
          </span>
        </div>
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-[#E4E9F0]" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={step + 1}>
          <div className="h-full rounded-full bg-[#F6C648] transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
        </div>
        <div className="rounded-2xl border border-[#E4E9F0] bg-white p-5 sm:p-8">
          <h1 className="text-[22px] font-bold leading-snug text-[#002650] sm:text-[26px]" style={{ fontFamily: "'AT Fira Sans', 'Fira Sans', sans-serif" }}>
            {q.question}
          </h1>
          <div className="mt-6 grid gap-3" role="radiogroup" aria-label={q.question}>
            {q.options.map((o) => {
              const picked = answers[q.id] === o.value;
              return (
                <button
                  key={o.label}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, [q.id]: o.value }));
                    if (!last) setTimeout(() => setStep((s) => Math.min(s + 1, questions.length - 1)), 180);
                  }}
                  className={`flex min-h-[60px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[16px] font-medium transition-colors ${
                    picked ? "border-[#004085] bg-[#EEF4FF] text-[#002650]" : "border-[#E4E9F0] text-[#344054] hover:border-[#B2CCFF]"
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${picked ? "border-[#004085] bg-[#004085] text-white" : "border-[#D0D5DD]"}`}>
                    {picked && <FiCheck className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  {o.value}
                </button>
              );
            })}
          </div>
          {last && (
            <div className="mt-6 flex flex-col gap-3">
              <ErrorNote>{error}</ErrorNote>
              <Btn busy={sending} disabled={questions.some((x) => !answers[x.id])} onClick={submit}>
                Finish
              </Btn>
              {questions.some((x) => !answers[x.id]) && <p className="text-[13px] text-[#667085]">Answer every question to finish. Use Back to see any you skipped.</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[980px] gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardTitle hint="For students without a phone, or in the computer lab. Enter the student's details, then hand them the device for 14 quick questions.">
          Run the career survey
        </CardTitle>
        <form onSubmit={start} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input className={inputClass} value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })} />
          </Field>
          <Field label="Last name">
            <input className={inputClass} value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email address" hint="The student's own email, or a parent's. We send the results and a link to set up the account there.">
              <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
          </div>
          <Field label="Class">
            <select className={inputClass} value={form.classLevel} onChange={(e) => setForm({ ...form, classLevel: e.target.value })}>
              {CLASS_LEVELS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <ErrorNote>{error}</ErrorNote>
          </div>
          <div className="sm:col-span-2">
            <Btn type="submit" busy={busy}>
              Start the survey
            </Btn>
          </div>
        </form>
      </Card>
      <Card>
        <h2 className="text-[15px] font-semibold text-[#101828]">Good to know</h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[14px] leading-[22px] text-[#475467]">
          <li>The student's answers are saved to their own account, and they appear in your Students list.</li>
          <li>If you have seats left, the student is covered automatically.</li>
          <li>A student who already has an AlignTraits account should join through your invitation instead, so their account stays theirs.</li>
        </ul>
      </Card>
    </div>
  );
}
