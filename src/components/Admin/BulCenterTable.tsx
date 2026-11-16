import { FiArrowDown } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
// import { FaRegTrashCan } from "react-icons/fa6";
import fileIcon from "../../assets/IconWrap.svg";
import { ApiResponseItem } from "../../types/school.types";
import BulkCenterModal from "./BulkCenterModal";
import { useState } from "react";

interface Props {
  isLoading: boolean;
  bulkHistory: ApiResponseItem[];
}

export default function BulkCenterTable({ isLoading, bulkHistory }: Props) {
  const [showModal, setShowModal] = useState(false);

  const [previewDetails, setPreviewDetails] = useState<ApiResponseItem>();

  function formatDateTime(dateString: string): string {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const datePart = date.toLocaleDateString("en-US", options);
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${datePart} ${timePart}`;
  }

  const renderStatus = (status: string) => {
    if (status !== "Completed") {
      return (
        <p className="h-[25px] w-[80px] bg-[#FEF3F2] flex justify-center items-center text-[#B42318] text-[12px] border-[1px] border-[#FECDCA] rounded-[20px]">
          Failed
        </p>
      );
    } else {
      return (
        <p className="h-[25px] w-[80px] bg-[#F0F9FF] flex justify-center items-center text-[#026AA2] text-[12px] border-[1px] border-[#B9E6FE] rounded-[20px]">
          Completed
        </p>
      );
    }
  };

  const renderSuccessRecords = (successCount: number) => {
    if (successCount === 0) {
      return <></>;
    }
    return <p className="text-[14px] text-[#067647]">{successCount} Success</p>;
  };
  const renderFailedRecords = (failedCount: number) => {
    if (failedCount === 0) {
      return <></>;
    }
    return <p className="text-[14px] text-[#B42318]">{failedCount} Failed</p>;
  };

  return (
    <>
      {isLoading && (
        <div className="mx-auto w-full flex justify-center items-center h-[500px]">
          <ClipLoader />
        </div>
      )}

      {!isLoading && (
        <div className="w-full min-h-[500px] border-b border-gray-300">
          <table className="at-rtable w-full table-auto space-y-4">
            <thead className="border-b-[0.8px] border-[#EAECF0] p-[20px]">
              <tr>
                <th className="w-[12.5%] p-[10px]">
                  <div className="w-full flex gap-x-[1px] items-center font-semibold text-[12px] text-[#1E1E1E]">
                    File Name <FiArrowDown className="mb-1" />
                  </div>
                </th>
                <th className="w-[12.5%] p-[10px]">
                  <div className="w-full flex gap-x-[4px] items-center font-semibold text-[12px] text-[#1E1E1E]">
                    Update Date <FiArrowDown className="mb-1" />
                  </div>
                </th>
                <th className="w-[12.5%] p-[10px]">
                  <div className="w-full flex gap-x-[4px] items-center font-semibold text-[12px] text-[#1E1E1E]">
                    Action <FiArrowDown className="mb-1" />
                  </div>
                </th>
                <th className="w-[12.5%] p-[10px]">
                  <div className="w-full flex gap-x-[4px] items-center font-semibold text-[12px] text-[#1E1E1E]">
                    Entity <FiArrowDown className="mb-1" />
                  </div>
                </th>
                <th className="w-[12.5%] p-[10px]">
                  <div className="w-full flex gap-x-[4px] items-center font-semibold text-[12px] text-[#1E1E1E]">
                    Status <FiArrowDown className="mb-1" />
                  </div>
                </th>

                <th className="w-[12.5%] p-[10px]">
                  <div className="w-full flex gap-x-[4px] items-center font-semibold text-[12px] text-[#1E1E1E]">
                    Records <FiArrowDown className="mb-1" />
                  </div>
                </th>

                <th className="w-[12.5%] p-[10px]">
                  <div className="w-full flex gap-x-[4px] items-center font-semibold text-[12px] text-[#1E1E1E]">
                    Uploaded By <FiArrowDown className="mb-1" />
                  </div>
                </th>

                <th className="w-[12.5%] p-[10px]">
                  <div className="w-full flex gap-x-[4px] items-center font-semibold text-[12px] text-[#1E1E1E]">
                    Actions <FiArrowDown className="mb-1" />
                  </div>
                </th>
              </tr>
            </thead>

            {bulkHistory.length > 0 && (
              <tbody>
                {bulkHistory.map((item, index) => (
                  <tr
                    className="hover:bg-[#007BFF33] border-b border-gray-300 last:border-b-0"
                    key={index}
                  >
                    <td data-label="File Name" data-primary="" className="p-[10px] text-[14px]">
                      <p>{item.metadata?.fileName}</p>
                    </td>
                    <td data-label="Update Date" className="p-[10px] text-[14px]">
                      <p>{formatDateTime(item.timestamp)}</p>
                    </td>
                    <td data-label="Action" className="p-[10px] text-[14px]">
                      <p>{item.action}</p>
                    </td>
                    <td data-label="Entity" className="p-[10px] text-[14px]">
                      <p>{item.entity}</p>
                    </td>
                    <td data-label="Status" className="p-[10px] text-[14px]">
                      {item.metadata?.failedMessages?.length > 0
                        ? renderStatus("Failed")
                        : renderStatus("Completed")}
                    </td>
                    <td data-label="Records" className="mt-3 p-[10px] text-[14px]">
                      {renderSuccessRecords(item.metadata?.successCount)}
                      {renderFailedRecords(item.metadata?.failedCount)}
                    </td>
                    <td data-label="Uploaded By" className="p-[10px] text-[14px] capitalize">
                      {/* <p>{item.user.username || item.user.firstname || item.user.lastname }</p> */}
                      <p>
                        {item.user?.username ||
                          item.user?.firstname ||
                          item.user?.lastname ||
                          "Unknown user"}
                      </p>
                    </td>
                    <td data-label="Actions" data-actions=""
                      className="p-[10px] text-[14px] cursor-pointer"
                      onClick={() => {
                        setPreviewDetails(item);
                        setShowModal(true);
                      }}
                    >
                      <p className="underline">Details</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {!isLoading && bulkHistory.length === 0 && (
            <div className="flex flex-col justify-center items-center gap-y-[10px] w-full h-[400px]">
              <img src={fileIcon} alt="Not found" />
              <p className="text-[#101828] text-[16px] font-semibold">
                No Bulk Center Created
              </p>
            </div>
          )}
        </div>
      )}

      {showModal && previewDetails && (
        <BulkCenterModal
          setModal={setShowModal}
          previewDetails={previewDetails}
        />
      )}
    </>
  );
}
