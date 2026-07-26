import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput, Pressable, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import {
  GET_CONVERSATION, SEND_MESSAGE, MARK_CONVERSATION_READ, MConversation, MMessage, MParticipant,
} from '../../src/graphql/messaging';

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const { data, loading } = useQuery<{ getConversation: MConversation }>(GET_CONVERSATION, {
    variables: { id },
    skip: !id,
    pollInterval: 4000,
    fetchPolicy: 'cache-and-network',
  });
  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);
  const [markRead] = useMutation(MARK_CONVERSATION_READ);

  const conv = data?.getConversation;
  const messages: MMessage[] = conv?.messages ?? [];
  const other: MParticipant | undefined = conv ? (conv.buyer.id === user?.id ? conv.seller : conv.buyer) : undefined;

  // Clear unread whenever the thread has unread messages (initial + on poll).
  useEffect(() => {
    if (id && (conv?.unreadCount ?? 0) > 0) markRead({ variables: { conversationId: id } }).catch(() => {});
  }, [id, conv?.unreadCount, markRead]);

  useEffect(() => {
    if (messages.length) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length]);

  const onSend = async () => {
    const content = draft.trim();
    if (!content || !id || sending) return;
    setDraft('');
    try {
      await sendMessage({
        variables: { conversationId: id, content },
        refetchQueries: [{ query: GET_CONVERSATION, variables: { id } }],
      });
    } catch {
      setDraft(content); // restore on failure
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ title: other?.name || t.headers.conversation }} />
      {loading && !conv ? (
        <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>
      ) : (
        <FlatList
          ref={listRef}
          style={styles.flex}
          contentContainerStyle={styles.listContent}
          data={messages}
          keyExtractor={(m) => m.id}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const mine = item.sender.id === user?.id;
            return (
              <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowOther]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                  <Text style={mine ? styles.textMine : styles.textOther}>{item.content}</Text>
                  <Text style={[styles.time, mine ? styles.timeMine : styles.timeOther]}>{timeLabel(item.createdAt)}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={t.messages.typeMessage}
          placeholderTextColor={COLORS.textMuted}
          multiline
        />
        <Pressable style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]} onPress={onSend} disabled={!draft.trim() || sending}>
          {sending ? <ActivityIndicator color={COLORS.white} size="small" /> : <Ionicons name="send" size={18} color={COLORS.white} />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: SPACING.md, gap: 6 },
  bubbleRow: { flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  bubbleMine: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: COLORS.zinc100, borderBottomLeftRadius: 4 },
  textMine: { color: COLORS.white, fontSize: FONT_SIZE.md },
  textOther: { color: COLORS.text, fontSize: FONT_SIZE.md },
  time: { fontSize: 10, marginTop: 2 },
  timeMine: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  timeOther: { color: COLORS.textMuted },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm, padding: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.borderZinc, backgroundColor: COLORS.white },
  input: { flex: 1, maxHeight: 120, minHeight: 40, backgroundColor: COLORS.inputBg, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.text, fontSize: FONT_SIZE.md },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
});
