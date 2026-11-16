import React, { useState} from "react";
import { FiArrowDown } from "react-icons/fi";
import { School } from "../../services/schools";
import { ClipLoader } from "react-spinners";
import SchoolDetails from "./SchoolDetails";
import fileIcon from "../../assets/IconWrap.svg"
import { GoArrowUpRight } from "react-icons/go";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  schools: School[];
  isLoading: boolean;
  getSchools: Function;
  selectedSchoolList: string[];
  setSelectedSchoolList: React.Dispatch<React.SetStateAction<string[]>>;
}


export default function SchoolsTable({
  schools,
  isLoading, getSchools,
  selectedSchoolList,
  setSelectedSchoolList,
  children, // Accept children
}: Props & { children?: React.ReactNode }) {

  const [viewModal, setViewModal] = useState(false)

  const [itemForView, setItemForView] = useState({
    id: "",
    name: "",
    schoolType: "",
    logo: "",
    region: "",
    country: "",
    websiteUrl: ""
  })

  const handleViewClick = (event: React.MouseEvent, schoolParam: any) => {
    event.stopPropagation();
    setItemForView(schoolParam)
    setViewModal(true)

    console.log("schoolParam: ", schoolParam)
  };

  const renderType = (schoolType:string) => {
    if (schoolType === "PUBLIC_UNIVERSITY") {
      return (
        <p className="text-[#175CD3] text-[12px] font-medium 
        border border-[#B2DDFF] rounded-lg bg-[#EFF8FF] size-max px-[8px] py-[2px]">Public</p>
      )
    } else {
      return (
        <p className="text-[#B54708] text-[12px] font-medium 
        border border-[#FEDF89] rounded-lg bg-[#FFFAEb] size-max px-[5px]">Private</p>
      )
    }
  }

  const handleSelect = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();

    if (selectedSchoolList.includes(id)) {
      setSelectedSchoolList(() => selectedSchoolList.filter((elem) => id !== elem))
    } else {
      let tempList = [...selectedSchoolList, id]
      setSelectedSchoolList(tempList)
    }
  }

  const formatDate = (date: string) => {
    // const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };  
    const dateTemp = new Date(date);

    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(dateTemp);
    return formattedDate;
  }

  function shortenString(str:string, maxLength = 15) {
  if (!str) return "";
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
}
  
  return (
    <>
      {isLoading && (
        <div className="mx-auto w-full flex justify-center items-center h-[500px]">
          <ClipLoader />
        </div>
      )}

      {!isLoading && (
        <div className="at-rtable-wrap w-full h-[400px] border-gray-300 overflow-y-scroll relative">
          <table className="at-rtable w-full table-auto space-y-4">
            <thead className="border-b-[0.8px] border-[#EAECF0] p-[20px] bg-white sticky top-0">
              <tr className="[&>th]:text-[#000000] [&>th]:text-[14px] [&>th]:font-medium [&>th]:pb-2">
                <th className="w-[16%] p-[20px]">
                  <div className="flex items-end">
                    Name <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[13.3%] p-[20px]">
                  <div className="flex items-end">
                    Location <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[13.3%] p-[20px]">
                  <div className="flex items-end">
                    Courses <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16%] p-[20px]">
                  <div className="flex items-end">
                    Last Modified <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[13.3%] p-[20px]">
                  <div className="flex items-end">
                    Type <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[13.3%] p-[20px]">
                  <div className="flex items-end">
                    Action <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
              </tr>
            </thead>

            {schools.length > 0 && (
              <tbody>
                {schools.map((school, index) => (
                  <tr
                    className="[&>td]:py-5 hover:bg-[#007BFF33] border-b border-gray-300 cursor-pointer"
                    key={index + school.id}
                  >
                    <td data-label="Name" data-primary="" className="text-[#000000] text-[16px] font-[400] p-[20px] flex gap-2 items-center">
                      <div onClick={(e) => handleSelect(e, school.id)} className="cursor-pointer border-[#D0D5DD] border-[1px] h-[25px] w-[25px] rounded-md flex justify-center items-center">
                        {
                          selectedSchoolList.includes(school.id) && 
                          <div className="h-[15px] w-[15px] bg-[#004085] rounded-[50%]"></div>
                        }
                      </div>
                      {
                        school.logo ? <img
                        src={school.logo}
                        alt="School Logo"
                        className="w-[40px] h-[40px] rounded-full"
                      /> : <div className="w-[40px] h-[40px] rounded-[50%] bg-[grey]"></div>
                      }
                      <span className="text-[#000000] text-[400] text-[14px] capitalize size-max">
                        {/* {school.name} */ shortenString(school.name)}
                      </span>
                    </td>
                    <td data-label="Location" className="text-[#757575] text-[14px] font-[500] p-[20px]">{school.country}, {school.region}</td>
                    <td data-label="Courses" className="text-[#757575] text-[14px] font-[500] p-[20px]">{school._count?.courses}</td>
                    <td data-label="Last Modified" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {formatDate(school.updatedAt)}
                    </td>
                    <td data-label="Type" className="text-[#757575] text-[14px] font-[500] p-[20px]">{renderType(school.schoolType)}</td>
                    <td data-label="Action" data-actions="" className="p-[20px] flex gap-x-[10px]" onClick={(e) => handleViewClick(e, school)}>
                      <p className="text-[#1E1E1E] text-[14px] font-medium cursor-pointer">View</p>
                      <GoArrowUpRight className="text-[#1E1E1E] h-5 w-5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
            {/* <tfoot>
              {children}
            </tfoot> */}
          </table>
          {!isLoading && schools.length === 0 && (
            <div className="flex flex-col justify-center items-center gap-y-[10px] w-full h-[250px]">
              <img src={fileIcon} alt="Not found" />
              <p className="text-[#101828] text-[16px] font-semibold">No School Found</p>
              <p className="text-center text-[#475467] text-[14px] font-normal">
                You have not created a school yet. Click the “Create<br/> course” Button to create one now!
              </p>
            </div>
          )}
          <div>
            {children}
          </div>
        </div>
      )}

      {
        viewModal && (
          <SchoolDetails 
            defaultName={itemForView?.name as string}
            schoolId={itemForView?.id as string}
            setShowModal={setViewModal}
            schooTypeDefault={itemForView?.schoolType as string}
            defaultImgUrl={itemForView?.logo as string}
            country={itemForView.country}
            region={itemForView.region}
            websiteUrl={itemForView.websiteUrl}
            getSchools={getSchools}
          />
        )
      }
    </>
  );
}
