import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiPrinter } from "react-icons/fi";
import "../../styles/dashboard-brand.css";
import TakeHomeReport from "../../components/report/TakeHomeReport";
import { errorMessage, portalStudent, type PortalStudentDetail } from "../../services/roles";
import { Loading } from "../../components/Admin/kit";

/* A student's take-home report, ready to print (or save as PDF from the print dialog). */
export default function PrintReport() {
  const { id = "" } = useParams();
  const [s, setS] = useState<PortalStudentDetail | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    portalStudent(id).then(setS).catch((err) => setError(errorMessage(err)));
  }, [id]);
  return (
    <div className="at-app min-h-screen bg-[#F2F5F9] print:bg-white">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#E4E9F0] bg-white px-4 py-3 print:hidden">
        <Link to={`/school-portal/students/${id}`} className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#004085]">
          <FiArrowLeft aria-hidden="true" /> Back
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={!s}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#004085] px-4 text-[14px] font-semibold text-white disabled:opacity-60"
        >
          <FiPrinter aria-hidden="true" /> Print or save as PDF
        </button>
      </div>
      <div className="px-0 py-6 sm:px-4 print:p-0">
        {error ? (
          <p className="mx-auto max-w-[820px] rounded-xl bg-[#FEF3F2] p-4 text-[14px] text-[#B42318]">{error}</p>
        ) : !s ? (
          <Loading />
        ) : (
          <div className="mx-auto max-w-[860px] rounded-2xl bg-white shadow-sm print:shadow-none">
            <TakeHomeReport
              student={{ name: s.name, classLevel: s.classLevel, region: s.region }}
              school={s.school}
              report={s.report}
              review={s.review.approved ? { approvedAt: s.review.approvedAt, by: s.review.approvedBy } : null}
            />
          </div>
        )}
      </div>
    </div>
  );
}
