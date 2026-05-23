import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, Dimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

interface Slide {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgAccent: string;
}

const SLIDES: Slide[] = [
  { key: '1', icon: 'car-sport', iconColor: '#3b82f6', bgAccent: 'rgba(59,130,246,0.1)' },
  { key: '2', icon: 'flash', iconColor: '#f59e0b', bgAccent: 'rgba(245,158,11,0.1)' },
  { key: '3', icon: 'heart', iconColor: COLORS.heartActive, bgAccent: 'rgba(239,68,68,0.1)' },
];

export function OnboardingScreen({ onComplete }: OnboardingProps) {
  const { t } = useLanguage();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const titles = [t.onboarding.slide1Title, t.onboarding.slide2Title, t.onboarding.slide3Title];
  const descs = [t.onboarding.slide1Desc, t.onboarding.slide2Desc, t.onboarding.slide3Desc];

  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconContainer, { backgroundColor: item.bgAccent }]}>
        <Ionicons name={item.icon} size={80} color={item.iconColor} />
      </View>
      <Text style={styles.slideTitle}>{titles[index]}</Text>
      <Text style={styles.slideDesc}>{descs[index]}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip button */}
      {!isLast && (
        <Pressable style={styles.skipButton} onPress={onComplete}>
          <Text style={styles.skipText}>{t.onboarding.skip}</Text>
        </Pressable>
      )}

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.key}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
              />
            );
          })}
        </View>

        {/* Action button */}
        <Pressable style={styles.actionButton} onPress={handleNext}>
          {isLast ? (
            <Text style={styles.actionButtonText}>{t.onboarding.getStarted}</Text>
          ) : (
            <>
              <Text style={styles.actionButtonText}>{t.common.next}</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 80,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  slideDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  bottomSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 50,
    gap: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.black,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.full,
    height: 56,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
});
