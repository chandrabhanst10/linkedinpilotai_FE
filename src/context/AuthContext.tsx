import { createContext, useEffect, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch, useAppSelector } from '../store';
import { checkAuthThunk, loginThunk, signupThunk, logoutThunk, setUser } from '../store/authSlice';
import type { User, LoginResult, SignupResult } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  signup: (name: string, email: string, password: string) => Promise<SignupResult>;
  logout: () => void;
  setUser: (userData: User | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  setUser: () => {},
});

const AuthConsumer = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);

  return children;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <AuthConsumer>{children}</AuthConsumer>
    </Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const dispatch = useAppDispatch();
  const { user, loading, isAuthenticated } = useAppSelector((state) => state.auth);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const resultAction = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(resultAction)) {
      return { success: true };
    }
    const payload = resultAction.payload;
    if (payload?.isVerified === false) {
      return {
        success: false,
        isVerified: false,
        email: payload.email,
        message: payload.message || 'Please verify your email first.',
      };
    }
    return {
      success: false,
      message: payload?.message || 'Login failed. Invalid credentials.',
    };
  };

  const signup = async (name: string, email: string, password: string): Promise<SignupResult> => {
    const resultAction = await dispatch(signupThunk({ name, email, password }));
    if (signupThunk.fulfilled.match(resultAction)) {
      const payload = resultAction.payload;
      if (
        typeof payload === 'object' &&
        payload !== null &&
        'isVerified' in payload &&
        payload.isVerified === false
      ) {
        const pending = payload as { isVerified: false; email: string; message: string };
        return {
          success: true,
          isVerified: false,
          message: pending.message || 'Registration successful. Verification email sent.',
          email,
        };
      }
      return { success: true };
    }
    return {
      success: false,
      message: resultAction.payload?.message || 'Registration failed.',
    };
  };

  const logout = (): void => {
    dispatch(logoutThunk());
  };

  const triggerSetUser = (userData: User | null): void => {
    dispatch(setUser(userData));
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    setUser: triggerSetUser,
  };
};

export default AuthContext;
