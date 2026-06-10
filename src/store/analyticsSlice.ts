import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';
import { getApiErrorMessage } from '../utils/errors';
import type { AnalyticsRange, ChartDataPoint, BestTimeSlot, TopPost, AnalyticsSummary } from '../types/analytics';

interface AnalyticsState {
  charts: ChartDataPoint[] | null;
  bestTimes: BestTimeSlot[];
  topPosts: TopPost[];
  summary: AnalyticsSummary | null;
  loading: boolean;
  error: string | null;
}

export const fetchChartsThunk = createAsyncThunk<ChartDataPoint[], AnalyticsRange, { rejectValue: string }>(
  'analytics/fetchCharts',
  async (range, { rejectWithValue }) => {
    try {
      const res = await API.get(`/analytics/charts?range=${range}`);
      if (res.data.success) {
        return res.data.data as ChartDataPoint[];
      }
      return rejectWithValue('Failed to retrieve chart data.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to retrieve chart data.'));
    }
  }
);

export const fetchBestTimesThunk = createAsyncThunk<BestTimeSlot[], void, { rejectValue: string }>(
  'analytics/fetchBestTimes',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/analytics/best-times');
      if (res.data.success) {
        return res.data.data as BestTimeSlot[];
      }
      return rejectWithValue('Failed to retrieve best times.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to retrieve best times.'));
    }
  }
);

export const fetchTopPostsThunk = createAsyncThunk<TopPost[], void, { rejectValue: string }>(
  'analytics/fetchTopPosts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/analytics/top-posts');
      if (res.data.success) {
        return res.data.data as TopPost[];
      }
      return rejectWithValue('Failed to retrieve top posts.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to retrieve top posts.'));
    }
  }
);

export const fetchSummaryThunk = createAsyncThunk<AnalyticsSummary, void, { rejectValue: string }>(
  'analytics/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/analytics/summary');
      if (res.data.success) {
        return res.data.data as AnalyticsSummary;
      }
      return rejectWithValue('Failed to retrieve summary metrics.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to retrieve summary metrics.'));
    }
  }
);

const initialState: AnalyticsState = {
  charts: null,
  bestTimes: [],
  topPosts: [],
  summary: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChartsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChartsThunk.fulfilled, (state, action) => {
        state.charts = action.payload;
        state.loading = false;
      })
      .addCase(fetchChartsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(fetchBestTimesThunk.fulfilled, (state, action) => {
        state.bestTimes = action.payload;
      })
      .addCase(fetchTopPostsThunk.fulfilled, (state, action) => {
        state.topPosts = action.payload;
      })
      .addCase(fetchSummaryThunk.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export default analyticsSlice.reducer;
