import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { FiCalendar, FiChevronDown, FiClipboard, FiKey, FiLogOut, FiLock, FiMenu, FiMessageSquare, FiSend, FiUsers, FiX } from "react-icons/fi";
import Logo from "../../assets/logo.svg";
import "../../styles/dashboard-brand.css";
import { useAuth } from "../../contexts/useAuth";
import { errorMessage, getStaffDetails, portalOverview, type PortalOverview } from "../../services/roles";
import { PortalContext } from "./PortalContext";
import { Loading } from "../../components/Admin/kit";

const TABS = [
  { to: "/school-portal", label: "Students", end: true, icon: FiUsers, hint: "Your students and their matches" },
  { to: "/school-portal/invite", label: "Invite", icon: FiSend, hint: "Share the link or send emails" },
  { to: "/school-portal/seats", label: "Seats and code", icon: FiKey, hint: "Your school code and seats" },
  { to: "/school-portal/survey", label: "Run the survey", icon: FiClipboard, hint: "Hand your phone to a student" },
  { to: "/school-portal/community", label: "School channel", icon: FiMessageSquare, hint: "Messages to your students" },
  { to: "/school-portal/events", label: "Events", icon: FiCalendar, hint: "Exam dates and deadlines" },
];

/* The school portal for counsellors of a partner school. Everything here is about
   their own students only; the server checks that on every request. */
export default function PortalLayout() {
  const { token, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [overview, setOverview] = useState<PortalOverview | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    portalOverview()
      .then(setOverview)
      .catch((err) => setError(errorMessage(err, "We could not load your school.")));
  }, []);

  useEffect(() => {
    if (!token) return;
    getStaffDetails()
      .then((d) => {
        setRole(d.role);
        if (d.role === "COUNSELLOR") refresh();
      })
      .catch(() => setRole("NONE"));
  }, [token, refresh]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  // Close the phone menu when the page changes, and stop the page behind it from scrolling.
  useEffect(() => setDrawer(false), [location.pathname]);
  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  if (!(isAuthenticated && token)) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (role && role !== "COUNSELLOR") return <Navigate to={role === "NONE" || role === "USER" ? "/dashboard" : "/admin"} replace />;

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      try {
        localStorage.removeItem("admin");
      } catch {
        /* ignore */
      }
      window.location.href = "/admin/login";
    }
  };

  // The printable report has no frame around it.
  if (location.pathname.endsWith("/report")) {
    return (
      <PortalContext.Provider value={{ overview, refresh }}>
        <Outlet />
      </PortalContext.Provider>
    );
  }

  return (
    <PortalContext.Provider value={{ overview, refresh }}>
      <div className="at-app min-h-screen bg-[#F2F5F9]" style={{ fontFamily: "'AT Inter', Inter, system-ui, sans-serif" }}>
        <header className="sticky top-0 z-20 border-b border-[#E4E9F0] bg-white">
          <div className="mx-auto flex max-w-[1320px] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-label="Open menu"
              aria-expanded={drawer}
              className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#002650] hover:bg-[#F2F4F7] md:hidden"
            >
              <FiMenu className="h-6 w-6" aria-hidden="true" />
            </button>
            <img src={Logo} alt="AlignTraits" className="w-[108px] shrink-0 sm:w-[136px]" />
            <span className="hidden h-6 w-px bg-[#E4E9F0] sm:block" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[#002650]">{overview?.school.name || "School portal"}</p>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                aria-expanded={menu}
                className="flex items-center gap-2 rounded-full border border-[#E4E9F0] py-1 pl-1 pr-2 hover:bg-[#F9FAFB]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#004085] text-[13px] font-bold text-white" aria-hidden="true">
                  {(overview?.me.name || "C").slice(0, 1)}
                </span>
                <span className="sr-only">Account menu</span>
                <FiChevronDown className="text-[#475467]" aria-hidden="true" />
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-[240px] rounded-xl border border-[#E4E9F0] bg-white p-2 shadow-lg">
                  <div className="px-3 py-2">
                    <p className="truncate text-[14px] font-semibold text-[#101828]">{overview?.me.name}</p>
                    <p className="truncate text-[12px] text-[#667085]">{overview?.me.email}</p>
                  </div>
                  <NavLink to="/school-portal/account" onClick={() => setMenu(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] text-[#344054] hover:bg-[#F2F4F7]">
                    <FiLock aria-hidden="true" /> Password
                  </NavLink>
                  <button type="button" onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[14px] text-[#B42318] hover:bg-[#FEF3F2]">
                    <FiLogOut aria-hidden="true" /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="border-t border-[#F2F4F7] px-4 py-2 text-[13px] font-semibold text-[#475467] md:hidden">
            {(TABS.find((t) => (t.end ? location.pathname === t.to || location.pathname.startsWith("/school-portal/students") : location.pathname.startsWith(t.to))) || { label: "My account" }).label}
          </p>
          <nav className="mx-auto hidden max-w-[1320px] px-2 sm:px-4 md:block" aria-label="School portal">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) =>
                    `shrink-0 border-b-[3px] px-3 py-2.5 text-[14px] font-semibold transition-colors ${
                      isActive || (t.end && location.pathname.startsWith("/school-portal/students"))
                        ? "border-[#004085] text-[#004085]"
                        : "border-transparent text-[#667085] hover:text-[#004085]"
                    }`
                  }
                >
                  {t.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </header>
        {drawer && (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="School portal menu">
            <button type="button" className="absolute inset-0 bg-[#002650]/50" aria-label="Close menu" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between gap-3 border-b border-[#E4E9F0] px-4 py-3">
                <div className="min-w-0">
                  <img src={Logo} alt="AlignTraits" className="w-[112px]" />
                  <p className="mt-1 truncate text-[13px] font-semibold text-[#002650]">{overview?.school.name || "School portal"}</p>
                </div>
                <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#344054] hover:bg-[#F2F4F7]">
                  <FiX className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-3" aria-label="School portal">
                {TABS.map((t) => (
                  <NavLink
                    key={t.to}
                    to={t.to}
                    end={t.end}
                    onClick={() => setDrawer(false)}
                    className={({ isActive }) =>
                      `mb-1 flex min-h-[56px] items-center gap-3 rounded-xl px-3 py-2 ${
                        isActive || (t.end && location.pathname.startsWith("/school-portal/students")) ? "bg-[#004085] !text-white" : "text-[#344054] hover:bg-[#F2F4F7]"
                      }`
                    }
                  >
                    <t.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold leading-5">{t.label}</span>
                      <span className="block truncate text-[12px] leading-4 opacity-80">{t.hint}</span>
                    </span>
                  </NavLink>
                ))}
              </nav>
              <div className="border-t border-[#E4E9F0] p-3">
                <NavLink to="/school-portal/account" onClick={() => setDrawer(false)} className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-[15px] font-semibold text-[#344054] hover:bg-[#F2F4F7]">
                  <FiLock className="h-5 w-5" aria-hidden="true" /> My account
                </NavLink>
                <button type="button" onClick={onLogout} className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-[15px] font-semibold text-[#B42318] hover:bg-[#FEF3F2]">
                  <FiLogOut className="h-5 w-5" aria-hidden="true" /> Log out
                </button>
              </div>
            </div>
          </div>
        )}
        <main className="mx-auto max-w-[1320px] px-4 py-5 sm:px-6 sm:py-6">
          {error ? <p className="rounded-xl bg-[#FEF3F2] p-4 text-[14px] text-[#B42318]">{error}</p> : !role ? <Loading /> : <Outlet />}
        </main>
      </div>
    </PortalContext.Provider>
  );
}
