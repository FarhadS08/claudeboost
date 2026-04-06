"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  ScrollText,
  Settings,
  BarChart3,
  Clock,
  Users,
  Activity,
  Zap,
} from "lucide-react";

interface OrgData {
  name: string;
  slug: string;
  role: string;
  has_api_key: boolean;
  has_anthropic_key: boolean;
  member_count: number;
  boost_count: number;
}

const sidebarLinks = [
  { href: "", label: "Overview", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: Clock },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/rules", label: "Rules", icon: ScrollText },
  { href: "/members", label: "Members", icon: Users },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [org, setOrg] = useState<OrgData | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setEmail(user.email ?? null);
    });

    fetch(`/api/org/${slug}`)
      .then((r) => r.json())
      .then(setOrg)
      .catch(() => router.push("/org/new"));
  }, [slug, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/org/new"
              className="text-lg font-bold tracking-tight flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Zap className="w-4 h-4 text-primary" />
              <span>ClaudeBoost</span>
            </Link>
            {org && (
              <>
                <span className="text-zinc-600">/</span>
                <span className="text-sm font-medium text-zinc-400">{org.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium uppercase tracking-wider">
                  {org.role}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {email && (
              <span className="text-xs text-muted-foreground truncate max-w-[160px]">{email}</span>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside className="fixed left-0 top-14 bottom-0 w-56 border-r border-border bg-background/50 backdrop-blur-sm p-4 flex flex-col gap-1">
          {sidebarLinks.map((link) => {
            const href = `/org/${slug}${link.href}`;
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          {/* Setup status */}
          {org && (
            <div className="mt-auto pt-4 border-t border-border">
              <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2 px-3">Setup</div>
              <div className="space-y-1.5 px-3">
                <div className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    org.has_anthropic_key ? "bg-emerald-400" : "bg-red-400"
                  )} />
                  <span className="text-zinc-500">API Key</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    org.has_api_key ? "bg-emerald-400" : "bg-amber-400"
                  )} />
                  <span className="text-zinc-500">MCP Key</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-zinc-500">{org.boost_count} boosts</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="ml-56 flex-1 p-6 sm:p-8 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
}
