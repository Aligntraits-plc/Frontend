import { MdKeyboardBackspace } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { IoTrash } from "react-icons/io5";
// import { IoIosLink } from "react-icons/io";
import DeleteModal from "./DeleteSchoolModal";
import { useNavigate } from "react-router-dom";
import EditSchoolModal from "./EditSchoolModal";
import { useState } from "react";

interface ModalProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  schooTypeDefault: string;
  defaultImgUrl: string;
  defaultName: string;
  country: string;
  region: string;
  schoolId: string;
  getSchools: Function;
  websiteUrl: string
}

export default function SchoolDetails({
  setShowModal, schooTypeDefault, 
  defaultImgUrl, defaultName, country, region, schoolId, getSchools, websiteUrl}: ModalProps) {

  const [deletModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)

  const navigate = useNavigate()

  const handleClose = async () => {
    await getSchools()
    setShowModal(false)
  }

  const handleManageClick = () => {
    setShowModal(false)
    navigate(`/admin/schools/${schoolId}/courses`);
  };

  const splitString = (text: any) => {
    if (typeof text === 'string') {
      return text.replace(/_/g, ' ');
    } 
    return text
  }
  

  return (
    <div className="absolute inset-0 bg-white p-10 z-10">
      <div className="relative">
        <div className="flex flex-wrap gap-[10px] items-center">

          <button  onClick={()=> setShowModal(false)} className="w-[120px] shrink-0 flex gap-x-[5px] justify-center items-center py-2 rounded-lg border-[1px] border-[#DDDDDD]">
            <MdKeyboardBackspace /> <p className="font-semibold text-[14px] text-[#1E1E1E]">Go Back</p>
          </button>

          <h2 className="text-[18px] font-semibold capitalize">
            {defaultName}
          </h2>
        </div>

        <div className="bg-[#FAFAFA] w-[100%] min-h-[350px] rounded-md border-[1px] border-[#E0E0E0] mt-[20px] flex flex-col-reverse gap-5 lg:flex-row lg:justify-between p-4 sm:p-5">

          <div className="flex flex-col gap-y-[10px]">
            <p className="text-[20px] text-[#101828] font-semibold">School Details</p>

            <p className="text-[#999999] text-[16px] font-normal">Basic information about the school</p>

            <div className="flex gap-x-[20px]">
              <div className="flex flex-col gap-y-[5px]">
                <div className="h-[122px] w-[130px] rounded-md">
                  <img
                    src={defaultImgUrl}
                    alt=""
                    className="h-[122px] w-[130px] rouded-md"
                  />
                </div>
                {/* <p className="text-[16px] text-[#0062CC] font-normal flex gap-x-[2px] items-center cursor-pointer"> <IoIosLink /> Visit website</p> */}
              </div>

              <div className="flex flex-col gap-y-[5px]">
                <div>
                  <p className="text-[#737373] font-normal text-[12px]">Location</p>
                  <p className="text-[#1E1E1E] text-[16px] font-medium">{country}</p>
                </div>

                <div>
                  <p className="text-[#737373] font-normal text-[12px]">School Type</p>
                  <p className="text-[#1E1E1E] text-[16px] font-medium">{splitString(schooTypeDefault)}</p>
                </div>

                <div>
                  <p className="text-[#737373] font-normal text-[12px]">Region</p>
                  <p className="text-[#1E1E1E] text-[16px] font-medium">{region}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-[#737373] font-normal text-[12px]">
                    Website
                  </p>
                  <p className="text-[#1E1E1E] text-[16px] font-medium truncate">
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-blue-600 transition-colors"
                    >
                      {websiteUrl}
                    </a>
                  </p>
                </div>

                </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-[10px]">
            <button  onClick={()=> setEditModal(true)} className="w-[76px] h-[44px] flex gap-x-[5px] justify-center items-center bg-[white] py-2 rounded-lg border-[1px] border-[#DDDDDD]">
              <FaRegEdit /> <p className="font-medium text-[14px] text-[#1E1E1E]">Edit</p>
            </button>

            <button  onClick={()=> setDeleteModal(true)} className="w-[94px] h-[44px] flex gap-x-[5px] justify-center items-center bg-[#B42318] py-2 rounded-lg border-[1px] border-[#DDDDDD]">
              <IoTrash className="text-[white]" /> <p className="font-medium text-[14px] text-[white]">Delete</p>
            </button>

            <button  onClick={handleManageClick} className="w-[126px] h-[44px] flex gap-x-[5px] justify-center items-center bg-[#004085] py-2 rounded-lg border-[1px] border-[#DDDDDD]">
               <p className="font-medium text-[14px] text-[white]">Manage Course</p>
            </button>
          </div>
        </div>
      </div>

      {deletModal && (
        <DeleteModal
          itemName={defaultName as string}
          setShowModal={setDeleteModal}
          itemId={schoolId as string}
          itemType={"school"}
          getSchools={handleClose}
        />
      )}

      {
        editModal && (
          <EditSchoolModal 
            defaultName={defaultName as string}
            schoolId={schoolId as string}
            setShowModal={setEditModal}
            schooTypeDefault={schooTypeDefault as string}
            defaultImgUrl={defaultImgUrl as string}
            websiteUrl={websiteUrl}
            selectedProps={
              {
                value: `${country}/${region}` as string,
                label: `${country}/${region}` as string
              }
            }
            fetchSchool={handleClose}
          />
        )
      }
    </div>
  );
}
