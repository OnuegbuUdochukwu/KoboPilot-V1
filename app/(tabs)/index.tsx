import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  ArrowDownLeft,
  Plus,
  TrendingUp
} from 'lucide-react-native';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  date: string;
  bank: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'GTBank Salary',
    amount: 450000,
    type: 'credit',
    category: 'Income',
    date: '2025-01-15',
    bank: 'GTBank'
  },
  {
    id: '2',
    description: 'Netflix Subscription',
    amount: 2900,
    type: 'debit',
    category: 'Entertainment',
    date: '2025-01-14',
    bank: 'Access Bank'
  },
  {
    id: '3',
    description: 'Jumia Online Shopping',
    amount: 24500,
    type: 'debit',
    category: 'Shopping',
    date: '2025-01-13',
    bank: 'GTBank'
  },
  {
    id: '4',
    description: 'Uber Trip',
    amount: 3200,
    type: 'debit',
    category: 'Transport',
    date: '2025-01-13',
    bank: 'Zenith Bank'
  },
  {
    id: '5',
    description: 'Freelance Payment',
    amount: 85000,
    type: 'credit',
    category: 'Income',
    date: '2025-01-12',
    bank: 'First Bank'
  }
];

export default function DashboardScreen() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState(mockTransactions);

  const totalBalance = 1247350;
  const monthlyIncome = 535000;
  const monthlyExpenses = 187650;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Income': '#00BFA6',
      'Entertainment': '#FF7A00',
      'Shopping': '#8B5CF6',
      'Transport': '#06B6D4',
      'Food': '#F59E0B',
      'Bills': '#EF4444',
    };
    return colors[category] || '#6B7280';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Good morning</Text>
            <Text style={styles.userNameText}>Tayo</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <TouchableOpacity 
              onPress={() => setBalanceVisible(!balanceVisible)}
              style={styles.visibilityButton}
            >
              {balanceVisible ? (
                <EyeOff size={20} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <Eye size={20} color="#FFFFFF" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? formatCurrency(totalBalance) : '••••••••'}
          </Text>
          <View style={styles.balanceActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Plus size={16} color="#0A2A4E" strokeWidth={2} />
              <Text style={styles.actionButtonText}>Add Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <ArrowDownLeft size={20} color="#00BFA6" strokeWidth={2} />
            </View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statAmount}>{formatCurrency(monthlyIncome)}</Text>
            <Text style={styles.statPeriod}>This month</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <ArrowUpRight size={20} color="#FF7A00" strokeWidth={2} />
            </View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statAmount}>{formatCurrency(monthlyExpenses)}</Text>
            <Text style={styles.statPeriod}>This month</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionList}>
            {transactions.slice(0, 5).map((transaction) => (
              <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: getCategoryColor(transaction.category) + '20' }
                  ]}>
                    {transaction.type === 'credit' ? (
                      <ArrowDownLeft size={16} color={getCategoryColor(transaction.category)} strokeWidth={2} />
                    ) : (
                      <ArrowUpRight size={16} color={getCategoryColor(transaction.category)} strokeWidth={2} />
                    )}
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <View style={styles.transactionMeta}>
                      <Text style={styles.transactionBank}>{transaction.bank}</Text>
                      <Text style={styles.transactionDot}>•</Text>
                      <Text style={styles.transactionCategory}>{transaction.category}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount
                  ]}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Insights Card */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <TrendingUp size={20} color="#00BFA6" strokeWidth={2} />
            <Text style={styles.insightsTitle}>Financial Insights</Text>
          </View>
          <Text style={styles.insightsText}>
            You've saved 23% more this month compared to last month. 
            Consider reviewing your subscription spending to save even more.
          </Text>
          <TouchableOpacity style={styles.insightsButton}>
            <Text style={styles.insightsButtonText}>View Full Report</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A2A4E',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF7A00',
  },
  balanceCard: {
    backgroundColor: '#0A2A4E',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  visibilityButton: {
    padding: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  balanceActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A2A4E',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A2A4E',
    marginBottom: 2,
  },
  statPeriod: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A2A4E',
  },
  seeAllText: {
    fontSize: 14,
    color: '#00BFA6',
    fontWeight: '600',
  },
  transactionList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionBank: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  transactionDot: {
    fontSize: 12,
    color: '#D1D5DB',
    marginHorizontal: 6,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  creditAmount: {
    color: '#00BFA6',
  },
  debitAmount: {
    color: '#EF4444',
  },
  transactionDate: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2A4E',
  },
  insightsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  insightsButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  insightsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A2A4E',
  },
});