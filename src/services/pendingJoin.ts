import { claimReferral } from "./roles";

/* Links from ambassadors (?ref=CODE) and schools (?school=ID) are remembered on the
   sign-up and login pages, then used once the student is signed in. */
const REF = "at_ref";
const SCHOOL = "at_join_school";

export function rememberJoinParams(search: string) {
  try {
    const p = new URLSearchParams(search);
    const ref = (p.get("ref") || "").trim().toUpperCase();
    const school = (p.get("school") || "").trim();
    if (/^[A-Z0-9]{6,12}$/.test(ref)) localStorage.setItem(REF, ref);
    if (/^[0-9a-f-]{36}$/i.test(school)) localStorage.setItem(SCHOOL, school);
  } catch {
    /* storage can be unavailable */
  }
}

/** Credits the ambassador who referred this new account (once). */
export async function claimPendingReferral() {
  let code: string | null = null;
  try {
    code = localStorage.getItem(REF);
  } catch {
    return;
  }
  if (!code) return;
  try {
    await claimReferral(code);
  } catch {
    /* not important enough to bother the student */
  } finally {
    try {
      localStorage.removeItem(REF);
    } catch {
      /* ignore */
    }
  }
}

export const pendingSchoolId = () => {
  try {
    return localStorage.getItem(SCHOOL);
  } catch {
    return null;
  }
};
