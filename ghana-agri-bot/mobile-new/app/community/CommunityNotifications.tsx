// app/community/notifications.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications, NotificationItem } from '../../context/NotificationsContext';
import { useRouter } from 'expo-router';

const NotificationRow: React.FC<{ item: NotificationItem; onOpen: (i: NotificationItem) => void; onToggleRead: (id: string) => void; }> = ({ item, onOpen, onToggleRead }) => {
  const unread = !item.read;
  return (
    <TouchableOpacity style={[styles.row, unread && styles.unreadRow]} onPress={() => onOpen(item)}>
      <View style={styles.rowLeft}>
        <Ionicons name={item.type === 'system' ? 'information-circle' : 'chatbubble-ellipses'} size={24} color={unread ? '#10b981' : '#6b7280'} />
      </View>
      <View style={styles.rowCenter}>
        <Text style={[styles.rowTitle, unread && styles.rowTitleUnread]} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.rowSubtitle} numberOfLines={2}>{item.body}</Text>
      </View>
      <View style={styles.rowRight}>
        <TouchableOpacity onPress={() => onToggleRead(item.id)} style={styles.smallBtn}>
          <Ionicons name={item.read ? 'checkmark-done' : 'ellipsis-horizontal'} size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const CommunityNotificationsScreen = () => {
  const router = useRouter();
  const { notifications, loading, unreadCount, refresh, markRead, markAllRead } = useNotifications();

  const onOpen = useCallback(async (item: NotificationItem) => {
    // mark read and navigate depending on type
    await markRead(item.id);
    if (item.type === 'system') {
      router.push({ pathname: '/community/notificationDetail', params: { id: item.id } });
    } else if (item.postId) {
      router.push({ pathname: '/community/post/[id]', params: { id: item.postId } });
    } else if (item.communityId) {
      router.push({ pathname: '/community/[id]', params: { id: item.communityId } });
    } else {
      router.push({ pathname: '/community/notificationDetail', params: { id: item.id } });
    }
  }, [markRead, router]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/community/notificationSettings')} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={20} color="#10b981" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <NotificationRow item={item} onOpen={onOpen} onToggleRead={markRead} />
        )}
        refreshing={loading}
        onRefresh={refresh}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>You're all caught up</Text>
            <Text style={styles.emptySub}>No new notifications right now</Text>
          </View>
        )}
      />
    </View>
  );
};

export default CommunityNotificationsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  headerRow: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  unreadCount: { color: '#6b7280', marginRight: 12 },
  markAllBtn: { marginRight: 8 },
  markAllText: { color: '#10b981', fontWeight: '600' },
  settingsBtn: { padding: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#fff', padding: 12, borderRadius: 12 },
  unreadRow: { borderWidth: 1, borderColor: '#d1fae5' },
  rowLeft: { width: 40, alignItems: 'center' },
  rowCenter: { flex: 1, paddingHorizontal: 8 },
  rowTitle: { fontSize: 14, color: '#111827', fontWeight: '600' },
  rowTitleUnread: { color: '#0f766e' },
  rowSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  rowRight: { width: 40, alignItems: 'flex-end' },
  smallBtn: { padding: 6 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 12, fontWeight: '600' },
  emptySub: { fontSize: 13, color: '#9ca3af', marginTop: 6 },
});
