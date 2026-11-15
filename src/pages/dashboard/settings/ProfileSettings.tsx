import { useEffect, useRef, useState } from "react";
import { User, X } from "lucide-react";
import { useAuth } from "../../../contexts/useAuth";
import { fieldErrors, getStudentSettings, saveStudentProfile, type ProfileInput, type StudentSettings } from "../../../services/settings";
import { Field, Loading, Problem, SaveStatus, Section, SettingsPage, Toggle } from "../../../components/profile-settings/parts";
import { useAutosave } from "../../../components/profile-settings/useAutosave";
import MySchool from "../MySchool";
import s from "../../../components/profile-settings/Settings.module.css";

/*
  JAMB's age rule, from its 2026 admission guidelines: at least 16 years old by
  30 September 2026. Update both lines when JAMB publishes the next year's date.
*/
const AGE_RULE = { cutoff: "2026-09-30", text: "JAMB’s rule for 2026 admission: at least 16 by 30 September 2026." };
const under16At = (dob: string) => {
  const d = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const sixteen = new Date(Date.UTC(d.getUTCFullYear() + 16, d.getUTCMonth(), d.getUTCDate()));
  return sixteen.getTime() > new Date(`${AGE_RULE.cutoff}T00:00:00Z`).getTime();
};

/** +2348035550142 is shown as +234 803 555 0142. */
const prettyPhone = (p: string) => p.replace(/^\+234(\d{3})(\d{3})(\d{4})$/, "+234 $1 $2 $3");

export default function ProfileSettings() {
  const { setPageDesc, setUser } = useAuth();
  const [data, setData] = useState<StudentSettings | null>(null);
  const [form, setForm] = useState<ProfileInput | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const formRef = useRef<ProfileInput | null>(null);
  formRef.current = form;

  const load = () => {
    setFailed(false);
    getStudentSettings()
      .then((d) => {
        setData(d);
        const { email: _e, emailVerified: _v, ...rest } = d.profile;
        setForm({ ...rest, phone: prettyPhone(rest.phone), guardianPhone: prettyPhone(rest.guardianPhone) });
      })
      .catch(() => setFailed(true));
  };
  useEffect(() => {
    setPageDesc({ title: "Profile and settings", desc: "" });
    load();
  }, [setPageDesc]);

  const { state, mark } = useAutosave(
    () => formRef.current,
    async (value) => {
      if (!value) return;
      try {
        const fresh = await saveStudentProfile(value);
        setErrors({});
        setData(fresh);
        // Keep the name in the menu and top bar in step with what was just saved.
        setUser((u) => (u ? { ...u, firstname: fresh.profile.firstname, lastname: fresh.profile.lastname } : u));
      } catch (err) {
        setErrors(fieldErrors(err));
        throw err;
      }
    },
  );

  const set = <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    mark();
  };
  const refreshSchool = () => getStudentSettings().then((d) => setData(d)).catch(() => undefined);

  useEffect(() => {
    if (!schoolOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSchoolOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [schoolOpen]);

  const opts = data?.options;
  const input = (key: keyof ProfileInput, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input
      id={`pf-${key}`}
      className={s.input}
      value={(form?.[key] as string) ?? ""}
      onChange={(e) => set(key, e.target.value as never)}
      aria-invalid={errors[key] ? true : undefined}
      aria-describedby={errors[key] ? `pf-${key}-error` : undefined}
      {...props}
    />
  );
  const select = (key: keyof ProfileInput, list: string[], placeholder: string) => (
    <select
      id={`pf-${key}`}
      className={`${s.select} ${form?.[key] ? "" : s.selectEmpty}`}
      value={(form?.[key] as string) ?? ""}
      onChange={(e) => set(key, e.target.value as never)}
      aria-invalid={errors[key] ? true : undefined}
    >
      <option value="">{placeholder}</option>
      {list.map((x) => (
        <option key={x} value={x}>
          {x}
        </option>
      ))}
    </select>
  );
  const young = !!form?.dob && under16At(form.dob);

  return (
    <SettingsPage icon={<User size={28} strokeWidth={2} />} title="Profile" sub="Names, class and contact details. Changes update your matches.">
      {failed && <Problem retry={load} />}
      {!form && !failed && <Loading />}
      {form && data && opts && (
        <div className={s.card}>
          <Section title="Your name" desc="Write it exactly as on your JAMB registration, so applications match.">
            <div className={`${s.grid} ${s.cols3}`}>
              <Field id="pf-firstname" label="First name" error={errors.firstname}>
                {input("firstname", { autoComplete: "given-name" })}
              </Field>
              <Field id="pf-middleName" label="Middle name" optional error={errors.middleName}>
                {input("middleName", { autoComplete: "additional-name" })}
              </Field>
              <Field id="pf-lastname" label="Last name" error={errors.lastname}>
                {input("lastname", { autoComplete: "family-name" })}
              </Field>
            </div>
            <div className={`${s.grid} ${s.cols3}`}>
              <Field
                id="pf-dob"
                label="Date of birth"
                error={errors.dob}
                warn={young}
                hint={young ? `You will be under 16 on 30 September 2026. ${AGE_RULE.text} Check the date for your admission year.` : AGE_RULE.text}
              >
                {input("dob", { type: "date", value: form.dob ?? "", onChange: (e) => set("dob", e.target.value || null), max: new Date().toISOString().slice(0, 10) })}
              </Field>
            </div>
          </Section>

          <Section title="School and class">
            <div className={`${s.grid} ${s.colsSchool} ${s.gridTight}`}>
              <div className={s.field}>
                <span className={s.label} id="pf-school-label">
                  Secondary school
                </span>
                <button type="button" className={`${s.schoolBtn} ${data.school ? "" : s.schoolBtnEmpty}`} aria-labelledby="pf-school-label" onClick={() => setSchoolOpen(true)}>
                  <span>{data.school ? data.school.name : "Add your school"}</span>
                  <small>{data.school ? "Change" : "Add"}</small>
                </button>
              </div>
              <Field id="pf-classLevel" label="Class" error={errors.classLevel}>
                {select("classLevel", opts.classes, "Choose")}
              </Field>
              <Field id="pf-classArm" label="Class arm" error={errors.classArm}>
                {select("classArm", opts.arms, "Choose")}
              </Field>
            </div>
          </Section>

          <Section title="Where you’re from" desc="Some federal and state universities admit more students from their catchment states.">
            <div className={`${s.grid} ${s.cols2}`}>
              <Field id="pf-stateOfOrigin" label="State of origin" error={errors.stateOfOrigin} hint="Federal and state schools use this for catchment places.">
                {select("stateOfOrigin", opts.states, "Choose a state")}
              </Field>
              <Field id="pf-stateLive" label="State you live in" error={errors.stateLive} hint="Where you live now.">
                {select("stateLive", opts.states, "Choose a state")}
              </Field>
            </div>
          </Section>

          <Section title="How we reach you">
            <div className={`${s.grid} ${s.cols2} ${s.gridTight}`}>
              <Field id="pf-phone" label="Phone number" error={errors.phone}>
                {input("phone", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "0803 555 0142" })}
              </Field>
              <Field id="pf-email" label="Email" hint="This is the email you sign in with. To change it, message us on WhatsApp.">
                <input id="pf-email" className={s.input} value={data.profile.email} disabled readOnly />
              </Field>
            </div>
            <div className={s.toggleRow}>
              <span>My WhatsApp uses this phone number</span>
              <Toggle checked={form.whatsappSame} onChange={(v) => set("whatsappSame", v)} label="My WhatsApp uses this phone number" />
            </div>
          </Section>

          <Section title="Parent or guardian" desc="The person you share your parent report with.">
            <div className={`${s.grid} ${s.cols3}`}>
              <Field id="pf-guardianName" label="Full name" error={errors.guardianName}>
                {input("guardianName", { autoComplete: "off" })}
              </Field>
              <Field id="pf-guardianRelation" label="Relationship" error={errors.guardianRelation}>
                {select("guardianRelation", opts.relations, "Choose")}
              </Field>
              <Field id="pf-guardianPhone" label="Phone number" error={errors.guardianPhone}>
                {input("guardianPhone", { type: "tel", inputMode: "tel", autoComplete: "off", placeholder: "0802 441 7720" })}
              </Field>
            </div>
          </Section>
        </div>
      )}

      {schoolOpen && (
        <div className={s.overlay} onClick={() => setSchoolOpen(false)}>
          <div className={s.dialog} role="dialog" aria-modal="true" aria-label="Your secondary school" onClick={(e) => e.stopPropagation()}>
            <button type="button" className={s.dialogClose} onClick={() => setSchoolOpen(false)} aria-label="Close">
              <X size={20} aria-hidden="true" />
            </button>
            <MySchool embedded onChanged={refreshSchool} />
          </div>
        </div>
      )}
      <SaveStatus state={state} />
    </SettingsPage>
  );
}
