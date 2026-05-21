declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): Record<string, string>;
  }
  export const env: Env;
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
  export function connectKv(options?: any): Promise<any>;

  export const errors: {
    NotFound: new (msg?: string) => Error;
    PermissionDenied: new (msg?: string) => Error;
    ConnectionRefused: new (msg?: string) => Error;
    ConnectionReset: new (msg?: string) => Error;
    ConnectionAborted: new (msg?: string) => Error;
    NotConnected: new (msg?: string) => Error;
    AddrInUse: new (msg?: string) => Error;
    AddrNotAvailable: new (msg?: string) => Error;
    AlreadyExists: new (msg?: string) => Error;
    InvalidData: new (msg?: string) => Error;
    TimedOut: new (msg?: string) => Error;
    Interrupted: new (msg?: string) => Error;
    WriteZero: new (msg?: string) => Error;
    UnexpectedEof: new (msg?: string) => Error;
    BadResource: new (msg?: string) => Error;
    Http: new (msg?: string) => Error;
    Busy: new (msg?: string) => Error;
  };
}

declare module 'https://esm.sh/@supabase/supabase-js@2.39.3' {
  export { createClient } from '@supabase/supabase-js';
}

declare module 'https://esm.sh/*' {
  const content: any;
  export default content;
}

declare module 'https://deno.land/std@0.177.0/crypto/mod.ts' {
  export const crypto: Crypto;
}

declare module 'https://deno.land/std@0.177.0/encoding/hex.ts' {
  export function encodeToString(src: Uint8Array): string;
  export function decodeString(src: string): Uint8Array;
}
