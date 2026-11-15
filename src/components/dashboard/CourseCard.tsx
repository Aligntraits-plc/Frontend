import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { Course } from "../../types/course.types";
import locationIcon from "../../assets/locationIcon.svg";
import { getSchool } from "../../services/schools";
import { School } from "../../services/schools";
import courseImage from "../../assets/course.png";
import { LiaTimesSolid } from "react-icons/lia";

import schoolPlaceholder from "../../assets/school-placeholder.svg";
// Default school logo
const DEFAULT_SCHOOL_LOGO = schoolPlaceholder;

interface CoursesProps {
  courseItem: Course;
  setCourseDetails: React.Dispatch<React.SetStateAction<Course | null>>;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
}

const CourseCard = ({
  courseItem,
  setCourseDetails,
  setShowDetails,
}: CoursesProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Only used for the "not logged in" prompt now
  const [loginup, setLoginup] = useState(false);
  const goLogin = () => {
    navigate("/login");
  };

  const [school, setSchool] = useState<School>();

  async function fetchSchool() {
    try {
      const response = await getSchool(courseItem?.schoolId as string);
      setSchool(response);
    } catch (err) {
      console.error("Failed to fetch school:", err);
    }
  }

  useEffect(() => {
    if (courseItem?.schoolId) {
      fetchSchool();
    }
  }, [courseItem?.schoolId]);

  // Use school logo or fallback to default
  const schoolLogo =
    school?.logo && school.logo.trim() !== ""
      ? school.logo
      : DEFAULT_SCHOOL_LOGO;

  const handleViewDetails = () => {
    if (!isAuthenticated) {
      setLoginup(true); // Not logged in — show the login/career-rec modal
      return;
    }

    // Logged in — show details directly, no modal
    setShowDetails(true);
    setCourseDetails(courseItem);
  };

  return (
    <>
      <div className="w-[100%] lg:w-[300px] h-[350px] md:h-[400px] rounded-xl border-[2px] border-[#EAECF0] p-[8px] flex flex-col gap-y-[5px] justify-between bg-white">
        <div className="w-[100%] h-[100px] md:h-[150px] rounded-md">
          {courseItem.image ? (
            <img
              alt="course Icon"
              src={courseItem.image}
              className="h-[100%] w-[100%] rounded-md object-cover"
            />
          ) : (
            <img
              alt="course Icon"
              src={courseImage}
              className="h-[100%] w-[100%] rounded-md object-cover"
            />
          )}
        </div>

        <div className="flex gap-x-[5px] md:gap-x-[10px]">
          <img
            alt="school logo"
            src={schoolLogo}
            className="h-[30px] w-[30px] md:h-[35px] md:w-[35px] mt-[5px] rounded-[50%] object-cover border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_SCHOOL_LOGO;
            }}
          />

          <div>
            <p className="text-[#000000] font-semibold text-[12px] md:text-[16px]">
              {courseItem.title}
            </p>
            <p className="text-[#999999] font-medium text-[10px] md:text-[12px]">
              {courseItem.university?.name || "Unknown University"}
            </p>

            <div className="flex gap-x-[5px]">
              <img src={locationIcon} alt="Location Icon" className="" />
              <p className="text-[#007BFF] text-[8px] md:text-[12px] font-normal ">
                {courseItem.university?.region}/{courseItem.university?.country}
              </p>
            </div>
          </div>
        </div>

        <p className="text-[#667085] text-[12px]">
          {courseItem.objectives?.slice(0, 100) || "No description available"}
          ...
        </p>

        <div className="flex justify-between">
          <div className="bg-[#E6F2FF] px-2 rounded-lg h-[30px] size-max md:w-[120px] flex justify-center items-center">
            <p className="text-[#007BFF] text-[8px] md:text-[14px] font-medium">
              {courseItem.acceptanceFeeCurrency} {courseItem.acceptanceFee}
            </p>
          </div>

          <div className="bg-[#E6F2FF] px-2 rounded-lg h-[30px] size-max md:w-[150px] flex justify-center items-center">
            <p className="text-[#007BFF] text-[8px] md:text-[14px] font-medium">
              {courseItem.scholarship || "No Scholarship"}
            </p>
          </div>
        </div>

        <button
          onClick={handleViewDetails}
          className="bg-[#004085] h-[40px] w-[100%] font-semibold text-[12px] text-[white] rounded-md"
        >
          View Details
        </button>
      </div>
      {loginup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[1099] flex items-center justify-center"
          onClick={() => setLoginup(false)} // Close when clicking outside
        >
          <div
            className="bg-white shadow-lg rounded-xl w-[90%] max-w-[320px] p-6 relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Close Button */}
            <LiaTimesSolid
              onClick={() => setLoginup(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 cursor-pointer text-2xl"
            />

            <div className="flex flex-col gap-4 mt-6">
              <button
                onClick={() => {
                  setLoginup(false);
                  navigate("/career-recommedation");
                }}
                className="w-full py-3 text-white rounded-lg bg-[#004085] font-semibold hover:bg-[#003366]"
              >
                Career Recommendation
              </button>

              <button
                onClick={() => {
                  setLoginup(false);
                  goLogin();
                }}
                className="w-full py-3 text-[#1E1E1E] rounded-lg bg-[#F6C648] font-semibold hover:bg-[#f5b82a]"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseCard;

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// // import { useAuth } from "../../contexts/useAuth"; // ← Use your auth context
// import { Course } from "../../types/course.types";
// import locationIcon from "../../assets/locationIcon.svg";
// import { getSchool } from "../../services/schools";
// import { School } from "../../services/schools";
// import courseImage from "../../assets/course.png";
// import { LiaTimesSolid } from "react-icons/lia";

// // Default school logo
// const DEFAULT_SCHOOL_LOGO =
//   schoolPlaceholder;

// interface CoursesProps {
//   courseItem: Course;
//   setCourseDetails: React.Dispatch<React.SetStateAction<Course | null>>;
//   setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
// }

// const CourseCard = ({
//   courseItem,
//   // setCourseDetails,
//   // setShowDetails,
// }: CoursesProps) => {
//   const navigate = useNavigate();
//   // const { isAuthenticated } = useAuth(); // ← Get auth status from context

//   // a state for loginup
//   const [loginup, setLoginup] = useState(false);
//   const goLogin = () => {
//     navigate("/login");
//   };

//   const [school, setSchool] = useState<School>();

//   async function fetchSchool() {
//     try {
//       const response = await getSchool(courseItem?.schoolId as string);
//       setSchool(response);
//     } catch (err) {
//       console.error("Failed to fetch school:", err);
//     }
//   }

//   useEffect(() => {
//     if (courseItem?.schoolId) {
//       fetchSchool();
//     }
//   }, [courseItem?.schoolId]);

//   // Use school logo or fallback to default
//   const schoolLogo =
//     school?.logo && school.logo.trim() !== ""
//       ? school.logo
//       : DEFAULT_SCHOOL_LOGO;

//   const handleViewDetails = () => {
//     setLoginup(true); // Open the mobile menu
//     // if (!isAuthenticated) {
//     //   navigate("/login"); // Redirect if not logged in
//     //   return;
//     // }

//     // If logged in, show details
//     // setShowDetails(true);
//     // setCourseDetails(courseItem);
//   };

//   return (
//     <>
//       <div className="w-[100%] lg:w-[300px] h-[350px] md:h-[400px] rounded-xl border-[2px] border-[#EAECF0] p-[8px] flex flex-col gap-y-[5px] justify-between bg-white">
//         <div className="w-[100%] h-[100px] md:h-[150px] rounded-md">
//           {courseItem.image ? (
//             <img
//               alt="course Icon"
//               src={courseItem.image}
//               className="h-[100%] w-[100%] rounded-md object-cover"
//             />
//           ) : (
//             <img
//               alt="course Icon"
//               src={courseImage}
//               className="h-[100%] w-[100%] rounded-md object-cover"
//             />
//           )}
//         </div>

//         <div className="flex gap-x-[5px] md:gap-x-[10px]">
//           <img
//             alt="school logo"
//             src={schoolLogo}
//             className="h-[30px] w-[30px] md:h-[35px] md:w-[35px] mt-[5px] rounded-[50%] object-cover border border-gray-200"
//             onError={(e) => {
//               (e.target as HTMLImageElement).src = DEFAULT_SCHOOL_LOGO;
//             }}
//           />

//           <div>
//             <p className="text-[#000000] font-semibold text-[12px] md:text-[16px]">
//               {courseItem.title}
//             </p>
//             <p className="text-[#999999] font-medium text-[10px] md:text-[12px]">
//               {courseItem.university?.name || "Unknown University"}
//             </p>

//             <div className="flex gap-x-[5px]">
//               <img src={locationIcon} alt="Location Icon" className="" />
//               <p className="text-[#007BFF] text-[8px] md:text-[12px] font-normal ">
//                 {courseItem.university?.region}/{courseItem.university?.country}
//               </p>
//             </div>
//           </div>
//         </div>

//         <p className="text-[#667085] text-[12px]">
//           {courseItem.objectives?.slice(0, 100) || "No description available"}
//           ...
//         </p>

//         <div className="flex justify-between">
//           <div className="bg-[#E6F2FF] px-2 rounded-lg h-[30px] size-max md:w-[120px] flex justify-center items-center">
//             <p className="text-[#007BFF] text-[8px] md:text-[14px] font-medium">
//               {courseItem.acceptanceFeeCurrency} {courseItem.acceptanceFee}
//             </p>
//           </div>

//           <div className="bg-[#E6F2FF] px-2 rounded-lg h-[30px] size-max md:w-[150px] flex justify-center items-center">
//             <p className="text-[#007BFF] text-[8px] md:text-[14px] font-medium">
//               {courseItem.scholarship || "No Scholarship"}
//             </p>
//           </div>
//         </div>

//         <button
//           onClick={handleViewDetails}
//           className="bg-[#004085] h-[40px] w-[100%] font-semibold text-[12px] text-[white] rounded-md"
//         >
//           View Details
//         </button>
//       </div>
//       {loginup && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-[1099] flex items-center justify-center"
//           onClick={() => setLoginup(false)} // Close when clicking outside
//         >
//           <div
//             className="bg-white shadow-lg rounded-xl w-[90%] max-w-[320px] p-6 relative"
//             onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
//           >
//             {/* Close Button */}
//             <LiaTimesSolid
//               onClick={() => setLoginup(false)}
//               className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 cursor-pointer text-2xl"
//             />

//             <div className="flex flex-col gap-4 mt-6">
//               <button
//                 onClick={() => {
//                   setLoginup(false);
//                   navigate("/career-recommedation");
//                 }}
//                 className="w-full py-3 text-white rounded-lg bg-[#004085] font-semibold hover:bg-[#003366]"
//               >
//                 Career Recommendation
//               </button>

//               <button
//                 onClick={() => {
//                   setLoginup(false);
//                   goLogin();
//                 }}
//                 className="w-full py-3 text-[#1E1E1E] rounded-lg bg-[#F6C648] font-semibold hover:bg-[#f5b82a]"
//               >
//                 Login
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default CourseCard;
