import { Stack } from 'expo-router';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { AuthProvider } from '../shared/context/AuthContext';
import { AppDataProvider } from '../shared/context/AppDataContext';
import { AppGate } from '../shared/components/AppGate';

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AuthProvider>
        <AppDataProvider>
          <AppGate>
            <Stack screenOptions={{ headerShown: false }} />
          </AppGate>
        </AppDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
