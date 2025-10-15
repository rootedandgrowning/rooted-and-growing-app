// VideoPlayer Component - Placeholder for meditation videos

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VideoPlayerProps {
  style?: any;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ style, title = "Meditation Video" }) => {
  const handlePlayPress = () => {
    // TODO: Implement actual video playback
    console.log('Playing video:', title);
  };

  return (
    <View style={[styles.videoContainer, style]}>
      <TouchableOpacity 
        style={styles.playButton} 
        onPress={handlePlayPress}
        activeOpacity={0.8}
      >
        <Ionicons name="play" size={40} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.overlay}>
        <Text style={styles.videoTitle}>{title}</Text>
        <Text style={styles.placeholder}>Video placeholder - tap to play</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minHeight: 200,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  overlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeholder: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
});