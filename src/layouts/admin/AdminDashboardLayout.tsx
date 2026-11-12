import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import Sidebar from "../../components/Admin/Sidebar";
import Header from "../../components/Admin/Header";
import { getStaffDetails } from "../../services/roles";
import { PANEL } from "../../services/roles";

/* The admin panel frame. It loads the signed-in account fresh on every visit, so a
   role change shows straight away, and sends people who are not admin panel staff
   to their own area (school counsellors to the school portal, students to their dashboard). */
export default function AdminDashboardLayout() {
  const { token, isAuthenticated, admin, setAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!token) return;
    let alive = true;
    // Show what we had last time while the fresh copy loads.
    try {
      const cached = JSON.parse(localStorage.getItem("admin") || "null");
      if (cached?.role && !admin) setAdmin(cached);
    } catch {
      /* ignore a broken cache */
    }
    getStaffDetails()
      .then((d) => {
        if (!alive) return;
        const next = { ...d, username: d.username || [d.firstname, d.lastname].filter(Boolean).join(" "), image: null };
        setAdmin(next as any);
        try {
          localStorage.setItem("admin", JSON.stringify(next));
        } catch {
          /* storage can be unavailable */
        }
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!(isAuthenticated && token)) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (failed && !admin) return <Navigate to="/dashboard" replace />; // a student account, or the login ran out
  const role = (admin as any)?.role as string | undefined;
  if (role === "COUNSELLOR") return <Navigate to="/school-portal" replace />;
  if (role && !PANEL.includes(role as any)) return <Navigate to="/dashboard" replace />;

  return (
    <div className="h-screen flex relative overflow-y-scroll bg-[#F9FAFB]">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="flex-1 min-w-0 relative">
        <Header setOpen={setOpen} />
        <Outlet />
      </div>
    </div>
  );
}
