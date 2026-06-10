import type { ApiErrorShape } from '../types/api';

const hasResponseData = (error: object): error is ApiErrorShape =>
  'response' in error &&
  typeof (error as ApiErrorShape).response === 'object';

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  if (typeof error === 'object' && error !== null) {
    if (hasResponseData(error)) {
      return error.response?.data?.message ?? fallback;
    }
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }
  return fallback;
};
