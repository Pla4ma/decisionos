// Shared CORS utilities for Edge Functions

export const ALLOWED_ORIGINS = [
  'https://decisionos.app',
  'https://www.decisionos.app',
  'capacitor://localhost',
  'http://localhost:8081',
  'http://localhost:19006',
  'exp://192.168.',
];

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && isOriginAllowed(origin) ? origin : 'https://decisionos.app';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}
