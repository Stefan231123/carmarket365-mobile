import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useLanguage } from '../src/context/LanguageContext';
import { useGoogleAuth } from '../src/hooks/useGoogleAuth';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../src/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, forgotPassword, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { promptAsync, isLoading: googleLoading, isReady: googleReady } = useGoogleAuth();

  // Navigate back when Google auth completes and user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && googleLoading === false) {
      router.back();
    }
  }, [isAuthenticated]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = t.auth.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t.auth.emailInvalid;
    if (!password) newErrors.password = t.auth.passwordRequired;
    else if (password.length < 6) newErrors.password = t.auth.passwordMinLength;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.back();
    } catch (err: any) {
      const message = err?.message?.includes('Invalid credentials')
        ? t.auth.invalidCredentials
        : t.auth.somethingWentWrong;
      Alert.alert(t.auth.loginFailed, message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      Alert.alert(t.auth.forgotPassword, t.auth.enterEmailFirst);
      return;
    }
    try {
      await forgotPassword(trimmedEmail);
      Alert.alert(t.common.success, t.auth.resetEmailSent);
    } catch (err: any) {
      // Show success for server-side errors (don't reveal if email exists)
      // but show error for network failures so user knows to retry
      const isNetworkError = err?.networkError || err?.message?.includes('Network');
      if (isNetworkError) {
        Alert.alert(t.common.error, t.common.retry);
      } else {
        Alert.alert(t.common.success, t.auth.resetEmailSent);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await promptAsync();
      // If successful, the useGoogleAuth hook handles the rest and AuthContext updates
      // We need to go back after auth context updates
    } catch (err: any) {
      Alert.alert(t.auth.loginFailed, t.auth.somethingWentWrong);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.form}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoRow}>
            <Ionicons name="car-sport" size={24} color={COLORS.primary} />
            <Text style={styles.logoText}>CarMarket365</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>{t.auth.welcomeBack}</Text>
          <Text style={styles.subheading}>{t.auth.loginSubtitle}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.email}</Text>
            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.auth.emailPlaceholder}
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
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
                placeholder={t.auth.passwordPlaceholder}
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={16} color={COLORS.textMuted} />
              </Pressable>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            <Pressable onPress={handleForgotPassword} style={styles.forgotPasswordLink}>
              <Text style={styles.forgotPasswordText}>{t.auth.forgotPassword}</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>{t.common.signIn}</Text>
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
            onPress={handleGoogleLogin}
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
            onPress={() => router.replace('/register')}
          >
            <Text style={styles.outlineButtonText}>{t.common.createAccount}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMuted,
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: SPACING.md,
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
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
