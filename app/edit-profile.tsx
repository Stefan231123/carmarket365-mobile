import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { gql } from '@apollo/client';
import { useMutation, useApolloClient } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/context/AuthContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../src/constants/theme';
import { uploadAvatar } from '../src/utils/s3-upload';
import { useLanguage } from '../src/context/LanguageContext';

const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $firstName: String, $lastName: String, $phone: String, $avatarUrl: String,
    $dealerName: String, $dealerAddress: String, $dealerCity: String,
    $dealerPhoneNumber: String, $dealerWebsite: String, $dealerDescription: String
  ) {
    updateMyProfile(
      firstName: $firstName, lastName: $lastName, phone: $phone, avatarUrl: $avatarUrl,
      dealerName: $dealerName, dealerAddress: $dealerAddress, dealerCity: $dealerCity,
      dealerPhoneNumber: $dealerPhoneNumber, dealerWebsite: $dealerWebsite, dealerDescription: $dealerDescription
    ) {
      id firstName lastName name phone email avatarUrl
      dealerName dealerAddress dealerCity dealerPhoneNumber dealerWebsite dealerDescription
    }
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const client = useApolloClient();
  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE);
  const [changePassword, { loading: changingPw }] = useMutation(CHANGE_PASSWORD);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Dealer fields
  const [dealerName, setDealerName] = useState(user?.dealerName || '');
  const [dealerAddress, setDealerAddress] = useState(user?.dealerAddress || '');
  const [dealerCity, setDealerCity] = useState(user?.dealerCity || '');
  const [dealerPhone, setDealerPhone] = useState(user?.dealerPhoneNumber || '');
  const [dealerWebsite, setDealerWebsite] = useState(user?.dealerWebsite || '');
  const [dealerDescription, setDealerDescription] = useState(user?.dealerDescription || '');

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isDealer = user?.role === 'DEALER';

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.post.permissionRequired, t.post.photoLibraryPermission);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    try {
      let finalAvatarUrl = user?.avatarUrl;

      // Upload avatar if changed
      if (avatarUri && avatarUri !== user?.avatarUrl) {
        setUploadingAvatar(true);
        try {
          finalAvatarUrl = await uploadAvatar(avatarUri, client);
        } catch {
          Alert.alert(t.common.error, t.auth.somethingWentWrong);
          setUploadingAvatar(false);
          return;
        }
        setUploadingAvatar(false);
      }

      const variables: Record<string, string | undefined> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: finalAvatarUrl || undefined,
      };

      if (isDealer) {
        variables.dealerName = dealerName.trim() || undefined;
        variables.dealerAddress = dealerAddress.trim() || undefined;
        variables.dealerCity = dealerCity.trim() || undefined;
        variables.dealerPhoneNumber = dealerPhone.trim() || undefined;
        variables.dealerWebsite = dealerWebsite.trim() || undefined;
        variables.dealerDescription = dealerDescription.trim() || undefined;
      }

      await updateProfile({ variables });
      await refreshUser();
      Alert.alert(t.common.success, t.editProfile.profileUpdated);
      router.back();
    } catch (err: any) {
      Alert.alert(t.common.error, err?.message || t.auth.somethingWentWrong);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert(t.common.error, t.editProfile.passwordTooShort);
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      Alert.alert(t.common.error, t.editProfile.passwordRequirements);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t.common.error, t.auth.passwordsNoMatch);
      return;
    }
    try {
      await changePassword({
        variables: { currentPassword, newPassword },
      });
      Alert.alert(t.common.success, t.editProfile.passwordChanged);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (err: any) {
      Alert.alert(t.common.error, err?.message || t.auth.somethingWentWrong);
    }
  };

  const isSaving = updating || uploadingAvatar;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.avatarCard}>
          <Pressable onPress={pickAvatar} style={styles.avatarTouchable}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={32} color={COLORS.white} />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={14} color={COLORS.white} />
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>{t.post.photos}</Text>
        </View>

        {/* Personal Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.editProfile.personalInfo}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.editProfile.firstName}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t.editProfile.firstName}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.editProfile.lastName}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder={t.editProfile.lastName}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.editProfile.email}</Text>
            <View style={[styles.inputWrapper, styles.inputDisabled]}>
              <Ionicons name="mail-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: COLORS.textMuted }]}
                value={user?.email || ''}
                editable={false}
              />
            </View>
            <Text style={styles.hint}>{t.editProfile.emailCannotChange}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.editProfile.phone}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder={t.post.phonePlaceholder}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <Pressable
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>{t.editProfile.saveChanges}</Text>
            )}
          </Pressable>
        </View>

        {/* Dealer Info Card */}
        {isDealer && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.profile.dealerInfo}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.auth.dealerName}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={dealerName}
                  onChangeText={setDealerName}
                  placeholder={t.auth.dealerNamePlaceholder}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.auth.dealerAddress}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={dealerAddress}
                  onChangeText={setDealerAddress}
                  placeholder={t.auth.dealerAddressPlaceholder}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.auth.dealerCity}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="map-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={dealerCity}
                  onChangeText={setDealerCity}
                  placeholder={t.auth.dealerCityPlaceholder}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.auth.dealerPhone}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={dealerPhone}
                  onChangeText={setDealerPhone}
                  placeholder={t.auth.dealerPhonePlaceholder}
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.editProfile.website}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="globe-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={dealerWebsite}
                  onChangeText={setDealerWebsite}
                  placeholder={t.editProfile.websitePlaceholder}
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.post.description}</Text>
              <TextInput
                style={styles.textArea}
                value={dealerDescription}
                onChangeText={setDealerDescription}
                placeholder={t.post.description}
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {/* Password Card */}
        <View style={styles.card}>
          <Pressable
            style={styles.passwordToggle}
            onPress={() => setShowPasswordSection(!showPasswordSection)}
          >
            <View style={styles.passwordToggleLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} />
              </View>
              <Text style={styles.cardTitle}>{t.editProfile.changePassword}</Text>
            </View>
            <Ionicons name={showPasswordSection ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
          </Pressable>

          {showPasswordSection && (
            <View style={styles.passwordFields}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.editProfile.currentPassword}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder={t.editProfile.currentPassword}
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.editProfile.newPassword}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t.editProfile.newPassword}
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry
                  />
                </View>
                <Text style={styles.hint}>{t.editProfile.passwordHint}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.editProfile.confirmNewPassword}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t.editProfile.confirmNewPassword}
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry
                  />
                </View>
              </View>

              <Pressable
                style={[styles.saveButton, changingPw && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={changingPw}
              >
                {changingPw ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>{t.editProfile.changePassword}</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundMuted },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl, gap: SPACING.md },
  avatarCard: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputGroup: { marginBottom: SPACING.md },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    paddingHorizontal: 8,
    height: '100%',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  textArea: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    minHeight: 100,
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  buttonDisabled: { opacity: 0.5 },
  passwordToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  passwordFields: {
    marginTop: SPACING.md,
  },
});
