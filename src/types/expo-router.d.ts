declare module 'expo-router' {
  import { ComponentType } from 'react';

  export interface LinkProps {
    href: string | Href;
    asChild?: boolean;
    replace?: boolean;
    push?: boolean;
    children?: React.ReactNode;
    style?: any;
    [key: string]: any;
  }

  export type Href = string | { pathname: string; params?: Record<string, string | undefined> };

  export class Link extends React.Component<LinkProps> {}
  export const Redirect: ComponentType<{ href: string }>;
  export const Stack: ComponentType<{ screenOptions?: any; children?: React.ReactNode }> & {
    Screen: ComponentType<{ name: string; options?: any }>;
  };
  export const Tabs: ComponentType<{ screenOptions?: any; children?: React.ReactNode }> & {
    Screen: ComponentType<{ name: string; options?: any }>;
  };
  export const Slot: ComponentType<{ children?: React.ReactNode }>;

  export function useRouter(): {
    push: (href: Href) => void;
    replace: (href: Href) => void;
    back: () => void;
    navigate: (href: Href) => void;
    reload: () => void;
    canGoBack: () => boolean;
  };
  export function useSegments(): string[];
  export function useLocalSearchParams<T = Record<string, string | string[]>>(): T;
  export function useGlobalSearchParams<T = Record<string, string | string[]>>(): T;
  export function useNavigation(): any;
  export function useFocusEffect(callback: () => void | (() => void)): void;
  export function usePathname(): string;
  export function useRootNavigationState(): any;
}
