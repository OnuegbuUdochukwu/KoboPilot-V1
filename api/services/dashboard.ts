import { accountsService } from './accounts';
import { transactionsService } from './transactions';
import { subscriptionsService } from './subscriptions';
import { DashboardData, FinancialSummary, SpendingInsight, CategorySpending } from '@/types';

export class DashboardService {
  private static instance: DashboardService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 3 * 60 * 1000; // 3 minutes (dashboard data changes frequently)

  private constructor() {}

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
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
   * Get comprehensive dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    const cacheKey = 'dashboard_data';
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      // Fetch data from all services in parallel
      const [
        accounts,
        accountBalances,
        recentTransactions,
        activeSubscriptions,
        monthlySpending
      ] = await Promise.all([
        accountsService.getAccounts(),
        accountsService.getAccountBalances(),
        transactionsService.getRecentTransactions(),
        subscriptionsService.getActiveSubscriptions(),
        this.getCurrentMonthSpending()
      ]);

      // Calculate total balance
      const totalBalance = accountBalances.reduce((total, balance) => total + balance.balance, 0);

      // Calculate total monthly subscription spending
      const totalSubscriptionSpending = await subscriptionsService.getTotalMonthlySpending();

      // Create financial summary
      const summary: FinancialSummary = {
        totalBalance,
        totalIncome: monthlySpending.totalIncome,
        totalExpenses: monthlySpending.totalExpenses + totalSubscriptionSpending,
        netSavings: monthlySpending.totalIncome - monthlySpending.totalExpenses - totalSubscriptionSpending,
        period: 'monthly',
        startDate: this.getMonthStartDate(),
        endDate: this.getMonthEndDate(),
        currency: 'NGN',
      };

      // Get category spending
      const categorySpending = await this.getCategorySpendingData();

      // Get spending insights
      const insights = await this.generateSpendingInsights(summary, categorySpending);

      // Get upcoming subscriptions
      const upcomingSubscriptions = await subscriptionsService.getUpcomingSubscriptions(30);

      const dashboardData: DashboardData = {
        summary,
        recentTransactions,
        upcomingSubscriptions,
        insights,
        categorySpending,
        accountBalances,
      };

      this.setCache(cacheKey, dashboardData);
      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get current month spending summary
   */
  private async getCurrentMonthSpending(): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
  }> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    try {
      return await transactionsService.getMonthlySpending(year, month);
    } catch (error) {
      console.error('Error fetching monthly spending:', error);
      return { totalIncome: 0, totalExpenses: 0, netSavings: 0 };
    }
  }

  /**
   * Get category spending data
   */
  private async getCategorySpendingData(): Promise<CategorySpending[]> {
    try {
      const startDate = this.getMonthStartDate();
      const endDate = this.getMonthEndDate();
      
      return await transactionsService.getCategorySpending(startDate, endDate);
    } catch (error) {
      console.error('Error fetching category spending:', error);
      return [];
    }
  }

  /**
   * Generate spending insights
   */
  private async generateSpendingInsights(
    summary: FinancialSummary,
    categorySpending: CategorySpending[]
  ): Promise<SpendingInsight[]> {
    const insights: SpendingInsight[] = [];

    // Check if spending is high compared to income
    const spendingRatio = summary.totalExpenses / summary.totalIncome;
    if (spendingRatio > 0.8) {
      insights.push({
        id: '1',
        type: 'anomaly',
        title: 'High Spending Alert',
        description: `Your spending is ${Math.round(spendingRatio * 100)}% of your income this month. Consider reviewing your expenses.`,
        percentage: Math.round(spendingRatio * 100),
        period: 'This month',
        actionable: true,
        actionText: 'Review Expenses',
        actionUrl: '/transactions',
      });
    }

    // Check for high subscription spending
    const subscriptionSpending = await subscriptionsService.getTotalMonthlySpending();
    if (subscriptionSpending > summary.totalIncome * 0.1) {
      insights.push({
        id: '2',
        type: 'anomaly',
        title: 'Subscription Spending High',
        description: `Your subscriptions account for ${Math.round((subscriptionSpending / summary.totalIncome) * 100)}% of your income.`,
        amount: subscriptionSpending,
        period: 'This month',
        actionable: true,
        actionText: 'Review Subscriptions',
        actionUrl: '/subscriptions',
      });
    }

    // Check for savings opportunities
    if (summary.netSavings < summary.totalIncome * 0.2) {
      insights.push({
        id: '3',
        type: 'trend',
        title: 'Low Savings Rate',
        description: 'You\'re saving less than 20% of your income. Consider setting up automatic savings.',
        percentage: Math.round((summary.netSavings / summary.totalIncome) * 100),
        period: 'This month',
        actionable: true,
        actionText: 'Set Up Savings',
        actionUrl: '/profile',
      });
    }

    // Check for category spending anomalies
    const highSpendingCategories = categorySpending.filter(cat => 
      cat.percentage > 30 && cat.amount > 50000
    );

    highSpendingCategories.forEach((category, index) => {
      insights.push({
        id: `4_${index}`,
        type: 'increase',
        title: `${category.category} Spending High`,
        description: `${category.category} accounts for ${Math.round(category.percentage)}% of your spending this month.`,
        amount: category.amount,
        percentage: Math.round(category.percentage),
        category: category.category,
        period: 'This month',
        actionable: true,
        actionText: 'Review Category',
        actionUrl: `/transactions?category=${category.category}`,
      });
    });

    return insights;
  }

  /**
   * Get quick stats for dashboard
   */
  async getQuickStats(): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    activeSubscriptions: number;
    totalSubscriptionSpending: number;
  }> {
    try {
      const [
        totalBalance,
        monthlySpending,
        activeSubscriptions,
        totalSubscriptionSpending
      ] = await Promise.all([
        accountsService.getTotalBalance(),
        this.getCurrentMonthSpending(),
        subscriptionsService.getActiveSubscriptions().then(subs => subs.length),
        subscriptionsService.getTotalMonthlySpending()
      ]);

      return {
        totalBalance,
        monthlyIncome: monthlySpending.totalIncome,
        monthlyExpenses: monthlySpending.totalExpenses + totalSubscriptionSpending,
        monthlySavings: monthlySpending.totalIncome - monthlySpending.totalExpenses - totalSubscriptionSpending,
        activeSubscriptions,
        totalSubscriptionSpending,
      };
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      throw error;
    }
  }

  /**
   * Get spending trends for the last 6 months
   */
  async getSpendingTrends(): Promise<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }[]> {
    const trends = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      try {
        const monthlyData = await transactionsService.getMonthlySpending(year, month);
        const subscriptionSpending = await subscriptionsService.getTotalMonthlySpending();

        trends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          income: monthlyData.totalIncome,
          expenses: monthlyData.totalExpenses + subscriptionSpending,
          savings: monthlyData.totalIncome - monthlyData.totalExpenses - subscriptionSpending,
        });
      } catch (error) {
        console.error(`Error fetching spending for ${year}-${month}:`, error);
        trends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          income: 0,
          expenses: 0,
          savings: 0,
        });
      }
    }

    return trends;
  }

  /**
   * Get account overview
   */
  async getAccountOverview(): Promise<{
    totalAccounts: number;
    activeAccounts: number;
    totalBalance: number;
    accountBreakdown: { bank: string; balance: number; count: number }[];
  }> {
    try {
      const accounts = await accountsService.getAccounts();
      const totalBalance = await accountsService.getTotalBalance();

      // Group accounts by bank
      const bankBreakdown = accounts.reduce((acc, account) => {
        const existing = acc.find(b => b.bank === account.bank);
        if (existing) {
          existing.balance += account.balance;
          existing.count += 1;
        } else {
          acc.push({
            bank: account.bank,
            balance: account.balance,
            count: 1,
          });
        }
        return acc;
      }, [] as { bank: string; balance: number; count: number }[]);

      return {
        totalAccounts: accounts.length,
        activeAccounts: accounts.filter(a => a.isActive).length,
        totalBalance,
        accountBreakdown: bankBreakdown,
      };
    } catch (error) {
      console.error('Error fetching account overview:', error);
      throw error;
    }
  }

  /**
   * Refresh dashboard data (force refresh cache)
   */
  async refreshDashboard(): Promise<DashboardData> {
    this.clearCache();
    return this.getDashboardData();
  }

  /**
   * Get month start date in YYYY-MM-DD format
   */
  private getMonthStartDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return new Date(year, month, 1).toISOString().split('T')[0];
  }

  /**
   * Get month end date in YYYY-MM-DD format
   */
  private getMonthEndDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return new Date(year, month, 0).toISOString().split('T')[0];
  }
}

// Export singleton instance
export const dashboardService = DashboardService.getInstance();
