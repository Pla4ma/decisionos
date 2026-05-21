let sentryDsn: string | null = null;

type CrashContext = {
  error: Error;
  componentStack?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
};

export function configureCrashReporting(dsn: string) {
  sentryDsn = dsn;
}

export function reportError(error: Error, context?: Partial<CrashContext>) {
  const payload = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...(context?.metadata && { metadata: context.metadata }),
    ...(context?.userId && { userId: context.userId }),
    timestamp: new Date().toISOString(),
  };

  console.error('[CrashReport]', payload.message);

  if (sentryDsn) {
    fetch(sentryDsn, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  }
}

export function reportCrash(error: Error, errorInfo: { componentStack?: string }) {
  reportError(error, { componentStack: errorInfo.componentStack });
}
