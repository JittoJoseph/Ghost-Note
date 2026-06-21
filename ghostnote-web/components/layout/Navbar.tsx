"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Container } from "./Container";
import { FaGhost } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";

export function Navbar() {
  const { token, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push("/");
  };

  return (
    <nav className="w-full py-4">
      <Container className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => setIsMenuOpen(false)}
        >
          <FaGhost className="w-5 h-5 text-[var(--color-primary)]" />
          <span className="font-extrabold text-lg text-[var(--color-foreground)] tracking-tight">
            GhostNote
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {token ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-bold text-stone-500 hover:text-[var(--color-foreground)] transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-stone-500 hover:text-[var(--color-foreground)] transition-colors"
              >
                Log out
              </button>
            </>
          ) : !isLoading ? (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-bold text-stone-500 hover:text-[var(--color-foreground)] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] px-5 py-2 rounded-full transition-colors"
              >
                Sign up
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile hamburger */}
        {!isLoading && (
          <button
            className="md:hidden p-2 -mr-2 text-stone-500 hover:text-[var(--color-foreground)] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiMenu className="w-5 h-5" />
            )}
          </button>
        )}
      </Container>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] mt-4">
          <Container className="flex flex-col gap-3 py-4">
            {token ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-bold text-stone-600 hover:text-[var(--color-foreground)] transition-colors py-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-bold text-stone-600 hover:text-[var(--color-foreground)] transition-colors py-2 text-left"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-bold text-stone-600 hover:text-[var(--color-foreground)] transition-colors py-2"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors py-2"
                >
                  Sign up
                </Link>
              </>
            )}
          </Container>
        </div>
      )}
    </nav>
  );
}
