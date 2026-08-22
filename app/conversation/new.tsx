import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator, Image, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/context/LanguageContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import { formatPrice } from '../../src/utils/formatters';
import { START_CONVERSATION } from '../../src/graphql/messaging';

const GET_CAR_SUMMARY = gql`
  query GetCarSummary($id: String!) {
    getCarById(id: $id) {
      id
      make
      model
      year
      price
      images { thumbnailUrl url }
      seller { name }
    }
  }
`;

interface CarSummary {
  id: string;
  make: string;
  model: string;
  year: number;
  price?: number | null;
  images?: { thumbnailUrl?: string | null; url: string }[] | null;
  seller?: { name?: string | null } | null;
}

/**
 * "Message seller" starts here instead of sending an opener immediately —
 * the buyer reviews/edits the pre-filled message and taps Send explicitly.
 * A conversation only exists once the first message is sent, so this screen
 * has no conversation id yet; on send it creates one and navigates into it.
 */
export default function NewConversationScreen() {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const { t } = useLanguage();
  const router = useRouter();
  const [draft, setDraft] = useState(t.messages.opener);

  const { data, loading: loadingCar } = useQuery<{ getCarById: CarSummary }>(GET_CAR_SUMMARY, {
    variables: { id: carId },
    skip: !carId,
  });
  const [startConversation, { loading: sending }] = useMutation(START_CONVERSATION);

  const car = data?.getCarById;

  const onSend = async () => {
    const content = draft.trim();
    if (!content || !carId || sending) return;
    try {
      const res = await startConversation({ variables: { carId, content } });
      const convId = (res.data as { startConversation?: { id: string } } | null | undefined)?.startConversation?.id;
      if (convId) router.replace(`/conversation/${convId}`);
    } catch { /* surfaced by Apollo error link */ }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ title: t.messages.newMessage }} />
      {loadingCar && !car ? (
        <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>
      ) : (
        <View style={styles.body}>
          {car && (
            <View style={styles.carCard}>
              {car.images?.[0] ? (
                <Image source={{ uri: car.images[0].thumbnailUrl || car.images[0].url }} style={styles.carCardImage} />
              ) : (
                <View style={styles.carCardImageFallback}>
                  <Ionicons name="car-outline" size={22} color={COLORS.textMuted} />
                </View>
              )}
              <View style={styles.carCardBody}>
                <Text style={styles.carCardTitle} numberOfLines={1}>
                  {car.year} {car.make} {car.model}
                </Text>
                {typeof car.price === 'number' && (
                  <Text style={styles.carCardPrice}>{formatPrice(car.price)}</Text>
                )}
              </View>
            </View>
          )}
          {car?.seller?.name && (
            <Text style={styles.toLabel}>
              {t.messages.to} <Text style={styles.toName}>{car.seller.name}</Text>
            </Text>
          )}
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder={t.messages.typeMessage}
            placeholderTextColor={COLORS.textMuted}
            multiline
            autoFocus
          />
        </View>
      )}
      <View style={styles.footer}>
        <Pressable
          style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
          onPress={onSend}
          disabled={!draft.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Ionicons name="send" size={16} color={COLORS.white} />
              <Text style={styles.sendBtnText}>{t.messages.send}</Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, padding: SPACING.md, gap: SPACING.md },
  carCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    padding: SPACING.sm, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.borderZinc,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  carCardImage: { width: 48, height: 48, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.zinc100 },
  carCardImageFallback: { width: 48, height: 48, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.zinc100, alignItems: 'center', justifyContent: 'center' },
  carCardBody: { flex: 1, gap: 1 },
  carCardTitle: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.text },
  carCardPrice: { fontSize: FONT_SIZE.xs, color: COLORS.primary, fontWeight: '600' },
  toLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  toName: { color: COLORS.text, fontWeight: '600' },
  input: {
    flex: 1, minHeight: 120, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.borderZinc, padding: SPACING.md,
    color: COLORS.text, fontSize: FONT_SIZE.md, textAlignVertical: 'top',
  },
  footer: { padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.borderZinc, backgroundColor: COLORS.white },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.sm,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZE.md },
});
