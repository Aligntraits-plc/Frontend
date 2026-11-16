import api from "../api/axios";

/* Financing page (GET /student/finance) and the team's scholarship list. */
export type FinanceScholarship = {
  id: string;
  name: string;
  funder: string;
  amount: string;
  when: string;
  hasDate: boolean;
  link: string | null;
  badge: { tone: "match" | "neutral"; label: string };
  following: boolean;
};
export type Finance = {
  budget: { value: number | null; min: number; max: number; step: number };
  fit: { total: number; fits: number | null; over: { label: string; cost: string }[]; moreOver: number; hasMatches: boolean };
  covers: { options: { key: string; label: string }[]; chosen: string[] };
  whoPays: "PARENTS" | "SCHOLARSHIP" | "BOTH" | null;
  scholarships: FinanceScholarship[];
  missingForMatching: string[];
  nelfund: { on: boolean; privateSchools: string[]; morePrivate: number; publicCount: number };
};
export type FinanceInput = Partial<{ budget: number | null; covers: string[]; whoPays: string | null; nelfund: boolean }>;

export const getFinance = async () => (await api.get("/student/finance")).data.data as Finance;
export const saveFinance = async (body: FinanceInput) => (await api.put("/student/finance", body)).data.data as Finance;
export const followScholarship = async (id: string, on: boolean) =>
  (await api.put(`/student/finance/scholarships/${id}`, { on })).data as { message: string; data: { following: boolean } };

export type AdminScholarship = {
  id: string;
  name: string;
  funder: string;
  amountText: string;
  windowText: string;
  closesAt: string | null;
  link: string | null;
  forText: string;
  level: string;
  states: string[];
  arms: string[];
  gender: string | null;
  schoolName: string | null;
  active: boolean;
  checkedAt: string | null;
  followers: number;
};
export type ScholarshipInput = Omit<AdminScholarship, "id" | "checkedAt" | "followers">;
export const adminListScholarships = async () =>
  (await api.get("/scholarships/admin")).data.data as { scholarships: AdminScholarship[]; options: { states: string[]; arms: string[]; levels: string[] } };
export const adminSaveScholarship = async (id: string | null, body: Partial<ScholarshipInput>) =>
  (id ? await api.patch(`/scholarships/admin/${id}`, body) : await api.post("/scholarships/admin", body)).data.data as AdminScholarship;
export const getWorkshopInterest = async () =>
  (await api.get("/workshops/admin/interest")).data.data as { courses: { slug: string; title: string; category: string; interested: number }[] };
