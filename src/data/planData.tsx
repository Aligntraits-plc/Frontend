export interface PlanDetail {
  id: string;
  planKey: string; // matches the backend PaymentPlan enum / user.payment_plan
  label: string; // "Monthly" | "Through your school" | "One-time"
  title: string;
  tier: string; // "Silver" | "Gold" | "School" | "Basic"
  nairaPrice: string;
  dollarPrice: string;
  benefits: string[];
  highlighted: boolean;
}

// Single source of truth for plan names, prices and benefits.
// The naira prices MUST match PRICES in the backend (monthlyPaymentService.ts):
// LOCAL_MONTHLY = 370000 kobo, GLOBAL_MONTHLY = 550000 kobo.

const LOCAL_MONTHLY: PlanDetail = {
  id: "silver",
  planKey: "LOCAL_MONTHLY",
  label: "Monthly",
  title: "Local Access Plan",
  tier: "Silver",
  nairaPrice: "₦3,700",
  dollarPrice: "$2.71",
  benefits: [
    "Unlimited checks within 1 country",
    "Loan information & course access",
    "Editable exam records",
  ],
  highlighted: true,
};

const GLOBAL_MONTHLY: PlanDetail = {
  id: "gold",
  planKey: "GLOBAL_MONTHLY",
  label: "Monthly",
  title: "Global Access Plan",
  tier: "Gold",
  nairaPrice: "₦5,500",
  dollarPrice: "$4.03",
  benefits: [
    "Access to all country/schools",
    "Loan information & course access",
    "Editable exam records",
    "Scholarships, global support",
    "New school priority access",
  ],
  highlighted: false,
};

// Students whose school partners with AlignTraits enter the school's code
// instead of paying. Never charged.
export const SCHOOL_PLAN: PlanDetail = {
  id: "school",
  planKey: "SCHOOL_PARTNER",
  label: "Through your school",
  title: "School Partner Plan",
  tier: "School",
  nairaPrice: "Paid by your school",
  dollarPrice: "",
  benefits: [
    "Every feature AlignTraits releases",
    "For students whose school partners with AlignTraits",
    "Covered while your school's code is valid",
  ],
  highlighted: false,
};

// No longer sold. Kept so students who bought it still see their plan.
const BASIC_ONETIME: PlanDetail = {
  id: "basic",
  planKey: "BASIC_ONETIME",
  label: "One-time",
  title: "Basic One-Time Plan",
  tier: "Basic",
  nairaPrice: "₦1,100",
  dollarPrice: "$0.81",
  benefits: [
    "One result only",
    "No future updates",
    "No access to scholarships",
    "No access to loan information",
  ],
  highlighted: false,
};

// The plans a student can pay for. The school card is added next to these.
export const PLAN_LIST: PlanDetail[] = [LOCAL_MONTHLY, GLOBAL_MONTHLY];

// Every plan a student can have, for showing their current plan.
export const PLAN_DETAILS: Record<string, PlanDetail> = {
  BASIC_ONETIME,
  LOCAL_MONTHLY,
  GLOBAL_MONTHLY,
  SCHOOL_PARTNER: SCHOOL_PLAN,
};
