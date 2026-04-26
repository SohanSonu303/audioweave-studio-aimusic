"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useRef } from "react";
import { api, ApiError, type FetchOptions } from "@/lib/api/client";

// Clerk JWTs default to 60 s; cache for 50 s to avoid serving an about-to-expire token
const TOKEN_TTL_MS = 50_000;

/**
 * Client-side API wrapper. Automatically attaches the current Clerk JWT
 * as `Authorization: Bearer ...` on every request.
 *
 * Usage inside a client component:
 *   const api = useApi();
 *   const { data } = useQuery({ queryKey: [...], queryFn: () => api.get('/library') });
 */
export function useApi() {
  const { getToken } = useAuth();
  const tokenCacheRef = useRef<{ token: string; expiresAt: number } | null>(null);

  // Invalidate cache on auth-state change (sign-out / user switch)
  useEffect(() => {
    tokenCacheRef.current = null;
  }, [getToken]);

  return useMemo(() => {
    const getCachedToken = async (): Promise<string | null> => {
      const now = Date.now();
      if (tokenCacheRef.current && tokenCacheRef.current.expiresAt > now) {
        return tokenCacheRef.current.token;
      }
      const token = await getToken();
      if (token) {
        tokenCacheRef.current = { token, expiresAt: now + TOKEN_TTL_MS };
      }
      return token;
    };

    const withAuth = async (
      fn: (opts: FetchOptions) => Promise<unknown>,
      options?: FetchOptions,
    ) => {
      let token = await getCachedToken();
      try {
        return await fn({ ...options, token });
      } catch (err) {
        // On 401 clear the cache and retry once — the token may have been revoked server-side
        if (err instanceof ApiError && err.status === 401) {
          tokenCacheRef.current = null;
          token = await getCachedToken();
          return fn({ ...options, token });
        }
        throw err;
      }
    };

    return {
      get: <T>(path: string, options?: FetchOptions) =>
        withAuth((o) => api.get<T>(path, o), options) as Promise<T>,
      post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
        withAuth((o) => api.post<T>(path, body, o), options) as Promise<T>,
      put: <T>(path: string, body?: unknown, options?: FetchOptions) =>
        withAuth((o) => api.put<T>(path, body, o), options) as Promise<T>,
      patch: <T>(path: string, body?: unknown, options?: FetchOptions) =>
        withAuth((o) => api.patch<T>(path, body, o), options) as Promise<T>,
      delete: <T>(path: string, options?: FetchOptions) =>
        withAuth((o) => api.delete<T>(path, o), options) as Promise<T>,
    };
  }, [getToken]);
}
