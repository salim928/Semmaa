// context/NotificationsContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import Alert from 'react-native';
import { apiService } from '../config/api';

export type NotificationItem = {
  id: string;
  type: 'post' | 'reply' | 'mention' | 'system' | 'community';
  title: string;
  body?: string;
  communityId?: string;
  postId?: string;
  createdAt: string;
  read?: boolean;
  meta?: any;
};

type Settings = {
  mutedCommunities: Record<string, boolean>;
  frequency: 'immediate' | 'daily' | 'weekly';
};

type NotificationsContextValue = {
  notifications: NotificationItem[];
  loading: boolean;
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  muteCommunity: (communityId: string, mute: boolean) => Promise<void>;
  settings: Settings;
  setFrequency: (f: Settings['frequency']) => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined
);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    mutedCommunities: {},
    frequency: 'immediate',
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      if (apiService.getCommunityNotifications) {
        const res = await apiService.getCommunityNotifications(); // expected to return { notifications: [...] }
        setNotifications(res.notifications || []);
      } else {
        // fallback mock
        setNotifications([
          {
            id: 'n_sys_1',
            type: 'system',
            title: 'Welcome to SemmaAI Communities',
            body: 'Enable notifications to get the latest replies and mentions.',
            createdAt: new Date().toISOString(),
            read: false,
          },
          {
            id: 'n_post_1',
            type: 'reply',
            title: 'New reply in Maize Farmers Ghana',
            body: 'Kwame replied: "Great harvest!"',
            communityId: '1',
            postId: 'p_123',
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            read: false,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // optionally start polling or subscribe to push notifications
  }, []);

  const refresh = async () => {
    await fetchNotifications();
  };

  const markRead = async (id: string) => {
    try {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      if (apiService.markNotificationRead) {
        await apiService.markNotificationRead(id);
      }
    } catch (error) {
      console.error('markRead error', error);
    }
  };

  const markAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (apiService.markAllNotificationsRead) {
        await apiService.markAllNotificationsRead();
      }
    } catch (error) {
      console.error('markAllRead error', error);
    }
  };

  const muteCommunity = async (communityId: string, mute: boolean) => {
    try {
      setSettings(prev => ({
        ...prev,
        mutedCommunities: { ...prev.mutedCommunities, [communityId]: mute },
      }));
      if (apiService.muteCommunity) {
        await apiService.muteCommunity(communityId, mute);
      }
    } catch (error) {
      console.error('muteCommunity error', error);
      Alert.alert('Error', 'Failed to update mute setting');
    }
  };

  const setFrequency = async (frequency: Settings['frequency']) => {
    setSettings(prev => ({ ...prev, frequency }));
    if (apiService.setNotificationFrequency) {
      try {
        await apiService.setNotificationFrequency(frequency);
      } catch (error) {
        console.error('setFrequency error', error);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        loading,
        unreadCount,
        refresh,
        markRead,
        markAllRead,
        muteCommunity,
        settings,
        setFrequency,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};
