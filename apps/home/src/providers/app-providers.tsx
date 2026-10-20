import type { ReactNode } from "react";
import { AuthProvider } from "frontend-common";
import { authClient } from "@/lib/auth";
import { ThemeProvider } from "pui";

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <ThemeProvider defaultTheme="dark">
    <AuthProvider client={authClient}>{children}</AuthProvider>
  </ThemeProvider>
);
