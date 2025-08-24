import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, Check, Edit3, Brain, TrendingUp } from 'lucide-react-native';
import { TransactionCategory, NIGERIAN_TRANSACTION_CATEGORIES } from '@/api/services/transactionCategorization';
import { transactionCategorizationService } from '@/api/services/transactionCategorization';

interface TransactionCategoryEditorProps {
  isVisible: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    description: string;
    amount: number;
    category: string;
    confidence?: number;
    isUserCorrected?: boolean;
  };
  onCategoryChange: (transactionId: string, newCategory: string) => void;
}

export default function TransactionCategoryEditor({
  isVisible,
  onClose,
  transaction,
  onCategoryChange,
}: TransactionCategoryEditorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(transaction.category);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<TransactionCategory[]>([]);

  useEffect(() => {
    setSelectedCategory(transaction.category);
    setSearchQuery('');
    setFilteredCategories(NIGERIAN_TRANSACTION_CATEGORIES);
  }, [transaction]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(NIGERIAN_TRANSACTION_CATEGORIES);
    } else {
      const filtered = NIGERIAN_TRANSACTION_CATEGORIES.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.nigerianContext?.some(context => 
          context.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSaveCategory = async () => {
    if (selectedCategory === transaction.category) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit user feedback to train the ML model
      const success = await transactionCategorizationService.submitUserFeedback(
        transaction.id,
        transaction.category,
        selectedCategory,
        transaction.description
      );

      if (success) {
        // Update the transaction category
        onCategoryChange(transaction.id, selectedCategory);
        
        Alert.alert(
          'Category Updated',
          'Thank you for your feedback! This helps improve our AI categorization.',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      Alert.alert(
        'Update Failed',
        'Unable to update the category. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return NIGERIAN_TRANSACTION_CATEGORIES.find(cat => cat.id === categoryId);
  };

  const getParentCategories = () => {
    const parentCategories = [...new Set(
      NIGERIAN_TRANSACTION_CATEGORIES.map(cat => cat.parentCategory).filter(Boolean)
    )];
    return parentCategories.sort();
  };

  const getCategoriesByParent = (parentCategory: string) => {
    return NIGERIAN_TRANSACTION_CATEGORIES.filter(cat => cat.parentCategory === parentCategory);
  };

  const renderCategoryItem = (category: TransactionCategory) => {
    const isSelected = selectedCategory === category.id;
    const isCurrentCategory = transaction.category === category.id;

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryItem,
          isSelected && styles.selectedCategoryItem,
          isCurrentCategory && styles.currentCategoryItem,
        ]}
        onPress={() => handleCategorySelect(category.id)}
      >
        <View style={styles.categoryItemLeft}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <View style={styles.categoryInfo}>
            <Text style={[
              styles.categoryName,
              isSelected && styles.selectedCategoryName,
              isCurrentCategory && styles.currentCategoryName,
            ]}>
              {category.name}
            </Text>
            <Text style={styles.categoryParent}>{category.parentCategory}</Text>
          </View>
        </View>
        
        {isSelected && <Check size={20} color="#00BFA6" strokeWidth={2} />}
        {isCurrentCategory && !isSelected && (
          <Text style={styles.currentLabel}>Current</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderCategorySection = (parentCategory: string) => {
    const categories = getCategoriesByParent(parentCategory);
    
    return (
      <View key={parentCategory} style={styles.categorySection}>
        <Text style={styles.sectionTitle}>{parentCategory}</Text>
        {categories.map(renderCategoryItem)}
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Transaction Category</Text>
          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.disabledButton]}
            onPress={handleSaveCategory}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Check size={20} color="#FFFFFF" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>

        {/* Transaction Info */}
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{transaction.description}</Text>
          <Text style={styles.transactionAmount}>₦{transaction.amount.toLocaleString()}</Text>
          
          <View style={styles.currentCategoryInfo}>
            <Text style={styles.currentCategoryLabel}>Current Category:</Text>
            <View style={styles.currentCategoryDisplay}>
              <Text style={styles.currentCategoryIcon}>
                {getCategoryInfo(transaction.category)?.icon || '❓'}
              </Text>
              <Text style={styles.currentCategoryName}>
                {getCategoryInfo(transaction.category)?.name || 'Unknown'}
              </Text>
            </View>
            {transaction.confidence && (
              <View style={styles.confidenceIndicator}>
                <Brain size={16} color="#00BFA6" strokeWidth={2} />
                <Text style={styles.confidenceText}>
                  {Math.round(transaction.confidence * 100)}% AI Confidence
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Categories */}
        <ScrollView style={styles.categoriesContainer} showsVerticalScrollIndicator={false}>
          {searchQuery.trim() === '' ? (
            // Show organized by parent category
            getParentCategories().map(renderCategorySection)
          ) : (
            // Show filtered results
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              {filteredCategories.map(renderCategoryItem)}
            </View>
          )}
        </ScrollView>

        {/* AI Training Info */}
        <View style={styles.aiTrainingInfo}>
          <TrendingUp size={16} color="#00BFA6" strokeWidth={2} />
          <Text style={styles.aiTrainingText}>
            Your corrections help improve our AI categorization accuracy
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2A4E',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BFA6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  transactionInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A2A4E',
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00BFA6',
    marginBottom: 16,
  },
  currentCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  currentCategoryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  currentCategoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  currentCategoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  currentCategoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A2A4E',
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    color: '#00BFA6',
    marginLeft: 4,
    fontWeight: '500',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0A2A4E',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoriesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedCategoryItem: {
    backgroundColor: '#F0FDF4',
    borderBottomColor: '#00BFA6',
  },
  currentCategoryItem: {
    backgroundColor: '#FEF3C7',
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A2A4E',
    marginBottom: 2,
  },
  selectedCategoryName: {
    color: '#00BFA6',
    fontWeight: '600',
  },
  currentCategoryName: {
    color: '#F59E0B',
  },
  categoryParent: {
    fontSize: 14,
    color: '#6B7280',
  },
  currentLabel: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiTrainingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  aiTrainingText: {
    fontSize: 14,
    color: '#00BFA6',
    marginLeft: 8,
    textAlign: 'center',
  },
});
