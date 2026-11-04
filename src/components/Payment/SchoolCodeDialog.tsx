import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { CircleCheck, X } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { redeemSchoolCode, type SchoolCodeResult } from "../../services/utils";
import { trackEvent } from "../../services/analytics";
import s from "./SchoolCodeDialog.module.css";

const LENGTH = 6;
// Codes never use 0, O, 1, I or L, so only these can appear.
const ALLOWED = /[ABCDEFGHJKMNPQRSTUVWXYZ2-9]/;

const clean = (value: string) =>
  value
    .toUpperCase()
    .split("")
    .filter((ch) => ALLOWED.test(ch));

interface SchoolCodeDialogProps {
  open: boolean;
  onClose: () => void;
  /** Visitors who are not logged in: the details they typed on the eligibility form. */
  visitor?: { email?: string; firstname?: string; lastname?: string } | null;
  /** Text for the button after the code works. */
  doneLabel?: string;
  onDone: (result: SchoolCodeResult) => void;
}

export default function SchoolCodeDialog({ open, onClose, visitor = null, doneLabel = "Continue", onDone }: SchoolCodeDialogProps) {
  const [chars, setChars] = useState<string[]>(Array(LENGTH).fill(""));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [result, setResult] = useState<SchoolCodeResult | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  // The parent may re-render often (the plan page has a ticking timer), so keep
  // the latest close handler without restarting the dialog.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    setChars(Array(LENGTH).fill(""));
    setError("");
    setNeedsLogin(false);
    setResult(null);
    // Put the cursor in the first box, unless the student already tapped a box.
    const t = setTimeout(() => {
      if (!inputs.current.some((el) => el === document.activeElement)) inputs.current[0]?.focus();
    }, 50);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  const code = chars.join("");
  const complete = code.length === LENGTH;

  const fillFrom = (start: number, letters: string[]) => {
    const next = [...chars];
    let i = start;
    for (const ch of letters) {
      if (i >= LENGTH) break;
      next[i] = ch;
      i += 1;
    }
    setChars(next);
    setError("");
    inputs.current[Math.min(i, LENGTH - 1)]?.focus();
  };

  const onChange = (index: number, value: string) => {
    const letters = clean(value);
    if (letters.length === 0) {
      const next = [...chars];
      next[index] = "";
      setChars(next);
      return;
    }
    // One letter typed, or several pasted or filled in by the phone.
    fillFrom(index, letters.length > 1 ? letters : [letters[letters.length - 1]]);
  };

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !chars[index] && index > 0) {
      e.preventDefault();
      const next = [...chars];
      next[index - 1] = "";
      setChars(next);
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    } else if (e.key === "Enter" && complete) {
      submit();
    }
  };

  const onPaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fillFrom(index, clean(e.clipboardData.getData("text")));
  };

  async function submit() {
    if (!complete || sending) return;
    setSending(true);
    setError("");
    setNeedsLogin(false);
    try {
      const data = await redeemSchoolCode({
        code,
        email: visitor?.email,
        firstname: visitor?.firstname,
        lastname: visitor?.lastname,
      });
      trackEvent("school_code_redeemed");
      setResult(data);
    } catch (err: any) {
      const body = err?.response?.data;
      setError(body?.message || "We could not check the code. Check your connection and try again.");
      setNeedsLogin(body?.code === "LOGIN_REQUIRED");
      if (body?.code === "WRONG_CODE" || body?.code === "BAD_FORMAT") {
        setChars(Array(LENGTH).fill(""));
        setTimeout(() => inputs.current[0]?.focus(), 0);
      }
    } finally {
      setSending(false);
    }
  }

  const until = result
    ? new Date(result.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className={s.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.panel} role="dialog" aria-modal="true" aria-labelledby="school-code-title">
        <button type="button" className={s.close} onClick={onClose} aria-label="Close">
          <X size={20} aria-hidden="true" />
        </button>

        {result ? (
          <div className={s.done} role="status">
            <span className={s.doneIcon}>
              <CircleCheck size={30} aria-hidden="true" />
            </span>
            <h2 id="school-code-title" className={s.title} style={{ paddingRight: 0 }}>
              You're covered by {result.schoolName}
            </h2>
            <p className={s.text}>Every AlignTraits feature is open to you until {until}. No payment needed.</p>
            {result.needsPassword && (
              <p className={s.text}>Next, set a password with a code we email to {result.email}.</p>
            )}
            <button type="button" className={s.primary} onClick={() => onDone(result)}>
              {doneLabel}
            </button>
          </div>
        ) : (
          <>
            <h2 id="school-code-title" className={s.title}>
              Enter your school code
            </h2>
            <p className={s.text}>
              Your school gives you this code. It works for students whose school partners with AlignTraits.
            </p>

            <div className={s.boxes} role="group" aria-label="School code, 6 letters and numbers">
              {chars.map((ch, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  className={`${s.box} ${error && !needsLogin ? s.boxError : ""}`}
                  value={ch}
                  onChange={(e) => onChange(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  onPaste={(e) => onPaste(i, e)}
                  onFocus={(e) => e.target.select()}
                  inputMode="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={LENGTH}
                  aria-label={`Character ${i + 1} of ${LENGTH}`}
                />
              ))}
            </div>
            <p className={s.hint}>Codes use letters and numbers, but never 0, O, 1, I or L.</p>

            {error && (
              <p className={s.error} role="alert">
                {error}
                {needsLogin && (
                  <>
                    {" "}
                    <Link to="/login">Log in</Link>
                  </>
                )}
              </p>
            )}

            <button type="button" className={s.primary} disabled={!complete || sending} onClick={submit}>
              {sending ? <BeatLoader size={8} color="#FFFFFF" /> : "Verify code"}
            </button>
            <p className={s.footnote}>No code? Ask your school, or choose a monthly plan.</p>
          </>
        )}
      </div>
    </div>
  );
}
