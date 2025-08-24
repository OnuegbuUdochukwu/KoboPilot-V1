import { client, ApiResponse } from '../client';
import { Transaction, BankAccount } from '@/types';

// Automation Rule Types
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  category: 'savings' | 'investment' | 'bill-payment' | 'debt-repayment' | 'emergency-fund' | 'custom';
  
  // Trigger Configuration
  trigger: {
    type: 'transaction' | 'time' | 'balance' | 'schedule' | 'income-detection';
    conditions: TriggerCondition[];
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    schedule?: {
      dayOfWeek?: number; // 0-6 (Sunday-Saturday)
      dayOfMonth?: number; // 1-31
      time?: string; // HH:MM format
      timezone?: string;
    };
  };
  
  // Action Configuration
  action: {
    type: 'transfer' | 'savings' | 'investment' | 'bill-payment' | 'notification';
    sourceAccountId: string;
    destinationAccountId?: string;
    amount: {
      type: 'fixed' | 'percentage' | 'remaining' | 'calculated';
      value: number;
      currency: string;
      minAmount?: number;
      maxAmount?: number;
    };
    description: string;
    metadata?: Record<string, any>;
  };
  
  // Execution Settings
  execution: {
    lastExecuted?: string;
    nextExecution?: string;
    executionCount: number;
    maxExecutions?: number;
    retryCount: number;
    maxRetries: number;
    status: 'pending' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  };
  
  // Nigerian Context
  nigerianContext?: {
    localBanks?: string[];
    localServices?: string[];
    regulatoryCompliance?: boolean;
    taxImplications?: string;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags?: string[];
}

export interface TriggerCondition {
  field: 'amount' | 'category' | 'vendor' | 'description' | 'balance' | 'date' | 'frequency';
  operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains' | 'starts-with' | 'ends-with' | 'between' | 'in' | 'not-in';
  value: any;
  secondaryValue?: any; // For 'between' operator
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  triggerData: any;
  actionResult: any;
  errorMessage?: string;
  executionTime: string;
  processingTime: number;
  metadata?: Record<string, any>;
}

export interface AutomationStats {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalAmountProcessed: number;
  monthlySavings: number;
  efficiency: number; // Percentage of successful executions
}

// Nigerian Banking and Financial Services
export const NIGERIAN_FINANCIAL_SERVICES = {
  // Traditional Banks
  banks: [
    { id: 'gtbank', name: 'GTBank', type: 'commercial', features: ['savings', 'current', 'investment'] },
    { id: 'access-bank', name: 'Access Bank', type: 'commercial', features: ['savings', 'current', 'investment'] },
    { id: 'zenith-bank', name: 'Zenith Bank', type: 'commercial', features: ['savings', 'current', 'investment'] },
    { id: 'first-bank', name: 'First Bank', type: 'commercial', features: ['savings', 'current', 'investment'] },
    { id: 'uba', name: 'UBA', type: 'commercial', features: ['savings', 'current', 'investment'] },
    { id: 'stanbic-ibtc', name: 'Stanbic IBTC', type: 'commercial', features: ['savings', 'current', 'investment'] },
    { id: 'fidelity-bank', name: 'Fidelity Bank', type: 'commercial', features: ['savings', 'current', 'investment'] },
    { id: 'union-bank', name: 'Union Bank', type: 'commercial', features: ['savings', 'current', 'investment'] },
    { id: 'ecobank', name: 'Ecobank', type: 'commercial', features: ['savings', 'current', 'investment'] },
    { id: 'wema-bank', name: 'Wema Bank', type: 'commercial', features: ['savings', 'current', 'investment'] },
  ],
  
  // Digital Banks & Fintech
  fintech: [
    { id: 'kuda', name: 'Kuda Bank', type: 'digital', features: ['savings', 'current', 'investment', 'automation'] },
    { id: 'piggyvest', name: 'PiggyVest', type: 'savings', features: ['savings', 'investment', 'automation'] },
    { id: 'cowrywise', name: 'Cowrywise', type: 'investment', features: ['savings', 'investment', 'automation'] },
    { id: 'risevest', name: 'Risevest', type: 'investment', features: ['investment', 'automation'] },
    { id: 'bamboo', name: 'Bamboo', type: 'investment', features: ['investment', 'automation'] },
    { id: 'chaka', name: 'Chaka', type: 'investment', features: ['investment', 'automation'] },
  ],
  
  // Investment Platforms
  investments: [
    { id: 'stanbic-ibtc-stockbrokers', name: 'Stanbic IBTC Stockbrokers', type: 'stockbroking', features: ['stocks', 'bonds', 'mutual-funds'] },
    { id: 'meristem', name: 'Meristem Securities', type: 'stockbroking', features: ['stocks', 'bonds', 'mutual-funds'] },
    { id: 'cardinalstone', name: 'Cardinalstone Securities', type: 'stockbroking', features: ['stocks', 'bonds', 'mutual-funds'] },
    { id: 'afrinvest', name: 'Afrinvest Securities', type: 'stockbroking', features: ['stocks', 'bonds', 'mutual-funds'] },
  ],
  
  // Insurance & Pension
  insurance: [
    { id: 'leadway', name: 'Leadway Assurance', type: 'insurance', features: ['life', 'health', 'property', 'automation'] },
    { id: 'aiico', name: 'AIICO Insurance', type: 'insurance', features: ['life', 'health', 'property', 'automation'] },
    { id: 'axa-mansard', name: 'AXA Mansard', type: 'insurance', features: ['life', 'health', 'property', 'automation'] },
    { id: 'cornerstone', name: 'Cornerstone Insurance', type: 'insurance', features: ['life', 'health', 'property', 'automation'] },
  ],
};

// Predefined Automation Templates for Nigerian Users
export const NIGERIAN_AUTOMATION_TEMPLATES: Partial<AutomationRule>[] = [
  // Salary-Based Automations
  {
    name: 'Salary Savings Rule',
    description: 'Automatically save 20% of salary when received',
    category: 'savings',
    priority: 1,
    trigger: {
      type: 'transaction',
      conditions: [
        { field: 'category', operator: 'equals', value: 'income-salary' },
        { field: 'amount', operator: 'greater-than', value: 100000 }
      ]
    },
    action: {
      type: 'transfer',
      amount: { type: 'percentage', value: 20, currency: 'NGN' },
      description: 'Automatic salary savings'
    }
  },
  
  // Emergency Fund Building
  {
    name: 'Emergency Fund Builder',
    description: 'Save ₦50,000 monthly for emergency fund',
    category: 'emergency-fund',
    priority: 2,
    trigger: {
      type: 'schedule',
      frequency: 'monthly',
      schedule: { dayOfMonth: 1, time: '09:00' }
    },
    action: {
      type: 'transfer',
      amount: { type: 'fixed', value: 50000, currency: 'NGN' },
      description: 'Emergency fund contribution'
    }
  },
  
  // Investment Automation
  {
    name: 'Monthly Investment',
    description: 'Invest ₦100,000 monthly in mutual funds',
    category: 'investment',
    priority: 3,
    trigger: {
      type: 'schedule',
      frequency: 'monthly',
      schedule: { dayOfMonth: 15, time: '10:00' }
    },
    action: {
      type: 'investment',
      amount: { type: 'fixed', value: 100000, currency: 'NGN' },
      description: 'Monthly investment contribution'
    }
  },
  
  // Bill Payment Automation
  {
    name: 'Utility Bills Auto-Pay',
    description: 'Automatically pay utility bills when due',
    category: 'bill-payment',
    priority: 4,
    trigger: {
      type: 'transaction',
      conditions: [
        { field: 'category', operator: 'in', value: ['bills-electricity', 'bills-water', 'bills-internet'] }
      ]
    },
    action: {
      type: 'bill-payment',
      amount: { type: 'remaining', value: 0, currency: 'NGN' },
      description: 'Automatic utility bill payment'
    }
  },
  
  // Debt Repayment
  {
    name: 'Loan Repayment',
    description: 'Automatically pay loan installments',
    category: 'debt-repayment',
    priority: 5,
    trigger: {
      type: 'schedule',
      frequency: 'monthly',
      schedule: { dayOfMonth: 25, time: '14:00' }
    },
    action: {
      type: 'transfer',
      amount: { type: 'fixed', value: 75000, currency: 'NGN' },
      description: 'Loan installment payment'
    }
  },
  
  // Smart Savings
  {
    name: 'Spare Change Saver',
    description: 'Save spare change from transactions',
    category: 'savings',
    priority: 6,
    trigger: {
      type: 'transaction',
      conditions: [
        { field: 'type', operator: 'equals', value: 'debit' },
        { field: 'amount', operator: 'greater-than', value: 1000 }
      ]
    },
    action: {
      type: 'transfer',
      amount: { type: 'calculated', value: 100, currency: 'NGN' },
      description: 'Spare change savings'
    }
  },
  
  // Business Expense Management
  {
    name: 'Business Expense Tracking',
    description: 'Separate business expenses automatically',
    category: 'custom',
    priority: 7,
    trigger: {
      type: 'transaction',
      conditions: [
        { field: 'category', operator: 'in', value: ['business', 'office', 'professional'] }
      ]
    },
    action: {
      type: 'transfer',
      amount: { type: 'fixed', value: 0, currency: 'NGN' },
      description: 'Business expense categorization'
    }
  },
  
  // Tax Savings
  {
    name: 'Tax Savings Fund',
    description: 'Save 10% monthly for tax obligations',
    category: 'savings',
    priority: 8,
    trigger: {
      type: 'schedule',
      frequency: 'monthly',
      schedule: { dayOfMonth: 5, time: '11:00' }
    },
    action: {
      type: 'transfer',
      amount: { type: 'percentage', value: 10, currency: 'NGN' },
      description: 'Tax savings contribution'
    }
  }
];

// Automated Money Flows Service
export class AutomatedMoneyFlowsService {
  private static instance: AutomatedMoneyFlowsService;
  private rules: Map<string, AutomationRule> = new Map();
  private executions: Map<string, AutomationExecution> = new Map();
  private isProcessing: boolean = false;
  private processingQueue: string[] = [];

  private constructor() {
    this.initializeDefaultRules();
  }

  public static getInstance(): AutomatedMoneyFlowsService {
    if (!AutomatedMoneyFlowsService.instance) {
      AutomatedMoneyFlowsService.instance = new AutomatedMoneyFlowsService();
    }
    return AutomatedMoneyFlowsService.instance;
  }

  /**
   * Initialize default automation rules
   */
  private initializeDefaultRules(): void {
    NIGERIAN_AUTOMATION_TEMPLATES.forEach((template, index) => {
      const rule: AutomationRule = {
        id: `default_${index + 1}`,
        name: template.name || `Default Rule ${index + 1}`,
        description: template.description || 'Default automation rule',
        isActive: false, // Default rules are inactive until user activates
        priority: template.priority || 1,
        category: template.category || 'custom',
        trigger: template.trigger || {
          type: 'transaction',
          conditions: []
        },
        action: template.action || {
          type: 'transfer',
          sourceAccountId: '',
          amount: { type: 'fixed', value: 0, currency: 'NGN' },
          description: 'Default action'
        },
        execution: {
          executionCount: 0,
          retryCount: 0,
          status: 'pending'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      };
      
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * Create a new automation rule
   */
  async createRule(ruleData: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'execution'>): Promise<AutomationRule> {
    const rule: AutomationRule = {
      ...ruleData,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      execution: {
        executionCount: 0,
        retryCount: 0,
        status: 'pending'
      }
    };

    this.rules.set(rule.id, rule);
    
    // Schedule next execution if rule is active
    if (rule.isActive) {
      this.scheduleNextExecution(rule);
    }

    return rule;
  }

  /**
   * Update an existing automation rule
   */
  async updateRule(ruleId: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule with ID ${ruleId} not found`);
    }

    const updatedRule: AutomationRule = {
      ...rule,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.rules.set(ruleId, updatedRule);
    
    // Reschedule execution if trigger or schedule changed
    if (updates.trigger || updates.isActive !== undefined) {
      this.scheduleNextExecution(updatedRule);
    }

    return updatedRule;
  }

  /**
   * Delete an automation rule
   */
  async deleteRule(ruleId: string): Promise<boolean> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    // Cancel any pending executions
    this.cancelPendingExecutions(ruleId);
    
    this.rules.delete(ruleId);
    return true;
  }

  /**
   * Get all automation rules
   */
  async getRules(filters?: {
    category?: string;
    isActive?: boolean;
    status?: string;
  }): Promise<AutomationRule[]> {
    let rules = Array.from(this.rules.values());
    
    if (filters) {
      if (filters.category) {
        rules = rules.filter(rule => rule.category === filters.category);
      }
      if (filters.isActive !== undefined) {
        rules = rules.filter(rule => rule.isActive === filters.isActive);
      }
      if (filters.status) {
        rules = rules.filter(rule => rule.execution.status === filters.status);
      }
    }
    
    return rules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get a specific automation rule
   */
  async getRule(ruleId: string): Promise<AutomationRule | null> {
    return this.rules.get(ruleId) || null;
  }

  /**
   * Process transaction for automation triggers
   */
  async processTransaction(transaction: Transaction): Promise<void> {
    if (this.isProcessing) {
      return; // Already processing
    }

    this.isProcessing = true;
    
    try {
      const activeRules = Array.from(this.rules.values()).filter(rule => 
        rule.isActive && rule.trigger.type === 'transaction'
      );

      for (const rule of activeRules) {
        if (this.shouldTriggerRule(rule, transaction)) {
          await this.executeRule(rule, { transaction });
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Check if a rule should be triggered
   */
  private shouldTriggerRule(rule: AutomationRule, transaction?: Transaction): boolean {
    if (!rule.isActive) return false;
    
    const { trigger } = rule;
    
    switch (trigger.type) {
      case 'transaction':
        if (!transaction) return false;
        return this.evaluateTriggerConditions(trigger.conditions, transaction);
        
      case 'time':
        return this.shouldTriggerByTime(rule);
        
      case 'balance':
        return this.shouldTriggerByBalance(rule);
        
      case 'schedule':
        return this.shouldTriggerBySchedule(rule);
        
      case 'income-detection':
        return this.shouldTriggerByIncomeDetection(rule, transaction);
        
      default:
        return false;
    }
  }

  /**
   * Evaluate trigger conditions against transaction data
   */
  private evaluateTriggerConditions(conditions: TriggerCondition[], transaction: Transaction): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(transaction, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not-equals':
          return fieldValue !== condition.value;
        case 'greater-than':
          return Number(fieldValue) > Number(condition.value);
        case 'less-than':
          return Number(fieldValue) < Number(condition.value);
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'starts-with':
          return String(fieldValue).toLowerCase().startsWith(String(condition.value).toLowerCase());
        case 'ends-with':
          return String(fieldValue).toLowerCase().endsWith(String(condition.value).toLowerCase());
        case 'between':
          const value = Number(fieldValue);
          return value >= Number(condition.value) && value <= Number(condition.secondaryValue);
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        case 'not-in':
          return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
        default:
          return false;
      }
    });
  }

  /**
   * Get field value from transaction
   */
  private getFieldValue(transaction: Transaction, field: string): any {
    switch (field) {
      case 'amount':
        return transaction.amount;
      case 'category':
        return transaction.category;
      case 'vendor':
        return transaction.metadata?.merchantName || transaction.description;
      case 'description':
        return transaction.description;
      case 'date':
        return transaction.date;
      case 'type':
        return transaction.type;
      default:
        return null;
    }
  }

  /**
   * Check if rule should trigger by time
   */
  private shouldTriggerByTime(rule: AutomationRule): boolean {
    const now = new Date();
    const lastExecution = rule.execution.lastExecuted ? new Date(rule.execution.lastExecuted) : null;
    
    if (!lastExecution) return true;
    
    const { frequency } = rule.trigger;
    if (!frequency) return false;
    
    const timeSinceLastExecution = now.getTime() - lastExecution.getTime();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    switch (frequency) {
      case 'daily':
        return timeSinceLastExecution >= dayInMs;
      case 'weekly':
        return timeSinceLastExecution >= dayInMs * 7;
      case 'monthly':
        return timeSinceLastExecution >= dayInMs * 30;
      case 'yearly':
        return timeSinceLastExecution >= dayInMs * 365;
      default:
        return false;
    }
  }

  /**
   * Check if rule should trigger by balance
   */
  private shouldTriggerByBalance(rule: AutomationRule): boolean {
    // TODO: Implement balance checking logic
    return false;
  }

  /**
   * Check if rule should trigger by schedule
   */
  private shouldTriggerBySchedule(rule: AutomationRule): boolean {
    const { schedule } = rule.trigger;
    if (!schedule) return false;
    
    const now = new Date();
    
    if (schedule.dayOfWeek !== undefined && now.getDay() !== schedule.dayOfWeek) {
      return false;
    }
    
    if (schedule.dayOfMonth !== undefined && now.getDate() !== schedule.dayOfMonth) {
      return false;
    }
    
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime());
      return timeDiff <= 5 * 60 * 1000; // Within 5 minutes
    }
    
    return true;
  }

  /**
   * Check if rule should trigger by income detection
   */
  private shouldTriggerByIncomeDetection(rule: AutomationRule, transaction?: Transaction): boolean {
    if (!transaction) return false;
    
    // Detect salary or large income
    const isSalary = transaction.category === 'income-salary' || 
                    transaction.description.toLowerCase().includes('salary') ||
                    transaction.description.toLowerCase().includes('payroll');
    
    const isLargeIncome = transaction.amount > 100000;
    
    return isSalary || isLargeIncome;
  }

  /**
   * Execute an automation rule
   */
  private async executeRule(rule: AutomationRule, triggerData: any): Promise<void> {
    const execution: AutomationExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      status: 'executing',
      triggerData,
      actionResult: null,
      executionTime: new Date().toISOString(),
      processingTime: 0
    };

    this.executions.set(execution.id, execution);
    
    try {
      const startTime = Date.now();
      
      // Execute the action
      const result = await this.executeAction(rule.action);
      
      execution.actionResult = result;
      execution.status = 'completed';
      execution.processingTime = Date.now() - startTime;
      
      // Update rule execution stats
      rule.execution.executionCount++;
      rule.execution.lastExecuted = new Date().toISOString();
      rule.execution.status = 'active';
      
      // Schedule next execution if applicable
      this.scheduleNextExecution(rule);
      
    } catch (error) {
      execution.status = 'failed';
      execution.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      execution.processingTime = Date.now() - new Date(execution.executionTime).getTime();
      
      // Handle retries
      if (rule.execution.retryCount < rule.execution.maxRetries) {
        rule.execution.retryCount++;
        this.scheduleRetry(rule);
      } else {
        rule.execution.status = 'failed';
      }
    }
    
    this.executions.set(execution.id, execution);
  }

  /**
   * Execute the action specified in a rule
   */
  private async executeAction(action: AutomationRule['action']): Promise<any> {
    switch (action.type) {
      case 'transfer':
        return await this.executeTransfer(action);
      case 'savings':
        return await this.executeSavings(action);
      case 'investment':
        return await this.executeInvestment(action);
      case 'bill-payment':
        return await this.executeBillPayment(action);
      case 'notification':
        return await this.executeNotification(action);
      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  }

  /**
   * Execute a transfer action
   */
  private async executeTransfer(action: AutomationRule['action']): Promise<any> {
    // TODO: Implement actual transfer logic with banking APIs
    const amount = this.calculateAmount(action.amount);
    
    return {
      type: 'transfer',
      amount,
      sourceAccount: action.sourceAccountId,
      destinationAccount: action.destinationAccountId,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute a savings action
   */
  private async executeSavings(action: AutomationRule['action']): Promise<any> {
    const amount = this.calculateAmount(action.amount);
    
    return {
      type: 'savings',
      amount,
      account: action.sourceAccountId,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute an investment action
   */
  private async executeInvestment(action: AutomationRule['action']): Promise<any> {
    const amount = this.calculateAmount(action.amount);
    
    return {
      type: 'investment',
      amount,
      account: action.sourceAccountId,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute a bill payment action
   */
  private async executeBillPayment(action: AutomationRule['action']): Promise<any> {
    const amount = this.calculateAmount(action.amount);
    
    return {
      type: 'bill-payment',
      amount,
      account: action.sourceAccountId,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute a notification action
   */
  private async executeNotification(action: AutomationRule['action']): Promise<any> {
    return {
      type: 'notification',
      message: action.description,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate the amount for an action
   */
  private calculateAmount(amountConfig: AutomationRule['action']['amount']): number {
    switch (amountConfig.type) {
      case 'fixed':
        return amountConfig.value;
      case 'percentage':
        // TODO: Get source account balance for percentage calculation
        return amountConfig.value;
      case 'remaining':
        // TODO: Calculate remaining amount after other deductions
        return amountConfig.value;
      case 'calculated':
        // TODO: Implement custom calculation logic
        return amountConfig.value;
      default:
        return 0;
    }
  }

  /**
   * Schedule next execution for a rule
   */
  private scheduleNextExecution(rule: AutomationRule): void {
    if (!rule.isActive) return;
    
    const now = new Date();
    let nextExecution: Date;
    
    switch (rule.trigger.frequency) {
      case 'daily':
        nextExecution = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextExecution = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextExecution = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        nextExecution = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }
    
    rule.execution.nextExecution = nextExecution.toISOString();
    
    // Add to processing queue
    if (!this.processingQueue.includes(rule.id)) {
      this.processingQueue.push(rule.id);
    }
  }

  /**
   * Schedule a retry for a failed rule
   */
  private scheduleRetry(rule: AutomationRule): void {
    const retryDelay = Math.pow(2, rule.execution.retryCount) * 60 * 1000; // Exponential backoff
    const retryTime = new Date(Date.now() + retryDelay);
    
    rule.execution.nextExecution = retryTime.toISOString();
    
    if (!this.processingQueue.includes(rule.id)) {
      this.processingQueue.push(rule.id);
    }
  }

  /**
   * Cancel pending executions for a rule
   */
  private cancelPendingExecutions(ruleId: string): void {
    this.processingQueue = this.processingQueue.filter(id => id !== ruleId);
  }

  /**
   * Get automation statistics
   */
  async getStats(): Promise<AutomationStats> {
    const rules = Array.from(this.rules.values());
    const executions = Array.from(this.executions.values());
    
    const totalRules = rules.length;
    const activeRules = rules.filter(rule => rule.isActive).length;
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(exec => exec.status === 'completed').length;
    const failedExecutions = executions.filter(exec => exec.status === 'failed').length;
    
    const totalAmountProcessed = executions
      .filter(exec => exec.status === 'completed' && exec.actionResult?.amount)
      .reduce((sum, exec) => sum + (exec.actionResult.amount || 0), 0);
    
    const monthlySavings = executions
      .filter(exec => 
        exec.status === 'completed' && 
        exec.actionResult?.type === 'savings' &&
        new Date(exec.executionTime) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )
      .reduce((sum, exec) => sum + (exec.actionResult.amount || 0), 0);
    
    const efficiency = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    
    return {
      totalRules,
      activeRules,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      totalAmountProcessed,
      monthlySavings,
      efficiency
    };
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(ruleId?: string, limit: number = 50): Promise<AutomationExecution[]> {
    let executions = Array.from(this.executions.values());
    
    if (ruleId) {
      executions = executions.filter(exec => exec.ruleId === ruleId);
    }
    
    return executions
      .sort((a, b) => new Date(b.executionTime).getTime() - new Date(a.executionTime).getTime())
      .slice(0, limit);
  }

  /**
   * Get Nigerian financial services
   */
  getNigerianFinancialServices(): typeof NIGERIAN_FINANCIAL_SERVICES {
    return NIGERIAN_FINANCIAL_SERVICES;
  }

  /**
   * Get automation templates
   */
  getAutomationTemplates(): Partial<AutomationRule>[] {
    return NIGERIAN_AUTOMATION_TEMPLATES;
  }
}

// Export singleton instance
export const automatedMoneyFlowsService = AutomatedMoneyFlowsService.getInstance();
