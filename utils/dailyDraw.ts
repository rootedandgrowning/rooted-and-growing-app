// Daily Draw Persistence - Handle onboarding draw as daily draw
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_DRAW_KEY = '@rooted_daily_draw';

export interface DailyDraw {
  cardId: string;
  drawnAtISO: string;
  source: 'onboarding' | 'daily';
}

/**
 * Store today's daily draw
 */
export async function storeDailyDraw(cardId: string, source: 'onboarding' | 'daily' = 'daily'): Promise<void> {
  try {
    const dailyDraw: DailyDraw = {
      cardId,
      drawnAtISO: new Date().toISOString(),
      source,
    };
    
    await AsyncStorage.setItem(DAILY_DRAW_KEY, JSON.stringify(dailyDraw));
    console.log('✅ Daily draw stored:', dailyDraw);
  } catch (error) {
    console.error('❌ Error storing daily draw:', error);
    throw error;
  }
}

/**
 * Get today's daily draw if available
 */
export async function getTodaysDailyDraw(): Promise<DailyDraw | null> {
  try {
    const stored = await AsyncStorage.getItem(DAILY_DRAW_KEY);
    if (!stored) return null;
    
    const dailyDraw: DailyDraw = JSON.parse(stored);
    
    // Check if it's from today
    const drawnDate = new Date(dailyDraw.drawnAtISO);
    const today = new Date();
    
    if (
      drawnDate.getFullYear() === today.getFullYear() &&
      drawnDate.getMonth() === today.getMonth() &&
      drawnDate.getDate() === today.getDate()
    ) {
      return dailyDraw;
    }
    
    // Old draw - remove it
    await AsyncStorage.removeItem(DAILY_DRAW_KEY);
    return null;
  } catch (error) {
    console.error('❌ Error getting daily draw:', error);
    return null;
  }
}

/**
 * Check if user can draw today
 */
export async function canDrawToday(): Promise<boolean> {
  const todaysDraw = await getTodaysDailyDraw();
  return todaysDraw === null;
}

/**
 * Clear daily draw (for testing)
 */
export async function clearDailyDraw(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DAILY_DRAW_KEY);
    console.log('✅ Daily draw cleared');
  } catch (error) {
    console.error('❌ Error clearing daily draw:', error);
  }
}