// Feature flags for controlled rollout
export const FEATURES = {
  // ACTIVE - Core MVP features
  aiAdvisor: true,
  marketplace: true,
  profile: true,
  notifications: true,
  
  // COMING SOON - Deactivated for MVP
  community: false,
  diseaseDetection: false,
  satelliteImagery: false,
  analytics: false,
  weatherAlerts: false,
  training: false,
} as const

export type FeatureKey = keyof typeof FEATURES

export const isFeatureEnabled = (feature: FeatureKey): boolean => {
  return FEATURES[feature]
}

export const FEATURE_LABELS = {
  community: "Farmer Community",
  diseaseDetection: "Disease Detection",
  satelliteImagery: "Satellite Monitoring",
  analytics: "Farm Analytics",
  weatherAlerts: "Weather Alerts",
  training: "Training Videos",
} as const

// Helper for displaying "Coming Soon" features
export const getComingSoonFeatures = () => {
  return Object.entries(FEATURES)
    .filter(([, enabled]) => !enabled)
    .map(([feature]) => ({
      name: FEATURE_LABELS[feature as keyof typeof FEATURE_LABELS] || feature,
      key: feature,
    }))
}
