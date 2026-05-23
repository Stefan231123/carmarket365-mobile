import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Image, FlatList,
  ScrollView, Modal, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GalleryImage {
  id: string;
  url: string;
}

interface ImageGalleryModalProps {
  visible: boolean;
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

function ZoomableImage({ uri }: { uri: string }) {
  const scrollRef = useRef<ScrollView>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDoubleTap = useCallback(() => {
    if (isZoomed) {
      scrollRef.current?.scrollResponderZoomTo({
        x: 0,
        y: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.65,
        animated: true,
      });
      setIsZoomed(false);
    } else {
      scrollRef.current?.scrollResponderZoomTo({
        x: SCREEN_WIDTH * 0.25,
        y: SCREEN_HEIGHT * 0.15,
        width: SCREEN_WIDTH * 0.5,
        height: SCREEN_HEIGHT * 0.3,
        animated: true,
      });
      setIsZoomed(true);
    }
  }, [isZoomed]);

  // Track last tap for double-tap detection
  const lastTap = useRef<number>(0);
  const handlePress = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      handleDoubleTap();
    }
    lastTap.current = now;
  }, [handleDoubleTap]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.zoomScrollView}
      contentContainerStyle={styles.zoomContent}
      maximumZoomScale={4}
      minimumZoomScale={1}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      bouncesZoom
      centerContent
      onScrollEndDrag={(e) => {
        setIsZoomed(e.nativeEvent.zoomScale > 1.05);
      }}
    >
      <Pressable onPress={handlePress}>
        <Image
          source={{ uri }}
          style={styles.zoomImage}
          resizeMode="contain"
        />
      </Pressable>
    </ScrollView>
  );
}

export function ImageGalleryModal({
  visible,
  images,
  initialIndex,
  onClose,
  onIndexChange,
}: ImageGalleryModalProps) {
  const { t } = useLanguage();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
    onIndexChange?.(index);
  }, [onIndexChange]);

  const scrollToIndex = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    handleIndexChange(index);
  }, [handleIndexChange]);

  const handleShow = useCallback(() => {
    setCurrentIndex(initialIndex);
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
    }, 50);
  }, [initialIndex]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onShow={handleShow}
    >
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.counter}>
            {currentIndex + 1} / {images.length}
          </Text>
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={12}
          >
            <Ionicons name="close" size={28} color={COLORS.white} />
          </Pressable>
        </View>

        {/* Zoomable image swiper */}
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            handleIndexChange(idx);
          }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.imageWrap}>
              <ZoomableImage uri={item.url} />
            </View>
          )}
        />

        {/* Zoom hint */}
        <View style={styles.hintRow}>
          <Ionicons name="expand-outline" size={14} color="rgba(255,255,255,0.5)" />
          <Text style={styles.hintText}>{t.carDetail.zoomHint}</Text>
        </View>

        {/* Bottom thumbnails */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnails}
          >
            {images.map((img, i) => (
              <Pressable key={img.id} onPress={() => scrollToIndex(i)}>
                <Image
                  source={{ uri: img.url }}
                  style={[
                    styles.thumb,
                    i === currentIndex && styles.thumbActive,
                  ]}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: SPACING.md,
  },
  counter: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  closeBtn: {
    position: 'absolute',
    right: SPACING.md,
    top: 54,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomScrollView: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.65,
  },
  zoomContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.65,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  thumbnails: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 40,
    paddingTop: 4,
    gap: 8,
  },
  thumb: {
    width: 64,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  thumbActive: {
    borderColor: COLORS.white,
  },
});
