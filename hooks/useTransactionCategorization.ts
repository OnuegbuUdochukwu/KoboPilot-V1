import { useState, useEffect, useCallback } from 'react';
import { transactionCategorizationService, CategorizationRequest, CategorizationResponse } from '@/api/services/transactionCategorization';
import { Transaction } from '@/types';

interface UseTransactionCategorizationReturn {
  // State
  isModelReady: boolean;
  isProcessing: boolean;
  categorizationStats: {
    totalProcessed: number;
    aiAccuracy: number;
    averageProcessingTime: number;
    categoriesUsed: Record<string, number>;
  };
  
  // Methods
  categorizeTransaction: (transaction: Transaction) => Promise<CategorizationResponse>;
  categorizeBatch: (transactions: Transaction[]) => Promise<CategorizationResponse[]>;
  submitUserFeedback: (transactionId: string, originalCategory: string, userCategory: string, description: string) => Promise<boolean>;
  getCategories: () => any[];
  getCategoryById: (categoryId: string) => any;
  searchCategories: (query: string) => any[];
  
  // Utilities
  refreshStats: () => Promise<void>;
  initializeModel: () => Promise<void>;
}

export function useTransactionCategorization(): UseTransactionCategorizationReturn {
  const [isModelReady, setIsModelReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [categorizationStats, setCategorizationStats] = useState({
    totalProcessed: 0,
    aiAccuracy: 0,
    averageProcessingTime: 0,
    categoriesUsed: {},
  });

  // Initialize the ML model
  const initializeModel = useCallback(async () => {
    try {
      await transactionCategorizationService.initializeModel();
      setIsModelReady(true);
      
      // Load initial stats
      await refreshStats();
    } catch (error) {
      console.error('Failed to initialize transaction categorization model:', error);
      setIsModelReady(false);
    }
  }, []);

  // Refresh categorization statistics
  const refreshStats = useCallback(async () => {
    try {
      const stats = await transactionCategorizationService.getCategorizationStats();
      setCategorizationStats(stats);
    } catch (error) {
      console.error('Failed to refresh categorization stats:', error);
    }
  }, []);

  // Categorize a single transaction
  const categorizeTransaction = useCallback(async (transaction: Transaction): Promise<CategorizationResponse> => {
    setIsProcessing(true);
    try {
      const request: CategorizationRequest = {
        transactionId: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        merchantName: transaction.metadata?.merchantName,
        location: transaction.metadata?.location,
        transactionType: transaction.type,
        bank: transaction.bank,
        accountId: transaction.accountId,
      };

      const response = await transactionCategorizationService.categorizeTransaction(request);
      
      // Update stats after successful categorization
      await refreshStats();
      
      return response;
    } catch (error) {
      console.error('Failed to categorize transaction:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [refreshStats]);

  // Categorize multiple transactions in batch
  const categorizeBatch = useCallback(async (transactions: Transaction[]): Promise<CategorizationResponse[]> => {
    setIsProcessing(true);
    try {
      const requests: CategorizationRequest[] = transactions.map(transaction => ({
        transactionId: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        merchantName: transaction.metadata?.merchantName,
        location: transaction.metadata?.location,
        transactionType: transaction.type,
        bank: transaction.bank,
        accountId: transaction.accountId,
      }));

      const responses = await transactionCategorizationService.categorizeBatch(requests);
      
      // Update stats after successful batch categorization
      await refreshStats();
      
      return responses;
    } catch (error) {
      console.error('Failed to categorize transactions in batch:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [refreshStats]);

  // Submit user feedback for model training
  const submitUserFeedback = useCallback(async (
    transactionId: string,
    originalCategory: string,
    userCategory: string,
    description: string
  ): Promise<boolean> => {
    try {
      const success = await transactionCategorizationService.submitUserFeedback(
        transactionId,
        originalCategory,
        userCategory,
        description
      );

      if (success) {
        // Refresh stats to show updated accuracy
        await refreshStats();
      }

      return success;
    } catch (error) {
      console.error('Failed to submit user feedback:', error);
      return false;
    }
  }, [refreshStats]);

  // Get all available categories
  const getCategories = useCallback(() => {
    return transactionCategorizationService.getCategories();
  }, []);

  // Get category by ID
  const getCategoryById = useCallback((categoryId: string) => {
    return transactionCategorizationService.getCategoryById(categoryId);
  }, []);

  // Search categories
  const searchCategories = useCallback((query: string) => {
    return transactionCategorizationService.searchCategories(query);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  return {
    // State
    isModelReady,
    isProcessing,
    categorizationStats,
    
    // Methods
    categorizeTransaction,
    categorizeBatch,
    submitUserFeedback,
    getCategories,
    getCategoryById,
    searchCategories,
    
    // Utilities
    refreshStats,
    initializeModel,
  };
}
