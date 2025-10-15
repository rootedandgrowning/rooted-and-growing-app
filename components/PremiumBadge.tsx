import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
}

export function PremiumBadge({ size = 'medium' }: PremiumBadgeProps) {
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const badgeSize = size === 'small' ? 28 : size === 'large' ? 40 : 32;

  return (
    <View style={[styles.badge, { width: badgeSize, height: badgeSize }]}>
      <Ionicons name="lock-closed" size={iconSize} color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});