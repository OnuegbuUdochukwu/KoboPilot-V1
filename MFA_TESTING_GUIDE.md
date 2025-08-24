# 🔐 KoboPilot MFA Testing Guide

## 🎯 Overview
This guide provides step-by-step instructions for testing the Multi-Factor Authentication (MFA) implementation in KoboPilot.

## 📱 Prerequisites
- Expo Go app installed on your device
- Development server running (`npm run dev`)
- Test device (iOS/Android) or simulator

## 🚀 Getting Started

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Connect to the App
- Open Expo Go on your device
- Scan the QR code from the terminal
- Or press 'i' for iOS simulator or 'a' for Android emulator

## 🧪 Testing Scenarios

### Test Case 1: MFA Setup Flow

#### 1.1 SMS Verification Setup
1. **Navigate to Signup**: Open the app and go to the signup screen
2. **Complete Registration**: Fill in the registration form
3. **MFA Setup**: You'll be redirected to the MFA setup screen
4. **Choose SMS**: Select "SMS Verification" option
5. **Send Code**: Tap to send verification code
6. **Check Console**: The code will be logged in the console (for testing)
7. **Enter Code**: Enter the 6-digit code from the console
8. **Verify**: Complete the verification process
9. **Backup Codes**: You'll be taken to the backup codes screen
10. **Save Codes**: Copy or save the backup codes
11. **Continue**: Proceed to bank connection

#### 1.2 Email Verification Setup
1. **Follow steps 1-3** from SMS verification
2. **Choose Email**: Select "Email Verification" option
3. **Send Code**: Tap to send verification code
4. **Check Console**: The code will be logged in the console
5. **Complete Verification**: Enter the code and continue

#### 1.3 TOTP (Authenticator App) Setup
1. **Follow steps 1-3** from SMS verification
2. **Choose TOTP**: Select "Authenticator App" option
3. **QR Code**: Scan the QR code with Google Authenticator or similar app
4. **Manual Entry**: Alternatively, copy the secret key manually
5. **Enter Code**: Enter the 6-digit code from your authenticator app
6. **Complete Setup**: Verify and continue

### Test Case 2: Backup Codes Management

#### 2.1 View Backup Codes
1. **Navigate to MFA Settings**: Go to Profile → MFA Settings
2. **Show Codes**: Tap the eye icon to reveal backup codes
3. **Copy Codes**: Use the "Copy All Codes" button
4. **Save to File**: Use the "Save to File" button

#### 2.2 Regenerate Backup Codes
1. **Navigate to MFA Settings**: Go to Profile → MFA Settings
2. **Regenerate**: Tap "Regenerate Codes"
3. **Confirm**: Confirm the regeneration
4. **Verify**: Check that new codes are generated

### Test Case 3: MFA Verification During Sign-in

#### 3.1 Normal Sign-in with MFA
1. **Sign Out**: Sign out of the app
2. **Sign In**: Enter your credentials
3. **MFA Prompt**: You'll be prompted for MFA verification
4. **Choose Method**: Select your preferred verification method
5. **Enter Code**: Enter the verification code
6. **Access Granted**: You should be signed in successfully

#### 3.2 Backup Code Usage
1. **Sign In**: Start the sign-in process
2. **MFA Prompt**: When prompted for MFA
3. **Use Backup Code**: Select "Use backup code instead"
4. **Enter Code**: Enter one of your backup codes
5. **Verify**: Complete the verification
6. **Check Usage**: Verify the code is marked as "USED"

### Test Case 4: MFA Management

#### 4.1 Enable/Disable MFA
1. **Navigate to MFA Settings**: Go to Profile → MFA Settings
2. **Toggle MFA**: Use the toggle switch to enable/disable MFA
3. **Confirm**: Confirm the action
4. **Verify**: Check that the setting is applied

#### 4.2 Add New MFA Method
1. **Navigate to MFA Settings**: Go to Profile → MFA Settings
2. **Add Method**: Tap "Add Method"
3. **Choose Type**: Select SMS, Email, or TOTP
4. **Complete Setup**: Follow the setup process
5. **Verify**: Check that the new method appears in the list

#### 4.3 Remove MFA Method
1. **Navigate to MFA Settings**: Go to Profile → MFA Settings
2. **Remove Method**: Tap the trash icon next to a method
3. **Confirm**: Confirm the removal
4. **Verify**: Check that the method is removed

## 🔍 Testing Checklist

### ✅ Core Functionality
- [ ] SMS OTP generation and verification
- [ ] Email OTP generation and verification
- [ ] TOTP setup with QR code
- [ ] TOTP setup with manual entry
- [ ] Backup codes generation
- [ ] Backup codes usage
- [ ] MFA method management
- [ ] MFA enable/disable toggle

### ✅ Security Features
- [ ] OTP codes expire after 10 minutes
- [ ] Backup codes are single-use
- [ ] Secure storage of MFA data
- [ ] Verification attempt logging
- [ ] Input validation and sanitization

### ✅ User Experience
- [ ] Intuitive setup flow
- [ ] Clear error messages
- [ ] Loading states
- [ ] Success confirmations
- [ ] Accessibility features

### ✅ Edge Cases
- [ ] Invalid OTP codes
- [ ] Expired OTP codes
- [ ] Invalid backup codes
- [ ] Network errors
- [ ] Multiple failed attempts

## 🐛 Known Issues & Limitations

### Current Implementation
- **Mock SMS/Email**: Currently using console logging instead of real SMS/Email services
- **Demo Phone Number**: Using a hardcoded Nigerian phone number for testing
- **No Real Backend**: MFA data is stored locally using Expo SecureStore

### Production Considerations
- **SMS Service**: Integrate with Twilio, AWS SNS, or similar
- **Email Service**: Integrate with SendGrid, AWS SES, or similar
- **Backend API**: Move MFA logic to secure backend
- **Rate Limiting**: Implement rate limiting for OTP requests
- **Audit Logging**: Enhanced logging for security events

## 📊 Test Results Template

```
Test Date: _______________
Tester: _______________
Device: _______________

### Test Results
- [ ] SMS Verification: PASS/FAIL
- [ ] Email Verification: PASS/FAIL
- [ ] TOTP Setup: PASS/FAIL
- [ ] Backup Codes: PASS/FAIL
- [ ] MFA Management: PASS/FAIL
- [ ] Sign-in Flow: PASS/FAIL

### Issues Found
1. _______________
2. _______________
3. _______________

### Recommendations
1. _______________
2. _______________
3. _______________
```

## 🎉 Success Criteria

The MFA implementation is considered successful when:
- ✅ All verification methods work correctly
- ✅ Backup codes function as expected
- ✅ MFA management features work properly
- ✅ Security measures are in place
- ✅ User experience is smooth and intuitive
- ✅ Error handling is robust
- ✅ No critical security vulnerabilities exist

## 🚀 Next Steps

After successful testing:
1. **Production Integration**: Replace mock services with real SMS/Email providers
2. **Backend Migration**: Move MFA logic to secure backend API
3. **Security Audit**: Conduct comprehensive security review
4. **User Testing**: Conduct user acceptance testing
5. **Documentation**: Update user documentation
6. **Deployment**: Deploy to production environment

---

**Note**: This testing guide covers the MVP implementation. Additional testing may be required for production deployment.
