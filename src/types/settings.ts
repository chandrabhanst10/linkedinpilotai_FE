import type { PlanLimits } from './auth';

export interface BillingInfo {
  plan: string;
  status: string;
  expiresAt?: string;
  limits: PlanLimits;
}

export interface LinkedInProfileSettings {
  name?: string;
  email?: string;
}
