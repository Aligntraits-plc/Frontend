import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowDown, ArrowLeft, Flag, Hash, LogOut, MoreHorizontal, Pin, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  deleteMessage,
  errorCode,
  errorMessage,
  getMessages,
  leaveChannel,
  postMessage,
  reportMessage,
  toggleReaction,
  type ChannelMessage,
  type MessagesPage,
} from "../../services/community";
import { useCommunity } from "./CommunityContext";
import { refreshCommunitySummary } from "./summaryStore";
import { Avatar, Composer, DayDivider, MessageText, msgTime, sameGroup, useStickToBottom } from "./ChatParts";
import NameTag, { avatarClassFor } from "./NameTag";
import { Dialog, ReportDialog } from "./Dialogs";
import { dayKey, dayMedium, timeLabel } from "./eventUtils";
import c from "./Chat.module.css";
import ui from "./ui.module.css";

type Msg = ChannelMessage & { pending?: boolean };
const REACTIONS = ["👍", "🙏", "✅", "😂", "🎉", "👀"];
const POLL_MS = 4000;

function merge(prev: Msg[], page: MessagesPage): Msg[] {
  const removed = new Set(page.removed);
  let list = prev.filter((m) => !removed.has(m.id));
  list = list.map((m) => (page.reactions[m.id] ? { ...m, reactions: page.reactions[m.id] } : m));
  const have = new Set(list.map((m) => m.id));
  const fresh = page.messages.filter((m) => !have.has(m.id) && !removed.has(m.id));
  return fresh.length ? [...list, ...fresh] : list;
}

export default function ChannelView() {
  const { slug = "" } = useParams();
  const { channels, me, requestJoin, setChannelState, reload } = useCommunity();
  const channel = channels.find((x) => x.slug === slug);

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [info, setInfo] = useState<MessagesPage["channel"] | null>(null);
  const [joined, setJoined] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [pinned, setPinned] = useState<ChannelMessage[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");
  const [sendError, setSendError] = useState("");
  const [menu, setMenu] = useState<"pins" | "more" | null>(null);
  const [actionFor, setActionFor] = useState<string | null>(null);
  const [reportFor, setReportFor] = useState<string | null>(null);
  const [deleteFor, setDeleteFor] = useState<string | null>(null);
  const [earlierBusy, setEarlierBusy] = useState(false);
  const [focusKey, setFocusKey] = useState(0);
  const newest = useRef("");
  const keepOffset = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const last = msgs[msgs.length - 1];
  const stick = useStickToBottom(last?.id ?? status);

  // First load, and again when moving to another channel.
  useEffect(() => {
    let alive = true;
    setStatus("loading");
    setMsgs([]);
    setSendError("");
    setMenu(null);
    getMessages(slug)
      .then((page) => {
        if (!alive) return;
        setInfo(page.channel);
        setJoined(page.joined);
        setMsgs(page.messages);
        setHasMore(page.hasMore);
        setPinned(page.pinned);
        newest.current = page.messages.length ? page.messages[page.messages.length - 1].createdAt : page.serverTime;
        setStatus("ready");
        stick.atBottom.current = true;
        setChannelState(slug, { unread: 0 });
        refreshCommunitySummary();
      })
      .catch((err) => {
        if (!alive) return;
        setStatus(err?.response?.status === 404 ? "missing" : "error");
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // New messages every few seconds while the screen is open and visible.
  useEffect(() => {
    if (status !== "ready") return;
    let stopped = false;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const page = await getMessages(slug, { after: newest.current });
        if (stopped) return;
        setMsgs((prev) => merge(prev, page));
        setJoined(page.joined);
        if (page.messages.length) {
          newest.current = page.messages[page.messages.length - 1].createdAt;
          if (page.messages.some((m) => !m.mine)) refreshCommunitySummary();
        }
      } catch {
        /* try again on the next tick */
      }
    };
    const id = setInterval(tick, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [status, slug]);

  // Keep the reading position when earlier messages are added above.
  useLayoutEffect(() => {
    const el = stick.ref.current;
    if (el && keepOffset.current !== null) {
      el.scrollTop = el.scrollHeight - keepOffset.current;
      keepOffset.current = null;
    }
  }, [msgs, stick.ref]);

  // Close open menus when tapping elsewhere.
  useEffect(() => {
    if (!menu && !actionFor) return;
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (menu && !menuRef.current?.contains(t)) setMenu(null);
      if (actionFor && !t.closest(`[data-actions="${actionFor}"]`)) setActionFor(null);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setActionFor(null);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [menu, actionFor]);

  const loadEarlier = async () => {
    const first = msgs.find((m) => !m.pending);
    if (!first) return;
    setEarlierBusy(true);
    try {
      const page = await getMessages(slug, { before: first.createdAt });
      const el = stick.ref.current;
      if (el) keepOffset.current = el.scrollHeight - el.scrollTop;
      setMsgs((prev) => [...page.messages.filter((m) => !prev.some((p) => p.id === m.id)), ...prev]);
      setHasMore(page.hasMore);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setEarlierBusy(false);
    }
  };

  const send = async (body: string) => {
    setSendError("");
    const temp: Msg = {
      id: `tmp-${Date.now()}`,
      body,
      createdAt: new Date().toISOString(),
      pinned: false,
      mine: true,
      author: { name: me?.name || "You", initials: me?.initials || "", staff: !!me?.staff, badge: me?.badge ?? null },
      reactions: [],
      pending: true,
    };
    stick.atBottom.current = true;
    setMsgs((p) => [...p, temp]);
    try {
      const real = await postMessage(slug, body);
      setMsgs((p) => {
        const without = p.filter((m) => m.id !== temp.id);
        return without.some((m) => m.id === real.id) ? without : [...without, real];
      });
      return true;
    } catch (err) {
      setMsgs((p) => p.filter((m) => m.id !== temp.id));
      const code = errorCode(err);
      if (code === "JOIN_REQUIRED") setJoined(false);
      if (code === "VERIFY_EMAIL" || code === "MUTED") reload();
      setSendError(errorMessage(err, "Your message didn't send. Check your connection and try again."));
      return false;
    }
  };

  const react = async (id: string, emoji: string) => {
    setActionFor(null);
    if (!joined) {
      toast.info(`Join #${info?.name || slug} to react.`);
      return;
    }
    try {
      const r = await toggleReaction(id, emoji);
      setMsgs((p) => p.map((m) => (m.id === id ? { ...m, reactions: r.reactions } : m)));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const join = async () => {
    const ok = await requestJoin(slug);
    if (ok) {
      setJoined(true);
      setFocusKey((k) => k + 1);
    }
  };

  const leave = async () => {
    setMenu(null);
    try {
      await leaveChannel(slug);
      setJoined(false);
      setChannelState(slug, { joined: false, memberCount: Math.max(0, (channel?.memberCount ?? 1) - 1), unread: 0 });
      toast.success(`You left #${info?.name || slug}`);
      refreshCommunitySummary();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const name = info?.name || channel?.name || slug;
  const backLink = (
    <Link to="/dashboard/community" className={c.back} aria-label="Back to Community">
      <ArrowLeft size={22} aria-hidden="true" />
    </Link>
  );

  if (status === "missing" || status === "error") {
    return (
      <div className={c.screen}>
        <header className={c.head}>
          {backLink}
          <h2 className={c.headTitle}>Community</h2>
        </header>
        <div style={{ padding: 20 }}>
          <div className={ui.empty}>
            <span className={ui.emptyIcon}>
              <Hash size={24} aria-hidden="true" />
            </span>
            <p className={ui.emptyTitle}>{status === "missing" ? "This channel doesn't exist" : "This channel didn't load"}</p>
            <p className={ui.emptyText}>
              {status === "missing"
                ? "It may have been renamed. Pick a channel from Community."
                : "Check your connection and try again."}
            </p>
            <div className={ui.emptyActions}>
              <Link to="/dashboard/community" className={ui.primary}>
                Go to Community
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const block = me?.postBlock;
  const visible = msgs;

  return (
    <div className={c.screen}>
      <header className={c.head}>
        {backLink}
        <div className={c.headMain}>
          <h2 className={c.headTitle}>
            <Hash size={20} aria-hidden="true" />
            <span className={c.headName}>{name}</span>
          </h2>
          {info?.description && <p className={c.headDesc}>{info.description}</p>}
        </div>
        <div className={c.headTools} ref={menuRef}>
          {channel && (
            <span className={c.memberPill} aria-label={`${channel.memberCount} members`}>
              <span className={c.stack} aria-hidden="true">
                {channel.recentMembers.map((m, i) => (
                  <span key={i}>{m.initials}</span>
                ))}
              </span>
              {channel.memberCount.toLocaleString("en-NG")}
            </span>
          )}
          <div className={c.menuWrap}>
            <button
              type="button"
              className={ui.iconBtn}
              onClick={() => setMenu(menu === "pins" ? null : "pins")}
              aria-label={`Pinned messages (${pinned.length})`}
              aria-expanded={menu === "pins"}
            >
              <Pin size={19} aria-hidden="true" />
            </button>
            {menu === "pins" && (
              <div className={c.menu} role="dialog" aria-label="Pinned messages">
                <p className={c.menuTitle}>Pinned by AlignTraits</p>
                {pinned.length === 0 ? (
                  <p className={c.pinItem}>Nothing pinned yet. Important updates from the AlignTraits team will show here.</p>
                ) : (
                  pinned.map((p) => (
                    <div key={p.id} className={c.pinItem}>
                      <span className={c.pinMeta}>
                        {p.author.name} · {msgTime(p.createdAt)}
                      </span>
                      <MessageText body={p.body} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {joined && (
            <div className={c.menuWrap}>
              <button
                type="button"
                className={ui.iconBtn}
                onClick={() => setMenu(menu === "more" ? null : "more")}
                aria-label="Channel options"
                aria-expanded={menu === "more"}
              >
                <MoreHorizontal size={20} aria-hidden="true" />
              </button>
              {menu === "more" && (
                <div className={c.menu} role="menu">
                  <button type="button" role="menuitem" className={`${c.menuItem} ${c.menuDanger}`} onClick={leave}>
                    <LogOut size={17} aria-hidden="true" />
                    Leave #{name}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className={c.listWrap}>
        <div className={c.list} ref={stick.ref} onScroll={stick.onScroll} aria-live="polite" aria-relevant="additions">
          {status === "loading" ? (
            <div className={ui.loading}>
              <span className={ui.spinner} aria-label="Loading messages" />
            </div>
          ) : (
            <>
              {hasMore ? (
                <div className={c.loadEarlier}>
                  <button type="button" className={`${ui.secondary} ${ui.small}`} onClick={loadEarlier} disabled={earlierBusy}>
                    {earlierBusy ? "Loading..." : "Load earlier messages"}
                  </button>
                </div>
              ) : (
                <div className={c.welcome}>
                  <span className={c.welcomeIcon} aria-hidden="true">
                    <Hash size={28} />
                  </span>
                  <h3 className={c.welcomeTitle}>Welcome to #{name}</h3>
                  <p className={c.welcomeText}>{info?.welcome}</p>
                  {visible.length === 0 && (
                    <div className={c.firstHello}>
                      {joined ? (
                        <>
                          <span>
                            <strong>No messages yet.</strong> Say hello and tell people what you're preparing for.
                          </span>
                          <button type="button" className={`${ui.primary} ${ui.small}`} onClick={() => setFocusKey((k) => k + 1)}>
                            Write the first message
                          </button>
                        </>
                      ) : (
                        <>
                          <span>
                            <strong>No messages yet.</strong> Join to start the conversation.
                          </span>
                          <button type="button" className={`${ui.primary} ${ui.small}`} onClick={join}>
                            Join #{name}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {visible.map((m, i) => {
                const prev = visible[i - 1];
                const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
                const grouped = !newDay && sameGroup(prev, m) && !m.pinned && !prev.pinned;
                return (
                  <Fragment key={m.id}>
                    {newDay && <DayDivider iso={m.createdAt} />}
                    <MessageItem
                      m={m}
                      grouped={grouped}
                      open={actionFor === m.id}
                      onOpen={() => setActionFor(actionFor === m.id ? null : m.id)}
                      onReact={(emoji) => react(m.id, emoji)}
                      onReport={() => {
                        setActionFor(null);
                        setReportFor(m.id);
                      }}
                      onDelete={() => {
                        setActionFor(null);
                        setDeleteFor(m.id);
                      }}
                      canReact={joined}
                    />
                  </Fragment>
                );
              })}
            </>
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
        {status !== "ready" ? null : !joined ? (
          <div className={c.bar}>
            <span>
              You're reading <strong>#{name}</strong>. Join to post and react.
            </span>
            <button type="button" className={ui.primary} onClick={join}>
              Join #{name}
            </button>
          </div>
        ) : block === "VERIFY_EMAIL" ? (
          <div className={c.bar}>
            <span>
              <strong>Verify your email to post.</strong> Open the verification link we emailed you, then come back.
            </span>
          </div>
        ) : block === "MUTED" ? (
          <div className={`${c.bar} ${c.barMuted}`}>
            <span>
              <strong>A moderator has paused your posting</strong>
              {me?.mutedUntil ? ` until ${dayMedium(me.mutedUntil)}, ${timeLabel(me.mutedUntil)}` : ""}. You can still read.
            </span>
          </div>
        ) : (
          <Composer key={focusKey} placeholder={`Message #${name}`} onSend={send} error={sendError} autoFocus={focusKey > 0} onTyping={() => sendError && setSendError("")} />
        )}
      </footer>

      {reportFor && (
        <ReportDialog
          onClose={() => setReportFor(null)}
          onSubmit={async (reason) => {
            try {
              await reportMessage(reportFor, reason);
              setMsgs((p) => p.filter((m) => m.id !== reportFor));
              toast.success("Thanks. A moderator will look at this message.");
              setReportFor(null);
            } catch (err) {
              toast.error(errorMessage(err));
            }
          }}
        />
      )}

      {deleteFor && (
        <Dialog title="Delete this message?" onClose={() => setDeleteFor(null)}>
          <p className={ui.dialogText}>It will be removed for everyone. This can't be undone.</p>
          <div className={ui.dialogActions}>
            <button type="button" className={ui.secondary} onClick={() => setDeleteFor(null)} data-autofocus>
              Cancel
            </button>
            <button
              type="button"
              className={ui.navy}
              style={{ background: "var(--at-error)" }}
              onClick={async () => {
                const id = deleteFor;
                setDeleteFor(null);
                try {
                  await deleteMessage(id);
                  setMsgs((p) => p.filter((m) => m.id !== id));
                } catch (err) {
                  toast.error(errorMessage(err));
                }
              }}
            >
              <Trash2 size={17} aria-hidden="true" />
              Delete
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function MessageItem({
  m,
  grouped,
  open,
  onOpen,
  onReact,
  onReport,
  onDelete,
  canReact,
}: {
  m: Msg;
  grouped: boolean;
  open: boolean;
  onOpen: () => void;
  onReact: (emoji: string) => void;
  onReport: () => void;
  onDelete: () => void;
  canReact: boolean;
}) {
  return (
    <div className={`${c.msg} ${grouped ? c.msgGrouped : ""} ${m.pending ? c.pending : ""}`}>
      <div className={c.gutter}>
        {grouped ? (
          <span className={c.gutterTime}>{msgTime(m.createdAt)}</span>
        ) : (
          <Avatar initials={m.author.initials} staff={m.author.staff} extraClass={avatarClassFor(m.author.badge, m.author.staff)} />
        )}
      </div>
      <div className={c.msgBody}>
        {!grouped && (
          <div className={c.msgHead}>
            <span className={c.name}>{m.author.name}</span>
            <NameTag badge={m.author.badge} staff={m.author.staff} />
            <span className={c.time}>{m.pending ? "Sending..." : msgTime(m.createdAt)}</span>
            {m.pinned && <span className={c.pinnedTag}>Pinned</span>}
          </div>
        )}
        <MessageText body={m.body} />
        {m.reactions.length > 0 && (
          <div className={c.reactions}>
            {m.reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                className={`${c.reaction} ${r.mine ? c.reactionMine : ""}`}
                onClick={() => onReact(r.emoji)}
                disabled={!canReact}
                aria-pressed={r.mine}
                aria-label={`${r.emoji} ${r.count}${r.mine ? ", including you" : ""}`}
              >
                <span aria-hidden="true">{r.emoji}</span>
                {r.count}
              </button>
            ))}
          </div>
        )}
      </div>
      {!m.pending && (
        <div className={`${c.actions} ${open ? c.actionsOpen : ""}`} data-actions={m.id}>
          <button type="button" className={c.actionBtn} onClick={onOpen} aria-label={`Actions for ${m.author.name}'s message`} aria-expanded={open}>
            <MoreHorizontal size={17} aria-hidden="true" />
          </button>
          {open && (
            <div className={c.menu} role="menu">
              {canReact && (
                <div className={c.emojiRow}>
                  {REACTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      role="menuitem"
                      className={m.reactions.some((r) => r.emoji === e && r.mine) ? c.emojiOn : ""}
                      onClick={() => onReact(e)}
                      aria-label={`React with ${e}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
              {m.mine ? (
                <button type="button" role="menuitem" className={`${c.menuItem} ${c.menuDanger}`} onClick={onDelete}>
                  <Trash2 size={17} aria-hidden="true" />
                  Delete message
                </button>
              ) : (
                <button type="button" role="menuitem" className={c.menuItem} onClick={onReport}>
                  <Flag size={17} aria-hidden="true" />
                  Report message
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
