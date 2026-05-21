import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistedClient } from '@tanstack/react-query-persist-client';

const KEY = 'DECISIONOS_QC';

export const asyncStoragePersister = {
  persistClient: async (client: PersistedClient) => {
    await AsyncStorage.setItem(KEY, JSON.stringify(client));
  },
  restoreClient: async (): Promise<PersistedClient | undefined> => {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : undefined;
  },
  removeClient: async () => {
    await AsyncStorage.removeItem(KEY);
  },
};
