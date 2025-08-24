import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
// Note: connectReactNativeSdk import is commented out until the correct import is available
// import { connectReactNativeSdk } from 'connect-react-native-sdk';
import { config as OPEN_BANKING_CONFIG } from '@/config/openBanking';

// Nigerian Banks Open Banking Support
export const SUPPORTED_BANKS = Object.values(OPEN_BANKING_CONFIG.banks);

// Token Storage Keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'open_banking_access_token',
  REFRESH_TOKEN: 'open_banking_refresh_token',
  TOKEN_EXPIRY: 'open_banking_token_expiry',
  BANK_CONNECTION_ID: 'open_banking_connection_id',
  USER_CONSENT: 'open_banking_user_consent',
};

// Open Banking Connection Status
export enum ConnectionStatus {
  PENDING = 'pending',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  FAILED = 'failed',
  DISCONNECTED = 'disconnected',
}

// Open Banking Connection Interface
export interface OpenBankingConnection {
  id: string;
  bankId: string;
  bankName: string;
  status: ConnectionStatus;
  connectedAt?: string;
  lastSync?: string;
  accounts: BankAccount[];
  scopes: string[];
  expiresAt?: string;
}

// Bank Account Interface
export interface BankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: 'savings' | 'current' | 'fixed' | 'dormant';
  balance: number;
  currency: string;
  isActive: boolean;
  lastTransactionDate?: string;
}

// Open Banking Service Class
export class OpenBankingService {
  private static instance: OpenBankingService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): OpenBankingService {
    if (!OpenBankingService.instance) {
      OpenBankingService.instance = new OpenBankingService();
    }
    return OpenBankingService.instance;
  }

  /**
   * Initialize the Open Banking service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load stored tokens
      await this.loadStoredTokens();
      
      // Initialize Mastercard Connect SDK
      if (Platform.OS !== 'web') {
        await this.initializeConnectSDK();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Open Banking service:', error);
      throw error;
    }
  }

  /**
   * Initialize Mastercard Connect SDK
   */
  private async initializeConnectSDK(): Promise<void> {
    try {
      // TODO: Initialize the SDK when the correct import is available
      // For now, we'll simulate successful initialization
      console.log('Open Banking SDK initialization simulated');
      
      // await connectReactNativeSdk.initialize({
      //   clientId: OPEN_BANKING_CONFIG.clientId,
      //   clientSecret: OPEN_BANKING_CONFIG.clientSecret,
      //   environment: OPEN_BANKING_CONFIG.environment,
      //   redirectUri: OPEN_BANKING_CONFIG.redirectUri,
      // });
    } catch (error) {
      console.error('Failed to initialize Connect SDK:', error);
      throw error;
    }
  }

  /**
   * Load stored tokens from secure storage
   */
  private async loadStoredTokens(): Promise<void> {
    try {
      const [accessToken, refreshToken, tokenExpiry] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
      ]);

      if (accessToken && refreshToken && tokenExpiry) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiry = parseInt(tokenExpiry);
      }
    } catch (error) {
      console.error('Failed to load stored tokens:', error);
    }
  }

  /**
   * Store tokens securely
   */
  private async storeTokens(accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
    try {
      const expiryTime = Date.now() + (expiresIn * 1000);
      
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()),
      ]);

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tokenExpiry = expiryTime;
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw error;
    }
  }

  /**
   * Check if token is valid and not expired
   */
  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return false;
    return Date.now() < this.tokenExpiry;
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${OPEN_BANKING_CONFIG.apiBaseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${OPEN_BANKING_CONFIG.clientId}:${OPEN_BANKING_CONFIG.clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      await this.storeTokens(data.access_token, data.refresh_token, data.expires_in);
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      // Clear invalid tokens
      await this.clearTokens();
      throw error;
    }
  }

  /**
   * Clear stored tokens
   */
  private async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
      ]);

      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  private async getValidAccessToken(): Promise<string> {
    if (!this.isTokenValid()) {
      await this.refreshAccessToken();
    }
    
    if (!this.accessToken) {
      throw new Error('No valid access token available');
    }
    
    return this.accessToken;
  }

  /**
   * Start bank connection process
   */
  async connectBank(bankId: string): Promise<{ connectionId: string; authUrl: string }> {
    try {
      const bank = SUPPORTED_BANKS.find(b => b.id === bankId);
      if (!bank) {
        throw new Error('Bank not supported');
      }

      if (!bank.openBankingSupported) {
        throw new Error('Open Banking not supported by this bank');
      }

      // Generate secure state parameter
      const state = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${bankId}_${Date.now()}_${Math.random()}`
      );

      // Create connection request
      const response = await fetch(`${OPEN_BANKING_CONFIG.apiBaseUrl}/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getValidAccessToken()}`,
        },
        body: JSON.stringify({
          bank_id: bankId,
          scopes: bank.scopes,
          redirect_uri: OPEN_BANKING_CONFIG.redirectUri,
          state: state,
          user_consent: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create bank connection');
      }

      const data = await response.json();
      
      // Store connection ID
      await SecureStore.setItemAsync(STORAGE_KEYS.BANK_CONNECTION_ID, data.connection_id);
      
      return {
        connectionId: data.connection_id,
        authUrl: data.authorization_url,
      };
    } catch (error) {
      console.error('Failed to start bank connection:', error);
      throw error;
    }
  }

  /**
   * Handle bank connection callback
   */
  async handleConnectionCallback(code: string, state: string): Promise<OpenBankingConnection> {
    try {
      const connectionId = await SecureStore.getItemAsync(STORAGE_KEYS.BANK_CONNECTION_ID);
      if (!connectionId) {
        throw new Error('No connection ID found');
      }

      // Exchange authorization code for access token
      const response = await fetch(`${OPEN_BANKING_CONFIG.apiBaseUrl}/connections/${connectionId}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getValidAccessToken()}`,
        },
        body: JSON.stringify({
          authorization_code: code,
          state: state,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete bank connection');
      }

      const data = await response.json();
      
      // Store user consent
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_CONSENT, JSON.stringify({
        granted: true,
        grantedAt: new Date().toISOString(),
        scopes: data.scopes,
      }));

      // Get connection details
      return await this.getConnectionDetails(connectionId);
    } catch (error) {
      console.error('Failed to handle connection callback:', error);
      throw error;
    }
  }

  /**
   * Get connection details
   */
  async getConnectionDetails(connectionId: string): Promise<OpenBankingConnection> {
    try {
      const response = await fetch(`${OPEN_BANKING_CONFIG.apiBaseUrl}/connections/${connectionId}`, {
        headers: {
          'Authorization': `Bearer ${await this.getValidAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get connection details');
      }

      const data = await response.json();
      
      return {
        id: data.connection_id,
        bankId: data.bank_id,
        bankName: data.bank_name,
        status: data.status as ConnectionStatus,
        connectedAt: data.connected_at,
        lastSync: data.last_sync,
        accounts: data.accounts || [],
        scopes: data.scopes || [],
        expiresAt: data.expires_at,
      };
    } catch (error) {
      console.error('Failed to get connection details:', error);
      throw error;
    }
  }

  /**
   * Get connected accounts
   */
  async getConnectedAccounts(): Promise<BankAccount[]> {
    try {
      const connectionId = await SecureStore.getItemAsync(STORAGE_KEYS.BANK_CONNECTION_ID);
      if (!connectionId) {
        return [];
      }

      const connection = await this.getConnectionDetails(connectionId);
      return connection.accounts;
    } catch (error) {
      console.error('Failed to get connected accounts:', error);
      return [];
    }
  }

  /**
   * Sync account data
   */
  async syncAccounts(): Promise<boolean> {
    try {
      const connectionId = await SecureStore.getItemAsync(STORAGE_KEYS.BANK_CONNECTION_ID);
      if (!connectionId) {
        throw new Error('No active bank connection');
      }

      const response = await fetch(`${OPEN_BANKING_CONFIG.apiBaseUrl}/connections/${connectionId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getValidAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sync accounts');
      }

      // Update last sync time
      const data = await response.json();
      console.log('Accounts synced successfully:', data);
      
      return true;
    } catch (error) {
      console.error('Failed to sync accounts:', error);
      return false;
    }
  }

  /**
   * Disconnect bank
   */
  async disconnectBank(): Promise<boolean> {
    try {
      const connectionId = await SecureStore.getItemAsync(STORAGE_KEYS.BANK_CONNECTION_ID);
      if (!connectionId) {
        return true; // Already disconnected
      }

      const response = await fetch(`${OPEN_BANKING_CONFIG.apiBaseUrl}/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await this.getValidAccessToken()}`,
        },
      });

      // Clear stored data regardless of response
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.BANK_CONNECTION_ID),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_CONSENT),
      ]);

      return response.ok;
    } catch (error) {
      console.error('Failed to disconnect bank:', error);
      // Still clear stored data
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.BANK_CONNECTION_ID),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_CONSENT),
      ]);
      return false;
    }
  }

  /**
   * Check connection status
   */
  async getConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const connectionId = await SecureStore.getItemAsync(STORAGE_KEYS.BANK_CONNECTION_ID);
      if (!connectionId) {
        return ConnectionStatus.DISCONNECTED;
      }

      const connection = await this.getConnectionDetails(connectionId);
      return connection.status;
    } catch (error) {
      console.error('Failed to get connection status:', error);
      return ConnectionStatus.FAILED;
    }
  }

  /**
   * Get supported banks
   */
  getSupportedBanks() {
    return SUPPORTED_BANKS;
  }

  /**
   * Check if bank supports Open Banking
   */
  isBankSupported(bankId: string): boolean {
    const bank = SUPPORTED_BANKS.find(b => b.id === bankId);
    return bank?.openBankingSupported || false;
  }
}

// Export singleton instance
export const openBankingService = OpenBankingService.getInstance();
