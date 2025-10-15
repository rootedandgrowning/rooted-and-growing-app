// Anonymous Telemetry - No PII collected

interface TelemetryEvent {
  event_name: string;
  timestamp: number;
  app_version: string;
  platform: string;
}

// Event names
export const TELEMETRY_EVENTS = {
  DAILY_DRAW_SHOWN: 'daily_draw_shown',
  JOURNAL_SAVED: 'journal_saved',
  WEEKLY_CARD_VIEWED: 'weekly_card_viewed',
  UPGRADE_CTA_TAPPED: 'upgrade_cta_tapped',
  QR_UNLOCK_SUCCESS: 'qr_unlock_success',
  // Onboarding events
  ONBOARDING_START: 'rg.onboarding.start',
  ONBOARDING_FOCUS_SELECT: 'rg.onboarding.focus_select',
  ONBOARDING_CARD_DRAW: 'rg.onboarding.card_draw',
  ONBOARDING_REMINDER_SET: 'rg.onboarding.reminder_set',
  ONBOARDING_COMPLETED: 'rg.onboarding.completed',
  // Peek mode events
  PEEK_MODE_VIEW: 'rg.peek_mode.view',
  PEEK_MODE_UPGRADE_TAPPED: 'rg.peek_mode.upgrade_tapped',
} as const;

// Log telemetry event (anonymous, no PII)
export const logTelemetryEvent = async (
  eventName: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    const event: TelemetryEvent = {
      event_name: eventName,
      timestamp: Date.now(),
      app_version: '1.0.0',
      platform: 'mobile',
    };

    // In production, this would send to your analytics service
    // For MVP, we just log it
    console.log('[Telemetry]', eventName, metadata || {});

    // TODO: Send to backend analytics endpoint when ready
    // await fetch(`${BACKEND_URL}/api/telemetry`, {
    //   method: 'POST',
    //   body: JSON.stringify({ ...event, ...metadata }),
    // });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.error('[Telemetry] Error logging event:', error);
  }
};

// Convenience functions for specific events
export const logDailyDrawShown = (cardId: string) => {
  logTelemetryEvent(TELEMETRY_EVENTS.DAILY_DRAW_SHOWN, { card_id: cardId });
};

export const logJournalSaved = (cardId: string, promptUsed: boolean) => {
  logTelemetryEvent(TELEMETRY_EVENTS.JOURNAL_SAVED, {
    card_id: cardId,
    prompt_used: promptUsed,
  });
};

export const logWeeklyCardViewed = (cardId: string) => {
  logTelemetryEvent(TELEMETRY_EVENTS.WEEKLY_CARD_VIEWED, { card_id: cardId });
};

export const logUpgradeCTATapped = (source: string, eventType?: string) => {
  logTelemetryEvent(TELEMETRY_EVENTS.UPGRADE_CTA_TAPPED, { 
    source, 
    event_type: eventType 
  });
};

export const logQRUnlockSuccess = (month: string) => {
  logTelemetryEvent(TELEMETRY_EVENTS.QR_UNLOCK_SUCCESS, { month });
};

// Onboarding analytics functions
export const logOnboardingStart = () => {
  logTelemetryEvent(TELEMETRY_EVENTS.ONBOARDING_START);
};

export const logOnboardingFocusSelect = (focus: string[]) => {
  logTelemetryEvent(TELEMETRY_EVENTS.ONBOARDING_FOCUS_SELECT, { focus });
};

export const logOnboardingCardDraw = (cardId: string) => {
  logTelemetryEvent(TELEMETRY_EVENTS.ONBOARDING_CARD_DRAW, { card_id: cardId });
};

export const logOnboardingReminderSet = (reminderTime: string, pushOptIn: boolean) => {
  logTelemetryEvent(TELEMETRY_EVENTS.ONBOARDING_REMINDER_SET, { 
    reminder_time: reminderTime, 
    push_opt_in: pushOptIn 
  });
};

export const logOnboardingCompleted = (focus: string[], cardId: string, reminderTime: string, pushOptIn: boolean) => {
  logTelemetryEvent(TELEMETRY_EVENTS.ONBOARDING_COMPLETED, { 
    focus, 
    card_id: cardId, 
    reminder_time: reminderTime, 
    push_opt_in: pushOptIn 
  });
};

// Peek mode analytics functions
export const logPeekModeView = (cardId: string) => {
  logTelemetryEvent(TELEMETRY_EVENTS.PEEK_MODE_VIEW, { card_id: cardId });
};

export const logPeekModeUpgradeTapped = (cardId: string) => {
  logTelemetryEvent(TELEMETRY_EVENTS.PEEK_MODE_UPGRADE_TAPPED, { card_id: cardId });
};
