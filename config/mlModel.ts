// ML Model Configuration for AI Transaction Categorization

export const ML_MODEL_CONFIG = {
  // API Endpoints
  baseUrl: process.env.EXPO_PUBLIC_ML_MODEL_ENDPOINT || 'https://api.kobopilot.com/ml',
  
  // Transaction Categorization
  transactionCategorization: {
    health: '/transaction-categorization/health',
    categorize: '/transaction-categorization/categorize',
    categorizeBatch: '/transaction-categorization/categorize-batch',
    feedback: '/transaction-categorization/feedback',
    stats: '/transaction-categorization/stats',
  },
  
  // Model Settings
  model: {
    name: 'nigerian-transaction-categorizer',
    version: '1.0.0',
    maxBatchSize: 100,
    timeoutMs: 30000,
    retryAttempts: 3,
    retryDelayMs: 1000,
  },
  
  // Categorization Settings
  categorization: {
    confidenceThreshold: 0.7,
    maxProcessingTimeMs: 5000,
    fallbackToRules: true,
    enableUserFeedback: true,
    feedbackBatchSize: 50,
  },
  
  // Nigerian Context
  nigerianContext: {
    supportedBanks: [
      'GTBank', 'Access Bank', 'Zenith Bank', 'First Bank', 'UBA',
      'Stanbic IBTC', 'Fidelity Bank', 'Union Bank', 'Ecobank', 'Wema Bank'
    ],
    supportedCurrencies: ['NGN'],
    localMerchants: [
      'shoprite', 'spar', 'justrite', 'jumia', 'konga', 'bolt', 'uber',
      'mtn', 'airtel', 'glo', '9mobile', 'ikeja electric', 'eko electricity'
    ],
    transactionPatterns: {
      smallAmounts: { max: 1000, categories: ['bills-airtime', 'transport-parking'] },
      mediumAmounts: { min: 1001, max: 10000, categories: ['food-restaurant', 'transport-ride'] },
      largeAmounts: { min: 10001, max: 100000, categories: ['bills-electricity', 'shopping-clothing'] },
    },
  },
  
  // Performance Settings
  performance: {
    cacheEnabled: true,
    cacheDurationMs: 5 * 60 * 1000, // 5 minutes
    maxConcurrentRequests: 10,
    requestQueueSize: 100,
  },
  
  // Security Settings
  security: {
    requireAuthentication: true,
    tokenExpiryMs: 60 * 60 * 1000, // 1 hour
    rateLimitPerMinute: 100,
    enableLogging: true,
  },
  
  // Environment-specific overrides
  environments: {
    development: {
      baseUrl: 'http://localhost:8000/ml',
      timeoutMs: 60000,
      enableLogging: true,
      fallbackToRules: true,
    },
    staging: {
      baseUrl: 'https://api-staging.kobopilot.com/ml',
      timeoutMs: 30000,
      enableLogging: true,
      fallbackToRules: true,
    },
    production: {
      baseUrl: 'https://api.kobopilot.com/ml',
      timeoutMs: 15000,
      enableLogging: false,
      fallbackToRules: false,
    },
  },
};

// Get environment-specific configuration
export const getMLModelConfig = () => {
  const env = process.env.EXPO_PUBLIC_ENV || 'development';
  const envConfig = ML_MODEL_CONFIG.environments[env as keyof typeof ML_MODEL_CONFIG.environments];
  
  return {
    ...ML_MODEL_CONFIG,
    ...envConfig,
  };
};

// Export the environment-specific configuration
export const config = getMLModelConfig();
