import { useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { LANGUAGE_OPTIONS } from '../../src/i18n';

export default function TabLayout() {
  const { t, language, setLanguage } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentFlag = LANGUAGE_OPTIONS.find(o => o.code === language)?.flag || '🌐';

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.black,
          tabBarInactiveTintColor: COLORS.zinc400,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopColor: COLORS.borderZinc,
            height: 85,
            paddingBottom: 25,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: COLORS.black,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t.tabs.home,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
            headerTitle: () => (
              <View style={styles.headerLogo}>
                <Ionicons name="car-sport" size={24} color={COLORS.white} />
                <Text style={styles.headerLogoText}>CarMarket365</Text>
              </View>
            ),
            headerRight: () => (
              <Pressable style={styles.langButton} onPress={() => setLangModalVisible(true)}>
                <Text style={styles.langButtonFlag}>{currentFlag}</Text>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: t.tabs.search,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
            headerTitle: t.headers.browseCars,
          }}
        />
        <Tabs.Screen
          name="post"
          options={{
            title: t.tabs.sell,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={28} color={color} />
            ),
            headerTitle: t.headers.sellYourCar,
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: t.tabs.saved,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t.tabs.profile,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

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
    </>
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  langButton: {
    marginRight: 16,
    padding: 4,
  },
  langButtonFlag: {
    fontSize: 22,
  },
  langModal: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
  },
  langModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  langModalSpacer: { width: 24 },
  langModalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderZinc,
  },
  langFlag: {
    fontSize: 24,
  },
  langLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
});
