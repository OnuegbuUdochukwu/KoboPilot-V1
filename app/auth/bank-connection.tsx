import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { ArrowLeft, Shield, CheckCircle, Building2, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface Bank {
  id: string;
  name: string;
  logo: string;
  isPopular: boolean;
}

const popularBanks: Bank[] = [
  { id: '1', name: 'GTBank', logo: 'GT', isPopular: true },
  { id: '2', name: 'Access Bank', logo: 'AB', isPopular: true },
  { id: '3', name: 'Zenith Bank', logo: 'ZB', isPopular: true },
  { id: '4', name: 'First Bank', logo: 'FB', isPopular: true },
  { id: '5', name: 'UBA', logo: 'UBA', isPopular: true },
  { id: '6', name: 'Stanbic IBTC', logo: 'SI', isPopular: false },
  { id: '7', name: 'Fidelity Bank', logo: 'FB', isPopular: false },
  { id: '8', name: 'Union Bank', logo: 'UB', isPopular: false },
  { id: '9', name: 'Ecobank', logo: 'EB', isPopular: false },
  { id: '10', name: 'Wema Bank', logo: 'WB', isPopular: false },
];

export default function BankConnectionScreen() {
  const { completeBankConnection } = useAuth();
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBanks = popularBanks.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBankSelection = (bank: Bank) => {
    setSelectedBank(bank);
  };

  const handleConnectBank = async () => {
    if (!selectedBank) return;

    setIsConnecting(true);
    try {
      // TODO: Implement actual Open Banking SDK integration
      // This would typically involve:
      // 1. Opening the bank's login portal in a webview
      // 2. User authenticating with their bank
      // 3. Receiving read-only access tokens
      // 4. Never storing user banking credentials
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Complete bank connection
      await completeBankConnection();
      
      Alert.alert(
        'Success!',
        `${selectedBank.name} account connected successfully. Your financial data is now being synced.`,
        [
          {
            text: 'Continue',
            onPress: () => router.push('/auth/onboarding-complete'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Connection Failed', 'Unable to connect to bank. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSkipForNow = () => {
    Alert.alert(
      'Skip Bank Connection?',
      'You can always connect your bank accounts later from the Profile section.',
      [
        {
          text: 'Connect Later',
          onPress: () => router.push('/auth/onboarding-complete'),
        },
        {
          text: 'Continue Setup',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#0A2A4E" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connect Your Bank</Text>
          <Text style={styles.headerSubtitle}>
            Securely link your bank accounts to get a complete view of your finances
          </Text>
        </View>

        {/* Security Info */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Shield size={20} color="#00BFA6" strokeWidth={2} />
            <Text style={styles.securityTitle}>Bank-Level Security</Text>
          </View>
          <Text style={styles.securityText}>
            We use Open Banking technology to securely connect to your bank. 
            We never see or store your banking credentials.
          </Text>
        </View>

        {/* Bank Selection */}
        <View style={styles.bankSelection}>
          <Text style={styles.sectionTitle}>Select Your Bank</Text>
          
          {selectedBank && (
            <View style={styles.selectedBankCard}>
              <View style={styles.selectedBankInfo}>
                <View style={styles.bankLogo}>
                  <Text style={styles.bankLogoText}>{selectedBank.logo}</Text>
                </View>
                <View style={styles.bankDetails}>
                  <Text style={styles.bankName}>{selectedBank.name}</Text>
                  <Text style={styles.bankStatus}>Ready to connect</Text>
                </View>
                <CheckCircle size={20} color="#00BFA6" strokeWidth={2} />
              </View>
            </View>
          )}

          <Text style={styles.popularBanksTitle}>Popular Banks</Text>
          
          <View style={styles.banksGrid}>
            {filteredBanks.filter(bank => bank.isPopular).map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={[
                  styles.bankCard,
                  selectedBank?.id === bank.id && styles.selectedBankCardStyle
                ]}
                onPress={() => handleBankSelection(bank)}
              >
                <View style={styles.bankLogo}>
                  <Text style={styles.bankLogoText}>{bank.logo}</Text>
                </View>
                <Text style={styles.bankName}>{bank.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.allBanksTitle}>All Banks</Text>
          
          <View style={styles.allBanksList}>
            {filteredBanks.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={[
                  styles.bankListItem,
                  selectedBank?.id === bank.id && styles.selectedBankListItem
                ]}
                onPress={() => handleBankSelection(bank)}
              >
                <View style={styles.bankListItemLeft}>
                  <View style={styles.bankLogo}>
                    <Text style={styles.bankLogoText}>{bank.logo}</Text>
                  </View>
                  <Text style={styles.bankListItemName}>{bank.name}</Text>
                </View>
                {selectedBank?.id === bank.id && (
                  <CheckCircle size={20} color="#00BFA6" strokeWidth={2} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {selectedBank && (
            <TouchableOpacity 
              style={[styles.primaryButton, isConnecting && styles.disabledButton]} 
              onPress={handleConnectBank}
              disabled={isConnecting}
            >
              <Text style={styles.primaryButtonText}>
                {isConnecting ? 'Connecting...' : `Connect ${selectedBank.name}`}
              </Text>
              <ArrowRight size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipForNow}>
            <Text style={styles.secondaryButtonText}>Skip for now</Text>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  securityCard: {
    backgroundColor: '#F0FDF4',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#00BFA6',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00BFA6',
  },
  securityText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  bankSelection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 20,
  },
  selectedBankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#00BFA6',
  },
  selectedBankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A2A4E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bankLogoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 2,
  },
  bankStatus: {
    fontSize: 14,
    color: '#00BFA6',
    fontWeight: '500',
  },
  popularBanksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 16,
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  bankCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedBankCardStyle: {
    borderWidth: 2,
    borderColor: '#00BFA6',
  },
  allBanksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 16,
  },
  allBanksList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bankListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bankListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankListItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0A2A4E',
  },
  selectedBankListItem: {
    backgroundColor: '#F0FDF4',
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#00BFA6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
