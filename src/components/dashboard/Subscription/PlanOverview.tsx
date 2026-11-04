import { LuCrown } from "react-icons/lu";
import React from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { CiCalendar } from "react-icons/ci";
import UpgradePlanModal from "./UpgradePlanModal";
import { useState } from "react";
import { useAuth } from "../../../contexts/useAuth";
import { PLAN_DETAILS } from "../../../data/planData";

interface PlanOverviewType {
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const PlanOverview = ({ setActiveTab }: PlanOverviewType) => {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const onClose = () => {
    setShowModal(false);
  };

  const onConfirmUpgrade = () => {
    setShowModal(false);
  };

  function formatDateToYYYYMMDD(date: Date | null) {
    if (!date) {
      return "1970-01-01";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const currentPlanDetail = user?.payment_plan
    ? PLAN_DETAILS[user.payment_plan]
    : undefined;
  const benefits = currentPlanDetail?.benefits ?? [];
  const isActive = !!user?.subscriptionPlanStatus;

  return (
    <>
      <div className="h-auto w-full border border-[#EAECF0] shadow-md rounded-xl p-5">
        <div className="flex flex-col sm:flex-row justify-between gap-y-4">
          <div className="flex gap-x-2 items-center">
            <LuCrown />
            <p className="text-[#212529] font-bold">Current Plan</p>
          </div>

          <div
            className={`flex gap-x-2 w-fit px-5 py-1 justify-center items-center rounded-2xl ${
              isActive ? "bg-[#E0FFF0]" : "bg-[#FEE4E2]"
            }`}
          >
            <FaRegCheckCircle className={isActive ? "text-[#17B26A]" : "text-[#F04438]"} />
            <p className={isActive ? "text-[#17B26A]" : "text-[#F04438]"}>
              {isActive ? "Active" : "Expired"}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-y-6 gap-x-10 mt-5">
          <div>
            <p className="text-[#212529] text-[16px] font-medium">
              {currentPlanDetail
                ? `${currentPlanDetail.title} (${currentPlanDetail.tier})`
                : "No active plan"}
            </p>
            {currentPlanDetail && (
              <p className="text-[#757575] text-[16px] font-medium">
                {user?.payment_plan === "SCHOOL_PARTNER"
                  ? `Covered by ${user?.schoolAccess?.schoolName ?? "your school"}`
                  : `${currentPlanDetail.nairaPrice} / ${currentPlanDetail.dollarPrice}`}
              </p>
            )}

            <div className="flex gap-x-2 items-center mt-5">
              <CiCalendar className="text-[#000000]" />
              <p className="text-red-500 text-[14px] font-medium">
                Expires on{" "}
                {user?.payment_plan_expires_at &&
                  formatDateToYYYYMMDD(new Date(user.payment_plan_expires_at))}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[#212529] text-[16px] font-medium">Plan Benefits</p>

            <div className="flex flex-col gap-y-2 mt-2">
              {benefits.length > 0 ? (
                benefits.map((elem, i) => (
                  <div key={i} className="flex gap-x-2 items-center">
                    <FaRegCheckCircle className="text-[#17B26A]" />
                    <p className="text-[#757575] font-medium text-[12px]">{elem}</p>
                  </div>
                ))
              ) : (
                <p className="text-[#757575] font-medium text-[12px]">No plan selected yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-t-[#75757580] mt-10 pt-5 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setActiveTab("available-plans")}
            className="flex gap-x-2 items-center bg-[#F4F4F4] px-4 py-2 rounded-lg text-[12px] text-black font-semibold"
          >
            <LuCrown className="text-[#000000]" />
            <p>Upgrade Plan</p>
          </button>
        </div>
      </div>

      <UpgradePlanModal
        isOpen={showModal}
        onClose={onClose}
        onConfirmUpgrade={onConfirmUpgrade}
      />
    </>
  );
};

export default PlanOverview;
