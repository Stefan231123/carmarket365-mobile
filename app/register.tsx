import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView, Switch, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useLanguage } from '../src/context/LanguageContext';
import { useGoogleAuth } from '../src/hooks/useGoogleAuth';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../src/constants/theme';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDealer, setIsDealer] = useState(false);
  const [dealerName, setDealerName] = useState('');
  const [dealerAddress, setDealerAddress] = useState('');
  const [dealerCity, setDealerCity] = useState('');
  const [dealerPhone, setDealerPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { promptAsync, isLoading: googleLoading, isReady: googleReady } = useGoogleAuth();

  // Navigate back when Google auth completes and user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.back();
    }
  }, [isAuthenticated]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = t.auth.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t.auth.emailInvalid;

    if (!password) newErrors.password = t.auth.passwordRequired;
    else if (password.length < 8) newErrors.password = t.auth.passwordMinLength;
    else if (!/[A-Z]/.test(password)) newErrors.password = t.auth.passwordUppercase;
    else if (!/[a-z]/.test(password)) newErrors.password = t.auth.passwordLowercase;
    else if (!/[0-9]/.test(password)) newErrors.password = t.auth.passwordNumber;

    if (password !== confirmPassword) newErrors.confirmPassword = t.auth.passwordsNoMatch;

    if (isDealer && !dealerName.trim()) newErrors.dealerName = t.auth.dealerNameRequired;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || undefined;
      const dealerInfo = isDealer ? {
        dealerName: dealerName.trim(),
        dealerAddress: dealerAddress.trim() || undefined,
        dealerCity: dealerCity.trim() || undefined,
        dealerPhoneNumber: dealerPhone.trim() || undefined,
      } : undefined;
      await register(email.trim().toLowerCase(), password, name, dealerInfo);
      router.back();
    } catch (err: any) {
      const message = err?.message?.includes('already exists')
        ? t.auth.accountExists
        : t.auth.somethingWentWrong;
      Alert.alert(t.auth.registrationFailed, message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await promptAsync();
    } catch (err: any) {
      Alert.alert(t.auth.registrationFailed, t.auth.somethingWentWrong);
    }
  };

  const clearError = (field: string) => {
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoRow}>
            <Image source={require('../assets/cm-logo.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
            <Text style={styles.logoText}>CarMarket365</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>{t.auth.createAccountTitle}</Text>
          <Text style={styles.subheading}>{t.auth.createAccountSubtitle}</Text>

          <View style={styles.nameRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>{t.auth.firstName}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.auth.firstName}
                  placeholderTextColor={COLORS.textMuted}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoComplete="given-name"
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>{t.auth.lastName}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.auth.lastName}
                  placeholderTextColor={COLORS.textMuted}
                  value={lastName}
                  onChangeText={setLastName}
                  autoComplete="family-name"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.email}</Text>
            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.auth.emailPlaceholder}
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={(v) => { setEmail(v); clearError('email'); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.password}</Text>
            <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.auth.passwordPlaceholderRegister}
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={(v) => { setPassword(v); clearError('password'); }}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={16} color={COLORS.textMuted} />
              </Pressable>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.confirmPassword}</Text>
            <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.auth.repeatPassword}
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); clearError('confirmPassword'); }}
                secureTextEntry={!showPassword}
              />
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          {/* Dealer Toggle */}
          <View style={styles.dealerToggleRow}>
            <View style={styles.dealerToggleLabel}>
              <Ionicons name="storefront-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.dealerToggleText}>{t.auth.registerAsDealer}</Text>
            </View>
            <Switch
              value={isDealer}
              onValueChange={setIsDealer}
              trackColor={{ false: COLORS.zinc200, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          {/* Dealer Fields */}
          {isDealer && (
            <View style={styles.dealerSection}>
              <Text style={styles.dealerSectionTitle}>{t.auth.dealerSectionTitle}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.auth.dealerName} *</Text>
                <View style={[styles.inputWrapper, errors.dealerName && styles.inputError]}>
                  <Ionicons name="business-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t.auth.dealerNamePlaceholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={dealerName}
                    onChangeText={(v) => { setDealerName(v); clearError('dealerName'); }}
                  />
                </View>
                {errors.dealerName && <Text style={styles.errorText}>{errors.dealerName}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.auth.dealerAddress}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="location-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t.auth.dealerAddressPlaceholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={dealerAddress}
                    onChangeText={setDealerAddress}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.auth.dealerCity}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="map-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t.auth.dealerCityPlaceholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={dealerCity}
                    onChangeText={setDealerCity}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.auth.dealerPhone}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t.auth.dealerPhonePlaceholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={dealerPhone}
                    onChangeText={setDealerPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>
          )}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>{t.common.createAccount}</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t.auth.orContinueWith}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In */}
          <Pressable
            style={[styles.googleButton, (googleLoading || !googleReady) && styles.buttonDisabled]}
            onPress={handleGoogleRegister}
            disabled={googleLoading || !googleReady}
          >
            {googleLoading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color="#4285F4" />
                <Text style={styles.googleButtonText}>{t.auth.continueWithGoogle}</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={styles.outlineButton}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.outlineButtonText}>{t.auth.alreadyHaveAccount}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMuted,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  heading: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  subheading: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  inputGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
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
  inputError: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginLeft: 4,
  },
  button: {
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.zinc300,
  },
  dividerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.zinc200,
    backgroundColor: COLORS.white,
  },
  googleButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  outlineButton: {
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
  },
  outlineButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  dealerToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 16,
    height: 48,
  },
  dealerToggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dealerToggleText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  dealerSection: {
    gap: SPACING.sm,
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
  },
  dealerSectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
});
