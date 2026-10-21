import type { Metadata } from "next";
import { Providers } from "@/components/providers/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Link Shortener",
  description: "Create and track short links",
};

// Applies the saved theme before first paint so there is no light/dark flash
const themeScript = `try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.remove("dark");else document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
