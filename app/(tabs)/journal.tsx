// Journal Timeline Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { getSeasonalTheme } from '../../constants/theme';
import { getJournalEntries, deleteJournalEntry, JournalEntry } from '../../utils/storage';

export default function JournalScreen() {
  const router = useRouter();
  const theme = getSeasonalTheme();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      console.log('📖 [Journal] Loading entries...');
      const journalEntries = await getJournalEntries();
      console.log(`📖 [Journal] Loaded ${journalEntries.length} entries`);
      setEntries(journalEntries);
    } catch (error) {
      console.error('❌ [Journal] Error loading journal entries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEntries();
  };

  const handleDeleteEntry = async (entryId: string) => {
    console.log(`🗑️ [Journal] Delete requested for entry: ${entryId}`);
    
    try {
      // Show confirmation with Alert.alert for better mobile support
      if (Platform.OS === 'web') {
        const confirmed = window.confirm('Delete Entry?\n\nThis will permanently delete this journal entry.');
        if (!confirmed) {
          console.log('🗑️ [Journal] User cancelled deletion');
          return;
        }
      } else {
        // For native mobile, use Alert.alert
        await new Promise<void>((resolve, reject) => {
          Alert.alert(
            'Delete Entry?',
            'This will permanently delete this journal entry.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  console.log('🗑️ [Journal] User cancelled deletion');
                  reject();
                }
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  console.log('🗑️ [Journal] User confirmed deletion');
                  resolve();
                }
              }
            ]
          );
        }).catch(() => {
          // User cancelled
          return;
        });
      }
      
      console.log(`🗑️ [Journal] Deleting entry ${entryId}...`);
      await deleteJournalEntry(entryId);
      console.log('✅ [Journal] Entry deleted successfully');
      
      // Reload entries
      await loadEntries();
      
      // Show success message
      if (Platform.OS === 'web') {
        window.alert('✅ Entry deleted successfully');
      } else {
        Alert.alert('Success', '✅ Entry deleted successfully');
      }
    } catch (error) {
      console.error('❌ [Journal] Error deleting entry:', error);
      if (Platform.OS === 'web') {
        window.alert('❌ Error: Could not delete entry. Please try again.');
      } else {
        Alert.alert('Error', '❌ Could not delete entry. Please try again.');
      }
    }
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => {
    const entryDate = new Date(item.createdAt);
    const formattedDate = format(entryDate, 'MMMM d, yyyy');
    const formattedTime = format(entryDate, 'h:mm a');

    return (
      <View style={[styles.entryCard, { backgroundColor: theme.cardBackground }]}>
        {/* Header */}
        <View style={styles.entryHeader}>
          <View style={styles.entryHeaderLeft}>
            <Text style={[styles.cardTitle, { color: theme.accent }]}>
              {item.cardTitle}
            </Text>
            <Text style={[styles.entryDate, { color: theme.textSecondary }]}>
              {formattedDate} • {formattedTime}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              console.log(`🗑️ [Journal] Delete button pressed for: ${item.id}`);
              handleDeleteEntry(item.id);
            }}
            style={styles.deleteButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.6}
            accessibilityLabel="Delete entry"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Moods (if selected) */}
        {item.moods && item.moods.length > 0 && (
          <View style={styles.moodRow}>
            {item.moods.map((mood, index) => (
              <Text key={index} style={styles.moodEmoji}>{mood}</Text>
            ))}
          </View>
        )}

        {/* Prompt (if used) */}
        {item.promptUsed && (
          <View style={[styles.promptBox, { borderLeftColor: theme.accent }]}>
            <Text style={[styles.promptLabel, { color: theme.textSecondary }]}>
              Prompt:
            </Text>
            <Text style={[styles.promptText, { color: theme.textPrimary }]}>
              {item.promptUsed}
            </Text>
          </View>
        )}

        {/* Journal Text */}
        <Text style={[styles.journalText, { color: theme.textPrimary }]}>
          {item.journalText}
        </Text>

        {/* View Card Button */}
        <TouchableOpacity
          style={styles.viewCardButton}
          onPress={() => {
            console.log(`📇 [Journal] View card pressed: ${item.cardId}`);
            router.push(`/card/${item.cardId}`);
          }}
          accessibilityLabel="View card again"
          accessibilityRole="button"
        >
          <Text style={[styles.viewCardText, { color: theme.accent }]}>
            View Card Again
          </Text>
          <Ionicons name="arrow-forward" size={16} color={theme.accent} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
        Your Journal is Empty
      </Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Start by drawing a daily card and reflecting on its message.
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: theme.accent }]}
        onPress={() => {
          console.log('🎴 [Journal] Draw first card pressed');
          router.push('/');
        }}
        accessibilityLabel="Draw your first card"
        accessibilityRole="button"
      >
        <Text style={styles.emptyButtonText}>Draw Your First Card</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={[theme.background.start, theme.background.end]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Your Journal
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      {/* 14-Day Mood Trend */}
      {entries.length > 0 && (() => {
        // Get last 14 days of entries with moods
        const last14Days = entries
          .filter(e => e.moods && e.moods.length > 0)
          .slice(0, 14)
          .reverse(); // Show oldest to newest
        
        if (last14Days.length > 0) {
          return (
            <View style={[styles.moodTrendCard, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.moodTrendTitle, { color: theme.textPrimary }]}>
                14-Day Mood Pattern
              </Text>
              <View style={styles.moodTrendRow}>
                {last14Days.map((entry, index) => (
                  <View key={entry.id} style={styles.moodTrendItem}>
                    {entry.moods?.map((mood, mIndex) => (
                      <Text key={mIndex} style={styles.moodTrendEmoji}>{mood}</Text>
                    ))}
                  </View>
                ))}
              </View>
              <Text style={[styles.moodTrendHint, { color: theme.textSecondary }]}>
                Last {last14Days.length} entries with moods
              </Text>
            </View>
          );
        }
        return null;
      })()}

      {/* Entries List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading...
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
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
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  entryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryHeaderLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 12,
    marginLeft: 8,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  promptBox: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 16,
  },
  promptLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  promptText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  journalText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  viewCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 8,
  },
  viewCardText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodTrendCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  moodTrendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  moodTrendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  moodTrendItem: {
    flexDirection: 'row',
    gap: 4,
  },
  moodTrendEmoji: {
    fontSize: 18,
  },
  moodTrendHint: {
    fontSize: 12,
    marginTop: 8,
  },
});
