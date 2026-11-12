import { BadgeCheck, School, Star } from "lucide-react";
import ui from "./ui.module.css";

export type CommunityBadge = { kind: "team" | "ambassador" | "counsellor"; label: string } | null | undefined;

/* The tag after a name: AlignTraits team (gold), ambassador (blue), or a school counsellor (school icon and name). */
export default function NameTag({ badge, staff }: { badge?: CommunityBadge; staff?: boolean }) {
  const b = badge ?? (staff ? { kind: "team" as const, label: "AlignTraits" } : null);
  if (!b) return null;
  if (b.kind === "team")
    return (
      <span className={`${ui.tag} ${ui.tagTeam}`} title="AlignTraits team">
        <BadgeCheck size={12} aria-hidden="true" />
        {b.label}
      </span>
    );
  if (b.kind === "ambassador")
    return (
      <span className={`${ui.tag} ${ui.tagAmbassador}`} title="AlignTraits ambassador">
        <Star size={11} aria-hidden="true" />
        {b.label}
      </span>
    );
  return (
    <span className={`${ui.tag} ${ui.tagCounsellor}`} title={`Counsellor, ${b.label}`}>
      <School size={12} aria-hidden="true" />
      {b.label}
    </span>
  );
}

export const avatarClassFor = (badge?: CommunityBadge, staff?: boolean) =>
  badge?.kind === "team" || (!badge && staff) ? ui.avatarTeam : badge?.kind === "counsellor" ? ui.avatarCounsellor : "";
