// Personal Data Storage - Secure & Local Only
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { PersonalInfo, AstrologyData } from './astrology';
import { computeAstrologyData } from './astrology';

// Re-export types for convenience
export type { PersonalInfo, AstrologyData };

const PERSONAL_INFO_KEY = '@rooted_personal_info';
const ASTROLOGY_CACHE_KEY = '@rooted_astrology_cache';

/**
 * Store personal information securely
 * firstName goes to preferences, birth details to secure storage
 */
export async function storePersonalInfo(personalInfo: PersonalInfo): Promise<void> {
  try {
    // Store firstName in regular preferences (as specified)
    const { getUserPreferences, updateUserPreferences } = await import('./storage');
    await updateUserPreferences({ firstName: personalInfo.firstName });
    
    // Store birth details securely if provided
    if (personalInfo.birthDate || personalInfo.birthTime || personalInfo.birthPlace) {
      const birthData = {
        birthDate: personalInfo.birthDate,
        birthTime: personalInfo.birthTime,
        birthPlace: personalInfo.birthPlace,
        timezone: personalInfo.timezone,
        unknownTime: personalInfo.unknownTime,
      };
      
      const data = JSON.stringify(birthData);
      
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(PERSONAL_INFO_KEY, data);
      } else {
        await SecureStore.setItemAsync(PERSONAL_INFO_KEY, data);
      }
    }
    
    // Compute and cache astrology data if birth date provided
    if (personalInfo.birthDate) {
      const astrologyData = computeAstrologyData(personalInfo);
      if (astrologyData) {
        await cacheAstrologyData(astrologyData);
      }
    }
    
    console.log('✅ Personal info stored securely');
  } catch (error) {
    console.error('❌ Error storing personal info:', error);
    throw error;
  }
}

/**
 * Get personal information from both preferences and secure storage
 */
export async function getPersonalInfo(): Promise<PersonalInfo | null> {
  try {
    // Get firstName from preferences
    const { getUserPreferences } = await import('./storage');
    const prefs = await getUserPreferences();
    const firstName = prefs.firstName || '';
    
    // Get birth details from secure storage
    let birthData: any = {};
    
    if (Platform.OS === 'web') {
      const data = await AsyncStorage.getItem(PERSONAL_INFO_KEY);
      if (data) {
        birthData = JSON.parse(data);
      }
    } else {
      const data = await SecureStore.getItemAsync(PERSONAL_INFO_KEY);
      if (data) {
        birthData = JSON.parse(data);
      }
    }
    
    // Return complete PersonalInfo object
    return {
      firstName,
      birthDate: birthData.birthDate || undefined,
      birthTime: birthData.birthTime || undefined,
      birthPlace: birthData.birthPlace || undefined,
      timezone: birthData.timezone || undefined,
      unknownTime: birthData.unknownTime || false,
    };
  } catch (error) {
    console.error('❌ Error getting personal info:', error);
    return null;
  }
}

/**
 * Cache astrology data locally
 */
export async function cacheAstrologyData(astrologyData: AstrologyData): Promise<void> {
  try {
    const cacheData = {
      ...astrologyData,
      cachedAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(ASTROLOGY_CACHE_KEY, JSON.stringify(cacheData));
    console.log('✅ Astrology data cached');
  } catch (error) {
    console.error('❌ Error caching astrology data:', error);
  }
}

/**
 * Get cached astrology data
 */
export async function getCachedAstrologyData(): Promise<AstrologyData | null> {
  try {
    const cached = await AsyncStorage.getItem(ASTROLOGY_CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    
    // Check if cache is still valid (24 hours)
    const cachedAt = new Date(data.cachedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      // Cache expired - moon phase changes
      await AsyncStorage.removeItem(ASTROLOGY_CACHE_KEY);
      return null;
    }
    
    return {
      sunSign: data.sunSign,
      moonSign: data.moonSign,
      moonPhase: data.moonPhase,
      isMoonApprox: data.isMoonApprox,
    };
  } catch (error) {
    console.error('❌ Error getting cached astrology data:', error);
    return null;
  }
}

/**
 * Clear all personal data (for settings/privacy)
 */
export async function clearPersonalData(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(PERSONAL_INFO_KEY);
    } else {
      await SecureStore.deleteItemAsync(PERSONAL_INFO_KEY);
    }
    
    await AsyncStorage.removeItem(ASTROLOGY_CACHE_KEY);
    
    console.log('✅ Personal data cleared');
  } catch (error) {
    console.error('❌ Error clearing personal data:', error);
    throw error;
  }
}

/**
 * Get current astrology data (from cache or compute fresh)
 */
export async function getCurrentAstrologyData(): Promise<AstrologyData | null> {
  try {
    // Try cache first
    let astrologyData = await getCachedAstrologyData();
    
    if (!astrologyData) {
      // Compute fresh if no cache
      const personalInfo = await getPersonalInfo();
      if (personalInfo) {
        astrologyData = computeAstrologyData(personalInfo);
        if (astrologyData) {
          await cacheAstrologyData(astrologyData);
        }
      }
    }
    
    return astrologyData;
  } catch (error) {
    console.error('❌ Error getting current astrology data:', error);
    return null;
  }
}