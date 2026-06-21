"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Container } from "./Container";
import { FaGhost } from "react-icons/fa";

export function Navbar() {
  const { token, logout, isLoading } = useAuth();

  return (
    <nav className="w-full py-8">
      <Container className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-2xl font-bold tracking-tight text-[var(--color-foreground)] hover:opacity-80 transition-opacity">
          <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-[var(--color-border)]">
            <FaGhost className="w-6 h-6 text-stone-700" />
          </div>
          <span>GhostNote</span>
        </Link>
        <div className="flex items-center gap-8 text-base font-bold">
          {!isLoading && token ? (
            <>
              <Link href="/dashboard" className="text-stone-500 hover:text-stone-900 hover:-translate-y-0.5 transition-all">Dashboard</Link>
              <button onClick={logout} className="text-stone-500 hover:text-red-500 hover:-translate-y-0.5 transition-all">Log out</button>
            </>
          ) : !isLoading ? (
            <>
              <Link href="/auth/login" className="text-stone-500 hover:text-stone-900 hover:-translate-y-0.5 transition-all">Log in</Link>
              <Link href="/auth/register" className="bg-white border-2 border-[var(--color-border)] px-6 py-2.5 rounded-full text-[var(--color-foreground)] hover:bg-stone-50 hover:shadow-md hover:-translate-y-0.5 transition-all">Sign up</Link>
            </>
          ) : null}
        </div>
      </Container>
    </nav>
  );
}
