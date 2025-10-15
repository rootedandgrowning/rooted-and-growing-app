// Scan QR Screen

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSeasonalTheme } from '../constants/theme';

export default function ScanQRScreen() {
  const router = useRouter();
  const theme = getSeasonalTheme();

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
            Scan QR Code
          </Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Ionicons name="home" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={[styles.qrPlaceholder, { borderColor: theme.accent }]}>
            <Ionicons name="qr-code" size={120} color={theme.accent} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Unlock Premium Features
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Scan the QR code inside your Soulshine Ritual Box to unlock:
          </Text>
          <View style={styles.featuresList}>
            <Text style={[styles.feature, { color: theme.textPrimary }]}>
              • Full 44-card oracle deck
            </Text>
            <Text style={[styles.feature, { color: theme.textPrimary }]}>
              • Multiple card spreads
            </Text>
            <Text style={[styles.feature, { color: theme.textPrimary }]}>
              • Monthly guided rituals
            </Text>
            <Text style={[styles.feature, { color: theme.textPrimary }]}>
              • Community Circle access
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accent }]}
            onPress={() => alert('QR scanning coming soon!')}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderRadius: 16,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  featuresList: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  feature: {
    fontSize: 15,
    lineHeight: 28,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});