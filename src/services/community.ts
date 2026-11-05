import api from "../api/axios";

/* Community API: channels, messages with the AlignTraits team, events. */

export type Reaction = { emoji: string; count: number; mine: boolean };

export interface ChannelMessage {
  id: string;
  body: string;
  createdAt: string;
  pinned: boolean;
  mine: boolean;
  author: { name: string; initials: string; staff: boolean };
  reactions: Reaction[];
}

export interface Channel {
  id: string;
  slug: string;
  name: string;
  description: string;
  welcome: string;
  joined: boolean;
  memberCount: number;
  unread: number;
  lastMessageAt: string | null;
  recentMembers: { initials: string }[];
}

export type PostBlock = "VERIFY_EMAIL" | "MUTED" | null;

export interface CommunityMe {
  name: string;
  initials: string;
  staff: boolean;
  rulesAccepted: boolean;
  mutedUntil: string | null;
  postBlock: PostBlock;
}

export type EventKind = "LIVE_SESSION" | "WORKSHOP" | "MEETUP" | "DEADLINE" | "EXAM";
export type EventFormat = "ONLINE" | "IN_PERSON";

export interface CommunityEvent {
  id: string;
  title: string;
  kind: EventKind;
  format: EventFormat;
  status: "SCHEDULED" | "CANCELLED";
  startsAt: string;
  endsAt: string | null;
  hostName: string | null;
  hostRole: string | null;
  summary: string;
  agenda: string[];
  platform: string | null;
  joinUrl: string | null;
  venue: string | null;
  address: string | null;
  mapUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  recordingUrl: string | null;
  reminderCount: number;
  reminded: boolean;
}

export interface TeamMessage {
  id: string;
  body: string;
  createdAt: string;
  fromStaff: boolean;
  author: { name: string; initials: string };
}

export interface CommunitySummary {
  unread: { channels: number; team: number; total: number };
  eventsThisWeek: number;
  nextEvent: CommunityEvent | null;
}

/** The server's message for a failed request, or a fallback. */
export const errorMessage = (err: any, fallback = "Something went wrong. Check your connection and try again.") =>
  err?.response?.data?.message || fallback;
export const errorCode = (err: any): string | undefined => err?.response?.data?.code;

export const getSummary = async () => (await api.get("/community/summary")).data.data as CommunitySummary;

export const getChannels = async () =>
  (await api.get("/community/channels")).data.data as { channels: Channel[]; me: CommunityMe };

export const acceptRules = async () => (await api.post("/community/rules/accept")).data.data;
export const joinChannel = async (slug: string) => (await api.post(`/community/channels/${slug}/join`)).data.data;
export const leaveChannel = async (slug: string) => (await api.post(`/community/channels/${slug}/leave`)).data.data;

export interface MessagesPage {
  channel: { id: string; slug: string; name: string; description: string; welcome: string };
  joined: boolean;
  messages: ChannelMessage[];
  hasMore: boolean;
  reactions: Record<string, Reaction[]>;
  removed: string[];
  pinned: ChannelMessage[];
  serverTime: string;
}

export const getMessages = async (slug: string, params: { before?: string; after?: string } = {}) =>
  (await api.get(`/community/channels/${slug}/messages`, { params })).data.data as MessagesPage;

export const postMessage = async (slug: string, body: string) =>
  (await api.post(`/community/channels/${slug}/messages`, { body })).data.data as ChannelMessage;

export const deleteMessage = async (id: string) => (await api.delete(`/community/messages/${id}`)).data.data;

export const toggleReaction = async (id: string, emoji: string) =>
  (await api.post(`/community/messages/${id}/reactions`, { emoji })).data.data as { id: string; reactions: Reaction[] };

export const reportMessage = async (id: string, reason: string) =>
  (await api.post(`/community/messages/${id}/report`, { reason })).data;

export const getTeamMessages = async (after?: string) =>
  (await api.get("/community/team/messages", { params: after ? { after } : {} })).data.data as {
    messages: TeamMessage[];
    serverTime: string;
  };

export const postTeamMessage = async (body: string) =>
  (await api.post("/community/team/messages", { body })).data.data as TeamMessage;

export const getEvents = async (params: { from?: string; to?: string } = {}) =>
  (await api.get("/community/events", { params })).data.data as { events: CommunityEvent[]; serverTime: string };

export const getEvent = async (id: string) => (await api.get(`/community/events/${id}`)).data.data as CommunityEvent;

export const setReminder = async (id: string, on: boolean) =>
  (on ? await api.post(`/community/events/${id}/reminder`) : await api.delete(`/community/events/${id}/reminder`)).data as {
    message: string;
    data: { reminded: boolean; reminderCount: number };
  };

/* ----------------------------- Admin ----------------------------- */

export interface AdminMessage {
  id: string;
  body: string;
  createdAt: string;
  pinned: boolean;
  hidden: boolean;
  fromStaff: boolean;
  reportCount: number;
  author: { id: string; name: string; shownAs: string; initials: string; email: string };
}

export interface AdminChannel {
  id: string;
  slug: string;
  name: string;
  description: string;
  welcome: string;
  memberCount: number;
  messageCount: number;
  openReports: number;
}

export interface AdminReportGroup {
  message: AdminMessage & { channel: { name: string; slug: string } };
  reports: { reporter: string; reason: string | null; createdAt: string }[];
}

export interface InboxThread {
  id: string;
  student: { id: string; name: string; email: string; region: string | null; initials: string };
  lastMessage: { body: string; fromStaff: boolean; createdAt: string } | null;
  lastMessageAt: string;
  unread: number;
}

export const adminGetEvents = async () => (await api.get("/community/admin/events")).data.data as CommunityEvent[];
export const adminCreateEvent = async (body: Record<string, unknown>) =>
  (await api.post("/community/admin/events", body)).data.data as CommunityEvent;
export const adminUpdateEvent = async (id: string, body: Record<string, unknown>) =>
  (await api.patch(`/community/admin/events/${id}`, body)).data.data as CommunityEvent;
export const adminCancelEvent = async (id: string) =>
  (await api.post(`/community/admin/events/${id}/cancel`)).data.data as CommunityEvent;
export const adminDeleteEvent = async (id: string) => (await api.delete(`/community/admin/events/${id}`)).data.data;

export const adminGetChannels = async () => (await api.get("/community/admin/channels")).data.data as AdminChannel[];
export const adminUpdateChannel = async (id: string, body: { description?: string; welcome?: string }) =>
  (await api.patch(`/community/admin/channels/${id}`, body)).data.data;
export const adminGetChannelMessages = async (id: string) =>
  (await api.get(`/community/admin/channels/${id}/messages`)).data.data as { messages: AdminMessage[]; hasMore: boolean };
export const adminPostMessage = async (id: string, body: string) =>
  (await api.post(`/community/admin/channels/${id}/messages`, { body })).data.data as AdminMessage;
export const adminPinMessage = async (id: string, pinned: boolean) =>
  (await api.post(`/community/admin/messages/${id}/pin`, { pinned })).data.data;
export const adminDeleteMessage = async (id: string) => (await api.delete(`/community/admin/messages/${id}`)).data.data;
export const adminKeepMessage = async (id: string) => (await api.post(`/community/admin/messages/${id}/keep`)).data.data;
export const adminGetReports = async () => (await api.get("/community/admin/reports")).data.data as AdminReportGroup[];
export const adminMuteUser = async (userId: string, days: number) =>
  (await api.post(`/community/admin/users/${userId}/mute`, { days })).data as { message: string };
export const adminGetInbox = async () => (await api.get("/community/admin/inbox")).data.data as InboxThread[];
export const adminGetThread = async (id: string) =>
  (await api.get(`/community/admin/inbox/${id}`)).data.data as {
    id: string;
    student: InboxThread["student"];
    messages: TeamMessage[];
  };
export const adminReply = async (id: string, body: string) =>
  (await api.post(`/community/admin/inbox/${id}`, { body })).data.data as TeamMessage;
