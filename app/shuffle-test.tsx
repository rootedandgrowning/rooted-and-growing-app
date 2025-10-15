// Test Page for New Shuffle Experience
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import BackHeader from '../components/BackHeader';
import CardShuffleExperience from '../components/CardShuffleExperience';

export default function ShuffleTestScreen() {
  const router = useRouter();

  const handleCardDrawn = (card: any) => {
    console.log('Card drawn:', card.title);
    // In the real integration, this would save to storage and update streaks
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackHeader title="Test New Shuffle" />
      <CardShuffleExperience onCardDrawn={handleCardDrawn} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F4',
  },
});
