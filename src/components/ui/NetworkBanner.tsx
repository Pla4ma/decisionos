import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export function NetworkBanner(): JSX.Element | null {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    let retries = 0;
    const maxRetries = 3;

    async function checkConnection() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch('https://clients3.google.com/generate_204', {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (mounted) {
          setIsOffline(false);
          retries = 0;
        }
      } catch {
        if (mounted && retries < maxRetries) {
          retries++;
          setTimeout(checkConnection, 2000 * retries);
        } else if (mounted) {
          setIsOffline(true);
        }
      }
    }

    const interval = setInterval(checkConnection, 30000);
    checkConnection();

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.banner}>
      <Text style={styles.text}>No internet connection — some features may be unavailable</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.status.warning,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
});
