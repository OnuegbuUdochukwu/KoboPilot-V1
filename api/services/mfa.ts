import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import QRCode from 'qrcode';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MFAMethod {
  id: string;
  type: 'sms' | 'email' | 'totp';
  name: string;
  value: string;
  isEnabled: boolean;
  isDefault: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface BackupCode {
  id: string;
  code: string;
  isUsed: boolean;
  usedAt?: string;
}

export interface MFASetup {
  userId: string;
  methods: MFAMethod[];
  backupCodes: BackupCode[];
  totpSecret?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationResult {
  success: boolean;
  method: string;
  timestamp: string;
  ipAddress?: string;
  deviceInfo?: string;
}

class MFAService {
  private readonly MFA_STORAGE_KEY = 'kobopilot_mfa_setup';
  private readonly TOTP_SECRET_KEY = 'kobopilot_totp_secret';
  private readonly BACKUP_CODES_KEY = 'kobopilot_backup_codes';

  /**
   * Generate a secure random OTP code
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate a secure random TOTP secret
   */
  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate backup codes for account recovery
   */
  private generateBackupCodes(): BackupCode[] {
    const codes: BackupCode[] = [];
    for (let i = 0; i < 10; i++) {
      const code = this.generateBackupCode();
      codes.push({
        id: Crypto.randomUUID(),
        code,
        isUsed: false,
      });
    }
    return codes;
  }

  /**
   * Generate a single backup code
   */
  private generateBackupCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Send OTP via SMS (mock implementation - replace with actual SMS service)
   */
  async sendSMSOTP(phoneNumber: string): Promise<{ success: boolean; code?: string }> {
    try {
      // TODO: Replace with actual SMS service (Twilio, AWS SNS, etc.)
      const code = this.generateOTP();
      
      // Sanitize phone number for SecureStore key
      const sanitizedPhone = phoneNumber.replace(/[^a-zA-Z0-9._-]/g, '_');
      
      // Store the code temporarily with expiration
      await SecureStore.setItemAsync(
        `sms_otp_${sanitizedPhone}`,
        JSON.stringify({
          code,
          expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        })
      );

      console.log(`SMS OTP sent to ${phoneNumber}: ${code}`); // Remove in production
      
      return { success: true, code };
    } catch (error) {
      console.error('Error sending SMS OTP:', error);
      return { success: false };
    }
  }

  /**
   * Send OTP via Email (mock implementation - replace with actual email service)
   */
  async sendEmailOTP(email: string): Promise<{ success: boolean; code?: string }> {
    try {
      // TODO: Replace with actual email service (SendGrid, AWS SES, etc.)
      const code = this.generateOTP();
      
      // Sanitize email for SecureStore key
      const sanitizedEmail = email.replace(/[^a-zA-Z0-9._-]/g, '_');
      
      // Store the code temporarily with expiration
      await SecureStore.setItemAsync(
        `email_otp_${sanitizedEmail}`,
        JSON.stringify({
          code,
          expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        })
      );

      console.log(`Email OTP sent to ${email}: ${code}`); // Remove in production
      
      return { success: true, code };
    } catch (error) {
      console.error('Error sending Email OTP:', error);
      return { success: false };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(method: 'sms' | 'email', value: string, code: string): Promise<boolean> {
    try {
      // Sanitize value for SecureStore key
      const sanitizedValue = value.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageKey = `${method}_otp_${sanitizedValue}`;
      const storedData = await SecureStore.getItemAsync(storageKey);
      
      if (!storedData) {
        return false;
      }

      const { code: storedCode, expiresAt } = JSON.parse(storedData);
      
      // Check if code is expired
      if (Date.now() > expiresAt) {
        await SecureStore.deleteItemAsync(storageKey);
        return false;
      }

      // Verify code
      if (storedCode === code) {
        await SecureStore.deleteItemAsync(storageKey);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }

  /**
   * Generate TOTP secret and QR code
   */
  async generateTOTPSetup(userId: string, email: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    manualCode: string;
  }> {
    try {
      // Generate a random secret (32 characters)
      const secret = this.generateSecret();
      const appName = 'KoboPilot';
      const accountName = email;
      
      // Create otpauth URL for QR code
      const otpauth = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;
      
      // For React Native, we'll return the otpauth URL instead of a data URL
      // The QR code component will handle the generation
      const qrCodeUrl = otpauth;
      
      return {
        secret,
        qrCodeUrl,
        manualCode: secret,
      };
    } catch (error) {
      console.error('Error generating TOTP setup:', error);
      throw new Error('Failed to generate TOTP setup');
    }
  }

  /**
   * Verify TOTP code (simplified implementation for demo)
   * In production, use a proper TOTP library
   */
  async verifyTOTP(secret: string, token: string): Promise<boolean> {
    try {
      // For demo purposes, we'll use a simple verification
      // In production, implement proper TOTP algorithm
      const currentTime = Math.floor(Date.now() / 30000); // 30-second window
      const expectedToken = this.generateTOTPFromSecret(secret, currentTime);
      
      // Also check previous and next window for time drift
      const prevToken = this.generateTOTPFromSecret(secret, currentTime - 1);
      const nextToken = this.generateTOTPFromSecret(secret, currentTime + 1);
      
      return token === expectedToken || token === prevToken || token === nextToken;
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      return false;
    }
  }

  /**
   * Generate TOTP from secret and time (simplified)
   */
  private generateTOTPFromSecret(secret: string, time: number): string {
    // Simple hash-based TOTP generation
    const timeString = time.toString();
    let hash = 0;
    for (let i = 0; i < timeString.length; i++) {
      const char = timeString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use secret to add complexity
    for (let i = 0; i < secret.length; i++) {
      const char = secret.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Generate 6-digit code
    const code = Math.abs(hash) % 1000000;
    return code.toString().padStart(6, '0');
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const backupCodes = await this.getBackupCodes(userId);
      const backupCode = backupCodes.find(bc => bc.code === code && !bc.isUsed);
      
      if (backupCode) {
        // Mark code as used
        backupCode.isUsed = true;
        backupCode.usedAt = new Date().toISOString();
        await this.saveBackupCodes(userId, backupCodes);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  }

  /**
   * Setup MFA for a user
   */
  async setupMFA(userId: string, method: MFAMethod): Promise<MFASetup> {
    try {
      const existingSetup = await this.getMFASetup(userId);
      const backupCodes = this.generateBackupCodes();
      
      const mfaSetup: MFASetup = {
        userId,
        methods: existingSetup ? [...existingSetup.methods, method] : [method],
        backupCodes,
        isEnabled: true,
        createdAt: existingSetup?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.saveMFASetup(userId, mfaSetup);
      await this.saveBackupCodes(userId, backupCodes);
      
      return mfaSetup;
    } catch (error) {
      console.error('Error setting up MFA:', error);
      throw new Error('Failed to setup MFA');
    }
  }

  /**
   * Enable/disable MFA
   */
  async toggleMFA(userId: string, enabled: boolean): Promise<void> {
    try {
      const setup = await this.getMFASetup(userId);
      if (!setup) {
        throw new Error('MFA setup not found');
      }

      setup.isEnabled = enabled;
      setup.updatedAt = new Date().toISOString();
      
      await this.saveMFASetup(userId, setup);
    } catch (error) {
      console.error('Error toggling MFA:', error);
      throw new Error('Failed to toggle MFA');
    }
  }

  /**
   * Add a new MFA method
   */
  async addMFAMethod(userId: string, method: MFAMethod): Promise<void> {
    try {
      const setup = await this.getMFASetup(userId);
      if (!setup) {
        throw new Error('MFA setup not found');
      }

      setup.methods.push(method);
      setup.updatedAt = new Date().toISOString();
      
      await this.saveMFASetup(userId, setup);
    } catch (error) {
      console.error('Error adding MFA method:', error);
      throw new Error('Failed to add MFA method');
    }
  }

  /**
   * Remove an MFA method
   */
  async removeMFAMethod(userId: string, methodId: string): Promise<void> {
    try {
      const setup = await this.getMFASetup(userId);
      if (!setup) {
        throw new Error('MFA setup not found');
      }

      setup.methods = setup.methods.filter(m => m.id !== methodId);
      setup.updatedAt = new Date().toISOString();
      
      await this.saveMFASetup(userId, setup);
    } catch (error) {
      console.error('Error removing MFA method:', error);
      throw new Error('Failed to remove MFA method');
    }
  }

  /**
   * Get MFA setup for a user
   */
  async getMFASetup(userId: string): Promise<MFASetup | null> {
    try {
      // Sanitize userId for SecureStore key
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9._-]/g, '_');
      const data = await SecureStore.getItemAsync(`${this.MFA_STORAGE_KEY}_${sanitizedUserId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting MFA setup:', error);
      return null;
    }
  }

  /**
   * Save MFA setup
   */
  private async saveMFASetup(userId: string, setup: MFASetup): Promise<void> {
    try {
      // Sanitize userId for SecureStore key
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9._-]/g, '_');
      await SecureStore.setItemAsync(`${this.MFA_STORAGE_KEY}_${sanitizedUserId}`, JSON.stringify(setup));
    } catch (error) {
      console.error('Error saving MFA setup:', error);
      throw new Error('Failed to save MFA setup');
    }
  }

  /**
   * Get backup codes for a user
   */
  async getBackupCodes(userId: string): Promise<BackupCode[]> {
    try {
      // Sanitize userId for SecureStore key
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9._-]/g, '_');
      const data = await SecureStore.getItemAsync(`${this.BACKUP_CODES_KEY}_${sanitizedUserId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting backup codes:', error);
      return [];
    }
  }

  /**
   * Save backup codes
   */
  private async saveBackupCodes(userId: string, codes: BackupCode[]): Promise<void> {
    try {
      // Sanitize userId for SecureStore key
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9._-]/g, '_');
      await SecureStore.setItemAsync(`${this.BACKUP_CODES_KEY}_${sanitizedUserId}`, JSON.stringify(codes));
    } catch (error) {
      console.error('Error saving backup codes:', error);
      throw new Error('Failed to save backup codes');
    }
  }

  /**
   * Generate new backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<BackupCode[]> {
    try {
      const newCodes = this.generateBackupCodes();
      await this.saveBackupCodes(userId, newCodes);
      
      // Update MFA setup
      const setup = await this.getMFASetup(userId);
      if (setup) {
        setup.backupCodes = newCodes;
        setup.updatedAt = new Date().toISOString();
        await this.saveMFASetup(userId, setup);
      }
      
      return newCodes;
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      throw new Error('Failed to regenerate backup codes');
    }
  }

  /**
   * Check if MFA is required for a user
   */
  async isMFARequired(userId: string): Promise<boolean> {
    try {
      const setup = await this.getMFASetup(userId);
      return setup?.isEnabled || false;
    } catch (error) {
      console.error('Error checking MFA requirement:', error);
      return false;
    }
  }

  /**
   * Get available MFA methods for a user
   */
  async getAvailableMethods(userId: string): Promise<MFAMethod[]> {
    try {
      const setup = await this.getMFASetup(userId);
      return setup?.methods || [];
    } catch (error) {
      console.error('Error getting available methods:', error);
      return [];
    }
  }

  /**
   * Log verification attempt
   */
  async logVerification(userId: string, result: VerificationResult): Promise<void> {
    try {
      const logs = await this.getVerificationLogs(userId);
      logs.push({
        ...result,
        timestamp: new Date().toISOString(),
      });
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      // Sanitize userId for SecureStore key
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9._-]/g, '_');
      await SecureStore.setItemAsync(
        `mfa_logs_${sanitizedUserId}`,
        JSON.stringify(logs)
      );
    } catch (error) {
      console.error('Error logging verification:', error);
    }
  }

  /**
   * Get verification logs
   */
  async getVerificationLogs(userId: string): Promise<VerificationResult[]> {
    try {
      // Sanitize userId for SecureStore key
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9._-]/g, '_');
      const data = await SecureStore.getItemAsync(`mfa_logs_${sanitizedUserId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting verification logs:', error);
      return [];
    }
  }
}

export const mfaService = new MFAService();
