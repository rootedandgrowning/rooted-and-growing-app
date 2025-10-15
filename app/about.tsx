// About & Privacy Screen with Build Info
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getSeasonalTheme } from '../constants/theme';
import { BackHeader } from '../components/BackHeader';
import { getFeatureFlags } from '../utils/featureFlags';
import Constants from 'expo-constants';

const theme = getSeasonalTheme();

export default function AboutScreen() {
  const handlePrivacyPolicy = async () => {
    try {
      const supported = await Linking.canOpenURL('https://rootedandgrowing.app/Privacy');
      if (supported) {
        await Linking.openURL('https://rootedandgrowing.app/Privacy');
      } else {
        Alert.alert('Error', 'Could not open privacy policy. Please visit rootedandgrowing.app manually.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open privacy policy. Please check your connection and try again.');
    }
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@rootedandgrowing.app');
  };

  const flags = getFeatureFlags();
  const commitSHA = 'fc1f01f'; // Real 7-char commit SHA
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
      <BackHeader title="About & Privacy" />
      
      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            🌿 Rooted & Growing Oracle
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            A nature-inspired oracle and journaling app designed to help you slow down, reflect, and reconnect with the rhythm of the seasons.
          </Text>
        </View>

        {/* Build Info */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            🔧 Build Info
          </Text>
          <View style={styles.buildInfo}>
            <View style={styles.buildRow}>
              <Text style={[styles.buildLabel, { color: theme.textSecondary }]}>Version:</Text>
              <Text style={[styles.buildValue, { color: theme.textPrimary }]}>{appVersion}</Text>
            </View>
            <View style={styles.buildRow}>
              <Text style={[styles.buildLabel, { color: theme.textSecondary }]}>Commit:</Text>
              <Text style={[styles.buildValue, { color: theme.textPrimary }]}>{commitSHA}</Text>
            </View>
            <View style={styles.buildRow}>
              <Text style={[styles.buildLabel, { color: theme.textSecondary }]}>Apple Mode:</Text>
              <Text style={[styles.buildValue, { color: theme.textPrimary }]}>
                {flags.appleSubmissionMode ? 'true' : 'false'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            🔒 Privacy & Data
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            Your personal information and oracle readings are stored securely on your device. We never share your personal data with third parties.
          </Text>
          
          <TouchableOpacity
            style={[styles.linkButton, { borderColor: theme.accent }]}
            onPress={handlePrivacyPolicy}
          >
            <Ionicons name="document-text-outline" size={20} color={theme.accent} />
            <Text style={[styles.linkText, { color: theme.accent }]}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color={theme.accent} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            💬 Support & Help
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            Questions about the app or need assistance? We're here to help.
          </Text>
          
          <TouchableOpacity
            style={[styles.linkButton, { borderColor: theme.accent }]}
            onPress={handleSupport}
          >
            <Ionicons name="mail-outline" size={20} color={theme.accent} />
            <Text style={[styles.linkText, { color: theme.accent }]}>Contact Support</Text>
            <Ionicons name="open-outline" size={16} color={theme.accent} />
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  buildInfo: {
    gap: 8,
  },
  buildRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buildLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  buildValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});