import { CheckCheck, Lock, MessageCircle, Smartphone, User, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  { icon: Zap, label: "Real-Time Messaging" },
  { icon: User, label: "Online Presence" },
  { icon: CheckCheck, label: "Read Receipts" },
  { icon: Lock, label: "Secure & Private" },
  { icon: Smartphone, label: "Responsive Design" },
];

const TECH_STACK = ["Node.js", "React", "JS", "TS", "⚡"];

export function BrandPanel() {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col justify-between border-r border-border bg-sidebar p-8 text-sidebar-foreground xl:flex">
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/20 shadow-sm ring-1 ring-primary/20">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <ThemeToggle />
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight">
          Real-Time
          <br />
          <span className="bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">Chat</span>
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Connect instantly with friends and teams. Experience seamless messaging with live presence, typing indicators,
          and crystal-clear calls.
        </p>

        <ul className="mt-8 space-y-4">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {TECH_STACK.map((tech) => (
          <span
            key={tech}
            className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
          >
            {tech}
          </span>
        ))}
      </div>
    </aside>
  );
}
