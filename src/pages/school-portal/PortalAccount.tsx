import AdminPassword from "../../components/Admin/AdminPassword";

/* A counsellor's own password. */
export default function PortalAccount() {
  return (
    <div className="mx-auto max-w-[720px]">
      <h1 className="text-[20px] font-bold text-[#002650]">My account</h1>
      <p className="mb-4 mt-1 text-[14px] text-[#475467]">This is the sign in for the school portal.</p>
      <AdminPassword />
    </div>
  );
}
