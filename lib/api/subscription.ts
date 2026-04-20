"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";

export interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

export interface Subscription {
  plan_id: string;
  plan_name: string;
  status: string;
  credits_used: number;
  credits_total: number;
  renews_at: string | null;
}

export interface CheckoutSession {
  checkout_url: string;
}

/** Fetch available plans */
export function usePlans() {
  const api = useApi();
  return useQuery({
    queryKey: ["plans"],
    queryFn: () => api.get<Plan[]>("/payment/plans"),
  });
}

/** Fetch current user subscription + credit usage */
export function useSubscription() {
  const api = useApi();
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.get<Subscription>("/payment/subscription"),
  });
}

/** Start a Stripe/Dodo checkout session */
export function useCheckout() {
  const api = useApi();
  return useMutation({
    mutationFn: (planId: string) =>
      api.post<CheckoutSession>("/payment/checkout", { plan_id: planId }),
    onSuccess: ({ checkout_url }) => {
      window.location.href = checkout_url;
    },
  });
}
