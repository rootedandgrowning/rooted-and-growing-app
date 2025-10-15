import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface MeditationPlayerProps {
  title: string;
  description: string;
  duration: string;
  videoUrl?: string;
  onPress?: () => void;
  theme?: any;
}

export function MeditationPlayer({
  title,
  description,
  duration,
  videoUrl,
  onPress,
  theme,
}: MeditationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePress = () => {
    if (videoUrl) {
      // When video is ready, play it
      setIsPlaying(true);
      // Future: Open video player modal or inline player
    } else {
      // Placeholder behavior
      if (Platform.OS === 'web') {
        alert('Meditation video coming soon! 🧘‍♀️\n\nThis space will feature guided meditations to enhance your oracle practice.');
      }
    }
    
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme?.cardBackground || '#F5F1E8' }]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['rgba(45, 95, 46, 0.1)', 'rgba(45, 95, 46, 0.05)']}
        style={styles.gradient}
      >
        {/* Thumbnail/Placeholder Area */}
        <View style={styles.thumbnailContainer}>
          {!videoUrl ? (
            // Placeholder design
            <View style={styles.placeholder}>
              <LinearGradient
                colors={['rgba(45, 95, 46, 0.8)', 'rgba(26, 61, 27, 0.9)']}
                style={styles.placeholderGradient}
              >
                <Ionicons name="leaf" size={48} color="rgba(255,255,255,0.7)" />
                <Text style={styles.placeholderText}>Video Coming Soon</Text>
              </LinearGradient>
            </View>
          ) : (
            // Future: Video thumbnail
            <View style={styles.thumbnail} />
          )}
          
          {/* Play Button Overlay */}
          <View style={styles.playButtonContainer}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color="#fff" style={{ marginLeft: 4 }} />
            </View>
          </View>
        </View>

        {/* Video Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Ionicons name="videocam" size={20} color={theme?.accent || '#5B8C5A'} />
            <Text style={[styles.title, { color: theme?.textPrimary || '#1a3d1b' }]}>
              {title}
            </Text>
          </View>
          <Text style={[styles.description, { color: theme?.textSecondary || '#666' }]}>
            {description}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color={theme?.textSecondary || '#666'} />
            <Text style={[styles.duration, { color: theme?.textSecondary || '#666' }]}>
              {duration}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    padding: 16,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e5e5',
  },
  placeholderGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ddd',
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(45, 95, 46, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  infoContainer: {
    paddingHorizontal: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
});