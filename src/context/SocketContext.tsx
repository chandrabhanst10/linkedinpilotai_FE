import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useAuth } from './AuthContext';
import {
  fetchNotificationsThunk,
  markAsReadThunk,
  markAllAsReadThunk,
  addNotification,
} from '../store/notificationsSlice';
import type { Notification } from '../types/notifications';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface SocketContextValue {
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  notifications: [],
  unreadCount: 0,
  fetchNotifications: () => {},
  markRead: () => {},
  markAllRead: () => {},
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.notifications);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  const fetchNotifications = () => {
    if (!user) return;
    dispatch(fetchNotificationsThunk());
  };

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';
    
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
    });

    socketInstance.on('notification', (notification: Notification) => {
      console.log('Received notification event:', notification);
      dispatch(addNotification(notification));
      setActiveNotification(notification);
      setToastOpen(true);
    });

    setSocket(socketInstance);
    fetchNotifications();

    return () => {
      socketInstance.disconnect();
    };
  }, [user, dispatch]);

  const markRead = (id: string) => {
    dispatch(markAsReadThunk(id));
  };

  const markAllRead = () => {
    dispatch(markAllAsReadThunk());
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        fetchNotifications,
        markRead,
        markAllRead,
      }}
    >
      {children}
      
      {activeNotification && (
        <Snackbar
          open={toastOpen}
          autoHideDuration={6000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseToast}
            severity={(activeNotification.type as 'success' | 'error' | 'info' | 'warning') || 'info'}
            variant="filled"
            sx={{ width: '100%', borderRadius: '8px' }}
          >
            <strong>{activeNotification.title}</strong>
            <div>{activeNotification.message}</div>
          </Alert>
        </Snackbar>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
