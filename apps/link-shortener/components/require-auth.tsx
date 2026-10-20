"use client";

import { useAuth } from "frontend-common";
import { Spinner } from "pui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

// Renders children for a signed-in user; a missing or expired session goes to /login
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "signedOut") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname]);

  if (status !== "signedIn") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }
  return <>{children}</>;
}
