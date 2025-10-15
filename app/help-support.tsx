// Help & Support Screen

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSeasonalTheme } from '../constants/theme';

export default function HelpSupportScreen() {
  const router = useRouter();
  const theme = getSeasonalTheme();

  const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
    <View style={[styles.faqItem, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.question, { color: theme.textPrimary }]}>{question}</Text>
      <Text style={[styles.answer, { color: theme.textSecondary }]}>{answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[theme.background.start, theme.background.end]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Help & Support
          </Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Ionicons name="home" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: theme.accent }]}
            onPress={() => Linking.openURL('https://rootedandgrowing.app/support')}
          >
            <Ionicons name="mail" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Frequently Asked Questions
          </Text>

          <FAQItem
            question="How do I draw a daily card?"
            answer="Go to the Daily Draw screen and tap Shuffle & Draw. You can draw one card per day for guidance and reflection."
          />

          <FAQItem
            question="What is the Weekly Collective Card?"
            answer="Each Sunday, a new card is revealed that the entire Soulshine community reflects on together. Check the Weekly Card tab to see this week's card."
          />

          <FAQItem
            question="How do I unlock premium features?"
            answer="Subscribe to the Soulshine Ritual Box and scan the QR code inside to unlock the full 44-card deck, spreads, and monthly rituals."
          />

          <FAQItem
            question="Where is my journal stored?"
            answer="Your journal entries are stored locally on your device for privacy. They will persist across app updates but will be lost if you uninstall the app."
          />

          <FAQItem
            question="Can I change the seasonal theme?"
            answer="Yes! Go to Settings > Seasonal Theme to choose Auto (by date) or manually select Spring, Summer, Autumn, or Winter."
          />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    marginBottom: 32,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  faqItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  answer: {
    fontSize: 15,
    lineHeight: 22,
  },
});