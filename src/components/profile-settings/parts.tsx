import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Check, Loader2 } from "lucide-react";
import type { SaveState } from "./useAutosave";
import s from "./Settings.module.css";

/** Page frame for a settings sub page: back link on phones, icon tile, title and one line. */
export function SettingsPage({ icon, title, sub, children }: { icon: ReactNode; title: string; sub: string; children: ReactNode }) {
  return (
    <div className={s.wrap}>
    <div className={s.page}>
      <Link to="/dashboard/settings" className={s.back}>
        <ArrowLeft size={16} aria-hidden="true" />
        Profile and settings
      </Link>
      <div className={s.head}>
        <div className={s.headIcon} aria-hidden="true">
          {icon}
        </div>
        <div>
          <h2 className={s.headTitle}>{title}</h2>
          <p className={s.headSub}>{sub}</p>
        </div>
      </div>
      {children}
    </div>
    </div>
  );
}

export function Section({ title, desc, aside, children }: { title: ReactNode; desc?: string; aside?: ReactNode; children?: ReactNode }) {
  return (
    <section className={s.section}>
      <div className={s.sectionHead}>
        <div>
          <h3 className={s.h2}>{title}</h3>
          {desc && <p className={s.desc}>{desc}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Field({ id, label, optional, hint, warn, error, className = "", children }: { id: string; label: string; optional?: boolean; hint?: string; warn?: boolean; error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={`${s.field} ${className}`}>
      <label className={s.label} htmlFor={id}>
        {label}
        {optional && <span className={s.optional}> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p className={s.error} id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && <p className={`${s.hint} ${warn ? s.hintWarn : ""}`}>{hint}</p>
      )}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={s.toggle} onClick={() => onChange(!checked)} />;
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className={s.seg} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Small pill at the bottom of the screen: tells the student their change was kept. */
export function SaveStatus({ state, errorText = "Not saved. Check the highlighted answers." }: { state: SaveState; errorText?: string }) {
  if (state === "idle") return null;
  return (
    <div className={`${s.status} ${state === "error" ? s.statusError : ""}`} role="status" aria-live="polite">
      {state === "saving" && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      {state === "saved" && <Check size={16} aria-hidden="true" />}
      {state === "error" && <AlertCircle size={16} aria-hidden="true" />}
      {state === "saving" ? "Saving" : state === "saved" ? "Saved" : errorText}
    </div>
  );
}

export function Loading() {
  return (
    <div className={s.loading} role="status">
      <Loader2 size={28} className="animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function Problem({ retry }: { retry: () => void }) {
  return (
    <div className={s.problem} role="alert">
      We could not load your details. Check your connection and try again.
      <br />
      <button type="button" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
