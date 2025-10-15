import { Tabs, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSeasonalTheme } from '../../constants/theme';
import { useEffect, useState } from 'react';
import { getUserPreferences } from '../../utils/storage';

export default function TabLayout() {
  const theme = getSeasonalTheme();
  const router = useRouter();
  const segments = useSegments();
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Check for onboarding completion
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        console.log('🔍 [TabLayout] Checking onboarding status...');
        const preferences = await getUserPreferences();
        console.log('🔍 [TabLayout] Preferences retrieved:', preferences);
        
        // If onboarding is not complete, redirect to onboarding
        if (!preferences.onboardingComplete) {
          console.log('🔀 [TabLayout] Onboarding not complete, redirecting to /onboarding');
          router.replace('/onboarding');
          return;
        }
        
        console.log('✅ [TabLayout] Onboarding complete, allowing tabs access');
        setOnboardingChecked(true);
        
        // Ensure initial route is home on first load
        const inTabsGroup = segments[0] === '(tabs)';
        if (inTabsGroup && segments.length === 1) {
          // If at root of tabs with no specific tab, go to home
          console.log('🏠 [TabLayout] Redirecting to home tab');
          router.replace('/(tabs)/home');
        }
      } catch (error) {
        console.error('❌ [TabLayout] Error checking onboarding status:', error);
        setOnboardingChecked(true);
      }
    };

    checkOnboarding();
  }, []);

  // Don't render tabs until onboarding check is complete
  if (!onboardingChecked) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.background.end,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Daily Draw',
          tabBarIcon: ({ color, size}) => (
            <Ionicons name="shuffle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weekly"
        options={{
          title: 'Weekly Card',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meditations"
        options={{
          title: 'Meditations',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="headset" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}