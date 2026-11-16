import { FiArrowDown } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import fileIcon from "../../assets/IconWrap.svg"

interface WaitlistUser {
  id: string;
  email: string;
  createdAt: string;
}

interface Props {
  waitlistUser: WaitlistUser[];
  isLoading: boolean;
}

export default function WaitlistTable({
  waitlistUser,
  isLoading,
  children, // Accept children
}: Props & { children?: React.ReactNode }) {

  function formatDateToYYYYMMDD(date: Date|null) {
    if (!date) {
      return "1970-01-01";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  return (
    <>
      {isLoading && (
        <div className="mx-auto w-full flex justify-center items-center h-[500px]">
          <ClipLoader />
        </div>
      )}

      {!isLoading && (
        <div className="at-rtable-wrap w-full h-[400px] overflow-y-scroll">
          <table className="at-rtable w-full table-auto space-y-4">
            <thead className="border-b-[0.8px] border-[#EAECF0] p-[20px] bg-white sticky top-0">
              <tr className="[&>th]:text-[#000000] [&>th]:text-[14px] [&>th]:font-medium [&>th]:pb-2">
                <th className="w-[25%] p-[20px]">
                  <div className="flex items-center">
                    Email <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Date Of Reg <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
              </tr>
            </thead>

            {waitlistUser.length > 0 && (
              <tbody className="">
                {waitlistUser.map((user, index) => (
                  <tr
                    className="[&>td]:py-5 hover:bg-[#007BFF33] border-b border-gray-300 cursor-pointer"
                    key={index + user.id}
                  >
                    <td data-label="Email" data-primary="" className="text-[#000000] text-[16px] font-[400] p-[20px] flex gap-2 items-center">
                      <p>{user.email}</p>
                    </td>
                    <td data-label="Date Of Reg" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {formatDateToYYYYMMDD(new Date(user.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          
          {!isLoading && waitlistUser.length === 0 && (
            <div className="flex flex-col justify-center items-center gap-y-[10px] w-full h-[250px]">
              <img src={fileIcon} alt="Not found" />
              <p className="text-[#101828] text-[16px] font-semibold">No Waitlist User Created</p>
            </div>
          )}
          <div>
            {children}
          </div>
        </div>
      )}

    </>
  );
}
