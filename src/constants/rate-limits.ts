export const RATE_LIMITS = {
  PER_MINUTE: {
    POINTS: 20,
    DURATION: 60,
  },
  PER_HOUR: {
    POINTS: 300,
    DURATION: 3600,
  },
  KEY: 'ai-analysis',
} as const; 