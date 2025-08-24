import { client, ApiResponse, PaginatedResponse } from '../client';
import { Transaction, TransactionFilters, CategorySpending } from '@/types';

export interface TransactionsResponse extends PaginatedResponse<Transaction> {}
export interface TransactionResponse extends ApiResponse<Transaction> {}
export interface CategorySpendingResponse extends ApiResponse<CategorySpending[]> {}

export class TransactionsService {
  private static instance: TransactionsService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (transactions change frequently)

  private constructor() {}

  public static getInstance(): TransactionsService {
    if (!TransactionsService.instance) {
      TransactionsService.instance = new TransactionsService();
    }
    return TransactionsService.instance;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.CACHE_DURATION;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  private buildCacheKey(endpoint: string, filters?: TransactionFilters): string {
    if (!filters) return endpoint;
    
    const filterString = JSON.stringify(filters);
    return `${endpoint}_${btoa(filterString)}`;
  }

  /**
   * Get transactions with optional filtering and pagination
   */
  async getTransactions(
    page: number = 1,
    limit: number = 20,
    filters?: TransactionFilters
  ): Promise<{ transactions: Transaction[]; pagination: any }> {
    const cacheKey = this.buildCacheKey(`transactions_${page}_${limit}`, filters);
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters) {
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.categories?.length) params.append('categories', filters.categories.join(','));
        if (filters.banks?.length) params.append('banks', filters.banks.join(','));
        if (filters.accounts?.length) params.append('accounts', filters.accounts.join(','));
        if (filters.minAmount !== undefined) params.append('minAmount', filters.minAmount.toString());
        if (filters.maxAmount !== undefined) params.append('maxAmount', filters.maxAmount.toString());
        if (filters.type && filters.type !== 'all') params.append('type', filters.type);
        if (filters.search) params.append('search', filters.search);
      }

      const response: TransactionsResponse = await client.get(`/transactions?${params.toString()}`);
      
      if (response.success && response.data) {
        const result = {
          transactions: response.data,
          pagination: response.pagination,
        };
        
        this.setCache(cacheKey, result);
        return result;
      }
      
      throw new Error(response.message || 'Failed to fetch transactions');
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Get recent transactions (last 10)
   */
  async getRecentTransactions(): Promise<Transaction[]> {
    const cacheKey = 'recent_transactions';
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const response: TransactionsResponse = await client.get('/transactions?limit=10');
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch recent transactions');
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  /**
   * Get transactions for a specific account
   */
  async getTransactionsByAccount(
    accountId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: Transaction[]; pagination: any }> {
    const cacheKey = `account_transactions_${accountId}_${page}_${limit}`;
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        accountId,
      });

      const response: TransactionsResponse = await client.get(`/transactions?${params.toString()}`);
      
      if (response.success && response.data) {
        const result = {
          transactions: response.data,
          pagination: response.pagination,
        };
        
        this.setCache(cacheKey, result);
        return result;
      }
      
      throw new Error(response.message || 'Failed to fetch account transactions');
    } catch (error) {
      console.error('Error fetching account transactions:', error);
      throw error;
    }
  }

  /**
   * Get transactions by category
   */
  async getTransactionsByCategory(
    category: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: Transaction[]; pagination: any }> {
    const cacheKey = `category_transactions_${category}_${page}_${limit}`;
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        categories: category,
      });

      const response: TransactionsResponse = await client.get(`/transactions?${params.toString()}`);
      
      if (response.success && response.data) {
        const result = {
          transactions: response.data,
          pagination: response.pagination,
        };
        
        this.setCache(cacheKey, result);
        return result;
      }
      
      throw new Error(response.message || 'Failed to fetch category transactions');
    } catch (error) {
      console.error('Error fetching category transactions:', error);
      throw error;
    }
  }

  /**
   * Get spending by category for a specific period
   */
  async getCategorySpending(
    startDate: string,
    endDate: string
  ): Promise<CategorySpending[]> {
    const cacheKey = `category_spending_${startDate}_${endDate}`;
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response: CategorySpendingResponse = await client.get(`/transactions/categories/spending?${params.toString()}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch category spending');
    } catch (error) {
      console.error('Error fetching category spending:', error);
      throw error;
    }
  }

  /**
   * Get monthly spending summary
   */
  async getMonthlySpending(year: number, month: number): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
  }> {
    const cacheKey = `monthly_spending_${year}_${month}`;
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await client.get(`/transactions/summary?${params.toString()}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch monthly spending');
    } catch (error) {
      console.error('Error fetching monthly spending:', error);
      throw error;
    }
  }

  /**
   * Search transactions
   */
  async searchTransactions(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: Transaction[]; pagination: any }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: query,
      });

      const response: TransactionsResponse = await client.get(`/transactions?${params.toString()}`);
      
      if (response.success && response.data) {
        return {
          transactions: response.data,
          pagination: response.pagination,
        };
      }
      
      throw new Error(response.message || 'Failed to search transactions');
    } catch (error) {
      console.error('Error searching transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    const cacheKey = `transaction_${transactionId}`;
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const response: TransactionResponse = await client.get(`/transactions/${transactionId}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch transaction');
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Update transaction category
   */
  async updateTransactionCategory(
    transactionId: string,
    category: string
  ): Promise<Transaction> {
    try {
      const response: TransactionResponse = await client.patch(`/transactions/${transactionId}`, {
        category,
      });
      
      if (response.success && response.data) {
        // Clear related caches
        this.clearCache();
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update transaction category');
    } catch (error) {
      console.error('Error updating transaction category:', error);
      throw error;
    }
  }

  /**
   * Refresh transactions (force refresh cache)
   */
  async refreshTransactions(): Promise<void> {
    this.clearCache();
  }

  /**
   * Export transactions to CSV
   */
  async exportTransactions(
    startDate: string,
    endDate: string,
    format: 'csv' | 'pdf' = 'csv'
  ): Promise<string> {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        format,
      });

      const response = await client.get(`/transactions/export?${params.toString()}`);
      
      if (response.success && response.data) {
        return response.data.downloadUrl;
      }
      
      throw new Error(response.message || 'Failed to export transactions');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const transactionsService = TransactionsService.getInstance();
