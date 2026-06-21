"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Container } from "@/components/layout/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  FiCopy,
  FiCheck,
  FiPlus,
  FiLogOut,
} from "react-icons/fi";
import { FaGhost } from "react-icons/fa";
import Link from "next/link";

interface Submission {
  id: string;
  message: string;
  createdAt: number;
}

interface DashboardLink {
  id: string;
  slug: string;
  createdAt: number;
  isUsed: boolean;
  visitCount: number;
  submission: Submission | null;
}

export default function DashboardPage() {
  const { token, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [links, setLinks] = useState<DashboardLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [linkPassword, setLinkPassword] = useState("");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [createError, setCreateError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [selectedLink, setSelectedLink] = useState<DashboardLink | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push("/auth/login");
    }
  }, [isAuthLoading, token, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const fetchLinks = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/links`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = (await res.json()) as { links: DashboardLink[] };
        setLinks(data.links);
      }
    } catch (error) {
      console.error("Failed to fetch links", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreatedLink(null);
    setIsCreatingLink(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: linkPassword }),
      });

      const data = (await res.json()) as {
        error?: string;
        url?: string;
        slug?: string;
      };
      if (!res.ok) throw new Error(data.error || "Failed to create link");

      // Handle both full URL (when FRONTEND_URL is set) and relative URL
      const fullUrl =
        data.url && data.url.startsWith("http")
          ? data.url
          : `${window.location.origin}${data.url || `/l/${data.slug}`}`;
      setCreatedLink(fullUrl);
      setLinkPassword("");
      fetchLinks();
    } catch (err: unknown) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create link",
      );
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleCopy = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation(); // prevent modal from opening when clicking copy
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleCopyModal = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getLinkUrl = (slug: string) => `${window.location.origin}/l/${slug}`;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatFullTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Derive stats from links
  const totalLinks = links.length;
  const totalVisits = links.reduce((sum, l) => sum + l.visitCount, 0);
  const totalResponses = links.filter((l) => l.submission).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--color-background)]">
      <main className="flex-1 flex flex-col py-8 lg:py-16">
        <Container className="flex flex-col gap-12 max-w-4xl mx-auto w-full">
          {/* Top Bar (Logo + Logout) */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--color-primary)]"
            >
              <FaGhost className="w-6 h-6" />
              <span className="font-extrabold text-xl tracking-tight text-[var(--color-foreground)]">
                GhostNote
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              Log out
            </button>
          </div>

          {/* Substantial Horizontal Stats Bar */}
          {isAuthLoading || isLoading || !token ? (
            <div className="bg-white border border-stone-200 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden animate-pulse">
              <div className="flex flex-row divide-x divide-stone-100">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex-1 p-4 md:p-6 flex flex-col justify-center items-center">
                    <div className="h-8 md:h-10 w-16 bg-stone-200 rounded mb-2"></div>
                    <div className="h-3 w-12 bg-stone-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden">
              <div className="flex flex-row divide-x divide-stone-100">
                <div className="flex-1 p-4 md:p-6 flex flex-col justify-center items-center hover:bg-stone-50/50 transition-colors">
                  <span className="block text-2xl md:text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight">{totalLinks}</span>
                  <span className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest mt-1 text-center">Links</span>
                </div>
                
                <div className="flex-1 p-4 md:p-6 flex flex-col justify-center items-center hover:bg-stone-50/50 transition-colors">
                  <span className="block text-2xl md:text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight">{totalVisits}</span>
                  <span className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest mt-1 text-center">Visits</span>
                </div>
                
                <div className="flex-1 p-4 md:p-6 flex flex-col justify-center items-center hover:bg-stone-50/50 transition-colors">
                  <span className="block text-2xl md:text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight">{totalResponses}</span>
                  <span className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest mt-1 text-center">Responses</span>
                </div>
              </div>
            </div>
          )}

          {/* Create Link Section */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
            <form
              onSubmit={handleCreateLink}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter a secure password for a new link..."
                  value={linkPassword}
                  onChange={(e) => setLinkPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                isLoading={isCreatingLink}
                className="sm:w-auto h-[48px] px-8 shrink-0 text-base"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Generate Link
              </Button>
            </form>

            {createError && (
              <p className="text-sm text-red-500 font-medium mt-3 px-1">
                {createError}
              </p>
            )}

            {createdLink && (
              <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                <code className="text-base font-bold text-green-800 break-all flex-1">
                  {createdLink}
                </code>
                <button
                  onClick={(e) => handleCopy(e, createdLink, "new")}
                  className="inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shrink-0 px-5 py-2 rounded-xl"
                >
                  {copiedId === "new" ? (
                    <FiCheck className="w-4 h-4" />
                  ) : (
                    <FiCopy className="w-4 h-4" />
                  )}
                  {copiedId === "new" ? "Copied" : "Copy Link"}
                </button>
              </div>
            )}
          </div>

          {/* Links List - Taller stacked cards */}
          {isAuthLoading || isLoading || !token ? (
            <div className="flex flex-col gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 animate-pulse">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col gap-3">
                      <div className="h-8 w-40 bg-stone-200 rounded"></div>
                      <div className="h-4 w-32 bg-stone-100 rounded"></div>
                    </div>
                    <div className="w-10 h-10 bg-stone-100 rounded-full"></div>
                  </div>
                  <div className="w-full h-24 bg-stone-50 rounded-2xl border border-stone-100"></div>
                </div>
              ))}
            </div>
          ) : links.length === 0 ? (
            /* Empty State */
            <div className="py-20 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border border-stone-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <FaGhost className="w-8 h-8 text-stone-300" />
              </div>
              <h2 className="text-lg font-extrabold text-[var(--color-foreground)] mb-2">
                No links yet
              </h2>
              <p className="text-sm text-stone-500 font-medium max-w-xs">
                Generate a secure link above and share it to receive your first
                anonymous message.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {links.map((link) => {
                const url = getLinkUrl(link.slug);
                const isCopied = copiedId === link.id;

                return (
                  <div
                    key={link.id}
                    onClick={() => setSelectedLink(link)}
                    className="group flex flex-col bg-white rounded-3xl border border-stone-200 p-6 md:p-8 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-stone-300"
                  >
                    {/* Top Metadata Area */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex flex-col gap-3">
                        {/* Title & Stats block */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <span className="text-2xl font-extrabold text-[var(--color-foreground)] tracking-tight">
                            {link.slug}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                                link.submission
                                  ? "bg-green-50 text-green-700 border border-green-100"
                                  : "bg-stone-100 text-stone-500"
                              }`}
                            >
                              {link.submission
                                ? "Response Received"
                                : "Awaiting..."}
                            </span>
                            <span className="text-sm font-bold text-stone-400">
                              · {link.visitCount}{" "}
                              {link.visitCount === 1 ? "Visit" : "Visits"}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-stone-400">
                          Created {formatTime(link.createdAt)}
                        </span>
                      </div>

                      {/* Copy Button */}
                      <button
                        onClick={(e) => handleCopy(e, url, link.id)}
                        className={`p-3 rounded-full transition-colors shrink-0 ${
                          isCopied
                            ? "bg-green-100 text-green-700"
                            : "bg-stone-50 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                        }`}
                        title="Copy link"
                      >
                        {isCopied ? (
                          <FiCheck className="w-5 h-5" />
                        ) : (
                          <FiCopy className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Bottom Response Area */}
                    <div className="w-full bg-stone-50 rounded-2xl border border-stone-100 p-5 md:p-6 group-hover:bg-stone-100/50 transition-colors">
                      {link.submission ? (
                        <p className="text-base text-stone-700 font-medium line-clamp-3 leading-relaxed">
                          {link.submission.message}
                        </p>
                      ) : (
                        <p className="text-base text-stone-400 italic font-medium flex items-center gap-2">
                          No message yet. Share your link to receive responses.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </main>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedLink} onClose={() => setSelectedLink(null)}>
        {selectedLink && (
          <div className="flex flex-col pr-8">
            {/* Modal Header */}
            <div className="flex flex-col mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-extrabold text-[var(--color-foreground)] tracking-tight">
                  {selectedLink.slug}
                </h3>
                <button
                  onClick={() =>
                    handleCopyModal(getLinkUrl(selectedLink.slug), "modal")
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    copiedId === "modal"
                      ? "bg-green-100 text-green-700"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {copiedId === "modal" ? (
                    <FiCheck className="w-3.5 h-3.5" />
                  ) : (
                    <FiCopy className="w-3.5 h-3.5" />
                  )}
                  {copiedId === "modal" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-sm text-stone-400 font-medium mt-2">
                {selectedLink.submission
                  ? `Received on ${formatFullTime(selectedLink.submission.createdAt)}`
                  : `Created on ${formatFullTime(selectedLink.createdAt)}`}
              </p>
            </div>

            <div className="h-px w-full bg-stone-100 mb-6" />

            {/* Modal Body */}
            {selectedLink.submission ? (
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                <p className="text-[var(--color-foreground)] whitespace-pre-wrap text-base font-medium leading-relaxed">
                  {selectedLink.submission.message}
                </p>
              </div>
            ) : (
              <div className="flex flex-col py-8 text-stone-400">
                <p className="text-base font-bold text-stone-500">
                  Still waiting...
                </p>
                <p className="text-sm font-medium mt-1">
                  No one has left a message on this link yet.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
