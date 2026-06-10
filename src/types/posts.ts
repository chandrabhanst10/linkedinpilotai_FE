import type { LinkedInAccount } from './accounts';

export type PostStatus =
  | 'draft'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'posted'
  | 'failed';

export interface PostMedia {
  url: string;
  type: 'image' | 'video';
  publicId?: string;
}

export interface Post {
  _id: string;
  content: string;
  status: PostStatus | string;
  scheduledTime: string;
  linkedinAccounts: (LinkedInAccount | string)[];
  media?: PostMedia[];
  error?: string;
  screenshotUrl?: string;
  publishedAt?: string | null;
  linkedinPostUrn?: string;
}

export interface PostPayload {
  content: string;
  scheduledTime: string;
  status: string;
  linkedinAccounts: string[];
  media: PostMedia[];
}

export interface FetchPostsParams {
  tab?: string;
  search?: string;
  limit?: number;
  page?: number;
}

export type PostAction = 'delete' | 'duplicate' | 'retry';
