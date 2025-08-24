import { client, ApiResponse } from '../client';
import { Subscription, SubscriptionFilters } from '@/types';

export interface SubscriptionsResponse extends ApiResponse<Subscription[]> {}
export interface SubscriptionResponse extends ApiResponse<Subscription> {}

export class SubscriptionsService {
  private static instance: SubscriptionsService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (subscriptions change less frequently)

  private constructor() {}

  public static getInstance(): SubscriptionsService {
    if (!SubscriptionsService.instance) {
      SubscriptionsService.instance = new SubscriptionsService();
    }
    return SubscriptionsService.instance;
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

  private buildCacheKey(endpoint: string, filters?: SubscriptionFilters): string {
    if (!filters) return endpoint;
    
    const filterString = JSON.stringify(filters);
    return `${endpoint}_${btoa(filterString)}`;
  }

  /**
   * Get all subscriptions with optional filtering
   */
  async getSubscriptions(filters?: SubscriptionFilters): Promise<Subscription[]> {
    const cacheKey = this.buildCacheKey('subscriptions', filters);
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters) {
        if (filters.status) params.append('status', filters.status);
        if (filters.categories?.length) params.append('categories', filters.categories.join(','));
        if (filters.banks?.length) params.append('banks', filters.banks.join(','));
        if (filters.accounts?.length) params.append('accounts', filters.accounts.join(','));
        if (filters.minAmount !== undefined) params.append('minAmount', filters.minAmount.toString());
        if (filters.maxAmount !== undefined) params.append('maxAmount', filters.maxAmount.toString());
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/subscriptions?${queryString}` : '/subscriptions';

      const response: SubscriptionsResponse = await client.get(endpoint);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch subscriptions');
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get active subscriptions only
   */
  async getActiveSubscriptions(): Promise<Subscription[]> {
    const cacheKey = 'active_subscriptions';
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const response: SubscriptionsResponse = await client.get('/subscriptions?status=active');
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch active subscriptions');
    } catch (error) {
      console.error('Error fetching active subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get upcoming subscription payments
   */
  async getUpcomingSubscriptions(days: number = 30): Promise<Subscription[]> {
    const cacheKey = `upcoming_subscriptions_${days}`;
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const response: SubscriptionsResponse = await client.get(`/subscriptions/upcoming?days=${days}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch upcoming subscriptions');
    } catch (error) {
      console.error('Error fetching upcoming subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const cacheKey = `subscription_${subscriptionId}`;
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const response: SubscriptionResponse = await client.get(`/subscriptions/${subscriptionId}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch subscription');
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscriptions by category
   */
  async getSubscriptionsByCategory(category: string): Promise<Subscription[]> {
    const cacheKey = `category_subscriptions_${category}`;
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      const response: SubscriptionsResponse = await client.get(`/subscriptions?categories=${category}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch category subscriptions');
    } catch (error) {
      console.error('Error fetching category subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get total monthly subscription spending
   */
  async getTotalMonthlySpending(): Promise<number> {
    try {
      const activeSubscriptions = await this.getActiveSubscriptions();
      return activeSubscriptions.reduce((total, sub) => {
        if (sub.frequency === 'monthly') {
          return total + sub.amount;
        } else if (sub.frequency === 'yearly') {
          return total + (sub.amount / 12);
        } else if (sub.frequency === 'weekly') {
          return total + (sub.amount * 4.33); // Average weeks per month
        } else if (sub.frequency === 'daily') {
          return total + (sub.amount * 30.44); // Average days per month
        }
        return total;
      }, 0);
    } catch (error) {
      console.error('Error calculating total monthly spending:', error);
      return 0;
    }
  }

  /**
   * Get subscription spending by category
   */
  async getSubscriptionSpendingByCategory(): Promise<{ [category: string]: number }> {
    try {
      const activeSubscriptions = await this.getActiveSubscriptions();
      const spendingByCategory: { [category: string]: number } = {};

      activeSubscriptions.forEach(sub => {
        let monthlyAmount = sub.amount;
        
        if (sub.frequency === 'yearly') {
          monthlyAmount = sub.amount / 12;
        } else if (sub.frequency === 'weekly') {
          monthlyAmount = sub.amount * 4.33;
        } else if (sub.frequency === 'daily') {
          monthlyAmount = sub.amount * 30.44;
        }

        if (spendingByCategory[sub.category]) {
          spendingByCategory[sub.category] += monthlyAmount;
        } else {
          spendingByCategory[sub.category] = monthlyAmount;
        }
      });

      return spendingByCategory;
    } catch (error) {
      console.error('Error calculating subscription spending by category:', error);
      return {};
    }
  }

  /**
   * Pause a subscription
   */
  async pauseSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const response: SubscriptionResponse = await client.patch(`/subscriptions/${subscriptionId}`, {
        status: 'paused',
      });
      
      if (response.success && response.data) {
        this.clearCache(); // Clear cache after updating
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to pause subscription');
    } catch (error) {
      console.error('Error pausing subscription:', error);
      throw error;
    }
  }

  /**
   * Resume a paused subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const response: SubscriptionResponse = await client.patch(`/subscriptions/${subscriptionId}`, {
        status: 'active',
      });
      
      if (response.success && response.data) {
        this.clearCache(); // Clear cache after updating
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to resume subscription');
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const response: SubscriptionResponse = await client.patch(`/subscriptions/${subscriptionId}`, {
        status: 'cancelled',
      });
      
      if (response.success && response.data) {
        this.clearCache(); // Clear cache after updating
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to cancel subscription');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription amount
   */
  async updateSubscriptionAmount(
    subscriptionId: string,
    newAmount: number
  ): Promise<Subscription> {
    try {
      const response: SubscriptionResponse = await client.patch(`/subscriptions/${subscriptionId}`, {
        amount: newAmount,
      });
      
      if (response.success && response.data) {
        this.clearCache(); // Clear cache after updating
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update subscription amount');
    } catch (error) {
      console.error('Error updating subscription amount:', error);
      throw error;
    }
  }

  /**
   * Add a new subscription
   */
  async addSubscription(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    try {
      const response: SubscriptionResponse = await client.post('/subscriptions', subscriptionData);
      
      if (response.success && response.data) {
        this.clearCache(); // Clear cache after adding
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to add subscription');
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  }

  /**
   * Remove a subscription
   */
  async removeSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await client.delete(`/subscriptions/${subscriptionId}`);
      this.clearCache(); // Clear cache after removing
      return response.success;
    } catch (error) {
      console.error('Error removing subscription:', error);
      throw error;
    }
  }

  /**
   * Refresh subscriptions (force refresh cache)
   */
  async refreshSubscriptions(): Promise<void> {
    this.clearCache();
  }

  /**
   * Get subscription insights and recommendations
   */
  async getSubscriptionInsights(): Promise<{
    potentialSavings: number;
    recommendations: string[];
    duplicateServices: Subscription[];
  }> {
    try {
      const response = await client.get('/subscriptions/insights');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch subscription insights');
    } catch (error) {
      console.error('Error fetching subscription insights:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const subscriptionsService = SubscriptionsService.getInstance();
