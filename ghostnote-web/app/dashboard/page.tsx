"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Container } from "@/components/layout/Container";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  FiCopy,
  FiCheck,
  FiEye,
  FiPlus,
  FiLink,
} from "react-icons/fi";
import { FaGhost } from "react-icons/fa";

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
  const { token, isLoading: isAuthLoading } = useAuth();
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

  const fetchLinks = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/links`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
        err instanceof Error ? err.message : "Failed to create link"
      );
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getLinkUrl = (slug: string) =>
    `${window.location.origin}/l/${slug}`;

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

  if (isAuthLoading || !token) return null;

  // Derive stats from links
  const totalLinks = links.length;
  const totalVisits = links.reduce((sum, l) => sum + l.visitCount, 0);
  const totalResponses = links.filter((l) => l.submission).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col py-8">
        <Container className="flex flex-col gap-8">
          {/* Header + Stats */}
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--color-foreground)] tracking-tight">
              Your Links
            </h1>
            {!isLoading && links.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-stone-400 font-medium">
                <span>
                  <strong className="text-stone-600">{totalLinks}</strong>{" "}
                  {totalLinks === 1 ? "link" : "links"}
                </span>
                <span className="text-stone-300">·</span>
                <span>
                  <strong className="text-stone-600">{totalVisits}</strong>{" "}
                  {totalVisits === 1 ? "visit" : "visits"}
                </span>
                <span className="text-stone-300">·</span>
                <span>
                  <strong className="text-stone-600">{totalResponses}</strong>{" "}
                  {totalResponses === 1 ? "response" : "responses"}
                </span>
              </div>
            )}
          </div>

          {/* Create Link */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4 md:p-5">
            <form
              onSubmit={handleCreateLink}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter a password for your link..."
                  value={linkPassword}
                  onChange={(e) => setLinkPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                isLoading={isCreatingLink}
                className="sm:w-auto h-[48px] px-6 shrink-0"
              >
                <FiPlus className="w-4 h-4 mr-1.5" />
                Generate Link
              </Button>
            </form>

            {createError && (
              <p className="text-sm text-red-500 font-medium mt-3">
                {createError}
              </p>
            )}

            {createdLink && (
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                <code className="text-sm font-bold text-green-800 break-all flex-1">
                  {createdLink}
                </code>
                <button
                  onClick={() => handleCopy(createdLink, "new")}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700 hover:text-green-900 transition-colors shrink-0"
                >
                  {copiedId === "new" ? (
                    <FiCheck className="w-4 h-4" />
                  ) : (
                    <FiCopy className="w-4 h-4" />
                  )}
                  {copiedId === "new" ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>

          {/* Links List */}
          {isLoading ? (
            <div className="py-16 text-center text-stone-400 font-medium animate-pulse">
              Loading your links...
            </div>
          ) : links.length === 0 ? (
            /* Empty State */
            <div className="py-20 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-5">
                <FaGhost className="w-7 h-7 text-stone-300" />
              </div>
              <h2 className="text-lg font-extrabold text-[var(--color-foreground)] mb-2">
                Create your first link
              </h2>
              <p className="text-sm text-stone-400 font-medium max-w-xs">
                Generate a secure, single-use link above and share it with
                someone to receive anonymous feedback.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {links.map((link) => {
                const url = getLinkUrl(link.slug);
                const isCopied = copiedId === link.id;
                return (
                  <div
                    key={link.id}
                    className="bg-white rounded-2xl border border-[var(--color-border)] p-4 md:p-5 hover:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.06)] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Left: Link info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FiLink className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <code className="text-sm font-bold text-[var(--color-foreground)] truncate">
                            /l/{link.slug}
                          </code>
                        </div>
                        {link.submission && (
                          <p className="text-sm text-stone-400 font-medium mt-1.5 line-clamp-1 italic pl-5">
                            &ldquo;{link.submission.message}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Right: Status + actions */}
                      <div className="flex flex-col sm:items-end gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${
                            link.submission
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              link.submission ? "bg-green-500" : "bg-amber-500"
                            }`}
                          />
                          {link.submission
                            ? "Response Received"
                            : "Awaiting Response"}
                        </span>
                        <span className="text-xs text-stone-400 font-medium">
                          {link.submission
                            ? formatFullTime(link.submission.createdAt)
                            : `Created ${formatTime(link.createdAt)}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(url, link.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-[var(--color-foreground)] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-stone-50"
                          >
                            {isCopied ? (
                              <FiCheck className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <FiCopy className="w-3.5 h-3.5" />
                            )}
                            {isCopied ? "Copied" : "Copy"}
                          </button>
                          {link.submission && (
                            <button
                              onClick={() => setSelectedLink(link)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-orange-50"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              View
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </main>

      {/* Response Modal */}
      <Modal isOpen={!!selectedLink} onClose={() => setSelectedLink(null)}>
        {selectedLink?.submission && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiLink className="w-3.5 h-3.5 text-stone-400" />
                <code className="text-sm font-bold text-stone-600">
                  /l/{selectedLink.slug}
                </code>
              </div>
              <span className="text-xs text-stone-400 font-medium">
                {formatFullTime(selectedLink.submission.createdAt)}
              </span>
            </div>
            <div className="h-px bg-stone-100" />
            <p className="text-[var(--color-foreground)] whitespace-pre-wrap text-base font-medium leading-relaxed">
              {selectedLink.submission.message}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
