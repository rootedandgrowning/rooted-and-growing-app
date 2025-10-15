// Card Spreads Screen - Premium Feature

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSeasonalTheme } from '../constants/theme';
import { BackHeader } from '../components/BackHeader';
import { useRouter } from 'expo-router';

export default function SpreadsScreen() {
  const theme = getSeasonalTheme();
  const router = useRouter();

  const spreads = [
    {
      id: 'three-card',
      title: 'Three Card Spread',
      subtitle: 'Past, Present, Future',
      description: 'Explore your journey with this classic three-card reading',
      icon: 'library',
    },
    {
      id: 'seasonal',
      title: 'Seasonal Spread',
      subtitle: 'Align with nature\'s cycles',
      description: 'A five-card spread honoring the current season\'s energy',
      icon: 'leaf',
    },
    {
      id: 'growth',
      title: 'Growth Spread',
      subtitle: 'Nurture your development',
      description: 'Seven cards to guide your personal growth journey',
      icon: 'trending-up',
    },
  ];

  const handleSpreadPress = (spread: any) => {
    if (spread.id === 'three-card') {
      router.push('/three-card-spread');
    } else if (spread.id === 'seasonal') {
      router.push('/seasonal-spread');
    } else if (spread.id === 'growth') {
      router.push('/growth-spread');
    } else {
      Alert.alert(
        spread.title,
        `${spread.description}\n\nThis spread feature is coming soon! We're working on creating immersive card layout experiences.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <LinearGradient
      colors={[theme.background.start, theme.background.end]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <BackHeader title="Card Spreads" theme={theme} />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Sacred Spreads
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Deepen your practice with intentional card layouts
            </Text>
          </View>

          {spreads.map((spread) => (
            <TouchableOpacity
              key={spread.id}
              style={[styles.spreadCard, { backgroundColor: theme.cardBackground }]}
              onPress={() => handleSpreadPress(spread)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.accent }]}>
                <Ionicons name={spread.icon as any} size={24} color="#fff" />
              </View>
              <View style={styles.spreadInfo}>
                <Text style={[styles.spreadTitle, { color: theme.textPrimary }]}>
                  {spread.title}
                </Text>
                <Text style={[styles.spreadSubtitle, { color: theme.accent }]}>
                  {spread.subtitle}
                </Text>
                <Text style={[styles.spreadDescription, { color: theme.textSecondary }]}>
                  {spread.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}

          <View style={[styles.comingSoonCard, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="people" size={32} color={theme.accent} />
            <Text style={[styles.comingSoonTitle, { color: theme.textPrimary }]}>
              Weekly Collective Card
            </Text>
            <Text style={[styles.comingSoonText, { color: theme.textSecondary }]}>
              Join the community in reflecting on our shared weekly card. Connect with others on the same journey.
            </Text>
            
            <TouchableOpacity
              style={[styles.weeklyButton, { backgroundColor: theme.accent }]}
              onPress={() => router.push('/(tabs)/weekly')}
            >
              <Text style={styles.weeklyButtonText}>Join Community Reflection</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.comingSoonCard, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="sparkles" size={32} color={theme.accent} />
            <Text style={[styles.comingSoonTitle, { color: theme.textPrimary }]}>
              More Spreads Coming Soon
            </Text>
            <Text style={[styles.comingSoonText, { color: theme.textSecondary }]}>
              Moon Phases, Elements, and Custom layouts are in development. Stay tuned!
            </Text>
          </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  spreadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  spreadInfo: {
    flex: 1,
  },
  spreadTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  spreadSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  spreadDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  comingSoonCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  weeklyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  weeklyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});