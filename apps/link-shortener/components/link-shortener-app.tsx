"use client";

import { Dashboard } from "./dashboard";
import { RequireAuth } from "./require-auth";

export function LinkShortenerApp() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}
