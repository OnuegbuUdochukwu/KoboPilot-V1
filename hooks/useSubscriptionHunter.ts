import { useState, useEffect, useCallback } from 'react';
import { subscriptionHunterService, SubscriptionPattern, CancellationGuide, SubscriptionDetectionRequest } from '@/api/services/subscriptionHunter';
import { Transaction } from '@/types';

interface UseSubscriptionHunterReturn {
  // State
  subscriptions: SubscriptionPattern[];
  isLoading: boolean;
  isProcessing: boolean;
  totalDetected: number;
  totalMonthlySpending: number;
  potentialSavings: number;
  
  // Methods
  detectSubscriptions: (request: SubscriptionDetectionRequest) => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
  getCancellationGuide: (vendor: string) => CancellationGuide | null;
  searchCancellationGuides: (query: string) => CancellationGuide[];
  
  // Utilities
  calculateFinancialMetrics: (subs: SubscriptionPattern[]) => void;
  filterSubscriptions: (filter: string, searchQuery?: string) => SubscriptionPattern[];
}

export function useSubscriptionHunter(): UseSubscriptionHunterReturn {
  const [subscriptions, setSubscriptions] = useState<SubscriptionPattern[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalDetected, setTotalDetected] = useState(0);
  const [totalMonthlySpending, setTotalMonthlySpending] = useState(0);
  const [potentialSavings, setPotentialSavings] = useState(0);

  // Initialize the subscription detection model
  const initializeModel = useCallback(async () => {
    try {
      await subscriptionHunterService.initializeModel();
    } catch (error) {
      console.error('Failed to initialize subscription detection model:', error);
    }
  }, []);

  // Detect subscriptions from transaction data
  const detectSubscriptions = useCallback(async (request: SubscriptionDetectionRequest) => {
    setIsProcessing(true);
    try {
      const response = await subscriptionHunterService.detectSubscriptions(request);
      
      setSubscriptions(response.patterns);
      setTotalDetected(response.totalDetected);
      
      // Calculate financial metrics
      calculateFinancialMetrics(response.patterns);
      
    } catch (error) {
      console.error('Failed to detect subscriptions:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Refresh subscriptions
  const refreshSubscriptions = useCallback(async () => {
    if (subscriptions.length === 0) return;
    
    try {
      // Re-run detection with current data
      const response = await subscriptionHunterService.detectSubscriptions({
        transactions: [], // TODO: Get current transactions
        minConfidence: 0.6,
        minTransactions: 2,
      });
      
      setSubscriptions(response.patterns);
      setTotalDetected(response.totalDetected);
      calculateFinancialMetrics(response.patterns);
      
    } catch (error) {
      console.error('Failed to refresh subscriptions:', error);
    }
  }, [subscriptions.length]);

  // Calculate financial metrics from subscriptions
  const calculateFinancialMetrics = useCallback((subs: SubscriptionPattern[]) => {
    let totalMonthly = 0;
    let totalPotentialSavings = 0;
    
    for (const sub of subs) {
      // Calculate monthly equivalent spending
      switch (sub.frequency) {
        case 'daily':
          totalMonthly += sub.averageAmount * 30;
          break;
        case 'weekly':
          totalMonthly += sub.averageAmount * 4.33; // Average weeks per month
          break;
        case 'monthly':
          totalMonthly += sub.averageAmount;
          break;
        case 'yearly':
          totalMonthly += sub.averageAmount / 12;
          break;
        default:
          totalMonthly += sub.averageAmount; // Assume monthly for custom
      }
      
      // Assume 30% of subscriptions could be cancelled
      totalPotentialSavings += sub.averageAmount * 0.3;
    }
    
    setTotalMonthlySpending(totalMonthly);
    setPotentialSavings(totalPotentialSavings);
  }, []);

  // Filter subscriptions based on criteria
  const filterSubscriptions = useCallback((
    filter: string, 
    searchQuery?: string
  ): SubscriptionPattern[] => {
    let filtered = subscriptions;
    
    // Apply search filter
    if (searchQuery?.trim()) {
      filtered = filtered.filter(sub => 
        sub.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    switch (filter) {
      case 'high-confidence':
        filtered = filtered.filter(sub => sub.confidence >= 0.8);
        break;
      case 'recent':
        filtered = filtered.filter(sub => {
          const lastPayment = new Date(sub.lastPaymentDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return lastPayment >= thirtyDaysAgo;
        });
        break;
      case 'expensive':
        filtered = filtered.filter(sub => sub.averageAmount >= 5000);
        break;
      case 'streaming':
        filtered = filtered.filter(sub => 
          sub.category.includes('streaming') || 
          sub.vendor.toLowerCase().includes('netflix') ||
          sub.vendor.toLowerCase().includes('showmax')
        );
        break;
      case 'utilities':
        filtered = filtered.filter(sub => 
          sub.category.includes('bills') || 
          sub.category.includes('utilities')
        );
        break;
      case 'food-delivery':
        filtered = filtered.filter(sub => 
          sub.category.includes('food') || 
          sub.category.includes('delivery')
        );
        break;
      case 'transport':
        filtered = filtered.filter(sub => 
          sub.category.includes('transport') || 
          sub.vendor.toLowerCase().includes('uber') ||
          sub.vendor.toLowerCase().includes('bolt')
        );
        break;
      case 'software':
        filtered = filtered.filter(sub => 
          sub.category.includes('software') || 
          sub.vendor.toLowerCase().includes('microsoft') ||
          sub.vendor.toLowerCase().includes('adobe')
        );
        break;
    }
    
    return filtered;
  }, [subscriptions]);

  // Get cancellation guide for a vendor
  const getCancellationGuide = useCallback((vendor: string): CancellationGuide | null => {
    return subscriptionHunterService.getCancellationGuide(vendor);
  }, []);

  // Search cancellation guides
  const searchCancellationGuides = useCallback((query: string): CancellationGuide[] => {
    return subscriptionHunterService.searchCancellationGuides(query);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  return {
    // State
    subscriptions,
    isLoading,
    isProcessing,
    totalDetected,
    totalMonthlySpending,
    potentialSavings,
    
    // Methods
    detectSubscriptions,
    refreshSubscriptions,
    getCancellationGuide,
    searchCancellationGuides,
    
    // Utilities
    calculateFinancialMetrics,
    filterSubscriptions,
  };
}
