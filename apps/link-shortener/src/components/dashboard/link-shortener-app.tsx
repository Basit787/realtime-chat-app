"use client";

import { Dashboard } from "@/components/dashboard/dashboard";
import { RequireAuth } from "@/components/auth/require-auth";

export function LinkShortenerApp() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}
