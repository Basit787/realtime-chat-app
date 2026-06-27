import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MessageCircle } from "lucide-react";
import { BrandPanel } from "@/components/layout/BrandPanel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/pages/auth/api/hooks";

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
  const { login, register } = useAuth();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  const onLogin = (values: LoginValues) => {
    login.mutate({ email: values.email, password: values.password });
  };

  const onRegister = (values: RegisterValues) => {
    register.mutate({
      email: values.email,
      password: values.password,
      name: values.name,
    });
  };

  return (
    <div className="relative flex min-h-dvh bg-background">
      <div className="absolute right-4 top-4 z-10 xl:hidden">
        <ThemeToggle />
      </div>

      <BrandPanel />

      <div className="flex min-h-dvh flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/20">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Welcome to ChatWave</CardTitle>
                <CardDescription>{mode === "login" ? "Sign in to continue" : "Create your account"}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {mode === "login" ? (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-xl"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" className="rounded-xl" {...loginForm.register("password")} />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={login.isPending}>
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
                  <Input id="name" placeholder="Your name" className="rounded-xl" {...registerForm.register("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" className="rounded-xl" {...registerForm.register("email")} />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    className="rounded-xl"
                    {...registerForm.register("password")}
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={register.isPending}>
                  Register
                </Button>
                <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => setMode("login")}>
                  Back to sign in
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
