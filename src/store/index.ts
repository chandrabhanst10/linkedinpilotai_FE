import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import accountsReducer from './accountsSlice';
import postsReducer from './postsSlice';
import analyticsReducer from './analyticsSlice';
import adminReducer from './adminSlice';
import notificationsReducer from './notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    posts: postsReducer,
    analytics: analyticsReducer,
    admin: adminReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { useAppDispatch, useAppSelector } from './hooks';
