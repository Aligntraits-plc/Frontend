import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";
import { FiCopy, FiLink } from "react-icons/fi";
import { errorMessage, portalCodes, portalInvite, portalInvites, shortDate, type PortalCode } from "../../services/roles";
import { Btn, Card, CardTitle, copyText, Empty, ErrorNote, Field, inputClass, Loading, Pill } from "../../components/Admin/kit";
import { usePortal } from "./PortalContext";

const STATUS_TEXT: Record<string, string> = {
  invited: "Invitation sent",
  linked: "Already on AlignTraits: added to your school",
  already: "Already invited",
  limit: "Not sent: daily limit reached",
};

/* Invite students: share the school link and code on WhatsApp (best), or send emails. */
export default function Invite() {
  const { overview } = usePortal();
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<{ email: string; status: string }[]>([]);
  const [data, setData] = useState<Awaited<ReturnType<typeof portalInvites>> | null>(null);
  const [code, setCode] = useState<PortalCode | null>(null);

  const load = () => {
    portalInvites().then(setData).catch(() => undefined);
    portalCodes()
      .then((c) => setCode(c.codes.find((x) => x.status === "active") || null))
      .catch(() => undefined);
  };
  useEffect(load, []);

  const link = overview?.joinLink || "";
  const message = `${overview?.school.name || "Our school"} uses AlignTraits to help you find courses and universities you can realistically get into and afford. Create your account here: ${link}${
    code ? `\nYour school code: ${code.code}` : ""
  }\nThe school will be able to see your survey results so your counsellor can guide you.`;

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    const emails = Array.from(new Set(raw.split(/[\s,;]+/).map((x) => x.trim().toLowerCase()).filter(Boolean)));
    if (!emails.length) return setError("Enter at least one email address.");
    const bad = emails.find((x) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x));
    if (bad) return setError(`Check this address: ${bad}`);
    if (emails.length > 30) return setError("Invite up to 30 students at a time.");
    setError("");
    setBusy(true);
    try {
      const r = await portalInvite(emails);
      setResults(r.data.results);
      setRaw("");
      toast.success(r.message);
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardTitle hint="This is the quickest way: students tap the link on their phone and create an account. They join your school list straight away.">
          Share on WhatsApp
        </CardTitle>
        <div className="rounded-xl bg-[#F5F8FF] p-4 text-[14px] leading-[22px] text-[#344054] whitespace-pre-line">{message}</div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-[14px] font-semibold text-white"
          >
            <FaWhatsapp aria-hidden="true" /> Share on WhatsApp
          </a>
          <Btn tone="secondary" onClick={async () => toast.success((await copyText(link)) ? "Link copied" : link)}>
            <FiLink aria-hidden="true" /> Copy link
          </Btn>
          {code && (
            <Btn tone="secondary" onClick={async () => toast.success((await copyText(code.code)) ? `Code ${code.code} copied` : code.code)}>
              <FiCopy aria-hidden="true" /> Copy code {code.code}
            </Btn>
          )}
        </div>
        {!code && (
          <p className="mt-3 text-[13px] text-[#B54708]">
            You have no live code, so students who join will not be covered until you add seats in Seats and code.
          </p>
        )}
      </Card>

      <Card>
        <CardTitle hint={`Up to ${data?.perDay ?? 25} invitation emails a day. Students you invite are covered automatically while you have seats left.`}>
          Invite by email
        </CardTitle>
        <form onSubmit={onSend} noValidate className="flex flex-col gap-3">
          <Field label="Student email addresses" hint="Separate with commas, spaces or new lines. Up to 30 at a time.">
            <textarea className={`${inputClass} !h-28 py-2`} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={"ada@gmail.com, tunde@yahoo.com"} />
          </Field>
          <ErrorNote>{error}</ErrorNote>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-[#667085]">{data ? `${data.left} left today` : ""}</span>
            <Btn type="submit" busy={busy}>
              Send invitations
            </Btn>
          </div>
        </form>
        {results.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1 rounded-lg bg-[#F9FAFB] p-3 text-[13px]">
            {results.map((r) => (
              <li key={r.email} className="flex justify-between gap-2">
                <span className="truncate">{r.email}</span>
                <span className={r.status === "limit" ? "text-[#B42318]" : "text-[#475467]"}>{STATUS_TEXT[r.status] || r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="lg:col-span-2">
        <CardTitle>Invitations sent</CardTitle>
        {!data ? (
          <Loading />
        ) : data.invites.length === 0 ? (
          <Empty title="No invitations yet" />
        ) : (
          <ul className="divide-y divide-[#EAECF0]">
            {data.invites.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                <span className="min-w-0 truncate text-[#101828]">{i.email}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="hidden text-[12px] text-[#667085] sm:inline">{shortDate(i.createdAt)}</span>
                  <Pill tone={i.joined ? "green" : "grey"}>{i.joined ? "Joined" : "Not joined yet"}</Pill>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
