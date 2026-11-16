import { FiArrowDown } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import fileIcon from "../../assets/IconWrap.svg"
import UserDetails from "./UserDetails";
import { useState } from "react";
interface User {
  id: string;
  firstname:string;
  lastname: string;
  email: string;
  region: string;
  gender: string
}


interface Props {
  users: User[];
  isLoading: boolean;
  getSchool: Function;
  selectedCourseList: string[];
  setSelectedCourseList: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function UserTable({
  users,
  isLoading,
  // selectedCourseList,
  // setSelectedCourseList,
  children, // Accept children
}: Props & { children?: React.ReactNode }) {

  const [viewModal, setViewModal] = useState(false)
  const [selectedId, setSelectedId] = useState("") 


  
  const handleTestClick = (id: string) => {
    setSelectedId(id)
    setViewModal(true)
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
                    Firstname <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Lastname <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Email <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Gender <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Region <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
              </tr>
            </thead>

            {users.length > 0 && (
              <tbody className="">
                {users.map((user, index) => (
                  <tr
                    className="[&>td]:py-5 hover:bg-[#007BFF33] border-b border-gray-300 cursor-pointer"
                    key={index + user.id}
                    onClick={() => handleTestClick(user.id)}
                  >
                    <td data-label="Firstname" data-primary="" className="text-[#000000] text-[16px] font-[400] p-[20px] flex gap-2 items-center">
                      {/* <div onClick={(e) => handleSelect(e, user.id)} className="cursor-pointer border-[#D0D5DD] border-[1px] h-[25px] w-[25px] rounded-md flex justify-center items-center">
                        {
                          selecteduserList.includes(user.id) && 
                          <div className="h-[15px] w-[15px] bg-[#004085] rounded-[50%]"></div>
                        }
                      </div> */}
                      <p>{user.firstname}</p>
                    </td>
                    <td data-label="Lastname" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {user.lastname}
                    </td>
                    <td data-label="Email" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {user.email}
                    </td>
                    <td data-label="Gender" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {user.gender ? user.gender : "-"} 
                    </td>
                    <td data-label="Region" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {user.region ? user.region : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          
          {!isLoading && users.length === 0 && (
            <div className="flex flex-col justify-center items-center gap-y-[10px] w-full h-[250px]">
              <img src={fileIcon} alt="Not found" />
              <p className="text-[#101828] text-[16px] font-semibold">No User Created</p>
            </div>
          )}
          <div>
            {children}
          </div>
        </div>
      )}

      {
        viewModal && 
        <UserDetails 
          setShowModal={setViewModal}
          userId={selectedId}
        />
      }
    </>
  );
}
