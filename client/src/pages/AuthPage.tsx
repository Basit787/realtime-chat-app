import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MessageCircle } from "lucide-react";
import { BrandPanel } from "@/components/layout/BrandPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Min 8 characters"),
});

const registerSchema = loginSchema.extend({
  name: z
    .string()
    .min(2, "Min 2 characters")
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, _ and - only"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  const onLogin = async (values: LoginValues) => {
    const error = await login(values.email, values.password);
    if (error) loginForm.setError("email", { message: error });
  };

  const onRegister = async (values: RegisterValues) => {
    const error = await register(values.email, values.password, values.name);
    if (error) registerForm.setError("email", { message: error });
  };

  return (
    <div className="flex min-h-dvh">
      <BrandPanel />

      <div className="flex min-h-dvh flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 shadow-[0_0_24px_rgba(20,184,166,0.35)]">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome to ChatWave</h2>
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "Sign in to continue" : "Create your account"}
              </p>
            </div>
          </div>

          {mode === "login" ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="rounded-xl bg-input"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  className="rounded-xl bg-input"
                  {...loginForm.register("password")}
                />
              </div>
              <Button type="submit" className="w-full rounded-xl">
                Sign in
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setMode("register")}
              >
                Create an account
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="rounded-xl bg-input"
                  {...registerForm.register("name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  className="rounded-xl bg-input"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  className="rounded-xl bg-input"
                  {...registerForm.register("password")}
                />
              </div>
              <Button type="submit" className="w-full rounded-xl">
                Register
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setMode("login")}
              >
                Back to sign in
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
