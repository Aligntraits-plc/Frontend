export interface User {
  id?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  image?: string | null | File;
  password?: string;
  username?: string | null;
  emailVerified?: string;
  role?: string | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
  gender?: string | null;
  dob?: string | null;
  ageRange?: string | null;
  region?: string | null;
  bio?: string | null;
  currentSkill?: string | null;
  courseOfInterest?: string | null;
  transactions?: Transaction[];
  payment_plan?: string;
  userCards?: PaymentMethod[];
  payment_plan_expires_at?: string;
  careerResults?: any;
  isCareerPathChecked?: boolean;
  subscriptionPlanStatus?: boolean;
  // Set when a partner school's code covers this student.
  schoolAccess?: { schoolName: string; expiresAt: string } | null;
  //   provider?: 'email' | 'google' | 'facebook' | 'apple';
}

export interface PaymentMethod {
  id: string;
  authorization_code: string;
  brand: string;
  createdAt: string;
  email_token: string | null;
  exp_month: string;
  exp_year: string;
  last4: string;
  next_payment_date: string | null;
  reusable: boolean;
  subscription_code: string | null;
  subscription_status: string | null;
  updatedAt: string;
  userId: string;
}

export interface Transaction {
  id: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  paymentPlan: string;
  currency: string;
  schoolLocation: string;
}

export interface AuthResponse {
  status: number;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  firstname: string;
  lastname: string;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
