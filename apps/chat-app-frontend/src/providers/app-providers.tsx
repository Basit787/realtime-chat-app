import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "frontend-common";
import { Toaster, TooltipProvider, ThemeProvider } from "pui";
import { authClient } from "@/lib/auth";
import { queryClient } from "@/lib/query-client";

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <ThemeProvider defaultTheme="dark">
    <QueryClientProvider client={queryClient}>
      <AuthProvider client={authClient}>
        <TooltipProvider>{children}</TooltipProvider>
      </AuthProvider>
      <Toaster richColors closeButton position="top-right" />
    </QueryClientProvider>
  </ThemeProvider>
);
