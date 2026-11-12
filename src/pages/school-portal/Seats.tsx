import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiCopy } from "react-icons/fi";
import { errorCode, errorMessage, naira, portalCheckout, portalCodes, portalVerifyPayment, shortDate } from "../../services/roles";
import { Btn, Card, CardTitle, copyText, Empty, ErrorNote, Field, inputClass, Loading, Pill } from "../../components/Admin/kit";
import { usePortal } from "./PortalContext";

const STATUS: Record<string, { label: string; tone: "green" | "amber" | "grey" | "red" }> = {
  active: { label: "Active", tone: "green" },
  full: { label: "Full", tone: "amber" },
  expired: { label: "Ended", tone: "grey" },
  off: { label: "Switched off", tone: "red" },
};

/* Seats and code: buy seats at ₦2,600 per student, share the code, and see who used it. */
export default function Seats() {
  const { refresh } = usePortal();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof portalCodes>> | null>(null);
  const [error, setError] = useState("");
  const [seats, setSeats] = useState("20");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const load = () => portalCodes().then(setData).catch((err) => setError(errorMessage(err)));
  useEffect(() => {
    load();
  }, []);

  // Back from Paystack: confirm the payment and show the new code.
  useEffect(() => {
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) return;
    setChecking(true);
    portalVerifyPayment(reference)
      .then((r) => {
        toast.success(r.message);
        load();
        refresh();
      })
      .catch((err) => (errorCode(err) === "NOT_PAID" ? toast.info(errorMessage(err)) : toast.error(errorMessage(err))))
      .finally(() => {
        setChecking(false);
        setParams({}, { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const n = Number(seats) || 0;
  const price = data?.seatPrice ?? 2600;

  const onBuy = async (e: FormEvent) => {
    e.preventDefault();
    if (!Number.isInteger(n) || n < 1 || n > 500) return setError("Enter how many students to cover, from 1 to 500.");
    setError("");
    setBusy(true);
    try {
      const r = await portalCheckout(n);
      window.location.href = r.authorizationUrl;
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  if (!data && !error) return <Loading />;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-5">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[13px] text-[#667085]">Seats in use</p>
              <p className="text-[28px] font-bold text-[#002650]">
                {data?.seatsUsed ?? 0}
                <span className="text-[16px] font-semibold text-[#667085]"> of {data?.seats ?? 0}</span>
              </p>
            </div>
            <div>
              <p className="text-[13px] text-[#667085]">Seats left</p>
              <p className="text-[28px] font-bold text-[#002650]">{Math.max(0, (data?.seats ?? 0) - (data?.seatsUsed ?? 0))}</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F2F4F7]" aria-hidden="true">
            <div className="h-full rounded-full bg-[#004085]" style={{ width: `${data?.seats ? Math.min(100, (100 * data.seatsUsed) / data.seats) : 0}%` }} />
          </div>
          {checking && <p className="mt-3 text-[14px] text-[#475467]">Confirming your payment...</p>}
        </Card>

        <Card>
          <CardTitle hint="Each code covers students for 30 days from the day it is made. Students type it in, or are covered automatically when you invite them by email.">
            Your codes
          </CardTitle>
          {error && <ErrorNote>{error}</ErrorNote>}
          {data && data.codes.length === 0 ? (
            <Empty title="No codes yet">Buy seats to get your school code.</Empty>
          ) : (
            <ul className="flex flex-col gap-3">
              {data?.codes.map((c) => (
                <li key={c.id} className="rounded-xl border border-[#E4E9F0] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[22px] font-bold tracking-[0.2em] text-[#004085]">{c.code}</span>
                    <Pill tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Pill>
                    <Btn small tone="ghost" onClick={async () => toast.success((await copyText(c.code)) ? `Copied ${c.code}` : c.code)}>
                      <FiCopy aria-hidden="true" /> Copy
                    </Btn>
                  </div>
                  <p className="mt-1 text-[13px] text-[#667085]">
                    {c.used} of {c.seats} used · {c.status === "expired" ? `ended ${shortDate(c.expiresAt)}` : `${c.daysLeft} days left, until ${shortDate(c.expiresAt)}`}
                  </p>
                  {c.students.length > 0 && (
                    <>
                      <button type="button" className="mt-2 text-[14px] font-semibold text-[#004085]" onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={open === c.id}>
                        {open === c.id ? "Hide students" : `See who used it (${c.students.length})`}
                      </button>
                      {open === c.id && (
                        <ul className="mt-2 divide-y divide-[#F2F4F7] rounded-lg bg-[#F9FAFB] px-3">
                          {c.students.map((s) => (
                            <li key={s.id} className="flex justify-between gap-2 py-2 text-[13px]">
                              <span className="min-w-0 truncate">
                                <span className="font-semibold text-[#101828]">{s.name}</span> <span className="text-[#667085]">{s.email}</span>
                              </span>
                              <span className="shrink-0 text-[#667085]">{shortDate(s.usedAt)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-5">
        <Card>
          <CardTitle hint={`${naira(price)} per student, for ${data?.seatDays ?? 30} days of full access. Pay by card or bank transfer through Paystack.`}>Buy seats</CardTitle>
          <form onSubmit={onBuy} noValidate className="flex flex-col gap-4">
            <Field label="How many students?">
              <input className={inputClass} inputMode="numeric" value={seats} onChange={(e) => setSeats(e.target.value.replace(/\D/g, "").slice(0, 3))} />
            </Field>
            <div className="flex items-center justify-between rounded-lg bg-[#F5F8FF] px-4 py-3">
              <span className="text-[14px] text-[#475467]">
                {n || 0} × {naira(price)}
              </span>
              <span className="text-[20px] font-bold text-[#002650]">{naira(n * price)}</span>
            </div>
            <Btn type="submit" busy={busy} disabled={!n}>
              Pay {naira(n * price)}
            </Btn>
          </form>
        </Card>
        {data && data.purchases.length > 0 && (
          <Card>
            <CardTitle>Payments</CardTitle>
            <ul className="divide-y divide-[#F2F4F7] text-[14px]">
              {data.purchases.map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span>
                    {p.seats} seats · {shortDate(p.paidAt)}
                  </span>
                  <span className="font-semibold">{naira(p.amount)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
