import { useEffect, useState } from "react";
import { CalendarPlus, MapPin, Video } from "lucide-react";
import { errorMessage, getEvents, type CommunityEvent } from "../../services/community";
import { dayMedium, eventPhase, googleCalendarUrl, KIND, placeLabel, timeRange } from "../../components/community/eventUtils";
import { Empty, Loading, Pill } from "../../components/Admin/kit";

/* Events: exam windows, admission deadlines and AlignTraits sessions your students can see. */
export default function PortalEvents() {
  const [events, setEvents] = useState<CommunityEvent[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getEvents({ from: new Date(Date.now() - 24 * 3600 * 1000).toISOString() })
      .then((r) => setEvents(r.events.filter((e) => e.status !== "CANCELLED" && eventPhase(e) !== "ended")))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <p className="text-[14px] text-[#B42318]">{error}</p>;
  if (!events) return <Loading />;
  return (
    <div className="mx-auto max-w-[880px]">
      <h1 className="text-[22px] font-bold text-[#002650]">Coming up</h1>
      <p className="mt-1 text-[14px] text-[#475467]">Exam windows, admission deadlines and AlignTraits sessions. Your students see the same list in Community.</p>
      {events.length === 0 ? (
        <div className="mt-5">
          <Empty title="Nothing coming up yet" />
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {events.map((e) => (
            <li key={e.id} className="flex gap-4 rounded-2xl border border-[#E4E9F0] bg-white p-4">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#F2F5F9] text-center">
                <span className="text-[18px] font-bold leading-none text-[#002650]">{new Date(e.startsAt).toLocaleDateString("en-GB", { day: "2-digit", timeZone: "Africa/Lagos" })}</span>
                <span className="text-[12px] text-[#667085]">{new Date(e.startsAt).toLocaleDateString("en-GB", { month: "short", timeZone: "Africa/Lagos" })}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={e.kind === "DEADLINE" ? "red" : e.kind === "EXAM" ? "gold" : "blue"}>{KIND[e.kind].label}</Pill>
                  <span className="text-[12px] text-[#667085]">{dayMedium(e.startsAt)} · {timeRange(e)}</span>
                </div>
                <p className="mt-1 text-[15px] font-semibold text-[#101828]">{e.title}</p>
                <p className="flex items-center gap-1 text-[13px] text-[#667085]">
                  {e.format === "ONLINE" ? <Video size={13} aria-hidden="true" /> : <MapPin size={13} aria-hidden="true" />}
                  {placeLabel(e)}
                </p>
              </div>
              <a
                href={googleCalendarUrl(e)}
                target="_blank"
                rel="noopener noreferrer"
                className="self-center rounded-lg border border-[#D0D5DD] p-2 text-[#344054] hover:bg-[#F9FAFB]"
                aria-label={`Add ${e.title} to Google Calendar`}
              >
                <CalendarPlus size={18} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
