import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';
import { getApiErrorMessage } from '../utils/errors';
import type { LinkedInAccount, ConnectAccountPayload } from '../types/accounts';

interface AccountsState {
  accounts: LinkedInAccount[];
  loading: boolean;
  error: string | null;
}

export const fetchAccountsThunk = createAsyncThunk<LinkedInAccount[], void, { rejectValue: string }>(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/accounts');
      if (res.data.success) {
        return res.data.data as LinkedInAccount[];
      }
      return rejectWithValue('Failed to fetch accounts.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch accounts.'));
    }
  }
);

export const connectAccountThunk = createAsyncThunk<LinkedInAccount, ConnectAccountPayload, { rejectValue: string }>(
  'accounts/connectAccount',
  async ({ name, avatar }, { dispatch, rejectWithValue }) => {
    try {
      const res = await API.post('/accounts/connect', { name, avatar });
      if (res.data.success) {
        dispatch(fetchAccountsThunk());
        return res.data.data as LinkedInAccount;
      }
      return rejectWithValue('Failed to connect profile.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to connect profile.'));
    }
  }
);

export const disconnectAccountThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'accounts/disconnectAccount',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await API.delete(`/accounts/${id}`);
      if (res.data.success) {
        dispatch(fetchAccountsThunk());
        return id;
      }
      return rejectWithValue('Failed to disconnect profile.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to disconnect profile.'));
    }
  }
);

const initialState: AccountsState = {
  accounts: [],
  loading: false,
  error: null,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountsThunk.fulfilled, (state, action) => {
        state.accounts = action.payload;
        state.loading = false;
      })
      .addCase(fetchAccountsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      });
  },
});

export default accountsSlice.reducer;
