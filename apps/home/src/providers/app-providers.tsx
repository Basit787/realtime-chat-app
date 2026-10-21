import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, CookieConsent } from "frontend-common";
import { authClient } from "@/lib/auth";
import { ThemeProvider, Toaster } from "my-ui";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  // The shared account screens run their requests through React Query
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider client={authClient}>{children}</AuthProvider>
      </QueryClientProvider>
      <Toaster richColors closeButton position="top-right" />
      <CookieConsent />
    </ThemeProvider>
  );
};
