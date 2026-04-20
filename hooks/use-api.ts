"use client";

import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { api, type FetchOptions } from "@/lib/api/client";

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

  return useMemo(() => {
    const withAuth = async (
      fn: (opts: FetchOptions) => Promise<unknown>,
      options?: FetchOptions,
    ) => {
      const token = await getToken();
      return fn({ ...options, token });
    };

    return {
      get: <T>(path: string, options?: FetchOptions) =>
        withAuth((o) => api.get<T>(path, o), options) as Promise<T>,
      post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
        withAuth((o) => api.post<T>(path, body, o), options) as Promise<T>,
      patch: <T>(path: string, body?: unknown, options?: FetchOptions) =>
        withAuth((o) => api.patch<T>(path, body, o), options) as Promise<T>,
      delete: <T>(path: string, options?: FetchOptions) =>
        withAuth((o) => api.delete<T>(path, o), options) as Promise<T>,
    };
  }, [getToken]);
}
