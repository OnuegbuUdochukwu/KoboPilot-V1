import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { User, Settings, Shield, CreditCard, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, Star, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  destructive?: boolean;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const menuSections: MenuSection[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Personal Information',
          subtitle: 'Update your profile details',
          icon: User,
          type: 'navigation',
        },
        {
          id: 'upgrade',
          title: 'Upgrade to KoboPilot Pro',
          subtitle: 'Unlock automated money flows',
          icon: Star,
          type: 'navigation',
        },
        {
          id: 'accounts',
          title: 'Connected Accounts',
          subtitle: '3 bank accounts linked',
          icon: CreditCard,
          type: 'navigation',
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          id: 'biometrics',
          title: 'Biometric Authentication',
          subtitle: 'Use fingerprint or face recognition',
          icon: Lock,
          type: 'toggle',
          value: biometricsEnabled,
          onPress: () => setBiometricsEnabled(!biometricsEnabled),
        },
        {
          id: 'security',
          title: 'Security Settings',
          subtitle: 'PIN, MFA, and security preferences',
          icon: Shield,
          type: 'navigation',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Transaction alerts and insights',
          icon: Bell,
          type: 'toggle',
          value: notificationsEnabled,
          onPress: () => setNotificationsEnabled(!notificationsEnabled),
        },
        {
          id: 'settings',
          title: 'App Settings',
          subtitle: 'Language, currency, and preferences',
          icon: Settings,
          type: 'navigation',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help & Support',
          subtitle: 'FAQs and customer support',
          icon: HelpCircle,
          type: 'navigation',
        },
        {
          id: 'logout',
          title: 'Sign Out',
          icon: LogOut,
          type: 'action',
          destructive: true,
          onPress: () => {
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: signOut,
                },
              ]
            );
          },
        },
      ],
    },
  ];

  const renderMenuItem = (item: MenuItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <View style={[
            styles.menuItemIcon,
            item.destructive && styles.destructiveIcon
          ]}>
            <item.icon 
              size={20} 
              color={item.destructive ? '#EF4444' : '#6B7280'} 
              strokeWidth={2} 
            />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={[
              styles.menuItemTitle,
              item.destructive && styles.destructiveText
            ]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        <View style={styles.menuItemRight}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onPress}
              trackColor={{ false: '#E5E7EB', true: '#00BFA6' }}
              thumbColor="#FFFFFF"
            />
          ) : (
            !item.destructive && (
              <ChevronRight size={16} color="#D1D5DB" strokeWidth={2} />
            )
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>T</Text>
          </View>
          <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.verificationBadge}>
              <Shield size={12} color="#00BFA6" strokeWidth={2} />
              <Text style={styles.verificationText}>Verified Account</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, index) => (
          <View key={index} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuSectionContent}>
              {section.items.map(renderMenuItem)}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>KoboPilot v1.0.0</Text>
          <Text style={styles.buildText}>Build 2025.01.15</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A2A4E',
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0A2A4E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A2A4E',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verificationText: {
    fontSize: 12,
    color: '#00BFA6',
    fontWeight: '600',
  },
  menuSection: {
    marginBottom: 32,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  menuSectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destructiveIcon: {
    backgroundColor: '#FEF2F2',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 2,
  },
  destructiveText: {
    color: '#EF4444',
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  menuItemRight: {
    marginLeft: 12,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  buildText: {
    fontSize: 11,
    color: '#D1D5DB',
    fontWeight: '500',
    marginTop: 2,
  },
});