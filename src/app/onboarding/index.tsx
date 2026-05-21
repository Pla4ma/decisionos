import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '🧠',
    title: 'Think Clearly',
    subtitle: 'Every great outcome starts with a clear decision.',
    description: 'DecisionOS helps you analyze options, predict outcomes, and build decision intelligence that compounds over time.',
    color: colors.accent.primary,
  },
  {
    icon: '📊',
    title: 'AI-Powered Analysis',
    subtitle: 'Get objective scores on every option.',
    description: 'Our AI evaluates regret risk, confidence, values alignment, and more — so you see what your emotions may be hiding.',
    color: colors.accent.secondary,
  },
  {
    icon: '🔄',
    title: 'Learn From Every Choice',
    subtitle: 'Reviews turn experience into wisdom.',
    description: 'Schedule check-ins, track outcomes, and discover your decision patterns. Your Decision IQ grows with every review.',
    color: colors.status.success,
  },
  {
    icon: '🔥',
    title: 'Build Your Streak',
    subtitle: 'Small daily actions, massive long-term growth.',
    description: 'One decision a day keeps regret away. Build momentum with streaks, earn achievements, and level up your decision intelligence.',
    color: colors.status.warning,
  },
];

export default function OnboardingScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace(ROUTES.ONBOARDING_PRIVACY);
    }
  }, [currentIndex, router]);

  const handleSkip = useCallback(() => {
    router.replace(ROUTES.ONBOARDING_PRIVACY);
  }, [router]);

  const onMomentumEnd = useCallback((e: any) => {
    setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.skipRow}>
        {currentIndex < SLIDES.length - 1 && (
          <Animated.View entering={FadeIn}>
            <Button title="Skip" variant="ghost" size="small" onPress={handleSkip} haptic={false} />
          </Animated.View>
        )}
      </View>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => (
          <Animated.View entering={SlideInRight.duration(400)} style={[styles.slide, { width }]}>
            <Animated.View entering={FadeInDown.duration(500).delay(100)} style={[styles.iconWrap, { backgroundColor: `${item.color}20` }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </Animated.View>
            <Animated.Text entering={FadeInDown.duration(500).delay(200)} style={styles.title}>{item.title}</Animated.Text>
            <Animated.Text entering={FadeInDown.duration(500).delay(300)} style={styles.subtitle}>{item.subtitle}</Animated.Text>
            <Animated.Text entering={FadeInDown.duration(500).delay(400)} style={styles.description}>{item.description}</Animated.Text>
          </Animated.View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>
        <Animated.View entering={FadeInDown.duration(300)}>
          <Button
            title={currentIndex < SLIDES.length - 1 ? 'Next' : 'Get Started'}
            variant="primary"
            size="large"
            onPress={handleNext}
            haptic
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  skipRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.md, height: 44 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  iconWrap: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  icon: { fontSize: 56 },
  title: { fontSize: typography.size.xxl, fontWeight: '700', color: colors.text.primary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: typography.size.lg, fontWeight: '500', color: colors.accent.primary, textAlign: 'center', marginBottom: spacing.md },
  description: { fontSize: typography.size.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: spacing.md },
  footer: { paddingHorizontal: spacing.xl, gap: spacing.lg, paddingBottom: spacing.md },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.background.tertiary },
  dotActive: { width: 24, backgroundColor: colors.accent.primary },
});
