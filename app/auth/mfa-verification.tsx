import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, Shield, Smartphone, Mail, Smartphone as AuthenticatorIcon, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { mfaService } from '@/api/services/mfa';

interface MFAVerificationProps {
  onVerificationComplete: () => void;
  availableMethods?: Array<{
    id: string;
    type: 'sms' | 'email' | 'totp';
    name: string;
    value: string;
  }>;
}

export default function MFAVerificationScreen({ 
  onVerificationComplete, 
  availableMethods = [] 
}: MFAVerificationProps) {
  const { user, verifyMFA } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [backupCode, setBackupCode] = useState('');
  const [showBackupInput, setShowBackupInput] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !verificationCode[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendCode = async (methodType: 'sms' | 'email') => {
    if (!user) return;
    
    setSelectedMethod(methodType);
    setIsLoading(true);
    
    try {
      let result;
      if (methodType === 'sms') {
        result = await mfaService.sendSMSOTP('+2348012345678');
      } else {
        result = await mfaService.sendEmailOTP(user.email);
      }
      
      if (result.success) {
        setCountdown(60); // Start 60 second countdown
        Alert.alert('Success', `Verification code sent to your ${methodType === 'sms' ? 'phone' : 'email'}`);
      } else {
        Alert.alert('Error', 'Failed to send verification code. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!selectedMethod || !user) return;
    
    setIsResending(true);
    try {
      let result;
      if (selectedMethod === 'sms') {
        result = await mfaService.sendSMSOTP('+2348012345678');
      } else {
        result = await mfaService.sendEmailOTP(user.email);
      }
      
      if (result.success) {
        setCountdown(60);
        Alert.alert('Success', 'Verification code resent');
      } else {
        Alert.alert('Error', 'Failed to resend code. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!user || !selectedMethod) return;
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      let isValid;
      if (selectedMethod === 'sms') {
        isValid = await mfaService.verifyOTP('sms', '+2348012345678', code);
      } else if (selectedMethod === 'email') {
        isValid = await mfaService.verifyOTP('email', user.email, code);
      } else {
        // For TOTP, we'd need the secret from the user's MFA setup
        isValid = await verifyMFA(selectedMethod, code);
      }
      
      if (isValid) {
        onVerificationComplete();
      } else {
        Alert.alert('Error', 'Invalid verification code. Please try again.');
        setVerificationCode(['', '', '', '', '', '']);
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code. Please try again.');
      setVerificationCode(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyBackupCode = async () => {
    if (!user || !backupCode.trim()) return;

    setIsLoading(true);
    try {
      const isValid = await mfaService.verifyBackupCode(user.id, backupCode.trim());
      
      if (isValid) {
        onVerificationComplete();
      } else {
        Alert.alert('Error', 'Invalid backup code. Please try again.');
        setBackupCode('');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid backup code. Please try again.');
      setBackupCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const canVerify = verificationCode.every(digit => digit !== '') && selectedMethod;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
              Enter the verification code to continue
            </Text>
          </View>

          {/* Method Selection */}
          {!selectedMethod && !showBackupInput && (
            <View style={styles.methodSelection}>
              <Text style={styles.sectionTitle}>Choose verification method</Text>
              
              {availableMethods.map((method) => (
                <TouchableOpacity 
                  key={method.id}
                  style={styles.methodCard}
                  onPress={() => {
                    if (method.type === 'totp') {
                      setSelectedMethod('totp');
                    } else {
                      handleSendCode(method.type);
                    }
                  }}
                  disabled={isLoading}
                >
                  <View style={styles.methodIcon}>
                    {method.type === 'sms' && <Smartphone size={24} color="#00BFA6" strokeWidth={2} />}
                    {method.type === 'email' && <Mail size={24} color="#00BFA6" strokeWidth={2} />}
                    {method.type === 'totp' && <AuthenticatorIcon size={24} color="#00BFA6" strokeWidth={2} />}
                  </View>
                  <View style={styles.methodContent}>
                    <Text style={styles.methodTitle}>{method.name}</Text>
                    <Text style={styles.methodDescription}>
                      {method.type === 'totp' ? 'Use your authenticator app' : `Send code to ${method.value}`}
                    </Text>
                  </View>
                  <ArrowRight size={20} color="#6B7280" strokeWidth={2} />
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                style={styles.backupButton}
                onPress={() => setShowBackupInput(true)}
              >
                <Text style={styles.backupButtonText}>Use backup code instead</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Backup Code Input */}
          {showBackupInput && (
            <View style={styles.backupSection}>
              <Text style={styles.sectionTitle}>Enter Backup Code</Text>
              <Text style={styles.sectionDescription}>
                Enter one of your backup codes to sign in
              </Text>
              
              <TextInput
                style={styles.backupInput}
                value={backupCode}
                onChangeText={setBackupCode}
                placeholder="Enter 8-character backup code"
                autoCapitalize="characters"
                maxLength={8}
                autoFocus
              />
              
              <TouchableOpacity 
                style={[
                  styles.verifyButton,
                  (!backupCode.trim() || isLoading) && styles.disabledButton
                ]} 
                onPress={handleVerifyBackupCode}
                disabled={!backupCode.trim() || isLoading}
              >
                <Text style={styles.verifyButtonText}>
                  {isLoading ? 'Verifying...' : 'Verify Backup Code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.changeMethodButton}
                onPress={() => {
                  setShowBackupInput(false);
                  setBackupCode('');
                }}
              >
                <Text style={styles.changeMethodText}>Choose different method</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Verification Code Input */}
          {selectedMethod && !showBackupInput && (
            <View style={styles.verificationSection}>
              <View style={styles.verificationHeader}>
                <Shield size={24} color="#00BFA6" strokeWidth={2} />
                <Text style={styles.verificationTitle}>
                  Enter verification code
                </Text>
                <Text style={styles.verificationSubtitle}>
                  {selectedMethod === 'totp' 
                    ? 'Enter the 6-digit code from your authenticator app'
                    : `We sent a 6-digit code to your ${selectedMethod === 'sms' ? 'phone' : 'email'}`
                  }
                </Text>
              </View>

              <View style={styles.codeInputContainer}>
                {verificationCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) inputRefs.current[index] = ref;
                    }}
                    style={styles.codeInput}
                    value={digit}
                    onChangeText={(value) => handleInputChange(index, value)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.verifyButton, !canVerify && styles.disabledButton]} 
                onPress={handleVerifyCode}
                disabled={!canVerify || isLoading}
              >
                <Text style={styles.verifyButtonText}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Text>
              </TouchableOpacity>

              {/* Resend Code */}
              {selectedMethod !== 'totp' && (
                <View style={styles.resendSection}>
                  <Text style={styles.resendText}>Didn't receive the code? </Text>
                  {countdown > 0 ? (
                    <Text style={styles.countdownText}>Resend in {countdown}s</Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendCode} disabled={isResending}>
                      <Text style={styles.resendButtonText}>
                        {isResending ? 'Sending...' : 'Resend Code'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <TouchableOpacity 
                style={styles.backupButton}
                onPress={() => setShowBackupInput(true)}
              >
                <Text style={styles.backupButtonText}>Use backup code instead</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.changeMethodButton}
                onPress={() => {
                  setSelectedMethod(null);
                  setVerificationCode(['', '', '', '', '', '']);
                }}
              >
                <Text style={styles.changeMethodText}>Choose different method</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  methodSelection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#0A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00BFA6' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2A4E',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  backupButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backupButtonText: {
    fontSize: 14,
    color: '#00BFA6',
    fontWeight: '600',
  },
  backupSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  backupInput: {
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
  verificationSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  verificationHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0A2A4E',
    marginTop: 12,
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0A2A4E',
    backgroundColor: '#FFFFFF',
  },
  verifyButton: {
    backgroundColor: '#00BFA6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BFA6',
  },
  countdownText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  changeMethodButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  changeMethodText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
