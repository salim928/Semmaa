import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/ui/Card';
import { formatRelativeTime } from '../utils/helpers';
import { apiService } from '../config/api';
import { useRouter } from 'expo-router';

interface Notification {
  id: string;
  type: 'order' | 'price' | 'weather' | 'pest' | 'system' | 'chat' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionType?: string;
  actionData?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  icon?: string;
  color?: string;
}

const NotificationsScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from API
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'order',
          title: 'New Order Received!',
          message: 'John Mensah wants to buy 50kg of tomatoes',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: false,
          actionType: 'order_detail',
          priority: 'high',
          icon: 'basket',
          color: '#28a745',
        },
        {
          id: '2',
          type: 'price',
          title: 'Price Alert: Maize',
          message: 'Maize prices increased by 15% in Kumasi market',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false,
          actionType: 'market',
          priority: 'medium',
          icon: 'trending-up',
          color: '#ffc107',
        },
        {
          id: '3',
          type: 'weather',
          title: 'Heavy Rain Alert',
          message: 'Heavy rainfall expected tomorrow. Protect your harvest',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          read: true,
          actionType: 'weather',
          priority: 'urgent',
          icon: 'rainy',
          color: '#17a2b8',
        },
        {
          id: '4',
          type: 'pest',
          title: 'Pest Warning',
          message: 'Fall armyworm detected in your area. Take preventive measures',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          read: true,
          actionType: 'advice',
          priority: 'high',
          icon: 'warning',
          color: '#dc3545',
        },
        {
          id: '5',
          type: 'reminder',
          title: 'Fertilizer Application Due',
          message: 'Time to apply second round of fertilizer for your maize',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          read: true,
          actionType: 'task',
          priority: 'medium',
          icon: 'calendar',
          color: '#6f42c1',
        },
        {
          id: '6',
          type: 'system',
          title: 'Welcome to SemmaAI!',
          message: 'Get started with AI-powered farming advice',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          read: true,
          priority: 'low',
          icon: 'information-circle',
          color: '#6c757d',
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (id: string) => {
    try {
      await apiService.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            try {
              await apiService.markAllNotificationsRead();
              setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to mark all as read');
            }
          },
        },
      ]
    );
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on action type using Expo Router
    switch (notification.actionType) {
      case 'order_detail':
        router.push('/orders');
        break;
      case 'market':
        router.push('/(tabs)/market');
        break;
      case 'weather':
        router.push('/(tabs)/insights');
        break;
      case 'advice':
      case 'chat':
        router.push('/ChatScreen');
        break;
      default:
        // Just mark as read
        break;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.read);

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      className={`mb-3 ${!item.read ? 'opacity-100' : 'opacity-75'}`}
    >
      <Card className={!item.read ? 'border-l-4 border-primary' : ''}>
        <View className="flex-row">
          {/* Icon */}
          <View
            className="w-12 h-12 rounded-full justify-center items-center mr-3"
            style={{ backgroundColor: (item.color || '#006400') + '20' }}
          >
            <Ionicons
              name={item.icon as any || 'notifications'}
              size={24}
              color={item.color || '#006400'}
            />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1">
              <Text className={`font-semibold text-textPrimary flex-1 ${
                !item.read ? 'font-bold' : ''
              }`}>
                {item.title}
              </Text>
              {!item.read && (
                <View className="w-2 h-2 bg-primary rounded-full ml-2" />
              )}
            </View>

            <Text className="text-sm text-textSecondary mb-2">
              {item.message}
            </Text>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-textMuted">
                {formatRelativeTime(item.timestamp)}
              </Text>

              {item.priority === 'urgent' && (
                <View className="px-2 py-0.5 bg-error/10 rounded-full">
                  <Text className="text-xs text-error">Urgent</Text>
                </View>
              )}
            </View>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={() => deleteNotification(item.id)}
            className="p-2"
          >
            <Ionicons name="close" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-borderColor">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-semibold text-textPrimary">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Text className="text-sm text-primary">
                {unreadCount} unread
              </Text>
            )}
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              className="px-3 py-1 bg-gray-100 rounded-lg"
            >
              <Text className="text-sm text-textSecondary">
                {filter === 'all' ? 'All' : 'Unread'}
              </Text>
            </TouchableOpacity>

            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={markAllAsRead}
                className="px-3 py-1 bg-primary/10 rounded-lg"
              >
                <Text className="text-sm text-primary">Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Notification Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white px-4 py-2 border-b border-borderColor"
      >
        {[
      { type: 'all', icon: 'notifications', label: 'All' },
      { type: 'order', icon: 'basket', label: 'Orders' },
      { type: 'price', icon: 'trending-up', label: 'Prices' },
      { type: 'weather', icon: 'cloud', label: 'Weather' },
      { type: 'pest', icon: 'warning', label: 'Alerts' },
    ].map((cat) => (
      <TouchableOpacity key={cat.type} className="mr-4 py-1">
        <View className="flex-row items-center">
          <Ionicons name={cat.icon as any} size={16} color="#666" />
          <Text className="text-sm text-textSecondary ml-1">{cat.label}</Text>
        </View>
      </TouchableOpacity>
    ))}
      </ScrollView>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
            <Text className="text-textMuted mt-4">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;
