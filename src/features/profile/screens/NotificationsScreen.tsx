import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppIcon, C, PageHeader } from '../components/ProfileShared';
import { usePreferenceContext } from '@/shared/preferences';
import { notificationsApi } from '@/shared/api';
import { useAuth } from '@/shared/context/AuthContext';

export function NotificationsPage({ onBack }: { onBack: () => void }) {
  const { t, tx, theme } = usePreferenceContext();
  const { role, user } = useAuth();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notifData, setNotifData] = useState<
    { id: string; title: string; body: string; time: string }[]
  >([]);

  const fetchNotifications = () => {
    setLoading(true);
    notificationsApi.getAll(role ?? undefined, user?.id).then((res) => {
      const data = res.data ?? [];
      setNotifData(
        data.map((n: any) => ({
          id: String(n.id),
          title: n.title ?? '',
          body: n.message ?? n.body ?? '',
          time: n.sentAt
            ? new Date(n.sentAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recent',
        }))
      );
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, [role, user?.id]);

  const handleDelete = (id: string) => {
    Alert.alert(
      tx('Delete Notification'),
      'Are you sure you want to delete this notification?',
      [
        { text: tx('cancel'), style: 'cancel' },
        {
          text: tx('delete'),
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            try {
              await notificationsApi.delete(id);
              setNotifData((current) => current.filter((n) => n.id !== id));
              setReadIds((current) => current.filter((readId) => readId !== id));
            } catch (e) {
              Alert.alert('Error', 'Failed to delete notification');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const unreadCount = notifData.length - readIds.length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PageHeader title={t('notification')} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 32 }} />
        ) : notifData.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {tx('No notifications yet.')}
            </Text>
          </View>
        ) : (
          notifData.map((n) => (
            <TouchableOpacity
              key={n.id}
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
                readIds.includes(n.id) && { opacity: 0.65 },
              ]}
              onPress={() =>
                setReadIds((current) =>
                  current.includes(n.id) ? current : [...current, n.id]
                )
              }
              onLongPress={() => handleDelete(n.id)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrap}>
                <AppIcon name="notification" size={20} color={C.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: theme.textPrimary }]}>{n.title}</Text>
                  {!readIds.includes(n.id) && <View style={styles.unreadDot} />}
                </View>
                <Text style={[styles.sub, { color: theme.textMuted }]}>{n.body}</Text>
              </View>
              <View style={styles.metaColumn}>
                <Text style={[styles.meta, { color: theme.textMuted }]}>{n.time}</Text>
                {deletingId === n.id ? (
                  <ActivityIndicator color={theme.accent} size="small" style={{ marginTop: 4 }} />
                ) : (
                  <TouchableOpacity
                    onPress={() => handleDelete(n.id)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <AppIcon name="trash" size={16} color={C.error} />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, fontWeight: '800' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sub: { fontSize: 12, marginTop: 3 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary },
  meta: { fontSize: 11, fontWeight: '600' },
  metaColumn: { alignItems: 'flex-end', gap: 6 },
  deleteBtn: { padding: 4 },
  emptyCard: {
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
