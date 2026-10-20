import { ArrowUpRight } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "pui";
import type { AppEntry } from "@/lib/apps";

type AppCardProps = { app: AppEntry };

export const AppCard = ({ app }: AppCardProps) => {
  const Icon = app.icon;
  return (
    <a
      href={app.url}
      className="group block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Card className="h-full transition-colors group-hover:border-primary/50 group-hover:bg-accent/40">
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Icon className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
          </div>
          <CardTitle className="text-lg">{app.name}</CardTitle>
          <CardDescription>{app.description}</CardDescription>
        </CardHeader>
      </Card>
    </a>
  );
};
