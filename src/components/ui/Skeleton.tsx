import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

function Pulse({ style }: { style?: any }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.block, style, animatedStyle]} />;
}

export function SkeletonText({ width = '60%', height = 14 }: { width?: number | string; height?: number }) {
  return <Pulse style={{ width: width as any, height, borderRadius: height / 2 }} />;
}

export function SkeletonCard({ lines = 3, height = 80 }: { lines?: number; height?: number }) {
  return (
    <View style={[styles.card, { height }]}>
      <View style={styles.cardHeader}>
        <Pulse style={styles.avatar} />
        <View style={styles.cardHeaderText}>
          <SkeletonText width="40%" height={12} />
          <SkeletonText width="60%" height={10} />
        </View>
      </View>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonText key={i} width={`${50 + Math.random() * 40}%`} height={10} />
      ))}
    </View>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View style={{ gap: spacing.sm }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

export function SkeletonScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.screenHeader}>
        <SkeletonText width="30%" height={22} />
        <Pulse style={{ width: 32, height: 32, borderRadius: 16 }} />
      </View>
      <SkeletonList count={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cardHeaderText: {
    flex: 1,
    gap: 4,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    gap: spacing.md,
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
