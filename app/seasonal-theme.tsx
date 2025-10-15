// Seasonal Theme Selector Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSeasonalTheme, SEASONAL_THEMES, Season } from '../constants/theme';

export default function SeasonalThemeScreen() {
  const router = useRouter();
  const currentTheme = getSeasonalTheme();
  const [selected, setSelected] = useState<Season | 'auto'>('auto');

  const ThemeOption = ({ season, label }: { season: Season | 'auto'; label: string }) => {
    const theme = season === 'auto' ? currentTheme : SEASONAL_THEMES[season as Season];
    const isSelected = selected === season;

    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          isSelected && styles.themeOptionSelected,
        ]}
        onPress={() => setSelected(season)}
      >
        <LinearGradient
          colors={[theme.background.start, theme.background.end]}
          style={styles.themePreview}
        >
          <View style={[styles.accentDot, { backgroundColor: theme.accent }]} />
        </LinearGradient>
        <Text style={[styles.themeLabel, { color: currentTheme.textPrimary }]}>
          {label}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={currentTheme.accent} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[currentTheme.background.start, currentTheme.background.end]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={currentTheme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentTheme.textPrimary }]}>
            Seasonal Theme
          </Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Ionicons name="home" size={24} color={currentTheme.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.description, { color: currentTheme.textSecondary }]}>
            Choose how you want the app's appearance to change with the seasons.
          </Text>

          <ThemeOption season="auto" label="Auto (by date)" />
          <ThemeOption season="spring" label="Spring" />
          <ThemeOption season="summer" label="Summer" />
          <ThemeOption season="autumn" label="Autumn" />
          <ThemeOption season="winter" label="Winter" />
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
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  themeOptionSelected: {
    borderWidth: 2,
    borderColor: '#7FAF7A',
  },
  themePreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  themeLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
});