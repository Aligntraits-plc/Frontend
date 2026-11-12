import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { FiCopy, FiSearch } from "react-icons/fi";
import {
  adminCreateSchool,
  adminCreateSchoolCode,
  adminListSchools,
  adminUpdateSchool,
  errorMessage,
  listInvites,
  sendInvite,
  type Invite,
  type PartnerSchool,
} from "../../services/roles";
import { Btn, Card, CardTitle, copyText, Empty, ErrorNote, Field, inputClass, Loading, Page, PageHead, Pill } from "../../components/Admin/kit";
import InviteList from "../../components/Admin/InviteList";

const STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];

/* Partner schools (admins): add a school, invite its counsellors, and give it a
   free code when needed. Schools normally buy seats themselves in the school portal. */
export default function PartnerSchools() {
  const [schools, setSchools] = useState<PartnerSchool[] | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ name: "", state: "Lagos", contactEmail: "" });
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminListSchools(), listInvites()])
      .then(([s, i]) => {
        setSchools(s);
        setInvites(i.filter((x) => x.role === "COUNSELLOR"));
      })
      .catch((err) => setLoadError(errorMessage(err, "We could not load partner schools.")));
  }, []);

  const shown = useMemo(
    () => (schools || []).filter((s) => !query.trim() || s.name.toLowerCase().includes(query.trim().toLowerCase())),
    [schools, query]
  );

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return setFormError("Enter the school name.");
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) return setFormError("The school email is not valid.");
    setFormError("");
    setAdding(true);
    try {
      const s = await adminCreateSchool({ name: form.name.trim(), state: form.state, contactEmail: form.contactEmail.trim() });
      setSchools((prev) => [s, ...(prev || [])]);
      setForm({ name: "", state: form.state, contactEmail: "" });
      setOpenId(s.id);
      toast.success(`${s.name} added. Its private Community channel is ready.`);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const update = (s: PartnerSchool) => setSchools((prev) => prev?.map((x) => (x.id === s.id ? s : x)) || null);

  return (
    <Page>
      <PageHead
        title="Partner schools"
        intro="Secondary schools that work with AlignTraits. Each school gets a school portal for its counsellors and a private Community channel for its students. Schools pay ₦2,600 per student in the portal; you can also give a school a free code here."
      />

      <Card>
        <CardTitle>Add a partner school</CardTitle>
        <form onSubmit={onAdd} noValidate className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_180px_minmax(0,1fr)_auto] md:items-end">
          <Field label="School name">
            <input className={inputClass} value={form.name} maxLength={120} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kings College, Lagos" />
          </Field>
          <Field label="State">
            <select className={inputClass} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="School email (optional)">
            <input className={inputClass} type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="office@school.edu.ng" />
          </Field>
          <Btn type="submit" busy={adding}>
            Add school
          </Btn>
        </form>
        <div className="mt-3">
          <ErrorNote>{formError}</ErrorNote>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[16px] font-semibold text-[#101828]">Schools {schools ? `(${schools.length})` : ""}</h2>
          <label className="relative sm:w-[280px]">
            <span className="sr-only">Search schools</span>
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" aria-hidden="true" />
            <input className={`${inputClass} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search schools" />
          </label>
        </div>
        {loadError ? (
          <ErrorNote>{loadError}</ErrorNote>
        ) : !schools ? (
          <Loading />
        ) : shown.length === 0 ? (
          <Empty title={schools.length ? "No school matches your search" : "No partner schools yet"}>
            {schools.length ? "Try another name." : "Add the first school above. Requests from schools arrive in Requests."}
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {shown.map((s) => (
              <SchoolRow
                key={s.id}
                school={s}
                open={openId === s.id}
                onToggle={() => setOpenId(openId === s.id ? null : s.id)}
                onUpdate={update}
                invites={invites.filter((i) => i.schoolId === s.id)}
                onInvite={(i) => setInvites((prev) => [i, ...prev.filter((p) => p.id !== i.id)])}
                onInviteChange={(i) => setInvites((prev) => prev.map((p) => (p.id === i.id ? i : p)))}
              />
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}

function SchoolRow({
  school: s,
  open,
  onToggle,
  onUpdate,
  invites,
  onInvite,
  onInviteChange,
}: {
  school: PartnerSchool;
  open: boolean;
  onToggle: () => void;
  onUpdate: (s: PartnerSchool) => void;
  invites: Invite[];
  onInvite: (i: Invite) => void;
  onInviteChange: (i: Invite) => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [seats, setSeats] = useState("20");
  const [days, setDays] = useState("30");
  const [making, setMaking] = useState(false);
  const [madeCode, setMadeCode] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const invite = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErr("Enter the counsellor's email address.");
    setErr("");
    setSending(true);
    try {
      const r = await sendInvite({ email: email.trim(), role: "COUNSELLOR", partnerSchoolId: s.id });
      onInvite(r.data);
      setEmail("");
      toast.success(r.message);
    } catch (error) {
      setErr(errorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const makeCode = async (e: FormEvent) => {
    e.preventDefault();
    const n = Number(seats);
    const d = Number(days);
    if (!Number.isInteger(n) || n < 1 || n > 500) return setErr("Students must be 1 to 500.");
    if (!Number.isInteger(d) || d < 1 || d > 366) return setErr("Days must be 1 to 366.");
    setErr("");
    setMaking(true);
    try {
      const c = await adminCreateSchoolCode({ partnerSchoolId: s.id, seats: n, days: d });
      setMadeCode(c.code);
      onUpdate({ ...s, seats: s.seats + c.seats });
      toast.success(`Free code ${c.code} made for ${s.name}`);
    } catch (error) {
      setErr(errorMessage(error));
    } finally {
      setMaking(false);
    }
  };

  const toggleActive = async () => {
    setToggling(true);
    try {
      onUpdate(await adminUpdateSchool(s.id, { active: !s.active }));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setToggling(false);
    }
  };

  return (
    <li className="rounded-xl border border-[#EAECF0]">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full flex-col gap-2 p-4 text-left sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[#101828]">{s.name}</p>
          <p className="text-[13px] text-[#667085]">
            {[s.state, `${s.students} ${s.students === 1 ? "student" : "students"}`, `${s.counsellors.length} ${s.counsellors.length === 1 ? "counsellor" : "counsellors"}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={s.seats ? "green" : "grey"}>{s.seats ? `${s.seatsUsed} of ${s.seats} seats used` : "No live seats"}</Pill>
          {!s.active && <Pill tone="red">Switched off</Pill>}
          <span className="text-[13px] font-semibold text-[#004085]">{open ? "Close" : "Manage"}</span>
        </div>
      </button>

      {open && (
        <div className="grid gap-5 border-t border-[#EAECF0] p-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="text-[14px] font-semibold text-[#101828]">Counsellors</h3>
            {s.counsellors.length ? (
              <ul className="flex flex-col gap-1">
                {s.counsellors.map((c) => (
                  <li key={c.id} className="text-[14px] text-[#344054]">
                    {c.name} <span className="text-[#667085]">· {c.email}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-[#667085]">No counsellor has joined yet.</p>
            )}
            <form onSubmit={invite} noValidate className="flex flex-col gap-2 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Counsellor email</span>
                <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="counsellor@school.edu.ng" />
              </label>
              <Btn type="submit" busy={sending}>
                Invite counsellor
              </Btn>
            </form>
            {invites.length > 0 && <InviteList invites={invites} onChange={onInviteChange} emptyText="" />}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-[14px] font-semibold text-[#101828]">Give a free code</h3>
            <p className="text-[13px] leading-[20px] text-[#667085]">
              The school does not pay for this code. It covers up to the number of students you set, for 30 days unless you change it.
            </p>
            <form onSubmit={makeCode} noValidate className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Field label="Students">
                <input className={inputClass} inputMode="numeric" value={seats} onChange={(e) => setSeats(e.target.value.replace(/\D/g, ""))} />
              </Field>
              <Field label="Days">
                <input className={inputClass} inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ""))} />
              </Field>
              <div className="col-span-2 sm:col-span-1">
                <Btn type="submit" tone="secondary" busy={making}>
                  Make code
                </Btn>
              </div>
            </form>
            {madeCode && (
              <div className="flex items-center justify-between rounded-lg bg-[#F5F8FF] p-3">
                <span className="font-mono text-[18px] font-bold tracking-[0.2em] text-[#004085]">{madeCode}</span>
                <Btn small tone="ghost" onClick={async () => toast.success((await copyText(madeCode)) ? "Copied" : `The code is ${madeCode}`)}>
                  <FiCopy aria-hidden="true" /> Copy
                </Btn>
              </div>
            )}
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
              <Btn small tone={s.active ? "danger" : "secondary"} busy={toggling} onClick={toggleActive}>
                {s.active ? "Switch school off" : "Switch school back on"}
              </Btn>
              <span className="text-[12px] text-[#667085]">{s.active ? "Hides it from the student school list." : "Students can pick it again."}</span>
            </div>
          </div>
          <div className="lg:col-span-2">
            <ErrorNote>{err}</ErrorNote>
          </div>
        </div>
      )}
    </li>
  );
}
