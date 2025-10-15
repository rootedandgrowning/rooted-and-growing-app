// Meditation Library Screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getSeasonalTheme } from '../../constants/theme';
import { MEDITATIONS, getFreeMeditations, getPremiumMeditations } from '../../constants/meditations';
import { useSubscription } from '../../hooks/useSubscription';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function MeditationsScreen() {
  const theme = getSeasonalTheme();
  const router = useRouter();
  const { isPremium, loading } = useSubscription();

  const freeMeditations = getFreeMeditations();
  const premiumMeditations = getPremiumMeditations();

  const handleMeditationPress = (meditation: any) => {
    if (meditation.isPremium && !isPremium) {
      router.push('/upgrade');
    } else {
      // Future: Open meditation player
      if (meditation.videoUrl) {
        // Play meditation
      } else {
        if (Platform.OS === 'web') {
          alert('Meditation audio coming soon! 🧘‍♀️\n\nThis meditation will guide you through a peaceful practice.');
        }
      }
    }
  };

  const MeditationCard = ({ meditation, index }: { meditation: any; index: number }) => {
    const isLocked = meditation.isPremium && !isPremium;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        style={styles.cardWrapper}
      >
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
          onPress={() => handleMeditationPress(meditation)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={meditation.type === 'audio' ? 'headset' : 'videocam'}
                size={28}
                color={theme.accent}
              />
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.titleRow}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                  {meditation.title}
                </Text>
                {isLocked && (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={14} color="#fff" />
                  </View>
                )}
              </View>
              <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                {meditation.description}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    {meditation.duration}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="sunny-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    {meditation.category}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[theme.background.start, theme.background.end]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Meditation Library
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Guided practices for grounding and reflection
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Free Meditations Section */}
          {freeMeditations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="gift" size={20} color={theme.accent} />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  Free Meditations
                </Text>
              </View>
              {freeMeditations.map((meditation, index) => (
                <MeditationCard key={meditation.id} meditation={meditation} index={index} />
              ))}
            </View>
          )}

          {/* Premium Meditations Section */}
          {premiumMeditations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sparkles" size={20} color={theme.accent} />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  Premium Meditations
                </Text>
                {!isPremium && (
                  <TouchableOpacity
                    style={[styles.upgradeChip, { backgroundColor: theme.accent }]}
                    onPress={() => router.push('/upgrade')}
                  >
                    <Text style={styles.upgradeChipText}>Unlock All</Text>
                  </TouchableOpacity>
                )}
              </View>
              {premiumMeditations.map((meditation, index) => (
                <MeditationCard
                  key={meditation.id}
                  meditation={meditation}
                  index={freeMeditations.length + index}
                />
              ))}
            </View>
          )}

          {/* Upgrade CTA for Non-Premium Users */}
          {!isPremium && (
            <View style={[styles.upgradeCard, { backgroundColor: theme.accent }]}>
              <Ionicons name="leaf" size={32} color="#fff" style={{ marginBottom: 8 }} />
              <Text style={styles.upgradeTitle}>Unlock Rooted & Growing +</Text>
              <Text style={styles.upgradeDescription}>
                Access all premium meditations, 44 oracle cards, monthly rituals, and your Tea & Tincture subscription.
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.push('/upgrade')}
              >
                <Text style={[styles.upgradeButtonText, { color: theme.accent }]}>
                  Learn More
                </Text>
                <Ionicons name="arrow-forward" size={16} color={theme.accent} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  upgradeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  upgradeChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(91, 140, 90, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  lockBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  upgradeCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  upgradeDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
