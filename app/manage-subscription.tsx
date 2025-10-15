// Manage Subscription - Complete Subscription Management Interface
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSeasonalTheme } from '../constants/theme';
import { BackHeader } from '../components/BackHeader';
import { useAuth } from '../contexts/AuthContext';
import { isAppleSubmissionMode } from '../utils/featureFlags';
import Constants from 'expo-constants';

const theme = getSeasonalTheme();

interface SubscriptionData {
  has_active_subscription: boolean;
  plan_type?: string;
  status?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  shipping_address?: any;
}

export default function ManageSubscriptionScreen() {
  const router = useRouter();
  const { token } = useAuth();
  
  // Hide entire screen in Apple submission mode for native
  if (isAppleSubmissionMode() && Platform.OS !== 'web') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
        <BackHeader title="Subscription" />
        <View style={styles.hiddenContent}>
          <Text style={[styles.hiddenText, { color: theme.textSecondary }]}>
            Subscription management is available on the web version of the app.
          </Text>
          <TouchableOpacity
            style={[styles.webButton, { backgroundColor: theme.accent }]}
            onPress={() => Linking.openURL('https://rootedandgrowing.app')}
          >
            <Text style={styles.webButtonText}>Visit Our Website</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    if (!token) {
      setSubscriptionData({ has_active_subscription: false });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/subscription-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      } else if (response.status === 401) {
        setSubscriptionData({ has_active_subscription: false });
      } else {
        Alert.alert('Error', 'Could not load subscription status. Please try again.');
      }
    } catch (error) {
      console.error('Error loading subscription status:', error);
      Alert.alert('Error', 'Could not connect to subscription service. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'monthly' | 'annual') => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please sign in to upgrade your subscription.');
      return;
    }

    setActionLoading(true);
    setCheckoutError(null);
    setCheckoutUrl(null);
    
    try {
      const response = await fetch(`${API_URL}/api/billing/checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: planType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          setCheckoutUrl(data.url);
          
          // Handle redirection based on platform
          if (Platform.OS === 'web') {
            try {
              window.location.assign(data.url);
            } catch (redirectError) {
              // Show direct link if redirect fails
              console.log('Redirect blocked, showing direct link');
            }
          } else {
            // Native: Open in in-app browser
            try {
              await Linking.openURL(data.url);
            } catch (linkError) {
              console.log('Link opening failed, showing direct link');
            }
          }
        } else {
          setCheckoutError(`Couldn't start checkout (${response.status}). Try again.`);
          console.log(`checkout-session error ${response.status} - Missing checkout URL`);
        }
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        setCheckoutError(`Couldn't start checkout (${response.status}). Try again.`);
        console.log(`checkout-session error ${response.status} ${errorText}`);
      }
    } catch (error) {
      setCheckoutError(`Couldn't start checkout. Try again.`);
      console.log(`checkout-session error network ${error}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please sign in to manage your subscription.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/create-portal-session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.portal_url) {
          await Linking.openURL(data.portal_url);
          // Refresh subscription status when they return
          setTimeout(() => {
            loadSubscriptionStatus();
          }, 2000);
        }
      } else {
        Alert.alert('Error', 'That didn\'t go through. Please try again.');
      }
    } catch (error) {
      console.error('Error accessing portal:', error);
      Alert.alert('Error', 'That didn\'t go through. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
        <BackHeader title="Manage Subscription" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading subscription details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!subscriptionData?.has_active_subscription) {
    // Free user - show upgrade options
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
        <BackHeader title="Upgrade Membership" />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.upgradeHeader}>
            <Text style={[styles.upgradeTitle, { color: theme.textPrimary }]}>
              🌿 Join Rooted & Growing+
            </Text>
            <Text style={[styles.upgradeSubtitle, { color: theme.textSecondary }]}>
              Deepen your practice with premium features and monthly ritual boxes
            </Text>
          </View>

          <View style={[styles.planCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.planHeader}>
              <Text style={[styles.planTitle, { color: theme.textPrimary }]}>
                🍂 Monthly Membership
              </Text>
              <Text style={[styles.planPrice, { color: theme.accent }]}>
                $22/month
              </Text>
            </View>
            <Text style={[styles.planDescription, { color: theme.textSecondary }]}>
              Monthly ritual box shipped between 20th-25th
            </Text>
            <TouchableOpacity
              style={[
                styles.planButton, 
                { backgroundColor: theme.accent },
                actionLoading && styles.buttonDisabled
              ]}
              onPress={() => handleUpgrade('monthly')}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.loadingText}>Creating secure checkout…</Text>
                </View>
              ) : (
                <Text style={styles.planButtonText}>
                  Upgrade — Monthly $22
                </Text>
              )}
            </TouchableOpacity>
            
            {/* Error or fallback link */}
            {checkoutError && (
              <Text style={[styles.errorText, { color: '#dc3545' }]}>
                {checkoutError}
              </Text>
            )}
            
            {checkoutUrl && !actionLoading && (
              <TouchableOpacity
                style={styles.fallbackLink}
                onPress={() => Linking.openURL(checkoutUrl)}
              >
                <Text style={[styles.fallbackText, { color: theme.accent }]}>
                  Having trouble? Open checkout →
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.planCard, styles.popularPlan, { backgroundColor: theme.cardBackground, borderColor: theme.accent }]}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>✨ SAVE 2 MONTHS</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={[styles.planTitle, { color: theme.textPrimary }]}>
                🌟 Annual Membership
              </Text>
              <Text style={[styles.planPrice, { color: theme.accent }]}>
                $220/year
              </Text>
            </View>
            <Text style={[styles.planSavings, { color: theme.accent }]}>
              Save $44 per year!
            </Text>
            <Text style={[styles.planDescription, { color: theme.textSecondary }]}>
              12 ritual boxes + premium oracle features
            </Text>
            <TouchableOpacity
              style={[
                styles.planButton, 
                { backgroundColor: theme.accent },
                actionLoading && styles.buttonDisabled
              ]}
              onPress={() => handleUpgrade('annual')}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.planButtonText}>
                  Upgrade — Annual $220 (save 2 months)
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.featuresCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.featuresTitle, { color: theme.textPrimary }]}>
              🎁 What's Included:
            </Text>
            <View style={styles.featuresList}>
              <Text style={[styles.featureItem, { color: theme.textSecondary }]}>
                📦 Monthly Tea & Tincture ritual box
              </Text>
              <Text style={[styles.featureItem, { color: theme.textSecondary }]}>
                🃏 Full 44-card oracle deck (32 premium cards)
              </Text>
              <Text style={[styles.featureItem, { color: theme.textSecondary }]}>
                🔮 Advanced spreads with AI interpretations
              </Text>
              <Text style={[styles.featureItem, { color: theme.textSecondary }]}>
                🫶 Box Circle community access
              </Text>
              <Text style={[styles.featureItem, { color: theme.textSecondary }]}>
                🎧 Premium meditation library
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Premium user - show subscription management
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
      <BackHeader title="Manage Subscription" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.activeCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.activeHeader}>
            <Text style={[styles.activeTitle, { color: theme.textPrimary }]}>
              🌟 Active Membership
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: theme.accent }]}>
              <Text style={styles.statusText}>ACTIVE</Text>
            </View>
          </View>

          <View style={styles.subscriptionDetails}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Plan:</Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {subscriptionData.plan_type === 'monthly' ? 'Monthly Membership' : 'Annual Membership'}
              </Text>
            </View>
            
            {subscriptionData.current_period_end && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  {subscriptionData.cancel_at_period_end ? 'Cancels on:' : 'Renews on:'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                  {formatDate(subscriptionData.current_period_end)}
                </Text>
              </View>
            )}

            {subscriptionData.shipping_address && (
              <View style={styles.detailColumn}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Shipping to:
                </Text>
                <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                  {subscriptionData.shipping_address.name}
                </Text>
                <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                  {subscriptionData.shipping_address.line1}
                </Text>
                {subscriptionData.shipping_address.line2 && (
                  <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                    {subscriptionData.shipping_address.line2}
                  </Text>
                )}
                <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                  {subscriptionData.shipping_address.city}, {subscriptionData.shipping_address.state} {subscriptionData.shipping_address.postal_code}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.managementCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.managementTitle, { color: theme.textPrimary }]}>
            ⚙️ Subscription Management
          </Text>
          <Text style={[styles.managementDescription, { color: theme.textSecondary }]}>
            Update payment method, shipping address, or cancel your subscription through Stripe's secure portal.
          </Text>
          
          <TouchableOpacity
            style={[styles.portalButton, { backgroundColor: theme.accent }]}
            onPress={handleManageSubscription}
            disabled={actionLoading}
          >
            <Ionicons name="settings-outline" size={20} color="#fff" />
            <Text style={styles.portalButtonText}>
              {actionLoading ? 'Opening...' : 'Manage Subscription'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.supportCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.supportTitle, { color: theme.textPrimary }]}>
            💬 Need Help?
          </Text>
          <Text style={[styles.supportDescription, { color: theme.textSecondary }]}>
            Questions about your subscription, shipping, or ritual boxes? We're here to help.
          </Text>
          
          <TouchableOpacity
            style={[styles.supportButton, { borderColor: theme.accent }]}
            onPress={() => {
              // Add support contact functionality
              Alert.alert(
                'Support',
                'Contact us at support@soulshinewellness.com or through the app for assistance with your subscription.',
                [{ text: 'OK' }]
              );
            }}
          >
            <Ionicons name="help-circle-outline" size={20} color={theme.accent} />
            <Text style={[styles.supportButtonText, { color: theme.accent }]}>
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  // Upgrade screen styles
  upgradeHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  upgradeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  upgradeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  planCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  popularPlan: {
    borderWidth: 2,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  planSavings: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  planDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  planButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  planButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  fallbackLink: {
    paddingVertical: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  featuresCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 15,
    lineHeight: 22,
  },
  // Active subscription styles
  activeCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activeTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  subscriptionDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailColumn: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  managementCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  managementTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  managementDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  portalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  portalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  supportCard: {
    padding: 20,
    borderRadius: 16,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  supportDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});