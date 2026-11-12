import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, School, Search } from "lucide-react";
import { CLASS_LEVELS, schoolNotListed, schoolOptions, setMySchool, type SchoolOption } from "../../services/roles";

export type SchoolChoice =
  | { mode: "none" }
  | { mode: "school"; school: SchoolOption; classLevel: string; consent: boolean }
  | { mode: "notListed"; schoolName: string; schoolEmail: string };

const NOT_LISTED = "__not_listed__";
const field = "h-11 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-[15px] text-[#101828] focus:border-[#004085] focus:outline-none focus:ring-2 focus:ring-[#004085]/15";

/** Checks a choice before saving. Returns a message, or "" when it is fine. */
export function schoolChoiceProblem(c: SchoolChoice) {
  if (c.mode === "school" && !c.consent) return "Tick the box to confirm your school can see your results, or clear the school.";
  if (c.mode === "notListed") {
    if (c.schoolName.trim().length < 2) return "Enter the name of your school.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.schoolEmail.trim())) return "Enter your school's email address so we can invite them.";
  }
  return "";
}

/** Saves a choice: links the student to the school, or asks us to invite their school. */
export async function saveSchoolChoice(c: SchoolChoice) {
  if (c.mode === "school") return (await setMySchool({ schoolId: c.school.id, consent: c.consent, classLevel: c.classLevel })).message;
  if (c.mode === "notListed") return (await schoolNotListed({ schoolName: c.schoolName.trim(), schoolEmail: c.schoolEmail.trim() })).message;
  return "";
}

/* Pick your secondary school from a searchable list, or say it isn't listed and give
   the school's email so we can invite them. Optional everywhere it is used. */
export default function SchoolPicker({ value, onChange, preselectId }: { value: SchoolChoice; onChange: (c: SchoolChoice) => void; preselectId?: string | null }) {
  const [options, setOptions] = useState<SchoolOption[] | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    schoolOptions()
      .then((list) => {
        setOptions(list);
        const pre = preselectId ? list.find((s) => s.id === preselectId) : null;
        if (pre && value.mode === "none") onChange({ mode: "school", school: pre, classLevel: "SS3", consent: false });
      })
      .catch(() => setOptions([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (options || []).filter((s) => !q || s.name.toLowerCase().includes(q)).slice(0, 50);
  }, [options, query]);
  const items = [...shown.map((s) => ({ id: s.id, label: s.name, sub: s.state })), { id: NOT_LISTED, label: "My school is not listed", sub: null }];

  const pick = (id: string) => {
    setOpen(false);
    setQuery("");
    if (id === NOT_LISTED) return onChange({ mode: "notListed", schoolName: "", schoolEmail: "" });
    const s = options?.find((x) => x.id === id);
    if (s) onChange({ mode: "school", school: s, classLevel: value.mode === "school" ? value.classLevel : "SS3", consent: false });
  };

  const label = value.mode === "school" ? value.school.name : value.mode === "notListed" ? "My school is not listed" : "";

  return (
    <div className="flex flex-col gap-3">
      <div ref={box} className="relative">
        <label className="mb-1.5 block text-[14px] font-medium text-[#344054]" htmlFor={`${listId}-input`}>
          Your secondary school <span className="font-normal text-[#667085]">(optional)</span>
        </label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" aria-hidden="true" />
          <input
            id={`${listId}-input`}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            className={`${field} pl-9 pr-9`}
            placeholder={label || "Search for your school"}
            value={open ? query : label}
            onFocus={() => {
              setOpen(true);
              setQuery("");
              setActive(0);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(items.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === "Enter" && open) {
                e.preventDefault();
                pick(items[active].id);
              } else if (e.key === "Escape") setOpen(false);
            }}
          />
          <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]" aria-hidden="true" />
        </div>
        {open && (
          <ul id={listId} role="listbox" className="absolute z-30 mt-1 max-h-[280px] w-full overflow-y-auto rounded-xl border border-[#E4E9F0] bg-white py-1 shadow-lg">
            {options === null && <li className="px-3 py-2 text-[14px] text-[#667085]">Loading schools...</li>}
            {items.map((it, i) => (
              <li
                key={it.id}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(it.id);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2.5 text-[14px] ${i === active ? "bg-[#EEF4FF]" : ""} ${
                  it.id === NOT_LISTED ? "border-t border-[#F2F4F7] font-semibold text-[#004085]" : "text-[#101828]"
                }`}
              >
                {it.id !== NOT_LISTED && <School size={15} className="shrink-0 text-[#98A2B3]" aria-hidden="true" />}
                <span className="min-w-0 flex-1 truncate">{it.label}</span>
                {it.sub && <span className="shrink-0 text-[12px] text-[#667085]">{it.sub}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {value.mode === "school" && (
        <>
          <label className="flex flex-col gap-1.5 text-[14px] font-medium text-[#344054]">
            Your class
            <select className={field} value={value.classLevel} onChange={(e) => onChange({ ...value, classLevel: e.target.value })}>
              {CLASS_LEVELS.map((c) => (
                <option key={c} value={c}>
                  {c === "Finished" ? "Finished secondary school" : c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#F5F8FF] p-3 text-[14px] leading-[21px] text-[#344054]">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#004085]"
              checked={value.consent}
              onChange={(e) => onChange({ ...value, consent: e.target.checked })}
            />
            <span>
              I understand that <strong>{value.school.name}</strong> can see my survey results and recommendations, so my counsellor can guide me. I can remove my school at any
              time.
            </span>
          </label>
          <button type="button" className="self-start text-[13px] font-semibold text-[#667085] underline" onClick={() => onChange({ mode: "none" })}>
            Clear school
          </button>
        </>
      )}

      {value.mode === "notListed" && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#E4E9F0] p-3">
          <p className="text-[14px] text-[#475467]">Tell us your school's name and email address, and we'll invite them to AlignTraits.</p>
          <label className="flex flex-col gap-1.5 text-[14px] font-medium text-[#344054]">
            School name
            <input className={field} value={value.schoolName} maxLength={120} onChange={(e) => onChange({ ...value, schoolName: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5 text-[14px] font-medium text-[#344054]">
            School email address
            <input className={field} type="email" value={value.schoolEmail} onChange={(e) => onChange({ ...value, schoolEmail: e.target.value })} placeholder="info@yourschool.edu.ng" />
          </label>
          <button type="button" className="self-start text-[13px] font-semibold text-[#667085] underline" onClick={() => onChange({ mode: "none" })}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
