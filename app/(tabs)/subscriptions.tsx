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
import { Search, Filter, TrendingUp, DollarSign, AlertTriangle, CheckCircle, XCircle } from 'lucide-react-native';

interface Subscription {
  id: string;
  vendor: string;
  category: string;
  frequency: string;
  averageAmount: number;
  confidence: number;
  transactionCount: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
}

export default function SubscriptionsScreen() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [totalMonthlySpending, setTotalMonthlySpending] = useState(0);
  const [potentialSavings, setPotentialSavings] = useState(0);

  // Mock subscription data for demonstration
  const mockSubscriptions = [
    {
      id: '1',
      vendor: 'Netflix',
      category: 'Streaming',
      frequency: 'monthly',
      averageAmount: 2500,
      confidence: 0.95,
      transactionCount: 3,
      lastPaymentDate: '2024-03-15',
      nextPaymentDate: '2024-04-15',
    },
    {
      id: '2',
      vendor: 'MTN Data Plan',
      category: 'Internet',
      frequency: 'monthly',
      averageAmount: 1500,
      confidence: 0.88,
      transactionCount: 3,
      lastPaymentDate: '2024-03-01',
      nextPaymentDate: '2024-04-01',
    },
    {
      id: '3',
      vendor: 'Jumia Food',
      category: 'Food Delivery',
      frequency: 'monthly',
      averageAmount: 5000,
      confidence: 0.92,
      transactionCount: 3,
      lastPaymentDate: '2024-03-10',
      nextPaymentDate: '2024-04-10',
    },
  ];

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscriptions(mockSubscriptions);
      calculateFinancialMetrics(mockSubscriptions);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      Alert.alert('Error', 'Failed to load subscriptions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFinancialMetrics = (subs: Subscription[]) => {
    let totalMonthly = 0;
    let totalPotentialSavings = 0;
    
    for (const sub of subs) {
      if (sub.frequency === 'monthly') {
        totalMonthly += sub.averageAmount;
      }
      // Assume 30% of subscriptions could be cancelled
      totalPotentialSavings += sub.averageAmount * 0.3;
    }
    
    setTotalMonthlySpending(totalMonthly);
    setPotentialSavings(totalPotentialSavings);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadSubscriptions();
    setIsRefreshing(false);
  };

  const getFilteredSubscriptions = () => {
    let filtered = subscriptions;
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(sub => 
        sub.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    switch (selectedFilter) {
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
    }
    
    return filtered;
  };

  const handleSubscriptionPress = (subscription: Subscription) => {
    Alert.alert(
      subscription.vendor,
      `Average Amount: ₦${subscription.averageAmount.toLocaleString()}\nFrequency: ${subscription.frequency}\nConfidence: ${Math.round(subscription.confidence * 100)}%\n\nTap to view cancellation guide.`
    );
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      case 'yearly': return '📅';
      default: return '📅';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10B981';
    if (confidence >= 0.6) return '#F59E0B';
    return '#EF4444';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle size={16} color="#10B981" strokeWidth={2} />;
    if (confidence >= 0.6) return <AlertTriangle size={16} color="#F59E0B" strokeWidth={2} />;
    return <XCircle size={16} color="#EF4444" strokeWidth={2} />;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BFA6" />
          <Text style={styles.loadingText}>Hunting for subscriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredSubscriptions = getFilteredSubscriptions();

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
          <Text style={styles.headerTitle}>Subscription Hunter</Text>
          <Text style={styles.headerSubtitle}>
            Find and manage your recurring payments
          </Text>
        </View>

        {/* Financial Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <DollarSign size={24} color="#EF4444" strokeWidth={2} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Monthly Spending</Text>
              <Text style={styles.summaryAmount}>₦{totalMonthlySpending.toLocaleString()}</Text>
            </View>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <TrendingUp size={24} color="#10B981" strokeWidth={2} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Potential Savings</Text>
              <Text style={styles.summaryAmount}>₦{potentialSavings.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" strokeWidth={2} />
            <Text style={styles.searchInput}>
              {searchQuery || 'Search subscriptions...'}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {[
            { key: 'all', label: 'All', count: subscriptions.length },
            { key: 'high-confidence', label: 'High Confidence', count: subscriptions.filter(s => s.confidence >= 0.8).length },
            { key: 'recent', label: 'Recent', count: subscriptions.filter(s => {
              const lastPayment = new Date(s.lastPaymentDate);
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return lastPayment >= thirtyDaysAgo;
            }).length },
            { key: 'expensive', label: 'Expensive', count: subscriptions.filter(s => s.averageAmount >= 5000).length },
          ].map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.activeFilterTab
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter.key && styles.activeFilterTabText
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.filterTabBadge,
                selectedFilter === filter.key && styles.activeFilterTabBadge
              ]}>
                <Text style={[
                  styles.filterTabBadgeText,
                  selectedFilter === filter.key && styles.activeFilterTabBadgeText
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subscriptions List */}
        <View style={styles.subscriptionsContainer}>
          <Text style={styles.sectionTitle}>
            {filteredSubscriptions.length} Subscription{filteredSubscriptions.length !== 1 ? 's' : ''} Found
          </Text>
          
          {filteredSubscriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🔍</Text>
              <Text style={styles.emptyStateTitle}>No subscriptions found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Try adjusting your search or filters.' : 'We\'ll analyze your transactions to find recurring payments.'}
              </Text>
            </View>
          ) : (
            filteredSubscriptions.map(subscription => (
              <TouchableOpacity
                key={subscription.id}
                style={styles.subscriptionCard}
                onPress={() => handleSubscriptionPress(subscription)}
                activeOpacity={0.7}
              >
                <View style={styles.subscriptionHeader}>
                  <View style={styles.subscriptionInfo}>
                    <Text style={styles.subscriptionVendor}>{subscription.vendor}</Text>
                    <Text style={styles.subscriptionCategory}>{subscription.category}</Text>
                  </View>
                  <View style={styles.confidenceContainer}>
                    {getConfidenceIcon(subscription.confidence)}
                    <Text style={[
                      styles.confidenceText,
                      { color: getConfidenceColor(subscription.confidence) }
                    ]}>
                      {Math.round(subscription.confidence * 100)}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.subscriptionDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>{getFrequencyIcon(subscription.frequency)}</Text>
                      <Text style={styles.detailLabel}>Frequency</Text>
                      <Text style={styles.detailValue}>{subscription.frequency}</Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>💰</Text>
                      <Text style={styles.detailLabel}>Average Amount</Text>
                      <Text style={styles.detailValue}>₦{subscription.averageAmount.toLocaleString()}</Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>📊</Text>
                      <Text style={styles.detailLabel}>Transactions</Text>
                      <Text style={styles.detailValue}>{subscription.transactionCount}</Text>
                    </View>
                  </View>
                   
                  <View style={styles.subscriptionFooter}>
                    <View style={styles.dateInfo}>
                      <Text style={styles.dateLabel}>Last Payment:</Text>
                      <Text style={styles.dateValue}>
                        {new Date(subscription.lastPaymentDate).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <View style={styles.dateInfo}>
                      <Text style={styles.dateLabel}>Next Expected:</Text>
                      <Text style={styles.dateValue}>
                        {new Date(subscription.nextPaymentDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Analyze More Transactions</Text>
          </TouchableOpacity>
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
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
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A2A4E',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  activeFilterTab: {
    backgroundColor: '#00BFA6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  filterTabBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  activeFilterTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterTabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterTabBadgeText: {
    color: '#FFFFFF',
  },
  subscriptionsContainer: {
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
  subscriptionCard: {
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
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionVendor: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 4,
  },
  subscriptionCategory: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A2A4E',
    textAlign: 'center',
  },
  subscriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateInfo: {
    alignItems: 'flex-start',
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A2A4E',
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  actionButton: {
    backgroundColor: '#00BFA6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
