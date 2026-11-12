import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";
import { deleteMessage, errorMessage, getMessages, postMessage, type ChannelMessage } from "../../services/community";
import { Avatar, Composer, DayDivider, MessageText, msgTime, useStickToBottom } from "../../components/community/ChatParts";
import NameTag, { avatarClassFor } from "../../components/community/NameTag";
import { dayKey } from "../../components/community/eventUtils";
import { Loading } from "../../components/Admin/kit";
import { usePortal } from "./PortalContext";

const POLL_MS = 5000;

/* The school's private channel: only its students and counsellors can see it.
   Counsellors can remove any message here. */
export default function SchoolChannel() {
  const { overview } = usePortal();
  const slug = overview?.channelSlug;
  const [messages, setMessages] = useState<ChannelMessage[] | null>(null);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const last = useRef<string | null>(null);
  const { ref, onScroll, toBottom, showNew } = useStickToBottom(messages?.length ?? 0);

  const merge = (incoming: ChannelMessage[], removed: string[] = []) =>
    setMessages((prev) => {
      const map = new Map((prev || []).map((m) => [m.id, m]));
      for (const m of incoming) map.set(m.id, m);
      for (const id of removed) map.delete(id);
      return Array.from(map.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    });

  const poll = useCallback(async () => {
    if (!slug) return;
    try {
      const page = await getMessages(slug, last.current ? { after: last.current } : {});
      last.current = page.serverTime;
      merge(page.messages, page.removed);
    } catch (err) {
      if (!last.current) setError(errorMessage(err));
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    poll();
    const t = setInterval(() => document.visibilityState === "visible" && poll(), POLL_MS);
    return () => clearInterval(t);
  }, [slug, poll]);

  const send = async (body: string) => {
    if (!slug) return false;
    setSendError("");
    try {
      const m = await postMessage(slug, body);
      merge([m]);
      requestAnimationFrame(() => toBottom(true));
      return true;
    } catch (err) {
      setSendError(errorMessage(err));
      return false;
    }
  };

  const remove = async (m: ChannelMessage) => {
    try {
      await deleteMessage(m.id);
      merge([], [m.id]);
      toast.success("Message removed");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (!overview) return <Loading />;
  if (!slug) return <p className="text-[14px] text-[#475467]">Your school channel is being set up. Refresh in a moment.</p>;

  return (
    <div className="mx-auto flex h-[calc(100vh-170px)] min-h-[460px] max-w-[880px] flex-col overflow-hidden rounded-2xl border border-[#E4E9F0] bg-white">
      <div className="border-b border-[#E4E9F0] px-4 py-3 sm:px-5">
        <h1 className="text-[17px] font-bold text-[#002650]"># {overview.school.name}</h1>
        <p className="text-[13px] text-[#667085]">Private to your school. Only your students and counsellors can see this channel. Students see your school's name next to your messages.</p>
      </div>
      <div ref={ref} onScroll={onScroll} className="relative flex-1 overflow-y-auto px-3 py-4 sm:px-5" aria-live="polite">
        {error ? (
          <p className="text-[14px] text-[#B42318]">{error}</p>
        ) : !messages ? (
          <Loading />
        ) : messages.length === 0 ? (
          <div className="mx-auto mt-10 max-w-[420px] text-center">
            <p className="text-[16px] font-semibold text-[#101828]">Start the conversation</p>
            <p className="mt-1 text-[14px] text-[#667085]">Share a reminder, a deadline or a career day. Your students see it in Community.</p>
          </div>
        ) : (
          <ol className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <li key={m.id}>
                {(i === 0 || dayKey(messages[i - 1].createdAt) !== dayKey(m.createdAt)) && <DayDivider iso={m.createdAt} />}
                <div className="group flex gap-3">
                  <Avatar initials={m.author.initials} staff={m.author.staff} extraClass={avatarClassFor(m.author.badge, m.author.staff)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-[#101828]">{m.author.name}</span>
                      <NameTag badge={m.author.badge} staff={m.author.staff} />
                      <span className="text-[12px] text-[#98A2B3]">{msgTime(m.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => remove(m)}
                        className="ml-auto rounded p-1 text-[#98A2B3] opacity-100 hover:bg-[#FEF3F2] hover:text-[#B42318] sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                        aria-label={`Remove ${m.author.name}'s message`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="text-[15px] text-[#344054]">
                      <MessageText body={m.body} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
        {showNew && (
          <button type="button" onClick={() => toBottom(true)} className="sticky bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#004085] px-4 py-1.5 text-[13px] font-semibold text-white shadow">
            New messages
          </button>
        )}
      </div>
      <div className="border-t border-[#E4E9F0] p-3">
        <Composer placeholder={`Message ${overview.school.name}`} onSend={send} error={sendError} />
      </div>
    </div>
  );
}
