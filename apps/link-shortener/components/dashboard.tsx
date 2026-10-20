"use client";

import { useAuth } from "frontend-common";
import { Link2, LogOut } from "lucide-react";
import { ModeToggle, PuiButton } from "pui";
import { CreateLinkForm } from "./create-link-form";
import { LinksTable } from "./links-table";

// Signed-in page: header, the create form and the user's links
export function Dashboard() {
  const { user, client } = useAuth();
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <span className="font-semibold">Link Shortener</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <ModeToggle />
            <PuiButton variant="outline" size="sm" icon={<LogOut />} onClick={() => void client.signOut()}>
              Sign out
            </PuiButton>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <CreateLinkForm />
        <LinksTable />
      </main>
    </div>
  );
}
