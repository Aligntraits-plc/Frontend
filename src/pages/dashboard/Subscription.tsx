import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useAuth } from "../../contexts/useAuth";
import PlanOverview from "../../components/dashboard/Subscription/PlanOverview";
import AvailablePlans from "../../components/dashboard/Subscription/AvailablePlans";
import BillingHistory from "../../components/dashboard/Subscription/BillingHistory";
import PaymentMethod from "../../components/dashboard/Subscription/PaymentMethod";

interface NavItem {
  id: string;
  label: string;
}

export default function Subscription() {
  const { setPageDesc } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("plan-overview");

  const navItems: NavItem[] = [
    { id: "plan-overview", label: "Overview" },
    { id: "available-plans", label: "Plans" },
    { id: "billing-history", label: "Billing" },
    { id: "payment-method", label: "Payment" },
  ];

  useEffect(() => {
    setPageDesc({
      desc: "Manage subscription",
      title: "Subscription",
    });
  }, []);

  const handleNav = () => {
    navigate(-1);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "plan-overview":
        return <PlanOverview setActiveTab={setActiveTab} />;
      case "available-plans":
        return <AvailablePlans />;
      case "billing-history":
        return <BillingHistory />;
      case "payment-method":
        return <PaymentMethod />;
      default:
        return <PlanOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="w-full h-full p-5 relative">
      <button onClick={handleNav} className="flex gap-x-[10px] items-center">
        <FaArrowLeftLong className="text-[#004085]" />
        <p className="text-[#004085]">Back to Explore</p>
      </button>

      <div className="mt-5">
        <p className="text-[#212529] text-[18px] font-bold">
          Subscription Management
        </p>
        <p className="text-[12px] text-[#757575] mt-2">
          Manage your plans, billing, and payment methods
          {/* <PlanOverview setActiveTab={setActiveTab} /> */}
        </p>
      </div>

      <div className="w-full mx-auto mt-5">
        <nav className="flex bg-gray-100 rounded-lg p-1 w-[100%]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex-1 px-1 lg:px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${
                  activeTab === item.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-5">{renderTab()}</div>

      <div className="h-[70px] w-[30px]"></div>
    </div>
  );
}
