// Onboarding Mini-Ritual Flow
import React, { useState, useEffect, useReducer } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  AccessibilityInfo,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Temporarily remove react-native-reanimated for web compatibility
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSequence,
//   withRepeat,
//   Easing,
// } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// Temporarily remove expo-notifications for web compatibility
// import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

import { getSeasonalTheme } from '../constants/theme';
import { ORACLE_CARDS, getRandomCard } from '../constants/cards';
import { OracleCardImage } from '../components/OracleCardImage';
import CardShuffleExperience from '../components/CardShuffleExperience';
import { 
  getUserPreferences, 
  updateUserPreferences,
  saveJournalEntry,
  JournalEntry
} from '../utils/storage';
import { storePersonalInfo, PersonalInfo } from '../utils/personalData';
import { isPersonalizationEnabled } from '../utils/featureFlags';
import { storeDailyDraw } from '../utils/dailyDraw';
import {
  logOnboardingStart,
  logOnboardingFocusSelect,
  logOnboardingCardDraw,
  logOnboardingReminderSet,
  logOnboardingCompleted
} from '../utils/analytics';

// Focus chips data with fall emojis
const FOCUS_CHIPS = [
  { id: 'calm', label: 'Calm', emoji: '🍂' },
  { id: 'focus', label: 'Focus', emoji: '🍁' },
  { id: 'confidence', label: 'Confidence', emoji: '🍂' },
  { id: 'creativity', label: 'Creativity', emoji: '🍁' },
  { id: 'clarity', label: 'Clarity', emoji: '🍂' },
];

// Preset intention options
const INTENTION_OPTIONS = [
  "I am open to guidance and wisdom",
  "I seek clarity in my next steps", 
  "I welcome peace and balance",
  "I trust my inner knowing",
  "I am ready for transformation",
  "I embrace my authentic path",
];

// Onboarding steps
enum OnboardingStep {
  WELCOME = 0,
  FOCUS_SELECTION = 1,
  CARD_DRAW = 2,
  GUIDED_BREATH = 3,
  INTENTION = 4,
  PERSONALIZATION = 5, // New optional step
  REMINDER_TIME = 6,
  PUSH_PERMISSIONS = 7,
  COMPLETE = 8,
}

interface OnboardingState {
  currentStep: OnboardingStep;
  selectedFocus: string[];
  drawnCard: any | null;
  intention: string;
  reminderTime: Date;
  pushOptIn: boolean;
  isReducedMotion: boolean;
  showShuffleExperience: boolean;
  personalInfo: PersonalInfo; // New personal data
}

type OnboardingAction =
  | { type: 'NEXT_STEP' }
  | { type: 'SET_FOCUS'; payload: string[] }
  | { type: 'SET_CARD'; payload: any }
  | { type: 'SET_INTENTION'; payload: string }
  | { type: 'SET_REMINDER_TIME'; payload: Date }
  | { type: 'SET_PUSH_OPT_IN'; payload: boolean }
  | { type: 'SET_REDUCED_MOTION'; payload: boolean }
  | { type: 'SET_SHOW_SHUFFLE_EXPERIENCE'; payload: boolean }
  | { type: 'SET_PERSONAL_INFO'; payload: Partial<PersonalInfo> };

const onboardingReducer = (state: OnboardingState, action: OnboardingAction): OnboardingState => {
  switch (action.type) {
    case 'NEXT_STEP':
      let nextStep = state.currentStep + 1;
      
      // Only skip personalization if feature is explicitly OFF (emergency brake)
      if (nextStep === OnboardingStep.PERSONALIZATION && !isPersonalizationEnabled()) {
        nextStep = OnboardingStep.REMINDER_TIME;
      }
      
      return { ...state, currentStep: nextStep };
    case 'SET_FOCUS':
      return { ...state, selectedFocus: action.payload };
    case 'SET_CARD':
      return { ...state, drawnCard: action.payload };
    case 'SET_INTENTION':
      return { ...state, intention: action.payload };
    case 'SET_REMINDER_TIME':
      return { ...state, reminderTime: action.payload };
    case 'SET_PUSH_OPT_IN':
      return { ...state, pushOptIn: action.payload };
    case 'SET_REDUCED_MOTION':
      return { ...state, isReducedMotion: action.payload };
    case 'SET_SHOW_SHUFFLE_EXPERIENCE':
      return { ...state, showShuffleExperience: action.payload };
    case 'SET_PERSONAL_INFO':
      return { ...state, personalInfo: { ...state.personalInfo, ...action.payload } };
    default:
      return state;
  }
};

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = getSeasonalTheme();

  // Initialize with 8:00 AM default
  const defaultTime = new Date();
  defaultTime.setHours(8, 0, 0, 0);

  const [state, dispatch] = useReducer(onboardingReducer, {
    currentStep: OnboardingStep.WELCOME,
    selectedFocus: [],
    drawnCard: null,
    intention: '',
    reminderTime: defaultTime,
    pushOptIn: false,
    isReducedMotion: false,
    showShuffleExperience: false, // For onboarding card draw
    personalInfo: { firstName: '' }, // Initialize personal info
  });

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale' | 'rest'>('rest');

  // Simplified for web compatibility - no animations

  // Check for reduced motion preference
  useEffect(() => {
    const checkReducedMotion = async () => {
      try {
        const isReducedMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        dispatch({ type: 'SET_REDUCED_MOTION', payload: isReducedMotionEnabled });
      } catch (error) {
        console.log('Could not check reduced motion preference');
      }
    };

    checkReducedMotion();
    logOnboardingStart();
  }, []);

  const startBreathingAnimation = () => {
    // Simplified for web - just complete the breathing exercise
    setTimeout(() => {
      setBreathCount(3);
    }, 1000);
  };

  const handleFocusChipPress = (focusId: string) => {
    const newSelected = state.selectedFocus.includes(focusId)
      ? state.selectedFocus.filter(id => id !== focusId)
      : [...state.selectedFocus, focusId];
    
    dispatch({ type: 'SET_FOCUS', payload: newSelected });
  };

  const startBreathingExercise = () => {
    if (isBreathing || breathCount >= 3) return;
    
    setIsBreathing(true);
    setBreathCount(0);
    
    // Create a proper pulsating breathing exercise
    let currentCycle = 0;
    
    const doBreathe = () => {
      // Inhale phase (3 seconds)
      setBreathPhase('inhale');
      
      setTimeout(() => {
        // Exhale phase (3 seconds) 
        setBreathPhase('exhale');
        
        setTimeout(() => {
          // Rest phase and cycle completion
          setBreathPhase('rest');
          currentCycle++;
          setBreathCount(currentCycle);
          
          if (currentCycle < 3) {
            setTimeout(() => doBreathe(), 500); // Short rest between cycles
          } else {
            setIsBreathing(false);
          }
        }, 3000);
      }, 3000);
    };
    
    doBreathe();
  };

  const handleDrawCard = () => {
    const card = getRandomCard();
    dispatch({ type: 'SET_CARD', payload: card });
    logOnboardingCardDraw(card.id);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      dispatch({ type: 'SET_REMINDER_TIME', payload: selectedTime });
    }
  };

  const requestNotificationPermissions = async () => {
    // Simplified for web - just set the preference
    const granted = confirm('Would you like to receive daily reminder notifications?');
    dispatch({ type: 'SET_PUSH_OPT_IN', payload: granted });
    
    if (granted) {
      // For web, we'll just save the preference - no actual notifications scheduled
      const reminderTimeStr = `${state.reminderTime.getHours().toString().padStart(2, '0')}:${state.reminderTime.getMinutes().toString().padStart(2, '0')}`;
      logOnboardingReminderSet(reminderTimeStr, granted);
    }
    
    return granted;
  };

  const createFirstJournalEntry = async () => {
    try {
      const entry: JournalEntry = {
        id: `onboarding_${Date.now()}`,
        dateISO: new Date().toISOString().split('T')[0],
        cardId: state.drawnCard?.id || '',
        cardTitle: state.drawnCard?.title || '',
        journalText: `My intention: ${state.intention}\n\nFocus areas: ${state.selectedFocus.join(', ')}\n\nFirst card meaning: ${state.drawnCard?.meaning || ''}`,
        promptUsed: 'onboarding_mini_ritual',
        createdAt: Date.now(),
      };

      await saveJournalEntry(entry);
    } catch (error) {
      console.error('Error creating first journal entry:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      console.log('🎉 [Onboarding] Starting completion process...');
      const reminderTimeStr = `${state.reminderTime.getHours().toString().padStart(2, '0')}:${state.reminderTime.getMinutes().toString().padStart(2, '0')}`;

      console.log('📝 [Onboarding] Saving preferences with onboardingComplete: true');
      // Save onboarding data to preferences
      await updateUserPreferences({
        onboardingComplete: true,
        dailyReminderEnabled: state.pushOptIn,
        onboardingData: {
          focus: state.selectedFocus,
          firstCardId: state.drawnCard?.id || '',
          intention: state.intention,
          reminderTime: reminderTimeStr,
          pushOptIn: state.pushOptIn,
        }
      });
      console.log('✅ [Onboarding] Preferences saved successfully');

      // Create first journal entry
      console.log('📓 [Onboarding] Creating first journal entry');
      await createFirstJournalEntry();
      console.log('✅ [Onboarding] Journal entry created');

      // Log completion
      logOnboardingCompleted(
        state.selectedFocus,
        state.drawnCard?.id || '',
        reminderTimeStr,
        state.pushOptIn
      );

      // Verify the save worked before navigating
      console.log('🔍 [Onboarding] Verifying preferences were saved...');
      const verifyPrefs = await getUserPreferences();
      console.log('🔍 [Onboarding] Verification result:', verifyPrefs);
      
      if (!verifyPrefs.onboardingComplete) {
        console.error('❌ [Onboarding] CRITICAL: onboardingComplete was NOT saved correctly!');
        alert('Error: Failed to save onboarding completion. Please try again or contact support.');
        return;
      }
      
      console.log('✅ [Onboarding] Verification passed! Navigating to home...');
      // Navigate to main app
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('❌ [Onboarding] Error completing onboarding:', error);
      alert('Error completing onboarding. Please try again.');
    }
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case OnboardingStep.WELCOME:
        return (
          <View style={styles.stepContainer}>
            {/* Logo Display */}
            <View style={styles.welcomeLogoContainer}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.welcomeLogoBig}
                resizeMode="contain"
                accessibilityLabel="Rooted & Growing Oracle Logo"
              />
            </View>

            <Text style={[styles.tagline, { color: '#8B9A7C' }]}>
              Daily rituals for mindful growth
            </Text>

            <Text style={[styles.websiteDescription, { color: theme.textSecondary }]}>
              Rooted & Growing is a nature-inspired oracle and journaling app designed to help you slow down, reflect, and reconnect with the rhythm of the seasons.
            </Text>

            <View style={[styles.welcomeCard, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                ✨ What Awaits You
              </Text>
              <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                Daily oracle draws, journaling, gentle astro notes. Supporters unlock more rituals and meditations.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.welcomeButton, { backgroundColor: theme.accent }]}
              onPress={() => dispatch({ type: 'NEXT_STEP' })}
              accessibilityLabel="Begin onboarding ritual"
              accessibilityRole="button"
            >
              <Text style={styles.welcomeButtonText}>Start My Practice</Text>
            </TouchableOpacity>
          </View>
        );

      case OnboardingStep.FOCUS_SELECTION:
        return (
          <View style={styles.stepContainer}>
            {/* Nature-inspired header */}
            <View style={styles.natureHeader}>
              <Text style={styles.seasonalEmoji}>🍂</Text>
              <Text style={[styles.natureTitle, { color: theme.textPrimary }]}>
                What calls to you this season?
              </Text>
              <Text style={[styles.natureSubtitle, { color: theme.textSecondary }]}>
                Like seeds in fertile soil, choose what you'd like to nurture
              </Text>
            </View>

            <View style={styles.focusChipsContainer}>
              {FOCUS_CHIPS.map((chip, index) => (
                <TouchableOpacity
                  key={chip.id}
                  style={[
                    styles.focusChipEnhanced,
                    { 
                      backgroundColor: state.selectedFocus.includes(chip.id) 
                        ? theme.accent 
                        : 'rgba(255, 255, 255, 0.1)',
                      borderColor: theme.accent,
                      transform: [{ rotate: `${(index - 2) * 3}deg` }], // Slight natural rotation
                    }
                  ]}
                  onPress={() => handleFocusChipPress(chip.id)}
                  accessibilityLabel={`${chip.label} focus area`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: state.selectedFocus.includes(chip.id) }}
                >
                  <Text style={styles.focusChipEmojiLarge}>{chip.emoji}</Text>
                  <Text style={[
                    styles.focusChipTextEnhanced,
                    { 
                      color: state.selectedFocus.includes(chip.id) 
                        ? '#FFFFFF' 
                        : theme.textPrimary 
                    }
                  ]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.natureTip}>
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                🌱 You can select multiple areas to tend
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.primaryButton, 
                { 
                  backgroundColor: state.selectedFocus.length > 0 ? theme.accent : theme.textSecondary,
                  opacity: state.selectedFocus.length > 0 ? 1 : 0.5
                }
              ]}
              onPress={() => {
                logOnboardingFocusSelect(state.selectedFocus);
                dispatch({ type: 'NEXT_STEP' });
              }}
              disabled={state.selectedFocus.length === 0}
              accessibilityLabel="Continue to card draw"
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );

      case OnboardingStep.CARD_DRAW:
        // Show shuffle experience directly for first card draw
        if (!state.drawnCard) {
          return (
            <View style={styles.stepContainer}>
              <View style={styles.natureHeader}>
                <Text style={styles.seasonalEmoji}>🌿</Text>
                <Text style={[styles.natureTitle, { color: theme.textPrimary }]}>
                  Draw your first oracle
                </Text>
                <Text style={[styles.natureSubtitle, { color: theme.textSecondary }]}>
                  Trust your intuition and let the oracle guide you
                </Text>
              </View>
              
              <View style={styles.onboardingShuffleContainer}>
                <CardShuffleExperience 
                  onCardDrawn={async (card) => {
                    dispatch({ type: 'SET_CARD', payload: card });
                    logOnboardingCardDraw(card.id);
                    // Store as today's daily draw
                    try {
                      await storeDailyDraw(card.id, 'onboarding');
                    } catch (error) {
                      console.error('Error storing onboarding draw as daily draw:', error);
                    }
                  }} 
                  skipReveal={false}
                />
              </View>
            </View>
          );
        }
        
        // After card is drawn - show the revealed card with different header
        return (
          <View style={styles.stepContainer}>
            <View style={styles.natureHeader}>
              <Text style={styles.seasonalEmoji}>✨</Text>
              <Text style={[styles.natureTitle, { color: theme.textPrimary }]}>
                Your oracle has spoken
              </Text>
              <Text style={[styles.natureSubtitle, { color: theme.textSecondary }]}>
                Let this wisdom guide your practice
              </Text>
            </View>
            
            <View style={styles.drawnCardContainerEnhanced}>
              <View style={styles.cardRevealGlow}>
                <OracleCardImage
                  name={state.drawnCard.image}
                  style={styles.drawnCardImageLarge}
                />
              </View>
              <View style={styles.cardWisdom}>
                <Text style={[styles.cardTitleLarge, { color: theme.textPrimary }]}>
                  {state.drawnCard.title}
                </Text>
                <Text style={[styles.cardMeaningEnhanced, { color: theme.textSecondary }]}>
                  {state.drawnCard.description}
                </Text>
              </View>
              <View style={styles.wisdomFrame}>
                <Text style={styles.frameDecoration}>🌸 ⠀⠀⠀ 🌸</Text>
              </View>
            </View>

            {state.drawnCard && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.accent }]}
                onPress={() => dispatch({ type: 'NEXT_STEP' })}
                accessibilityLabel="Continue to breathing exercise"
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case OnboardingStep.GUIDED_BREATH:
        return (
          <View style={styles.stepContainer}>
            {/* Breathing exercise with nature imagery */}
            <View style={styles.breathingHeader}>
              <Text style={styles.breathingEmoji}>🍃</Text>
              <Text style={[styles.natureTitle, { color: theme.textPrimary }]}>
                Ground yourself with nature
              </Text>
              <Text style={[styles.natureSubtitle, { color: theme.textSecondary }]}>
                Like trees breathing with the wind, find your natural rhythm
              </Text>
            </View>

            <View style={styles.breathingContainer}>
              <TouchableOpacity
                style={[
                  styles.breathingCircleSingle, 
                  { 
                    borderColor: theme.accent,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: [{ 
                      scale: breathPhase === 'inhale' ? 1.3 : breathPhase === 'exhale' ? 0.7 : 1 
                    }]
                  }
                ]}
                onPress={startBreathingExercise}
                disabled={breathCount >= 3}
              >
                <Text style={[styles.breathingCircleText, { color: theme.textPrimary }]}>
                  {breathCount >= 3 ? 'Complete' : 
                   breathPhase === 'inhale' ? 'Inhale' :
                   breathPhase === 'exhale' ? 'Exhale' :
                   isBreathing ? 'Breathe' : 
                   'Begin'}
                </Text>
                <Text style={[styles.breathingCircleSubtext, { color: theme.textSecondary }]}>
                  {breathCount >= 3 ? '🌸' : 
                   isBreathing ? `${breathCount + 1}/3` :
                   'Tap to start'}
                </Text>
              </TouchableOpacity>
            </View>

            {breathCount >= 3 && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.accent }]}
                onPress={() => dispatch({ type: 'NEXT_STEP' })}
                accessibilityLabel="Continue to intention setting"
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case OnboardingStep.INTENTION:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.natureHeader}>
              <Text style={styles.seasonalEmoji}>🌱</Text>
              <Text style={[styles.natureTitle, { color: theme.textPrimary }]}>
                Set your intention
              </Text>
              <Text style={[styles.natureSubtitle, { color: theme.textSecondary }]}>
                Plant seeds for what you'd like to cultivate this season
              </Text>
            </View>
            
            {/* Preset intention options */}
            <View style={styles.intentionOptions}>
              <Text style={[styles.optionsLabel, { color: theme.textSecondary }]}>
                Choose one or create your own:
              </Text>
              {INTENTION_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.intentionChip,
                    { 
                      backgroundColor: state.intention === option 
                        ? theme.accent 
                        : 'rgba(255, 255, 255, 0.1)',
                      borderColor: theme.accent,
                    }
                  ]}
                  onPress={() => dispatch({ type: 'SET_INTENTION', payload: option })}
                >
                  <Text style={[
                    styles.intentionChipText,
                    { 
                      color: state.intention === option 
                        ? '#FFFFFF' 
                        : theme.textPrimary 
                    }
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Custom intention input */}
            <View style={styles.customIntentionSection}>
              <Text style={[styles.optionsLabel, { color: theme.textSecondary }]}>
                Or write your own:
              </Text>
              <TextInput
                style={[
                  styles.intentionInput,
                  { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: theme.textPrimary,
                    borderColor: theme.accent,
                  }
                ]}
                placeholder="I want to cultivate..."
                placeholderTextColor={theme.textSecondary + '80'}
                value={state.intention}
                onChangeText={(text) => dispatch({ type: 'SET_INTENTION', payload: text })}
                multiline
                numberOfLines={3}
                accessibilityLabel="Custom intention text input"
                accessibilityHint="Enter your own intention for this season"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton, 
                { 
                  backgroundColor: state.intention.trim().length > 0 ? theme.accent : theme.textSecondary,
                  opacity: state.intention.trim().length > 0 ? 1 : 0.5
                }
              ]}
              onPress={() => dispatch({ type: 'NEXT_STEP' })}
              disabled={state.intention.trim().length === 0}
              accessibilityLabel="Continue to reminder setup"
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );

      case OnboardingStep.PERSONALIZATION:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.natureHeader}>
              <Text style={styles.seasonalEmoji}>🌟</Text>
              <Text style={[styles.natureTitle, { color: theme.textPrimary }]}>
                Make it yours
              </Text>
              <Text style={[styles.natureSubtitle, { color: theme.textSecondary }]}>
                Add your cosmic blueprint for personalized guidance
              </Text>
            </View>

            <View style={styles.personalizationForm}>
              {/* First Name (Required) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                  ✨ First Name (so we can greet you)
                </Text>
                <TextInput
                  style={[styles.personalInput, { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: theme.textPrimary,
                    borderColor: theme.accent + '50'
                  }]}
                  placeholder="Your first name"
                  placeholderTextColor={theme.textSecondary + '80'}
                  value={state.personalInfo.firstName}
                  onChangeText={(text) => dispatch({ 
                    type: 'SET_PERSONAL_INFO', 
                    payload: { firstName: text } 
                  })}
                  autoCapitalize="words"
                />
              </View>

              {/* Birth Date (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                  🌙 Birth Date (for cosmic context)
                </Text>
                <TextInput
                  style={[styles.personalInput, { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: theme.textPrimary,
                    borderColor: theme.accent + '50'
                  }]}
                  placeholder="MM/DD/YYYY (optional)"
                  placeholderTextColor={theme.textSecondary + '80'}
                  value={state.personalInfo.birthDate || ''}
                  onChangeText={(text) => dispatch({ 
                    type: 'SET_PERSONAL_INFO', 
                    payload: { birthDate: text } 
                  })}
                />
              </View>

              {/* Birth Time (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                  🕐 Birth Time (if known)
                </Text>
                <TextInput
                  style={[styles.personalInput, { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: theme.textPrimary,
                    borderColor: theme.accent + '50'
                  }]}
                  placeholder="HH:MM (optional)"
                  placeholderTextColor={theme.textSecondary + '80'}
                  value={state.personalInfo.birthTime || ''}
                  onChangeText={(text) => dispatch({ 
                    type: 'SET_PERSONAL_INFO', 
                    payload: { birthTime: text } 
                  })}
                />
              </View>

              {/* Birth Place (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                  📍 Birth Place (if known)
                </Text>
                <TextInput
                  style={[styles.personalInput, { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: theme.textPrimary,
                    borderColor: theme.accent + '50'
                  }]}
                  placeholder="City, State (optional)"
                  placeholderTextColor={theme.textSecondary + '80'}
                  value={state.personalInfo.birthPlace || ''}
                  onChangeText={(text) => dispatch({ 
                    type: 'SET_PERSONAL_INFO', 
                    payload: { birthPlace: text } 
                  })}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.personalizationNote}>
              <Text style={[styles.noteText, { color: theme.textSecondary }]}>
                🔒 Your information stays private and secure on your device
              </Text>
            </View>

            <View style={styles.personalizationButtons}>
              <TouchableOpacity
                style={[styles.skipButton, { borderColor: theme.accent }]}
                onPress={() => dispatch({ type: 'NEXT_STEP' })}
                accessibilityLabel="Skip personalization"
                accessibilityRole="button"
              >
                <Text style={[styles.skipButtonText, { color: theme.accent }]}>
                  Skip for now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.primaryButton, 
                  { 
                    backgroundColor: state.personalInfo.firstName.trim().length > 0 ? theme.accent : theme.textSecondary,
                    opacity: state.personalInfo.firstName.trim().length > 0 ? 1 : 0.5,
                    flex: 2
                  }
                ]}
                onPress={async () => {
                  // Store personal info
                  try {
                    await storePersonalInfo(state.personalInfo);
                  } catch (error) {
                    console.error('Error storing personal info:', error);
                  }
                  dispatch({ type: 'NEXT_STEP' });
                }}
                disabled={state.personalInfo.firstName.trim().length === 0}
                accessibilityLabel="Continue with personalization"
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case OnboardingStep.REMINDER_TIME:
        const timeOptions = [
          { label: '7:00 AM', hour: 7, minute: 0 },
          { label: '8:00 AM', hour: 8, minute: 0 },
          { label: '9:00 AM', hour: 9, minute: 0 },
          { label: '10:00 AM', hour: 10, minute: 0 },
          { label: '12:00 PM', hour: 12, minute: 0 },
          { label: '6:00 PM', hour: 18, minute: 0 },
          { label: '7:00 PM', hour: 19, minute: 0 },
          { label: '8:00 PM', hour: 20, minute: 0 },
        ];
        
        const selectedHour = state.reminderTime.getHours();
        const selectedMinute = state.reminderTime.getMinutes();
        
        return (
          <View style={styles.stepContainer}>
            <View style={styles.natureHeader}>
              <Text style={styles.seasonalEmoji}>🔔</Text>
              <Text style={[styles.natureTitle, { color: theme.textPrimary }]}>
                Daily oracle reminders
              </Text>
              <Text style={[styles.natureSubtitle, { color: theme.textSecondary }]}>
                We'll send you a gentle notification to draw your daily card
              </Text>
            </View>
            
            <View style={[styles.reminderExplanation, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <Text style={[styles.reminderTitle, { color: theme.textPrimary }]}>
                🌅 How it works:
              </Text>
              <Text style={[styles.reminderText, { color: theme.textSecondary }]}>
                • A gentle push notification at your chosen time{'\n'}
                • Reminder to draw your daily oracle card{'\n'}  
                • Helps you maintain a consistent practice{'\n'}
                • You can change or disable this anytime in settings
              </Text>
            </View>
            
            <View style={styles.timeOptionsContainer}>
              {timeOptions.map((option) => {
                const isSelected = selectedHour === option.hour && selectedMinute === option.minute;
                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.timeOptionButton,
                      { 
                        backgroundColor: isSelected ? theme.accent : 'rgba(255, 255, 255, 0.1)',
                        borderColor: theme.accent,
                      }
                    ]}
                    onPress={() => {
                      const newTime = new Date(state.reminderTime);
                      newTime.setHours(option.hour);
                      newTime.setMinutes(option.minute);
                      dispatch({ type: 'SET_REMINDER_TIME', payload: newTime });
                    }}
                    accessibilityLabel={`Set reminder time to ${option.label}`}
                    accessibilityRole="button"
                  >
                    <Text style={[
                      styles.timeOptionText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.accent }]}
              onPress={() => {
                // Skip the redundant push permissions step
                dispatch({ type: 'SET_PUSH_OPT_IN', payload: true });
                dispatch({ type: 'NEXT_STEP' });
                dispatch({ type: 'NEXT_STEP' }); // Skip PUSH_PERMISSIONS step
              }}
              accessibilityLabel="Continue to completion"
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );

      case OnboardingStep.PUSH_PERMISSIONS:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Allow gentle reminders?
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              We'll send you a peaceful nudge at your chosen time
            </Text>
            
            <View style={styles.permissionButtonContainer}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.accent }]}
                onPress={async () => {
                  await requestNotificationPermissions();
                  dispatch({ type: 'NEXT_STEP' });
                }}
                accessibilityLabel="Allow notifications"
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>Yes, Remind Me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: theme.accent }]}
                onPress={() => {
                  dispatch({ type: 'SET_PUSH_OPT_IN', payload: false });
                  dispatch({ type: 'NEXT_STEP' });
                }}
                accessibilityLabel="Skip notifications"
                accessibilityRole="button"
              >
                <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
                  Not Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case OnboardingStep.COMPLETE:
        return (
          <View style={styles.stepContainer}>
            {/* Celebration header */}
            <View style={styles.celebrationContainer}>
              <View style={styles.sparkleRow}>
                <Text style={styles.celebrationSparkle}>✨</Text>
                <Text style={styles.celebrationSparkle}>🌿</Text>
                <Text style={styles.celebrationSparkle}>✨</Text>
              </View>
              
              <Text style={[styles.celebrationTitle, { color: theme.textPrimary }]}>
                Your practice awaits
              </Text>
              
              <Text style={[styles.celebrationSubtitle, { color: theme.textSecondary }]}>
                You've set the foundation for meaningful oracle guidance
              </Text>
            </View>

            {/* Journey summary card */}
            <View style={[styles.journeyCard, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <Text style={[styles.journeyTitle, { color: theme.textPrimary }]}>
                🌱 Your Practice Includes:
              </Text>
              <View style={styles.journeyList}>
                <Text style={[styles.journeyItem, { color: theme.textSecondary }]}>
                  🔮 Daily oracle draws for guidance
                </Text>
                <Text style={[styles.journeyItem, { color: theme.textSecondary }]}>
                  📖 Journaling to capture insights  
                </Text>
                <Text style={[styles.journeyItem, { color: theme.textSecondary }]}>
                  🍂 Seasonal spreads for deeper wisdom
                </Text>
                <Text style={[styles.journeyItem, { color: theme.textSecondary }]}>
                  🔔 Gentle daily reminders at {state.reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            <View style={styles.welcomeBlessings}>
              <Text style={[styles.blessingText, { color: theme.textSecondary }]}>
                May your practice bring you peace, clarity, and connection to the wisdom of the seasons
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.finishButton, { backgroundColor: theme.accent }]}
              onPress={completeOnboarding}
              accessibilityLabel="Complete onboarding and enter the app"
              accessibilityRole="button"
            >
              <Text style={styles.finishButtonText}>🌸 Begin My Journey</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={[theme.background.start, theme.background.end]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderCurrentStep()}
        </ScrollView>
      </SafeAreaView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  focusChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 2,
    minHeight: 48,
  },
  focusChipEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  focusChipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  drawCardButton: {
    width: 200,
    height: 200,
    borderRadius: 16,
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  drawCardText: {
    fontSize: 18,
    fontWeight: '600',
  },
  drawnCardContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  drawnCardImage: {
    width: 150,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPlaceholder: {
    fontSize: 24,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardMeaning: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  breathingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  intentionInput: {
    width: '100%',
    minHeight: 120,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  timePickerButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginVertical: 24,
    minWidth: 150,
    alignItems: 'center',
  },
  timePickerText: {
    fontSize: 18,
    fontWeight: '500',
  },
  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  timeOptionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  permissionButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  // Enhanced welcome screen styles
  welcomeLogoContainer: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 20,
  },
  welcomeLogoBig: {
    width: 200,
    height: 200,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  oracleSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  websiteDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 16,
  },
  setupHeader: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  featureSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'left',
  },
  featureList: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  welcomeSteps: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  welcomeExtra: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  extraFeatures: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  extraFeatureText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    paddingLeft: 8,
  },
  welcomeFeatures: {
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  welcomeButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    minWidth: 240,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 24,
    marginVertical: 32,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  // Nature-inspired onboarding styles
  natureHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  seasonalEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  natureTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  natureSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    marginHorizontal: 24,
  },
  focusChipEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 2,
    margin: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  focusChipEmojiLarge: {
    fontSize: 20,
    marginRight: 8,
  },
  focusChipTextEnhanced: {
    fontSize: 16,
    fontWeight: '600',
  },
  natureTip: {
    alignItems: 'center',
    marginTop: 20,
  },
  tipText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  // Enhanced card draw styles
  drawCardSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  mysticalDeck: {
    width: 120,
    height: 160,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  deckGlow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckEmoji: {
    fontSize: 28,
    color: '#fff',
  },
  drawCardButtonEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 25,
    gap: 8,
  },
  drawCardTextEnhanced: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sparkleText: {
    color: '#fff',
    fontSize: 16,
  },
  drawnCardContainerEnhanced: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  cardRevealGlow: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#8B9A7C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  drawnCardImageLarge: {
    width: 180,
    height: 250,
    borderRadius: 16,
  },
  cardWisdom: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleLarge: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardMeaningEnhanced: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  wisdomFrame: {
    alignItems: 'center',
    marginTop: 16,
  },
  frameDecoration: {
    fontSize: 16,
    color: '#8B9A7C',
  },
  // Breathing exercise styles
  breathingHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  breathingEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#8B9A7C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  breathingCenter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  breathingSubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  breathingInstructions: {
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Onboarding shuffle experience
  onboardingShuffleContainer: {
    flex: 1,
    marginTop: 20,
  },
  // Intention setting styles
  intentionOptions: {
    marginBottom: 24,
  },
  optionsLabel: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  intentionChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  intentionChipText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  customIntentionSection: {
    marginTop: 16,
  },
  // Single breathing circle styles
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    marginBottom: 32,
  },
  breathingCircleSingle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B9A7C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  breathingCircleText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  breathingCircleSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Reminder explanation styles
  reminderExplanation: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    marginHorizontal: 16,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  reminderText: {
    fontSize: 14,
    lineHeight: 22,
  },
  // Beautiful completion page styles
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  celebrationSparkle: {
    fontSize: 32,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  celebrationSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
    marginHorizontal: 24,
  },
  journeyCard: {
    padding: 24,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  journeyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  journeyList: {
    gap: 10,
  },
  journeyItem: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  welcomeBlessings: {
    alignItems: 'center',
    marginBottom: 32,
    marginHorizontal: 32,
  },
  blessingText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  finishButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Personalization form styles
  personalizationForm: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'left',
  },
  personalInput: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 50,
  },
  personalizationNote: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  noteText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  personalizationButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
    flex: 1,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  whyGuidanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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