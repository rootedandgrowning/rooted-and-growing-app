// Growth Spread - 7-Card Personal Development Journey

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getSeasonalTheme } from '../constants/theme';
import { BackHeader } from '../components/BackHeader';
import CardShuffleExperience from '../components/CardShuffleExperience';
import { ORACLE_CARDS } from '../constants/cards';
import { OracleCardImage } from '../components/OracleCardImage';
import { useAuth } from '../contexts/AuthContext';
import { saveSpread } from '../utils/spreadsStorage';
import Constants from 'expo-constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 100) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

type DrawingStage = 'shuffle' | 'drawing' | 'complete';
type CardPosition = 'roots' | 'challenges' | 'gifts' | 'shadow' | 'action' | 'vision' | 'integration';

interface DrawnCard {
  card: any;
  position: CardPosition;
}

export default function GrowthSpreadScreen() {
  const theme = getSeasonalTheme();
  const router = useRouter();
  const { token } = useAuth();
  const [stage, setStage] = useState<DrawingStage>('shuffle');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [showShuffleExperience, setShowShuffleExperience] = useState(true); // Start directly in shuffle experience
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  const positions = [
    { 
      key: 'roots' as CardPosition, 
      title: 'Roots', 
      subtitle: 'Your foundation',
      description: 'The strengths and values that ground your growth'
    },
    { 
      key: 'challenges' as CardPosition, 
      title: 'Challenges', 
      subtitle: 'What to overcome',
      description: 'The obstacles that are teaching you resilience'
    },
    { 
      key: 'gifts' as CardPosition, 
      title: 'Gifts', 
      subtitle: 'Natural talents',
      description: 'The unique abilities ready to shine through'
    },
    { 
      key: 'shadow' as CardPosition, 
      title: 'Shadow', 
      subtitle: 'What needs attention',
      description: 'The hidden aspects calling for integration'
    },
    { 
      key: 'action' as CardPosition, 
      title: 'Action', 
      subtitle: 'Next step',
      description: 'The practical move that will support your growth'
    },
    { 
      key: 'vision' as CardPosition, 
      title: 'Vision', 
      subtitle: 'Your potential',
      description: 'The expanded version of yourself that\'s emerging'
    },
    { 
      key: 'integration' as CardPosition, 
      title: 'Integration', 
      subtitle: 'Bringing it together',
      description: 'How to embody this growth in your daily life'
    },
  ];

  const shuffleDeck = () => {
    setShowShuffleExperience(true);
  };

  const handleCardDrawn = (card: any) => {
    // Determine position based on how many cards we've drawn
    const position = positions[drawnCards.length];
    
    const newDrawnCard: DrawnCard = {
      card: card,
      position: position.key,
    };

    const newDrawnCards = [...drawnCards, newDrawnCard];
    setDrawnCards(newDrawnCards);

    console.log(`✨ Drew ${card.title} for ${position.title} position (${newDrawnCards.length}/7)`);

    // If we've drawn all 7 cards, complete the spread and request AI interpretation
    if (newDrawnCards.length === 7) {
      setShowShuffleExperience(false);
      setStage('complete');
      requestAiInterpretation(newDrawnCards);
    }
  };

  const requestAiInterpretation = async (cards: DrawnCard[]) => {
    if (!token) {
      setAiInterpretation('Please sign in to receive personalized growth guidance.');
      return;
    }

    setIsLoadingInterpretation(true);
    try {
      const response = await fetch(`${API_URL}/api/oracle-interpretation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cards: cards.map(drawnCard => ({
            ...drawnCard.card,
            position: drawnCard.position,
          })),
          spread_type: 'growth',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiInterpretation(data.interpretation);
      } else {
        setAiInterpretation('Unable to generate interpretation at this time. Please try again later.');
      }
    } catch (error) {
      console.error('Error requesting AI interpretation:', error);
      setAiInterpretation('Unable to connect to the Oracle. Please check your connection and try again.');
    } finally {
      setIsLoadingInterpretation(false);
    }
  };

  const resetSpread = () => {
    setStage('shuffle');
    setDrawnCards([]);
    setAiInterpretation('');
    setIsLoadingInterpretation(false);
    setJournalText('');
    setShowShuffleExperience(true);
  };

  const handleSaveSpread = async () => {
    console.log('🔵 Save Growth Spread button clicked!');
    console.log('🔵 Drawn cards count:', drawnCards.length);
    
    if (drawnCards.length !== 7) {
      console.log('❌ Not enough cards drawn for growth spread');
      return;
    }
    
    setIsSaving(true);
    console.log('🔵 Starting to save growth spread...');
    
    try {
      await saveSpread({
        type: 'growth',
        cards: drawnCards,
        aiInterpretation: aiInterpretation,
        journalEntry: journalText || undefined,
      });

      console.log('✅ Growth spread saved successfully!');

      // Show success message
      setShowSaveSuccess(true);
      
      // Hide after 4 seconds
      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 4000);
    } catch (error) {
      console.error('❌ Error saving growth spread:', error);
      if (Platform.OS === 'web') {
        alert('Error: Could not save spread. Please try again.');
      } else {
        Alert.alert('Error', 'Could not save spread. Please try again.');
      }
    } finally {
      setIsSaving(false);
      console.log('🔵 Save growth spread process complete');
    }
  };

  const handleSaveJournal = () => {
    setShowJournalModal(false);
    if (Platform.OS === 'web') {
      alert('Journal Saved! 🌿\nYour reflections have been added to this spread.');
    } else {
      Alert.alert('Journal Saved! 🌿', 'Your reflections have been added to this spread.');
    }
  };

  const renderShuffleStage = () => (
    <View style={styles.centerContent}>
      <View style={[styles.deckContainer, { backgroundColor: theme.cardBackground }]}>
        <Animated.View style={[
          styles.deckCard,
          { backgroundColor: theme.accent },
          isShuffling && styles.shufflingCard
        ]}>
          <Ionicons name="trending-up" size={40} color="#fff" />
        </Animated.View>
      </View>
      
      <Text style={[styles.instructionTitle, { color: theme.textPrimary }]}>
        Growth Spread
      </Text>
      <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
        A comprehensive 7-card journey to explore your personal development. 
        This spread illuminates your strengths, challenges, gifts, and the path toward your fullest potential.
      </Text>
      
      <TouchableOpacity
        style={[styles.shuffleButton, { backgroundColor: theme.accent }]}
        onPress={shuffleDeck}
        disabled={isShuffling}
      >
        <Text style={styles.shuffleButtonText}>
          {isShuffling ? 'Shuffling...' : 'Shuffle Cards'}
        </Text>
        <Ionicons name="shuffle" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderDrawingStage = () => (
    <View style={styles.centerContent}>
      <View style={styles.positionIndicator}>
        <Text style={[styles.positionTitle, { color: theme.textPrimary }]}>
          Draw for: {positions[drawnCards.length]?.title}
        </Text>
        <Text style={[styles.positionSubtitle, { color: theme.textSecondary }]}>
          {positions[drawnCards.length]?.subtitle}
        </Text>
        <Text style={[styles.positionDescription, { color: theme.textSecondary }]}>
          {positions[drawnCards.length]?.description}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.drawDeck, { backgroundColor: theme.cardBackground }]}
        onPress={() => {/* This is legacy code - now using CardShuffleExperience */}}
      >
        <View style={[styles.deckCardDraw, { backgroundColor: theme.accent }]}>
          <Ionicons name="hand-right" size={32} color="#fff" />
          <Text style={styles.deckText}>Tap to Draw</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        {positions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index < drawnCards.length 
                  ? theme.accent 
                  : `${theme.accent}30`
              }
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderCompleteSpread = () => (
    <ScrollView style={styles.spreadContainer} showsVerticalScrollIndicator={false}>
      <Text style={[styles.spreadTitle, { color: theme.textPrimary }]}>
        Your Growth Journey
      </Text>
      
      {/* Tree/branching layout */}
      <View style={styles.treeContainer}>
        {/* Top level - Vision */}
        <View style={styles.treeLevel}>
          {drawnCards[5] && (
            <View style={styles.treeCard}>
              <OracleCardImage
                name={drawnCards[5].card.image}
                style={styles.cardImage}
              />
              <View style={[styles.positionLabel, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.labelTitle, { color: theme.accent }]}>Vision</Text>
                <Text style={[styles.labelCard, { color: theme.textPrimary }]}>
                  {drawnCards[5].card.title}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Second level - Gifts and Action */}
        <View style={styles.treeLevelDouble}>
          {drawnCards[2] && (
            <View style={styles.treeCard}>
              <OracleCardImage
                name={drawnCards[2].card.image}
                style={styles.cardImage}
              />
              <View style={[styles.positionLabel, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.labelTitle, { color: theme.accent }]}>Gifts</Text>
                <Text style={[styles.labelCard, { color: theme.textPrimary }]}>
                  {drawnCards[2].card.title}
                </Text>
              </View>
            </View>
          )}
          
          {drawnCards[4] && (
            <View style={styles.treeCard}>
              <OracleCardImage
                name={drawnCards[4].card.image}
                style={styles.cardImage}
              />
              <View style={[styles.positionLabel, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.labelTitle, { color: theme.accent }]}>Action</Text>
                <Text style={[styles.labelCard, { color: theme.textPrimary }]}>
                  {drawnCards[4].card.title}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Third level - Roots and Integration */}
        <View style={styles.treeLevelDouble}>
          {drawnCards[0] && (
            <View style={styles.treeCard}>
              <OracleCardImage
                name={drawnCards[0].card.image}
                style={styles.cardImage}
              />
              <View style={[styles.positionLabel, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.labelTitle, { color: theme.accent }]}>Roots</Text>
                <Text style={[styles.labelCard, { color: theme.textPrimary }]}>
                  {drawnCards[0].card.title}
                </Text>
              </View>
            </View>
          )}
          
          {drawnCards[6] && (
            <View style={styles.treeCard}>
              <OracleCardImage
                name={drawnCards[6].card.image}
                style={styles.cardImage}
              />
              <View style={[styles.positionLabel, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.labelTitle, { color: theme.accent }]}>Integration</Text>
                <Text style={[styles.labelCard, { color: theme.textPrimary }]}>
                  {drawnCards[6].card.title}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom level - Challenges and Shadow */}
        <View style={styles.treeLevelDouble}>
          {drawnCards[1] && (
            <View style={styles.treeCard}>
              <OracleCardImage
                name={drawnCards[1].card.image}
                style={styles.cardImage}
              />
              <View style={[styles.positionLabel, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.labelTitle, { color: theme.accent }]}>Challenges</Text>
                <Text style={[styles.labelCard, { color: theme.textPrimary }]}>
                  {drawnCards[1].card.title}
                </Text>
              </View>
            </View>
          )}
          
          {drawnCards[3] && (
            <View style={styles.treeCard}>
              <OracleCardImage
                name={drawnCards[3].card.image}
                style={styles.cardImage}
              />
              <View style={[styles.positionLabel, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.labelTitle, { color: theme.accent }]}>Shadow</Text>
                <Text style={[styles.labelCard, { color: theme.textPrimary }]}>
                  {drawnCards[3].card.title}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.interpretationCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.interpretationHeader}>
          <Ionicons name="trending-up" size={24} color={theme.accent} />
          <Text style={[styles.interpretationTitle, { color: theme.textPrimary }]}>
            Growth Guidance
          </Text>
        </View>
        
        {isLoadingInterpretation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              The Oracle is weaving together your growth story...
            </Text>
          </View>
        ) : (
          <Text style={[styles.interpretationText, { color: theme.textSecondary }]}>
            {aiInterpretation || 
              `Your growth journey reveals a rich tapestry of development. Your roots in ${drawnCards[0]?.card.title} provide a strong foundation as you work through challenges of ${drawnCards[1]?.card.title}. Your natural gifts of ${drawnCards[2]?.card.title} are ready to shine, while ${drawnCards[3]?.card.title} calls for gentle attention. Taking action through ${drawnCards[4]?.card.title} will help you step into the vision of ${drawnCards[5]?.card.title}, all integrated through the wisdom of ${drawnCards[6]?.card.title}.`
            }
          </Text>
        )}
      </View>

      {/* Success Banner */}
      {showSaveSuccess && (
        <View style={[styles.successBanner, { backgroundColor: theme.accent }]}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.successBannerText}>
            Growth Spread Saved! View in More → Saved Spreads
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderColor: theme.accent }]}
          onPress={() => setShowJournalModal(true)}
        >
          <Ionicons name="create-outline" size={20} color={theme.accent} />
          <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Journal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderColor: theme.accent }]}
          onPress={handleSaveSpread}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : (
            <>
              <Ionicons name="bookmark-outline" size={20} color={theme.accent} />
              <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Save Spread</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.homeButton, { backgroundColor: theme.cardBackground, borderColor: theme.accent }]}
        onPress={() => router.push('/(tabs)')}
      >
        <Ionicons name="home-outline" size={20} color={theme.accent} />
        <Text style={[styles.homeButtonText, { color: theme.textPrimary }]}>Back to Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.newSpreadButton, { backgroundColor: theme.accent }]}
        onPress={resetSpread}
      >
        <Text style={styles.newSpreadButtonText}>New Reading</Text>
        <Ionicons name="sparkles" size={18} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );

  // Show shuffle experience when drawing cards
  if (showShuffleExperience) {
    const currentPosition = positions[drawnCards.length];
    return (
      <View style={{ flex: 1, backgroundColor: '#F9F7F4' }}>
        <SafeAreaView style={{ flex: 1 }}>
          <BackHeader title={`Pick ${currentPosition.title} Card`} theme={theme} />
          <View style={{ flex: 1 }}>
            <CardShuffleExperience onCardDrawn={handleCardDrawn} skipReveal={true} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[theme.background.start, theme.background.end]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <BackHeader title="Growth Spread" theme={theme} />
        
        {stage === 'shuffle' && renderShuffleStage()}
        {stage === 'complete' && renderCompleteSpread()}
      </SafeAreaView>

      {/* Journal Modal */}
      <Modal
        visible={showJournalModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowJournalModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background.start }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowJournalModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Journal Your Growth Insights
            </Text>
            <TouchableOpacity
              onPress={handleSaveJournal}
              style={[styles.modalSaveButton, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.modalSaveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.journalPrompt, { color: theme.textSecondary }]}>
              What growth insights does this 7-card reading reveal? How do these cards speak to your personal development journey?
            </Text>
            <TextInput
              style={[styles.journalInput, { 
                color: theme.textPrimary,
                borderColor: theme.accent + '30'
              }]}
              multiline
              numberOfLines={10}
              placeholder="Write your reflections on your growth journey..."
              placeholderTextColor={theme.textSecondary + '80'}
              value={journalText}
              onChangeText={setJournalText}
              textAlignVertical="top"
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  deckContainer: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  deckCard: {
    width: 120,
    height: 160,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shufflingCard: {
    transform: [{ rotate: '10deg' }],
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  shuffleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  positionIndicator: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  positionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  positionSubtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  positionDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  drawDeck: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 32,
  },
  deckCardDraw: {
    width: 140,
    height: 180,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deckText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  spreadContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  spreadTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  treeContainer: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  treeLevel: {
    alignItems: 'center',
    marginBottom: 20,
  },
  treeLevelDouble: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  treeCard: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 140,
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    marginBottom: 8,
  },
  positionLabel: {
    padding: 6,
    borderRadius: 4,
    alignItems: 'center',
    minWidth: 70,
  },
  labelTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  labelCard: {
    fontSize: 9,
    textAlign: 'center',
  },
  interpretationCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  interpretationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  interpretationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  interpretationText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'left',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
  newSpreadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  newSpreadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  successBannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  journalPrompt: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  journalInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
});