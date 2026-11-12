import { NavLink, useLocation } from "react-router-dom";
import { LuSchool } from "react-icons/lu";
import { FiBell, FiGrid, FiKey, FiLogOut, FiMessageSquare, FiX } from "react-icons/fi";
import { PiTextAlignCenterFill } from "react-icons/pi";
import { TbMoneybag } from "react-icons/tb";
import { TiGroupOutline } from "react-icons/ti";
import { FaDatabase, FaUser, FaUserFriends } from "react-icons/fa";
import { CiNoWaitingSign } from "react-icons/ci";
import { MdOutlineSchool, MdOutlineStars } from "react-icons/md";
import type { IconType } from "react-icons";
import { useAuth } from "../../contexts/useAuth";
import Logo from "../../assets/logo.svg";
import { ADMINS, CONTENT_TEAM, PANEL, ROLE_LABELS } from "../../services/roles";
import { useRequestsSummary } from "./requestsStore";

type Item = { to: string; label: string; icon: IconType; roles: readonly string[]; badge?: number; end?: boolean };

/* The admin menu. Each person only sees the sections their role can use. */
const SideBar = ({ open, setOpen }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const { logout, admin } = useAuth();
  const location = useLocation();
  const role = (admin as any)?.role as string | undefined;
  const isAdmin = !!role && ADMINS.includes(role as any);
  const requests = useRequestsSummary(isAdmin);

  const items: Item[] = [
    { to: "/admin", label: "Overview", icon: FiGrid, roles: ADMINS, end: true },
    { to: "/admin/requests", label: "Requests", icon: FiBell, roles: ADMINS, badge: requests?.total || 0 },
    { to: "/admin/schools", label: "Schools and courses", icon: LuSchool, roles: CONTENT_TEAM },
    { to: "/admin/partner-schools", label: "Partner schools", icon: MdOutlineSchool, roles: ADMINS },
    { to: "/admin/school-codes", label: "School codes", icon: FiKey, roles: ADMINS },
    { to: "/admin/ambassadors", label: "Ambassadors", icon: MdOutlineStars, roles: ADMINS },
    { to: "/admin/community", label: role === "CONTENT_MANAGER" ? "Exam dates and deadlines" : "Community", icon: FiMessageSquare, roles: CONTENT_TEAM },
    { to: "/admin/users", label: "Students", icon: FaUser, roles: ADMINS },
    { to: "/admin/waitlist", label: "Waitlist", icon: CiNoWaitingSign, roles: ADMINS },
    { to: "/admin/bulk-center", label: "Bulk center", icon: PiTextAlignCenterFill, roles: CONTENT_TEAM },
    { to: "/admin/data-management", label: "Data management", icon: FaDatabase, roles: PANEL },
    { to: "/admin/loans", label: "Loans", icon: TbMoneybag, roles: ADMINS },
    { to: "/admin/team", label: "Team", icon: FaUserFriends, roles: ["SUPER_ADMIN"] },
    { to: "/admin/accounts", label: "My account", icon: TiGroupOutline, roles: PANEL },
  ];
  const visible = role ? items.filter((i) => i.roles.includes(role)) : [];

  const handleLogout = async () => {
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

  const name = (admin as any)?.username || [(admin as any)?.firstname, (admin as any)?.lastname].filter(Boolean).join(" ");

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-[#101828]/40 lg:hidden transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed z-30 lg:sticky top-0 left-0 h-screen w-[272px] shrink-0 bg-white border-r border-[#EAECF0] px-4 pt-6 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-label="Admin menu"
      >
        <button type="button" className="absolute right-3 top-3 rounded-md p-1 text-[#344054] lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <FiX className="w-6 h-6" />
        </button>
        <div className="mb-6 px-2 w-[150px]">
          <img src={Logo} alt="AlignTraits" />
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pb-4">
          {visible.map(({ to, label, icon: Icon, badge, end }) => {
            const active = end ? location.pathname === to : location.pathname === to || location.pathname.startsWith(`${to}/`);
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-semibold transition-colors ${
                  active ? "bg-[#004085] text-white" : "text-[#475467] hover:bg-[#F2F4F7]"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {badge ? (
                  <span className="rounded-full bg-[#F6C648] px-2 text-[12px] font-bold text-[#002650]" aria-label={`${badge} new`}>
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-[#EAECF0] py-4">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6C648] text-[13px] font-bold text-[#002650]" aria-hidden="true">
              {(name || "A").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[#101828]">{name || "Your account"}</p>
              <p className="truncate text-[12px] text-[#667085]">{role ? ROLE_LABELS[role] || role : ""}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-semibold text-[#475467] hover:bg-[#FEF3F2] hover:text-[#B42318]"
          >
            <FiLogOut className="w-5 h-5" aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
