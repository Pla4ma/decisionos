// FLOW: Root Layout — Global Providers + Notification Initializer
// Every screen renders inside this layout.
// QueryClientProvider → React Query cache layer
// SafeAreaProvider → safe area insets
// AppProviders → global context
// NotificationInitializer → push notifications + deep linking
// See FLOW_ARCHITECTURE.md §8 — Complete Data Flow Diagram
import { Slot, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppProviders } from '@/components/AppProviders';
import { initializeNotifications, useNotificationResponse } from '@/features/notifications/notificationService';
import { useAuth } from '@/features/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

function NotificationInitializer(): null {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      initializeNotifications(user.id).catch(() => {});
    }
  }, [user?.id]);

  useNotificationResponse((decisionId: string) => {
    router.push(`/decisions/${decisionId}`);
  });

  return null;
}

export default function RootLayout(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppProviders>
          <NotificationInitializer />
          <Slot />
          <StatusBar style="auto" />
        </AppProviders>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
