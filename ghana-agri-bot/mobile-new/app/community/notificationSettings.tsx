// app/community/notificationSettings.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, FlatList } from 'react-native';
import { useNotifications } from '../../context/NotificationsContext';
import { Ionicons } from '@expo/vector-icons';

const frequencies = [
  { key: 'immediate', label: 'Immediate' },
  { key: 'daily', label: 'Daily Digest' },
  { key: 'weekly', label: 'Weekly Digest' },
];

const NotificationSettingsScreen = () => {
  const { notifications, settings, muteCommunity, setFrequency } = useNotifications();
  const [localFreq, setLocalFreq] = useState(settings.frequency);

  // derive unique communities from notifications
  const communities = useMemo(() => {
    const map = new Map<string, { id: string; name?: string; muted?: boolean }>();
    notifications.forEach(n => {
      if (n.communityId) {
        if (!map.has(n.communityId)) {
          map.set(n.communityId, { id: n.communityId, name: `Community ${n.communityId}`, muted: settings.mutedCommunities[n.communityId] });
        }
      }
    });
    return Array.from(map.values());
  }, [notifications, settings]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
        <Text style={styles.subtitle}>Control what you receive and how often</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Frequency</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {frequencies.map(f => (
            <TouchableOpacity
              key={f.key}
              onPress={() => {
                setLocalFreq(f.key as any);
                setFrequency(f.key as any);
              }}
              style={[styles.freqButton, localFreq === f.key && styles.freqButtonActive]}
            >
              <Text style={[styles.freqText, localFreq === f.key && styles.freqTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Muted Communities</Text>
        {communities.length === 0 ? (
          <Text style={styles.smallNote}>No community-specific notifications yet</Text>
        ) : (
          <FlatList
            data={communities}
            keyExtractor={c => c.id}
            renderItem={({ item }) => (
              <View style={styles.communityRow}>
                <Text style={styles.communityName}>{item.name}</Text>
                <Switch
                  value={!!settings.mutedCommunities[item.id]}
                  onValueChange={(v) => muteCommunity(item.id, v)}
                />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default NotificationSettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  header: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 4 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  freqButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  freqButtonActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  freqText: { color: '#374151' },
  freqTextActive: { color: '#fff', fontWeight: '700' },
  smallNote: { color: '#6b7280', marginTop: 8 },
  communityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  communityName: { fontSize: 14, color: '#111827' },
});
