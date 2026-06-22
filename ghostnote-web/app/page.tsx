import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Navbar } from "@/components/layout/Navbar";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-32 px-4">
        <Container className="flex flex-col items-center text-center max-w-4xl">
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-[var(--color-foreground)] mb-6 leading-[1.1] animate-fade-up">
            Speak freely.
            <br />
            Listen safely.
          </h1>
          <p className="text-lg md:text-xl font-medium text-stone-500 mb-12 max-w-2xl leading-relaxed animate-fade-up animate-delay-100">
            Create single-use, password-protected links to receive anonymous
            messages. No tracking, no hassle, just honest feedback.
          </p>
          <div className="flex items-center gap-4 animate-fade-up animate-delay-200">
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

          <div className="mt-16 flex flex-col items-center animate-fade-up animate-delay-[300ms]">
            <p className="text-xs font-bold text-stone-400 mb-4 tracking-widest uppercase">
              Also available on
            </p>
            <Link
              href="https://t.me/Ghostnote_messenger_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 py-2.5 rounded-full bg-white border-2 border-stone-100 hover:border-[#2AABEE] hover:shadow-[0_8px_24px_-8px_rgba(42,171,238,0.4)] transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-[#2AABEE] flex items-center justify-center shadow-inner">
                <svg
                  className="w-[18px] h-[18px] text-white pr-[2px] pt-[1px]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.148 4.6 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
                </svg>
              </div>
              <span className="font-bold text-stone-700 group-hover:text-[#2AABEE] transition-colors">
                Telegram Bot
              </span>
            </Link>
          </div>
        </Container>
      </main>
    </div>
  );
}
