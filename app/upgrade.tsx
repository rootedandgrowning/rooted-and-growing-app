import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { BackHeader } from '../components/BackHeader';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function UpgradeScreen() {
  const { user, token } = useAuth();
  const [planType, setPlanType] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_type: planType,
          success_url: `${window.location.origin}/more?upgraded=true`,
          cancel_url: `${window.location.origin}/upgrade`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.checkout_url) {
        // Redirect to Stripe Checkout
        if (Platform.OS === 'web') {
          window.location.href = data.checkout_url;
        } else {
          // For mobile, open in browser
          alert('Opening checkout...');
        }
      } else {
        alert(data.detail || 'Could not create checkout session');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Could not start upgrade process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2D5F2E', '#1a3d1b']} style={styles.gradient}>
        {/* Header */}
        <BackHeader 
          title="" 
          theme={{ textPrimary: '#fff' }}
        />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.header}>
            <Text style={styles.title}>Unlock Rooted & Growing +</Text>
            <Text style={styles.subtitle}>
              Deepen your practice with premium wisdom, monthly rituals, and seasonal tea
            </Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsCard}>
            <View style={styles.benefitRow}>
              <Ionicons name="sparkles" size={24} color="#5B8C5A" />
              <Text style={styles.benefitText}>32 additional premium cards + advanced spreads</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="book" size={24} color="#5B8C5A" />
              <Text style={styles.benefitText}>Monthly ritual guide & members library</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="leaf" size={24} color="#5B8C5A" />
              <Text style={styles.benefitText}>Tea & Tincture of the Month shipped to you</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="infinite" size={24} color="#5B8C5A" />
              <Text style={styles.benefitText}>Pause or cancel anytime</Text>
            </View>
          </View>

          {/* Pricing Toggle */}
          <View style={styles.pricingToggle}>
            <TouchableOpacity
              style={[styles.toggleOption, planType === 'monthly' && styles.toggleActive]}
              onPress={() => setPlanType('monthly')}
            >
              <Text
                style={[
                  styles.toggleText,
                  planType === 'monthly' && styles.toggleTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleOption, planType === 'annual' && styles.toggleActive]}
              onPress={() => setPlanType('annual')}
            >
              <Text
                style={[styles.toggleText, planType === 'annual' && styles.toggleTextActive]}
              >
                Annual
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price Display */}
          <View style={styles.priceCard}>
            <Text style={styles.priceAmount}>
              ${planType === 'monthly' ? '22' : '220'}
              <Text style={styles.pricePeriod}>
                /{planType === 'monthly' ? 'month' : 'year'}
              </Text>
            </Text>
            <Text style={styles.foundingPrice}>Founding Price</Text>
            {planType === 'annual' && (
              <Text style={styles.savings}>Save $44 annually (like getting 2 months free)</Text>
            )}
          </View>

          {/* Shipping Notice */}
          <View style={styles.noticeCard}>
            <Ionicons name="information-circle" size={20} color="#5B8C5A" />
            <Text style={styles.noticeText}>
              Join by the 15th to receive this month's box (ships 20th–25th).
            </Text>
          </View>

          {/* Upgrade Button */}
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgrade}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>
            Secure checkout powered by Stripe. Cancel or pause anytime in Membership Settings.
          </Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
  benefitsCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 16,
    color: '#1a3d1b',
    marginLeft: 12,
    flex: 1,
  },
  pricingToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#fff',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  toggleTextActive: {
    color: '#2D5F2E',
  },
  priceCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1a3d1b',
  },
  pricePeriod: {
    fontSize: 20,
    fontWeight: '400',
    color: '#666',
  },
  foundingPrice: {
    fontSize: 14,
    color: '#5B8C5A',
    fontWeight: '600',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  savings: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 14,
    color: '#1a3d1b',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D5F2E',
  },
  footer: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
});