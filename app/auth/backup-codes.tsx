import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { ArrowLeft, Download, Copy, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { mfaService, BackupCode } from '@/api/services/mfa';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function BackupCodesScreen() {
  const { user } = useAuth();
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    loadBackupCodes();
  }, []);

  const loadBackupCodes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const codes = await mfaService.getBackupCodes(user.id);
      setBackupCodes(codes);
    } catch (error) {
      Alert.alert('Error', 'Failed to load backup codes');
    } finally {
      setIsLoading(false);
    }
  };

  const copyAllCodes = async () => {
    try {
      const codesText = backupCodes.map(code => code.code).join('\n');
      await Clipboard.setStringAsync(codesText);
      Alert.alert('Copied', 'All backup codes copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy codes');
    }
  };

  const saveCodesToFile = async () => {
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
      
      setHasSaved(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to save backup codes');
    }
  };

  const regenerateCodes = async () => {
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
              setHasSaved(false);
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

  const handleContinue = () => {
    router.push('/auth/bank-connection');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading backup codes...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Backup Codes</Text>
          <Text style={styles.headerSubtitle}>
            Save these codes in a secure location. You'll need them if you lose access to your authenticator app.
          </Text>
        </View>

        {/* Security Warning */}
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Shield size={20} color="#F59E0B" strokeWidth={2} />
            <Text style={styles.warningTitle}>Important Security Notice</Text>
          </View>
          <Text style={styles.warningText}>
            These backup codes can be used to access your account. Keep them secure and don't share them with anyone.
          </Text>
        </View>

        {/* Backup Codes Display */}
        <View style={styles.codesSection}>
          <View style={styles.codesHeader}>
            <Text style={styles.codesTitle}>Your Backup Codes</Text>
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowCodes(!showCodes)}
            >
              {showCodes ? (
                <EyeOff size={20} color="#6B7280" strokeWidth={2} />
              ) : (
                <Eye size={20} color="#6B7280" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.codesDescription}>
            Each code can only be used once. Used codes will be marked automatically.
          </Text>

          <View style={styles.codesGrid}>
            {backupCodes.map((code, index) => (
              <View key={code.id} style={styles.codeItem}>
                <Text style={[
                  styles.codeText,
                  code.isUsed && styles.usedCodeText
                ]}>
                  {showCodes ? code.code : '••••••••'}
                </Text>
                {code.isUsed && (
                  <View style={styles.usedBadge}>
                    <Text style={styles.usedBadgeText}>USED</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={copyAllCodes}>
            <Copy size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.primaryButtonText}>Copy All Codes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={saveCodesToFile}>
            <Download size={20} color="#00BFA6" strokeWidth={2} />
            <Text style={styles.secondaryButtonText}>Save to File</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tertiaryButton} onPress={regenerateCodes}>
            <Text style={styles.tertiaryButtonText}>Regenerate Codes</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to use backup codes:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>
              Save these codes in a secure location (password manager, safe, etc.)
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>
              If you lose access to your authenticator app, use one of these codes to sign in
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              Each code can only be used once, so keep them safe
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.continueSection}>
          <TouchableOpacity 
            style={[styles.continueButton, !hasSaved && styles.disabledButton]} 
            onPress={handleContinue}
            disabled={!hasSaved}
          >
            <CheckCircle size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.continueButtonText}>
              {hasSaved ? 'Continue to Bank Connection' : 'Please Save Your Codes First'}
            </Text>
          </TouchableOpacity>
          
          {!hasSaved && (
            <Text style={styles.continueHint}>
              Save your backup codes before continuing
            </Text>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
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
  warningCard: {
    backgroundColor: '#FEF3E2',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  codesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  codesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2A4E',
  },
  eyeButton: {
    padding: 8,
  },
  codesDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  codesGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  codeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  codeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#0A2A4E',
    letterSpacing: 1,
  },
  usedCodeText: {
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
  actions: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#00BFA6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00BFA6',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00BFA6',
  },
  tertiaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  tertiaryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2A4E',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00BFA6',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  continueSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#00BFA6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});
