import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Bold, Italic, List, SendHorizontal, Smile } from "lucide-react";
import { dayKey, dayLong, timeLabel } from "./eventUtils";
import c from "./Chat.module.css";
import ui from "./ui.module.css";

/* ----------------------------- Message text ----------------------------- */

const TLDS = "com|ng|org|net|io|edu|gov|uk|app|info|co";
const TOKEN = new RegExp(
  `(\\*\\*[^*\\n]+\\*\\*)|(\\b_[^_\\n]+_\\b)|((?:https?:\\/\\/|www\\.)[^\\s<>()]+|\\b[a-z0-9-]+(?:\\.[a-z0-9-]+)*\\.(?:${TLDS})\\b(?:\\/[^\\s<>()]*)?)`,
  "gi"
);

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const [whole, bold, italic, link] = m;
    const key = `${keyBase}-${i++}`;
    if (bold) out.push(<strong key={key}>{bold.slice(2, -2)}</strong>);
    else if (italic) out.push(<em key={key}>{italic.slice(1, -1)}</em>);
    else if (link) {
      const trimmed = link.replace(/[.,!?;:]+$/, "");
      const rest = link.slice(trimmed.length);
      const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      out.push(
        <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow ugc">
          {trimmed}
        </a>
      );
      if (rest) out.push(rest);
    } else out.push(whole);
    last = start + whole.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Shows a message with **bold**, _italic_, "- " lists and links. Never renders HTML from the message. */
export function MessageText({ body }: { body: string }) {
  const lines = body.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let para: string[] = [];
  const flushPara = () => {
    if (!para.length) return;
    const k = `p${blocks.length}`;
    blocks.push(
      <p key={k}>
        {para.map((line, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {inline(line, `${k}-${i}`)}
          </Fragment>
        ))}
      </p>
    );
    para = [];
  };
  const flushList = () => {
    if (!list.length) return;
    const k = `l${blocks.length}`;
    blocks.push(
      <ul key={k}>
        {list.map((item, i) => (
          <li key={i}>{inline(item, `${k}-${i}`)}</li>
        ))}
      </ul>
    );
    list = [];
  };
  for (const line of lines) {
    const m = line.match(/^\s*[-•*]\s+(.*)$/);
    if (m) {
      flushPara();
      list.push(m[1]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return <div className={c.text}>{blocks}</div>;
}

/* ----------------------------- Small pieces ----------------------------- */

export function Avatar({ initials, staff = false, extraClass = "" }: { initials: string; staff?: boolean; extraClass?: string }) {
  return (
    <span className={`${ui.avatar} ${staff && !extraClass ? ui.avatarStaff : ""} ${extraClass}`} aria-hidden="true">
      {initials}
    </span>
  );
}

export function dayDividerLabel(iso: string, now = new Date()) {
  const k = dayKey(iso);
  if (k === dayKey(now)) return "Today";
  if (k === dayKey(new Date(now.getTime() - 24 * 3600 * 1000))) return "Yesterday";
  return dayLong(iso).replace(/ \d{4}$/, (y) => (y.trim() === String(now.getFullYear()) ? "" : y));
}

export const sameGroup = (
  a: { createdAt: string; author: { name: string } } | undefined,
  b: { createdAt: string; author: { name: string } }
) =>
  !!a &&
  a.author.name === b.author.name &&
  dayKey(a.createdAt) === dayKey(b.createdAt) &&
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() < 5 * 60 * 1000;

export function DayDivider({ iso }: { iso: string }) {
  return (
    <div className={c.divider} role="separator">
      <span>{dayDividerLabel(iso)}</span>
    </div>
  );
}

export const msgTime = (iso: string) => timeLabel(iso);

/** Keeps a scrolling list pinned to the bottom when new items arrive, unless the reader scrolled up. */
export function useStickToBottom(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const [showNew, setShowNew] = useState(false);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (atBottom.current) setShowNew(false);
  };

  const toBottom = (smooth = false) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    atBottom.current = true;
    setShowNew(false);
  };

  useLayoutEffect(() => {
    if (atBottom.current) toBottom();
    else setShowNew(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);

  return { ref, onScroll, toBottom, showNew, atBottom };
}

/* ----------------------------- Composer ----------------------------- */

const EMOJI = ["🙏", "👍", "😀", "🎉", "✅", "📚", "🔥", "👏"];

const coarse = () => typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;

export function Composer({
  placeholder,
  onSend,
  error,
  onTyping,
  autoFocus = false,
}: {
  placeholder: string;
  /** Resolves true when the message was accepted, so the box can be cleared. */
  onSend: (body: string) => Promise<boolean>;
  error?: string;
  onTyping?: () => void;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus && !coarse()) box.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!emojiOpen) return;
    const close = (e: MouseEvent) => {
      if (!emojiRef.current?.contains(e.target as Node)) setEmojiOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [emojiOpen]);

  const wrap = (marker: string) => {
    const el = box.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const picked = value.slice(a, b) || "text";
    const next = value.slice(0, a) + marker + picked + marker + value.slice(b);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + marker.length, a + marker.length + picked.length);
    });
  };

  const bullet = () => {
    const el = box.current;
    if (!el) return;
    const a = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    const next = `${value.slice(0, a)}- ${value.slice(a)}`;
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(el.selectionStart + 2, el.selectionStart + 2);
    });
  };

  const insert = (text: string) => {
    const el = box.current;
    const a = el?.selectionStart ?? value.length;
    const b = el?.selectionEnd ?? value.length;
    setValue(value.slice(0, a) + text + value.slice(b));
    setEmojiOpen(false);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(a + text.length, a + text.length);
    });
  };

  const send = async () => {
    const body = value.trim();
    if (!body || sending) return;
    setSending(true);
    const ok = await onSend(body);
    setSending(false);
    if (ok) setValue("");
    box.current?.focus();
  };

  const over = value.length > 2000;

  return (
    <div className={c.composerWrap}>
      {error && (
        <p className={c.composerError} role="alert">
          {error}
        </p>
      )}
      <div className={c.composer}>
        <div className={c.toolbar}>
          <button type="button" className={c.tool} onClick={() => wrap("**")} aria-label="Bold">
            <Bold size={17} aria-hidden="true" />
          </button>
          <button type="button" className={c.tool} onClick={() => wrap("_")} aria-label="Italic">
            <Italic size={17} aria-hidden="true" />
          </button>
          <button type="button" className={c.tool} onClick={bullet} aria-label="Bulleted list">
            <List size={17} aria-hidden="true" />
          </button>
          <div className={c.emojiWrap} ref={emojiRef}>
            <button type="button" className={c.tool} onClick={() => setEmojiOpen((v) => !v)} aria-label="Add emoji" aria-expanded={emojiOpen}>
              <Smile size={17} aria-hidden="true" />
            </button>
            {emojiOpen && (
              <div className={c.emojiPop} role="menu">
                {EMOJI.map((e) => (
                  <button key={e} type="button" role="menuitem" onClick={() => insert(e)} aria-label={`Insert ${e}`}>
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={c.inputRow}>
          <textarea
            ref={box}
            className={c.input}
            rows={1}
            value={value}
            placeholder={placeholder}
            aria-label={placeholder}
            maxLength={2200}
            onChange={(e) => {
              setValue(e.target.value);
              onTyping?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !coarse()) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button type="button" className={c.send} onClick={send} disabled={!value.trim() || sending || over} aria-label="Send message">
            <SendHorizontal size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className={c.composerHint}>
        {over ? (
          <span className={c.over}>{value.length} / 2000 characters</span>
        ) : (
          <span className={c.keys}>
            <strong>Enter</strong> to send · <strong>Shift + Enter</strong> for a new line
          </span>
        )}
      </div>
    </div>
  );
}
