import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, PasswordInput } from "pui";
import { Loader2, MessageCircle } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { useAuthClient } from "./use-auth";

export type LoginScreenProps = { appName?: string; logo?: ReactNode; headerRight?: ReactNode };

const errorText = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

// The one sign-in / sign-up screen every app shows
export const LoginScreen = ({ appName = "ChatWave", logo, headerRight }: LoginScreenProps) => {
  const client = useAuthClient();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const signingUp = mode === "signUp";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return setError("Enter your email and password");
    if (signingUp && !name.trim()) return setError("Choose a username");
    if (signingUp && password !== confirm) return setError("Passwords do not match");
    setLoading(true);
    setError("");
    try {
      if (signingUp) await client.signUp({ name: name.trim(), email: email.trim(), password });
      else await client.signIn({ email: email.trim(), password });
    } catch (e) {
      setError(errorText(e, signingUp ? "Could not create account" : "Could not sign in"));
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(signingUp ? "signIn" : "signUp");
    setError("");
  };

  return (
    <div className="relative flex min-h-dvh bg-background">
      {headerRight && <div className="absolute top-4 right-4 z-10">{headerRight}</div>}
      <div className="flex min-h-dvh w-full items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              {logo ?? (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <MessageCircle className="h-6 w-6" />
                </div>
              )}
              <div>
                <CardTitle className="text-xl">Welcome to {appName}</CardTitle>
                <CardDescription>{signingUp ? "Create your account" : "Sign in to continue"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void submit(e)} className="space-y-4" noValidate>
              {signingUp && (
                <div className="space-y-2">
                  <Label htmlFor="auth-name">Username</Label>
                  <Input
                    id="auth-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="username"
                    className="rounded-xl"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <PasswordInput
                  id="auth-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={signingUp ? "At least 8 characters" : "Enter your password"}
                  autoComplete={signingUp ? "new-password" : "current-password"}
                  className="rounded-xl"
                />
              </div>
              {signingUp && (
                <div className="space-y-2">
                  <Label htmlFor="auth-confirm">Confirm password</Label>
                  <PasswordInput
                    id="auth-confirm"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="rounded-xl"
                  />
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {signingUp ? "Create account" : "Sign in"}
              </Button>
              <Button type="button" variant="outline" className="w-full rounded-xl" onClick={switchMode}>
                {signingUp ? "Already have an account? Sign in" : "Create an account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
