export type UserRole = 'user' | 'admin';

export interface PlanLimits {
  accountsLimit: number;
  postsPerMonth: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: UserRole;
  plan?: string;
  status?: string;
  expiresAt?: string;
  limits?: PlanLimits;
  isVerified?: boolean;
}

export interface LoginResult {
  success: boolean;
  isVerified?: boolean;
  email?: string;
  message?: string;
}

export interface SignupResult extends LoginResult {}

export type OAuthProvider = 'google' | 'linkedin';
