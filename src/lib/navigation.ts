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
      const fn = routeValue as unknown as (params: Record<string, unknown>) => string;
      const params = 'params' in config ? config.params || {} : {};
      const path = fn(params);
      router.push(path as Href);
    } else {
      const params = 'params' in config ? config.params : undefined;
      if (params) {
        const query = Object.entries(params)
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
      const fn = routeValue as unknown as (params: Record<string, unknown>) => string;
      const params = 'params' in config ? config.params || {} : {};
      const path = fn(params);
      router.replace(path as Href);
    } else {
      router.replace(routeValue as Href);
    }
  }

  function back() { router.back(); }

  return { go, replace, back, router };
}

export const CREATE_MODES = {
  quick: '?quick=true',
  practice: '?practice=true',
  full: '',
  withThought: (thought: string) => `?thought=${encodeURIComponent(thought)}`,
} as const;
