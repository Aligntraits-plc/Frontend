import api from "../api/axios";

/* Workshop courses (GET /workshops). Until real courses are uploaded these are previews. */
export type WorkshopCard = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  cover: string;
  weeks: number;
  sessions: number;
  level: string;
  preview: boolean;
  notify: boolean;
};
export type WorkshopCourse = WorkshopCard & { outcomes: string[]; syllabus: { week: number; title: string; topics: string[]; note: string }[] };

export const listWorkshops = async () => (await api.get("/workshops")).data.data as { categories: string[]; courses: WorkshopCard[]; previewOnly: boolean };
export const getWorkshop = async (slug: string) => (await api.get(`/workshops/${encodeURIComponent(slug)}`)).data.data as WorkshopCourse;
export const setWorkshopNotify = async (slug: string, on: boolean) =>
  (await api.put(`/workshops/${encodeURIComponent(slug)}/notify`, { on })).data as { message: string; data: { notify: boolean } };
