// Local Storage Utilities for Journal, Preferences, and Feature Flags

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Web-compatible storage utility
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        return localStorage.getItem(key);
      } else {
        // Try SecureStore first, fall back to AsyncStorage for mobile
        try {
          return await SecureStore.getItemAsync(key);
        } catch {
          return await AsyncStorage.getItem(key);
        }
      }
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      console.log(`💾 [Storage] setItem called - key: ${key}, value length: ${value.length}`);
      if (Platform.OS === 'web') {
        // Use localStorage for web
        console.log('💾 [Storage] Using localStorage (web platform)');
        localStorage.setItem(key, value);
        console.log('✅ [Storage] localStorage.setItem successful');
        
        // Verify it was saved
        const verification = localStorage.getItem(key);
        if (verification === value) {
          console.log('✅ [Storage] Verification successful - data persisted');
        } else {
          console.error('❌ [Storage] Verification FAILED - data not persisted correctly!');
        }
      } else {
        // Try SecureStore first, fall back to AsyncStorage for mobile
        console.log('💾 [Storage] Using SecureStore/AsyncStorage (native platform)');
        try {
          await SecureStore.setItemAsync(key, value);
        } catch {
          await AsyncStorage.setItem(key, value);
        }
      }
    } catch (error) {
      console.error('❌ [Storage] setItem error:', error);
      throw error;
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.removeItem(key);
      } else {
        // Try SecureStore first, fall back to AsyncStorage for mobile
        try {
          await SecureStore.deleteItemAsync(key);
        } catch {
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
      throw error;
    }
  }
};

// Storage Keys
const KEYS = {
  JOURNAL_ENTRIES: '@rooted_journal_entries',
  USER_PREFERENCES: '@rooted_user_preferences',
  FEATURE_FLAGS: '@rooted_feature_flags',
  LAST_DRAW_DATE: '@rooted_last_draw_date',
  LAST_DRAWN_CARD: '@rooted_last_drawn_card',
};

// Types
export interface JournalEntry {
  id: string;
  dateISO: string;
  cardId: string;
  cardTitle: string;
  journalText: string;
  promptUsed: string;
  createdAt: number;
  moods?: string[]; // Array of mood emojis (max 2)
}

export interface UserPreferences {
  lastDrawDate: string | null;
  dailyReminderEnabled: boolean;
  weeklyReminderEnabled: boolean;
  onboardingComplete: boolean;
  seasonalTheme: 'spring' | 'summer' | 'autumn' | 'winter';
  // Personalization
  firstName?: string;
  personalizationEnabled?: boolean;
  // Onboarding data
  onboardingData?: {
    focus: string[];
    firstCardId: string;
    intention: string;
    reminderTime: string; // HH:mm format
    pushOptIn: boolean;
  };
  // Daily Streaks
  currentStreak?: number;
  longestStreak?: number;
  lastStreakDate?: string | null; // ISO date string
  forgivenessTokens?: number;
  lastSeasonForTokens?: string; // 'spring' | 'summer' | 'autumn' | 'winter'
}

export interface FeatureFlags {
  isPremium: boolean;
  unlockedDate: string | null;
  monthlyRitual: string | null; // e.g., "2025-10"
  features: {
    fullDeck: boolean;
    spreads: boolean;
    expandedJournal: boolean;
    monthlyRitual: boolean;
  };
}

// Journal Entry Functions
export const saveJournalEntry = async (entry: JournalEntry): Promise<void> => {
  try {
    const existingEntries = await getJournalEntries();
    const updatedEntries = [entry, ...existingEntries];
    await storage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
};

export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    const entries = await storage.getItem(KEYS.JOURNAL_ENTRIES);
    return entries ? JSON.parse(entries) : [];
  } catch (error) {
    console.error('Error getting journal entries:', error);
    return [];
  }
};

export const deleteJournalEntry = async (id: string): Promise<void> => {
  try {
    const entries = await getJournalEntries();
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    await storage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

// User Preferences Functions
export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    console.log('📖 [Storage] getUserPreferences called');
    const prefs = await storage.getItem(KEYS.USER_PREFERENCES);
    console.log('📖 [Storage] Raw preferences from storage:', prefs);
    if (prefs) {
      const parsed = JSON.parse(prefs);
      console.log('📖 [Storage] Parsed preferences:', parsed);
      return parsed;
    }
    // Default preferences for new users
    console.log('📖 [Storage] No preferences found, returning defaults');
    return {
      lastDrawDate: null,
      dailyReminderEnabled: false,
      weeklyReminderEnabled: false,
      onboardingComplete: false,
      seasonalTheme: 'autumn', // Default to current season
    };
  } catch (error) {
    console.error('❌ [Storage] Error getting user preferences:', error);
    return {
      lastDrawDate: null,
      dailyReminderEnabled: false,
      weeklyReminderEnabled: false,
      onboardingComplete: false,
      seasonalTheme: 'spring',
    };
  }
};

export const updateUserPreferences = async (
  updates: Partial<UserPreferences>
): Promise<void> => {
  try {
    console.log('📝 [Storage] updateUserPreferences called with:', updates);
    const currentPrefs = await getUserPreferences();
    console.log('📝 [Storage] Current preferences:', currentPrefs);
    const updatedPrefs = { ...currentPrefs, ...updates };
    console.log('📝 [Storage] Updated preferences to save:', updatedPrefs);
    await storage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(updatedPrefs));
    console.log('✅ [Storage] Preferences saved successfully');
    
    // Verify the save worked
    const verifyPrefs = await getUserPreferences();
    console.log('🔍 [Storage] Verification read:', verifyPrefs);
    if (verifyPrefs.onboardingComplete !== updatedPrefs.onboardingComplete) {
      console.error('❌ [Storage] Save verification FAILED - onboardingComplete mismatch!');
    }
  } catch (error) {
    console.error('❌ [Storage] Error updating user preferences:', error);
    throw error;
  }
};

// Feature Flags Functions
export const getFeatureFlags = async (): Promise<FeatureFlags> => {
  try {
    const flags = await storage.getItem(KEYS.FEATURE_FLAGS);
    if (flags) {
      return JSON.parse(flags);
    }
    // Default feature flags (free tier)
    return {
      isPremium: false,
      unlockedDate: null,
      monthlyRitual: null,
      features: {
        fullDeck: false,
        spreads: false,
        expandedJournal: false,
        monthlyRitual: false,
      },
    };
  } catch (error) {
    console.error('Error getting feature flags:', error);
    return {
      isPremium: false,
      unlockedDate: null,
      monthlyRitual: null,
      features: {
        fullDeck: false,
        spreads: false,
        expandedJournal: false,
        monthlyRitual: false,
      },
    };
  }
};

export const updateFeatureFlags = async (
  updates: Partial<FeatureFlags>
): Promise<void> => {
  try {
    const currentFlags = await getFeatureFlags();
    const updatedFlags = { ...currentFlags, ...updates };
    await storage.setItem(KEYS.FEATURE_FLAGS, JSON.stringify(updatedFlags));
  } catch (error) {
    console.error('Error updating feature flags:', error);
    throw error;
  }
};

// Daily Draw Functions
export const getLastDrawDate = async (): Promise<string | null> => {
  try {
    return await storage.getItem(KEYS.LAST_DRAW_DATE);
  } catch (error) {
    console.error('Error getting last draw date:', error);
    return null;
  }
};

export const setLastDrawDate = async (date: string): Promise<void> => {
  try {
    await storage.setItem(KEYS.LAST_DRAW_DATE, date);
  } catch (error) {
    console.error('Error setting last draw date:', error);
    throw error;
  }
};

export const getLastDrawnCard = async (): Promise<string | null> => {
  try {
    return await storage.getItem(KEYS.LAST_DRAWN_CARD);
  } catch (error) {
    console.error('Error getting last drawn card:', error);
    return null;
  }
};


// ===== DAILY STREAKS =====

// Helper to get current season
const getCurrentSeason = (): 'spring' | 'summer' | 'autumn' | 'winter' => {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';   // Mar-May
  if (month >= 5 && month <= 7) return 'summer';   // Jun-Aug
  if (month >= 8 && month <= 10) return 'autumn';  // Sep-Nov
  return 'winter';                                  // Dec-Feb
};

// Helper to get days between two dates
const getDaysBetween = (date1Str: string, date2Str: string): number => {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Update streak when user draws daily card
export const updateDailyStreak = async (): Promise<{
  currentStreak: number;
  forgivenessTokensUsed: number;
  forgivenessTokensRemaining: number;
}> => {
  try {
    console.log('🌱 [Streaks] Updating daily streak...');
    const prefs = await getUserPreferences();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const currentSeason = getCurrentSeason();
    
    // Initialize streak data if not present
    let currentStreak = prefs.currentStreak || 0;
    let longestStreak = prefs.longestStreak || 0;
    let lastStreakDate = prefs.lastStreakDate || null;
    let forgivenessTokens = prefs.forgivenessTokens !== undefined ? prefs.forgivenessTokens : 3;
    let lastSeasonForTokens = prefs.lastSeasonForTokens || currentSeason;
    
    console.log('🌱 [Streaks] Current state:', {
      currentStreak,
      lastStreakDate,
      forgivenessTokens,
      lastSeasonForTokens,
      currentSeason
    });
    
    // Check if season changed - reset forgiveness tokens
    if (lastSeasonForTokens !== currentSeason) {
      console.log(`🌱 [Streaks] Season changed from ${lastSeasonForTokens} to ${currentSeason} - resetting tokens`);
      forgivenessTokens = 3;
      lastSeasonForTokens = currentSeason;
    }
    
    let tokensUsed = 0;
    
    // If already drew today, no change
    if (lastStreakDate === today) {
      console.log('🌱 [Streaks] Already drew today - no change');
      return {
        currentStreak,
        forgivenessTokensUsed: 0,
        forgivenessTokensRemaining: forgivenessTokens
      };
    }
    
    // Calculate streak logic
    if (!lastStreakDate) {
      // First time drawing
      console.log('🌱 [Streaks] First draw - starting streak at 1');
      currentStreak = 1;
    } else {
      const daysSinceLastDraw = getDaysBetween(lastStreakDate, today);
      console.log(`🌱 [Streaks] Days since last draw: ${daysSinceLastDraw}`);
      
      if (daysSinceLastDraw === 1) {
        // Drew yesterday - increment streak
        currentStreak += 1;
        console.log(`🌱 [Streaks] Drew yesterday - streak now ${currentStreak}`);
      } else if (daysSinceLastDraw > 1) {
        // Missed day(s)
        const missedDays = daysSinceLastDraw - 1;
        console.log(`🌱 [Streaks] Missed ${missedDays} day(s)`);
        
        if (missedDays <= forgivenessTokens) {
          // Use forgiveness tokens to maintain streak
          tokensUsed = missedDays;
          forgivenessTokens -= missedDays;
          currentStreak += 1;
          console.log(`🌱 [Streaks] Used ${tokensUsed} forgiveness token(s) - streak maintained at ${currentStreak}`);
        } else {
          // Not enough tokens - streak breaks
          console.log(`🌱 [Streaks] Not enough tokens (have ${forgivenessTokens}, need ${missedDays}) - streak reset to 1`);
          currentStreak = 1;
        }
      }
    }
    
    // Update longest streak
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
      console.log(`🌱 [Streaks] New longest streak: ${longestStreak}!`);
    }
    
    // Save updated preferences
    await updateUserPreferences({
      currentStreak,
      longestStreak,
      lastStreakDate: today,
      forgivenessTokens,
      lastSeasonForTokens
    });
    
    console.log('✅ [Streaks] Streak updated successfully');
    
    return {
      currentStreak,
      forgivenessTokensUsed: tokensUsed,
      forgivenessTokensRemaining: forgivenessTokens
    };
  } catch (error) {
    console.error('❌ [Streaks] Error updating daily streak:', error);
    throw error;
  }
};

// Get current streak info (read-only)
export const getStreakInfo = async (): Promise<{
  currentStreak: number;
  longestStreak: number;
  forgivenessTokens: number;
}> => {
  try {
    const prefs = await getUserPreferences();
    const currentSeason = getCurrentSeason();
    
    let forgivenessTokens = prefs.forgivenessTokens !== undefined ? prefs.forgivenessTokens : 3;
    const lastSeasonForTokens = prefs.lastSeasonForTokens || currentSeason;
    
    // Check if season changed
    if (lastSeasonForTokens !== currentSeason) {
      forgivenessTokens = 3;
    }
    
    return {
      currentStreak: prefs.currentStreak || 0,
      longestStreak: prefs.longestStreak || 0,
      forgivenessTokens
    };
  } catch (error) {
    console.error('Error getting streak info:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      forgivenessTokens: 3
    };
  }
};

export const setLastDrawnCard = async (cardId: string): Promise<void> => {
  try {
    await storage.setItem(KEYS.LAST_DRAWN_CARD, cardId);
  } catch (error) {
    console.error('Error setting last drawn card:', error);
    throw error;
  }
};

// Check if user can draw today
export const canDrawToday = async (): Promise<boolean> => {
  try {
    const lastDrawDate = await getLastDrawDate();
    if (!lastDrawDate) return true;
    
    const today = new Date().toISOString().split('T')[0];
    return lastDrawDate !== today;
  } catch (error) {
    console.error('Error checking if can draw today:', error);
    return true;
  }
};

// Clear all data (for testing)
export const clearAllData = async (): Promise<void> => {
  try {
    // Clear all keys individually since we're using our custom storage utility
    await Promise.all(Object.values(KEYS).map(key => storage.removeItem(key)));
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};