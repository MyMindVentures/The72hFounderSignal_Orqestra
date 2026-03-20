import { createFont, createTamagui, createTokens } from 'tamagui';

// Note: Inter is wired in a later task (T-026 / T-027). Until then, the
// font-family is set so Tamagui stays consistent.
const interFont = createFont({
  family: 'Inter',
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 20
  },
  // These face names must match what `expo-font` registers (T-026).
  face: {
    400: { normal: 'Inter_400Regular' },
    500: { normal: 'Inter_500Medium' },
    600: { normal: 'Inter_600SemiBold' },
    700: { normal: 'Inter_700Bold' }
  }
});

const tokens = createTokens({
  size: {
    0: 0,
    1: 8,
    2: 16,
    3: 24,
    4: 32,
    true: 16
  },
  space: {
    0: 0,
    1: 8,
    2: 16,
    3: 24,
    4: 32,
    true: 16,
    '-1': -8,
    '-2': -16
  },
  radius: {
    0: 0,
    1: 20,
    2: 24,
    3: 28,
    4: 36
  },
  zIndex: {
    0: 0,
    1: 10,
    2: 20,
    3: 30,
    4: 40
  },
  color: {
    // Background depth layers
    bg0: '#02010A',
    bg1: '#050816',
    bg2: '#0A0F2B',

    // Typography
    textPrimary: '#FFFFFF',
    textSecondary: '#B7C0D9',
    textMuted: '#7F8AAE',

    // Semantic
    danger: '#FF3B30',
    success: '#34C759',

    // Screen accents (route-group driven; actual mapping happens in UI code)
    accentHome: '#5AC8FA',
    accentExplore: '#A78BFA',
    accentActivity: '#FFB020',
    accentAi: '#FF2D55',
    accentProfile: '#0A84FF'
  }
});

export const tamaguiConfig = createTamagui({
  fonts: {
    heading: interFont,
    body: interFont
  },
  tokens,
  themes: {
    dark: {
      background: tokens.color.bg0,
      color: tokens.color.textPrimary
    }
  }
});

export default tamaguiConfig;

