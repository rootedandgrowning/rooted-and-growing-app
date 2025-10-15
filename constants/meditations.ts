// Meditation Videos/Recordings Library

export interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "5 min", "10 min"
  category: 'grounding' | 'morning' | 'evening' | 'breath' | 'gratitude' | 'seasonal';
  videoUrl?: string; // YouTube, Vimeo, or local file path
  thumbnailUrl?: string;
  isPremium?: boolean;
  type: 'audio' | 'video';
}

export interface WelcomeVideo {
  id: string;
  title: string;
  description: string;
  videoUrl?: string; // YouTube, Vimeo, or local file path
  thumbnailUrl?: string;
}

// Welcome/Introduction video for home page
export const WELCOME_VIDEO: WelcomeVideo = {
  id: 'welcome-intro',
  title: 'Welcome to Rooted & Growing',
  description: 'Learn how to use the oracle cards, explore seasonal wisdom, and deepen your daily practice.',
  videoUrl: '', // Placeholder - will be updated when video is ready
  thumbnailUrl: '',
};

// Meditation Library (separate from welcome video)
export const MEDITATIONS: Meditation[] = [
  {
    id: 'grounding-practice',
    title: 'Grounding Practice',
    description: 'A gentle meditation to ground yourself before drawing your daily card.',
    duration: '5 min',
    category: 'grounding',
    videoUrl: '',
    thumbnailUrl: '',
    type: 'audio',
    isPremium: false, // FREE meditation
  },
  // Premium meditations
  {
    id: 'morning-roots',
    title: 'Morning Roots Practice',
    description: 'Start your day grounded and centered with a morning meditation.',
    duration: '8 min',
    category: 'morning',
    videoUrl: '',
    thumbnailUrl: '',
    type: 'audio',
    isPremium: true,
  },
  {
    id: 'evening-release',
    title: 'Evening Release',
    description: 'Release the day and settle into restful awareness.',
    duration: '10 min',
    category: 'evening',
    videoUrl: '',
    thumbnailUrl: '',
    type: 'audio',
    isPremium: true,
  },
  {
    id: 'breath-basics',
    title: 'Breath & Body Scan',
    description: 'Simple breathing techniques and body awareness for grounding and calm.',
    duration: '7 min',
    category: 'breath',
    videoUrl: '',
    thumbnailUrl: '',
    type: 'audio',
    isPremium: true,
  },
  {
    id: 'seasonal-gratitude',
    title: 'Seasonal Gratitude',
    description: 'Connect with the current season through gratitude and reflection.',
    duration: '12 min',
    category: 'seasonal',
    videoUrl: '',
    thumbnailUrl: '',
    type: 'audio',
    isPremium: true,
  },
];

// Helper functions
export const getFreeMeditations = (): Meditation[] => {
  return MEDITATIONS.filter((m) => !m.isPremium);
};

export const getPremiumMeditations = (): Meditation[] => {
  return MEDITATIONS.filter((m) => m.isPremium);
};

export const getMeditationsByCategory = (category: string): Meditation[] => {
  return MEDITATIONS.filter((m) => m.category === category);
};