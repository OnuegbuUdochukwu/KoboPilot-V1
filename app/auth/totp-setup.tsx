import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { ArrowLeft, Copy, Eye, EyeOff, Smartphone, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { mfaService } from '@/api/services/mfa';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';

export default function TOTPSetupScreen() {
  const { user } = useAuth();
  const [totpSetup, setTotpSetup] = useState<{
    secret: string;
    qrCodeUrl: string;
    manualCode: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    generateTOTPSetup();
  }, []);

  const generateTOTPSetup = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const setup = await mfaService.generateTOTPSetup(user.id, user.email);
      setTotpSetup(setup);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate TOTP setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', 'Secret key copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleVerifyCode = async () => {
    if (!totpSetup || !user) return;

    const code = verificationCode.trim();
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await mfaService.verifyTOTP(totpSetup.secret, code);
      
      if (isValid) {
        // Setup TOTP method
        const totpMethod = {
          id: `totp_${Date.now()}`,
          type: 'totp' as const,
          name: 'Authenticator App',
          value: user.email,
          isEnabled: true,
          isDefault: false,
          createdAt: new Date().toISOString(),
        };

        await mfaService.setupMFA(user.id, totpMethod);
        
        Alert.alert(
          'Success!',
          'TOTP authentication has been set up successfully.',
          [
            {
              text: 'Continue',
              onPress: () => router.push('/auth/backup-codes'),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Invalid verification code. Please try again.');
        setVerificationCode('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating TOTP setup...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!totpSetup) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to generate TOTP setup</Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateTOTPSetup}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Set Up Authenticator App</Text>
          <Text style={styles.headerSubtitle}>
            Scan the QR code or enter the secret key manually
          </Text>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Scan QR Code</Text>
          <Text style={styles.sectionDescription}>
            Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code
          </Text>
          
          <View style={styles.qrContainer}>
            <QRCode
              value={totpSetup.qrCodeUrl}
              size={200}
              color="#0A2A4E"
              backgroundColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Manual Entry Section */}
        <View style={styles.manualSection}>
          <Text style={styles.sectionTitle}>Manual Entry</Text>
          <Text style={styles.sectionDescription}>
            If you can't scan the QR code, enter this secret key manually in your authenticator app
          </Text>
          
          <View style={styles.secretContainer}>
            <View style={styles.secretInput}>
              <Text style={styles.secretText}>
                {showSecret ? totpSetup.manualCode : '••••••••••••••••••••••••••••••••'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowSecret(!showSecret)}
            >
              {showSecret ? (
                <EyeOff size={20} color="#6B7280" strokeWidth={2} />
              ) : (
                <Eye size={20} color="#6B7280" strokeWidth={2} />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => copyToClipboard(totpSetup.manualCode)}
            >
              <Copy size={20} color="#00BFA6" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Verification Section */}
        <View style={styles.verificationSection}>
          <Text style={styles.sectionTitle}>Verify Setup</Text>
          <Text style={styles.sectionDescription}>
            Enter the 6-digit code from your authenticator app to verify the setup
          </Text>
          
          <TextInput
            style={styles.verificationInput}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
          
          <TouchableOpacity 
            style={[
              styles.verifyButton,
              (verificationCode.length !== 6 || isVerifying) && styles.disabledButton
            ]} 
            onPress={handleVerifyCode}
            disabled={verificationCode.length !== 6 || isVerifying}
          >
            <Text style={styles.verifyButtonText}>
              {isVerifying ? 'Verifying...' : 'Verify & Complete Setup'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to set up:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>
              Download an authenticator app like Google Authenticator or Authy
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>
              Scan the QR code above or manually enter the secret key
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              Enter the 6-digit code that appears in your app
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#00BFA6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
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
  qrSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  manualSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  secretContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  secretInput: {
    flex: 1,
  },
  secretText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#0A2A4E',
    fontWeight: '600',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  verificationSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  verificationInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2A4E',
    textAlign: 'center',
    marginBottom: 20,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  verifyButton: {
    backgroundColor: '#00BFA6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
});
