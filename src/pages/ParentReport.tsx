import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";
import "../styles/dashboard-brand.css";
import TakeHomeReport from "../components/report/TakeHomeReport";
import { errorMessage, getParentReport, type ParentReport as Report } from "../services/roles";

/* The report a student shares with their parents. No sign-in needed: the link itself
   is the key, and it stops working after 30 days. */
export default function ParentReport() {
  const { token = "" } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Admission report · AlignTraits";
    getParentReport(token)
      .then(setReport)
      .catch((err) => setError(errorMessage(err, "This report link is not valid.")));
  }, [token]);

  return (
    <div className="at-app min-h-screen bg-[#F2F5F9] print:bg-white">
      <div className="mx-auto flex max-w-[860px] items-center justify-end gap-3 px-4 pt-4 print:hidden">
        {report && (
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-4 text-[14px] font-semibold text-[#344054]"
          >
            <FiPrinter aria-hidden="true" /> Print or save
          </button>
        )}
      </div>
      <main className="px-0 py-4 sm:px-4 print:p-0">
        {error ? (
          <div className="mx-auto max-w-[560px] rounded-2xl bg-white p-6 text-center">
            <h1 className="text-[20px] font-bold text-[#002650]">This report isn't available</h1>
            <p className="mt-2 text-[15px] text-[#475467]">{error} Ask your child to send a new link from their AlignTraits dashboard.</p>
            <Link to="/" className="mt-4 inline-block font-semibold text-[#004085] underline">
              What is AlignTraits?
            </Link>
          </div>
        ) : !report ? (
          <p className="text-center text-[15px] text-[#475467]">Loading the report...</p>
        ) : (
          <div className="mx-auto max-w-[860px] rounded-2xl bg-white shadow-sm print:shadow-none">
            <TakeHomeReport
              student={{ name: report.student.name, classLevel: report.school?.classLevel, region: report.student.region }}
              school={report.school}
              report={report}
              review={report.review ? { approvedAt: report.review.approvedAt, by: report.review.by } : null}
              generatedAt={report.generatedAt}
            />
          </div>
        )}
        {report && (
          <div className="mx-auto mt-6 max-w-[860px] rounded-2xl bg-[#004085] p-5 text-white print:hidden sm:p-6">
            <p className="text-[18px] font-bold">Questions about these options?</p>
            <p className="mt-1 text-[15px] text-white/85">AlignTraits helps families choose courses and universities their child can realistically get into and afford.</p>
            <Link to="/" className="mt-4 inline-flex h-11 items-center rounded-lg bg-[#F6C648] px-5 text-[15px] font-bold text-[#002650]">
              Learn how it works
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
