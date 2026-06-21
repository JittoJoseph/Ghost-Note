"use client";

import { useState, useEffect, use } from "react";
import { Container } from "@/components/layout/Container";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function AnonymousLinkPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/links/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.valid) {
            setIsValid(true);
          }
        }
      } catch (err) {
        console.error("Link validation failed", err);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/links/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-background)] min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-10">
        <Container className="max-w-lg">
          {isValidating ? (
            <Card className="flex flex-col items-center justify-center py-16">
              <svg className="animate-spin h-10 w-10 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </Card>
          ) : !isValid ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center border-none shadow-[0_20px_60px_-15px_rgba(239,68,68,0.1)]">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <FiAlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-[var(--color-foreground)]">Link Invalid</h2>
              <p className="text-stone-500 font-medium mt-2 max-w-xs">This link does not exist or has already been used.</p>
            </Card>
          ) : isSuccess ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center border-none shadow-[0_20px_60px_-15px_rgba(16,185,129,0.1)]">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <FiCheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-[var(--color-foreground)]">Message Sent</h2>
              <p className="text-stone-500 font-medium mt-2 max-w-xs">Your anonymous message has been securely delivered.</p>
            </Card>
          ) : (
            <Card className="border-none">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-[var(--color-primary)] rounded-full mb-6 shadow-inner">
                  <FiCheckCircle className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-extrabold text-[var(--color-foreground)]">Send Message</h1>
                <p className="text-stone-500 mt-3 font-medium text-base">You are posting securely and anonymously. This link will be destroyed after your submission.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <Input
                  label="Link Password"
                  type="password"
                  placeholder="Enter the password provided to you"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                <Textarea
                  label="Your Message"
                  placeholder="Write your anonymous message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  required
                />
                
                <div className="flex justify-between items-center text-sm font-bold text-stone-400 px-2">
                  <span>No account required</span>
                  <span>{message.length} / 2000</span>
                </div>

                {error && <div className="text-sm text-red-500 font-bold mt-2 text-center bg-red-50 py-3 rounded-xl border border-red-100">{error}</div>}

                <Button type="submit" className="w-full mt-4 h-[60px] text-lg" isLoading={isSubmitting}>
                  Submit Message
                </Button>
              </form>
            </Card>
          )}
        </Container>
      </main>
    </div>
  );
}
