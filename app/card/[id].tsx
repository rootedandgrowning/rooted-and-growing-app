// Card Detail Screen with Journaling Bottom Sheet

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { getSeasonalTheme } from '../../constants/theme';
import { getCardById } from '../../constants/cards';
import { OracleCardImage } from '../../components/OracleCardImage';
import { saveJournalEntry, JournalEntry } from '../../utils/storage';
import { logJournalSaved } from '../../utils/analytics';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = getSeasonalTheme();
  const card = getCardById(id as string);

  const [journalText, setJournalText] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mood options (8 moods, user can pick up to 2)
  const MOODS = [
    { emoji: '😌', label: 'Peaceful' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '✨', label: 'Hopeful' },
    { emoji: '🤔', label: 'Uncertain' },
    { emoji: '🙏', label: 'Grateful' },
    { emoji: '💫', label: 'Inspired' },
    { emoji: '😔', label: 'Heavy' },
    { emoji: '🔥', label: 'Energized' },
  ];
  
  // Sentence starters
  const SENTENCE_STARTERS = [
    "This card reminds me of...",
    "What I'm learning is...",
    "I'm feeling called to...",
    "Today I'm grateful for...",
    "I'm ready to release...",
    "I want to cultivate...",
  ];

  // Bottom Sheet Ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '85%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);
  
  // Handle mood selection (max 2)
  const handleMoodToggle = (emoji: string) => {
    if (selectedMoods.includes(emoji)) {
      // Remove mood
      setSelectedMoods(selectedMoods.filter(m => m !== emoji));
    } else {
      // Add mood (max 2)
      if (selectedMoods.length < 2) {
        setSelectedMoods([...selectedMoods, emoji]);
      } else {
        // Replace first mood if already have 2
        setSelectedMoods([selectedMoods[1], emoji]);
      }
    }
  };
  
  // Handle sentence starter insertion
  const handleSentenceStarter = (starter: string) => {
    // Insert at cursor position or append
    if (journalText) {
      setJournalText(journalText + '\n\n' + starter + ' ');
    } else {
      setJournalText(starter + ' ');
    }
  };

  if (!card) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.start }]}>
        <Text style={[styles.errorText, { color: theme.textPrimary }]}>
          Card not found
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.accent }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSaveJournal = async () => {
    if (!journalText.trim()) {
      Alert.alert('Empty Journal', 'Please write something before saving.');
      return;
    }

    setIsSaving(true);

    try {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        dateISO: new Date().toISOString().split('T')[0],
        cardId: card.id,
        cardTitle: card.title,
        journalText: journalText.trim(),
        promptUsed: selectedPrompt,
        createdAt: Date.now(),
        moods: selectedMoods.length > 0 ? selectedMoods : undefined,
      };

      await saveJournalEntry(entry);

      // Log telemetry
      logJournalSaved(card.id, !!selectedPrompt);

      // Close bottom sheet first
      bottomSheetRef.current?.close();

      // Show success alert using web-compatible method
      setTimeout(() => {
        const viewJournal = window.confirm('Saved! 🌿\n\nYour reflection has been saved to your journal.\n\nWould you like to view your journal now?');
        if (viewJournal) {
          router.push('/journal');
        }
      }, 300);

      setJournalText('');
      setSelectedPrompt('');
      setSelectedMoods([]);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Could not save your journal entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.background.start, theme.background.end]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            {card.title}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Card Display */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardContainer}>
            <OracleCardImage name={card.image} />
          </View>

          {/* Card Info */}
          <View style={styles.infoContainer}>
            <Text style={[styles.cardShort, { color: theme.textSecondary }]}>
              {card.short}
            </Text>

            <Text style={[styles.description, { color: theme.textPrimary }]}>
              {card.description}
            </Text>

            {/* Prompts */}
            <View style={styles.promptsSection}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Reflection Prompts
              </Text>
              {card.prompts.map((prompt, index) => (
                <View key={index} style={styles.promptItem}>
                  <Ionicons
                    name="leaf-outline"
                    size={18}
                    color={theme.accent}
                    style={styles.promptIcon}
                  />
                  <Text style={[styles.promptText, { color: theme.textPrimary }]}>
                    {prompt}
                  </Text>
                </View>
              ))}
            </View>

            {/* Action Note */}
            <View
              style={[styles.actionBox, { backgroundColor: theme.cardBackground }]}
            >
              <Ionicons name="sparkles" size={20} color={theme.accent} />
              <Text style={[styles.actionText, { color: theme.textPrimary }]}>
                {card.action}
              </Text>
            </View>

            {/* Open Journal Button */}
            <TouchableOpacity
              style={[styles.journalButton, { backgroundColor: theme.accent }]}
              onPress={() => bottomSheetRef.current?.expand()}
            >
              <Ionicons name="create" size={20} color="#FFFFFF" />
              <Text style={styles.journalButtonText}>Reflect & Journal</Text>
            </TouchableOpacity>

            <View style={{ height: 200 }} />
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Bottom Sheet for Journaling */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.cardBackground }}
        handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
            Your Reflection
          </Text>

          {/* Mood Selection */}
          <Text style={[styles.sheetLabel, { color: theme.textSecondary }]}>
            How are you feeling? (pick up to 2):
          </Text>
          <View style={styles.moodGrid}>
            {MOODS.map((mood) => {
              const isSelected = selectedMoods.includes(mood.emoji);
              return (
                <TouchableOpacity
                  key={mood.emoji}
                  style={[
                    styles.moodChip,
                    {
                      borderColor: theme.accent,
                      backgroundColor: isSelected ? theme.accent : 'transparent',
                    },
                  ]}
                  onPress={() => handleMoodToggle(mood.emoji)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sentence Starters */}
          <Text style={[styles.sheetLabel, { color: theme.textSecondary, marginTop: 16 }]}>
            Need a starting point?
          </Text>
          <View style={styles.starterGrid}>
            {SENTENCE_STARTERS.map((starter, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.starterChip,
                  { borderColor: theme.accent },
                ]}
                onPress={() => handleSentenceStarter(starter)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.starterText, { color: theme.accent }]}>
                  {starter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Prompt Selector */}
          <Text style={[styles.sheetLabel, { color: theme.textSecondary }]}>
            Choose a prompt (optional):
          </Text>
          <View style={styles.promptGrid}>
            {card.prompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.promptChip,
                  {
                    borderColor: theme.accent,
                    backgroundColor:
                      selectedPrompt === prompt ? theme.accent : 'transparent',
                  },
                ]}
                onPress={() => setSelectedPrompt(prompt)}
              >
                <Text
                  style={[
                    styles.promptChipText,
                    {
                      color: selectedPrompt === prompt ? '#FFFFFF' : theme.accent,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Journal Text Input */}
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: theme.lineArt,
                color: theme.textPrimary,
              },
            ]}
            placeholder="Write your thoughts, feelings, and reflections here..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={8}
            value={journalText}
            onChangeText={setJournalText}
            textAlignVertical="top"
          />

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.accent },
              isSaving && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveJournal}
            disabled={isSaving}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save to Journal'}
            </Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cardContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  infoContainer: {
    paddingHorizontal: 24,
  },
  cardShort: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 32,
    textAlign: 'left',
  },
  promptsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  promptItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promptIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  promptText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  actionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    marginLeft: 12,
    fontStyle: 'italic',
  },
  journalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  journalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
  backButton: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  bottomSheetContent: {
    padding: 24,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  sheetLabel: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  promptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  promptChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    minWidth: 100,
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 160,
    marginBottom: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  moodEmoji: {
    fontSize: 18,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  starterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  starterChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    minWidth: 120,
    maxWidth: 180,
  },
  starterText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
