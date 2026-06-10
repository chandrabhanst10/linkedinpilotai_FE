export type AnalyticsRange = '7d' | '30d' | '90d';

export interface ChartDataPoint {
  date?: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

export interface BestTimeSlot {
  day: string;
  hour: string;
  score: number;
}

export interface LinkedInAccountSummary {
  name?: string;
  avatar?: string;
}

export interface UpcomingPostSummary {
  _id: string;
  content: string;
  scheduledTime: string;
  linkedinAccounts: LinkedInAccountSummary[];
}

export type PostActivityStatus = 'published' | 'posted' | 'failed';

export interface ActivityFeedItem {
  _id: string;
  content: string;
  status: PostActivityStatus;
  updatedAt: string;
}

export interface TopPost {
  _id: string;
  content: string;
  metrics: {
    impressions: number;
    likes: number;
    comments?: number;
    shares?: number;
  };
  accounts: LinkedInAccountSummary[];
}

export interface AnalyticsSummary {
  stats: {
    total: number;
    scheduled: number;
    published: number;
    failed: number;
  };
  upcoming: UpcomingPostSummary[];
  activities: ActivityFeedItem[];
}
