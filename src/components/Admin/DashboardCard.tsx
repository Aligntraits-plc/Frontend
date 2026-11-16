import { IoMdArrowUp } from "react-icons/io";
import { IconType } from "react-icons"; // Type for react-icons

interface DashboardCardProps {
  percentType: boolean;
  bgColor: string;
  percentValue: number;
  title: string;
  Icon: IconType;
  value: number
}

const DashboardCard = ({percentType, bgColor, percentValue, title, Icon, value}: DashboardCardProps) => {

  return (
    <div className={`min-h-[133px] w-full min-w-0 rounded-lg border-2 border-gray-300 p-[10px] flex flex-col justify-between`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex gap-x-[10px] items-center">
        <div className="h-[28px] w-[28px] shrink-0 flex items-center justify-center rounded-[50%] bg-[#FAFAFA] border-[2px] border-[#E6E6E6]">
          <Icon/>
        </div>
        <p className="text-[#737373] text-[14px]">{title}</p>
      </div>

      <p className="text-[#1E1E1E] text-[30px] font-medium">{value}</p>

      <div className="flex flex-row flex-wrap gap-x-[10px] gap-y-1 items-center">
        <div className={`flex flex-row gap-x-[5px] 
          items-center rounded-lg px-[5px] ${percentType ? 'bg-[#ECFDF3] text-[#199E50]' : 'bg-[#FEF3F2] text-[#940803]'}`}>
          <IoMdArrowUp />
          <p>{percentValue}%</p>
        </div>
        <p className={"text-[#999999] text-[12px]"}>vs yesterday</p>
      </div>
    </div>
  )
}

export default DashboardCard