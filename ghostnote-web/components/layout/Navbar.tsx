import Link from "next/link";
import { Container } from "./Container";
import { FaGhost } from "react-icons/fa";

export function Navbar() {
  return (
    <nav className="w-full py-6 bg-[var(--color-background)] sticky top-0 z-40">
      <Container className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <div className="bg-indigo-50 p-2 rounded-xl text-[var(--color-primary)]">
            <FaGhost className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-[var(--color-foreground)] tracking-tight">
            GhostNote
          </span>
        </Link>

        <div>
          <Link
            href="/auth/register"
            className="text-base font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow"
          >
            Sign up
          </Link>
        </div>
      </Container>
    </nav>
  );
}
