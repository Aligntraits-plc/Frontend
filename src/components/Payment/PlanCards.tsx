import { Check } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { PLAN_LIST, SCHOOL_PLAN, type PlanDetail } from "../../data/planData";
import s from "./PlanCards.module.css";

interface PlanCardsProps {
  /** Starts payment for a monthly plan. */
  onSelectPlan: (planKey: string) => void;
  /** Opens the school code step. */
  onProvideCode: () => void;
  /** The plan being started right now, to show a spinner on its button. */
  loadingPlanKey?: string | null;
  /** The student's active plan, if any, so it can't be bought twice. */
  currentPlanKey?: string | null;
  plans?: PlanDetail[];
}

// The two monthly plans plus the School card, used on the plan page, in the
// dashboard's Subscription tab and in the paywall pop-up.
export default function PlanCards({
  onSelectPlan,
  onProvideCode,
  loadingPlanKey = null,
  currentPlanKey = null,
  plans = PLAN_LIST,
}: PlanCardsProps) {
  const covered = currentPlanKey === SCHOOL_PLAN.planKey;

  return (
    <div className={s.wrap}>
      <div className={s.grid}>
        {plans.map((plan) => {
          const isCurrent = currentPlanKey === plan.planKey;
          const isLoading = loadingPlanKey === plan.planKey;
          return (
            <article
              key={plan.planKey}
              className={[s.card, plan.highlighted ? s.featured : "", isCurrent ? s.current : ""].join(" ")}
              aria-label={`${plan.title}, ${plan.nairaPrice} per month`}
            >
              <span className={s.label}>{plan.label}</span>
              <h3 className={s.title}>{plan.title}</h3>
              <p className={s.tier}>{plan.tier}</p>
              <div className={s.divider} />
              <ul className={s.benefits}>
                {plan.benefits.map((benefit) => (
                  <li key={benefit}>
                    <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className={s.price}>
                <span className={s.amount}>{plan.nairaPrice}</span>
                <span className={s.per}>per month · {plan.dollarPrice}</span>
              </div>
              <button
                type="button"
                className={s.button}
                disabled={isCurrent || isLoading}
                onClick={() => onSelectPlan(plan.planKey)}
              >
                {isLoading ? (
                  <BeatLoader size={8} color={plan.highlighted ? "#1C1C1C" : "#FFFFFF"} />
                ) : isCurrent ? (
                  "Your current plan"
                ) : (
                  `Choose ${plan.tier}`
                )}
              </button>
            </article>
          );
        })}

        <article
          className={[s.card, s.school, covered ? s.current : ""].join(" ")}
          aria-label="School Partner Plan, paid by your school"
        >
          <span className={s.label}>{SCHOOL_PLAN.label}</span>
          <h3 className={s.title}>{SCHOOL_PLAN.title}</h3>
          <p className={s.tier}>{SCHOOL_PLAN.tier}</p>
          <div className={s.divider} />
          <ul className={s.benefits}>
            {SCHOOL_PLAN.benefits.map((benefit) => (
              <li key={benefit}>
                <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <div className={s.price}>
            <span className={s.schoolAmount}>{SCHOOL_PLAN.nairaPrice}</span>
          </div>
          <button type="button" className={s.button} onClick={onProvideCode} disabled={covered}>
            {covered ? "Covered by your school" : "Provide code"}
          </button>
        </article>
      </div>
    </div>
  );
}
