// Feature Flags - Local Development Toggles
export interface FeatureFlags {
  personalization: boolean;
  appleSubmissionMode: boolean;
  precisionAstro: boolean;
}

// Default feature flags (ON by default - 100% rollout)
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  personalization: true, // ON by default for MVP rollout
  appleSubmissionMode: true, // Apple compliance mode
  precisionAstro: false, // Advanced astrology OFF by default
};

/**
 * Get current feature flags
 */
export function getFeatureFlags(): FeatureFlags {
  // For MVP, using environment variable for dev toggle
  const devEnabled = process.env.EXPO_PUBLIC_DEV_PERSONALIZATION === 'true';
  const appleMode = process.env.EXPO_PUBLIC_APPLE_SUBMISSION_MODE !== 'false'; // Default true
  const precisionAstro = process.env.EXPO_PUBLIC_PRECISION_ASTRO === 'true'; // Default false
  
  return {
    ...DEFAULT_FEATURE_FLAGS,
    personalization: devEnabled,
    appleSubmissionMode: appleMode,
    precisionAstro: precisionAstro,
  };
}

/**
 * Check if personalization is enabled
 */
export function isPersonalizationEnabled(): boolean {
  return getFeatureFlags().personalization;
}

/**
 * Check if in Apple submission mode
 */
export function isAppleSubmissionMode(): boolean {
  return getFeatureFlags().appleSubmissionMode;
}

/**
 * Check if precision astrology is enabled
 */
export function isPrecisionAstroEnabled(): boolean {
  return getFeatureFlags().precisionAstro;
}