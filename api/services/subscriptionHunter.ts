import { client, ApiResponse } from '../client';
import { Transaction, Subscription } from '@/types';

// Subscription Detection Service
export interface SubscriptionPattern {
  id: string;
  vendor: string;
  averageAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  confidence: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
  transactionCount: number;
  category: string;
  pattern: {
    amountVariation: number;
    dateVariation: number;
    consistency: number;
  };
}

export interface SubscriptionDetectionRequest {
  transactions: Transaction[];
  minConfidence?: number;
  minTransactions?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SubscriptionDetectionResponse {
  patterns: SubscriptionPattern[];
  totalDetected: number;
  processingTime: number;
  algorithm: string;
}

export interface CancellationGuide {
  vendor: string;
  website?: string;
  phone?: string;
  email?: string;
  steps: string[];
  estimatedTime: string;
  refundPolicy?: string;
  alternatives?: string[];
}

// Nigerian Subscription Vendors with Cancellation Guides
export const NIGERIAN_SUBSCRIPTION_VENDORS: Record<string, CancellationGuide> = {
  // Streaming Services
  'netflix': {
    vendor: 'Netflix',
    website: 'https://netflix.com/cancelplan',
    phone: '+234 1 631 0000',
    email: 'support@netflix.com',
    steps: [
      'Sign in to your Netflix account',
      'Go to Account > Cancel Membership',
      'Click "Finish Cancellation"',
      'Your account will remain active until the end of your billing period'
    ],
    estimatedTime: '2-3 minutes',
    refundPolicy: 'No refunds for partial months',
    alternatives: ['Showmax', 'Amazon Prime', 'Disney+']
  },
  
  'showmax': {
    vendor: 'Showmax',
    website: 'https://showmax.com/ng/en/account',
    phone: '+234 1 631 0000',
    email: 'support@showmax.com',
    steps: [
      'Log into your Showmax account',
      'Go to Account Settings',
      'Select "Cancel Subscription"',
      'Confirm cancellation'
    ],
    estimatedTime: '3-5 minutes',
    refundPolicy: 'No refunds for partial months',
    alternatives: ['Netflix', 'Amazon Prime', 'Disney+']
  },
  
  // Internet & Data
  'mtn': {
    vendor: 'MTN Nigeria',
    website: 'https://mtnonline.com',
    phone: '180',
    email: 'support@mtn.com.ng',
    steps: [
      'Dial *123# from your MTN line',
      'Select "My Account"',
      'Choose "Manage Subscriptions"',
      'Select the subscription to cancel',
      'Confirm cancellation'
    ],
    estimatedTime: '5-10 minutes',
    refundPolicy: 'No refunds for active subscriptions',
    alternatives: ['Airtel', 'Glo', '9mobile']
  },
  
  'airtel': {
    vendor: 'Airtel Nigeria',
    website: 'https://airtel.com.ng',
    phone: '111',
    email: 'care@airtel.com.ng',
    steps: [
      'Dial *123# from your Airtel line',
      'Select "My Account"',
      'Choose "Manage Subscriptions"',
      'Select the subscription to cancel',
      'Confirm cancellation'
    ],
    estimatedTime: '5-10 minutes',
    refundPolicy: 'No refunds for active subscriptions',
    alternatives: ['MTN', 'Glo', '9mobile']
  },
  
  // Food Delivery
  'jumia-food': {
    vendor: 'Jumia Food',
    website: 'https://food.jumia.com.ng',
    phone: '+234 1 631 0000',
    email: 'food@jumia.com.ng',
    steps: [
      'Log into your Jumia account',
      'Go to Account > Subscriptions',
      'Find the food subscription',
      'Click "Cancel Subscription"',
      'Confirm cancellation'
    ],
    estimatedTime: '3-5 minutes',
    refundPolicy: 'Refunds available for unused portions',
    alternatives: ['Bolt Food', 'Glovo', 'Chowdeck']
  },
  
  // Ride Sharing
  'uber': {
    vendor: 'Uber',
    website: 'https://uber.com',
    phone: '+234 1 631 0000',
    email: 'support@uber.com',
    steps: [
      'Open Uber app',
      'Go to Account > Subscriptions',
      'Select the subscription',
      'Tap "Cancel Subscription"',
      'Confirm cancellation'
    ],
    estimatedTime: '2-3 minutes',
    refundPolicy: 'No refunds for active subscriptions',
    alternatives: ['Bolt', 'Taxify', 'Local Taxis']
  },
  
  // Software & Apps
  'microsoft': {
    vendor: 'Microsoft',
    website: 'https://account.microsoft.com/services',
    phone: '+234 1 631 0000',
    email: 'support@microsoft.com',
    steps: [
      'Sign in to Microsoft account',
      'Go to Services & Subscriptions',
      'Find the subscription',
      'Click "Manage" then "Cancel"',
      'Confirm cancellation'
    ],
    estimatedTime: '5-10 minutes',
    refundPolicy: 'Refunds available within 30 days',
    alternatives: ['Google Workspace', 'LibreOffice', 'OpenOffice']
  },
  
  // Fitness & Health
  'gym': {
    vendor: 'Gym Membership',
    website: 'Varies by location',
    phone: 'Contact your gym directly',
    email: 'Varies by location',
    steps: [
      'Contact your gym\'s customer service',
      'Request cancellation form',
      'Fill out the form',
      'Submit with required notice period',
      'Return any equipment or access cards'
    ],
    estimatedTime: '15-30 minutes',
    refundPolicy: 'Varies by gym policy',
    alternatives: ['Home workouts', 'Outdoor exercise', 'Online fitness classes']
  },
  
  // Banking & Finance
  'piggyvest': {
    vendor: 'PiggyVest',
    website: 'https://piggyvest.com',
    phone: '+234 700 933 933',
    email: 'support@piggyvest.com',
    steps: [
      'Log into your PiggyVest account',
      'Go to Settings > Account',
      'Select "Deactivate Account"',
      'Follow the deactivation process',
      'Withdraw remaining funds'
    ],
    estimatedTime: '10-15 minutes',
    refundPolicy: 'Full refund of savings balance',
    alternatives: ['Cowrywise', 'Kuda', 'Traditional Banks']
  },
  
  // Education
  'coursera': {
    vendor: 'Coursera',
    website: 'https://coursera.org',
    phone: '+234 1 631 0000',
    email: 'support@coursera.org',
    steps: [
      'Sign in to Coursera account',
      'Go to Account > Subscriptions',
      'Find the subscription',
      'Click "Cancel Subscription"',
      'Confirm cancellation'
    ],
    estimatedTime: '3-5 minutes',
    refundPolicy: 'Refunds available within 7 days',
    alternatives: ['Udemy', 'edX', 'YouTube Learning']
  }
};

// Subscription Hunter Service
export class SubscriptionHunterService {
  private static instance: SubscriptionHunterService;
  private mlModelEndpoint: string;
  private isModelReady: boolean = false;

  private constructor() {
    this.mlModelEndpoint = process.env.EXPO_PUBLIC_ML_MODEL_ENDPOINT || 
      'https://api.kobopilot.com/ml/subscription-detection';
  }

  public static getInstance(): SubscriptionHunterService {
    if (!SubscriptionHunterService.instance) {
      SubscriptionHunterService.instance = new SubscriptionHunterService();
    }
    return SubscriptionHunterService.instance;
  }

  /**
   * Initialize the ML model for subscription detection
   */
  async initializeModel(): Promise<void> {
    try {
      const response = await fetch(`${this.mlModelEndpoint}/health`);
      if (response.ok) {
        this.isModelReady = true;
        console.log('Subscription detection ML model is ready');
      } else {
        throw new Error('ML model not ready');
      }
    } catch (error) {
      console.error('Failed to initialize subscription detection model:', error);
      this.isModelReady = false;
    }
  }

  /**
   * Detect subscription patterns from transaction data
   */
  async detectSubscriptions(request: SubscriptionDetectionRequest): Promise<SubscriptionDetectionResponse> {
    try {
      if (this.isModelReady) {
        return await this.detectWithAI(request);
      } else {
        return await this.detectWithRules(request);
      }
    } catch (error) {
      console.error('Subscription detection failed, falling back to rules:', error);
      return await this.detectWithRules(request);
    }
  }

  /**
   * Detect subscriptions using AI/ML model
   */
  private async detectWithAI(request: SubscriptionDetectionRequest): Promise<SubscriptionDetectionResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.mlModelEndpoint}/detect-subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          transactions: request.transactions,
          min_confidence: request.minConfidence || 0.7,
          min_transactions: request.minTransactions || 3,
          date_range: request.dateRange,
        }),
      });

      if (!response.ok) {
        throw new Error(`ML model error: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        patterns: data.patterns || [],
        totalDetected: data.total_detected || 0,
        processingTime,
        algorithm: 'AI/ML Pattern Recognition',
      };
    } catch (error) {
      console.error('AI subscription detection failed:', error);
      throw error;
    }
  }

  /**
   * Fallback rule-based subscription detection
   */
  private async detectWithRules(request: SubscriptionDetectionRequest): Promise<SubscriptionDetectionResponse> {
    const startTime = Date.now();
    const { transactions, minConfidence = 0.7, minTransactions = 3 } = request;
    
    // Group transactions by vendor/merchant
    const vendorGroups = this.groupTransactionsByVendor(transactions);
    
    // Analyze each vendor group for subscription patterns
    const patterns: SubscriptionPattern[] = [];
    
    for (const [vendor, vendorTransactions] of Object.entries(vendorGroups)) {
      if (vendorTransactions.length < minTransactions) continue;
      
      const pattern = this.analyzeVendorPattern(vendor, vendorTransactions);
      if (pattern && pattern.confidence >= minConfidence) {
        patterns.push(pattern);
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    return {
      patterns: patterns.sort((a, b) => b.confidence - a.confidence),
      totalDetected: patterns.length,
      processingTime,
      algorithm: 'Rule-Based Pattern Analysis',
    };
  }

  /**
   * Group transactions by vendor/merchant
   */
  private groupTransactionsByVendor(transactions: Transaction[]): Record<string, Transaction[]> {
    const groups: Record<string, Transaction[]> = {};
    
    for (const transaction of transactions) {
      const vendor = this.extractVendor(transaction);
      if (!groups[vendor]) {
        groups[vendor] = [];
      }
      groups[vendor].push(transaction);
    }
    
    return groups;
  }

  /**
   * Extract vendor name from transaction
   */
  private extractVendor(transaction: Transaction): string {
    // Try to extract from merchant name first
    if (transaction.metadata?.merchantName) {
      return transaction.metadata.merchantName.toLowerCase();
    }
    
    // Fallback to description analysis
    const description = transaction.description.toLowerCase();
    
    // Nigerian vendor patterns
    const vendorPatterns = [
      { pattern: 'netflix', vendor: 'netflix' },
      { pattern: 'showmax', vendor: 'showmax' },
      { pattern: 'mtn', vendor: 'mtn' },
      { pattern: 'airtel', vendor: 'airtel' },
      { pattern: 'glo', vendor: 'glo' },
      { pattern: 'jumia', vendor: 'jumia-food' },
      { pattern: 'uber', vendor: 'uber' },
      { pattern: 'bolt', vendor: 'bolt' },
      { pattern: 'microsoft', vendor: 'microsoft' },
      { pattern: 'piggyvest', vendor: 'piggyvest' },
      { pattern: 'coursera', vendor: 'coursera' },
      { pattern: 'gym', vendor: 'gym' },
      { pattern: 'fitness', vendor: 'gym' },
    ];
    
    for (const { pattern, vendor } of vendorPatterns) {
      if (description.includes(pattern)) {
        return vendor;
      }
    }
    
    // Generic vendor extraction
    return this.extractGenericVendor(description);
  }

  /**
   * Extract generic vendor from description
   */
  private extractGenericVendor(description: string): string {
    // Remove common prefixes and suffixes
    let vendor = description
      .replace(/^(pos|atm|transfer|payment|debit|credit)\s*/i, '')
      .replace(/\s+(pos|atm|transfer|payment|debit|credit)$/i, '')
      .trim();
    
    // Take first meaningful words
    const words = vendor.split(/\s+/).slice(0, 3);
    return words.join(' ').toLowerCase();
  }

  /**
   * Analyze vendor transaction pattern
   */
  private analyzeVendorPattern(vendor: string, transactions: Transaction[]): SubscriptionPattern | null {
    if (transactions.length < 3) return null;
    
    // Sort transactions by date
    const sortedTransactions = transactions.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Calculate basic metrics
    const amounts = transactions.map(t => t.amount);
    const averageAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const amountVariation = this.calculateVariation(amounts);
    
    // Analyze date patterns
    const datePattern = this.analyzeDatePattern(sortedTransactions);
    if (!datePattern) return null;
    
    // Calculate confidence based on pattern consistency
    const consistency = this.calculateConsistency(transactions, datePattern.frequency);
    const confidence = this.calculateConfidence(amountVariation, datePattern.variation, consistency);
    
    // Determine next payment date
    const lastPayment = sortedTransactions[sortedTransactions.length - 1];
    const nextPaymentDate = this.calculateNextPaymentDate(lastPayment.date, datePattern.frequency);
    
    return {
      id: `${vendor}_${Date.now()}`,
      vendor: this.formatVendorName(vendor),
      averageAmount,
      frequency: datePattern.frequency,
      confidence,
      lastPaymentDate: lastPayment.date,
      nextPaymentDate,
      transactionCount: transactions.length,
      category: this.determineCategory(transactions),
      pattern: {
        amountVariation,
        dateVariation: datePattern.variation,
        consistency,
      },
    };
  }

  /**
   * Analyze date patterns to determine frequency
   */
  private analyzeDatePattern(transactions: Transaction[]): { frequency: string; variation: number } | null {
    if (transactions.length < 3) return null;
    
    const dates = transactions.map(t => new Date(t.date).getTime());
    const intervals: number[] = [];
    
    for (let i = 1; i < dates.length; i++) {
      intervals.push(dates[i] - dates[i - 1]);
    }
    
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variation = this.calculateVariation(intervals);
    
    // Determine frequency based on average interval
    const dayInMs = 24 * 60 * 60 * 1000;
    let frequency: string;
    
    if (averageInterval <= dayInMs * 2) {
      frequency = 'daily';
    } else if (averageInterval <= dayInMs * 8) {
      frequency = 'weekly';
    } else if (averageInterval <= dayInMs * 35) {
      frequency = 'monthly';
    } else if (averageInterval <= dayInMs * 370) {
      frequency = 'yearly';
    } else {
      frequency = 'custom';
    }
    
    return { frequency, variation };
  }

  /**
   * Calculate variation coefficient
   */
  private calculateVariation(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return mean > 0 ? stdDev / mean : 0;
  }

  /**
   * Calculate pattern consistency
   */
  private calculateConsistency(transactions: Transaction[], frequency: string): number {
    const dates = transactions.map(t => new Date(t.date).getTime());
    const intervals: number[] = [];
    
    for (let i = 1; i < dates.length; i++) {
      intervals.push(dates[i] - dates[i - 1]);
    }
    
    if (intervals.length === 0) return 0;
    
    // Calculate how consistent the intervals are
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const deviations = intervals.map(interval => Math.abs(interval - averageInterval));
    const averageDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
    
    // Consistency is inverse to deviation
    return Math.max(0, 1 - (averageDeviation / averageInterval));
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(amountVariation: number, dateVariation: number, consistency: number): number {
    // Lower variation = higher confidence
    const amountConfidence = Math.max(0, 1 - amountVariation);
    const dateConfidence = Math.max(0, 1 - dateVariation);
    
    // Weighted average of all factors
    const confidence = (amountConfidence * 0.3) + (dateConfidence * 0.3) + (consistency * 0.4);
    
    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Calculate next payment date
   */
  private calculateNextPaymentDate(lastPaymentDate: string, frequency: string): string {
    const lastDate = new Date(lastPaymentDate);
    const nextDate = new Date(lastDate);
    
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setDate(nextDate.getDate() + 30); // Default to monthly
    }
    
    return nextDate.toISOString();
  }

  /**
   * Determine category from transactions
   */
  private determineCategory(transactions: Transaction[]): string {
    const categories = transactions.map(t => t.category);
    const categoryCounts: Record<string, number> = {};
    
    for (const category of categories) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
    
    // Return most common category
    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Other';
  }

  /**
   * Format vendor name for display
   */
  private formatVendorName(vendor: string): string {
    return vendor
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get cancellation guide for vendor
   */
  getCancellationGuide(vendor: string): CancellationGuide | null {
    const normalizedVendor = vendor.toLowerCase().replace(/\s+/g, '-');
    
    // Try exact match first
    if (NIGERIAN_SUBSCRIPTION_VENDORS[normalizedVendor]) {
      return NIGERIAN_SUBSCRIPTION_VENDORS[normalizedVendor];
    }
    
    // Try partial matches
    for (const [key, guide] of Object.entries(NIGERIAN_SUBSCRIPTION_VENDORS)) {
      if (normalizedVendor.includes(key) || key.includes(normalizedVendor)) {
        return guide;
      }
    }
    
    return null;
  }

  /**
   * Get all available cancellation guides
   */
  getAllCancellationGuides(): CancellationGuide[] {
    return Object.values(NIGERIAN_SUBSCRIPTION_VENDORS);
  }

  /**
   * Search cancellation guides
   */
  searchCancellationGuides(query: string): CancellationGuide[] {
    const lowerQuery = query.toLowerCase();
    
    return Object.values(NIGERIAN_SUBSCRIPTION_VENDORS).filter(guide =>
      guide.vendor.toLowerCase().includes(lowerQuery) ||
      guide.steps.some(step => step.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get authentication token for ML API
   */
  private async getAuthToken(): Promise<string> {
    // TODO: Implement proper authentication for ML API
    return 'ml_api_token_placeholder';
  }
}

// Export singleton instance
export const subscriptionHunterService = SubscriptionHunterService.getInstance();
