import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Modal, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/context/LanguageContext';
import { LANGUAGE_OPTIONS } from '../../src/i18n';

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon as any} size={18} color={COLORS.textMuted} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.zinc400} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authIcon}>
          <Ionicons name="person-circle-outline" size={64} color={COLORS.zinc400} />
        </View>
        <Text style={styles.title}>{t.profile.yourAccount}</Text>
        <Text style={styles.subtitle}>{t.profile.loginToManage}</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/login')}>
          <Text style={styles.primaryButtonText}>{t.common.signIn}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/register')}>
          <Text style={styles.secondaryButtonText}>{t.common.createAccount}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : user?.dealerLogoUrl && user?.role === 'DEALER' ? (
            <Image source={{ uri: user.dealerLogoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={28} color={COLORS.white} />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.role === 'DEALER' && user?.dealerName ? user.dealerName : (user?.name || t.profile.defaultUserName)}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {user?.role === 'DEALER' && (
              <View style={styles.dealerTag}>
                <Ionicons
                  name={user?.dealerStatus === 'APPROVED' ? 'checkmark-circle' : 'time-outline'}
                  size={12}
                  color={user?.dealerStatus === 'APPROVED' ? COLORS.success : COLORS.textMuted}
                />
                <Text style={styles.dealerTagText}>
                  {user?.dealerStatus === 'APPROVED'
                    ? t.profile.verifiedDealer
                    : user?.dealerStatus === 'PENDING'
                    ? t.profile.pendingApproval
                    : t.profile.dealer}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Dealer Info Card */}
      {user?.role === 'DEALER' && (
        <View style={styles.menuCard}>
          <Text style={styles.menuSectionTitle}>{t.profile.dealerInfo}</Text>

          {user.dealerAddress || user.dealerCity ? (
            <View style={styles.dealerInfoRow}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
              </View>
              <Text style={styles.dealerInfoText}>
                {[user.dealerAddress, user.dealerCity, user.dealerRegion].filter(Boolean).join(', ')}
              </Text>
            </View>
          ) : null}

          {user.dealerPhoneNumber ? (
            <View style={styles.dealerInfoRow}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="call-outline" size={16} color={COLORS.textMuted} />
              </View>
              <Text style={styles.dealerInfoText}>{user.dealerPhoneNumber}</Text>
            </View>
          ) : null}

          {user.dealerWebsite ? (
            <View style={styles.dealerInfoRow}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="globe-outline" size={16} color={COLORS.textMuted} />
              </View>
              <Text style={styles.dealerInfoText}>{user.dealerWebsite}</Text>
            </View>
          ) : null}

          {user.dealerDescription ? (
            <View style={styles.dealerInfoRow}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="document-text-outline" size={16} color={COLORS.textMuted} />
              </View>
              <Text style={styles.dealerInfoText} numberOfLines={3}>{user.dealerDescription}</Text>
            </View>
          ) : null}

          {user.dealerWorkingHours && user.dealerWorkingHours.length > 0 ? (
            <View style={styles.dealerInfoRow}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
              </View>
              <Text style={styles.dealerInfoText}>{user.dealerWorkingHours.join('\n')}</Text>
            </View>
          ) : null}

          {user.dealerServices && user.dealerServices.length > 0 ? (
            <View style={styles.dealerInfoRow}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="construct-outline" size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.dealerServicesWrap}>
                {user.dealerServices.map((s) => (
                  <View key={s} style={styles.dealerServiceChip}>
                    <Text style={styles.dealerServiceText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      )}

      {/* Menu Sections */}
      <View style={styles.menuCard}>
        <Text style={styles.menuSectionTitle}>{t.profile.listings}</Text>
        <MenuItem icon="car-outline" label={t.profile.myListings} onPress={() => router.push('/my-listings')} />
        <MenuItem icon="heart-outline" label={t.profile.savedCars} onPress={() => router.push('/(tabs)/saved')} />
      </View>

      <View style={styles.menuCard}>
        <Text style={styles.menuSectionTitle}>{t.profile.account}</Text>
        <MenuItem icon="person-outline" label={t.profile.editProfile} onPress={() => router.push('/edit-profile')} />
        <MenuItem icon="settings-outline" label={t.profile.settings} onPress={() => router.push('/settings')} />
        <MenuItem icon="language-outline" label={t.profile.language} onPress={() => setLangModalVisible(true)} />
      </View>

      <View style={styles.menuCard}>
        <Text style={styles.menuSectionTitle}>{t.profile.support}</Text>
        <MenuItem icon="help-circle-outline" label={t.profile.helpFaq} onPress={() => Linking.openURL('https://carmarket365.com/help')} />
        <MenuItem icon="document-text-outline" label={t.profile.termsOfService} onPress={() => Linking.openURL('https://carmarket365.com/terms')} />
        <MenuItem icon="shield-checkmark-outline" label={t.profile.privacyPolicy} onPress={() => Linking.openURL('https://carmarket365.com/privacy')} />
      </View>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
        <Text style={styles.logoutText}>{t.profile.logOut}</Text>
      </Pressable>

      {/* Language Selector Modal */}
      <Modal visible={langModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.langModal}>
          <View style={styles.langModalHeader}>
            <Pressable onPress={() => setLangModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </Pressable>
            <Text style={styles.langModalTitle}>{t.languageSelector.title}</Text>
            <View style={styles.langModalSpacer} />
          </View>
          {LANGUAGE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.code}
              style={styles.langOption}
              onPress={() => {
                setLanguage(opt.code);
                setLangModalVisible(false);
              }}
            >
              <Text style={styles.langFlag}>{opt.flag}</Text>
              <Text style={styles.langLabel}>{opt.label}</Text>
              {language === opt.code && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
            </Pressable>
          ))}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundMuted,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  authIcon: {
    backgroundColor: COLORS.zinc100,
    borderRadius: BORDER_RADIUS.full,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMuted,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '500',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    padding: SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dealerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dealerTagText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    overflow: 'hidden',
  },
  menuSectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderZinc,
    gap: SPACING.sm,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.zinc100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
  },
  logoutText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
    fontWeight: '500',
  },
  langModal: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  langModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderZinc,
  },
  langModalSpacer: { width: 24 },
  langModalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '500',
    color: COLORS.text,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderZinc,
    gap: SPACING.md,
  },
  langFlag: {
    fontSize: 24,
  },
  langLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  dealerInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderZinc,
    gap: SPACING.sm,
  },
  dealerInfoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  dealerServicesWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dealerServiceChip: {
    backgroundColor: COLORS.zinc100,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dealerServiceText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
