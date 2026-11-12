import { useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlinePerson } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import AdminPassword from "../../components/Admin/AdminPassword";
import PersonalDetails from "../../components/Admin/PersonalDetails";
import { useAuth } from "../../contexts/useAuth";

const TABS = [
  { key: "details", label: "Personal details", icon: <MdOutlinePerson /> },
  { key: "password", label: "Password", icon: <RiLockPasswordLine /> },
] as const;

/* My account: every staff role can change their own details and password.
   Managing other staff moved to Team (super admins only), where people are invited by email. */
export default function ProfileManagement() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("details");
  const { admin } = useAuth();
  const isSuper = (admin as any)?.role === "SUPER_ADMIN";

  return (
    <div className="flex flex-col w-full gap-8 p-4 sm:p-5 xl:p-6">
      <div className="flex flex-col gap-1">
        <p className="text-[#101828] text-[22px] sm:text-[24px] font-semibold">My account</p>
        <p className="text-[15px] text-[#667085]">Manage your personal details and password.</p>
      </div>

      {isSuper && (
        <div className="rounded-xl border border-[#D1E0FF] bg-[#F5F8FF] p-4 text-[14px] text-[#344054]">
          To add or remove staff, or change someone's role, go to{" "}
          <Link to="/admin/team" className="font-semibold text-[#004085] underline">
            Team
          </Link>
          .
        </div>
      )}

      <div className="flex border-b border-[#EAECF0] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`shrink-0 py-2 px-4 text-[15px] font-semibold border-b-2 transition flex items-center gap-x-2 ${
              activeTab === tab.key ? "border-[#004085] text-[#004085]" : "border-transparent text-[#98A2B3] hover:text-[#004085]"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "details" && <PersonalDetails />}
      {activeTab === "password" && <AdminPassword />}
    </div>
  );
}
