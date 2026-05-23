import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/context/LanguageContext';

export default function PostScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="car-outline" size={48} color={COLORS.zinc400} />
        </View>
        <Text style={styles.title}>{t.post.postACar}</Text>
        <Text style={styles.subtitle}>{t.post.loginToPost}</Text>
        <Pressable style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>{t.common.signIn}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="add-outline" size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{t.post.sellYourCar}</Text>
      <Text style={styles.subtitle}>{t.post.listOnCarMarket}</Text>
      <Pressable style={styles.button} onPress={() => router.push('/post-car')}>
        <Ionicons name="add" size={18} color={COLORS.white} />
        <Text style={styles.buttonText}>{t.post.createListing}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundMuted,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  iconCircle: {
    backgroundColor: COLORS.zinc100,
    borderRadius: BORDER_RADIUS.full,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
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
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
});
