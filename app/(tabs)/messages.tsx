import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import { GET_MY_CONVERSATIONS, MConversation, MParticipant } from '../../src/graphql/messaging';

function initials(p?: MParticipant): string {
  const n = p?.name?.trim();
  if (!n) return '?';
  return n.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();
}

function timeLabel(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

export default function MessagesScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const { data, loading, refetch } = useQuery<{ getMyConversations: MConversation[] }>(GET_MY_CONVERSATIONS, {
    skip: !isAuthenticated,
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network',
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Ionicons name="chatbubbles-outline" size={48} color={COLORS.zinc300} />
        <Text style={styles.emptyText}>{t.messages.loginRequired}</Text>
        <Pressable style={styles.loginBtn} onPress={() => router.push('/login')}>
          <Text style={styles.loginBtnText}>{t.headers.signIn}</Text>
        </Pressable>
      </View>
    );
  }

  const conversations = data?.getMyConversations ?? [];
  const other = (c: MConversation): MParticipant => (c.buyer.id === user?.id ? c.seller : c.buyer);

  return (
    <FlatList
      style={styles.list}
      data={conversations}
      keyExtractor={(c) => c.id}
      refreshControl={<RefreshControl refreshing={loading && conversations.length > 0} onRefresh={() => refetch()} />}
      ListEmptyComponent={
        loading ? (
          <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>
        ) : (
          <View style={styles.center}>
            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.zinc300} />
            <Text style={styles.emptyText}>{t.messages.empty}</Text>
          </View>
        )
      }
      renderItem={({ item }) => {
        const o = other(item);
        const carLabel = item.car ? `${item.car.year} ${item.car.make} ${item.car.model}` : '';
        return (
          <Pressable style={styles.row} onPress={() => router.push(`/conversation/${item.id}`)}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials(o)}</Text></View>
            <View style={styles.rowBody}>
              <View style={styles.rowTop}>
                <Text style={styles.name} numberOfLines={1}>{o.name || t.messages.title}</Text>
                <Text style={styles.time}>{timeLabel(item.lastMessageAt)}</Text>
              </View>
              <View style={styles.rowTop}>
                <Text style={styles.sub} numberOfLines={1}>{carLabel}</Text>
                {item.unreadCount > 0 && (
                  <View style={styles.badge}><Text style={styles.badgeText}>{item.unreadCount}</Text></View>
                )}
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: SPACING.md, minHeight: 300 },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: FONT_SIZE.md },
  loginBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg },
  loginBtnText: { color: COLORS.white, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderZinc, backgroundColor: COLORS.white },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.zinc100, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', color: COLORS.text },
  rowBody: { flex: 1, gap: 2 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  name: { fontWeight: '600', fontSize: FONT_SIZE.md, color: COLORS.text, flex: 1 },
  time: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  sub: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, flex: 1 },
  badge: { minWidth: 20, height: 20, paddingHorizontal: 6, borderRadius: 10, backgroundColor: COLORS.error, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
});
