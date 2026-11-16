import { useState } from "react";
import DataCenterHistory from "../../components/Admin/DataCenterHistory";
import DownloadData from "../../components/Admin/DownloadData";

export default function DataManagement () {

  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <div className="relative">
      <div className="flex flex-col w-full gap-6 p-4 sm:p-5 xl:p-6">
        <div className="flex flex-col gap-y-[5px]">
          <p className="text-[#101828] text-[24px] font-semibold">Data Management</p>
          <p className="font-normal text-[16px] text-[#737373]">Download and manage your school and course data for analysis and reporting.</p>
        </div>
      </div>

      <div className="flex border-b border-gray-300 my-[15px] mx-4 sm:mx-[20px] overflow-x-auto">
        {["Download Data", "History",].map((tab, index) => {
          const tabKey = `tab${index + 1}`;
          return (
            <button
              key={tabKey}
              className={`py-2 px-4 text-[16px] font-semibold border-b-2 font-medium transition 
                ${
                  activeTab === tabKey
                    ? "border-[#003064] text-[#003064] text-[16px] font-semibold"
                    : "border-transparent hover:text-blue-500 text-[#999999]"
                }`}
              onClick={() => setActiveTab(tabKey)}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {
        activeTab === "tab1" && <DownloadData />
      }

      {
        activeTab === "tab2" && <DataCenterHistory />
      }
    </div>
  );
}
