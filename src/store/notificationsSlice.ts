import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';
import { getApiErrorMessage } from '../utils/errors';
import type { Notification } from '../types/notifications';

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

export const fetchNotificationsThunk = createAsyncThunk<Notification[], void, { rejectValue: string }>(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/notifications');
      if (response.data.success) {
        return response.data.data as Notification[];
      }
      return rejectWithValue('Failed to retrieve notifications.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to retrieve notifications.'));
    }
  }
);

export const markAsReadThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.put(`/notifications/${id}/read`);
      if (response.data.success) {
        return id;
      }
      return rejectWithValue('Failed to mark notification as read.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to mark notification as read.'));
    }
  }
);

export const markAllAsReadThunk = createAsyncThunk<true, void, { rejectValue: string }>(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.put('/notifications/read-all');
      if (response.data.success) {
        return true;
      }
      return rejectWithValue('Failed to mark all as read.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to mark all as read.'));
    }
  }
);

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: { payload: Notification }) => {
      state.notifications.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(markAsReadThunk.fulfilled, (state, action) => {
        const notif = state.notifications.find((n) => n._id === action.payload);
        if (notif) {
          notif.isRead = true;
        }
      })
      .addCase(markAllAsReadThunk.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
      });
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
