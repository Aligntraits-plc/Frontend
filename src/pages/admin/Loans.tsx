import { RiUploadCloud2Line } from "react-icons/ri";
import LoanTable from "../../components/Admin/LoansTable";
import { useState } from "react";


export default function Loans () {

  const [isLoading, setIsLoading] = useState(true)

  setTimeout(() => {
    setIsLoading(false)
  }, 2000)


  return (
    <div className="relative">
      <div className="flex flex-col w-full gap-6 p-4 sm:p-5 xl:p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center pb-[10px] border-b-[1px] border-[#E0E0E0]">
          <p className="text-[#101828] text-[18px] font-semibold">Recent Loans Applications</p>

          <button 
            type="button" 
            // onClick={() => setShowBulkModal(true)}
            className="w-[150px] text-[#1E1E1E] text-[14px] font-medium py-2 h-[40px] bg-[#F6C648] p-2 rounded-md 
                outline-0 focus:outline-none flex justify-center items-center gap-x-[10px]"
            >
            <RiUploadCloud2Line className="w-5 h-5 text-[#1E1E1E]"  />
            <p>Export CSV</p>
          </button>
        </div>

        <LoanTable isLoading={isLoading} loans={[]} />
      </div>
    </div>
  );
}
