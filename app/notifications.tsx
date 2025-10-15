// Notifications Settings - Edit Daily & Weekly Reminder Times
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSeasonalTheme } from '../constants/theme';
import { BackHeader } from '../components/BackHeader';
import { getUserPreferences, updateUserPreferences } from '../utils/storage';

const theme = getSeasonalTheme();

export default function NotificationsScreen() {
  const router = useRouter();
  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [weeklyEnabled, setWeeklyEnabled] = useState(true);
  const [dailyTime, setDailyTime] = useState('9:00');
  const [weeklyTime, setWeeklyTime] = useState('10:00');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const prefs = await getUserPreferences();
      setDailyEnabled(prefs.dailyReminderEnabled !== false);
      setWeeklyEnabled(prefs.weeklyReminderEnabled !== false);
      // Load times from prefs if available
      if (prefs.onboardingData?.reminderTime) {
        setDailyTime(prefs.onboardingData.reminderTime);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateUserPreferences({
        dailyReminderEnabled: dailyEnabled,
        weeklyReminderEnabled: weeklyEnabled,
        onboardingData: {
          focus: [],
          firstCardId: '',
          intention: '',
          reminderTime: dailyTime,
          pushOptIn: dailyEnabled || weeklyEnabled,
        }
      });
      
      Alert.alert('Success', 'Reminder updated.');
    } catch (error) {
      Alert.alert('Error', 'Could not update reminders. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
        <BackHeader title="Notifications" />
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
      <BackHeader title="Notifications" />
      
      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            🌅 Daily Draw Reminder
          </Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>
              Remind me to draw my daily oracle card
            </Text>
            <Switch
              value={dailyEnabled}
              onValueChange={setDailyEnabled}
              trackColor={{ false: '#767577', true: theme.accent }}
              thumbColor={dailyEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          {dailyEnabled && (
            <View style={styles.timeSection}>
              <Text style={[styles.timeLabel, { color: theme.textPrimary }]}>Time:</Text>
              <TouchableOpacity
                style={[styles.timePicker, { borderColor: theme.accent }]}
                onPress={() => {
                  // Simple time selection for MVP
                  const times = ['6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
                  Alert.alert(
                    'Select Time',
                    'Choose your daily reminder time:',
                    times.map(time => ({
                      text: time,
                      onPress: () => setDailyTime(time)
                    })).concat([{ text: 'Cancel', style: 'cancel' }])
                  );
                }}
              >
                <Text style={[styles.timeText, { color: theme.textPrimary }]}>{dailyTime}</Text>
                <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            📅 Weekly Card Reminder
          </Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>
              Remind me about the community weekly card
            </Text>
            <Switch
              value={weeklyEnabled}
              onValueChange={setWeeklyEnabled}
              trackColor={{ false: '#767577', true: theme.accent }}
              thumbColor={weeklyEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.accent }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});