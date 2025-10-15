// Placeholder Card Component with Gradient + Botanical Line Art

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle } from 'react-native-svg';

interface CardPlaceholderProps {
  gradient: { start: string; end: string };
  variant?: 'leaf' | 'seed' | 'moon' | 'flower';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 1.5; // 2:3 aspect ratio

export const CardPlaceholder: React.FC<CardPlaceholderProps> = ({
  gradient,
  variant = 'leaf',
}) => {
  const renderBotanicalArt = () => {
    const lineColor = gradient.start; // Use gradient start color for line art

    switch (variant) {
      case 'leaf':
        return (
          <>
            {/* Simple leaf with veins */}
            <Path
              d="M 170 100 Q 200 150 170 200 Q 140 150 170 100 Z"
              stroke={lineColor}
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
            <Path
              d="M 170 100 L 170 200"
              stroke={lineColor}
              strokeWidth="1.5"
              opacity="0.3"
            />
            <Path
              d="M 170 130 Q 185 135 180 145"
              stroke={lineColor}
              strokeWidth="1"
              opacity="0.3"
            />
            <Path
              d="M 170 160 Q 155 165 160 175"
              stroke={lineColor}
              strokeWidth="1"
              opacity="0.3"
            />
          </>
        );

      case 'seed':
        return (
          <>
            {/* Sprouting seed */}
            <Circle cx="170" cy="190" r="8" fill={lineColor} opacity="0.3" />
            <Path
              d="M 170 190 Q 170 160 170 130"
              stroke={lineColor}
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
            <Path
              d="M 170 140 Q 155 135 150 145"
              stroke={lineColor}
              strokeWidth="1.5"
              fill="none"
              opacity="0.3"
            />
            <Path
              d="M 170 140 Q 185 135 190 145"
              stroke={lineColor}
              strokeWidth="1.5"
              fill="none"
              opacity="0.3"
            />
          </>
        );

      case 'moon':
        return (
          <>
            {/* Crescent moon */}
            <Circle cx="170" cy="150" r="35" fill={lineColor} opacity="0.15" />
            <Circle cx="180" cy="150" r="30" fill="#FFFFFF" opacity="1" />
          </>
        );

      case 'flower':
        return (
          <>
            {/* Simple flower with petals */}
            <Circle cx="170" cy="150" r="10" fill={lineColor} opacity="0.4" />
            {[0, 60, 120, 180, 240, 300].map((angle, index) => {
              const x = 170 + Math.cos((angle * Math.PI) / 180) * 25;
              const y = 150 + Math.sin((angle * Math.PI) / 180) * 25;
              return (
                <Circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="12"
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="2"
                  opacity="0.3"
                />
              );
            })}
            <Path
              d="M 170 160 L 170 210"
              stroke={lineColor}
              strokeWidth="2"
              opacity="0.3"
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Svg width={CARD_WIDTH} height={CARD_HEIGHT} viewBox="0 0 340 510">
        <Defs>
          <LinearGradient id="cardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={gradient.start} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradient.end} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Card background with gradient */}
        <Rect
          x="0"
          y="0"
          width="340"
          height="510"
          fill="url(#cardGradient)"
          rx="20"
        />
        
        {/* Botanical line art */}
        {renderBotanicalArt()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});