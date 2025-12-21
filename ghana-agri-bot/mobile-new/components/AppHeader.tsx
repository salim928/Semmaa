// components/AppHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications } from '../context/NotificationsContext';

const AppHeader: React.FC<{ title?: string; subtitle?: string }> = ({ title, subtitle }) => {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{title ?? 'SemmaAI'}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.right}>
        <TouchableOpacity onPress={() => router.push('/community/notifications')} style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#10b981',
    paddingTop: 42,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  right: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    minWidth: 18,
    paddingHorizontal: 5,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

export default AppHeader;
