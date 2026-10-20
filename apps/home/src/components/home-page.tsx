import { LayoutGrid, LogOut } from "lucide-react";
import { useAuth } from "frontend-common";
import { Button, ModeToggle } from "pui";
import { AppCard } from "@/components/app-card";
import { APPS } from "@/lib/apps";

export const HomePage = () => {
  const { user, client } = useAuth();

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <span className="font-semibold">Home</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <ModeToggle />
            <Button variant="outline" size="sm" className="gap-2" onClick={() => void client.signOut()}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Welcome back{user?.name ? `, ${user.name}` : ""}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick an app to open. You stay signed in across all of them.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </main>
    </div>
  );
};
