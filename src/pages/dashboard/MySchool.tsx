import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { School, ShieldCheck } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { errorCode, errorMessage, getMySchool, leaveMySchool, type MySchool as MySchoolData } from "../../services/roles";
import SchoolPicker, { saveSchoolChoice, schoolChoiceProblem, type SchoolChoice } from "../../components/school/SchoolPicker";

/* Profile and settings > My school: optional. Linking your school opens its private
   channel and classmate chats, and lets its counsellors see your results. */
export default function MySchool() {
  const { setPageDesc } = useAuth();
  const [params] = useSearchParams();
  const [data, setData] = useState<MySchoolData | null>(null);
  const [choice, setChoice] = useState<SchoolChoice>({ mode: "none" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [changing, setChanging] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    setPageDesc({ title: "My school", desc: "Your secondary school on AlignTraits" });
  }, [setPageDesc]);

  const load = () => getMySchool().then(setData).catch((err) => setError(errorMessage(err)));
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const problem = schoolChoiceProblem(choice);
    if (problem) return setError(problem);
    if (choice.mode === "none") return setError("Pick your school, or choose My school is not listed.");
    setError("");
    setBusy(true);
    try {
      const msg = await saveSchoolChoice(choice);
      toast.success(msg);
      setChoice({ mode: "none" });
      setChanging(false);
      try {
        localStorage.removeItem("at_join_school");
      } catch {
        /* ignore */
      }
      await load();
    } catch (err) {
      setError(errorCode(err) === "REMOVED" ? errorMessage(err) : errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    setBusy(true);
    try {
      const r = await leaveMySchool();
      toast.success(r.message);
      setConfirmLeave(false);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const preselect = params.get("join") || (() => {
    try {
      return localStorage.getItem("at_join_school");
    } catch {
      return null;
    }
  })();

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-6 sm:py-8">
      <h1 className="text-[26px] font-bold text-[#002650]" style={{ fontFamily: "var(--font-heading)" }}>
        My school
      </h1>
      <p className="mt-1 text-[15px] leading-[24px] text-[#33669D]">
        Optional. Adding your secondary school lets you join its private channel in Community and chat with classmates. Your school's counsellors can see your survey results and
        recommendations, so they can guide you.
      </p>

      <div className="mt-6 rounded-2xl border border-[#DBE4EE] bg-white p-5">
        {!data ? (
          <p className="text-[14px] text-[#475467]">Loading...</p>
        ) : data.school && !changing ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6ECF3] text-[#004085]">
                <School size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[17px] font-bold text-[#002650]">{data.school.name}</p>
                <p className="text-[14px] text-[#33669D]">{[data.classLevel, data.school.state].filter(Boolean).join(" · ")}</p>
              </div>
            </div>
            <p className="flex gap-2 rounded-xl bg-[#F5F8FF] p-3 text-[14px] leading-[21px] text-[#344054]">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#004085]" aria-hidden="true" />
              {data.school.name} can see your survey results and recommendations.
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setChanging(true)} className="h-11 rounded-lg border border-[#D0D5DD] bg-white px-4 text-[14px] font-semibold text-[#344054]">
                Change school
              </button>
              {confirmLeave ? (
                <>
                  <button type="button" disabled={busy} onClick={leave} className="h-11 rounded-lg bg-[#C23B3B] px-4 text-[14px] font-semibold text-white">
                    Yes, remove my school
                  </button>
                  <button type="button" onClick={() => setConfirmLeave(false)} className="h-11 rounded-lg px-3 text-[14px] font-semibold text-[#344054]">
                    Keep it
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmLeave(true)} className="h-11 rounded-lg px-3 text-[14px] font-semibold text-[#C23B3B]">
                  Remove my school
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <SchoolPicker value={choice} onChange={(c) => { setChoice(c); setError(""); }} preselectId={preselect} />
            {error && (
              <p role="alert" className="text-[14px] text-[#C23B3B]">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy || choice.mode === "none"} onClick={save} className="h-11 rounded-lg bg-[#004085] px-5 text-[14px] font-semibold text-white disabled:opacity-50">
                {choice.mode === "notListed" ? "Invite my school" : "Save my school"}
              </button>
              {changing && (
                <button type="button" onClick={() => { setChanging(false); setChoice({ mode: "none" }); }} className="h-11 rounded-lg px-3 text-[14px] font-semibold text-[#344054]">
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
