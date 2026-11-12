import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/useAuth";
import {
  changeRole,
  errorMessage,
  listInvites,
  listTeam,
  removeTeamMember,
  ROLE_LABELS,
  sendInvite,
  type Invite,
  type TeamMember,
} from "../../services/roles";
import { Btn, Card, CardTitle, Empty, ErrorNote, Field, inputClass, Loading, Page, PageHead, Pill } from "../../components/Admin/kit";
import InviteList from "../../components/Admin/InviteList";

const STAFF_ROLES = [
  { value: "ADMIN", label: "Admin", hint: "Everything except managing staff." },
  { value: "CONTENT_MANAGER", label: "Content manager", hint: "Schools, courses, requirements, exam dates and deadlines." },
  { value: "SUPER_ADMIN", label: "Super admin", hint: "Everything, including inviting and removing staff." },
];

/* Team (super admins): invite staff by email and choose what each person can do. */
export default function Team() {
  const { admin } = useAuth();
  const me = (admin as any)?.id;
  const [team, setTeam] = useState<TeamMember[] | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadError, setLoadError] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listTeam(), listInvites()])
      .then(([t, i]) => {
        setTeam(t);
        setInvites(i.filter((x) => ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(x.role)));
      })
      .catch((err) => setLoadError(errorMessage(err, "We could not load the team. Refresh to try again.")));
  }, []);

  const onInvite = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setFormError("Enter a valid email address.");
    setFormError("");
    setSending(true);
    try {
      const r = await sendInvite({ email: value, role });
      setInvites((prev) => [r.data, ...prev.filter((p) => p.email !== r.data.email || p.status === "accepted")]);
      setEmail("");
      toast.success(r.message);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const onRole = async (m: TeamMember, next: string) => {
    setBusy(`role:${m.id}`);
    try {
      const updated = await changeRole(m.id, next);
      setTeam((prev) => prev?.map((x) => (x.id === m.id ? { ...x, role: updated.role } : x)) || null);
      toast.success(`${m.firstname} is now ${ROLE_LABELS[updated.role].toLowerCase()}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const onRemove = async (m: TeamMember) => {
    setBusy(`remove:${m.id}`);
    try {
      await removeTeamMember(m.id);
      setTeam((prev) => prev?.filter((x) => x.id !== m.id) || null);
      toast.success(`${m.firstname} ${m.lastname} was removed`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
      setConfirmRemove(null);
    }
  };

  return (
    <Page>
      <PageHead
        title="Team"
        intro="Invite staff by email. They open the link, set their own name and password, and can sign in straight away. Nobody else ever sees or sends their password."
      />

      <Card>
        <CardTitle hint="The link works for 7 days. You can send it again or cancel it below.">Invite someone</CardTitle>
        <form onSubmit={onInvite} noValidate className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px_auto] md:items-end">
          <Field label="Email address">
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@aligntraits.com" />
          </Field>
          <Field label="Role">
            <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value)}>
              {STAFF_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Btn type="submit" busy={sending}>
            Send invitation
          </Btn>
        </form>
        <p className="mt-3 text-[13px] text-[#667085]">{STAFF_ROLES.find((r) => r.value === role)?.hint}</p>
        <div className="mt-2">
          <ErrorNote>{formError}</ErrorNote>
        </div>
        <p className="mt-3 text-[13px] text-[#667085]">
          School counsellors are invited from Partner schools, and ambassadors from Ambassadors.
        </p>
      </Card>

      <Card>
        <CardTitle>Staff</CardTitle>
        {loadError ? (
          <ErrorNote>{loadError}</ErrorNote>
        ) : !team ? (
          <Loading />
        ) : team.length === 0 ? (
          <Empty title="No staff yet" />
        ) : (
          <ul className="divide-y divide-[#EAECF0]">
            {team.map((m) => {
              const self = m.id === me;
              return (
                <li key={m.id} className="flex flex-col gap-3 py-3 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-[#101828]">
                      {m.firstname} {m.lastname} {self && <Pill tone="blue">You</Pill>}
                    </p>
                    <p className="truncate text-[13px] text-[#667085]">{m.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {self ? (
                      <Pill tone="navy">{ROLE_LABELS[m.role]}</Pill>
                    ) : (
                      <select
                        aria-label={`Role for ${m.firstname}`}
                        className={`${inputClass} !h-9 !w-auto !text-[14px]`}
                        value={m.role}
                        disabled={busy === `role:${m.id}`}
                        onChange={(e) => onRole(m, e.target.value)}
                      >
                        {m.role === "ANALYST" && <option value="ANALYST">Analyst (old role)</option>}
                        {STAFF_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {!self &&
                      (confirmRemove === m.id ? (
                        <>
                          <Btn small tone="danger" busy={busy === `remove:${m.id}`} onClick={() => onRemove(m)}>
                            Yes, remove
                          </Btn>
                          <Btn small tone="secondary" onClick={() => setConfirmRemove(null)}>
                            Keep
                          </Btn>
                        </>
                      ) : (
                        <Btn small tone="danger" onClick={() => setConfirmRemove(m.id)}>
                          Remove
                        </Btn>
                      ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>Invitations</CardTitle>
        <InviteList
          invites={invites}
          emptyText="Invitations you send appear here until they are accepted."
          onChange={(i) => setInvites((prev) => prev.map((p) => (p.id === i.id ? i : p)))}
        />
      </Card>
    </Page>
  );
}
