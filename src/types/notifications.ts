export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType | string;
  isRead: boolean;
  createdAt?: string;
}
