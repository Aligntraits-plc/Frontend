import { useEffect, useState, type FormEvent } from "react";
import { FiCopy } from "react-icons/fi";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import {
  createSchoolCode,
  getSchoolCodes,
  setSchoolCodeActive,
  type SchoolCode,
} from "../../services/utils";

const STATUS: Record<SchoolCode["status"], { label: string; className: string }> = {
  active: { label: "Active", className: "bg-[#E0FFF0] text-[#067647]" },
  full: { label: "Full", className: "bg-[#FEF0C7] text-[#93370D]" },
  expired: { label: "Expired", className: "bg-[#F2F4F7] text-[#475467]" },
  off: { label: "Switched off", className: "bg-[#FEE4E2] text-[#B42318]" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// Admin panel > School codes. A code lets up to N students (20 by default) of a
// partner school use AlignTraits without paying, for 30 days from creation.
export default function SchoolCodes() {
  const [codes, setCodes] = useState<SchoolCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [seats, setSeats] = useState("20");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [justCreated, setJustCreated] = useState<SchoolCode | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCodes(await getSchoolCodes());
      } catch (err: any) {
        setLoadError(
          err?.response?.status === 403
            ? "Only admins can manage school codes."
            : "We could not load the school codes. Refresh the page to try again."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Copied ${code}`);
    } catch {
      toast.info(`The code is ${code}`);
    }
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    const name = schoolName.trim();
    const seatCount = Number(seats);
    if (name.length < 2) return setFormError("Enter the school name.");
    if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 500) {
      return setFormError("Students must be a whole number from 1 to 500.");
    }
    setFormError("");
    setCreating(true);
    try {
      const created = await createSchoolCode({ schoolName: name, seats: seatCount });
      setCodes((prev) => [created, ...prev]);
      setJustCreated(created);
      setSchoolName("");
      setSeats("20");
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "We could not create the code. Try again.");
    } finally {
      setCreating(false);
    }
  };

  const toggle = async (code: SchoolCode) => {
    setBusyId(code.id);
    try {
      const updated = await setSchoolCodeActive(code.id, !code.active);
      setCodes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(updated.active ? `${updated.code} switched on` : `${updated.code} switched off`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "We could not update the code.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 p-4 sm:p-5 xl:p-6">
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-bold text-[#101828]">School codes</h1>
        <p className="mt-1 text-[14px] text-[#475467] max-w-[640px]">
          Each code lets students of a partner school use every AlignTraits feature without paying. A code works for 30 days
          from today and for up to the number of students you set. Switching a code off stops new students; students who
          already used it keep access until it ends.
        </p>
      </div>

      <form onSubmit={onCreate} className="rounded-2xl border border-[#EAECF0] bg-white p-4 sm:p-5" noValidate>
        <h2 className="text-[16px] font-semibold text-[#101828]">Create a code</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px_auto] sm:items-end">
          <label className="flex flex-col gap-1.5 text-[14px] font-medium text-[#344054]">
            School name
            <input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Queen's College, Yaba"
              maxLength={120}
              className="h-11 rounded-lg border border-[#D0D5DD] px-3 text-[15px] font-normal focus:border-[#004085] focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[14px] font-medium text-[#344054]">
            Students
            <input
              value={seats}
              onChange={(e) => setSeats(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className="h-11 rounded-lg border border-[#D0D5DD] px-3 text-[15px] font-normal focus:border-[#004085] focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={creating}
            className="h-11 rounded-lg bg-[#004085] px-5 text-[15px] font-semibold text-white hover:bg-[#003366] disabled:opacity-60"
          >
            {creating ? <BeatLoader size={8} color="#FFFFFF" /> : "Create code"}
          </button>
        </div>
        {formError && (
          <p role="alert" className="mt-3 text-[14px] text-[#B42318]">
            {formError}
          </p>
        )}

        {justCreated && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-[#FFFBF0] border border-[#F6C648] p-4">
            <div className="flex-1 min-w-[200px]">
              <p className="text-[13px] text-[#6B4A00]">New code for {justCreated.schoolName}</p>
              <p className="mt-1 font-mono text-[26px] font-bold tracking-[0.2em] text-[#101828]">{justCreated.code}</p>
              <p className="text-[13px] text-[#475467]">
                {justCreated.seats} students · works until {formatDate(justCreated.expiresAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copy(justCreated.code)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-4 h-11 text-[14px] font-semibold text-[#344054]"
            >
              <FiCopy aria-hidden="true" /> Copy code
            </button>
          </div>
        )}
      </form>

      <section className="rounded-2xl border border-[#EAECF0] bg-white">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-[#EAECF0]">
          <h2 className="text-[16px] font-semibold text-[#101828]">All codes</h2>
          <span className="text-[13px] text-[#667085]">{codes.length} total</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <BeatLoader size={10} color="#004085" />
          </div>
        ) : loadError ? (
          <p className="px-5 py-8 text-[14px] text-[#B42318]">{loadError}</p>
        ) : codes.length === 0 ? (
          <p className="px-5 py-8 text-[14px] text-[#475467]">
            No codes yet. Create one above when a school joins.
          </p>
        ) : (
          <>
            {/* Phones: one card per code */}
            <ul className="md:hidden divide-y divide-[#EAECF0]">
              {codes.map((c) => (
                <li key={c.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => copy(c.code)}
                      className="font-mono text-[18px] font-bold tracking-[0.15em] text-[#101828]"
                      aria-label={`Copy code ${c.code}`}
                    >
                      {c.code}
                    </button>
                    <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${STATUS[c.status].className}`}>
                      {STATUS[c.status].label}
                    </span>
                  </div>
                  <p className="mt-1 text-[14px] text-[#344054]">{c.schoolName}</p>
                  <p className="mt-1 text-[13px] text-[#667085]">
                    {c.used} of {c.seats} students · ends {formatDate(c.expiresAt)}
                    {c.daysLeft > 0 ? ` (${c.daysLeft} days left)` : ""}
                  </p>
                  {c.status !== "expired" && (
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => toggle(c)}
                      className="mt-3 h-10 rounded-lg border border-[#D0D5DD] px-4 text-[14px] font-semibold text-[#344054] disabled:opacity-60"
                    >
                      {c.active ? "Switch off" : "Switch on"}
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {/* Larger screens: a table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#F9FAFB] text-[12px] uppercase tracking-wide text-[#667085]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Code</th>
                    <th className="px-5 py-3 font-semibold">School</th>
                    <th className="px-5 py-3 font-semibold">Students</th>
                    <th className="px-5 py-3 font-semibold">Ends</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECF0]">
                  {codes.map((c) => (
                    <tr key={c.id}>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => copy(c.code)}
                          className="inline-flex items-center gap-2 font-mono text-[15px] font-bold tracking-[0.15em] text-[#101828]"
                          aria-label={`Copy code ${c.code}`}
                        >
                          {c.code} <FiCopy className="text-[#667085]" aria-hidden="true" />
                        </button>
                      </td>
                      <td className="px-5 py-3 text-[#344054]">{c.schoolName}</td>
                      <td className="px-5 py-3 text-[#344054]">
                        {c.used} of {c.seats}
                      </td>
                      <td className="px-5 py-3 text-[#344054]">
                        {formatDate(c.expiresAt)}
                        {c.daysLeft > 0 && <span className="text-[#667085]"> · {c.daysLeft} days left</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${STATUS[c.status].className}`}>
                          {STATUS[c.status].label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {c.status !== "expired" && (
                          <button
                            type="button"
                            disabled={busyId === c.id}
                            onClick={() => toggle(c)}
                            className="h-9 rounded-lg border border-[#D0D5DD] px-3 text-[13px] font-semibold text-[#344054] hover:bg-[#F9FAFB] disabled:opacity-60"
                          >
                            {c.active ? "Switch off" : "Switch on"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
