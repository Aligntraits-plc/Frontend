import React from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/useAuth";
import { getMe, makePayment } from "../../../services/utils";
import { trackEvent } from "../../../services/analytics";
import PlanCards from "../../Payment/PlanCards";
import SchoolCodeDialog from "../../Payment/SchoolCodeDialog";

const AvailablePlans: React.FC = () => {
  const { user, setUser } = useAuth();
  const [loadingPlanKey, setLoadingPlanKey] = React.useState<string | null>(null);
  const [codeOpen, setCodeOpen] = React.useState(false);

  // reduce() throws on an empty array with no starting value, which crashed this
  // page for anyone with zero transactions, so only reduce when there is data.
  const latest =
    user?.transactions && user.transactions.length > 0
      ? user.transactions.reduce((latestTx, currentTx) => {
          return new Date(currentTx.updatedAt) > new Date(latestTx.updatedAt)
            ? currentTx
            : latestTx;
        })
      : undefined;

  // Only an active plan counts as current, so an expired one can be bought again.
  const currentPlanKey = user?.subscriptionPlanStatus ? user?.payment_plan ?? null : null;

  const handleSelect = async (planKey: string) => {
    setLoadingPlanKey(planKey);
    trackEvent("select_plan", { plan: planKey });

    try {
      const data = await makePayment({
        paymentPlan: planKey,
        firstname: user?.firstname,
        lastname: user?.lastname,
        email: user?.email,
        schoolLocation: latest?.schoolLocation || user?.region || "Nigeria",
      });

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

  const onSchoolDone = async () => {
    setCodeOpen(false);
    try {
      const me = await getMe();
      if (me?.data) {
        setUser(me.data);
        localStorage.setItem("user", JSON.stringify(me.data));
      }
    } catch {
      toast.info("Your school plan is active. Refresh the page to see it.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-0 sm:px-2 py-4 sm:py-6">
      <div className="mb-6">
        <h2 className="text-[20px] sm:text-2xl font-bold text-gray-900 mb-1">Choose your plan</h2>
        <p className="text-[14px] sm:text-base text-gray-600">
          Pick a monthly plan, or use the code from your school if it partners with AlignTraits.
        </p>
      </div>

      <PlanCards
        onSelectPlan={handleSelect}
        onProvideCode={() => setCodeOpen(true)}
        loadingPlanKey={loadingPlanKey}
        currentPlanKey={currentPlanKey}
      />

      <SchoolCodeDialog
        open={codeOpen}
        onClose={() => setCodeOpen(false)}
        doneLabel="Done"
        onDone={onSchoolDone}
      />
    </div>
  );
};

export default AvailablePlans;
