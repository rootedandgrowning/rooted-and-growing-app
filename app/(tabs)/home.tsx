// Home Screen - Restructured for Apple compliance
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getSeasonalTheme } from '../../constants/theme';
import { VideoPlayer } from '../../components/VideoPlayer';
import { useSubscription } from '../../hooks/useSubscription';

const theme = getSeasonalTheme();

export default function HomeScreen() {
  const router = useRouter();
  const { isPremium } = useSubscription();

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
          {/* Logo and Video */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <VideoPlayer style={styles.video} title="Welcome to Rooted & Growing" />
          </View>

          {/* Herbal Circle Card */}
          <TouchableOpacity
            style={[styles.featureCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => Linking.openURL('https://rootedandgrowing.app/box')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Ionicons name="leaf" size={24} color={theme.accent} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Herbal Circle
              </Text>
            </View>
            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
              Our monthly Tea & Tincture community. Guided recipes, seasonal rituals, and herbal care shipped to your door.
            </Text>
            <View style={styles.cardAction}>
              <Text style={[styles.actionText, { color: theme.accent }]}>Explore on our site</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.accent} />
            </View>
          </TouchableOpacity>

          {/* Monthly Ritual Card */}
          <TouchableOpacity
            style={[styles.featureCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => {
              if (isPremium) {
                router.push('/ritual');
              } else {
                // For Apple compliance - show upgrade path via external website
                Linking.openURL('https://rootedandgrowing.app');
              }
            }}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                {!isPremium && <Ionicons name="lock-closed" size={16} color={theme.textSecondary} style={styles.lockIcon} />}
                <Ionicons name="moon" size={24} color={isPremium ? theme.accent : theme.textSecondary} />
              </View>
              <Text style={[styles.cardTitle, { color: isPremium ? theme.textPrimary : theme.textSecondary }]}>
                Monthly Ritual
              </Text>
            </View>
            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
              A guided seasonal practice to deepen your roots and invite growth.
            </Text>
            <View style={styles.cardAction}>
              <Text style={[styles.actionText, { color: isPremium ? theme.accent : theme.textSecondary }]}>
                {isPremium ? 'Begin ritual' : 'Become a Supporter'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={isPremium ? theme.accent : theme.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Keep Your Journal */}
          <TouchableOpacity
            style={[styles.featureCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => router.push('/(tabs)/journal')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Ionicons name="create" size={24} color={theme.accent} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Keep Your Journal
              </Text>
            </View>
            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
              Reflect on your daily draws and track your spiritual growth.
            </Text>
            <View style={styles.cardAction}>
              <Text style={[styles.actionText, { color: theme.accent }]}>Open journal</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.accent} />
            </View>
          </TouchableOpacity>

          {/* Deepen Your Practice - Meditations */}
          <TouchableOpacity
            style={[styles.featureCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => router.push('/(tabs)/meditations')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Ionicons name="headset" size={24} color={theme.accent} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Deepen Your Practice
              </Text>
            </View>
            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
              Guided meditations and mindfulness practices for your journey.
            </Text>
            <View style={styles.cardAction}>
              <Text style={[styles.actionText, { color: theme.accent }]}>Explore meditations</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.accent} />
            </View>
          </TouchableOpacity>

          {/* Settings & Support */}
          <TouchableOpacity
            style={[styles.featureCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => router.push('/(tabs)/more')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Ionicons name="settings" size={24} color={theme.accent} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Settings & Support
              </Text>
            </View>
            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
              Customize your experience and get help when needed.
            </Text>
            <View style={styles.cardAction}>
              <Text style={[styles.actionText, { color: theme.accent }]}>Open settings</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.accent} />
            </View>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  featureCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    marginRight: 12,
    position: 'relative',
  },
  lockIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});