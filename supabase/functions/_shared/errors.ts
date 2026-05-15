// Shared error handling utilities for Edge Functions

import { getCorsHeaders } from './cors.ts';
import { AuthError } from './auth.ts';

export function handleError(
  error: unknown,
  corsHeaders: Record<string, string>,
): Response {
  console.error('Function error:', error);

  if (error instanceof AuthError) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: error.statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}
