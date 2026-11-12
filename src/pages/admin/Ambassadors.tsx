import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import {
  adminListAmbassadors,
  adminMakeAmbassador,
  adminSetAmbassadorActive,
  errorCode,
  errorMessage,
  listInvites,
  sendInvite,
  shortDate,
  type AmbassadorRow,
  type Invite,
} from "../../services/roles";
import { Btn, Card, CardTitle, Empty, ErrorNote, Field, inputClass, Loading, Page, PageHead, Pill } from "../../components/Admin/kit";
import InviteList from "../../components/Admin/InviteList";

/* Ambassadors (admins): students with an AlignTraits tag in Community and their own invite link.
   Applications from the website arrive in Requests; reply on WhatsApp, then add them here. */
export default function Ambassadors() {
  const [rows, setRows] = useState<AmbassadorRow[] | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadError, setLoadError] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  const load = () =>
    Promise.all([adminListAmbassadors(), listInvites()])
      .then(([a, i]) => {
        setRows(a);
        setInvites(i.filter((x) => x.role === "AMBASSADOR"));
      })
      .catch((err) => setLoadError(errorMessage(err, "We could not load ambassadors.")));
  useEffect(() => {
    load();
  }, []);

  /* An existing student becomes an ambassador at once; anyone else gets an invitation email. */
  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setFormError("Enter a valid email address.");
    setFormError("");
    setBusy(true);
    try {
      const r = await adminMakeAmbassador(value);
      toast.success(r.message);
      setEmail("");
      load();
    } catch (err) {
      if (errorCode(err) === "NO_ACCOUNT") {
        try {
          const r = await sendInvite({ email: value, role: "AMBASSADOR" });
          setInvites((prev) => [r.data, ...prev]);
          setEmail("");
          toast.success(`${value} has no account yet, so we sent an invitation to join as an ambassador.`);
        } catch (err2) {
          setFormError(errorMessage(err2));
        }
      } else setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (a: AmbassadorRow) => {
    setToggling(a.id);
    try {
      const r = await adminSetAmbassadorActive(a.id, !a.active);
      setRows((prev) => prev?.map((x) => (x.id === a.id ? { ...x, active: !a.active } : x)) || null);
      toast.success(r.message);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setToggling(null);
    }
  };

  return (
    <Page>
      <PageHead
        title="Ambassadors"
        intro="Ambassadors keep everything they have as students, plus an AlignTraits tag in Community, their own invite link, up to 5 invite emails a day, and event suggestions you approve. A referral only counts as active once the student verifies their email and finishes the survey."
      />

      <Card>
        <CardTitle hint="If the student already has an account they become an ambassador straight away. If not, we email them an invitation.">Add an ambassador</CardTitle>
        <form onSubmit={onAdd} noValidate className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <Field label="Student's email address">
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@gmail.com" />
          </Field>
          <Btn type="submit" busy={busy}>
            Add ambassador
          </Btn>
        </form>
        <div className="mt-3">
          <ErrorNote>{formError}</ErrorNote>
        </div>
        <p className="mt-2 text-[13px] text-[#B54708]">For students under 18, speak to a parent or guardian first. The application in Requests shows their age group.</p>
      </Card>

      <Card>
        <CardTitle>Ambassadors {rows ? `(${rows.length})` : ""}</CardTitle>
        {loadError ? (
          <ErrorNote>{loadError}</ErrorNote>
        ) : !rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty title="No ambassadors yet">Add one above, or look at ambassador applications in Requests.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-[#EAECF0] text-[12px] uppercase tracking-wide text-[#667085]">
                  <th className="py-2 pr-3 font-semibold">Ambassador</th>
                  <th className="py-2 pr-3 font-semibold">Invites sent</th>
                  <th className="py-2 pr-3 font-semibold">Joined</th>
                  <th className="py-2 pr-3 font-semibold">Active</th>
                  <th className="py-2 pr-3 font-semibold">Since</th>
                  <th className="py-2 font-semibold"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-b border-[#F2F4F7] align-middle">
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-[#101828]">{a.name}</p>
                      <p className="text-[13px] text-[#667085]">{a.email} · code {a.code}</p>
                    </td>
                    <td className="py-3 pr-3">{a.invitesSent}</td>
                    <td className="py-3 pr-3">{a.joined}</td>
                    <td className="py-3 pr-3">{a.activeStudents}</td>
                    <td className="py-3 pr-3 text-[#667085]">{shortDate(a.since)}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!a.active && <Pill tone="grey">Paused</Pill>}
                        <Btn small tone={a.active ? "secondary" : "primary"} busy={toggling === a.id} onClick={() => toggle(a)}>
                          {a.active ? "Pause" : "Switch on"}
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardTitle>Invitations</CardTitle>
          <InviteList invites={invites} emptyText="" onChange={(i) => setInvites((prev) => prev.map((p) => (p.id === i.id ? i : p)))} />
        </Card>
      )}
    </Page>
  );
}
