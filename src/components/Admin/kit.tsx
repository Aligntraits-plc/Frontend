import type { ReactNode } from "react";
import { BeatLoader } from "react-spinners";

/* Small building blocks shared by the admin pages, in the admin panel's look. */

export const Page = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col w-full gap-6 p-4 sm:p-5 xl:p-6 max-w-[1200px]">{children}</div>
);

export const PageHead = ({ title, intro, actions }: { title: string; intro?: ReactNode; actions?: ReactNode }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-[20px] sm:text-[22px] font-bold text-[#101828]">{title}</h1>
      {intro && <p className="mt-1 text-[14px] leading-[22px] text-[#475467] max-w-[680px]">{intro}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <section className={`rounded-2xl border border-[#EAECF0] bg-white p-4 sm:p-5 ${className}`}>{children}</section>
);

export const CardTitle = ({ children, hint }: { children: ReactNode; hint?: ReactNode }) => (
  <div className="mb-4">
    <h2 className="text-[16px] font-semibold text-[#101828]">{children}</h2>
    {hint && <p className="mt-1 text-[13px] leading-[20px] text-[#667085]">{hint}</p>}
  </div>
);

export const inputClass =
  "h-11 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-[15px] font-normal text-[#101828] focus:border-[#004085] focus:outline-none focus:ring-2 focus:ring-[#004085]/15";

export const Field = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
  <label className="flex min-w-0 flex-col gap-1.5 text-[14px] font-medium text-[#344054]">
    {label}
    {children}
    {hint && <span className="text-[12px] font-normal text-[#667085]">{hint}</span>}
  </label>
);

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  tone?: "primary" | "secondary" | "danger" | "ghost";
  busy?: boolean;
  disabled?: boolean;
  small?: boolean;
  label?: string;
};
export const Btn = ({ children, onClick, type = "button", tone = "primary", busy, disabled, small, label }: BtnProps) => {
  const tones = {
    primary: "bg-[#004085] text-white hover:bg-[#003369] border border-[#004085]",
    secondary: "bg-white text-[#344054] border border-[#D0D5DD] hover:bg-[#F9FAFB]",
    danger: "bg-white text-[#B42318] border border-[#FDA29B] hover:bg-[#FEF3F2]",
    ghost: "bg-transparent text-[#004085] border border-transparent hover:bg-[#EEF4FF]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        small ? "h-9 px-3 text-[13px]" : "h-11 px-4 text-[14px]"
      } ${tones[tone]}`}
    >
      {busy ? <BeatLoader size={7} color={tone === "primary" ? "#FFFFFF" : "#004085"} /> : children}
    </button>
  );
};

const PILL: Record<string, string> = {
  green: "bg-[#ECFDF3] text-[#067647]",
  amber: "bg-[#FFFAEB] text-[#B54708]",
  grey: "bg-[#F2F4F7] text-[#475467]",
  red: "bg-[#FEF3F2] text-[#B42318]",
  blue: "bg-[#EFF8FF] text-[#175CD3]",
  navy: "bg-[#004085] text-white",
  gold: "bg-[#FEF6DD] text-[#7A5A00]",
};
export const Pill = ({ children, tone = "grey" }: { children: ReactNode; tone?: keyof typeof PILL }) => (
  <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${PILL[tone]}`}>{children}</span>
);

export const Empty = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="rounded-xl border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-4 py-8 text-center">
    <p className="text-[15px] font-semibold text-[#101828]">{title}</p>
    {children && <div className="mx-auto mt-1 max-w-[460px] text-[14px] leading-[22px] text-[#667085]">{children}</div>}
  </div>
);

export const Loading = () => (
  <div className="flex justify-center py-12" role="status" aria-label="Loading">
    <BeatLoader size={10} color="#004085" />
  </div>
);

export const ErrorNote = ({ children }: { children: ReactNode }) =>
  children ? (
    <p role="alert" className="text-[14px] text-[#B42318]">
      {children}
    </p>
  ) : null;

export function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist">
      {items.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[14px] font-semibold transition-colors ${
            value === t.value ? "bg-[#004085] text-white" : "bg-white text-[#475467] border border-[#EAECF0] hover:bg-[#F9FAFB]"
          }`}
        >
          {t.label}
          {t.count ? (
            <span className={`rounded-full px-1.5 text-[12px] ${value === t.value ? "bg-[#F6C648] text-[#002650]" : "bg-[#F6C648] text-[#002650]"}`}>{t.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
