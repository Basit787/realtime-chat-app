"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "frontend-common";
import { ThemeProvider, Toaster, TooltipProvider } from "pui";
import { useState, type ReactNode } from "react";
import { authClient } from "@/lib/client/auth-client";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } }),
  );
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider client={authClient}>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
        <Toaster richColors closeButton position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
