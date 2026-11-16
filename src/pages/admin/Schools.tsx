import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// import { BeatLoader } from "react-spinners";
// import { FaAngleDown } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import CreateSchoolModal from "../../components/Admin/CreateSchoolModal";
import { getSchools } from "../../services/schools";
import { useAuth } from "../../contexts/useAuth";
import { School } from "../../services/schools";
import SchoolsTable from "../../components/Admin/SchoolsTable";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { FaTrashAlt } from "react-icons/fa";
import BulkUpdateSchoolModal from "../../components/Admin/BulkUpdateSchools";
// import { MdKeyboardArrowDown } from "react-icons/md";
// import { RiUploadCloud2Line } from "react-icons/ri";
import CustomSelectWithProps from "../../components/dashboard/CustomSelectWithProps";
import BulkUploadModal from "../../components/Admin/BulkUploadModal";
import BulkLogoModal from "../../components/Admin/BulkLogoModal";
import { deleteSchools } from "../../services/schools";

const UPLOAD_LIST = [
  "Bulk Upload New",
  "Bulk Upload Update",
  "Bulk Upload Logo",
];

export default function Schools() {
  const [showModal, setShowModal] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [bulkUploadType, setBulkUploadType] = useState("");

  const [selectedSchoolList, setSelectedSchoolList] = useState<string[]>([]);

  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);

  // const temSelectedScool = schools.filter((elem) => selectedSchoolList.includes(elem.id))

  // --- search + pagination state ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredSchools = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return schools;

    return schools.filter((s) => {
      // default to empty string if missing
      const name = (s.name ?? "").toLowerCase();
      const location = (s.country ?? "").toLowerCase();
      return name.includes(term) || location.includes(term);
    });
  }, [schools, searchTerm]);

  //  Reset to page 1 whenever the filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (bulkUploadType === "Bulk Upload New") {
      setShowBulkModal(true);
    } else if (bulkUploadType === "Bulk Upload Update") {
      setShowUpdateModal(true);
    } else if (bulkUploadType === "Bulk Upload Logo") {
      setShowLogoModal(true);
    }
  }, [bulkUploadType]);

  // Compute pagination
  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const paginatedSchools = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSchools
      .sort((a, b) => {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      })
      .slice(start, start + itemsPerPage);
  }, [filteredSchools, currentPage]);

  useEffect(() => {
    if (token) {
      getSchools(token)
        .then((res) => {
          setSchools(res);
          // setSchools([])
          localStorage.setItem("schools", JSON.stringify(res));
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    }
  }, [token, navigate]);

  const getSchoolNow = async () => {
    setIsLoading(true);
    await getSchools(token!)
      .then((res) => {
        setSchools(res);
        localStorage.setItem("schools", JSON.stringify(res));
        setIsLoading(false);
        setSelectedSchoolList([]);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
        setSelectedSchoolList([]);
      });
  };

  const handleDeleteSchools = async () => {
    setIsDeleteLoading(true);
    try {
      await deleteSchools(selectedSchoolList, token!);
      setIsDeleteLoading(false);
      setSelectedSchoolList([]);
      toast.success("Shools deleted successfully!");
      await getSchoolNow();
    } catch (e) {
      setIsDeleteLoading(false);
      setSelectedSchoolList([]);
      toast.error("An error occurred");
      await getSchoolNow();
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col w-full gap-5 p-4 sm:p-5 xl:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center border-b border-[#EAECF0] py-[14px]">
          <div className="flex gap-x-[20px] items-center">
            <p className="text-[#101828] text-[18px] font-semibold">
              Schools you've created
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-x-[20px] w-full md:w-auto">
            <div className="relative w-full sm:w-[250px] sm:flex-none">
              <input
                type="text"
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 px-10 rounded-md font-semibold border-[1px] border-[#DDDDDD] focus:outline-none focus:border-[#757575] text-[14px] font-[400] text-[#8F8F8F]"
              />
              <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-[#999999] w-5 h-5" />
            </div>

            {selectedSchoolList.length > 0 ? (
              <div className="flex justify-center items-center">
                {isDeleteLoading ? (
                  <ClipLoader />
                ) : (
                  <FaTrashAlt
                    onClick={handleDeleteSchools}
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
              classNameStyle="w-full sm:w-[180px]"
            />

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="w-full sm:w-[150px] text-white text-[14px] font-medium py-2 h-[40px] bg-[#004085] p-2 rounded-md 
                  outline-0 focus:outline-none flex justify-center items-center gap-x-[10px]"
            >
              <p>Create School</p>
              {/* <MdKeyboardArrowDown className="w-5 h-5 text-[white]"  /> */}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E0E0E0] rounded-md py-2">
          <SchoolsTable
            getSchools={getSchoolNow}
            schools={paginatedSchools}
            setShowModal={setShowModal}
            isLoading={isLoading}
            setSelectedSchoolList={setSelectedSchoolList}
            selectedSchoolList={selectedSchoolList}
            // setIsLoading={setIsLoading}
          >
            {/* 4️⃣ Pagination controls */}
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
          </SchoolsTable>
        </div>
        {showModal && (
          <CreateSchoolModal
            setShowModal={setShowModal}
            setSchools={setSchools}
          />
        )}
      </div>
      {showBulkModal && (
        <BulkUploadModal
          setBulkUploadType={setBulkUploadType}
          setShowModal={setShowBulkModal}
          getSchools={getSchoolNow}
        />
      )}

      {showLogoModal && (
        <BulkLogoModal
          apiUrl="/images/bulk-upload-school-images"
          payloadType="knownSchoolIds"
          setBulkUploadType={setBulkUploadType}
          setShowModal={setShowLogoModal}
          getSchools={getSchoolNow}
          // selectedList={selectedSchoolList}
        />
      )}

      {showUpdateModal && (
        <BulkUpdateSchoolModal
          setBulkUploadType={setBulkUploadType}
          setShowModal={setShowUpdateModal}
          getSchools={getSchoolNow}
          schoolList={schools}
        />
      )}
    </div>
  );
}
