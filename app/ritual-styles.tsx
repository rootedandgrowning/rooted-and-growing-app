// Comprehensive Styles for Monthly Ritual Screen
import { StyleSheet } from 'react-native';

export const ritualStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header Section
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  monthBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  monthText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  manageLink: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 4,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  boxImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  boxImageLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtext: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },

  // Tea & Tincture Box Card
  boxCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  boxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  boxDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Section Titles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },

  // Ritual Steps
  stepCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginLeft: 44,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 44,
    marginTop: 4,
  },
  
  // Daily Actions Selector
  dailyActionsContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  dailyActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  selectedActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },

  // Ritual Guidance
  guidanceCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  guidanceTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  guidanceText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  ritualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  ritualButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Box Details (Premium)
  boxDetailsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  boxDetailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  productSection: {
    marginBottom: 20,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  productDetails: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  allergenWarning: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  safetyText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  storageText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  // Ask the Herbalist
  herbalistCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  herbalistTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  herbalistIntro: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 16,
  },
  questionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 12,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  askButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  answerContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // FAQ Section
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  faqContent: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 18,
  },

  // Upgrade CTA
  upgradeCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  upgradeBullets: {
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  upgradeBullet: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  upgradeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Box Circle Preview
  boxCircleContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    marginHorizontal: 16,
  },
  boxCircleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  boxCircleTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  boxCircleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(139, 115, 85, 0.1)',
    borderRadius: 8,
  },
  previewStatItem: {
    alignItems: 'center',
  },
  previewStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  previewQuotes: {
    marginBottom: 16,
  },
  previewQuotesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewQuote: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  previewTip: {
    backgroundColor: 'rgba(139, 115, 85, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  previewTipLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewTipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  boxCircleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  boxCircleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});