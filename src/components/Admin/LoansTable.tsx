import { FiArrowDown } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdOutlineEdit } from "react-icons/md";
import { Loan } from "../../types/course.types";
import fileIcon from "../../assets/IconWrap.svg"
import { getDays } from "../../services/schools";

interface Props {
  loans: Loan[];
  isLoading: boolean;
}

export default function LoanTable({
  loans,
  isLoading,
}: Props) {

  return (
    <>
      {isLoading && (
        <div className="mx-auto">
          <ClipLoader />
        </div>
      )}

      {!isLoading && (
        <div className="w-full min-h-[500px] border border-[#EAECF0] rounded-lg">
          <table className="at-rtable w-full table-auto space-y-4">
            <thead className="border-b-[0.8px] border-[#EAECF0] p-[20px]">
              <tr className="[&>th]:text-[#000000] [&>th]:text-[14px] [&>th]:font-medium [&>th]:pb-2">
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Time <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    School <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Individual Name <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Amount <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Status <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>

                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Action <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
              </tr>
            </thead>

            {loans.length > 0 && (
              <tbody>
                {loans.map((loans, index) => (
                  <tr
                    className="[&>td]:py-5 hover:bg-[#007BFF33] border-b border-gray-300 last:border-b-0"
                    key={index + loans.id}
                  >
                    <td data-label="Time" data-primary="" className="text-[#000000] text-[16px] font-[400] p-[20px] flex gap-10">
                    {getDays(loans.time)}
                    </td>
                    <td data-label="School" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {loans.school}
                    </td>
                    <td data-label="Individual Name" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {loans.name}
                    </td>
                    <td data-label="Amount" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {loans.course}
                    </td>
                    <td data-label="Status" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {getDays(loans.status)}
                    </td>
                    <td data-label="Action" data-actions="" className="p-[20px] flex gap-x-[20px] items-center">
                      <FaRegTrashCan className="text-[#D92D20] h-5 w-5 cursor-pointer" />
                      
                      <MdOutlineEdit className="text-[#757575] h-6 w-6 font-[500] cursor-pointer" />
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {!isLoading && loans.length === 0 && (
            <div className="flex flex-col justify-center items-center gap-y-[10px] w-full h-[400px]">
              <img src={fileIcon} alt="Not found" />
              <p className="text-[#101828] text-[16px] font-semibold">Loans Not Available!</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
