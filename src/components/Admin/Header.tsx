import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiBell, FiCalendar, FiMenu } from "react-icons/fi";
import { useAuth } from "../../contexts/useAuth";
import DatePicker from "./NewDatePicker";
import { ADMINS } from "../../services/roles";
import { useRequestsSummary } from "./requestsStore";

const TITLES: [string, string, string][] = [
  ["/admin/requests", "Requests", "School partnerships, ambassador applications, loan interest and anything waiting for you."],
  ["/admin/partner-schools", "Partner schools", "Schools that work with AlignTraits, their counsellors and their codes."],
  ["/admin/ambassadors", "Ambassadors", "Students who help bring others to AlignTraits."],
  ["/admin/team", "Team", "Invite staff and choose what each person can do."],
  ["/admin/school-codes", "School codes", "Codes that cover a partner school's students."],
  ["/admin/community", "Community", "Events, channels, reports and messages to the team."],
  ["/admin/accounts", "My account", "Your name, contact details and password."],
  ["/admin/users", "Students", "Everyone using AlignTraits."],
  ["/admin/waitlist", "Waitlist", "People who registered interest."],
  ["/admin/bulk-center", "Bulk center", "Upload schools and courses in bulk."],
  ["/admin/data-management", "Data management", "Download school and course data."],
  ["/admin/loans", "Loans", "Loan applications."],
  ["/admin/schools", "Schools and courses", "Keep school and course information accurate and up to date."],
];

const Header = ({ setOpen }: { setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const { admin, endDate, setDatePickerClicked } = useAuth();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const role = (admin as any)?.role as string | undefined;
  const isAdmin = !!role && ADMINS.includes(role as any);
  const requests = useRequestsSummary(isAdmin);
  const onOverview = location.pathname === "/admin" || location.pathname === "/admin/";
  const match = TITLES.find(([p]) => location.pathname.startsWith(p));
  const first = ((admin as any)?.firstname || (admin as any)?.username || "").split(" ")[0];
  const title = location.pathname.endsWith("/add-course") ? "Create new courses" : match ? match[1] : `Hello${first ? `, ${first}` : ""}`;
  const intro = match ? match[2] : "Monitor student responses and track their progress in real time.";

  return (
    <header className="sticky top-0 z-10 w-full border-b border-[#EAECF0] bg-white/95 backdrop-blur px-4 sm:px-5 py-3">
      <div className="flex items-center gap-3">
        <button type="button" className="rounded-lg p-2 text-[#344054] hover:bg-[#F2F4F7] lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <FiMenu className="w-5 h-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[18px] sm:text-[20px] font-semibold text-[#101828]">{title}</h1>
          <p className="hidden sm:block truncate text-[13px] text-[#638AB6] font-medium">{intro}</p>
        </div>
        {onOverview && (
          <button
            type="button"
            onClick={() => {
              setDatePickerClicked(false);
              setShowModal(true);
            }}
            className="hidden sm:flex h-10 items-center gap-2 rounded-lg border border-[#D0D5DD] px-3 text-[14px] font-medium text-[#344054]"
          >
            <FiCalendar className="w-5 h-5" />
            {endDate}
          </button>
        )}
        {isAdmin && (
          <Link
            to="/admin/requests"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#D0D5DD] text-[#344054] hover:bg-[#F2F4F7]"
            aria-label={requests?.total ? `Requests, ${requests.total} new` : "Requests"}
          >
            <FiBell className="w-5 h-5" />
            {requests?.total ? (
              <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-[#F6C648] px-1 text-center text-[11px] font-bold leading-[20px] text-[#002650]">
                {requests.total > 99 ? "99+" : requests.total}
              </span>
            ) : null}
          </Link>
        )}
      </div>
      {showModal && <DatePicker setShowModal={setShowModal} />}
    </header>
  );
};

export default Header;
