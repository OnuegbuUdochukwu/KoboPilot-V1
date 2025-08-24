import { client, ApiResponse, PaginatedResponse } from '../client';
import { BankAccount, AccountBalance } from '@/types';

export interface AccountsResponse extends ApiResponse<BankAccount[]> {}
export interface AccountResponse extends ApiResponse<BankAccount> {}
export interface AccountBalancesResponse extends ApiResponse<AccountBalance[]> {}

export class AccountsService {
  private static instance: AccountsService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): AccountsService {
    if (!AccountsService.instance) {
      AccountsService.instance = new AccountsService();
    }
    return AccountsService.instance;
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

  /**
   * Get all user's bank accounts
   */
  async getAccounts(): Promise<BankAccount[]> {
    const cacheKey = 'accounts';
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const response: AccountsResponse = await client.get('/accounts');
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch accounts');
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  /**
   * Get a specific account by ID
   */
  async getAccount(accountId: string): Promise<BankAccount> {
    const cacheKey = `account_${accountId}`;
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const response: AccountResponse = await client.get(`/accounts/${accountId}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch account');
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  }

  /**
   * Get account balances for all accounts
   */
  async getAccountBalances(): Promise<AccountBalance[]> {
    const cacheKey = 'account_balances';
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const response: AccountBalancesResponse = await client.get('/accounts/balances');
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch account balances');
    } catch (error) {
      console.error('Error fetching account balances:', error);
      throw error;
    }
  }

  /**
   * Get total balance across all accounts
   */
  async getTotalBalance(): Promise<number> {
    try {
      const balances = await this.getAccountBalances();
      return balances.reduce((total, balance) => total + balance.balance, 0);
    } catch (error) {
      console.error('Error calculating total balance:', error);
      return 0;
    }
  }

  /**
   * Refresh account data (force refresh cache)
   */
  async refreshAccounts(): Promise<BankAccount[]> {
    this.clearCache();
    return this.getAccounts();
  }

  /**
   * Sync accounts with bank (Open Banking integration)
   */
  async syncAccounts(): Promise<boolean> {
    try {
      const response = await client.post('/accounts/sync');
      this.clearCache(); // Clear cache after sync
      return response.success;
    } catch (error) {
      console.error('Error syncing accounts:', error);
      throw error;
    }
  }

  /**
   * Add a new bank account
   */
  async addAccount(accountData: Partial<BankAccount>): Promise<BankAccount> {
    try {
      const response: AccountResponse = await client.post('/accounts', accountData);
      
      if (response.success && response.data) {
        this.clearCache(); // Clear cache after adding account
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to add account');
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  }

  /**
   * Update account information
   */
  async updateAccount(accountId: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    try {
      const response: AccountResponse = await client.put(`/accounts/${accountId}`, updates);
      
      if (response.success && response.data) {
        this.clearCache(); // Clear cache after updating
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update account');
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  /**
   * Remove a bank account
   */
  async removeAccount(accountId: string): Promise<boolean> {
    try {
      const response = await client.delete(`/accounts/${accountId}`);
      this.clearCache(); // Clear cache after removing
      return response.success;
    } catch (error) {
      console.error('Error removing account:', error);
      throw error;
    }
  }

  /**
   * Get accounts by bank
   */
  async getAccountsByBank(bankName: string): Promise<BankAccount[]> {
    try {
      const accounts = await this.getAccounts();
      return accounts.filter(account => account.bank === bankName);
    } catch (error) {
      console.error('Error filtering accounts by bank:', error);
      return [];
    }
  }

  /**
   * Get active accounts only
   */
  async getActiveAccounts(): Promise<BankAccount[]> {
    try {
      const accounts = await this.getAccounts();
      return accounts.filter(account => account.isActive);
    } catch (error) {
      console.error('Error filtering active accounts:', error);
      return [];
    }
  }
}

// Export singleton instance
export const accountsService = AccountsService.getInstance();
