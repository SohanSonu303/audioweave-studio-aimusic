"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      mutationCache: new MutationCache({
        onSuccess: () => {
          client.invalidateQueries({ queryKey: ["me"] });
        },
      }),
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          gcTime: 60_000,
          refetchOnWindowFocus: false,
          refetchIntervalInBackground: false,
          retry: 1,
        },
      },
    });
    return client;
  });

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#e8a055",
          colorBackground: "#0a0a0a",
          colorInputBackground: "#161616",
          colorText: "#eeeeee",
          colorTextSecondary: "#888888",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>{children}</TooltipProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
