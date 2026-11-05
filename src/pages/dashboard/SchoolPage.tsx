import { useAuth } from "../../contexts/useAuth";
import { useState, useEffect, useRef, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import Papa from 'papaparse';
// import { FiSearch } from "react-icons/fi";
import { Course } from "../../types/course.types";
import { ClipLoader } from "react-spinners";
import CustomSelectWithProps from "../../components/dashboard/CustomSelectWithProps";
import { IoIosRefresh } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import CourseCard from "../../components/dashboard/CourseCard";
import countriesData from "../../data/countries_states.json";
import fileIcon from "../../assets/IconWrap.svg";
import { getCoursesWithoutToken } from "../../services/schools";
import CourseDetails from "../../components/dashboard/CourseDetails";
// import { getCoursesCategories } from "../services/schools";
// import { toast } from "react-toastify";
import { courseCategoryList } from "../../data/courseCategories";
// import csvFile from "../assets/csvFile.csv"
import { CiSearch } from "react-icons/ci";
import { useSearchParams } from "react-router-dom";

const scholarshipList = [
  "No Scholarship",
  "Partial Scholarship",
  "Full Scholarship",
];

// Define TypeScript types
type Country = {
  name: string;
  states: string[];
};

export default function SchoolPage() {
  const { setPageDesc, setSearchAllTerm, searchAllTerm, user } = useAuth();

  const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // const [searchAllTerm, setSearchAllTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [stateSearchTerm, setStateSearchTerm] = useState<string>("");
  const [stateDropdownOpen, setStateDropdownOpen] = useState<boolean>(false);
  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const [fieldStudy, setFieldStudy] = useState("");
  const [scholarshipOptions, setScholarshipOptions] = useState("");
  const [filterList, setFilterList] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<any[]>([]);

  // State to store selected country and states
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");

  const [courses, setCourses] = useState<Course[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [showDetails, setShowDetails] = useState(false);
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  // const [categories, setCategories] = useState<CategoryType[]>([]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setDropdownOpen(true); // Open the dropdown when typing
  };

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCountrySelect = (countryName: string) => {
    setSelectedCountry(countryName);
    setSearchTerm(countryName); // Set the search term to the selected country
    const countryData = countries.find((c) => c.name === countryName);
    setStates(countryData ? countryData.states : []);
    setSelectedState(""); // Reset state selection
    setStateSearchTerm("");
    setDropdownOpen(false); // Close the dropdown
  };

  const filteredStates = states.filter((state) =>
    state.toLowerCase().includes(stateSearchTerm.toLowerCase()),
  );

  const handleStateSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setStateSearchTerm(event.target.value);
    setStateDropdownOpen(true); // Open the dropdown when typing
  };

  const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    setStateSearchTerm(stateName); // Set the search term to the selected state
    setStateDropdownOpen(false); // Close the dropdown
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    let tempList = user?.careerResults?.recommendedCourses
      ? user?.careerResults?.recommendedCourses.map((elem: any) => elem.title)
      : [];

    // Insert "Eligible Courses" in the filter options
    let tempListTwo = [...courseCategoryList];
    tempList.length > 0 &&
      tempListTwo.splice(1, 0, { id: -1, name: "Eligible Courses" });

    setFilterOptions(tempListTwo);

    setFilterList(tempList || []);

    setActiveTab(
      searchParams.get("tab") ? parseInt(searchParams.get("tab")!) : 0,
    );

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(event.target as Node)
      ) {
        setStateDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fieldDropdownRef = useRef<HTMLDivElement>(null);

  // Load countries from JSON on mount
  useEffect(() => {
    setCountries(countriesData);
  }, []);

  const resetFilter = () => {
    setStates([]);
    setSelectedState("");
    setStateSearchTerm("");
    setSelectedCountry("");
    setSearchTerm("");
    setSearchAllTerm("");
    setFieldStudy("");
    setScholarshipOptions("");
    setActiveTab(0);
  };

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await getCoursesWithoutToken();

        setCourses(response);
      } catch (err) {
        // setError(err instanceof Error ? err.message : 'An error occurred');
        console.log("error: ", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();

    // handleGetCoursesCategories();
  }, []);

  const filteredCourses = useMemo(() => {
    const term = fieldStudy.toLowerCase().trim();

    console.log("term: ", term);

    return courses.filter((s) => {
      // default to empty string if missing
      const name = s.title.toLowerCase();
      const schoolName = s.university?.name || "";
      const location = s.university?.location || "";
      const region = s.university?.region || "";
      return (
        (name.includes(term) ||
          schoolName.toLowerCase().includes(term) ||
          location.toLowerCase().includes(term) ||
          region.toLowerCase().includes(term)) &&
        (scholarshipOptions === "" ||
          scholarshipOptions.toLowerCase() === s.scholarship?.toLowerCase()) &&
        // && (fieldStudy === "" || fieldStudy === s.title)
        (activeTab === 0 ||
          activeTab === s.categoryId ||
          (activeTab === -1 && filterList.includes(s.title))) &&
        (selectedCountry === "" ||
          selectedCountry.toLowerCase() ===
            s.university?.country.toLowerCase()) &&
        (selectedState === "" ||
          selectedState.toLowerCase() === s.university?.region.toLowerCase())
      );
    });
  }, [
    courses,
    searchAllTerm,
    scholarshipOptions,
    selectedCountry,
    selectedState,
    fieldStudy,
    activeTab,
  ]);

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

  useEffect(() => {
    setPageDesc({
      desc: "Welcome to School Page",
      title: "School",
    });
  }, []);

  useEffect(() => {
    if (searchTerm.length === 0) {
      setSelectedCountry("");
    } else if (stateSearchTerm.length === 0) {
      setSelectedState("");
    }
  }, [searchTerm, stateSearchTerm]);

  console.log("fieldStudy: ", fieldStudy);

  return (
    <div className="relative w-full bg-[white]">
      {showDetails ? (
        <CourseDetails
          courseItem={courseDetails}
          setShowDetails={setShowDetails}
        />
      ) : (
        <div className="w-full">
          <div className="border-b border-b-[#EAECF0] w-[100%]">
            <div className="w-full max-w-[1000px] flex px-[20px] mt-[20px] overflow-x-auto scrollbar-hide">
              {filterOptions.map((tab) => {
                return (
                  <button
                    key={tab.id}
                    className={`py-2 px-4 text-[12px] whitespace-nowrap font-semibold border-b-2 font-medium transition 
                        ${
                          activeTab === tab.id
                            ? "border-[#003064] text-[#004085] text-[12px] font-semibold"
                            : "border-transparent hover:text-blue-500 text-[#999999]"
                        }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center px-[20px] border-b border-b-[#DDDDDD] pb-[10px]">
            <div className="flex flex-wrap gap-[10px] my-[20px] w-full sm:w-auto">
              <div className="flex-1 relative" ref={fieldDropdownRef}>
                <CiSearch className="absolute top-[25%] left-[10px] text-[#999999]" />
                <input
                  type="text"
                  className="h-[35px] pl-8 border-[0.8px] border-gray-300 p-2 w-full rounded-md focus:outline-none text-[#999999] text-[14px] font-medium"
                  placeholder="Search"
                  value={fieldStudy}
                  // onFocus={() => setFieldDropdownOpen(true)}
                  onChange={(e) => {
                    setFieldStudy(e.target.value);
                    // setFieldDropdownOpen(true);
                  }}
                />
                {/* {fieldDropdownOpen && (
                    <div className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 max-h-[150px] overflow-y-auto z-10">
                      {programList
                        .filter(typeValue =>
                          typeValue.toLowerCase().includes(fieldStudy.toLowerCase())
                        )
                        .map((typeValue, idx) => (
                          <div
                            key={idx}
                            className={`p-2 cursor-pointer hover:bg-gray-100 ${
                              fieldStudy === typeValue ? "bg-gray-200" : ""
                            }`}
                            onClick={() => {
                              setFieldStudy(typeValue);
                              setFieldDropdownOpen(false);
                            }}
                          >
                            {typeValue}
                          </div>
                        ))}
                      {programList.filter(typeValue =>
                        typeValue.toLowerCase().includes(fieldStudy.toLowerCase())
                      ).length === 0 && (
                        <div className="p-2 text-gray-500">No fields found</div>
                      )}
                    </div>
                  )} */}
              </div>

              <div className="w-[150px] relative" ref={dropdownRef}>
                <IoIosArrowDown className="absolute top-[25%] right-[10px] text-[#999999]" />
                <input
                  type="text"
                  className="h-[35px] border-[0.8px] border-gray-300 p-2 w-full rounded-md focus:outline-none text-[#999999] text-[14px] font-medium"
                  placeholder="Country"
                  value={searchTerm}
                  onFocus={() => setDropdownOpen(true)} // Open dropdown on focus
                  onChange={handleSearchChange}
                />
                {dropdownOpen && (
                  <div className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 max-h-[150px] overflow-y-auto z-10">
                    {filteredCountries.map((country) => (
                      <div
                        key={country.name}
                        className={`p-2 cursor-pointer hover:bg-gray-100 ${
                          selectedCountry === country.name ? "bg-gray-200" : ""
                        }`}
                        onClick={() => handleCountrySelect(country.name)}
                      >
                        {country.name}
                      </div>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="p-2 text-gray-500">
                        No countries found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-[150px] relative" ref={stateDropdownRef}>
                <IoIosArrowDown className="absolute top-[25%] right-[10px] text-[#999999]" />
                <input
                  type="text"
                  className="h-[35px] bg-[white] border-[0.8px] border-gray-300 p-2 w-full rounded-md focus:outline-none text-[#999999] text-[14px] font-medium"
                  placeholder="Region"
                  value={stateSearchTerm}
                  onFocus={() => setStateDropdownOpen(true)} // Open dropdown on focus
                  onChange={handleStateSearchChange}
                  disabled={!selectedCountry} // Disable if no country is selected
                />
                {stateDropdownOpen && (
                  <div className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 max-h-[150px] overflow-y-auto z-10">
                    {filteredStates.map((state, index) => (
                      <div
                        key={index}
                        className={`p-2 cursor-pointer hover:bg-gray-100 ${
                          selectedState === state ? "bg-gray-200" : ""
                        }`}
                        onClick={() => handleStateSelect(state)}
                      >
                        {state}
                      </div>
                    ))}
                    {filteredStates.length === 0 && (
                      <div className="p-2 text-gray-500">No states found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-150px">
                <CustomSelectWithProps
                  placeholder="Scholarship Options"
                  classNameStyle="h-[35px]"
                  options={scholarshipList.map((typeValue) => ({
                    value: typeValue,
                    label: typeValue,
                  }))}
                  onChange={(val) => setScholarshipOptions(val)}
                  selectedProps={{
                    value: scholarshipOptions,
                    label: scholarshipOptions,
                  }}
                  handleError={() => {}}
                />
              </div>

              <button
                onClick={resetFilter}
                type="button"
                className="w-[150px] bg-[white] text-[#999999] text-[14px] font-medium py-2 h-[35px] p-2 border border-gray-300 rounded-md
                      outline-0 focus:outline-none flex justify-center items-center gap-x-[10px]"
              >
                <p>Clear Filters</p>
                <IoIosRefresh className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 flex justify-center">
            {isLoading && (
              <div className="mx-auto w-full flex justify-center items-center h-[500px]">
                <ClipLoader />
              </div>
            )}
          </div>

          {!isLoading && (
            <div className="p-5 flex flex-wrap gap-[30px] w-[100%]">
              {paginatedCourses.length > 0 &&
                paginatedCourses.map((elem, i) => (
                  <CourseCard
                    setShowDetails={setShowDetails}
                    courseItem={elem}
                    key={i}
                    setCourseDetails={setCourseDetails}
                  />
                ))}
            </div>
          )}

          {!isLoading && paginatedCourses.length === 0 && (
            <div className="flex flex-col justify-center items-center gap-y-[10px] w-full h-[400px]">
              <img src={fileIcon} alt="Not found" />
              <p className="text-[#101828] text-[16px] font-semibold">
                No courses Found
              </p>
            </div>
          )}

          <div className="flex justify-between items-center px-5 mt-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-1 border-[1px] border-[#D0D5DD] rounded-lg disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm">
              Showing Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-1 border-[1px] border-[#D0D5DD] rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="h-[20px] w-[40px]"></div>
    </div>
  );
}
