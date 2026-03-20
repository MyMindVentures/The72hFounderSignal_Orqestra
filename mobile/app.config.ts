import { withSentryConfig } from 'sentry-expo';

// Expo config types are optional here; keeping this file dependency-light.
export default ({ config }: { config: any }) => {
  const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
  const sentryOrg = process.env.SENTRY_ORG;
  const sentryProject = process.env.SENTRY_PROJECT;
  const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;

  const baseConfig = {
    ...(config ?? {}),
    name: 'Control Center',
    slug: 'autonomous-control-center-mobile',
    version: '0.1.0',
    orientation: 'portrait',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#050816'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true
    },
    android: {},
    web: {
      bundler: 'metro',
      output: 'static'
    },
    plugins: ['expo-asset', 'expo-router', 'expo-font'],
    runtimeVersion: {
      policy: 'appVersion'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    extra: {
      ...((config ?? {}).extra ?? {}),
      sentryDsn: sentryDsn ?? ''
    }
  };

  if (!sentryAuthToken || !sentryOrg || !sentryProject) {
    return baseConfig;
  }

  return withSentryConfig(baseConfig, {
    org: sentryOrg,
    project: sentryProject,
    authToken: sentryAuthToken
  });
};

