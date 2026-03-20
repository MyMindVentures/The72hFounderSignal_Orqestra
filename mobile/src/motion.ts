import { Easing, withSpring, withTiming, type WithSpringConfig } from 'react-native-reanimated';

// Centralized motion constraints to keep the UI subtle + premium.
export const motionDurations = {
  fast: 180,
  default: 240,
  slow: 320,

  // Hard cap enforced by spec.
  max: 400
} as const;

export const motionEasing = {
  outCubic: Easing.out(Easing.cubic),
  inOutCubic: Easing.inOut(Easing.cubic)
} as const;

// Spring presets tuned to avoid overshoot/jitter and feel "iOS-like".
export const springPresets = {
  // For presses and small interactive affordances.
  tap: {
    damping: 18,
    stiffness: 220,
    mass: 0.35,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
    velocity: 0
  } satisfies WithSpringConfig,

  // For panels and larger transitions.
  panel: {
    damping: 20,
    stiffness: 180,
    mass: 0.4,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
    velocity: 0
  } satisfies WithSpringConfig
} as const;

// ---- Animation primitives (used inside `useAnimatedStyle` / shared values) ----

// Enforces spec duration cap via a single centralized place.
function capDuration(durationMs: number) {
  return Math.min(durationMs, motionDurations.max);
}

export function timing(toValue: number, opts?: { durationMs?: number; easing?: (value: number) => number }) {
  return withTiming(toValue, {
    duration: capDuration(opts?.durationMs ?? motionDurations.default),
    easing: opts?.easing ?? motionEasing.outCubic
  });
}

export function fade(visible: boolean, opts?: { durationMs?: number }) {
  return timing(visible ? 1 : 0, { durationMs: opts?.durationMs });
}

export function slideY(visible: boolean, opts?: { from?: number; durationMs?: number }) {
  const from = opts?.from ?? 10; // small offset, avoids flashy motion
  return timing(visible ? 0 : from, { durationMs: opts?.durationMs });
}

export function scale(visible: boolean, opts?: { from?: number; durationMs?: number }) {
  const from = opts?.from ?? 0.98; // subtle "lift" instead of noticeable zoom
  return timing(visible ? 1 : from, { durationMs: opts?.durationMs });
}

export function springTo(toValue: number, preset: keyof typeof springPresets = 'panel') {
  return withSpring(toValue, springPresets[preset]);
}

