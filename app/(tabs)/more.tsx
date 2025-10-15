// More / Settings Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getSeasonalTheme } from '../../constants/theme';
import { getFeatureFlags, clearAllData, FeatureFlags, setLastDrawDate, setLastDrawnCard, storage } from '../../utils/storage';
import { logUpgradeCTATapped } from '../../utils/analytics';
import { isAppleSubmissionMode } from '../../utils/featureFlags';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function MoreScreen() {
  const theme = getSeasonalTheme();
  const router = useRouter();
  const { user, logout, token } = useAuth();
  const { subscription, isPremium, loading: subLoading } = useSubscription();
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);

  useEffect(() => {
    loadFeatureFlags();
  }, [user, isPremium]); // Re-run when user or premium status changes

  const loadFeatureFlags = async () => {
    const flags = await getFeatureFlags();
    
    // If user is admin or has premium subscription, enable all features
    const isUserPremium = isPremium || user?.is_admin;
    
    const enhancedFlags: FeatureFlags = {
      ...flags,
      isPremium: isUserPremium,
      features: {
        fullDeck: isUserPremium,
        spreads: isUserPremium,
        expandedJournal: isUserPremium,
        monthlyRitual: isUserPremium,
      },
    };
    
    setFeatureFlags(enhancedFlags);
  };

  const handleResetDailyDraw = async () => {
    Alert.alert(
      'Reset Daily Draw?',
      'This will clear today\'s draw so you can test the shuffle again. Journal entries will not be affected.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              // Reset daily draw data using our storage utility functions
              await setLastDrawDate('');
              await setLastDrawnCard('');
              Alert.alert('Success! 🌿', 'Daily draw has been reset. Navigate to Daily Draw tab to shuffle again.');
            } catch (error) {
              console.error('Error resetting daily draw:', error);
              Alert.alert('Error', 'Could not reset daily draw. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding? 🌱',
      'This will reset the onboarding flow for testing. The app will redirect to onboarding on next reload.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset for Testing',
          onPress: async () => {
            try {
              await updateUserPreferences({
                onboardingComplete: false,
                onboardingData: undefined,
              });
              Alert.alert('Success! 🌿', 'Onboarding reset complete. Reload the app to see the onboarding flow.');
            } catch (error) {
              console.error('Error resetting onboarding:', error);
              Alert.alert('Error', 'Failed to reset onboarding');
            }
          }
        }
      ]
    );
  };

  const handleManageSubscription = () => {
    // Redirect to dedicated manage subscription page
    router.push('/manage-subscription');
  };

  const handleClearData = async () => {
    if (Platform.OS === 'web') {
      const confirmed = confirm('Clear All Data?\n\nThis will delete all journal entries, preferences, and reset the app to its initial state. This action cannot be undone.');
      if (confirmed) {
        try {
          // Clear localStorage
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('@')) {
              keysToRemove.push(key);
            }
          }
          
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          // Sign out user
          logout();
          
          alert('Success! 🌿 All data has been cleared. The app has been reset to its initial state.');
          
          // Reload page to reset state
          window.location.reload();
        } catch (error) {
          console.error('Error clearing data:', error);
          alert('Error clearing data. Please try again.');
        }
      }
    } else {
      // Mobile version using Alert.alert
      Alert.alert(
        'Clear All Data',
        'This will delete all journal entries, preferences, and reset the app to its initial state. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: async () => {
              try {
                // Clear AsyncStorage
                const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                const keys = await AsyncStorage.getAllKeys();
                const rootedKeys = keys.filter(key => key.startsWith('@'));
                await AsyncStorage.multiRemove(rootedKeys);
                
                // Sign out user
                await logout();
                
                Alert.alert('Success! 🌿', 'All data has been cleared. The app has been reset to its initial state.');
              } catch (error) {
                console.error('Error clearing data:', error);
                Alert.alert('Error', 'Could not clear data. Please try again.');
              }
            }
          }
        ]
      );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleSignOut = async () => {
    await logout();
    Alert.alert('Success! 🌿', 'Signed out successfully');
  };

  const handleResetDraw = () => {
    const confirmed = confirm('Reset Daily Draw?\n\nThis will allow you to draw a new daily card. Your previous draw will be cleared.');
    if (confirmed) {
      try {
        // Clear the daily draw data
        localStorage.removeItem('@daily_draw_date');
        localStorage.removeItem('@daily_card');
        alert('Success! 🌿 Daily draw has been reset. You can now draw a new card.');
      } catch (error) {
        console.error('Error clearing daily draw:', error);
        alert('Error: Failed to reset daily draw');
      }
    }
  };

  const MenuItem = ({
    icon,
    title,
    subtitle,
    locked = false,
    onPress,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    locked?: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
      disabled={locked}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconCircle, { backgroundColor: theme.background.end }]}>
          <Ionicons name={icon as any} size={24} color={theme.accent} />
        </View>
        <View style={styles.menuItemText}>
          <Text style={[styles.menuItemTitle, { color: theme.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.menuItemSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {locked ? (
        <Ionicons name="lock-closed" size={20} color={theme.textSecondary} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[theme.background.start, theme.background.end]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>More</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Settings & Features
          </Text>
        </View>

        {/* User Info Section */}
        {user && (
          <View style={[styles.userCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.userHeader}>
              <View style={[styles.userAvatar, { backgroundColor: theme.accent }]}>
                <Text style={styles.userAvatarText}>
                  {user.email.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.textPrimary }]}>
                  {user.email}
                </Text>
                {user.is_admin && (
                  <View style={styles.adminBadge}>
                    <Ionicons name="shield-checkmark" size={14} color="#FFD700" />
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Membership Status Card */}
        {user && (
          <View style={[styles.membershipCard, { backgroundColor: theme.cardBackground }]}>
            {subLoading ? (
              <ActivityIndicator size="small" color={theme.accent} />
            ) : isPremium ? (
              // Premium Member View (includes admin access)
              <>
                <View style={styles.membershipHeader}>
                  <View style={[styles.premiumBadge, { backgroundColor: theme.accent }]}>
                    <Ionicons name="sparkles" size={20} color="#fff" />
                  </View>
                  <View style={styles.membershipInfo}>
                    <Text style={[styles.membershipTitle, { color: theme.textPrimary }]}>
                      {user?.is_admin && !subscription ? 'Admin Access' : 'Rooted & Growing +'}
                    </Text>
                    <Text style={[styles.membershipSubtitle, { color: theme.textSecondary }]}>
                      {user?.is_admin && !subscription 
                        ? 'Full premium access for testing'
                        : `${subscription?.plan_type === 'annual' ? 'Annual' : 'Monthly'} • Founding Price`
                      }
                    </Text>
                  </View>
                </View>

                {/* Billing Info */}
                {subscription.current_period_end && (
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
                    <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                      Renews {formatDate(subscription.current_period_end)}
                    </Text>
                  </View>
                )}

                {/* Shipping Address */}
                {subscription.shipping_address && (
                  <View style={styles.shippingSection}>
                    <Text style={[styles.shippingTitle, { color: theme.textPrimary }]}>
                      Tea & Tincture Delivery
                    </Text>
                    <Text style={[styles.shippingAddress, { color: theme.textSecondary }]}>
                      {subscription.shipping_address.name}
                      {'\n'}
                      {subscription.shipping_address.line1}
                      {subscription.shipping_address.line2 && `\n${subscription.shipping_address.line2}`}
                      {'\n'}
                      {subscription.shipping_address.city}, {subscription.shipping_address.state} {subscription.shipping_address.postal_code}
                    </Text>
                  </View>
                )}

                {/* Manage Subscription Button - Hidden in Apple submission mode */}
                {!isAppleSubmissionMode() && (
                  <TouchableOpacity
                    style={[styles.manageButton, { borderColor: theme.accent }]}
                    onPress={handleManageSubscription}
                  >
                    <>
                      <Ionicons name="settings-outline" size={18} color={theme.accent} />
                      <Text style={[styles.manageButtonText, { color: theme.accent }]}>
                        Manage Subscription
                      </Text>
                      <Ionicons name="open-outline" size={16} color={theme.accent} />
                    </>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              // Free User View
              <>
                <View style={styles.membershipHeader}>
                  <Ionicons name="leaf-outline" size={32} color={theme.accent} />
                  <View style={styles.membershipInfo}>
                    <Text style={[styles.membershipTitle, { color: theme.textPrimary }]}>
                      Free Version
                    </Text>
                    <Text style={[styles.membershipSubtitle, { color: theme.textSecondary }]}>
                      12 cards • 1 meditation
                    </Text>
                  </View>
                </View>

                <Text style={[styles.upgradeText, { color: theme.textSecondary }]}>
                  Unlock all 44 cards, premium meditations, monthly rituals, and your Tea & Tincture subscription
                </Text>

                <TouchableOpacity
                  style={[styles.upgradeButton, { backgroundColor: theme.accent }]}
                  onPress={() => router.push('/upgrade')}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade to Rooted & Growing +</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Not Logged In View */}
        {!user && (
          <View style={[styles.loginCard, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="person-circle-outline" size={48} color={theme.accent} />
            <Text style={[styles.loginTitle, { color: theme.textPrimary }]}>
              Sign In to Continue
            </Text>
            <Text style={[styles.loginText, { color: theme.textSecondary }]}>
              Access your account to manage subscriptions and save your progress
            </Text>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: theme.accent }]}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Premium Features Section */}
        <View style={styles.section}>
          {(!isAppleSubmissionMode() || Platform.OS === 'web') && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                PREMIUM FEATURES
              </Text>
              
              <MenuItem
                icon="grid"
                title="Card Spreads"
                subtitle="3-card and seasonal spreads"
                locked={!featureFlags?.features.spreads}
                onPress={() =>
                  featureFlags?.features.spreads
                    ? router.push('/spreads')
                    : Alert.alert('Locked', 'Subscribe to unlock')
                }
              />
            </>
          )}

          <MenuItem
            icon="bookmark"
            title="Saved Spreads"
            subtitle="Review your saved readings"
            onPress={() => router.push('/saved-spreads')}
          />

          <MenuItem
            icon="person"
            title="Profile"
            subtitle="Personalization & cosmic blueprint"
            onPress={() => router.push('/profile')}
          />

          <MenuItem
            icon="flower"
            title="Monthly Ritual"
            subtitle="Exclusive ritual with your box"
            locked={!featureFlags?.features.monthlyRitual}
            onPress={() =>
              featureFlags?.features.monthlyRitual
                ? router.push('/ritual')
                : Alert.alert('Locked', 'Subscribe to unlock')
            }
          />

          <MenuItem
            icon="people"
            title="Box Circle"
            subtitle="Monthly Tea & Tincture discussions"
            locked={!featureFlags?.features.monthlyRitual && !user?.is_admin}
            onPress={() =>
              featureFlags?.features.monthlyRitual || user?.is_admin
                ? router.push('/box-circle')
                : Alert.alert('Locked', 'Subscribe to Rooted & Growing + to unlock Box Circle')
            }
          />
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            SETTINGS
          </Text>

          <MenuItem
            icon="notifications"
            title="Notifications"
            subtitle="Daily and weekly reminders"
            onPress={() => router.push('/notifications')}
          />

          <MenuItem
            icon="color-palette"
            title="Seasonal Theme"
            subtitle={`Currently: ${theme.name}`}
            onPress={() => router.push('/seasonal-theme')}
          />

          <MenuItem
            icon="qr-code"
            title="Scan QR Code"
            subtitle="Unlock premium features"
            onPress={() => Alert.alert('QR Scanner', 'Coming soon!')}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            ABOUT
          </Text>

          <MenuItem
            icon="information-circle"
            title="About & Privacy"
            onPress={() => router.push('/about')}
          />

          <MenuItem
            icon="help-circle"
            title="Help & Support"
            onPress={() => router.push('/help')}
          />
        </View>

        {/* Testing Tools Section - Admin Only */}
        {user?.is_admin && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              TESTING TOOLS
            </Text>
            
            <MenuItem
              icon="refresh-outline"
              title="Reset Onboarding"
              subtitle="Clear onboarding state to test welcome screen"
              onPress={() => {
                try {
                  if (typeof window !== 'undefined' && window.localStorage) {
                    const confirmed = confirm('Reset onboarding? This will clear your onboarding state so you can test the welcome screen again.');
                    if (confirmed) {
                      window.localStorage.removeItem('@rooted_user_preferences');
                      alert('✅ Onboarding reset complete! Refresh the page to see the welcome screen.');
                    }
                  }
                } catch (error) {
                  console.error('Reset error:', error);
                  alert('Error resetting onboarding. Please try again.');
                }
              }}
            />

            <MenuItem
              icon="sparkles"
              title="🧪 Test New Shuffle"
              subtitle="Preview Base44-style shuffle experience"
              onPress={() => router.push('/shuffle-test')}
            />
            
            <Text style={[styles.debugHint, { color: theme.textSecondary }]}>
              After reset, refresh the page to see onboarding again
            </Text>
          </View>
        )}

        {/* Account Section */}
        {user && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              ACCOUNT
            </Text>

            <MenuItem
              icon="log-out"
              title="Sign Out"
              subtitle="Sign out of your account"
              onPress={handleSignOut}
            />
          </View>
        )}

        {/* Admin Tools - Only visible to admin users */}
        {user?.is_admin && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              ADMIN TOOLS
            </Text>

            <MenuItem
              icon="shield-checkmark"
              title="Admin Panel"
              subtitle="Manage weekly cards and content"
              onPress={() => router.push('/admin')}
            />

            <MenuItem
              icon="shield-checkmark"
              title="Box Circle Moderation"
              subtitle="Manage posts and moderate community"
              onPress={() => Alert.alert(
                'Box Circle Moderation',
                'Admin moderation dashboard coming soon! For now, you can view and participate in Box Circle like a regular user.',
                [
                  { text: 'View Box Circle', onPress: () => router.push('/box-circle') },
                  { text: 'OK', style: 'cancel' }
                ]
              )}
            />

            <MenuItem
              icon="refresh"
              title="Reset Daily Draw"
              subtitle="Clear today's card draw"
              onPress={handleResetDraw}
            />

            <MenuItem
              icon="trash"
              title="Clear All Data"
              subtitle="Reset app to default state"
              onPress={handleClearData}
            />
          </View>
        )}

        {/* Duplicate sign-in section removed - keeping only the prominent card above */}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Version 1.0.0 (Phase 1 MVP)
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  premiumCard: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  premiumText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // User Card Styles
  userCard: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adminBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  // Membership Card Styles
  membershipCard: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membershipInfo: {
    marginLeft: 12,
    flex: 1,
  },
  membershipTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  membershipSubtitle: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  shippingSection: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  shippingTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  shippingAddress: {
    fontSize: 13,
    lineHeight: 18,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 8,
  },
  manageButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  upgradeText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  // Login Card Styles
  loginCard: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  loginText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 24,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
  },
  debugResetText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 24,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  debugHint: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
});
