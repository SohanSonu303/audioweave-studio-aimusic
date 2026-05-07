"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useApi } from "@/hooks/use-api";

export interface AuthUser {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface AuthSubscription {
  plan: string;
  status: string;
}

export interface TokenBalance {
  total_tokens: number;
  used_tokens: number;
  balance: number;
}

export interface AuthMeResponse {
  user: AuthUser;
  subscription: AuthSubscription;
  token_balance: TokenBalance;
}

/** Fetch current user profile, subscription, and token balance */
export function useMe() {
  const api = useApi();
  const { isLoaded, isSignedIn } = useAuth();
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<AuthMeResponse>("/auth/me"),
    staleTime: 30_000,
    enabled: isLoaded && !!isSignedIn,
  });
}
