import type { Metadata } from "next";
import { LoginPage } from "@/components/login-page";

export const metadata: Metadata = { title: "Sign in · Link Shortener" };

export default function Login() {
  return <LoginPage />;
}
