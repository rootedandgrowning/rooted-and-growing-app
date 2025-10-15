// Admin Panel - Override Weekly Card

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getSeasonalTheme } from '../constants/theme';
import { ORACLE_CARDS } from '../constants/cards';
import { BackHeader } from '../components/BackHeader';
import Constants from 'expo-constants';
import { updateUserPreferences, clearAllData, setLastDrawDate, setLastDrawnCard } from '../utils/storage';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

// Platform-specific alert
const showAlert = (message: string) => {
  if (Platform.OS === 'web') {
    alert(message);
  } else {
    Alert.alert('Admin Panel', message);
  }
};

export default function AdminPanel() {
  const router = useRouter();
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const theme = getSeasonalTheme();

  const [currentWeeklyCard, setCurrentWeeklyCard] = useState<any>(null);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [reflection, setReflection] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Check if user is admin
    if (!user?.is_admin) {
      showAlert('Access Denied: Admin privileges required');
      router.replace('/(tabs)/more');
      return;
    }

    loadCurrentWeeklyCard();
  }, [user, authLoading]);

  const loadCurrentWeeklyCard = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/weekly-card`);
      if (response.ok) {
        const data = await response.json();
        setCurrentWeeklyCard(data);
        setSelectedCardId(data.card_id);
        setReflection(data.reflection);
      }
    } catch (error) {
      console.error('Error loading weekly card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDailyDraw = async () => {
    const confirmed = confirm('Reset Daily Draw?\n\nThis will clear today\'s draw so you can test the shuffle again. Journal entries will not be affected.');
    if (confirmed) {
      try {
        // Reset daily draw data using our storage utility functions
        await setLastDrawDate('');
        await setLastDrawnCard('');
        alert('Success! 🌿 Daily draw has been reset. Navigate to Daily Draw tab to shuffle again.');
      } catch (error) {
        console.error('Error resetting daily draw:', error);
        alert('Error: Could not reset daily draw. Please try again.');
      }
    }
  };

  const handleResetOnboarding = async () => {
    console.log('🔄 [Admin] handleResetOnboarding called');
    const confirmed = confirm('Reset Onboarding?\n\nThis will clear the onboarding completion flag so you can test the onboarding flow again. You will be redirected to the onboarding screen.');
    console.log(`🔄 [Admin] User confirmed: ${confirmed}`);
    
    if (confirmed) {
      try {
        console.log('🔄 [Admin] Resetting onboarding...');
        // Reset onboarding completion flag
        await updateUserPreferences({
          onboardingComplete: false,
          onboardingData: undefined
        });
        console.log('✅ [Admin] Onboarding reset successfully');
        alert('Success! 🌿 Onboarding has been reset. Redirecting to onboarding...');
        
        // Redirect to onboarding
        console.log('🔄 [Admin] Redirecting to /onboarding');
        router.replace('/onboarding');
      } catch (error) {
        console.error('❌ [Admin] Error resetting onboarding:', error);
        alert('Error: Could not reset onboarding. Please try again.');
      }
    }
  };

  const handleClearData = () => {
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
        alert('Error: Could not clear all data. Please try again.');
      }
    }
  };

  const handleOverride = async () => {
    if (!selectedCardId || !reflection.trim()) {
      setSaveError('Please select a card and enter a reflection');
      return;
    }

    setSaveSuccess(false);
    setSaveError(null);
    setIsSaving(true);

    try {
      console.log('🔄 Saving weekly card:', { selectedCardId, reflection: reflection.trim(), token: token ? 'present' : 'missing' });
      
      const response = await fetch(`${BACKEND_URL}/api/admin/weekly-card/override`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_id: selectedCardId,
          reflection: reflection.trim(),
        }),
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success:', data);
        setSaveSuccess(true);
        setSaveError(null);
        loadCurrentWeeklyCard();
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const error = await response.json();
        console.error('❌ Error response:', error);
        setSaveError(error.detail || 'Could not update weekly card');
      }
    } catch (error) {
      console.error('❌ Exception:', error);
      setSaveError('Error: Could not connect to server');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(tabs)/home');
  };

  // handleBack function removed - BackHeader component handles navigation

  if (isLoading) {
    return (
      <LinearGradient colors={[theme.background.start, theme.background.end]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ActivityIndicator size="large" color={theme.accent} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[theme.background.start, theme.background.end]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <BackHeader 
          title="Admin Panel" 
          theme={theme}
          rightButton={
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          }
        />

        <ScrollView style={styles.content}>
          {/* Current Weekly Card */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Current Weekly Card
            </Text>
            {currentWeeklyCard && (
              <View style={[styles.currentCard, { backgroundColor: theme.accent + '20', borderColor: theme.accent }]}>
                <Text style={[styles.currentCardTitle, { color: theme.textPrimary }]}>
                  {ORACLE_CARDS.find(c => c.id === currentWeeklyCard.card_id)?.title || currentWeeklyCard.card_id}
                </Text>
                <Text style={[styles.currentCardReflection, { color: theme.textSecondary }]}>
                  {currentWeeklyCard.reflection}
                </Text>
              </View>
            )}
          </View>

          {/* Override Weekly Card */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Override Weekly Card
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Select a new card and write a custom reflection for this week
            </Text>

            {/* Card Selector */}
            <Text style={[styles.label, { color: theme.textPrimary }]}>Select Card:</Text>
            <Text style={[styles.helperText, { color: theme.textSecondary }]}>
              Scroll to see all 44 cards
            </Text>
            <ScrollView 
              style={styles.cardScrollContainer}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.cardGrid}>
                {ORACLE_CARDS.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.cardOption,
                      {
                        backgroundColor: selectedCardId === card.id ? theme.accent : theme.cardBackground,
                        borderColor: theme.accent,
                      },
                    ]}
                    onPress={() => setSelectedCardId(card.id)}
                  >
                    <Text
                      style={[
                        styles.cardOptionText,
                        { color: selectedCardId === card.id ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {card.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Reflection Input */}
            <Text style={[styles.label, { color: theme.textPrimary }]}>Custom Reflection:</Text>
            <TextInput
              style={[styles.reflectionInput, { color: theme.textPrimary, borderColor: theme.accent, backgroundColor: theme.cardBackground }]}
              placeholder="Write your reflection for the community..."
              placeholderTextColor={theme.textSecondary}
              value={reflection}
              onChangeText={setReflection}
              multiline
              numberOfLines={6}
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.accent }]}
              onPress={handleOverride}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Set Weekly Card</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Success Message */}
            {saveSuccess && (
              <View style={[styles.feedbackBox, styles.successBox]}>
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                <Text style={styles.successText}>Weekly card updated successfully! 🌿</Text>
              </View>
            )}

            {/* Error Message */}
            {saveError && (
              <View style={[styles.feedbackBox, styles.errorBox]}>
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
                <Text style={styles.errorText}>{saveError}</Text>
              </View>
            )}
          </View>

          {/* Developer Tools */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Developer Tools
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Testing and debugging utilities
            </Text>

            <TouchableOpacity
              style={[styles.adminButton, styles.secondaryButton, { borderColor: theme.accent }]}
              onPress={() => {
                console.log('🔄 [Admin] Reset Onboarding button pressed');
                handleResetOnboarding();
              }}
              accessibilityLabel="Reset onboarding for testing"
              accessibilityRole="button"
            >
              <Ionicons name="refresh-outline" size={20} color={theme.accent} />
              <Text style={[styles.adminButtonText, { color: theme.accent }]}>
                Reset Onboarding (Testing)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminButton, styles.secondaryButton, { borderColor: theme.accent }]}
              onPress={handleResetDailyDraw}
            >
              <Ionicons name="shuffle-outline" size={20} color={theme.accent} />
              <Text style={[styles.adminButtonText, { color: theme.accent }]}>
                Reset Daily Draw
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminButton, styles.secondaryButton, { borderColor: theme.accent }]}
              onPress={handleClearData}
            >
              <Ionicons name="trash-outline" size={20} color={theme.accent} />
              <Text style={[styles.adminButtonText, { color: theme.accent }]}>
                Clear All Data
              </Text>
            </TouchableOpacity>
          </View>

          {/* Box Circle Administration section removed - moved to More tab */}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // Removed unused header styles - using BackHeader component
  content: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  currentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  currentCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  currentCardReflection: {
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  cardScrollContainer: {
    maxHeight: 300,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  cardOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reflectionInput: {
    minHeight: 120,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  successBox: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  successText: {
    color: '#15803d',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
