import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSchool } from "../../services/schools";
import { School } from "../../services/schools";
import CreateSchoolDropDown from "../../components/Admin/CreateSchoolDropDown";
import { FiEdit, FiSearch } from "react-icons/fi";
import { EditCourseCard } from "../../components/Admin/EditCourseCard";
import Skeleton from "react-loading-skeleton";
import { ClipLoader } from "react-spinners";
import DeleteSchoolModal from "../../components/Admin/DeleteSchoolModal";
import { Course } from "../../types/course.types";
import EditSchoolModal from "../../components/Admin/EditSchoolModal";
import { useAuth } from "../../contexts/useAuth";
import schoolPlaceholder from "../../assets/school-placeholder.svg";

interface SchoolWithCourses extends School {
  courses: Course[];
}

export default function EditSchool() {
  const navigate = useNavigate()
  const id = new URLSearchParams(useLocation().search).get("id");
  const { setCurrentCourseID } = useAuth();
  const [school, setSchool] = useState<SchoolWithCourses>();
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("All Courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteCred, setDeleteCred] = useState({
    itemName: "",
    itemId: "",
    itemType: "",
  })

  async function fetchSchool() {
    setIsLoading(true)
    const response = await getSchool(id as string);
    setSchool(response);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchSchool();
  }, [id]);

  const filteredCourses = school?.courses.filter((course) => {
    const matchesScholarship =
      activeTab === "All Courses" || course.scholarship;
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesScholarship && matchesSearch;
  });

  const deleteCourse = (course:Course)=> {
     setDeleteCred({
       itemName: "",
       itemId: "",
       itemType: "",
     });
    setDeleteCred({itemId: course.id, itemName: course.title, itemType: 'course'})
    setModal(true)
  }

  const deleteSchool = ()=> {
    setDeleteCred({
      itemName: "",
      itemId: '',
      itemType: "",
    });
    setDeleteCred({itemName: school?.name as string, itemId:id as string, itemType: 'school'})
    setModal(true)

  }

  return (
    <>
      {isLoading ? (
        <div className="flex w-full justify-center items-center">
          <ClipLoader />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:gap-10 z-10 p-4 sm:p-5 xl:p-6 min-w-0">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-10 min-w-0">
            <div className="rounded-full w-24 h-24 sm:w-40 sm:h-40 lg:w-60 lg:h-60 shrink-0 bg-[#F2F4F7] overflow-hidden">
              <img
                src={school?.logo || schoolPlaceholder}
                alt=""
                onError={(e) => { if (!e.currentTarget.src.endsWith(schoolPlaceholder)) e.currentTarget.src = schoolPlaceholder; }}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="[&>p]:text-[#787878] [&>p]:text-[16px] space-y-2 sm:my-auto min-w-0">
              <h2 className="text-[#000000] font-bold text-[24px] capitalize">
                {school?.name}
              </h2>
              <p className="capitalize">
                {school?.schoolType.split("_").join(" ").toLowerCase()}
              </p>
              <p>{[school?.region, school?.country].filter(Boolean).join(", ") || school?.location}</p>
              <p>{`${school?.courses.length} courses`}</p>
              <div className="w-full max-w-[240px]">
                <CreateSchoolDropDown
                  label="Edit School"
                  Icon={FiEdit}
                  values={[
                    {
                      onchange: () => setEditModal(true),
                      value: "Edit School",
                    },
                    { onchange: () => deleteSchool(), value: "Delete School" },
                  ]}
                />
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <ul className="flex flex-wrap gap-x-5 text-[#787878] text-[16px] font-medium w-full border-b-[1px] border-[#75757599] pt-2 sm:pt-5">
              <li
                className={`my-auto h-full pb-5 cursor-pointer ${
                  activeTab === "All Courses"
                    ? "text-[#004085] border-b-[1px] border-[#004085]"
                    : ""
                }`}
                onClick={() => setActiveTab("All Courses")}
              >
                All Courses
              </li>
              <li
                className={`my-auto h-full pb-5 cursor-pointer ${
                  activeTab === "Scholarships"
                    ? "text-[#004085] border-b-[1px] border-[#004085]"
                    : ""
                }`}
                onClick={() => setActiveTab("Scholarships")}
              >
                Scholarships
              </li>
              <li className="w-full sm:w-auto sm:ml-auto">
                <CourseSearch
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </li>
            </ul>
            {isLoading ? (
              <Skeleton count={3} height={100} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 py-6 sm:py-10">
                {filteredCourses?.map((course, index) => (
                  <EditCourseCard
                    course={course}
                    key={index}
                    onEdit={(course) => {
                      setCurrentCourseID(course.id as string);
                      navigate(`/admin/schools/${id}/add-course`);
                    }}
                    onDelete={(course) => deleteCourse(course)}
                    schoolLogo={school?.logo as string}
                    schoolName={school?.name as string}
                  />
                ))}
              </div>
            )}
          </div>
          {modal && (
            <DeleteSchoolModal
              itemName={deleteCred.itemName as string}
              setShowModal={setModal}
              itemId={deleteCred.itemId as string}
              itemType={deleteCred.itemType}
            />
          )}

          {
            editModal && (
              <EditSchoolModal 
                defaultName={school?.name as string}
                schoolId={school?.id as string}
                setShowModal={setEditModal}
                schooTypeDefault={school?.schoolType as string}
                defaultImgUrl={school?.logo as string}
                websiteUrl={school?.websiteUrl as string}
                selectedProps={
                  {
                    value: `${school?.country || ""}/${school?.region || ""}`,
                    label: `${school?.country || ""}/${school?.region || ""}`
                  }
                }
                fetchSchool={fetchSchool}
              />
            )
          }
        </div>
      )}
    </>
  );
}

interface CourseSearchProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const CourseSearch: React.FC<CourseSearchProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="relative flex items-center justify-center w-full pb-5">
      <input
        type="text"
        placeholder="Search for a course"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 font-semibold focus:outline-none focus:border-blue-500 text-[14px] font-[500]"
      />
      <FiSearch className="absolute left-3 top-[30%] -translate-y-1/2 text-gray-400 w-5 h-5" />
    </div>
  );
};
