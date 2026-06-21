import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Navbar } from "@/components/layout/Navbar";
import { FiShield, FiSend, FiLock, FiStar } from "react-icons/fi";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-32">
        <Container className="flex flex-col items-center text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-[var(--color-border)] shadow-sm text-sm font-bold text-stone-600 mb-8 animate-fade-up">
            <FiStar className="text-[var(--color-primary)]" />
            <span>Secure & Anonymous Messaging</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[var(--color-foreground)] mb-6 leading-[1.1] animate-fade-up animate-delay-100">
            Speak freely.
            <br />
            Listen safely.
          </h1>
          <p className="text-xl font-medium text-stone-500 mb-12 max-w-2xl leading-relaxed animate-fade-up animate-delay-200">
            Create single-use, password-protected links to receive anonymous
            messages. No tracking, no hassle, just honest feedback.
          </p>
          <div className="flex items-center gap-4 animate-fade-up animate-delay-300">
            <Link 
              href="/auth/register" 
              className="group inline-flex items-center justify-center gap-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-10 py-4 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-black/10 text-lg"
            >
              <span>Start for free</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </Container>
      </main>
    </div>
  );
}
