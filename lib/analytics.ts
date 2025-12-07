import posthog from 'posthog-js'

// Analytics event tracking utilities
export const analytics = {
  // Health Records Events
  healthRecordAdded: (data: {
    method: 'csv' | 'quick-entry' | 'manual'
    recordCount: number
    hasWeight?: boolean
    hasSteps?: boolean
    hasSleep?: boolean
    hasCalories?: boolean
  }) => {
    posthog.capture('health_record_added', data)
  },

  healthRecordsViewed: (recordCount: number) => {
    posthog.capture('health_records_viewed', { recordCount })
  },

  // Streaks Events
  streakViewed: (data: {
    currentStreak: number
    longestStreak: number
  }) => {
    posthog.capture('streak_viewed', data)
  },

  streakAchievement: (data: {
    streakDays: number
    isNewRecord: boolean
  }) => {
    posthog.capture('streak_achievement', data)
  },

  // Chat Events
  chatMessageSent: (data: {
    messageLength: number
    hasHealthContext: boolean
  }) => {
    posthog.capture('chat_message_sent', data)
  },

  chatSessionStarted: () => {
    posthog.capture('chat_session_started')
  },

  // Analytics Events
  patternsViewed: (patternCount: number) => {
    posthog.capture('patterns_viewed', { patternCount })
  },

  predictionsViewed: (metric: string) => {
    posthog.capture('predictions_viewed', { metric })
  },

  // Leaderboard Events
  leaderboardViewed: (type: 'steps' | 'sleep' | 'streaks' | 'calories') => {
    posthog.capture('leaderboard_viewed', { type })
  },

  leaderboardTypeChanged: (from: string, to: string) => {
    posthog.capture('leaderboard_type_changed', { from, to })
  },

  // Wearable Integration Events
  wearableConnectionAttempted: (provider: 'apple-health' | 'myfitnesspal' | 'strava') => {
    posthog.capture('wearable_connection_attempted', { provider })
  },

  // Navigation Events
  pageViewed: (pageName: string) => {
    posthog.capture('page_viewed', { pageName })
  },

  // Feature Usage
  featureUsed: (featureName: string, metadata?: Record<string, any>) => {
    posthog.capture('feature_used', { featureName, ...metadata })
  },

  // Errors
  errorOccurred: (error: {
    message: string
    context: string
    severity: 'low' | 'medium' | 'high'
  }) => {
    posthog.capture('error_occurred', error)
  },

  // User Properties
  identifyUser: (userId: string, properties?: Record<string, any>) => {
    posthog.identify(userId, properties)
  },

  setUserProperties: (properties: Record<string, any>) => {
    posthog.people.set(properties)
  },
}

// Helper to check if PostHog is loaded
export const isPostHogLoaded = () => {
  return typeof window !== 'undefined' && posthog && posthog.__loaded
}
