import { Redirect } from 'expo-router';

// Root index - redirect to home tab
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}