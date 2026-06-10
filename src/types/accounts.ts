export type AccountStatus = 'active' | 'expired' | 'disconnected';

export interface LinkedInAccount {
  _id: string;
  name: string;
  avatar: string;
  linkedinId: string;
  status: AccountStatus | string;
  expiresAt?: string;
}

export interface ConnectAccountPayload {
  name: string;
  avatar?: string;
}
