// Monthly Ritual + Tea & Tincture Box - Premium Feature

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSeasonalTheme } from '../constants/theme';
import { BackHeader } from '../components/BackHeader';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { ritualStyles as styles } from './ritual-styles';

// Box Circle Preview Component
const BoxCirclePreview = () => {
  const theme = getSeasonalTheme();
  const { token } = useAuth();
  const { isPremium } = useSubscription();
  const router = useRouter();
  const [previewData, setPreviewData] = useState({
    average_rating: 0.0,
    member_count: 0,
    quotes: [],
    top_tip: "Join to see member experiences!"
  });
  const [loading, setLoading] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7); // "2024-12"

  useEffect(() => {
    if (!isPremium) {
      fetchPreviewData();
    }
  }, [isPremium]);

  const fetchPreviewData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/box-circle/${currentMonth}/preview`);
      if (response.ok) {
        const data = await response.json();
        setPreviewData(data);
      }
    } catch (error) {
      console.error('Error fetching Box Circle preview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.boxCircleContainer, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.boxCircleHeader}>
        <Ionicons name="people-circle" size={24} color={theme.accent} />
        <Text style={[styles.boxCircleTitle, { color: theme.textPrimary }]}>
          Box Circle Community
        </Text>
      </View>
      
      <Text style={[styles.boxCircleDescription, { color: theme.textSecondary }]}>
        {isPremium 
          ? "Share experiences and connect with the community about this month's tea and tincture."
          : "See what members are sharing about this month's tea and tincture blend."
        }
      </Text>

      {!isPremium && (
        <>
          {/* Preview Stats */}
          <View style={styles.previewStats}>
            <View style={styles.previewStatItem}>
              <Text style={[styles.previewStatValue, { color: theme.accent }]}>
                🌿 {previewData.average_rating.toFixed(1)}/5
              </Text>
              <Text style={[styles.previewStatLabel, { color: theme.textSecondary }]}>
                Average Rating
              </Text>
            </View>
            <View style={styles.previewStatItem}>
              <Text style={[styles.previewStatValue, { color: theme.accent }]}>
                {previewData.member_count}
              </Text>
              <Text style={[styles.previewStatLabel, { color: theme.textSecondary }]}>
                Member Shares
              </Text>
            </View>
          </View>

          {/* Sample Quotes */}
          {previewData.quotes.length > 0 && (
            <View style={styles.previewQuotes}>
              <Text style={[styles.previewQuotesTitle, { color: theme.textPrimary }]}>
                What members are saying:
              </Text>
              {previewData.quotes.map((quote, index) => (
                <Text key={index} style={[styles.previewQuote, { color: theme.textSecondary }]}>
                  • {quote}
                </Text>
              ))}
            </View>
          )}

          {/* Top Tip */}
          {previewData.top_tip && (
            <View style={styles.previewTip}>
              <Text style={[styles.previewTipLabel, { color: theme.accent }]}>💡 Top Tip:</Text>
              <Text style={[styles.previewTipText, { color: theme.textPrimary }]}>
                {previewData.top_tip}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Action Button */}
      <TouchableOpacity 
        style={[styles.boxCircleButton, { backgroundColor: isPremium ? theme.accent : theme.accent }]}
        onPress={() => isPremium ? router.push('/box-circle') : router.push('/upgrade')}
      >
        <Ionicons 
          name={isPremium ? "chatbubbles" : "lock-closed"} 
          size={16} 
          color="#fff" 
        />
        <Text style={styles.boxCircleButtonText}>
          {isPremium ? "Join the Circle" : "Upgrade to See the Box Circle"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

interface MonthlyRitualData {
  month: string;
  year: number;
  cutoff_date: string;
  ship_window: string;
  tea_blend: {
    name: string;
    description: string;
    ingredients: string[];
    allergens: string[];
    caffeine_level: string;
    steep_time: string;
    temperature: string;
    tasting_notes: string;
  };
  tincture: {
    name: string;
    purpose: string;
    herbs: string[];
    suggested_use: string;
    taste_notes: string;
    safety: string;
  };
}

export default function RitualScreen() {
  const theme = getSeasonalTheme();
  const { user, token } = useAuth();
  const { isPremium, subscription } = useSubscription();
  const router = useRouter();
  
  const [ritualData, setRitualData] = useState<MonthlyRitualData | null>(null);
  const [herbalistQuestion, setHerbalistQuestion] = useState('');
  const [herbalistAnswer, setHerbalistAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showDailyActions, setShowDailyActions] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [showIntentions, setShowIntentions] = useState(false);
  const [selectedIntention, setSelectedIntention] = useState<string>('');

  const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  const monthlyIntentions = [
    '🌱 Growth & Expansion',
    '⚖️ Balance & Harmony',
    '💝 Love & Compassion', 
    '🔥 Creativity & Passion',
    '🌿 Healing & Renewal',
    '✨ Abundance & Prosperity',
    '🧘 Peace & Mindfulness',
    '💪 Strength & Courage',
  ];

  const dailyActions = [
    '🌅 Morning intention setting (2 minutes)',
    '🙏 Evening gratitude practice (3 minutes)',
    '🌱 Mindful tea brewing ritual',
    '📖 Daily card reflection journaling',
    '🧘 Brief mindfulness meditation (5 minutes)',
    '🌿 Connect with nature daily',
    '💝 Practice one act of kindness',
    '📱 Mindful technology use',
  ];

  useEffect(() => {
    fetchRitualData();
  }, []);

  const fetchRitualData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/monthly-ritual`);
      if (response.ok) {
        const data = await response.json();
        setRitualData(data);
      }
    } catch (error) {
      console.error('Error fetching ritual data:', error);
    }
  };

  const askHerbalist = async () => {
    if (!herbalistQuestion.trim() || !token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/ask-herbalist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: herbalistQuestion,
          month: ritualData?.month,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setHerbalistAnswer(data.answer);
      } else {
        Alert.alert('Error', 'Unable to connect to the Herbalist right now');
      }
    } catch (error) {
      console.error('Error asking herbalist:', error);
      Alert.alert('Error', 'Unable to connect to the Herbalist');
    } finally {
      setIsLoading(false);
    }
  };

  const getMemberStatus = () => {
    if (!isPremium) return null;
    if (subscription?.has_active_subscription) {
      return { type: 'active', message: "You're in this month's shipment." };
    }
    return { 
      type: 'paused', 
      message: 'Your membership is paused. Resume to receive this month\'s box.' 
    };
  };

  const ritualSteps = [
    {
      id: 1,
      icon: 'home',
      title: 'Prepare Your Space',
      description: 'Set a calm spot with your tea and journal (physical or digital).',
      locked: false,
    },
    {
      id: 2,
      icon: 'library',
      title: 'Monthly Intention',
      description: 'Choose your focus for this month\'s growth.',
      locked: !isPremium,
      selectable: true,
    },
    {
      id: 3,
      icon: 'flower',
      title: 'Integration Practice',
      description: 'Choose from guided daily practices to embody your intention.',
      locked: !isPremium,
      selectable: true,
    },
  ];

  if (!ritualData) {
    return (
      <LinearGradient colors={[theme.background.start, theme.background.end]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <BackHeader title="Monthly Ritual" theme={theme} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const memberStatus = getMemberStatus();

  return (
    <LinearGradient colors={[theme.background.start, theme.background.end]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <BackHeader title="Monthly Ritual" theme={theme} />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.monthBadge, { backgroundColor: theme.accent }]}>
              <Text style={styles.monthText}>{ritualData.month}</Text>
            </View>
            
            {memberStatus && (
              <View style={[
                styles.statusChip, 
                { backgroundColor: memberStatus.type === 'active' ? theme.accent : '#FFA500' }
              ]}>
                <Text style={styles.statusText}>{memberStatus.message}</Text>
                {memberStatus.type === 'paused' && (
                  <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
                    <Text style={styles.manageLink}>Manage Membership</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Hero Intro */}
          <View style={styles.heroSection}>
            {/* Subscription Box Image Placeholder */}
            <View style={[styles.boxImageContainer, { backgroundColor: theme.cardBackground }]}>
              <Ionicons name="cube" size={80} color={theme.accent} />
              <Text style={[styles.boxImageLabel, { color: theme.textSecondary }]}>
                Tea & Tincture Box
              </Text>
            </View>
            
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
              Sacred Monthly Practice
            </Text>
            <Text style={[styles.heroSubtext, { color: theme.textSecondary }]}>
              A guided ritual to set intentions and receive guidance for the month ahead.
            </Text>
          </View>

          {/* Tea & Tincture Box Card */}
          <View style={[styles.boxCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.boxHeader}>
              <Ionicons name="gift" size={24} color={theme.accent} />
              <Text style={[styles.boxTitle, { color: theme.textPrimary }]}>
                Tea & Tincture Box
              </Text>
            </View>
            <Text style={[styles.boxDescription, { color: theme.textSecondary }]}>
              {isPremium 
                ? `Included with Rooted & Growing +. Ships ${ritualData.ship_window} each month. Join by the ${ritualData.cutoff_date} to receive this month's box.`
                : 'Upgrade once—get all 44 cards, advanced spreads, monthly rituals, and the Tea & Tincture of the Month delivered.'
              }
            </Text>
          </View>

          {/* FAQ Section - Below Tea & Tincture Box */}
          <TouchableOpacity 
            style={[styles.faqHeader, { backgroundColor: theme.cardBackground }]}
            onPress={() => setShowFAQ(!showFAQ)}
          >
            <Text style={[styles.faqTitle, { color: theme.textPrimary }]}>FAQ</Text>
            <Ionicons 
              name={showFAQ ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.textSecondary} 
            />
          </TouchableOpacity>

          {showFAQ && (
            <View style={[styles.faqContent, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: theme.textPrimary }]}>
                  When do boxes ship?
                </Text>
                <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                  Between the {ritualData.ship_window}. Join by the {ritualData.cutoff_date} to receive the current month.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: theme.textPrimary }]}>
                  Pause or cancel?
                </Text>
                <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                  Anytime in Membership Settings.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: theme.textPrimary }]}>
                  Sensitive to an herb?
                </Text>
                <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                  Check ingredients, ask the Herbalist, and consult a professional if needed.
                </Text>
              </View>
            </View>
          )}

          {/* Box Circle Community Section */}
          <BoxCirclePreview />

          {/* Ritual Steps */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Ritual Steps
          </Text>
          
          {ritualSteps.map((step) => (
            <TouchableOpacity 
              key={step.id} 
              style={[styles.stepCard, { backgroundColor: theme.cardBackground }]}
              onPress={() => {
                if (step.selectable && !step.locked) {
                  if (step.id === 2) { // Monthly Intention
                    setShowIntentions(!showIntentions);
                  } else if (step.id === 3) { // Integration Practice
                    setShowDailyActions(!showDailyActions);
                  }
                }
              }}
              activeOpacity={step.selectable && !step.locked ? 0.7 : 1}
            >
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
                  <Text style={styles.stepNumberText}>{step.id}</Text>
                </View>
                <Ionicons name={step.icon as any} size={20} color={theme.accent} />
                <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>
                  {step.title}
                </Text>
                {step.locked && (
                  <Ionicons name="lock-closed" size={16} color={theme.textSecondary} />
                )}
                {step.selectable && !step.locked && (
                  <Ionicons 
                    name={
                      (showDailyActions && step.id === 3) || (showIntentions && step.id === 2) 
                        ? "chevron-up" 
                        : "chevron-down"
                    } 
                    size={16} 
                    color={theme.textSecondary} 
                  />
                )}
              </View>
              <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                {step.description}
              </Text>
              {step.locked && (
                <Text style={[styles.lockedText, { color: theme.accent }]}>
                  Included with Rooted & Growing +
                </Text>
              )}
              
              {/* Monthly Intentions Selector */}
              {step.selectable && step.id === 2 && showIntentions && !step.locked && (
                <View style={[styles.dailyActionsContainer, { backgroundColor: `${theme.accent}10` }]}>
                  <Text style={[styles.dailyActionsTitle, { color: theme.textPrimary }]}>
                    Choose Your Monthly Intention:
                  </Text>
                  {monthlyIntentions.map((intention, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.actionOption,
                        { 
                          backgroundColor: selectedIntention === intention ? theme.accent : 'transparent',
                          borderColor: theme.accent 
                        }
                      ]}
                      onPress={() => setSelectedIntention(intention)}
                    >
                      <Text style={[
                        styles.actionText,
                        { 
                          color: selectedIntention === intention ? '#fff' : theme.textPrimary 
                        }
                      ]}>
                        {intention}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {selectedIntention && (
                    <Text style={[styles.selectedActionText, { color: theme.accent }]}>
                      ✨ Selected: {selectedIntention}
                    </Text>
                  )}
                </View>
              )}

              {/* Daily Actions Selector for Integration Practice */}
              {step.selectable && step.id === 3 && showDailyActions && !step.locked && (
                <View style={[styles.dailyActionsContainer, { backgroundColor: `${theme.accent}10` }]}>
                  <Text style={[styles.dailyActionsTitle, { color: theme.textPrimary }]}>
                    Choose Your Daily Practice:
                  </Text>
                  {dailyActions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.actionOption,
                        { 
                          backgroundColor: selectedAction === action ? theme.accent : 'transparent',
                          borderColor: theme.accent 
                        }
                      ]}
                      onPress={() => setSelectedAction(action)}
                    >
                      <Text style={[
                        styles.actionText,
                        { 
                          color: selectedAction === action ? '#fff' : theme.textPrimary 
                        }
                      ]}>
                        {action}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {selectedAction && (
                    <Text style={[styles.selectedActionText, { color: theme.accent }]}>
                      ✨ Selected: {selectedAction}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Ritual Guidance Panel */}
          <View style={[styles.guidanceCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.guidanceTitle, { color: theme.textPrimary }]}>
              Ritual Guidance
            </Text>
            <Text style={[styles.guidanceText, { color: theme.textSecondary }]}>
              Each monthly ritual includes simple instructions, meditation prompts, and journaling questions. 
              Plan for 30-45 minutes of peaceful reflection.
            </Text>
            
            <TouchableOpacity 
              style={[styles.ritualButton, { backgroundColor: theme.accent }]}
              onPress={() => {
                if (isPremium) {
                  const queryParams = new URLSearchParams();
                  if (selectedIntention) queryParams.set('intention', selectedIntention);
                  if (selectedAction) queryParams.set('practice', selectedAction);
                  
                  const queryString = queryParams.toString();
                  const url = queryString ? `/ritual-experience?${queryString}` : '/ritual-experience';
                  router.push(url);
                } else {
                  router.push('/upgrade');
                }
              }}
            >
              <Ionicons name={isPremium ? "play" : "lock-closed"} size={20} color="#fff" />
              <Text style={styles.ritualButtonText}>
                {isPremium ? "Begin This Month's Ritual" : "Upgrade to Rooted & Growing +"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Moved to interactive ritual experience page */}

          {/* Upgrade CTA for free users */}
          {!isPremium && (
            <View style={[styles.upgradeCard, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.upgradeTitle, { color: theme.textPrimary }]}>
                Unlock Rooted & Growing +
              </Text>
              <View style={styles.upgradeBullets}>
                <Text style={[styles.upgradeBullet, { color: theme.textSecondary }]}>
                  • All 44 oracle cards + advanced spreads
                </Text>
                <Text style={[styles.upgradeBullet, { color: theme.textSecondary }]}>
                  • Monthly ritual & members library
                </Text>
                <Text style={[styles.upgradeBullet, { color: theme.textSecondary }]}>
                  • Tea & Tincture of the Month delivered
                </Text>
                <Text style={[styles.upgradeBullet, { color: theme.textSecondary }]}>
                  • Pause or cancel anytime
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.upgradeButton, { backgroundColor: theme.accent }]}
                onPress={() => router.push('/upgrade')}
              >
                <Text style={styles.upgradeButtonText}>Upgrade & Join the Club</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}