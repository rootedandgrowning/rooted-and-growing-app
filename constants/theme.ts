// Seasonal Theme Tokens for Rooted & Growing Oracle

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonalTheme {
  name: Season;
  background: {
    start: string;
    end: string;
  };
  accent: string;
  lineArt: string;
  textPrimary: string;
  textSecondary: string;
  cardBackground: string;
}

export const SEASONAL_THEMES: Record<Season, SeasonalTheme> = {
  spring: {
    name: 'spring',
    background: {
      start: '#F3F7F1',
      end: '#DCE9D2',
    },
    accent: '#7FAF7A',
    lineArt: '#5B8C57',
    textPrimary: '#2C4A2A',
    textSecondary: '#5B7C59',
    cardBackground: '#FFFFFF',
  },
  summer: {
    name: 'summer',
    background: {
      start: '#FFF7EC',
      end: '#FFE3BF',
    },
    accent: '#E7A04D',
    lineArt: '#B8772E',
    textPrimary: '#5A3F28',
    textSecondary: '#8A6849',
    cardBackground: '#FFFFFF',
  },
  autumn: {
    name: 'autumn',
    background: {
      start: '#F8F3ED',
      end: '#EADFD2',
    },
    accent: '#B26B4A',
    lineArt: '#8A4F34',
    textPrimary: '#4A3329',
    textSecondary: '#7A5E4F',
    cardBackground: '#FFFFFF',
  },
  winter: {
    name: 'winter',
    background: {
      start: '#EEF2F6',
      end: '#D8E1EA',
    },
    accent: '#5E7A9C',
    lineArt: '#465D7B',
    textPrimary: '#2A3E54',
    textSecondary: '#5A6F8A',
    cardBackground: '#FFFFFF',
  },
};

// Auto-detect season based on month (Northern Hemisphere)
export const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

export const getSeasonalTheme = (season?: Season): SeasonalTheme => {
  const currentSeason = season || getCurrentSeason();
  return SEASONAL_THEMES[currentSeason];
};