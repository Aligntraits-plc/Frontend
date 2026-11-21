import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { adminListScholarships, adminSaveScholarship, getWorkshopInterest, type AdminScholarship, type ScholarshipInput } from "../../services/finance";
import { errorMessage } from "../../services/roles";
import { Btn, Card, CardTitle, Empty, ErrorNote, Field, inputClass, Loading, Page, PageHead, Pill } from "../../components/Admin/kit";

/*
  The scholarship list students see on Financing, and how many students asked to be
  told about each workshop course. A closing date here is what triggers the reminder
  emails (7 days and 1 day before), so only enter a date confirmed on the official page.
*/
const BLANK: ScholarshipInput = { name: "", funder: "", amountText: "", windowText: "", closesAt: null, link: "", forText: "", level: "ANY", states: [], arms: [], gender: null, schoolName: "", active: true };
const LEVEL_LABELS: Record<string, string> = { ANY: "Any level", ENTRY: "100 level (new students)", FROM_200: "From 200 level" };
const dateInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");
const niceDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

export default function Scholarships() {
  const [rows, setRows] = useState<AdminScholarship[] | null>(null);
  const [options, setOptions] = useState<{ states: string[]; arms: string[]; levels: string[] }>({ states: [], arms: [], levels: [] });
  const [interest, setInterest] = useState<{ slug: string; title: string; category: string; interested: number }[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<ScholarshipInput>(BLANK);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = () =>
    adminListScholarships()
      .then((d) => {
        setRows(d.scholarships);
        setOptions(d.options);
      })
      .catch((err) => setError(errorMessage(err)));
  useEffect(() => {
    load();
    getWorkshopInterest().then((d) => setInterest(d.courses)).catch(() => setInterest([]));
  }, []);

  const start = (row: AdminScholarship | null) => {
    setFields({});
    setEditing(row ? row.id : "new");
    setForm(row ? { name: row.name, funder: row.funder, amountText: row.amountText, windowText: row.windowText, closesAt: row.closesAt, link: row.link || "", forText: row.forText, level: row.level, states: row.states, arms: row.arms, gender: row.gender, schoolName: row.schoolName || "", active: row.active } : BLANK);
    requestAnimationFrame(() => document.getElementById("sch-form")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const set = <K extends keyof ScholarshipInput>(k: K, v: ScholarshipInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFields({});
    try {
      await adminSaveScholarship(editing === "new" ? null : editing, { ...form, closesAt: form.closesAt ? new Date(`${dateInput(form.closesAt)}T22:59:00.000Z`).toISOString() : null });
      toast.success(editing === "new" ? "Scholarship added" : "Scholarship saved");
      setEditing(null);
      await load();
    } catch (err) {
      const f = (err as { response?: { data?: { fields?: Record<string, string> } } })?.response?.data?.fields;
      if (f) setFields(f);
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const err = (k: string) => (fields[k] ? <span className="text-[12px] font-medium text-[#B42318]">{fields[k]}</span> : null);

  return (
    <Page>
      <PageHead
        title="Scholarships and workshops"
        intro="The scholarships students see on their Financing page, and which workshop courses students are waiting for."
        actions={<Btn onClick={() => start(null)}>Add a scholarship</Btn>}
      />
      {error && <ErrorNote>{error}</ErrorNote>}

      {editing && (
        <Card>
          <div id="sch-form" />
          <CardTitle hint="Use the wording on the official page. Leave the closing date empty until it is confirmed there.">{editing === "new" ? "Add a scholarship" : "Edit scholarship"}</CardTitle>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={120} required />
              {err("name")}
            </Field>
            <Field label="Funded by">
              <input className={inputClass} value={form.funder} onChange={(e) => set("funder", e.target.value)} maxLength={120} required />
              {err("funder")}
            </Field>
            <Field label="What it pays" hint='For example "₦250,000 a year" or "Amount not published".'>
              <input className={inputClass} value={form.amountText} onChange={(e) => set("amountText", e.target.value)} maxLength={120} required />
              {err("amountText")}
            </Field>
            <Field label="Who it is for" hint="A few words, shown as a tag.">
              <input className={inputClass} value={form.forText} onChange={(e) => set("forText", e.target.value)} maxLength={80} required />
              {err("forText")}
            </Field>
            <Field label="When it usually opens" hint="Shown while there is no confirmed closing date.">
              <input className={inputClass} value={form.windowText} onChange={(e) => set("windowText", e.target.value)} maxLength={120} required />
              {err("windowText")}
            </Field>
            <Field label="Confirmed closing date" hint="Students who switched reminders on get an email 7 days and 1 day before.">
              <input type="date" className={inputClass} value={dateInput(form.closesAt)} onChange={(e) => set("closesAt", e.target.value ? new Date(`${e.target.value}T12:00:00.000Z`).toISOString() : null)} />
              {err("closesAt")}
            </Field>
            <Field label="Official page" hint="Starts with https://">
              <input type="url" className={inputClass} value={form.link || ""} onChange={(e) => set("link", e.target.value)} placeholder="https://" maxLength={300} />
              {err("link")}
            </Field>
            <Field label="Level">
              <select className={inputClass} value={form.level} onChange={(e) => set("level", e.target.value)}>
                {options.levels.map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_LABELS[l] || l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Only for this state of origin" hint="Leave on Any state unless the funder limits it.">
              <select className={inputClass} value={form.states[0] || ""} onChange={(e) => set("states", e.target.value ? [e.target.value] : [])}>
                <option value="">Any state</option>
                {options.states.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Only for">
              <select className={inputClass} value={form.gender || ""} onChange={(e) => set("gender", e.target.value || null)}>
                <option value="">Everyone</option>
                <option value="FEMALE">Female students</option>
                <option value="MALE">Male students</option>
              </select>
            </Field>
            <fieldset className="min-w-0">
              <legend className="mb-1.5 text-[14px] font-medium text-[#344054]">Only for these class arms</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {options.arms.map((a) => (
                  <label key={a} className="inline-flex items-center gap-2 text-[14px] text-[#344054]">
                    <input type="checkbox" className="h-4 w-4" checked={form.arms.includes(a)} onChange={(e) => set("arms", e.target.checked ? [...form.arms, a] : form.arms.filter((x) => x !== a))} />
                    {a}
                  </label>
                ))}
              </div>
              <span className="mt-1 block text-[12px] text-[#667085]">Tick none for any arm.</span>
            </fieldset>
            <Field label="Only for students of this university" hint="Leave empty unless the university itself funds it.">
              <input className={inputClass} value={form.schoolName || ""} onChange={(e) => set("schoolName", e.target.value)} maxLength={120} />
            </Field>
            <label className="inline-flex items-center gap-2 text-[14px] font-medium text-[#344054] md:col-span-2">
              <input type="checkbox" className="h-4 w-4" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
              Show this scholarship to students
            </label>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Btn type="submit" busy={busy}>
                {editing === "new" ? "Add scholarship" : "Save changes"}
              </Btn>
              <Btn tone="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Btn>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardTitle hint="Students only see a closing date after you enter one. Until then they see when it usually opens.">Scholarships</CardTitle>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty title="No scholarships yet">Add the first one with the button above.</Empty>
        ) : (
          <ul className="flex flex-col divide-y divide-[#EAECF0]">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-[#101828]">
                    <span className="break-words">{r.name}</span>
                    {!r.active && <Pill>Hidden</Pill>}
                    {r.closesAt ? <Pill tone="gold">Closes {niceDate(r.closesAt)}</Pill> : <Pill tone="red">No closing date: reminders are off</Pill>}
                  </p>
                  <p className="mt-1 text-[14px] leading-[22px] text-[#475467]">
                    {r.funder} · {r.amountText}
                  </p>
                  <p className="text-[13px] leading-[20px] text-[#667085]">
                    For: {r.forText} · {LEVEL_LABELS[r.level] || r.level} · {r.followers} {r.followers === 1 ? "student wants" : "students want"} reminders
                    {r.checkedAt ? ` · last checked ${niceDate(r.checkedAt)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {r.link && (
                    <a href={r.link} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-lg border border-[#D0D5DD] px-3 text-[14px] font-semibold text-[#344054] hover:bg-[#F9FAFB]">
                      Official page
                    </a>
                  )}
                  <Btn small tone="secondary" onClick={() => start(r)} label={`Edit ${r.name}`}>
                    Edit
                  </Btn>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle hint='Students tap "Notify me when this opens" on a preview course. The course with the most interest is the one to open first.'>Workshop interest</CardTitle>
        {!interest ? (
          <Loading />
        ) : (
          <ul className="flex flex-col divide-y divide-[#EAECF0]">
            {interest.map((c) => (
              <li key={c.slug} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="break-words text-[15px] font-semibold text-[#101828]">{c.title}</p>
                  <p className="text-[13px] text-[#667085]">{c.category} · Preview</p>
                </div>
                <Pill tone={c.interested > 0 ? "navy" : "grey"}>
                  {c.interested} {c.interested === 1 ? "student" : "students"}
                </Pill>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}
