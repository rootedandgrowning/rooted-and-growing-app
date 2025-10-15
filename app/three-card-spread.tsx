// Three Card Spread - Interactive Drawing Experience

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSeasonalTheme } from '../constants/theme';
import { BackHeader } from '../components/BackHeader';
import CardShuffleExperience from '../components/CardShuffleExperience';
import { ORACLE_CARDS } from '../constants/cards';
import { OracleCardImage } from '../components/OracleCardImage';
import { useAuth } from '../contexts/AuthContext';
import { saveSpread } from '../utils/spreadsStorage';
import { getCurrentAstrologyData, type AstrologyData } from '../utils/personalData';
import { getElementalGuidance } from '../utils/astrology';
import { isPersonalizationEnabled } from '../utils/featureFlags';
import { WhyThisGuidanceModal } from '../components/WhyThisGuidanceModal';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

type DrawingStage = 'shuffle' | 'drawing' | 'complete';
type CardPosition = 'past' | 'present' | 'future';

interface DrawnCard {
  card: any;
  position: CardPosition;
}

export default function ThreeCardSpreadScreen() {
  const theme = getSeasonalTheme();
  const { token } = useAuth();
  const router = useRouter();
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
  const [astrologyData, setAstrologyData] = useState<AstrologyData | null>(null);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);

  const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    loadAstrologyData();
  }, []);

  const loadAstrologyData = async () => {
    if (!isPersonalizationEnabled()) return;
    
    try {
      const astroData = await getCurrentAstrologyData();
      setAstrologyData(astroData);
    } catch (error) {
      console.log('Could not load astrology data');
    }
  };

  const positions = [
    { 
      key: 'past' as CardPosition, 
      title: 'Past', 
      subtitle: 'What brought you here',
      description: 'The energies and experiences that have shaped your current situation'
    },
    { 
      key: 'present' as CardPosition, 
      title: 'Present', 
      subtitle: 'Where you are now',
      description: 'The current energies and circumstances surrounding you'
    },
    { 
      key: 'future' as CardPosition, 
      title: 'Future', 
      subtitle: 'What\'s emerging',
      description: 'The potential outcomes and energies moving toward you'
    },
  ];

  const shuffleDeck = () => {
    setShowShuffleExperience(true);
  };

  const handleCardDrawn = (card: any) => {
    // Determine which position this card is for
    const position = positions[drawnCards.length];

    const newDrawnCard: DrawnCard = {
      card,
      position: position.key,
    };

    const newDrawnCards = [...drawnCards, newDrawnCard];
    setDrawnCards(newDrawnCards);

    // If we've drawn all 3 cards, complete the spread
    if (newDrawnCards.length === 3) {
      setShowShuffleExperience(false);
      setStage('complete');
      requestAiInterpretation(newDrawnCards);
    } else {
      // Continue showing shuffle experience for next card
      // The shuffle experience will automatically show another draw
    }
  };

  const drawCard = () => {
    if (drawnCards.length >= 3) return;

    // Get available cards (exclude already drawn ones)
    const availableCards = ORACLE_CARDS.filter(
      card => !drawnCards.find(drawn => drawn.card.id === card.id)
    );

    // Randomly select a card
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards[randomIndex];

    // Determine position
    const position = positions[drawnCards.length];

    const newDrawnCard: DrawnCard = {
      card: selectedCard,
      position: position.key,
    };

    const newDrawnCards = [...drawnCards, newDrawnCard];
    setDrawnCards(newDrawnCards);

    // If we've drawn all 3 cards, complete the spread and request AI interpretation
    if (drawnCards.length === 2) {
      setTimeout(() => {
        setStage('complete');
        requestAiInterpretation(newDrawnCards);
      }, 500);
    }
  };

  const requestAiInterpretation = async (cards: DrawnCard[]) => {
    if (!token) {
      setAiInterpretation('Please sign in to receive personalized oracle interpretations.');
      return;
    }

    setIsLoadingInterpretation(true);
    try {
      // Get elemental guidance if personalization is enabled
      let elementalContext = '';
      if (isPersonalizationEnabled() && astrologyData) {
        elementalContext = getElementalGuidance(astrologyData.sunSign, astrologyData.moonSign);
      }

      const response = await fetch(`${API_URL}/api/oracle-interpretation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cards: cards.map(drawnCard => drawnCard.card),
          spread_type: 'three_card',
          astrology_context: elementalContext || undefined, // Include astrological context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add gentle astrological sentence if personalization enabled
        let interpretation = data.interpretation;
        if (isPersonalizationEnabled() && astrologyData && elementalContext) {
          interpretation += `\n\n✨ ${elementalContext}`;
        }
        
        setAiInterpretation(interpretation);
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
    setJournalText('');
    setShowShuffleExperience(true);
  };

  const handleSaveSpread = async () => {
    console.log('🔵 Save Spread button clicked!');
    console.log('🔵 Drawn cards count:', drawnCards.length);
    
    if (drawnCards.length !== 3) {
      console.log('❌ Not enough cards drawn');
      return;
    }
    
    setIsSaving(true);
    console.log('🔵 Starting to save spread...');
    
    try {
      await saveSpread({
        type: 'three-card',
        cards: drawnCards,
        aiInterpretation: aiInterpretation,
        journalEntry: journalText || undefined,
      });

      console.log('✅ Spread saved successfully!');

      // Show success message
      setShowSaveSuccess(true);
      
      // Hide after 4 seconds
      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 4000);
    } catch (error) {
      console.error('❌ Error saving spread:', error);
      if (Platform.OS === 'web') {
        alert('Error: Could not save spread. Please try again.');
      } else {
        Alert.alert('Error', 'Could not save spread. Please try again.');
      }
    } finally {
      setIsSaving(false);
      console.log('🔵 Save spread process complete');
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
          <Ionicons name="sparkles" size={40} color="#fff" />
        </Animated.View>
      </View>
      
      <Text style={[styles.instructionTitle, { color: theme.textPrimary }]}>
        Three Card Spread
      </Text>
      <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
        Take a moment to center yourself and think about what you'd like guidance on.
        When you're ready, tap to shuffle the cards.
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
      </View>

      <TouchableOpacity
        style={[styles.drawDeck, { backgroundColor: theme.cardBackground }]}
        onPress={drawCard}
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
      {/* Success Banner */}
      {showSaveSuccess && (
        <View style={[styles.successBanner, { backgroundColor: theme.accent }]}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.successBannerText}>
            Spread Saved! View in More → Saved Spreads
          </Text>
        </View>
      )}
      <Text style={[styles.spreadTitle, { color: theme.textPrimary }]}>
        Your Three Card Reading
      </Text>
      
      <View style={styles.cardsRow}>
        {drawnCards.map((drawnCard, index) => {
          const position = positions.find(p => p.key === drawnCard.position);
          return (
            <View key={index} style={styles.cardContainer}>
              <View style={styles.cardImageContainer}>
                <OracleCardImage
                  name={drawnCard.card.image}
                  style={styles.cardImage}
                />
              </View>
              
              <View style={[styles.positionCard, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.cardPositionTitle, { color: theme.accent }]}>
                  {position?.title}
                </Text>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                  {drawnCard.card.title}
                </Text>
                <Text style={[styles.cardPositionDesc, { color: theme.textSecondary }]}>
                  {position?.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.interpretationCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.interpretationHeader}>
          <Ionicons name="sparkles" size={24} color={theme.accent} />
          <Text style={[styles.interpretationTitle, { color: theme.textPrimary }]}>
            Oracle's Wisdom
          </Text>
        </View>
        
        {isLoadingInterpretation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              The Oracle is contemplating your cards...
            </Text>
          </View>
        ) : (
          <View>
            <Text style={[styles.interpretationText, { color: theme.textSecondary }]}>
              {aiInterpretation || 
                `Your cards reveal a journey from ${drawnCards[0]?.card.title} in your past, 
                 through ${drawnCards[1]?.card.title} in your present, 
                 toward ${drawnCards[2]?.card.title} in your future. 
                 Reflect on how these energies connect and guide your path forward.`
              }
            </Text>
            
            {isPersonalizationEnabled() && astrologyData && (
              <TouchableOpacity
                style={[styles.whyGuidanceButton, { borderColor: theme.accent }]}
                onPress={() => setShowGuidanceModal(true)}
              >
                <Ionicons name="help-circle-outline" size={16} color={theme.accent} />
                <Text style={[styles.whyGuidanceText, { color: theme.accent }]}>
                  Why this guidance?
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Journal & Save Options */}
      <View style={styles.actionsContainer}>
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
        <BackHeader title="Three Card Spread" theme={theme} />
        
        {stage === 'shuffle' && renderShuffleStage()}
        {stage === 'drawing' && renderDrawingStage()}
        {stage === 'complete' && renderCompleteSpread()}
      </SafeAreaView>

      {/* Journal Modal */}
      <Modal
        visible={showJournalModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowJournalModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.start }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowJournalModal(false)}>
              <Ionicons name="close" size={28} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Journal on Spread
            </Text>
            <TouchableOpacity onPress={handleSaveJournal}>
              <Text style={[styles.saveText, { color: theme.accent }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.journalPrompt, { color: theme.textSecondary }]}>
              Reflect on your three card reading. What insights emerged? How do these cards speak to your journey?
            </Text>

            <TextInput
              style={[styles.journalInput, { color: theme.textPrimary, borderColor: theme.accent }]}
              placeholder="Write your reflections..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={10}
              value={journalText}
              onChangeText={setJournalText}
              textAlignVertical="top"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Why This Guidance Modal */}
      {isPersonalizationEnabled() && astrologyData && (
        <WhyThisGuidanceModal
          visible={showGuidanceModal}
          onClose={() => setShowGuidanceModal(false)}
          astrologyData={astrologyData}
          cardTitles={drawnCards.map(dc => dc.card.title)}
          spreadType="Three Card"
        />
      )}
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
  },
  positionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  positionSubtitle: {
    fontSize: 16,
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
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  spreadContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  spreadTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardContainer: {
    width: CARD_WIDTH,
    alignItems: 'center',
  },
  cardImageContainer: {
    marginBottom: 12,
  },
  cardImage: {
    width: CARD_WIDTH - 8,
    height: CARD_HEIGHT,
    borderRadius: 8,
  },
  positionCard: {
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  cardPositionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardPositionDesc: {
    fontSize: 11,
    lineHeight: 14,
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    gap: 8,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
  // Modal styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4DD',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  journalPrompt: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  journalInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 200,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    gap: 8,
  },
  successBannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  whyGuidanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    gap: 6,
  },
  whyGuidanceText: {
    fontSize: 13,
    fontWeight: '500',
  },
});