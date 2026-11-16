import { useState, useEffect, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
// import { FaAngleDown } from "react-icons/fa6";
// import { BeatLoader } from "react-spinners";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { getWaitList } from "../../services/schools";
import WaitlistTable from "../../components/Admin/WaitlistTable";
import { useAuth } from "../../contexts/useAuth";

interface WaitlistUser {
  id: string;
  email: string;
  createdAt: string;
}

export default function Waitlist() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState<WaitlistUser[]>([]);

  // --- Search and Pagination State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch school and courses
  async function fetchUsers() {
    setIsLoading(true);
    try {
      const response = await getWaitList(token || "");
      console.log("response: ", response.data);
      setUserList(response?.data || []);
    } catch (e) {
      console.log("error: ", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter courses based on search term
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return userList;

    return userList.filter((user) => {
      const title = (user.email ?? "").toLowerCase();
      // const description = (course.description ?? "").toLowerCase();
      return title.includes(term);
    });
  }, [userList, searchTerm]);

  // Reset to page 1 whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Compute pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

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
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-x-[20px] w-full md:w-auto">
            <div className="relative w-full sm:w-[250px] sm:flex-none">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 px-10 rounded-md font-semibold border-[1px] border-[#DDDDDD] focus:outline-none focus:border-[#757575] text-[14px] font-[400] text-[#8F8F8F]"
              />
              <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-[#999999] w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E0E0E0] rounded-md py-2">
          <WaitlistTable waitlistUser={paginatedUsers} isLoading={isLoading}>
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
          </WaitlistTable>
        </div>
      </div>
    </div>
  );
}
