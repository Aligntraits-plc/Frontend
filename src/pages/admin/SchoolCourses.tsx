import { useState, useEffect, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
// import { FaAngleDown } from "react-icons/fa6";
import { ClipLoader } from "react-spinners";
import { FaTrashAlt } from "react-icons/fa";
// import { BeatLoader } from "react-spinners";
import { FiPlus } from "react-icons/fi";
import { IoIosArrowBack } from "react-icons/io";
import { useParams, useNavigate } from "react-router-dom";
import { getSchool } from "../../services/schools";
import { School } from "../../services/schools";
import { Course } from "../../types/course.types";
import CoursesTable from "../../components/Admin/CourseTable";
import CustomSelectWithProps from "../../components/dashboard/CustomSelectWithProps";
import { useAuth } from "../../contexts/useAuth";
import BulkCourseModal from "../../components/Admin/BulkCourseModal";
import { deleteCourses } from "../../services/schools";
import BulkUpdateCourseModal from "../../components/Admin/BulkUpdateCourses";
import AdmissionLogicBulkUpdate from "../../components/Admin/AdmissionLogicBulkUpdate";
import { toast } from "react-toastify";
import BulkLogoModal from "../../components/Admin/BulkLogoModal";

const UPLOAD_LIST = [
  "Bulk Upload New",
  "Bulk Upload Update",
  "Update Admission Logic",
  "Bulk Upload Logo",
];
interface SchoolWithCourses extends School {
  courses: Course[];
}

export default function SchoolCourses() {
  const navigate = useNavigate();
  const { setCurrentCourseID, token } = useAuth();

  const [showBulkModal, setShowBulkModal] = useState(false);
  const { schoolId } = useParams<{ schoolId: string }>();
  const [school, setSchool] = useState<SchoolWithCourses>();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseList, setSelectedCourseList] = useState<string[]>([]);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showUpdateModalAdmissionLogic, setShowUpdateModalAdmissionLogic] =
    useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  // const temSelectedCourses = courses.filter((elem) => selectedCourseList.includes(elem.id));

  const [bulkUploadType, setBulkUploadType] = useState("");

  // --- Search and Pagination State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch school and courses
  async function fetchSchool() {
    setIsLoading(true);
    try {
      const response = await getSchool(schoolId as string);
      setSchool(response);
      setCourses(response.courses);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSchool();
  }, [schoolId]);

  useEffect(() => {
    if (bulkUploadType === "Bulk Upload New") {
      setShowBulkModal(true);
    } else if (bulkUploadType === "Bulk Upload Update") {
      setShowUpdateModal(true);
    } else if (bulkUploadType === "Update Admission Logic") {
      setShowUpdateModalAdmissionLogic(true);
    } else if (bulkUploadType === "Bulk Upload Logo") {
      setShowLogoModal(true);
    }
  }, [bulkUploadType]);

  // Filter courses based on search term
  const filteredCourses = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return courses;

    return courses.filter((course) => {
      const title = (course.title ?? "").toLowerCase();
      // const description = (course.description ?? "").toLowerCase();
      return title.includes(term);
    });
  }, [courses, searchTerm]);

  // Reset to page 1 whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Compute pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCourses
      .sort((a, b) => {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      })
      .slice(start, start + itemsPerPage);
  }, [filteredCourses, currentPage]);

  const handleAddCourse = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevents event from bubbling to parent
    navigate(`/admin/schools/${schoolId}/add-course`);
    setCurrentCourseID(null);
  };

  const handleDeleteCourses = async () => {
    setIsDeleteLoading(true);
    try {
      await deleteCourses(selectedCourseList, token!);
      setIsDeleteLoading(false);
      setSelectedCourseList([]);
      toast.success("Courses deleted successfully!");
      await fetchSchool();
    } catch (e) {
      setIsDeleteLoading(false);
      setSelectedCourseList([]);
      toast.error("An error occurred");
      await fetchSchool();
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col w-full gap-5 p-4 sm:p-5 xl:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center border-b border-[#EAECF0] py-[14px]">
          <div className="flex gap-x-[10px] items-center">
            <div>
              <div
                onClick={() => navigate(-1)}
                className="flex gap-x-[5px] items-center"
              >
                <IoIosArrowBack className="h-4 w-4" />
                <p className="text-[#004085] text-[14px] font-medium cursor-pointer">
                  Go back
                </p>
              </div>
              <p className="text-[#1E1E1E] text-[20px] font-semibold">
                {school?.name || "Searching..."}
              </p>
              <p className="text-[#999999] text-[14px] font-medium">
                Manage all courses for {school?.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-x-[20px] w-full md:w-auto">
            <div className="relative w-full sm:w-[250px] sm:flex-none">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 px-10 rounded-md font-semibold border-[1px] border-[#DDDDDD] focus:outline-none focus:border-[#757575] text-[14px] font-[400] text-[#8F8F8F]"
              />
              <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-[#999999] w-5 h-5" />
            </div>

            {selectedCourseList.length > 0 ? (
              <div className="flex justify-center items-center">
                {isDeleteLoading ? (
                  <ClipLoader />
                ) : (
                  <FaTrashAlt
                    onClick={handleDeleteCourses}
                    className="cursor-pointer text-[#D92D20]"
                  />
                )}
              </div>
            ) : (
              <></>
            )}

            <CustomSelectWithProps
              placeholder="Bulk Uploads"
              options={UPLOAD_LIST.map((typeValue) => ({
                value: typeValue,
                label: typeValue,
              }))}
              onChange={(val) => setBulkUploadType(val)}
              selectedProps={{
                value: bulkUploadType,
                label: bulkUploadType,
              }}
              handleError={() => {}}
              classNameStyle="w-full sm:w-[200px]"
            />

            <button
              onClick={handleAddCourse}
              type="button"
              className="w-full sm:w-[150px] text-white text-[14px] font-medium py-2 h-[40px] bg-[#004085] p-2 rounded-md 
                  outline-0 focus:outline-none flex justify-center items-center gap-x-[10px]"
            >
              <p>Add Course</p>
              <FiPlus className="w-5 h-5 text-[white]" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E0E0E0] rounded-md py-2">
          <CoursesTable
            courses={paginatedCourses}
            isLoading={isLoading}
            getSchool={fetchSchool}
            setSelectedCourseList={setSelectedCourseList}
            selectedCourseList={selectedCourseList}
          >
            {/* Pagination Controls */}
            <div className="flex justify-between items-center px-5 mt-5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-1 border-[1px] border-[#D0D5DD] rounded-lg disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-1 border-[1px] border-[#D0D5DD] rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </CoursesTable>
        </div>
      </div>

      {showBulkModal && (
        <BulkCourseModal
          setBulkUploadType={setBulkUploadType}
          setShowModal={setShowBulkModal}
          getSchools={fetchSchool}
        />
      )}
      {showUpdateModal && (
        <BulkUpdateCourseModal
          setShowModal={setShowUpdateModal}
          setBulkUploadType={setBulkUploadType}
          getSchools={fetchSchool}
          courseList={courses}
        />
      )}

      {showUpdateModalAdmissionLogic && (
        <AdmissionLogicBulkUpdate
          setBulkUploadType={setBulkUploadType}
          setShowModal={setShowUpdateModalAdmissionLogic}
          getSchools={fetchSchool}
          courseList={courses}
        />
      )}

      {showLogoModal && (
        <BulkLogoModal
          apiUrl="/images/bulk-upload-course-images"
          payloadType="knownCourseIds"
          setBulkUploadType={setBulkUploadType}
          setShowModal={setShowLogoModal}
          getSchools={fetchSchool}
          // selectedList={selectedCourseList}
        />
      )}
    </div>
  );
}
