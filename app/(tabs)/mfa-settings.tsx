import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { 
  ArrowLeft, 
  Shield, 
  Smartphone, 
  Mail, 
  Smartphone as AuthenticatorIcon,
  Plus,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Settings,
  AlertTriangle
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { mfaService, MFAMethod, BackupCode } from '@/api/services/mfa';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function MFASettingsScreen() {
  const { user } = useAuth();
  const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([]);
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    loadMFAData();
  }, []);

  const loadMFAData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [methods, codes, isEnabled] = await Promise.all([
        mfaService.getAvailableMethods(user.id),
        mfaService.getBackupCodes(user.id),
        mfaService.isMFARequired(user.id),
      ]);
      
      setMfaMethods(methods);
      setBackupCodes(codes);
      setIsMFAEnabled(isEnabled);
    } catch (error) {
      Alert.alert('Error', 'Failed to load MFA settings');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMFA = async (enabled: boolean) => {
    if (!user) return;
    
    Alert.alert(
      enabled ? 'Enable MFA?' : 'Disable MFA?',
      enabled 
        ? 'This will require two-factor authentication for all sign-ins.'
        : 'This will remove the security of two-factor authentication.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: enabled ? 'Enable' : 'Disable',
          style: enabled ? 'default' : 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await mfaService.toggleMFA(user.id, enabled);
              setIsMFAEnabled(enabled);
              Alert.alert('Success', `MFA has been ${enabled ? 'enabled' : 'disabled'}`);
            } catch (error) {
              Alert.alert('Error', 'Failed to update MFA settings');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const removeMFAMethod = async (methodId: string) => {
    if (!user) return;
    
    Alert.alert(
      'Remove MFA Method?',
      'Are you sure you want to remove this authentication method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await mfaService.removeMFAMethod(user.id, methodId);
              setMfaMethods(prev => prev.filter(m => m.id !== methodId));
              Alert.alert('Success', 'MFA method removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove MFA method');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const regenerateBackupCodes = async () => {
    if (!user) return;
    
    Alert.alert(
      'Regenerate Backup Codes?',
      'This will invalidate all existing backup codes. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const newCodes = await mfaService.regenerateBackupCodes(user.id);
              setBackupCodes(newCodes);
              setShowBackupCodes(false);
              Alert.alert('Success', 'New backup codes generated');
            } catch (error) {
              Alert.alert('Error', 'Failed to regenerate backup codes');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const copyBackupCodes = async () => {
    try {
      const codesText = backupCodes.map(code => code.code).join('\n');
      await Clipboard.setStringAsync(codesText);
      Alert.alert('Copied', 'All backup codes copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy codes');
    }
  };

  const saveBackupCodesToFile = async () => {
    try {
      const codesText = backupCodes.map(code => code.code).join('\n');
      const fileName = `kobopilot_backup_codes_${Date.now()}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, codesText);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Save Backup Codes',
        });
      } else {
        Alert.alert('Success', 'Backup codes saved to device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save backup codes');
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'sms': return <Smartphone size={20} color="#00BFA6" strokeWidth={2} />;
      case 'email': return <Mail size={20} color="#00BFA6" strokeWidth={2} />;
      case 'totp': return <AuthenticatorIcon size={20} color="#00BFA6" strokeWidth={2} />;
      default: return <Shield size={20} color="#00BFA6" strokeWidth={2} />;
    }
  };

  const getMethodName = (type: string) => {
    switch (type) {
      case 'sms': return 'SMS Verification';
      case 'email': return 'Email Verification';
      case 'totp': return 'Authenticator App';
      default: return 'Unknown Method';
    }
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
          <Text style={styles.headerTitle}>Two-Factor Authentication</Text>
          <Text style={styles.headerSubtitle}>
            Manage your security settings and backup codes
          </Text>
        </View>

        {/* MFA Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleHeader}>
            <View style={styles.toggleIcon}>
              <Shield size={24} color="#00BFA6" strokeWidth={2} />
            </View>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleTitle}>Two-Factor Authentication</Text>
              <Text style={styles.toggleDescription}>
                {isMFAEnabled 
                  ? 'Enabled - Your account is protected with 2FA'
                  : 'Disabled - Enable to add an extra layer of security'
                }
              </Text>
            </View>
            <Switch
              value={isMFAEnabled}
              onValueChange={toggleMFA}
              disabled={isLoading}
              trackColor={{ false: '#E5E7EB', true: '#00BFA6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* MFA Methods */}
        {isMFAEnabled && (
          <View style={styles.methodsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Authentication Methods</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/auth/mfa-setup')}
              >
                <Plus size={16} color="#00BFA6" strokeWidth={2} />
                <Text style={styles.addButtonText}>Add Method</Text>
              </TouchableOpacity>
            </View>
            
            {mfaMethods.map((method) => (
              <View key={method.id} style={styles.methodCard}>
                <View style={styles.methodInfo}>
                  <View style={styles.methodIcon}>
                    {getMethodIcon(method.type)}
                  </View>
                  <View style={styles.methodDetails}>
                    <Text style={styles.methodName}>{getMethodName(method.type)}</Text>
                    <Text style={styles.methodValue}>{method.value}</Text>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeMFAMethod(method.id)}
                  disabled={isLoading}
                >
                  <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Backup Codes */}
        {isMFAEnabled && (
          <View style={styles.backupSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Backup Codes</Text>
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowBackupCodes(!showBackupCodes)}
              >
                {showBackupCodes ? (
                  <EyeOff size={20} color="#6B7280" strokeWidth={2} />
                ) : (
                  <Eye size={20} color="#6B7280" strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionDescription}>
              Save these codes in a secure location. You can use them to sign in if you lose access to your authentication methods.
            </Text>

            <View style={styles.backupCodesGrid}>
              {backupCodes.map((code) => (
                <View key={code.id} style={styles.backupCodeItem}>
                  <Text style={[
                    styles.backupCodeText,
                    code.isUsed && styles.usedBackupCodeText
                  ]}>
                    {showBackupCodes ? code.code : '••••••••'}
                  </Text>
                  {code.isUsed && (
                    <View style={styles.usedBadge}>
                      <Text style={styles.usedBadgeText}>USED</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.backupActions}>
              <TouchableOpacity style={styles.backupActionButton} onPress={copyBackupCodes}>
                <Text style={styles.backupActionText}>Copy All Codes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.backupActionButton} onPress={saveBackupCodesToFile}>
                <Text style={styles.backupActionText}>Save to File</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.backupActionButton} onPress={regenerateBackupCodes}>
                <Text style={[styles.backupActionText, { color: '#EF4444' }]}>Regenerate Codes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Security Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Security Tips</Text>
          
          <View style={styles.tipCard}>
            <AlertTriangle size={16} color="#F59E0B" strokeWidth={2} />
            <Text style={styles.tipText}>
              Never share your backup codes with anyone, including KoboPilot support
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Shield size={16} color="#00BFA6" strokeWidth={2} />
            <Text style={styles.tipText}>
              Store backup codes in a secure password manager or safe location
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Settings size={16} color="#8B5CF6" strokeWidth={2} />
            <Text style={styles.tipText}>
              Consider using multiple authentication methods for better security
            </Text>
          </View>
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
  toggleSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00BFA6' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toggleContent: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  methodsSection: {
    paddingHorizontal: 24,
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
    fontWeight: '600',
    color: '#0A2A4E',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: '#00BFA6',
    fontWeight: '600',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BFA6' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 2,
  },
  methodValue: {
    fontSize: 13,
    color: '#6B7280',
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00BFA6',
    letterSpacing: 0.5,
  },
  removeButton: {
    padding: 8,
  },
  backupSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  eyeButton: {
    padding: 8,
  },
  backupCodesGrid: {
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
  backupCodeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backupCodeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#0A2A4E',
    letterSpacing: 1,
  },
  usedBackupCodeText: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  usedBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  usedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  backupActions: {
    flexDirection: 'row',
    gap: 12,
  },
  backupActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  backupActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A2A4E',
  },
  tipsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginLeft: 12,
  },
});
