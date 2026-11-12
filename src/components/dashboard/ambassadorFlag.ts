import { useEffect, useState } from "react";
import { getMyAmbassador } from "../../services/roles";

/* Whether the signed-in student is an ambassador, checked once per page load. */
let cached: boolean | null = null;
let pending: Promise<boolean> | null = null;

export function useIsAmbassador() {
  const [value, setValue] = useState<boolean>(cached ?? false);
  useEffect(() => {
    if (cached !== null) return;
    pending ||= getMyAmbassador()
      .then(() => true)
      .catch(() => false)
      .then((v) => (cached = v));
    pending.then(setValue);
  }, []);
  return value;
}
