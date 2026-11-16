import React from "react";
import { FiStar,  FiTrash2 } from "react-icons/fi";
// import { Form } from "../../pages/admin/CreateCourse";
import { Course } from "../../types/course.types";

interface EditCourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  schoolLogo: string;
  schoolName: string;
}

export const EditCourseCard: React.FC<EditCourseCardProps> = ({
  course,
  onEdit,
  onDelete,
  schoolLogo,
  schoolName,
}) => {
  // const formatPrice = (price: number) => {
  //   return `$${price.toLocaleString()}`;
  // };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar
          key={`star-${i}`}
          className="w-4 h-4 text-yellow-400 fill-current"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative">
          <FiStar className="w-4 h-4 text-gray-300 fill-current" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
          </div>
        </div>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FiStar
          key={`empty-star-${i}`}
          className="w-4 h-4 text-gray-300 fill-current"
        />
      );
    }

    return stars;
  };

  return (
    <div className="flex flex-col bg-white border rounded-lg hover:border-[#00408540] transition-shadow p-3 min-w-0">
      <div className="h-36 rounded-lg bg-[#F2F4F7] overflow-hidden">
        {course.profile ? (
          <img
            src={course.profile as string}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : null}
      </div>

      <div className="space-y-4 basis-[50%]">
        <div className="py-5">
          <h3 className="text-[17.06px] font-semibold text-[#333333]">
            {course.title}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center space-x-2 min-w-0">
            {schoolLogo ? <img src={schoolLogo} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : null}
            <p className="text-[13.83px] text-[#101828] font-medium capitalize truncate">
              {schoolName}
            </p>
          </div>

          <span className="text-[13.83px] text-[#101828] font-medium whitespace-nowrap">
            {["NAIRA", "NGN"].includes(String(course.currency || "").toUpperCase()) ? "₦" : "$"}{Number(course.price || 0).toLocaleString()}
          </span>
        </div>

        <div className="mt-2 flex justify-between items-center w-full">
          <div className="flex items-center">
            <span className="text-[14px] font-[500] text-[#004085]">
              {course.rating}
            </span>
            <div className="flex">{renderStars(course.rating || 0)}</div>
          </div>
          <div>
            <p className="text-[14px] font-[600] text-[#004085] item-end text-end w-full">
              {course.scholarship} Scholarship
            </p>
          </div>
        </div>

        <div className="flex  justify-between gap-2 mt-2 w-full">
          <button
            onClick={() => onEdit?.(course)}
            className="flex-1 py-2 px-4 bg-[#004085] text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete?.(course)}
            className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
