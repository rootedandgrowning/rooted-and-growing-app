import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '../components/BackHeader';
import { getSeasonalTheme } from '../constants/theme';

export default function HelpScreen() {
  const router = useRouter();
  const theme = getSeasonalTheme();

  const handleEmailSupport = () => {
    const email = 'hello@soulshinewellness.co';
    const subject = 'Rooted & Growing Oracle App - Support Request';
    const body = 'Hi there,\n\nI need help with the Rooted & Growing Oracle app.\n\n[Please describe your issue or question here]\n\nThanks!';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        'Contact Support',
        `Please email us at: ${email}`,
        [
          { text: 'Cancel' },
          { 
            text: 'Copy Email', 
            onPress: () => {
              // Note: Clipboard not available in web, would need @react-native-clipboard/clipboard
              Alert.alert('Email Address', email);
            }
          }
        ]
      );
    });
  };

  const FAQItem = ({ 
    question, 
    answer, 
    icon 
  }: { 
    question: string; 
    answer: string; 
    icon: string;
  }) => (
    <View style={[styles.faqItem, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.faqHeader}>
        <Ionicons name={icon as any} size={20} color={theme.accent} />
        <Text style={[styles.faqQuestion, { color: theme.textPrimary }]}>
          {question}
        </Text>
      </View>
      <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
        {answer}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
      <BackHeader title="Help & Support" />
      
      <ScrollView style={styles.scrollView}>
        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Need Help?
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            We're here to support your oracle journey. Reach out anytime with questions or feedback.
          </Text>
          
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: theme.accent }]}
            onPress={handleEmailSupport}
          >
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>
              Email Support
            </Text>
            <Text style={styles.contactButtonSubtitle}>
              hello@soulshinewellness.co
            </Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Frequently Asked Questions
          </Text>

          <FAQItem
            icon="card"
            question="How do oracle cards work?"
            answer="Oracle cards are tools for reflection and intuition. Each card offers wisdom and guidance to help you connect with your inner knowing. There's no right or wrong way to interpret them - trust what resonates with you."
          />

          <FAQItem
            icon="refresh"
            question="Can I draw multiple cards per day?"
            answer="While the app limits you to one daily draw to encourage deeper reflection, you can explore different spreads, browse all cards (with premium), or use the weekly card for additional guidance."
          />

          <FAQItem
            icon="star"
            question="What's included with Rooted & Growing +?"
            answer="Premium membership unlocks the full 44-card deck, advanced spreads (Three Card, Seasonal, Growth), monthly rituals with tea & tincture, meditation library, and community access."
          />

          <FAQItem
            icon="flower"
            question="What's the Tea & Tincture Club?"
            answer="Monthly curated herbal blends delivered to support your ritual practice. Each box includes premium tea, healing tincture, ritual guide, and access to the exclusive community circle."
          />

          <FAQItem
            icon="book"
            question="How does journaling work?"
            answer="Your journal entries are stored locally on your device for privacy. Write reflections, insights, or intentions inspired by your card draws. Your entries remain private and secure."
          />

          <FAQItem
            icon="people"
            question="Is the community anonymous?"
            answer="The Box Circle community allows both identified and anonymous sharing. You can choose to post anonymously for each message, creating a safe space for authentic sharing."
          />

          <FAQItem
            icon="notifications"
            question="How do I manage notifications?"
            answer="Go to Settings > Notifications to customize your daily draw and weekly card reminders. You can enable or disable them anytime, and they're gentle encouragement for your practice."
          />

          <FAQItem
            icon="card"
            question="What if I don't understand a card?"
            answer="Each card includes reflection questions and guidance. Trust your intuition - what you see in the image and feel in the moment is valid. There's wisdom in your personal interpretation."
          />
        </View>

        {/* App Info */}
        <View style={[styles.infoSection, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="information-circle" size={24} color={theme.accent} />
          <View style={styles.infoText}>
            <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>
              About This App
            </Text>
            <Text style={[styles.infoDescription, { color: theme.textSecondary }]}>
              Rooted & Growing Oracle is created with love to support your daily practice of mindfulness, 
              reflection, and connection to your inner wisdom. Every feature is designed to nurture your growth.
            </Text>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Quick Links
          </Text>

          <TouchableOpacity 
            style={[styles.quickLink, { backgroundColor: theme.cardBackground }]}
            onPress={() => router.push('/about')}
          >
            <Ionicons name="information-circle" size={20} color={theme.accent} />
            <Text style={[styles.quickLinkText, { color: theme.textPrimary }]}>
              About & Privacy
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickLink, { backgroundColor: theme.cardBackground }]}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications" size={20} color={theme.accent} />
            <Text style={[styles.quickLinkText, { color: theme.textPrimary }]}>
              Notification Settings
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickLink, { backgroundColor: theme.cardBackground }]}
            onPress={() => router.push('/seasonal-theme')}
          >
            <Ionicons name="color-palette" size={20} color={theme.accent} />
            <Text style={[styles.quickLinkText, { color: theme.textPrimary }]}>
              Seasonal Theme
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  contactButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactButtonSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  faqItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  infoSection: {
    flexDirection: 'row',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  quickLinkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});