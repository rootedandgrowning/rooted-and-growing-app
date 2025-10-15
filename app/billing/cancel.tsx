// Billing Cancel - Checkout cancellation handling
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSeasonalTheme } from '../../constants/theme';

const theme = getSeasonalTheme();

export default function BillingCancelScreen() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/manage-subscription');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
      <View style={styles.content}>
        <View style={styles.cancelIcon}>
          <Ionicons name="close-circle-outline" size={80} color={theme.textSecondary} />
        </View>
        
        <Text style={[styles.cancelTitle, { color: theme.textPrimary }]}>
          Checkout Cancelled
        </Text>
        
        <Text style={[styles.cancelMessage, { color: theme.textSecondary }]}>
          No changes were made to your account. You can try again anytime.
        </Text>

        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.accent }]}
          onPress={() => router.replace('/manage-subscription')}
        >
          <Text style={styles.backButtonText}>Back to Subscription</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={[styles.homeButtonText, { color: theme.accent }]}>
            Return to Home
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  cancelIcon: {
    marginBottom: 32,
  },
  cancelTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  cancelMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    paddingVertical: 12,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});