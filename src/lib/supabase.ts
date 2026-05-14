// Supabase Client
// Centralized Supabase client for client-side operations

import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

// Validate environment variables
const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing SUPABASE_URL. ' +
    'Please check your .env file and ensure the Supabase URL is set.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing SUPABASE_ANON_KEY. ' +
    'Please check your .env file and ensure the Supabase anon key is set.'
  );
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Export type helpers
export type SupabaseClient = typeof supabase;
