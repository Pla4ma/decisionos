import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { asyncStoragePersister } from '@/features/persist/AsyncStoragePersister';
import { useCallback, useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/theme/colors';
import { AppProviders } from '@/components/AppProviders';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkBanner } from '@/components/ui/NetworkBanner';
import { useNotificationResponse } from '@/features/notifications/notificationService';
import { useAuthContext } from '@/features/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import { ROUTES } from '@/config/routes';

function NotificationInitializer(): null {
  const router = useRouter();
  const { user } = useAuthContext();
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const openDecisionFromNotification = useCallback(async (decisionId: string) => {
    if (!user?.id) {
      router.push(ROUTES.SIGN_IN);
      return;
    }
    abortRef.current = new AbortController();
    const { data, error } = await supabase
      .from('decisions')
      .select('id')
      .eq('id', decisionId)
      .eq('user_id', user.id)
      .abortSignal(abortRef.current.signal)
      .maybeSingle();
    if (!mountedRef.current) return;
    if (data) {
      router.push(ROUTES.DECISION_DETAIL(decisionId));
    } else {
      router.push(ROUTES.DECISIONS_LIST);
      if (error && error.code !== 'PGRST116') {
        console.error('Notification decision lookup error:', error);
      }
    }
  }, [user?.id, router]);

  useNotificationResponse((decisionId: string) => {
    openDecisionFromNotification(decisionId);
  });

  return null;
}

function AuthGuard(): JSX.Element | null {
  const segments = useSegments();
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace(ROUTES.SIGN_IN);
    } else if (user && inAuthGroup) {
      router.replace(ROUTES.HOME);
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.primary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout(): JSX.Element {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
      <SafeAreaProvider>
        <AppProviders>
          <ErrorBoundary>
            <NotificationInitializer />
            <NetworkBanner />
            <AuthGuard />
          </ErrorBoundary>
          <StatusBar style="light" />
        </AppProviders>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}
