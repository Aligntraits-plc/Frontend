import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, ChevronDown, Hash, School, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/useAuth";
import {
  acceptRules,
  errorMessage,
  getChannels,
  joinChannel,
  type Channel,
  type CommunityMe,
} from "../../services/community";
import { CommunityContext, type CommunityCtx } from "../../components/community/CommunityContext";
import { RulesDialog } from "../../components/community/Dialogs";
import JumpTo from "../../components/community/JumpTo";
import { refreshCommunitySummary, useCommunitySummary } from "../../components/community/summaryStore";
import s from "../../components/community/Community.module.css";
import ui from "../../components/community/ui.module.css";

/*
  Community: two public channels, a private conversation with the AlignTraits team,
  and events. Computers show a channel list next to the content; phones show the
  list as the Community home and open each screen full size.
*/
export default function Community() {
  const { setPageDesc } = useAuth();
  const summary = useCommunitySummary();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [me, setMe] = useState<CommunityMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rules, setRules] = useState<{ slug: string; name: string } | null>(null);
  const [rulesReadOnly, setRulesReadOnly] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const pendingJoin = useRef<((ok: boolean) => void) | null>(null);

  useEffect(() => {
    setPageDesc({ title: "Community", desc: "Channels, events and help from the AlignTraits team" });
  }, [setPageDesc]);

  const reload = useCallback(async () => {
    try {
      const data = await getChannels();
      setChannels(data.channels);
      setMe(data.me);
      setError("");
    } catch (err) {
      setError(errorMessage(err, "We couldn't load Community. Check your connection and try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Keep channel badges in step with the menu badge.
  const total = summary?.unread.channels;
  const lastTotal = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (total === undefined) return;
    if (lastTotal.current !== undefined && lastTotal.current !== total) reload();
    lastTotal.current = total;
  }, [total, reload]);

  const setChannelState = useCallback((slug: string, patch: Partial<Channel>) => {
    setChannels((list) => list.map((c) => (c.slug === slug ? { ...c, ...patch } : c)));
  }, []);

  const doJoin = useCallback(
    async (slug: string) => {
      await joinChannel(slug);
      setChannels((list) => list.map((c) => (c.slug === slug ? { ...c, joined: true, memberCount: c.memberCount + (c.joined ? 0 : 1) } : c)));
      const name = channels.find((c) => c.slug === slug)?.name || slug;
      toast.success(`You joined #${name}`);
      refreshCommunitySummary();
    },
    [channels]
  );

  const requestJoin = useCallback(
    async (slug: string) => {
      if (me && !me.rulesAccepted) {
        const channel = channels.find((c) => c.slug === slug);
        setRulesReadOnly(false);
        setRules({ slug, name: channel?.name || slug });
        return new Promise<boolean>((resolve) => {
          pendingJoin.current = resolve;
        });
      }
      try {
        await doJoin(slug);
        return true;
      } catch (err) {
        toast.error(errorMessage(err));
        return false;
      }
    },
    [me, channels, doJoin]
  );

  const closeRules = (ok: boolean) => {
    setRules(null);
    setRulesReadOnly(false);
    pendingJoin.current?.(ok);
    pendingJoin.current = null;
  };

  const ctx: CommunityCtx = useMemo(
    () => ({
      channels,
      me,
      loading,
      error,
      reload,
      setChannelState,
      requestJoin,
      showRules: () => {
        setRulesReadOnly(true);
        setRules({ slug: "", name: "" });
      },
    }),
    [channels, me, loading, error, reload, setChannelState, requestJoin]
  );

  const teamUnread = summary?.unread.team ?? 0;
  const classmatesUnread = (summary?.unread.direct ?? 0) + (summary?.unread.requests ?? 0);

  return (
    <CommunityContext.Provider value={ctx}>
      <div className={s.layout}>
        <aside className={s.panel} aria-label="Community">
          <div className={s.panelHead}>AlignTraits Community</div>
          <JumpTo />
          <NavLink to="/dashboard/community/events" className={({ isActive }) => `${s.panelLink} ${isActive ? s.panelActive : ""}`}>
            <CalendarDays size={18} aria-hidden="true" />
            <span className={s.panelLabel}>Events</span>
            <span className={s.panelMeta}>{summary ? `${summary.eventsThisWeek} this week` : ""}</span>
          </NavLink>

          <button type="button" className={s.panelSection} onClick={() => setChannelsOpen((v) => !v)} aria-expanded={channelsOpen}>
            <ChevronDown size={16} aria-hidden="true" className={channelsOpen ? "" : s.rotated} />
            Channels
          </button>
          {channelsOpen &&
            channels.filter((c) => !c.school).map((c) => (
              <NavLink
                key={c.slug}
                to={`/dashboard/community/c/${c.slug}`}
                className={({ isActive }) => `${s.panelLink} ${isActive ? s.panelActive : ""} ${c.unread ? s.panelUnread : ""} ${c.joined ? "" : s.panelNotJoined}`}
              >
                <Hash size={18} aria-hidden="true" />
                <span className={s.panelLabel}>{c.name}</span>
                {c.unread > 0 && <span className={s.panelBadge}>{c.unread > 99 ? "99+" : c.unread}</span>}
                {!c.joined && <span className={s.panelMeta}>Join</span>}
              </NavLink>
            ))}

          {channels.some((c) => c.school) && (
            <>
              <div className={s.panelSectionStatic}>Your school</div>
              {channels
                .filter((c) => c.school)
                .map((c) => (
                  <NavLink
                    key={c.slug}
                    to={`/dashboard/community/c/${c.slug}`}
                    className={({ isActive }) => `${s.panelLink} ${isActive ? s.panelActive : ""} ${c.unread ? s.panelUnread : ""}`}
                  >
                    <School size={18} aria-hidden="true" />
                    <span className={s.panelLabel}>{c.name}</span>
                    {c.unread > 0 && <span className={s.panelBadge}>{c.unread > 99 ? "99+" : c.unread}</span>}
                  </NavLink>
                ))}
            </>
          )}

          <div className={s.panelSectionStatic}>Messages</div>
          <NavLink to="/dashboard/community/team" className={({ isActive }) => `${s.panelLink} ${isActive ? s.panelActive : ""} ${teamUnread ? s.panelUnread : ""}`}>
            <span className={s.teamAvatar} aria-hidden="true">
              AT
            </span>
            <span className={s.panelLabel}>AlignTraits team</span>
            {teamUnread > 0 && <span className={s.panelBadge}>{teamUnread}</span>}
          </NavLink>
          {(me?.role === "USER" || !me?.role) && !me?.staff && (
            <NavLink to="/dashboard/community/classmates" className={({ isActive }) => `${s.panelLink} ${isActive ? s.panelActive : ""} ${classmatesUnread ? s.panelUnread : ""}`}>
              <UsersRound size={18} aria-hidden="true" />
              <span className={s.panelLabel}>Classmates</span>
              {classmatesUnread > 0 && <span className={s.panelBadge}>{classmatesUnread}</span>}
            </NavLink>
          )}

          <button type="button" className={s.panelRules} onClick={ctx.showRules}>
            <ShieldCheck size={16} aria-hidden="true" />
            Community rules
          </button>
        </aside>

        <div className={s.content}>
          <Suspense
            fallback={
              <div className={ui.loading}>
                <span className={ui.spinner} aria-label="Loading" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </div>

      {rules && (
        <RulesDialog
          channelName={rulesReadOnly ? undefined : rules.name}
          onClose={() => closeRules(false)}
          onAgree={
            rulesReadOnly
              ? undefined
              : async () => {
                  try {
                    await acceptRules();
                    setMe((m) => (m ? { ...m, rulesAccepted: true } : m));
                    await doJoin(rules.slug);
                    closeRules(true);
                  } catch (err) {
                    toast.error(errorMessage(err));
                  }
                }
          }
        />
      )}
    </CommunityContext.Provider>
  );
}
