import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatWaveLogo } from "@/components/brand/ChatWaveLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/pages/auth/components/LoginForm";
import { RegisterForm } from "@/pages/auth/components/RegisterForm";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="relative flex min-h-dvh bg-background">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="flex min-h-dvh w-full items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <ChatWaveLogo className="h-12 w-12 rounded-2xl ring-1 ring-primary/20" />
              <div>
                <CardTitle className="text-xl">Welcome to ChatWave</CardTitle>
                <CardDescription>{mode === "login" ? "Sign in to continue" : "Create your account"}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {mode === "login" ? (
              <LoginForm onSwitchToRegister={() => setMode("register")} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setMode("login")} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
