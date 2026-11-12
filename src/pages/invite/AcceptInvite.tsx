import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import Logo from "../../assets/logo.svg";
import { acceptInvite, errorMessage, readInvite, type InviteInfo } from "../../services/roles";
import { Btn, ErrorNote, Field, inputClass, Loading } from "../../components/Admin/kit";

const RULES: [string, (p: string) => boolean][] = [
  ["At least 8 characters", (p) => p.length >= 8],
  ["A capital and a small letter", (p) => /[A-Z]/.test(p) && /[a-z]/.test(p)],
  ["A number", (p) => /[0-9]/.test(p)],
  ["A symbol, like ! or #", (p) => /[^A-Za-z0-9]/.test(p)],
];

/* The page an invitation email links to: set your name and password, and you are in. */
export default function AcceptInvite() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [gone, setGone] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ message: string; login: string } | null>(null);

  useEffect(() => {
    readInvite(token)
      .then((i) => {
        setInfo(i);
        setFirstname(i.firstname);
        setLastname(i.lastname);
      })
      .catch((err) => setGone(errorMessage(err, "This invitation link is no longer valid.")));
  }, [token]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (info?.needsPassword) {
      if (!firstname.trim() || !lastname.trim()) return setError("Enter your first name and last name.");
      if (!RULES.every(([, ok]) => ok(password))) return setError("Your password needs everything in the list below it.");
    }
    setError("");
    setBusy(true);
    try {
      const r = await acceptInvite(token, info?.needsPassword ? { firstname: firstname.trim(), lastname: lastname.trim(), password } : {});
      setDone({ message: r.message, login: r.data.login });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const heading =
    info?.role === "AMBASSADOR"
      ? "Become an AlignTraits ambassador"
      : info?.role === "COUNSELLOR"
        ? `Join the school portal${info.schoolName ? ` for ${info.schoolName}` : ""}`
        : `Join the AlignTraits team${info ? ` as ${info.roleLabel.toLowerCase()}` : ""}`;

  return (
    <main className="min-h-screen bg-[#F2F5F9] px-4 py-10">
      <div className="mx-auto w-full max-w-[460px]">
        <img src={Logo} alt="AlignTraits" className="mx-auto mb-8 w-40" />
        <div className="rounded-2xl border border-[#EAECF0] bg-white p-5 sm:p-7 shadow-sm">
          {gone ? (
            <div className="text-center">
              <h1 className="text-[20px] font-bold text-[#101828]">This link has expired</h1>
              <p className="mt-2 text-[15px] leading-[24px] text-[#475467]">{gone}</p>
              <Link to="/" className="mt-5 inline-block text-[15px] font-semibold text-[#004085] underline">
                Go to aligntraits.com
              </Link>
            </div>
          ) : !info ? (
            <Loading />
          ) : done ? (
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF3] text-[#067647]">
                <FiCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <h1 className="mt-4 text-[20px] font-bold text-[#101828]">You're all set</h1>
              <p className="mt-2 text-[15px] leading-[24px] text-[#475467]">{done.message}</p>
              <div className="mt-6">
                <Btn onClick={() => navigate(done.login)}>Sign in</Btn>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              <div>
                <h1 className="text-[20px] sm:text-[22px] font-bold leading-tight text-[#101828]">{heading}</h1>
                <p className="mt-2 text-[14px] text-[#475467]">
                  Invitation for <span className="font-semibold text-[#101828]">{info.email}</span>
                </p>
              </div>
              {info.role === "AMBASSADOR" && (
                <p className="rounded-lg bg-[#F5F8FF] p-3 text-[14px] leading-[22px] text-[#344054]">
                  You keep everything you have as a student. You also get an AlignTraits tag in Community and your own invite link to bring other students in.
                </p>
              )}
              {info.needsPassword ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First name">
                      <input className={inputClass} value={firstname} onChange={(e) => setFirstname(e.target.value)} autoComplete="given-name" />
                    </Field>
                    <Field label="Last name">
                      <input className={inputClass} value={lastname} onChange={(e) => setLastname(e.target.value)} autoComplete="family-name" />
                    </Field>
                  </div>
                  <Field label="Create a password">
                    <div className="relative">
                      <input
                        className={`${inputClass} pr-11`}
                        type={show ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-[#667085]"
                        aria-label={show ? "Hide password" : "Show password"}
                      >
                        {show ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </Field>
                  <ul className="grid gap-1 text-[13px] sm:grid-cols-2">
                    {RULES.map(([label, ok]) => (
                      <li key={label} className={`flex items-center gap-1.5 ${ok(password) ? "text-[#067647]" : "text-[#667085]"}`}>
                        <FiCheck aria-hidden="true" className={ok(password) ? "" : "opacity-30"} />
                        {label}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-[15px] text-[#475467]">You already have an AlignTraits account with this email. Accept to add the ambassador tools to it.</p>
              )}
              <ErrorNote>{error}</ErrorNote>
              <Btn type="submit" busy={busy}>
                {info.needsPassword ? "Create my account" : "Accept invitation"}
              </Btn>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
