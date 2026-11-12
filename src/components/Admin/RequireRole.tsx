import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

/* Shows a page only to the roles that may use it. The API checks again on every call. */
export default function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { admin } = useAuth();
  const role = (admin as any)?.role as string | undefined;
  if (!role) return null; // still loading the account
  if (!roles.includes(role)) return <Navigate to={homeFor(role)} replace />;
  return <>{children}</>;
}

export const homeFor = (role?: string) =>
  role === "COUNSELLOR" ? "/school-portal" : role === "CONTENT_MANAGER" || role === "ANALYST" ? "/admin/schools" : role === "USER" ? "/dashboard" : "/admin";
