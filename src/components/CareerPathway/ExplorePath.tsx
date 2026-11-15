import {
  CircleCheck,
  Sparkles,
  CircleAlert,
  Share2,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { getAcademicRecords } from "../../services/utils";
import { SubjectGrade, RequirementListNew } from "../../types/course.types";
import AddCourse from "../../pages/AddCourse";

import FeedbackModal from "../Feedback/FeedbackModal";

interface ExplorePathProps {
  careerPath: any;
  explorePath: string;
  setViewState: React.Dispatch<React.SetStateAction<number>>;
}

const traitColors: Record<string, string> = {
  agreeableness: "bg-blue-400",
  conscientiousness: "bg-amber-400",
  extraversion: "bg-emerald-400",
  openness: "bg-sky-400",
  neuroticism: "bg-rose-400",
};

// Where a shared result sends friends: the free snapshot on aligntraits.com.
const QUESTIONNAIRE_URL = "https://aligntraits.com/career-recommedation";

const ExplorePath = ({
  careerPath,
  explorePath,
  setViewState,
}: ExplorePathProps) => {
  const breakdownRef = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false);

  const [isSharing, setIsSharing] = useState(false);

  // --- academic-record guard state (mirrors RecommendationResults.tsx) ---
  const [showModal, setShowModal] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [recordList, setRecordList] = useState<RequirementListNew[]>([]);

  // Older results were saved without the detailed breakdown, so never assume the list is there.
  const richList = Array.isArray(careerPath?.richRecommendations) ? careerPath.richRecommendations : [];
  const testObj = richList.find(
    (course: any) => course.career === explorePath
  );

  const {
    agreeableness = 0,
    conscientiousness = 0,
    extraversion = 0,
    openness = 0,
    neuroticism = 0,
    career = "Career",
    personalityNarrative = "",
    positiveTraits = [],
    negativeTraits = [],
  } = testObj || {};

  const personality = [
    { key: "Agreeableness", value: agreeableness, id: "agreeableness" },
    {
      key: "Conscientiousness",
      value: conscientiousness,
      id: "conscientiousness",
    },
    { key: "Extraversion", value: extraversion, id: "extraversion" },
    { key: "Openness", value: openness, id: "openness" },
    { key: "Neuroticism", value: neuroticism, id: "neuroticism" },
  ];

  useEffect(() => {
    if (!hasFetched.current) {
      getRecords();
      hasFetched.current = true;
    }
  }, []);

  const getRecords = async () => {
    try {
      const response = await getAcademicRecords({ showToast: true });
      if (response?.ok) {
        populateList(response.data[0]);
      }
    } catch (err: any) {
      console.log("error: ", err);
    }
  };

  const populateList = (dataParam: any) => {
    const parsedRequirements: RequirementListNew[] = [];

    // Process up to 10 exam types from school data
    for (let i = 1; i <= 10; i++) {
      const countryKey = `ExamCountry${i}`;
      const typeKey = `ExamType${i}`;
      const subjectsKey = `ExamType${i}Subjects`;
      const gradesKey = `ExamType${i}SubGrades`;

      if (
        dataParam[countryKey] &&
        dataParam[typeKey] &&
        dataParam[subjectsKey] &&
        dataParam[gradesKey]
      ) {
        const subjects: SubjectGrade[] = [];

        for (let j = 0; j < dataParam[subjectsKey].length; j++) {
          subjects.push({
            id: JSON.stringify(Date.now() + j),
            subject: dataParam[subjectsKey][j],
            grade: dataParam[gradesKey][j],
          });
        }

        parsedRequirements.push({
          id: JSON.stringify(Date.now() + i),
          country: dataParam[countryKey],
          examType: dataParam[typeKey],
          examYear: "1970",
          subjects: subjects,
        });
      }
    }

    setRecordList(parsedRequirements);
  };

  // true => user needs to add/complete academic records before proceeding
  const checkExamType = () => {
    if (recordList.length < 2) {
      return true;
    }
    const firstExamType = recordList[0].examType;
    let noDiffExamType = true;
    recordList.forEach((elem: any) => {
      if (elem.examType !== firstExamType) {
        noDiffExamType = false;
      }
    });
    return noDiffExamType;
  };

  const handleGetCourseRecommendation = () => {
    if (checkExamType()) {
      setShowModal(true);
    } else {
      setViewState(1);
    }
  };

  const handleShare = async () => {
    if (!breakdownRef.current) return;
    setIsSharing(true);

    try {
      const canvas = await html2canvas(breakdownRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // sharper image
        useCORS: true,
      });

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );

      if (!blob) throw new Error("Could not generate image");

      const fileName = `${career
        .replace(/\s+/g, "-")
        .toLowerCase()}-aligntraits-result.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      const shareText = `I checked my "${career}" fit on AlignTraits. See the courses and schools that fit you, free: ${QUESTIONNAIRE_URL}`;

      // Native share sheet (mobile / supported browsers)
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "My Personality Breakdown",
          text: shareText,
          files: [file],
        });
      } else {
        // Fallback: download the image + copy the link to clipboard
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        try {
          await navigator.clipboard.writeText(shareText);
          alert(
            "Image downloaded and share text copied to your clipboard — paste it wherever you'd like to share!"
          );
        } catch {
          alert(`Image downloaded! Share this link too: ${QUESTIONNAIRE_URL}`);
        }
      }
    } catch (err) {
      console.error("Share failed:", err);
      alert("Sorry, something went wrong while preparing your share image.");
    } finally {
      setIsSharing(false);
    }
  };

  if (showAddCourse) {
    return (
      <div className="w-full mx-auto p-6 space-y-6">
        <div className="w-full max-w-2xl mx-auto mt-[50px] bg-white border-[1px] border-[#ccc] shadow-md rounded-xl p-6">
          <AddCourse getRecords={getRecords} setShowAddCourse={setShowAddCourse} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <div ref={breakdownRef}>
        <div className="bg-[#EEF2FF] border border-[#BFDBFE] shadow-sm rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-indigo-50 p-3">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Your Career Path
                  </h3>
                  <p className="text-[15px] font-medium text-[#1E3A8A]">
                    {career}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-slate-700 text-sm leading-relaxed">
                <p className="whitespace-pre-line">{personalityNarrative}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#F3F4F6] rounded-2xl p-6 mt-6">
          <h4 className="text-[20px] font-bold text-[#111827]">
            Personality Breakdown
          </h4>

          <div className="mt-4 grid grid-cols-1 gap-4">
            {personality.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 border-b last:border-b-0 pb-4"
              >
                <div className="w-36 text-[16px] font-semibold text-[#111827]">
                  {t.key}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full ${
                        traitColors[t.id] || "bg-slate-400"
                      }`}
                      style={{
                        width: `${Math.max(0, Math.min(100, t.value))}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-[14px] font-semi-bold text-[#4A90E2]">
                  {t.value}%
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-semibold text-[#15803D] flex items-center gap-2">
                <CircleCheck className="w-4 h-4 text-[#15803D]" />
                Strengths
              </h5>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {positiveTraits.length ? (
                  positiveTraits.map((p: any, i: number) => (
                    <li
                      key={i}
                      className="flex items-center border border-[#BBF7D0] rounded-md gap-2 bg-[#F0FDF4] h-[60px] px-4"
                    >
                      <span className="text-[#14532D] text-[12px] font-medium">
                        {p}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">No positives listed</li>
                )}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-[#C2410C] flex items-center gap-2">
                <CircleAlert className="w-4 h-4 text-[#EA580C]" />
                Areas for growth
              </h5>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {negativeTraits.length ? (
                  negativeTraits.map((n: any, i: number) => (
                    <li
                      key={i}
                      className="flex items-center border border-[#FED7AA] rounded-md gap-2 bg-[#FFF7ED] h-[60px] px-4"
                    >
                      <span className="text-[#7C2D12] text-[12px] font-medium">
                        {n}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">No concerns listed</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4 gap-x-[20px]">
        <button
          onClick={handleGetCourseRecommendation}
          className="h-[40px] bg-[#004085] items-center text-center disabled:opacity-50 hover:bg-blue-800 text-white font-medium py-1 px-5 rounded-lg transition"
        >
          Get Course Recommendation
        </button>

        <button
          onClick={handleShare}
          disabled={isSharing}
          className="h-[40px] border border-[#D1D5DB] flex gap-x-[5px] items-center justify-center bg-[white] disabled:opacity-50 text-[#374151] font-medium py-1 px-5 rounded-lg transition"
        >
          {isSharing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          <span className="text-[#374151]">
            {isSharing ? "Preparing..." : "Share"}
          </span>
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Add academic record</h2>
            <p className="mb-4">
              To provide you with accurate course recommendations, we require
              at least two exam records.
            </p>
            <button
              onClick={() => {
                setShowModal(false);
                setShowAddCourse(true);
              }}
              className="w-full h-12 bg-[#004085] text-white rounded-lg hover:bg-blue-700"
            >
              Add Exam Record
            </button>
          </div>
        </div>
      )}
     <FeedbackModal source="personality-overview" />
    </div>
  );
};
    
export default ExplorePath;

//import {
//   CircleCheck,
//   Sparkles,
//   CircleAlert,
//   Share2,
//   Loader2,
// } from "lucide-react";
// // import { useNavigate } from "react-router-dom";
// import { useRef, useState } from "react";
// import html2canvas from "html2canvas";

// interface ExplorePathProps {
//   careerPath: any;
//   explorePath: string;
//   setViewState: React.Dispatch<React.SetStateAction<number>>;
// }

// const traitColors: Record<string, string> = {
//   agreeableness: "bg-blue-400",
//   conscientiousness: "bg-amber-400",
//   extraversion: "bg-emerald-400",
//   openness: "bg-sky-400",
//   neuroticism: "bg-rose-400",
// };

// const QUESTIONNAIRE_URL = "https://www.aligntrait.com/questionaire";

// const ExplorePath = ({
//   careerPath,
//   explorePath,
//   setViewState,
// }: ExplorePathProps) => {
//   // const navigate = useNavigate();
//   const breakdownRef = useRef<HTMLDivElement>(null);
//   const [isSharing, setIsSharing] = useState(false);

//   const testObj = careerPath.richRecommendations.find(
//     (course: any) => course.career === explorePath,
//   );

//   const {
//     agreeableness = 0,
//     conscientiousness = 0,
//     extraversion = 0,
//     openness = 0,
//     neuroticism = 0,
//     career = "Career",
//     personalityNarrative = "",
//     positiveTraits = [],
//     negativeTraits = [],
//   } = testObj || {};

//   const personality = [
//     { key: "Agreeableness", value: agreeableness, id: "agreeableness" },
//     {
//       key: "Conscientiousness",
//       value: conscientiousness,
//       id: "conscientiousness",
//     },
//     { key: "Extraversion", value: extraversion, id: "extraversion" },
//     { key: "Openness", value: openness, id: "openness" },
//     { key: "Neuroticism", value: neuroticism, id: "neuroticism" },
//   ];

//   const handleClick = () => {
//     setViewState(1);
//   };

//   const handleShare = async () => {
//     if (!breakdownRef.current) return;
//     setIsSharing(true);

//     try {
//       const canvas = await html2canvas(breakdownRef.current, {
//         backgroundColor: "#ffffff",
//         scale: 2, // sharper image
//         useCORS: true,
//       });

//       const blob: Blob | null = await new Promise((resolve) =>
//         canvas.toBlob((b) => resolve(b), "image/png"),
//       );

//       if (!blob) throw new Error("Could not generate image");

//       const fileName = `${career.replace(/\s+/g, "-").toLowerCase()}-personality-breakdown.png`;
//       const file = new File([blob], fileName, { type: "image/png" });

//       const shareText = `Check out my "${career}" personality breakdown! Take your own assessment here: ${QUESTIONNAIRE_URL}`;

//       // Native share sheet (mobile / supported browsers)
//       if (
//         navigator.share &&
//         navigator.canShare &&
//         navigator.canShare({ files: [file] })
//       ) {
//         await navigator.share({
//           title: "My Personality Breakdown",
//           text: shareText,
//           files: [file],
//         });
//       } else {
//         // Fallback: download the image + copy the link to clipboard
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement("a");
//         link.href = url;
//         link.download = fileName;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         URL.revokeObjectURL(url);

//         try {
//           await navigator.clipboard.writeText(shareText);
//           alert(
//             "Image downloaded and share text copied to your clipboard — paste it wherever you'd like to share!",
//           );
//         } catch {
//           alert(`Image downloaded! Share this link too: ${QUESTIONNAIRE_URL}`);
//         }
//       }
//     } catch (err) {
//       console.error("Share failed:", err);
//       alert("Sorry, something went wrong while preparing your share image.");
//     } finally {
//       setIsSharing(false);
//     }
//   };

//   return (
//     <div className="w-full mx-auto p-6 space-y-6">
//       <div ref={breakdownRef}>
//         <div className="bg-[#EEF2FF] border border-[#BFDBFE] shadow-sm rounded-2xl p-6">
//           <div className="flex items-start justify-between gap-4">
//             <div className="flex-1">
//               <div className="flex items-center gap-3">
//                 <div className="rounded-full bg-indigo-50 p-3">
//                   <Sparkles className="w-6 h-6 text-indigo-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-semibold text-slate-900">
//                     Your Career Path
//                   </h3>
//                   <p className="text-[15px] font-medium text-[#1E3A8A]">
//                     {career}
//                   </p>
//                 </div>
//               </div>

//               <div className="mt-4 text-slate-700 text-sm leading-relaxed">
//                 <p>{personalityNarrative}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white border border-[#F3F4F6] rounded-2xl p-6 mt-6">
//           <div className="">
//             <h4 className="text-[20px] font-bold text-[#111827]">
//               Personality Breakdown
//             </h4>

//             <div className="mt-4 grid grid-cols-1 gap-4">
//               {personality.map((t) => (
//                 <div
//                   key={t.id}
//                   className="flex items-center gap-4 border-b last:border-b-0 pb-4"
//                 >
//                   <div className="w-36 text-[16px] font-semibold text-[#111827]">
//                     {t.key}
//                   </div>
//                   <div className="flex-1">
//                     <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
//                       <div
//                         className={`h-3 rounded-full ${
//                           traitColors[t.id] || "bg-slate-400"
//                         }`}
//                         style={{
//                           width: `${Math.max(0, Math.min(100, t.value))}%`,
//                         }}
//                       />
//                     </div>
//                   </div>
//                   <div className="w-12 text-right text-[14px] font-semi-bold text-[#4A90E2]">
//                     {t.value}%
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-6 grid md:grid-cols-2 gap-6">
//               <div>
//                 <h5 className="text-sm font-semibold text-[#15803D] flex items-center gap-2">
//                   <CircleCheck className="w-4 h-4 text-[#15803D]" />
//                   Strengths
//                 </h5>
//                 <ul className="mt-3 space-y-2 text-sm text-slate-600">
//                   {positiveTraits.length ? (
//                     positiveTraits.map((p: any, i: number) => (
//                       <li
//                         key={i}
//                         className="flex items-center border border-[#BBF7D0] rounded-md gap-2 bg-[#F0FDF4] h-[60px] px-4"
//                       >
//                         <span className="text-[#14532D] text-[12px] font-medium">
//                           {p}
//                         </span>
//                       </li>
//                     ))
//                   ) : (
//                     <li className="text-slate-400">No positives listed</li>
//                   )}
//                 </ul>
//               </div>

//               <div>
//                 <h5 className="text-sm font-semibold text-[#C2410C] flex items-center gap-2">
//                   <CircleAlert className="w-4 h-4 text-[#EA580C]" />
//                   Areas for growth
//                 </h5>
//                 <ul className="mt-3 space-y-2 text-sm text-slate-600">
//                   {negativeTraits.length ? (
//                     negativeTraits.map((n: any, i: number) => (
//                       <li
//                         key={i}
//                         className="flex items-center border border-[#FED7AA] rounded-md gap-2 bg-[#FFF7ED] h-[60px] px-4"
//                       >
//                         <span className="text-[#7C2D12] text-[12px] font-medium">
//                           {n}
//                         </span>
//                       </li>
//                     ))
//                   ) : (
//                     <li className="text-slate-400">No concerns listed</li>
//                   )}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-center mt-4 gap-x-[20px]">
//         <button
//           onClick={handleClick}
//           className="h-[40px] bg-[#004085] items-center text-center disabled:opacity-50 hover:bg-blue-800 text-white font-medium py-1 px-5 rounded-lg transition"
//         >
//           Get Course Recommendation
//         </button>

//         <button
//           onClick={handleShare}
//           disabled={isSharing}
//           className="h-[40px] border border-[#D1D5DB] flex gap-x-[5px] items-center justify-center bg-[white] disabled:opacity-50 text-[#374151] font-medium py-1 px-5 rounded-lg transition"
//         >
//           {isSharing ? (
//             <Loader2 className="w-4 h-4 animate-spin" />
//           ) : (
//             <Share2 className="w-4 h-4" />
//           )}
//           <span className="text-[#374151]">
//             {isSharing ? "Preparing..." : "Share"}
//           </span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ExplorePath;

// // import { CircleCheck, Sparkles, CircleAlert, RotateCcw } from "lucide-react";
// // import { useNavigate } from "react-router-dom";

// // interface ExplorePathProps {
// //   careerPath: any;
// //   explorePath: string;
// //   setViewState: React.Dispatch<React.SetStateAction<number>>;
// // }

// // const traitColors: Record<string, string> = {
// //   agreeableness: "bg-blue-400",
// //   conscientiousness: "bg-amber-400",
// //   extraversion: "bg-emerald-400",
// //   openness: "bg-sky-400",
// //   neuroticism: "bg-rose-400",
// // };

// // const ExplorePath = ({
// //   careerPath,
// //   explorePath,
// //   setViewState,
// // }: ExplorePathProps) => {
// //   const navigate = useNavigate();

// //   const testObj = careerPath.richRecommendations.find(
// //     (course: any) => course.career === explorePath,
// //   );

// //   const {
// //     agreeableness = 0,
// //     conscientiousness = 0,
// //     extraversion = 0,
// //     openness = 0,
// //     neuroticism = 0,
// //     career = "Career",
// //     // matchScore = 0,
// //     personalityNarrative = "",
// //     positiveTraits = [],
// //     negativeTraits = [],
// //   } = testObj || {};

// //   const personality = [
// //     { key: "Agreeableness", value: agreeableness, id: "agreeableness" },
// //     {
// //       key: "Conscientiousness",
// //       value: conscientiousness,
// //       id: "conscientiousness",
// //     },
// //     { key: "Extraversion", value: extraversion, id: "extraversion" },
// //     { key: "Openness", value: openness, id: "openness" },
// //     { key: "Neuroticism", value: neuroticism, id: "neuroticism" },
// //   ];

// //   const handleClick = () => {
// //     setViewState(1);
// //   };

// //   return (
// //     <div className="w-full mx-auto p-6 space-y-6">
// //       <div className="bg-[#EEF2FF] border border-[#BFDBFE] shadow-sm rounded-2xl p-6">
// //         <div className="flex items-start justify-between gap-4">
// //           <div className="flex-1">
// //             <div className="flex items-center gap-3">
// //               <div className="rounded-full bg-indigo-50 p-3">
// //                 <Sparkles className="w-6 h-6 text-indigo-600" />
// //               </div>
// //               <div>
// //                 <h3 className="text-xl font-semibold text-slate-900">
// //                   Your Career Path
// //                 </h3>
// //                 <p className="text-[15px] font-medium text-[#1E3A8A]">
// //                   {career}
// //                 </p>
// //               </div>
// //             </div>

// //             <div className="mt-4 text-slate-700 text-sm leading-relaxed">
// //               <p>{personalityNarrative}</p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="bg-white border border-[#F3F4F6] rounded-2xl p-6">
// //         <div className="">
// //           <h4 className="text-[20px] font-bold text-[#111827]">
// //             Personality Breakdown
// //           </h4>

// //           <div className="mt-4 grid grid-cols-1 gap-4">
// //             {personality.map((t) => (
// //               <div
// //                 key={t.id}
// //                 className="flex items-center gap-4 border-b last:border-b-0 pb-4"
// //               >
// //                 <div className="w-36 text-[16px] font-semibold text-[#111827]">
// //                   {t.key}
// //                 </div>
// //                 <div className="flex-1">
// //                   <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
// //                     <div
// //                       className={`h-3 rounded-full ${
// //                         traitColors[t.id] || "bg-slate-400"
// //                       }`}
// //                       style={{
// //                         width: `${Math.max(0, Math.min(100, t.value))}%`,
// //                       }}
// //                     />
// //                   </div>
// //                 </div>
// //                 <div className="w-12 text-right text-[14px] font-semi-bold text-[#4A90E2]">
// //                   {t.value}%
// //                 </div>
// //               </div>
// //             ))}
// //           </div>

// //           <div className="mt-6 grid md:grid-cols-2 gap-6">
// //             <div>
// //               <h5 className="text-sm font-semibold text-[#15803D] flex items-center gap-2">
// //                 <CircleCheck className="w-4 h-4 text-[#15803D]" />
// //                 Strengths
// //               </h5>
// //               <ul className="mt-3 space-y-2 text-sm text-slate-600">
// //                 {positiveTraits.length ? (
// //                   positiveTraits.map((p: any, i: number) => (
// //                     <li
// //                       key={i}
// //                       className="flex items-center border border-[#BBF7D0] rounded-md gap-2 bg-[#F0FDF4] h-[60px] px-4"
// //                     >
// //                       <span className="text-[#14532D] text-[12px] font-medium">
// //                         {p}
// //                       </span>
// //                     </li>
// //                   ))
// //                 ) : (
// //                   <li className="text-slate-400">No positives listed</li>
// //                 )}
// //               </ul>
// //             </div>

// //             <div>
// //               <h5 className="text-sm font-semibold text-[#C2410C] flex items-center gap-2">
// //                 <CircleAlert className="w-4 h-4 text-[#EA580C]" />
// //                 Areas for growth
// //               </h5>
// //               <ul className="mt-3 space-y-2 text-sm text-slate-600">
// //                 {negativeTraits.length ? (
// //                   negativeTraits.map((n: any, i: number) => (
// //                     <li
// //                       key={i}
// //                       className="flex items-center border border-[#FED7AA] rounded-md gap-2 bg-[#FFF7ED] h-[60px] px-4"
// //                     >
// //                       <span className="text-[#7C2D12] text-[12px] font-medium">
// //                         {n}
// //                       </span>
// //                     </li>
// //                   ))
// //                 ) : (
// //                   <li className="text-slate-400">No concerns listed</li>
// //                 )}
// //               </ul>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="flex justify-center mt-4 gap-x-[20px]">
// //         <button
// //           onClick={handleClick}
// //           className="h-[40px] bg-[#004085] items-center text-center disabled:opacity-50 hover:bg-blue-800 text-white font-medium py-1 px-5 rounded-lg transition"
// //         >
// //           Get Course Recommendation
// //         </button>

// //         <button
// //           onClick={() => navigate("/career-recommedation")}
// //           className="h-[40px] border border-[#D1D5DB] flex gap-x-[5px] items-center justify-center bg-[white] disabled:opacity-50 text-[#374151] font-medium py-1 px-5 rounded-lg transition"
// //         >
// //           <RotateCcw /> <span className="text-[#374151]">Share</span>
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ExplorePath;
