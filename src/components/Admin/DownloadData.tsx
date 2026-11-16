import { useState } from "react";

import { HiOutlineDownload } from "react-icons/hi";
import DataManagementModal from "./DataManagementModal";

const DownloadData = () => {
  const [modal, setModal] = useState(false)
  const [categoryType, setCategoryType] = useState("School")

  const handleOpenModal = (typeParam: string) => {
    setCategoryType(typeParam)
    setModal(true)
  }

  return (
    <>
      <div className="p-4 sm:p-[20px] grid grid-cols-1 lg:grid-cols-2 gap-[20px] max-w-[940px]">
        <div className="w-full min-h-[340px] border-[1px] border-[#DDDDDD] rounded-md p-[20px]
        flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-y-[2px]">
            <p className="text-[#101828] text-[16px] font-semibold">School Data</p>
            <p className="text-[14px] font-normal text-[#737373]">Download information about schools, including metrics and enrollment data.</p>
          </div>

          <p className="text-[14px] font-normal text-[#737373]">
            Exported data includes school name, location, primary contact, 
            creation date, and various metrics related to enrollment and course offerings.
          </p>

          <ul className="list-disc ml-5">
            <li className="text-[14px] font-normal text-[#737373]">School details and contact information</li>
            <li className="text-[14px] font-normal text-[#737373]">Enrollment statistics and trends</li>
            <li className="text-[14px] font-normal text-[#737373]">Associated courses and programs</li>
            <li className="text-[14px] font-normal text-[#737373]">Account status and historical data</li>
          </ul>

          <button onClick={() => handleOpenModal("School")} className="bg-[#004085] w-full h-[52px] rounded-md flex justify-center gap-x-[10px] items-center">
            <HiOutlineDownload className="text-[#FFFFFF]" />
            <p className="text-[14px] font-semibold text-[#FFFFFF]">Download School Data</p>
          </button>
        </div>

        <div className="w-full min-h-[340px] border-[1px] border-[#DDDDDD] rounded-md p-[20px]
        flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-y-[2px]">
            <p className="text-[#101828] text-[16px] font-semibold">Course Data</p>
            <p className="text-[14px] font-normal text-[#737373]">Download information about courses, enrollments, and performance metrics.
            </p>
          </div>

          <p className="text-[14px] font-normal text-[#737373]">
            Exported data includes course details, enrollment statistics, student performance, and 
            historical trends across all courses.
          </p>

          <ul className="list-disc ml-5">
            <li className="text-[14px] font-normal text-[#737373]">Course details and curriculum information</li>
            <li className="text-[14px] font-normal text-[#737373]">Student enrollment and completion rates</li>
            <li className="text-[14px] font-normal text-[#737373]">Performance metrics and assessments</li>
            <li className="text-[14px] font-normal text-[#737373]">Historical data and trend analysis</li>
          </ul>

          <button onClick={() => handleOpenModal("Course")} className="bg-[#004085] w-full h-[52px] rounded-md flex justify-center gap-x-[10px] items-center">
            <HiOutlineDownload className="text-[#FFFFFF]" />
            <p className="text-[14px] font-semibold text-[#FFFFFF]">Download Course Data</p>
          </button>
        </div>
      </div>

      {
        modal && 
        <DataManagementModal 
          setModal={setModal} 
          categoryType={categoryType}
        />
      }
    </>
  )
}

export default DownloadData