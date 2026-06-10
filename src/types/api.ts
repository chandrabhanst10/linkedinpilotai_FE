import type { User } from './auth';

export interface ApiSuccessResponse<T = void> {
  success: true;
  data?: T;
  message?: string;
  user?: User;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  isVerified?: boolean;
  email?: string;
}

export interface ApiErrorShape {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
  message?: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
