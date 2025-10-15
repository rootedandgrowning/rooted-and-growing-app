// Saved Spreads Storage Utilities
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_SPREADS_KEY = '@rooted_saved_spreads';

export interface SavedSpread {
  id: string;
  type: 'three-card' | 'seasonal' | 'growth';
  cards: {
    card: any;
    position: string;
  }[];
  aiInterpretation: string;
  journalEntry?: string;
  savedAt: string;
  title?: string;
}

/**
 * Get all saved spreads
 */
export async function getSavedSpreads(): Promise<SavedSpread[]> {
  try {
    const spreadsJson = await AsyncStorage.getItem(SAVED_SPREADS_KEY);
    if (!spreadsJson) return [];
    return JSON.parse(spreadsJson);
  } catch (error) {
    console.error('Error reading saved spreads:', error);
    return [];
  }
}

/**
 * Save a new spread
 */
export async function saveSpread(spread: Omit<SavedSpread, 'id' | 'savedAt'>): Promise<SavedSpread> {
  try {
    const spreads = await getSavedSpreads();
    
    const newSpread: SavedSpread = {
      ...spread,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
    };

    spreads.unshift(newSpread); // Add to beginning
    await AsyncStorage.setItem(SAVED_SPREADS_KEY, JSON.stringify(spreads));
    
    console.log('✅ Spread saved successfully');
    return newSpread;
  } catch (error) {
    console.error('Error saving spread:', error);
    throw error;
  }
}

/**
 * Update journal entry for a saved spread
 */
export async function updateSpreadJournal(spreadId: string, journalEntry: string): Promise<void> {
  try {
    const spreads = await getSavedSpreads();
    const spreadIndex = spreads.findIndex(s => s.id === spreadId);
    
    if (spreadIndex === -1) {
      throw new Error('Spread not found');
    }

    spreads[spreadIndex].journalEntry = journalEntry;
    await AsyncStorage.setItem(SAVED_SPREADS_KEY, JSON.stringify(spreads));
    
    console.log('✅ Spread journal updated');
  } catch (error) {
    console.error('Error updating spread journal:', error);
    throw error;
  }
}

/**
 * Delete a saved spread
 */
export async function deleteSpread(spreadId: string): Promise<void> {
  try {
    console.log('🗑️ deleteSpread called with ID:', spreadId);
    const spreads = await getSavedSpreads();
    console.log('📋 Current spreads before deletion:', spreads.length);
    
    const filteredSpreads = spreads.filter(s => s.id !== spreadId);
    console.log('📋 Spreads after filtering:', filteredSpreads.length);
    
    await AsyncStorage.setItem(SAVED_SPREADS_KEY, JSON.stringify(filteredSpreads));
    
    console.log('✅ Spread deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting spread:', error);
    throw error;
  }
}

/**
 * Get a single spread by ID
 */
export async function getSpreadById(spreadId: string): Promise<SavedSpread | null> {
  try {
    const spreads = await getSavedSpreads();
    return spreads.find(s => s.id === spreadId) || null;
  } catch (error) {
    console.error('Error getting spread:', error);
    return null;
  }
}
