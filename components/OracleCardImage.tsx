// Oracle Card Image Component - Web-compatible version using platform-specific rendering

import React from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import { Image } from 'expo-image';

interface OracleCardImageProps {
  name: string; // Filename like "roots.png"
  style?: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 1.5; // 2:3 aspect ratio (1024x1536)

export const OracleCardImage: React.FC<OracleCardImageProps> = ({ name, style }) => {
  // If no image name provided, show placeholder for all platforms
  if (!name || name.trim() === '') {
    return (
      <View style={[styles.image, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>No Image</Text>
      </View>
    );
  }

  // For web platform, use direct img tag to avoid Metro bundler issues
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.image, style]}>
        <img 
          src={`/cards/${name}`}
          alt={name ? name.replace('.png', '') : 'Card'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </View>
    );
  }
  
  // For native, use expo-image with require
  let imageSource;
  
  switch (name) {
    case 'roots.png':
      imageSource = require('../assets/cards/roots.png');
      break;
    case 'soil.png':
      imageSource = require('../assets/cards/soil.png');
      break;
    case 'foundation.png':
      imageSource = require('../assets/cards/foundation.png');
      break;
    case 'water.png':
      imageSource = require('../assets/cards/water.png');
      break;
    case 'sunlight.png':
      imageSource = require('../assets/cards/sunlight.png');
      break;
    case 'nurture.png':
      imageSource = require('../assets/cards/nurture.png');
      break;
    case 'seedling.png':
      imageSource = require('../assets/cards/seedling.png');
      break;
    case 'bloom.png':
      imageSource = require('../assets/cards/bloom.png');
      break;
    case 'expand.png':
      imageSource = require('../assets/cards/expand.png');
      break;
    case 'prune.png':
      imageSource = require('../assets/cards/prune.png');
      break;
    case 'compost.png':
      imageSource = require('../assets/cards/compost.png');
      break;
    case 'renew.png':
      imageSource = require('../assets/cards/renew.png');
      break;
    // Premium cards
    case 'joy.png':
      imageSource = require('../assets/cards/joy.png');
      break;
    case 'growth.png':
      imageSource = require('../assets/cards/growth.png');
      break;
    case 'patience.png':
      imageSource = require('../assets/cards/patience.png');
      break;
    case 'balance.png':
      imageSource = require('../assets/cards/balance.png');
      break;
    case 'abundance.png':
      imageSource = require('../assets/cards/abundance.png');
      break;
    case 'nature.png':
      imageSource = require('../assets/cards/nature.png');
      break;
    case 'weeds.png':
      imageSource = require('../assets/cards/weeds.png');
      break;
    case 'greenthumb.png':
      imageSource = require('../assets/cards/greenthumb.png');
      break;
    case 'trowel.png':
      imageSource = require('../assets/cards/trowel.png');
      break;
    case 'gardenbed.png':
      imageSource = require('../assets/cards/gardenbed.png');
      break;
    case 'greenhouse.png':
      imageSource = require('../assets/cards/greenhouse.png');
      break;
    case 'mulch.png':
      imageSource = require('../assets/cards/mulch.png');
      break;
    case 'pestcontrol.png':
      imageSource = require('../assets/cards/pestcontrol.png');
      break;
    case 'irrigation.png':
      imageSource = require('../assets/cards/irrigation.png');
      break;
    case 'fertilize.png':
      imageSource = require('../assets/cards/fertilize.png');
      break;
    case 'wind.png':
      imageSource = require('../assets/cards/wind.png');
      break;
    case 'rain.png':
      imageSource = require('../assets/cards/rain.png');
      break;
    case 'trim.png':
      imageSource = require('../assets/cards/trim.png');
      break;
    case 'rooted.png':
      imageSource = require('../assets/cards/rooted.png');
      break;
    case 'mindfulness.png':
      imageSource = require('../assets/cards/mindfulness.png');
      break;
    case 'gratitude.png':
      imageSource = require('../assets/cards/gratitude.png');
      break;
    case 'diversity.png':
      imageSource = require('../assets/cards/diversity.png');
      break;
    case 'sow.png':
      imageSource = require('../assets/cards/sow.png');
      break;
    case 'cultivate.png':
      imageSource = require('../assets/cards/cultivate.png');
      break;
    case 'gather.png':
      imageSource = require('../assets/cards/gather.png');
      break;
    case 'strengthen.png':
      imageSource = require('../assets/cards/strengthen.png');
      break;
    case 'harvest.png':
      imageSource = require('../assets/cards/harvest.png');
      break;
    case 'wintering.png':
      imageSource = require('../assets/cards/wintering.png');
      break;
    case 'sanctuary.png':
      imageSource = require('../assets/cards/sanctuary.png');
      break;
    case 'meditate.png':
      imageSource = require('../assets/cards/meditate.png');
      break;
    case 'blossom.png':
      imageSource = require('../assets/cards/blossom.png');
      break;
    case 'emergence.png':
      imageSource = require('../assets/cards/emergence.png');
      break;
    default:
      console.warn(`Card image not found: ${name}`);
      return (
        <View
          style={[
            styles.placeholder,
            { width: CARD_WIDTH, height: CARD_HEIGHT },
            style,
          ]}
        >
          <View style={styles.placeholderContent} />
        </View>
      );
  }

  return (
    <Image
      source={imageSource}
      style={[
        styles.image,
        style,
      ]}
      contentFit="contain"
      transition={200}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    borderRadius: 20,
    backgroundColor: '#F8F3ED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  placeholderContent: {
    width: '80%',
    height: '80%',
    borderRadius: 12,
    backgroundColor: '#E8DED2',
  },
  placeholderText: {
    color: '#8B7355',
    fontSize: 12,
    fontWeight: '500',
  },
});
