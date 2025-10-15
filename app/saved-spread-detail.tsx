// Saved Spread Detail View - Full spread with AI interpretation
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '../components/BackHeader';
import { OracleCardImage } from '../components/OracleCardImage';
import { getSeasonalTheme } from '../constants/theme';
import { getSpreadById, deleteSpread, type SavedSpread } from '../utils/spreadsStorage';

const theme = getSeasonalTheme();

export default function SavedSpreadDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [spread, setSpread] = useState<SavedSpread | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpread();
  }, [id]);

  const loadSpread = async () => {
    if (!id) return;
    setLoading(true);
    const savedSpread = await getSpreadById(id);
    setSpread(savedSpread);
    setLoading(false);
  };

  const handleDeleteSpread = async () => {
    if (!spread) return;
    
    Alert.alert(
      'Delete Spread',
      'Are you sure you want to delete this saved spread?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSpread(spread.id);
            Alert.alert('Deleted', 'Spread has been removed.', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPositionInfo = (index: number) => {
    const positions = [
      { title: 'Past', subtitle: 'What brought you here', emoji: '◀️' },
      { title: 'Present', subtitle: 'Where you are now', emoji: '⏺️' },
      { title: 'Future', subtitle: 'What\'s emerging', emoji: '▶️' },
    ];
    return positions[index] || { title: 'Card', subtitle: '', emoji: '🔮' };
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <BackHeader title="Saved Spread" />
        <View style={styles.center}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!spread) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <BackHeader title="Saved Spread" />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
            Spread Not Found
          </Text>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            This saved spread could not be found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <BackHeader 
        title="Saved Spread" 
        rightButton={
          <TouchableOpacity onPress={handleDeleteSpread} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Spread Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.spreadTitle, { color: theme.textPrimary }]}>
            {spread.type === 'three-card' && '🔮 Three Card Spread'}
            {spread.type === 'seasonal' && '🍂 Seasonal Spread'}
            {spread.type === 'growth' && '🌱 Growth Spread'}
          </Text>
          <Text style={[styles.spreadDate, { color: theme.textSecondary }]}>
            {formatDate(spread.savedAt)}
          </Text>
        </View>

        {/* Cards Display */}
        <View style={styles.cardsSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Your Cards
          </Text>
          <View style={styles.cardsContainer}>
            {spread.cards.map((cardData, index) => {
              const position = getPositionInfo(index);
              return (
                <View key={index} style={styles.cardContainer}>
                  <View style={styles.cardImageContainer}>
                    <OracleCardImage 
                      name={cardData.card.image} 
                      style={styles.cardImage}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardPosition, { color: theme.accent }]}>
                      {position.emoji} {position.title}
                    </Text>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                      {cardData.card.title}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                      {position.subtitle}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* AI Interpretation */}
        {spread.aiInterpretation && (
          <View style={styles.interpretationSection}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              🌟 Oracle's Interpretation
            </Text>
            <View style={[styles.interpretationCard, { backgroundColor: theme.cardBackground, borderColor: theme.accent }]}>
              <Text style={[styles.interpretationText, { color: theme.textPrimary }]}>
                {spread.aiInterpretation}
              </Text>
            </View>
          </View>
        )}

        {/* Journal Entry */}
        {spread.journalEntry && (
          <View style={styles.journalSection}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              📝 Your Reflections
            </Text>
            <View style={[styles.journalCard, { backgroundColor: theme.cardBackground, borderColor: theme.accent }]}>
              <Text style={[styles.journalText, { color: theme.textPrimary }]}>
                {spread.journalEntry}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.accent }]}
            onPress={() => router.push('/three-card-spread')}
          >
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>New Reading</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  spreadTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  spreadDate: {
    fontSize: 14,
    textAlign: 'center',
  },
  cardsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  cardsContainer: {
    gap: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardImageContainer: {
    width: 80,
    height: 112,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    flex: 1,
  },
  cardPosition: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  interpretationSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  interpretationCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
  },
  interpretationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  journalSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  journalCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
  },
  journalText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});