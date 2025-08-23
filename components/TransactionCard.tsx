import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  date: string;
  bank: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
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
      'Groceries': '#F59E0B',
      'Bills': '#EF4444',
    };
    return colors[category] || '#6B7280';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
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
  );
}

const styles = StyleSheet.create({
  container: {
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