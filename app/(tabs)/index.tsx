// Daily Draw Screen - Main home screen with personalized greetings and daily draw
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
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  useAnimatedGestureHandler,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { getSeasonalTheme } from '../../constants/theme';
import { ORACLE_CARDS, getCardById, getRandomCard } from '../../constants/cards';
import { OracleCardImage } from '../../components/OracleCardImage';
import CardShuffleExperience from '../../components/CardShuffleExperience';
import {
  getLastDrawnCard,
  setLastDrawDate,
  setLastDrawnCard,
  updateDailyStreak,
  getUserPreferences,
} from '../../utils/storage';
import { logDailyDrawShown } from '../../utils/analytics';
import { getPersonalInfo } from '../../utils/personalData';
import { isPersonalizationEnabled } from '../../utils/featureFlags';
import { getTodaysDailyDraw, canDrawToday, storeDailyDraw } from '../../utils/dailyDraw';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DailyDrawScreen() {
  const router = useRouter();
  const theme = getSeasonalTheme();

  const [hasDrawnToday, setHasDrawnToday] = useState(false);
  const [drawnCard, setDrawnCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [resetTime, setResetTime] = useState('12:00 AM');
  const [showShuffleExperience, setShowShuffleExperience] = useState(false);
  const [personalizedGreeting, setPersonalizedGreeting] = useState('Good day');
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [showFullReading, setShowFullReading] = useState(false);

  useEffect(() => {
    checkDailyDrawStatus();
    setupPersonalizedGreeting();
  }, []);

  const checkDailyDrawStatus = async () => {
    setLoading(true);
    try {
      const todaysDraw = await getTodaysDailyDraw();
      
      if (todaysDraw) {
        const card = getCardById(todaysDraw.cardId);
        if (card) {
          setDrawnCard(card);
          setHasDrawnToday(true);
        }
      } else {
        setHasDrawnToday(false);
        setDrawnCard(null);
      }
    } catch (error) {
      console.error('Error checking daily draw status:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupPersonalizedGreeting = async () => {
    if (!isPersonalizationEnabled()) return;
    
    try {
      const prefs = await getUserPreferences();
      const firstName = prefs.firstName;
      
      if (firstName) {
        const hour = new Date().getHours();
        let timeGreeting = 'Good evening';
        
        if (hour < 12) timeGreeting = 'Good morning';
        else if (hour < 17) timeGreeting = 'Good afternoon';
        
        setPersonalizedGreeting(`${timeGreeting}, ${firstName}`);
      }
    } catch (error) {
      console.log('Could not load personalized greeting');
    }
  };

  const handleCardDrawn = async (card: any) => {
    setDrawnCard(card);
    setHasDrawnToday(true);
    setShowShuffleExperience(false);
    
    try {
      await storeDailyDraw(card.id, 'daily');
      await updateDailyStreak();
      logDailyDrawShown(card.id);
    } catch (error) {
      console.error('Error storing daily draw:', error);
    }
  };

  const handleShuffle = async () => {
    if (hasDrawnToday || isShuffling) return;
    setShowShuffleExperience(true);
  };

  const handleSaveJournal = () => {
    setShowJournalModal(false);
    if (Platform.OS === 'web') {
      alert('Journal Saved! 🌿\nYour reflections have been saved.');
    } else {
      Alert.alert('Journal Saved! 🌿', 'Your reflections have been saved.');
    }
  };

  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(
    () => {
      const loadStreakData = async () => {
        try {
          const preferences = await getUserPreferences();
          setCurrentStreak(preferences.currentStreak || 0);
          setLongestStreak(preferences.longestStreak || 0);
          
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          setResetTime(tomorrow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } catch (error) {
          console.error('Error loading streak data:', error);
        }
      };
      loadStreakData();
    }, []
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(1.05);
    },
    onActive: (event) => {
      const rotateValue = interpolate(
        event.translationX,
        [-100, 0, 100],
        [-10, 0, 10],
        Extrapolate.CLAMP
      );
      rotateZ.value = rotateValue;
    },
    onEnd: () => {
      scale.value = withSpring(1);
      rotateZ.value = withSpring(0);
    },
  });

  if (showShuffleExperience) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F9F7F4' }}>
        <SafeAreaView style={{ flex: 1 }}>
          <Text style={styles.shuffleTitle}>Choose Your Daily Oracle</Text>
          <CardShuffleExperience onCardDrawn={handleCardDrawn} skipReveal={false} />
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
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.greeting, { color: theme.textPrimary }]}>
              {personalizedGreeting}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Daily wisdom from the oracle
            </Text>
          </View>

          {/* Daily Streak */}
          <View style={[styles.streakContainer, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.streakHeader}>
              <Ionicons name="flame" size={20} color={theme.accent} />
              <Text style={[styles.streakTitle, { color: theme.textPrimary }]}>Daily Practice</Text>
            </View>
            <View style={styles.streakStats}>
              <View style={styles.streakStat}>
                <Text style={[styles.streakNumber, { color: theme.accent }]}>{currentStreak}</Text>
                <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Current</Text>
              </View>
              <View style={styles.streakStat}>
                <Text style={[styles.streakNumber, { color: theme.accent }]}>{longestStreak}</Text>
                <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Best</Text>
              </View>
            </View>
            <Text style={[styles.resetTime, { color: theme.textSecondary }]}>
              Resets at {resetTime}
            </Text>
          </View>

          {loading ? (
            <View style={[styles.loadingContainer, { backgroundColor: theme.cardBackground }]}>
              <ActivityIndicator size="large" color={theme.accent} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
            </View>
          ) : hasDrawnToday && drawnCard ? (
            <View style={[styles.cardContainer, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.cardStatus, { color: theme.textPrimary }]}>
                Today's Oracle
              </Text>
              
              {/* Card Image */}
              <View style={styles.cardImageContainer}>
                <OracleCardImage name={drawnCard.image} style={styles.cardImageLarge} />
              </View>

              {/* Card Title */}
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                {drawnCard.title}
              </Text>

              {/* Card Description */}
              <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                {drawnCard.description}
              </Text>

              {/* Reflection Prompts */}
              {drawnCard.prompts && drawnCard.prompts.length > 0 && (
                <View style={styles.promptsSection}>
                  <Text style={[styles.promptsSectionTitle, { color: theme.textPrimary }]}>
                    Reflection Prompts
                  </Text>
                  {drawnCard.prompts.map((prompt: string, index: number) => (
                    <View key={index} style={styles.promptItem}>
                      <Ionicons
                        name="leaf-outline"
                        size={18}
                        color={theme.accent}
                        style={styles.promptIcon}
                      />
                      <Text style={[styles.promptText, { color: theme.textSecondary }]}>
                        {prompt}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Affirmation/Action */}
              {drawnCard.action && (
                <View style={[styles.affirmationBox, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                  <Ionicons name="sparkles" size={20} color={theme.accent} style={styles.sparkleIcon} />
                  <Text style={[styles.affirmationText, { color: theme.textPrimary }]}>
                    {drawnCard.action}
                  </Text>
                </View>
              )}

              {/* Reflect & Journal Button */}
              <TouchableOpacity
                style={[styles.journalButton, { backgroundColor: theme.accent }]}
                onPress={() => setShowJournalModal(true)}
              >
                <Ionicons name="create" size={20} color="#FFFFFF" />
                <Text style={styles.journalButtonText}>Reflect & Journal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.drawContainer, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.drawTitle, { color: theme.textPrimary }]}>
                Draw Today's Oracle
              </Text>
              <Text style={[styles.drawSubtitle, { color: theme.textSecondary }]}>
                What wisdom awaits you today?
              </Text>
              <TouchableOpacity
                style={[styles.shuffleButton, { backgroundColor: theme.accent }]}
                onPress={handleShuffle}
                disabled={isShuffling}
              >
                <Text style={styles.shuffleButtonText}>
                  {isShuffling ? 'Shuffling...' : 'Draw Your Card'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
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
            <TouchableOpacity onPress={() => setShowJournalModal(false)}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Journal on Daily Draw
            </Text>
            <TouchableOpacity onPress={handleSaveJournal}>
              <Text style={[styles.saveText, { color: theme.accent }]}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.journalPrompt, { color: theme.textSecondary }]}>
              What does today's oracle card mean to you? How might its wisdom apply to your current journey?
            </Text>
            <TextInput
              style={[styles.journalInput, { color: theme.textPrimary, borderColor: theme.accent }]}
              placeholder="Reflect on today's message..."
              placeholderTextColor={theme.textSecondary + '80'}
              multiline
              numberOfLines={10}
              value={journalText}
              onChangeText={setJournalText}
              textAlignVertical="top"
            />
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  streakContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  streakStat: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
  },
  streakLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  resetTime: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  cardContainer: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardStatus: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  cardImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardImageLarge: {
    width: 180,
    height: 252,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  promptsSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  promptsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  promptItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 4,
  },
  promptIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  promptText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  affirmationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sparkleIcon: {
    marginRight: 12,
  },
  affirmationText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  journalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  journalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  drawContainer: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  drawTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  drawSubtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  shuffleButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  shuffleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  shuffleTitle: {
    fontSize: 18,
    color: '#4A3329',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveText: {
    fontSize: 16,
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
    fontStyle: 'italic',
  },
  journalInput: {
    minHeight: 200,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
  },
});