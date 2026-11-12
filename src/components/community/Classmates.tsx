import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Lock, School, Search, UsersRound } from "lucide-react";
import {
  errorCode,
  errorMessage,
  inviteClassmate,
  listThreads,
  respondToInvite,
  searchClassmates,
  type ClassmateResult,
  type ThreadSummary,
} from "../../services/roles";
import { refreshCommunitySummary } from "./summaryStore";
import { Avatar } from "./ChatParts";
import NameTag from "./NameTag";
import { msgTime } from "./ChatParts";
import ui from "./ui.module.css";
import k from "./Classmates.module.css";

/* Classmates: find students from your school, invite them, and chat once they accept. */
export default function Classmates() {
  const [threads, setThreads] = useState<ThreadSummary[] | null>(null);
  const [school, setSchool] = useState<string | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<ClassmateResult[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = () =>
    listThreads()
      .then((r) => {
        setThreads(r.threads);
        setSchool(r.school?.name ?? null);
      })
      .catch((err) => setError(errorMessage(err)));
  useEffect(() => {
    load();
    const id = setInterval(() => document.visibilityState === "visible" && load(), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (query.trim().length < 2) {
      setPeople(null);
      return;
    }
    timer.current = setTimeout(() => {
      searchClassmates(query.trim())
        .then((r) => setPeople(r.people))
        .catch((err) => {
          if (errorCode(err) === "NO_SCHOOL") setSchool(null);
          else setError(errorMessage(err));
        });
    }, 300);
  }, [query]);

  const invite = async (p: ClassmateResult) => {
    setBusy(p.id);
    try {
      const r = await inviteClassmate(p.id);
      toast.success(r.message);
      setPeople((list) => list?.map((x) => (x.id === p.id ? { ...x, status: r.data.status as ClassmateResult["status"], threadId: r.data.threadId } : x)) || null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const respond = async (t: ThreadSummary, accept: boolean) => {
    setBusy(t.id);
    try {
      await respondToInvite(t.id, accept);
      toast.success(accept ? `You and ${t.with.name.split(" ")[0]} can now chat` : "Invitation declined");
      await load();
      refreshCommunitySummary();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const received = (threads || []).filter((t) => t.status === "received");
  const chats = (threads || []).filter((t) => t.status === "accepted");
  const sent = (threads || []).filter((t) => t.status === "sent");

  return (
    <div className={k.wrap}>
      <div className={k.head}>
        <Link to="/dashboard/community" className={k.back} aria-label="Back to Community">
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        <div>
          <h2 className={k.title}>Classmates</h2>
          <p className={k.sub}>{school ? `Students from ${school}` : "Private chats with students from your school"}</p>
        </div>
      </div>

      {school === null ? (
        <div className={ui.empty}>
          <span className={ui.emptyIcon}>
            <School size={24} aria-hidden="true" />
          </span>
          <p className={ui.emptyTitle}>Add your school first</p>
          <p className={ui.emptyText}>You can chat privately with classmates from your own secondary school. Add your school in Profile and settings.</p>
          <div className={ui.emptyActions}>
            <Link to="/dashboard/settings/school" className={ui.primary}>
              Add my school
            </Link>
          </div>
        </div>
      ) : (
        <>
          <label className={k.search}>
            <span className={ui.srOnly}>Search classmates by name</span>
            <Search size={18} aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search classmates by name" />
          </label>

          {people && (
            <section aria-label="Search results">
              <h3 className={k.sectionTitle}>Results</h3>
              {people.length === 0 ? (
                <p className={k.meta}>No classmate matches "{query}". Only students who added {school || "your school"} can be found.</p>
              ) : (
                <ul className={k.list}>
                  {people.map((p) => (
                    <li key={p.id} className={k.row}>
                      <Avatar initials={p.initials} />
                      <div className={k.rowMain}>
                        <p className={k.name}>
                          {p.name} <NameTag badge={p.badge} />
                        </p>
                        {p.classLevel && <p className={k.meta}>{p.classLevel}</p>}
                      </div>
                      <div className={k.actions}>
                        {p.status === "accepted" && p.threadId ? (
                          <Link to={`/dashboard/community/dm/${p.threadId}`} className={`${ui.secondary} ${ui.small}`}>
                            Open chat
                          </Link>
                        ) : p.status === "sent" ? (
                          <span className={k.status}>Invitation sent</span>
                        ) : p.status === "declined" || p.status === "blocked" ? (
                          <span className={k.status}>Not available</span>
                        ) : (
                          <button type="button" className={`${ui.primary} ${ui.small}`} disabled={busy === p.id} onClick={() => invite(p)}>
                            {p.status === "received" ? "Accept" : "Invite to chat"}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {error && <p className={ui.errorBox}>{error}</p>}

          {received.length > 0 && (
            <section aria-label="Invitations">
              <h3 className={k.sectionTitle}>Invitations ({received.length})</h3>
              <ul className={k.list}>
                {received.map((t) => (
                  <li key={t.id} className={k.row}>
                    <Avatar initials={t.with.initials} />
                    <div className={k.rowMain}>
                      <p className={k.name}>{t.with.name}</p>
                      <p className={k.meta}>Wants to chat with you</p>
                    </div>
                    <div className={k.actions}>
                      <button type="button" className={`${ui.secondary} ${ui.small}`} disabled={busy === t.id} onClick={() => respond(t, false)}>
                        Decline
                      </button>
                      <button type="button" className={`${ui.primary} ${ui.small}`} disabled={busy === t.id} onClick={() => respond(t, true)}>
                        Accept
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-label="Chats">
            <h3 className={k.sectionTitle}>Chats</h3>
            {!threads ? (
              <div className={ui.loading}>
                <span className={ui.spinner} aria-label="Loading" />
              </div>
            ) : chats.length === 0 ? (
              <div className={ui.empty}>
                <span className={ui.emptyIcon}>
                  <UsersRound size={24} aria-hidden="true" />
                </span>
                <p className={ui.emptyTitle}>No chats yet</p>
                <p className={ui.emptyText}>Search for a classmate above and send an invitation. You can chat once they accept.</p>
              </div>
            ) : (
              <ul className={k.list}>
                {chats.map((t) => (
                  <li key={t.id}>
                    <Link to={`/dashboard/community/dm/${t.id}`} className={`${k.row} ${k.rowLink}`}>
                      <Avatar initials={t.with.initials} />
                      <div className={k.rowMain}>
                        <p className={k.name}>{t.with.name}</p>
                        <p className={`${k.meta} ${t.unread ? k.unread : ""}`}>
                          {t.last ? `${t.last.mine ? "You: " : ""}${t.last.body}` : "Say hello"}
                        </p>
                      </div>
                      {t.unread > 0 ? (
                        <span className={ui.badge} aria-label={`${t.unread} unread`}>
                          {t.unread}
                        </span>
                      ) : t.last ? (
                        <span className={k.status}>{msgTime(t.last.at)}</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {sent.length > 0 && (
            <section aria-label="Waiting">
              <h3 className={k.sectionTitle}>Waiting for a reply</h3>
              <ul className={k.list}>
                {sent.map((t) => (
                  <li key={t.id} className={k.row}>
                    <Avatar initials={t.with.initials} />
                    <div className={k.rowMain}>
                      <p className={k.name}>{t.with.name}</p>
                      <p className={k.meta}>Invitation sent</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className={k.note}>
            <Lock size={16} aria-hidden="true" />
            <span>
              Only students from your school can find you, and nobody can message you until you accept. For your safety, phone numbers, emails and outside links can't be
              shared. You can block or report a chat at any time.
            </span>
          </p>
        </>
      )}
    </div>
  );
}
