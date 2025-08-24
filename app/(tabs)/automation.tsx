import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Settings, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  PiggyBank,
  BarChart3,
  CreditCard,
  Shield,
  Target
} from 'lucide-react-native';
import { router } from 'expo-router';
import { automatedMoneyFlowsService, AutomationRule, AutomationStats, NIGERIAN_AUTOMATION_TEMPLATES } from '@/api/services/automatedMoneyFlows';

export default function AutomationScreen() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    try {
      setIsLoading(true);
      
      // Load automation rules
      const automationRules = await automatedMoneyFlowsService.getRules();
      setRules(automationRules);
      
      // Load automation statistics
      const automationStats = await automatedMoneyFlowsService.getStats();
      setStats(automationStats);
      
    } catch (error) {
      console.error('Failed to load automation data:', error);
      Alert.alert('Error', 'Failed to load automation data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadAutomationData();
    setIsRefreshing(false);
  };

  const getFilteredRules = () => {
    if (selectedCategory === 'all') return rules;
    return rules.filter(rule => rule.category === selectedCategory);
  };

  const handleCreateRule = () => {
    // TODO: Navigate to rule creation screen
    Alert.alert('Create Rule', 'Rule creation screen will be implemented next.');
  };

  const handleToggleRule = async (rule: AutomationRule) => {
    try {
      const updatedRule = await automatedMoneyFlowsService.updateRule(rule.id, {
        isActive: !rule.isActive
      });
      
      // Update local state
      setRules(prevRules => 
        prevRules.map(r => r.id === rule.id ? updatedRule : r)
      );
      
      // Refresh stats
      const newStats = await automatedMoneyFlowsService.getStats();
      setStats(newStats);
      
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      Alert.alert('Error', 'Failed to toggle rule. Please try again.');
    }
  };

  const handleDeleteRule = async (rule: AutomationRule) => {
    Alert.alert(
      'Delete Rule',
      `Are you sure you want to delete "${rule.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await automatedMoneyFlowsService.deleteRule(rule.id);
              
              // Update local state
              setRules(prevRules => prevRules.filter(r => r.id !== rule.id));
              
              // Refresh stats
              const newStats = await automatedMoneyFlowsService.getStats();
              setStats(newStats);
              
            } catch (error) {
              console.error('Failed to delete rule:', error);
              Alert.alert('Error', 'Failed to delete rule. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings':
        return <PiggyBank size={20} color="#10B981" strokeWidth={2} />;
      case 'investment':
        return <TrendingUp size={20} color="#8B5CF6" strokeWidth={2} />;
      case 'bill-payment':
        return <CreditCard size={20} color="#F59E0B" strokeWidth={2} />;
      case 'debt-repayment':
        return <BarChart3 size={20} color="#EF4444" strokeWidth={2} />;
      case 'emergency-fund':
        return <Shield size={20} color="#06B6D4" strokeWidth={2} />;
      default:
        return <Target size={20} color="#6B7280" strokeWidth={2} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'savings':
        return '#10B981';
      case 'investment':
        return '#8B5CF6';
      case 'bill-payment':
        return '#F59E0B';
      case 'debt-repayment':
        return '#EF4444';
      case 'emergency-fund':
        return '#06B6D4';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} color="#10B981" strokeWidth={2} />;
      case 'pending':
        return <Clock size={16} color="#F59E0B" strokeWidth={2} />;
      case 'failed':
        return <XCircle size={16} color="#EF4444" strokeWidth={2} />;
      case 'paused':
        return <Pause size={16} color="#6B7280" strokeWidth={2} />;
      default:
        return <AlertTriangle size={16} color="#F59E0B" strokeWidth={2} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      case 'paused':
        return '#6B7280';
      default:
        return '#F59E0B';
    }
  };

  const getAmountText = (amount: any) => {
    if (!amount) return '₦0';
    
    switch (amount.type) {
      case 'fixed':
        return `₦${amount.value.toLocaleString()}`;
      case 'percentage':
        return `${amount.value}%`;
      case 'remaining':
        return 'Remaining';
      case 'calculated':
        return 'Calculated';
      default:
        return '₦0';
    }
  };

  const getTriggerText = (trigger: AutomationRule['trigger']) => {
    switch (trigger.type) {
      case 'transaction':
        return 'Transaction-based';
      case 'time':
        return 'Time-based';
      case 'balance':
        return 'Balance-based';
      case 'schedule':
        return 'Scheduled';
      case 'income-detection':
        return 'Income Detection';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BFA6" />
          <Text style={styles.loadingText}>Loading automation rules...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredRules = getFilteredRules();
  const categories = ['all', 'savings', 'investment', 'bill-payment', 'debt-repayment', 'emergency-fund', 'custom'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Automated Money Flows</Text>
          <Text style={styles.headerSubtitle}>
            Set up smart rules to automate your finances
          </Text>
        </View>

        {/* Statistics Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Zap size={24} color="#00BFA6" strokeWidth={2} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Active Rules</Text>
                <Text style={styles.statValue}>{stats.activeRules}</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={24} color="#10B981" strokeWidth={2} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Monthly Savings</Text>
                <Text style={styles.statValue}>₦{stats.monthlySavings.toLocaleString()}</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <CheckCircle size={24} color="#10B981" strokeWidth={2} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Success Rate</Text>
                <Text style={styles.statValue}>{Math.round(stats.efficiency)}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Category Filter Tabs */}
        <View style={styles.categoryTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTab,
                  selectedCategory === category && styles.activeCategoryTab
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryTabText,
                  selectedCategory === category && styles.activeCategoryTabText
                ]}>
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Create Rule Button */}
        <View style={styles.createRuleContainer}>
          <TouchableOpacity style={styles.createRuleButton} onPress={handleCreateRule}>
            <Plus size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.createRuleButtonText}>Create New Rule</Text>
          </TouchableOpacity>
        </View>

        {/* Rules List */}
        <View style={styles.rulesContainer}>
          <Text style={styles.sectionTitle}>
            {filteredRules.length} Rule{filteredRules.length !== 1 ? 's' : ''} Found
          </Text>
          
          {filteredRules.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>⚡</Text>
              <Text style={styles.emptyStateTitle}>No automation rules found</Text>
              <Text style={styles.emptyStateText}>
                {selectedCategory === 'all' 
                  ? 'Create your first automation rule to start automating your finances.'
                  : `No ${selectedCategory} rules found. Try creating one or selecting a different category.`
                }
              </Text>
            </View>
          ) : (
            filteredRules.map(rule => (
              <View key={rule.id} style={styles.ruleCard}>
                <View style={styles.ruleHeader}>
                  <View style={styles.ruleInfo}>
                    <View style={styles.ruleCategory}>
                      {getCategoryIcon(rule.category)}
                      <Text style={[
                        styles.ruleCategoryText,
                        { color: getCategoryColor(rule.category) }
                      ]}>
                        {rule.category.replace('-', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.ruleName}>{rule.name}</Text>
                    <Text style={styles.ruleDescription}>{rule.description}</Text>
                  </View>
                  
                  <View style={styles.ruleStatus}>
                    {getStatusIcon(rule.execution.status)}
                    <Text style={[
                      styles.ruleStatusText,
                      { color: getStatusColor(rule.execution.status) }
                    ]}>
                      {rule.execution.status}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.ruleDetails}>
                  <View style={styles.ruleDetail}>
                    <Text style={styles.ruleDetailLabel}>Trigger:</Text>
                    <Text style={styles.ruleDetailValue}>{getTriggerText(rule.trigger)}</Text>
                  </View>
                  
                  <View style={styles.ruleDetail}>
                    <Text style={styles.ruleDetailLabel}>Action:</Text>
                    <Text style={styles.ruleDetailValue}>
                      {rule.action.type.replace('-', ' ').toUpperCase()}: {getAmountText(rule.action.amount)}
                    </Text>
                  </View>
                  
                  <View style={styles.ruleDetail}>
                    <Text style={styles.ruleDetailLabel}>Priority:</Text>
                    <Text style={styles.ruleDetailValue}>{rule.priority}</Text>
                  </View>
                  
                  <View style={styles.ruleDetail}>
                    <Text style={styles.ruleDetailLabel}>Executions:</Text>
                    <Text style={styles.ruleDetailValue}>{rule.execution.executionCount}</Text>
                  </View>
                </View>
                
                <View style={styles.ruleFooter}>
                  <View style={styles.ruleActions}>
                    <TouchableOpacity
                      style={[
                        styles.ruleActionButton,
                        rule.isActive ? styles.pauseButton : styles.playButton
                      ]}
                      onPress={() => handleToggleRule(rule)}
                    >
                      {rule.isActive ? (
                        <Pause size={16} color="#FFFFFF" strokeWidth={2} />
                      ) : (
                        <Play size={16} color="#FFFFFF" strokeWidth={2} />
                      )}
                      <Text style={styles.ruleActionButtonText}>
                        {rule.isActive ? 'Pause' : 'Activate'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.settingsButton}>
                      <Settings size={16} color="#6B7280" strokeWidth={2} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRule(rule)}
                    >
                      <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  
                  {rule.execution.nextExecution && (
                    <View style={styles.nextExecution}>
                      <Text style={styles.nextExecutionLabel}>Next execution:</Text>
                      <Text style={styles.nextExecutionTime}>
                        {new Date(rule.execution.nextExecution).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Templates Section */}
        <View style={styles.templatesContainer}>
          <Text style={styles.sectionTitle}>Quick Start Templates</Text>
          <Text style={styles.sectionSubtitle}>
            Use these pre-built templates to get started quickly
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {NIGERIAN_AUTOMATION_TEMPLATES.slice(0, 3).map((template, index) => (
              <TouchableOpacity key={index} style={styles.templateCard}>
                <View style={styles.templateIcon}>
                  {getCategoryIcon(template.category || 'custom')}
                </View>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
                <TouchableOpacity style={styles.useTemplateButton}>
                  <Text style={styles.useTemplateButtonText}>Use Template</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A2A4E',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A2A4E',
  },
  categoryTabs: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  categoryTab: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  activeCategoryTab: {
    backgroundColor: '#00BFA6',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
  },
  createRuleContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  createRuleButton: {
    backgroundColor: '#00BFA6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  createRuleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rulesContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  ruleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  ruleCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  ruleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  ruleStatus: {
    alignItems: 'center',
    gap: 4,
  },
  ruleStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ruleDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  ruleDetail: {
    flex: 1,
    minWidth: '45%',
  },
  ruleDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  ruleDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A2A4E',
  },
  ruleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  ruleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  playButton: {
    backgroundColor: '#10B981',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  ruleActionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextExecution: {
    alignItems: 'flex-end',
  },
  nextExecutionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  nextExecutionTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A2A4E',
  },
  templatesContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    width: 200,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  useTemplateButton: {
    backgroundColor: '#00BFA6',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  useTemplateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
