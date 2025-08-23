import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { CircleAlert as AlertCircle, ExternalLink, RotateCcw, TrendingUp, ArrowRight } from 'lucide-react-native';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  nextPayment: string;
  category: string;
  logo: string;
  status: 'active' | 'cancelled' | 'paused';
  bank: string;
}

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    amount: 2900,
    frequency: 'monthly',
    nextPayment: '2025-02-14',
    category: 'Entertainment',
    logo: 'N',
    status: 'active',
    bank: 'Access Bank'
  },
  {
    id: '2',
    name: 'Spotify Premium',
    amount: 1200,
    frequency: 'monthly',
    nextPayment: '2025-02-09',
    category: 'Entertainment',
    logo: 'S',
    status: 'active',
    bank: 'First Bank'
  },
  {
    id: '3',
    name: 'Office 365',
    amount: 8500,
    frequency: 'monthly',
    nextPayment: '2025-02-20',
    category: 'Productivity',
    logo: 'O',
    status: 'active',
    bank: 'GTBank'
  },
  {
    id: '4',
    name: 'Adobe Creative Suite',
    amount: 24000,
    frequency: 'monthly',
    nextPayment: '2025-02-25',
    category: 'Productivity',
    logo: 'A',
    status: 'active',
    bank: 'Zenith Bank'
  },
  {
    id: '5',
    name: 'YouTube Premium',
    amount: 1500,
    frequency: 'monthly',
    nextPayment: '2025-02-15',
    category: 'Entertainment',
    logo: 'Y',
    status: 'paused',
    bank: 'UBA'
  }
];

export default function SubscriptionsScreen() {
  const [subscriptions] = useState(mockSubscriptions);

  const totalMonthlySpend = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((total, sub) => total + sub.amount, 0);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00BFA6';
      case 'cancelled': return '#EF4444';
      case 'paused': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getLogoColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Entertainment': '#FF7A00',
      'Productivity': '#8B5CF6',
      'Health': '#10B981',
      'Finance': '#0A2A4E',
    };
    return colors[category] || '#6B7280';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Subscription Hunter</Text>
          <Text style={styles.headerSubtitle}>Manage your recurring payments</Text>
        </View>
        <TouchableOpacity style={styles.scanButton}>
          <RotateCcw size={18} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIcon}>
              <TrendingUp size={20} color="#00BFA6" strokeWidth={2} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Monthly Spend</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalMonthlySpend)}</Text>
            </View>
          </View>
          <Text style={styles.summaryDescription}>
            You have {subscriptions.filter(s => s.status === 'active').length} active subscriptions
          </Text>
        </View>

        {/* Alert Card */}
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <AlertCircle size={16} color="#FF7A00" strokeWidth={2} />
            <Text style={styles.alertTitle}>Potential Savings</Text>
          </View>
          <Text style={styles.alertText}>
            You could save ₦1,500/month by reviewing inactive subscriptions
          </Text>
          <TouchableOpacity style={styles.alertButton}>
            <Text style={styles.alertButtonText}>Review Now</Text>
            <ArrowRight size={12} color="#FF7A00" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Subscriptions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Subscriptions</Text>
          
          {subscriptions.filter(sub => sub.status === 'active').map((subscription) => (
            <TouchableOpacity key={subscription.id} style={styles.subscriptionItem}>
              <View style={styles.subscriptionLeft}>
                <View style={[
                  styles.subscriptionLogo,
                  { backgroundColor: getLogoColor(subscription.category) }
                ]}>
                  <Text style={styles.subscriptionLogoText}>{subscription.logo}</Text>
                </View>
                <View style={styles.subscriptionDetails}>
                  <Text style={styles.subscriptionName}>{subscription.name}</Text>
                  <Text style={styles.subscriptionMeta}>
                    {subscription.bank} • Next: {formatDate(subscription.nextPayment)}
                  </Text>
                </View>
              </View>
              <View style={styles.subscriptionRight}>
                <Text style={styles.subscriptionAmount}>
                  {formatCurrency(subscription.amount)}
                </Text>
                <Text style={styles.subscriptionFrequency}>
                  /{subscription.frequency.slice(0, 3)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Paused/Cancelled Subscriptions */}
        {subscriptions.filter(sub => sub.status !== 'active').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inactive Subscriptions</Text>
            
            {subscriptions.filter(sub => sub.status !== 'active').map((subscription) => (
              <TouchableOpacity key={subscription.id} style={styles.subscriptionItem}>
                <View style={styles.subscriptionLeft}>
                  <View style={[
                    styles.subscriptionLogo,
                    { backgroundColor: '#F3F4F6' }
                  ]}>
                    <Text style={[styles.subscriptionLogoText, { color: '#9CA3AF' }]}>
                      {subscription.logo}
                    </Text>
                  </View>
                  <View style={styles.subscriptionDetails}>
                    <Text style={[styles.subscriptionName, { color: '#9CA3AF' }]}>
                      {subscription.name}
                    </Text>
                    <View style={styles.statusBadge}>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(subscription.status) }
                      ]}>
                        {subscription.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.reactivateButton}>
                  <ExternalLink size={16} color="#6B7280" strokeWidth={2} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* How to Cancel Guide */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Need help cancelling?</Text>
          <Text style={styles.guideText}>
            Tap any subscription to see step-by-step cancellation instructions
          </Text>
          <TouchableOpacity style={styles.guideButton}>
            <Text style={styles.guideButtonText}>Learn More</Text>
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
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  scanButton: {
    backgroundColor: '#0A2A4E',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BFA6' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A2A4E',
  },
  summaryDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  alertCard: {
    backgroundColor: '#FEF3E2',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A00',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF7A00',
  },
  alertText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    marginBottom: 12,
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF7A00',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A2A4E',
    marginBottom: 16,
  },
  subscriptionItem: {
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
  subscriptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subscriptionLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subscriptionLogoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subscriptionDetails: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 4,
  },
  subscriptionMeta: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  subscriptionRight: {
    alignItems: 'flex-end',
  },
  subscriptionAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A2A4E',
    marginBottom: 2,
  },
  subscriptionFrequency: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  reactivateButton: {
    padding: 8,
  },
  guideCard: {
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2A4E',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  guideButton: {
    backgroundColor: '#0A2A4E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  guideButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});