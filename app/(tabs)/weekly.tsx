// Weekly Collective Card Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfWeek } from 'date-fns';
import { getSeasonalTheme } from '../../constants/theme';
import { getCardById } from '../../constants/cards';
import { CardPlaceholder } from '../../components/CardPlaceholder';
import { OracleCardImage } from '../../components/OracleCardImage';
import { useSubscription } from '../../hooks/useSubscription';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function WeeklyCardScreen() {
  const theme = getSeasonalTheme();
  const router = useRouter();
  const { isPremium } = useSubscription();

  const [weeklyCard, setWeeklyCard] = useState<any>(null);
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [communityReflections, setCommunityReflections] = useState<any[]>([]);
  const [myReflection, setMyReflection] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [weekStart, setWeekStart] = useState('');

  useEffect(() => {
    loadWeeklyCard();
  }, []);

  const loadWeeklyCard = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/weekly-card`);
      
      if (response.ok) {
        const data = await response.json();
        const card = getCardById(data.card_id);
        setWeeklyCard(card);
        setReflection(data.reflection);
        setWeekStart(data.week_start);
        
        // Load community data
        loadCommunityData(data.week_start, data.card_id);
      } else {
        console.error('Failed to fetch weekly card');
      }
    } catch (error) {
      console.error('Error loading weekly card:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCommunityData = async (weekStart: string, cardId: string) => {
    try {
      // Fetch reflection count
      const countResponse = await fetch(`${BACKEND_URL}/api/reflection-count/${weekStart}/${cardId}`);
      if (countResponse.ok) {
        const countData = await countResponse.json();
        setReflectionCount(countData.count);
      }

      // Fetch community reflections
      const reflectionsResponse = await fetch(`${BACKEND_URL}/api/community-reflections/${weekStart}/${cardId}`);
      if (reflectionsResponse.ok) {
        const reflectionsData = await reflectionsResponse.json();
        setCommunityReflections(reflectionsData);
      }
    } catch (error) {
      console.error('Error loading community data:', error);
    }
  };

  const handleShareReflection = async () => {
    if (!myReflection.trim() || !weeklyCard) {
      window.alert('Please write a reflection before sharing.');
      return;
    }

    setIsSharing(true);

    try {
      const snippet = myReflection.trim().substring(0, 140);

      const response = await fetch(`${BACKEND_URL}/api/community-reflection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          week_start: weekStart,
          card_id: weeklyCard.id,
          reflection_snippet: snippet,
        }),
      });

      if (response.ok) {
        window.alert('Shared! 🌿\n\nYour reflection has been shared anonymously with the community.');
        setMyReflection('');
        // Reload community data to show new reflection
        loadCommunityData(weekStart, weeklyCard.id);
      } else {
        window.alert('Error: Could not share reflection. Please try again.');
      }
    } catch (error) {
      console.error('Error sharing reflection:', error);
      window.alert('Error: Could not share reflection. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWeeklyCard();
  };

  const getBotanicalVariant = () => {
    const variants = ['leaf', 'seed', 'moon', 'flower'];
    const seasonIndex = ['spring', 'summer', 'autumn', 'winter'].indexOf(theme.name);
    return variants[seasonIndex] as 'leaf' | 'seed' | 'moon' | 'flower';
  };

  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday
  const formattedWeek = format(currentWeekStart, 'MMMM d, yyyy');

  if (loading) {
    return (
      <LinearGradient
        colors={[theme.background.start, theme.background.end]}
        style={styles.container}
      >
        <ActivityIndicator size="large" color={theme.accent} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[theme.background.start, theme.background.end]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Weekly Collective Card
          </Text>
          <Text style={[styles.weekDate, { color: theme.textSecondary }]}>
            Week of {formattedWeek}
          </Text>
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="people" size={22} color={theme.accent} />
          <Text style={[styles.infoText, { color: theme.textPrimary }]}>
            This card is shared with the entire Soulshine community. We're all reflecting together.
          </Text>
        </View>

        {/* Card Display */}
        {weeklyCard ? (
          <>
            <View style={styles.cardContainer}>
              <OracleCardImage name={weeklyCard.image} style={styles.cardImage} />
              <View style={styles.cardTitleOverlay}>
                <Text style={styles.cardTitle}>{weeklyCard.title}</Text>
                <Text style={styles.cardShort}>{weeklyCard.short}</Text>
              </View>
            </View>

            {/* Soulshine Reflection */}
            <View style={styles.reflectionContainer}>
              <Text style={[styles.reflectionTitle, { color: theme.textPrimary }]}>
                From Soulshine
              </Text>
              <Text style={[styles.reflectionText, { color: theme.textPrimary }]}>
                {reflection}
              </Text>
            </View>

            {/* Card Description */}
            <View style={styles.descriptionContainer}>
              <Text style={[styles.description, { color: theme.textPrimary }]}>
                {weeklyCard.description}
              </Text>
            </View>

            {/* Share Your Reflection Section */}
            <View style={styles.shareSection}>
              <Text style={[styles.shareSectionTitle, { color: theme.textPrimary }]}>
                Share Your Reflection
              </Text>
              <Text style={[styles.shareSectionSubtitle, { color: theme.textSecondary }]}>
                Your reflection will be shared anonymously with the community (max 140 characters)
              </Text>
              
              <TextInput
                style={[styles.reflectionInput, { 
                  color: theme.textPrimary,
                  borderColor: theme.accent + '40',
                  backgroundColor: theme.cardBackground,
                }]}
                placeholder="What does this card mean to you?"
                placeholderTextColor={theme.textSecondary}
                value={myReflection}
                onChangeText={setMyReflection}
                multiline
                numberOfLines={4}
                maxLength={140}
              />
              
              <View style={styles.shareButtonContainer}>
                <Text style={[styles.charCount, { color: theme.textSecondary }]}>
                  {myReflection.length}/140
                </Text>
                <TouchableOpacity
                  style={[
                    styles.shareButton,
                    { backgroundColor: theme.accent },
                    isSharing && styles.shareButtonDisabled,
                  ]}
                  onPress={handleShareReflection}
                  disabled={isSharing}
                >
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  <Text style={styles.shareButtonText}>
                    {isSharing ? 'Sharing...' : 'Share Anonymously'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Community Reflections Section */}
            <View style={styles.communitySection}>
              <Text style={[styles.communitySectionTitle, { color: theme.textPrimary }]}>
                Community Reflections
              </Text>
              
              {/* Reflection Count */}
              {reflectionCount > 0 && (
                <View style={[styles.countBadge, { backgroundColor: theme.accent + '20' }]}>
                  <Ionicons name="people" size={18} color={theme.accent} />
                  <Text style={[styles.countText, { color: theme.accent }]}>
                    {reflectionCount} {reflectionCount === 1 ? 'person is' : 'people are'} reflecting on this card
                  </Text>
                </View>
              )}

              {/* Anonymous Reflections */}
              {communityReflections.length > 0 ? (
                <View style={styles.reflectionsList}>
                  {communityReflections.map((item, index) => (
                    <View 
                      key={index} 
                      style={[styles.reflectionItem, { backgroundColor: theme.cardBackground }]}
                    >
                      <Text style={[styles.reflectionSnippet, { color: theme.textPrimary }]}>
                        "{item.reflection_snippet}"
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                reflectionCount === 0 && (
                  <Text style={[styles.noReflectionsText, { color: theme.textSecondary }]}>
                    Be the first to share a reflection with the community!
                  </Text>
                )
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Weekly Card Yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Check back on Sunday for this week's collective card.
            </Text>
          </View>
        )}

        {/* Upgrade Footer CTA - Only for Free Users */}
        {!isPremium && weeklyCard && (
          <TouchableOpacity
            style={[styles.upgradeFooter, { backgroundColor: theme.cardBackground, borderColor: theme.accent }]}
            onPress={() => router.push('/upgrade')}
            activeOpacity={0.7}
          >
            <View style={styles.upgradeFooterContent}>
              <Ionicons name="sparkles" size={20} color={theme.accent} />
              <View style={styles.upgradeFooterText}>
                <Text style={[styles.upgradeFooterTitle, { color: theme.textPrimary }]}>
                  Want to go deeper?
                </Text>
                <Text style={[styles.upgradeFooterSubtitle, { color: theme.textSecondary }]}>
                  Explore Rooted & Growing +
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={theme.accent} />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  weekDate: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cardTitleOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardShort: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  reflectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  reflectionText: {
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  descriptionContainer: {
    paddingHorizontal: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  emptyState: {
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
  },
  communitySection: {
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
  },
  communitySectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  countText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  reflectionsList: {
    gap: 12,
  },
  reflectionItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reflectionSnippet: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  noReflectionsText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  shareSection: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  shareSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  shareSectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  reflectionInput: {
    minHeight: 100,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  shareButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 13,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  upgradeFooter: {
    marginTop: 32,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  upgradeFooterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeFooterText: {
    flex: 1,
  },
  upgradeFooterTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  upgradeFooterSubtitle: {
    fontSize: 13,
  },
});