import { FiArrowDown } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdOutlineEdit } from "react-icons/md";
import { Course } from "../../types/course.types";
import fileIcon from "../../assets/IconWrap.svg";
import { useAuth } from "../../contexts/useAuth";
import DeleteModal from "./DeleteSchoolModal";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Props {
  courses: Course[];
  isLoading: boolean;
  getSchool: Function;
  selectedCourseList: string[];
  setSelectedCourseList: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function CoursesTable({
  courses,
  isLoading,
  getSchool,
  selectedCourseList,
  setSelectedCourseList,
  children,
}: Props & { children?: React.ReactNode }) {
  const navigate = useNavigate();
  const { schoolId } = useParams<{ schoolId: string }>();
  const { setCurrentCourseID } = useAuth();

  const [modal, setModal] = useState(false);
  const [itemForDelete, setItemForDelete] = useState({
    title: "",
    id: "",
  });

  const handleEdit = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    setCurrentCourseID(id);
    navigate(`/admin/schools/${schoolId}/add-course`);
  };

  const handleTrashClick = (event: React.MouseEvent, schoolParam: any) => {
    event.stopPropagation();
    setItemForDelete(schoolParam);
    setModal(true);
  };

  const handleTestClick = (couresID: string) => {
    navigate(`/admin/schools/${schoolId}/course-details/${couresID}`);
  };

  const handleSelect = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();

    if (selectedCourseList.includes(id)) {
      setSelectedCourseList(() =>
        selectedCourseList.filter((elem) => id !== elem),
      );
    } else {
      let tempList = [...selectedCourseList, id];
      setSelectedCourseList(tempList);
    }
  };

  const formatDate = (date: string) => {
    const dateTemp = new Date(date);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(dateTemp);
  };

  function formatDuration(durationType: string, period: number) {
    const validDurations = ["YEARS", "MONTHS", "WEEKS"];

    if (!validDurations.includes(durationType)) {
      return `${period} ${durationType}`;
    }

    let formatted = durationType;
    if (period === 1) {
      formatted = durationType.slice(0, -1);
    }

    return `${period} ${formatted}`;
  }

  // ✅ FIXED: Proper currency formatting
  const formatCurrency = (
    amount: number | string,
    currency: string = "NGN",
  ) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return `${currency} 0`;

    return `${currency} ${num.toLocaleString("en-US")}`;
  };

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
                    Title <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Program Level <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Duration <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Tuition Fee <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Last Modified <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>

                <th className="w-[16.6%] p-[20px]">
                  <div className="flex items-center">
                    Action <FiArrowDown className="ml-2 mb-1" />
                  </div>
                </th>
              </tr>
            </thead>

            {courses.length > 0 && (
              <tbody>
                {courses.map((course, index) => (
                  <tr
                    className="[&>td]:py-5 hover:bg-[#007BFF33] border-b border-gray-300"
                    key={index + course.id}
                    onClick={() => handleTestClick(course.id)}
                  >
                    <td data-label="Title" data-primary="" className="text-[#000000] text-[16px] font-[400] p-[20px] flex gap-2 items-center">
                      <div
                        onClick={(e) => handleSelect(e, course.id)}
                        className="cursor-pointer border-[#D0D5DD] border-[1px] h-[25px] w-[25px] rounded-md flex justify-center items-center"
                      >
                        {selectedCourseList.includes(course.id) && (
                          <div className="h-[15px] w-[15px] bg-[#004085] rounded-[50%]"></div>
                        )}
                      </div>
                      <p>{course.title}</p>
                    </td>
                    <td data-label="Program Level" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {course.programLevel}
                    </td>
                    <td data-label="Duration" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {formatDuration(course.durationPeriod, course.duration)}
                    </td>
                    <td data-label="Tuition Fee" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {/* ✅ FIXED: Properly formatted currency */}
                      {formatCurrency(course.price, course.currency)}
                    </td>
                    <td data-label="Last Modified" className="text-[#757575] text-[14px] font-[500] p-[20px]">
                      {formatDate(course.updatedAt)}
                    </td>
                    <td data-label="Action" data-actions="" className="p-[20px] flex gap-x-[20px] items-center">
                      <FaRegTrashCan
                        onClick={(e) => handleTrashClick(e, course)}
                        className="text-[#D92D20] h-5 w-5 cursor-pointer"
                      />

                      <MdOutlineEdit
                        onClick={(e) => handleEdit(e, course.id)}
                        className="text-[#757575] h-6 w-6 font-[500] cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {!isLoading && courses.length === 0 && (
            <div className="flex flex-col justify-center items-center gap-y-[10px] w-full h-[250px]">
              <img src={fileIcon} alt="Not found" />
              <p className="text-[#101828] text-[16px] font-semibold">
                No Course Created
              </p>
              <p className="text-center text-[#475467] text-[14px] font-normal">
                You have not created a course yet. Click the “Create
                <br /> course” Button to create one now!
              </p>
            </div>
          )}

          <div className="absolute bottom-5 left-0 right-0 p-[20px]">
            {children}
          </div>
        </div>
      )}

      {modal && (
        <DeleteModal
          itemName={itemForDelete.title as string}
          setShowModal={setModal}
          itemId={itemForDelete.id as string}
          itemType={"course"}
          getSchools={getSchool}
        />
      )}
    </>
  );
}
