import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PlanCards from "../components/Payment/PlanCards";
import SchoolCodeDialog from "../components/Payment/SchoolCodeDialog";
import { useAuth } from "../contexts/useAuth";
import { getMe, makePayment, type SchoolCodeResult } from "../services/utils";
import { trackEvent } from "../services/analytics";

const readJSON = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Where students choose how to get their results: a monthly plan, or the code
// their partner school gave them. Visitors arrive here from the eligibility form.
export default function SelectPayment() {
  const navigate = useNavigate();
  const { token, user, setUser } = useAuth();
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [loadingPlanKey, setLoadingPlanKey] = useState<string | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);

  // Details typed on the eligibility form; logged in students fall back to their profile.
  const form = readJSON("eligibility-data");
  const details = {
    firstname: form?.firstName || user?.firstname || "",
    lastname: form?.lastName || user?.lastname || "",
    email: form?.email || user?.email || "",
    schoolLocation: form?.schoolLocation || user?.region || "Nigeria",
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
  };

  const startPayment = async (planKey: string) => {
    if (!details.email) {
      navigate(-1);
      return;
    }
    setLoadingPlanKey(planKey);
    trackEvent("select_plan", { plan: planKey });
    try {
      const data = await makePayment({ paymentPlan: planKey, ...details });
      if (data?.ok) {
        // Same tab: phones often block payment pages opened in a new tab.
        window.location.href = data.data.authorization_url;
        return;
      }
    } catch {
      // makePayment already shows the reason.
    }
    setLoadingPlanKey(null);
  };

  const onSchoolDone = async (result: SchoolCodeResult) => {
    setCodeOpen(false);
    if (token) {
      try {
        const me = await getMe();
        if (me?.data) {
          setUser(me.data);
          localStorage.setItem("user", JSON.stringify(me.data));
        }
      } catch {
        /* the dashboard loads the profile again anyway */
      }
      // The dashboard finishes the eligibility check that was waiting.
      navigate("/dashboard");
      return;
    }
    navigate(result.needsPassword ? `/setup-password?email=${encodeURIComponent(result.email)}` : "/login");
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-white via-[#e9eff7] to-[#CCE0F5]">
      <Header />

      <main className="mx-auto w-full max-w-[1120px] px-4 pb-16 sm:px-6">
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#004085] px-4 py-3 text-white">
          <p className="text-[15px] font-semibold sm:text-[18px]">Result expires in:</p>
          <p className="text-[15px] font-semibold tabular-nums sm:text-[18px]">{formatTime(timeLeft)}</p>
        </div>

        <h1 className="mt-8 text-center text-[22px] font-bold leading-tight text-[#101828] sm:text-[28px]">
          Get instant access to your results
        </h1>
        <p className="mx-auto mt-2 max-w-[560px] text-center text-[14px] text-[#475467] sm:text-[16px]">
          Choose a monthly plan, or use the code from your school if it partners with AlignTraits.
        </p>

        <div className="mt-8">
          <PlanCards
            onSelectPlan={startPayment}
            onProvideCode={() => setCodeOpen(true)}
            loadingPlanKey={loadingPlanKey}
          />
        </div>
      </main>

      <SchoolCodeDialog
        open={codeOpen}
        onClose={() => setCodeOpen(false)}
        visitor={token ? null : details}
        doneLabel={token ? "See my results" : "Set my password"}
        onDone={onSchoolDone}
      />
    </div>
  );
}
