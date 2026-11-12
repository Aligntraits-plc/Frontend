import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import {
  closeReportedChat,
  errorMessage,
  listReportedChats,
  listRequests,
  markRequestsSeen,
  setRequestStatus,
  shortDate,
  type ReportedChat,
  type RequestItem,
  type RequestKind,
} from "../../services/roles";
import { Btn, Card, Empty, ErrorNote, inputClass, Loading, Page, PageHead, Pill, Tabs } from "../../components/Admin/kit";
import { refreshRequests, useRequestsSummary } from "../../components/Admin/requestsStore";

type Tab = RequestKind | "events" | "chats";
const STATUS_LABEL = (s: string) => s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const waLink = (n?: string) => (n ? `https://wa.me/${n.replace(/[^\d]/g, "")}` : "");

/* Requests: school partnerships, ambassador applications, loan interest, schools
   students asked us to invite, event suggestions to approve, and reported chats. */
export default function Requests() {
  const summary = useRequestsSummary(true);
  const [tab, setTab] = useState<Tab>("school");
  const [items, setItems] = useState<RequestItem[] | null>(null);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [chats, setChats] = useState<ReportedChat[] | null>(null);
  const [error, setError] = useState("");
  // Counts from when the page opened, so the tabs still show what was new.
  const [opened] = useState(() => summary);
  const newCounts = opened?.new || summary?.new;

  useEffect(() => {
    // Opening Requests clears the badge for this admin.
    markRequestsSeen().then(refreshRequests).catch(() => undefined);
  }, []);

  useEffect(() => {
    setError("");
    if (tab === "events") return;
    if (tab === "chats") {
      setChats(null);
      listReportedChats().then(setChats).catch((err) => setError(errorMessage(err)));
      return;
    }
    setItems(null);
    listRequests(tab)
      .then((r) => {
        setItems(r.items);
        setStatuses(r.statuses);
      })
      .catch((err) => setError(errorMessage(err)));
  }, [tab]);

  const onStatus = async (item: RequestItem, status: string) => {
    try {
      await setRequestStatus(tab as RequestKind, item.id, status);
      setItems((prev) => prev?.map((i) => (i.id === item.id ? { ...i, status } : i)) || null);
      toast.success("Status saved");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const onClose = async (c: ReportedChat) => {
    try {
      await closeReportedChat(c.id);
      setChats((prev) => prev?.filter((x) => x.id !== c.id) || null);
      refreshRequests();
      toast.success("Report closed. The chat stays blocked.");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Page>
      <PageHead title="Requests" intro="Everything people have asked AlignTraits for. New items are marked until you have seen them." />
      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { value: "school", label: "School partnerships", count: newCounts?.school },
          { value: "ambassador", label: "Ambassador applications", count: newCounts?.ambassador },
          { value: "loan", label: "Loan interest", count: newCounts?.loan },
          { value: "listing", label: "Schools to invite", count: newCounts?.listing },
          { value: "events", label: "Events to approve", count: summary?.eventsToApprove },
          { value: "chats", label: "Reported chats", count: summary?.chatsReported },
        ]}
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      {tab === "events" ? (
        <Card>
          {summary?.eventsToApprove ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[15px] text-[#344054]">
                {summary.eventsToApprove} {summary.eventsToApprove === 1 ? "event suggested by an ambassador is" : "events suggested by ambassadors are"} waiting. Students see them only after you approve.
              </p>
              <Link to="/admin/community?tab=events&show=drafts" className="inline-flex h-11 items-center rounded-lg bg-[#004085] px-4 text-[14px] font-semibold text-white">
                Review events
              </Link>
            </div>
          ) : (
            <Empty title="Nothing to approve">Events ambassadors suggest appear here.</Empty>
          )}
        </Card>
      ) : tab === "chats" ? (
        !chats ? (
          <Loading />
        ) : chats.length === 0 ? (
          <Empty title="No reported chats">When a student reports a private chat, it appears here with the last messages.</Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {chats.map((c) => (
              <Card key={c.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[15px] font-semibold text-[#101828]">
                      {c.reportedBy.name} reported a chat with {c.other.name}
                    </p>
                    <p className="text-[13px] text-[#667085]">
                      {shortDate(c.reportedAt)} · {c.reportedBy.email} · {c.other.email}
                    </p>
                    {c.reason && <p className="mt-1 text-[14px] text-[#344054]">“{c.reason}”</p>}
                  </div>
                  <Btn small tone="secondary" onClick={() => onClose(c)}>
                    Close report
                  </Btn>
                </div>
                <ol className="mt-3 flex max-h-[280px] flex-col gap-2 overflow-y-auto rounded-lg bg-[#F9FAFB] p-3">
                  {c.messages.length === 0 && <li className="text-[14px] text-[#667085]">No messages.</li>}
                  {c.messages.map((m) => (
                    <li key={m.id} className="text-[14px] text-[#344054]">
                      <span className="font-semibold">{m.from}:</span> {m.body}
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-[12px] text-[#667085]">The chat is blocked, so neither student can send more. To pause someone's posting everywhere, use Community, Reports.</p>
              </Card>
            ))}
          </div>
        )
      ) : !items ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty title="Nothing here yet" />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((i) => (
            <Card key={i.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold text-[#101828]">{i.title}</p>
                    {i.isNew && <Pill tone="gold">New</Pill>}
                    {i.under18 && <Pill tone="amber">Under 18</Pill>}
                  </div>
                  <p className="text-[13px] text-[#667085]">
                    {i.subtitle} · {shortDate(i.createdAt)}
                  </p>
                  {i.fields.length > 0 && (
                    <dl className="mt-3 grid gap-x-6 gap-y-1 text-[14px] sm:grid-cols-[160px_1fr]">
                      {i.fields.map(([k, v]) => (
                        <div key={k} className="contents">
                          <dt className="text-[#667085]">{k}</dt>
                          <dd className="break-words text-[#344054]">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
                  {statuses.length > 0 && i.status && (
                    <select aria-label="Status" className={`${inputClass} !h-9 !w-auto !text-[14px]`} value={i.status} onChange={(e) => onStatus(i, e.target.value)}>
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL(s)}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="flex gap-2">
                    {i.whatsapp && (
                      <a href={waLink(i.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#D0D5DD] px-3 text-[13px] font-semibold text-[#067647]">
                        <FaWhatsapp aria-hidden="true" /> WhatsApp
                      </a>
                    )}
                    {i.email && (
                      <a href={`mailto:${i.email}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#D0D5DD] px-3 text-[13px] font-semibold text-[#004085]">
                        <FiMail aria-hidden="true" /> Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
