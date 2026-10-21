"use client";

import { LoginScreen, useAuth } from "frontend-common";
import { Link2 } from "lucide-react";
import { ModeToggle } from "my-ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { safeNextPath } from "@/utils/safe-next-path";

const logo = (
  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
    <Link2 className="h-6 w-6" />
  </div>
);

// The shared login screen; once signed in, continue to where the user was going
export function LoginPage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "signedIn") router.replace(safeNextPath(window.location.search));
  }, [status, router]);

  return <LoginScreen appName="Link Shortener" logo={logo} headerRight={<ModeToggle />} />;
}
