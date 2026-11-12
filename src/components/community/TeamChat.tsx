import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, Lock, MessageCircle } from "lucide-react";
import { errorMessage, getTeamMessages, postTeamMessage, type TeamMessage } from "../../services/community";
import { useCommunity } from "./CommunityContext";
import { refreshCommunitySummary } from "./summaryStore";
import { Avatar, Composer, DayDivider, MessageText, msgTime, sameGroup, useStickToBottom } from "./ChatParts";
import { dayKey } from "./eventUtils";
import NameTag, { avatarClassFor } from "./NameTag";
import c from "./Chat.module.css";
import ui from "./ui.module.css";

type Msg = TeamMessage & { pending?: boolean };
const POLL_MS = 6000;

// A student's private conversation with the AlignTraits team.
export default function TeamChat() {
  const { me } = useCommunity();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const newest = useRef("");
  const last = msgs[msgs.length - 1];
  const stick = useStickToBottom(last?.id ?? status);

  const load = () => {
    setStatus("loading");
    getTeamMessages()
      .then((r) => {
        setMsgs(r.messages);
        newest.current = r.messages.length ? r.messages[r.messages.length - 1].createdAt : r.serverTime;
        setStatus("ready");
        refreshCommunitySummary();
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  useEffect(() => {
    if (status !== "ready") return;
    let stopped = false;
    const id = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const r = await getTeamMessages(newest.current);
        if (stopped || !r.messages.length) return;
        setMsgs((prev) => {
          const have = new Set(prev.map((m) => m.id));
          const fresh = r.messages.filter((m) => !have.has(m.id));
          return fresh.length ? [...prev, ...fresh] : prev;
        });
        newest.current = r.messages[r.messages.length - 1].createdAt;
        if (r.messages.some((m) => m.fromStaff)) refreshCommunitySummary();
      } catch {
        /* next tick */
      }
    }, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [status]);

  const send = async (body: string) => {
    setError("");
    const temp: Msg = {
      id: `tmp-${Date.now()}`,
      body,
      createdAt: new Date().toISOString(),
      fromStaff: false,
      author: { name: me?.name || "You", initials: me?.initials || "" },
      pending: true,
    };
    stick.atBottom.current = true;
    setMsgs((p) => [...p, temp]);
    try {
      const real = await postTeamMessage(body);
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

  return (
    <div className={c.screen}>
      <header className={c.head}>
        <Link to="/dashboard/community" className={c.back} aria-label="Back to Community">
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        <span className={c.teamTile} aria-hidden="true">
          AT
        </span>
        <div className={c.headMain}>
          <h2 className={c.headTitle}>AlignTraits team</h2>
          <p className={c.headDesc}>Usually replies within a day</p>
        </div>
      </header>

      <div className={c.listWrap}>
        <div className={c.list} ref={stick.ref} onScroll={stick.onScroll} aria-live="polite" aria-relevant="additions">
          <div className={c.privacy}>
            <Lock size={16} aria-hidden="true" />
            <span>Only you and the AlignTraits team can see this conversation. We'll never ask for your password or a payment here.</span>
          </div>

          {status === "loading" ? (
            <div className={ui.loading}>
              <span className={ui.spinner} aria-label="Loading messages" />
            </div>
          ) : status === "error" ? (
            <div className={ui.empty}>
              <p className={ui.emptyTitle}>Messages didn't load</p>
              <p className={ui.emptyText}>Check your connection and try again.</p>
              <div className={ui.emptyActions}>
                <button type="button" className={ui.primary} onClick={load}>
                  Try again
                </button>
              </div>
            </div>
          ) : msgs.length === 0 ? (
            <div className={ui.empty}>
              <span className={ui.emptyIcon}>
                <MessageCircle size={24} aria-hidden="true" />
              </span>
              <p className={ui.emptyTitle}>Ask the AlignTraits team</p>
              <p className={ui.emptyText}>
                Questions about your results, a payment or your school code? Send us a message below and we'll reply here. We'll also
                email you when we do.
              </p>
            </div>
          ) : (
            msgs.map((m, i) => {
              const prev = msgs[i - 1];
              const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
              const grouped = !newDay && sameGroup(prev, m);
              return (
                <Fragment key={m.id}>
                  {newDay && <DayDivider iso={m.createdAt} />}
                  <div className={`${c.msg} ${grouped ? c.msgGrouped : ""} ${m.pending ? c.pending : ""}`}>
                    <div className={c.gutter}>
                      {grouped ? (
                        <span className={c.gutterTime}>{msgTime(m.createdAt)}</span>
                      ) : (
                        <Avatar initials={m.author.initials} staff={m.fromStaff} extraClass={m.fromStaff ? avatarClassFor(null, true) : ""} />
                      )}
                    </div>
                    <div className={c.msgBody}>
                      {!grouped && (
                        <div className={c.msgHead}>
                          <span className={c.name}>{m.fromStaff ? m.author.name : "You"}</span>
                          {m.fromStaff && <NameTag staff />}
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

      <footer className={c.foot}>
        <Composer placeholder="Message the AlignTraits team" onSend={send} error={error} onTyping={() => error && setError("")} />
      </footer>
    </div>
  );
}
