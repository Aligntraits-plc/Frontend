import { createContext, useContext } from "react";
import type { PortalOverview } from "../../services/roles";

export type PortalCtx = { overview: PortalOverview | null; refresh: () => void };
export const PortalContext = createContext<PortalCtx>({ overview: null, refresh: () => undefined });
export const usePortal = () => useContext(PortalContext);
