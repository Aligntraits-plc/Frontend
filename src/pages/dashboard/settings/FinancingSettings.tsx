import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CalendarClock, ExternalLink, Info, Wallet } from "lucide-react";
import { useAuth } from "../../../contexts/useAuth";
import { followScholarship, getFinance, saveFinance, type Finance, type FinanceInput } from "../../../services/finance";
import { errorMessage } from "../../../services/roles";
import { Loading, Problem, SaveStatus, Section, Segmented, SettingsPage, Toggle } from "../../../components/profile-settings/parts";
import { useAutosave } from "../../../components/profile-settings/useAutosave";
import s from "../../../components/profile-settings/Settings.module.css";

const naira = (n: number) => `₦${Math.round(n).toLocaleString("en-NG")}`;
const listNames = (names: string[], more: number) => {
  const all = more > 0 ? [...names, `${more} more`] : names;
  return all.length <= 1 ? all.join("") : `${all.slice(0, -1).join(", ")} and ${all[all.length - 1]}`;
};

/* Financing, from the Financing design. Every number comes from the student's own matches. */
export default function FinancingSettings() {
  const { setPageDesc } = useAuth();
  const [data, setData] = useState<Finance | null>(null);
  const [failed, setFailed] = useState(false);
  const [budget, setBudget] = useState<number | null>(null);
  const [covers, setCovers] = useState<string[]>([]);
  const [whoPays, setWhoPays] = useState<string | null>(null);
  const [nelfund, setNelfund] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const pending = useRef<FinanceInput>({});

  const apply = (d: Finance) => {
    setData(d);
    setBudget(d.budget.value);
    setCovers(d.covers.chosen);
    setWhoPays(d.whoPays);
    setNelfund(d.nelfund.on);
  };
  const load = () => {
    setFailed(false);
    getFinance().then(apply).catch(() => setFailed(true));
  };
  useEffect(() => {
    setPageDesc({ title: "Profile and settings", desc: "" });
    load();
  }, [setPageDesc]);

  const { state, mark } = useAutosave(
    () => pending.current,
    async (body) => {
      pending.current = {};
      if (!Object.keys(body).length) return;
      // Only the fit numbers and the loan note are taken from the reply, so typing is never undone.
      const fresh = await saveFinance(body);
      setData((d) => (d ? { ...d, fit: fresh.fit, nelfund: fresh.nelfund, budget: fresh.budget } : fresh));
    },
    500,
  );
  const change = (patch: FinanceInput) => {
    pending.current = { ...pending.current, ...patch };
    mark();
  };

  const toggleFollow = async (id: string, on: boolean) => {
    setBusyId(id);
    try {
      const r = await followScholarship(id, on);
      setData((d) => (d ? { ...d, scholarships: d.scholarships.map((x) => (x.id === id ? { ...x, following: r.data.following } : x)) } : d));
      toast.success(r.message);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const b = data?.budget;
  const shownBudget = budget ?? b?.value ?? null;
  const sliderValue = shownBudget ?? 400000;
  const fill = b ? ((sliderValue - b.min) / (b.max - b.min)) * 100 : 0;
  const fit = data?.fit;
  // While the slider moves, the saved count is a moment behind: say so plainly.
  const settled = !!data && budget === data.budget.value;

  return (
    <SettingsPage icon={<Wallet size={28} strokeWidth={2} />} title="Financing" sub="We use this to flag schools your family can afford and scholarships worth a look.">
      {failed && <Problem retry={load} />}
      {!data && !failed && <Loading />}
      {data && b && fit && (
        <div className={s.card}>
          <Section title="Yearly budget" desc="What your family can spend in year one.">
            <div className={s.budgetRow}>
              <output className={`${s.budgetNum} ${shownBudget === null ? s.budgetUnset : ""}`} htmlFor="fin-budget" aria-live="polite">
                {shownBudget === null ? "Not set" : naira(shownBudget)}
              </output>
              <span className={s.perYear}>per year</span>
            </div>
            <input
              id="fin-budget"
              className={s.range}
              type="range"
              min={b.min}
              max={b.max}
              step={b.step}
              value={sliderValue}
              aria-label="Yearly budget in naira"
              aria-valuetext={`${naira(sliderValue)} per year`}
              style={{ ["--fill" as string]: `${fill}%` }}
              onChange={(e) => {
                const v = Number(e.target.value);
                setBudget(v);
                change({ budget: v });
              }}
            />
            <div className={s.rangeEnds}>
              <span>{naira(b.min)}</span>
              <span>{naira(b.max)}</span>
            </div>

            <div className={s.fit}>
              {!fit.hasMatches ? (
                <>
                  <p className={s.fitTitle}>No matches to compare yet</p>
                  <p className={s.fitText} style={{ marginTop: 10 }}>
                    Run an eligibility check on a course and we will show how many of your matches fit this budget. <Link to="/dashboard/school">Find a course</Link>
                  </p>
                </>
              ) : fit.total === 0 ? (
                <>
                  <p className={s.fitTitle}>Your matches have no fees listed yet</p>
                  <p className={s.fitText} style={{ marginTop: 10 }}>
                    We compare your budget with each school’s tuition and acceptance fee. We are still adding fees for your matches.
                  </p>
                </>
              ) : shownBudget === null || fit.fits === null ? (
                <>
                  <p className={s.fitTitle}>Move the slider to set your budget</p>
                  <p className={s.fitText} style={{ marginTop: 10 }}>
                    We will show how many of your {fit.total} {fit.total === 1 ? "match fits" : "matches fit"}.
                  </p>
                </>
              ) : (
                <>
                  <p className={s.fitTitle} aria-live="polite">
                    {settled ? `${fit.fits} of ${fit.total} of your matches fit this budget` : "Checking your matches…"}
                  </p>
                  <div className={s.fitBar} role="img" aria-label={`${fit.fits} of ${fit.total} matches fit`}>
                    <div className={s.fitFill} style={{ width: `${(fit.fits / fit.total) * 100}%` }} />
                  </div>
                  <p className={s.fitText}>
                    {fit.over.length === 0
                      ? "Every match is within your budget for year one."
                      : `Over budget: ${fit.over.map((o) => `${o.label} (${o.cost})`).join(", ")}${fit.moreOver ? ` and ${fit.moreOver} more` : ""}.`}
                  </p>
                  <p className={s.hint} style={{ maxWidth: "none" }}>
                    We compare your budget with tuition and the acceptance fee for year one. Hostel, feeding and books are extra.
                  </p>
                </>
              )}
            </div>

            <p className={s.subLabel} id="fin-covers">
              This budget covers
            </p>
            <div className={s.chips} role="group" aria-labelledby="fin-covers">
              {data.covers.options.map((o) => {
                const on = covers.includes(o.key);
                return (
                  <button
                    key={o.key}
                    type="button"
                    className={s.chip}
                    aria-pressed={on}
                    onClick={() => {
                      const next = on ? covers.filter((k) => k !== o.key) : [...covers, o.key];
                      setCovers(next);
                      change({ covers: next });
                    }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>

            <p className={s.subLabel}>Who pays?</p>
            <div className={s.segFlush}>
              <Segmented
                label="Who pays"
                value={(whoPays || "") as string}
                onChange={(v) => {
                  setWhoPays(v);
                  change({ whoPays: v });
                }}
                options={[
                  { value: "PARENTS", label: "Parents" },
                  { value: "SCHOLARSHIP", label: "Scholarship" },
                  { value: "BOTH", label: "Both" },
                ]}
              />
            </div>
          </Section>

          <Section
            title="Scholarships"
            desc={
              data.missingForMatching.length
                ? `Checked by the AlignTraits team. Add your ${data.missingForMatching.join(" and ")} in Profile and we will mark the ones that match you.`
                : "Checked by the AlignTraits team and matched to your state, class arm and course area. Switch on the ones you want deadline reminders for."
            }
          >
            {data.scholarships.length === 0 ? (
              <p className={s.fitText} style={{ marginTop: 18 }}>
                No scholarship is listed right now. We add them as we confirm each one on its official page.
              </p>
            ) : (
              <div className={s.schList}>
                {data.scholarships.map((x) => (
                  <div className={s.sch} key={x.id}>
                    <div className={s.schText}>
                      <p className={s.schName}>
                        {x.name}
                        <span className={`${s.badge} ${x.badge.tone === "match" ? s.badgeMatch : s.badgeNeutral}`}>{x.badge.label}</span>
                      </p>
                      <p className={s.schAmount}>{x.amount}</p>
                      <p className={s.schWhen}>
                        <span>
                          <CalendarClock size={16} aria-hidden="true" />
                          {x.when}
                        </span>
                        {x.link && (
                          <a href={x.link} target="_blank" rel="noopener noreferrer">
                            Official page <ExternalLink size={13} aria-hidden="true" />
                            <span className="sr-only">for {x.name} (opens in a new tab)</span>
                          </a>
                        )}
                      </p>
                    </div>
                    <Toggle checked={x.following} onChange={(v) => busyId !== x.id && toggleFollow(x.id, v)} label={`Deadline reminders for ${x.name}`} />
                  </div>
                ))}
              </div>
            )}
            <p className={s.hint} style={{ maxWidth: "none" }}>
              Reminders come by email, 7 days and 1 day before a confirmed closing date. A real scholarship never asks you to pay to apply.
            </p>
          </Section>

          <Section title="Money plans" desc="Ways to spread or reduce the cost.">
            <div className={s.planRow}>
              <div>
                <p className={s.planTitle}>Student loan (NELFUND)</p>
                <p className={s.planDesc}>Interest-free loan for fees at federal and state schools. Repayment starts two years after NYSC, once you are working.</p>
              </div>
              <Toggle
                checked={nelfund}
                onChange={(v) => {
                  setNelfund(v);
                  change({ nelfund: v });
                }}
                label="I am considering a NELFUND student loan"
              />
            </div>
            {nelfund && (
              <div className={`${s.banner} ${s.bannerInfo}`}>
                <Info size={20} aria-hidden="true" />
                <span>
                  {data.nelfund.privateSchools.length > 0
                    ? `NELFUND loans don’t cover private universities. ${listNames(data.nelfund.privateSchools, data.nelfund.morePrivate)} would still need to be paid in full.`
                    : data.nelfund.publicCount > 0
                      ? `${data.nelfund.publicCount === 1 ? "The school in your matches is a federal or state school" : `All ${data.nelfund.publicCount} schools in your matches are federal or state schools`}, where a NELFUND loan can apply.`
                      : "NELFUND loans don’t cover private universities. When you have matches, we will show which ones a loan cannot cover."}{" "}
                  You apply on NELFUND’s own portal, not through AlignTraits.
                </span>
              </div>
            )}
          </Section>
        </div>
      )}
      <SaveStatus state={state} errorText="Not saved. Check your connection and try again." />
    </SettingsPage>
  );
}
