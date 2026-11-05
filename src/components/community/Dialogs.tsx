import { useEffect, useRef, useState, type ReactNode } from "react";
import { Flag, ShieldCheck, X } from "lucide-react";
import ui from "./ui.module.css";
import d from "./Dialogs.module.css";

export function Dialog({
  title,
  onClose,
  children,
  labelledBy = "community-dialog-title",
}: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("[data-autofocus], button, input, textarea")?.focus(), 30);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, []);

  return (
    <div className={ui.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} className={ui.dialog} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <button type="button" className={ui.dialogClose} onClick={onClose} aria-label="Close">
          <X size={20} aria-hidden="true" />
        </button>
        <h2 id={labelledBy} className={ui.dialogTitle}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export const RULES = [
  { title: "Be kind", text: "No insults, bullying or hate. Everyone here is working towards admission." },
  { title: "Keep personal details private", text: "Don't share phone numbers, emails, home addresses or exam numbers." },
  { title: "Share official sources", text: "Link the official site (like jamb.gov.ng) when you share a date or a rule." },
  { title: "Never pay to “speed up” anything", text: "Results, slips and scholarships are never sold here. Report anyone who asks for money." },
  { title: "Need private help?", text: "Message the AlignTraits team. Don't move into private chats with people you meet here." },
];

/** Shown the first time a student joins a channel. `channelName` empty = read-only view. */
export function RulesDialog({
  channelName,
  onAgree,
  onClose,
}: {
  channelName?: string;
  onAgree?: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog title={channelName ? "Before you join" : "Community rules"} onClose={onClose}>
      <p className={ui.dialogText}>
        AlignTraits Community is for students preparing for admission. Moderators read the channels to keep them safe.
      </p>
      <ol className={d.rules}>
        {RULES.map((r, i) => (
          <li key={r.title}>
            <span className={d.ruleNum} aria-hidden="true">
              {i + 1}
            </span>
            <span>
              <strong>{r.title}.</strong> {r.text}
            </span>
          </li>
        ))}
      </ol>
      {onAgree ? (
        <div className={ui.dialogActions}>
          <button type="button" className={ui.secondary} onClick={onClose}>
            Not now
          </button>
          <button
            type="button"
            className={ui.primary}
            data-autofocus
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onAgree();
              } finally {
                setBusy(false);
              }
            }}
          >
            <ShieldCheck size={18} aria-hidden="true" />
            {channelName ? `I agree, join #${channelName}` : "I agree"}
          </button>
        </div>
      ) : (
        <div className={ui.dialogActions}>
          <button type="button" className={ui.navy} onClick={onClose} data-autofocus>
            Got it
          </button>
        </div>
      )}
    </Dialog>
  );
}

const REASONS = ["Spam or a scam", "Unkind or bullying", "Shares personal details", "Something else"];

export function ReportDialog({ onSubmit, onClose }: { onSubmit: (reason: string) => Promise<void>; onClose: () => void }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog title="Report this message" onClose={onClose}>
      <p className={ui.dialogText}>A moderator will look at it. The person won't know who reported it.</p>
      <fieldset className={d.reasons}>
        <legend className={ui.srOnly}>Why are you reporting it?</legend>
        {REASONS.map((r) => (
          <label key={r} className={`${d.reason} ${reason === r ? d.reasonOn : ""}`}>
            <input type="radio" name="report-reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
            {r}
          </label>
        ))}
      </fieldset>
      <label className={d.noteLabel}>
        Anything else? (optional)
        <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 250))} rows={2} className={d.note} />
      </label>
      <div className={ui.dialogActions}>
        <button type="button" className={ui.secondary} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={ui.primary}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onSubmit(note.trim() ? `${reason}: ${note.trim()}` : reason);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Flag size={18} aria-hidden="true" />
          Send report
        </button>
      </div>
    </Dialog>
  );
}
