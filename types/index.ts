// User Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  isMfaEnabled: boolean;
  hasConnectedBank: boolean;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  currency: string;
  language: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  transactions: boolean;
  subscriptions: boolean;
  insights: boolean;
}

// Account Types
export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  currency: string;
  type: 'savings' | 'current' | 'fixed' | 'dormant';
  bank: string;
  isActive: boolean;
  lastSync?: string;
}

export interface AccountBalance {
  accountId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  subcategory?: string;
  confidence?: number;
  tags?: string[];
  isUserCorrected?: boolean;
  categorizationDate?: string;
  date: string;
  bank: string;
  accountId: string;
  reference: string;
  balanceAfter: number;
  metadata?: TransactionMetadata;
}

export interface TransactionMetadata {
  merchantName?: string;
  merchantId?: string;
  location?: string;
  deviceType?: string;
  transactionChannel?: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentCategory?: string;
  nigerianContext?: string[];
}

// Subscription Types
export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'daily';
  nextPayment: string;
  category: string;
  vendor: string;
  status: 'active' | 'cancelled' | 'paused' | 'expired';
  bank: string;
  accountId: string;
  lastPayment: string;
  cancellationUrl?: string;
  metadata?: SubscriptionMetadata;
}

export interface SubscriptionMetadata {
  vendorWebsite?: string;
  supportEmail?: string;
  supportPhone?: string;
  termsUrl?: string;
  privacyUrl?: string;
}

// Financial Summary Types
export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  currency: string;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  color: string;
}

export interface SpendingInsight {
  id: string;
  type: 'increase' | 'decrease' | 'anomaly' | 'trend';
  title: string;
  description: string;
  amount?: number;
  percentage?: number;
  category?: string;
  period: string;
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and Query Types
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  banks?: string[];
  accounts?: string[];
  minAmount?: number;
  maxAmount?: number;
  type?: 'credit' | 'debit' | 'all';
  search?: string;
}

export interface SubscriptionFilters {
  status?: 'active' | 'cancelled' | 'paused' | 'expired';
  categories?: string[];
  banks?: string[];
  accounts?: string[];
  minAmount?: number;
  maxAmount?: number;
}

// Dashboard Types
export interface DashboardData {
  summary: FinancialSummary;
  recentTransactions: Transaction[];
  upcomingSubscriptions: Subscription[];
  insights: SpendingInsight[];
  categorySpending: CategorySpending[];
  accountBalances: AccountBalance[];
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: AppError | null;
  lastUpdated?: string;
}

// Form Types
export interface SignUpForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInForm {
  email: string;
  password: string;
}

export interface MfaForm {
  code: string;
  method: 'sms' | 'email';
}

// Navigation Types
export interface RootStackParamList {
  auth: undefined;
  '(tabs)': undefined;
  '+not-found': undefined;
}

export interface AuthStackParamList {
  welcome: undefined;
  signup: undefined;
  signin: undefined;
  'mfa-setup': undefined;
  'bank-connection': undefined;
  'onboarding-complete': undefined;
}

export interface TabStackParamList {
  index: undefined;
  transactions: undefined;
  subscriptions: undefined;
  profile: undefined;
}

// Utility Types
export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';

export type BankName = 
  | 'GTBank' 
  | 'Access Bank' 
  | 'Zenith Bank' 
  | 'First Bank' 
  | 'UBA' 
  | 'Stanbic IBTC'
  | 'Fidelity Bank'
  | 'Union Bank'
  | 'Ecobank'
  | 'Wema Bank';

export type TransactionType = 'credit' | 'debit';

export type SubscriptionStatus = 'active' | 'cancelled' | 'paused' | 'expired';

export type SubscriptionFrequency = 'monthly' | 'yearly' | 'weekly' | 'daily';

// Constants
export const TRANSACTION_CATEGORIES = [
  'Income',
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Business',
  'Investment',
  'Savings',
  'Other',
] as const;

export const SUBSCRIPTION_CATEGORIES = [
  'Entertainment',
  'Productivity',
  'Health & Fitness',
  'Finance',
  'Education',
  'Shopping',
  'Food & Delivery',
  'Transport',
  'Other',
] as const;

export const COLORS = {
  primary: '#0A2A4E',
  secondary: '#00BFA6',
  accent: '#FF7A00',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;
