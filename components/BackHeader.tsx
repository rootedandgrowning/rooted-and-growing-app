import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BackHeaderProps {
  title?: string;
  onBack?: () => void;
  rightButton?: React.ReactNode;
  theme?: any;
}

export function BackHeader({ title, onBack, rightButton, theme }: BackHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const textColor = theme?.textPrimary || '#1a3d1b';

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color={textColor} />
      </TouchableOpacity>
      {title && (
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      )}
      <View style={styles.rightButton}>{rightButton || <View style={{ width: 28 }} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  rightButton: {
    width: 36,
    alignItems: 'flex-end',
  },
});