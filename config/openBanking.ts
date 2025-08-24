// Open Banking Configuration
// Replace these with your actual Open Banking provider credentials

export const OPEN_BANKING_CONFIG = {
  // Mastercard Open Banking Connect SDK
  clientId: process.env.EXPO_PUBLIC_OPEN_BANKING_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.EXPO_PUBLIC_OPEN_BANKING_CLIENT_SECRET || 'demo_client_secret',
  redirectUri: process.env.EXPO_PUBLIC_OPEN_BANKING_REDIRECT_URI || 'kobopilot://openbanking/callback',
  environment: process.env.EXPO_PUBLIC_OPEN_BANKING_ENV || 'sandbox', // 'sandbox' | 'production'
  apiBaseUrl: process.env.EXPO_PUBLIC_OPEN_BANKING_API_URL || 'https://api.mastercard.com/open-banking',
  
  // Alternative Open Banking Providers
  provider: process.env.EXPO_PUBLIC_OPEN_BANKING_PROVIDER || 'mastercard', // 'mastercard' | 'mono' | 'okra'
  
  // Mono Configuration (if using Mono)
  mono: {
    publicKey: process.env.EXPO_PUBLIC_MONO_PUBLIC_KEY || 'test_pk_...',
    secretKey: process.env.EXPO_PUBLIC_MONO_SECRET_KEY || 'test_sk_...',
    apiUrl: 'https://api.withmono.com',
  },
  
  // Okra Configuration (if using Okra)
  okra: {
    publicKey: process.env.EXPO_PUBLIC_OKRA_PUBLIC_KEY || 'pk_test_...',
    secretKey: process.env.EXPO_PUBLIC_OKRA_SECRET_KEY || 'sk_test_...',
    apiUrl: 'https://api.okra.ng',
  },
  
  // Nigerian Banks Configuration
  banks: {
    // GTBank
    gtbank: {
      id: 'gtbank',
      name: 'GTBank',
      logo: 'GT',
      isPopular: true,
      openBankingSupported: true,
      apiEndpoint: 'https://api.gtbank.com/open-banking',
      scopes: ['accounts', 'transactions', 'balance'],
    },
    
    // Access Bank
    'access-bank': {
      id: 'access-bank',
      name: 'Access Bank',
      logo: 'AB',
      isPopular: true,
      openBankingSupported: true,
      apiEndpoint: 'https://api.accessbankplc.com/open-banking',
      scopes: ['accounts', 'transactions', 'balance'],
    },
    
    // Zenith Bank
    'zenith-bank': {
      id: 'zenith-bank',
      name: 'Zenith Bank',
      logo: 'ZB',
      isPopular: true,
      openBankingSupported: true,
      apiEndpoint: 'https://api.zenithbank.com/open-banking',
      scopes: ['accounts', 'transactions', 'balance'],
    },
    
    // First Bank
    'first-bank': {
      id: 'first-bank',
      name: 'First Bank',
      logo: 'FB',
      isPopular: true,
      openBankingSupported: true,
      apiEndpoint: 'https://api.firstbanknigeria.com/open-banking',
      scopes: ['accounts', 'transactions', 'balance'],
    },
    
    // UBA
    uba: {
      id: 'uba',
      name: 'UBA',
      logo: 'UBA',
      isPopular: true,
      openBankingSupported: true,
      apiEndpoint: 'https://api.ubagroup.com/open-banking',
      scopes: ['accounts', 'transactions', 'balance'],
    },
    
    // Stanbic IBTC
    'stanbic-ibtc': {
      id: 'stanbic-ibtc',
      name: 'Stanbic IBTC',
      logo: 'SI',
      isPopular: false,
      openBankingSupported: true,
      apiEndpoint: 'https://api.stanbicibtc.com/open-banking',
      scopes: ['accounts', 'transactions', 'balance'],
    },
    
    // Fidelity Bank
    'fidelity-bank': {
      id: 'fidelity-bank',
      name: 'Fidelity Bank',
      logo: 'FB',
      isPopular: false,
      openBankingSupported: true,
      apiEndpoint: 'https://api.fidelitybank.ng/open-banking',
      scopes: ['accounts', 'transactions', 'balance'],
    },
    
    // Union Bank
    'union-bank': {
      id: 'union-bank',
      name: 'Union Bank',
      logo: 'UB',
      isPopular: false,
      openBankingSupported: true,
      apiEndpoint: 'https://api.unionbankng.com/open-banking',
      scopes: ['accounts', 'transactions', 'balance'],
    },
    
    // Ecobank
    ecobank: {
      id: 'ecobank',
      name: 'Ecobank',
      logo: 'EB',
      isPopular: false,
      openBankingSupported: true,
      apiEndpoint: 'https://api.ecobank.com/open-banking',
      scopes: ['accounts', 'transactions', 'balance'],
    },
    
    // Wema Bank
    'wema-bank': {
      id: 'wema-bank',
      name: 'Wema Bank',
      logo: 'WB',
      isPopular: false,
      openBankingSupported: true,
      apiEndpoint: 'https://api.wemabank.com/open-banking',
      scopes: ['accounts', 'transactions', 'balance'],
    },
  },
  
  // Security Configuration
  security: {
    tokenExpiryBuffer: 5 * 60 * 1000, // 5 minutes buffer before token expiry
    maxRetryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  // API Endpoints
  endpoints: {
    connections: '/connections',
    accounts: '/accounts',
    transactions: '/transactions',
    balance: '/balance',
    oauth: {
      token: '/oauth/token',
      authorize: '/oauth/authorize',
    },
  },
};

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const env = process.env.EXPO_PUBLIC_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...OPEN_BANKING_CONFIG,
        environment: 'production',
        apiBaseUrl: 'https://api.mastercard.com/open-banking',
      };
    
    case 'staging':
      return {
        ...OPEN_BANKING_CONFIG,
        environment: 'sandbox',
        apiBaseUrl: 'https://api-staging.mastercard.com/open-banking',
      };
    
    case 'development':
    default:
      return {
        ...OPEN_BANKING_CONFIG,
        environment: 'sandbox',
        apiBaseUrl: 'https://api-sandbox.mastercard.com/open-banking',
      };
  }
};

// Export the environment-specific configuration
export const config = getEnvironmentConfig();
