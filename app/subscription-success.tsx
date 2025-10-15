// Subscription Success Screen - Post-purchase confirmation
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSeasonalTheme } from '../constants/theme';

const theme = getSeasonalTheme();

export default function SubscriptionSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.replace('/manage-subscription');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color={theme.accent} />
        </View>
        
        <Text style={[styles.successTitle, { color: theme.textPrimary }]}>
          You're upgraded! 🎉
        </Text>
        
        <Text style={[styles.successMessage, { color: theme.textSecondary }]}>
          Your subscription is active.
        </Text>
        
        <View style={[styles.benefitsCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.benefitsTitle, { color: theme.textPrimary }]}>
            🌟 Welcome to Rooted & Growing+
          </Text>
          <Text style={[styles.benefitsText, { color: theme.textSecondary }]}>
            You now have access to all premium features including the full 44-card deck, advanced spreads, and monthly ritual boxes.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: theme.accent }]}
          onPress={() => router.replace('/manage-subscription')}
        >
          <Text style={styles.continueButtonText}>Manage Subscription</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={[styles.exploreButtonText, { color: theme.accent }]}>
            Explore Premium Features
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
  successIcon: {
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  benefitsCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  benefitsText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exploreButton: {
    paddingVertical: 12,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});