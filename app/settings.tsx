import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuth } from '../src/context/AuthContext';
import { useLanguage } from '../src/context/LanguageContext';
import { LANGUAGE_OPTIONS } from '../src/i18n';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../src/constants/theme';

const UPDATE_MARKETING_PREFS = gql`
  mutation UpdateMarketingPreferences($marketingEmails: Boolean!, $smsNotifications: Boolean!) {
    updateMarketingPreferences(marketingEmails: $marketingEmails, smsNotifications: $smsNotifications) {
      id
      marketingEmailsEnabled
      smsNotificationsEnabled
    }
  }
`;

export default function SettingsScreen() {
  const router = useRouter();
  const { user, refreshUser, deleteAccount } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [updatePrefs] = useMutation(UPDATE_MARKETING_PREFS);

  const [marketingEmails, setMarketingEmails] = useState(user?.marketingEmailsEnabled ?? false);
  const [smsNotifications, setSmsNotifications] = useState(user?.smsNotificationsEnabled ?? false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setPushEnabled(status === 'granted');
    });
  }, []);

  const handleToggleMarketing = async () => {
    const newVal = !marketingEmails;
    setMarketingEmails(newVal);
    try {
      await updatePrefs({ variables: { marketingEmails: newVal, smsNotifications } });
      await refreshUser();
    } catch (err: any) {
      setMarketingEmails(!newVal);
      Alert.alert(t.common.error, err?.message || t.auth.somethingWentWrong);
    }
  };

  const handleToggleSms = async () => {
    const newVal = !smsNotifications;
    setSmsNotifications(newVal);
    try {
      await updatePrefs({ variables: { marketingEmails, smsNotifications: newVal } });
      await refreshUser();
    } catch (err: any) {
      setSmsNotifications(!newVal);
      Alert.alert(t.common.error, err?.message || t.auth.somethingWentWrong);
    }
  };

  const handleTogglePush = async () => {
    if (pushEnabled) {
      // Can't revoke programmatically – direct to system settings
      Linking.openSettings();
    } else {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setPushEnabled(true);
      } else {
        Alert.alert(
          t.settings.notifications,
          t.post.permissionRequired,
          [{ text: t.common.ok }],
        );
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t.settings.deleteAccount,
      t.settings.deleteAccountConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              router.dismissAll();
            } catch (err: any) {
              Alert.alert(t.common.error, err?.message || t.auth.somethingWentWrong);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Notifications */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t.settings.notifications}</Text>

        <Pressable style={styles.settingRow} onPress={handleToggleMarketing}>
          <View style={styles.iconWrap}>
            <Ionicons name="mail-outline" size={16} color={COLORS.textMuted} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t.settings.marketingEmails}</Text>
            <Text style={styles.settingDesc}>{t.settings.marketingEmailsDesc}</Text>
          </View>
          <View style={[styles.toggle, marketingEmails && styles.toggleActive]}>
            <View style={[styles.toggleThumb, marketingEmails && styles.toggleThumbActive]} />
          </View>
        </Pressable>

        <Pressable style={styles.settingRow} onPress={handleToggleSms}>
          <View style={styles.iconWrap}>
            <Ionicons name="chatbubble-outline" size={16} color={COLORS.textMuted} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t.settings.smsNotifications}</Text>
            <Text style={styles.settingDesc}>{t.settings.smsNotificationsDesc}</Text>
          </View>
          <View style={[styles.toggle, smsNotifications && styles.toggleActive]}>
            <View style={[styles.toggleThumb, smsNotifications && styles.toggleThumbActive]} />
          </View>
        </Pressable>

        <Pressable style={styles.settingRow} onPress={handleTogglePush}>
          <View style={styles.iconWrap}>
            <Ionicons name="notifications-outline" size={16} color={COLORS.textMuted} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t.settings.notifications}</Text>
            <Text style={styles.settingDesc}>{pushEnabled ? t.common.yes : t.common.no}</Text>
          </View>
          <View style={[styles.toggle, pushEnabled && styles.toggleActive]}>
            <View style={[styles.toggleThumb, pushEnabled && styles.toggleThumbActive]} />
          </View>
        </Pressable>
      </View>

      {/* Language */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t.profile.language}</Text>
        {LANGUAGE_OPTIONS.map((opt) => (
          <Pressable
            key={opt.code}
            style={styles.langRow}
            onPress={() => setLanguage(opt.code)}
          >
            <Text style={styles.langRowFlag}>{opt.flag}</Text>
            <Text style={styles.langRowLabel}>{opt.label}</Text>
            {language === opt.code && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
          </Pressable>
        ))}
      </View>

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t.settings.about}</Text>

        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>CarMarket365</Text>
          <Text style={styles.aboutValue}>{t.settings.version} {Constants.expoConfig?.version ?? '1.0.0'}</Text>
        </View>
      </View>

      {/* Danger Zone */}
      <Pressable style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        <Text style={styles.deleteAccountText}>{t.settings.deleteAccount}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundMuted },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl, gap: SPACING.md },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderZinc,
    gap: SPACING.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.zinc100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: FONT_SIZE.md, color: COLORS.text, fontWeight: '500' },
  settingDesc: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 2 },
  toggle: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: COLORS.zinc200, justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleActive: { backgroundColor: COLORS.black },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.white },
  toggleThumbActive: { alignSelf: 'flex-end' },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderZinc,
    gap: SPACING.md,
  },
  langRowFlag: { fontSize: 22 },
  langRowLabel: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.text },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  aboutLabel: { fontSize: FONT_SIZE.md, color: COLORS.text, fontWeight: '500' },
  aboutValue: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.error,
    marginTop: SPACING.md,
  },
  deleteAccountText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
    fontWeight: '500',
  },
});
