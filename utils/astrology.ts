// Astrology Utility - Local Computation Only
import SunCalc from 'suncalc';

export interface AstrologyData {
  sunSign: string;
  moonSign: string;
  moonPhase: string;
  isMoonApprox: boolean;
  confidenceLevel?: 'high' | 'medium' | 'low';
}

export interface PersonalInfo {
  firstName: string;
  birthDate?: string; // ISO date string
  birthTime?: string; // HH:MM format
  birthPlace?: string; // User-entered location text
  timezone?: string; // IANA timezone (e.g., "America/New_York")
  unknownTime?: boolean; // True if user doesn't know birth time
}

// Zodiac sign boundaries (simplified tropical astrology)
const ZODIAC_SIGNS = [
  { name: 'Aries', element: 'Fire', start: 80, end: 109 }, // Mar 21 - Apr 19
  { name: 'Taurus', element: 'Earth', start: 110, end: 140 }, // Apr 20 - May 20
  { name: 'Gemini', element: 'Air', start: 141, end: 171 }, // May 21 - Jun 20
  { name: 'Cancer', element: 'Water', start: 172, end: 203 }, // Jun 21 - Jul 22
  { name: 'Leo', element: 'Fire', start: 204, end: 234 }, // Jul 23 - Aug 22
  { name: 'Virgo', element: 'Earth', start: 235, end: 266 }, // Aug 23 - Sep 22
  { name: 'Libra', element: 'Air', start: 267, end: 296 }, // Sep 23 - Oct 22
  { name: 'Scorpio', element: 'Water', start: 297, end: 326 }, // Oct 23 - Nov 21
  { name: 'Sagittarius', element: 'Fire', start: 327, end: 356 }, // Nov 22 - Dec 21
  { name: 'Capricorn', element: 'Earth', start: 357, end: 19 }, // Dec 22 - Jan 19
  { name: 'Aquarius', element: 'Air', start: 20, end: 49 }, // Jan 20 - Feb 18
  { name: 'Pisces', element: 'Water', start: 50, end: 79 }, // Feb 19 - Mar 20
];

/**
 * Get day of year (1-366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Calculate zodiac sign from date
 */
export function getZodiacSign(date: Date): { name: string; element: string } {
  const dayOfYear = getDayOfYear(date);
  
  for (const sign of ZODIAC_SIGNS) {
    if (sign.start <= sign.end) {
      // Normal range
      if (dayOfYear >= sign.start && dayOfYear <= sign.end) {
        return { name: sign.name, element: sign.element };
      }
    } else {
      // Year-wrap range (like Capricorn)
      if (dayOfYear >= sign.start || dayOfYear <= sign.end) {
        return { name: sign.name, element: sign.element };
      }
    }
  }
  
  // Fallback
  return { name: 'Aquarius', element: 'Air' };
}

/**
 * Calculate moon sign (simplified - using current moon position)
 */
export function getMoonSign(date: Date): { name: string; element: string } {
  // Simplified: Use current date's lunar position
  // Moon cycles through signs roughly every 2.3 days
  const dayOfYear = getDayOfYear(date);
  const moonCycle = (dayOfYear * 12 / 365) % 12;
  const signIndex = Math.floor(moonCycle);
  
  const moonSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const sign = ZODIAC_SIGNS.find(s => s.name === moonSigns[signIndex]) || ZODIAC_SIGNS[0];
  return { name: sign.name, element: sign.element };
}

/**
 * Get moon phase description
 */
export function getMoonPhase(date: Date): string {
  const times = SunCalc.getMoonIllumination(date);
  const phase = times.phase;
  
  if (phase < 0.1) return 'New Moon';
  if (phase < 0.25) return 'Waxing Crescent';
  if (phase < 0.35) return 'First Quarter';
  if (phase < 0.65) return 'Waxing Gibbous';
  if (phase < 0.75) return 'Full Moon';
  if (phase < 0.85) return 'Waning Gibbous';
  if (phase < 0.95) return 'Last Quarter';
  return 'Waning Crescent';
}

/**
 * Calculate confidence level based on available data
 */
export function calculateConfidenceLevel(personalInfo: PersonalInfo): 'high' | 'medium' | 'low' {
  const hasDate = !!personalInfo.birthDate;
  const hasTime = !!personalInfo.birthTime && !personalInfo.unknownTime;
  const hasPlace = !!personalInfo.birthPlace;
  
  if (hasDate && hasTime && hasPlace) return 'high';
  if (hasDate && hasPlace) return 'medium';
  return 'low';
}

/**
 * Compute complete astrology data
 */
export function computeAstrologyData(personalInfo: PersonalInfo): AstrologyData | null {
  if (!personalInfo.birthDate) return null;
  
  const birthDate = new Date(personalInfo.birthDate);
  
  // Use birth time if provided, otherwise default to 12:00
  if (personalInfo.birthTime && !personalInfo.unknownTime) {
    const [hours, minutes] = personalInfo.birthTime.split(':').map(Number);
    birthDate.setHours(hours, minutes);
  } else {
    birthDate.setHours(12, 0); // Default to noon UTC
  }
  
  const sunSign = getZodiacSign(birthDate);
  const moonSign = getMoonSign(birthDate);
  const moonPhase = getMoonPhase(new Date()); // Current moon phase
  const isMoonApprox = !personalInfo.birthTime || personalInfo.unknownTime; // Approximate if no birth time
  const confidenceLevel = calculateConfidenceLevel(personalInfo);
  
  return {
    sunSign: sunSign.name,
    moonSign: moonSign.name,
    moonPhase,
    isMoonApprox,
    confidenceLevel,
  };
}

/**
 * Get elemental guidance text for oracle interpretations
 */
export function getElementalGuidance(sunSign: string, moonSign: string): string {
  const sunElement = ZODIAC_SIGNS.find(s => s.name === sunSign)?.element || 'Air';
  const moonElement = ZODIAC_SIGNS.find(s => s.name === moonSign)?.element || 'Water';
  
  const elementalMessages = {
    Fire: 'ignite your inner spark and take inspired action',
    Earth: 'ground yourself and trust the wisdom of steady growth', 
    Air: 'embrace clarity and let fresh perspectives guide you',
    Water: 'honor your intuition and emotional wisdom',
  };
  
  const sunGuidance = elementalMessages[sunElement as keyof typeof elementalMessages];
  const moonGuidance = elementalMessages[moonElement as keyof typeof elementalMessages];
  
  return `With your ${sunSign} sun encouraging you to ${sunGuidance}, and your ${moonSign} moon calling you to ${moonGuidance}, this guidance resonates with your natural cosmic rhythm.`;
}

/**
 * Generate "Why this guidance?" explanation
 */
export function generateGuidanceExplanation(
  astrologyData: AstrologyData,
  cardTitles: string[]
): string {
  const { sunSign, moonSign, moonPhase } = astrologyData;
  
  return `This reading aligns with your cosmic influences: Your ${sunSign} sun brings ${ZODIAC_SIGNS.find(s => s.name === sunSign)?.element.toLowerCase()} energy, while your ${moonSign} moon adds ${ZODIAC_SIGNS.find(s => s.name === moonSign)?.element.toLowerCase()} wisdom. During this ${moonPhase.toLowerCase()}, the oracle cards ${cardTitles.join(', ')} speak to both your solar purpose and lunar intuition.`;
}