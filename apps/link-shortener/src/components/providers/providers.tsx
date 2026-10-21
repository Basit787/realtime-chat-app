"use client";

import { AuthProvider, CookieConsent } from "frontend-common";
import { ThemeProvider, Toaster, TooltipProvider } from "my-ui";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { QueryProvider } from "@/components/providers/query-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryProvider>
        <AuthProvider client={authClient}>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
        <Toaster richColors closeButton position="top-right" />
        <CookieConsent />
      </QueryProvider>
    </ThemeProvider>
  );
}
