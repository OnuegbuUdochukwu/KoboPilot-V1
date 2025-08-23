import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="mfa-setup" />
      <Stack.Screen name="bank-connection" />
      <Stack.Screen name="onboarding-complete" />
    </Stack>
  );
}
