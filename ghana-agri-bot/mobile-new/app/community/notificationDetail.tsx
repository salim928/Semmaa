// app/community/notificationDetail.tsx
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useNotifications } from '../../context/NotificationsContext';
import { Ionicons } from '@expo/vector-icons';

const NotificationDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notifications, markRead } = useNotifications();

  const notification = useMemo(() => notifications.find(n => n.id === id), [notifications, id]);

  useEffect(() => {
    if (notification && !notification.read) {
      markRead(notification.id);
    }
  }, [notification, markRead]);

  if (!notification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Notification not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name={notification.type === 'system' ? 'information-circle' : 'chatbubble-ellipses'} size={36} color="#10b981" />
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.date}>{new Date(notification.createdAt).toLocaleString()}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.bodyText}>{notification.body || 'No additional details.'}</Text>
        {/* If there are meta details — show them */}
        {notification.meta && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Details</Text>
            <Text style={{ color: '#374151' }}>{JSON.stringify(notification.meta, null, 2)}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default NotificationDetail;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f9fafb', minHeight: '100%' },
  header: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  date: { fontSize: 12, color: '#6b7280', marginTop: 6 },
  body: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  bodyText: { color: '#374151', lineHeight: 20 },
});
