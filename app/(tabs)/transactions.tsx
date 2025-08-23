import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { 
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar
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

const allTransactions: Transaction[] = [
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
  },
  {
    id: '6',
    description: 'Shoprite Groceries',
    amount: 18750,
    type: 'debit',
    category: 'Groceries',
    date: '2025-01-11',
    bank: 'GTBank'
  },
  {
    id: '7',
    description: 'MTN Airtime',
    amount: 5000,
    type: 'debit',
    category: 'Bills',
    date: '2025-01-10',
    bank: 'Access Bank'
  },
  {
    id: '8',
    description: 'Spotify Premium',
    amount: 1200,
    type: 'debit',
    category: 'Entertainment',
    date: '2025-01-09',
    bank: 'First Bank'
  }
];

export default function TransactionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const categories = ['All', 'Income', 'Entertainment', 'Shopping', 'Transport', 'Groceries', 'Bills'];

  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || transaction.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
      year: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Income': '#00BFA6',
      'Entertainment': '#FF7A00',
      'Shopping': '#8B5CF6',
      'Transport': '#06B6D4',
      'Groceries': '#F59E0B',
      'Bills': '#EF4444',
    };
    return colors[category] || '#6B7280';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity style={styles.calendarButton}>
          <Calendar size={20} color="#0A2A4E" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={16} color="#9CA3AF" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={16} color="#0A2A4E" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              selectedFilter === category && styles.activeFilterChip
            ]}
            onPress={() => setSelectedFilter(category)}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === category && styles.activeFilterChipText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transaction List */}
      <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
        {filteredTransactions.map((transaction, index) => (
          <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View style={[
                styles.transactionIcon,
                { backgroundColor: getCategoryColor(transaction.category) + '20' }
              ]}>
                {transaction.type === 'credit' ? (
                  <ArrowDownLeft size={18} color={getCategoryColor(transaction.category)} strokeWidth={2} />
                ) : (
                  <ArrowUpRight size={18} color={getCategoryColor(transaction.category)} strokeWidth={2} />
                )}
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <View style={styles.transactionMeta}>
                  <Text style={styles.transactionBank}>{transaction.bank}</Text>
                  <Text style={styles.transactionDot}>•</Text>
                  <Text style={[
                    styles.transactionCategory,
                    { color: getCategoryColor(transaction.category) }
                  ]}>
                    {transaction.category}
                  </Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A2A4E',
  },
  calendarButton: {
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
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0A2A4E',
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
  filtersContainer: {
    marginBottom: 24,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterChip: {
    backgroundColor: '#0A2A4E',
    borderColor: '#0A2A4E',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
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
    fontWeight: '600',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15,
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
});