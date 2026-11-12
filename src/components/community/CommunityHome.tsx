import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, Hash, MessageCircle, School, ShieldCheck, Users, UsersRound } from "lucide-react";
import { useCommunity } from "./CommunityContext";
import { useCommunitySummary } from "./summaryStore";
import JumpTo from "./JumpTo";
import { KIND, dayNumber, placeLabel, relativeWhen, timeRange, weekdayShort } from "./eventUtils";
import s from "./Community.module.css";
import ui from "./ui.module.css";

// Community home: what's next, the channels, and the AlignTraits team.
export default function CommunityHome() {
  const { channels: allChannels, me, loading, error, reload, requestJoin, showRules } = useCommunity();
  const channels = allChannels.filter((c) => !c.school);
  const schoolChannels = allChannels.filter((c) => c.school);
  const summary = useCommunitySummary();
  const navigate = useNavigate();
  const [joining, setJoining] = useState<string | null>(null);
  const next = summary?.nextEvent ?? null;
  const joinedAny = channels.some((c) => c.joined);
  const teamUnread = summary?.unread.team ?? 0;
  const classmatesUnread = (summary?.unread.direct ?? 0) + (summary?.unread.requests ?? 0);
  const isStudent = !me?.staff && (me?.role === "USER" || !me?.role);

  const join = async (slug: string) => {
    setJoining(slug);
    const ok = await requestJoin(slug);
    setJoining(null);
    if (ok) navigate(`/dashboard/community/c/${slug}`);
  };

  return (
    <div className={s.home}>
      <div className={s.homeSearch}>
        <JumpTo tone="light" />
      </div>

      <div className={s.intro}>
        <h2>Prepare for admission with other students</h2>
        <p>Ask questions, share official updates and join live sessions with AlignTraits mentors and university students.</p>
      </div>

      {/* What's next */}
      <section className={s.section} aria-labelledby="home-next">
        <div className={s.sectionHead}>
          <h3 id="home-next" className={s.sectionTitle}>
            Next up
          </h3>
          <Link to="/dashboard/community/events" className={s.sectionLink}>
            All events{summary ? ` (${summary.eventsThisWeek} this week)` : ""}
          </Link>
        </div>
        {next ? (
          <div className={s.nextCard}>
            <div className={s.dateTile} aria-hidden="true">
              <span>{weekdayShort(next.startsAt)}</span>
              <span>{dayNumber(next.startsAt)}</span>
            </div>
            <div className={s.nextBody}>
              <div className={s.nextChips}>
                <span className={ui[KIND[next.kind].tone]}>{KIND[next.kind].label}</span>
                {next.reminded && <span className={ui.going}>Reminder set</span>}
              </div>
              <p className={s.nextTitle}>{next.title}</p>
              <p className={s.nextMeta}>
                {relativeWhen(next).replace(/^./, (c) => c.toUpperCase())} · {timeRange(next)} · {placeLabel(next)}
              </p>
            </div>
            <div className={s.nextActions}>
              <Link to={`/dashboard/community/events?event=${next.id}`} className={ui.primary}>
                See details
              </Link>
            </div>
          </div>
        ) : (
          <div className={ui.empty}>
            <span className={ui.emptyIcon}>
              <CalendarDays size={24} aria-hidden="true" />
            </span>
            <p className={ui.emptyTitle}>No upcoming events yet</p>
            <p className={ui.emptyText}>
              Live sessions, meetups and important deadlines like UTME registration will show here. You can set a reminder for each one.
            </p>
            <div className={ui.emptyActions}>
              <Link to="/dashboard/community/events" className={ui.secondary}>
                See past events
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* The student's school: private to its students and counsellors */}
      {schoolChannels.length > 0 && (
        <section className={s.section} aria-labelledby="home-school">
          <div className={s.sectionHead}>
            <h3 id="home-school" className={s.sectionTitle}>
              Your school
            </h3>
          </div>
          <div className={s.cards}>
            {schoolChannels.map((c) => (
              <Link key={c.slug} to={`/dashboard/community/c/${c.slug}`} className={`${s.card} ${s.cardLink}`}>
                <div className={s.cardTop}>
                  <span className={s.hashTile} aria-hidden="true">
                    <School size={22} />
                  </span>
                  <p className={s.cardName}>{c.name}</p>
                </div>
                <p className={s.cardText}>Only students and counsellors of your school can see this channel.</p>
                <div className={s.cardFoot}>
                  <Members c={c} />
                  {c.unread > 0 ? (
                    <span className={ui.badge} aria-label={`${c.unread} unread`}>
                      {c.unread}
                    </span>
                  ) : (
                    <ChevronRight size={18} aria-hidden="true" color="var(--at-slate)" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Channels */}
      <section className={s.section} aria-labelledby="home-channels">
        <div className={s.sectionHead}>
          <h3 id="home-channels" className={s.sectionTitle}>
            Channels
          </h3>
        </div>
        {!loading && !error && !joinedAny && channels.length > 0 && (
          <div className={s.notice}>
            <Users size={18} aria-hidden="true" />
            <span>
              <strong>Join a channel to talk with other candidates.</strong> You can read first, and join when you're ready to post.
            </span>
          </div>
        )}
        {loading ? (
          <div className={ui.loading}>
            <span className={ui.spinner} aria-label="Loading channels" />
          </div>
        ) : error ? (
          <div className={ui.empty}>
            <p className={ui.emptyTitle}>Community didn't load</p>
            <p className={ui.emptyText}>{error}</p>
            <div className={ui.emptyActions}>
              <button type="button" className={ui.primary} onClick={reload}>
                Try again
              </button>
            </div>
          </div>
        ) : (
          <div className={s.cards}>
            {channels.map((c) =>
              c.joined ? (
                <Link key={c.slug} to={`/dashboard/community/c/${c.slug}`} className={`${s.card} ${s.cardLink}`}>
                  <ChannelCardBody c={c} />
                  <div className={s.cardFoot}>
                    <Members c={c} />
                    {c.unread > 0 ? (
                      <span className={ui.badge} aria-label={`${c.unread} unread`}>
                        {c.unread}
                      </span>
                    ) : (
                      <ChevronRight size={18} aria-hidden="true" color="var(--at-slate)" />
                    )}
                  </div>
                </Link>
              ) : (
                <div key={c.slug} className={s.card}>
                  <ChannelCardBody c={c} />
                  <div className={s.cardFoot}>
                    <Members c={c} />
                    <div className={s.cardActions}>
                      <Link to={`/dashboard/community/c/${c.slug}`} className={`${ui.secondary} ${ui.small}`}>
                        Preview
                      </Link>
                      <button
                        type="button"
                        className={`${ui.primary} ${ui.small}`}
                        disabled={joining === c.slug}
                        onClick={() => join(c.slug)}
                        aria-label={`Join #${c.name}`}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* AlignTraits team */}
      <section className={s.section} aria-labelledby="home-team">
        <h3 id="home-team" className={s.sectionTitle}>
          Messages
        </h3>
        <Link to="/dashboard/community/team" className={`${s.teamCard} ${s.cardLink}`}>
          <span className={s.teamTile} aria-hidden="true">
            AT
          </span>
          <span className={s.teamBody}>
            <span className={s.cardName} style={{ display: "block" }}>
              AlignTraits team
            </span>
            <span className={s.cardText}>Questions about your results, payment or school code? Message the team privately.</span>
          </span>
          {teamUnread > 0 ? (
            <span className={ui.badge} aria-label={`${teamUnread} unread`}>
              {teamUnread}
            </span>
          ) : (
            <MessageCircle size={20} aria-hidden="true" color="var(--at-slate)" />
          )}
        </Link>
        {isStudent && (
          <Link to="/dashboard/community/classmates" className={`${s.teamCard} ${s.cardLink}`} style={{ marginTop: 10 }}>
            <span className={s.teamTile} aria-hidden="true" style={{ background: "var(--at-blue)" }}>
              <UsersRound size={20} />
            </span>
            <span className={s.teamBody}>
              <span className={s.cardName} style={{ display: "block" }}>
                Classmates
              </span>
              <span className={s.cardText}>Find students from your school and chat privately once they accept.</span>
            </span>
            {classmatesUnread > 0 ? (
              <span className={ui.badge} aria-label={`${classmatesUnread} new`}>
                {classmatesUnread}
              </span>
            ) : (
              <ChevronRight size={18} aria-hidden="true" color="var(--at-slate)" />
            )}
          </Link>
        )}
      </section>

      <button type="button" className={s.rulesLink} onClick={showRules}>
        <ShieldCheck size={16} aria-hidden="true" />
        Read the Community rules
      </button>
    </div>
  );
}

function ChannelCardBody({ c }: { c: { name: string; description: string } }) {
  return (
    <>
      <div className={s.cardTop}>
        <span className={s.hashTile} aria-hidden="true">
          <Hash size={22} />
        </span>
        <p className={s.cardName}>#{c.name}</p>
      </div>
      <p className={s.cardText}>{c.description}</p>
    </>
  );
}

function Members({ c }: { c: { memberCount: number; recentMembers: { initials: string }[] } }) {
  return (
    <span className={s.members}>
      {c.recentMembers.length > 0 && (
        <span className={s.stack} aria-hidden="true">
          {c.recentMembers.map((m, i) => (
            <span key={i}>{m.initials}</span>
          ))}
        </span>
      )}
      {c.memberCount === 0 ? "Be the first to join" : `${c.memberCount.toLocaleString("en-NG")} ${c.memberCount === 1 ? "member" : "members"}`}
    </span>
  );
}
