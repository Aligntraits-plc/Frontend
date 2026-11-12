import AdminPassword from "../../components/Admin/AdminPassword";

/* A counsellor's own password. */
export default function PortalAccount() {
  return (
    <div className="mx-auto max-w-[720px] rounded-2xl border border-[#E4E9F0] bg-white p-5 sm:p-6">
      <h1 className="text-[20px] font-bold text-[#002650]">Password</h1>
      <p className="mb-5 mt-1 text-[14px] text-[#475467]">Change the password you use to sign in to the school portal.</p>
      <AdminPassword />
    </div>
  );
}
