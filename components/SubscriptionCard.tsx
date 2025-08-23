import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ExternalLink } from 'lucide-react-native';

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

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress?: () => void;
}

export function SubscriptionCard({ subscription, onPress }: SubscriptionCardProps) {
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
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.subscriptionLeft}>
        <View style={[
          styles.subscriptionLogo,
          { 
            backgroundColor: subscription.status === 'active' 
              ? getLogoColor(subscription.category) 
              : '#F3F4F6' 
          }
        ]}>
          <Text style={[
            styles.subscriptionLogoText,
            { 
              color: subscription.status === 'active' 
                ? '#FFFFFF' 
                : '#9CA3AF' 
            }
          ]}>
            {subscription.logo}
          </Text>
        </View>
        <View style={styles.subscriptionDetails}>
          <Text style={[
            styles.subscriptionName,
            subscription.status !== 'active' && { color: '#9CA3AF' }
          ]}>
            {subscription.name}
          </Text>
          {subscription.status === 'active' ? (
            <Text style={styles.subscriptionMeta}>
              {subscription.bank} • Next: {formatDate(subscription.nextPayment)}
            </Text>
          ) : (
            <View style={styles.statusBadge}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(subscription.status) }
              ]}>
                {subscription.status.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.subscriptionRight}>
        {subscription.status === 'active' ? (
          <>
            <Text style={styles.subscriptionAmount}>
              {formatCurrency(subscription.amount)}
            </Text>
            <Text style={styles.subscriptionFrequency}>
              /{subscription.frequency.slice(0, 3)}
            </Text>
          </>
        ) : (
          <TouchableOpacity style={styles.reactivateButton}>
            <ExternalLink size={16} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        )}
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
});