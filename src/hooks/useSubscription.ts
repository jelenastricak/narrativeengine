import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type PlanType = "free" | "monthly" | "lifetime";

interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  analyses_used: number;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  canAnalyze: boolean;
  remainingAnalyses: number | null; // null means unlimited
}

const FREE_TIER_LIMIT = 1;
const PREMIUM_BYPASS_EMAILS = ["jstricak@gmail.com"];

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    isLoading: true,
    canAnalyze: false,
    remainingAnalyses: null,
  });

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setState({
        subscription: null,
        isLoading: false,
        canAnalyze: false,
        remainingAnalyses: null,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create new free subscription for user
        const { data: newSub, error: insertError } = await supabase
          .from("user_subscriptions")
          .insert({ user_id: user.id, plan: "free", analyses_used: 0 })
          .select()
          .single();

        if (insertError) throw insertError;

        setState({
          subscription: newSub as Subscription,
          isLoading: false,
          canAnalyze: true,
          remainingAnalyses: FREE_TIER_LIMIT,
        });
        return;
      }

      const sub = data as Subscription;
      const isPremiumBypass = user.email && PREMIUM_BYPASS_EMAILS.includes(user.email);
      const canAnalyze =
        isPremiumBypass ||
        sub.plan === "monthly" ||
        sub.plan === "lifetime" ||
        sub.analyses_used < FREE_TIER_LIMIT;

      const remainingAnalyses =
        isPremiumBypass || sub.plan === "monthly" || sub.plan === "lifetime"
          ? null
          : Math.max(0, FREE_TIER_LIMIT - sub.analyses_used);

      setState({
        subscription: sub,
        isLoading: false,
        canAnalyze,
        remainingAnalyses,
      });
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setState({
        subscription: null,
        isLoading: false,
        canAnalyze: false,
        remainingAnalyses: null,
      });
    }
  }, [user]);

  const incrementUsage = useCallback(async () => {
    if (!user || !state.subscription) return false;

    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ analyses_used: state.subscription.analyses_used + 1 })
        .eq("user_id", user.id);

      if (error) throw error;

      // Refresh subscription state
      await fetchSubscription();
      return true;
    } catch (err) {
      console.error("Error incrementing usage:", err);
      return false;
    }
  }, [user, state.subscription, fetchSubscription]);

  const upgradePlan = useCallback(
    async (plan: "monthly" | "lifetime", sessionId?: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("user_subscriptions")
          .update({ plan, stripe_session_id: sessionId || null })
          .eq("user_id", user.id);

        if (error) throw error;

        await fetchSubscription();
        return true;
      } catch (err) {
        console.error("Error upgrading plan:", err);
        return false;
      }
    },
    [user, fetchSubscription]
  );

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    ...state,
    fetchSubscription,
    incrementUsage,
    upgradePlan,
  };
}
