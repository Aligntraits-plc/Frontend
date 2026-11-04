// src/components/Paywall/PaywallModal.tsx
import { useState, useEffect, useRef } from "react";
import { BeatLoader } from "react-spinners";
import { toast } from "react-toastify";
import { makePayment, getMe, hasActiveAccess } from "../../services/utils";
import { useAuth } from "../../contexts/useAuth";
import PlanCards from "../Payment/PlanCards";
import SchoolCodeDialog from "../Payment/SchoolCodeDialog";

interface PaywallModalProps {
  onUnlocked: () => void;
  onClose?: () => void;
}

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

const PaywallModal = ({ onUnlocked, onClose }: PaywallModalProps) => {
  const { user, setUser } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [awaitingPayment, setAwaitingPayment] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollDeadlineRef = useRef<number>(0);

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const startPolling = () => {
    setAwaitingPayment(true);
    pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS;

    pollTimerRef.current = setInterval(async () => {
      if (Date.now() > pollDeadlineRef.current) {
        stopPolling();
        setAwaitingPayment(false);
        toast.error(
          "We haven't confirmed your payment yet. If you completed checkout, refresh the page in a moment.",
        );
        return;
      }

      try {
        if (!user?.email) return;
        const response = await getMe();
        const freshUser = response?.data;

        if (hasActiveAccess(freshUser)) {
          stopPolling();
          setAwaitingPayment(false);
          onUnlocked();
        }
      } catch (err) {
        console.log("poll error:", err);
      }
    }, POLL_INTERVAL_MS);
  };

  const handleSelectPlan = async (planKey: string) => {
    setLoadingPlanId(planKey);

    const paymentWindow = window.open("", "_blank");

    if (!paymentWindow) {
      toast.error(
        "Your browser blocked the payment tab. Please allow pop-ups for this site and try again.",
      );
      setLoadingPlanId(null);
      return;
    }

    try {
      const data = await makePayment({
        paymentPlan: planKey,
        firstname: user?.firstname,
        lastname: user?.lastname,
        email: user?.email,
        schoolLocation: user?.region || "",
      });

      if (data?.ok) {
        paymentWindow.location.href = data.data.authorization_url;
        startPolling();
      } else {
        paymentWindow.close();
        toast.error("Could not start payment. Please try again.");
      }
    } catch (err: any) {
      paymentWindow.close();
      toast.error(err.message);
    } finally {
      setLoadingPlanId(null);
    }
  };

  // A partner school's code covers the student straight away: refresh their
  // profile and unlock, no payment tab needed.
  const onSchoolDone = async () => {
    setCodeOpen(false);
    try {
      const me = await getMe();
      if (me?.data) {
        setUser(me.data);
        localStorage.setItem("user", JSON.stringify(me.data));
      }
    } catch {
      /* the server already unlocked it; the page refreshes the profile later */
    }
    onUnlocked();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full relative max-h-[92vh] overflow-y-auto">
        {onClose && !awaitingPayment && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>
        )}

        {/* Header – matches second image */}
        <div className="pt-8 pb-2 text-center px-6">
          <h2 className="text-xl md:text-2xl font-bold text-[#1C1C1C]">
            Get instant access to your results
          </h2>
        </div>

        {awaitingPayment ? (
          <div className="flex flex-col items-center py-12 px-6">
            <BeatLoader />
            <p className="mt-4 text-sm text-gray-600 text-center max-w-sm">
              Waiting for payment confirmation — this unlocks automatically once
              your payment goes through. Complete checkout in the tab that just
              opened.
            </p>
            <button
              onClick={() => {
                stopPolling();
                setAwaitingPayment(false);
              }}
              className="mt-4 text-xs text-gray-400 underline hover:text-gray-600"
            >
              Cancel and choose a different plan
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <PlanCards
              onSelectPlan={handleSelectPlan}
              onProvideCode={() => setCodeOpen(true)}
              loadingPlanKey={loadingPlanId}
            />
          </div>
        )}
      </div>

      <SchoolCodeDialog
        open={codeOpen}
        onClose={() => setCodeOpen(false)}
        doneLabel="See my results"
        onDone={onSchoolDone}
      />
    </div>
  );
};

export default PaywallModal;

// // src/components/Paywall/PaywallModal.tsx
// import { useState, useEffect, useRef } from "react";
// import { Crown } from "lucide-react";
// import { FaRegStar, FaRegCheckCircle } from "react-icons/fa";
// import { BeatLoader } from "react-spinners";
// import { toast } from "react-toastify";
// import { makePayment, getUser } from "../../services/utils";
// import { useAuth } from "../../contexts/useAuth";
// import { hasActiveAccess } from "../../services/utils";

// interface Plan {
//   id: string;
//   name: string;
//   icon: React.ReactNode;
//   nairaPrice: string;
//   billing: string;
//   features: string[];
//   buttonText: string;
// }

// const plans: Plan[] = [
//   {
//     id: "basic",
//     name: "Basic",
//     icon: <FaRegCheckCircle className="w-5 h-5 text-green-500" />,
//     nairaPrice: "₦2,000",
//     billing: "One-time",
//     features: ["View this one result", "No saved history"],
//     buttonText: "BASIC_ONETIME",
//   },
//   {
//     id: "silver",
//     name: "Silver",
//     icon: <FaRegStar className="w-5 h-5 text-green-500" />,
//     nairaPrice: "₦5,500 / mo",
//     billing: "Monthly",
//     features: ["Unlimited checks, one country", "Loan info & course access"],
//     buttonText: "LOCAL_MONTHLY",
//   },
//   {
//     id: "gold",
//     name: "Gold",
//     icon: <Crown className="w-5 h-5 text-yellow-500" />,
//     nairaPrice: "₦9,500 / mo",
//     billing: "Monthly",
//     features: ["All countries/schools", "Scholarships & global support"],
//     buttonText: "GLOBAL_MONTHLY",
//   },
// ];

// interface PaywallModalProps {
//   onUnlocked: () => void;
//   onClose?: () => void;
// }

// const POLL_INTERVAL_MS = 4000;
// const POLL_TIMEOUT_MS = 5 * 60 * 1000; // give up after 5 minutes

// const PaywallModal = ({ onUnlocked, onClose }: PaywallModalProps) => {
//   const { user } = useAuth();
//   const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
//   const [awaitingPayment, setAwaitingPayment] = useState(false);

//   const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const pollDeadlineRef = useRef<number>(0);

//   useEffect(() => {
//     return () => stopPolling();
//   }, []);

//   const stopPolling = () => {
//     if (pollTimerRef.current) {
//       clearInterval(pollTimerRef.current);
//       pollTimerRef.current = null;
//     }
//   };

//   const startPolling = () => {
//     setAwaitingPayment(true);
//     pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS;

//     pollTimerRef.current = setInterval(async () => {
//       if (Date.now() > pollDeadlineRef.current) {
//         stopPolling();
//         setAwaitingPayment(false);
//         toast.error(
//           "We haven't confirmed your payment yet. If you completed checkout, refresh the page in a moment.",
//         );
//         return;
//       }

//       try {
//         if (!user?.email) return;
//         const response = await getUser(user.email);
//         const freshUser = response?.data;

//         if (hasActiveAccess(freshUser)) {
//           stopPolling();
//           setAwaitingPayment(false);
//           onUnlocked();
//         }
//       } catch (err) {
//         // transient errors are fine — keep polling until the deadline
//         console.log("poll error:", err);
//       }
//     }, POLL_INTERVAL_MS);
//   };

//   //   const handleSelectPlan = async (plan: Plan) => {
//   //     setLoadingPlanId(plan.id);
//   //     try {
//   //       const data = await makePayment({
//   //         paymentPlan: plan.buttonText,
//   //         firstname: user?.firstname,
//   //         lastname: user?.lastname,
//   //         email: user?.email,
//   //         schoolLocation: user?.region || "",
//   //       });

//   //       if (data?.ok) {
//   //         window.open(data.data.authorization_url, "_blank");
//   //         startPolling();
//   //       }
//   //     } catch (err: any) {
//   //       toast.error(err.message);
//   //     } finally {
//   //       setLoadingPlanId(null);
//   //     }
//   //   };

//   const handleSelectPlan = async (plan: Plan) => {
//     setLoadingPlanId(plan.id);

//     // Open a blank tab synchronously, while we're still inside the click
//     // handler — this is what keeps the browser from blocking it. We fill
//     // in the real URL once makePayment() resolves.
//     const paymentWindow = window.open("", "_blank");

//     if (!paymentWindow) {
//       // Popup blocked outright (e.g. blocked before any tab could open at all)
//       toast.error(
//         "Your browser blocked the payment tab. Please allow pop-ups for this site and try again.",
//       );
//       setLoadingPlanId(null);
//       return;
//     }

//     try {
//       const data = await makePayment({
//         paymentPlan: plan.buttonText,
//         firstname: user?.firstname,
//         lastname: user?.lastname,
//         email: user?.email,
//         schoolLocation: user?.region || "",
//       });

//       if (data?.ok) {
//         paymentWindow.location.href = data.data.authorization_url;
//         startPolling();
//       } else {
//         paymentWindow.close();
//         toast.error("Could not start payment. Please try again.");
//       }
//     } catch (err: any) {
//       paymentWindow.close();
//       toast.error(err.message);
//     } finally {
//       setLoadingPlanId(null);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl max-w-3xl w-full p-6 relative">
//         {onClose && !awaitingPayment && (
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
//           >
//             ✕
//           </button>
//         )}

//         <h2 className="text-xl font-bold text-center mb-1">
//           Unlock Your Career Recommendation
//         </h2>
//         <p className="text-center text-sm text-gray-500 mb-6">
//           Choose a plan to view your personalized course recommendation.
//         </p>

//         {awaitingPayment ? (
//           <div className="flex flex-col items-center py-10">
//             <BeatLoader />
//             <p className="mt-4 text-sm text-gray-600 text-center max-w-sm">
//               Waiting for payment confirmation — this unlocks automatically once
//               your payment goes through. Complete checkout in the tab that just
//               opened.
//             </p>
//             <button
//               onClick={() => {
//                 stopPolling();
//                 setAwaitingPayment(false);
//               }}
//               className="mt-4 text-xs text-gray-400 underline hover:text-gray-600"
//             >
//               Cancel and choose a different plan
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {plans.map((plan) => (
//               <div
//                 key={plan.id}
//                 className="border border-gray-200 rounded-xl p-4 flex flex-col"
//               >
//                 <div className="flex items-center gap-2 mb-2">
//                   {plan.icon}
//                   <span className="font-semibold text-gray-900">
//                     {plan.name}
//                   </span>
//                 </div>
//                 <div className="text-lg font-bold text-gray-900">
//                   {plan.nairaPrice}
//                 </div>
//                 <div className="text-xs text-gray-500 mb-3">{plan.billing}</div>
//                 <ul className="text-xs text-gray-600 space-y-1 flex-1 mb-4">
//                   {plan.features.map((f, i) => (
//                     <li key={i} className="flex items-start gap-1.5">
//                       <FaRegCheckCircle className="text-[#17B26A] mt-0.5 shrink-0" />
//                       {f}
//                     </li>
//                   ))}
//                 </ul>
//                 <button
//                   disabled={loadingPlanId === plan.id}
//                   onClick={() => handleSelectPlan(plan)}
//                   className="w-full py-2 rounded-lg bg-[#004085] hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-medium transition"
//                 >
//                   {loadingPlanId === plan.id ? (
//                     <BeatLoader color="#fff" size={8} />
//                   ) : (
//                     "Choose Plan"
//                   )}
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PaywallModal;
