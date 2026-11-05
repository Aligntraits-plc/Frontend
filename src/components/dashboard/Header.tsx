import { Link, useNavigate } from "react-router-dom";
import { Menu, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "../../contexts/useAuth";
import s from "./Header.module.css";

// Support line for "Help on WhatsApp", for example 2348012345678 (set VITE_WHATSAPP_NUMBER on Vercel).
// Until it's set, the button opens the private conversation with the AlignTraits team instead.
const WHATSAPP = String(import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
const WHATSAPP_URL = WHATSAPP
  ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi AlignTraits, I need help with ")}`
  : null;

const initials = (first?: string, last?: string) =>
  `${(first || "").trim()[0] || ""}${(last || "").trim()[0] || ""}`.toUpperCase() || "A";

// Top bar of the dashboard. The menu button opens the menu on phones and tablets.
const Header = ({
  setOpen,
  hideOnMobile = false,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hideOnMobile?: boolean;
}) => {
  const { user, pageDesc } = useAuth();
  const navigate = useNavigate();
  const image = typeof user?.image === "string" && user.image ? user.image : null;

  return (
    <header className={`${s.bar} ${hideOnMobile ? s.hideOnMobile : ""}`}>
      <button type="button" className={s.menu} onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu size={24} aria-hidden="true" />
      </button>

      <div className={s.titles}>
        <h1 className={s.title}>{pageDesc?.title || "Dashboard"}</h1>
        {pageDesc?.desc && <p className={s.desc}>{pageDesc.desc}</p>}
      </div>

      <div className={s.actions}>
        {WHATSAPP_URL ? (
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={s.help} aria-label="Help on WhatsApp">
            <FaWhatsapp size={19} aria-hidden="true" />
            <span className={s.helpLabel}>Help on WhatsApp</span>
          </a>
        ) : (
          <Link to="/dashboard/community/team" className={s.help} aria-label="Get help from the AlignTraits team">
            <MessageCircle size={18} aria-hidden="true" />
            <span className={s.helpLabel}>Get help</span>
          </Link>
        )}
        <button type="button" className={s.cta} onClick={() => navigate("/career-recommedation")}>
          Career recommendation
        </button>
        <div className={s.who}>
          <div className={s.whoName}>{[user?.firstname, user?.lastname].filter(Boolean).join(" ")}</div>
          <div className={s.whoMeta}>{user?.email}</div>
        </div>
        <Link to="/dashboard/settings/profile" className={s.avatar} aria-label="Your profile">
          {image ? <img src={image} alt="" /> : initials(user?.firstname, user?.lastname)}
        </Link>
      </div>
    </header>
  );
};

export default Header;
