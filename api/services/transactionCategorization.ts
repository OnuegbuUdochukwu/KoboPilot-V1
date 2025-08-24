import { client, ApiResponse } from '../client';
import { Transaction, TransactionCategory } from '@/types';

// AI Transaction Categorization Service
export interface CategorizationRequest {
  transactionId: string;
  description: string;
  amount: number;
  merchantName?: string;
  location?: string;
  transactionType: 'credit' | 'debit';
  bank: string;
  accountId: string;
}

export interface CategorizationResponse {
  transactionId: string;
  category: string;
  confidence: number;
  subcategory?: string;
  merchantName?: string;
  tags: string[];
  processingTime: number;
}

export interface CategoryTrainingData {
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  merchantName?: string;
  location?: string;
  isUserCorrected: boolean;
  timestamp: string;
}

// Nigerian Transaction Categories with Local Context
export const NIGERIAN_TRANSACTION_CATEGORIES: TransactionCategory[] = [
  // Income Categories
  {
    id: 'income-salary',
    name: 'Salary',
    icon: '💼',
    color: '#10B981',
    parentCategory: 'Income',
    nigerianContext: ['salary', 'wages', 'payroll', 'monthly pay'],
  },
  {
    id: 'income-business',
    name: 'Business Income',
    icon: '🏢',
    color: '#10B981',
    parentCategory: 'Income',
    nigerianContext: ['business', 'sales', 'revenue', 'profit'],
  },
  {
    id: 'income-transfer',
    name: 'Transfer In',
    icon: '📥',
    color: '#10B981',
    parentCategory: 'Income',
    nigerianContext: ['transfer', 'credit', 'deposit', 'incoming'],
  },

  // Food & Dining
  {
    id: 'food-groceries',
    name: 'Groceries',
    icon: '🛒',
    color: '#F59E0B',
    parentCategory: 'Food & Dining',
    nigerianContext: ['shoprite', 'spar', 'justrite', 'market', 'supermarket', 'foodstuff'],
  },
  {
    id: 'food-restaurant',
    name: 'Restaurants',
    icon: '🍽️',
    color: '#F59E0B',
    parentCategory: 'Food & Dining',
    nigerianContext: ['restaurant', 'eatery', 'kitchen', 'food court', 'cafe'],
  },
  {
    id: 'food-delivery',
    name: 'Food Delivery',
    icon: '🚚',
    color: '#F59E0B',
    parentCategory: 'Food & Dining',
    nigerianContext: ['jumia food', 'bolt food', 'glovo', 'delivery', 'takeaway'],
  },
  {
    id: 'food-street',
    name: 'Street Food',
    icon: '🌮',
    color: '#F59E0B',
    parentCategory: 'Food & Dining',
    nigerianContext: ['buka', 'mama put', 'street food', 'local food'],
  },

  // Transport
  {
    id: 'transport-fuel',
    name: 'Fuel',
    icon: '⛽',
    color: '#EF4444',
    parentCategory: 'Transport',
    nigerianContext: ['nnpc', 'total', 'mobil', 'shell', 'fuel', 'petrol', 'diesel'],
  },
  {
    id: 'transport-public',
    name: 'Public Transport',
    icon: '🚌',
    color: '#EF4444',
    parentCategory: 'Transport',
    nigerianContext: ['danfo', 'buses', 'lagbus', 'metro', 'public transport'],
  },
  {
    id: 'transport-ride',
    name: 'Ride Sharing',
    icon: '🚗',
    color: '#EF4444',
    parentCategory: 'Transport',
    nigerianContext: ['uber', 'bolt', 'taxify', 'ride', 'taxi'],
  },
  {
    id: 'transport-parking',
    name: 'Parking',
    icon: '🅿️',
    color: '#EF4444',
    parentCategory: 'Transport',
    nigerianContext: ['parking', 'park', 'car park'],
  },

  // Bills & Utilities
  {
    id: 'bills-electricity',
    name: 'Electricity',
    icon: '⚡',
    color: '#8B5CF6',
    parentCategory: 'Bills & Utilities',
    nigerianContext: ['ikeja electric', 'eko electricity', 'phcn', 'electricity', 'power'],
  },
  {
    id: 'bills-water',
    name: 'Water',
    icon: '💧',
    color: '#8B5CF6',
    parentCategory: 'Bills & Utilities',
    nigerianContext: ['water', 'water board', 'water corporation'],
  },
  {
    id: 'bills-internet',
    name: 'Internet',
    icon: '🌐',
    color: '#8B5CF6',
    parentCategory: 'Bills & Utilities',
    nigerianContext: ['mtn', 'airtel', 'glo', '9mobile', 'internet', 'data', 'broadband'],
  },
  {
    id: 'bills-airtime',
    name: 'Airtime',
    icon: '📱',
    color: '#8B5CF6',
    parentCategory: 'Bills & Utilities',
    nigerianContext: ['airtime', 'recharge', 'top up', 'credit'],
  },

  // Shopping
  {
    id: 'shopping-clothing',
    name: 'Clothing',
    icon: '👕',
    color: '#06B6D4',
    parentCategory: 'Shopping',
    nigerianContext: ['shoprite', 'spar', 'clothing', 'fashion', 'boutique', 'tailor'],
  },
  {
    id: 'shopping-electronics',
    name: 'Electronics',
    icon: '📱',
    color: '#06B6D4',
    parentCategory: 'Shopping',
    nigerianContext: ['jumia', 'konga', 'slot', 'computer village', 'electronics', 'phone'],
  },
  {
    id: 'shopping-online',
    name: 'Online Shopping',
    icon: '🛍️',
    color: '#06B6D4',
    parentCategory: 'Shopping',
    nigerianContext: ['jumia', 'konga', 'payporte', 'online', 'ecommerce'],
  },

  // Entertainment
  {
    id: 'entertainment-movies',
    name: 'Movies & Shows',
    icon: '🎬',
    color: '#EC4899',
    parentCategory: 'Entertainment',
    nigerianContext: ['cinema', 'filmhouse', 'silverbird', 'movies', 'netflix', 'showmax'],
  },
  {
    id: 'entertainment-gaming',
    name: 'Gaming',
    icon: '🎮',
    color: '#EC4899',
    parentCategory: 'Entertainment',
    nigerianContext: ['steam', 'playstation', 'xbox', 'gaming', 'games'],
  },
  {
    id: 'entertainment-events',
    name: 'Events',
    icon: '🎉',
    color: '#EC4899',
    parentCategory: 'Entertainment',
    nigerianContext: ['event', 'concert', 'party', 'celebration', 'ticket'],
  },

  // Healthcare
  {
    id: 'healthcare-medical',
    name: 'Medical',
    icon: '🏥',
    color: '#EF4444',
    parentCategory: 'Healthcare',
    nigerianContext: ['hospital', 'clinic', 'pharmacy', 'medical', 'health', 'doctor'],
  },
  {
    id: 'healthcare-insurance',
    name: 'Health Insurance',
    icon: '🩺',
    color: '#EF4444',
    parentCategory: 'Healthcare',
    nigerianContext: ['nhis', 'health insurance', 'medical insurance'],
  },

  // Education
  {
    id: 'education-school',
    name: 'School Fees',
    icon: '🎓',
    color: '#8B5CF6',
    parentCategory: 'Education',
    nigerianContext: ['school', 'university', 'college', 'tuition', 'school fees'],
  },
  {
    id: 'education-books',
    name: 'Books & Materials',
    icon: '📚',
    color: '#8B5CF6',
    parentCategory: 'Education',
    nigerianContext: ['books', 'textbooks', 'stationery', 'materials'],
  },

  // Business
  {
    id: 'business-expenses',
    name: 'Business Expenses',
    icon: '💼',
    color: '#6366F1',
    parentCategory: 'Business',
    nigerianContext: ['business', 'office', 'supplies', 'equipment', 'services'],
  },
  {
    id: 'business-taxes',
    name: 'Taxes',
    icon: '💰',
    color: '#6366F1',
    parentCategory: 'Business',
    nigerianContext: ['tax', 'vat', 'paye', 'taxes', 'revenue'],
  },

  // Investment & Savings
  {
    id: 'investment-stocks',
    name: 'Stocks & Shares',
    icon: '📈',
    color: '#10B981',
    parentCategory: 'Investment & Savings',
    nigerianContext: ['ngx', 'stock exchange', 'shares', 'stocks', 'investment'],
  },
  {
    id: 'investment-crypto',
    name: 'Cryptocurrency',
    icon: '₿',
    color: '#10B981',
    parentCategory: 'Investment & Savings',
    nigerianContext: ['bitcoin', 'crypto', 'binance', 'coinbase', 'cryptocurrency'],
  },
  {
    id: 'savings-account',
    name: 'Savings',
    icon: '🏦',
    color: '#10B981',
    parentCategory: 'Investment & Savings',
    nigerianContext: ['savings', 'deposit', 'investment', 'piggyvest', 'cowrywise'],
  },

  // Subscriptions
  {
    id: 'subscriptions-streaming',
    name: 'Streaming Services',
    icon: '📺',
    color: '#F59E0B',
    parentCategory: 'Subscriptions',
    nigerianContext: ['netflix', 'showmax', 'amazon prime', 'disney+', 'streaming'],
  },
  {
    id: 'subscriptions-software',
    name: 'Software & Apps',
    icon: '💻',
    color: '#F59E0B',
    parentCategory: 'Subscriptions',
    nigerianContext: ['microsoft', 'adobe', 'spotify', 'apple', 'software'],
  },
  {
    id: 'subscriptions-gym',
    name: 'Gym & Fitness',
    icon: '💪',
    color: '#F59E0B',
    parentCategory: 'Subscriptions',
    nigerianContext: ['gym', 'fitness', 'workout', 'exercise', 'health club'],
  },

  // Other
  {
    id: 'other-charity',
    name: 'Charity & Donations',
    icon: '❤️',
    color: '#8B5CF6',
    parentCategory: 'Other',
    nigerianContext: ['charity', 'donation', 'give', 'help', 'support'],
  },
  {
    id: 'other-cash',
    name: 'Cash Withdrawal',
    icon: '💵',
    color: '#6B7280',
    parentCategory: 'Other',
    nigerianContext: ['atm', 'cash', 'withdrawal', 'pos', 'point of sale'],
  },
  {
    id: 'other-unknown',
    name: 'Uncategorized',
    icon: '❓',
    color: '#6B7280',
    parentCategory: 'Other',
    nigerianContext: ['unknown', 'uncategorized', 'misc'],
  },
];

// AI Categorization Service
export class TransactionCategorizationService {
  private static instance: TransactionCategorizationService;
  private mlModelEndpoint: string;
  private isModelReady: boolean = false;
  private processingQueue: CategorizationRequest[] = [];
  private isProcessing: boolean = false;

  private constructor() {
    this.mlModelEndpoint = process.env.EXPO_PUBLIC_ML_MODEL_ENDPOINT || 
      'https://api.kobopilot.com/ml/transaction-categorization';
  }

  public static getInstance(): TransactionCategorizationService {
    if (!TransactionCategorizationService.instance) {
      TransactionCategorizationService.instance = new TransactionCategorizationService();
    }
    return TransactionCategorizationService.instance;
  }

  /**
   * Initialize the ML model
   */
  async initializeModel(): Promise<void> {
    try {
      // Check if ML model is ready
      const response = await fetch(`${this.mlModelEndpoint}/health`);
      if (response.ok) {
        this.isModelReady = true;
        console.log('ML model is ready for transaction categorization');
      } else {
        throw new Error('ML model not ready');
      }
    } catch (error) {
      console.error('Failed to initialize ML model:', error);
      // Fallback to rule-based categorization
      this.isModelReady = false;
    }
  }

  /**
   * Categorize a single transaction using AI
   */
  async categorizeTransaction(request: CategorizationRequest): Promise<CategorizationResponse> {
    try {
      if (this.isModelReady) {
        return await this.categorizeWithAI(request);
      } else {
        return await this.categorizeWithRules(request);
      }
    } catch (error) {
      console.error('Categorization failed, falling back to rules:', error);
      return await this.categorizeWithRules(request);
    }
  }

  /**
   * Categorize using AI/ML model
   */
  private async categorizeWithAI(request: CategorizationRequest): Promise<CategorizationResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.mlModelEndpoint}/categorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          description: request.description,
          amount: request.amount,
          merchant_name: request.merchantName,
          location: request.location,
          transaction_type: request.transactionType,
          bank: request.bank,
          account_id: request.accountId,
        }),
      });

      if (!response.ok) {
        throw new Error(`ML model error: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        transactionId: request.transactionId,
        category: data.category,
        confidence: data.confidence || 0.8,
        subcategory: data.subcategory,
        merchantName: data.merchant_name || request.merchantName,
        tags: data.tags || [],
        processingTime,
      };
    } catch (error) {
      console.error('AI categorization failed:', error);
      throw error;
    }
  }

  /**
   * Fallback rule-based categorization for Nigerian transactions
   */
  private async categorizeWithRules(request: CategorizationRequest): Promise<CategorizationResponse> {
    const startTime = Date.now();
    const description = request.description.toLowerCase();
    const amount = request.amount;
    const transactionType = request.transactionType;

    // Income detection
    if (transactionType === 'credit') {
      if (this.matchesPattern(description, ['salary', 'payroll', 'wages', 'monthly pay'])) {
        return this.createResponse(request, 'income-salary', 0.9, startTime);
      }
      if (this.matchesPattern(description, ['business', 'sales', 'revenue'])) {
        return this.createResponse(request, 'income-business', 0.85, startTime);
      }
      return this.createResponse(request, 'income-transfer', 0.8, startTime);
    }

    // Nigerian-specific merchant patterns
    const merchantPatterns = this.getNigerianMerchantPatterns();
    for (const [category, patterns] of Object.entries(merchantPatterns)) {
      if (this.matchesPattern(description, patterns)) {
        return this.createResponse(request, category, 0.85, startTime);
      }
    }

    // Amount-based categorization
    const amountBasedCategory = this.categorizeByAmount(amount, description);
    if (amountBasedCategory) {
      return this.createResponse(request, amountBasedCategory, 0.7, startTime);
    }

    // Default categorization
    return this.createResponse(request, 'other-unknown', 0.5, startTime);
  }

  /**
   * Get Nigerian merchant patterns for categorization
   */
  private getNigerianMerchantPatterns(): Record<string, string[]> {
    return {
      'bills-electricity': ['ikeja electric', 'eko electricity', 'phcn', 'electricity', 'power'],
      'bills-internet': ['mtn', 'airtel', 'glo', '9mobile', 'internet', 'data', 'broadband'],
      'bills-airtime': ['airtime', 'recharge', 'top up', 'credit'],
      'transport-fuel': ['nnpc', 'total', 'mobil', 'shell', 'fuel', 'petrol', 'diesel'],
      'food-groceries': ['shoprite', 'spar', 'justrite', 'market', 'supermarket', 'foodstuff'],
      'food-delivery': ['jumia food', 'bolt food', 'glovo', 'delivery', 'takeaway'],
      'shopping-online': ['jumia', 'konga', 'payporte', 'online', 'ecommerce'],
      'entertainment-movies': ['cinema', 'filmhouse', 'silverbird', 'movies', 'netflix', 'showmax'],
      'healthcare-medical': ['hospital', 'clinic', 'pharmacy', 'medical', 'health', 'doctor'],
      'education-school': ['school', 'university', 'college', 'tuition', 'school fees'],
      'investment-crypto': ['bitcoin', 'crypto', 'binance', 'coinbase', 'cryptocurrency'],
      'savings-account': ['savings', 'deposit', 'investment', 'piggyvest', 'cowrywise'],
    };
  }

  /**
   * Categorize by amount patterns
   */
  private categorizeByAmount(amount: number, description: string): string | null {
    // Small amounts might be airtime, parking, or small purchases
    if (amount <= 1000) {
      if (this.matchesPattern(description, ['airtime', 'recharge'])) {
        return 'bills-airtime';
      }
      if (this.matchesPattern(description, ['parking', 'park'])) {
        return 'transport-parking';
      }
      return 'other-cash';
    }

    // Medium amounts for groceries, food, transport
    if (amount <= 10000) {
      if (this.matchesPattern(description, ['food', 'restaurant', 'eatery'])) {
        return 'food-restaurant';
      }
      if (this.matchesPattern(description, ['transport', 'uber', 'bolt'])) {
        return 'transport-ride';
      }
      return 'food-groceries';
    }

    // Large amounts for bills, shopping, or business
    if (amount <= 100000) {
      if (this.matchesPattern(description, ['electricity', 'power', 'bill'])) {
        return 'bills-electricity';
      }
      if (this.matchesPattern(description, ['shopping', 'clothing', 'electronics'])) {
        return 'shopping-clothing';
      }
      return 'bills-utilities';
    }

    return null;
  }

  /**
   * Check if description matches any patterns
   */
  private matchesPattern(description: string, patterns: string[]): boolean {
    return patterns.some(pattern => description.includes(pattern));
  }

  /**
   * Create categorization response
   */
  private createResponse(
    request: CategorizationRequest, 
    category: string, 
    confidence: number, 
    startTime: number
  ): CategorizationResponse {
    const processingTime = Date.now() - startTime;
    
    return {
      transactionId: request.transactionId,
      category,
      confidence,
      tags: this.generateTags(request.description, category),
      processingTime,
    };
  }

  /**
   * Generate tags for the transaction
   */
  private generateTags(description: string, category: string): string[] {
    const tags: string[] = [];
    
    // Add category-based tags
    const categoryInfo = NIGERIAN_TRANSACTION_CATEGORIES.find(c => c.id === category);
    if (categoryInfo) {
      tags.push(categoryInfo.name);
      tags.push(categoryInfo.parentCategory);
    }

    // Add amount-based tags
    if (description.includes('small') || description.includes('mini')) {
      tags.push('small-amount');
    }

    // Add location-based tags
    if (description.includes('lagos') || description.includes('abuja')) {
      tags.push('major-city');
    }

    return tags;
  }

  /**
   * Batch categorize multiple transactions
   */
  async categorizeBatch(requests: CategorizationRequest[]): Promise<CategorizationResponse[]> {
    try {
      if (this.isModelReady) {
        return await this.categorizeBatchWithAI(requests);
      } else {
        return await Promise.all(requests.map(req => this.categorizeWithRules(req)));
      }
    } catch (error) {
      console.error('Batch categorization failed:', error);
      // Fallback to individual rule-based categorization
      return await Promise.all(requests.map(req => this.categorizeWithRules(req)));
    }
  }

  /**
   * Batch categorize using AI
   */
  private async categorizeBatchWithAI(requests: CategorizationRequest[]): Promise<CategorizationResponse[]> {
    try {
      const response = await fetch(`${this.mlModelEndpoint}/categorize-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({ transactions: requests }),
      });

      if (!response.ok) {
        throw new Error(`Batch ML model error: ${response.status}`);
      }

      const data = await response.json();
      return data.categorizations || [];
    } catch (error) {
      console.error('Batch AI categorization failed:', error);
      throw error;
    }
  }

  /**
   * Get user feedback for model training
   */
  async submitUserFeedback(
    transactionId: string, 
    originalCategory: string, 
    userCategory: string, 
    description: string
  ): Promise<boolean> {
    try {
      const trainingData: CategoryTrainingData = {
        description,
        amount: 0, // Will be filled from transaction data
        category: userCategory,
        subcategory: originalCategory,
        isUserCorrected: true,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(`${this.mlModelEndpoint}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          training_data: trainingData,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to submit user feedback:', error);
      return false;
    }
  }

  /**
   * Get categorization statistics
   */
  async getCategorizationStats(): Promise<{
    totalProcessed: number;
    aiAccuracy: number;
    averageProcessingTime: number;
    categoriesUsed: Record<string, number>;
  }> {
    try {
      const response = await fetch(`${this.mlModelEndpoint}/stats`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
      
      return {
        totalProcessed: 0,
        aiAccuracy: 0,
        averageProcessingTime: 0,
        categoriesUsed: {},
      };
    } catch (error) {
      console.error('Failed to get categorization stats:', error);
      return {
        totalProcessed: 0,
        aiAccuracy: 0,
        averageProcessingTime: 0,
        categoriesUsed: {},
      };
    }
  }

  /**
   * Get authentication token for ML API
   */
  private async getAuthToken(): Promise<string> {
    // TODO: Implement proper authentication for ML API
    // For now, return a placeholder token
    return 'ml_api_token_placeholder';
  }

  /**
   * Get all available categories
   */
  getCategories(): TransactionCategory[] {
    return NIGERIAN_TRANSACTION_CATEGORIES;
  }

  /**
   * Get category by ID
   */
  getCategoryById(categoryId: string): TransactionCategory | undefined {
    return NIGERIAN_TRANSACTION_CATEGORIES.find(cat => cat.id === categoryId);
  }

  /**
   * Get categories by parent category
   */
  getCategoriesByParent(parentCategory: string): TransactionCategory[] {
    return NIGERIAN_TRANSACTION_CATEGORIES.filter(cat => cat.parentCategory === parentCategory);
  }

  /**
   * Search categories by name or context
   */
  searchCategories(query: string): TransactionCategory[] {
    const lowerQuery = query.toLowerCase();
    return NIGERIAN_TRANSACTION_CATEGORIES.filter(cat => 
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.nigerianContext?.some(context => context.toLowerCase().includes(lowerQuery))
    );
  }
}

// Export singleton instance
export const transactionCategorizationService = TransactionCategorizationService.getInstance();
