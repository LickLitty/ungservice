import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { NotificationService } from '../services/notificationService';
import { Notification } from '../types';
import toast from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to notifications when user is logged in
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const unsubscribe = NotificationService.subscribeToNotifications(
      currentUser.id,
      (newNotifications) => {
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.isRead).length);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  // Request notification permission
  const requestPermission = async () => {
    try {
      const token = await NotificationService.requestPermission();
      if (token) {
        toast.success('Varsler aktivert!');
      } else {
        toast.error('Kunne ikke aktivere varsler');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Kunne ikke aktivere varsler');
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Kunne ikke markere som lest');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      await NotificationService.markAllAsRead(currentUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Kunne ikke markere alle som lest');
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    requestPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 