// Browse Deck Screen - Elegant 2-column grid with full card thumbnails

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSeasonalTheme } from '../constants/theme';
import { ORACLE_CARDS } from '../constants/cards';
import { useSubscription } from '../hooks/useSubscription';
import { PremiumBadge } from '../components/PremiumBadge';
import { BackHeader } from '../components/BackHeader';
import { logUpgradeCTATapped, logPeekModeView, logPeekModeUpgradeTapped } from '../utils/analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = 16;
const PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - COLUMN_GAP) / 2;

const CARD_IMAGES: Record<string, any> = {
  'roots.png': require('../assets/cards/roots.png'),
  'soil.png': require('../assets/cards/soil.png'),
  'foundation.png': require('../assets/cards/foundation.png'),
  'water.png': require('../assets/cards/water.png'),
  'sunlight.png': require('../assets/cards/sunlight.png'),
  'nurture.png': require('../assets/cards/nurture.png'),
  'seedling.png': require('../assets/cards/seedling.png'),
  'bloom.png': require('../assets/cards/bloom.png'),
  'expand.png': require('../assets/cards/expand.png'),
  'prune.png': require('../assets/cards/prune.png'),
  'compost.png': require('../assets/cards/compost.png'),
  'renew.png': require('../assets/cards/renew.png'),
  'joy.png': require('../assets/cards/joy.png'),
  'growth.png': require('../assets/cards/growth.png'),
  'patience.png': require('../assets/cards/patience.png'),
  'balance.png': require('../assets/cards/balance.png'),
  'nature.png': require('../assets/cards/nature.png'),
  'abundance.png': require('../assets/cards/abundance.png'),
  'weeds.png': require('../assets/cards/weeds.png'),
  'greenthumb.png': require('../assets/cards/greenthumb.png'),
  'trowel.png': require('../assets/cards/trowel.png'),
  'gardenbed.png': require('../assets/cards/gardenbed.png'),
  'greenhouse.png': require('../assets/cards/greenhouse.png'),
  'mulch.png': require('../assets/cards/mulch.png'),
  'pestcontrol.png': require('../assets/cards/pestcontrol.png'),
  'irrigation.png': require('../assets/cards/irrigation.png'),
  'fertilize.png': require('../assets/cards/fertilize.png'),
  'wind.png': require('../assets/cards/wind.png'),
  'rain.png': require('../assets/cards/rain.png'),
  'trim.png': require('../assets/cards/trim.png'),
  'rooted.png': require('../assets/cards/rooted.png'),
  'mindfulness.png': require('../assets/cards/mindfulness.png'),
  'gratitude.png': require('../assets/cards/gratitude.png'),
  'diversity.png': require('../assets/cards/diversity.png'),
  'sow.png': require('../assets/cards/sow.png'),
  'cultivate.png': require('../assets/cards/cultivate.png'),
  'gather.png': require('../assets/cards/gather.png'),
  'strengthen.png': require('../assets/cards/strengthen.png'),
  'harvest.png': require('../assets/cards/harvest.png'),
  'wintering.png': require('../assets/cards/wintering.png'),
  'sanctuary.png': require('../assets/cards/sanctuary.png'),
  'meditate.png': require('../assets/cards/meditate.png'),
  'blossom.png': require('../assets/cards/blossom.png'),
  'emergence.png': require('../assets/cards/emergence.png'),
};

export default function BrowseDeckScreen() {
  const router = useRouter();
  const theme = getSeasonalTheme();
  const { isPremium, loading } = useSubscription();
  // Modal state removed - using direct navigation to /upgrade

  const handleCardPress = async (item: any) => {
    // If card is premium and user doesn't have subscription, show peek mode
    if (item.isPremium && !isPremium) {
      // Track peek mode view and upgrade tap
      try {
        await logPeekModeView(item.id);
        await logPeekModeUpgradeTapped(item.id);
        await logUpgradeCTATapped('locked_card', 'peek_mode_upgrade_tap');
      } catch (error) {
        console.error('Error tracking peek mode interaction:', error);
      }
      
      // Navigate to upgrade page (peek mode shows teaser, then leads to upgrade)
      router.push('/upgrade');
    } else {
      router.push(`/card/${item.id}`);
    }
  };

  const renderCard = ({ item }: { item: any }) => {
    const isLocked = item.isPremium && !isPremium;

    return (
      <TouchableOpacity
        style={[styles.cardItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image
            source={CARD_IMAGES[item.image]}
            style={[styles.cardThumbnail, isLocked && styles.blurredImage]}
            resizeMode="contain"
          />
          {isLocked && (
            <View style={styles.peekOverlay}>
              <PremiumBadge size="small" />
              {item.teaser && (
                <View style={styles.teaserContainer}>
                  <Text style={[styles.teaserText, { color: theme.textSecondary }]} numberOfLines={3}>
                    {item.teaser}
                  </Text>
                  <Text style={[styles.unlockPrompt, { color: theme.accent }]}>
                    Tap to unlock full wisdom →
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        <View style={[styles.titlePill, { backgroundColor: theme.accent }]}>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={[theme.background.start, theme.background.end]}
          style={[styles.gradient, styles.centered]}
        >
          <ActivityIndicator size="large" color={theme.accent} />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[theme.background.start, theme.background.end]}
        style={styles.gradient}
      >
        {/* Header with Back Button */}
        <BackHeader 
          title="Browse Deck" 
          theme={theme}
          rightButton={
            <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
              <Ionicons name="home" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          }
        />
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {isPremium ? '44 Cards' : '12 Free + 32 Premium'}
        </Text>

        {/* Grid */}
        <FlatList
          data={ORACLE_CARDS}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  gridContent: {
    padding: PADDING,
    paddingBottom: 40,
  },
  columnWrapper: {
    gap: COLUMN_GAP,
    marginBottom: COLUMN_GAP,
  },
  cardItem: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 2 / 3,
    padding: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardThumbnail: {
    width: '100%',
    height: '100%',
  },
  blurredImage: {
    opacity: 0.6,
  },
  peekOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  teaserContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  teaserText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  unlockPrompt: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  titlePill: {
    position: 'absolute',
    bottom: -12,
    left: '10%',
    right: '10%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});