import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "GhostNote",
  description: "Secure Anonymous Message Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
