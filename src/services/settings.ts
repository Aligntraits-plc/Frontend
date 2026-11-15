import api from "../api/axios";

/* Profile and settings for students (GET /student/settings and its save routes). */

export type SettingsProfile = {
  firstname: string;
  middleName: string;
  lastname: string;
  dob: string | null;
  classLevel: string;
  classArm: string;
  stateOfOrigin: string;
  stateLive: string;
  phone: string;
  email: string;
  emailVerified: boolean;
  whatsappSame: boolean;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
};
export type UtmeRow = { subject: string; score: number | null };
export type GradeRow = { subject: string; grade: string };
export type SettingsAcademics = {
  utme: { year: number | null; subjects: UtmeRow[]; total: number | null; complete: boolean };
  olevel: {
    status: "OUT" | "AWAITING";
    examBody: string;
    year: number | null;
    sittings: 1 | 2;
    grades: GradeRow[];
    credits: number;
    hasEnglish: boolean;
    hasMaths: boolean;
  };
  directEntry: { on: boolean; type: string };
};
export type StudentSettings = {
  profile: SettingsProfile;
  school: { id: string; name: string } | null;
  academics: SettingsAcademics;
  strength: { percent: number; next: { label: string; to: "profile" | "records"; reaches: number } | null };
  summary: { classLevel: string; state: string; results: string };
  options: {
    states: string[];
    classes: string[];
    arms: string[];
    relations: string[];
    examBodies: string[];
    grades: string[];
    utmeSubjects: string[];
    olevelSubjects: string[];
    directEntryTypes: string[];
  };
};

export type ProfileInput = Omit<SettingsProfile, "email" | "emailVerified">;
export type AcademicsInput = {
  utme: { year: number | null; subjects: { subject: string; score: number | "" | null }[] };
  olevel: { status: "OUT" | "AWAITING"; examBody: string; year: number | null; sittings: 1 | 2; grades: GradeRow[] };
  directEntry: { on: boolean; type: string };
};

export const getStudentSettings = async () => (await api.get("/student/settings")).data.data as StudentSettings;
export const saveStudentProfile = async (body: ProfileInput) =>
  (await api.put("/student/settings/profile", body)).data.data as StudentSettings;
export const saveStudentAcademics = async (body: AcademicsInput) =>
  (await api.put("/student/settings/academics", body)).data.data as StudentSettings;

/** Field problems the server found, as { field: message }. */
export const fieldErrors = (err: unknown) =>
  ((err as { response?: { data?: { fields?: Record<string, string> } } })?.response?.data?.fields || {}) as Record<string, string>;
