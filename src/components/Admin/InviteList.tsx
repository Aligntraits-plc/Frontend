import { useState } from "react";
import { toast } from "react-toastify";
import { cancelInvite, errorMessage, resendInvite, shortDate, type Invite } from "../../services/roles";
import { Btn, Empty, Pill } from "./kit";

const STATUS: Record<Invite["status"], { label: string; tone: "green" | "amber" | "grey" | "red" }> = {
  pending: { label: "Waiting", tone: "amber" },
  accepted: { label: "Joined", tone: "green" },
  cancelled: { label: "Cancelled", tone: "grey" },
  expired: { label: "Link expired", tone: "red" },
};

/* Invitations with their state, and Send again / Cancel for the ones not accepted yet. */
export default function InviteList({ invites, onChange, emptyText }: { invites: Invite[]; onChange: (i: Invite) => void; emptyText: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  if (invites.length === 0) return <Empty title="No invitations yet">{emptyText}</Empty>;

  const act = async (invite: Invite, kind: "resend" | "cancel") => {
    setBusy(`${kind}:${invite.id}`);
    try {
      if (kind === "resend") {
        const r = await resendInvite(invite.id);
        onChange(r.data);
        toast.success(r.message);
      } else {
        onChange(await cancelInvite(invite.id));
        toast.success("Invitation cancelled");
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <ul className="divide-y divide-[#EAECF0]">
      {invites.map((i) => (
        <li key={i.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-[#101828]">{i.email}</p>
            <p className="text-[13px] text-[#667085]">
              {i.roleLabel}
              {i.schoolName ? ` · ${i.schoolName}` : ""} · sent {shortDate(i.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={STATUS[i.status].tone}>{STATUS[i.status].label}</Pill>
            {i.status !== "accepted" && (
              <Btn small tone="secondary" busy={busy === `resend:${i.id}`} onClick={() => act(i, "resend")}>
                Send again
              </Btn>
            )}
            {i.status === "pending" && (
              <Btn small tone="danger" busy={busy === `cancel:${i.id}`} onClick={() => act(i, "cancel")}>
                Cancel
              </Btn>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
