import Constants from 'expo-constants';
import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  REVENUECAT_API_KEY: z.string().min(1).optional(),
  ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
});

type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const extra = Constants.expoConfig?.extra || {};

  const parsed = envSchema.safeParse({
    SUPABASE_URL: extra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    REVENUECAT_API_KEY: extra.revenuecatApiKey || process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
    ENVIRONMENT: extra.environment || process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
  });

  if (!parsed.success) {
    console.error('Environment validation failed:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }

  return parsed.data;
}

export const env = getEnv();
