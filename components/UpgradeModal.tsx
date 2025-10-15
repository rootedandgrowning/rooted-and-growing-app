import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getSeasonalTheme } from '../constants/theme';
import { logUpgradeCTATapped } from '../utils/analytics';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  source?: 'locked_card' | 'box_circle_preview' | 'journal_footer' | 'home_banner';
  variant?: 'locked_card' | 'box_circle' | 'journal' | 'home';
}

export function UpgradeModal({ 
  visible, 
  onClose, 
  source = 'locked_card',
  variant = 'locked_card' 
}: UpgradeModalProps) {
  const router = useRouter();
  const theme = getSeasonalTheme();

  const handleUpgradePress = async () => {
    try {
      // Track the CTA click
      await logUpgradeCTATapped(source, 'upgrade_modal');
      
      // Navigate to upgrade page
      router.push('/upgrade');
      onClose();
    } catch (error) {
      console.error('Error tracking upgrade CTA:', error);
      // Still navigate even if tracking fails
      router.push('/upgrade');
      onClose();
    }
  };

  const getContent = () => {
    switch (variant) {
      case 'locked_card':
        return {
          title: 'Unlock the Full Garden',
          body: 'Get all 44 cards, advanced spreads, Monthly Ritual, and the Tea & Tincture of the Month delivered.',
          bullets: [
            '32 premium cards + spreads',
            'Monthly ritual & members library', 
            'Tea & Tincture box included',
            'Pause or cancel anytime'
          ],
          cta: 'Upgrade & Join the Club',
          note: 'Join by the 15th to receive this month\'s box (ships 20–25).'
        };
      
      case 'box_circle':
        return {
          title: 'Join the Community',
          body: 'Connect with members sharing their tea and tincture experiences.',
          bullets: [
            'Share your monthly experiences',
            'Get tips from the community',
            'Access to AI Herbalist guidance',
            'Monthly ritual support'
          ],
          cta: 'See the Box Circle (Upgrade)',
          note: 'Upgrade once—get all 44 cards and the Tea & Tincture of the Month.'
        };

      case 'journal':
        return {
          title: 'Ready to go deeper next month?',
          body: 'Unlock all 44 cards and the Tea & Tincture of the Month.',
          bullets: [
            'Advanced journaling with premium cards',
            'Monthly ritual guidance', 
            'Tea & Tincture delivered monthly',
            'Community support'
          ],
          cta: 'Upgrade to Rooted & Growing +',
          note: ''
        };

      default:
        return {
          title: 'Unlock the Full Garden',
          body: 'Get all 44 cards, advanced spreads, Monthly Ritual, and the Tea & Tincture of the Month delivered.',
          bullets: [
            '32 premium cards + spreads',
            'Monthly ritual & members library', 
            'Tea & Tincture box included',
            'Pause or cancel anytime'
          ],
          cta: 'Upgrade & Join the Club',
          note: 'Join by the 15th to receive this month\'s box (ships 20–25).'
        };
    }
  };

  const content = getContent();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Rooted & Growing +
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Hero Section */}
            <View style={[styles.heroSection, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
                {content.title}
              </Text>
              <Text style={[styles.heroBody, { color: theme.textSecondary }]}>
                {content.body}
              </Text>
            </View>

            {/* Features List */}
            <View style={styles.featuresSection}>
              {content.bullets.map((bullet, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={[styles.bulletPoint, { backgroundColor: theme.accent }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                  <Text style={[styles.featureText, { color: theme.textPrimary }]}>
                    {bullet}
                  </Text>
                </View>
              ))}
            </View>

            {/* Note */}
            {content.note && (
              <View style={[styles.noteSection, { backgroundColor: 'rgba(139, 115, 85, 0.1)' }]}>
                <Ionicons name="information-circle" size={20} color={theme.accent} />
                <Text style={[styles.noteText, { color: theme.textPrimary }]}>
                  {content.note}
                </Text>
              </View>
            )}

            {/* CTA Button */}
            <TouchableOpacity 
              style={[styles.ctaButton, { backgroundColor: theme.accent }]}
              onPress={handleUpgradePress}
            >
              <Text style={styles.ctaText}>{content.cta}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Fine Print */}
            <Text style={[styles.finePrint, { color: theme.textSecondary }]}>
              Monthly or annual subscription. Cancel anytime in settings.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  heroSection: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  heroBody: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bulletPoint: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  finePrint: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});