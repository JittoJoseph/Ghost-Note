"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Container } from "@/components/layout/Container";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { FiLink, FiEye, FiMessageSquare, FiCopy, FiCheck } from "react-icons/fi";

export default function DashboardPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ totalLinks: 0, totalVisits: 0, totalSubmissions: 0 });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const [linkPassword, setLinkPassword] = useState("");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [createError, setCreateError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push("/auth/login");
    }
  }, [isAuthLoading, token, router]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, subsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/submissions`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (subsRes.ok) setSubmissions((await subsRes.json() as { submissions: any[] }).submissions);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchData();
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

      const data = await res.json() as { error?: string; url?: string };
      if (!res.ok) throw new Error(data.error || "Failed to create link");

      const fullUrl = `${window.location.origin}${data.url}`;
      setCreatedLink(fullUrl);
      setLinkPassword("");
      fetchData(); // Refresh stats
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleCopy = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isAuthLoading || !token) return null;

  return (
    <div className="flex-1 flex flex-col pb-20">
      <Navbar />
      <main className="flex-1 flex flex-col py-10">
        <Container className="flex flex-col gap-10">
          
          <header>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage your anonymous links and view submissions.</p>
          </header>

          <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-[32px] p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[var(--color-border)] gap-8">
            <div className="flex items-center gap-5 w-full">
              <div className="bg-indigo-50 p-4 rounded-full text-[var(--color-primary)]">
                <FiLink className="w-6 h-6" />
              </div>
              <div>
                <p className="text-stone-500 text-sm font-bold uppercase tracking-wider">Total Links</p>
                <p className="text-4xl font-extrabold text-[var(--color-foreground)]">{isLoadingStats ? "-" : stats.totalLinks}</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-16 bg-stone-100"></div>
            <div className="flex items-center gap-5 w-full">
              <div className="bg-emerald-50 p-4 rounded-full text-emerald-500">
                <FiEye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-stone-500 text-sm font-bold uppercase tracking-wider">Total Visits</p>
                <p className="text-4xl font-extrabold text-[var(--color-foreground)]">{isLoadingStats ? "-" : stats.totalVisits}</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-16 bg-stone-100"></div>
            <div className="flex items-center gap-5 w-full">
              <div className="bg-orange-50 p-4 rounded-full text-orange-500">
                <FiMessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-stone-500 text-sm font-bold uppercase tracking-wider">Total Submissions</p>
                <p className="text-4xl font-extrabold text-[var(--color-foreground)]">{isLoadingStats ? "-" : stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <Card>
            <h2 className="text-2xl font-extrabold text-[var(--color-foreground)] mb-2">Create New Link</h2>
            <p className="text-stone-500 font-medium mb-8">Generate a secure, single-use link to receive an anonymous message.</p>
            
            <form onSubmit={handleCreateLink} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 w-full">
                <Input
                  label="Link Password"
                  type="text"
                  placeholder="Secret password for visitors..."
                  value={linkPassword}
                  onChange={(e) => setLinkPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" isLoading={isCreatingLink} className="w-full sm:w-auto h-[60px] px-8 text-lg">
                Generate Link
              </Button>
            </form>

            {createError && <div className="mt-6"><Alert type="error" message={createError} /></div>}

            {createdLink && (
              <div className="mt-8 p-6 rounded-[24px] border border-green-200 bg-green-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-green-800 font-bold font-mono text-base bg-white/50 px-4 py-2 rounded-xl">
                  {createdLink}
                </div>
                <Button variant="secondary" onClick={handleCopy} className="shrink-0 bg-white border border-green-200 text-green-800 hover:bg-green-100 hover:border-green-300">
                  {copied ? <FiCheck className="mr-2 text-green-600" /> : <FiCopy className="mr-2" />}
                  {copied ? "Copied" : "Copy Link"}
                </Button>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-2xl font-extrabold text-[var(--color-foreground)] mb-8">Recent Submissions</h2>
            
            {isLoadingStats ? (
              <div className="py-12 text-center text-stone-500 font-bold animate-pulse">Loading submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <FiMessageSquare className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-[var(--color-foreground)] text-xl font-extrabold">No submissions yet</h3>
                <p className="text-stone-500 font-medium mt-2 max-w-sm">Create a link above and share it with someone to start receiving messages.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-6 rounded-[24px] border border-[var(--color-border)] bg-[#FDFCF8] hover:bg-white transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.02)]">
                    <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-4">
                      <span className="text-sm font-bold font-mono bg-white px-3 py-1.5 rounded-full border border-stone-200 text-stone-600 shadow-sm inline-flex items-center gap-2">
                        <FiLink className="text-[var(--color-primary)]" />
                        {sub.link.slug}
                      </span>
                      <span className="text-sm font-bold text-stone-400">
                        {new Date(sub.createdAt).toLocaleString(undefined, { 
                          dateStyle: 'medium', 
                          timeStyle: 'short' 
                        })}
                      </span>
                    </div>
                    <p className="text-[var(--color-foreground)] whitespace-pre-wrap text-base font-medium leading-relaxed px-2">{sub.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </Container>
      </main>
    </div>
  );
}
