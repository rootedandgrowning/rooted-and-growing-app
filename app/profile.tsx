// Profile Settings - Enhanced with working time picker and delete account
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getSeasonalTheme } from '../constants/theme';
import { BackHeader } from '../components/BackHeader';
import { getPersonalInfo, storePersonalInfo, clearPersonalData, type PersonalInfo } from '../utils/personalData';
import { updateUserPreferences, getUserPreferences } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import Constants from 'expo-constants';

const theme = getSeasonalTheme();

export default function ProfileScreen() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ firstName: '' });
  const [isPersonalizationEnabled, setIsPersonalizationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [birthTime, setBirthTime] = useState(new Date());
  const [unknownTime, setUnknownTime] = useState(false);

  const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const personal = await getPersonalInfo();
      if (personal) {
        setPersonalInfo(personal);
        if (personal.birthTime) {
          const [hours, minutes] = personal.birthTime.split(':').map(Number);
          const timeDate = new Date();
          timeDate.setHours(hours, minutes);
          setBirthTime(timeDate);
        }
        setUnknownTime(personal.unknownTime || false);
      }
      
      const prefs = await getUserPreferences();
      setIsPersonalizationEnabled(prefs.personalizationEnabled !== false);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!personalInfo.firstName?.trim()) {
      Alert.alert('Name Required', 'Please enter your first name.');
      return;
    }

    setIsSaving(true);
    try {
      // Set default time to 12:00 if unknown time is toggled
      const dataToSave = {
        ...personalInfo,
        unknownTime,
        birthTime: unknownTime ? '12:00' : personalInfo.birthTime,
      };
      
      console.log('💾 Saving profile data:', dataToSave);
      await storePersonalInfo(dataToSave);
      await updateUserPreferences({ 
        personalizationEnabled: isPersonalizationEnabled 
      });
      
      console.log('✅ Profile saved successfully');
      if (Platform.OS === 'web') {
        alert('Saved! ✨\nYour profile has been updated.');
      } else {
        Alert.alert('Saved! ✨', 'Your profile has been updated.');
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setBirthTime(selectedTime);
      const timeString = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;
      setPersonalInfo({ ...personalInfo, birthTime: timeString });
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            if (!token) {
              Alert.alert('Error', 'Authentication required to delete account.');
              return;
            }
            
            setIsDeleting(true);
            try {
              const response = await fetch(`${API_URL}/api/account/delete`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });
              
              if (response.ok) {
                await clearPersonalData();
                logout();
                router.replace('/onboarding');
                Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
              } else {
                Alert.alert('Error', 'Could not delete account. Please try again or contact support.');
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Could not delete account. Please check your connection and try again.');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
        <BackHeader title="Profile" />
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.start }]}>
      <BackHeader title="Profile" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personalization Master Toggle */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              🌟 Astrology Personalization
            </Text>
            <Switch
              value={isPersonalizationEnabled}
              onValueChange={setIsPersonalizationEnabled}
              trackColor={{ false: '#767577', true: theme.accent }}
              thumbColor={isPersonalizationEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            When enabled, your oracle readings include light astrological context based on your cosmic blueprint.
          </Text>
        </View>

        {isPersonalizationEnabled && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Personal Information
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                ✨ First Name (required)
              </Text>
              <TextInput
                style={[styles.personalInput, { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: theme.textPrimary,
                  borderColor: theme.accent + '50'
                }]}
                placeholder="Your first name"
                placeholderTextColor={theme.textSecondary + '80'}
                value={personalInfo.firstName}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, firstName: text })}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                🌙 Birth Date (optional)
              </Text>
              <TextInput
                style={[styles.personalInput, { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: theme.textPrimary,
                  borderColor: theme.accent + '50'
                }]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={theme.textSecondary + '80'}
                value={personalInfo.birthDate || ''}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, birthDate: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.toggleRow}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                  🕐 Birth Time (optional)
                </Text>
                <View style={styles.unknownToggle}>
                  <Text style={[styles.toggleLabel, { color: theme.textSecondary }]}>
                    Unknown time
                  </Text>
                  <Switch
                    value={unknownTime}
                    onValueChange={(value) => {
                      setUnknownTime(value);
                      if (value) {
                        // Set to 12:00 PM when unknown
                        const defaultTime = new Date();
                        defaultTime.setHours(12, 0);
                        setBirthTime(defaultTime);
                        setPersonalInfo({ ...personalInfo, birthTime: '12:00' });
                      }
                    }}
                    trackColor={{ false: '#767577', true: theme.accent }}
                    thumbColor={unknownTime ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>
              {unknownTime ? (
                <View style={[styles.disabledTimeInput, { borderColor: theme.accent + '30' }]}>
                  <Text style={[styles.disabledTimeText, { color: theme.textSecondary }]}>
                    12:00 PM (Default for unknown time)
                  </Text>
                </View>
              ) : Platform.OS === 'web' ? (
                <input
                  type="time"
                  value={personalInfo.birthTime || ''}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, birthTime: e.target.value })}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: `1px solid ${theme.accent}50`,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: theme.textPrimary,
                    fontSize: 16,
                  }}
                />
              ) : (
                <TouchableOpacity
                  style={[styles.timePickerButton, { borderColor: theme.accent + '50' }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.timePickerText, { color: theme.textPrimary }]}>
                    {personalInfo.birthTime || 'Select time'}
                  </Text>
                  <Ionicons name="time-outline" size={20} color={theme.accent} />
                </TouchableOpacity>
              )}
              
              {showTimePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                  value={birthTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                📍 Birth Place (optional)
              </Text>
              <TextInput
                style={[styles.personalInput, { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: theme.textPrimary,
                  borderColor: theme.accent + '50'
                }]}
                placeholder="City, State or Country"
                placeholderTextColor={theme.textSecondary + '80'}
                value={personalInfo.birthPlace || ''}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, birthPlace: text })}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                🌍 Timezone (optional)
              </Text>
              <TouchableOpacity
                style={[styles.timePickerButton, { borderColor: theme.accent + '50' }]}
                onPress={() => {
                  const timezones = [
                    'America/New_York',
                    'America/Chicago',
                    'America/Denver',
                    'America/Los_Angeles',
                    'America/Phoenix',
                    'Europe/London',
                    'Europe/Paris',
                    'Europe/Berlin',
                    'Asia/Tokyo',
                    'Asia/Shanghai',
                    'Asia/Dubai',
                    'Australia/Sydney',
                    'Pacific/Auckland',
                  ];
                  Alert.alert(
                    'Select Timezone',
                    'Choose your timezone:',
                    timezones.map(tz => ({
                      text: tz,
                      onPress: () => setPersonalInfo({ ...personalInfo, timezone: tz })
                    })).concat([
                      { text: 'Clear', onPress: () => setPersonalInfo({ ...personalInfo, timezone: '' }) },
                      { text: 'Cancel', style: 'cancel' }
                    ])
                  );
                }}
              >
                <Text style={[styles.timePickerText, { color: theme.textPrimary }]}>
                  {personalInfo.timezone || 'Select timezone'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.accent} />
              </TouchableOpacity>
              <Text style={[styles.timezoneHint, { color: theme.textSecondary }]}>
                Tap to select from common timezones
              </Text>
            </View>

            <Text style={[styles.helpText, { color: theme.textSecondary }]}>
              🔒 All data stays securely on your device. Used only for light astrological context in your readings.
            </Text>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.accent }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!isPersonalizationEnabled && (
          <View style={[styles.disabledSection, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.disabledText, { color: theme.textSecondary }]}>
              Personalization is currently disabled. Enable it above to add your cosmic blueprint for tailored oracle guidance.
            </Text>
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={[styles.dangerTitle, { color: '#dc3545' }]}>
            Danger Zone
          </Text>
          <TouchableOpacity
            style={[styles.deleteAccountButton, { borderColor: '#dc3545' }]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#dc3545" />
            ) : (
              <Ionicons name="trash-outline" size={16} color="#dc3545" />
            )}
            <Text style={[styles.deleteAccountText, { color: '#dc3545' }]}>
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.dangerDescription, { color: '#dc3545' }]}>
            This permanently deletes your account and cannot be undone.
          </Text>
        </View>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  personalInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  timePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timePickerText: {
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
    fontStyle: 'italic',
    textAlign: 'center',
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
  disabledSection: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  dangerSection: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 20,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
    gap: 8,
    marginBottom: 8,
  },
  deleteAccountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dangerDescription: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  unknownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  disabledTimeInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  disabledTimeText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  timezoneHint: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
});