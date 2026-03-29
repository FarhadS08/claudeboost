"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, Clock, Settings } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const links = [
  { href: "/dashboard", label: "History", icon: Clock },
  { href: "/dashboard/stats", label: "Stats", icon: BarChart3 },
  { href: "/dashboard/constraints", label: "Constraints", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const isAuthPage = pathname.startsWith("/auth");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span>&#9889;</span>
          <span>ClaudeBoost</span>
        </Link>

        {!isAuthPage && (
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {email && (
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border">
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
