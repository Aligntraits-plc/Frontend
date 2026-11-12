import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowDown, ArrowLeft, Flag, Lock, MoreVertical, ShieldOff } from "lucide-react";
import { blockThread, errorMessage, reportThread, respondToInvite, sendDirect, threadMessages, type DirectMessage, type Person } from "../../services/roles";
import { refreshCommunitySummary } from "./summaryStore";
import { useCommunity } from "./CommunityContext";
import { Avatar, Composer, DayDivider, MessageText, msgTime, useStickToBottom } from "./ChatParts";
import NameTag from "./NameTag";
import { dayKey } from "./eventUtils";
import c from "./Chat.module.css";
import ui from "./ui.module.css";

type Msg = DirectMessage & { pending?: boolean };
type ThreadInfo = { id: string; status: "sent" | "received" | "accepted"; with: Person; canSend: boolean; readOnlyReason: string | null };
const POLL_MS = 4000;

/* A private chat between two classmates. */
export default function DirectChat() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { me } = useCommunity();
  const [thread, setThread] = useState<ThreadInfo | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");
  const newest = useRef<string>("");
  const stick = useStickToBottom(msgs[msgs.length - 1]?.id ?? status);

  const load = () => {
    setStatus("loading");
    threadMessages(id)
      .then((r) => {
        setThread(r.thread);
        setMsgs(r.messages);
        newest.current = r.serverTime;
        setStatus("ready");
        refreshCommunitySummary();
      })
      .catch(() => setStatus("error"));
  };
  useEffect(load, [id]);

  useEffect(() => {
    if (status !== "ready" || thread?.status !== "accepted") return;
    const t = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const r = await threadMessages(id, newest.current);
        newest.current = r.serverTime;
        setThread(r.thread);
        if (r.messages.length) {
          setMsgs((prev) => {
            const have = new Set(prev.map((m) => m.id));
            const fresh = r.messages.filter((m) => !have.has(m.id));
            return fresh.length ? [...prev, ...fresh] : prev;
          });
        }
      } catch {
        /* try again next tick */
      }
    }, POLL_MS);
    return () => clearInterval(t);
  }, [status, thread?.status, id]);

  const send = async (body: string) => {
    setError("");
    const temp: Msg = { id: `tmp-${Date.now()}`, body, mine: true, createdAt: new Date().toISOString(), pending: true };
    stick.atBottom.current = true;
    setMsgs((p) => [...p, temp]);
    try {
      const real = await sendDirect(id, body);
      setMsgs((p) => {
        const without = p.filter((m) => m.id !== temp.id);
        return without.some((m) => m.id === real.id) ? without : [...without, real];
      });
      return true;
    } catch (err) {
      setMsgs((p) => p.filter((m) => m.id !== temp.id));
      setError(errorMessage(err, "Your message didn't send. Check your connection and try again."));
      return false;
    }
  };

  const accept = async (yes: boolean) => {
    try {
      await respondToInvite(id, yes);
      refreshCommunitySummary();
      if (yes) load();
      else navigate("/dashboard/community/classmates");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const block = async () => {
    try {
      const r = await blockThread(id);
      toast.success(r.message);
      navigate("/dashboard/community/classmates");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const report = async () => {
    try {
      const r = await reportThread(id, reason);
      toast.success(r.message);
      navigate("/dashboard/community/classmates");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const first = thread?.with.name.split(" ")[0] || "";

  return (
    <div className={c.screen}>
      <header className={c.head}>
        <Link to="/dashboard/community/classmates" className={c.back} aria-label="Back to Classmates">
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        {thread && <Avatar initials={thread.with.initials} />}
        <div className={c.headMain}>
          <h2 className={c.headTitle}>
            {thread?.with.name || "Chat"} {thread && <NameTag badge={thread.with.badge} />}
          </h2>
          <p className={c.headDesc}>Classmate · private chat</p>
        </div>
        {thread && (
          <div className={c.menuWrap}>
            <button type="button" className={c.tool} onClick={() => setMenu((v) => !v)} aria-label="Chat options" aria-expanded={menu}>
              <MoreVertical size={20} aria-hidden="true" />
            </button>
            {menu && (
              <div className={c.menu} role="menu">
                <button type="button" role="menuitem" className={c.menuItem} onClick={() => { setMenu(false); setReporting(true); }}>
                  <Flag size={16} aria-hidden="true" /> Report to AlignTraits
                </button>
                <button type="button" role="menuitem" className={`${c.menuItem} ${c.menuDanger}`} onClick={block}>
                  <ShieldOff size={16} aria-hidden="true" /> Block {first}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className={c.listWrap}>
        <div className={c.list} ref={stick.ref} onScroll={stick.onScroll} aria-live="polite" aria-relevant="additions">
          <div className={c.privacy}>
            <Lock size={16} aria-hidden="true" />
            <span>Only you and {first || "your classmate"} can see this chat. Phone numbers, emails and outside links can't be shared here.</span>
          </div>
          {status === "loading" ? (
            <div className={ui.loading}>
              <span className={ui.spinner} aria-label="Loading messages" />
            </div>
          ) : status === "error" ? (
            <div className={ui.empty}>
              <p className={ui.emptyTitle}>This chat isn't available</p>
              <p className={ui.emptyText}>It may have been blocked, or the link is wrong.</p>
              <div className={ui.emptyActions}>
                <Link to="/dashboard/community/classmates" className={ui.primary}>
                  Back to Classmates
                </Link>
              </div>
            </div>
          ) : thread?.status === "received" ? (
            <div className={ui.empty}>
              <p className={ui.emptyTitle}>{thread.with.name} wants to chat with you</p>
              <p className={ui.emptyText}>Accept to start chatting. If you decline, they won't be told why.</p>
              <div className={ui.emptyActions}>
                <button type="button" className={ui.secondary} onClick={() => accept(false)}>
                  Decline
                </button>
                <button type="button" className={ui.primary} onClick={() => accept(true)}>
                  Accept
                </button>
              </div>
            </div>
          ) : thread?.status === "sent" ? (
            <div className={ui.empty}>
              <p className={ui.emptyTitle}>Waiting for {first} to accept</p>
              <p className={ui.emptyText}>You can chat as soon as they accept your invitation.</p>
            </div>
          ) : msgs.length === 0 ? (
            <div className={ui.empty}>
              <p className={ui.emptyTitle}>Say hello to {first}</p>
              <p className={ui.emptyText}>Share how your preparation is going, or compare notes on courses.</p>
            </div>
          ) : (
            msgs.map((m, i) => {
              const prev = msgs[i - 1];
              const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
              const grouped = !newDay && prev?.mine === m.mine && new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000;
              return (
                <Fragment key={m.id}>
                  {newDay && <DayDivider iso={m.createdAt} />}
                  <div className={`${c.msg} ${grouped ? c.msgGrouped : ""} ${m.pending ? c.pending : ""}`}>
                    <div className={c.gutter}>
                      {grouped ? <span className={c.gutterTime}>{msgTime(m.createdAt)}</span> : <Avatar initials={m.mine ? me?.initials || "" : thread?.with.initials || ""} />}
                    </div>
                    <div className={c.msgBody}>
                      {!grouped && (
                        <div className={c.msgHead}>
                          <span className={c.name}>{m.mine ? "You" : thread?.with.name}</span>
                          <span className={c.time}>{m.pending ? "Sending..." : msgTime(m.createdAt)}</span>
                        </div>
                      )}
                      <MessageText body={m.body} />
                    </div>
                  </div>
                </Fragment>
              );
            })
          )}
        </div>
        {stick.showNew && (
          <button type="button" className={c.newPill} onClick={() => stick.toBottom(true)}>
            <ArrowDown size={15} aria-hidden="true" />
            New messages
          </button>
        )}
      </div>

      {thread?.status === "accepted" && (
        <footer className={c.foot}>
          {thread.canSend ? (
            <Composer placeholder={`Message ${first}`} onSend={send} error={error} onTyping={() => error && setError("")} />
          ) : (
            <p className={c.barMuted}>{thread.readOnlyReason}</p>
          )}
        </footer>
      )}

      {reporting && (
        <div className={ui.overlay} role="dialog" aria-modal="true" aria-labelledby="report-title" onClick={() => setReporting(false)}>
          <div className={ui.dialog} onClick={(e) => e.stopPropagation()}>
            <h3 id="report-title" className={ui.dialogTitle}>
              Report this chat
            </h3>
            <p className={ui.dialogText}>The AlignTraits team will read the last messages. {first} will no longer be able to message you.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={300}
              placeholder="What happened? (optional)"
              style={{ width: "100%", minHeight: 90, borderRadius: 10, border: "1px solid #d0d5dd", padding: 10, fontSize: 15 }}
            />
            <div className={ui.dialogActions}>
              <button type="button" className={ui.secondary} onClick={() => setReporting(false)}>
                Cancel
              </button>
              <button type="button" className={ui.primary} onClick={report}>
                Report and block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
