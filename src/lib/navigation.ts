// Navigation Helper — wraps expo-router with route constants
// Ensures all navigation uses the defined route constants (FLOW_ARCHITECTURE.md)

import { useRouter, Href } from 'expo-router';
import { ROUTES, RouteMap } from '@/config/routes';

type RouteParams<T extends keyof RouteMap> = RouteMap[T] extends undefined
  ? { route: T }
  : { route: T; params: RouteMap[T] };

export function useNavigate() {
  const router = useRouter();

  function go<T extends keyof RouteMap>(config: RouteParams<T>) {
    const routeKey = config.route;
    const routeValue = ROUTES[routeKey];

    if (typeof routeValue === 'function') {
      const path = (routeValue as Function)((config as any).params || {});
      router.push(path as Href);
    } else {
      const searchParams = (config as any).params;
      if (searchParams) {
        const query = Object.entries(searchParams)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
          .join('&');
        router.push(`${routeValue}?${query}` as Href);
      } else {
        router.push(routeValue as Href);
      }
    }
  }

  function replace<T extends keyof RouteMap>(config: RouteParams<T>) {
    const routeKey = config.route;
    const routeValue = ROUTES[routeKey];
    if (typeof routeValue === 'function') {
      const path = (routeValue as Function)((config as any).params || {});
      router.replace(path as Href);
    } else {
      router.replace(routeValue as Href);
    }
  }

  function back() { router.back(); }

  return { go, replace, back, router };
}

// Query param helpers for decision creation modes
export const CREATE_MODES = {
  quick: '?quick=true',
  practice: '?practice=true',
  full: '',
  withThought: (thought: string) => `?thought=${encodeURIComponent(thought)}`,
} as const;
