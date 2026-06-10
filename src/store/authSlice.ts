import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';
import { getApiErrorMessage } from '../utils/errors';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface SignupCredentials extends AuthCredentials {
  name: string;
}

interface AuthRejectPayload {
  message?: string;
  isVerified?: boolean;
  email?: string;
}

export const checkAuthThunk = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/auth/me');
      if (response.data.success) {
        return response.data.user as User;
      }
      return rejectWithValue('Failed to retrieve user info');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Session verification failed'));
    }
  }
);

export const loginThunk = createAsyncThunk<User, AuthCredentials, { rejectValue: AuthRejectPayload }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data.success) {
        return response.data.user as User;
      }
      return rejectWithValue({ message: 'Login failed' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: AuthRejectPayload } };
      const errorData = err.response?.data;
      if (errorData?.isVerified === false) {
        return rejectWithValue({
          isVerified: false,
          email: errorData.email,
          message: errorData.message || 'Please verify your email first.',
        });
      }
      return rejectWithValue({
        message: errorData?.message || 'Login failed. Invalid credentials.',
      });
    }
  }
);

export const signupThunk = createAsyncThunk<User | { isVerified: false; email: string; message: string }, SignupCredentials, { rejectValue: AuthRejectPayload }>(
  'auth/signup',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/register', { name, email, password });
      if (response.data.success) {
        if (response.data.isVerified === false) {
          return {
            isVerified: false as const,
            email,
            message: response.data.message || 'Registration successful. Verification email sent.',
          };
        }
        return response.data.user as User;
      }
      return rejectWithValue({ message: 'Registration failed.' });
    } catch (error: unknown) {
      return rejectWithValue({
        message: getApiErrorMessage(error, 'Registration failed.'),
      });
    }
  }
);

export const logoutThunk = createAsyncThunk<void, void>(
  'auth/logout',
  async () => {
    try {
      await API.post('/auth/logout');
    } catch (error: unknown) {
      console.warn('API logout warn:', getApiErrorMessage(error, 'Logout failed'));
    }
  }
);

const initialState: AuthState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: { payload: User | null }) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(checkAuthThunk.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      .addCase(signupThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupThunk.fulfilled, (state, action) => {
        if ('isVerified' in action.payload && action.payload.isVerified === false) {
          state.loading = false;
          state.user = null;
          state.isAuthenticated = false;
        } else {
          state.user = action.payload as User;
          state.isAuthenticated = true;
          state.loading = false;
        }
        state.error = null;
      })
      .addCase(signupThunk.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload?.message || 'Signup failed';
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
