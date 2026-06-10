import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';
import { getApiErrorMessage } from '../utils/errors';
import type { AdminStats, AdminUser, FailedJob } from '../types/admin';

interface AdminState {
  stats: AdminStats | null;
  users: AdminUser[];
  failedJobs: FailedJob[];
  loading: boolean;
  error: string | null;
}

export const fetchAdminStatsThunk = createAsyncThunk<AdminStats, void, { rejectValue: string }>(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/admin/stats');
      if (res.data.success) {
        return res.data.data as AdminStats;
      }
      return rejectWithValue('Failed to retrieve admin stats.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to retrieve admin stats.'));
    }
  }
);

export const fetchAdminUsersThunk = createAsyncThunk<AdminUser[], void, { rejectValue: string }>(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) {
        return res.data.data as AdminUser[];
      }
      return rejectWithValue('Failed to retrieve users list.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to retrieve users list.'));
    }
  }
);

export const fetchAdminFailedJobsThunk = createAsyncThunk<FailedJob[], void, { rejectValue: string }>(
  'admin/fetchFailedJobs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/admin/failed-jobs');
      if (res.data.success) {
        return res.data.data as FailedJob[];
      }
      return rejectWithValue('Failed to retrieve failed jobs.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to retrieve failed jobs.'));
    }
  }
);

export const deleteAdminUserThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'admin/deleteUser',
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        dispatch(fetchAdminUsersThunk());
        dispatch(fetchAdminStatsThunk());
        return userId;
      }
      return rejectWithValue('Failed to delete user.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete user.'));
    }
  }
);

export const updateAdminUserRoleThunk = createAsyncThunk<
  { userId: string; role: string },
  { userId: string; role: string },
  { rejectValue: string }
>(
  'admin/updateUserRole',
  async ({ userId, role }, { dispatch, rejectWithValue }) => {
    try {
      const res = await API.put(`/admin/users/${userId}/role`, { role });
      if (res.data.success) {
        dispatch(fetchAdminUsersThunk());
        return { userId, role };
      }
      return rejectWithValue('Failed to update user role.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update user role.'));
    }
  }
);

const initialState: AdminState = {
  stats: null,
  users: [],
  failedJobs: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStatsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStatsThunk.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdminStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(fetchAdminUsersThunk.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchAdminFailedJobsThunk.fulfilled, (state, action) => {
        state.failedJobs = action.payload;
      });
  },
});

export default adminSlice.reducer;
