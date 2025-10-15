// Seasonal Spread - Season-Aware 5-Card Oracle Reading

import React, { useState, useEffect } from 'react';
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
import { getCurrentAstrologyData, type AstrologyData } from '../utils/personalData';
import { getElementalGuidance } from '../utils/astrology';
import { isPersonalizationEnabled } from '../utils/featureFlags';
import { WhyThisGuidanceModal } from '../components/WhyThisGuidanceModal';
import Constants from 'expo-constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 80) / 2.5;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

type DrawingStage = 'shuffle' | 'drawing' | 'complete';
type CardPosition = 'roots' | 'growth' | 'bloom' | 'harvest' | 'rest';

interface DrawnCard {
  card: any;
  position: CardPosition;
}

interface Season {
  name: string;
  icon: string;
  theme: string;
  description: string;
}

export default function SeasonalSpreadScreen() {
  const theme = getSeasonalTheme();
  const router = useRouter();
  const { token } = useAuth();
  const [stage, setStage] = useState<DrawingStage>('shuffle');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [showShuffleExperience, setShowShuffleExperience] = useState(true); // Start directly in shuffle experience
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [astrologyData, setAstrologyData] = useState<AstrologyData | null>(null);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);

  const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  // Determine current season
  const getCurrentSeason = (): Season => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    
    if (month >= 2 && month <= 4) { // March, April, May
      return {
        name: 'Spring',
        icon: 'leaf',
        theme: 'Renewal and Growth',
        description: 'A time of new beginnings, fresh energy, and emerging possibilities'
      };
    } else if (month >= 5 && month <= 7) { // June, July, August
      return {
        name: 'Summer',
        icon: 'sunny',
        theme: 'Abundance and Action',
        description: 'A time of full bloom, active manifestation, and vibrant energy'
      };
    } else if (month >= 8 && month <= 10) { // September, October, November
      return {
        name: 'Autumn',
        icon: 'nutrition',
        theme: 'Harvest and Reflection',
        description: 'A time of gathering wisdom, releasing what no longer serves, and preparing'
      };
    } else { // December, January, February
      return {
        name: 'Winter',
        icon: 'snow',
        theme: 'Rest and Renewal',
        description: 'A time of quiet reflection, inner work, and regenerative rest'
      };
    }
  };

  useEffect(() => {
    setCurrentSeason(getCurrentSeason());
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
      key: 'roots' as CardPosition, 
      title: 'Roots', 
      subtitle: 'Your foundation',
      description: 'What grounds and supports you in this season'
    },
    { 
      key: 'growth' as CardPosition, 
      title: 'Growth', 
      subtitle: 'What\'s developing',
      description: 'The new energy emerging in your life'
    },
    { 
      key: 'bloom' as CardPosition, 
      title: 'Bloom', 
      subtitle: 'Ready to flourish',
      description: 'What\'s ready to fully express itself'
    },
    { 
      key: 'harvest' as CardPosition, 
      title: 'Harvest', 
      subtitle: 'What to gather',
      description: 'The gifts and lessons available to you'
    },
    { 
      key: 'rest' as CardPosition, 
      title: 'Rest', 
      subtitle: 'What needs tending',
      description: 'What requires gentleness and patience'
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

    console.log(`✨ Drew ${card.title} for ${position.title} position (${newDrawnCards.length}/5)`);

    // If we've drawn all 5 cards, complete the spread and request AI interpretation
    if (newDrawnCards.length === 5) {
      setShowShuffleExperience(false);
      setStage('complete');
      requestAiInterpretation(newDrawnCards);
    }
  };

  const requestAiInterpretation = async (cards: DrawnCard[]) => {
    if (!token) {
      setAiInterpretation('Please sign in to receive personalized seasonal oracle interpretations.');
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
          cards: cards.map(drawnCard => ({
            ...drawnCard.card,
            position: drawnCard.position,
            season: currentSeason?.name,
            seasonal_theme: currentSeason?.theme
          })),
          spread_type: 'seasonal',
          astrology_context: elementalContext || undefined,
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
    setIsLoadingInterpretation(false);
    setJournalText('');
    setShowShuffleExperience(true);
  };

  const handleSaveSpread = async () => {
    console.log('🔵 Save Seasonal Spread button clicked!');
    console.log('🔵 Drawn cards count:', drawnCards.length);
    
    if (drawnCards.length !== 5) {
      console.log('❌ Not enough cards drawn for seasonal spread');
      return;
    }
    
    setIsSaving(true);
    console.log('🔵 Starting to save seasonal spread...');
    
    try {
      await saveSpread({
        type: 'seasonal',
        cards: drawnCards,
        aiInterpretation: aiInterpretation,
        journalEntry: journalText || undefined,
      });

      console.log('✅ Seasonal spread saved successfully!');

      // Show success message
      setShowSaveSuccess(true);
      
      // Hide after 4 seconds
      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 4000);
    } catch (error) {
      console.error('❌ Error saving seasonal spread:', error);
      if (Platform.OS === 'web') {
        alert('Error: Could not save spread. Please try again.');
      } else {
        Alert.alert('Error', 'Could not save spread. Please try again.');
      }
    } finally {
      setIsSaving(false);
      console.log('🔵 Save seasonal spread process complete');
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
      <View style={[styles.seasonBadge, { backgroundColor: theme.accent }]}>
        <Ionicons name={currentSeason?.icon as any} size={20} color="#fff" />
        <Text style={styles.seasonText}>{currentSeason?.name} • {currentSeason?.theme}</Text>
      </View>
      
      <View style={[styles.deckContainer, { backgroundColor: theme.cardBackground }]}>
        <Animated.View style={[
          styles.deckCard,
          { backgroundColor: theme.accent },
          isShuffling && styles.shufflingCard
        ]}>
          <Ionicons name="flower" size={40} color="#fff" />
        </Animated.View>
      </View>
      
      <Text style={[styles.instructionTitle, { color: theme.textPrimary }]}>
        Seasonal Spread
      </Text>
      <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
        {currentSeason?.description}. Connect with the natural rhythms and see what this season has to teach you.
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
      <View style={styles.seasonalHeader}>
        <View style={[styles.seasonBadge, { backgroundColor: theme.accent }]}>
          <Ionicons name={currentSeason?.icon as any} size={16} color="#fff" />
          <Text style={styles.seasonText}>{currentSeason?.name} Guidance</Text>
        </View>
        <Text style={[styles.spreadTitle, { color: theme.textPrimary }]}>
          Your Seasonal Reading
        </Text>
      </View>
      
      {/* Cards in cross formation */}
      <View style={styles.cardLayout}>
        {/* Top card - Growth */}
        <View style={[styles.cardPosition, styles.topCard]}>
          {drawnCards[1] && (
            <>
              <OracleCardImage
                name={drawnCards[1].card.image}
                style={styles.cardImage}
              />
              <View style={[styles.positionLabel, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.labelTitle, { color: theme.accent }]}>Growth</Text>
                <Text style={[styles.labelCard, { color: theme.textPrimary }]}>
                  {drawnCards[1].card.title}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Middle row - Roots, Bloom, Harvest */}
        <View style={styles.middleRow}>
          {/* Left - Roots */}
          <View style={[styles.cardPosition, styles.sideCard]}>
            {drawnCards[0] && (
              <>
                <OracleCardImage
                  name={drawnCards[0].card.image}
                  style={styles.cardImageSmall}
                />
                <View style={[styles.positionLabel, { backgroundColor: theme.cardBackground }]}>
                  <Text style={[styles.labelTitle, { color: theme.accent }]}>Roots</Text>
                  <Text style={[styles.labelCard, { color: theme.textPrimary }]}>
                    {drawnCards[0].card.title}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Center - Bloom */}
          <View style={[styles.cardPosition, styles.centerCard]}>
            {drawnCards[2] && (
              <>
                <OracleCardImage
                  name={drawnCards[2].card.image}
                  style={styles.cardImage}
                />
                <View style={[styles.positionLabel, { backgroundColor: theme.cardBackground }]}>
                  <Text style={[styles.labelTitle, { color: theme.accent }]}>Bloom</Text>
                  <Text style={[styles.labelCard, { color: theme.textPrimary }]}>
                    {drawnCards[2].card.title}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Right - Harvest */}
          <View style={[styles.cardPosition, styles.sideCard]}>
            {drawnCards[3] && (
              <>
                <OracleCardImage
                  name={drawnCards[3].card.image}
                  style={styles.cardImageSmall}
                />
                <View style={[styles.positionLabel, { backgroundColor: theme.cardBackground }]}>
                  <Text style={[styles.labelTitle, { color: theme.accent }]}>Harvest</Text>
                  <Text style={[styles.labelCard, { color: theme.textPrimary }]}>
                    {drawnCards[3].card.title}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Bottom card - Rest */}
        <View style={[styles.cardPosition, styles.bottomCard]}>
          {drawnCards[4] && (
            <>
              <OracleCardImage
                name={drawnCards[4].card.image}
                style={styles.cardImage}
              />
              <View style={[styles.positionLabel, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.labelTitle, { color: theme.accent }]}>Rest</Text>
                <Text style={[styles.labelCard, { color: theme.textPrimary }]}>
                  {drawnCards[4].card.title}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={[styles.interpretationCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.interpretationHeader}>
          <Ionicons name="flower" size={24} color={theme.accent} />
          <Text style={[styles.interpretationTitle, { color: theme.textPrimary }]}>
            Seasonal Wisdom
          </Text>
        </View>
        
        {isLoadingInterpretation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              The Oracle is reading the seasonal energies...
            </Text>
          </View>
        ) : (
          <View>
            <Text style={[styles.interpretationText, { color: theme.textSecondary }]}>
              {aiInterpretation || 
                `This ${currentSeason?.name.toLowerCase()} season brings you guidance through these five aspects of growth. 
                 Your roots (${drawnCards[0]?.card.title}) provide the foundation for new growth (${drawnCards[1]?.card.title}), 
                 allowing ${drawnCards[2]?.card.title} to bloom fully. This season offers you the harvest of ${drawnCards[3]?.card.title}, 
                 while ${drawnCards[4]?.card.title} reminds you what needs gentle tending.`
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

      {/* Success Banner */}
      {showSaveSuccess && (
        <View style={[styles.successBanner, { backgroundColor: theme.accent }]}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.successBannerText}>
            Seasonal Spread Saved! View in More → Saved Spreads
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
        <BackHeader title="Seasonal Spread" theme={theme} />
        
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
              Journal Your Insights
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
              What insights or reflections does this seasonal reading bring up for you?
            </Text>
            <TextInput
              style={[styles.journalInput, { 
                color: theme.textPrimary,
                borderColor: theme.accent + '30'
              }]}
              multiline
              numberOfLines={10}
              placeholder="Write your thoughts here..."
              placeholderTextColor={theme.textSecondary + '80'}
              value={journalText}
              onChangeText={setJournalText}
              textAlignVertical="top"
            />
          </View>
        </SafeAreaView>
      </Modal>
      {/* Why This Guidance Modal */}
      {isPersonalizationEnabled() && astrologyData && (
        <WhyThisGuidanceModal
          visible={showGuidanceModal}
          onClose={() => setShowGuidanceModal(false)}
          astrologyData={astrologyData}
          cardTitles={drawnCards.map(dc => dc.card.title)}
          spreadType="Seasonal"
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
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 8,
  },
  seasonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  seasonalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  spreadTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  cardLayout: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cardPosition: {
    alignItems: 'center',
  },
  topCard: {
    marginBottom: 16,
  },
  bottomCard: {
    marginTop: 16,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  centerCard: {
    marginHorizontal: 8,
  },
  sideCard: {
    flex: 1,
    alignItems: 'center',
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardImageSmall: {
    width: CARD_WIDTH * 0.8,
    height: CARD_HEIGHT * 0.8,
    borderRadius: 8,
    marginBottom: 8,
  },
  positionLabel: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 80,
  },
  labelTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  labelCard: {
    fontSize: 11,
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