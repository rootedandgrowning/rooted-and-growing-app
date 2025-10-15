// Card Shuffle Experience - Base44 Style
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { ORACLE_CARDS } from '../constants/cards';
import { OracleCardImage } from './OracleCardImage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.6, 280);
const CARD_HEIGHT = CARD_WIDTH * 1.4;

// Card back image
const CARD_BACK_IMAGE = Platform.select({
  web: '/card-back.png',
  default: require('../assets/card-back.png'),
});

interface CardShuffleExperienceProps {
  onCardDrawn: (card: any) => void;
  skipReveal?: boolean; // For multi-card spreads, skip the reveal stage
}

export default function CardShuffleExperience({ onCardDrawn, skipReveal = false }: CardShuffleExperienceProps) {
  const [stage, setStage] = useState<'initial' | 'shuffling' | 'spread' | 'revealed'>('initial');
  const [spreadCards, setSpreadCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [canDrawAgain, setCanDrawAgain] = useState(false);

  // Reset to initial state
  const resetExperience = () => {
    setStage('initial');
    setSpreadCards([]);
    setSelectedCard(null);
    setCanDrawAgain(false);
  };

  // Start shuffle animation
  const handleShuffle = () => {
    setStage('shuffling');

    // After 2 seconds, show the spread
    setTimeout(() => {
      // Select 24 random cards for the spread
      const shuffled = [...ORACLE_CARDS].sort(() => Math.random() - 0.5);
      const selected24 = shuffled.slice(0, 24);
      setSpreadCards(selected24);
      setStage('spread');
    }, 2000);
  };

  // Handle card selection from spread
  const handleCardSelect = (card: any) => {
    if (skipReveal) {
      // For multi-card spreads, immediately call onCardDrawn without showing reveal
      onCardDrawn(card);
    } else {
      // For single card draws, show the reveal
      setSelectedCard(card);
      setStage('revealed');
      onCardDrawn(card);

      // Start cooldown timer for "Draw Again"
      setTimeout(() => {
        setCanDrawAgain(true);
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Initial State: Stacked Deck */}
      {stage === 'initial' && (
        <InitialDeckView onShuffle={handleShuffle} />
      )}

      {/* Shuffling Animation */}
      {stage === 'shuffling' && (
        <ShufflingView />
      )}

      {/* 24-Card Spread */}
      {stage === 'spread' && (
        <CardSpreadView cards={spreadCards} onCardSelect={handleCardSelect} />
      )}

      {/* Revealed Card */}
      {stage === 'revealed' && selectedCard && (
        <RevealedCardView
          card={selectedCard}
          canDrawAgain={canDrawAgain}
          onDrawAgain={resetExperience}
        />
      )}
    </View>
  );
}

// Component 1: Initial Stacked Deck
function InitialDeckView({ onShuffle }: { onShuffle: () => void }) {
  return (
    <View style={styles.initialContainer}>
      {/* Stacked Deck (3 cards with offset) */}
      <View style={styles.deckContainer}>
        <View style={[styles.deckCard, styles.deckCard3]}>
          <Image source={CARD_BACK_IMAGE} style={styles.cardBackImage} resizeMode="cover" />
        </View>
        <View style={[styles.deckCard, styles.deckCard2]}>
          <Image source={CARD_BACK_IMAGE} style={styles.cardBackImage} resizeMode="cover" />
        </View>
        <View style={[styles.deckCard, styles.deckCard1]}>
          <Image source={CARD_BACK_IMAGE} style={styles.cardBackImage} resizeMode="cover" />
        </View>
      </View>

      {/* Calming Prompt */}
      <Text style={styles.promptText}>
        Close your eyes, soften your shoulders, and bring to mind what needs gentle attention.
      </Text>
      <Text style={styles.promptSubtext}>When you're ready, shuffle the cards.</Text>

      {/* Shuffle Button */}
      <TouchableOpacity style={styles.shuffleButton} onPress={onShuffle} activeOpacity={0.8}>
        <Text style={styles.shuffleButtonText}>Shuffle the Cards</Text>
      </TouchableOpacity>
    </View>
  );
}

// Component 2: Enhanced Shuffling Animation with Fallback
function ShufflingView() {
  const [showFallback, setShowFallback] = useState(false);
  
  useEffect(() => {
    // Show fallback after 500ms if animation unavailable/reduced motion
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (showFallback) {
    return (
      <View style={styles.shufflingContainer}>
        <Text style={styles.shufflingText}>Shuffling...</Text>
        <Text style={styles.shufflingSubtext}>✨ Preparing your oracle spread</Text>
      </View>
    );
  }

  return (
    <View style={styles.shufflingContainer}>
      <View style={styles.shufflingCards}>
        <View style={[styles.shufflingCard, { transform: [{ rotate: '15deg' }, { translateX: -20 }] }]} />
        <View style={[styles.shufflingCard, { transform: [{ rotate: '-10deg' }, { translateX: 10 }] }]} />
        <View style={[styles.shufflingCard, { transform: [{ rotate: '5deg' }, { translateY: -10 }] }]} />
      </View>
      <Text style={styles.shufflingText}>Shuffling the cards...</Text>
      <Text style={styles.shufflingSubtext}>✨ Preparing your oracle spread</Text>
    </View>
  );
}

// Component 3: 24-Card Spread
function CardSpreadView({
  cards,
  onCardSelect,
}: {
  cards: any[];
  onCardSelect: (card: any) => void;
}) {
  return (
    <View style={styles.spreadContainer}>
      <Text style={styles.spreadPrompt}>Choose the card that calls to you.</Text>
      <ScrollView 
        style={styles.spreadScrollView}
        contentContainerStyle={styles.spreadScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.spreadGrid}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={card.id}
              style={styles.spreadCard}
              onPress={() => onCardSelect(card)}
              activeOpacity={0.7}
            >
              <Image source={CARD_BACK_IMAGE} style={styles.spreadCardImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Component 4: Revealed Card
function RevealedCardView({
  card,
  canDrawAgain,
  onDrawAgain,
}: {
  card: any;
  canDrawAgain: boolean;
  onDrawAgain: () => void;
}) {
  return (
    <ScrollView style={styles.revealedScrollView} contentContainerStyle={styles.revealedContainer}>
      {/* Card Image */}
      <View style={styles.revealedCardImageContainer}>
        <OracleCardImage name={card.image} style={styles.revealedCardImage} />
      </View>

      {/* Card Title */}
      <Text style={styles.cardTitle}>{card.title}</Text>

      {/* Card Description (the seed message) */}
      <Text style={styles.cardSeedMessage}>{card.description}</Text>

      {/* Affirmation */}
      <Text style={styles.cardAffirmation}>"{card.action}"</Text>

      {/* Draw Again Button */}
      <TouchableOpacity
        style={[styles.drawAgainButton, !canDrawAgain && styles.drawAgainButtonDisabled]}
        onPress={onDrawAgain}
        disabled={!canDrawAgain}
        activeOpacity={0.8}
      >
        <Text style={styles.drawAgainButtonText}>
          {canDrawAgain ? 'Draw Again' : 'Wait...'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F4',
  },
  // Initial Deck Styles
  initialContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  deckContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginBottom: 40,
    position: 'relative',
  },
  deckCard: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  deckCard1: {
    top: 0,
    left: 0,
    zIndex: 3,
  },
  deckCard2: {
    top: -8,
    left: 4,
    zIndex: 2,
    opacity: 0.9,
  },
  deckCard3: {
    top: -16,
    left: 8,
    zIndex: 1,
    opacity: 0.8,
  },
  cardBackImage: {
    width: '100%',
    height: '100%',
  },
  promptText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#4A3329',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '400',
    paddingHorizontal: 16,
  },
  promptSubtext: {
    fontSize: 16,
    color: '#7A5E4F',
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  shuffleButton: {
    backgroundColor: '#8B9A7C',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shuffleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  // Shuffling Styles
  shufflingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  shufflingCards: {
    width: 120,
    height: 160,
    marginBottom: 32,
    position: 'relative',
  },
  shufflingCard: {
    position: 'absolute',
    width: 80,
    height: 112,
    backgroundColor: '#E8DED2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4C4B0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shufflingText: {
    fontSize: 20,
    color: '#4A3329',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  shufflingSubtext: {
    fontSize: 14,
    color: '#8B9A7C',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Spread Styles
  spreadContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  spreadPrompt: {
    fontSize: 20,
    color: '#4A3329',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  spreadScrollView: {
    flex: 1,
  },
  spreadScrollContent: {
    paddingBottom: 40,
  },
  spreadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  spreadCard: {
    width: (SCREEN_WIDTH - 80) / 4,
    height: ((SCREEN_WIDTH - 80) / 4) * 1.4,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  spreadCardImage: {
    width: '100%',
    height: '100%',
  },
  // Revealed Card Styles
  revealedScrollView: {
    flex: 1,
  },
  revealedContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  revealedCardImageContainer: {
    width: Math.min(SCREEN_WIDTH * 0.7, 350),
    height: Math.min(SCREEN_WIDTH * 0.7, 350) * 1.4,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  revealedCardImage: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4A3329',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  cardSeedMessage: {
    fontSize: 17,
    lineHeight: 28,
    color: '#2D1F17',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  cardAffirmation: {
    fontSize: 16,
    lineHeight: 24,
    color: '#8B9A7C',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  drawAgainButton: {
    backgroundColor: '#8B9A7C',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drawAgainButtonDisabled: {
    opacity: 0.5,
  },
  drawAgainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
