declare module 'expo-notifications' {
  export interface NotificationContent {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
    sound?: string;
    badge?: number;
    categoryIdentifier?: string;
  }

  export interface NotificationRequest {
    identifier: string;
    content: NotificationContent;
    trigger: any;
  }

  export interface NotificationResponse {
    notification: {
      request: NotificationRequest;
    };
    actionIdentifier: string;
  }

  export interface NotificationHandler {
    handleNotification: (notification: any) => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
      shouldShowBanner?: boolean;
      shouldShowList?: boolean;
    }>;
  }

  export function setNotificationHandler(handler: NotificationHandler): void;

  export function getPermissionsAsync(): Promise<{ status: string }>;
  export function requestPermissionsAsync(): Promise<{ status: string }>;

  export interface ExpoPushToken {
    data: string;
    type: string;
  }

  export function getExpoPushTokenAsync(options: { projectId?: string }): Promise<{ data: ExpoPushToken }>;

  export function scheduleNotificationAsync(options: {
    identifier?: string;
    content: NotificationContent;
    trigger: any;
  }): Promise<string>;

  export function cancelScheduledNotificationAsync(identifier: string): Promise<void>;
  export function cancelAllScheduledNotificationsAsync(): Promise<void>;
  export function dismissAllNotificationsAsync(): Promise<void>;

  export function setNotificationCategoryAsync(
    identifier: string,
    actions: Array<{
      identifier: string;
      buttonTitle: string;
      options?: { opensAppToForeground?: boolean };
    }>
  ): Promise<void>;

  export function addNotificationResponseReceivedListener(
    listener: (response: NotificationResponse) => void
  ): { remove: () => void };

  export const SchedulableTriggerInputTypes: {
    DATE: 'date';
    TIME_INTERVAL: 'timeInterval';
    DAILY: 'daily';
    WEEKLY: 'weekly';
    YEARLY: 'yearly';
  };

  export interface SchedulableNotificationTrigger {
    type: 'date' | 'timeInterval' | 'daily' | 'weekly' | 'yearly';
    date?: Date | number;
    weekday?: number;
    hour?: number;
    minute?: number;
    repeats?: boolean;
  }
}
