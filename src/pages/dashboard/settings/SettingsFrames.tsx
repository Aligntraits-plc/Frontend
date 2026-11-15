import { useEffect } from "react";
import { CreditCard, KeyRound } from "lucide-react";
import { useAuth } from "../../../contexts/useAuth";
import { SettingsPage } from "../../../components/profile-settings/parts";
import SecurityManagement from "../SecurityManagement";
import Subscription from "../Subscription";

/* The password and plan pages, placed inside the Profile and settings frame. */
const useSettingsTitle = () => {
  const { setPageDesc } = useAuth();
  useEffect(() => {
    setPageDesc({ title: "Profile and settings", desc: "" });
  }, [setPageDesc]);
};

export function SecuritySettings() {
  useSettingsTitle();
  return (
    <SettingsPage icon={<KeyRound size={28} strokeWidth={2} />} title="Password and security" sub="Change the password you sign in with.">
      <div style={{ marginTop: 28 }}>
        <SecurityManagement />
      </div>
    </SettingsPage>
  );
}

export function BillingSettings() {
  useSettingsTitle();
  return (
    <SettingsPage icon={<CreditCard size={28} strokeWidth={2} />} title="Plan and billing" sub="Your plan, payments and school code.">
      <div style={{ marginTop: 20 }}>
        <Subscription framed />
      </div>
    </SettingsPage>
  );
}
