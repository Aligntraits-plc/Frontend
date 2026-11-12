import api from "../api/axios";

/* API calls for Roles v1: staff invitations, partner schools and the school
   portal, ambassadors, Requests, classmate chats and the student dashboard. */

const data = <T,>(p: Promise<{ data: { data: T } }>) => p.then((r) => r.data.data);
export const errorMessage = (err: unknown, fallback = "Something went wrong. Please try again.") =>
  ((err as any)?.response?.data?.message as string) || fallback;
export const errorCode = (err: unknown) => (err as any)?.response?.data?.code as string | undefined;

export type StaffRole = "SUPER_ADMIN" | "ADMIN" | "CONTENT_MANAGER" | "ANALYST" | "COUNSELLOR" | "USER";
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  CONTENT_MANAGER: "Content manager",
  ANALYST: "Analyst",
  COUNSELLOR: "School counsellor",
  AMBASSADOR: "Ambassador",
  USER: "Student",
};
export const ADMINS: StaffRole[] = ["SUPER_ADMIN", "ADMIN"];
export const CONTENT_TEAM: StaffRole[] = ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"];
export const PANEL: StaffRole[] = ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ANALYST"];

export type Badge = { kind: "team" | "ambassador" | "counsellor"; label: string } | null;

/* ----------------------------- Staff and invitations ----------------------------- */

export type StaffDetails = { id: string; firstname: string; lastname: string; email: string; role: StaffRole; contactNumber?: string | null; username?: string | null };
export const getStaffDetails = () => data<StaffDetails>(api.get("/auth/admin/details"));

export type Invite = {
  id: string;
  email: string;
  role: string;
  roleLabel: string;
  schoolId: string | null;
  schoolName: string | null;
  status: "pending" | "accepted" | "cancelled" | "expired";
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  emailSent?: boolean;
};
export const listInvites = () => data<Invite[]>(api.get("/staff/invites"));
export const sendInvite = (body: { email: string; role: string; partnerSchoolId?: string }) =>
  api.post("/staff/invites", body).then((r) => r.data as { message: string; data: Invite });
export const resendInvite = (id: string) => api.post(`/staff/invites/${id}/resend`).then((r) => r.data as { message: string; data: Invite });
export const cancelInvite = (id: string) => data<Invite>(api.delete(`/staff/invites/${id}`));

export type InviteInfo = { email: string; role: string; roleLabel: string; schoolName: string | null; needsPassword: boolean; firstname: string; lastname: string };
export const readInvite = (token: string) => data<InviteInfo>(api.get(`/invites/${token}`));
export const acceptInvite = (token: string, body: { firstname?: string; lastname?: string; password?: string }) =>
  api.post(`/invites/${token}/accept`, body).then((r) => r.data as { message: string; data: { role: string; login: string } });

export type TeamMember = { id: string; firstname: string; lastname: string; email: string; contactNumber: string | null; role: StaffRole };
export const listTeam = () => data<TeamMember[]>(api.get("/super-admin/admin/profiles"));
export const changeRole = (id: string, role: string) => data<TeamMember>(api.patch(`/super-admin/admin/profiles/${id}`, { role }));
export const removeTeamMember = (id: string) => api.delete(`/super-admin/admin/profiles/${id}`).then((r) => r.data);

/* ----------------------------- Partner schools (admin) ----------------------------- */

export type PartnerSchool = {
  id: string;
  name: string;
  state: string | null;
  contactEmail: string | null;
  active: boolean;
  createdAt: string;
  students: number;
  counsellors: { id: string; name: string; email: string }[];
  seats: number;
  seatsUsed: number;
};
export const adminListSchools = () => data<PartnerSchool[]>(api.get("/partner-schools/admin"));
export const adminCreateSchool = (body: { name: string; state?: string; contactEmail?: string }) => data<PartnerSchool>(api.post("/partner-schools/admin", body));
export const adminUpdateSchool = (id: string, body: Partial<{ name: string; state: string; contactEmail: string; active: boolean }>) =>
  data<PartnerSchool>(api.patch(`/partner-schools/admin/${id}`, body));
export const adminCreateSchoolCode = (body: { partnerSchoolId: string; seats: number; days: number }) =>
  data<{ code: string; seats: number; expiresAt: string; daysLeft: number }>(api.post("/school-codes", body));

/* ----------------------------- Ambassadors ----------------------------- */

export type AmbassadorStats = { invitesSent: number; joined: number; activeStudents: number; weeks: { weekStart: string; joined: number }[] };
export type AmbassadorRow = AmbassadorStats & { id: string; name: string; email: string; code: string; active: boolean; since: string };
export const adminListAmbassadors = () => data<AmbassadorRow[]>(api.get("/ambassadors/admin"));
export const adminMakeAmbassador = (email: string) => api.post("/ambassadors/admin", { email }).then((r) => r.data as { message: string });
export const adminSetAmbassadorActive = (id: string, active: boolean) => api.patch(`/ambassadors/admin/${id}`, { active }).then((r) => r.data as { message: string });

export type MyAmbassador = {
  code: string;
  link: string;
  whatsappText: string;
  emailsLeftToday: number;
  emailsPerDay: number;
  since: string;
  stats: AmbassadorStats;
};
export const getMyAmbassador = () => data<MyAmbassador>(api.get("/ambassadors/me"));
export const ambassadorInvite = (email: string) =>
  api.post("/ambassadors/me/invites", { email }).then((r) => r.data as { message: string; data: { emailsLeftToday: number } });
export const claimReferral = (code: string) => data<{ credited: boolean }>(api.post("/ambassadors/referral", { code }));
export const myEventDrafts = () => data<any[]>(api.get("/ambassadors/me/events"));
export const createEventDraft = (body: Record<string, unknown>) => api.post("/ambassadors/me/events", body).then((r) => r.data as { message: string; data: any });
export const deleteEventDraft = (id: string) => api.delete(`/ambassadors/me/events/${id}`).then((r) => r.data);

/* ----------------------------- Requests ----------------------------- */

export type RequestKind = "school" | "ambassador" | "loan" | "listing";
export type RequestsSummary = { new: Record<RequestKind, number>; eventsToApprove: number; chatsReported: number; total: number };
export type RequestItem = {
  id: string;
  title: string;
  subtitle: string;
  status: string | null;
  createdAt: string;
  fields: [string, string][];
  email?: string;
  whatsapp?: string;
  under18?: boolean;
  isNew: boolean;
};
export const getRequestsSummary = () => data<RequestsSummary>(api.get("/requests/summary"));
export const listRequests = (kind: RequestKind) => data<{ kind: RequestKind; items: RequestItem[]; statuses: string[] }>(api.get(`/requests?kind=${kind}`));
export const markRequestsSeen = () => api.post("/requests/seen");
export const setRequestStatus = (kind: RequestKind, id: string, status: string) => data(api.patch(`/requests/${kind}/${id}`, { status }));
export type ReportedChat = {
  id: string;
  reportedAt: string;
  reason: string | null;
  reportedBy: { id: string; name: string; email: string };
  other: { id: string; name: string; email: string };
  messages: { id: string; body: string; from: string; createdAt: string }[];
};
export const listReportedChats = () => data<ReportedChat[]>(api.get("/community/admin/direct-reports"));
export const closeReportedChat = (id: string) => api.post(`/community/admin/direct-reports/${id}/close`).then((r) => r.data);

/* ----------------------------- Students: my school ----------------------------- */

export type SchoolOption = { id: string; name: string; state: string | null };
export type MySchool = { school: SchoolOption | null; classLevel: string | null; needsNotice: boolean; source?: string };
export const schoolOptions = (q = "") => data<SchoolOption[]>(api.get(`/partner-schools/options?q=${encodeURIComponent(q)}`));
export const getMySchool = () => data<MySchool>(api.get("/me/school"));
export const setMySchool = (body: { schoolId: string; consent: boolean; classLevel?: string }) =>
  api.put("/me/school", body).then((r) => r.data as { message: string; data: MySchool });
export const leaveMySchool = () => api.delete("/me/school").then((r) => r.data as { message: string });
export const schoolNoticeSeen = () => api.post("/me/school/notice-seen");
export const schoolNotListed = (body: { schoolName: string; schoolEmail: string }) =>
  api.post("/me/school/not-listed", body).then((r) => r.data as { message: string });

/* ----------------------------- School portal ----------------------------- */

export type PortalOverview = {
  school: { id: string; name: string; state: string | null };
  me: { name: string; email: string };
  students: number;
  surveyed: number;
  seats: number;
  seatsUsed: number;
  seatPrice: number;
  seatDays: number;
  channelSlug: string | null;
  joinLink: string;
};
export type PortalStudent = {
  id: string;
  name: string;
  initials: string;
  email: string;
  classLevel: string | null;
  source: string;
  joinedAt: string;
  surveyDone: boolean;
  resultsAdded: boolean;
  matchesChecked: boolean;
  reportApproved: boolean;
  covered: boolean;
  plan: string | null;
  until: string | null;
};
export type MatchOption = {
  courseId: string;
  course: string;
  school: string;
  schoolType: string | null;
  place: string;
  eligible: boolean;
  tier: "reach" | "realistic" | "safety";
  tierLabel: string;
  reason: string;
  details: string;
  cutOff: number | null;
  margin: number | null;
  yearOneCost: number | null;
  currency: string | null;
};
export type StudentReport = {
  utmeScore: number | null;
  exams: { type: string; subjects: number }[];
  surveyDone: boolean;
  careers: string[];
  careerReason: string;
  recommendedCourses: { id: string; title: string }[];
  resultsAdded: boolean;
  matchesChecked: boolean;
  matchesCheckedAt: string | null;
  options: MatchOption[];
};
export type PortalStudentDetail = Omit<PortalStudent, "initials" | "surveyDone" | "resultsAdded" | "matchesChecked" | "reportApproved"> & {
  initials: string;
  region: string | null;
  hasPassword: boolean;
  school: { name: string };
  report: StudentReport;
  review: { approved: boolean; approvedAt: string | null; approvedBy: string | null };
};
export type PortalCode = {
  id: string;
  code: string;
  seats: number;
  used: number;
  createdAt: string;
  expiresAt: string;
  status: "active" | "full" | "expired" | "off";
  daysLeft: number;
  students: { id: string; name: string; email: string; usedAt: string }[];
};
export const portalOverview = () => data<PortalOverview>(api.get("/school-portal/overview"));
export const portalStudents = (q = "") => data<PortalStudent[]>(api.get(`/school-portal/students?q=${encodeURIComponent(q)}`));
export const portalStudent = (id: string) => data<PortalStudentDetail>(api.get(`/school-portal/students/${id}`));
export const portalSetClass = (id: string, classLevel: string) => data(api.patch(`/school-portal/students/${id}`, { classLevel }));
export const portalCoverStudent = (id: string) => api.post(`/school-portal/students/${id}/cover`).then((r) => r.data as { message: string });
export const portalRemoveStudent = (id: string) => api.delete(`/school-portal/students/${id}`).then((r) => r.data as { message: string });
export const portalReview = (id: string, approved: boolean) => api.put(`/school-portal/students/${id}/review`, { approved }).then((r) => r.data as { message: string });
export const portalInvites = () => data<{ invites: { id: string; email: string; createdAt: string; joined: boolean }[]; left: number; perDay: number }>(api.get("/school-portal/invites"));
export const portalInvite = (emails: string[]) =>
  api.post("/school-portal/invites", { emails }).then((r) => r.data as { message: string; data: { results: { email: string; status: string }[]; left: number } });
export const portalAssisted = (body: { firstname: string; lastname: string; email: string; classLevel?: string }) =>
  data<{ id: string; firstname: string; lastname: string; email: string }>(api.post("/school-portal/assisted", body));
export const portalCodes = () =>
  data<{ seatPrice: number; seatDays: number; seats: number; seatsUsed: number; codes: PortalCode[]; purchases: { id: string; seats: number; amount: number; paidAt: string; reference: string }[] }>(
    api.get("/school-portal/codes")
  );
export const portalCheckout = (seats: number) => data<{ authorizationUrl: string; reference: string }>(api.post("/school-portal/checkout", { seats }));
export const portalVerifyPayment = (reference: string) => api.post("/school-portal/verify-payment", { reference }).then((r) => r.data as { message: string });

/* ----------------------------- Classmate chats ----------------------------- */

export type Person = { id: string; name: string; initials: string; badge?: Badge };
export type ClassmateResult = Person & { classLevel: string | null; status: "none" | "sent" | "received" | "accepted" | "declined" | "blocked"; threadId: string | null };
export type ThreadSummary = {
  id: string;
  with: Person;
  status: "sent" | "received" | "accepted";
  unread: number;
  last: { body: string; mine: boolean; at: string } | null;
  createdAt: string;
};
export type DirectMessage = { id: string; body: string; mine: boolean; createdAt: string };
export const listThreads = () => data<{ school: { name: string } | null; threads: ThreadSummary[] }>(api.get("/community/direct"));
export const searchClassmates = (q: string) => data<{ school: { name: string }; people: ClassmateResult[] }>(api.get(`/community/direct/search?q=${encodeURIComponent(q)}`));
export const inviteClassmate = (userId: string) => api.post("/community/direct/invite", { userId }).then((r) => r.data as { message: string; data: { threadId: string; status: string } });
export const respondToInvite = (id: string, accept: boolean) => data<{ threadId: string; status: string }>(api.post(`/community/direct/${id}/respond`, { accept }));
export const threadMessages = (id: string, after?: string) =>
  data<{
    thread: { id: string; status: "sent" | "received" | "accepted"; with: Person; canSend: boolean; readOnlyReason: string | null; reported: boolean };
    messages: DirectMessage[];
    serverTime: string;
  }>(api.get(`/community/direct/${id}/messages${after ? `?after=${encodeURIComponent(after)}` : ""}`));
export const sendDirect = (id: string, body: string) => data<DirectMessage>(api.post(`/community/direct/${id}/messages`, { body }));
export const blockThread = (id: string) => api.post(`/community/direct/${id}/block`).then((r) => r.data as { message: string });
export const reportThread = (id: string, reason: string) => api.post(`/community/direct/${id}/report`, { reason }).then((r) => r.data as { message: string });

/* ----------------------------- Student dashboard ----------------------------- */

export type HomeStep = { key: string; label: string; done: boolean; current: boolean; to: string };
export type HomeMatch = (MatchOption & { saved: boolean }) | { tier: MatchOption["tier"]; tierLabel: string; empty: true };
export type StudentHome = {
  firstname: string;
  plan: string | null;
  utmeScore: number | null;
  steps: HomeStep[];
  stepsDone: number;
  shortlist: { tier: MatchOption["tier"]; label: string; item: { courseId: string; course: string; school: string } | null }[];
  matchesChecked: boolean;
  matchesCheckedAt: string | null;
  top: HomeMatch[];
  matchCount: number;
  applications: { id: string; courseId: string; course: string; school: string; status: string; statusLabel: string; updatedAt: string }[];
  applicationStatuses: { value: string; label: string }[];
  events: { id: string; title: string; kind: string; format: string; startsAt: string; endsAt: string | null }[];
  school: { id: string; name: string; needsNotice: boolean } | null;
  ambassador: boolean;
};
export const getStudentHome = () => data<StudentHome>(api.get("/student/home"));
export const saveShortlist = (courseId: string) => api.post("/student/shortlist", { courseId }).then((r) => r.data as { message: string });
export const removeShortlist = (courseId: string) => api.delete(`/student/shortlist/${courseId}`).then((r) => r.data as { message: string });
export const saveApplication = (courseId: string, status: string) => api.post("/student/applications", { courseId, status }).then((r) => r.data as { message: string });
export const removeApplication = (id: string) => api.delete(`/student/applications/${id}`).then((r) => r.data as { message: string });
export const getParentLink = () => data<{ link: string; days: number; whatsappText: string }>(api.get("/student/parent-link"));

export type ParentReport = StudentReport & {
  student: { name: string; firstname: string; region: string | null };
  school: { name: string; classLevel: string | null } | null;
  review: { approvedAt: string; by: string | null } | null;
  generatedAt: string;
};
export const getParentReport = (token: string) => data<ParentReport>(api.get(`/reports/parent/${token}`));

/* ----------------------------- Little helpers ----------------------------- */

export const naira = (n: number | null | undefined, currency?: string | null) =>
  n === null || n === undefined ? "Not listed" : `${currency && currency !== "NGN" ? `${currency} ` : "₦"}${Math.round(n).toLocaleString("en-NG")}`;
export const shortDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }) : "";
export const SOURCE_LABELS: Record<string, string> = { self: "Chose the school", code: "Used the school code", invite: "Invited by email", assisted: "Added by counsellor" };
export const CLASS_LEVELS = ["SS1", "SS2", "SS3", "Finished"];
