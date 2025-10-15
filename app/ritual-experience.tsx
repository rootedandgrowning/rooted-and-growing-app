// Interactive Monthly Ritual Experience - Premium Feature

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSeasonalTheme } from '../constants/theme';
import { BackHeader } from '../components/BackHeader';
import { VideoPlayer } from '../components/VideoPlayer';
import { OracleCardImage } from '../components/OracleCardImage';
import { ORACLE_CARDS } from '../constants/cards';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';

interface MonthlyRitualData {
  month: string;
  year: number;
  tea_blend: {
    name: string;
    description: string;
    ingredients: string[];
    allergens: string[];
    caffeine_level: string;
    steep_time: string;
    temperature: string;
    tasting_notes: string;
  };
  tincture: {
    name: string;
    purpose: string;
    herbs: string[];
    suggested_use: string;
    taste_notes: string;
    safety: string;
  };
}

export default function RitualExperienceScreen() {
  const theme = getSeasonalTheme();
  const { token } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [ritualData, setRitualData] = useState<MonthlyRitualData | null>(null);
  const [monthlyCard, setMonthlyCard] = useState<any>(null);
  const [showJournal, setShowJournal] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [herbalistQuestion, setHerbalistQuestion] = useState('');
  const [herbalistAnswer, setHerbalistAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  // Extract selections from URL params
  const selectedIntention = params.intention as string || '';
  const selectedPractice = params.practice as string || '';

  useEffect(() => {
    fetchRitualData();
    drawMonthlyCard();
    // Debug log to see if params are being received
    console.log('Ritual experience params:', { selectedIntention, selectedPractice });
  }, [selectedIntention, selectedPractice]);

  const fetchRitualData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/monthly-ritual`);
      if (response.ok) {
        const data = await response.json();
        setRitualData(data);
      }
    } catch (error) {
      console.error('Error fetching ritual data:', error);
    }
  };

  const drawMonthlyCard = () => {
    // Random card selection for monthly intention
    const randomIndex = Math.floor(Math.random() * ORACLE_CARDS.length);
    setMonthlyCard(ORACLE_CARDS[randomIndex]);
  };

  const askHerbalist = async () => {
    if (!herbalistQuestion.trim() || !token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/ask-herbalist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: herbalistQuestion,
          month: ritualData?.month,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setHerbalistAnswer(data.answer);
      } else {
        Alert.alert('Error', 'Unable to connect to the Herbalist right now');
      }
    } catch (error) {
      console.error('Error asking herbalist:', error);
      Alert.alert('Error', 'Unable to connect to the Herbalist');
    } finally {
      setIsLoading(false);
    }
  };

  const saveJournalEntry = () => {
    // TODO: Save to local storage or backend
    Alert.alert('Saved', 'Your ritual reflection has been saved.');
    setShowJournal(false);
  };

  if (!ritualData) {
    return (
      <LinearGradient colors={[theme.background.start, theme.background.end]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <BackHeader title="Monthly Ritual Experience" theme={theme} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[theme.background.start, theme.background.end]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <BackHeader title="Monthly Ritual Experience" theme={theme} />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Monthly Meditation */}
          <View style={[styles.meditationCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {ritualData.month} Meditation
            </Text>
            <Text style={[styles.meditationDescription, { color: theme.textSecondary }]}>
              A seasonal meditation to center yourself before the ritual
            </Text>
            <VideoPlayer 
              style={styles.meditationVideo}
              title={`${ritualData.month} Meditation`}
            />
          </View>

          {/* Monthly Intention Card */}
          <View style={[styles.cardSection, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Your Monthly Intention Card
            </Text>
            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
              This card carries the energy for your month ahead
            </Text>
            
            {monthlyCard && (
              <View style={styles.cardContainer}>
                <OracleCardImage
                  name={monthlyCard.image}
                  style={styles.cardImage}
                />
                <View style={[styles.cardInfo, { backgroundColor: `${theme.accent}15` }]}>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                    {monthlyCard.title}
                  </Text>
                  <Text style={[styles.cardMeaning, { color: theme.textSecondary }]}>
                    {monthlyCard.description}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.drawButton, { backgroundColor: theme.accent }]}
              onPress={drawMonthlyCard}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.drawButtonText}>Draw New Card</Text>
            </TouchableOpacity>
          </View>

          {/* Ritual Journaling */}
          <View style={[styles.journalSection, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Ritual Journaling
            </Text>
            <Text style={[styles.journalDescription, { color: theme.textSecondary }]}>
              Reflect on your card's message and set your monthly intention
            </Text>
            
            {/* Display Selected Intention and Practice */}
            {(selectedIntention || selectedPractice) && (
              <View style={[styles.selectionsDisplay, { backgroundColor: `${theme.accent}15` }]}>
                <Text style={[styles.selectionsTitle, { color: theme.textPrimary }]}>
                  Your Ritual Selections:
                </Text>
                {selectedIntention && (
                  <Text style={[styles.selectionItem, { color: theme.textSecondary }]}>
                    <Text style={{ fontWeight: '600' }}>Monthly Intention:</Text> {selectedIntention}
                  </Text>
                )}
                {selectedPractice && (
                  <Text style={[styles.selectionItem, { color: theme.textSecondary }]}>
                    <Text style={{ fontWeight: '600' }}>Daily Practice:</Text> {selectedPractice}
                  </Text>
                )}
              </View>
            )}
            
            {!showJournal ? (
              <TouchableOpacity 
                style={[styles.journalButton, { backgroundColor: theme.accent }]}
                onPress={() => setShowJournal(true)}
              >
                <Ionicons name="book" size={16} color="#fff" />
                <Text style={styles.journalButtonText}>Open Journal</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.journalEditor}>
                <TextInput
                  style={[styles.journalInput, { borderColor: theme.accent, color: theme.textPrimary }]}
                  placeholder="What intention will you carry into this month? How does your card's message resonate with you?"
                  placeholderTextColor={theme.textSecondary}
                  value={journalEntry}
                  onChangeText={setJournalEntry}
                  multiline
                  numberOfLines={6}
                />
                <View style={styles.journalActions}>
                  <TouchableOpacity 
                    style={[styles.saveButton, { backgroundColor: theme.accent }]}
                    onPress={saveJournalEntry}
                  >
                    <Text style={styles.saveButtonText}>Save Reflection</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.cancelButton, { borderColor: theme.accent }]}
                    onPress={() => setShowJournal(false)}
                  >
                    <Text style={[styles.cancelButtonText, { color: theme.accent }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Product Showcase */}
          <View style={[styles.productSection, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              This Month's Tea & Tincture
            </Text>
            
            {/* Tea Blend */}
            <View style={styles.productCard}>
              <View style={[styles.productImagePlaceholder, { backgroundColor: `${theme.accent}15` }]}>
                <Ionicons name="cafe" size={40} color={theme.accent} />
              </View>
              <View style={styles.productInfo}>
                <Text style={[styles.productTitle, { color: theme.accent }]}>
                  Tea Blend: {ritualData.tea_blend.name}
                </Text>
                <Text style={[styles.productDescription, { color: theme.textSecondary }]}>
                  {ritualData.tea_blend.description}
                </Text>
                <Text style={[styles.productDetails, { color: theme.textSecondary }]}>
                  <Text style={{ fontWeight: '600' }}>Ingredients:</Text> {ritualData.tea_blend.ingredients.join(', ')}
                </Text>
                <Text style={[styles.productDetails, { color: theme.textSecondary }]}>
                  <Text style={{ fontWeight: '600' }}>Steep:</Text> {ritualData.tea_blend.steep_time} at {ritualData.tea_blend.temperature}
                </Text>
                <Text style={[styles.productDetails, { color: theme.textSecondary }]}>
                  <Text style={{ fontWeight: '600' }}>Taste:</Text> {ritualData.tea_blend.tasting_notes}
                </Text>
                {ritualData.tea_blend.allergens.length > 0 && (
                  <Text style={[styles.allergenWarning, { color: '#FF6B6B' }]}>
                    ⚠️ {ritualData.tea_blend.allergens.join(', ')}
                  </Text>
                )}
              </View>
            </View>

            {/* Tincture */}
            <View style={styles.productCard}>
              <View style={[styles.productImagePlaceholder, { backgroundColor: `${theme.accent}15` }]}>
                <Ionicons name="water" size={40} color={theme.accent} />
              </View>
              <View style={styles.productInfo}>
                <Text style={[styles.productTitle, { color: theme.accent }]}>
                  Tincture: {ritualData.tincture.name}
                </Text>
                <Text style={[styles.productDescription, { color: theme.textSecondary }]}>
                  {ritualData.tincture.purpose}
                </Text>
                <Text style={[styles.productDetails, { color: theme.textSecondary }]}>
                  <Text style={{ fontWeight: '600' }}>Herbs:</Text> {ritualData.tincture.herbs.join(', ')}
                </Text>
                <Text style={[styles.productDetails, { color: theme.textSecondary }]}>
                  <Text style={{ fontWeight: '600' }}>Use:</Text> {ritualData.tincture.suggested_use}
                </Text>
                <Text style={[styles.productDetails, { color: theme.textSecondary }]}>
                  <Text style={{ fontWeight: '600' }}>Taste:</Text> {ritualData.tincture.taste_notes}
                </Text>
                <Text style={[styles.safetyText, { color: '#FF6B6B' }]}>
                  {ritualData.tincture.safety}
                </Text>
              </View>
            </View>

            <Text style={[styles.storageText, { color: theme.textSecondary }]}>
              Storage & Safety: Keep in a cool, dry place. This is not medical advice. 
              Consult a professional if pregnant, nursing, on medications, or have allergies.
            </Text>
          </View>

          {/* Ask the Herbalist */}
          <View style={[styles.herbalistCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Ask Our Herbal Guide
            </Text>
            <Text style={[styles.herbalistIntro, { color: theme.textSecondary }]}>
              Questions about this month's herbs or preparation? Ask our Herbal Guide.
            </Text>
            
            <TextInput
              style={[styles.questionInput, { borderColor: theme.accent, color: theme.textPrimary }]}
              placeholder="How long should I steep this? Can I add the tincture to my tea?"
              placeholderTextColor={theme.textSecondary}
              value={herbalistQuestion}
              onChangeText={setHerbalistQuestion}
              multiline
            />
            
            <TouchableOpacity 
              style={[styles.askButton, { backgroundColor: theme.accent }]}
              onPress={askHerbalist}
              disabled={isLoading || !herbalistQuestion.trim()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="chatbubble" size={16} color="#fff" />
                  <Text style={styles.askButtonText}>Ask</Text>
                </>
              )}
            </TouchableOpacity>

            {herbalistAnswer && (
              <View style={[styles.answerContainer, { backgroundColor: `${theme.accent}15` }]}>
                <Text style={[styles.answerText, { color: theme.textSecondary }]}>
                  {herbalistAnswer}
                </Text>
              </View>
            )}
          </View>

          {/* Complete Ritual Button */}
          <TouchableOpacity 
            style={[styles.completeButton, { backgroundColor: theme.accent }]}
            onPress={() => {
              Alert.alert('Ritual Complete', 'May this month bring you growth, wisdom, and peace. 🌿');
              router.back();
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.completeButtonText}>Complete Ritual</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Section Titles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },

  // Meditation Section
  meditationCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  meditationDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  meditationVideo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },

  // Monthly Card Section
  cardSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardImage: {
    width: 120,
    height: 168,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardInfo: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardMeaning: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  drawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  drawButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Journal Section
  journalSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  journalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  selectionsDisplay: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectionItem: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  journalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  journalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  journalEditor: {
    marginTop: 16,
  },
  journalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 12,
  },
  journalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Product Section
  productSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  productCard: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  productDetails: {
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 3,
  },
  allergenWarning: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
  safetyText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
  storageText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },

  // Herbalist Section
  herbalistCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  herbalistIntro: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 16,
  },
  questionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 12,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  askButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  answerContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Complete Button
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});