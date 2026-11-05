import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Briefcase,
  GraduationCap,
  Home,
  LogOut,
  Map,
  Settings,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import LogoReversed from "../../assets/brand/aligntraits-logo-reversed.svg";
import { useCommunitySummary } from "../community/summaryStore";
import s from "./NewSidebar.module.css";

type Item = { to: string; label: string; icon: LucideIcon; end?: boolean; match?: string; badge?: number };

const SETTINGS = [
  { to: "/dashboard/settings", label: "Account settings", end: true },
  { to: "/dashboard/settings/profile", label: "Profile" },
  { to: "/dashboard/settings/records", label: "Academic records" },
  { to: "/dashboard/settings/security", label: "Security" },
  { to: "/dashboard/settings/subscription", label: "Subscription" },
];

const initials = (first?: string, last?: string) =>
  `${(first || "").trim()[0] || ""}${(last || "").trim()[0] || ""}`.toUpperCase() || "A";

// The dashboard menu. On phones and tablets it opens from the menu button in the top bar.
const NewSidebar = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const summary = useCommunitySummary();
  const closeRef = useRef<HTMLButtonElement>(null);
  const inSettings = location.pathname.startsWith("/dashboard/settings");

  // Close the menu after moving to another page (phones and tablets).
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  // While open on a phone: Escape closes it, and the page behind does not scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, setOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  };

  const items: Item[] = [
    { to: "/dashboard", label: "Dashboard", icon: Home, end: true },
    { to: "/dashboard/career-pathway", label: "Career path", icon: Briefcase },
    { to: "/dashboard/school", label: "School", icon: GraduationCap },
    { to: "/dashboard/community", label: "Community", icon: Users, badge: summary?.unread.total ?? 0 },
    { to: "/dashboard/skill-roadmap", label: "Skill roadmap", icon: Map },
    { to: "/dashboard/progres-tracker", label: "Progress tracker", icon: TrendingUp },
  ];

  const name = [user?.firstname, user?.lastname].filter(Boolean).join(" ") || "Your account";
  const meta = user?.region || user?.email || "";
  const image = typeof user?.image === "string" && user.image ? user.image : null;

  return (
    <>
      <div className={`${s.backdrop} ${open ? s.backdropOpen : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className={`${s.panel} ${open ? s.panelOpen : ""}`} aria-label="Main menu">
        <div className={s.top}>
          <NavLink to="/dashboard" aria-label="AlignTraits dashboard">
            <img src={LogoReversed} alt="AlignTraits" className={s.logo} />
          </NavLink>
          <button ref={closeRef} type="button" className={s.close} onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className={s.nav}>
          {items.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `${s.item} ${isActive ? s.active : ""}`}>
              <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
              <span className={s.label}>{label}</span>
              {badge ? (
                <span className={s.badge} aria-label={`${badge} unread`}>
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
            </NavLink>
          ))}

          <NavLink
            to="/dashboard/settings"
            className={() => `${s.item} ${inSettings ? s.active : ""}`}
            aria-current={inSettings ? "page" : undefined}
          >
            <Settings size={20} strokeWidth={1.9} aria-hidden="true" />
            <span className={s.label}>Profile and settings</span>
          </NavLink>
          {inSettings && (
            <div className={s.subList}>
              {SETTINGS.map((sub) => (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  end={sub.end}
                  className={({ isActive }) => `${s.sub} ${isActive ? s.subActive : ""}`}
                >
                  {sub.label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className={s.footer}>
          <div className={s.person}>
            <span className={s.avatar} aria-hidden="true">
              {image ? <img src={image} alt="" /> : initials(user?.firstname, user?.lastname)}
            </span>
            <div className={s.personText}>
              <div className={s.personName}>{name}</div>
              {meta && <div className={s.personMeta}>{meta}</div>}
            </div>
          </div>
          <button type="button" className={s.logout} onClick={handleLogout}>
            <LogOut size={20} strokeWidth={1.9} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default NewSidebar;
