import { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { useAuth } from '../contexts/AuthContext';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export interface SubscriptionStatus {
  has_active_subscription: boolean;
  plan_type?: string;
  status?: string;
  current_period_end?: string;
  shipping_address?: any;
}

export function useSubscription() {
  const { token, user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      setSubscription({ has_active_subscription: false });
      setLoading(false);
      return;
    }

    fetchSubscriptionStatus();
  }, [token, user]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/subscription-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        setSubscription({ has_active_subscription: false });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription({ has_active_subscription: false });
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    setLoading(true);
    fetchSubscriptionStatus();
  };

  return {
    subscription,
    loading,
    refetch,
    isPremium: subscription?.has_active_subscription || user?.is_admin || false,
  };
}