import { createContext, useContext } from "react";
import type { Channel, CommunityMe } from "../../services/community";

export interface CommunityCtx {
  channels: Channel[];
  me: CommunityMe | null;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  setChannelState: (slug: string, patch: Partial<Channel>) => void;
  /** Joins a channel, asking the student to agree to the rules first if needed. */
  requestJoin: (slug: string) => Promise<boolean>;
  showRules: () => void;
}

export const CommunityContext = createContext<CommunityCtx | null>(null);

export function useCommunity(): CommunityCtx {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used inside the Community page");
  return ctx;
}
