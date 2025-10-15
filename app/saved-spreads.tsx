// Saved Spreads - View all saved oracle spreads
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '../components/BackHeader';
import { getSavedSpreads, deleteSpread, saveSpread, type SavedSpread } from '../utils/spreadsStorage';
import { getSeasonalTheme } from '../constants/theme';

export default function SavedSpreadsScreen() {
  const router = useRouter();
  const [spreads, setSpreads] = useState<SavedSpread[]>([]);
  const [loading, setLoading] = useState(true);
  
  const theme = getSeasonalTheme();

  useEffect(() => {
    loadSpreads();
  }, []);

  const loadSpreads = async () => {
    setLoading(true);
    const savedSpreads = await getSavedSpreads();
    setSpreads(savedSpreads);
    setLoading(false);
  };

  const handleDeleteSpread = async (spreadId: string) => {
    console.log('🔴 handleDeleteSpread called with ID:', spreadId);
    
    Alert.alert(
      'Delete Spread',
      'Are you sure you want to delete this saved spread?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('🔴 User confirmed deletion for ID:', spreadId);
            try {
              await deleteSpread(spreadId);
              console.log('🔴 Delete operation completed, reloading spreads...');
              await loadSpreads();
              Alert.alert('Deleted', 'Spread has been removed.');
            } catch (error) {
              console.error('🔴 Error during delete operation:', error);
              Alert.alert('Error', 'Could not delete spread. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <BackHeader title="Saved Spreads" />
        <View style={styles.center}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (spreads.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <BackHeader title="Saved Spreads" />
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            No Saved Spreads Yet
          </Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Save your meaningful oracle readings to revisit them anytime.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <BackHeader title="Saved Spreads" />
      <ScrollView style={styles.content}>
        {spreads.map((spread) => (
          <View
            key={spread.id}
            style={[styles.spreadCard, { backgroundColor: theme.cardBackground, borderColor: theme.accent }]}
          >
            <View style={styles.spreadHeader}>
              <TouchableOpacity
                style={styles.spreadMainContent}
                onPress={() => {
                  console.log('Navigating to spread detail:', spread.id);
                  router.push(`/saved-spread-detail?id=${spread.id}`);
                }}
              >
                <View style={styles.spreadInfo}>
                  <Text style={[styles.spreadType, { color: theme.textPrimary }]}>
                    {spread.type === 'three-card' && '🔮 Three Card Spread'}
                    {spread.type === 'seasonal' && '🍂 Seasonal Spread'}
                    {spread.type === 'growth' && '🌱 Growth Spread'}
                  </Text>
                  <Text style={[styles.spreadDate, { color: theme.textSecondary }]}>
                    {formatDate(spread.savedAt)}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButtonInHeader}
                onPress={() => {
                  console.log('🔴 Delete button clicked for spread:', spread.id);
                  handleDeleteSpread(spread.id);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                console.log('Navigating to spread detail:', spread.id);
                router.push(`/saved-spread-detail?id=${spread.id}`);
              }}
            >
              <View style={styles.cardsPreview}>
                {spread.cards.map((cardData, index) => (
                  <Text key={index} style={[styles.cardName, { color: theme.textPrimary }]}>
                    {cardData.card.title}
                  </Text>
                ))}
              </View>

              {spread.journalEntry && (
                <View style={styles.journalPreview}>
                  <Ionicons name="create-outline" size={14} color={theme.accent} />
                  <Text style={[styles.journalText, { color: theme.textSecondary }]} numberOfLines={2}>
                    {spread.journalEntry}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    lineHeight: 24,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  spreadCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  spreadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  spreadMainContent: {
    flex: 1,
  },
  deleteButtonInHeader: {
    padding: 4,
    marginLeft: 12,
  },
  spreadInfo: {
    flex: 1,
  },
  spreadType: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  spreadDate: {
    fontSize: 14,
  },
  cardsPreview: {
    marginBottom: 12,
  },
  cardName: {
    fontSize: 15,
    marginBottom: 4,
  },
  journalPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  journalText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
