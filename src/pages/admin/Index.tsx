import { useState, useEffect, useRef } from "react";
import DashboardCard from "../../components/Admin/DashboardCard";
import { RiSchoolLine } from "react-icons/ri";
import { MdOutlineReceiptLong } from "react-icons/md";
import { IoMdStats } from "react-icons/io";
// import CustomSelect from "../../components/dashboard/CustomSelect";
import { MdFilterList } from "react-icons/md";
import { FiChevronDown, FiSearch } from "react-icons/fi";
// import { School } from "../../services/schools";

import countriesData from "../../data/countries_states.json"

import { getSchoolsByLocation, getSchools, getCourses, getWaitList, getUserList } from "../../services/schools";
import { useAuth } from "../../contexts/useAuth";


// Define TypeScript types
type Country = {
  name: string;
  states: string[];
};

export default function Index() {
  // State to store selected country and states
  const {token, startDate, endDate, datePickerClicked} = useAuth()
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("")
  const [schoolList, setSchoolList] = useState<string[]>([])
  const [selectedSchool, setSelectedSchool] = useState<string>("")
  const [schoolLength, setSchoolLength] = useState<number>(0)
  const [courseLength, setCourseLength] = useState<number>(0)
  const [waitListLength, setWaitListLength] = useState<number>(0)
  const [userLength, setuserLength] = useState<number>(0)

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [stateSearchTerm, setStateSearchTerm] = useState<string>("");
  const [stateDropdownOpen, setStateDropdownOpen] = useState<boolean>(false);
  const stateDropdownRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setDropdownOpen(true); // Open the dropdown when typing
  };


  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (countryName: string) => {
    setSelectedCountry(countryName);
    setSearchTerm(countryName); // Set the search term to the selected country
    const countryData = countries.find((c) => c.name === countryName);
    setStates(countryData ? countryData.states : []);
    setSelectedState(""); // Reset state selection
    setStateSearchTerm("")
    setSchoolList([]);
    setDropdownOpen(false); // Close the dropdown
  };

  const filteredStates = states.filter((state) =>
    state.toLowerCase().includes(stateSearchTerm.toLowerCase())
  );

  const handleStateSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStateSearchTerm(event.target.value);
    setStateDropdownOpen(true); // Open the dropdown when typing
  };
  
  const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    setStateSearchTerm(stateName); // Set the search term to the selected state
    setSchoolList([]); // Reset the school list
    setStateDropdownOpen(false); // Close the dropdown
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

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

  // console.log("endDate: ", endDate, " startDate: ", startDate)

  // Load countries from JSON on mount
  useEffect(() => {
    setCountries(countriesData);
    getAllSchools()
    getAllCourses()
    getAllWaitist()
    getAllUsers()
  }, []);

  useEffect(() => {
    if (datePickerClicked) {
      getAllSchools()
      getAllCourses()

    }
  }, [datePickerClicked])

  const resetFilter = () => {
    setSchoolList([])
    setStates([])
    setSelectedState("")
    setSelectedCountry("")
  }


  const handleGetSchools = async () => {

    const schoolsInLocationList = await getSchoolsByLocation(selectedCountry, selectedState)
    
    if (schoolsInLocationList.length > 0) {
      let tempList:string[] = []
      schoolsInLocationList.map((elem:any) => {
        tempList.push(elem.name)
      })
      setSchoolList([...tempList])
    }
  }

  useEffect(() => {
    if (selectedState.length > 0) {
      handleGetSchools()
    }
  }, [selectedState])


  const getAllSchools = async () => {
    try {
      let reponse = await getSchools(token || "")

      if (reponse.length > 0) {

        let tempStartDate = new Date(startDate);
        let tempEndDate = new Date(endDate);
        
        // Normalize both to full-day range
        tempStartDate.setHours(0, 0, 0, 0);
        tempEndDate.setHours(23, 59, 59, 999);
        
        // If both dates are the same, show everything from Jan 1, 1970 to that date
        const isSameDate = tempStartDate.toDateString() === tempEndDate.toDateString();
        if (isSameDate) {
          tempStartDate = new Date('1970-01-01T00:00:00Z');
        }
        
        const filteredSchools = reponse.filter((school) => {
          const createdAtDate = new Date(school.createdAt);
          const isIncluded = createdAtDate >= tempStartDate && createdAtDate <= tempEndDate;
          return isIncluded;
        });

        setSchoolLength(filteredSchools.length);
      } else {
        setSchoolLength(0);
      }

    } catch (error) { 
      setSchoolLength(0)
      console.error("Error fetching schools:", error);
    }
  }

  const getAllCourses = async () => {
    try {
      let response: { createdAt: string }[] = await getCourses(token || "")
      if (response.length > 0) {
        let tempStartDate = new Date(startDate);
        let tempEndDate = new Date(endDate);
        
        // Normalize to day boundaries
        tempStartDate.setHours(0, 0, 0, 0);
        tempEndDate.setHours(23, 59, 59, 999);
        
        // If start and end dates are the same, go from 1970 to endDate
        const isSameDate = tempStartDate.toDateString() === tempEndDate.toDateString();
        if (isSameDate) {
          tempStartDate = new Date('1970-01-01T00:00:00Z');
        }
        
        const filteredCourses = response.filter((course) => {
          const createdAtDate = new Date(course.createdAt);
          const isIncluded = createdAtDate >= tempStartDate && createdAtDate <= tempEndDate;
          return isIncluded;
        });

        setCourseLength(filteredCourses.length);
      } else {
        setCourseLength(0);
      }
    } catch (error) { 
      console.error("Error fetching courses:", error);
    } 
  }

  const getAllWaitist = async () => {
    try {
      const response = await getWaitList(token || "");
      setWaitListLength(response?.data?.length || 0)
    } catch (e) {
      console.log("error: ", e)
    }
  }

  const getAllUsers = async () => {
    try {
      const response = await getUserList(token || "");
      console.log("user list: ", response)
      setuserLength(response?.data?.length || 0)
    } catch (e) {
      console.log("error: ", e)
    }
  }
  
  return (
    <div className="flex min-h-full flex-col gap-y-[20px] p-4 sm:p-5">
      
      <div className="w-full grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 border-b border-[#EAECF0] pb-[20px]">
        <DashboardCard 
          percentType={true} 
          bgColor="#E8FBF5" 
          percentValue={0} 
          title="Total Schools" 
          Icon={RiSchoolLine} 
          value={schoolLength}
        />

        <DashboardCard 
          percentType={true} 
          bgColor="#FFFADF" 
          percentValue={0} 
          title="Total Courses" 
          value={courseLength}
          Icon={MdOutlineReceiptLong} 
        />
        <DashboardCard 
          percentType={false} 
          bgColor="#FFEBEB" 
          percentValue={0} 
          title="Total Users" 
          Icon={IoMdStats} 
          value={userLength}
        />
        <DashboardCard 
          percentType={false} 
          bgColor="#EFECFF" 
          percentValue={0} 
          title="Total WaitList Users" 
          Icon={MdOutlineReceiptLong} 
          value={waitListLength}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px] lg:my-[20px] w-full lg:w-auto">
          <div className="w-full lg:w-[200px] relative" ref={dropdownRef}>
            <FiSearch className="absolute top-[25%] right-[10px] text-[#999999]" />
            <input
              type="text"
              className="h-[40px] border-[0.8px] border-gray-300 p-2 w-full rounded-md focus:outline-none text-[#999999] text-[14px] font-medium"
              placeholder="Search Country"
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
                    <div className="p-2 text-gray-500">No countries found</div>
                  )}
                </div>
              )}
          </div>

          <div className="w-full lg:w-[200px] relative" ref={stateDropdownRef}>
            <FiSearch className="absolute top-[25%] right-[10px] text-[#999999]" />
            <input
              type="text"
              className="h-[40px] border-[0.8px] border-gray-300 p-2 w-full rounded-md focus:outline-none text-[#999999] text-[14px] font-medium"
              placeholder="Search State"
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

          <div className="w-full lg:w-[200px] relative">
            <select
              className="h-[40px] border-[0.8px] border-gray-300 p-2 w-full rounded-md focus:outline-none text-[#999999] text-[14px] font-medium appearance-none"
              value={selectedSchool}
              onChange={(e) => {
                setSelectedSchool(e.target.value)
              }}
              disabled={selectedCountry ? false : true}
            >
              <option value="">All Schools</option>
              {schoolList.map((school, index) => (
                <option key={index} value={school}>
                  {school}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <FiChevronDown />
            </div>
          </div>
        </div>

        <button 
          onClick={resetFilter}
          type="button" 
          className="w-full sm:w-[150px] shrink-0 text-white py-2 h-[40px] bg-[#004085] p-2 rounded-md 
             outline-0 focus:outline-none flex justify-center items-center gap-x-[10px]"
          >
          <MdFilterList className="w-6 h-6"  />
          <p>Reset Filters</p>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
        <div className="flex flex-col gap-y-[10px] min-w-0">
          <p className="text-[#000000] text-[16px] font-bold">Top Loan Application Schools</p>
          <div className="w-[100%] rounded-lg border-[0.8px] 
            border-gray-300 h-[200px] md:h-[300px] px-4 text-center flex justify-center items-center">
            <p className="text-[#737373] text-[14px] font-semibold">There was no data found for this data range</p>
          </div>
        </div>

        <div className="flex flex-col gap-y-[10px] min-w-0">
          <p className="text-[#000000] text-[16px] font-bold">Loan Application by Region</p>
          <div className="w-[100%] rounded-lg border-[0.8px] 
            border-gray-300 h-[200px] md:h-[300px] px-4 text-center flex justify-center items-center">
            <p className="text-[#737373] text-[14px] font-semibold">There was no data found for this data range</p>
          </div>
        </div>

      </div>

    </div>
  );
}
