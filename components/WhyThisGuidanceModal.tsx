// Why This Guidance Modal - Astrological Context Explanation
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
import { getSeasonalTheme } from '../constants/theme';
import type { AstrologyData } from '../utils/astrology';
import { generateGuidanceExplanation } from '../utils/astrology';

const theme = getSeasonalTheme();

interface WhyThisGuidanceModalProps {
  visible: boolean;
  onClose: () => void;
  astrologyData: AstrologyData | null;
  cardTitles: string[];
  spreadType: string;
}

const CONFIDENCE_COLORS = {
  high: '#D4AF37', // Gold
  medium: '#8B9D83', // Sage
  low: '#A17C6B', // Clay
};

const CONFIDENCE_LABELS = {
  high: 'High Precision',
  medium: 'Medium Precision',
  low: 'Low Precision',
};

const CONFIDENCE_DESCRIPTIONS = {
  high: 'Full birth data: date, time, and place provided for accurate cosmic blueprint',
  medium: 'Birth date and place provided; time defaulted to noon',
  low: 'Only birth date provided; approximate calculations used',
};

export function WhyThisGuidanceModal({ 
  visible, 
  onClose, 
  astrologyData, 
  cardTitles, 
  spreadType 
}: WhyThisGuidanceModalProps) {
  if (!astrologyData) return null;

  const explanation = generateGuidanceExplanation(astrologyData, cardTitles);
  const confidenceLevel = astrologyData.confidenceLevel || 'low';
  const confidenceColor = CONFIDENCE_COLORS[confidenceLevel];
  const confidenceLabel = CONFIDENCE_LABELS[confidenceLevel];
  const confidenceDescription = CONFIDENCE_DESCRIPTIONS[confidenceLevel];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background.start }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
            Why This Guidance?
          </Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Confidence Badge */}
          <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + '20', borderColor: confidenceColor }]}>
            <View style={styles.confidenceHeader}>
              <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
              <Text style={[styles.confidenceLabel, { color: confidenceColor }]}>
                {confidenceLevel === 'high' ? '🌕' : confidenceLevel === 'medium' ? '🌓' : '🌑'} {confidenceLabel}
              </Text>
            </View>
            <Text style={[styles.confidenceDescription, { color: theme.textSecondary }]}>
              {confidenceDescription}
            </Text>
          </View>

          <View style={[styles.cosmicCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.cosmicHeader}>
              <Text style={styles.cosmicEmoji}>🌟</Text>
              <Text style={[styles.cosmicTitle, { color: theme.textPrimary }]}>
                Your Cosmic Blueprint
              </Text>
            </View>
            
            <View style={styles.signsContainer}>
              <View style={styles.signCard}>
                <Text style={styles.signEmoji}>☀️</Text>
                <Text style={[styles.signLabel, { color: theme.textSecondary }]}>Sun Sign</Text>
                <Text style={[styles.signName, { color: theme.textPrimary }]}>
                  {astrologyData.sunSign}
                </Text>
              </View>
              
              <View style={styles.signCard}>
                <Text style={styles.signEmoji}>🌙</Text>
                <Text style={[styles.signLabel, { color: theme.textSecondary }]}>Moon Sign</Text>
                <Text style={[styles.signName, { color: theme.textPrimary }]}>
                  {astrologyData.moonSign}
                  {astrologyData.isMoonApprox && (
                    <Text style={[styles.approxText, { color: theme.textSecondary }]}> ~</Text>
                  )}
                </Text>
              </View>
              
              <View style={styles.signCard}>
                <Text style={styles.signEmoji}>🌕</Text>
                <Text style={[styles.signLabel, { color: theme.textSecondary }]}>Moon Phase</Text>
                <Text style={[styles.signName, { color: theme.textPrimary }]}>
                  {astrologyData.moonPhase}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.explanationCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.explanationTitle, { color: theme.textPrimary }]}>
              🔮 Cosmic Resonance
            </Text>
            <Text style={[styles.explanationText, { color: theme.textSecondary }]}>
              {explanation}
            </Text>
          </View>

          <View style={[styles.cardsCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.explanationTitle, { color: theme.textPrimary }]}>
              🃏 Your {spreadType} Spread
            </Text>
            <View style={styles.cardsList}>
              {cardTitles.map((title, index) => (
                <Text key={index} style={[styles.cardItem, { color: theme.textSecondary }]}>
                  • {title}
                </Text>
              ))}
            </View>
          </View>

          {astrologyData.isMoonApprox && (
            <View style={[styles.noteCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
              <Text style={[styles.noteText, { color: theme.textSecondary }]}>
                ✨ Note: Your moon sign is approximate since no birth time was provided. 
                For more precise cosmic guidance, you can add your birth time in Profile settings.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  confidenceBadge: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  confidenceDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  spacer: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  cosmicCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cosmicHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cosmicEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cosmicTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  signsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 12,
  },
  signCard: {
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
  },
  signEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  signLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  signName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  approxText: {
    fontSize: 12,
    fontWeight: '400',
  },
  explanationCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 24,
  },
  cardsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardsList: {
    gap: 6,
  },
  cardItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  noteCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});