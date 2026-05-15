// Notification Service V2 — Extended with streak warnings and weekly reflections
import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';

let isInitialized = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function initializeNotifications(userId: string): Promise<boolean> {
  if (isInitialized) return true;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return false;

    const { data: tokenData } = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    if (tokenData) await saveNotificationToken(userId, tokenData);

    await scheduleDailyReviewCheck();
    await scheduleWeeklyDigest();

    await Notifications.setNotificationCategoryAsync('review_reminder', [
      { identifier: 'review_now', buttonTitle: 'Review Now', options: { opensAppToForeground: true } },
      { identifier: 'remind_later', buttonTitle: 'Remind Tomorrow', options: {} },
    ]);
    await Notifications.setNotificationCategoryAsync('weekly_reflection', [
      { identifier: 'reflect_now', buttonTitle: 'Check In', options: { opensAppToForeground: true } },
      { identifier: 'later', buttonTitle: 'Later', options: {} },
    ]);

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    return false;
  }
}

async function saveNotificationToken(userId: string, token: Notifications.ExpoPushToken): Promise<void> {
  try {
    await supabase.from('notification_tokens').delete().eq('user_id', userId);
    const tokenString = typeof token === 'string' ? token : token.data;
    await supabase.from('notification_tokens').insert({
      user_id: userId, token: tokenString, platform: 'expo', is_active: true,
    });
  } catch (error) {
    console.error('Failed to save notification token:', error);
  }
}

export async function scheduleReviewReminder(
  decisionTitle: string, decisionId: string, scheduledDate: Date,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`review_${decisionId}`);
    const triggerDate = new Date(scheduledDate);
    triggerDate.setHours(9, 0, 0, 0);
    await Notifications.scheduleNotificationAsync({
      identifier: `review_${decisionId}`,
      content: {
        title: 'Decision Review Ready',
        body: `How did "${decisionTitle}" turn out? Review your choice now.`,
        data: { decisionId, type: 'review_reminder' },
        categoryIdentifier: 'review_reminder',
        sound: 'default', badge: 1,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
  } catch (error) {
    console.error('Failed to schedule review reminder:', error);
  }
}

async function scheduleDailyReviewCheck(): Promise<void> {
  // Daily review checks are disabled by default for MVP.
  // Users can opt-in to review reminders for specific decisions they've made.
  // Generic daily prompts will be added after core review loop is proven.
}

export async function scheduleWeeklyDigest(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync('weekly_digest');
    await Notifications.scheduleNotificationAsync({
      identifier: 'weekly_digest',
      content: {
        title: 'Your Week in Decisions',
        body: 'See what decisions you made this week and how your thinking has evolved.',
        data: { type: 'weekly_digest' },
        categoryIdentifier: 'weekly_reflection',
        sound: 'default',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: 10, minute: 0 },
    });
  } catch (error) {
    console.error('Failed to schedule weekly digest:', error);
  }
}

export async function scheduleStreakWarning(): Promise<void> {
  // Streak warnings removed — we only send action-based reminders
  // (review reminders, weekly digests, and re-engagement notifications)
}

export async function scheduleReflectionReminder(decisionTitle: string, decisionId: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: `reflection_${decisionId}`,
      content: {
        title: 'Quick Check-In',
        body: `How are you feeling about "${decisionTitle}" this week?`,
        data: { decisionId, type: 'reflection_reminder' },
        categoryIdentifier: 'weekly_reflection',
        sound: 'default',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 4, hour: 18, minute: 0 },
    });
  } catch (error) {
    console.error('Failed to schedule reflection reminder:', error);
  }
}

export function useNotificationResponse(onReviewTap: (decisionId: string) => void): void {
  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.type === 'review_reminder' && data?.decisionId) {
      onReviewTap(data.decisionId as string);
    }
  });
}

export function removeAllNotifications(): void {
  Notifications.cancelAllScheduledNotificationsAsync();
  Notifications.dismissAllNotificationsAsync();
}
