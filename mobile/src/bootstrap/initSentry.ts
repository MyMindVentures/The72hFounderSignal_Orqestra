import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';

let hasInitialized = false;

export function initSentry() {
  if (hasInitialized) return;
  hasInitialized = true;

  const extra =
    (Constants.expoConfig as any)?.extra ?? (Constants.manifest as any)?.extra ?? {};
  const dsn: string | undefined = extra?.sentryDsn;
  if (!dsn) return;

  Sentry.init({
    dsn,
    // Keep this conservative during dev; we still want failures reported in production.
    enableInExpoDevelopment: false
  });
}

