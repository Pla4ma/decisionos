// Shared auth utilities for Edge Functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export async function getClient(): ReturnType<typeof createClient> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Server configuration error');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function verifyUser(
  req: Request,
): Promise<{ user: { id: string }; supabase: ReturnType<typeof createClient> }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new AuthError('Authentication required', 401);
  }

  const supabase = await getClient();
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    throw new AuthError('Invalid authentication', 401);
  }

  return { user: { id: user.id }, supabase };
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}
