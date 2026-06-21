"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FaGhost } from "react-icons/fa";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as { token?: string, error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }

      if (data.token) {
        login(data.token);
        router.push("/dashboard");
      } else {
        throw new Error("No token received");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-background)] min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-[420px] animate-fade-up">
          <Card className="w-full flex flex-col">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-[var(--color-primary)] rounded-full flex items-center justify-center mb-4 shadow-inner">
                <FaGhost className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--color-foreground)] tracking-tight">Create an account</h1>
              <p className="text-stone-500 text-sm font-medium mt-2">Sign up to start receiving anonymous feedback</p>
            </div>

            <div className="h-10 mb-2">
              {error ? (
                <div className="h-full flex items-center justify-center text-[13px] text-red-500 font-bold bg-red-50 rounded-xl border border-red-100 px-4 text-center">
                  {error}
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <Button type="submit" className="w-full mt-2 py-3 text-base" isLoading={isLoading}>
                Sign Up
              </Button>
            </form>

            <div className="mt-8 text-center text-sm font-bold text-stone-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline transition-colors">
                Log in
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
