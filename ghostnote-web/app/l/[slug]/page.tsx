"use client";

import { useState, useEffect, use } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FiSend, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { FaGhost } from "react-icons/fa";

export default function AnonymousLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const validateLink = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/links/${slug}`
        );
        setIsValid(res.ok);
      } catch {
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };
    validateLink();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/links/${slug}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, message }),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to submit message"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {isValidating ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-2 border-stone-200 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto" />
            </div>
          ) : !isValid ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h1 className="text-xl font-extrabold text-[var(--color-foreground)] mb-2">
                Link Invalid
              </h1>
              <p className="text-sm text-stone-400 font-medium">
                This link has expired or has already been used.
              </p>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h1 className="text-xl font-extrabold text-[var(--color-foreground)] mb-2">
                Message Sent
              </h1>
              <p className="text-sm text-stone-400 font-medium">
                Your anonymous message has been delivered.
              </p>
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold text-[var(--color-foreground)] mb-2">
                  Send a Message
                </h1>
                <p className="text-sm text-stone-400 font-medium">
                  Your identity will remain completely anonymous.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                  label="Link Password"
                  type="password"
                  placeholder="Enter the password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div>
                  <Textarea
                    label="Your Message"
                    placeholder="Write your anonymous message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    maxLength={2000}
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs text-stone-400 font-medium">
                      No account required
                    </span>
                    <span className="text-xs text-stone-400 font-medium">
                      {message.length}/2000
                    </span>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                )}
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full py-3 text-base"
                >
                  <FiSend className="w-4 h-4 mr-2" />
                  Submit Message
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Subtle branding footer */}
      <footer className="py-6 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs text-stone-300 font-bold">
          <FaGhost className="w-3 h-3" />
          <span>GhostNote</span>
        </div>
      </footer>
    </div>
  );
}
