import type { UserRole } from './auth';

export interface AdminStats {
  counters: {
    totalUsers: number;
    totalPosts: number;
    totalActiveSched: number;
    totalFailed: number;
  };
  systemHealth: {
    db?: string;
    redis?: string;
    queue?: string;
    worker?: string;
    cpuUsage: number;
    memoryUsage: number;
    uptime: number;
    platform: string;
    arch: string;
  };
  subscriptions: {
    free: number;
    pro: number;
    agency: number;
  };
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt?: string;
}

export interface FailedJob {
  _id: string;
  content: string;
  status: string;
  error?: string;
  scheduledTime: string;
  user?: { name?: string; email?: string };
}
