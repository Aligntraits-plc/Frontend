import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, CreditCard, GraduationCap, KeyRound, User, Wallet } from "lucide-react";
import { useAuth } from "../../../contexts/useAuth";
import { getStudentSettings, type StudentSettings } from "../../../services/settings";
import { Loading, Problem } from "../../../components/profile-settings/parts";
import s from "../../../components/profile-settings/Settings.module.css";

/*
  Profile and settings, from the Profile design. One card per area.
  A card is listed only when its page exists, so nothing here leads nowhere.
*/
const TILES = [
  { to: "profile", icon: User, title: "Profile", desc: "Names, class and contact details" },
  { to: "records", icon: GraduationCap, title: "Academic records", desc: "UTME, O’Level and direct entry" },
  { to: "financing", icon: Wallet, title: "Financing", desc: "Budget, scholarships and loans" },
  { to: "security", icon: KeyRound, title: "Password and security", desc: "Change your password" },
  { to: "subscription", icon: CreditCard, title: "Plan and billing", desc: "Your plan, payments and school code" },
];

const initials = (first?: string, last?: string) => `${(first || "").trim()[0] || ""}${(last || "").trim()[0] || ""}`.toUpperCase() || "A";

export default function SettingsHub() {
  const { setPageDesc, user } = useAuth();
  const [data, setData] = useState<StudentSettings | null>(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    getStudentSettings().then(setData).catch(() => setFailed(true));
  };
  useEffect(() => {
    setPageDesc({ title: "Profile and settings", desc: "" });
    load();
  }, [setPageDesc]);

  const image = typeof user?.image === "string" && user.image ? user.image : null;
  const p = data?.profile;
  const meta = data ? [data.summary.classLevel, data.summary.state, data.summary.results].filter(Boolean).join(" · ") : "";

  return (
    <div className={s.wrap}>
    <div className={s.page}>
      <h2 className={s.hubTitle}>Keep your details right.</h2>
      <p className={s.hubLead}>Your matches use your records. Change them here and your matches follow.</p>

      {failed && <Problem retry={load} />}
      {!data && !failed && <Loading />}
      {data && p && (
        <>
          <div className={s.summary}>
            <div className={s.avatar} aria-hidden="true">
              {image ? <img src={image} alt="" /> : initials(p.firstname, p.lastname)}
            </div>
            <div className={s.who}>
              <p className={s.name}>{[p.firstname, p.lastname].filter(Boolean).join(" ")}</p>
              <p className={s.meta}>{meta}</p>
            </div>
            <div className={s.strength}>
              <div className={s.strengthTop}>
                <span id="strength-label">Profile strength</span>
                <span>{data.strength.percent}%</span>
              </div>
              <div className={s.bar} role="progressbar" aria-labelledby="strength-label" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.strength.percent}>
                <div className={s.barFill} style={{ width: `${data.strength.percent}%` }} />
              </div>
              {data.strength.next ? (
                <Link to={data.strength.next.to} className={s.strengthHint}>
                  Add {data.strength.next.label} to reach {data.strength.next.reaches}%
                </Link>
              ) : (
                <span className={s.strengthDone}>Everything is filled in</span>
              )}
            </div>
          </div>

          <nav className={s.tiles} aria-label="Settings">
            {TILES.map(({ to, icon: Icon, title, desc }) => (
              <Link key={to} to={to} className={s.tile}>
                <span className={s.tileIcon} aria-hidden="true">
                  <Icon size={22} strokeWidth={1.9} />
                </span>
                <span className={s.tileText}>
                  <span className={s.tileTitle} style={{ display: "block" }}>
                    {title}
                  </span>
                  <span className={s.tileDesc} style={{ display: "block" }}>
                    {desc}
                  </span>
                </span>
                <ChevronRight size={20} className={s.chev} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
    </div>
  );
}
