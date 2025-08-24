import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, Edit3, Brain, TrendingUp } from 'lucide-react-native';
import { transactionCategorizationService } from '@/api/services/transactionCategorization';
import TransactionCategoryEditor from './TransactionCategoryEditor';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  subcategory?: string;
  confidence?: number;
  tags?: string[];
  isUserCorrected?: boolean;
  categorizationDate?: string;
  date: string;
  bank: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
  onCategoryChange?: (transactionId: string, newCategory: string) => void;
}

export function TransactionCard({ transaction, onPress, onCategoryChange }: TransactionCardProps) {
  const [isCategoryEditorVisible, setIsCategoryEditorVisible] = useState(false);

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

  const getCategoryInfo = (categoryId: string) => {
    return transactionCategorizationService.getCategoryById(categoryId);
  };

  const handleEditCategory = () => {
    setIsCategoryEditorVisible(true);
  };

  const handleCategoryChange = (transactionId: string, newCategory: string) => {
    if (onCategoryChange) {
      onCategoryChange(transactionId, newCategory);
    }
    setIsCategoryEditorVisible(false);
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
            <View style={styles.categoryContainer}>
              <Text style={[
                styles.transactionCategory,
                { color: getCategoryColor(transaction.category) }
              ]}>
                {getCategoryInfo(transaction.category)?.name || transaction.category}
              </Text>
              {transaction.confidence && (
                <View style={styles.confidenceBadge}>
                  <Brain size={12} color="#00BFA6" strokeWidth={2} />
                  <Text style={styles.confidenceText}>
                    {Math.round(transaction.confidence * 100)}%
                  </Text>
                </View>
              )}
              {transaction.isUserCorrected && (
                <View style={styles.userCorrectedBadge}>
                  <TrendingUp size={12} color="#F59E0B" strokeWidth={2} />
                  <Text style={styles.userCorrectedText}>User</Text>
                </View>
              )}
            </View>
          </View>
          {transaction.tags && transaction.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {transaction.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <View style={styles.transactionRight}>
        <View style={styles.amountSection}>
          <Text style={[
            styles.transactionAmount,
            transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount
          ]}>
            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
          <TouchableOpacity
            style={styles.editCategoryButton}
            onPress={handleEditCategory}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Edit3 size={16} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.date)}
        </Text>
      </View>

      {/* Category Editor Modal */}
      <TransactionCategoryEditor
        isVisible={isCategoryEditorVisible}
        onClose={() => setIsCategoryEditorVisible(false)}
        transaction={transaction}
        onCategoryChange={handleCategoryChange}
      />
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
  // AI Categorization Styles
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  editCategoryButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  confidenceText: {
    fontSize: 10,
    color: '#00BFA6',
    fontWeight: '600',
  },
  userCorrectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  userCorrectedText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
});