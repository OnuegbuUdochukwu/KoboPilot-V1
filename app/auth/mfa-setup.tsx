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
import { ArrowLeft, Shield, Smartphone, Mail } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function MFASetupScreen() {
  const { completeMfaSetup } = useAuth();
  const [mfaMethod, setMfaMethod] = useState<'sms' | 'email' | null>(null);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
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

  const handleSendCode = async (method: 'sms' | 'email') => {
    setMfaMethod(method);
    setIsLoading(true);
    
    try {
      // TODO: Implement actual MFA code sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCountdown(60); // Start 60 second countdown
      Alert.alert('Success', `Verification code sent to your ${method === 'sms' ? 'phone' : 'email'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!mfaMethod) return;
    
    setIsResending(true);
    try {
      // TODO: Implement actual resend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCountdown(60);
      Alert.alert('Success', 'Verification code resent');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual MFA verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Complete MFA setup
      await completeMfaSetup();
      
      // Navigate to bank connection
      router.push('/auth/bank-connection');
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code. Please try again.');
      setVerificationCode(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const canVerify = verificationCode.every(digit => digit !== '') && mfaMethod;

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
            <Text style={styles.headerTitle}>Secure Your Account</Text>
            <Text style={styles.headerSubtitle}>
              Set up two-factor authentication to protect your financial data
            </Text>
          </View>

          {/* MFA Method Selection */}
          {!mfaMethod && (
            <View style={styles.methodSelection}>
              <Text style={styles.sectionTitle}>Choose verification method</Text>
              
              <TouchableOpacity 
                style={styles.methodCard}
                onPress={() => handleSendCode('sms')}
                disabled={isLoading}
              >
                <View style={styles.methodIcon}>
                  <Smartphone size={24} color="#00BFA6" strokeWidth={2} />
                </View>
                <View style={styles.methodContent}>
                  <Text style={styles.methodTitle}>SMS Verification</Text>
                  <Text style={styles.methodDescription}>
                    Receive a 6-digit code via text message
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.methodCard}
                onPress={() => handleSendCode('email')}
                disabled={isLoading}
              >
                <View style={styles.methodIcon}>
                  <Mail size={24} color="#00BFA6" strokeWidth={2} />
                </View>
                <View style={styles.methodContent}>
                  <Text style={styles.methodTitle}>Email Verification</Text>
                  <Text style={styles.methodDescription}>
                    Receive a 6-digit code via email
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Verification Code Input */}
          {mfaMethod && (
            <View style={styles.verificationSection}>
              <View style={styles.verificationHeader}>
                <Shield size={24} color="#00BFA6" strokeWidth={2} />
                <Text style={styles.verificationTitle}>
                  Enter verification code
                </Text>
                <Text style={styles.verificationSubtitle}>
                  We sent a 6-digit code to your {mfaMethod === 'sms' ? 'phone' : 'email'}
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

              <TouchableOpacity 
                style={styles.changeMethodButton}
                onPress={() => setMfaMethod(null)}
              >
                <Text style={styles.changeMethodText}>Change verification method</Text>
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
